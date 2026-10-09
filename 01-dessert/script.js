const SHOP = '暦菓子室';
const STORE_ADDR = '台北市大安區暦町巷 12 號（虛構）';
const MEET_MIN = 600;
const STORE_KEY = 'koyomi-order-v1';
const DOW = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
const MONTH = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const PRODUCTS = [
  { id: 'lemon', name: '檸檬蛋糕', price: 95, unit: '單顆', bg: '#f7e7a1', desc: '屏東檸檬皮刨進麵糊，表面淋一層薄薄的糖霜，酸得很乾淨。',
    svg: '<svg viewBox="0 0 120 90"><ellipse cx="60" cy="72" rx="44" ry="8" fill="#e2c46a"/><path d="M20 66c0-22 18-38 40-38s40 16 40 38z" fill="#f2c94c"/><path d="M22 58c6-16 20-26 38-26s32 10 38 26c-6 4-10-2-16 2s-10-4-16 0-10-3-16 1-10-4-16 0-8-3-12-3z" fill="#fffbea"/><path d="M70 22c6-8 16-8 20-2-6 6-14 6-20 2z" fill="#8fb34a"/></svg>' },
  { id: 'madeleine', name: '瑪德蕾 6 入', price: 240, unit: '一盒', bg: '#f4d3cf', desc: '發酵奶油與蜂蜜，外殼烤出貝殼紋，裡面濕潤得像剛出爐。',
    svg: '<svg viewBox="0 0 120 90"><path d="M18 60c0-24 18-40 42-40s42 16 42 40c0 8-8 12-42 12S18 68 18 60z" fill="#d89a4a"/><g stroke="#b5762d" stroke-width="3" fill="none" stroke-linecap="round"><path d="M60 26v40"/><path d="M44 30l8 36"/><path d="M76 30l-8 36"/><path d="M30 40l16 26"/><path d="M90 40L74 66"/></g></svg>' },
  { id: 'basque', name: '巴斯克起司蛋糕', price: 680, unit: '6 吋', bg: '#efe3d3', desc: '高溫烤出焦糖色外皮，切開是半流心。冷藏一晚更濃。',
    svg: '<svg viewBox="0 0 120 90"><path d="M16 46l58-24 30 22v24L46 80 16 68z" fill="#f5dc9a"/><path d="M16 46l58-24 30 22-58 22z" fill="#4a2a17"/><path d="M46 66v14" stroke="#e8c46e" stroke-width="2"/><path d="M16 46c8 6 20 10 30 20" stroke="#6b3d1f" stroke-width="4" fill="none"/></svg>' },
  { id: 'cinnamon', name: '肉桂捲', price: 110, unit: '單顆', bg: '#e9d6c3', desc: '斯里蘭卡肉桂與黑糖，頂上一匙奶油乳酪霜。建議微波 10 秒。',
    svg: '<svg viewBox="0 0 120 90"><circle cx="60" cy="48" r="34" fill="#c8874a"/><path d="M60 48m-4 0a4 4 0 1 1 8 0a10 10 0 1 1-18 0a16 16 0 1 1 30 0a22 22 0 1 1-42 0a28 28 0 1 1 52 2" stroke="#7a4a24" stroke-width="4" fill="none"/><path d="M38 36c8-6 16 2 24-4s16 2 22 6c-4 6-12 2-18 6s-14-2-20 2-10-4-8-10z" fill="#fffaf2"/></svg>' },
  { id: 'montblanc', name: '和栗蒙布朗', price: 160, unit: '單顆', bg: '#e6d2bf', desc: '十月限定。日本和栗泥擠成細絲，裡面藏一顆整粒糖漬栗子。',
    svg: '<svg viewBox="0 0 120 90"><rect x="30" y="66" width="60" height="12" rx="3" fill="#f3e6cc"/><path d="M32 66c0-30 12-46 28-46s28 16 28 46z" fill="#b98652"/><g stroke="#8c5e32" stroke-width="2.5" fill="none"><path d="M38 64c4-20 10-34 22-38"/><path d="M48 66c2-18 6-30 12-38"/><path d="M60 66V28"/><path d="M72 66c-2-18-6-30-12-38"/><path d="M82 64c-4-20-10-34-22-38"/></g><path d="M52 18c4-8 12-8 16 0 0 6-16 6-16 0z" fill="#6b3a1c"/></svg>' },
  { id: 'financier', name: '焙茶費南雪', price: 75, unit: '單顆', bg: '#d9c9b4', desc: '焦化奶油加上台灣焙茶粉，金磚形狀，邊角最酥。',
    svg: '<svg viewBox="0 0 120 90"><path d="M24 40h72l-8 30H32z" fill="#a8703d"/><path d="M24 40h72l-6-8H30z" fill="#c9915a"/><g fill="#7d4f26"><circle cx="44" cy="54" r="2"/><circle cx="60" cy="58" r="2"/><circle cx="74" cy="52" r="2"/></g></svg>' },
  { id: 'canele', name: '可麗露', price: 85, unit: '單顆', bg: '#f4d3cf', desc: '銅模與蜂蠟慢烤一小時，外殼脆、內裡是香草卡士達口感。',
    svg: '<svg viewBox="0 0 120 90"><path d="M38 24h44l6 52H32z" fill="#4e2414"/><g stroke="#2e140a" stroke-width="3"><path d="M46 24l-4 52"/><path d="M56 24l-2 52"/><path d="M64 24l2 52"/><path d="M74 24l4 52"/></g><ellipse cx="60" cy="24" rx="22" ry="5" fill="#7a3a1f"/></svg>' },
  { id: 'matcha', name: '抹茶生乳卷', price: 420, unit: '整條', bg: '#dfe6cf', desc: '宇治抹茶蛋糕體捲入北海道鮮奶油，整條約 18 公分。',
    svg: '<svg viewBox="0 0 120 90"><rect x="14" y="30" width="56" height="44" rx="22" fill="#7f9a4f"/><circle cx="76" cy="52" r="24" fill="#8fae5a"/><path d="M76 52m-3 0a3 3 0 1 1 6 0a9 9 0 1 1-16 0a14 14 0 1 1 26 0" stroke="#fbfaf7" stroke-width="5" fill="none"/><circle cx="76" cy="52" r="5" fill="#fbfaf7"/></svg>' },
];

