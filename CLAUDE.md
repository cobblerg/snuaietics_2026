# AI 윤리 탐험 — Claude Code 작업 규칙

중학생용 3차시 AI 윤리 자율 학습 웹앱. Google Apps Script(서버) + 구글 스프레드시트(데이터).
사용자는 중학교 정보 교사이며, 답은 한국어로 짧고 분명하게 한다.

## 반드시 지킬 것
- **고치는 곳은 `src/` 뿐이다.** `dist/` 는 `python build.py` 가 만든다. `dist/` 를 직접 고치지 않는다.
- 고친 뒤에는 항상 `python build.py` 를 실행해 문법 검사 통과를 확인한다.
- `dist/apps-script/Index.html` 의 앱 코드는 Base64 로 묶여 있다(Apps Script 가 일부 문자를 바꿔 `Invalid or unexpected token` 이 나던 문제의 우회). 이 방식을 바꾸려면 먼저 사용자와 상의한다.
- `null/*__BOOT__*/` 문자열은 `Code.gs` 의 `doGet` 이 첫 화면 데이터를 끼워 넣는 자리다. 지우거나 바꾸지 않는다.
- 학생 개인정보(실제 명단, 이메일, 스프레드시트 주소, 배포 `/exec` 주소)를 저장소에 넣지 않는다.

## 파일 역할
| 파일 | 내용 |
| --- | --- |
| `src/core.js` | 진행 규칙. 서버(`Core.gs`)와 화면이 **같은 파일**을 쓴다. 기본 설정값(`defaults`), 시간 제한(`remaining`), 영상 시청 확인(`watch`, `videoWatch`), 권한(`role`), 학생·권한 관리, 명단 파싱, 시트 행 변환(`toRow`/`fromRow`) |
| `src/content.js` | 교안 `LESSONS`(3차시 × 7장, 장마다 `html()`·`sum`), `PREQUIZ`, 활동 블록(신호등·데이터·톱니·선택·다짐) |
| `src/checks.js` | 장별 학습 확인 `CHECKS[차시][장]`. 일반 문제 `{q,o,a,e}`, 활동 `{task,label,test,prog,no}`, 영상 장은 `{multi:true, items:[...]}` |
| `src/app.js` | 화면 전체. `REMOTE`(배포본)와 데모 모드 분기, `api()` 호출, 학생·교사 화면, 영상 시청 추적(YouTube IFrame API) |
| `src/styles.css` | 스타일(색은 CSS 변수, 다크 모드 포함) |
| `src/Code.gs` | 서버: `doGet`, `setup`, 시트 읽기·쓰기, `api(type, argsJson)` |

합치는 순서: core → content → checks → app (`build.py`). 전역 이름이 겹치지 않게 한다.

## 데이터 구조
- 시트 `학생`: 학생 1명 = 1행, 21열. 마지막 열 `_진행데이터` 에 진행 JSON(`pre`, `lessons[3]`, `stage`, `done`, `doneAt`, `lastSeen`). 열을 늘리면 `Code.gs` 의 `NCOL`, `core.js` 의 `STUDENT_HEADERS`·`toRow`·`fromRow` 를 함께 고친다.
- 시트 `사용자`: 이메일 · 이름 · 역할(관리자/담임) · 담당학급
- 시트 `설정`: `core.js` 의 `SETTING_INFO` 항목 (chapterSec, videoSec, explainAfter, videoWatch, start상/중/하, levelHi, levelMid)
- 학생 요청은 자기 행만 읽고 쓴다(`findStudentRow_`). 교사 요청과 관리 작업은 전체를 읽고, 쓰기는 `LockService` 로 잠근다.

## 확인 방법
- `python build.py` → `dist/preview.html` 을 브라우저로 열어 데모 계정(관리자·담임·학생)으로 흐름 확인.
- 데모에서는 영상 시청 확인(`videoWatch`)이 꺼진다. 영상 관련 변경은 배포본(`/dev` 테스트 주소)에서 확인해야 한다.
- 배포: Apps Script 편집기의 세 파일을 `dist/apps-script/` 내용으로 바꾸고 **같은 배포를 새 버전으로** 재배포(주소 유지).

## 화면 검토용 PPT
- `npm install` 후 `npm run ppt` → `dist/AI 윤리 탐험 화면 검토.pptx` (pptxgenjs).
- `tools/ppt/slides.js` 가 `src/core.js`·`content.js`·`checks.js` 를 읽어 제목·퀴즈·학습 확인·시간을 가져온다.
- 장 본문은 `slides.js` 의 `BODIES[차시][장]` 에 손으로 다듬은 슬라이드용 글이다. `src/content.js` 본문을 바꾸면 `BODIES` 도 맞춰 고치고 PPT를 다시 만든다.
- 글꼴은 '맑은 고딕'(Windows 기본). 가로형 13.33×7.5in.

## 문서
- `docs/PRD.docx` 기획서, `docs/설치안내.md` 설치·배포 안내, `README.md` 전체 소개.
- 교안 내용을 바꾸면 README의 '학습 내용' 표와 맞는지 확인한다.
