const SHOP = '河壩粄條';
const STORE_KEY = 'hakka-takeout-v1';
const DOW = ['日', '一', '二', '三', '四', '五', '六'];
// periods in minutes from midnight; [] = closed
const HOURS = [
  [[630, 840], [990, 1170]], // 日
  [], // 一 公休
  [[630, 840], [990, 1170]],
  [[630, 840], [990, 1170]],
  [[630, 840], [990, 1170]],
  [[630, 840], [990, 1170]],
  [[630, 840], [990, 1200]],
];
const SPECIAL_CLOSED = { '2026-10-20': '老闆娘回娘家', '2026-11-17': '店內設備保養', '2027-01-26': '過年前備料' };

const bowl = (soup, top) => `<svg viewBox="0 0 200 150" aria-hidden="true"><ellipse cx="100" cy="128" rx="74" ry="12" fill="rgba(90,30,10,.18)"/><ellipse cx="100" cy="70" rx="86" ry="58" fill="#f4f1ec"/><ellipse cx="100" cy="70" rx="86" ry="58" fill="none" stroke="#2f5d8a" stroke-width="5"/><ellipse cx="100" cy="70" rx="72" ry="46" fill="${soup}"/>${top}</svg>`;
const noodles = '<g stroke="#fffaf0" stroke-width="7" stroke-linecap="round" fill="none"><path d="M50 70c20-14 40 10 60-4s30 8 44-2"/><path d="M46 82c22-10 42 12 66-2s28 6 40 0"/><path d="M56 58c18-10 36 6 54-4s26 4 36 0"/></g>';
const scallion = '<g fill="#5c9a3a"><circle cx="70" cy="52" r="4"/><circle cx="118" cy="58" r="4"/><circle cx="96" cy="90" r="4"/><circle cx="132" cy="80" r="3.5"/><circle cx="62" cy="86" r="3.5"/></g>';
const pork = '<g fill="#c98e6a" stroke="#8c5a3c" stroke-width="2"><rect x="104" y="40" width="34" height="18" rx="4" transform="rotate(14 120 49)"/><rect x="58" y="70" width="30" height="16" rx="4" transform="rotate(-10 73 78)"/></g>';
const shallot = '<g fill="#b36a2a"><circle cx="84" cy="62" r="3"/><circle cx="110" cy="76" r="3"/><circle cx="126" cy="62" r="3"/><circle cx="76" cy="80" r="3"/></g>';

