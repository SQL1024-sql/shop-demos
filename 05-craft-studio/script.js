const SHOP = '小磁鐵手作教室';
const STORE_KEY = 'magnet-studio-v1';
const DOW = ['日', '一', '二', '三', '四', '五', '六'];
const C = { red: '#e8442e', blue: '#2a52be', yellow: '#f6b81a', green: '#1f9d6b', ink: '#1d2b3a' };

// kid drawings, crayon style
const crayon = (d, c, w = 7) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const DRAWINGS = {
  house: (h = 250) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#fffdf8"/>
    <circle cx="160" cy="44" r="22" fill="${C.yellow}"/>${crayon('M160 10v-6M190 44h8M182 20l6-6M138 20l-6-6', C.yellow, 5)}
    ${crayon(`M40 ${h - 60}V120l50-44 50 44v${h - 180}z`, C.red)}${crayon(`M78 ${h - 60}v-44h26v44`, C.blue)}${crayon('M52 132h22v22H52z', C.blue, 5)}
    ${crayon(`M0 ${h - 58}c30-8 60 6 100 0s70-6 100 2`, C.green, 9)}</svg>`,
  cat: (h = 220) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#fffdf8"/>
    ${crayon('M60 90l-6-40 30 24h32l30-24-6 40c16 30 6 70-50 70s-46-40-30-70z', C.ink, 6)}
    <circle cx="82" cy="104" r="6" fill="${C.green}"/><circle cx="118" cy="104" r="6" fill="${C.green}"/>
    ${crayon('M94 122l6 6 6-6M60 120h-30M60 128H32M140 120h30M140 128h28', C.ink, 4)}
    ${crayon(`M150 150c30 0 34 ${h - 190} 10 ${h - 180}`, C.yellow, 8)}<circle cx="40" cy="40" r="10" fill="${C.red}"/></svg>`,
  monster: (h = 230) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#fffdf8"/>
    <path d="M50 ${h - 40}c-10-60 0-120 50-120s60 60 50 120z" fill="${C.green}"/>
    <circle cx="80" cy="${h - 120}" r="16" fill="#fff"/><circle cx="84" cy="${h - 118}" r="7" fill="${C.ink}"/><circle cx="122" cy="${h - 112}" r="11" fill="#fff"/><circle cx="124" cy="${h - 110}" r="5" fill="${C.ink}"/>
    ${crayon(`M78 ${h - 80}q22 16 44 0`, C.ink, 5)}${crayon(`M86 ${h - 78}v8M112 ${h - 78}v8`, '#fff', 5)}
    ${crayon(`M70 ${h - 158}l-10-24M130 ${h - 158}l12-22`, C.red, 6)}<circle cx="58" cy="${h - 186}" r="8" fill="${C.red}"/><circle cx="144" cy="${h - 184}" r="8" fill="${C.red}"/></svg>`,
  flower: (h = 260) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#fffdf8"/>
    ${crayon(`M100 110V${h - 20}`, C.green, 8)}${crayon(`M100 ${h - 80}c-30-10-40-30-40-40 20 0 34 14 40 30M100 ${h - 60}c30-10 40-30 40-40-20 0-34 14-40 30`, C.green, 6)}
    ${[0, 60, 120, 180, 240, 300].map((a) => `<ellipse cx="100" cy="66" rx="16" ry="30" fill="${C.red}" opacity=".9" transform="rotate(${a} 100 90)"/>`).join('')}
    <circle cx="100" cy="90" r="18" fill="${C.yellow}"/></svg>`,
  fish: (h = 180) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#fffdf8"/>
    <path d="M30 ${h / 2}c30-46 100-46 130 0-30 46-100 46-130 0z" fill="${C.blue}"/><path d="M156 ${h / 2}l34-26v52z" fill="${C.yellow}"/>
    <circle cx="62" cy="${h / 2 - 8}" r="7" fill="#fff"/><circle cx="62" cy="${h / 2 - 8}" r="3" fill="${C.ink}"/>
    ${crayon(`M90 ${h / 2 - 22}q10 22 0 44M112 ${h / 2 - 24}q10 24 0 48`, '#fff', 4)}${crayon('M20 30q6-6 0-12M40 22q6-6 0-12', C.blue, 4)}</svg>`,
  rocket: (h = 280) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#1d2b3a"/>
    ${Array.from({ length: 16 }, (_, i) => `<circle cx="${(i * 53) % 200}" cy="${(i * 97) % h}" r="${i % 3 ? 2 : 3}" fill="${C.yellow}"/>`).join('')}
    <path d="M100 40c30 30 34 90 24 130H76c-10-40-6-100 24-130z" fill="#fffdf8"/><circle cx="100" cy="100" r="14" fill="${C.blue}"/>
    <path d="M76 150l-24 34 26-6zM124 150l24 34-26-6z" fill="${C.red}"/><path d="M84 172c4 30 12 44 16 56 4-12 12-26 16-56z" fill="${C.yellow}"/></svg>`,
  family: (h = 200) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#fffdf8"/>
    ${[[50, C.red, 1], [100, C.blue, 1.15], [150, C.green, .8]].map(([x, c, s]) => `<circle cx="${x}" cy="${h - 120 * s}" r="${16 * s}" fill="none" stroke="${C.ink}" stroke-width="4"/>${crayon(`M${x} ${h - 104 * s}v${50 * s}M${x - 20 * s} ${h - 84 * s}h${40 * s}M${x} ${h - 54 * s}l-${16 * s} ${36 * s}M${x} ${h - 54 * s}l${16 * s} ${36 * s}`, c, 6)}`).join('')}
    ${crayon('M10 24q90-30 180 0', C.yellow, 8)}</svg>`,
  cup: (h = 210) => `<svg viewBox="0 0 200 ${h}" aria-hidden="true"><rect width="200" height="${h}" fill="#f3ece2"/>
    <path d="M54 ${h - 150}h92l-8 110a14 14 0 0 1-14 12H76a14 14 0 0 1-14-12z" fill="#c9875a"/><path d="M54 ${h - 150}h92l-2 26H56z" fill="${C.blue}" opacity=".85"/>
    ${crayon(`M146 ${h - 120}c30 0 30 50 -4 50`, '#c9875a', 10)}${crayon(`M80 ${h - 172}q6-14 0-24M104 ${h - 172}q6-14 0-24`, '#9aa6ad', 4)}</svg>`,
};

const WALL = [
  ['house', 250, '我家', '小芸 6 歲'], ['monster', 230, '黏土小怪獸', '阿哲 5 歲'], ['cup', 210, '第一個陶土杯', '林小姐'],
  ['flower', 260, '送媽媽的花', '米米 4 歲'], ['rocket', 280, '火箭要去月亮', '宥宥 7 歲'], ['cat', 220, '我們家的胖胖', '小晴 8 歲'],
  ['fish', 180, '拓印小魚', '親子班 豆豆'], ['family', 200, '全家去露營', '安安 6 歲'], ['monster', 190, '三眼怪', '小樂 5 歲'],
  ['flower', 220, '刺繡胸針草稿', '陳先生'], ['house', 210, '阿嬤家', '妞妞 7 歲'], ['fish', 160, '水彩金魚', '小宇 9 歲'],
];

// course dates relative to today
const today = new Date(); today.setHours(0, 0, 0, 0);
function nth(dow, n) {
  const d = new Date(today);
  d.setDate(d.getDate() + ((dow - d.getDay() + 7) % 7 || 7) + 7 * n);
  return d;
}
// course subjects: multiply color fills + crayon line, same idiom as the work wall
const thumb = (fills, lines) => `<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="320" height="180" fill="#fffdf8"/>
  <g style="mix-blend-mode:multiply" opacity=".92">${fills}</g>${lines}</svg>`;
const ART = {
  monster: thumb(`<path d="M100 170c-14-70 4-120 60-120s76 50 62 120z" fill="${C.green}"/><circle cx="220" cy="70" r="34" fill="${C.yellow}"/>`,
    `<circle cx="140" cy="100" r="13" fill="#fff"/><circle cx="143" cy="102" r="6" fill="${C.ink}"/><circle cx="182" cy="96" r="10" fill="#fff"/><circle cx="184" cy="98" r="5" fill="${C.ink}"/>${crayon('M138 132q22 16 46 0M128 56l-12-26M190 54l14-24', C.ink, 5)}<circle cx="114" cy="28" r="7" fill="${C.red}"/><circle cx="206" cy="28" r="7" fill="${C.red}"/>`),
  tee: thumb(`<circle cx="138" cy="96" r="18" fill="${C.green}"/><circle cx="178" cy="114" r="14" fill="${C.red}"/><circle cx="168" cy="80" r="11" fill="${C.blue}"/><path d="M120 120l10-8 10 8-4 12h-12z" fill="${C.yellow}"/>`,
    crayon('M110 30l-40 24 16 30 20-10v96h108V74l20 10 16-30-40-24c-6 14-24 22-50 22s-44-8-50-22z', C.ink, 5)),
  book: thumb(`<path d="M60 40c40-8 70 0 100 14v116c-30-14-60-22-100-14z" fill="${C.blue}"/><path d="M260 40c-40-8-70 0-100 14v116c30-14 60-22 100-14z" fill="${C.yellow}"/><circle cx="210" cy="96" r="22" fill="${C.red}"/>`,
    crayon('M60 40c40-8 70 0 100 14 30-14 60-22 100-14v116c-40-8-70 0-100 14-30-14-60-22-100-14zM160 54v116', C.ink, 5) + crayon('M80 80h56M80 100h48M80 120h56', '#fff', 4)),
  mug: thumb(`<path d="M104 46h104l-10 120h-84z" fill="#c9875a"/><path d="M104 46h104l-3 34H107z" fill="${C.blue}"/>`,
    crayon('M104 46h104l-10 120h-84zM208 70c40 0 40 60-6 60', C.ink, 5) + crayon('M140 34q8-14 0-26M168 34q8-14 0-26', '#9aa6ad', 4)),
  hoop: thumb(`<circle cx="160" cy="96" r="70" fill="#f3e6cf"/><circle cx="160" cy="92" r="16" fill="${C.yellow}"/>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="160" cy="62" rx="12" ry="20" fill="${C.red}" transform="rotate(${a} 160 92)"/>`).join('')}`,
    crayon('M160 22a70 70 0 1 1 0 140a70 70 0 1 1 0-140M150 18h20v-12h-20z', '#8a5a34', 6) + crayon('M160 118v40M160 140c-14-6-20-14-22-22', C.green, 4)),
  hanky: thumb(`<path d="M70 30h180v130H70z" fill="${C.yellow}"/><circle cx="120" cy="80" r="40" fill="#9a5ab0"/><circle cx="200" cy="120" r="34" fill="${C.green}"/><circle cx="210" cy="60" r="18" fill="#c9875a"/>`,
    crayon('M70 30h180v130H70zM250 160l-36 0 36-36', C.ink, 5)),
  party: thumb(`<path d="M100 110h120v56H100z" fill="${C.yellow}"/><path d="M100 110h120v18H100z" fill="${C.red}"/><circle cx="64" cy="58" r="28" fill="${C.blue}"/><circle cx="262" cy="50" r="24" fill="${C.green}"/>`,
    crayon('M100 110h120v56H100zM130 110V86M160 110V82M190 110V86M64 86c0 20 10 40 4 80M262 74c0 30-8 50 0 90', C.ink, 5) + `<g fill="${C.red}"><circle cx="130" cy="80" r="5"/><circle cx="160" cy="76" r="5"/><circle cx="190" cy="80" r="5"/></g>`),
  team: thumb(`<rect x="40" y="110" width="240" height="22" rx="4" fill="#c9875a"/>${[[90, C.red], [160, C.blue], [230, C.green]].map(([x, c]) => `<path d="M${x - 24} 110c0-30 10-44 24-44s24 14 24 44z" fill="${c}"/>`).join('')}`,
    [90, 160, 230].map((x) => `<circle cx="${x}" cy="48" r="16" fill="none" stroke="${C.ink}" stroke-width="5"/>`).join('') + crayon('M40 132v40M280 132v40', C.ink, 6)),
};

