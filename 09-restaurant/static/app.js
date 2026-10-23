const $ = (s, el = document) => el.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WD = '日一二三四五六';
const FIELD = { name: '姓名', phone: '手機', email: 'Email', party: '人數', date: '日期', time: '時間', notes: '備註', code: '訂位代碼' };
const STATUS = { confirmed: '已確認', seated: '已入座', completed: '已完成', no_show: '未到', cancelled: '已取消' };
const PERIOD = { lunch: '午餐', dinner: '晚餐' };
const PHONE = '06-000-1024';

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body && JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const d = data.detail;
    const err = new Error(typeof d === 'string' ? d : d?.[0] ? `${FIELD[d[0].loc?.at(-1)] ?? '資料'}格式不正確` : '連線失敗，請稍後再試');
    err.status = res.status;
    throw err;
  }
  return data;
}

// dates are handled as UTC midnight so the browser's timezone never shifts a day
const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekday = (iso) => new Date(iso + 'T00:00:00Z').getUTCDay();
const fmtDate = (iso) => `${+iso.slice(5, 7)}/${+iso.slice(8)}（${WD[weekday(iso)]}）`;
const longDate = (iso) => `${+iso.slice(5, 7)} 月 ${+iso.slice(8)} 日（${WD[weekday(iso)]}）`;
const pyDay = (iso) => String((weekday(iso) + 6) % 7);

let info;
let editing = null;
let lastBooking = null;
let slotReq = 0;

const form = $('#book-form');
const sort = (name, value, label, { checked, disabled, cls = '', extra = '' } = {}) =>
  `<label class="sort ${cls}"><input type="radio" name="${name}" value="${esc(value)}"${checked ? ' checked' : ''}${disabled ? ' disabled' : ''} ${extra}><span>${label}</span></label>`;

function isClosed(iso) {
  return info.closed_dates.includes(iso) || !Object.values(info.schedule[pyDay(iso)]).some(Boolean);
}

function renderStatic() {
  $('#party').innerHTML = Array.from({ length: info.max_party }, (_, i) => sort('party', i + 1, i + 1, { checked: i === 1 })).join('');
  $('#party-hint').innerHTML = `${info.max_party + 1} 位以上或包場，請來電 <a href="tel:${PHONE.replace(/-/g, '')}">${PHONE}</a>`;
  $('#area').innerHTML = ['', '窗邊', '大廳', '吧台', '包廂'].map((a) => sort('area_pref', a, a || '不指定', { checked: !a })).join('');
  $('#occasion').innerHTML = ['', '生日', '紀念日', '約會', '商務', '家庭聚餐'].map((a) => sort('occasion', a, a || '一般', { checked: !a })).join('');

  // the date tray is a calendar grid: weekday header, then one sort per day
  const head = [...WD].map((w, i) => `<span class="wd${i === 0 || i === 6 ? ' we' : ''}" aria-hidden="true">${w}</span>`).join('');
  const blanks = '<span aria-hidden="true"></span>'.repeat(weekday(info.today));
  let firstOpen = true;
  const days = Array.from({ length: info.booking_days + 1 }, (_, i) => {
    const iso = addDays(info.today, i);
    const closed = isClosed(iso);
    const day = +iso.slice(8);
    const note = closed ? '休' : i === 0 ? '今天' : day === 1 ? `${+iso.slice(5, 7)}月` : '';
    const checked = !closed && firstOpen;
    if (checked) firstOpen = false;
    return sort('date', iso, `${day}${note ? `<small>${note}</small>` : ''}`,
      { disabled: closed, checked, extra: `aria-label="${fmtDate(iso)}${closed ? ' 公休' : ''}"` });
  }).join('');
  $('#dates').innerHTML = head + blanks + days;
  $('#dining').textContent = info.dining_minutes;

  $('#hours tbody').innerHTML = ['1', '2', '3', '4', '5', '6', '0'].map((k) => {
    const s = info.schedule[k];
    const wins = ['lunch', 'dinner'].filter((p) => s[p]).map((p) => `${PERIOD[p]} ${s[p][0]}–${s[p][1]}`);
    const isToday = pyDay(info.today) === k;
    return `<tr class="${isToday ? 'is-today' : ''}"><th>週${WD[(+k + 1) % 7]}</th><td class="${wins.length ? '' : 'closed'}">${wins.join('　') || '公休'}${isToday ? '（今天）' : ''}</td></tr>`;
  }).join('');
}