const state = { cart: {}, date: null, method: 'store', meetSpot: '', meetTime: '' };
try { Object.assign(state, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };

const $ = (s) => document.querySelector(s);
const money = (n) => 'NT$' + n.toLocaleString('zh-TW');
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fromYmd = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const short = (d) => `${d.getMonth() + 1}/${d.getDate()}（${DOW[d.getDay()].slice(1)}）`;

// dates
const today = new Date(); today.setHours(0, 0, 0, 0);
const isClosed = (d) => d.getDay() === 0 || d.getDay() === 1;
const daysFromToday = (d) => Math.round((d - today) / 86400000);
const isPickable = (d) => daysFromToday(d) >= 3 && daysFromToday(d) <= 27 && !isClosed(d);
if (state.date && !isPickable(fromYmd(state.date))) state.date = null;

const earliest = Array.from({ length: 14 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; }).find(isPickable);
$('#heroYM').textContent = `${earliest.getFullYear()} · ${MONTH[earliest.getMonth()]}`;
$('#heroNum').textContent = earliest.getDate();
$('#heroDow').textContent = DOW[earliest.getDay()];

// month grid: 4 weeks starting this Sunday
function renderMonth() {
  const start = new Date(today); start.setDate(start.getDate() - start.getDay());
  let html = DOW.map((w, i) => `<span class="dow-h${i < 2 ? ' red' : ''}">${w.slice(1)}</span>`).join('');
  for (let i = 0; i < 28; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const diff = daysFromToday(d);
    if (diff < 0) { html += `<span class="cell blank" aria-hidden="true"><span class="n">${d.getDate()}</span></span>`; continue; }
    const closed = isClosed(d);
    const ok = isPickable(d);
    const status = closed ? '休' : diff < 3 ? '準備中' : '';
    const key = ymd(d);
    html += `<button type="button" class="cell${closed ? ' red' : ''}" data-date="${key}" ${ok ? '' : 'disabled'} aria-pressed="${state.date === key}" aria-label="${d.getMonth() + 1}月${d.getDate()}日 ${DOW[d.getDay()]} ${closed ? '公休' : diff < 3 ? '來不及準備' : '可預約'}">
      <span class="n">${d.getDate()}</span><span class="s">${diff === 0 ? '今天' : status}</span>
      <svg class="ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><ellipse pathLength="100" cx="50" cy="52" rx="44" ry="40" transform="rotate(-6 50 52)"/></svg></button>`;
  }
  $('#month').innerHTML = html;
}
$('#month').addEventListener('click', (e) => {
  const b = e.target.closest('.cell');
  if (!b || b.disabled || !b.dataset.date) return;
  state.date = b.dataset.date;
  document.querySelectorAll('.cell[data-date]').forEach((c) => c.setAttribute('aria-pressed', c === b));
  save(); renderSlip(true);
});

// products
function qtyControl(id, qty, name) {
  return `<div class="qty" data-id="${id}">
    <button type="button" data-act="dec" aria-label="${name} 減少一份">−</button>
    <output aria-label="${name} 數量">${qty}</output>
    <button type="button" data-act="inc" aria-label="${name} 增加一份">＋</button></div>`;
}
function renderProducts() {
  $('#products').innerHTML = PRODUCTS.map((p) => {
    const q = state.cart[p.id] || 0;
    return `<li class="item">
      <div class="plate" style="background:${p.bg}" role="img" aria-label="${p.name} 插畫">${p.svg}</div>
      <h3>${p.name}<span class="price">${money(p.price)}</span><span class="unit">${p.unit}</span></h3>
      <p>${p.desc}</p>
      <div>${q ? qtyControl(p.id, q, p.name) : `<button type="button" class="hanko" data-id="${p.id}" aria-label="把 ${p.name} 加進預購單">加</button>`}</div>
    </li>`;
  }).join('');
}
const total = () => PRODUCTS.reduce((s, p) => s + (state.cart[p.id] || 0) * p.price, 0);
const count = () => Object.values(state.cart).reduce((s, n) => s + n, 0);

// order slip drawer
const slip = $('#slip');
const handle = $('#slipHandle');
function renderSlip(pulse) {
  const items = PRODUCTS.filter((p) => state.cart[p.id]);
  $('#cart').innerHTML = items.map((p) => `<li><span class="c-name">${p.name}</span><span class="c-price">${money(p.price * state.cart[p.id])}</span>${qtyControl(p.id, state.cart[p.id], p.name)}</li>`).join('');
  $('#cartEmpty').hidden = items.length > 0;
  const n = count();
  const d = state.date && fromYmd(state.date);
  $('#slipTotal').textContent = money(total());
  $('#slipMeta').textContent = n ? `${n} 件${d ? `・${short(d)} 取` : '・還沒圈取貨日'}` : '還沒挑菓子';
  $('#slipDay').textContent = d ? `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${DOW[d.getDay()]}` : '還沒圈，到月曆上點一天';
  $('#slipDay').classList.toggle('set', !!d);
  $('#tabCount').textContent = n;
  $('#tabCount').hidden = !n;
  if (pulse) { slip.classList.remove('bump'); void slip.offsetWidth; slip.classList.add('bump'); }
}
function setOpen(open) {
  slip.classList.toggle('open', open);
  handle.setAttribute('aria-expanded', open);
}
$('#tabSlip').addEventListener('click', (e) => { e.preventDefault(); setOpen(true); handle.focus(); });
// tap toggles; drag up opens, drag down closes
let drag = null;
handle.addEventListener('pointerdown', (e) => {
  drag = { y: e.clientY, moved: false, open: slip.classList.contains('open') };
  handle.setPointerCapture(e.pointerId);
});
handle.addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dy = e.clientY - drag.y;
  if (Math.abs(dy) < 6 && !drag.moved) return;
  drag.moved = true;
  slip.classList.add('dragging');
  const closedOffset = slip.offsetHeight - 72;
  const base = drag.open ? 0 : closedOffset;
  slip.style.transform = `translateY(${Math.min(closedOffset, Math.max(0, base + dy))}px)`;
});
handle.addEventListener('pointerup', (e) => {
  if (!drag) return;
  slip.classList.remove('dragging');
  slip.style.transform = '';
  if (!drag.moved) setOpen(!drag.open);
  else setOpen(e.clientY - drag.y < 0);
  drag = null;
});
handle.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!slip.classList.contains('open')); } });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && slip.classList.contains('open')) { setOpen(false); handle.focus(); } });

