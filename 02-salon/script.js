const SHOP = '鏡室 Mirror Room';
const STORE_KEY = 'mirror-room-booking-v1';
const DOW = ['日', '一', '二', '三', '四', '五', '六'];
// [open, close] hours per weekday; null = closed
const HOURS = [[10, 18], [10, 20], [10, 20], null, [10, 20], [10, 20], [10, 20]];

const SERVICES = {
  剪髮: [
    { name: '設計剪髮', price: 800, mins: 60, desc: '諮詢臉型與生活習慣後修剪，含洗髮與吹整。' },
    { name: '瀏海修剪', price: 200, mins: 15, desc: '已在本店剪過的客人，一個月內免費。' },
    { name: '男士剪髮', price: 600, mins: 45, desc: '含洗髮、修鬢角與造型品示範。' },
  ],
  染髮: [
    { name: '單色染', price: 1800, mins: 120, desc: '日系低刺激染劑，含護色洗。' },
    { name: '霧感漂染', price: 3600, mins: 210, desc: '一次漂淺再上霧色，適合想要奶茶、灰紫色系。' },
    { name: '挑染 / 耳下染', price: 2400, mins: 150, desc: '局部挑亮，好整理也好留長。' },
    { name: '白髮補染', price: 1200, mins: 90, desc: '只補新生髮根，減少重複染傷。' },
  ],
  燙髮: [
    { name: '溫塑燙', price: 3200, mins: 180, desc: '自然捲度，吹整十分鐘就有形。' },
    { name: '縮毛矯正', price: 3800, mins: 210, desc: '針對自然捲與毛躁，維持約四到六個月。' },
    { name: '瀏海燙', price: 900, mins: 50, desc: '讓瀏海自然內彎，不需每天捲。' },
  ],
  護理: [
    { name: '結構式護髮', price: 1500, mins: 60, desc: '三劑式修護，適合漂染後乾燥髮。' },
    { name: '頭皮淨化 SPA', price: 1200, mins: 50, desc: '去角質與按摩，含頸肩舒緩十分鐘。' },
    { name: '洗髮造型', price: 500, mins: 40, desc: '約會、面試前的吹整或簡單編髮。' },
  ],
};

const DESIGNERS = [
  { id: 'any', name: '不指定' },
  { id: 'yixun', name: '以薰', title: '主理人', quote: '剪短不可怕，可怕的是剪完不會整理。', bio: '在台北連鎖沙龍待了九年，後來想要一次只照顧一位客人，於是開了鏡室。擅長看骨架剪出好整理的短髮。', tags: ['層次短髮', '霧感染色', '頭型修飾'], hair: 1, color: '#3d2a33' },
  { id: 'kui', name: '小葵', title: '設計師', quote: '自然捲不是缺點，是還沒找到對的長度。', bio: '自然捲本人，最懂毛躁的煩惱。專門處理捲度、燙髮與漂後護理，說話很慢，很適合第一次燙髮的人。', tags: ['溫塑燙', '縮毛矯正', '結構式護髮'], hair: 3, color: '#7a5641' },
];

const WORKS = [
  { title: '耳下層次鮑伯', by: '以薰', hair: 1, color: '#3b2a2f', bg: ['#dcd4e4', '#bfb3cd'] },
  { title: '奶茶霧感長髮', by: '以薰', hair: 0, color: '#a07c64', bg: ['#e6dcd4', '#cdbcb0'] },
  { title: '韓系大波浪', by: '小葵', hair: 5, color: '#5b3b30', bg: ['#e3d5dd', '#c5aebc'] },
  { title: '精靈短髮', by: '以薰', hair: 2, color: '#2d2226', bg: ['#d4d9e2', '#b2bacb'] },
  { title: '灰紫挑染', by: '以薰', hair: 0, color: '#3a3040', bg: ['#ddd6e8', '#bdb0d0'], streak: true },
  { title: '自然捲修飾', by: '小葵', hair: 3, color: '#3e2c24', bg: ['#e2dbd0', '#c7baa6'] },
  { title: '法式瀏海鮑伯', by: '小葵', hair: 4, color: '#6b4a3a', bg: ['#e5d9de', '#cbb4bf'] },
  { title: '低調霧棕', by: '以薰', hair: 6, color: '#5a4038', bg: ['#dad4dc', '#b8adb9'] },
];

