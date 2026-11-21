/* =====================================================================
   AI 윤리 탐험 — 클라이언트
   REMOTE: Apps Script 웹 앱(구글 로그인 + 스프레드시트)
   데모:   이 브라우저 저장소 + 샘플 계정 선택
   ===================================================================== */
const REMOTE = !!(window.__BOOT || (typeof google !== 'undefined' && google.script && google.script.run));
const VIDEO_ID = 'NxIEHHR-0zg';
const VIDEO_URL = 'https://www.youtube.com/watch?v=' + VIDEO_ID;
const LC = ['var(--l1)', 'var(--l2)', 'var(--l3)'];
const N = Core.N;
let clockOff = 0;
const nowS = () => Date.now() + clockOff;

function videoEmbed() {
  if (REMOTE) return `<div class="vframe" id="ytWrap"><div id="ytHost"></div></div><div class="vwatch" id="vwatch" aria-live="polite"></div>`;
  return `<a class="vthumb" href="${VIDEO_URL}" target="_blank" rel="noopener" data-a="video">
    <span class="src">YouTube · KBS 뉴스 부산 ‘아하! AI’</span><span class="play" aria-hidden="true"></span>
    <span class="vt">AI는 편견에서<br>자유로울 수 있을까?</span></a>`;
}

/* ---------------- 데모 백엔드 ---------------- */
const LOCAL_KEY = 'ai-ethics-v2-demo';
const DEMO_USERS = [
  { email: 'admin@sample-ms.kr', name: '정보부 관리자', role: '관리자', cls: '' },
  { email: 't11@sample-ms.kr', name: '1학년 1반 담임', role: '담임', cls: '1학년1반' },
  { email: 't12@sample-ms.kr', name: '1학년 2반 담임', role: '담임', cls: '1학년2반' }
];
function demoSeed() {
  const NAMES = [['김하늘','이준서','박서연','최도윤','정하은','강민재','조유나','윤시우','장예린','임건우','한지아','오태민'],
                 ['서다인','신우진','권나윤','황지호','안소율','송현우','류채원','전도현','홍수아','고은찬','문가온','배지환']];
  const SPECS = [['new','L2:3','Q3:4','done','done','L1:4','done','Q1:5','done','L3:6','new','done'],
                 ['done','done','Q2:2','L1:1','done','L2:6','done','new','Q3:1','done','L3:5','L1:3']];
  const LV = [['하','중','상','상','중','하','상','하','중','중','하','상'],['상','중','중','하','상','중','중','하','상','중','하','하']];
  const set = Core.normSettings({ chapterSec: 20, videoSec: 40 });
  const day = 86400000, base = Date.now();
  const students = [];
  NAMES.forEach((list, c) => list.forEach((name, i) => {
    const seed = i + 3 + c * 2, id = `1${String(c + 1).padStart(2, '0')}${String(i + 1).padStart(2, '0')}`;
    const s = Object.assign(Core.blankProgress(), { id, name, cls: `1학년${c + 1}반`, email: `s${id}@sample-ms.kr` });
    const spec = SPECS[c][i], level = LV[c][i];
    students.push(s);
    if (spec === 'new') return;
    const sc = { '상': 5 + (seed % 2), '중': 3 + (seed % 2), '하': seed % 3 }[level];
    s.pre = { done: true, score: sc, level };
    s.lastSeen = base - (seed % 5) * 3600000;
    const fin = (l, k) => Object.assign(l, { ch: N, done: true, tries: 3 + ((seed + k) % 5), qi: 3, wrong: [seed % 2, (seed + 1) % 3, seed % 2], hints: seed % 3, enteredAt: base - 2 * day });
    if (spec === 'done') { s.lessons.forEach(fin); s.done = true; s.stage = 'done'; s.doneAt = base - (1 + seed % 4) * day + (seed % 6) * 3600000; return; }
    const [, t, n, v] = spec.match(/^([LQ])(\d):(\d)$/).map((x, k) => k > 1 ? +x : x);
    for (let k = 0; k < n - 1; k++) fin(s.lessons[k], k);
    const L = s.lessons[n - 1];
    L.enteredAt = base - day;
    if (t === 'L') { L.ch = Math.max(v, Core.startOf(set, level)); s.stage = 'learn'; }
    else { L.ch = N; L.tries = v; L.qi = Math.min(2, Math.floor(v / 2)); L.wrong[L.qi] = Math.min(v - L.qi, 2); s.stage = 'quiz'; }
  }));
  return { students, users: DEMO_USERS.map(u => ({ ...u })), settings: set };
}
let LDB = null;
function localDb() {
  if (LDB) return LDB;
  try { const r = localStorage.getItem(LOCAL_KEY); if (r) LDB = JSON.parse(r); } catch (e) {}
  if (!LDB || !LDB.students) LDB = demoSeed();
  return LDB;
}
function saveLocal() { try { localStorage.setItem(LOCAL_KEY, JSON.stringify(LDB)); } catch (e) {} }
function localApi(type, args) {
  if (type === 'previewSheet') throw new Error('데모 화면에서는 구글 스프레드시트 주소로 불러올 수 없어요. 배포한 웹 앱에서 사용할 수 있어요. 지금은 아래 ‘붙여넣기’로 체험해 보세요.');
  const db = localDb();
  db.settings = Object.assign({}, db.settings, { videoWatch: 0 });   // 미리보기는 영상이 링크라 시청 확인을 하지 않음
  const r = Core.act(db, UI.demoEmail, Date.now(), type, JSON.parse(JSON.stringify(args || {})));
  if (Core.isWrite(type)) saveLocal();
  return JSON.parse(JSON.stringify(r.result));
}

/* ---------------- API 호출 ---------------- */
function rawApi(type, args) {
  if (!REMOTE) return new Promise((res, rej) => setTimeout(() => { try { res(localApi(type, args)); } catch (e) { rej(e); } }, 60));
  if (!(typeof google !== 'undefined' && google.script && google.script.run)) return Promise.reject(new Error('서버 연결 도구(google.script)를 불러오지 못했어요. 브라우저의 서드파티 쿠키 차단을 확인해 주세요.'));
  return new Promise((res, rej) => {
    const to = setTimeout(() => rej(new Error('서버가 30초 동안 응답하지 않아요. 잠시 뒤 새로고침해 주세요.')), 30000);
    google.script.run
      .withSuccessHandler(t => { clearTimeout(to); let r; try { r = JSON.parse(t); } catch (e) { return rej(new Error('서버 응답을 읽지 못했어요.')); } if (r.now) clockOff = r.now - Date.now(); r.ok ? res(r.data) : rej(new Error(r.error)); })
      .withFailureHandler(e => { clearTimeout(to); rej(new Error('서버 오류: ' + (e && e.message || '연결하지 못했어요.'))); })
      .api(type, JSON.stringify(args || {}));
  });
}
async function run(type, args, opt = {}) {
  if (UI.busy && !opt.force) return null;
  UI.busy = true; busyBar(true);
  try { return await rawApi(type, args); }
  catch (e) {
    const m = String(e.message || e);
    if (m === 'NOEMAIL') { UI.screen = 'noemail'; render(); return null; }
    if (m.startsWith('WAIT:')) { toast(`${m.slice(5)}초 뒤에 넘어갈 수 있어요`); return null; }
    if (UI.screen === 'boot') UI.bootErr = m;
    if (opt.onError) opt.onError(m); else toast(m, true);
    return null;
  } finally { UI.busy = false; busyBar(false); }
}
function busyBar(on) { const b = document.getElementById('busy'); if (b) b.hidden = !on; }

/* ---------------- 상태 ---------------- */
const UI = { screen: 'boot', me: null, set: Core.normSettings({}), st: null, modal: null, busy: false, demoEmail: null,
  pre: null, lesson: null, quiz: null, doneLi: null,
  t: { tab: 'list', cls: 'all', filter: 'all', sel: null, list: [], users: [], at: null, sheetUrl: '', imp: null, impResult: null } };
