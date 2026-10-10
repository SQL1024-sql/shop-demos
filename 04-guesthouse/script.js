const SHOP = '慢郵局';
const STORE_KEY = 'slow-post-v1';
const DOW = ['日', '一', '二', '三', '四', '五', '六'];

const ROOMS = [
  { id: 'postcard', name: '明信片', type: '海景雙人房', max: 2, unit: 'night', weekday: 3200, weekend: 3800, stamp: '雙人', scenes: ['dawn', 'room', 'garden'],
    msg: '二樓轉角那間，床正對著海。早上六點太陽會從窗簾縫鑽進來，記得把鬧鐘關掉。', amen: ['海景陽台', '雙人床 6×7 尺', '獨立衛浴', '手作早餐', '黑膠唱機', 'Wi-Fi'] },
  { id: 'parcel', name: '包裹', type: '家庭四人房', max: 4, unit: 'night', weekday: 4800, weekend: 5600, stamp: '四人', scenes: ['family', 'garden', 'dusk'],
    msg: '一樓靠院子，兩張雙人床。小孩可以直接跑到草地上，狗狗也可以（要先說）。', amen: ['兩張雙人床', '寵物友善', '浴缸', '小冰箱', '兒童備品', '手作早餐'] },
  { id: 'stamp', name: '郵票', type: '閣樓單人房', max: 1, unit: 'night', weekday: 1800, weekend: 2200, stamp: '單人', scenes: ['loft', 'night', 'dawn'],
    msg: '屋頂下的小房間，天窗剛好框住一塊星空。適合一個人來寫東西、放空、什麼都不做。', amen: ['天窗', '單人床', '共用衛浴', '書桌', '手作早餐', 'Wi-Fi'] },
  { id: 'sorting', name: '分信室', type: '共享工作空間', max: 12, unit: 'day', weekday: 2400, weekend: 3000, stamp: '包場', scenes: ['desk', 'garden', 'dusk'],
    msg: '以前分信的長桌留下來了。白天可以包場開會、讀書會、小型工作坊，09:00–18:00。', amen: ['12 人長桌', '投影機', '白板', '無限咖啡', '充足插座', '院子烤肉區'] },
];

