import csv
import hashlib
import hmac
import io
import json
import os
import random
import re
import secrets
import sqlite3
from contextlib import asynccontextmanager, contextmanager
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated, Literal

from fastapi import APIRouter, Cookie, Depends, FastAPI, HTTPException, Query, Response
from fastapi.staticfiles import StaticFiles
from pydantic import AfterValidator, BaseModel, Field, StringConstraints, model_validator

BASE = Path(__file__).parent
DB_PATH = os.environ.get("DB_PATH", str(BASE / "restaurant.db"))
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "demo1234")
SECRET = os.environ.get("SECRET_KEY") or secrets.token_hex(32)
COOKIE_SECURE = os.environ.get("COOKIE_SECURE") == "1"
TZ = timezone(timedelta(hours=8))  # Asia/Taipei has no DST

Area = Literal["窗邊", "大廳", "吧台", "包廂"]
Occasion = Literal["生日", "紀念日", "約會", "商務", "家庭聚餐"]
Status = Literal["confirmed", "seated", "completed", "no_show", "cancelled"]
STATUS_LABEL = {"confirmed": "已確認", "seated": "已入座", "completed": "已完成", "no_show": "未到", "cancelled": "已取消"}
SOURCE_LABEL = {"web": "網路", "phone": "電話", "walk_in": "現場"}
ACTIVE = ("confirmed", "seated")
CODE_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"
HM = r"^([01]\d|2[0-3]):[0-5]\d$"

_regular = {"lunch": ["11:30", "13:30"], "dinner": ["17:30", "20:30"]}
_weekend = {"lunch": ["11:30", "13:30"], "dinner": ["17:30", "21:00"]}
DEFAULT_SETTINGS = {
    # weekday (0 = Monday) -> service -> [first seating, last seating]
    "schedule": {"0": {"lunch": None, "dinner": None}, "1": _regular, "2": _regular, "3": _regular,
                 "4": _weekend, "5": _weekend, "6": _regular},
    "closed_dates": [],
    "slot_minutes": 30,
    "dining_minutes": 120,
    "booking_days": 30,
    "max_party": 8,
    "cutoff_minutes": 60,
}

SCHEMA = """
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS tables (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    seats INTEGER NOT NULL CHECK (seats > 0),
    area TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    party INTEGER NOT NULL CHECK (party > 0),
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    table_id INTEGER REFERENCES tables(id),
    area_pref TEXT,
    occasion TEXT,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'confirmed',
    source TEXT NOT NULL DEFAULT 'web',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS bookings_date ON bookings(date);
CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    party INTEGER NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'waiting',
    booking_id INTEGER REFERENCES bookings(id),
    created_at TEXT NOT NULL
);
"""


# --- db -----------------------------------------------------------------

def connect():
    c = sqlite3.connect(DB_PATH, isolation_level=None, check_same_thread=False)
    c.row_factory = sqlite3.Row
    c.execute("PRAGMA foreign_keys = ON")
    c.execute("PRAGMA busy_timeout = 5000")
    return c


def db():
    c = connect()
    try:
        yield c
    finally:
        c.close()


@contextmanager
def tx(c):
    # IMMEDIATE takes the write lock up front, so check-then-insert can't double book
    c.execute("BEGIN IMMEDIATE")
    try:
        yield
    except BaseException:
        c.execute("ROLLBACK")
        raise
    c.execute("COMMIT")


def get_settings(c):
    return DEFAULT_SETTINGS | {r["key"]: json.loads(r["value"]) for r in c.execute("SELECT key, value FROM settings")}


# --- booking rules ------------------------------------------------------

def now():
    return datetime.now(TZ)


def to_min(t):
    h, m = t.split(":")
    return int(h) * 60 + int(m)


def to_hm(m):
    return f"{m // 60:02d}:{m % 60:02d}"


def parse_date(v):
    try:
        return date.fromisoformat(v)
    except (TypeError, ValueError):
        raise HTTPException(400, "日期格式錯誤")