function changeQty(id, delta) {
  const next = Math.max(0, Math.min(20, (state.cart[id] || 0) + delta));
  if (next) state.cart[id] = next; else delete state.cart[id];
  save(); renderProducts(); renderSlip(true);
}
document.addEventListener('click', (e) => {
  const add = e.target.closest('.hanko');
  if (add) {
    changeQty(add.dataset.id, 1);
    document.querySelector(`#products .qty[data-id="${add.dataset.id}"] [data-act="inc"]`)?.focus();
    return;
  }
  const btn = e.target.closest('.qty button');
  if (!btn) return;
  const id = btn.closest('.qty').dataset.id;
  const scope = btn.closest('#cart') ? '#cart' : '#products';
  changeQty(id, btn.dataset.act === 'inc' ? 1 : -1);
  document.querySelector(`${scope} .qty[data-id="${id}"] [data-act="${btn.dataset.act}"]`)?.focus();
});

// pickup method
const meetBox = $('#meetBox');
document.querySelectorAll('input[name=method]').forEach((r) => {
  r.checked = r.value === state.method;
  r.addEventListener('change', () => { state.method = r.value; meetBox.hidden = state.method !== 'meet'; save(); });
});
meetBox.hidden = state.method !== 'meet';
if (state.meetSpot) $('#meetSpot').value = state.meetSpot;
if (state.meetTime) $('#meetTime').value = state.meetTime;
$('#meetSpot').addEventListener('change', (e) => { state.meetSpot = e.target.value; save(); });
$('#meetTime').addEventListener('change', (e) => { state.meetTime = e.target.value; save(); });

