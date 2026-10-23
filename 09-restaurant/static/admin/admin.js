const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const WD = '日一二三四五六';
const STATUS = { confirmed: '已確認', seated: '已入座', completed: '已完成', no_show: '未到', cancelled: '已取消' };
const SOURCE = { web: '網路', phone: '電話', walk_in: '現場' };
const FIELD = { name: '姓名', phone: '手機', email: 'Email', party: '人數', date: '日期', time: '時間', notes: '備註', schedule: '營業時間', closed_dates: '公休日', dining_minutes: '用餐時間', booking_days: '開放天數', max_party: '最多人數', cutoff_minutes: '截止時間', seats: '座位數' };
const AREAS = ['窗邊', '大廳', '吧台', '包廂'];

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, { method, headers: body ? { 'Content-Type': 'application/json' } : {}, body: body && JSON.stringify(body) });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && path !== '/api/admin/login') { showLogin(); throw new Error('請重新登入'); }
  if (!res.ok) {
    const d = data.detail;
    const loc = d?.[0]?.loc?.find((k) => FIELD[k]);
    throw new Error(typeof d === 'string' ? d : d?.[0] ? (d[0].msg.startsWith('Value error, ') ? d[0].msg.slice(13) : `${FIELD[loc] ?? '資料'}格式不正確`) : '連線失敗，請稍後再試');
  }
  return data;
}