// --- illustrated scenes (placeholders for real photos) ---
function scene(kind, uid) {
  const g = (id, stops) => `<linearGradient id="${id}${uid}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const sea = (top, c1, c2) => `${g('sea', [[0, c1], [1, c2]])}`;
  const waves = (y, c) => `<g stroke="${c}" stroke-width="2" fill="none" opacity=".5"><path d="M40 ${y + 20}q20-6 40 0t40 0"/><path d="M300 ${y + 40}q20-6 40 0t40 0t40 0"/><path d="M140 ${y + 70}q20-6 40 0t40 0"/><path d="M420 ${y + 90}q20-6 40 0t40 0"/></g>`;
  const outdoor = (sky, sun, seaC, island) => `<defs>${g('sky', sky)}${sea(0, ...seaC)}</defs>
    <rect width="600" height="500" fill="url(#sky${uid})"/>${sun}
    <path d="M0 250h600v250H0z" fill="url(#sea${uid})"/>
    <path d="M380 252c30-26 70-34 110-30 40 4 70 18 110 30z" fill="${island}"/>${waves(270, '#ffffff')}`;
  const win = (inner) => `<rect x="330" y="70" width="210" height="190" fill="#9dc4d4"/><svg x="330" y="70" width="210" height="190" viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice">${inner}</svg><rect x="330" y="70" width="210" height="190" fill="none" stroke="#f6f1e6" stroke-width="12"/><path d="M435 70v190M330 165h210" stroke="#f6f1e6" stroke-width="7"/>`;
  const dawnSky = [[0, '#f3c6b3'], [.6, '#f7e2c9'], [1, '#cfe1e6']];
  const dawnOut = outdoor(dawnSky, '<circle cx="190" cy="236" r="46" fill="#fbe6a6"/>', ['#8fb8c4', '#3f7489'], '#5c7f86');
  switch (kind) {
    case 'dawn': return dawnOut;
    case 'dusk': return outdoor([[0, '#2b3f6b'], [.55, '#e0805a'], [1, '#f2b77a']], '<circle cx="300" cy="248" r="60" fill="#ffd8a0"/>', ['#d0795a', '#1f3b52'], '#2d3a4d');
    case 'night': return `${outdoor([[0, '#0f1f33'], [1, '#2a4566']], '<circle cx="460" cy="110" r="30" fill="#f4ecd2"/>', ['#2a4566', '#0d1b2a'], '#14263a')}<g fill="#fff">${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 137) % 600}" cy="${(i * 71) % 220}" r="${i % 3 ? 1.2 : 2}" opacity=".8"/>`).join('')}</g>`;
    case 'garden': return `<defs>${g('sky', [[0, '#bcd7e0'], [1, '#e8efe9']])}</defs><rect width="600" height="500" fill="url(#sky${uid})"/>
      <path d="M0 240h600v30H0z" fill="#5d8fa3"/><path d="M0 268h600v232H0z" fill="#8fb07a"/><path d="M0 330c120-20 260 10 600-10v180H0z" fill="#7aa166"/>
      <g fill="#c79b6d"><rect x="80" y="330" width="170" height="14" rx="3"/><rect x="92" y="344" width="10" height="40"/><rect x="228" y="344" width="10" height="40"/></g>
      <g fill="#3f6b3c"><circle cx="470" cy="200" r="60"/><circle cx="520" cy="230" r="44"/><rect x="480" y="230" width="14" height="110" fill="#6b4b33"/></g>
      <path d="M0 450c80-10 160 6 260 0" stroke="#e9e1cf" stroke-width="22" fill="none" stroke-linecap="round"/>`;
    case 'room': return `<rect width="600" height="500" fill="#e8ddd0"/>${win(dawnOut)}
      <rect x="0" y="380" width="600" height="120" fill="#b89a7c"/>
      <rect x="40" y="300" width="300" height="110" rx="10" fill="#f8f5ef"/><rect x="40" y="340" width="300" height="70" rx="8" fill="#5b7f99"/>
      <rect x="56" y="280" width="90" height="40" rx="14" fill="#fff"/><rect x="160" y="280" width="90" height="40" rx="14" fill="#fff"/>
      <rect x="40" y="250" width="12" height="160" fill="#8a6a4c"/>`;
    case 'family': return `<rect width="600" height="500" fill="#dfe6dc"/>${win(outdoor(dawnSky, '', ['#8fb8c4', '#3f7489'], '#5c7f86'))}
      <rect x="0" y="390" width="600" height="110" fill="#c4a582"/>
      <rect x="20" y="300" width="250" height="110" rx="10" fill="#f8f5ef"/><rect x="20" y="340" width="250" height="70" rx="8" fill="#c8432f"/>
      <rect x="300" y="320" width="270" height="100" rx="10" fill="#f8f5ef"/><rect x="300" y="356" width="270" height="64" rx="8" fill="#e2b04a"/>
      <circle cx="560" cy="300" r="26" fill="#3f6b3c"/><rect x="552" y="320" width="16" height="40" fill="#b87b4f"/>`;
    case 'loft': return `<rect width="600" height="500" fill="#efe6d8"/><path d="M0 0l300 140L600 0v500H0z" fill="#e6dccb"/><path d="M0 0l300 140L600 0" stroke="#a57b55" stroke-width="16" fill="none"/>
      <g transform="translate(220 150)"><rect width="160" height="110" fill="#14263a"/><g fill="#fff">${Array.from({ length: 14 }, (_, i) => `<circle cx="${(i * 47) % 160}" cy="${(i * 29) % 110}" r="1.6"/>`).join('')}</g><circle cx="120" cy="30" r="12" fill="#f4ecd2"/><rect width="160" height="110" fill="none" stroke="#f6f1e6" stroke-width="10"/></g>
      <rect x="0" y="400" width="600" height="100" fill="#b89a7c"/><rect x="60" y="330" width="260" height="90" rx="10" fill="#f8f5ef"/><rect x="60" y="360" width="260" height="60" rx="8" fill="#2c4a8f"/>
      <rect x="400" y="320" width="140" height="10" fill="#8a6a4c"/><rect x="410" y="330" width="8" height="80" fill="#8a6a4c"/><rect x="522" y="330" width="8" height="80" fill="#8a6a4c"/><rect x="440" y="290" width="40" height="30" fill="#c8432f"/>`;
    case 'desk': return `<rect width="600" height="500" fill="#e4e9e6"/>${win(outdoor(dawnSky, '', ['#8fb8c4', '#3f7489'], '#5c7f86'))}<rect x="40" y="90" width="230" height="150" fill="#fbfaf6"/><g stroke="#2c4a8f" stroke-width="5" stroke-linecap="round"><path d="M70 130h120"/><path d="M70 160h170"/><path d="M70 190h90"/></g>
      <rect x="0" y="400" width="600" height="100" fill="#a98c6c"/><rect x="30" y="320" width="540" height="22" rx="4" fill="#7b5a3d"/><rect x="60" y="342" width="14" height="80" fill="#5f432c"/><rect x="526" y="342" width="14" height="80" fill="#5f432c"/>
      <g fill="#c8432f"><rect x="110" y="352" width="44" height="60" rx="6"/><rect x="260" y="352" width="44" height="60" rx="6"/><rect x="410" y="352" width="44" height="60" rx="6"/></g>
      <rect x="120" y="296" width="40" height="24" rx="3" fill="#f4f1ea"/><circle cx="380" cy="308" r="12" fill="#f4f1ea"/>`;
  }
  return '';
}
const svgScene = (kind, uid, label) => `<svg viewBox="0 0 600 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${label}">${scene(kind, uid)}</svg>`;

function postmarkSVG(top, bottom) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="50" cy="50" r="31" fill="none" stroke="currentColor" stroke-width="1.5"/>
    <text x="50" y="47" text-anchor="middle" font-size="13" font-weight="900" fill="currentColor">${top}</text><text x="50" y="64" text-anchor="middle" font-size="10" font-weight="700" fill="currentColor">${bottom}</text></svg>`;
}