const me = () => UI.st;
const curLesson = s => Core.curLesson(s);
const startOf = s => Core.startOf(UI.set, s.pre.level);
function esc(t) { return String(t ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
const fmt = ms => Core.fmtKST(ms);
function stageText(s) { return Core.stageText(s); }
function contentText(s) {
  if (!s.pre.done) return '–';
  if (s.done) return '3차시 완료';
  const i = curLesson(s), l = s.lessons[i];
  return s.stage === 'quiz' ? `${i + 1}차시 퀴즈 ${Math.min(l.qi + 1, 3)}/3번` : `${i + 1}차시 ${Math.max(l.ch, startOf(s))}/${N}장`;
}
const totalTries = s => s.lessons.reduce((a, l) => a + l.tries, 0);
function stageChip(s) {
  if (s.done) return `<span class="chip ok"><span class="dot"></span>이수 완료</span>`;
  if (!s.pre.done) return `<span class="chip"><span class="dot"></span>미시작</span>`;
  if (s.stage === 'quiz') return `<span class="chip warn"><span class="dot"></span>${stageText(s)}</span>`;
  return `<span class="chip info"><span class="dot"></span>${stageText(s)}</span>`;
}
const mmss = sec => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
const secLabel = sec => sec >= 60 ? `${Math.floor(sec / 60)}분${sec % 60 ? ' ' + (sec % 60) + '초' : ''}` : `${sec}초`;

/* ---------------- 공통 조각 ---------------- */
const ICON = {
  play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
  pause: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4.5" width="4" height="15" rx="1"/><rect x="14" y="4.5" width="4" height="15" rx="1"/></svg>',
  prev: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  replay: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/></svg>',
  lock: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  clock: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  mark: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="9" r="5.5" stroke="#F2C04A" stroke-width="2.4"/><path d="M12 14.5V21" stroke="#F2C04A" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="9" r="1.8" fill="#F2C04A"/></svg>'
};
function topbar(right) {
  return `<div class="top"><div class="brand"><span class="brand-mark">${ICON.mark}</span>AI 윤리 탐험</div><span class="vtag">${REMOTE ? 'V2' : 'V2 · 데모'}</span><span class="spacer"></span>${right || ''}</div>`;
}
function avatarText(m) { return m.role === 'admin' ? '관리' : m.role === 'homeroom' ? '담임' : esc((m.name || '').slice(-2)); }
function whoBox() {
  const m = UI.me; if (!m) return '';
  const sub = m.role === 'student' ? `${m.cls} · ${m.id}` : m.role === 'homeroom' ? `담임 · ${m.cls}` : '관리자';
  return `<div class="who"><span class="avatar ${m.role !== 'student' ? 'staff' : ''}">${avatarText(m)}</span><div style="line-height:1.3"><b>${esc(m.name)}</b><br><span class="tiny muted">${esc(sub)}${REMOTE ? ' · ' + esc(m.email) : ''}</span></div>${REMOTE ? '' : `<button class="btn ghost sm" data-a="logout">로그아웃</button>`}</div>`;
}
function trailSVG(s) {
  const pins = [[90, 150], [300, 70], [510, 130]];
  const st = i => s ? (s.lessons[i].done ? 'done' : (s.pre.done && curLesson(s) === i ? 'now' : 'lock')) : 'now';
  const path = 'M40 175 C 120 175, 60 150, 90 150 S 220 70, 300 70 S 430 140, 510 130 S 570 90, 575 60';
  return `<svg class="trail" viewBox="0 0 600 210" role="img" aria-label="1차시에서 3차시로 이어지는 학습 길">
    <path d="${path}" style="fill:none;stroke:var(--line)" stroke-width="14" stroke-linecap="round"/>
    <path d="${path}" style="fill:none;stroke:var(--surface)" stroke-width="3" stroke-dasharray="2 10" stroke-linecap="round"/>
    ${pins.map((p, i) => { const x = st(i); const col = x === 'lock' ? 'var(--ink-3)' : LC[i];
      return `<g transform="translate(${p[0]},${p[1]})">
        ${x === 'now' ? `<circle r="24" style="fill:${col}" opacity=".18"><animate attributeName="r" values="18;28;18" dur="2.4s" repeatCount="indefinite"/></circle>` : ''}
        <path d="M0 0 C -16 -18 -18 -26 -18 -34 A18 18 0 1 1 18 -34 C 18 -26 16 -18 0 0z" style="fill:${col}"/>
        ${x === 'done' ? `<path d="M-7 -35 l5 5 9 -10" stroke="#fff" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` : `<text x="0" y="-28" text-anchor="middle" font-family="Do Hyeon, sans-serif" font-size="17" fill="#fff">${i + 1}</text>`}
        <text x="0" y="24" text-anchor="middle" font-size="13" font-weight="600" style="fill:var(--ink-2)" font-family="IBM Plex Sans KR, sans-serif">${i + 1}차시</text></g>`; }).join('')}
  </svg>`;
}

/* ---------------- 화면: 진입 ---------------- */
function vBoot() { return topbar('') + `<div class="center-note card pad"><p class="eyebrow">불러오는 중</p><h3>구글 계정을 확인하고 있어요…</h3></div>`; }
function vNoEmail() {
  return topbar('') + `<div class="center-note card pad stack"><p class="eyebrow">로그인 확인 필요</p><h3>구글 계정 정보를 받을 수 없어요</h3>
  <p class="muted">학교에서 받은 구글 계정(학교 도메인)으로 로그인한 뒤 다시 접속해 주세요. 개인 Gmail로 로그인되어 있으면 이 화면이 보여요.</p>
  <p class="small muted">관리자 안내: 웹 앱 배포 설정이 ‘실행 사용자: 나’, ‘액세스 권한: 학교 도메인 내 모든 사용자’인지 확인하세요.</p></div>`;
}
function vUnregistered() {
  return topbar('') + `<div class="center-note card pad stack"><p class="eyebrow">등록되지 않은 계정</p><h3>아직 학습 명단에 없는 계정이에요</h3>
  <p class="muted">로그인한 계정: <b class="mono">${esc(UI.me && UI.me.email)}</b></p>
  <p class="muted">담당 선생님께 이 이메일로 등록해 달라고 요청해 주세요. 다른 계정으로 로그인했다면 계정을 바꾼 뒤 다시 접속하세요.</p>
  <div>${REMOTE ? `<a class="btn ghost sm" href="${esc(switchUrl())}" target="_top">다른 계정으로 로그인</a>` : `<button class="btn ghost sm" data-a="logout">처음으로</button>`}</div></div>`;
}
function vLogin() {
  return topbar('') + `<section class="login">
    <div class="stack" style="gap:18px">
      <p class="eyebrow">중학생을 위한 3차시 자율 학습</p>
      <h1>체험 중심<br><em>인공지능 윤리</em> 탐험</h1>
      <p class="lead">사전 퀴즈로 나에게 맞는 시작 지점을 찾고, 내 속도로 3개의 핀을 따라가 보세요. 각 장을 정해진 시간 동안 학습하고 ‘학습 확인’을 통과하면 다음 장이 열려요.</p>
      <div class="rolebox"><button class="btn gbtn" data-a="openPicker"><span class="g" aria-hidden="true"></span>Google 계정으로 로그인</button>
      <p class="tiny muted">데모 화면이라 샘플 계정을 고릅니다. 배포한 웹 앱에서는 학교 구글 계정으로 들어온 뒤 본인 확인 화면이 먼저 나와요.</p></div>
    </div>
    <div class="trail-art">${trailSVG(null)}
      <div class="grid3" style="margin-top:4px">${LESSONS.map((L, i) => `<div><p class="small" style="font-weight:700;color:${LC[i]}">${i + 1}차시</p><p class="small">${L.title}</p></div>`).join('')}</div>
      <p class="tiny muted" style="margin-top:14px">이 교안은 과학기술정보통신부·정보통신정책연구원(KISDI)의 「인공지능 윤리 체험중심(중학교 교사용)」(2026)을 재구성하여 제작했어요. 비영리 교육 목적으로만 사용할 수 있어요.</p>
    </div></section>`;
}
const DEMO_STUDENTS = ['s10101@sample-ms.kr', 's10102@sample-ms.kr', 's10103@sample-ms.kr', 's10104@sample-ms.kr', 's10201@sample-ms.kr'];
function vPicker() {
  const db = localDb();
  const staff = db.users.map(u => `<button class="acct" data-a="demoLogin" data-email="${esc(u.email)}"><span class="avatar staff">${esc(u.role === '관리자' ? '관리' : '담임')}</span><span class="meta"><b>${esc(u.name)}</b><span>${esc(u.email)}</span></span><span class="chip ${u.role === '관리자' ? 'bad' : 'warn'}">${esc(u.role)}${u.cls ? ' ' + esc(u.cls) : ''}</span></button>`).join('');
  const studs = DEMO_STUDENTS.map(e => db.students.find(s => s.email === e)).filter(Boolean).map(s => `<button class="acct" data-a="demoLogin" data-email="${s.email}"><span class="avatar">${esc(s.name.slice(-2))}</span><span class="meta"><b>${esc(s.name)} <span class="tiny muted mono">${s.id}</span></b><span>${s.email}</span></span>${stageChip(s)}</button>`).join('');
  return `<div class="scrim" data-a="closeModal"><div class="modal" role="dialog" aria-label="계정 선택">
    <header><h3>계정 선택</h3><p class="small muted">데모 샘플 계정입니다. 역할에 따라 다른 화면이 열려요.</p></header>
    <div class="modal-body"><p class="eyebrow" style="padding:6px 22px">교사</p>${staff}<p class="eyebrow" style="padding:12px 22px 6px">학생</p>${studs}</div></div></div>`;
}

/* ---------------- 화면: 사전 퀴즈 ---------------- */
function vPre() {
  const P = UI.pre, q = PREQUIZ[P.i], sel = P.ans[P.i];
  return topbar(whoBox()) + `<div class="qwrap stack" style="gap:20px">
    <div class="stack" style="gap:8px"><p class="eyebrow">사전 퀴즈 · 수준 확인</p>
    <div class="row"><b class="mono">${P.i + 1} / ${PREQUIZ.length}</b><span class="spacer"></span><span class="small muted">정답은 끝난 뒤에 알려 줘요</span></div>
    <div class="progress"><i style="width:${P.i / PREQUIZ.length * 100}%"></i></div></div>
    <div class="card pad stack" style="gap:18px"><p class="qtext">${q.q}</p>
    <div class="opts">${q.o.map((o, k) => `<button class="opt ${sel === k ? 'sel' : ''}" data-a="preSel" data-k="${k}"><span class="k">${k + 1}</span><span>${o}</span></button>`).join('')}</div></div>
    <div class="row">${P.i > 0 ? `<button class="btn ghost" data-a="prePrev">이전</button>` : ''}<span class="spacer"></span><button class="btn" data-a="preNext" ${sel == null ? 'disabled' : ''}>${P.i === PREQUIZ.length - 1 ? '결과 보기' : '다음'}</button></div>
  </div>`;
}
function vPreResult() {
  const s = me(), lv = s.pre.level, st = startOf(s);
  const msg = { '상': 'AI 윤리의 핵심을 이미 잘 알고 있어요. 각 차시의 깊이 있는 장부터 시작합니다.', '중': '기본 개념은 알고 있어요. 각 차시의 중간 지점부터 시작합니다.', '하': '처음부터 차근차근 시작해요. 천천히 따라오면 충분해요.' }[lv];
  return topbar(whoBox()) + `<div class="qwrap stack" style="gap:18px">
    <div class="card pad row" style="gap:22px;align-items:center">
      <div class="level-badge lv-${lv}">${lv}</div>
      <div class="stack" style="gap:6px;flex:1;min-width:220px"><p class="eyebrow">사전 퀴즈 결과 · ${s.pre.score} / ${PREQUIZ.length}</p><h2>나의 수준은 ‘${lv}’</h2><p class="muted">${msg}</p></div>
    </div>
    <div class="card pad stack"><h3>차시별 시작 지점</h3>
      <div class="startmap">${LESSONS.map((L, i) => `<div class="cell"><b style="color:${LC[i]}">${i + 1}차시</b> <span class="small">${st}장부터</span>
      <div class="chbar">${Array.from({ length: N }, (_, k) => `<i class="${k + 1 >= st ? 'go' : ''}"></i>`).join('')}</div></div>`).join('')}</div>
      <p class="small muted">각 장은 최소 ${secLabel(UI.set.chapterSec)}(영상 장은 ${secLabel(UI.set.videoSec)}) 동안 학습하고 장마다 ‘학습 확인’을 통과해야 다음 장이 열려요.${st > 1 ? ' 건너뛴 장은 차시를 시작할 때 ‘핵심 요약’으로 먼저 보여 줘요.' : ''}</p>
    </div>
    <div class="row"><span class="spacer"></span><button class="btn go" data-a="toHub">학습 지도로 가기</button></div>
  </div>`;
}

/* ---------------- 화면: 학습 지도 ---------------- */
function vHub() {
  const s = me(), cur = curLesson(s), doneN = s.lessons.filter(l => l.done).length;
  return topbar(whoBox()) + `
  <div class="hubhead"><div class="stack" style="gap:6px;flex:1;min-width:260px">
    <p class="eyebrow">나의 학습 지도</p><h2>${s.done ? '탐험 완료! 이수를 축하해요' : `${cur + 1}차시 · ${LESSONS[cur].title}`}</h2>
    <p class="muted">수준 <b>${s.pre.level}</b> · 각 차시 ${startOf(s)}장부터 · ${doneN}/3 차시 완료</p></div>
    ${s.done ? `<button class="btn go" data-a="cert">이수 확인증 보기</button>` : `<button class="btn" data-a="continue">${s.stage === 'quiz' ? '퀴즈 이어서 풀기' : '학습 이어하기'}</button>`}
  </div>
  <div class="card" style="padding:10px 14px">${trailSVG(s)}</div>
  <div class="lessons">${LESSONS.map((L, i) => { const l = s.lessons[i]; const locked = !l.done && i !== cur;
    const status = l.done ? `<span class="chip ok">완료 · 퀴즈 ${l.tries}회 제출</span>` : i === cur ? `<span class="chip info">${s.stage === 'quiz' ? '퀴즈 중' : `${Math.max(l.ch, startOf(s))}/${N}장`}</span>` : `<span class="chip">잠김</span>`;
    return `<article class="card lcard ${locked ? 'locked' : ''}" style="--lc:${LC[i]}"><span class="stripe"></span>
      <span class="num">${i + 1}차시</span><h3>${L.title}</h3><p class="small muted">${L.sub}</p>${status}
      <div class="acts">${l.done ? `<button class="btn soft sm" data-a="review" data-i="${i}">자료 다시보기</button><button class="btn soft sm" data-a="quizReview" data-i="${i}">퀴즈 다시보기</button>` : i === cur ? `<button class="btn sm" data-a="continue">${s.stage === 'quiz' ? '퀴즈 풀기' : '학습하기'}</button>` : `<span class="tiny muted">앞 차시 퀴즈를 통과하면 열려요</span>`}</div>
    </article>`; }).join('')}</div>`;
}

/* ---------------- 화면: 학습 자료 (시간 제한) ---------------- */
function gate() {
  const V = UI.lesson; if (!V || V.mode !== 'learn' || V.idx < 0) return { gated: false };
  const L = me().lessons[V.li], frontier = L.ch - 1;
  if (V.idx !== frontier) return { gated: false };
  const total = Core.minSec(UI.set, V.li, V.idx);
  const rem = Core.remaining(UI.set, V.li, L, nowS());
  return { gated: true, rem, total };
}
const ckKey = (li, k) => li + '-' + k;
function checkPassed(li, k) { return !!(ACT.chk[ckKey(li, k)] || {}).ok; }
function vCheck(li, k, required) {
  const c = LESSONS[li].chapters[k].check; if (!c) return '';
  if (c.multi) return vCheckMulti(li, k, c, required);
  const st = ACT.chk[ckKey(li, k)] || {};
  const head = `<div class="row"><span class="ck-label">학습 확인</span>${st.ok ? '<span class="chip ok">통과</span>' : required ? '<span class="chip warn">통과해야 다음으로 넘어가요</span>' : '<span class="chip">선택</span>'}</div>`;
  let inner;
  if (c.task) {
    inner = `<p class="ck-q">${c.label}</p><div class="row"><span class="small muted">${c.prog()}</span><span class="spacer"></span>${st.ok ? '' : `<button class="btn sm" data-a="ckTask" data-li="${li}" data-k="${k}">활동 완료 확인</button>`}</div>
      ${st.ok ? `<div class="note good"><b>활동 완료!</b>${required ? '이제 다음으로 넘어갈 수 있어요.' : ''}</div>` : st.tried ? `<div class="note bad"><b>아직이에요</b>${c.no}</div>` : ''}`;
  } else {
    inner = `<p class="ck-q">${c.q}</p><div class="ck-opts">${c.o.map((o, i) => { const cls = st.sel === i ? (i === c.a ? 'right' : 'wrong') : (st.ok && i === c.a ? 'right' : '');
      return `<button class="opt ${cls}" data-a="ck" data-li="${li}" data-k="${k}" data-i="${i}" ${st.ok ? 'disabled' : ''}><span class="k">${i + 1}</span><span>${o}</span></button>`; }).join('')}</div>
      ${st.ok ? `<div class="note good"><b>맞아요!</b>${c.e}</div>` : st.sel != null ? `<div class="note bad"><b>다시 생각해 보세요</b>이 장의 내용을 한 번 더 읽고 다시 골라 보세요.</div>` : ''}`;
  }
  return `<div class="card checkcard ${st.ok ? 'done' : ''}" id="checkWrap">${head}${inner}</div>`;
}
const CK_WAIT = 30;
function shuffled(n) { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function multiState(li, k, c) {
  const key = ckKey(li, k);
  if (!ACT.chk[key]) ACT.chk[key] = { ok: false, items: c.items.map(it => ({ sel: null, ok: false, wrong: 0, until: 0, perm: shuffled(it.o.length) })) };
  return ACT.chk[key];
}
function vCheckMulti(li, k, c, required) {
  const st = multiState(li, k, c), done = st.items.filter(x => x.ok).length;
  const watchOk = !required || videoWatchOk(li);
  const head = `<div class="row"><span class="ck-label">학습 확인 · 영상 문제 ${c.items.length}개</span>${st.ok ? '<span class="chip ok">통과</span>' : required ? `<span class="chip warn">${done}/${c.items.length} 통과</span>` : '<span class="chip">선택</span>'}</div>`;
  if (!watchOk) return `<div class="card checkcard" id="checkWrap">${head}<p class="ck-q">영상을 ${UI.set.videoWatch}% 이상 보면 확인 문제가 열려요.</p><p class="small muted">앞으로 건너뛴 부분과 빠른 배속(1.25배 초과)으로 본 부분은 시청 시간에 들어가지 않아요.</p></div>`;
  const now = Date.now();
  const inner = c.items.map((it, qi) => {
    const s2 = st.items[qi], wait = Math.max(0, Math.ceil((s2.until - now) / 1000));
    const opts = s2.perm.map((oi, pos) => { const cls = s2.ok && oi === it.a ? 'right' : (s2.sel === oi && !s2.ok ? 'wrong' : '');
      return `<button class="opt ${cls}" data-a="ckm" data-li="${li}" data-k="${k}" data-q="${qi}" data-i="${oi}" ${s2.ok || wait > 0 ? 'disabled' : ''}><span class="k">${pos + 1}</span><span>${it.o[oi]}</span></button>`; }).join('');
    const fb = s2.ok ? `<div class="note good"><b>맞아요!</b>${it.e}</div>`
      : s2.sel != null ? `<div class="note bad"><b>다시 생각해 보세요</b>${wait > 0 ? `${wait}초 뒤에 다시 고를 수 있어요. ` : '이제 다시 고를 수 있어요. '}${s2.wrong >= 2 ? '영상의 해당 부분을 다시 보고 오세요.' : ''}</div>` : '';
    return `<div class="ck-item"><p class="ck-q">${qi + 1}. ${it.q}</p><div class="ck-opts">${opts}</div>${fb}</div>`;
  }).join('');
  return `<div class="card checkcard ${st.ok ? 'done' : ''}" id="checkWrap">${head}${inner}</div>`;
}

/* ---------- 영상 실제 시청 확인 (배포한 웹 앱 전용) ---------- */
const VW = { player: null, timer: null, covered: new Set(), dur: 0, last: null, pct: 0, sentPct: 0, unavailable: false, rateWarn: false };
function videoWatchOk(li) {
  if (!REMOTE) return true;
  const need = UI.set.videoWatch || 0; if (!need) return true;
  const L = me().lessons[li];
  return !!(L.watchSkip || VW.unavailable) || Math.max(L.watch || 0, VW.pct) >= need;
}
function loadYT() {
  return new Promise((res, rej) => {
    if (window.YT && window.YT.Player) return res();
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (prev) prev(); res(); };
    if (!document.getElementById('ytapi')) { const s = document.createElement('script'); s.id = 'ytapi'; s.src = 'https://www.youtube.com/iframe_api'; s.onerror = () => rej(new Error('load')); document.head.appendChild(s); }
    setTimeout(() => rej(new Error('timeout')), 15000);
  });
}
function canReport() { const V = UI.lesson, s = me(); return V && V.mode === 'learn' && !s.done && curLesson(s) === V.li; }
async function mountVideo() {
  destroyVideo();
  VW.covered = new Set(); VW.last = null; VW.pct = 0; VW.sentPct = 0; VW.dur = 0; VW.unavailable = false;
  updWatch();
  try { await loadYT(); } catch (e) { return videoUnavailable(); }
  if (!document.getElementById('ytHost')) return;
  VW.player = new YT.Player('ytHost', { videoId: VIDEO_ID, width: '100%', height: '100%',
    playerVars: { rel: 0, playsinline: 1, modestbranding: 1 },
    events: { onReady: () => { VW.dur = VW.player.getDuration() || 0; updWatch(); }, onError: () => videoUnavailable() } });
  VW.timer = setInterval(trackTick, 1000);
}
function destroyVideo() { if (VW.timer) { clearInterval(VW.timer); VW.timer = null; } VW.player = null; }
function trackTick() {
  const p = VW.player; if (!p || !p.getPlayerState) return;
  const before = videoWatchOk(1);
  if (!VW.dur) VW.dur = p.getDuration() || 0;
  const st = p.getPlayerState(), t = p.getCurrentTime ? p.getCurrentTime() : 0, rate = p.getPlaybackRate ? p.getPlaybackRate() : 1;
  if (st === 1) {                          // 재생 중
    VW.rateWarn = rate > 1.25;
    if (!VW.rateWarn && VW.last != null && t >= VW.last && t - VW.last <= 2.5) for (let s = Math.floor(VW.last); s < Math.floor(t); s++) VW.covered.add(s);
    VW.last = t;
  } else if (st !== 3) VW.last = null;      // 버퍼링이 아니면 다시 측정
  if (VW.dur > 0) VW.pct = Math.min(100, Math.round(VW.covered.size / Math.max(1, Math.floor(VW.dur) - 1) * 100));
  updWatch(); maybeSend();
  if (!before && videoWatchOk(1)) render();
}
function maybeSend() {
  if (!canReport()) return;
  const need = UI.set.videoWatch || 0;
  if (VW.pct >= VW.sentPct + 10 || (VW.pct >= need && VW.sentPct < need)) {
    VW.sentPct = VW.pct;
    rawApi('watch', { li: UI.lesson.li, pct: VW.pct }).then(d => { UI.st = d.student; }).catch(() => {});
  }
}
function updWatch() {
  const el = document.getElementById('vwatch'); if (!el) return;
  const need = UI.set.videoWatch || 0, L = me().lessons[1], best = Math.max(L.watch || 0, VW.pct);
  if (VW.unavailable || L.watchSkip) { el.innerHTML = `<div class="note hint"><b>영상이 이 화면에서 재생되지 않아요</b><a href="${VIDEO_URL}" target="_blank" rel="noopener">YouTube에서 보기 ↗</a> 후 학습 확인 문제를 풀어 주세요. 이 경우 시청 비율은 확인하지 않아요.</div>`; return; }
  if (!need) { el.innerHTML = ''; return; }
  el.innerHTML = `<div class="row" style="gap:10px;margin-top:10px"><span class="small"><b>시청 ${best}%</b> / 필요 ${need}%</span><span class="progress" style="flex:1;min-width:120px"><i style="width:${Math.min(100, best / need * 100)}%;background:${best >= need ? 'var(--mint)' : 'var(--l2)'}"></i></span>${best >= need ? '<span class="chip ok">시청 완료</span>' : ''}</div>${VW.rateWarn ? '<p class="small" style="color:var(--red);margin-top:6px">1.25배보다 빠르게 보면 시청 시간에 들어가지 않아요. 보통 속도로 봐 주세요.</p>' : ''}`;
}
function videoUnavailable() {
  VW.unavailable = true; destroyVideo(); updWatch();
  if (canReport()) rawApi('watch', { li: UI.lesson.li, unavailable: true }).then(d => { UI.st = d.student; render(); }).catch(() => render()); else render();
}
function vLesson() {
  const s = me(), V = UI.lesson, L = LESSONS[V.li], st = startOf(s), Ls = s.lessons[V.li];
  const review = V.mode === 'review', ch = V.idx, isSummary = ch === -1;
  const chap = isSummary ? null : L.chapters[ch];
  const skipped = !review && st > 1;
  const frontier = review ? N - 1 : Ls.ch - 1;
  const g = gate(), waiting = g.gated && g.rem > 0;
  const needCheck = g.gated && !review && !V.fromQuiz && !isSummary;
  const checkOk = isSummary || checkPassed(V.li, ch);
  const locked = waiting || (needCheck && !checkOk);
  const toc = `<nav class="card toc" style="--lc:${LC[V.li]}"><p class="eyebrow">${V.li + 1}차시 · ${review ? '다시보기' : '학습'}</p>
    <ol>${skipped ? `<li><button class="${isSummary ? 'cur' : ''}" data-a="go" data-i="-1"><span class="n">※</span>건너뛴 장 요약</button></li>` : ''}
    ${L.chapters.map((c, k) => { const locked = k > frontier;
      return `<li><button class="${k === ch ? 'cur' : ''} ${skipped && k + 1 < st ? 'skip' : ''} ${locked ? 'locked' : ''}" ${locked ? 'disabled' : ''} data-a="go" data-i="${k}"><span class="n">${locked ? ICON.lock : String(k + 1).padStart(2, '0')}</span>${c.title}</button></li>`; }).join('')}</ol></nav>`;
  const body = isSummary
    ? `<div class="card slide"><span class="kind">핵심 요약 · 1~${st - 1}장</span><h2>건너뛴 장, 이것만 알고 가요</h2>
      <p class="muted">사전 퀴즈 결과에 따라 ${st}장부터 시작해요. 아래 내용은 퀴즈에도 나오니 꼭 읽어 보세요.</p>
      <div class="stack">${L.chapters.slice(0, st - 1).map((c, k) => `<div class="summary-card"><span class="n">${String(k + 1).padStart(2, '0')}장 · ${c.kind}</span><b>${c.title}</b><span class="small">${c.sum}</span><span><button class="btn ghost sm" data-a="go" data-i="${k}">이 장 펼쳐 보기</button></span></div>`).join('')}</div></div>`
    : `<div class="card slide"><span class="kind">${String(ch + 1).padStart(2, '0')}장 · ${chap.kind}</span><h2>${chap.title}</h2>${chap.html()}</div>${vCheck(V.li, ch, needCheck)}`;
  const atEnd = ch === N - 1, fromQuiz = V.fromQuiz;
  const nextBtn = atEnd ? '' : `<button class="ibtn main" data-a="next" aria-label="다음 장" title="다음 장" ${locked ? 'disabled' : ''}>${ICON.next}</button>`;
  const quizBtn = atEnd && !review && !fromQuiz ? `<button class="btn go" data-a="startQuiz" ${locked ? 'disabled' : ''}>${V.li + 1}차시 퀴즈 풀기</button>` : '';
  return topbar(whoBox()) + `
  <div class="row" style="margin-bottom:14px"><button class="btn ghost sm" data-a="${fromQuiz ? 'backQuiz' : 'toHub'}">← ${fromQuiz ? '퀴즈로 돌아가기' : '학습 지도'}</button>
    <div style="min-width:0"><b style="color:${LC[V.li]}">${V.li + 1}차시</b> <span>${L.title}</span></div></div>
  ${ch === (skipped ? -1 : 0) && !review ? `<div class="banner" style="margin-bottom:12px"><b>학습 목표</b> · ${L.goal}</div>` : ''}
  <div class="viewer">${toc}<div class="stage" style="--lc:${LC[V.li]}">${body}
    <div class="card player">
      <button class="ibtn" data-a="prev" aria-label="이전 장" ${(skipped ? ch <= -1 : ch <= 0) ? 'disabled' : ''}>${ICON.prev}</button>
      <div class="bar" title="학습 시간"><i id="pbar"></i></div>
      <span class="timer ${waiting ? 'wait' : g.gated ? (locked ? 'need' : 'ok') : ''}" id="cd">${g.gated ? (waiting ? `${ICON.clock}<span>${mmss(g.rem)}</span>` : locked ? '학습 확인 필요' : '열림') : isSummary ? '요약' : `${ch + 1}/${N}`}</span>
      ${nextBtn}
      <button class="ibtn" data-a="replay" aria-label="처음부터 다시보기" title="처음부터 다시보기">${ICON.replay}</button>
      ${quizBtn}${atEnd && fromQuiz ? `<button class="btn go" data-a="backQuiz">퀴즈로 돌아가기</button>` : ''}
    </div>
    <p class="tiny muted" id="lessonHint" style="margin-top:8px">${needCheck ? `이 장을 최소 ${secLabel(g.total)} 동안 학습하고 ‘학습 확인’을 통과하면 ${atEnd ? '퀴즈가' : '다음 장이'} 열려요. 다음 장으로는 직접 눌러서 넘어가요.` : review ? '다시보기에서는 자유롭게 이동할 수 있어요.' : '이미 학습한 장이에요. 자유롭게 오갈 수 있어요.'}</p>
  </div></div>`;
}

/* ---------------- 화면: 퀴즈 ---------------- */
function vQuiz() {
  const s = me(), Q = UI.quiz, li = Q.li, L = LESSONS[li], l = s.lessons[li];
  if (Q.review) {
    return topbar(whoBox()) + `<div class="qwrap stack" style="gap:16px">
      <div class="row"><button class="btn ghost sm" data-a="toHub">← 학습 지도</button><span class="spacer"></span><span class="chip ok">${li + 1}차시 퀴즈 다시보기</span></div>
      <h2>${L.title}</h2>
      ${L.quiz.map((q, qi) => `<div class="card pad stack"><p class="eyebrow">문제 ${qi + 1}</p><p class="qtext" style="font-size:18px">${q.q}</p>
        <div class="opts">${q.o.map((o, k) => `<button class="opt ${k === q.a ? 'right' : ''}" disabled><span class="k">${k + 1}</span><span>${o}</span></button>`).join('')}</div>
        <div class="note exp"><b>해설</b>${q.e}</div></div>`).join('')}
    </div>`;
  }
  const solved = Q.fb === 'right';
  const qi = solved ? Q.solvedQi : l.qi, q = L.quiz[qi], wrong = l.wrong[qi] || 0, EA = UI.set.explainAfter;
  const showExp = wrong >= EA || solved;
  return topbar(whoBox()) + `<div class="qwrap stack" style="gap:18px">
    <div class="row"><b style="color:${LC[li]}">${li + 1}차시 퀴즈</b><span class="muted">${L.title}</span><span class="spacer"></span><button class="btn ghost sm" data-a="reviewFromQuiz">자료 다시보기</button></div>
    <div class="stack" style="gap:8px"><div class="row"><b class="mono">문제 ${qi + 1} / ${L.quiz.length}</b><span class="spacer"></span>
      <span class="tries" title="이 문제 오답 횟수">${Array.from({ length: EA }, (_, k) => `<i class="${k < wrong ? 'on' : ''}"></i>`).join('')}<span class="tiny muted" style="margin-left:4px">오답 ${wrong}회</span></span></div>
    <div class="progress"><i style="width:${(qi + (solved ? 1 : 0)) / L.quiz.length * 100}%;background:${LC[li]}"></i></div></div>
    <div class="card pad stack ${Q.shake ? 'shake' : ''}" style="gap:18px"><p class="qtext">${q.q}</p>
      <div class="opts">${q.o.map((o, k) => { let c = ''; if (solved && k === q.a) c = 'right'; else if (Q.fb === 'wrong' && Q.sel === k) c = 'wrong'; else if (Q.sel === k) c = 'sel';
        return `<button class="opt ${c}" data-a="qSel" data-k="${k}" ${solved ? 'disabled' : ''}><span class="k">${k + 1}</span><span>${o}</span></button>`; }).join('')}</div>
      ${Q.fb === 'wrong' ? `<div class="note bad" aria-live="polite"><b>아쉬워요, 다시 도전해 보세요</b>${wrong >= EA ? `오답이 ${EA}회 이상이라 아래에 해설을 열어 두었어요. 해설을 읽고 다시 골라 보세요.` : `힌트를 보거나 자료를 다시 보고 와도 좋아요. (해설은 오답 ${EA}회부터 열려요)`}</div>` : ''}
      ${solved ? `<div class="note good" aria-live="polite"><b>정답이에요!</b>${qi < L.quiz.length - 1 ? '다음 문제로 넘어가요.' : '이 차시의 퀴즈를 모두 통과했어요.'}</div>` : ''}
      ${Q.hint && !solved ? `<div class="note hint"><b>힌트</b>${q.h}</div>` : ''}
      ${showExp ? `<div class="note exp"><b>해설</b>${q.e}</div>` : ''}
    </div>
    <div class="row">${!solved && !Q.hint ? `<button class="btn ghost" data-a="hint">힌트 보기</button>` : ''}<span class="spacer"></span>
      ${solved ? `<button class="btn go" data-a="qNext">${qi < L.quiz.length - 1 ? '다음 문제' : (li < 2 ? `${li + 2}차시로 가기` : '이수 완료하기')}</button>` : `<button class="btn" data-a="qSubmit" ${Q.sel == null ? 'disabled' : ''}>제출하기</button>`}
    </div>
    <p class="tiny muted">규칙: 틀리면 몇 번이든 다시 도전할 수 있어요 · 힌트는 원할 때 열 수 있어요 · 같은 문제를 ${EA}회 이상 틀리면 해설이 열리고, 해설을 본 뒤에도 정답을 골라야 통과해요.</p>
  </div>`;
}
function vLessonDone() {
  const s = me(), li = UI.doneLi, L = LESSONS[li], l = s.lessons[li];
  return topbar(whoBox()) + `<div class="qwrap"><div class="card cert">
    <div class="seal" style="background:${LC[li]};box-shadow:0 0 0 10px var(--sunk)"><svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <p class="eyebrow">${li + 1}차시 통과</p><h2>${L.title}</h2>
    <p class="muted">퀴즈 제출 ${l.tries}회 · 힌트 ${l.hints}회 사용</p>
    <div class="row" style="justify-content:center"><button class="btn ghost" data-a="toHub">학습 지도</button><button class="btn go" data-a="continue">${li + 2}차시 시작하기</button></div>
  </div></div>`;
}
function vCert() {
  const s = me();
  return topbar(whoBox()) + `<div class="qwrap"><div class="card cert">
    <div class="seal"><svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <p class="eyebrow">이수 완료</p>
    <h1 style="font-size:clamp(30px,5vw,44px)">인공지능 윤리 탐험을 마쳤어요</h1>
    <p class="muted" style="max-width:30em">기술의 진보는 AI가 하지만, 그 기술이 향할 올바른 길을 선택하는 것은 결국 우리의 몫입니다.</p>
    <dl class="dl" style="text-align:left;margin:6px 0"><dt>이름</dt><dd>${esc(s.name)} (${s.id})</dd><dt>수준</dt><dd>${s.pre.level}</dd><dt>퀴즈 제출</dt><dd>${s.lessons.map((l, i) => `${i + 1}차시 ${l.tries}회`).join(' · ')}</dd><dt>이수 일시</dt><dd class="mono">${fmt(s.doneAt)}</dd></dl>
    <span class="chip ok">${REMOTE ? '구글 스프레드시트에 이수 기록 저장 완료' : '이수 기록 저장 완료 (데모: 브라우저 저장)'}</span>
    <div class="row" style="justify-content:center"><button class="btn ghost" data-a="toHub">학습 지도에서 다시보기</button>${REMOTE ? '' : '<button class="btn" data-a="logout">로그아웃</button>'}</div>
  </div></div>`;
}

/* ---------------- 화면: 교사(관리자·담임) ---------------- */
const isAdmin = () => UI.me && UI.me.role === 'admin';
function classesOf(list) { return [...new Set(list.map(s => s.cls))].sort((a, b) => a.localeCompare(b, 'ko', { numeric: true })); }
function scoped() { const T = UI.t; return T.list.filter(s => T.cls === 'all' || s.cls === T.cls); }
function vStaff() {
  const T = UI.t, admin = isAdmin();
  const tabsDef = admin ? [['list', '학생별 상태'], ['stats', '전체 통계'], ['manage', '학생 관리'], ['import', '일괄 등록'], ['perm', '권한·설정'], ['sheet', '스프레드시트']] : [['list', '학생별 상태'], ['stats', '전체 통계']];
  const tabs = `<div class="tabs" role="tablist">${tabsDef.map(([k, n]) => `<button role="tab" class="${T.tab === k ? 'on' : ''}" data-a="tab" data-k="${k}">${n}</button>`).join('')}</div>`;
  const cls = classesOf(T.list);
  const showCls = ['list', 'stats', 'manage', 'sheet'].includes(T.tab) && cls.length > 1;
  const ctrl = `<div class="row" style="margin:16px 0">${tabs}<span class="spacer"></span>
    ${showCls ? `<select id="clsSel" data-in="cls" style="width:auto" aria-label="학급 선택"><option value="all">${admin ? '전체 학급' : '담당 학급 전체'}</option>${cls.map(c => `<option value="${esc(c)}" ${T.cls === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select>` : ''}
    <button class="btn soft sm" data-a="refresh">조회 새로고침</button><span class="tiny muted mono">조회 ${T.at ? fmt(T.at).slice(11) : '-'}</span></div>`;
  const list = scoped();
  const body = { list: () => tList(list), stats: () => tStats(list), manage: () => tManage(list), import: tImport, perm: tPerm, sheet: () => tSheet(list) }[T.tab]();
  const title = admin ? 'AI 윤리 자율 학습 현황' : `${esc(Core.homeroomClasses(UI.me).join(', '))} 학습 현황`;
  return topbar(whoBox()) + `<div class="stack" style="gap:4px"><p class="eyebrow">${admin ? '관리자' : '담임'} 화면</p><h2>${title}</h2>
    <p class="small muted">${admin ? '전체 학생을 조회하고, 학생·권한·학습 시간을 관리해요.' : '담당 학급 학생만 조회할 수 있어요.'} 실시간으로 갱신되지 않으니 필요할 때 ‘조회 새로고침’을 눌러 주세요.</p></div>${ctrl}${body}`;
}
function tList(list) {
  const T = UI.t, f = T.filter;
  const rows = list.filter(s => f === 'all' || (f === 'done' ? s.done : !s.done));
  const sel = T.sel && T.list.find(s => s.id === T.sel);
  return `<div class="row" style="margin-bottom:10px">${[['all', '전체'], ['undone', '미이수'], ['done', '이수']].map(([k, n]) => `<button class="btn ${f === k ? '' : 'ghost'} sm" data-a="filter" data-k="${k}">${n} ${k === 'all' ? list.length : k === 'done' ? list.filter(s => s.done).length : list.filter(s => !s.done).length}</button>`).join('')}</div>
  <div class="split"><div class="card tablewrap" style="max-height:640px"><table><thead><tr><th>학번</th><th>이름</th><th>학급</th><th>수준</th><th>현재 단계</th><th>콘텐츠 위치</th><th>차시 진행</th><th>퀴즈 제출</th><th>최근 학습</th></tr></thead><tbody>
  ${rows.map(s => `<tr class="${T.sel === s.id ? 'sel' : ''}" data-a="selStudent" data-id="${esc(s.id)}"><td class="mono">${esc(s.id)}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.cls)}</td><td>${s.pre.level || '–'}</td><td>${stageChip(s)}</td><td>${contentText(s)}</td>
    <td><span class="lmini">${s.lessons.map((l, i) => `<i class="${l.done ? 'd' : (s.pre.done && !s.done && curLesson(s) === i ? 'p' : '')}" title="${i + 1}차시"></i>`).join('')}</span></td><td class="mono">${totalTries(s)}</td><td class="mono tiny">${s.lastSeen ? fmt(s.lastSeen).slice(5) : '–'}</td></tr>`).join('') || `<tr><td colspan="9" class="muted">학생이 없어요.</td></tr>`}
  </tbody></table></div>
  <aside class="card detail">${sel ? tDetail(sel) : `<p class="eyebrow">학생 상세</p><p class="muted small">표에서 학생을 누르면 차시별 장 위치, 퀴즈 제출 횟수, 완료 여부를 볼 수 있어요.</p>`}</aside></div>`;
}
function tDetail(s) {
  return `<div class="row"><span class="avatar">${esc(s.name.slice(-2))}</span><div style="line-height:1.3;min-width:0"><b>${esc(s.name)}</b><br><span class="tiny muted mono">${esc(s.id)} · ${esc(s.email)}</span></div></div>
  <dl class="dl"><dt>학급</dt><dd>${esc(s.cls)}</dd><dt>현재 단계</dt><dd>${stageText(s)}</dd><dt>콘텐츠 위치</dt><dd>${contentText(s)}</dd><dt>사전 퀴즈</dt><dd>${s.pre.done ? `${s.pre.score}/6점 · 수준 ${s.pre.level}` : '미응시'}</dd><dt>2차시 영상</dt><dd>${s.lessons[1].watchSkip ? '화면 재생 불가 · 시간으로 대체' : (s.lessons[1].watch || 0) + '% 시청'}</dd><dt>이수</dt><dd>${s.done ? `완료 · <span class="mono">${fmt(s.doneAt)}</span>` : '미이수'}</dd></dl>
  <div class="tablewrap"><table><thead><tr><th>차시</th><th>현재 장</th><th>퀴즈 제출</th><th>힌트</th><th>퀴즈 완료</th></tr></thead><tbody>
  ${s.lessons.map((l, i) => `<tr style="cursor:default"><td><b style="color:${LC[i]}">${i + 1}차시</b></td><td class="mono">${l.ch ? `${l.ch}/${N}` : '–'}</td><td class="mono">${l.tries}</td><td class="mono">${l.hints}</td><td>${l.done ? '<span class="chip ok">완료</span>' : '<span class="chip">미완료</span>'}</td></tr>`).join('')}
  </tbody></table></div>
  ${isAdmin() ? `<div class="row"><button class="btn soft sm" data-a="editStudent" data-id="${esc(s.id)}">정보 수정</button><button class="btn ghost sm" data-a="askResetStudent" data-id="${esc(s.id)}">기록 초기화</button><button class="btn ghost sm danger" data-a="askDeleteStudent" data-id="${esc(s.id)}">삭제</button></div>` : ''}`;
}
function tStats(list) {
  const done = list.filter(s => s.done), und = list.filter(s => !s.done);
  const rate = list.length ? Math.round(done.length / list.length * 100) : 0;
  const buckets = [['사전 퀴즈 전', s => !s.pre.done, 'var(--ink-3)']];
  [0, 1, 2].forEach(i => buckets.push([`${i + 1}차시 진행 중`, s => s.pre.done && !s.done && curLesson(s) === i, LC[i]]));
  buckets.push(['이수 완료', s => s.done, 'var(--mint)']);
  const max = Math.max(1, ...buckets.map(b => list.filter(b[1]).length));
  const lv = ['상', '중', '하'].map(k => [k, list.filter(s => s.pre.level === k).length]);
  const cls = classesOf(list);
  return `<div class="kpis">
    <div class="card kpi"><div class="l">전체 인원</div><div class="v mono">${list.length}</div></div>
    <div class="card kpi"><div class="l">이수 인원</div><div class="v mono" style="color:var(--mint)">${done.length}</div></div>
    <div class="card kpi"><div class="l">미이수 인원</div><div class="v mono" style="color:var(--red)">${und.length}</div></div>
    <div class="card kpi"><div class="l">이수율</div><div class="v mono">${rate}<span style="font-size:22px">%</span></div></div>
  </div>
  <div class="split" style="margin-top:14px">
    <div class="card pad stack"><div class="row"><h3>미이수 명단</h3><span class="chip bad">${und.length}명</span><span class="spacer"></span><button class="btn soft sm" data-a="copyUndone">명단 복사</button></div>
      <div class="tablewrap"><table><thead><tr><th>학번</th><th>이름</th><th>학급</th><th>현재 단계</th><th>콘텐츠 위치</th></tr></thead><tbody>
      ${und.map(s => `<tr data-a="jump" data-id="${esc(s.id)}"><td class="mono">${esc(s.id)}</td><td><b>${esc(s.name)}</b></td><td>${esc(s.cls)}</td><td>${stageChip(s)}</td><td>${contentText(s)}</td></tr>`).join('') || '<tr><td colspan="5" class="muted">미이수 학생이 없어요.</td></tr>'}
      </tbody></table></div></div>
    <div class="stack">
      ${cls.length > 1 ? `<div class="card pad stack"><h3>학급별 이수율</h3><div class="dist">${cls.map(c => { const a = list.filter(s => s.cls === c), d = a.filter(s => s.done).length; const p = Math.round(d / a.length * 100); return `<div class="r"><span>${esc(c)}</span><span class="track"><i style="width:${p}%;background:var(--mint)"></i></span><b class="mono">${p}%</b></div>`; }).join('')}</div></div>` : ''}
      <div class="card pad stack"><h3>단계별 인원</h3><div class="dist">${buckets.map(b => { const n = list.filter(b[1]).length; return `<div class="r"><span>${b[0]}</span><span class="track"><i style="width:${n / max * 100}%;background:${b[2]}"></i></span><b class="mono">${n}</b></div>`; }).join('')}</div></div>
      <div class="card pad stack"><h3>사전 퀴즈 수준</h3><div class="dist">${lv.map(([k, n], i) => `<div class="r"><span>수준 ${k} (${Core.startOf(UI.set, k)}장~)</span><span class="track"><i style="width:${n / max * 100}%;background:${LC[i]}"></i></span><b class="mono">${n}</b></div>`).join('')}</div></div>
    </div>
  </div>`;
}
function tManage(list) {
  return `<div class="row" style="margin-bottom:10px"><span class="small muted">${list.length}명</span><span class="spacer"></span><button class="btn sm" data-a="addStudent">+ 학생 추가</button></div>
  <div class="card tablewrap" style="max-height:640px"><table><thead><tr><th>학번</th><th>이름</th><th>구글 계정(이메일)</th><th>학급</th><th>현재 단계</th><th></th></tr></thead><tbody>
  ${list.map(s => `<tr style="cursor:default"><td class="mono">${esc(s.id)}</td><td><b>${esc(s.name)}</b></td><td class="mono tiny">${esc(s.email)}</td><td>${esc(s.cls)}</td><td>${stageChip(s)}</td>
    <td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn soft sm" data-a="editStudent" data-id="${esc(s.id)}">수정</button><button class="btn ghost sm" data-a="askResetStudent" data-id="${esc(s.id)}">기록 초기화</button><button class="btn ghost sm danger" data-a="askDeleteStudent" data-id="${esc(s.id)}">삭제</button></div></td></tr>`).join('') || `<tr><td colspan="6" class="muted">등록된 학생이 없어요. ‘일괄 등록’에서 한 번에 등록할 수 있어요.</td></tr>`}
  </tbody></table></div>`;
}
function tImport() {
  const T = UI.t, imp = T.imp;
  let preview = '';
  if (imp) {
    const ids = {}, emails = {};
    const rows = imp.rows.map(r => {
      const v = Core.validateIdentity(r); const errs = v.errors.slice();
      if (ids[v.value.id]) errs.push('파일 안에서 학번 중복'); if (emails[v.value.email]) errs.push('파일 안에서 이메일 중복');
      ids[v.value.id] = 1; emails[v.value.email] = 1;
      const ex = T.list.find(s => s.id === v.value.id);
      const other = T.list.find(s => s.email === v.value.email && s.id !== v.value.id);
      if (other) errs.push(`이메일이 ${other.id}와 겹침`);
      return { ...v.value, _line: r._line, errs, status: errs.length ? '오류' : ex ? '갱신' : '신규' };
    });
    const ok = rows.filter(r => !r.errs.length);
    T.impRows = ok;
    const c = k => rows.filter(r => r.status === k).length;
    preview = `<div class="card pad stack"><div class="row"><h3>미리보기</h3><span class="chip info">신규 ${c('신규')}</span><span class="chip warn">갱신 ${c('갱신')}</span><span class="chip bad">오류 ${c('오류')}</span><span class="spacer"></span><button class="btn ghost sm" data-a="clearImport">지우기</button><button class="btn go sm" data-a="doImport" ${ok.length ? '' : 'disabled'}>${ok.length}명 등록하기</button></div>
      ${imp.errors.length ? `<div class="note bad"><b>읽기 오류</b>${imp.errors.map(esc).join('<br>')}</div>` : ''}
      <p class="small muted">학번이 이미 있으면 이름·이메일·학급만 바꾸고 학습 기록은 그대로 둬요. 오류 행은 등록하지 않아요.</p>
      <div class="tablewrap" style="max-height:420px"><table><thead><tr><th>행</th><th>상태</th><th>학번</th><th>이름</th><th>이메일</th><th>학급</th><th>확인할 점</th></tr></thead><tbody>
      ${rows.map(r => `<tr style="cursor:default"><td class="mono tiny">${r._line}</td><td><span class="chip ${r.status === '오류' ? 'bad' : r.status === '갱신' ? 'warn' : 'info'}">${r.status}</span></td><td class="mono">${esc(r.id)}</td><td>${esc(r.name)}</td><td class="mono tiny">${esc(r.email)}</td><td>${esc(r.cls)}</td><td class="small" style="color:var(--red);white-space:normal">${r.errs.map(esc).join(', ')}</td></tr>`).join('')}
      </tbody></table></div></div>`;
  }
  const res = T.impResult ? `<div class="note good"><b>등록 결과</b>신규 ${T.impResult.added}명 · 갱신 ${T.impResult.updated}명${T.impResult.errors.length ? ` · 제외 ${T.impResult.errors.length}건<br><span class="small">${T.impResult.errors.map(esc).join('<br>')}</span>` : ''}</div>` : '';
  return `<div class="stack" style="gap:14px">${res}
  <div class="grid2" style="align-items:start">
    <div class="card pad stack"><p class="eyebrow">방법 1</p><h3>구글 스프레드시트에서 불러오기</h3>
      <p class="small muted">학생 명단이 있는 스프레드시트 주소를 넣으세요. 관리자(웹 앱 소유자)가 열람할 수 있는 파일이어야 해요.</p>
      <label class="fld" for="impUrl"><span>스프레드시트 주소</span><input type="text" id="impUrl" placeholder="https://docs.google.com/spreadsheets/d/…" value="${esc(T.impUrl || '')}"></label>
      <label class="fld" for="impTab"><span>탭 이름 (비우면 첫 번째 탭)</span><input type="text" id="impTab" placeholder="예: 1학년 명단" value="${esc(T.impTab || '')}"></label>
      <div class="row"><button class="btn sm" data-a="previewUrl">불러오기</button><button class="btn ghost sm" data-a="previewOwn">앱 시트의 ‘등록양식’ 탭 불러오기</button></div>
      ${REMOTE ? '' : `<p class="tiny muted">데모 화면에서는 이 방법이 동작하지 않아요. 배포한 웹 앱에서 사용하세요.</p>`}
    </div>
    <div class="card pad stack"><p class="eyebrow">방법 2</p><h3>복사해서 붙여넣기</h3>
      <p class="small muted">스프레드시트에서 머리글을 포함해 범위를 복사(Ctrl+C)한 뒤 아래에 붙여넣으세요.</p>
      <textarea id="impPaste" placeholder="학번&#9;이름&#9;이메일&#9;학급">${esc(T.impPaste || '')}</textarea>
      <div class="row"><button class="btn sm" data-a="previewPaste">미리보기</button><button class="btn ghost sm" data-a="sampleImport">예시 넣어 보기</button></div>
    </div>
  </div>
  <div class="banner"><b>명단 양식</b> · 머리글: <span class="mono">학번 | 이름 | 이메일 | 학급</span> (학급은 <span class="mono">1학년3반</span> 형식 — <span class="mono">1-3</span>, <span class="mono">1학년 3반</span>으로 써도 같은 값으로 읽어요). ‘학년’과 ‘반’이 따로 있어도 읽을 수 있어요. 이메일은 학생이 로그인할 학교 구글 계정이에요.</div>
  ${preview}</div>`;
}
function tPerm() {
  const T = UI.t, set = UI.set;
  const fields = Object.keys(Core.SETTING_INFO);
  return `<div class="grid2" style="align-items:start">
    <div class="card pad stack"><div class="row"><h3>교사 권한</h3><span class="spacer"></span><button class="btn sm" data-a="addUser">+ 권한 추가</button></div>
      <p class="small muted">관리자는 전체 학생 조회와 모든 관리를, 담임은 담당 학급 조회만 할 수 있어요.</p>
      <div class="tablewrap"><table><thead><tr><th>역할</th><th>이름</th><th>이메일</th><th>담당 학급</th><th></th></tr></thead><tbody>
      ${T.users.map(u => `<tr style="cursor:default"><td><span class="chip ${u.role === '관리자' ? 'bad' : 'warn'}">${esc(u.role)}</span></td><td>${esc(u.name)}</td><td class="mono tiny">${esc(u.email)}</td><td>${esc(u.cls || '–')}</td>
        <td><div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn soft sm" data-a="editUser" data-email="${esc(u.email)}">수정</button>${u.email === UI.me.email ? '' : `<button class="btn ghost sm danger" data-a="askDeleteUser" data-email="${esc(u.email)}">삭제</button>`}</div></td></tr>`).join('')}
      </tbody></table></div></div>
    <div class="card pad stack"><h3>학습 시간 · 규칙 설정</h3>
      <p class="small muted">학생은 각 장에서 아래 시간이 지나야 다음 장(마지막 장은 퀴즈)으로 넘어갈 수 있어요. 시간은 서버 기준으로 확인해 새로고침으로 건너뛸 수 없어요.</p>
      <div class="setgrid">${fields.map(k => `<label class="fld" for="set_${k}"><span>${Core.SETTING_INFO[k][0]}</span><input type="number" id="set_${k}" min="${Core.SETTING_INFO[k][1]}" max="${Core.SETTING_INFO[k][2]}" value="${set[k]}"></label>`).join('')}</div>
      <div class="row"><span class="tiny muted">한 차시 최소 시간(하 수준 기준): 약 ${Math.ceil((set.chapterSec * 6 + set.videoSec) / 60)}분</span><span class="spacer"></span><button class="btn sm" data-a="saveSettings">설정 저장</button></div>
    </div></div>`;
}
function tSheet(list) {
  const cols = Core.STUDENT_HEADERS.slice(0, 20);
  return `<div class="banner" style="margin-bottom:12px">‘학생’ 시트와 같은 학생 1행 구조예요. ${REMOTE ? '' : '데모에서는 브라우저에 저장돼요.'}</div>
  <div class="row" style="margin-bottom:10px"><span class="small muted">${list.length}행 × ${cols.length}열</span><span class="spacer"></span>${REMOTE && UI.t.sheetUrl ? `<a class="btn sm" href="${esc(UI.t.sheetUrl)}" target="_blank" rel="noopener">스프레드시트 열기 ↗</a>` : ''}<button class="btn soft sm" data-a="copySheet">복사 (TSV)</button></div>
  <div class="card tablewrap" style="max-height:600px"><table class="sheet"><thead><tr><th></th>${cols.map((c, i) => `<th>${String.fromCharCode(65 + i)}<br>${c}</th>`).join('')}</tr></thead><tbody>
  ${list.map((s, r) => `<tr><th>${r + 2}</th>${Core.toRow(s).slice(0, 20).map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div>
  ${REMOTE ? '' : `<div class="row" style="margin-top:14px"><span class="spacer"></span><button class="btn ghost sm" data-a="askDemoReset">데모 데이터 초기화</button></div>`}`;
}

/* ---------------- 모달 ---------------- */
function vModal() {
  const M = UI.modal; if (!M) return '';
  if (M === 'picker') return vPicker();
  const wrap = (inner, label) => `<div class="scrim" data-a="closeModal"><div class="modal" role="dialog" aria-label="${esc(label || '')}"><header class="stack">${inner}</header></div></div>`;
  if (M.kind === 'confirm') return wrap(`<h3>${M.title}</h3><p class="small muted">${M.body}</p>
    <div class="row"><span class="spacer"></span><button class="btn ghost sm" data-a="closeModal">취소</button><button class="btn sm ${M.danger ? 'bg-danger' : ''}" data-a="confirmOk">${M.ok}</button></div>`, M.title);
  if (M.kind === 'copy') return wrap(`<h3>아래 내용을 복사하세요</h3><p class="small muted">자동 복사가 막혀 있어요. 전체 선택 후 복사(Ctrl+C)하세요.</p><textarea id="copyBox" readonly style="min-height:180px;font-family:var(--mono);font-size:12px">${esc(M.text)}</textarea><div class="row"><span class="spacer"></span><button class="btn sm" data-a="closeModal">닫기</button></div>`);
  if (M.kind === 'student') { const v = M.vals;
    return wrap(`<h3>${M.orig ? '학생 정보 수정' : '학생 추가'}</h3>
      ${['id:학번', 'name:이름', 'email:구글 계정(이메일)', 'cls:학급 (예: 1학년3반)'].map(x => { const [k, l] = x.split(':'); return `<label class="fld" for="f_${k}"><span>${l}</span><input type="text" id="f_${k}" value="${esc(v[k] || '')}"></label>`; }).join('')}
      ${M.orig ? '<p class="tiny muted">학습 기록은 그대로 유지돼요.</p>' : ''}
      ${M.err ? `<div class="note bad"><b>저장하지 못했어요</b>${esc(M.err)}</div>` : ''}
      <div class="row"><span class="spacer"></span><button class="btn ghost sm" data-a="closeModal">취소</button><button class="btn sm" data-a="saveStudent">저장</button></div>`, '학생 정보'); }
  if (M.kind === 'user') { const v = M.vals;
    return wrap(`<h3>${M.orig ? '권한 수정' : '권한 추가'}</h3>
      <label class="fld" for="u_email"><span>구글 계정(이메일)</span><input type="text" id="u_email" value="${esc(v.email || '')}"></label>
      <label class="fld" for="u_name"><span>이름</span><input type="text" id="u_name" value="${esc(v.name || '')}"></label>
      <label class="fld" for="u_role"><span>역할</span><select id="u_role" data-in="urole"><option ${v.role === '담임' ? 'selected' : ''}>담임</option><option ${v.role === '관리자' ? 'selected' : ''}>관리자</option></select></label>
      <label class="fld" for="u_cls" ${v.role === '관리자' ? 'hidden' : ''} id="u_cls_wrap"><span>담당 학급 (여러 반은 쉼표로: 1학년1반, 1학년2반)</span><input type="text" id="u_cls" value="${esc(v.cls || '')}"></label>
      ${M.err ? `<div class="note bad"><b>저장하지 못했어요</b>${esc(M.err)}</div>` : ''}
      <div class="row"><span class="spacer"></span><button class="btn ghost sm" data-a="closeModal">취소</button><button class="btn sm" data-a="saveUser">저장</button></div>`, '권한'); }
  return '';
}

/* ---------------- 렌더 ---------------- */
let ticker = null;
let lastLessonKey = null;
function render() {
  stopTicker();
  const v = { boot: vBoot, noemail: vNoEmail, unregistered: vUnregistered, login: vLogin, pre: vPre, preResult: vPreResult, hub: vHub, lesson: vLesson, quiz: vQuiz, lessonDone: vLessonDone, cert: vCert, staff: vStaff, confirm: vConfirm }[UI.screen];
  const app = document.getElementById('app');
  const V = UI.lesson, key = UI.screen === 'lesson' ? V.li + '-' + V.idx + '-' + V.mode : null;
  const isVideo = !!(key && REMOTE && Core.VIDEO_CH[V.li + '-' + V.idx]);
  if (isVideo && key === lastLessonKey && document.getElementById('ytWrap')) {
    // 같은 영상 장: 영상은 그대로 두고 나머지 부분만 바꿔 재생이 끊기지 않게 함
    const tmp = document.createElement('div'); tmp.innerHTML = v();
    ['.toc', '#checkWrap', '.player', '#lessonHint', '.top'].forEach(sel => { const a = app.querySelector(sel), b = tmp.querySelector(sel); if (a && b) a.replaceWith(b); });
    updWatch();
  } else {
    if (lastLessonKey && Core.VIDEO_CH[lastLessonKey.split('-').slice(0, 2).join('-')]) destroyVideo();
    app.innerHTML = v();
    lastLessonKey = key;
    if (isVideo) mountVideo();
  }
  document.getElementById('layer').innerHTML = vModal();
  if (UI.screen === 'lesson') startTicker();
  if (UI.quiz) UI.quiz.shake = false;
}
function toast(m, bad) { document.querySelectorAll('.toast').forEach(x => x.remove()); const d = document.createElement('div'); d.className = 'toast' + (bad ? ' bad' : ''); d.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), bad ? 3600 : 1900); }
function copyText(t, msg) {
  const fallback = () => { UI.modal = { kind: 'copy', text: t }; render(); const b = document.getElementById('copyBox'); if (b) { b.focus(); b.select(); } };
  try { navigator.clipboard.writeText(t).then(() => toast(msg || '복사했어요'), fallback); } catch (e) { fallback(); }
}

/* 학습 시간 표시 (자동 넘김 없음) */
function startTicker() {
  const V = UI.lesson; V.viewStart = V.viewStart || Date.now();
  let wasWaiting = gate().gated && gate().rem > 0;
  ticker = setInterval(() => {
    const g = gate(), bar = document.getElementById('pbar'), cd = document.getElementById('cd');
    let pct;
    if (g.gated) {
      pct = g.total ? (g.total - g.rem) / g.total : 1;
      if (cd && g.rem > 0) cd.innerHTML = `${ICON.clock}<span>${mmss(g.rem)}</span>`;
      if (wasWaiting && g.rem === 0) { wasWaiting = false; render(); return; }
    } else pct = 1;
    if (bar) bar.style.width = Math.round(pct * 100) + '%';
  }, 250);
}
function stopTicker() { if (ticker) { clearInterval(ticker); ticker = null; } }
function gotoCh(i) { const V = UI.lesson; V.idx = i; V.viewStart = Date.now(); render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* ---------------- 흐름 ---------------- */
function vConfirm() {
  const m = UI.me, staff = m.role !== 'student';
  const roleName = { admin: '관리자', homeroom: '담임 교사', student: '학생' }[m.role];
  const detail = m.role === 'student' ? `${esc(m.cls)} · 학번 ${esc(m.id)}` : m.role === 'homeroom' ? `담당 학급 ${esc(m.cls)}` : '전체 학생 관리';
  return topbar('') + `<div class="center-note card pad stack confirm" style="gap:16px">
    <p class="eyebrow">본인 확인</p>
    <div class="row" style="gap:16px;align-items:center"><span class="avatar big ${staff ? 'staff' : ''}">${avatarText(m)}</span>
      <div style="min-width:0"><h2>${esc(m.name)} ${staff ? '' : '학생'}</h2><p class="muted">${roleName} · ${detail}</p></div></div>
    <div class="banner">로그인한 구글 계정: <b class="mono">${esc(m.email)}</b></div>
    <p class="muted">${staff ? '이 계정으로 교사 화면에 들어갈까요?' : '본인이 맞나요? 다른 친구의 계정이면 학습 기록이 그 친구 이름으로 저장돼요.'}</p>
    <div class="row"><button class="btn go" data-a="confirmYes">네, 제 계정이에요${staff ? '' : ' · 학습 시작'}</button>
      ${REMOTE ? `<a class="btn ghost" href="${esc(switchUrl())}" target="_top">아니에요, 계정 바꾸기</a>` : `<button class="btn ghost" data-a="logout">아니에요, 계정 바꾸기</button>`}</div>
    ${REMOTE ? '<p class="tiny muted">‘계정 바꾸기’를 누르면 구글 계정 선택 화면으로 이동해요. 공용 컴퓨터라면 앞 사람 계정에서 로그아웃한 뒤 내 학교 계정으로 로그인하세요.</p>' : ''}
  </div>`;
}
function switchUrl() { return 'https://accounts.google.com/AccountChooser?continue=' + encodeURIComponent(UI.appUrl || ''); }
function routeByRole() {
  const m = UI.me;
  if (!UI.confirmed && m.role !== 'none') { UI.screen = 'confirm'; return; }
  if (m.role === 'admin' || m.role === 'homeroom') { UI.screen = 'staff'; UI.t = { tab: 'list', cls: 'all', filter: 'all', sel: null, list: [], users: [], at: null, sheetUrl: '', imp: null, impResult: null }; return loadList(); }
  if (m.role === 'student') { if (!UI.st.pre.done) { UI.pre = { i: 0, ans: [] }; UI.screen = 'pre'; } else UI.screen = 'hub'; return; }
  UI.screen = 'unregistered';
}
async function boot(force) {
  let d;
  const pre = window.__BOOT; window.__BOOT = null;
  if (pre && typeof pre === 'object') {   // 서버가 페이지에 미리 넣어 준 첫 화면 데이터
    if (pre.now) clockOff = pre.now - Date.now();
    if (pre.ok) d = pre.data;
    else if (pre.error === 'NOEMAIL') { UI.screen = 'noemail'; render(); return; }
    else { window.__showErr('서버 오류: ' + pre.error); return; }
  } else d = await run('bootstrap', {}, { force });
  if (!d) { if (UI.screen === 'boot') { if (REMOTE) { if (UI.screen === 'boot' && UI.bootErr) { window.__showErr(UI.bootErr); return; } UI.screen = 'noemail'; } else UI.screen = 'login'; } render(); return; }
  UI.me = d.me; UI.set = d.settings; UI.st = d.student || null; UI.appUrl = d.appUrl || ''; UI.confirmed = false;
  await routeByRole(); render();
}
async function loadList() {
  const d = await run('list', {}, { force: true }); if (!d) return;
  const T = UI.t; T.list = d.students; T.users = d.users || []; UI.set = d.settings; T.at = Date.now(); T.sheetUrl = d.sheetUrl || '';
  if (T.sel && !T.list.find(s => s.id === T.sel)) T.sel = null;
}
async function openLesson(li, mode, fromQuiz) {
  if (mode === 'learn' && !fromQuiz) { const d = await run('enter', { li }); if (!d) return; UI.st = d.student; }
  const s = me(), st = startOf(s), l = s.lessons[li];
  let idx = 0;
  if (mode === 'learn') idx = fromQuiz ? N - 1 : (l.ch === st && st > 1 ? -1 : l.ch - 1);
  UI.lesson = { li, idx, mode, playing: false, fromQuiz: !!fromQuiz, viewStart: Date.now() }; UI.screen = 'lesson';
}
async function continueFlow() {
  const s = me();
  if (!s.pre.done) { UI.pre = { i: 0, ans: [] }; UI.screen = 'pre'; return; }
  if (s.done) { UI.screen = 'cert'; return; }
  const li = curLesson(s);
  if (s.stage === 'quiz') { UI.quiz = { li, sel: null, fb: null, hint: false }; UI.screen = 'quiz'; }
  else await openLesson(li, 'learn');
}
function readForm(prefix, keys) { const o = {}; keys.forEach(k => { const el = document.getElementById(prefix + k); o[k] = el ? el.value : ''; }); return o; }
function confirmBox(o) { UI.modal = Object.assign({ kind: 'confirm' }, o); }

const A = {
  openPicker() { UI.modal = 'picker'; },
  async confirmYes() { UI.confirmed = true; await routeByRole(); },
  closeModal() { UI.modal = null; },
  async demoLogin(d) { UI.modal = null; UI.demoEmail = d.email; await boot(true); return 'noRender'; },
  logout() { UI.confirmed = false; UI.me = null; UI.st = null; UI.demoEmail = null; UI.screen = 'login'; UI.lesson = null; UI.quiz = null; },
  preSel(d) { UI.pre.ans[UI.pre.i] = +d.k; },
  prePrev() { UI.pre.i--; },
  async preNext() { const P = UI.pre; if (P.i < PREQUIZ.length - 1) { P.i++; return; }
    const sc = PREQUIZ.reduce((a, q, i) => a + (P.ans[i] === q.a ? 1 : 0), 0);
    const d = await run('pre', { score: sc }); if (!d) return; UI.st = d.student; UI.screen = 'preResult'; },
  toHub() { UI.screen = 'hub'; UI.lesson = null; UI.quiz = null; },
  continue: () => continueFlow(),
  cert() { UI.screen = 'cert'; },
  review: d => openLesson(+d.i, 'review'),
  quizReview(d) { UI.quiz = { li: +d.i, review: true }; UI.screen = 'quiz'; },
  go(d) { gotoCh(+d.i); return 'noRender'; },
  prev() { const V = UI.lesson; const min = (V.mode === 'learn' && startOf(me()) > 1) ? -1 : 0; if (V.idx > min) gotoCh(V.idx - 1); return 'noRender'; },
  async next() {
    const V = UI.lesson, s = me();
    if (V.idx === -1) { gotoCh(Math.max(0, s.lessons[V.li].ch - 1)); return 'noRender'; }
    if (V.idx >= N - 1) return 'noRender';
    const L = s.lessons[V.li];
    if (V.mode === 'learn' && !V.fromQuiz && V.idx === L.ch - 1) {
      if (!checkPassed(V.li, V.idx)) { toast('먼저 ‘학습 확인’을 통과해 주세요'); return 'noRender'; }
      const d = await run('advance', { li: V.li, to: L.ch + 1 }); if (!d) { render(); return 'noRender'; }
      UI.st = d.student;
    }
    gotoCh(V.idx + 1); return 'noRender';
  },
  ck(d) { const c = LESSONS[+d.li].chapters[+d.k].check; ACT.chk[ckKey(d.li, d.k)] = { sel: +d.i, ok: +d.i === c.a }; },
  ckm(d) {
    const c = LESSONS[+d.li].chapters[+d.k].check, st = multiState(+d.li, +d.k, c), qi = +d.q, s2 = st.items[qi], it = c.items[qi];
    if (s2.ok || s2.until > Date.now()) return 'noRender';
    s2.sel = +d.i; s2.ok = +d.i === it.a;
    if (!s2.ok) { s2.wrong++; s2.until = Date.now() + CK_WAIT * 1000; setTimeout(() => { if (UI.screen === 'lesson') render(); }, CK_WAIT * 1000 + 100); }
    st.ok = st.items.every(x => x.ok);
  },
  ckTask(d) { const c = LESSONS[+d.li].chapters[+d.k].check; ACT.chk[ckKey(d.li, d.k)] = { ok: !!c.test(), tried: true }; },
  replay() { const V = UI.lesson; V.playing = false; gotoCh(0); return 'noRender'; },
  async startQuiz() { const li = UI.lesson.li; if (!checkPassed(li, N - 1)) { toast('먼저 ‘학습 확인’을 통과해 주세요'); return 'noRender'; } const d = await run('startQuiz', { li }); if (!d) return; UI.st = d.student; UI.quiz = { li, sel: null, fb: null, hint: false }; UI.screen = 'quiz'; },
  reviewFromQuiz() { UI.savedQuiz = UI.quiz; return openLesson(UI.quiz.li, 'learn', true); },
  backQuiz() { UI.quiz = UI.savedQuiz || { li: UI.lesson.li, sel: null, fb: null, hint: false }; UI.screen = 'quiz'; },
  qSel(d) { const Q = UI.quiz; Q.sel = +d.k; if (Q.fb === 'wrong') Q.fb = null; },
  async hint() { const d = await run('hint', { li: UI.quiz.li }); if (!d) return; UI.st = d.student; UI.quiz.hint = true; },
  async qSubmit() {
    const Q = UI.quiz, l = me().lessons[Q.li], qi = l.qi, q = LESSONS[Q.li].quiz[qi], correct = Q.sel === q.a;
    const d = await run('answer', { li: Q.li, correct }); if (!d) return; UI.st = d.student;
    if (correct) { Q.fb = 'right'; Q.solvedQi = qi; } else { Q.fb = 'wrong'; Q.shake = true; }
  },
  qNext() { const Q = UI.quiz, s = me(), l = s.lessons[Q.li];
    if (!l.done) { UI.quiz = { li: Q.li, sel: null, fb: null, hint: false }; return; }
    UI.quiz = null;
    if (s.done) UI.screen = 'cert'; else { UI.doneLi = Q.li; UI.screen = 'lessonDone'; } },
  video() { const V = UI.lesson; if (V) V.playing = false; return 'pass'; },
  sig(d) { ACT.sig[d.i] = d.c; }, ds(d) { ACT.ds = d.k; }, gear(d) { ACT.gear = +d.i; ACT.gearSeen[d.i] = 1; }, choice(d) { ACT.choice = d.c; },
  pledge(d, el) { ACT.pledge[d.i] = el.checked; },
  /* 교사 */
  tab(d) { UI.t.tab = d.k; },
  filter(d) { UI.t.filter = d.k; },
  selStudent(d) { UI.t.sel = d.id; },
  jump(d) { UI.t.tab = 'list'; UI.t.filter = 'all'; UI.t.sel = d.id; },
  async refresh() { await loadList(); toast('최신 기록을 불러왔어요'); },
  copyUndone() { const und = scoped().filter(s => !s.done);
    copyText(['학번\t이름\t학급\t현재 단계\t콘텐츠 위치', ...und.map(s => [s.id, s.name, s.cls, stageText(s), contentText(s)].join('\t'))].join('\n'), `미이수 ${und.length}명 명단을 복사했어요`); return 'noRender'; },
  copySheet() { copyText([Core.STUDENT_HEADERS.slice(0, 20).join('\t'), ...scoped().map(s => Core.toRow(s).slice(0, 20).join('\t'))].join('\n'), '시트 데이터를 복사했어요'); return 'noRender'; },
  addStudent() { UI.modal = { kind: 'student', orig: null, vals: { cls: UI.t.cls !== 'all' ? UI.t.cls : '' } }; },
  editStudent(d) { const s = UI.t.list.find(x => x.id === d.id); UI.modal = { kind: 'student', orig: s.id, vals: { id: s.id, name: s.name, email: s.email, cls: s.cls } }; },
  async saveStudent() { const M = UI.modal; M.vals = readForm('f_', ['id', 'name', 'email', 'cls']); M.err = null;
    const d = await run('upsertStudent', { orig: M.orig, student: M.vals }, { onError: m => { M.err = m; } });
    if (!d) return; UI.modal = null; await loadList(); toast(d.mode === 'added' ? '학생을 추가했어요' : '학생 정보를 수정했어요'); },
  askDeleteStudent(d) { const s = UI.t.list.find(x => x.id === d.id);
    confirmBox({ title: `${esc(s.name)}(${esc(s.id)}) 학생을 삭제할까요?`, body: '학생 행과 학습 기록이 스프레드시트에서 지워져요. 되돌릴 수 없어요.', ok: '삭제', danger: true, act: 'deleteStudent', args: { id: s.id } }); },
  askResetStudent(d) { const s = UI.t.list.find(x => x.id === d.id);
    confirmBox({ title: `${esc(s.name)} 학생의 학습 기록을 초기화할까요?`, body: '사전 퀴즈부터 다시 시작해요. 이름·이메일·학급은 그대로예요.', ok: '초기화', danger: true, act: 'resetStudent', args: { id: s.id } }); },
  addUser() { UI.modal = { kind: 'user', orig: null, vals: { role: '담임' } }; },
  editUser(d) { const u = UI.t.users.find(x => x.email === d.email); UI.modal = { kind: 'user', orig: u.email, vals: { ...u } }; },
  async saveUser() { const M = UI.modal; const v = readForm('u_', ['email', 'name', 'role', 'cls']); M.vals = v; M.err = null;
    const d = await run('upsertUser', { orig: M.orig, user: v }, { onError: m => { M.err = m; } });
    if (!d) return; UI.modal = null; await loadList(); toast('권한을 저장했어요'); },
  askDeleteUser(d) { confirmBox({ title: '이 교사 권한을 삭제할까요?', body: `${esc(d.email)} 계정은 더 이상 교사 화면에 들어올 수 없어요.`, ok: '삭제', danger: true, act: 'deleteUser', args: { email: d.email } }); },
  async confirmOk() { const M = UI.modal; UI.modal = null;
    if (M.act === 'demoReset') { LDB = demoSeed(); saveLocal(); await loadList(); toast('데모 데이터로 초기화했어요'); return; }
    const d = await run(M.act, M.args); if (!d) return;
    if (M.act === 'deleteStudent' && UI.t.sel === M.args.id) UI.t.sel = null;
    await loadList(); toast({ deleteStudent: '삭제했어요', resetStudent: '학습 기록을 초기화했어요', deleteUser: '권한을 삭제했어요' }[M.act] || '완료했어요'); },
  async saveSettings() { const v = readForm('set_', Object.keys(Core.SETTING_INFO));
    const d = await run('saveSettings', { settings: v }); if (!d) return; UI.set = d.settings; toast('설정을 저장했어요'); },
  async previewUrl() { const T = UI.t; T.impUrl = document.getElementById('impUrl').value.trim(); T.impTab = document.getElementById('impTab').value.trim();
    if (!/docs\.google\.com\/spreadsheets/.test(T.impUrl)) { toast('구글 스프레드시트 주소를 넣어 주세요', true); return 'noRender'; }
    const d = await run('previewSheet', { url: T.impUrl, tab: T.impTab }); if (!d) return; T.imp = d; T.impResult = null; },
  async previewOwn() { const d = await run('previewSheet', { own: true }); if (!d) return; UI.t.imp = d; UI.t.impResult = null; },
  previewPaste() { const T = UI.t; T.impPaste = document.getElementById('impPaste').value;
    const vals = T.impPaste.replace(/\r/g, '').split('\n').map(l => l.split('\t'));
    T.imp = Core.parseImport(vals); T.impResult = null; },
  sampleImport() { UI.t.impPaste = '학번\t이름\t이메일\t학급\n10301\t남궁별\ts10301@sample-ms.kr\t1학년3반\n10302\t도하람\ts10302@sample-ms.kr\t1학년3반\n10101\t김하늘\ts10101@sample-ms.kr\t1학년1반\n10303\t선우진\t이메일없음\t1학년3반'; const ta = document.getElementById('impPaste'); if (ta) ta.value = UI.t.impPaste; A.previewPaste(); },
  clearImport() { UI.t.imp = null; },
  async doImport() { const rows = UI.t.impRows || []; const d = await run('importStudents', { rows }); if (!d) return;
    UI.t.impResult = d; UI.t.imp = null; await loadList(); toast(`신규 ${d.added}명 · 갱신 ${d.updated}명 등록했어요`); },
  askDemoReset() { confirmBox({ title: '데모 데이터를 초기화할까요?', body: '이 브라우저의 데모 기록이 처음 상태로 돌아가요.', ok: '초기화', danger: true, act: 'demoReset' }); }
};

document.addEventListener('click', async e => {
  const el = e.target.closest('[data-a]'); if (!el) return;
  if (el.classList.contains('scrim') && e.target !== el) return;
  const fn = A[el.dataset.a]; if (!fn) return;
  if (el.tagName === 'A' && el.dataset.a !== 'video') return;
  const y = window.scrollY;
  const r = await fn(el.dataset, el);
  if (r === 'pass' || r === 'noRender') return;
  render();
  if (!['continue', 'review', 'toHub', 'preNext', 'startQuiz', 'qNext', 'reviewFromQuiz', 'backQuiz', 'tab', 'demoLogin', 'logout', 'cert', 'confirmYes'].includes(el.dataset.a)) window.scrollTo(0, y);
  else window.scrollTo(0, 0);
});
document.addEventListener('input', e => { if (e.target.dataset.in === 'reason') ACT.reason = e.target.value; });
document.addEventListener('change', e => {
  if (e.target.dataset.in === 'cls') { UI.t.cls = e.target.value; UI.t.sel = null; render(); }
  if (e.target.dataset.in === 'urole') { const w = document.getElementById('u_cls_wrap'); if (w) w.hidden = e.target.value === '관리자'; }
});

if (REMOTE) { render(); boot(true); } else { UI.screen = 'login'; render(); }
