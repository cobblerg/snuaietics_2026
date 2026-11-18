// AI 윤리 탐험 — 앱 화면 검토용 PPT (화면 1개 = 슬라이드 1장)
// 사용법: 저장소 맨 위 폴더에서  npm install  (처음 한 번)  →  npm run ppt
// 결과: dist/AI 윤리 탐험 화면 검토.pptx
const path = require('path');
const pptxgen = require('pptxgenjs');
const { Core, LESSONS, PRE } = require('./slides.js');

const FONT = '맑은 고딕';
const HEX = { ink: '1D2250', ink2: '4B5277', ink3: '7C83A3', paper: 'EDF2F7', line: 'D3DBE6', sunk: 'E3EAF2',
  l: ['3C47A6', 'E2A512', 'E1604C'], lbg: ['E3E6F7', 'FDF1D2', 'FCE4DF'], mint: '1E9E72', mintbg: 'DDF4EA', coralbg: 'FCE4DF', yellowbg: 'FDF1D2', indigobg: 'E3E6F7' };

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.theme = { headFontFace: FONT, bodyFontFace: FONT };
pres.title = 'AI 윤리 탐험 — 화면 검토용';
const SET = Core.defaults();
const secText = s => s % 60 === 0 ? `${s / 60}분` : s > 60 ? `${Math.floor(s / 60)}분 ${s % 60}초` : `${s}초`;

pres.defineSlideMaster({ title: 'DARK', background: { color: HEX.ink },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.7, y: 2.3, w: 11.9, h: 1.6, fontSize: 44, bold: true, color: 'FFFFFF', valign: 'bottom', align: 'left' }, text: '' } }] });
pres.defineSlideMaster({ title: 'SCREEN', background: { color: 'FFFFFF' },
  slideNumber: { x: 12.3, y: 7.05, w: 0.6, h: 0.3, fontSize: 10, color: HEX.ink3, align: 'right' },
  objects: [{ placeholder: { options: { name: 'title', type: 'title', x: 0.6, y: 0.62, w: 12.1, h: 0.8, fontSize: 30, bold: true, color: HEX.ink, valign: 'top', align: 'left', margin: 0 }, text: '' } }] });

// ---------- helpers ----------
const est = (text, wIn, pt) => { const cpl = Math.max(4, Math.floor(wIn * 72 / (pt * 1.02))); let lines = 0; String(text).split('\n').forEach(p => { lines += Math.max(1, Math.ceil([...p].length / cpl)); }); return lines * pt * 1.42 / 72; };
const tb = (o) => Object.assign({ isTextBox: true, fontFace: FONT, margin: 0, valign: 'top' }, o);

function header(s, kindText, li) {
  s.addText(kindText, tb({ x: 0.6, y: 0.28, w: 9, h: 0.3, fontSize: 12, bold: true, color: li == null ? HEX.ink3 : HEX.l[li], charSpacing: 1, objectName: 'kind' }));
}
function footer(s, text) { s.addText(text, tb({ x: 0.6, y: 7.05, w: 10, h: 0.3, fontSize: 10, color: HEX.ink3, objectName: 'footer' })); }

