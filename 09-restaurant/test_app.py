import os
import tempfile
from datetime import date, timedelta

os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(), "test.db")

from fastapi.testclient import TestClient  # noqa: E402

import app as m  # noqa: E402


def test_booking_flow():
    with TestClient(m.app) as c:
        conn = m.connect()
        conn.execute("DELETE FROM bookings")
        conn.close()
        today = date.fromisoformat(c.get("/api/info").json()["today"])
        day = next(d for d in (today + timedelta(days=i) for i in range(3, 10)) if d.weekday() != 0).isoformat()
        guest = {"name": "測試", "phone": "0912-345-678", "party": 8, "date": day, "time": "19:00"}

        first = c.post("/api/bookings", json=guest)
        assert first.status_code == 201, first.text
        code = first.json()["code"]

        # only one 8-seat table: an overlapping slot is full, a later one is free
        assert c.post("/api/bookings", json=guest | {"time": "19:30"}).status_code == 409
        slots = {s["time"]: s["state"] for s in c.get(f"/api/availability?date={day}&party=8").json()["slots"]}
        assert slots["19:30"] == "full" and slots["12:00"] == "open"
        assert c.post("/api/waitlist", json=guest | {"time": "19:30"}).json()["position"] == 1

        # smallest fitting table wins
        pair = c.post("/api/bookings", json=guest | {"party": 2}).json()
        conn = m.connect()
        assert conn.execute("SELECT t.seats FROM bookings b JOIN tables t ON t.id = b.table_id WHERE code = ?",
                            (pair["code"],)).fetchone()[0] == 2
        conn.close()

        assert c.post("/api/bookings/lookup", json={"code": code, "phone": "0900000000"}).status_code == 404
        moved = c.patch(f"/api/bookings/{code}", json={"phone": "0912345678", "party": 6, "date": day, "time": "12:30"})
        assert moved.json()["party"] == 6
        assert c.post(f"/api/bookings/{code}/cancel", json={"code": code, "phone": "0912345678"}).json()["status"] == "cancelled"
        assert c.post("/api/bookings", json=guest | {"time": "19:30"}).status_code == 201

        assert c.post("/api/bookings", json=guest | {"date": "2000-01-01"}).status_code == 400
        assert c.post("/api/bookings", json=guest | {"phone": "123"}).status_code == 422

        assert c.get("/api/admin/bookings", params={"date": day}).status_code == 401
        assert c.post("/api/admin/login", json={"password": "nope"}).status_code == 401
        assert c.post("/api/admin/login", json={"password": m.ADMIN_PASSWORD}).status_code == 200
        rows = c.get("/api/admin/bookings", params={"date": day}).json()
        assert len([r for r in rows if r["status"] == "confirmed"]) == 2

        bid = rows[0]["id"]
        assert c.patch(f"/api/admin/bookings/{bid}", json={"status": "seated"}).json()["status"] == "seated"
        bad = c.get("/api/admin/settings").json() | {"slot_minutes": 7}
        assert c.put("/api/admin/settings", json=bad).status_code == 422
        assert "訂位代碼" in c.get("/api/admin/export.csv", params={"date": day}).text
        assert c.post("/api/admin/reset").status_code == 200


if __name__ == "__main__":
    test_booking_flow()
    print("ok")