async function renderToday() {
  const el = $('#today-status');
  if (isClosed(info.today)) { el.textContent = '今天公休，可以先訂之後的日期。'; return; }
  try {
    const { slots } = await api(`/api/availability?date=${info.today}&party=2`);
    const open = slots.filter((s) => s.state === 'open');
    const full = slots.some((s) => s.state === 'full');
    el.innerHTML = open.length ? `今天還有<b>${open.length}</b><span class="nw">個時段有位</span>`
      : full ? '今天已經訂滿，可以登記候補。' : '今天的線上訂位已截止，明天見。';
    // tapping a time jumps into the order sheet with today and that time already set
    $('#today-slots').innerHTML = open.slice(0, 8).map((s) => `<li><button type="button" data-time="${s.time}">${s.time}</button></li>`).join('');
  } catch { el.textContent = ''; }
}

async function loadSlots(keep) {
  const fd = new FormData(form);
  const day = fd.get('date');
  const box = $('#slots');
  if (!day) { box.innerHTML = '<p class="hint">先選日期</p>'; updateSummary(); return; }
  const req = ++slotReq;
  box.innerHTML = '<p class="hint">查詢空位中…</p>';
  try {
    const q = `/api/availability?date=${day}&party=${fd.get('party')}${editing ? `&exclude=${editing.code}` : ''}`;
    const { slots } = await api(q);
    if (req !== slotReq) return;
    if (!slots.length) { box.innerHTML = '<p class="hint">這天沒有開放線上訂位</p>'; updateSummary(); return; }
    const groups = {};
    slots.forEach((s) => (groups[s.period] ??= []).push(s));
    box.innerHTML = Object.entries(groups).map(([p, list]) => `<div class="slot-group"><h4 class="slot-head">${PERIOD[p]}</h4><div class="sorts">${
      list.map((s) => {
        const blocked = s.state === 'closed' || (editing && s.state === 'full');
        const note = s.state === 'closed' ? '截止' : s.state === 'full' ? (editing ? '客滿' : '候補') : '';
        return sort('time', s.time, `${s.time}${note ? `<small>${note}</small>` : ''}`, {
          checked: s.time === keep && !blocked,
          disabled: blocked,
          cls: `slot ${s.state}`,
          extra: `data-state="${s.state}" aria-label="${s.time}${s.state === 'full' ? ' 客滿，可候補' : s.state === 'closed' ? ' 已截止' : ' 有位'}"`,
        });
      }).join('')}</div></div>`).join('');
    if (!slots.some((s) => s.state === 'open')) box.insertAdjacentHTML('beforeend', '<p class="hint">這天已經訂滿，可以選時段登記候補，或換一天。</p>');
  } catch (e) {
    if (req === slotReq) box.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
  updateSummary();
}

$('#today-slots').addEventListener('click', async (e) => {
  const t = e.target.closest('[data-time]')?.dataset.time;
  if (!t) return;
  const day = $(`input[name=date][value="${info.today}"]`, form);
  if (!day || day.disabled) return;
  day.checked = true;
  $('input[name=party][value="2"]', form).checked = true;
  $('#book').scrollIntoView();
  await loadSlots(t);
});

const selectedState = () => $('input[name=time]:checked', form)?.dataset.state;

function updateSummary() {
  const fd = new FormData(form);
  const full = !editing && selectedState() === 'full';
  // waitlist entries only keep name, phone and notes
  $('#extra-fields').disabled = full || !!editing;
  $('#extra').hidden = full || !!editing;
  $('#summary').innerHTML = fd.get('time')
    ? `${fmtDate(fd.get('date'))} ${fd.get('time')}・${fd.get('party')} 位${full ? '<span class="warn">這個時段已客滿。送出會排進候補，有人取消時店家依序來電。</span>' : ''}`
    : '還沒選時間';
  $('#book-submit').textContent = editing ? '確認修改' : full ? '登記候補' : '確認訂位';
  $('#stick').hidden = !fd.get('time') && !$('#book-error').textContent;
}

form.addEventListener('change', (e) => {
  $('#book-error').textContent = '';
  if (e.target.name === 'party' || e.target.name === 'date') loadSlots(new FormData(form).get('time'));
  else updateSummary();
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = Object.fromEntries(new FormData(form));
  const err = $('#book-error');
  if (!fd.date) return void (err.textContent = '請選擇日期');
  if (!fd.time) return void (err.textContent = '請選擇入座時間');
  const btn = $('#book-submit');
  btn.disabled = true;
  err.textContent = '';
  const party = +fd.party;
  try {
    if (editing) {
      const b = await api(`/api/bookings/${editing.code}`, { method: 'PATCH', body: { phone: editing.phone, party, date: fd.date, time: fd.time, notes: fd.notes } });
      const { phone } = editing;
      quitEdit();
      showDone(b, phone, true);
    } else if (selectedState() === 'full') {
      const w = await api('/api/waitlist', { method: 'POST', body: { name: fd.name, phone: fd.phone, party, date: fd.date, time: fd.time, notes: fd.notes } });
      showWait(w, fd.name);
    } else {
      const b = await api('/api/bookings', { method: 'POST', body: { ...fd, party, area_pref: fd.area_pref || null, occasion: fd.occasion || null } });
      showDone(b, fd.phone);
    }
  } catch (e2) {
    err.textContent = e2.message;
    if (e2.status === 409) loadSlots();
  } finally {
    btn.disabled = false;
  }
});

function infoRows(b) {
  const rows = [['姓名', b.name], ['人數', `${b.party} 位`], ['日期', longDate(b.date)], ['入座', `${b.time}・用餐 ${b.duration} 分鐘`]];
  if (b.area_pref) rows.push(['座位偏好', b.area_pref]);
  if (b.occasion) rows.push(['用餐目的', b.occasion]);
  if (b.notes) rows.push(['備註', b.notes]);
  return rows.map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('');
}

const codeSorts = (code) => [...code].map((c) => `<span>${esc(c)}</span>`).join('');
const seeYou = (b) => `${longDate(b.date)}${+b.time.slice(0, 2) < 15 ? '中午' : '晚上'}見`;

function showSlip(stamp) {
  form.hidden = true;
  $('#done-stamp').innerHTML = [...stamp].map((c) => `<span>${c}</span>`).join('');
  const slip = $('#done');
  slip.hidden = false;
  slip.scrollIntoView({ block: 'start' });
  slip.focus({ preventScroll: true });
}

function showDone(b, phone, changed = false) {
  lastBooking = { ...b, phone };
  $('#done-title').textContent = changed ? `已改好，${seeYou(b)}` : seeYou(b);
  $('#done-code-wrap').hidden = false;
  $('#done-code').innerHTML = codeSorts(b.code);
  $('#done-code').setAttribute('aria-label', `訂位代碼 ${b.code.split('').join(' ')}`);
  $('#done-info').innerHTML = infoRows(b);
  $('#done-hint').textContent = (b.occasion === '生日' ? '生日蛋糕或驚喜安排，可以先來電跟我們說。' : '')
    + '查詢、改期、取消需要訂位代碼加上訂位手機。';
  $('#done-copy').hidden = $('#done-ics').hidden = $('#done-manage').hidden = false;
  $('#done-copy').textContent = '複製代碼';
  showSlip('訂妥');
}

function showWait(w, name) {
  lastBooking = null;
  $('#done-title').textContent = `已登記 ${longDate(w.date)} ${w.time} 的候補`;
  $('#done-code-wrap').hidden = true;
  $('#done-info').innerHTML = [['姓名', name], ['人數', `${w.party} 位`], ['候補順位', `第 ${w.position} 位`]]
    .map(([k, v]) => `<tr><th>${k}</th><td>${esc(v)}</td></tr>`).join('');
  $('#done-hint').textContent = '有空位時店家會依序來電，接到電話確認才算訂位成功。';
  $('#done-copy').hidden = $('#done-ics').hidden = $('#done-manage').hidden = true;
  showSlip('候補');
}

$('#done-again').addEventListener('click', () => {
  $('#done').hidden = true;
  form.hidden = false;
  form.reset();
  renderStatic();
  loadSlots();
  form.scrollIntoView();
});

$('#done-copy').addEventListener('click', async (e) => {
  try {
    await navigator.clipboard.writeText(lastBooking.code);
    e.target.textContent = '已複製';
  } catch {
    e.target.textContent = '請手動記下代碼';
  }
});

$('#done-manage').addEventListener('click', () => {
  const f = $('#lookup-form');
  f.code.value = lastBooking.code;
  f.phone.value = lastBooking.phone;
  f.requestSubmit();
  $('#manage').scrollIntoView();
});

$('#done-ics').addEventListener('click', () => {
  const b = lastBooking;
  const start = new Date(`${b.date}T${b.time}:00+08:00`);
  const end = new Date(start.getTime() + b.duration * 60000);
  const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const text = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//chuiian-demo//booking//ZH', 'BEGIN:VEVENT',
    `UID:${b.code}@chuiian.example`, `DTSTAMP:${f(new Date())}`, `DTSTART:${f(start)}`, `DTEND:${f(end)}`,
    `SUMMARY:炊煙 訂位 ${b.party} 位`, `DESCRIPTION:訂位代碼 ${b.code}`, 'LOCATION:台南市中西區範例路 12 號',
    'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(new Blob([text], { type: 'text/calendar' })), download: `chuiian-${b.code}.ics` });
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// --- lookup / edit / cancel ---

const lookupForm = $('#lookup-form');
let found = null;

function renderResult() {
  const b = found;
  const canEdit = b.status === 'confirmed';
  const box = $('#lookup-result');
  box.innerHTML = `<div class="result">
    <div class="result-head"><p class="code" aria-label="訂位代碼 ${esc(b.code)}">${codeSorts(b.code)}</p><span class="status ${b.status}">${STATUS[b.status]}</span></div>
    <table class="slip-info">${infoRows(b)}</table>
    ${canEdit ? '<div class="slip-actions"><button type="button" class="ink-btn" id="r-edit">改人數・時間</button><button type="button" class="line-btn" id="r-cancel">取消訂位</button></div>' : ''}
    <p class="error" id="r-error" role="alert"></p>
  </div>`;
  box.focus();
  if (!canEdit) return;
  $('#r-edit').addEventListener('click', () => startEdit(b));
  $('#r-cancel').addEventListener('click', async () => {
    if (!confirm(`確定要取消 ${fmtDate(b.date)} ${b.time} 的訂位嗎？`)) return;
    try {
      found = { ...(await api(`/api/bookings/${b.code}/cancel`, { method: 'POST', body: { code: b.code, phone: b.phone } })), phone: b.phone };
      renderResult();
    } catch (e) { $('#r-error').textContent = e.message; }
  });
}

lookupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const code = lookupForm.code.value.trim().toUpperCase();
  const phone = lookupForm.phone.value;
  $('#lookup-error').textContent = '';
  try {
    found = { ...(await api('/api/bookings/lookup', { method: 'POST', body: { code, phone } })), phone };
    renderResult();
  } catch (err) {
    $('#lookup-result').innerHTML = '';
    $('#lookup-error').textContent = err.message;
  }
});

function setContact(off) {
  const contact = $('#contact');
  contact.disabled = contact.hidden = off;
}

async function startEdit(b) {
  editing = { code: b.code, phone: b.phone };
  $('#done').hidden = true;
  form.hidden = false;
  $('#edit-code').textContent = b.code;
  const banner = $('#edit-banner');
  banner.hidden = false;
  setContact(true);
  const party = $(`input[name=party][value="${b.party}"]`, form);
  if (party) party.checked = true;
  const day = $(`input[name=date][value="${b.date}"]`, form);
  if (day && !day.disabled) day.checked = true;
  form.notes.value = b.notes;
  banner.tabIndex = -1;
  $('#book').scrollIntoView();
  banner.focus({ preventScroll: true });
  await loadSlots(b.time);
}

function quitEdit() {
  editing = null;
  $('#edit-banner').hidden = true;
  setContact(false);
  form.notes.value = '';
}

$('#edit-quit').addEventListener('click', () => { quitEdit(); loadSlots(new FormData(form).get('time')); });

(async function init() {
  try {
    info = await api('/api/info');
  } catch {
    $('#dates').innerHTML = '<p class="error">伺服器沒有回應，請重新整理頁面。</p>';
    $('#today-status').textContent = '';
    return;
  }
  renderStatic();
  renderToday();
  loadSlots();
})();
