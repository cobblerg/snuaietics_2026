/* ---------------- 교육 콘텐츠 (3차시 × 7장) ---------------- */
const LESSONS = [
{ title:'AI, 넌 대체 누구야?', sub:'편리함 뒤에 숨은 그림자 발견하기',
  goal:'AI가 주는 편리함과 그 뒤의 위험을 함께 보고, 개인정보와 동의의 중요성을 설명할 수 있다.',
  chapters:[
  { kind:'개념', title:'우리 곁의 AI', sum:'추천, 음성 비서, 번역, 얼굴 인식 잠금처럼 AI는 이미 생활 곳곳에 있다.',
    html:()=>`<p class="lede">오늘 아침부터 지금까지, 여러분은 AI를 몇 번 만났을까요? 생각보다 훨씬 자주 만났을 거예요.</p>
    <div class="uses">
      <div class="use"><b>영상·음악 추천</b><span>내가 본 기록으로 다음 영상을 골라 줘요</span></div>
      <div class="use"><b>음성 비서</b><span>"오늘 날씨 알려 줘"에 대답해요</span></div>
      <div class="use"><b>번역기</b><span>외국어 문장을 바로 우리말로 바꿔요</span></div>
      <div class="use"><b>얼굴 인식 잠금</b><span>내 얼굴로 휴대폰을 열어요</span></div>
      <div class="use"><b>길 찾기</b><span>막히는 길을 피해 경로를 알려 줘요</span></div>
      <div class="use"><b>챗봇</b><span>질문하면 글로 답해 줘요</span></div>
    </div>
    <div class="callout">생각해 보기: 이 기능들이 잘 작동하려면 AI는 <mark>무엇</mark>을 알고 있어야 할까요?</div>` },
  { kind:'개념', title:'인공지능의 두 얼굴', sum:'AI는 생활 편의·노인 돌봄·의료 지원 같은 빛과, 가짜뉴스·프라이버시 침해·딥페이크 같은 그림자를 함께 가진다.',
    html:()=>`<div class="grid2">
      <div class="panel light"><h4>빛 · 우리를 돕는 AI</h4><p>돌봄 로봇이 어르신의 식사를 챙기고, AI가 의사의 진단을 돕습니다.</p>
        <div class="tags"><span class="tag">#생활의_편의</span><span class="tag">#노인케어</span><span class="tag">#의료지원</span></div></div>
      <div class="panel dark"><h4>그림자 · 우리를 위협하는 AI</h4><p>진짜처럼 보이는 가짜 영상, 몰래 녹음되는 대화, 사실이 아닌 뉴스가 퍼집니다.</p>
        <div class="tags"><span class="tag">#가짜뉴스</span><span class="tag">#프라이버시_침해</span><span class="tag">#딥페이크</span></div></div>
    </div>
    <div class="callout">편리함이 주는 혜택만큼, 우리가 감당해야 할 <mark>그림자</mark>도 짙어지고 있습니다.</div>` },
  { kind:'질문', title:'왜 윤리가 필요할까?', sum:'법과 규칙만으로는 모든 상황을 통제할 수 없기 때문에 개발자와 사용자 모두에게 윤리적 나침반이 필요하다.',
    html:()=>`<div class="qcard"><span class="lbl">질문 카드</span><p>만약 감시 드론이 범죄를 100% 막아 준다면, 우리는 24시간 감시당해도 괜찮을까요?</p></div>
    <div class="grid2">
      <div class="panel mint"><h4>안전해진다면 좋지 않을까?</h4><p class="small">범죄가 사라지면 모두가 안심하고 다닐 수 있어요.</p></div>
      <div class="panel coral"><h4>내 일상이 전부 기록된다면?</h4><p class="small">어디서 누구를 만났는지 모두 남는다면 자유롭게 행동하기 어려워요.</p></div>
    </div>
    <div class="callout">법과 규칙만으로는 모든 상황을 통제할 수 없습니다. 기술을 만드는 개발자, 기술을 쓰는 사용자 모두에게 <mark>‘윤리적 나침반’</mark>이 필요한 이유입니다.</div>` },
  { kind:'시나리오 1', title:'‘친구 빨리 사귀기 앱’ 구동 중!', sum:'얼굴만 비추면 이름·취미를 알려 주는 앱은 우리의 개인정보를 먹고 자란다.',
    html:()=>`<div class="grid2" style="align-items:center">
      <div class="phone"><div class="screen">
        <svg class="face" viewBox="0 0 84 100" aria-hidden="true"><circle cx="42" cy="38" r="26" fill="#F3C9A5"/><path d="M16 34c2-20 50-24 52 0-10-8-40-8-52 0z" fill="#3B2E2A"/><circle cx="33" cy="40" r="3" fill="#1D2250"/><circle cx="51" cy="40" r="3" fill="#1D2250"/><path d="M34 52q8 6 16 0" stroke="#1D2250" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M8 100c4-26 64-26 68 0z" fill="#3C47A6"/></svg>
        <div class="scan"></div><div class="info">이름: 김민준 · 취미: 축구, 독서</div>
      </div></div>
      <div class="stack">
        <p class="lede">중학교 입학 첫날, 스마트폰 카메라로 친구 얼굴만 비추면 이름과 취미를 알려 주는 AI 앱이 있다면?</p>
        <div class="note bad"><b>편리해 보이지만…</b>혹시 소름 돋는 점은 없을까요? 이 앱은 ‘무엇’을 먹고 자라는 걸까요?</div>
        <details class="small"><summary style="cursor:pointer;font-weight:600">정답 확인하기</summary><p style="margin-top:6px">우리의 <b>개인정보</b>입니다. 얼굴 사진, 이름, 취미가 모두 데이터로 쓰여요.</p></details>
      </div>
    </div>` },
  { kind:'관점', title:'두 개의 목소리', sum:'더 많은 데이터를 원하는 개발자와 동의 없는 공유를 거부하는 친구 — 합의(동의) 없는 편의는 폭력이 될 수 있다.',
    html:()=>`<div class="bubbles">
      <div class="bubble dev"><span class="who2">앱 개발자</span>더 완벽한 앱을 위해 데이터를 최대한 모으자! 친구의 실시간 위치나 기분 상태까지 알려 주는 추가 기능도 넣으면 대박이겠지?</div>
      <div class="bubble fr"><span class="who2">화면 속 친구</span>잠깐! 내 동의 없이 내 정보가 다른 친구들에게 공유되는 건 싫어. 오늘 아침 씻지도 않고 나온 내 얼굴을 AI가 몰래 스캔하다니!</div>
    </div>
    <div class="callout"><mark>합의(동의) 없는 편의</mark>는 다른 사람에게 폭력이 될 수 있습니다.</div>
    <p class="muted small">내가 개발자라면 어떤 기능을 빼거나 바꿀까요? 친구의 입장에서 한 번 더 생각해 보세요.</p>` },
  { kind:'실천 도구', title:'프라이버시 신호등', sum:'빨간불(내 정보 아니니 괜찮다는 위험한 생각) · 노란불(무작정 수집, 사전 예방 부족) · 초록불(침해 가능성 점검과 대처 방안 마련).',
    html:()=>`<div class="signal">
      <div class="lamp" aria-hidden="true"><i class="r"></i><i class="y"></i><i class="g"></i></div>
      <div class="sig-items">
        <div class="sig r"><b>빨간불 · 절대 정지</b>"내 정보도 아닌데 뭐 어때!" — 위험한 생각</div>
        <div class="sig y"><b>노란불 · 주의 및 고민</b>"일단 무작정 수집부터 하고 보자!" — 사전 예방 부족</div>
        <div class="sig g"><b>초록불 · 진행 완료</b>침해 가능성을 미리 체크하고 대처 방안을 마련했어! — 올바른 윤리</div>
      </div>
    </div>
    <p class="muted">앱을 만들거나 쓰기 전에 신호등을 켜 보세요. 지금 내 생각은 몇 번째 불일까요?</p>` },
  { kind:'활동', title:'신호등 판정하기', sum:'상황별 생각을 신호등 색으로 판정하며 프라이버시 감수성을 점검한다.',
    html:()=>signalActivity() }
  ],
  quiz:[
    { q:'프라이버시 신호등에서 ‘빨간불(절대 정지)’에 해당하는 생각은?',
      o:['"내 정보도 아닌데 뭐 어때!"','"침해 가능성을 미리 확인하고 대처 방안을 마련했어."','"일단 무작정 수집부터 하고 보자!"','"사용자에게 먼저 동의를 받자."'], a:0,
      h:'빨간불은 가장 위험한 생각이에요. 다른 사람의 정보를 가볍게 여기는 태도를 찾아보세요.',
      e:'빨간불은 다른 사람의 개인정보를 가볍게 여기는 위험한 생각입니다. 무작정 수집은 노란불(사전 예방 부족), 미리 점검하고 대처 방안을 마련한 것은 초록불입니다.' },
    { q:'‘친구 빨리 사귀기 앱’에서 가장 핵심적인 문제는 무엇인가요?',
      o:['앱 화면 디자인이 예쁘지 않다.','친구의 동의 없이 얼굴을 스캔하고 정보를 보여 준다.','앱이 너무 느리게 작동한다.','친구를 너무 빨리 사귈 수 있다.'], a:1,
      h:'화면 속 친구는 자기 얼굴이 찍히고 있다는 걸 알고 있었을까요?',
      e:'얼굴, 이름, 취미는 모두 개인정보입니다. 수집하고 공유하려면 당사자의 동의가 먼저입니다. 합의(동의) 없는 편의는 폭력이 될 수 있습니다.' },
    { q:'법과 규칙이 있는데도 AI 윤리가 필요한 까닭으로 가장 알맞은 것은?',
      o:['AI는 사람보다 항상 정확하기 때문에','윤리를 지키면 AI가 더 빨라지기 때문에','법과 규칙만으로는 새 기술이 만드는 모든 상황을 통제할 수 없기 때문에','AI는 법을 지킬 필요가 없기 때문에'], a:2,
      h:'‘감시 드론’ 질문 카드를 떠올려 보세요. 법으로 정해지지 않은 고민이 있었죠.',
      e:'기술은 법보다 빠르게 변합니다. 법과 규칙이 미처 다루지 못하는 상황에서 개발자와 사용자가 스스로 옳은 방향을 고르는 기준, 즉 윤리적 나침반이 필요합니다.' }
  ]
},
{ title:'AI 속마음 들여다보기', sub:'내가 사용자라면? 내가 개발자라면?',
  goal:'AI 편향이 데이터에서 생긴다는 것을 이해하고, 편향을 줄이기 위한 개발자·사용자의 역할을 말할 수 있다.',
  chapters:[
  { kind:'개념', title:'AI는 어떻게 배울까?', sum:'AI는 많은 데이터 속 패턴을 찾아 학습하므로, 무엇을 보고 배웠는지가 판단을 결정한다.',
    html:()=>`<p class="lede">AI는 스스로 생각해서 똑똑해지는 게 아니에요. 사람이 보여 준 <b>많은 예시(데이터)</b>에서 규칙을 찾아냅니다.</p>
    <div class="grid3">
      <div class="panel sunk"><h4>1. 데이터 모으기</h4><p class="small">고양이 사진 1만 장, 강아지 사진 1만 장</p></div>
      <div class="panel sunk"><h4>2. 패턴 찾기</h4><p class="small">귀 모양, 털, 얼굴 생김새의 차이를 스스로 찾아요</p></div>
      <div class="panel sunk"><h4>3. 판단하기</h4><p class="small">처음 보는 사진도 "고양이!"라고 맞혀요</p></div>
    </div>
    <div class="callout">그렇다면 AI가 <mark>한쪽으로 치우친 사진</mark>만 보고 배웠다면 어떻게 될까요?</div>` },
  { kind:'시나리오 2', title:'인공지능은 언제나 공정할까?', sum:'가상 피팅 거울이 10대 여학생을 ‘40대 남성, 우울함’으로 잘못 판단했다. AI는 스스로 편견을 만들지 않으며 원인은 데이터에 있다.',
    html:()=>`<div class="grid2" style="align-items:center">
      <div class="panel sunk" style="text-align:center;padding:26px">
        <p class="eyebrow">VIRTUAL FITTING · 분석 결과</p>
        <p style="font-family:var(--display);font-size:34px;color:var(--red);margin:8px 0">40대 남성, 우울함</p>
        <p class="muted">실제: 10대 여학생, 신남</p>
      </div>
      <div class="stack">
        <h3>왜 똑똑한 AI가 성별, 나이, 감정을 엉터리로 판단했을까요?</h3>
        <p class="lede">AI는 스스로 편견을 만들지 않습니다. 정답은 바로 <b>‘데이터’</b>에 있습니다.</p>
      </div>
    </div>` },
  { kind:'원리', title:'Garbage In → Garbage Out', sum:'잘못된(편향된) 데이터가 들어가면 오작동·특정 그룹 배제 같은 차별적 결과가 나온다.',
    html:()=>`<div class="gigo">
      <div class="box panel indigo"><div class="blocks">${'<i style="background:var(--l1)"></i>'.repeat(7)}<i style="background:var(--l2)"></i></div><b>편향된 데이터</b><p class="small muted">한쪽 성별, 특정 인종에만 치우친 데이터</p></div>
      <div class="arrow">→</div>
      <div class="box panel sunk"><b>AI 학습</b><p class="small muted">들어온 그대로 배워요</p></div>
      <div class="arrow">→</div>
      <div class="box panel coral"><b>차별적인 결과물</b><p class="small muted">오작동, 특정 그룹 배제</p></div>
    </div>
    <div class="callout">공식: <mark>Garbage In → Garbage Out</mark>. 잘못된 데이터가 들어가면 잘못된 결과가 나옵니다.</div>` },
  { kind:'사례', title:'편향은 어디서 올까?', sum:'과거 지원자 대부분이 남성이던 이력서로 학습한 채용 AI가 여성 지원자를 불리하게 평가해 폐기된 사례가 있다.',
    html:()=>`<p class="lede">어느 글로벌 기업은 과거 10년 치 이력서로 <b>채용 AI</b>를 학습시켰어요. 그런데 그 시절 지원자는 대부분 남성이었습니다.</p>
    <div class="grid3">
      <div class="panel indigo"><h4>데이터</h4><p class="small">과거 합격자 대부분이 남성</p></div>
      <div class="panel yellow" style="background:var(--yellow-bg)"><h4>AI가 배운 규칙</h4><p class="small">"남성 지원자가 더 적합하다"</p></div>
      <div class="panel coral"><h4>결과</h4><p class="small">여성 지원자에게 낮은 점수 → 결국 사용 중단</p></div>
    </div>
    <p class="muted">AI는 사회에 이미 있던 편견을 그대로 배우고, 때로는 더 크게 키웁니다.</p>` },
  { kind:'영상', title:'AI는 편견에서 자유로울 수 있을까?', sum:'영상으로 AI 편견 사례(이미지 생성, 얼굴 인식, 채용 AI 등)와 데이터 균형을 통한 개선 방법을 살펴본다.',
    html:()=>`<div class="video">
      ${videoEmbed()}
      <div class="stack">
        <p class="eyebrow">시청 포인트</p>
        <ol class="list">
          <li>AI 이미지 생성기에 ‘CEO’를 그리게 하면 어떤 모습이 많이 나왔나요?</li>
          <li>얼굴 인식, 채용 AI에서는 어떤 문제가 있었나요?</li>
          <li>표정 인식 AI는 어떤 방법으로 문제를 고쳤나요?</li>
          <li>AI를 감시하고 바로잡는 일은 누구의 몫일까요?</li>
        </ol>
        <a class="btn ghost" href="${VIDEO_URL}" target="_blank" rel="noopener" data-a="video">YouTube에서 영상 보기 ↗</a>
        <p class="tiny muted">${REMOTE?'영상이 재생되지 않으면 YouTube에서 보기를 눌러 새 탭에서 보세요.':'영상은 새 탭에서 열려요. 다 본 뒤 이 탭으로 돌아와 다음 장으로 넘어가세요.'}</p>
      </div>
    </div>` },
  { kind:'개념', title:'기능 ON: 다양성 존중 · 데이터 관리', sum:'편향을 줄이려면 세상의 다양한 모습을 담은 데이터를 골고루 학습시키고 데이터를 꾸준히 관리해야 한다.',
    html:()=>`<div class="grid2">
      <div class="panel mint"><h4>[다양성 존중] ON</h4><p>성별, 나이, 피부색, 장애 여부 등 세상의 다양한 모습을 골고루 담은 데이터로 학습시킵니다.</p></div>
      <div class="panel indigo"><h4>[데이터 관리] ON</h4><p>데이터가 어디서 왔는지, 한쪽으로 치우치지 않았는지 꾸준히 점검하고 고칩니다.</p></div>
    </div>
    <div class="callout">편향을 줄이기 위해서는 세상의 <mark>다양한 모습</mark>을 담은 데이터를 골고루 학습시켜야 합니다.</div>
    <p class="muted small">사용자도 할 일이 있어요. AI 결과가 이상하면 그대로 믿지 말고 의심하고, 신고하고, 알려야 합니다.</p>` },
  { kind:'활동', title:'개발자 미션: 어떤 데이터로 학습시킬까?', sum:'데이터 구성 비율을 비교해 더 공정한 학습 데이터를 고르는 활동.',
    html:()=>datasetActivity() }
  ],
  quiz:[
    { q:'가상 피팅 거울이 10대 여학생을 ‘40대 남성, 우울함’으로 판단한 가장 큰 원인은?',
      o:['거울이 고장 났다.','학생이 표정을 잘못 지었다.','학습 데이터가 특정 성별·연령에 치우쳐 있었다.','AI가 일부러 거짓말을 했다.'], a:2,
      h:'AI는 스스로 편견을 만들지 않아요. AI가 무엇을 보고 배웠는지 떠올려 보세요.',
      e:'AI는 학습한 데이터 속 패턴대로 판단합니다. 10대 여학생 데이터가 부족하고 특정 집단 데이터가 많았다면, 처음 보는 모습을 엉뚱하게 판단하게 됩니다.' },
    { q:'‘Garbage In → Garbage Out’을 바르게 설명한 것은?',
      o:['데이터가 많을수록 결과는 항상 정확하다.','편향된 데이터로 학습하면 차별적인 결과가 나올 수 있다.','쓰레기 분류에는 AI를 쓰면 안 된다.','AI는 데이터 없이도 학습할 수 있다.'], a:1,
      h:'입구(In)에 무엇이 들어갔는지가 출구(Out)를 결정해요.',
      e:'잘못되거나 치우친 데이터가 들어가면 AI도 잘못되거나 치우친 결과를 냅니다. 데이터의 양보다 균형과 품질이 중요합니다.' },
    { q:'AI 편향을 줄이기 위해 개발자가 할 일로 가장 알맞은 것은?',
      o:['다양한 성별·나이·인종의 모습을 담은 데이터를 골고루 학습시킨다.','데이터 수를 최대한 줄인다.','한 그룹의 데이터만 집중해서 많이 모은다.','결과를 확인하지 않고 빨리 출시한다.'], a:0,
      h:'‘다양성 존중’과 ‘데이터 관리’ 스위치를 떠올려 보세요.',
      e:'세상의 다양한 모습을 고르게 담은 데이터로 학습시키고, 결과가 특정 집단에 불리하지 않은지 꾸준히 점검하는 것이 편향을 줄이는 핵심입니다.' }
  ]
},
{ title:'우리가 함께 만드는 미래', sub:'책임, 안전, 그리고 지구를 구하는 AI',
  goal:'AI의 책임성·투명성·공공성을 이해하고, 신뢰할 수 있는 AI를 위한 나의 다짐을 세울 수 있다.',
  chapters:[
  { kind:'시나리오 3', title:'지구를 구하는 AI', sum:'AI는 환경 오염, 자원 부족 같은 전 지구적 문제 해결에 쓰일 수 있다. 핵심 가치는 공공성과 연대성(SDGs).',
    html:()=>`<p class="lede">AI는 나 혼자만의 편리함이 아니라, 환경 오염이나 자원 부족 같은 전 지구적 문제를 해결하는 훌륭한 도구가 될 수 있습니다.</p>
    <div class="grid3">
      <div class="panel mint"><h4>분리배출 AI</h4><p class="small">페트병, 캔, 유리를 자동으로 구분해 재활용률을 높여요</p></div>
      <div class="panel indigo"><h4>기후 예측 AI</h4><p class="small">폭우와 폭염을 미리 알려 피해를 줄여요</p></div>
      <div class="panel light"><h4>에너지 절약 AI</h4><p class="small">건물 냉난방을 똑똑하게 조절해요</p></div>
    </div>
    <div class="callout">핵심 가치: <mark>공공성과 연대성</mark>. 모두가 함께 혜택을 나누고 지속 가능한 미래(SDGs)를 위해 협력하는 것.</div>` },
  { kind:'질문', title:'책임의 무게: 사고가 난다면 누구의 잘못일까?', sum:'자율주행차 사고나 AI 판사의 잘못된 판결처럼, AI의 결정에도 누군가 책임질 수 있어야 한다.',
    html:()=>`<div class="qcard"><span class="lbl">질문 카드</span><p>자율주행차가 사고를 내거나, AI 판사가 죄 없는 사람에게 벌을 내린다면 누구의 잘못일까요?</p></div>
    <div class="grid2">
      <div class="panel sunk"><h4>후보를 떠올려 보세요</h4><ul class="list small"><li>AI를 만든 개발자</li><li>AI를 판매한 회사</li><li>AI를 사용한 사람</li><li>AI 그 자체?</li></ul></div>
      <div class="panel sunk"><h4>생각해 보기</h4><p class="small">AI는 벌을 받거나 사과할 수 없어요. 그렇다면 책임은 결국 누가 져야 할까요?</p></div>
    </div>` },
  { kind:'개념', title:'투명성과 책임성·안전성', sum:'투명성: AI가 왜 그런 판단을 했는지 사람이 이해·설명할 수 있어야 한다. 책임성·안전성: 결과에 책임질 안전망이 필요하다.',
    html:()=>`<div class="grid2">
      <div class="panel light"><h4>[투명성]</h4><p>AI가 ‘왜’ 그런 판단을 했는지 과정을 사람이 이해하고 설명할 수 있어야 합니다.</p></div>
      <div class="panel mint"><h4>[책임성 · 안전성]</h4><p>결과에 대해 누군가는 반드시 책임을 질 수 있는 안전망이 필요합니다.</p></div>
    </div>
    <p class="muted">설명할 수 없는 판단은 잘못돼도 고칠 수 없어요. 그래서 투명성과 책임성은 함께 갑니다.</p>` },
  { kind:'관점 통합', title:'우리가 AI를 통제하는 방법', sum:'개발자: 편향 없는 데이터 수집·투명한 알고리즘·안전성 테스트. 사용자: 개인정보 보호 설정·비판적 수용·오용 및 악용 금지.',
    html:()=>`<div class="grid2">
      <div class="panel mint"><h4>[개발자의 역할]</h4><ul class="list"><li>편향 없는 데이터 수집</li><li>투명한 알고리즘 설계</li><li>안전성 테스트 철저</li></ul></div>
      <div class="panel coral"><h4>[사용자의 역할]</h4><ul class="list"><li>개인정보 보호 설정</li><li>비판적으로 AI 결과 수용하기</li><li>오용 및 악용 금지</li></ul></div>
    </div>
    <div class="callout">인공지능 윤리는 기계의 윤리가 아닙니다. 그것을 만들고 다루는 <mark>‘우리(사람)’의 윤리</mark>입니다.</div>` },
  { kind:'정리', title:'신뢰할 수 있는 AI를 위한 10가지 세팅 값', sum:'인권 보장, 프라이버시 보호, 다양성 존중, 침해 금지, 공공성, 연대성, 데이터 관리, 책임성, 안전성, 투명성.',
    html:()=>gearsBlock() },
  { kind:'Your Turn', title:'당신의 선택은?', sum:'사회적 편의 발전과 프라이버시 보호 사이에서 나의 가치를 선택하고 이유를 써 본다.',
    html:()=>choiceBlock() },
  { kind:'다짐', title:'The Creator’s Pledge · 우리의 다짐', sum:'우리는 단순한 사용자가 아니라 AI의 방향을 결정하는 설계자이다.',
    html:()=>pledgeBlock() }
  ],
  quiz:[
    { q:'‘AI가 왜 그런 판단을 했는지 사람이 이해하고 설명할 수 있어야 한다’는 요건은?',
      o:['연대성','투명성','공공성','다양성 존중'], a:1,
      h:'속이 훤히 들여다보이는 유리를 떠올려 보세요.',
      e:'투명성은 AI의 판단 과정을 사람이 이해하고 설명할 수 있어야 한다는 요건입니다. 설명할 수 있어야 잘못을 찾고 책임을 물을 수 있습니다.' },
    { q:'다음 중 ‘사용자의 역할’에 해당하는 것은?',
      o:['편향 없는 데이터 수집','투명한 알고리즘 설계','비판적으로 AI 결과 수용하기','안전성 테스트 철저'], a:2,
      h:'나머지 셋은 AI를 ‘만드는’ 사람이 하는 일이에요.',
      e:'사용자는 개인정보 보호 설정, AI 결과를 비판적으로 받아들이기, 오용·악용 금지를 실천합니다. 데이터 수집, 알고리즘 설계, 안전성 테스트는 개발자의 역할입니다.' },
    { q:'‘지구를 구하는 AI’ 시나리오가 보여 주는 핵심 가치는?',
      o:['프라이버시 보호와 데이터 관리','투명성과 안전성','침해 금지','공공성과 연대성'], a:3,
      h:'나 혼자가 아니라 ‘모두가 함께’ 혜택을 나누는 가치예요.',
      e:'공공성은 AI가 개인의 이익을 넘어 사회 전체의 이익에 쓰이는 것, 연대성은 다양한 사람과 세대가 함께 협력하는 것입니다.' }
  ]
}];