const addDays = (iso, n) => { const d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const weekday = (iso) => new Date(iso + 'T00:00:00Z').getUTCDay();
const fmtDate = (iso) => `${+iso.slice(5, 7)}/${+iso.slice(8)}（${WD[weekday(iso)]}）`;
const toMin = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
const toHM = (m) => `${String(m / 60 | 0).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function nextSlot(day) {
  const wins = Object.values(S.settings.schedule[String((weekday(day) + 6) % 7)]).filter(Boolean);
  const after = day === S.today ? toMin(nowHM()) : 0;
  for (const [a, z] of wins) {
    for (let m = toMin(a); m <= toMin(z); m += S.settings.slot_minutes) if (m >= after) return toHM(m);
  }
  return wins[0]?.[0] ?? '18:00';
}
const nowHM = () => new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Taipei', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date());

let toastTimer;
function toast(msg, bad = false, undo = null) {
  const t = $('#toast');
  t.innerHTML = `<span>${esc(msg)}</span>${undo ? '<button type="button">復原</button>' : ''}`;
  if (undo) $('button', t).addEventListener('click', () => { t.classList.remove('show'); undo(); });
  t.classList.toggle('bad', bad);
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), undo ? 6000 : 2600);
}

const S = { today: null, day: null, q: '', tab: 'list', bookings: [], waitlist: [], tables: [], settings: null };

// --- auth ---

function showLogin() {
  $('#app').hidden = true;
  $('#login').hidden = false;
  $('#login-form').password.focus();
}

$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('#login-error').textContent = '';
  try {
    await api('/api/admin/login', { method: 'POST', body: { password: e.target.password.value } });
    e.target.reset();
    showApp();
  } catch (err) { $('#login-error').textContent = err.message; }
});

$('#logout').addEventListener('click', async () => { await api('/api/admin/logout', { method: 'POST' }); showLogin(); });

async function showApp() {
  $('#login').hidden = true;
  $('#app').hidden = false;
  [S.settings, S.tables] = await Promise.all([api('/api/admin/settings'), api('/api/admin/tables')]);
  renderSettings();
  renderTables();
  await refresh();
}

// --- data ---

async function refresh() {
  $('#day').value = S.day;
  $('#export').href = `/api/admin/export.csv?date=${S.day}`;
  const [bookings, waitlist] = await Promise.all([
    api(S.q ? `/api/admin/bookings?q=${encodeURIComponent(S.q)}` : `/api/admin/bookings?date=${S.day}`),
    api(`/api/admin/waitlist?date=${S.day}`),
  ]);
  S.bookings = bookings;
  S.waitlist = waitlist;
  $('#wait-count').textContent = waitlist.length || '';
  renderList();
  renderTimeline();
  renderWaitlist();
  if (S.tab === 'stats') loadStats();
}

function setDay(iso) { S.day = iso; S.q = ''; $('#search').q.value = ''; refresh(); }
$$('[data-shift]').forEach((b) => b.addEventListener('click', () => setDay(addDays(S.day, +b.dataset.shift))));
$('#day').addEventListener('change', (e) => e.target.value && setDay(e.target.value));
$('#today-btn').addEventListener('click', () => setDay(S.today));
$('#search').addEventListener('submit', (e) => { e.preventDefault(); S.q = e.target.q.value.trim(); selectTab('list'); refresh(); });
$('#search').q.addEventListener('search', (e) => { if (!e.target.value && S.q) { S.q = ''; refresh(); } });
$('#filter').addEventListener('change', renderList);

function selectTab(tab) {
  S.tab = tab;
  $$('.tabs button').forEach((b) => b.setAttribute('aria-selected', b.dataset.tab === tab));
  $$('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab; });
  if (tab === 'stats') loadStats();
}
$$('.tabs button').forEach((b) => b.addEventListener('click', () => selectTab(b.dataset.tab)));

// --- list ---

function actions(b) {
  const btn = (act, label, cls = '') => `<button type="button" class="${cls}" data-act="${act}" data-id="${b.id}">${label}</button>`;
  const by = {
    confirmed: btn('seated', '入座', 'primary') + btn('no_show', '未到') + btn('cancelled', '取消', 'warn'),
    seated: btn('completed', '用餐完畢', 'primary'),
    completed: '',
    no_show: btn('confirmed', '改回已確認'),
    cancelled: btn('confirmed', '恢復訂位'),
  };
  return by[b.status] + btn('edit', '編輯');
}

function row(b) {
  return `<article class="bk s-${b.status}">
    <div class="t">${b.time}${S.q ? `<small>${fmtDate(b.date)}</small>` : ''}</div>
    <div class="who">
      <b>${esc(b.name)}</b><span class="pax">${b.party} 位</span><span class="pill">${STATUS[b.status]}</span>${b.occasion ? `<span class="tag">${esc(b.occasion)}</span>` : ''}
      <div class="sub"><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a><span>${esc(b.table_name ?? '未排桌')}${b.table_area ? ` ${esc(b.table_area)}` : ''}</span><span>${SOURCE[b.source]}</span><span>${esc(b.code)}</span>${b.area_pref ? `<span>想坐${esc(b.area_pref)}</span>` : ''}</div>
      ${b.notes ? `<div class="note">${esc(b.notes)}</div>` : ''}
    </div>
    <div class="acts">${actions(b)}</div>
  </article>`;
}

function renderList() {
  const f = $('#filter').value;
  const list = S.bookings.filter((b) => f === 'all' || (f === 'active' ? ['confirmed', 'seated'].includes(b.status) : b.status === f));
  $('#list-title').textContent = S.q ? `搜尋「${S.q}」・${S.bookings.length} 筆` : `${fmtDate(S.day)}${S.day === S.today ? ' 今天' : ''}`;
  $('#kpis').hidden = !!S.q;

  const live = S.bookings.filter((b) => b.status !== 'cancelled');
  const kpi = (label, value, unit = '') => `<div class="kpi"><span>${label}</span><b>${value}</b><small>${unit}</small></div>`;
  $('#kpis').innerHTML = kpi('訂位', live.length, '組') + kpi('來客', live.reduce((n, b) => n + b.party, 0), '位')
    + kpi('已入座', S.bookings.filter((b) => b.status === 'seated').length, '組')
    + kpi('未到', S.bookings.filter((b) => b.status === 'no_show').length, '組') + kpi('候補', S.waitlist.length, '組');

  if (!list.length) {
    $('#list').innerHTML = `<div class="empty">${S.q ? '找不到符合的訂位' : f === 'active' && S.bookings.length ? '沒有未結束的訂位，選「全部」看完整紀錄' : '這天還沒有訂位'}</div>`;
    return;
  }
  let last = '';
  $('#list').innerHTML = list.map((b) => {
    const key = S.q ? b.date : b.time;
    const head = key !== last && !S.q ? `<p class="slot-head">${b.time}<span>${list.filter((x) => x.time === b.time).reduce((n, x) => n + x.party, 0)} 位</span></p>` : '';
    last = key;
    return head + row(b);
  }).join('');
}

async function patch(id, body, msg, undoBody) {
  try {
    await api(`/api/admin/bookings/${id}`, { method: 'PATCH', body });
    toast(msg, false, undoBody && (() => patch(id, undoBody, '已復原')));
    await refresh();
  } catch (e) { toast(e.message, true); }
}

$('#list').addEventListener('click', (e) => {
  const btn = e.target.closest('[data-act]');
  if (!btn) return;
  const b = S.bookings.find((x) => x.id === +btn.dataset.id);
  const act = btn.dataset.act;
  if (act === 'edit') return openDialog(b);
  if (act === 'cancelled' && !confirm(`取消 ${b.name} ${b.time} 的訂位？`)) return;
  patch(b.id, { status: act }, `${b.name}：${STATUS[act]}`, { status: b.status });
});

// --- timeline ---

function renderTimeline() {
  const el = $('#timeline');
  const dur = S.settings.dining_minutes;
  const day = S.bookings.filter((b) => b.date === S.day && b.status !== 'cancelled' && b.status !== 'no_show' && b.table_id);
  if (S.q) { el.innerHTML = '<div class="empty">搜尋中不顯示時間軸，清除搜尋即可</div>'; return; }
  const wins = Object.values(S.settings.schedule[String((weekday(S.day) + 6) % 7)]).filter(Boolean);
  const marks = [...wins.flatMap(([a, z]) => [toMin(a), toMin(z) + dur]), ...day.flatMap((b) => [toMin(b.time), toMin(b.time) + b.duration])];
  const start = Math.floor((marks.length ? Math.min(...marks) : 660) / 60) * 60;
  const end = Math.ceil((marks.length ? Math.max(...marks) : 1320) / 60) * 60;
  const span = end - start;
  const hours = span / 60;
  const pct = (m) => ((m - start) / span) * 100;
  el.style.setProperty('--hour', `${100 / hours}%`);

  const head = `<div class="tl-row tl-head"><div class="tl-name"></div><div class="tl-track">${Array.from({ length: hours }, (_, i) => `<span>${String(start / 60 + i).padStart(2, '0')}:00</span>`).join('')}</div></div>`;
  const rows = S.tables.map((t) => {
    const bars = day.filter((b) => b.table_id === t.id).map((b) => {
      const s = toMin(b.time);
      return `<button type="button" class="tl-bar s-${b.status}" data-id="${b.id}" style="left:${pct(s)}%;width:${(b.duration / span) * 100}%" title="${esc(`${b.time} ${b.name} ${b.party} 位・${STATUS[b.status]}`)}"><b>${esc(b.name)} ${b.party}位</b>${b.time}</button>`;
    }).join('');
    return `<div class="tl-row${t.active ? '' : ' off'}"><div class="tl-name">${esc(t.name)}<small>${t.seats} 人・${esc(t.area)}</small></div><div class="tl-track">${bars}</div></div>`;
  }).join('');
  const now = toMin(nowHM());
  const line = S.day === S.today && now >= start && now <= end ? `<div class="tl-now" style="left:calc(92px + (100% - 92px) * ${pct(now) / 100})"></div>` : '';
  el.innerHTML = head + rows + line;
}

$('#timeline').addEventListener('click', (e) => {
  const bar = e.target.closest('.tl-bar');
  if (bar) openDialog(S.bookings.find((b) => b.id === +bar.dataset.id));
});

// --- waitlist ---

function renderWaitlist() {
  $('#waitlist').innerHTML = S.waitlist.length ? S.waitlist.map((w) => `<article class="wl">
    <div class="t">${w.time}</div>
    <div class="who"><b>${esc(w.name)}</b><span class="pax">${w.party} 位</span>
      <div class="sub"><a href="tel:${esc(w.phone)}">${esc(w.phone)}</a><span>登記於 ${w.created_at.slice(5, 16).replace('T', ' ')}</span></div>
      ${w.notes ? `<div class="note">${esc(w.notes)}</div>` : ''}</div>
    <div class="acts"><button type="button" class="primary" data-convert="${w.id}">安排入座</button><button type="button" data-remove="${w.id}">移除</button></div>
  </article>`).join('') : `<div class="empty">${fmtDate(S.day)} 沒有候補</div>`;
}

$('#waitlist').addEventListener('click', async (e) => {
  const c = e.target.closest('[data-convert]');
  const r = e.target.closest('[data-remove]');
  try {
    if (c) { const b = await api(`/api/admin/waitlist/${c.dataset.convert}/convert`, { method: 'POST' }); toast(`已為 ${b.name} 安排 ${b.table_name}`); }
    else if (r && confirm('從候補名單移除？')) { await api(`/api/admin/waitlist/${r.dataset.remove}`, { method: 'DELETE' }); toast('已移除'); }
    else return;
    await refresh();
  } catch (err) { toast(err.message, true); }
});

// --- stats ---

async function loadStats() {
  const s = await api('/api/admin/stats');
  const max = Math.max(1, ...s.days.map((d) => d.covers));
  const total = Object.values(s.status).reduce((a, b) => a + b, 0);
  const live = total - (s.status.cancelled ?? 0);
  const kpi = (label, value, unit = '') => `<div class="kpi"><span>${label}</span><b>${value}</b><small>${unit}</small></div>`;
  const bars = (obj, labels, color) => {
    const sum = Object.values(obj).reduce((a, b) => a + b, 0) || 1;
    return Object.keys(labels).map((k) => `<div><span>${labels[k]}</span><span class="track"><i style="width:${((obj[k] ?? 0) / sum) * 100}%;${color ? `--c:var(--${k})` : ''}"></i></span><b>${obj[k] ?? 0}</b></div>`).join('');
  };
  $('#stats').innerHTML = `
    <div class="kpis">${kpi('近 30 天訂位', live, '組')}${kpi('平均每組', s.avg_party, '位')}${kpi('未到率', (s.no_show_rate * 100).toFixed(1), '%')}${kpi('取消率', total ? (((s.status.cancelled ?? 0) / total) * 100).toFixed(1) : 0, '%')}</div>
    <div class="chart-card">
      <h2>每日來客數</h2><p class="hint">過去兩週與未來一週，不含取消。未來的數字是目前已訂的人數。</p>
      <div class="chart" role="img" aria-label="每日來客數長條圖">${s.days.map((d) => `<div class="col${d.date === s.today ? ' today' : d.date > s.today ? ' future' : ''}" tabindex="0" style="--h:${(d.covers / max) * 100}%">
        <span class="tip">${fmtDate(d.date)}・${d.covers} 位・${d.bookings} 組</span><i style="height:${(d.covers / max) * 100}%"></i><small>${d.date === s.today ? '今天' : `${+d.date.slice(5, 7)}/${+d.date.slice(8)}`}</small></div>`).join('')}</div>
      <div class="legend"><span style="--k:var(--ink)">已發生</span><span style="--k:var(--shu)">今天</span><span style="--k:repeating-linear-gradient(135deg,var(--ink) 0 2px,#b9b3a6 2px 5px)">未來（已訂）</span></div>
      <details><summary>看表格</summary><table class="data-table"><thead><tr><th>日期</th><th>組數</th><th>來客</th></tr></thead><tbody>${s.days.map((d) => `<tr><td>${fmtDate(d.date)}</td><td>${d.bookings}</td><td>${d.covers}</td></tr>`).join('')}</tbody></table></details>
    </div>
    <div class="split">
      <div class="chart-card"><h2>訂位狀態</h2><p class="hint">近 30 天</p><div class="bars">${bars(s.status, STATUS, true)}</div></div>
      <div class="chart-card"><h2>訂位來源</h2><p class="hint">近 30 天，不含取消</p><div class="bars">${bars(s.source, SOURCE)}</div></div>
    </div>`;
}

// --- dialog ---

const dlg = $('#dlg');
const dform = $('#dlg-form');
let editingId = null;

function openDialog(b) {
  editingId = b?.id ?? null;
  dform.reset();
  dform.classList.toggle('is-new', !b);
  $('#dlg-title').textContent = b ? `編輯訂位 ${b.code}` : '新增訂位';
  $('#dlg-error').textContent = '';
  dform.table_id.innerHTML = '<option value="">自動安排</option>' + S.tables.map((t) => `<option value="${t.id}"${t.active ? '' : ' disabled'}>${esc(t.name)}・${t.seats} 人・${esc(t.area)}${t.active ? '' : '（停用）'}</option>`).join('');
  const v = b ?? { party: 2, date: S.day, time: nextSlot(S.day), source: 'phone' };
  for (const k of ['name', 'phone', 'email', 'party', 'date', 'time', 'status', 'source', 'area_pref', 'occasion', 'notes']) {
    if (dform[k] && v[k] != null) dform[k].value = v[k];
  }
  dform.table_id.value = b?.table_id ?? '';
  $('#dlg-meta').textContent = b ? `${SOURCE[b.source]}建立於 ${b.created_at.replace('T', ' ').slice(0, 16)}` : '';
  dlg.showModal();
}

$('#new-booking').addEventListener('click', () => openDialog(null));
$$('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));

dform.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = Object.fromEntries(new FormData(dform));
  const body = { name: f.name, phone: f.phone, email: f.email, party: +f.party, date: f.date, time: f.time, notes: f.notes, area_pref: f.area_pref || null, occasion: f.occasion || null };
  const original = S.bookings.find((b) => b.id === editingId);
  const tableId = f.table_id ? +f.table_id : null;
  try {
    if (editingId) {
      // only send the table when it changed; otherwise the server keeps or re-picks it
      if (tableId !== original.table_id) body.table_id = tableId;
      await api(`/api/admin/bookings/${editingId}`, { method: 'PATCH', body: { ...body, status: f.status } });
      toast('已更新');
    } else {
      const b = await api('/api/admin/bookings', { method: 'POST', body: { ...body, source: f.source, table_id: tableId } });
      toast(`已新增，安排在 ${b.table_name}`);
      if (b.date !== S.day) S.day = b.date;
    }
    dlg.close();
    await refresh();
  } catch (err) { $('#dlg-error').textContent = err.message; }
});

// --- settings ---

function renderSettings() {
  const s = S.settings;
  $('#sched').innerHTML = ['1', '2', '3', '4', '5', '6', '0'].map((k) => `<div class="sched-row" data-day="${k}"><b>週${WD[(+k + 1) % 7]}</b>${['lunch', 'dinner'].map((p) => {
    const w = s.schedule[k][p];
    return `<div class="svc" data-svc="${p}"><label><input type="checkbox"${w ? ' checked' : ''}>${p === 'lunch' ? '午餐' : '晚餐'}</label>
      <input type="time" step="900" value="${w?.[0] ?? (p === 'lunch' ? '11:30' : '17:30')}" aria-label="第一個入座"${w ? '' : ' disabled'}>–<input type="time" step="900" value="${w?.[1] ?? (p === 'lunch' ? '13:30' : '20:30')}" aria-label="最後入座"${w ? '' : ' disabled'}></div>`;
  }).join('')}</div>`).join('');
  renderClosed();
  const f = $('#settings-form');
  for (const k of ['slot_minutes', 'dining_minutes', 'booking_days', 'max_party', 'cutoff_minutes']) f[k].value = s[k];
}

function renderClosed() {
  const list = [...S.settings.closed_dates].sort();
  $('#closed').innerHTML = list.length ? list.map((d) => `<button type="button" data-date="${d}" aria-label="移除 ${d}">${fmtDate(d)}<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 4 8 8m0-8-8 8"/></svg></button>`).join('') : '<p class="hint">沒有特別公休日</p>';
}