const COURSES = [
  { id: 'clay-monster', cat: 'parent', title: '黏土小怪獸', date: nth(6, 0), time: '10:00–12:00', price: 900, per: '組', cap: 8, left: 3, art: ART.monster, desc: '一大一小一組，捏一隻會站的怪獸帶回家。' },
  { id: 'print-tee', cat: 'parent', title: '蔬菜拓印 T 恤', date: nth(0, 0), time: '14:00–16:00', price: 1100, per: '組', cap: 8, left: 0, art: ART.tee, desc: '用秋葵、蓮藕當印章，含一件兒童 T 恤。' },
  { id: 'watercolor-book', cat: 'parent', title: '水彩繪本小書', date: nth(6, 1), time: '10:00–12:00', price: 850, per: '組', cap: 8, left: 6, art: ART.book, desc: '畫四頁自己的故事，裝訂成一本小書。' },
  { id: 'pottery-cup', cat: 'adult', title: '手捏陶土杯', date: nth(5, 0), time: '19:00–21:30', price: 1200, per: '人', cap: 6, left: 2, art: ART.mug, desc: '捏塑＋上釉，三週後窯燒完成可取件。' },
  { id: 'embroidery', cat: 'adult', title: '刺繡胸針', date: nth(3, 1), time: '19:00–21:00', price: 950, per: '人', cap: 6, left: 4, art: ART.hoop, desc: '從描圖到收邊，做一枚別在包包上的小花。' },
  { id: 'plant-dye', cat: 'adult', title: '植物染手帕', date: nth(0, 1), time: '10:00–12:30', price: 1000, per: '人', cap: 6, left: 0, art: ART.hanky, desc: '洋蔥皮、薑黃與蘇木，染出三條手帕。' },
  { id: 'party', cat: 'group', title: '生日派對包場', date: null, time: '依預約，3 小時', price: 6800, per: '場', cap: 1, left: 1, art: ART.party, desc: '10 位小朋友，老師帶一堂手作＋簡單佈置。' },
  { id: 'team', cat: 'group', title: '公司團體課', date: null, time: '依預約，平日晚上或週末', price: 900, per: '人', cap: 20, left: 20, art: ART.team, desc: '10–20 人，可選陶土、刺繡、拓印任一主題。' },
];
const CATS = { all: '全部', parent: '親子', adult: '成人', group: '團體包場' };
const CAT_CLASS = { parent: 'cat-parent', adult: 'cat-adult', group: 'cat-group' };