// 0 long straight, 1 bob, 2 pixie, 3 curly/perm, 4 bob + blunt bangs, 5 big waves, 6 long side part
const HAIR = [
  'M92 196c-8-80 34-118 70-112 44 6 72 46 60 116-4 28 4 62 22 92-30 10-52-4-58-30 10-34 6-70-12-96-16 24-44 34-66 34 2 26-2 56-20 80-18-26-6-58 4-84z',
  'M84 250C76 150 100 96 150 96s74 54 66 154l-28 4c6-54 2-94-18-114-20 20-50 28-66 28 4 32 6 62 8 86z',
  'M96 200c-8-80 20-108 60-108s62 38 50 104h-10c0-36-16-56-34-64-16 18-42 24-58 24 0 16 0 32 2 44z',
  'M88 210c-18-80 22-122 64-120 52 2 80 50 64 120 14 30-6 60 16 90-26 20-42 0-46-20 10-40 10-90-10-130-16 22-46 30-68 32 4 38-4 78 10 118-22 14-40-10-28-30-16-20 8-34-2-60z',
  'M84 250C76 150 100 96 150 96s74 54 66 154l-28 4c4-40 2-70-6-90H104c-6 20-8 52-4 86z',
  'M80 220c-30-90 20-140 72-136 56 4 92 54 70 136 22 20 6 50 24 74 12 20-8 50-30 44 10 20-20 40-40 22-4-30 14-50 2-80 12-40 6-80-24-108-20 22-50 30-70 30 6 36-6 70 4 100-8 26-36 30-46 10-20 0-24-24-12-40-20-14-10-40 4-52z',
  'M96 300c-20-60-24-120-8-170 16-40 50-50 74-46 40 6 66 50 60 110-2 40 2 72 14 104l-30 6c6-50 4-100-14-150-24 16-50 20-76 18 6-12 10-26 10-40-12 50-14 100-6 168z',
];
const STREAK = '<path d="M168 92c22 10 40 40 44 80 4 50-6 100 6 130" stroke="#b8a3d6" stroke-width="10" fill="none" opacity=".85"/>';

function portrait(hair, color, bg, uid, streak) {
  return `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <defs><linearGradient id="g${uid}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs>
    <rect width="300" height="400" fill="url(#g${uid})"/>
    <path d="M70 400c4-60 34-92 80-92s76 32 80 92z" fill="#f2ece8"/>
    <path d="M132 250h36v50h-36z" fill="#e5c9b8"/>
    <ellipse cx="150" cy="190" rx="54" ry="68" fill="#efd6c6"/>
    <path d="${HAIR[hair]}" fill="${color}"/>${streak ? STREAK : ''}
  </svg>`;
}

const $ = (s) => document.querySelector(s);
const money = (n) => 'NT$' + n.toLocaleString('zh-TW');
const pad = (n) => String(n).padStart(2, '0');
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const state = { service: '設計剪髮', designer: 'yixun', date: null, time: null };
try { Object.assign(state, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };

// fake booked slots: deterministic per date + designer
function isBooked(dateKey, hour, designerId) {
  if (designerId === 'any') return DESIGNERS.slice(1).every((d) => isBooked(dateKey, hour, d.id));
  let h = 0;
  for (const c of dateKey + designerId + hour) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); h ^= h >>> 16;
  return (h >>> 0) % 100 < 45;
}

function slotsFor(d, designerId) {
  const hrs = HOURS[d.getDay()];
  if (!hrs) return [];
  const now = new Date();
  const out = [];
  for (let h = hrs[0]; h <= hrs[1] - 2; h++) {
    const past = ymd(d) === ymd(now) && h <= now.getHours();
    out.push({ hour: h, booked: isBooked(ymd(d), h, designerId), past });
  }
  return out;
}

const duration = (m) => (m < 60 ? `${m} 分鐘` : `${Math.floor(m / 60)} 小時${m % 60 ? '半' : ''}`);

// price tabs
const cats = Object.keys(SERVICES);
let activeCat = cats[0];
function renderTabs() {
  $('#tabs').innerHTML = cats.map((c) => `<button class="tab" role="tab" id="tab-${c}" aria-selected="${c === activeCat}" aria-controls="pricePanel" tabindex="${c === activeCat ? 0 : -1}">${c}</button>`).join('');
  $('#pricePanel').setAttribute('aria-labelledby', `tab-${activeCat}`);
  $('#pricePanel').innerHTML = SERVICES[activeCat].map((s) => `<div class="price-row">
      <h3>${s.name}</h3><span class="leader" aria-hidden="true"></span><span class="price">${money(s.price)}</span>
      <p>${s.desc}<span class="dur">約 ${duration(s.mins)}</span></p>
      <button type="button" class="pick" data-service="${s.name}" aria-label="預約${s.name}">預約</button>
    </div>`).join('');
}
$('#tabs').addEventListener('click', (e) => {
  const t = e.target.closest('.tab');
  if (!t) return;
  activeCat = t.textContent;
  renderTabs();
  $(`#tab-${activeCat}`).focus();
});
$('#tabs').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  const i = cats.indexOf(activeCat) + (e.key === 'ArrowRight' ? 1 : -1);
  activeCat = cats[(i + cats.length) % cats.length];
  renderTabs();
  $(`#tab-${activeCat}`).focus();
});
$('#pricePanel').addEventListener('click', (e) => {
  const b = e.target.closest('.pick');
  if (!b) return;
  state.service = b.dataset.service;
  $('#fService').value = state.service;
  save(); renderSummary();
  $('#booking').scrollIntoView();
});