const MENU = {
  麵食: [
    { id: 'kt-soup', name: '招牌湯粄條', note: '大骨湯・油蔥', price: 70, tag: '招牌', art: bowl('#e9c48f', noodles + pork + scallion), desc: '豬大骨熬六小時，粄條滑、湯頭清甜，撒一把自家炸的紅蔥酥。' },
    { id: 'kt-dry', name: '乾拌粄條', note: '油蔥醬', price: 65, tag: '招牌', art: bowl('#d9a35b', noodles + shallot + scallion), desc: '豬油蔥醬拌開，附一碗清湯。老客人都加一顆滷蛋。' },
    { id: 'mtm', name: '米苔目', note: '湯／乾', price: 60, desc: '' },
    { id: 'rice-noodle', name: '客家炒米粉', note: '', price: 70, tag: '招牌', art: bowl('#e3b678', '<g stroke="#f8eedd" stroke-width="3" fill="none"><path d="M40 60c30 10 60-14 90 0s20 10 30 6"/><path d="M44 74c26 12 64-10 92 2s14 8 24 4"/><path d="M50 86c24 8 56-8 80 0"/></g>' + scallion + '<g fill="#d27b52"><rect x="96" y="50" width="16" height="6" rx="2"/><rect x="70" y="80" width="14" height="6" rx="2"/></g>'), desc: '細米粉加香菇、肉絲、高麗菜大火快炒，粒粒分明。' },
    { id: 'tangyuan', name: '鹹湯圓', note: '冬季限定', price: 80, art: bowl('#e9d2a8', '<g fill="#fffdf7" stroke="#e6dccb" stroke-width="2"><circle cx="78" cy="62" r="13"/><circle cx="112" cy="58" r="13"/><circle cx="98" cy="84" r="13"/><circle cx="128" cy="80" r="12"/></g>' + '<g fill="#3e7a2c"><path d="M54 70l14-6 4 8z"/><path d="M134 50l12 4-8 8z"/></g>'), desc: '湯圓包鮮肉，湯裡有茼蒿、香菇、蝦米，冷天最受歡迎。' },
  ],
  小菜: [
    { id: 'xiaochao', name: '客家小炒', note: '小份', price: 120, tag: '招牌', art: bowl('#c78a4e', '<g fill="#7a4a2a"><rect x="60" y="50" width="34" height="8" rx="3" transform="rotate(20 77 54)"/><rect x="100" y="70" width="36" height="8" rx="3" transform="rotate(-15 118 74)"/></g><g fill="#f0e2c4"><rect x="80" y="74" width="26" height="10" rx="3"/><rect x="112" y="48" width="22" height="9" rx="3"/></g><g stroke="#5c9a3a" stroke-width="5" stroke-linecap="round"><path d="M56 80l26-8"/><path d="M104 92l30-6"/><path d="M118 40l20 10"/></g>'), desc: '豆干、魷魚、五花肉、芹菜，醬香重、最下飯。' },
    { id: 'pork-belly', name: '客家鹹豬肉', note: '', price: 100, desc: '' },
    { id: 'intestine', name: '薑絲大腸', note: '', price: 120, desc: '' },
    { id: 'tofu', name: '滷豆干', note: '', price: 30, desc: '' },
    { id: 'veg', name: '燙青菜', note: '當季', price: 40, desc: '' },
    { id: 'egg', name: '滷蛋', note: '', price: 15, desc: '' },
  ],
  湯品: [
    { id: 'pork-soup', name: '豬血湯', note: '', price: 40, desc: '' },
    { id: 'ball-soup', name: '貢丸湯', note: '', price: 40, desc: '' },
    { id: 'clam-soup', name: '蛤蜊湯', note: '', price: 60, desc: '' },
  ],
  飲料: [
    { id: 'lei-cha', name: '冰擂茶', note: '自家擂', price: 45, desc: '' },
    { id: 'black-tea', name: '古早味紅茶', note: '', price: 25, desc: '' },
  ],
};
const ALL = Object.values(MENU).flat();

const REVIEWS = [
  { who: '陳先生', when: '2 週前', stars: 5, text: '湯粄條湯頭很清，不會死鹹。乾拌加滷蛋是我每週必點，老闆娘記得我不要香菜。' },
  { who: 'Mei', when: '1 個月前', stars: 5, text: '帶爸媽來吃，客家小炒份量很大，鹹湯圓的湯好鮮。中午人多建議先打電話外帶。' },
  { who: '騎車路過的人', when: '3 個月前', stars: 4, text: '週一公休撲空過一次，後來都先看網站有沒有開。炒米粉很香，擂茶推薦。' },
  { who: '林小姐', when: '5 個月前', stars: 5, text: '粄條是當天蒸的吃得出來，Q 但不硬。價格很實在，停車在旁邊廟埕很方便。' },
];

const $ = (s) => document.querySelector(s);
const money = (n) => 'NT$' + n.toLocaleString('zh-TW');
const pad = (n) => String(n).padStart(2, '0');
const hm = (m) => `${Math.floor(m / 60)}:${pad(m % 60)}`;
const ymd = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const plusIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const star = (fill) => `<svg viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="s${Math.round(fill * 100)}"><stop offset="${fill}" stop-color="#f5c04a"/><stop offset="${fill}" stop-color="rgba(255,255,255,.3)"/></linearGradient></defs><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="url(#s${Math.round(fill * 100)})"/></svg>`;
const stars = (n) => Array.from({ length: 5 }, (_, i) => star(Math.max(0, Math.min(1, n - i)))).join('');

