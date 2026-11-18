/* =====================================================================
   AI 윤리 탐험 — Google Apps Script 서버
   - 구글 로그인: 웹 앱 배포 시 '도메인 내 사용자'로 접근 제한 → 접속자 이메일 확인
   - 데이터: 이 스프레드시트의 '학생' · '사용자' · '설정' 시트 (학생 1행 구조)
   처음 한 번: 편집기 상단에서 setup 함수를 선택해 실행하세요.
   ===================================================================== */
var SHEET = { STU: '학생', USR: '사용자', SET: '설정', TPL: '등록양식' };

function doGet() {
  // 템플릿 엔진을 쓰지 않고, 첫 화면 데이터만 문자열로 끼워 넣습니다.
  var boot;
  try { boot = JSON.parse(api('bootstrap', '{}')); } catch (e) { boot = { ok: false, error: String(e && e.message || e) }; }
  var json = JSON.stringify(boot).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  var html = HtmlService.createHtmlOutputFromFile('Index').getContent().replace('null/*__BOOT__*/', function () { return json; });
  return HtmlService.createHtmlOutput(html)
    .setTitle('AI 윤리 탐험')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/* ---------- 최초 설정 ---------- */
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('스프레드시트에서 [확장 프로그램 > Apps Script]로 연 프로젝트에서 실행해 주세요.');
  PropertiesService.getScriptProperties().setProperty('SSID', ss.getId());
  SS_CACHE = ss;
  var stu = ensureSheet_(ss, SHEET.STU, Core.STUDENT_HEADERS);
  stu.hideColumns(Core.STUDENT_HEADERS.length);
  var usr = ensureSheet_(ss, SHEET.USR, Core.USER_HEADERS);
  SpreadsheetApp.flush();
  var owner = Session.getEffectiveUser().getEmail().toLowerCase();
  var users = readUsers_();
  if (!users.some(function (u) { return u.role === '관리자'; })) {
    usr.appendRow([owner, '관리자', '관리자', '']);
  }
  var set = ensureSheet_(ss, SHEET.SET, ['항목', '값', '설명']);
  SpreadsheetApp.flush();
  if (set.getLastRow() < 2) writeSettings_(Core.defaults());
  var tpl = ensureSheet_(ss, SHEET.TPL, ['학번', '이름', '이메일', '학급']);
  if (tpl.getLastRow() < 2) tpl.getRange(2, 1, 1, 4).setValues([['10101', '홍길동', 's10101@학교도메인', '1-1']]);
  var s1 = ss.getSheetByName('시트1') || ss.getSheetByName('Sheet1');
  if (s1 && s1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s1);
  return '설정 완료: 관리자 ' + owner;
}

function ensureSheet_(ss, name, headers) {
  var sh = ss.getSheetByName(name) || ss.insertSheet(name);
  if (sh.getLastRow() === 0) {
    sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight('bold').setBackground('#E3E6F7');
    sh.setFrozenRows(1);
  }
  return sh;
}
var SS_CACHE = null;
function ss_() {
  if (SS_CACHE) return SS_CACHE;
  var active = null;
  try { active = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { active = null; }
  if (active) return (SS_CACHE = active);
  var id = PropertiesService.getScriptProperties().getProperty('SSID');
  if (!id) throw new Error('setup을 먼저 실행해 주세요.');
  return (SS_CACHE = SpreadsheetApp.openById(id));
}
function sheet_(name) { var sh = ss_().getSheetByName(name); if (!sh) throw new Error('"' + name + '" 시트가 없어요. setup을 먼저 실행해 주세요.'); return sh; }

/* ---------- 읽기/쓰기 ---------- */
function readUsers_() {
  var sh = ss_().getSheetByName(SHEET.USR); if (!sh || sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, 4).getValues().filter(function (r) { return r[0]; }).map(Core.userFromRow);
}
function writeUsers_(users) {
  var sh = sheet_(SHEET.USR);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 4).clearContent();
  if (users.length) sh.getRange(2, 1, users.length, 4).setValues(users.map(Core.userToRow));
}
function readSettings_() {
  var sh = ss_().getSheetByName(SHEET.SET), o = {};
  if (sh && sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 2).getValues().forEach(function (r) { if (r[0]) o[r[0]] = r[1]; });
  return Core.normSettings(o);
}
function writeSettings_(set) {
  var sh = sheet_(SHEET.SET);
  var rows = Object.keys(Core.SETTING_INFO).map(function (k) { return [k, set[k], Core.SETTING_INFO[k][0]]; });
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, 3).clearContent();
  sh.getRange(2, 1, rows.length, 3).setValues(rows);
}
var NCOL = 21;
function readAllStudents_() {
  var sh = sheet_(SHEET.STU); if (sh.getLastRow() < 2) return [];
  return sh.getRange(2, 1, sh.getLastRow() - 1, NCOL).getValues().filter(function (r) { return String(r[0]).trim(); }).map(Core.fromRow);
}
function writeAllStudents_(list) {
  var sh = sheet_(SHEET.STU);
  if (sh.getLastRow() > 1) sh.getRange(2, 1, sh.getLastRow() - 1, NCOL).clearContent();
  if (list.length) {
    sh.getRange(2, 1, list.length, 1).setNumberFormat('@');
    sh.getRange(2, 1, list.length, NCOL).setValues(list.map(Core.toRow));
  }
}
function findStudentRow_(email) {
  var sh = sheet_(SHEET.STU); if (sh.getLastRow() < 2) return null;
  var cell = sh.getRange(2, 3, sh.getLastRow() - 1, 1).createTextFinder(email).matchEntireCell(true).matchCase(false).findNext();
  if (!cell) return null;
  var row = cell.getRow();
  return { row: row, s: Core.fromRow(sh.getRange(row, 1, 1, NCOL).getValues()[0]) };
}