// content blocks stacked in the left column
function blocks(s, list, X, Y, W) {
  let y = Y;
  for (const b of list) {
    if (b.t === 'lede') { const h = est(b.text, W, 16); s.addText(b.text, tb({ x: X, y, w: W, h, fontSize: 16, color: HEX.ink })); y += h + 0.22; }
    else if (b.t === 'call') { const h = est(b.text, W - 0.5, 15) + 0.36; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y, w: W, h, rectRadius: 0.12, fill: { color: HEX.ink }, line: { color: HEX.ink }, objectName: 'callout' });
      s.addText(b.runs || b.text, tb({ x: X + 0.25, y: y + 0.18, w: W - 0.5, h: h - 0.36, fontSize: 15, color: 'FFFFFF', valign: 'middle' })); y += h + 0.22; }
    else if (b.t === 'quote') { const h = est(b.text, W - 0.5, 17) + 0.75; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y, w: W, h, rectRadius: 0.12, fill: { color: 'FFFFFF' }, line: { color: HEX.l[1], width: 2 }, objectName: 'qcard' });
      s.addText(b.label || '질문 카드', tb({ x: X + 0.25, y: y + 0.15, w: 2, h: 0.3, fontSize: 12, bold: true, color: 'A67A00' }));
      s.addText(b.text, tb({ x: X + 0.25, y: y + 0.48, w: W - 0.5, h: h - 0.6, fontSize: 17, bold: true, color: HEX.ink })); y += h + 0.22; }
    else if (b.t === 'cards') {
      const cols = b.cols || b.items.length, gap = 0.2, cw = (W - gap * (cols - 1)) / cols;
      const rows = Math.ceil(b.items.length / cols); let rowH = 0;
      b.items.forEach(it => { rowH = Math.max(rowH, 0.5 + est(it[1], cw - 0.36, 13) + (it[0] ? 0.32 : 0)); });
      b.items.forEach((it, i) => { const cx = X + (i % cols) * (cw + gap), cy = y + Math.floor(i / cols) * (rowH + gap);
        const fill = it[2] || b.fill || HEX.sunk, dark = fill === HEX.ink;
        s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w: cw, h: rowH, rectRadius: 0.1, fill: { color: fill }, line: { color: fill }, objectName: 'card' });
        let ty = cy + 0.2;
        if (it[0]) { s.addText(it[0], tb({ x: cx + 0.18, y: ty, w: cw - 0.36, h: 0.32, fontSize: 14, bold: true, color: dark ? 'FFFFFF' : HEX.ink })); ty += 0.38; }
        s.addText(it[1], tb({ x: cx + 0.18, y: ty, w: cw - 0.36, h: rowH - (ty - cy) - 0.12, fontSize: 13, color: dark ? 'E7EAF8' : HEX.ink2 }));
      });
      y += rows * rowH + (rows - 1) * gap + 0.22;
    }
    else if (b.t === 'bullets') { const h = b.items.reduce((a, t) => a + est(t, W - 0.3, 15), 0) + b.items.length * 0.08;
      s.addText(b.items.map((t, i) => ({ text: t, options: { bullet: b.num ? { type: 'number' } : true, breakLine: i < b.items.length - 1, paraSpaceAfter: 4 } })), tb({ x: X, y, w: W, h, fontSize: 15, color: HEX.ink })); y += h + 0.2; }
    else if (b.t === 'table') {
      const rows = b.rows.map((r, ri) => r.map((c, ci) => ({ text: c, options: { bold: ri === 0, fill: { color: ri === 0 ? HEX.sunk : (b.rowFill && b.rowFill[ri]) || 'FFFFFF' }, color: HEX.ink, fontSize: 13, fontFace: FONT, valign: 'middle', margin: [4, 6, 4, 6] } })));
      const h = b.rows.length * (b.rowH || 0.42);
      s.addTable(rows, { x: X, y, w: W, colW: b.colW, border: { type: 'solid', pt: 0.75, color: HEX.line }, rowH: b.rowH || 0.42 }); y += h + 0.25; }
    else if (b.t === 'note') { const h = est(b.text, W, 12); s.addText(b.text, tb({ x: X, y, w: W, h, fontSize: 12, italic: true, color: HEX.ink3 })); y += h + 0.15; }
  }
  return y;
}