const cart = (() => { try { return JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) { return {}; } })();
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(cart)); } catch (e) { /* storage unavailable */ } };

// open/closed
function periodsOn(d) { return SPECIAL_CLOSED[ymd(d)] ? [] : HOURS[d.getDay()]; }

function nextOpen(from) {
  for (let i = 0; i < 14; i++) {
    const d = new Date(from); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
    const mins = i === 0 ? from.getHours() * 60 + from.getMinutes() : -1;
    const p = periodsOn(d).find(([s]) => s > mins);
    if (p) return { d, start: p[0], dayOffset: i };
  }
  return null;
}

function dayWord(offset, d) { return offset === 0 ? '今天' : offset === 1 ? '明天' : `週${DOW[d.getDay()]}`; }

function renderStatus() {
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  const today = periodsOn(now);
  const cur = today.find(([s, e]) => mins >= s && mins < e);
  const sign = $('#sign');
  const status = $('#status');
  sign.classList.toggle('closed-day', today.length === 0);
  status.className = 'status';
  if (cur) {
    sign.classList.remove('off');
    if (!sign.classList.contains('on')) sign.classList.add('on');
    const left = cur[1] - mins;
    status.classList.add(left <= 30 ? 'soon' : 'open');
    $('#statusMain').textContent = left <= 30 ? '快打烊了' : '營業中';
    $('#statusSub').textContent = `今天 ${hm(cur[1])} 休息${left <= 30 ? `，剩 ${left} 分鐘` : ''}，外帶請提早點`;
    renderTicker();
    return;
  }
  sign.classList.add('off');
  sign.classList.remove('on');
  const n = nextOpen(now);
  const special = SPECIAL_CLOSED[ymd(now)];
  if (today.length === 0) $('#statusMain').textContent = special ? `今日臨時公休（${special}）` : '今日公休';
  else if (mins < today[0][0]) $('#statusMain').textContent = '還沒開門';
  else if (today.some(([s]) => s > mins)) $('#statusMain').textContent = '午休中';
  else $('#statusMain').textContent = '今天已打烊';
  $('#statusSub').textContent = n ? `下次開門：${dayWord(n.dayOffset, n.d)} ${hm(n.start)}` : '';
  $('.closed-note small').textContent = n ? `${dayWord(n.dayOffset, n.d)} ${hm(n.start)} 見！` : '';
  renderTicker();
}

function renderTicker() {
  const now = new Date();
  const p = HOURS[now.getDay()];
  const next = Object.entries(SPECIAL_CLOSED).find(([k]) => k >= ymd(now));
  const bits = [
    `${$('#statusMain').textContent}・${$('#statusSub').textContent}`,
    p.length ? `今天 ${p.map(([s, e]) => `${hm(s)}–${hm(e)}`).join('、')}` : '今天公休',
    '每週一公休',
    next ? `${+next[0].slice(5, 7)}/${+next[0].slice(8)} 臨時公休` : '',
    '外帶專線 03-5XX-0000',
    '米漿每天清晨四點磨',
  ].filter(Boolean);
  const run = bits.map((b) => `<span>${b}</span>`).join('');
  $('#ticker').innerHTML = run + run.replace(/<span>/g, '<span aria-hidden="true">');
}

function renderHours() {
  const todayDow = new Date().getDay();
  $('#hoursBody').innerHTML = [1, 2, 3, 4, 5, 6, 0].map((i) => {
    const p = HOURS[i];
    return `<tr class="${i === todayDow ? 'is-today' : ''}"><th scope="row">週${DOW[i]}</th>${p.length ? `<td>${p.map(([s, e]) => `${hm(s)}–${hm(e)}`).join('　')}</td>` : '<td class="off"><span>公休</span></td>'}</tr>`;
  }).join('');
  const todayKey = ymd(new Date());
  $('#noticeList').innerHTML = '<li>每週一固定公休</li>' + Object.entries(SPECIAL_CLOSED).map(([k, why]) => {
    const [y, m, d] = k.split('-').map(Number);
    const dow = DOW[new Date(y, m - 1, d).getDay()];
    return `<li class="${k < todayKey ? 'past' : ''}">${m}/${d}（${dow}）臨時公休・${why}</li>`;
  }).join('');
}