// gallery + lightbox
$('#gallery').innerHTML = WORKS.map((w, i) => `<li><button type="button" data-i="${i}" aria-label="放大檢視：${w.title}（${w.by}）">
  <span class="frame">${portrait(w.hair, w.color, w.bg, 'w' + i, w.streak)}</span>
  <span class="cap"><b>${w.title}</b><small>${w.by}</small></span></button></li>`).join('');

const lb = $('#lightbox');
let lbIndex = 0;
function showWork(i, dir = 0) {
  lbIndex = (i + WORKS.length) % WORKS.length;
  const w = WORKS[lbIndex];
  const art = $('#lbArt');
  const paint = () => {
    art.innerHTML = portrait(w.hair, w.color, w.bg, 'lb', w.streak);
    art.setAttribute('role', 'img');
    art.setAttribute('aria-label', `${w.title} 示意插畫`);
    $('#lbCaption').innerHTML = `${w.title}<small>設計師 ${w.by}</small>`;
    $('#lbCount').textContent = `${lbIndex + 1} / ${WORKS.length}`;
  };
  paint();
  if (dir && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    art.animate([{ opacity: 0, transform: `translateX(${dir * 28}px)` }, { opacity: 1, transform: 'none' }], { duration: 380, easing: 'cubic-bezier(.16, 1, .3, 1)' });
  }
}
$('#gallery').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-i]');
  if (!b) return;
  showWork(+b.dataset.i);
  lb.showModal();
});
$('#lbPrev').addEventListener('click', () => showWork(lbIndex - 1, -1));
$('#lbNext').addEventListener('click', () => showWork(lbIndex + 1, 1));
$('#lbClose').addEventListener('click', () => lb.close());
lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
lb.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') showWork(lbIndex - 1, -1);
  if (e.key === 'ArrowRight') showWork(lbIndex + 1, 1);
});
let touchX = null;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) showWork(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  touchX = null;
});

// team
$('#teamGrid').innerHTML = DESIGNERS.slice(1).map((d, i) => `<article class="interview">
  <div class="mirror"><div class="mirror-glass" role="img" aria-label="${d.name} 示意插畫">${portrait(d.hair, d.color, ['#e7e1ec', '#c9bfd4'], 't' + i)}</div></div>
  <blockquote>「${d.quote}」</blockquote>
  <div class="iv-body"><h3>${d.name}<small>${d.title}</small></h3><p>${d.bio}</p><p class="tags">擅長：${d.tags.join('、')}</p></div>
</article>`).join('');

// booking form
$('#fService').innerHTML = cats.map((c) => `<optgroup label="${c}">${SERVICES[c].map((s) => `<option value="${s.name}">${s.name}　${money(s.price)}</option>`).join('')}</optgroup>`).join('');
$('#fService').value = state.service;
$('#fService').addEventListener('change', (e) => { state.service = e.target.value; save(); renderSummary(); });

function renderDesigners() {
  $('#fDesigner').innerHTML = DESIGNERS.map((d) => `<button type="button" class="chip" data-id="${d.id}" aria-pressed="${state.designer === d.id}">${d.name}</button>`).join('');
}
$('#fDesigner').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  state.designer = b.dataset.id;
  state.time = null;
  save(); renderDesigners(); renderSlots(true); renderSummary();
});

const today = new Date(); today.setHours(0, 0, 0, 0);
const dates = Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
if (!state.date || !dates.some((d) => ymd(d) === state.date && HOURS[d.getDay()])) {
  state.date = ymd(dates.find((d) => HOURS[d.getDay()] && slotsFor(d, 'any').some((s) => !s.booked && !s.past)) || dates.find((d) => HOURS[d.getDay()]));
  state.time = null;
}

function renderDates() {
  $('#fDates').innerHTML = dates.map((d, i) => {
    const closed = !HOURS[d.getDay()];
    const label = i === 0 ? '今天' : i === 1 ? '明天' : `週${DOW[d.getDay()]}`;
    return `<button type="button" class="date" data-date="${ymd(d)}" ${closed ? 'disabled' : ''} aria-pressed="${state.date === ymd(d)}" aria-label="${d.getMonth() + 1}月${d.getDate()}日 週${DOW[d.getDay()]}${closed ? ' 公休' : ''}">
      <span>${closed ? '公休' : label}</span><b>${d.getDate()}</b><span>${d.getMonth() + 1}月</span></button>`;
  }).join('');
}
$('#fDates').addEventListener('click', (e) => {
  const b = e.target.closest('.date');
  if (!b || b.disabled) return;
  state.date = b.dataset.date;
  state.time = null;
  save(); renderDates(); renderSlots(true); renderSummary();
});