function checkPanel(s, ck, li) {
  const X = 8.85, Y = 1.65, W = 3.88, H = 5.25;
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X, y: Y, w: W, h: H, rectRadius: 0.14, fill: { color: HEX.lbg[li] }, line: { color: HEX.l[li], width: 1.5 }, objectName: 'checkPanel' });
  s.addText('학습 확인', tb({ x: X + 0.25, y: Y + 0.22, w: 2, h: 0.3, fontSize: 13, bold: true, color: li === 1 ? 'A67A00' : HEX.l[li] }));
  s.addText('통과해야 다음 장', tb({ x: X + 1.55, y: Y + 0.24, w: 2.1, h: 0.28, fontSize: 10, color: HEX.ink2, align: 'right' }));
  let y = Y + 0.65; const iw = W - 0.5;
  if (ck.task) {
    s.addText('활동 완료 확인', tb({ x: X + 0.25, y, w: iw, h: 0.3, fontSize: 12, bold: true, color: HEX.ink2 })); y += 0.36;
    const h = est(ck.label, iw, 15); s.addText(ck.label, tb({ x: X + 0.25, y, w: iw, h, fontSize: 15, bold: true, color: HEX.ink })); y += h + 0.2;
    if (ck.rule) { const h2 = est(ck.rule, iw, 12) + 0.2; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X + 0.2, y, w: iw + 0.1, h: h2 + 0.1, rectRadius: 0.08, fill: { color: 'FFFFFF' }, line: { color: 'FFFFFF' } });
      s.addText('통과 조건: ' + ck.rule, tb({ x: X + 0.32, y: y + 0.1, w: iw - 0.15, h: h2 - 0.1, fontSize: 12, color: HEX.ink2 })); }
    return;
  }
  const qh = est(ck.q, iw, 14); s.addText(ck.q, tb({ x: X + 0.25, y, w: iw, h: qh, fontSize: 14, bold: true, color: HEX.ink })); y += qh + 0.18;
  ck.o.forEach((o, i) => { const right = i === ck.a, oh = Math.max(0.42, est(o, iw - 0.6, 12) + 0.18);
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: X + 0.2, y, w: iw + 0.1, h: oh, rectRadius: 0.08, fill: { color: right ? HEX.mintbg : 'FFFFFF' }, line: { color: right ? HEX.mint : HEX.line, width: right ? 1.5 : 0.75 } });
    s.addText((right ? '✓ ' : (i + 1) + '  ') + o, tb({ x: X + 0.32, y, w: iw - 0.15, h: oh, fontSize: 12, bold: right, color: right ? '15724F' : HEX.ink, valign: 'middle' })); y += oh + 0.09; });
  y += 0.12;
  const eh = est(ck.e, iw, 11.5);
  if (y + eh < Y + H - 0.1) s.addText([{ text: '맞혔을 때: ', options: { bold: true } }, { text: ck.e }], tb({ x: X + 0.25, y, w: iw, h: eh, fontSize: 11.5, color: HEX.ink2 }));
  else console.warn('CHECK OVERFLOW', ck.q);
}

const LV = k => k >= 5 ? '상·중·하 모두' : k >= 3 ? '중·하 학생' : '하 학생만 (상·중은 요약으로 봄)';


// ---------- slides ----------
pres.addSection({ title: '안내' });
let s = pres.addSlide({ masterName: 'DARK', sectionTitle: '안내' });
s.addText('AI 윤리 탐험', { placeholder: 'title' });
s.addText('중학생 AI 윤리 자율 학습 사이트 · 화면 검토용 자료', tb({ x: 0.7, y: 4.05, w: 11, h: 0.5, fontSize: 20, color: 'C9CEEA' }));
s.addText('앱의 화면 하나가 슬라이드 한 장입니다. 슬라이드에서 문구를 고쳐 보내 주시면 앱에 그대로 반영할 수 있어요.', tb({ x: 0.7, y: 4.75, w: 11, h: 0.8, fontSize: 14, color: 'AEB4D3' }));
[0, 1, 2].forEach(i => { s.addShape(pres.shapes.OVAL, { x: 0.7 + i * 0.55, y: 1.6, w: 0.36, h: 0.36, fill: { color: HEX.l[i] }, line: { color: HEX.l[i] }, objectName: 'pin' + (i + 1) }); });