$('#sched').addEventListener('change', (e) => {
  if (e.target.type === 'checkbox') $$('input[type=time]', e.target.closest('.svc')).forEach((i) => { i.disabled = !e.target.checked; });
});
$('#closed').addEventListener('click', (e) => {
  const d = e.target.closest('[data-date]')?.dataset.date;
  if (d) { S.settings.closed_dates = S.settings.closed_dates.filter((x) => x !== d); renderClosed(); }
});
$('#closed-btn').addEventListener('click', () => {
  const v = $('#closed-add').value;
  if (v && !S.settings.closed_dates.includes(v)) { S.settings.closed_dates.push(v); renderClosed(); }
  $('#closed-add').value = '';
});

$('#settings-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const schedule = Object.fromEntries($$('.sched-row').map((r) => [r.dataset.day, Object.fromEntries($$('.svc', r).map((svc) => {
    const [a, z] = $$('input[type=time]', svc).map((i) => i.value);
    return [svc.dataset.svc, $('input[type=checkbox]', svc).checked ? [a, z] : null];
  }))]));
  const body = { schedule, closed_dates: S.settings.closed_dates };
  for (const k of ['slot_minutes', 'dining_minutes', 'booking_days', 'max_party', 'cutoff_minutes']) body[k] = +f[k].value;
  $('#settings-error').textContent = '';
  try {
    S.settings = await api('/api/admin/settings', { method: 'PUT', body });
    toast('設定已儲存，訂位頁立即生效');
    renderTimeline();
  } catch (err) { $('#settings-error').textContent = err.message; }
});