const $ = (s) => document.querySelector(s);
const money = (n) => 'NT$' + n.toLocaleString('zh-TW');
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const md = (d) => `${d.getMonth() + 1}/${d.getDate()}（${DOW[d.getDay()]}）`;
const today = new Date(); today.setHours(0, 0, 0, 0);

const state = { room: 'postcard', start: null, end: null };
try { Object.assign(state, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };
if (state.start && parse(state.start) < today) { state.start = null; state.end = null; }

// hero
$('#heroScene').innerHTML = svgScene('dusk', 'hero', '');
$('#heroMark').innerHTML = postmarkSVG('長濱', `${today.getFullYear()}.${pad(today.getMonth() + 1)}.${pad(today.getDate())}`);
// footer coastline
$('#coast').innerHTML = `<svg viewBox="0 0 1600 360" preserveAspectRatio="xMidYMax slice"><defs><linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3c6b3"/><stop offset="1" stop-color="#cfe1e6"/></linearGradient></defs>
  <rect width="1600" height="360" fill="url(#cs)"/><circle cx="1180" cy="210" r="70" fill="#fbe6a6"/>
  <path d="M0 200c120-40 240-60 380-30 120 26 200-40 320-50 140-12 220 50 360 40v200H0z" fill="#7d9aa3"/>
  <path d="M0 230h1600v130H0z" fill="#5d8fa3"/>
  <path d="M0 250c200-12 420 10 640 0s420-14 960 4v106H0z" fill="#3f7489"/>
  <g stroke="#fff" stroke-width="3" fill="none" opacity=".55"><path d="M120 280q30-8 60 0t60 0"/><path d="M700 300q30-8 60 0t60 0t60 0"/><path d="M1250 276q30-8 60 0t60 0"/></g>
  <path d="M0 330c260-30 520 20 800 6s560-30 800-8v32H0z" fill="#e9dcc3"/></svg>`;

// rooms
const check = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l5 5L20 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const flipIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3M18 3v4h-4M6 21v-4h4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const arrow = (d) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}" fill="none" stroke="currentColor" stroke-width="2.4"/></svg>`;
const SCENE_LABEL = { dawn: '清晨海景', dusk: '黃昏海面', night: '夜晚星空', garden: '院子', room: '房內與窗景', family: '家庭房內', loft: '閣樓與天窗', desk: '分信室長桌' };