function currentDate() { return dates.find((d) => ymd(d) === state.date); }

function renderSlots(sweep) {
  const list = slotsFor(currentDate(), state.designer);
  const free = list.filter((s) => !s.booked && !s.past).length;
  $('#slotHint').textContent = `剩 ${free} 個空檔`;
  $('#fSlots').innerHTML = free === 0 && list.every((s) => s.past)
    ? '<p class="slots-empty">今天的時段都已經過了，請選其他日期。</p>'
    : list.map((s) => {
      const off = s.booked || s.past;
      return `<button type="button" class="slot" data-h="${s.hour}" ${off ? 'disabled' : ''} aria-pressed="${state.time === s.hour}" aria-label="${s.hour}:00 ${s.booked ? '已被預約' : s.past ? '已過' : '可預約'}">${s.hour}:00${off ? `<small>${s.booked ? '已約' : '已過'}</small>` : ''}</button>`;
    }).join('');
  if (sweep) { const el = $('#fSlots'); el.classList.remove('sweep'); void el.offsetWidth; el.classList.add('sweep'); }
}
$('#fSlots').addEventListener('click', (e) => {
  const b = e.target.closest('.slot');
  if (!b || b.disabled) return;
  state.time = +b.dataset.h;
  save(); renderSlots(false); renderSummary();
});

function serviceInfo() {
  return Object.values(SERVICES).flat().find((s) => s.name === state.service);
}
function designerName() { return DESIGNERS.find((d) => d.id === state.designer).name; }

function renderSummary() {
  const s = serviceInfo();
  const d = currentDate();
  const when = state.time !== null ? `${d.getMonth() + 1}/${d.getDate()}（${DOW[d.getDay()]}）${state.time}:00` : '尚未選時段';
  $('#bookSummary').innerHTML = `<strong>${s.name}</strong>・${money(s.price)} 起<br>設計師：${designerName()}<br>時間：<strong>${when}</strong>`;
  $('#dockInfo').textContent = state.time !== null ? `預約 ${when}` : '預約空檔';
}

// hero today count
(function () {
  const t = dates[0];
  const n = HOURS[t.getDay()] ? slotsFor(t, 'any').filter((s) => !s.booked && !s.past).length : 0;
  $('#todayLine').innerHTML = HOURS[t.getDay()] ? `今天還有 <strong>${n}</strong> 個空檔` : '今天公休，明天見';
})();

// hours table
$('#hoursBody').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((i) => `<tr class="${i === new Date().getDay() ? 'is-today' : ''}"><th scope="row">週${DOW[i]}</th><td>${HOURS[i] ? `${HOURS[i][0]}:00 – ${HOURS[i][1]}:00` : '公休'}</td></tr>`).join('');

// submit
$('#bookForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#fName');
  const phone = $('#fPhone');
  const phoneOk = /^09\d{8}$/.test(phone.value.replace(/[\s-]/g, ''));
  name.setAttribute('aria-invalid', !name.value.trim());
  phone.setAttribute('aria-invalid', !phoneOk);
  let err = '';
  let focus = null;
  if (state.time === null) { err = '請選一個時段。'; focus = $('#fSlots'); }
  else if (!name.value.trim()) { err = '請填寫姓名。'; focus = name; }
  else if (!phoneOk) { err = '手機請填 09 開頭共 10 碼。'; focus = phone; }
  $('#error').textContent = err;
  if (err) { focus.scrollIntoView({ block: 'center' }); if (focus.matches('input')) focus.focus(); return; }

  const s = serviceInfo();
  const d = currentDate();
  const lines = [
    `【${SHOP} 預約】`,
    `服務：${s.name}（${money(s.price)} 起）`,
    `設計師：${designerName()}`,
    `時間：${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${DOW[d.getDay()]}）${state.time}:00`,
    `姓名：${name.value.trim()}`,
    `手機：${phone.value.trim()}`,
  ];
  const note = $('#fNote').value.trim();
  if (note) lines.push(`備註：${note}`);
  lines.push('', '麻煩幫我確認時段，謝謝！');
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

// full-screen menu
const menu = $('#menu');
const menuBtn = $('#menuBtn');
function setMenu(open) {
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.textContent = open ? '關閉' : '選單';
  document.body.classList.toggle('menu-open', open);
  if (open) menu.querySelector('a').focus();
}
menuBtn.addEventListener('click', () => setMenu(menu.hidden));
menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });

renderTabs();
renderDesigners();
renderDates();
renderSlots(false);
renderSummary();