def day_slots(s, d):
    if d.isoformat() in s["closed_dates"]:
        return []
    return [(period, to_hm(m))
            for period, win in s["schedule"][str(d.weekday())].items() if win
            for m in range(to_min(win[0]), to_min(win[1]) + 1, s["slot_minutes"])]


def too_soon(s, d, t):
    return datetime.fromisoformat(f"{d}T{t}:00+08:00") < now() + timedelta(minutes=s["cutoff_minutes"])


def pick_table(c, d, t, party, duration, area=None, exclude=None, table_id=None):
    """Smallest free table that fits; preferred area first. With table_id, only checks that table."""
    start, end = to_min(t), to_min(t) + duration
    busy = {r["table_id"] for r in c.execute(
        "SELECT table_id, time, duration FROM bookings WHERE date = ? AND status IN ('confirmed', 'seated') "
        "AND table_id IS NOT NULL AND id IS NOT ?", (d, exclude))
        if to_min(r["time"]) < end and to_min(r["time"]) + r["duration"] > start}
    free = [r for r in c.execute("SELECT id, area FROM tables WHERE active = 1 AND seats >= ? ORDER BY seats, id", (party,))
            if r["id"] not in busy]
    if table_id is not None:
        return table_id if any(r["id"] == table_id for r in free) else None
    pref = [r for r in free if r["area"] == area]
    return (pref or free)[0]["id"] if free else None


def check_slot(s, day, t, party, admin=False):
    """Validates the request against opening rules; returns the normalized ISO date."""
    d = parse_date(day)
    if admin:
        if not re.match(HM, t):
            raise HTTPException(400, "時間格式錯誤")
        return d.isoformat()
    if party > s["max_party"]:
        raise HTTPException(400, f"{s['max_party'] + 1} 位以上請來電訂位")
    today = now().date()
    if not today <= d <= today + timedelta(days=s["booking_days"]):
        raise HTTPException(400, f"線上只開放 {s['booking_days']} 天內的訂位")
    if t not in [x for _, x in day_slots(s, d)]:
        raise HTTPException(400, "這個時段沒有開放訂位")
    if too_soon(s, d, t):
        raise HTTPException(400, "這個時段已截止線上訂位，請直接來電")
    return d.isoformat()


def insert_booking(c, **f):
    while True:
        code = "".join(secrets.choice(CODE_CHARS) for _ in range(6))
        if not c.execute("SELECT 1 FROM bookings WHERE code = ?", (code,)).fetchone():
            break
    f = {"email": "", "area_pref": None, "occasion": None, "notes": "", "status": "confirmed", "source": "web",
         "created_at": now().isoformat(timespec="seconds")} | f | {"code": code}
    c.execute(f"INSERT INTO bookings ({', '.join(f)}) VALUES ({', '.join(':' + k for k in f)})", f)
    return code


def create_booking(c, b, admin=False):
    s = get_settings(c)
    data = b.model_dump()
    data["date"] = check_slot(s, b.date, b.time, b.party, admin)
    forced = data.pop("table_id", None)
    with tx(c):
        tid = pick_table(c, data["date"], b.time, b.party, s["dining_minutes"], b.area_pref, table_id=forced)
        if tid is None:
            raise HTTPException(409, "這張桌子在該時段已被占用或坐不下" if forced else "這個時段剛好客滿了，換個時間或加入候補")
        code = insert_booking(c, **data, table_id=tid, duration=s["dining_minutes"])
    return c.execute("SELECT * FROM bookings WHERE code = ?", (code,)).fetchone()


def public(b):
    return {k: b[k] for k in ("code", "name", "party", "date", "time", "duration", "area_pref", "occasion", "notes", "status")}


# --- input models -------------------------------------------------------

def norm_phone(v):
    v = re.sub(r"[\s-]", "", v)
    if not re.fullmatch(r"0\d{8,9}", v):
        raise ValueError("電話格式錯誤")
    return v