$('#roomList').innerHTML = ROOMS.map((r) => `<article class="room" id="room-${r.id}">
  <div class="pc">
    <div class="pc-face pc-front">
      <div class="slides" tabindex="0" aria-label="${r.name} 照片（示意插畫），可左右滑動">
        ${r.scenes.map((k, i) => `<div class="slide">${svgScene(k, r.id + i, `${r.name}：${SCENE_LABEL[k]}（示意插畫）`)}</div>`).join('')}
      </div>
      <span class="stamp" aria-hidden="true"><span>${r.stamp}</span></span>
      <div class="pc-caption"><div><h3>${r.name}</h3><p>${r.type}・最多 ${r.max} 人</p></div><p>${money(r.weekday)} 起／${r.unit === 'night' ? '晚' : '日'}</p></div>
    </div>
    <div class="pc-face pc-back" aria-hidden="true">
      <div class="back-head"><h3>${r.name}</h3><small>${r.type}・最多 ${r.max} 人</small></div>
      <div class="back-grid">
        <div><p class="back-msg">${r.msg}</p><ul class="amen">${r.amen.map((a) => `<li>${check}${a}</li>`).join('')}</ul></div>
        <div class="back-addr">
          <p class="price-line"><span>平日／${r.unit === 'night' ? '晚' : '日'}</span><strong>${money(r.weekday)}</strong></p>
          <p class="price-line"><span>${r.unit === 'night' ? '週五、六晚' : '週六、日'}</span><strong>${money(r.weekend)}</strong></p>
          ${r.unit === 'night' ? '<p class="price-line"><span>連住 3 晚以上</span><strong>9 折</strong></p>' : '<p class="price-line"><span>平日半天</span><strong>NT$1,400</strong></p>'}
        </div>
      </div>
      <div class="back-foot">
        <button type="button" class="flip-btn" data-flip="${r.id}">${flipIcon}翻回正面</button>
        <button type="button" class="pick-room" data-room="${r.id}">查這間的空房</button>
      </div>
    </div>
  </div>
  <div class="pc-tools">
    <div class="dots" role="group" aria-label="切換照片">${r.scenes.map((_, i) => `<button type="button" data-slide="${i}" aria-label="第 ${i + 1} 張" aria-current="${i === 0}"></button>`).join('')}</div>
    <div class="arrows">
      <button type="button" class="icon-btn" data-step="-1" aria-label="上一張">${arrow('M15 5l-7 7 7 7')}</button>
      <button type="button" class="icon-btn" data-step="1" aria-label="下一張">${arrow('M9 5l7 7-7 7')}</button>
      <button type="button" class="flip-btn" data-flip="${r.id}">${flipIcon}看背面</button>
    </div>
  </div>
</article>`).join('');