s = pres.addSlide({ masterName: 'SCREEN', sectionTitle: '안내' });
header(s, '학습 흐름', null); s.addText('학생은 사전 퀴즈 결과에 맞는 장부터 3차시를 스스로 학습해요', { placeholder: 'title' });
blocks(s, [
  { t: 'cards', cols: 5, items: [['1. 본인 확인', '학교 구글 계정으로 접속해 이름·학번 확인'], ['2. 사전 퀴즈', '6문항으로 수준 상·중·하 판별'], ['3. 장별 학습', '최소 시간 + 학습 확인 통과 후 다음 장'], ['4. 차시 퀴즈', '3문항, 재도전·힌트·해설'], ['5. 이수', '3차시 통과 시 이수 기록']] },
  { t: 'table', colW: [2.0, 2.4, 3.5, 4.2], rows: [['수준', '사전 퀴즈 점수', '각 차시 시작 장', '건너뛴 장'], ['상', '5~6점', '5장', '1~4장은 요약 카드로 봄'], ['중', '3~4점', '3장', '1~2장은 요약 카드로 봄'], ['하', '0~2점', '1장', '없음']] },
  { t: 'bullets', items: [`장마다 최소 ${secText(SET.chapterSec)}, 영상 장은 최소 ${secText(SET.videoSec)}가 지나야 다음 장이 열려요. 자동으로 넘어가지 않아요.`, '차시 퀴즈는 틀려도 다시 풀 수 있어요. 힌트는 원할 때, 해설은 같은 문제를 3번 틀리면 열려요.'] }
], 0.6, 1.65, 12.1);
footer(s, '안내');

pres.addSection({ title: '사전 퀴즈' });
[[0, 3], [3, 6]].forEach(([a, b], n) => {
  s = pres.addSlide({ masterName: 'SCREEN', sectionTitle: '사전 퀴즈' });
  header(s, `사전 퀴즈 · 수준 확인 (${n + 1}/2)`, null); s.addText(`사전 퀴즈 ${a + 1}~${b}번`, { placeholder: 'title' });
  const cw = (12.1 - 0.4) / 3;
  PRE.slice(a, b).forEach((q, i) => { const x = 0.6 + i * (cw + 0.2), y = 1.65;
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: cw, h: 5.2, rectRadius: 0.12, fill: { color: HEX.paper }, line: { color: HEX.paper }, objectName: 'preq' });
    s.addText(`${a + i + 1}번`, tb({ x: x + 0.25, y: y + 0.22, w: 1, h: 0.3, fontSize: 12, bold: true, color: HEX.ink3 }));
    const qh = est(q.q, cw - 0.5, 15); s.addText(q.q, tb({ x: x + 0.25, y: y + 0.6, w: cw - 0.5, h: qh, fontSize: 15, bold: true, color: HEX.ink }));
    let oy = y + 0.75 + qh;
    q.o.forEach((o, k) => { const r = k === q.a; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x + 0.2, y: oy, w: cw - 0.4, h: 0.5, rectRadius: 0.08, fill: { color: r ? HEX.mintbg : 'FFFFFF' }, line: { color: r ? HEX.mint : HEX.line, width: r ? 1.5 : 0.75 } });
      s.addText((r ? '✓ ' : (k + 1) + '  ') + o, tb({ x: x + 0.32, y: oy, w: cw - 0.6, h: 0.5, fontSize: 12.5, bold: r, color: r ? '15724F' : HEX.ink, valign: 'middle' })); oy += 0.58; });
  });
  s.addText('학생 화면에는 정답이 표시되지 않아요. 6문항을 모두 푼 뒤 점수와 수준만 알려 줘요. (✓ = 정답)', tb({ x: 0.6, y: 6.95, w: 10, h: 0.3, fontSize: 11, italic: true, color: HEX.ink3 }));
});

