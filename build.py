"""AI 윤리 탐험 — 빌드 스크립트

src/ 의 원본을 합쳐 아래 파일을 만듭니다.
  dist/apps-script/Code.gs     Apps Script 서버 (src/Code.gs 그대로)
  dist/apps-script/Core.gs     진행 규칙 (src/core.js 그대로)
  dist/apps-script/Index.html  Apps Script 화면 (앱 코드는 Base64로 묶음)
  dist/preview.html            브라우저로 바로 여는 데모 (앱 코드 그대로)

사용법:  python build.py
"""
import base64
import os
import shutil
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'dist')
GAS = os.path.join(OUT, 'apps-script')


def rd(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as f:
        return f.read()


def wr(path, text):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)


core = rd('core.js')
# 합치는 순서가 중요합니다: 규칙 → 교안 → 학습 확인 → 화면
js = '\n'.join([core, rd('content.js'), rd('checks.js'), rd('app.js')])
css = rd('styles.css')

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap">')

LOADING = ('<div id="busy" hidden></div>\n'
           '<div class="wrap" id="app"><p style="padding:48px 0;text-align:center;color:#4B5277;font:16px sans-serif">AI 윤리 탐험을 불러오는 중…</p></div>\n'
           '<div id="layer"></div>\n')

# 화면 코드가 깨졌을 때 빈 화면 대신 원인을 보여 줌
GUARD = r'''<script>
window.__showErr = function (msg) {
  var a = document.getElementById('app'); if (!a) return;
  a.innerHTML = '<div style="max-width:620px;margin:8vh auto 0;padding:24px;border-radius:14px;background:#FCE4DF;color:#7a1f16;font:15px/1.6 sans-serif">'
    + '<b style="font-size:17px">화면을 불러오지 못했어요</b><br>' + String(msg).replace(/[<>&]/g, '') 
    + '<br><span style="font-size:13px;opacity:.8">이 화면을 캡처해 관리자에게 보내 주세요.</span></div>';
};
window.addEventListener('error', function (e) { window.__showErr('오류: ' + (e.message || e) + (e.lineno ? ' (줄 ' + e.lineno + ')' : '')); });
</script>
'''

# Apps Script 에서 글자가 바뀌어 'Invalid or unexpected token' 이 나는 문제를 피하려고
# 앱 코드를 영문·숫자(Base64)로 감싸 넣고, 브라우저에서 풀어 실행합니다.
b64 = base64.b64encode(js.encode('utf-8')).decode('ascii')
chunks = ',\n'.join('"' + b64[i:i + 1000] + '"' for i in range(0, len(b64), 1000))
LOADER = '''<script>
(function () {
  var parts = [
''' + chunks + '''
  ];
  try {
    var bin = atob(parts.join(''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var code = new TextDecoder('utf-8').decode(bytes);
    (0, eval)(code + '\\n//# sourceURL=ai-ethics-app.js');
  } catch (e) {
    window.__showErr('앱 코드를 실행하지 못했어요: ' + (e && e.message || e));
  }
})();
</script>
'''

# Code.gs 의 doGet 이 null/*__BOOT__*/ 자리에 첫 화면 데이터를 끼워 넣습니다. 지우지 마세요.
BOOT = '<script>window.__BOOT = null/*__BOOT__*/;</script>\n'

index_html = ('<!DOCTYPE html>\n<html lang="ko">\n<head>\n<base target="_top">\n<meta charset="utf-8">\n'
              '<title>AI 윤리 탐험</title>\n' + FONTS + '\n<style>' + css + '</style>\n</head>\n<body>\n'
              + LOADING + GUARD + BOOT + LOADER + '</body>\n</html>\n')

preview_html = ('<!DOCTYPE html>\n<html lang="ko">\n<head>\n<meta charset="utf-8">\n'
                '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
                '<title>AI 윤리 탐험 (데모)</title>\n' + FONTS + '\n<style>' + css + '</style>\n</head>\n<body>\n'
                + LOADING + GUARD + '<script>\n' + js + '\n</script>\n</body>\n</html>\n')

wr(os.path.join(GAS, 'Index.html'), index_html)
wr(os.path.join(GAS, 'Core.gs'), core)
shutil.copyfile(os.path.join(SRC, 'Code.gs'), os.path.join(GAS, 'Code.gs'))
wr(os.path.join(OUT, 'preview.html'), preview_html)

# Node 가 있으면 문법 검사
check = os.path.join(OUT, '.check.js')
wr(check, js)
try:
    r = subprocess.run(['node', '--check', check], capture_output=True, text=True)
    if r.returncode != 0:
        print('문법 오류:\n' + r.stderr)
        sys.exit(1)
    print('문법 검사 통과')
except FileNotFoundError:
    print('(Node가 없어 문법 검사를 건너뜀)')
finally:
    os.remove(check)

print('빌드 완료: dist/apps-script/{Code.gs, Core.gs, Index.html}, dist/preview.html')