// index tab follows the section in view
const tabsFor = { kashi: '.tab-a', koyomi: '.tab-b', studio: '.tab-c' };
const tabObserver = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (en.isIntersecting) document.querySelectorAll('.tab').forEach((t) => t.setAttribute('aria-current', t.matches(tabsFor[en.target.id])));
}), { rootMargin: '-45% 0px -45% 0px' });
Object.keys(tabsFor).forEach((id) => tabObserver.observe(document.getElementById(id)));

// order text
function buildText() {
  const d = fromYmd(state.date);
  const lines = [`【${SHOP} 預購單】`, `取貨日：${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}（${DOW[d.getDay()].slice(1)}）`];
  lines.push(state.method === 'store' ? `取貨方式：到店取貨（${STORE_ADDR}）` : `取貨方式：捷運面交｜${$('#meetSpot').value} ${$('#meetTime').value}`);
  lines.push('', '品項：');
  PRODUCTS.filter((p) => state.cart[p.id]).forEach((p) => lines.push(`・${p.name} × ${state.cart[p.id]}　${money(p.price * state.cart[p.id])}`));
  lines.push(`合計：${money(total())}`, '', `訂購人：${$('#cName').value.trim()}`, `手機：${$('#cPhone').value.trim()}`);
  const note = $('#cNote').value.trim();
  if (note) lines.push(`備註：${note}`);
  lines.push('', '麻煩確認訂單，謝謝！');
  return lines.join('\n');
}
function validate() {
  const name = $('#cName');
  const phone = $('#cPhone');
  const phoneOk = /^09\d{8}$/.test(phone.value.replace(/[\s-]/g, ''));
  name.setAttribute('aria-invalid', !name.value.trim());
  phone.setAttribute('aria-invalid', !phoneOk);
  if (!count()) return ['預購單是空的，先到「今月の菓子」蓋個朱印。', '#kashi', true];
  if (!state.date) return ['還沒圈取貨日，到月曆上點一天。', '#koyomi', true];
  if (state.method === 'meet' && total() < MEET_MIN) return [`捷運面交需滿 ${money(MEET_MIN)}，目前 ${money(total())}。`, '#koyomi', true];
  if (!name.value.trim()) return ['請填寫稱呼。', '#cName'];
  if (!phoneOk) return ['手機請填 09 開頭共 10 碼。', '#cPhone'];
  return null;
}
$('#makeOrder').addEventListener('click', () => {
  const err = validate();
  $('#error').textContent = err ? err[0] : '';
  if (err) {
    if (err[2]) { setOpen(false); $(err[1]).scrollIntoView({ block: 'start' }); } else $(err[1]).focus();
    return;
  }
  const text = buildText();
  $('#orderText').textContent = text;
  $('#lineBtn').href = 'https://line.me/R/msg/text/?' + encodeURIComponent(text);
  $('#copied').textContent = '';
  const r = $('#result');
  r.hidden = false;
  r.scrollIntoView({ block: 'nearest' });
  r.focus({ preventScroll: true });
});
$('#copyBtn').addEventListener('click', async () => {
  const text = $('#orderText').textContent;
  try { await navigator.clipboard.writeText(text); } catch (e) {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  $('#copied').textContent = '已複製，可以貼到 LINE 或簡訊。';
});

renderMonth();
renderProducts();
renderSlip(false);