const PREQUIZ = [
  { q:'친구 얼굴을 비추면 이름과 취미를 알려 주는 앱이 작동하려면 꼭 필요한 것은?', o:['빠른 인터넷 속도','친구들의 얼굴·이름·취미 데이터','큰 휴대폰 화면','넉넉한 배터리'], a:1 },
  { q:'내 사진을 다른 사람과 공유하는 서비스에서 가장 먼저 필요한 것은?', o:['예쁜 필터','많은 팔로워','나의 동의(허락)','빠른 업로드'], a:2 },
  { q:'AI가 사람의 성별과 나이를 자주 틀리게 판단한다면, 가장 가능성 높은 원인은?', o:['학습 데이터가 한쪽으로 치우쳐 있다','카메라 화질이 너무 좋다','AI가 일부러 틀린다','사람들이 표정을 바꾼다'], a:0 },
  { q:'‘Garbage In, Garbage Out’의 뜻으로 알맞은 것은?', o:['쓰레기는 분리배출해야 한다','잘못된 데이터가 들어가면 잘못된 결과가 나온다','데이터는 많을수록 무조건 좋다','오래된 데이터는 버려야 한다'], a:1 },
  { q:'자율주행차 사고 후 ‘AI가 왜 그렇게 판단했는지 설명할 수 있어야 한다’는 원칙은?', o:['공공성','연대성','투명성','다양성 존중'], a:2 },
  { q:'AI 윤리에 대한 설명으로 가장 알맞은 것은?', o:['로봇이 스스로 지키는 규칙이다','AI를 만들고 사용하는 사람이 지켜야 할 윤리다','개발자만 알면 되는 내용이다','법으로 모두 정해져 있어 따로 배울 필요가 없다'], a:1 }
];