document.querySelectorAll('.room').forEach((room) => {
  const track = room.querySelector('.slides');
  const dots = room.querySelectorAll('.dots button');
  const go = (i) => track.scrollTo({ left: i * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  const idx = () => Math.round(track.scrollLeft / track.clientWidth);
  track.addEventListener('scroll', () => dots.forEach((d, i) => d.setAttribute('aria-current', i === idx())), { passive: true });
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  room.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => go((idx() + +b.dataset.step + dots.length) % dots.length)));
  room.querySelectorAll('[data-flip]').forEach((b) => b.addEventListener('click', () => {
    // 2D turn: squash to zero width, swap faces, open back up (cheaper than a 3D flip on phones)
    const swap = () => {
      const flipped = room.classList.toggle('flipped');
      room.querySelector('.pc-back').setAttribute('aria-hidden', !flipped);
      room.querySelector('.pc-front').setAttribute('aria-hidden', flipped);
      room.querySelectorAll('.pc-tools [data-flip]').forEach((x) => { x.lastChild.textContent = flipped ? '翻回正面' : '看背面'; });
      room.classList.remove('turning');
      (flipped ? room.querySelector('.pick-room') : room.querySelector('.pc-tools .flip-btn')).focus({ preventScroll: true });
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return swap();
    room.classList.add('turning');
    setTimeout(swap, 220);
  }));
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('.pick-room');
  if (!b) return;
  setRoom(b.dataset.room);
  $('#calendar').scrollIntoView();
});

// availability (fake, deterministic per room+date)
function isFull(roomId, d) {
  let h = 7;
  for (const c of roomId + ymd(d)) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
  return (h >>> 0) % 100 < (d.getDay() === 5 || d.getDay() === 6 ? 55 : 22);
}
const room = () => ROOMS.find((r) => r.id === state.room);
const isWeekend = (d, unit) => (unit === 'night' ? d.getDay() === 5 || d.getDay() === 6 : d.getDay() === 0 || d.getDay() === 6);

// units covered by a selection: nights [start,end) or days [start,end]
function units(r, s, e) {
  const out = [];
  const last = r.unit === 'night' ? addDays(e, -1) : e;
  for (let d = new Date(s); d <= last; d = addDays(d, 1)) out.push(new Date(d));
  return out;
}

const maxMonth = new Date(today.getFullYear(), today.getMonth() + 3, 1);
let viewMonth = new Date(today.getFullYear(), today.getMonth(), 1);
if (state.start) viewMonth = new Date(parse(state.start).getFullYear(), parse(state.start).getMonth(), 1);

function tip(text, warn) {
  const t = $('#calTip');
  t.textContent = text;
  t.classList.toggle('warn', !!warn);
}

function renderCalendar() {
  const r = room();
  const y = viewMonth.getFullYear();
  const m = viewMonth.getMonth();
  $('#monthLabel').textContent = `${y} 年 ${m + 1} 月`;
  $('#prevMonth').disabled = viewMonth <= new Date(today.getFullYear(), today.getMonth(), 1);
  $('#nextMonth').disabled = new Date(y, m + 1, 1) >= maxMonth;
  const first = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();
  const s = state.start && parse(state.start);
  const e = state.end && parse(state.end);
  let html = '<span></span>'.repeat(first);
  for (let i = 1; i <= days; i++) {
    const d = new Date(y, m, i);
    const past = d < today;
    const full = !past && isFull(r.id, d);
    // checkout day may be a full night for rooms
    const canCheckout = r.unit === 'night' && s && !e && d > s && units(r, s, d).every((x) => !isFull(r.id, x));
    const disabled = past || (full && !canCheckout);
    const key = ymd(d);
    const isStart = key === state.start;
    const isEnd = key === state.end || (r.unit === 'day' && isStart && key === state.end);
    const inRange = s && e && d > s && d < e;
    const cls = ['cday', full && !canCheckout ? 'full' : '', isStart ? 'start' : '', isEnd ? 'end' : '', inRange ? 'in-range' : ''].join(' ');
    const sub = isStart ? (r.unit === 'night' ? '入住' : '開始') : isEnd ? (r.unit === 'night' ? '退房' : '結束') : full && !canCheckout ? '已滿' : '';
    html += `<button type="button" class="${cls}" data-date="${key}" ${disabled ? 'disabled' : ''} aria-label="${m + 1}月${i}日 週${DOW[d.getDay()]}${past ? ' 已過' : full ? ' 已滿' : ' 可預約'}${sub ? ' ' + sub : ''}" aria-pressed="${isStart || isEnd}">${i}${sub ? `<small>${sub}</small>` : ''}${isStart || isEnd ? `<span class="stampmark">${postmarkSVG('', '')}</span>` : ''}</button>`;
  }
  $('#calGrid').innerHTML = html;
}

$('#calGrid').addEventListener('click', (ev) => {
  const b = ev.target.closest('.cday');
  if (!b || b.disabled) return;
  const r = room();
  const d = parse(b.dataset.date);
  const s = state.start && parse(state.start);
  if (!s || state.end || d < s || (r.unit === 'night' && +d === +s)) {
    state.start = b.dataset.date; state.end = null;
    tip(r.unit === 'night' ? `入住 ${md(d)}，再點退房日。` : `從 ${md(d)} 開始，再點最後一天（只租一天就再點一次同一天）。`);
  } else {
    if (units(r, s, d).some((x) => isFull(r.id, x))) {
      tip('中間有已滿的日期，請改選較短的範圍或換房型。', true);
      return;
    }
    state.end = b.dataset.date;
    tip('日期已蓋好。可以到下方寫信詢問。');
  }
  save(); renderCalendar(); renderQuote();
  $(`.cday[data-date="${b.dataset.date}"]`)?.focus();
});
$('#prevMonth').addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1); renderCalendar(); });
$('#nextMonth').addEventListener('click', () => { viewMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1); renderCalendar(); });

