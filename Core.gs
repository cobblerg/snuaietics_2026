/* =====================================================================
   Core — 서버(Apps Script)와 데모(브라우저)가 함께 쓰는 진행 규칙
   - 시간 제한, 수준 분기, 권한 확인, 학생/권한 관리, 일괄 등록 파싱
   ===================================================================== */
var Core = (function () {
  var N = 7;            // 차시별 장 수
  var QN = 3;           // 차시별 퀴즈 문항 수
  var LESSONS_N = 3;
  var VIDEO_CH = { '1-4': true };   // 2차시 5장 = 영상
  var ROLES = { '관리자': 'admin', '담임': 'homeroom' };

  function defaults() {
    return { chapterSec: 60, videoSec: 230, explainAfter: 3, videoWatch: 90, start상: 5, start중: 3, start하: 1, levelHi: 5, levelMid: 3 };
  }
  var SETTING_INFO = {
    chapterSec: ['장별 최소 학습 시간(초)', 0, 1800],
    videoSec: ['영상 장 최소 학습 시간(초)', 0, 3600],
    explainAfter: ['해설 공개 오답 횟수(문제 단위)', 1, 10],
    videoWatch: ['영상 최소 시청 비율(%) · 0이면 확인 안 함', 0, 100],
    start상: ['수준 상 시작 장', 1, 7],
    start중: ['수준 중 시작 장', 1, 7],
    start하: ['수준 하 시작 장', 1, 7],
    levelHi: ['수준 상 최소 점수(6점 만점)', 0, 6],
    levelMid: ['수준 중 최소 점수(6점 만점)', 0, 6]
  };
  function normSettings(s) {
    var d = defaults(), o = {};
    Object.keys(d).forEach(function (k) {
      var v = s && s[k] !== undefined && s[k] !== '' ? Number(s[k]) : d[k];
      if (isNaN(v)) v = d[k];
      var r = SETTING_INFO[k]; v = Math.round(Math.min(r[2], Math.max(r[1], v)));
      o[k] = v;
    });
    return o;
  }
  function startOf(set, level) { return set['start' + level] || 1; }
  function levelOf(set, score) { return score >= set.levelHi ? '상' : score >= set.levelMid ? '중' : '하'; }
  function minSec(set, li, chIdx) { return VIDEO_CH[li + '-' + chIdx] ? set.videoSec : set.chapterSec; }

  function blankLesson() { return { ch: 0, tries: 0, done: false, qi: 0, wrong: [0, 0, 0], hints: 0, enteredAt: 0 }; }
  function blankProgress() {
    return { pre: { done: false, score: null, level: null }, lessons: [blankLesson(), blankLesson(), blankLesson()], stage: 'pre', done: false, doneAt: null, lastSeen: null };
  }
  function normEmail(e) { return String(e || '').trim().toLowerCase(); }
  function normCls(c) {
    c = String(c || '').trim();
    var m = c.match(/(\d+)\D+(\d+)/);
    return m ? (+m[1]) + '-' + (+m[2]) : c;
  }
  function curLesson(s) { for (var i = 0; i < LESSONS_N; i++) if (!s.lessons[i].done) return i; return LESSONS_N; }
  function fail(msg) { throw new Error(msg); }

  function role(db, email) {
    email = normEmail(email);
    var u = (db.users || []).filter(function (x) { return normEmail(x.email) === email; })[0];
    if (u && ROLES[u.role]) return { role: ROLES[u.role], roleName: u.role, name: u.name || email, cls: u.cls || '', email: email };
    var s = findByEmail(db, email);
    if (s) return { role: 'student', roleName: '학생', name: s.name, cls: s.cls, id: s.id, email: email };
    return { role: 'none', email: email };
  }
  function homeroomClasses(me) { return String(me.cls || '').split(/[,;]+/).map(normCls).filter(Boolean); }
  function visible(db, me) {
    if (me.role === 'admin') return db.students;
    if (me.role === 'homeroom') { var cs = homeroomClasses(me); return db.students.filter(function (s) { return cs.indexOf(s.cls) >= 0; }); }
    return [];
  }
  function findByEmail(db, email) { email = normEmail(email); return db.students.filter(function (s) { return normEmail(s.email) === email; })[0]; }
  function findById(db, id) { id = String(id); return db.students.filter(function (s) { return String(s.id) === id; })[0]; }

  function validateIdentity(o) {
    var r = { id: String(o.id || '').trim(), name: String(o.name || '').trim(), email: normEmail(o.email), cls: normCls(o.cls) };
    var errs = [];
    if (!r.id) errs.push('학번이 비어 있어요');
    if (!r.name) errs.push('이름이 비어 있어요');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) errs.push('이메일 형식이 올바르지 않아요');
    if (!r.cls) errs.push('학급이 비어 있어요');
    return { value: r, errors: errs };
  }

  /* ---------------- 학생 학습 행동 ---------------- */
  var STUDENT_ACTS = {
    pre: function (s, a, set, now) {
      if (s.pre.done) fail('사전 퀴즈는 이미 응시했어요.');
      var sc = Math.max(0, Math.min(6, parseInt(a.score, 10) || 0));
      s.pre = { done: true, score: sc, level: levelOf(set, sc) };
      s.stage = 'learn';
    },
    enter: function (s, a, set, now) {
      var li = +a.li; mustCurrent(s, li);
      var L = s.lessons[li], st = startOf(set, s.pre.level);
      if (L.ch < st) { L.ch = st; L.enteredAt = now; }
      if (!L.enteredAt) L.enteredAt = now;
    },
    advance: function (s, a, set, now) {
      var li = +a.li, to = +a.to; mustCurrent(s, li);
      if (s.stage !== 'learn') fail('지금은 퀴즈 단계예요.');
      var L = s.lessons[li];
      if (to <= L.ch) return;
      if (to !== L.ch + 1 || to > N) fail('장은 순서대로 학습해요.');
      var wait = remaining(set, li, L, now);
      if (wait > 0) fail('WAIT:' + wait);
      if (VIDEO_CH[li + '-' + (L.ch - 1)] && set.videoWatch > 0 && !L.watchSkip && (L.watch || 0) < set.videoWatch)
        fail('영상을 ' + set.videoWatch + '% 이상 시청해야 다음 장으로 갈 수 있어요.');
      L.ch = to; L.enteredAt = now;
    },
    startQuiz: function (s, a, set, now) {
      var li = +a.li; mustCurrent(s, li);
      var L = s.lessons[li];
      if (s.stage === 'quiz') return;
      if (L.ch < N) fail('마지막 장까지 학습해야 퀴즈를 풀 수 있어요.');
      var wait = remaining(set, li, L, now);
      if (wait > 0) fail('WAIT:' + wait);
      s.stage = 'quiz';
    },
    answer: function (s, a, set, now) {
      var li = +a.li; mustCurrent(s, li);
      if (s.stage !== 'quiz') fail('퀴즈 단계가 아니에요.');
      var L = s.lessons[li];
      L.tries++;
      if (!a.correct) { L.wrong[L.qi] = (L.wrong[L.qi] || 0) + 1; return; }
      if (L.qi < QN - 1) { L.qi++; return; }
      L.qi = QN; L.done = true; L.ch = N;
      if (li === LESSONS_N - 1) { s.done = true; s.doneAt = now; s.stage = 'done'; }
      else { s.stage = 'learn'; }
    },
    hint: function (s, a) { var li = +a.li; mustCurrent(s, li); s.lessons[li].hints++; },
    watch: function (s, a) {
      var li = +a.li; mustCurrent(s, li); var L = s.lessons[li];
      if (a.unavailable) { L.watchSkip = true; return; }
      var p = Math.max(0, Math.min(100, Math.round(Number(a.pct) || 0)));
      L.watch = Math.max(L.watch || 0, p);
    }
  };
  function mustCurrent(s, li) {
    if (!s.pre.done) fail('사전 퀴즈를 먼저 풀어요.');
    if (s.done) fail('이미 이수를 완료했어요.');
    if (li !== curLesson(s)) fail('아직 열리지 않은 차시예요.');
  }
  function remaining(set, li, L, now) {
    var need = minSec(set, li, L.ch - 1);
    var el = (now - (L.enteredAt || 0)) / 1000;
    return Math.max(0, Math.ceil(need - el));
  }

  /* ---------------- 관리자 행동 ---------------- */
  var ADMIN_ACTS = {
    upsertStudent: function (db, a, me) {
      var v = validateIdentity(a.student || {});
      if (v.errors.length) fail(v.errors.join(', '));
      var r = v.value, orig = a.orig ? findById(db, a.orig) : null;
      db.students.forEach(function (s) {
        if (s === orig) return;
        if (String(s.id) === r.id) fail('학번 ' + r.id + '은(는) 이미 등록되어 있어요.');
        if (normEmail(s.email) === r.email) fail('이메일 ' + r.email + '은(는) 이미 등록되어 있어요.');
      });
      if ((db.users || []).some(function (u) { return normEmail(u.email) === r.email; })) fail('교사(관리자·담임) 계정 이메일은 학생으로 등록할 수 없어요.');
      if (orig) { orig.id = r.id; orig.name = r.name; orig.email = r.email; orig.cls = r.cls; return { id: r.id, mode: 'updated' }; }
      var s = blankProgress(); s.id = r.id; s.name = r.name; s.email = r.email; s.cls = r.cls;
      db.students.push(s); sortStudents(db); return { id: r.id, mode: 'added' };
    },
    deleteStudent: function (db, a) {
      var i = db.students.findIndex(function (s) { return String(s.id) === String(a.id); });
      if (i < 0) fail('학생을 찾을 수 없어요.');
      db.students.splice(i, 1); return { id: a.id };
    },
    resetStudent: function (db, a) {
      var s = findById(db, a.id); if (!s) fail('학생을 찾을 수 없어요.');
      var p = blankProgress(); Object.keys(p).forEach(function (k) { s[k] = p[k]; }); return { id: a.id };
    },
    importStudents: function (db, a) {
      var added = 0, updated = 0, errors = [];
      (a.rows || []).forEach(function (row, i) {
        var v = validateIdentity(row);
        if (v.errors.length) { errors.push((row._line || i + 1) + '행: ' + v.errors.join(', ')); return; }
        var r = v.value;
        if ((db.users || []).some(function (u) { return normEmail(u.email) === r.email; })) { errors.push((row._line || i + 1) + '행: 교사 계정 이메일이에요'); return; }
        var s = findById(db, r.id);
        var other = findByEmail(db, r.email);
        if (other && other !== s) { errors.push((row._line || i + 1) + '행: 이메일이 다른 학번(' + other.id + ')과 겹쳐요'); return; }
        if (s) { s.name = r.name; s.email = r.email; s.cls = r.cls; updated++; }
        else { s = blankProgress(); s.id = r.id; s.name = r.name; s.email = r.email; s.cls = r.cls; db.students.push(s); added++; }
      });
      sortStudents(db);
      return { added: added, updated: updated, errors: errors };
    },
    upsertUser: function (db, a, me) {
      var u = a.user || {};
      var r = { email: normEmail(u.email), name: String(u.name || '').trim(), role: u.role, cls: u.role === '담임' ? String(u.cls || '').split(/[,;]+/).map(normCls).filter(Boolean).join(',') : '' };
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(r.email)) fail('이메일 형식이 올바르지 않아요.');
      if (!ROLES[r.role]) fail('역할은 관리자 또는 담임이에요.');
      if (r.role === '담임' && !r.cls) fail('담임은 담당 학급을 입력해야 해요. 예: 1-3');
      if (findByEmail(db, r.email)) fail('학생으로 등록된 이메일이에요.');
      var origEmail = normEmail(a.orig || '');
      if (origEmail === me.email && (r.role !== '관리자' || r.email !== me.email)) fail('내 계정의 역할과 이메일은 스스로 바꿀 수 없어요.');
      var list = db.users || (db.users = []);
      var dup = list.filter(function (x) { return normEmail(x.email) === r.email && normEmail(x.email) !== origEmail; })[0];
      if (dup) fail('이미 등록된 이메일이에요.');
      var ex = list.filter(function (x) { return normEmail(x.email) === origEmail; })[0];
      if (ex) { ex.email = r.email; ex.name = r.name; ex.role = r.role; ex.cls = r.cls; } else list.push(r);
      return { email: r.email };
    },
    deleteUser: function (db, a, me) {
      var e = normEmail(a.email);
      if (e === me.email) fail('내 계정은 삭제할 수 없어요.');
      db.users = (db.users || []).filter(function (u) { return normEmail(u.email) !== e; });
      return { email: e };
    },
    saveSettings: function (db, a) { db.settings = normSettings(a.settings); return { settings: db.settings }; }
  };
  function sortStudents(db) { db.students.sort(function (x, y) { return String(x.id).localeCompare(String(y.id), 'ko', { numeric: true }); }); }

  function isWrite(type) { return !!(STUDENT_ACTS[type] || ADMIN_ACTS[type]); }
  function isStudentAct(type) { return !!STUDENT_ACTS[type]; }

  function act(db, email, now, type, a) {
    db.settings = normSettings(db.settings);
    var me = role(db, email), set = db.settings;
    var changed = { students: [], all: false, users: false, settings: false };
    a = a || {};
    if (type === 'bootstrap') {
      var res = { me: me, settings: set };
      if (me.role === 'student') res.student = findByEmail(db, email);
      return { result: res, changed: changed };
    }
    if (STUDENT_ACTS[type]) {
      if (me.role !== 'student') fail('학생 계정에서만 할 수 있어요.');
      var s = findByEmail(db, email);
      STUDENT_ACTS[type](s, a, set, now);
      s.lastSeen = now;
      changed.students.push(s.id);
      return { result: { student: s }, changed: changed };
    }
    if (type === 'list') {
      if (me.role !== 'admin' && me.role !== 'homeroom') fail('교사 계정만 조회할 수 있어요.');
      var out = { students: visible(db, me), settings: set, me: me };
      if (me.role === 'admin') out.users = db.users || [];
      return { result: out, changed: changed };
    }
    if (ADMIN_ACTS[type]) {
      if (me.role !== 'admin') fail('관리자만 할 수 있어요.');
      var r = ADMIN_ACTS[type](db, a, me);
      if (type === 'upsertUser' || type === 'deleteUser') changed.users = true;
      else if (type === 'saveSettings') changed.settings = true;
      else changed.all = true;
      return { result: r, changed: changed };
    }
    fail('알 수 없는 요청: ' + type);
  }

  /* ---------------- 일괄 등록 파싱 ---------------- */
  function parseImport(values) {
    var rows = (values || []).map(function (r) { return (r || []).map(function (c) { return String(c == null ? '' : c).trim(); }); })
      .filter(function (r) { return r.some(Boolean); });
    if (!rows.length) return { rows: [], errors: ['내용이 비어 있어요.'] };
    var find = function (h, keys) { for (var i = 0; i < h.length; i++) for (var k = 0; k < keys.length; k++) if (h[i].replace(/\s/g, '').indexOf(keys[k]) >= 0) return i; return -1; };
    var head = rows[0], col;
    var ci = { id: find(head, ['학번']), name: find(head, ['이름', '성명']), email: find(head, ['이메일', 'email', 'Email', '메일', '계정', '구글']), cls: find(head, ['학급']), grade: find(head, ['학년']), ban: find(head, ['반']) };
    var hasHeader = ci.id >= 0 || ci.name >= 0;
    if (hasHeader) rows = rows.slice(1);
    else ci = { id: 0, name: 1, email: 2, cls: 3, grade: -1, ban: -1 };
    var errors = [];
    if (ci.id < 0 || ci.name < 0 || ci.email < 0) errors.push('머리글에서 학번·이름·이메일 열을 찾지 못했어요.');
    if (ci.cls < 0 && !(ci.grade >= 0 && ci.ban >= 0 && ci.ban !== ci.cls)) {
      if (ci.ban >= 0 && ci.grade < 0) ci.cls = ci.ban; else errors.push('학급(또는 학년·반) 열을 찾지 못했어요.');
    }
    if (errors.length) return { rows: [], errors: errors };
    var out = rows.map(function (r, i) {
      var cls = ci.cls >= 0 ? r[ci.cls] : (r[ci.grade] + '-' + r[ci.ban]);
      return { id: r[ci.id], name: r[ci.name], email: r[ci.email], cls: normCls(cls), _line: i + (hasHeader ? 2 : 1) };
    });
    return { rows: out, errors: [] };
  }

  /* ---------------- 시트 행 변환 (학생 1행) ---------------- */
  var STUDENT_HEADERS = ['학번', '이름', '구글 식별자(이메일)', '학급', '사전퀴즈 응시', '사전퀴즈 점수', '사전퀴즈 수준',
    '1차시 현재 장', '1차시 퀴즈 도전 횟수', '1차시 퀴즈 완료', '2차시 현재 장', '2차시 퀴즈 도전 횟수', '2차시 퀴즈 완료',
    '3차시 현재 장', '3차시 퀴즈 도전 횟수', '3차시 퀴즈 완료', '이수 여부', '이수 일시', '현재 단계', '최근 학습', '_진행데이터(수정 금지)'];
  var USER_HEADERS = ['이메일', '이름', '역할(관리자/담임)', '담당학급(예: 1-3, 여러 반은 쉼표)'];
  function fmtKST(ms) {
    if (!ms) return '';
    var d = new Date(Number(ms) + 9 * 3600 * 1000), p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getUTCFullYear() + '-' + p(d.getUTCMonth() + 1) + '-' + p(d.getUTCDate()) + ' ' + p(d.getUTCHours()) + ':' + p(d.getUTCMinutes());
  }
  function stageText(s) {
    if (!s.pre.done) return '사전 퀴즈 전';
    if (s.done) return '이수 완료';
    var i = curLesson(s); return (i + 1) + '차시 ' + (s.stage === 'quiz' ? '퀴즈' : '학습');
  }
  function toRow(s) {
    var yn = function (b) { return b ? 'Y' : 'N'; };
    var row = [s.id, s.name, s.email, s.cls, yn(s.pre.done), s.pre.score == null ? '' : s.pre.score, s.pre.level || ''];
    s.lessons.forEach(function (l) { row.push(l.ch || '', l.tries, yn(l.done)); });
    var prog = { pre: s.pre, lessons: s.lessons, stage: s.stage, done: s.done, doneAt: s.doneAt, lastSeen: s.lastSeen };
    row.push(yn(s.done), fmtKST(s.doneAt), stageText(s), fmtKST(s.lastSeen), JSON.stringify(prog));
    return row;
  }
  function fromRow(r) {
    var s = blankProgress(), p = null;
    try { p = r[20] ? JSON.parse(r[20]) : null; } catch (e) { p = null; }
    if (p && p.lessons && p.lessons.length === 3) { Object.keys(s).forEach(function (k) { if (p[k] !== undefined) s[k] = p[k]; }); }
    s.id = String(r[0]).trim(); s.name = String(r[1]).trim(); s.email = normEmail(r[2]); s.cls = normCls(r[3]);
    return s;
  }
  function userFromRow(r) { return { email: normEmail(r[0]), name: String(r[1] || '').trim(), role: String(r[2] || '').trim(), cls: String(r[3] || '').trim() }; }
  function userToRow(u) { return [u.email, u.name, u.role, u.cls || '']; }

  return {
    N: N, QN: QN, VIDEO_CH: VIDEO_CH, SETTING_INFO: SETTING_INFO, STUDENT_HEADERS: STUDENT_HEADERS, USER_HEADERS: USER_HEADERS,
    defaults: defaults, normSettings: normSettings, startOf: startOf, levelOf: levelOf, minSec: minSec, remaining: remaining,
    blankProgress: blankProgress, blankLesson: blankLesson, normEmail: normEmail, normCls: normCls, curLesson: curLesson, role: role,
    homeroomClasses: homeroomClasses, act: act, isWrite: isWrite, isStudentAct: isStudentAct, parseImport: parseImport,
    toRow: toRow, fromRow: fromRow, userFromRow: userFromRow, userToRow: userToRow, fmtKST: fmtKST, stageText: stageText,
    validateIdentity: validateIdentity
  };
})();