Phone = Annotated[str, AfterValidator(norm_phone)]
Name = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=40)]
Email = Annotated[str, StringConstraints(strip_whitespace=True, max_length=100, pattern=r"^$|^[^@\s]+@[^@\s]+\.[^@\s]+$")]
Notes = Annotated[str, StringConstraints(strip_whitespace=True, max_length=300)]
Party = Annotated[int, Field(ge=1, le=20)]


class BookingIn(BaseModel):
    name: Name
    phone: Phone
    email: Email = ""
    party: Party
    date: str
    time: str
    area_pref: Area | None = None
    occasion: Occasion | None = None
    notes: Notes = ""


class AdminBookingIn(BookingIn):
    source: Literal["web", "phone", "walk_in"] = "phone"
    table_id: int | None = None


class Lookup(BaseModel):
    code: str = Field(max_length=10)
    phone: Phone


class BookingChange(BaseModel):
    phone: Phone
    party: Party
    date: str
    time: str
    notes: Notes = ""


class WaitIn(BaseModel):
    name: Name
    phone: Phone
    party: Party
    date: str
    time: str
    notes: Notes = ""


class AdminPatch(BaseModel):
    name: Name | None = None
    phone: Phone | None = None
    email: Email | None = None
    party: Party | None = None
    date: str | None = None
    time: str | None = None
    table_id: int | None = None
    area_pref: Area | None = None
    occasion: Occasion | None = None
    notes: Notes | None = None
    status: Status | None = None


Window = list[Annotated[str, StringConstraints(pattern=HM)]] | None


class SettingsIn(BaseModel):
    schedule: dict[Literal["0", "1", "2", "3", "4", "5", "6"], dict[Literal["lunch", "dinner"], Window]]
    closed_dates: list[date]
    slot_minutes: Literal[15, 30, 60]
    dining_minutes: int = Field(ge=30, le=300)
    booking_days: int = Field(ge=1, le=180)
    max_party: int = Field(ge=1, le=30)
    cutoff_minutes: int = Field(ge=0, le=1440)

    @model_validator(mode="after")
    def check_windows(self):
        if len(self.schedule) != 7:
            raise ValueError("需要七天的營業時間")
        for services in self.schedule.values():
            for win in services.values():
                if win is not None and (len(win) != 2 or win[0] > win[1]):
                    raise ValueError("開始入座時間需早於最後入座時間")
        return self


class TableIn(BaseModel):
    id: int | None = None
    name: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=10)]
    seats: int = Field(ge=1, le=20)
    area: Area
    active: bool = True


class LoginIn(BaseModel):
    password: str


# --- demo data ----------------------------------------------------------

TABLES = [("W1", 2, "窗邊"), ("W2", 2, "窗邊"), ("W3", 2, "窗邊"), ("W4", 2, "窗邊"), ("B1", 2, "吧台"), ("B2", 2, "吧台"),
          ("H1", 4, "大廳"), ("H2", 4, "大廳"), ("H3", 4, "大廳"), ("H4", 4, "大廳"), ("H5", 4, "大廳"),
          ("R1", 6, "包廂"), ("R2", 8, "包廂")]
SURNAMES = "陳林黃張李王吳劉蔡楊許鄭謝郭洪曾周賴"
NOTES = ["", "", "", "", "不吃牛", "一位小朋友，需要兒童椅", "對甲殼類過敏", "蛋奶素", "希望安靜一點的位子", "可能晚到 10 分鐘"]
PEAK = {"12:00", "12:30", "18:00", "18:30", "19:00"}