// rail + menu
function addLabel(it) {
  const q = cart[it.id] || 0;
  return `${plusIcon}<span class="n">${q ? q : ''}</span>`;
}
function renderRail() {
  $('#rail').innerHTML = ALL.filter((it) => it.art).map((it) => `<li class="bowl">
    <div class="bowl-art" role="img" aria-label="${it.name} 插畫">${it.art}</div>
    <div class="bowl-label">
      <h3>${it.name}</h3><span class="bowl-price">${money(it.price)}</span>
      <p>${it.desc}</p>
      <button type="button" class="add-btn" data-id="${it.id}" aria-label="加入外帶：${it.name}">${addLabel(it)}</button>
    </div></li>`).join('');
}
const cats = Object.keys(MENU);
let activeCat = cats[0];
function renderMenu() {
  $('#tabs').innerHTML = cats.map((c) => `<button class="tab" role="tab" id="tab-${c}" aria-selected="${c === activeCat}" aria-controls="menuList" tabindex="${c === activeCat ? 0 : -1}">${c}</button>`).join('');
  $('#menuList').setAttribute('aria-labelledby', `tab-${activeCat}`);
  $('#menuList').innerHTML = MENU[activeCat].map((it) => `<li class="row${cart[it.id] ? ' has' : ''}">
    <h3>${it.name}${it.tag ? `<span class="tag">${it.tag}</span>` : ''}${it.note ? `<small>${it.note}</small>` : ''}</h3>
    <span class="price">${it.price}</span>
    <div class="stepper" data-id="${it.id}">
      <button type="button" data-act="dec" aria-label="${it.name} 減一份" ${cart[it.id] ? '' : 'disabled'}>−</button>
      <output aria-label="${it.name} 份數">${cart[it.id] || ''}</output>
      <button type="button" data-act="inc" aria-label="${it.name} 加一份">＋</button>
    </div>
  </li>`).join('');
}
$('#tabs').addEventListener('click', (e) => {
  const t = e.target.closest('.tab');
  if (!t) return;
  activeCat = t.textContent; renderMenu(); $(`#tab-${activeCat}`).focus();
});
$('#tabs').addEventListener('keydown', (e) => {
  if (!['ArrowLeft', 'ArrowRight'].includes(e.key)) return;
  activeCat = cats[(cats.indexOf(activeCat) + (e.key === 'ArrowRight' ? 1 : cats.length - 1)) % cats.length];
  renderMenu(); $(`#tab-${activeCat}`).focus();
});

function setQty(id, q) {
  if (q > 0) cart[id] = Math.min(q, 30); else delete cart[id];
  save();
  document.querySelectorAll(`.add-btn[data-id="${id}"]`).forEach((b) => {
    b.querySelector('.n').textContent = cart[id] || '';
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
  });
  renderMenu();
  renderCart();
}
document.addEventListener('click', (e) => {
  const add = e.target.closest('.add-btn');
  if (add) return setQty(add.dataset.id, (cart[add.dataset.id] || 0) + 1);
  const st = e.target.closest('.stepper button');
  if (st) {
    const id = st.closest('.stepper').dataset.id;
    setQty(id, (cart[id] || 0) + (st.dataset.act === 'inc' ? 1 : -1));
    const again = document.querySelector(`.stepper[data-id="${id}"] [data-act="${st.dataset.act}"]`);
    (again && !again.disabled ? again : document.querySelector(`.stepper[data-id="${id}"] [data-act="inc"]`))?.focus();
  }
});

const total = () => ALL.reduce((s, it) => s + (cart[it.id] || 0) * it.price, 0);
const count = () => Object.values(cart).reduce((a, b) => a + b, 0);