LESSONS.forEach((L, li) => {
  const sec = `${li + 1}차시`;
  pres.addSection({ title: sec });
  s = pres.addSlide({ masterName: 'DARK', sectionTitle: sec });
  s.addText(L.title, { placeholder: 'title' });
  s.addText(`${li + 1}차시`, tb({ x: 0.7, y: 1.7, w: 3, h: 0.5, fontSize: 20, bold: true, color: HEX.l[li] }));
  s.addText(L.sub, tb({ x: 0.7, y: 4.05, w: 11, h: 0.5, fontSize: 20, color: 'C9CEEA' }));
  s.addText([{ text: '학습 목표  ', options: { bold: true, color: HEX.l[li] } }, { text: L.goal, options: { color: 'E7EAF8' } }], tb({ x: 0.7, y: 4.8, w: 11.5, h: 0.8, fontSize: 15 }));
  s.addText(L.chapters.map((c, k) => `${k + 1}장 ${c.title}`).join('   ·   '), tb({ x: 0.7, y: 6.3, w: 11.9, h: 0.7, fontSize: 11, color: '9EA4C7' }));

  L.chapters.forEach((c, k) => {
    s = pres.addSlide({ masterName: 'SCREEN', sectionTitle: sec });
    header(s, `${li + 1}차시 · ${String(k + 1).padStart(2, '0')}장 · ${c.kind}`, li);
    s.addText(c.title, { placeholder: 'title' });
    const end = blocks(s, c.body, 0.6, 1.65, 7.9);
    if (end > 6.95) console.warn('BODY OVERFLOW', li + 1, k + 1, end.toFixed(2));
    checkPanel(s, c.check, li);
    footer(s, `${li + 1}차시 ${L.title}  ·  ${k + 1}/7장  ·  보는 학생: ${LV(k + 1)}  ·  최소 ${secText(c.video ? SET.videoSec : SET.chapterSec)}`);
    if (c.note) s.addNotes(c.note);
  });

  L.quiz.forEach((q, qi) => {
    s = pres.addSlide({ masterName: 'SCREEN', sectionTitle: sec });
    header(s, `${li + 1}차시 퀴즈 · 문제 ${qi + 1}/3`, li);
    s.addText(q.q, { placeholder: 'title', fontSize: 22 });
    let y = 1.95;
    q.o.forEach((o, k) => { const r = k === q.a; s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 7.4, h: 0.62, rectRadius: 0.1, fill: { color: r ? HEX.mintbg : 'FFFFFF' }, line: { color: r ? HEX.mint : HEX.line, width: r ? 1.75 : 1 }, objectName: 'option' });
      s.addText((r ? '✓  ' : (k + 1) + '   ') + o, tb({ x: 0.85, y, w: 7.0, h: 0.62, fontSize: 15, bold: r, color: r ? '15724F' : HEX.ink, valign: 'middle' })); y += 0.75; });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.4, y: 1.75, w: 4.3, h: 1.75, rectRadius: 0.12, fill: { color: HEX.yellowbg }, line: { color: HEX.yellowbg }, objectName: 'hint' });
    s.addText([{ text: '힌트 (요청 시)\n', options: { bold: true, color: 'A67A00', fontSize: 13 } }, { text: q.h, options: { color: HEX.ink, fontSize: 13 } }], tb({ x: 8.65, y: 1.95, w: 3.8, h: 1.4 }));
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 8.4, y: 3.7, w: 4.3, h: 2.6, rectRadius: 0.12, fill: { color: HEX.indigobg }, line: { color: HEX.indigobg }, objectName: 'explain' });
    s.addText([{ text: '해설 (정답 시 또는 오답 3회부터)\n', options: { bold: true, color: HEX.l[0], fontSize: 13 } }, { text: q.e, options: { color: HEX.ink, fontSize: 13 } }], tb({ x: 8.65, y: 3.9, w: 3.8, h: 2.3 }));
    footer(s, `${li + 1}차시 퀴즈  ·  틀려도 몇 번이든 다시 도전 · 3문항을 모두 맞혀야 ${li < 2 ? (li + 2) + '차시가 열려요' : '이수 완료'}`);
  });
});

pres.addSection({ title: '마무리' });
s = pres.addSlide({ masterName: 'DARK', sectionTitle: '마무리' });
s.addText('이수 완료', { placeholder: 'title' });
s.addText('기술의 진보는 AI가 하지만, 그 기술이 향할 올바른 길을 선택하는 것은 결국 우리의 몫입니다.', tb({ x: 0.7, y: 4.05, w: 11, h: 0.8, fontSize: 18, color: 'C9CEEA' }));
s.addText('3차시 퀴즈를 모두 통과하면 이수 일시가 구글 스프레드시트에 기록되고, 담임·관리자 화면에서 확인할 수 있어요.', tb({ x: 0.7, y: 5.0, w: 11, h: 0.7, fontSize: 14, color: 'AEB4D3' }));

(async () => {
  const f = path.join(__dirname, '..', '..', 'dist', 'AI 윤리 탐험 화면 검토.pptx');
  await pres.writeFile({ fileName: f });
  console.log('PPT 완료: ' + path.relative(path.join(__dirname, '..', '..'), f));
})();