function quote() {
  const r = room();
  if (!state.start || !state.end) return null;
  const list = units(r, parse(state.start), parse(state.end));
  const wk = list.filter((d) => isWeekend(d, r.unit)).length;
  const sub = wk * r.weekend + (list.length - wk) * r.weekday;
  const disc = r.unit === 'night' && list.length >= 3 ? Math.round(sub * 0.1) : 0;
  return { r, n: list.length, wk, sub, disc, total: sub - disc };
}

function renderQuote() {
  const q = quote();
  const r = room();
  const unitWord = r.unit === 'night' ? '晚' : '天';
  $('#quote').innerHTML = q ? `<h3>${r.name}・${md(parse(state.start))} → ${md(parse(state.end))}</h3>
    <dl>
      ${q.n - q.wk ? `<dt>平日 ${q.n - q.wk} ${unitWord} × ${money(r.weekday)}</dt><dd>${money((q.n - q.wk) * r.weekday)}</dd>` : ''}
      ${q.wk ? `<dt>假日 ${q.wk} ${unitWord} × ${money(r.weekend)}</dt><dd>${money(q.wk * r.weekend)}</dd>` : ''}
      ${q.disc ? `<dt>連住 3 晚 9 折</dt><dd>−${money(q.disc)}</dd>` : ''}
      <dt class="q-total">共 ${q.n} ${unitWord}</dt><dd class="q-total">${money(q.total)}</dd>
    </dl>` : `<h3>${r.name}・${r.type}</h3><p class="q-empty">在月曆點選日期，價格會自動算好。平日 ${money(r.weekday)}、假日 ${money(r.weekend)}／${unitWord}。</p>`;
  const pick = $('#aPick');
  pick.textContent = q ? `${r.name}（${r.type}）${md(parse(state.start))} → ${md(parse(state.end))}，共 ${q.n} ${unitWord}，試算 ${money(q.total)}` : '還沒蓋日期，請到上方月曆選';
  pick.classList.toggle('has', !!q);
  $('#dockInfo').innerHTML = q ? `${r.name}・${md(parse(state.start))} 起 ${q.n} ${unitWord}<strong>${money(q.total)}</strong>` : '';
  $('#dockInfo').hidden = !q;
  $('#dockLabel').textContent = q ? '寫信' : '查空房';
  $('#dockBtn').href = q ? '#ask' : '#calendar';
  $('#aGuests').innerHTML = Array.from({ length: r.max }, (_, i) => `<option>${i + 1} 人</option>`).join('');
}