const $ = (s) => document.querySelector(s);
const money = (n) => 'NT$' + n.toLocaleString('zh-TW');
const dateText = (c) => (c.date ? `${c.date.getMonth() + 1}/${c.date.getDate()}（${DOW[c.date.getDay()]}）` : '日期另約');

const state = { filter: 'all', course: 'clay-monster', count: 1 };
try { Object.assign(state, JSON.parse(localStorage.getItem(STORE_KEY) || '{}')); } catch (e) { /* storage unavailable */ }
const save = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage unavailable */ } };
const open = COURSES.filter((c) => c.left > 0);
if (!open.some((c) => c.id === state.course)) state.course = open[0].id;

// hero
$('#heroA').insertAdjacentHTML('afterbegin', DRAWINGS.house(250));
$('#heroB').insertAdjacentHTML('afterbegin', DRAWINGS.monster(200));
$('#heroC').insertAdjacentHTML('afterbegin', DRAWINGS.fish(160));

// filters + courses
function renderFilters() {
  $('#filters').innerHTML = Object.entries(CATS).map(([k, v]) => {
    const n = k === 'all' ? COURSES.length : COURSES.filter((c) => c.cat === k).length;
    return `<button type="button" class="filter" data-f="${k}" aria-pressed="${state.filter === k}">${v}<span class="n">${n}</span></button>`;
  }).join('');
}
function seatsHTML(c) {
  if (c.cat === 'group') return `<span class="seats-text">${c.id === 'party' ? '每個週末一場，先約先排' : '可依人數調整'}</span>`;
  const dots = Array.from({ length: c.cap }, (_, i) => `<span class="seat ${i < c.cap - c.left ? 'taken' : ''}"></span>`).join('');
  return `<span class="seats" role="img" aria-label="共 ${c.cap} 位，剩 ${c.left} 位">${dots}<span class="seats-text ${c.left <= 2 ? 'low' : ''}">${c.left ? `剩 ${c.left} ${c.per}` : '額滿'}</span></span>`;
}
function renderCourses() {
  const list = COURSES.filter((c) => state.filter === 'all' || c.cat === state.filter);
  $('#courseList').innerHTML = list.map((c, i) => `<li class="course ${c.left ? '' : 'full'} ${i === 0 ? 'big' : c.cat === 'group' ? 'wide' : ''}" style="view-transition-name:c-${c.id}">
    <span class="magnet ${['m-red', 'm-blue', 'm-yellow', 'm-green'][i % 4]}" aria-hidden="true"></span>
    ${c.left ? '' : '<span class="full-stamp" aria-hidden="true">額滿</span>'}
    <span class="cat ${CAT_CLASS[c.cat]}">${CATS[c.cat]}</span>
    <div class="art-thumb">${c.art}</div>
    <h3>${c.title}</h3>
    <p>${c.desc}</p>
    <dl><dt>日期</dt><dd>${dateText(c)}</dd><dt>時間</dt><dd>${c.time}</dd><dt>費用</dt><dd>${money(c.price)} ${c.per === '場' ? '起／場' : `／${c.per}`}</dd><dt>名額</dt><dd>${seatsHTML(c)}</dd></dl>
    ${c.left ? `<button type="button" class="btn btn-red" data-enroll="${c.id}">報名這堂</button>` : '<button type="button" class="btn" disabled>已額滿・傳 LINE 排候補</button>'}
  </li>`).join('') || '<li class="empty-msg">這個分類目前沒有課程。</li>';
}
$('#filters').addEventListener('click', (e) => {
  const b = e.target.closest('.filter');
  if (!b) return;
  state.filter = b.dataset.f;
  save(); renderFilters();
  if (document.startViewTransition && !matchMedia('(prefers-reduced-motion: reduce)').matches) document.startViewTransition(renderCourses);
  else renderCourses();
});
document.addEventListener('click', (e) => {
  const b = e.target.closest('[data-enroll]');
  if (!b) return;
  state.course = b.dataset.enroll;
  state.count = 1;
  save(); renderForm();
  $('#signup').scrollIntoView();
  $('#sName').focus({ preventScroll: true });
});
$('#spaceAsk').addEventListener('click', () => { state.course = 'party'; state.count = 1; save(); renderForm(); });