def seed(c):
    rng = random.Random(1024)
    s = DEFAULT_SETTINGS
    c.executemany("INSERT INTO tables (name, seats, area) VALUES (?, ?, ?)", TABLES)
    c.executemany("INSERT INTO settings VALUES (?, ?)", [(k, json.dumps(v)) for k, v in s.items()])
    t_now = now()
    today = t_now.date()
    fake_phone = lambda: f"09{rng.randrange(10 ** 8):08d}"
    for offset in range(-20, 15):
        d = today + timedelta(days=offset)
        slots = [t for _, t in day_slots(s, d)]
        if not slots:
            continue
        for _ in range(rng.randint(14, 26) if offset <= 1 else rng.randint(3, max(4, 22 - offset))):
            t = rng.choices(slots, [4 if x in PEAK else 1 for x in slots])[0]
            party = rng.choices([1, 2, 3, 4, 5, 6, 8], [2, 12, 4, 7, 2, 2, 1])[0]
            tid = pick_table(c, d.isoformat(), t, party, s["dining_minutes"])
            if tid is None:
                continue
            start = datetime.fromisoformat(f"{d}T{t}:00+08:00")
            if start + timedelta(minutes=s["dining_minutes"]) < t_now:
                status = rng.choices(["completed", "no_show", "cancelled"], [88, 5, 7])[0]
            elif start < t_now:
                status = "seated"
            else:
                status = rng.choices(["confirmed", "cancelled"], [94, 6])[0]
            source = rng.choices(["web", "phone", "walk_in"], [6, 3, 1])[0]
            created = start if source == "walk_in" else start - timedelta(days=rng.randint(0, 10), hours=rng.randint(2, 20))
            insert_booking(c, name=rng.choice(SURNAMES) + rng.choice(["先生", "小姐"]), phone=fake_phone(), party=party,
                           date=d.isoformat(), time=t, duration=s["dining_minutes"], table_id=tid,
                           occasion=rng.choice([None] * 7 + ["生日", "紀念日", "約會", "商務", "家庭聚餐"]),
                           notes=rng.choice(NOTES), status=status, source=source,
                           created_at=created.isoformat(timespec="seconds"))
    saturday = today + timedelta(days=(5 - today.weekday()) % 7 or 7)
    for t, party in [("18:30", 2), ("18:30", 4), ("19:00", 2)]:
        c.execute("INSERT INTO waitlist (name, phone, party, date, time, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                  (rng.choice(SURNAMES) + rng.choice(["先生", "小姐"]), fake_phone(), party, saturday.isoformat(), t,
                   t_now.isoformat(timespec="seconds")))


def init_db():
    c = connect()
    c.executescript(SCHEMA)
    if not c.execute("SELECT 1 FROM tables").fetchone():
        with tx(c):
            seed(c)
    c.close()


@asynccontextmanager
async def lifespan(_):
    init_db()
    yield


app = FastAPI(title="炊煙 訂位系統", lifespan=lifespan)


# --- public api ---------------------------------------------------------

@app.get("/api/info")
def info(c=Depends(db)):
    s = get_settings(c)
    return {"today": now().date().isoformat(),
            "demo_password": ADMIN_PASSWORD if ADMIN_PASSWORD == "demo1234" else None,
            **{k: s[k] for k in ("schedule", "closed_dates", "booking_days", "max_party", "dining_minutes")}}


@app.get("/api/availability")
def availability(day: str = Query(alias="date"), party: int = Query(ge=1, le=20), exclude: str = "", c=Depends(db)):
    s = get_settings(c)
    own = c.execute("SELECT id FROM bookings WHERE code = ?", (exclude.upper(),)).fetchone()  # the booking being edited
    d = parse_date(day)
    today = now().date()
    if party > s["max_party"] or not today <= d <= today + timedelta(days=s["booking_days"]):
        return {"slots": []}
    return {"slots": [{"time": t, "period": p,
                       "state": "closed" if too_soon(s, d, t)
                       else "open" if pick_table(c, d.isoformat(), t, party, s["dining_minutes"], exclude=own and own["id"]) else "full"}
                      for p, t in day_slots(s, d)]}


@app.post("/api/bookings", status_code=201)
def book(body: BookingIn, c=Depends(db)):
    return public(create_booking(c, body))