/* ---------------- 인터랙티브 블록 ---------------- */
const ACT = { sig:{}, ds:null, gear:null, choice:null, reason:'', pledge:{} };
const SIG_ITEMS = [
  { s:'"친구 단톡방 사진인데 내 것도 아니니까 다른 반 단톡방에 올려도 되겠지?"', a:'r', w:'다른 사람의 정보를 가볍게 여기는 빨간불 생각이에요.' },
  { s:'"우리 반 출석 앱인데 혹시 몰라 집 주소, 가족 연락처까지 일단 다 받아 두자."', a:'y', w:'꼭 필요하지 않은 정보까지 무작정 모으는 노란불이에요.' },
  { s:'"사진을 올리기 전에 얼굴이 나온 친구들에게 먼저 물어보고, 싫다는 친구는 가려 주자."', a:'g', w:'침해 가능성을 미리 확인하고 대처한 초록불이에요.' }
];
const SIG_LABEL = { r:['빨간불','#E5483C'], y:['노란불','#F2B825'], g:['초록불','#2DBE84'] };
function signalActivity(){
  return `<p class="lede">아래 생각들은 신호등의 몇 번째 불일까요? 각 문장에 알맞은 색을 골라 보세요.</p>
  <div class="act">${SIG_ITEMS.map((it,i)=>{ const v=ACT.sig[i];
    return `<div class="act-item"><div class="stmt">${it.s}</div>
    <div class="pick">${['r','y','g'].map(c=>`<button data-a="sig" data-i="${i}" data-c="${c}" class="${v===c?'on':''}"><span class="c" style="background:${SIG_LABEL[c][1]}"></span>${SIG_LABEL[c][0]}</button>`).join('')}</div>
    ${v?`<div class="fb ${v===it.a?'ok':'no'}">${v===it.a?'맞았어요. ':'다시 생각해 보세요. '}${v===it.a?it.w:''}</div>`:''}</div>`;}).join('')}
  </div>`;
}
function datasetActivity(){
  const sets=[
    { k:'A', name:'데이터 묶음 A', parts:[['성인 남성',72,'var(--l1)'],['성인 여성',20,'var(--l3)'],['10대',5,'var(--l2)'],['60대 이상',3,'var(--mint)']] },
    { k:'B', name:'데이터 묶음 B', parts:[['성인 남성',27,'var(--l1)'],['성인 여성',27,'var(--l3)'],['10대',23,'var(--l2)'],['60대 이상',23,'var(--mint)']] }
  ];
  const v=ACT.ds;
  return `<p class="lede">여러분은 ‘가상 피팅 거울’ 개발자입니다. 모든 손님의 나이와 성별을 잘 알아보도록 하려면 어떤 데이터로 학습시켜야 할까요?</p>
  <div class="grid2">${sets.map(s=>`<button class="ds ${v===s.k?'on':''}" data-a="ds" data-k="${s.k}">
    <b>${s.name}</b>
    <div class="stackbar">${s.parts.map(p=>`<i style="width:${p[1]}%;background:${p[2]}"></i>`).join('')}</div>
    <div class="legend">${s.parts.map(p=>`<span><i style="background:${p[2]}"></i>${p[0]} ${p[1]}%</span>`).join('')}</div>
  </button>`).join('')}</div>
  ${v==='B'?`<div class="note good"><b>좋은 선택이에요</b>여러 집단의 모습이 고르게 담긴 데이터로 학습하면 10대 여학생도, 어르신도 잘 알아볼 수 있어요. 이것이 ‘다양성 존중’과 ‘데이터 관리’입니다.</div>`:''}
  ${v==='A'?`<div class="note bad"><b>다시 생각해 보세요</b>A로 학습하면 10대와 60대 이상 손님은 거의 본 적이 없어요. 시나리오 2의 ‘40대 남성, 우울함’ 같은 오판이 또 생길 수 있어요.</div>`:''}`;
}
const GEARS = [
  ['인권 보장','a','AI는 모든 사람의 기본적인 권리와 자유를 존중해야 해요.'],
  ['프라이버시 보호','b','개인정보를 함부로 수집하거나 쓰지 않아야 해요.'],
  ['다양성 존중','a','성별·나이·장애 등과 상관없이 누구에게나 공정해야 해요.'],
  ['침해 금지','c','AI를 사람에게 해를 끼치는 데 쓰면 안 돼요.'],
  ['공공성','d','개인의 이익만이 아니라 사회 전체의 이익에 쓰여야 해요.'],
  ['연대성','b','다양한 사람과 세대가 함께 협력하고 혜택을 나눠야 해요.'],
  ['데이터 관리','c','데이터를 목적에 맞게 쓰고, 치우치지 않도록 관리해야 해요.'],
  ['책임성','d','문제가 생기면 누가 책임질지 분명해야 해요.'],
  ['안전성','b','잘못 작동하거나 위험할 때 멈출 수 있어야 해요.'],
  ['투명성','a','AI의 판단 과정을 설명할 수 있어야 해요.']
];
function gearsBlock(){
  const g=ACT.gear;
  return `<p class="lede">이 10가지 톱니바퀴 중 하나라도 빠지면, 인공지능은 우리의 삶을 위협할 수 있습니다. 톱니를 눌러 뜻을 확인해 보세요.</p>
  <div class="gears">${GEARS.map((x,i)=>`<button class="gear ${x[1]} ${g===i?'on':''}" data-a="gear" data-i="${i}"><span><span class="n">${i+1}</span>${x[0]}</span></button>`).join('')}</div>
  <div class="note exp" aria-live="polite"><b>${g==null?'톱니를 눌러 보세요':(g+1)+'. '+GEARS[g][0]}</b>${g==null?'국가 인공지능 윤리기준(2020)의 10대 핵심 요건입니다.':GEARS[g][2]}</div>`;
}
function choiceBlock(){
  const c=ACT.choice;
  return `<div class="vs">
    <button class="side a ${c==='a'?'on':''}" data-a="choice" data-c="a">‘인공지능을 활용한<br>엄청난 사회적 편의 발전’<br><span class="small muted">사회 발전 우선</span></button>
    <div class="mid">VS</div>
    <button class="side b ${c==='b'?'on':''}" data-a="choice" data-c="b">‘완벽한 개인 정보 및<br>프라이버시 보호’<br><span class="small muted">프라이버시 우선</span></button>
  </div>
  <label class="stack" for="reason" style="gap:6px"><span class="muted">정답은 없습니다. 당신은 어떤 가치가 먼저라고 생각하나요? 그 이유를 써 보세요.</span>
  <textarea id="reason" data-in="reason" placeholder="여기에 나의 생각을 적어 보세요...">${esc(ACT.reason)}</textarea></label>
  <p class="tiny muted">이 활동은 생각 정리용이며 기록은 저장되지 않아요.</p>`;
}
const PLEDGE = ['나는 다른 사람의 정보를 쓰기 전에 먼저 동의를 구하겠습니다.','나는 AI의 결과를 그대로 믿지 않고 한 번 더 확인하겠습니다.','나는 AI를 다른 사람을 해치거나 속이는 데 쓰지 않겠습니다.','나는 AI가 모두에게 공정하도록 목소리를 내겠습니다.'];
function pledgeBlock(){
  const all=PLEDGE.every((_,i)=>ACT.pledge[i]);
  return `<p class="lede">우리는 단순한 기계의 ‘사용자’가 아닙니다. 우리는 미래의 개발자, 기획자, 그리고 인공지능의 방향을 결정하는 가장 강력한 설계자입니다. 기술의 진보는 AI가 하지만, 그 기술이 향할 ‘올바른 길’을 선택하는 것은 결국 우리의 몫입니다.</p>
  <div class="pledge stack">${PLEDGE.map((p,i)=>`<label for="pl${i}"><input type="checkbox" id="pl${i}" data-a="pledge" data-i="${i}" ${ACT.pledge[i]?'checked':''}><span>${p}</span></label>`).join('')}</div>
  ${all?`<div class="note good"><b>다짐 완료</b>이제 마지막 퀴즈를 풀고 인공지능 윤리 탐험을 마무리해요.</div>`:''}`;
}