function appUrl_() { try { return ScriptApp.getService().getUrl() || ''; } catch (e) { return ''; } }

/* ---------- 클라이언트 API ---------- */
function api(type, argsJson) {
  try {
    var email = (Session.getActiveUser().getEmail() || '').toLowerCase();
    if (!email) throw new Error('NOEMAIL');
    var args = argsJson ? JSON.parse(argsJson) : {};
    var users = readUsers_(), settings = readSettings_(), now = Date.now();
    var isStaff = users.some(function (u) { return Core.normEmail(u.email) === email; });

    // 학생: 자기 행 하나만 읽고 씀
    if (!isStaff && (type === 'bootstrap' || Core.isStudentAct(type))) {
      var f = findStudentRow_(email);
      var db1 = { students: f ? [f.s] : [], users: users, settings: settings };
      var r1 = Core.act(db1, email, now, type, args);
      if (type === 'bootstrap') r1.result.appUrl = appUrl_();
      if (f && r1.changed.students.length) sheet_(SHEET.STU).getRange(f.row, 1, 1, NCOL).setValues([Core.toRow(db1.students[0])]);
      return JSON.stringify({ ok: true, data: r1.result, now: now });
    }

    // 교사: 미리보기(다른 스프레드시트에서 가져오기)
    if (type === 'previewSheet') {
      var me0 = Core.role({ students: [], users: users }, email);
      if (me0.role !== 'admin') throw new Error('관리자만 할 수 있어요.');
      var src = args.own ? ss_() : SpreadsheetApp.openByUrl(String(args.url || '').trim());
      var tab = args.tab ? src.getSheetByName(args.tab) : (args.own ? src.getSheetByName(SHEET.TPL) : src.getSheets()[0]);
      if (!tab) throw new Error('"' + (args.tab || SHEET.TPL) + '" 탭을 찾지 못했어요.');
      var vals = tab.getDataRange().getDisplayValues();
      return JSON.stringify({ ok: true, data: Core.parseImport(vals), now: now });
    }

    var write = Core.isWrite(type), lock = LockService.getScriptLock();
    if (write) lock.waitLock(20000);
    try {
      var db = { students: readAllStudents_(), users: users, settings: settings };
      var res = Core.act(db, email, now, type, args);
      if (res.changed.all) writeAllStudents_(db.students);
      if (res.changed.users) writeUsers_(db.users);
      if (res.changed.settings) writeSettings_(db.settings);
      if (type === 'list' && res.result.me.role === 'admin') res.result.sheetUrl = ss_().getUrl();
      if (type === 'bootstrap') res.result.appUrl = appUrl_();
      return JSON.stringify({ ok: true, data: res.result, now: now });
    } finally { if (write) lock.releaseLock(); }
  } catch (e) {
    return JSON.stringify({ ok: false, error: String(e && e.message || e) });
  }
}

/* ---------- 선택: 화면 확인용 샘플 학생 24명 넣기 ---------- */
function addSampleStudents() {
  var names = ['김하늘', '이준서', '박서연', '최도윤', '정하은', '강민재', '조유나', '윤시우', '장예린', '임건우', '한지아', '오태민'];
  var list = readAllStudents_();
  [1, 2].forEach(function (c) {
    names.forEach(function (n, i) {
      var id = '1' + ('0' + c).slice(-2) + ('0' + (i + 1)).slice(-2);
      if (list.some(function (s) { return s.id === id; })) return;
      var s = Core.blankProgress(); s.id = id; s.name = n; s.email = 'sample' + id + '@example.com'; s.cls = '1-' + c; list.push(s);
    });
  });
  writeAllStudents_(list);
}