def find_booking(c, code, phone):
    b = c.execute("SELECT * FROM bookings WHERE code = ? AND phone = ?", (code.strip().upper(), phone)).fetchone()
    if not b:
        raise HTTPException(404, "查無訂位，請確認代碼與電話")
    return b


@app.post("/api/bookings/lookup")
def lookup(body: Lookup, c=Depends(db)):
    return public(find_booking(c, body.code, body.phone))


@app.patch("/api/bookings/{code}")
def change_booking(code: str, body: BookingChange, c=Depends(db)):
    b = find_booking(c, code, body.phone)
    s = get_settings(c)
    if b["status"] != "confirmed" or too_soon(s, b["date"], b["time"]):
        raise HTTPException(400, "這筆訂位已無法線上修改，請直接來電")
    d = check_slot(s, body.date, body.time, body.party)
    with tx(c):
        tid = pick_table(c, d, body.time, body.party, b["duration"], b["area_pref"], exclude=b["id"])
        if tid is None:
            raise HTTPException(409, "這個時段剛好客滿了，換個時間試試")
        c.execute("UPDATE bookings SET date = ?, time = ?, party = ?, notes = ?, table_id = ? WHERE id = ?",
                  (d, body.time, body.party, body.notes, tid, b["id"]))
    return public(find_booking(c, code, body.phone))


@app.post("/api/bookings/{code}/cancel")
def cancel_booking(code: str, body: Lookup, c=Depends(db)):
    b = find_booking(c, code, body.phone)
    if b["status"] != "confirmed":
        raise HTTPException(400, "這筆訂位無法取消")
    c.execute("UPDATE bookings SET status = 'cancelled' WHERE id = ?", (b["id"],))
    return public(find_booking(c, code, body.phone))