function renderCart() {
  const items = ALL.filter((it) => cart[it.id]);
  $('#cart').innerHTML = items.map((it) => `<li><span class="nm">${it.name}</span><span class="x">× ${cart[it.id]}</span><span class="sub">${money(it.price * cart[it.id])}</span></li>`).join('');
  $('#cartEmpty').hidden = items.length > 0;
  $('#total').textContent = money(total());
  $('#dockCount').textContent = count();
  $('#dockCount').hidden = !count();
  $('#dockTotal').textContent = `外帶單 ${count()} 份，${money(total())}`;
}

// pickup times: every 15 min, ≥20 min from now, within open periods, next open day if none today
function pickupOptions() {
  const now = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(now); d.setDate(d.getDate() + i); d.setHours(0, 0, 0, 0);
    const earliest = i === 0 ? now.getHours() * 60 + now.getMinutes() + 20 : 0;
    const opts = [];
    periodsOn(d).forEach(([s, e]) => {
      for (let m = Math.ceil(Math.max(s + 15, earliest) / 15) * 15; m <= e - 15; m += 15) opts.push(m);
    });
    if (opts.length) return { d, label: dayWord(i, d), opts };
  }
  return null;
}
function renderPickup() {
  const p = pickupOptions();
  const prev = $('#pickTime').value;
  $('#pickTime').innerHTML = p.opts.map((m) => `<option value="${p.label} ${m / 60 | 0}:${pad(m % 60)}">${p.label}（${p.d.getMonth() + 1}/${p.d.getDate()}）${hm(m)}</option>`).join('');
  if ([...$('#pickTime').options].some((o) => o.value === prev)) $('#pickTime').value = prev;
}

// reviews
$('#avgStars').innerHTML = stars(4.6);
$('#reviewList').innerHTML = REVIEWS.map((r) => `<li class="bubble">
  <blockquote>${r.text}</blockquote>
  <p class="who"><span class="stars" role="img" aria-label="${r.stars} 顆星">${stars(r.stars)}</span><b>${r.who}</b><small>${r.when}・範例評論</small></p></li>`).join('');

// submit
$('#orderForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#oName');
  const phone = $('#oPhone');
  const phoneOk = /^09\d{8}$/.test(phone.value.replace(/[\s-]/g, ''));
  name.setAttribute('aria-invalid', !name.value.trim());
  phone.setAttribute('aria-invalid', !phoneOk);
  let err = '';
  let focus = null;
  if (!count()) { err = '外帶單是空的，先到菜單點「＋」。'; focus = $('#menu'); }
  else if (!name.value.trim()) { err = '請填寫稱呼。'; focus = name; }
  else if (!phoneOk) { err = '手機請填 09 開頭共 10 碼。'; focus = phone; }
  $('#error').textContent = err;
  if (err) { focus.scrollIntoView({ block: 'center' }); if (focus.matches('input')) focus.focus(); return; }
  const lines = [`【${SHOP} 外帶】`, `取餐：${$('#pickTime').selectedOptions[0].textContent}`, ''];
  ALL.filter((it) => cart[it.id]).forEach((it) => lines.push(`・${it.name} × ${cart[it.id]}　${money(it.price * cart[it.id])}`));
  lines.push(`合計：${money(total())}`, '', `稱呼：${name.value.trim()}`, `手機：${phone.value.trim()}`);
  if ($('#oNote').value.trim()) lines.push(`備註：${$('#oNote').value.trim()}`);
  lines.push('', '麻煩老闆娘確認，謝謝！');
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

renderStatus();
renderHours();
renderRail();
renderMenu();
renderCart();
renderPickup();
setInterval(() => { renderStatus(); renderPickup(); }, 60000);

// the takeout button steps aside while the takeout form is on screen
const fab = document.querySelector('.fab');
new IntersectionObserver(([en]) => fab.classList.toggle('away', en.isIntersecting), { threshold: 0.15 }).observe(document.getElementById('takeout'));