// form
const course = () => COURSES.find((c) => c.id === state.course);
function renderForm() {
  $('#sCourse').innerHTML = Object.entries(CATS).filter(([k]) => k !== 'all').map(([k, v]) => `<optgroup label="${v}">${COURSES.filter((c) => c.cat === k).map((c) => `<option value="${c.id}" ${c.left ? '' : 'disabled'}>${c.title}・${dateText(c)}${c.left ? '' : '（額滿）'}</option>`).join('')}</optgroup>`).join('');
  $('#sCourse').value = state.course;
  const c = course();
  const max = c.cat === 'group' ? (c.id === 'party' ? 1 : 20) : c.left;
  const min = c.id === 'team' ? 10 : 1;
  state.count = Math.min(Math.max(state.count, min), max);
  $('#sCount').innerHTML = Array.from({ length: max - min + 1 }, (_, i) => `<option value="${i + min}">${i + min} ${c.per}</option>`).join('');
  $('#sCount').value = state.count;
  $('#seatHint').textContent = c.cat === 'group' ? '' : `（剩 ${c.left} ${c.per}）`;
  $('#sTotal').textContent = money(c.price * state.count) + (c.id === 'party' ? ' 起' : '');
}
$('#sCourse').addEventListener('change', (e) => { state.course = e.target.value; state.count = 1; save(); renderForm(); });
$('#sCount').addEventListener('change', (e) => { state.count = +e.target.value; save(); renderForm(); });