function setRoom(id) {
  if (state.room !== id) { state.room = id; state.start = null; state.end = null; tip('先點入住日，再點退房日。'); }
  $('#roomSelect').value = id;
  save(); renderCalendar(); renderQuote();
}
$('#roomSelect').innerHTML = ROOMS.map((r) => `<option value="${r.id}">${r.name}・${r.type}</option>`).join('');
$('#roomSelect').value = state.room;
$('#roomSelect').addEventListener('change', (e) => setRoom(e.target.value));

// inquiry
$('#askForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#aName');
  const phone = $('#aPhone');
  const phoneOk = /^09\d{8}$/.test(phone.value.replace(/[\s-]/g, ''));
  name.setAttribute('aria-invalid', !name.value.trim());
  phone.setAttribute('aria-invalid', !phoneOk);
  const q = quote();
  let err = '';
  let focus = null;
  if (!q) { err = '請先在月曆選好日期。'; focus = $('#calendar'); }
  else if (!name.value.trim()) { err = '請留下名字。'; focus = name; }
  else if (!phoneOk) { err = '手機請填 09 開頭共 10 碼。'; focus = phone; }
  $('#error').textContent = err;
  if (err) { focus.scrollIntoView({ block: 'center' }); if (focus.matches('input')) focus.focus(); return; }
  const unitWord = q.r.unit === 'night' ? '晚' : '天';
  const lines = [
    `【${SHOP} 詢問】`,
    `房型：${q.r.name}（${q.r.type}）`,
    `日期：${md(parse(state.start))} → ${md(parse(state.end))}，共 ${q.n} ${unitWord}`,
    `人數：${$('#aGuests').value}`,
    `試算：${money(q.total)}${q.disc ? '（含連住 9 折）' : ''}`,
    `姓名：${name.value.trim()}`,
    `手機：${phone.value.trim()}`,
  ];
  if ($('#aMsg').value.trim()) lines.push(`留言：${$('#aMsg').value.trim()}`);
  lines.push('', '想確認這幾天還有沒有空房，謝謝！');
  const text = lines.join('\n');
  $('#resultText').textContent = text;
  $('#lineBtn').href = 'https://line.me/R/msg/text/?' + encodeURIComponent(text);
  $('#copied').textContent = '';
  const r = $('#result');
  r.hidden = false;
  r.scrollIntoView({ block: 'center' });
  r.focus({ preventScroll: true });
});
$('#copyBtn').addEventListener('click', async () => {
  const text = $('#resultText').textContent;
  try { await navigator.clipboard.writeText(text); } catch (e) {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  $('#copied').textContent = '已複製，可以貼到 LINE。';
});

renderCalendar();
renderQuote();

// horizontal room track
const track = $('#roomList');
const stepTrack = (dir) => {
  const card = track.querySelector('.room');
  track.scrollBy({ left: dir * (card.offsetWidth + 24), behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};
$('#trackPrev').addEventListener('click', () => stepTrack(-1));
$('#trackNext').addEventListener('click', () => stepTrack(1));
// postcard backs are hidden until flipped; fetch their WenKai subsets up front
try { document.fonts.load('1em "LXGW WenKai TC"', ROOMS.map((r) => r.msg).join('')); } catch (e) { /* font API unavailable */ }