function tableRow(t = { name: '', seats: 4, area: '大廳', active: true }) {
  return `<div class="trow" data-id="${t.id ?? ''}"><input name="name" value="${esc(t.name)}" maxlength="10" required aria-label="桌號"><input name="seats" type="number" min="1" max="20" value="${t.seats}" required aria-label="座位數"><select name="area" aria-label="區域">${AREAS.map((a) => `<option${a === t.area ? ' selected' : ''}>${a}</option>`).join('')}</select><input name="active" type="checkbox"${t.active ? ' checked' : ''} aria-label="啟用"></div>`;
}

function renderTables() { $('#tables').innerHTML = S.tables.map(tableRow).join(''); }
$('#add-table').addEventListener('click', () => { $('#tables').insertAdjacentHTML('beforeend', tableRow()); $('#tables .trow:last-child input').focus(); });

$('#tables-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const body = $$('.trow').map((r) => ({ id: r.dataset.id ? +r.dataset.id : null, name: $('[name=name]', r).value, seats: +$('[name=seats]', r).value, area: $('[name=area]', r).value, active: $('[name=active]', r).checked }));
  $('#tables-error').textContent = '';
  try {
    S.tables = await api('/api/admin/tables', { method: 'PUT', body });
    renderTables();
    renderTimeline();
    toast('桌位已儲存');
  } catch (err) { $('#tables-error').textContent = err.message; }
});

$('#reset').addEventListener('click', async () => {
  if (!confirm('確定要清除所有資料並重新產生 Demo 資料？')) return;
  await api('/api/admin/reset', { method: 'POST' });
  toast('Demo 資料已重置');
  showApp();
});

(async function init() {
  const info = await api('/api/info');
  S.today = S.day = info.today;
  if (info.demo_password) $('#demo-hint').innerHTML = `Demo 密碼：<code>${esc(info.demo_password)}</code>`;
  try {
    await api('/api/admin/me');
    showApp();
  } catch { /* showLogin already ran */ }
})();