function setErr(input, errEl, msg) {
  input.setAttribute('aria-invalid', !!msg);
  $(errEl).textContent = msg;
  return !msg;
}
$('#sName').addEventListener('blur', (e) => setErr(e.target, '#eName', e.target.value.trim() ? '' : '請填聯絡人姓名'));
$('#sPhone').addEventListener('blur', (e) => setErr(e.target, '#ePhone', /^09\d{8}$/.test(e.target.value.replace(/[\s-]/g, '')) ? '' : '手機格式：09 開頭共 10 碼'));
$('#sEmail').addEventListener('blur', (e) => setErr(e.target, '#eEmail', !e.target.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.target.value) ? '' : 'Email 格式看起來不對'));

$('#signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const name = $('#sName');
  const phone = $('#sPhone');
  const email = $('#sEmail');
  const ok = [
    setErr(name, '#eName', name.value.trim() ? '' : '請填聯絡人姓名'),
    setErr(phone, '#ePhone', /^09\d{8}$/.test(phone.value.replace(/[\s-]/g, '')) ? '' : '手機格式：09 開頭共 10 碼'),
    setErr(email, '#eEmail', !email.value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value) ? '' : 'Email 格式看起來不對'),
  ];
  const firstBad = [name, phone, email][ok.indexOf(false)];
  if (firstBad) { firstBad.focus(); return; }
  const c = course();
  const lines = [
    `【${SHOP} 報名】`,
    `課程：${c.title}（${CATS[c.cat]}）`,
    `日期：${dateText(c)} ${c.time}`,
    `人數：${state.count} ${c.per}`,
    `費用：${money(c.price * state.count)}${c.id === 'party' ? ' 起' : ''}`,
    `聯絡人：${name.value.trim()}`,
    `手機：${phone.value.trim()}`,
  ];
  if (email.value) lines.push(`Email：${email.value.trim()}`);
  if ($('#sNote').value.trim()) lines.push(`備註：${$('#sNote').value.trim()}`);
  lines.push('', '麻煩老師確認名額並提供匯款資訊，謝謝！');
  const text = lines.join('\n');
  $('#confirmText').textContent = text;
  $('#lineBtn').href = 'https://line.me/R/msg/text/?' + encodeURIComponent(text);
  $('#copied').textContent = '';
  $('#signupForm').hidden = true;
  const box = $('#confirm');
  box.hidden = false;
  box.scrollIntoView({ block: 'start' });
  box.focus({ preventScroll: true });
});
$('#againBtn').addEventListener('click', () => {
  $('#confirm').hidden = true;
  $('#signupForm').hidden = false;
  $('#courses').scrollIntoView();
});
$('#copyBtn').addEventListener('click', async () => {
  const text = $('#confirmText').textContent;
  try { await navigator.clipboard.writeText(text); } catch (e) {
    const ta = Object.assign(document.createElement('textarea'), { value: text });
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  $('#copied').textContent = '已複製，可以貼到 LINE。';
});

// wall
$('#masonry').innerHTML = WALL.map(([k, h, t, who], i) => `<li>
  <span class="magnet ${['m-yellow', 'm-red', 'm-green', 'm-blue'][i % 4]}" aria-hidden="true"></span>
  <div role="img" aria-label="${who} 的作品：${t}（示意插畫）">${DRAWINGS[k](h)}</div>
  <p>${t}<small>${who}</small></p></li>`).join('');

$('#dockSeats').textContent = `本月剩 ${COURSES.filter((c) => c.cat !== 'group').reduce((s, c) => s + c.left, 0)} 個名額`;

// magnet tray menu (phones)
const trayBtn = $('#trayBtn');
const stack = $('#trayStack');
function setTray(open) {
  stack.hidden = !open;
  trayBtn.setAttribute('aria-expanded', open);
  trayBtn.setAttribute('aria-label', open ? '關閉選單' : '開啟選單');
  trayBtn.classList.toggle('open', open);
}
trayBtn.addEventListener('click', () => setTray(stack.hidden));
stack.addEventListener('click', (e) => { if (e.target.closest('a')) setTray(false); });
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !stack.hidden) { setTray(false); trayBtn.focus(); } });

renderFilters();
renderCourses();
renderForm();