@app.post("/api/waitlist", status_code=201)
def join_waitlist(body: WaitIn, c=Depends(db)):
    d = check_slot(get_settings(c), body.date, body.time, body.party)
    with tx(c):
        c.execute("INSERT INTO waitlist (name, phone, party, date, time, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  (body.name, body.phone, body.party, d, body.time, body.notes, now().isoformat(timespec="seconds")))
        position = c.execute("SELECT COUNT(*) FROM waitlist WHERE date = ? AND time = ? AND status = 'waiting'",
                             (d, body.time)).fetchone()[0]
    return {"date": d, "time": body.time, "party": body.party, "position": position}


# --- admin auth ---------------------------------------------------------

def session_token(exp):
    return f"{exp}.{hmac.new(SECRET.encode(), f'admin:{exp}'.encode(), hashlib.sha256).hexdigest()}"


def require_admin(session: str | None = Cookie(None)):
    try:
        exp = int(session.split(".")[0])
        ok = exp > now().timestamp() and hmac.compare_digest(session, session_token(exp))
    except (AttributeError, ValueError):
        ok = False
    if not ok:
        raise HTTPException(401, "請先登入")


@app.post("/api/admin/login")
def login(body: LoginIn, response: Response):
    if not hmac.compare_digest(body.password.encode(), ADMIN_PASSWORD.encode()):
        raise HTTPException(401, "密碼錯誤")
    ttl = 12 * 3600
    response.set_cookie("session", session_token(int(now().timestamp()) + ttl), max_age=ttl,
                        httponly=True, samesite="lax", secure=COOKIE_SECURE)
    return {"ok": True}


@app.post("/api/admin/logout")
def logout(response: Response):
    response.delete_cookie("session")
    return {"ok": True}


admin = APIRouter(prefix="/api/admin", dependencies=[Depends(require_admin)])


@admin.get("/me")
def me():
    return {"ok": True}


def get_admin_booking(c, bid):
    b = c.execute("SELECT b.*, t.name AS table_name, t.area AS table_area FROM bookings b "
                  "LEFT JOIN tables t ON t.id = b.table_id WHERE b.id = ?", (bid,)).fetchone()
    if not b:
        raise HTTPException(404, "找不到這筆訂位")
    return dict(b)


@admin.get("/bookings")
def admin_bookings(day: str | None = Query(None, alias="date"), q: str | None = None, c=Depends(db)):
    sql = "SELECT b.*, t.name AS table_name, t.area AS table_area FROM bookings b LEFT JOIN tables t ON t.id = b.table_id "
    if q and q.strip():
        like = f"%{q.strip()}%"
        rows = c.execute(sql + "WHERE b.name LIKE ? OR b.phone LIKE ? OR b.code LIKE ? "
                         "ORDER BY b.date DESC, b.time LIMIT 100", (like, like, like))
    else:
        rows = c.execute(sql + "WHERE b.date = ? ORDER BY b.time, b.id", (parse_date(day).isoformat(),))
    return [dict(r) for r in rows]


@admin.post("/bookings", status_code=201)
def admin_create(body: AdminBookingIn, c=Depends(db)):
    return get_admin_booking(c, create_booking(c, body, admin=True)["id"])


@admin.patch("/bookings/{bid}")
def admin_update(bid: int, body: AdminPatch, c=Depends(db)):
    b = get_admin_booking(c, bid)
    f = body.model_dump(exclude_unset=True)
    if "date" in f:
        f["date"] = parse_date(f["date"]).isoformat()
    if "time" in f and not re.match(HM, f["time"] or ""):
        raise HTTPException(400, "時間格式錯誤")
    new = b | f
    moved = any(k in f for k in ("date", "time", "party", "table_id")) or b["status"] not in ACTIVE
    with tx(c):
        if new["status"] in ACTIVE and moved:
            args = (c, new["date"], new["time"], new["party"], new["duration"])
            tid = pick_table(*args, exclude=bid, table_id=new["table_id"]) if new["table_id"] else None
            if tid is None and f.get("table_id"):
                raise HTTPException(409, "這張桌子在該時段已被占用或坐不下")
            tid = tid or pick_table(*args, new["area_pref"], exclude=bid)
            if tid is None:
                raise HTTPException(409, "該時段已沒有坐得下的空桌")
            f["table_id"] = tid
        if f:
            c.execute(f"UPDATE bookings SET {', '.join(k + ' = ?' for k in f)} WHERE id = ?", (*f.values(), bid))
    return get_admin_booking(c, bid)


@admin.get("/waitlist")
def admin_waitlist(day: str = Query(alias="date"), c=Depends(db)):
    return [dict(r) for r in c.execute("SELECT * FROM waitlist WHERE date = ? AND status = 'waiting' ORDER BY time, id",
                                       (parse_date(day).isoformat(),))]


def get_waiting(c, wid):
    w = c.execute("SELECT * FROM waitlist WHERE id = ? AND status = 'waiting'", (wid,)).fetchone()
    if not w:
        raise HTTPException(404, "找不到這筆候補")
    return w


@admin.post("/waitlist/{wid}/convert")
def convert_waitlist(wid: int, c=Depends(db)):
    w = get_waiting(c, wid)
    b = create_booking(c, AdminBookingIn(name=w["name"], phone=w["phone"], party=w["party"], date=w["date"],
                                         time=w["time"], notes=w["notes"], source="web"), admin=True)
    c.execute("UPDATE waitlist SET status = 'booked', booking_id = ? WHERE id = ?", (b["id"], wid))
    return get_admin_booking(c, b["id"])


@admin.delete("/waitlist/{wid}")
def remove_waitlist(wid: int, c=Depends(db)):
    get_waiting(c, wid)
    c.execute("UPDATE waitlist SET status = 'removed' WHERE id = ?", (wid,))
    return {"ok": True}


@admin.get("/stats")
def stats(c=Depends(db)):
    today = now().date()
    days = [(today + timedelta(days=i)).isoformat() for i in range(-13, 8)]
    daily = {r["date"]: r for r in c.execute(
        "SELECT date, COUNT(*) AS bookings, SUM(party) AS covers FROM bookings "
        "WHERE status != 'cancelled' AND date BETWEEN ? AND ? GROUP BY date", (days[0], days[-1]))}
    month = ((today - timedelta(days=29)).isoformat(), today.isoformat())
    status = {r[0]: r[1] for r in c.execute(
        "SELECT status, COUNT(*) FROM bookings WHERE date BETWEEN ? AND ? GROUP BY status", month)}
    source = {r[0]: r[1] for r in c.execute(
        "SELECT source, COUNT(*) FROM bookings WHERE status != 'cancelled' AND date BETWEEN ? AND ? GROUP BY source", month)}
    avg_party = c.execute("SELECT AVG(party) FROM bookings WHERE status != 'cancelled' AND date BETWEEN ? AND ?",
                          month).fetchone()[0]
    finished = status.get("completed", 0) + status.get("no_show", 0)
    return {"today": today.isoformat(),
            "days": [{"date": d, "bookings": daily[d]["bookings"] if d in daily else 0,
                      "covers": daily[d]["covers"] if d in daily else 0} for d in days],
            "status": status, "source": source, "avg_party": round(avg_party or 0, 1),
            "no_show_rate": status.get("no_show", 0) / finished if finished else 0}


@admin.get("/settings")
def read_settings(c=Depends(db)):
    return get_settings(c)


@admin.put("/settings")
def write_settings(body: SettingsIn, c=Depends(db)):
    with tx(c):
        c.executemany("INSERT OR REPLACE INTO settings VALUES (?, ?)",
                      [(k, json.dumps(v)) for k, v in body.model_dump(mode="json").items()])
    return get_settings(c)


@admin.get("/tables")
def list_tables(c=Depends(db)):
    return [dict(r) | {"active": bool(r["active"])} for r in c.execute("SELECT * FROM tables ORDER BY id")]


@admin.put("/tables")
def write_tables(body: list[TableIn], c=Depends(db)):
    try:
        with tx(c):
            for t in body:
                if t.id:
                    c.execute("UPDATE tables SET name = ?, seats = ?, area = ?, active = ? WHERE id = ?",
                              (t.name, t.seats, t.area, t.active, t.id))
                else:
                    c.execute("INSERT INTO tables (name, seats, area, active) VALUES (?, ?, ?, ?)",
                              (t.name, t.seats, t.area, t.active))
    except sqlite3.IntegrityError:
        raise HTTPException(400, "桌號不能重複")
    return list_tables(c)


def csv_safe(v):
    v = "" if v is None else str(v)
    return "'" + v if v[:1] in ("=", "+", "-", "@") else v


@admin.get("/export.csv")
def export_csv(day: str = Query(alias="date"), c=Depends(db)):
    d = parse_date(day).isoformat()
    buf = io.StringIO()
    w = csv.writer(buf)
    w.writerow(["時間", "姓名", "人數", "電話", "Email", "桌號", "狀態", "場合", "備註", "來源", "訂位代碼"])
    for r in admin_bookings(day=d, q=None, c=c):
        w.writerow([csv_safe(v) for v in (r["time"], r["name"], r["party"], r["phone"], r["email"], r["table_name"],
                                          STATUS_LABEL[r["status"]], r["occasion"], r["notes"],
                                          SOURCE_LABEL.get(r["source"]), r["code"])])
    return Response("﻿" + buf.getvalue(), media_type="text/csv; charset=utf-8",
                    headers={"Content-Disposition": f'attachment; filename="bookings-{d}.csv"'})


@admin.post("/reset")
def reset_demo(c=Depends(db)):
    with tx(c):
        for t in ("waitlist", "bookings", "tables", "settings"):
            c.execute(f"DELETE FROM {t}")
        seed(c)
    return {"ok": True}


app.include_router(admin)
app.mount("/", StaticFiles(directory=BASE / "static", html=True), name="static")
