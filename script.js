// ════════════════════════════════════════════════════════════
//  LED 설치 계산기  v1.0.1
//
//  섹션 구조
//  §1  스펙 데이터 & 상수
//  §2  장비 체크리스트
//  §3  메모
//  §4  탭 전환
//  §5  콘솔 & 샌딩카드
//  §6  PNG 저장 · 미리보기 · 공유
//  §7  확인 다이얼로그 & 전체 초기화
//  §8  저장 / 불러오기 (localStorage)
//  §9  소형 계산기 위젯
//  §9.5 PDF 뷰어 (PDF.js, 페이지 단위 이동)
//  §10 계산기 핵심 (면적·패널 계산 & 결과 렌더링)
//  §11 랜선 시뮬레이터 (캔버스, 포트 할당, 이벤트)
//  §12 vMix 소스 매크로 (파일 로드, 비율 변환, 다운로드)
// ════════════════════════════════════════════════════════════


// ── §1  스펙 데이터 & 상수 ────────────────────────────────

const APP_VERSION = '1.0.43';
const APP_SW_VERSION = 'v56';

const CHANGELOG = [
  { v: '1.0.43', items: ['PWA 업데이트 감지 개선 — updateViaCache:none 적용(GitHub Pages 캐시 우회), updatefound/statechange 핸들러 추가', '멀티 섹션 이미지 탭 가시성 수정 — wmUrl 없을 때 워터마크 탭 숨김, 단일↔멀티 전환 시 탭 상태 올바르게 리셋'] },
  { v: '1.0.42', items: ['멀티 섹션 모드 이름 변경 (좌·중·우 → 멀티 섹션)', '멀티 섹션 해상도 이미지 생성 추가 — 기본·워터마크·섹션별·워터마크+섹션별 4종'] },
  { v: '1.0.41', items: ['if 중괄호 추가 시 else if 구조 오파스 수정 — SyntaxError 해결'] },
  { v: '1.0.40', items: ['리팩토링 — 30+ 전역 변수를 State 단일 객체로 통합, 느슨한 비교(==)→엄격한 비교(===) 전수 교체, if 문 중괄호 전수 추가, 컬럼 정렬 공백 제거'] },
  { v: '1.0.39', items: ['EC90 메뉴얼 파일명 공백 제거(MIG-EC90_User_Manual_1.0.pdf) — file:// 환경 경로 오류 수정', '워터마크 로고 getImageData 제거 — 3Y_no_bg.png는 투명 PNG이므로 drawImage 직접 렌더로 교체(CORS SecurityError 방지)'] },
  { v: '1.0.38', items: ['코드 정돈 — HTML 인라인 스타일 CSS 클래스 분리, renderResMulti 헬퍼 함수 추출(_buildCoverHtml·_buildSectionRowHtml)'] },
  { v: '1.0.37', items: ['vMix 버츄얼 인풋 생성 탭 추가 — 소스 선택·생성 수 입력 후 일괄 생성, 각 VI별 레이어(Overlay0~2) 숫자 입력+드롭다운 편집', '각 기능 탭 초기화 버튼 추가(화면비율·포지션 복사·버츄얼 인풋 생성)', '포지션 복사 적용 소스에 복사 원본 번호 표시, 전체 선택·붙여넣기 컨트롤 목록 상단 이동', '화면비율 탭 전체 선택 체크박스 제거', 'VI 순번 정확도 개선(최상위 Input 직접 카운트), 레이어 번호 입력칸 소형화'] },
  { v: '1.0.36', items: ['vMix 매크로 소스 선택 적용 — 순서 번호 표시, 개별 체크박스로 선택 후 Widescreen 변환, 소스 위치값(줌·이동·레이어 전체) 복사→다른 소스에 붙여넣기'] },
  { v: '1.0.35', items: ['vMix 소스 매크로 탭 추가 — .vmix 파일 업로드 후 소스 화면비율을 원본→와이드스크린(16:9)으로 일괄 변환, 수정된 파일 다운로드'] },
  { v: '1.0.34', items: ['vMix 보정 비율에 소스 조정값 추가 — LED < 소스 시 양쪽 자르기 픽셀(각 Xpx), LED > 소스 시 확대 배율(×Z), 한쪽 자르기 3px 이하/확대 2% 이하면 시각 오차 미미 표시'] },
  { v: '1.0.33', items: ['vMix 보정 비율 알고리즘 개선 — 각 섹션 독립 반올림으로 픽셀 변화 최소화, 합산 오차는 오차가 큰 섹션이 ±1스텝 흡수, 최대 픽셀 변화 표시'] },
  { v: '1.0.32', items: ['vMix 보정 비율 재설계 — 유효 픽셀 단위(T/gcd(100000,T)) 기반, 중앙 확대(좌우 내림)·좌우 확대(좌우 올림) 두 모드, 좌우 대칭 자동 적용, 보정 비율 5자리 표기, 픽셀 변화 표시'] },
  { v: '1.0.31', items: ['vMix 보정 비율 계산 추가 — 중앙 조정(좌우 확정·중앙 흡수)·좌우 대칭 조정(중앙 확정·좌우 동일) 두 모드, 대칭 불가 시 중앙 ±1px 두 옵션 제시, 보정 비율(10자리)·비율·픽셀 변화 표시'] },
  { v: '1.0.30', items: ['vMix 픽셀 검증 재설계 — LED 실제 해상도 고정 기준, 5자리 비율×전체 vs 실제 픽셀 오차 비교, 반올림 시 중앙 흡수 픽셀 변동, 오차 있을 때 10자리 정수화 비율 제시'] },
  { v: '1.0.29', items: ['멀티 모드 Y이동 소수점 3자리로 축소, vMix 픽셀 계산 숨김 패널 추가 (해상도 입력 → 정수 여부·흡수 섹션·최소 권장 해상도 표시)'] },
  { v: '1.0.28', items: ['멀티 모드 비율 소수점 5자리로 확대, 좌측·우측에 vMix Y축 이동값 추가 표시 (좌: 비율-1, 우: 1-비율)'] },
  { v: '1.0.27', items: ['멀티 모드 계산 결과에 섹션별 가로 해상도 비율 표시 — 전체 가로를 1로 두고 소수점 4자리'] },
  { v: '1.0.26', items: ['자동 할당 규칙 적용 — 포트 양끝 바닥행 보장을 위해 짝수 열 단위로 분배, 나머지는 새 포트 강제 없이 그대로 할당 (섹션별 분리·통합 모두 적용)'] },
  { v: '1.0.25', items: ['멀티 모드 키보드 방향키 할당 수정 — 섹션 프리픽스 처리로 화면 표시 정상화', '할당 순서 번호가 배선 경로 위에 표시되도록 드로우 순서 수정', '자동 할당 두 가지 모드 추가 — 섹션별 분리(기존) · 통합(전체 하나의 벽으로 처리)'] },
  { v: '1.0.24', items: ['멀티 모드 배선 경로 수정 — 섹션 간 포트 연결 시 배선 연속 표시, 순서 번호 전 섹션 통합'] },
  { v: '1.0.23', items: ['랜선 시뮬레이터 멀티 모드 — 좌/중/우 섹션 통합 캔버스 표시(섹션 간 간격 구분)', '포트 1개로 여러 섹션 패널 동시 할당 가능(섹션 간 포트 연결)', '자동 할당 시 섹션 순서대로 포트 연속 배분'] },
  { v: '1.0.22', items: ['설치 면적 단일/멀티(좌·중·우) 모드 토글 추가', '멀티 모드: 좌측·중앙·우측 각각 독립 입력, 좌↔우 크기 복사 버튼', '계산 결과: 합산 패널 수 + 섹션별/전체 해상도 분리 표시'] },
  { v: '1.0.21', items: ['워터마크 레이어 순서 개선 — 사명 타일 최하단 배치, 우하단 로고 제거, 좌상단 로고 크기 확대(18%)'] },
  { v: '1.0.20', items: ['로고 이미지 git 추가(배포 누락 수정), 흰 배경 픽셀 제거 후 투명 PNG로 합성'] },
  { v: '1.0.19', items: ['워터마크 로고 렌더링 수정 — getImageData 제거(CORS SecurityError 원인), drawImage 직접 렌더로 교체'] },
  { v: '1.0.18', items: ['해상도 숫자·주황 바 완전 불투명, 워터마크 로고 좌상단 추가(좌상단·우하단 양쪽 배치)'] },
  { v: '1.0.17', items: ['워터마크 사명 타일 → 캔버스 텍스트 직접 렌더(이미지 의존 제거), 로고 RGB>230 투명 처리 + 0.80'] },
  { v: '1.0.16', items: ['워터마크 가시성 재개선 — 텍스트 알파 이중곱 제거(→순백 255), 타일 0.30·로고 0.70'] },
  { v: '1.0.15', items: ['워터마크 가시성 개선 — 픽셀 처리로 흰 배경 제거, 텍스트 흰색 반투명 타일, 로고 흰 배경 제거'] },
  { v: '1.0.14', items: ['주황 장식선 두께 격자선의 2배로 수정', '_buildWmCanvas 구조 개선 — 탭 항상 표시, 이미지 로드 실패 격리'] },
  { v: '1.0.13', items: ['격자선 볼드(opacity 0.60, lineWidth 개선)', 'SW캐시에 3Y 이미지 추가 → 워터마크 탭 정상 표시'] },
  { v: '1.0.12', items: ['해상도 이미지 격자 실선·폰트 1.5배 확대', '워터마크 버전 추가 — 사명 대각선 타일·우하단 로고, 기본/워터마크 탭 선택'] },
  { v: '1.0.11', items: ['해상도 이미지 리디자인 — 라벨·px 단위 제거, 폰트 60% 축소, × 주황 강조, 비네팅·장식선 추가'] },
  { v: '1.0.10', items: ['자동할당 배분 방식 변경 — 앞 포트부터 최대 열 수 채우기 (Greedy, 균등 배분 후순위)'] },
  { v: '1.0.9', items: ['여유분 입력 필드 전역 CSS 충돌 해소 (width:100% 덮어쓰기 방지, 여유 텍스트 옆 인라인 배치)'] },
  { v: '1.0.8', items: ['여유분 입력 필드 줄바꿈 방지 (여유 텍스트와 동일 줄 배치, 세 자리 수 표시 너비)'] },
  { v: '1.0.7', items: ['자동할당 4규칙 적용 (65만px·바닥시작·바닥끝허용·포트최소화)', '해상도 이미지 생성 기능 추가 (패널 격자 점선·중앙 해상도 표시)'] },
  { v: '1.0.6', items: ['자동할당 포트당 65만px 초과 방지 (열 수 정확 제한)', '자동할당 뱀 경로 시작·끝 항상 바닥행 보장 (짝수 열 단위)', '1번랜 메인·백업 카운트 폰트 가시성 개선', '여유분 입력필드 너비 축소 (여유 텍스트 옆 배치)'] },
  { v: '1.0.5', items: ['비활성 포트 레이블 시인성 개선 (아웃라인 강도 동일화)', '순서 번호를 배선 경로 위에 렌더링 (3-pass 구조)', '순서 번호 흰 원형 배지 디자인', 'cc-qty-row 13px / 여유분 입력 필드 20px 소형화'] },
  { v: '1.0.4', items: ['포트 레이블 다크 아웃라인으로 시인성 개선', '케이블 수량 카드 컴팩트 재설계 (필요·여유 한 줄 표시, 인라인 입력 필드)'] },
  { v: '1.0.3', items: ['랜선 시뮬레이터 배선 경로 베지어 곡선으로 매끄럽게 개선', '셀에 포트 내 연결 순서 번호 표시', '케이블 여유분 직접 수정 가능 (필요 개수·여유분 분리 표시)'] },
  { v: '1.0.2', items: ['콘솔 칩 순서 변경 (EC90 → J6 우선)', '케이블 수량 표시 UI 전면 개선 (카드형 컴팩트 레이아웃)', '1번 랜 계산 메인+백업 2배 적용', '전 케이블 여유분 자동 포함 및 표시', '숏랜 20개/숏파워 10개 묶음 수 표시', '뱀경로 화살표 시인성 개선 (흰 외곽선 추가)'] },
  { v: '1.0.1', items: ['SW 캐시 버전 관리 개선', 'PDF 뷰어 풀스크린 · 연속 스크롤', '핀치 줌 · 줌아웃 최솟값 적용', 'Samsung Internet 다운로드 버그 수정', '앱 업데이트 자동감지 배너 추가', 'PDF 뷰어 뒤로가기 버튼 앱 종료 버그 수정', 'EC90 메뉴얼 파일명 공백 오류 수정', 'manifest id 추가 — Google Play Protect 경고 해소', '랜선 시뮬레이터 자동 포트 할당 기능 추가'] },
  { v: '1.0.0', items: ['최초 릴리스 — 면적/패널 계산, 체크리스트, 메모, PNG 저장'] },
];

// LED 피치별 패널 해상도 (px) — px500: 500×500mm 패널, px1000: 500×1000mm 패널
const SPECS = {
  '2mm': { px500: { w: 192, h: 192 }, px1000: { w: 192, h: 384 } },
  '3mm': { px500: { w: 128, h: 128 }, px1000: { w: 128, h: 256 } },
  '4mm': { px500: { w: 104, h: 104 }, px1000: { w: 104, h: 208 } },
};

const MAX_PX = 650000; // 포트당 최대 픽셀 수 상한
const LP_MS = 380;    // 마우스 롱프레스 임계값 (ms)
const LP_TOUCH = 600;   // 터치 롱프레스 임계값 (ms) — 일반 탭과 명확히 구분하기 위해 더 길게 설정

// 포트 8개에 대응하는 색상
const PC = ['#378ADD','#E24B4A','#EF9F27','#1D9E75','#7F77DD','#D85A30','#5DCAA5','#D4537E'];

// 콘솔 장비 스펙
const CSPEC = {
  EC90: { cable: 'LC 광케이블', rep: 'HDMI 리피터', manual: 'MIG-EC90_User_Manual_1.0.pdf' },
  J6:   { cable: 'SC 광케이블', rep: 'DVI 리피터',  manual: 'J6-Seamless-Switcher-Specifications-V2.2.0.pdf' },
};

// 샌딩카드 스펙 — modes 배열: Hz 내림차순으로 커버 가능 여부를 판단
const SSPEC = {
  '660pro': {
    label: '660 Pro',
    manual: 'MCTRL660PRO.pdf',
    modes: [
      { maxW: 1920, maxH: 1200, maxHz: 60 },
      { maxW: 2560, maxH: 1600, maxHz: 30 },
    ],
  },
  '4k': {
    label: '4K',
    manual: 'MCTRL4K.pdf',
    modes: [{ maxW: 3840, maxH: 2160, maxHz: 60 }],
  },
};


// ── 전역 앱 상태 ──────────────────────────────────────────

const State = {
  // 선택 상태
  curLed:      null,
  basePH:      null,
  curSending:  null,

  // 면적 / 시뮬레이터 모드
  areaMode:     'single',
  activeSimSec: 'center',

  // 단일 모드 레이아웃
  cols:   0,
  layout: [],

  // 멀티 모드 레이아웃 (_mkSec 은 함수 선언이라 호이스팅됨)
  multiSec:       { left: _mkSec(), center: _mkSec(), right: _mkSec() },
  multiCvOffsets: { left: -1, center: -1, right: -1 },

  // 랜선 시뮬레이터
  pA:       Array.from({ length: 8 }, () => new Set()),
  pH2:      Array.from({ length: 8 }, () => []),
  aPort:    0,
  fCell:    null,
  cellW:    40,
  rH:       [],
  lpT:      null,
  drag:     false,
  dStk:     [],
  dHov:     null,
  spareAdj: { l1: 2, sl: 20, c1: 2, sp: 20 },

  // 체크리스트
  COM: [
    '케이블타이','메인선','분전함','샌딩카드 (컨트롤러)','광케이블',
    '셋팅용 노트북','메인 노트북','3구 파워콘','멀티탭',
    '공구통 (쪽가위·드라이버·줄자·개퍼테이프·전동공구·깔판 등)',
    '모니터','콘솔','리피터',
  ],
  COND: [
    '안전모','하네스',
    '220V 1번 파워','랜선 커플러','파워콘 커플러','프로파일','웨이트',
    '옐로재킷','고무판','비닐','끈바','깔깔이','접지봉',
    'HDMI','프롬프터','전기릴선','퍼팩트큐','테이블',
    '카메라','삼각대','오인페','SDI 케이블','캡처보드',
  ],
  chkState: {},

  // 메모
  memoList: [],

  // 버전 이스터에그
  _verTaps:  0,
  _verTimer: null,

  // vMix 픽셀 검증
  vmixOpen:    false,
  vmixAdjMode: 'center',
  _vmixSec:    null,
  _vmixTW:     0,

  // 소형 계산기
  cDisp: '0', cPrev: null, cOp: null, cNew: true, cExpr: '',
};
State.COM.concat(State.COND).forEach(n => { State.chkState[n] = false; });


// ── §2  장비 체크리스트 ───────────────────────────────────

// 체크리스트 전체 렌더링
function renderCL() {
  function mk(n) {
    const d = State.chkState[n];
    const safe = n.replace(/\\/g, '\\\\').replace(/'/g, "\\'"); // onclick 문자열 이스케이프
    return `<div class="ci${d ? ' done' : ''}" onclick="tog('${safe}')">
      <input type="checkbox"${d ? ' checked' : ''} onclick="event.stopPropagation();tog('${safe}')">
      <span class="cil">${n}</span>
      <button class="del-btn" onclick="event.stopPropagation();delItem('${safe}')">×</button>
    </div>`;
  }
  document.getElementById('commonList').innerHTML = State.COM.map(mk).join('');
  document.getElementById('condList').innerHTML = State.COND.map(mk).join('');

  const all = State.COM.length + State.COND.length;
  const done = Object.values(State.chkState).filter(Boolean).length;
  document.getElementById('progFill').style.width = (all ? Math.round(done / all * 100) : 0) + '%';
  document.getElementById('progTxt').textContent = done + ' / ' + all;
}
function tog(n) { State.chkState[n] = !State.chkState[n]; renderCL(); }
function clearAllChecks() { Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; }); renderCL(); }
function delItem(n) {
  const ci = State.COM.indexOf(n), di = State.COND.indexOf(n);
  if (ci >= 0) { State.COM.splice(ci, 1); } else { if (di >= 0) State.COND.splice(di, 1); }
  delete State.chkState[n];
  renderCL();
}
function addItem(section) {
  const inp = document.getElementById('add-' + section);
  const name = inp.value.trim();
  if (!name) { return; }
  if (section === 'common') { if (!State.COM.includes(name))  { State.COM.push(name);  State.chkState[name] = false; } }
  else                      { if (!State.COND.includes(name)) { State.COND.push(name); State.chkState[name] = false; } }
  inp.value = '';
  renderCL();
}
renderCL(); // 페이지 로드 시 초기 렌더링


// ── §3  메모 ──────────────────────────────────────────────


function renderMemo() {
  document.getElementById('memoList').innerHTML = State.memoList.map((t, i) =>
    `<div class="memo-item">
      <span class="memo-txt">${t}</span>
      <button class="del-btn" onclick="delMemo(${i})">×</button>
    </div>`
  ).join('');
}
function addMemo() {
  const inp = document.getElementById('add-memo');
  const t = inp.value.trim();
  if (!t) { return; }
  State.memoList.push(t); inp.value = ''; renderMemo();
}
function delMemo(i) { State.memoList.splice(i, 1); renderMemo(); }


// ── §4  탭 전환 & 버전 표시 ──────────────────────────────

function swTab(id, btn) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tab-btn').forEach(b  => b.classList.remove('on'));
  document.getElementById('tab-' + id).classList.add('on');
  btn.classList.add('on');
}

document.getElementById('appVersion').textContent = 'v' + APP_VERSION;

// 버전 5번 탭 → 이스터에그
function _onVersionTap() {
  State._verTaps++;
  clearTimeout(State._verTimer);
  if (State._verTaps >= 5) {
    State._verTaps = 0;
    document.getElementById('easterSwVer').textContent = 'SW ' + APP_SW_VERSION;
    const log = document.getElementById('easterLog');
    log.innerHTML = CHANGELOG.map(c =>
      `<div class="e-log-row"><span class="e-log-v">v${c.v}</span><ul>${c.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`
    ).join('');
    document.getElementById('easterBg').style.display = 'flex';
  } else {
    State._verTimer = setTimeout(() => { State._verTaps = 0; }, 1800);
  }
}
function closeEaster()    { document.getElementById('easterBg').style.display = 'none'; }
function closeEasterBg(e) { if (e.target === document.getElementById('easterBg')) closeEaster(); }


// ── §5  콘솔 & 샌딩카드 ──────────────────────────────────

function selConsole(el) {
  document.querySelectorAll('#consoleChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  const s = CSPEC[el.dataset.v];
  document.getElementById('cableType').textContent = s.cable;
  document.getElementById('repeaterType').textContent = s.rep;
  const lnk = document.getElementById('consoleManual');
  lnk.onclick = () => openManual(s.manual, el.dataset.v + ' 메뉴얼');
  lnk.style.display = 'inline-flex';
  document.getElementById('consoleInfo').style.display = 'block';
}
function selSending(el) {
  document.querySelectorAll('#sendingChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  State.curSending = el.dataset.v;
  const s = SSPEC[State.curSending];
  const lnk = document.getElementById('sendingManual');
  lnk.onclick = () => openManual(s.manual, s.label + ' 메뉴얼');
  lnk.style.display = 'inline-flex';
  document.getElementById('sendingInfo').style.display = 'block';
  if (isReady()) { renderRes(); }
}


// ── §6  PNG 저장 · 미리보기 · 공유 ───────────────────────

function openModal()     { document.getElementById('modalBg').style.display = 'flex'; }
function closeModal()    { document.getElementById('modalBg').style.display = 'none'; }
function closeModalBg(e) { if (e.target === document.getElementById('modalBg')) closeModal(); }

// dataURL → 파일 다운로드 (앵커를 DOM에 추가·제거해야 모든 브라우저에서 동작)
function dl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function dateStr() {
  return new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '');
}

// ── 미리보기 모달 ─────────────────────────────────────────

let pendingDownload = null; // { dataUrl, filename }
let _resVersions = null; // { normal, wm } — 해상도 이미지 이중 버전

function showPreview(dataUrl, filename) {
  pendingDownload = { dataUrl, filename };
  document.getElementById('previewImg').src = dataUrl;
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}
function closePreviewModal() {
  document.getElementById('previewBg').style.display = 'none';
  pendingDownload = null;
  _resVersions = null;
  document.getElementById('previewImg').src = '';
  document.getElementById('resVersionTabs').style.display = 'none';
}
function closePreview(e) {
  if (e.target === document.getElementById('previewBg')) { closePreviewModal(); }
}
function confirmDownload() {
  if (pendingDownload) { dl(pendingDownload.dataUrl, pendingDownload.filename); }
  closePreviewModal();
}

// 공유 — Web Share API 사용 (모바일에서 다른 앱으로 전달)
async function shareImage() {
  if (!pendingDownload) { return; }
  try {
    const res = await fetch(pendingDownload.dataUrl);
    const blob = await res.blob();
    const file = new File([blob], pendingDownload.filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      // 파일 공유 지원 (Android Chrome 등)
      await navigator.share({ files: [file], title: 'LED 설치 계산기' });
    } else if (navigator.share) {
      // 파일 미지원, 텍스트만 공유
      await navigator.share({ title: 'LED 설치 계산기', text: pendingDownload.filename });
    } else {
      alert('이 브라우저는 공유 기능을 지원하지 않습니다.\n다운로드 후 공유해주세요.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') { console.warn(err); } // 사용자 취소는 무시
  }
}

// ── 해상도 이미지 생성 ────────────────────────────────────

function _loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function _buildResCanvas(sp, tW, tH) {
  const cv = document.createElement('canvas');
  cv.width = tW;
  cv.height = tH;
  const ctx = cv.getContext('2d');

  // 배경
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, tW, tH);

  // 중앙 비네팅 — 텍스트 대비 강조
  const vg = ctx.createRadialGradient(tW/2, tH/2, 0, tW/2, tH/2, Math.hypot(tW, tH) / 2);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, tW, tH);

  // 실선 격자 — 패널 경계선
  const gridLW = Math.max(2, Math.round(tW / 700));
  ctx.strokeStyle = 'rgba(255,255,255,0.60)';
  ctx.lineWidth = gridLW;
  ctx.setLineDash([]);

  const pw = sp.px500.w;
  for (let x = pw; x < tW; x += pw) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tH); ctx.stroke();
  }

  let y = 0;
  State.layout.forEach(r => {
    y += ppx(r.type).h;
    if (y < tH) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tW, y); ctx.stroke();
    }
  });

  // 중앙 해상도 텍스트 (기존 60% 대비 1.5배 = 원본 90%)
  const fs = Math.round(Math.max(28, Math.min(Math.round(tH * 0.13), 120)) * 0.9);
  const font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = font;

  // W × H — × 만 주황색
  const wStr = `${tW}`, sepStr = '  ×  ', hStr = `${tH}`;
  const wW = ctx.measureText(wStr).width;
  const sepW = ctx.measureText(sepStr).width;
  const hW = ctx.measureText(hStr).width;
  const sx = tW / 2 - (wW + sepW + hW) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillText(wStr, sx, tH / 2);
  ctx.fillStyle = '#FF7A2A';
  ctx.fillText(sepStr, sx + wW, tH / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(hStr, sx + wW + sepW, tH / 2);

  // 주황 장식선 — 격자선 두께의 2배, 완전 불투명
  const lineLen = (wW + sepW + hW) * 1.2;
  const gap = fs * 0.72;
  ctx.strokeStyle = '#FF7A2A';
  ctx.lineWidth = gridLW * 2;
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 - gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 - gap); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 + gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 + gap); ctx.stroke();

  return cv;
}

async function _buildWmCanvas(sp, tW, tH) {
  const cv = document.createElement('canvas');
  cv.width = tW;
  cv.height = tH;
  const ctx = cv.getContext('2d');

  // ── Layer 1: 배경 + 비네팅 ──
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, tW, tH);
  const vg = ctx.createRadialGradient(tW/2, tH/2, 0, tW/2, tH/2, Math.hypot(tW, tH) / 2);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, tW, tH);

  // ── Layer 2: 사명 타일 (최하단 — 격자·텍스트 아래) ──
  const wmText = '3Y ENTERTAINMENT';
  const fSize = Math.round(Math.max(24, tW * 0.022));
  ctx.save();
  ctx.font = `600 ${fSize}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(wmText).width;
  const stepX = Math.round(textW  * 1.6);
  const stepY = Math.round(fSize  * 5.2);
  const halfD = Math.ceil(Math.hypot(tW, tH) / 2) + Math.max(stepX, stepY);
  ctx.translate(tW / 2, tH / 2);
  ctx.rotate(-Math.PI / 6);
  for (let r = -Math.ceil(halfD / stepY); r <= Math.ceil(halfD / stepY) + 1; r++) {
    for (let c = -Math.ceil(halfD / stepX); c <= Math.ceil(halfD / stepX) + 1; c++) {
      ctx.fillText(wmText, c * stepX, r * stepY);
    }
  }
  ctx.restore();

  // ── Layer 3: 격자선 ──
  const gridLW = Math.max(2, Math.round(tW / 700));
  ctx.strokeStyle = 'rgba(255,255,255,0.60)';
  ctx.lineWidth = gridLW;
  ctx.setLineDash([]);
  const pw = sp.px500.w;
  for (let x = pw; x < tW; x += pw) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tH); ctx.stroke();
  }
  let y = 0;
  State.layout.forEach(r => {
    y += ppx(r.type).h;
    if (y < tH) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tW, y); ctx.stroke(); }
  });

  // ── Layer 4: 해상도 텍스트 + 주황 바 ──
  const fs = Math.round(Math.max(28, Math.min(Math.round(tH * 0.13), 120)) * 0.9);
  ctx.font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const wStr = `${tW}`, sepStr = '  ×  ', hStr = `${tH}`;
  const wW = ctx.measureText(wStr).width;
  const sepW = ctx.measureText(sepStr).width;
  const hW = ctx.measureText(hStr).width;
  const sx = tW / 2 - (wW + sepW + hW) / 2;
  ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, sx, tH / 2);
  ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, sx + wW, tH / 2);
  ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, sx + wW + sepW, tH / 2);
  const lineLen = (wW + sepW + hW) * 1.2;
  const gap = fs * 0.72;
  ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 - gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 - gap); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 + gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 + gap); ctx.stroke();

  // ── Layer 5: 회사 로고 (좌상단, 충분히 크게) ──
  // 3Y_no_bg.png는 이미 투명 PNG이므로 getImageData 픽셀 처리 불필요
  try {
    const logoImg = await _loadImg('3Y_no_bg.png');
    const logoW = Math.round(tW * 0.18);
    const logoH = Math.round(logoW * logoImg.height / logoImg.width);
    const margin = Math.round(tW * 0.03);
    ctx.save();
    ctx.globalAlpha = 0.90;
    ctx.drawImage(logoImg, margin, margin, logoW, logoH);
    ctx.restore();
  } catch { /* 로고 없이 계속 */ }

  return cv;
}

async function genResImage() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed];
  const tW = State.cols * sp.px500.w;
  let tH = 0;
  State.layout.forEach(r => { tH += ppx(r.type).h; });

  const baseCv = _buildResCanvas(sp, tW, tH);
  const filename = `LED_${tW}x${tH}_${dateStr()}.png`;

  // _buildWmCanvas는 throw하지 않으므로 탭이 항상 표시됨
  let wmUrl = null;
  try {
    const wmCv = await _buildWmCanvas(sp, tW, tH);
    wmUrl = wmCv.toDataURL('image/png');
  } catch { /* 치명적 실패 시 탭 없이 기본 버전만 */ }

  const baseUrl = baseCv.toDataURL('image/png');
  showResPreview(baseUrl, wmUrl, filename);
}

// ── 멀티 섹션 이미지 생성 ─────────────────────────────────

function _drawBgVignette(ctx, tW, tH) {
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, tW, tH);
  const vg = ctx.createRadialGradient(tW/2, tH/2, 0, tW/2, tH/2, Math.hypot(tW, tH)/2);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, tW, tH);
}

function _drawWmTiles(ctx, tW, tH) {
  const wmText = '3Y ENTERTAINMENT';
  const fSize = Math.round(Math.max(24, tW * 0.022));
  ctx.save();
  ctx.font = `600 ${fSize}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(wmText).width;
  const stepX = Math.round(textW * 1.6);
  const stepY = Math.round(fSize * 5.2);
  const halfD = Math.ceil(Math.hypot(tW, tH) / 2) + Math.max(stepX, stepY);
  ctx.translate(tW / 2, tH / 2);
  ctx.rotate(-Math.PI / 6);
  for (let r = -Math.ceil(halfD / stepY); r <= Math.ceil(halfD / stepY) + 1; r++) {
    for (let c = -Math.ceil(halfD / stepX); c <= Math.ceil(halfD / stepX) + 1; c++) {
      ctx.fillText(wmText, c * stepX, r * stepY);
    }
  }
  ctx.restore();
}

function _drawMultiGrid(ctx, sp, secInfo, totalTW, maxTH) {
  const gridLW = Math.max(2, Math.round(totalTW / 700));
  const pw = sp.px500.w;
  const active = ['left','center','right'].filter(k => secInfo[k]);
  ctx.strokeStyle = 'rgba(255,255,255,0.60)';
  ctx.lineWidth = gridLW;
  let secX = 0;
  active.forEach(k => {
    const sec = secInfo[k];
    for (let x = pw; x < sec.tW; x += pw) {
      ctx.beginPath(); ctx.moveTo(secX + x, 0); ctx.lineTo(secX + x, maxTH); ctx.stroke();
    }
    let y = 0;
    sec.layout.forEach(r => {
      y += ppx(r.type).h;
      if (y < maxTH) { ctx.beginPath(); ctx.moveTo(secX, y); ctx.lineTo(secX + sec.tW, y); ctx.stroke(); }
    });
    secX += sec.tW;
  });
  if (active.length > 1) {
    ctx.strokeStyle = 'rgba(255,255,255,0.90)';
    ctx.lineWidth = gridLW * 2;
    let dx = 0;
    active.slice(0, -1).forEach(k => {
      dx += secInfo[k].tW;
      ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, maxTH); ctx.stroke();
    });
  }
  return gridLW;
}

function _drawMultiResText(ctx, secInfo, totalTW, maxTH, gridLW, showSecRes) {
  if (showSecRes) {
    const LABELS = { left: '좌측', center: '중앙', right: '우측' };
    const active = ['left','center','right'].filter(k => secInfo[k]);
    let sx = 0;
    active.forEach(k => {
      const sec = secInfo[k];
      const cx = sx + sec.tW / 2;
      const cy = maxTH / 2;
      const fs = Math.round(Math.max(18, Math.min(sec.tH * 0.13, sec.tW * 0.12, 100)) * 0.9);
      const gap = fs * 0.72;
      const lfs = Math.round(fs * 0.48);
      ctx.font = `500 ${lfs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
      ctx.fillStyle = '#FF7A2A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(LABELS[k], cx, cy - gap - lfs);
      const wStr = `${sec.tW}`, sepStr = '  ×  ', hStr = `${sec.tH}`;
      ctx.font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const wW = ctx.measureText(wStr).width;
      const sepW = ctx.measureText(sepStr).width;
      const hW = ctx.measureText(hStr).width;
      const textX = cx - (wW + sepW + hW) / 2;
      ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, textX, cy);
      ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, textX + wW, cy);
      ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, textX + wW + sepW, cy);
      const lineLen = (wW + sepW + hW) * 1.2;
      ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
      ctx.beginPath(); ctx.moveTo(cx - lineLen/2, cy - gap); ctx.lineTo(cx + lineLen/2, cy - gap); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - lineLen/2, cy + gap); ctx.lineTo(cx + lineLen/2, cy + gap); ctx.stroke();
      sx += sec.tW;
    });
  } else {
    const fs = Math.round(Math.max(28, Math.min(maxTH * 0.13, 120)) * 0.9);
    ctx.font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const wStr = `${totalTW}`, sepStr = '  ×  ', hStr = `${maxTH}`;
    const wW = ctx.measureText(wStr).width;
    const sepW = ctx.measureText(sepStr).width;
    const hW = ctx.measureText(hStr).width;
    const sx2 = totalTW / 2 - (wW + sepW + hW) / 2;
    ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, sx2, maxTH / 2);
    ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, sx2 + wW, maxTH / 2);
    ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, sx2 + wW + sepW, maxTH / 2);
    const lineLen = (wW + sepW + hW) * 1.2;
    const gap = fs * 0.72;
    ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
    ctx.beginPath(); ctx.moveTo(totalTW/2 - lineLen/2, maxTH/2 - gap); ctx.lineTo(totalTW/2 + lineLen/2, maxTH/2 - gap); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(totalTW/2 - lineLen/2, maxTH/2 + gap); ctx.lineTo(totalTW/2 + lineLen/2, maxTH/2 + gap); ctx.stroke();
  }
}

function _buildMultiResCanvas(sp, secInfo, totalTW, maxTH, showSecRes) {
  const cv = document.createElement('canvas');
  cv.width = totalTW; cv.height = maxTH;
  const ctx = cv.getContext('2d');
  _drawBgVignette(ctx, totalTW, maxTH);
  const gridLW = _drawMultiGrid(ctx, sp, secInfo, totalTW, maxTH);
  _drawMultiResText(ctx, secInfo, totalTW, maxTH, gridLW, showSecRes);
  return cv;
}

async function _buildMultiWmCanvas(sp, secInfo, totalTW, maxTH, showSecRes) {
  const cv = document.createElement('canvas');
  cv.width = totalTW; cv.height = maxTH;
  const ctx = cv.getContext('2d');
  _drawBgVignette(ctx, totalTW, maxTH);
  _drawWmTiles(ctx, totalTW, maxTH);
  const gridLW = _drawMultiGrid(ctx, sp, secInfo, totalTW, maxTH);
  _drawMultiResText(ctx, secInfo, totalTW, maxTH, gridLW, showSecRes);
  try {
    const logoImg = await _loadImg('3Y_no_bg.png');
    const logoW = Math.round(totalTW * 0.18);
    const logoH = Math.round(logoW * logoImg.height / logoImg.width);
    const margin = Math.round(totalTW * 0.03);
    ctx.save(); ctx.globalAlpha = 0.90;
    ctx.drawImage(logoImg, margin, margin, logoW, logoH);
    ctx.restore();
  } catch { /* 로고 없이 계속 */ }
  return cv;
}

async function genResImageMulti() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed];
  let totalTW = 0, maxTH = 0;
  const secInfo = {};
  ['left','center','right'].forEach(k => {
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length) { secInfo[k] = null; return; }
    let tH = 0; sec.layout.forEach(r => { tH += ppx(r.type).h; });
    const tW = sec.cols * sp.px500.w;
    totalTW += tW; maxTH = Math.max(maxTH, tH);
    secInfo[k] = { tW, tH, cols: sec.cols, layout: [...sec.layout] };
  });
  if (!totalTW || !maxTH) { return; }
  const filename = `LED_${totalTW}x${maxTH}_${dateStr()}.png`;
  const baseUrl = _buildMultiResCanvas(sp, secInfo, totalTW, maxTH, false).toDataURL('image/png');
  const secUrl  = _buildMultiResCanvas(sp, secInfo, totalTW, maxTH, true).toDataURL('image/png');
  let wmUrl = null, wmSecUrl = null;
  try {
    wmUrl    = (await _buildMultiWmCanvas(sp, secInfo, totalTW, maxTH, false)).toDataURL('image/png');
    wmSecUrl = (await _buildMultiWmCanvas(sp, secInfo, totalTW, maxTH, true)).toDataURL('image/png');
  } catch { /* 치명적 실패 시 기본만 */ }
  _resVersions = { normal: { dataUrl: baseUrl, filename } };
  if (wmUrl)    { _resVersions.wm      = { dataUrl: wmUrl,    filename: filename.replace('.png', '_WM.png') }; }
  if (secUrl)   { _resVersions.secRes  = { dataUrl: secUrl,   filename: filename.replace('.png', '_SEC.png') }; }
  if (wmSecUrl) { _resVersions.wmSecRes = { dataUrl: wmSecUrl, filename: filename.replace('.png', '_WM_SEC.png') }; }
  document.getElementById('tabWm').style.display       = wmUrl    ? '' : 'none';
  document.getElementById('tabSecRes').style.display   = secUrl   ? '' : 'none';
  document.getElementById('tabWmSecRes').style.display = wmSecUrl ? '' : 'none';
  document.getElementById('resVersionTabs').style.display = 'block';
  selectResVersion('normal');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}


function showResPreview(baseUrl, wmUrl, filename) {
  _resVersions = { normal: { dataUrl: baseUrl, filename } };
  if (wmUrl) { _resVersions.wm = { dataUrl: wmUrl, filename: filename.replace('.png', '_WM.png') }; }
  document.getElementById('tabWm').style.display       = '';
  document.getElementById('tabSecRes').style.display   = 'none';
  document.getElementById('tabWmSecRes').style.display = 'none';
  document.getElementById('resVersionTabs').style.display = wmUrl ? 'block' : 'none';
  selectResVersion('normal');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}

function selectResVersion(v) {
  if (!_resVersions || !_resVersions[v]) { return; }
  pendingDownload = _resVersions[v];
  document.getElementById('previewImg').src = pendingDownload.dataUrl;
  ['normal','wm','secRes','wmSecRes'].forEach(t => {
    const el = document.getElementById('tab' + t[0].toUpperCase() + t.slice(1));
    if (el) { el.classList.toggle('active', t === v); }
  });
}

// ── PNG 스냅샷 생성 ──────────────────────────────────────

async function saveCalcPng() {
  if (!isReady()) { alert('LED 종류와 패널 사이즈를 먼저 선택해주세요.'); return; }

  const sp = SPECS[State.curLed];
  const tW = State.cols * sp.px500.w;
  let tH = 0; State.layout.forEach(r => { tH += ppx(r.type).h; });

  // 패널 수량
  let c5 = 0, c10 = 0;
  State.layout.forEach(r => {
    if (r.type === 'half') { c5 += State.cols; } else if (State.basePH === 1000) { c10 += State.cols; } else { c5 += State.cols; }
  });

  // 케이블 수량
  const asgn = new Set(); State.pA.forEach(s => s.forEach(k => asgn.add(k)));
  const tot = State.layout.length * State.cols, una = tot - asgn.size;
  const _lan = _calcLan(), _pw = calcPW();

  // 입력 필드 값 수집
  const W = document.getElementById('iW').value;
  const H = document.getElementById('iH').value;
  const panelEl = document.querySelector('#panelChips .chip.on');
  const consoleEl = document.querySelector('#consoleChips .chip.on');
  const mainLen = document.getElementById('mainLen').value;
  const fiberLen = document.getElementById('fiberLen').value;
  const consoleName = consoleEl  ? consoleEl.dataset.v : null;
  const consoleSpec = consoleName ? CSPEC[consoleName] : null;
  const sendingSpec = State.curSending  ? SSPEC[State.curSending]  : null;

  // 시뮬레이터 캔버스 → img 태그 (cloneNode는 캔버스 픽셀을 복사하지 않으므로 dataURL로 변환)
  const simCv = document.getElementById('simCanvas');
  const simImgHtml = simCv && simCv.width > 0
    ? `<img src="${simCv.toDataURL('image/png')}" style="width:100%;border-radius:6px;display:block;margin-bottom:4px;">`
    : '';

  // 스냅샷 HTML 헬퍼
  const S = (t, v) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><span style="color:#888">${t}</span><span style="color:#1a1a1a;font-weight:500">${v}</span></div>`;
  const SEC = t      => `<div style="font-size:10px;font-weight:600;color:#999;letter-spacing:.08em;text-transform:uppercase;margin:14px 0 6px;">${t}</div>`;

  // 샌딩카드 커버 여부 표시 블록
  let coverHtml = '';
  if (sendingSpec) {
    const modesStr = sendingSpec.modes.map(m => `${m.maxW}×${m.maxH}@${m.maxHz}Hz`).join(' / ');
    const sorted = [...sendingSpec.modes].sort((a, b) => b.maxHz - a.maxHz);
    const coverMode = sorted.find(m => tW <= m.maxW && tH <= m.maxH) || null;
    const ok = coverMode !== null;
    coverHtml = `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:6px 10px;border-radius:6px;background:${ok?'#E1F5EE':'#FCEBEB'};font-size:12px;">
      <span style="color:${ok?'#085041':'#A32D2D'}">${sendingSpec.label}: ${modesStr}</span>
      <span style="font-weight:600;color:${ok?'#0F6E56':'#E24B4A'}">${ok ? `✓ ${coverMode.maxHz}Hz` : '✗ 초과'}</span>
    </div>`;
  }

  const portRows = State.pA.map((s, i) => s.size > 0 ? `P${i+1}:${s.size}장` : null).filter(Boolean).join(' · ');
  const memoHtml = State.memoList.length
    ? SEC('메모') + State.memoList.map(t => `<div style="font-size:13px;color:#444;padding:3px 0;">• ${t}</div>`).join('')
    : '';

  const body = `
    ${SEC('기본 정보')}
    ${S('설치 면적', `${W}m × ${H}m`)}
    ${S('LED 종류', State.curLed)}
    ${S('패널 사이즈', panelEl ? panelEl.textContent.trim() : '-')}
    ${consoleName || State.curSending || mainLen ? SEC('장비') : ''}
    ${consoleName ? S('콘솔', `${consoleName} (${consoleSpec.cable} · ${consoleSpec.rep})`) : ''}
    ${consoleName && fiberLen ? S('광케이블 길이', fiberLen + 'm') : ''}
    ${State.curSending  ? S('샌딩카드', sendingSpec.label) : ''}
    ${mainLen     ? S('분전함 메인선', mainLen + 'm') : ''}
    ${SEC('계산 결과')}
    ${S('가로 패널', State.cols + ' ea')}
    ${S('세로 패널', State.layout.length + ' 행')}
    ${c5  ? S('500×500 패널',  c5  + ' ea') : ''}
    ${c10 ? S('500×1000 패널', c10 + ' ea') : ''}
    <div style="background:#E1F5EE;border-radius:8px;padding:10px 14px;margin:10px 0;text-align:center;">
      <div style="font-size:11px;color:#0F6E56;margin-bottom:3px;">최종 해상도</div>
      <div style="font-size:20px;font-weight:600;color:#085041;">${tW} × ${tH} px</div>
    </div>
    ${coverHtml}
    ${simImgHtml ? SEC('랜선 시뮬레이터') + simImgHtml : ''}
    ${SEC('케이블')}
    <div style="background:#E6F1FB;border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:13px;">
      <div style="font-weight:600;color:#0C447C;margin-bottom:8px;">랜선</div>
      <div style="display:flex;gap:8px;">
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">1번 랜</div>
          <div style="font-size:18px;font-weight:700;color:#0C447C;line-height:1.2;">${_lan.l1} 개</div>
          <div style="font-size:10px;color:#888;margin-top:3px;">메인 ${_lan.l1Main} + 백업 ${_lan.l1Back}</div>
          <div style="font-size:10px;color:#BA7517;">여유 +${_lan.l1Spare}</div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">숏랜</div>
          <div style="font-size:18px;font-weight:700;color:#0C447C;line-height:1.2;">${_lan.sl} 개</div>
          <div style="font-size:10px;color:#1D9E75;font-weight:600;margin-top:3px;">${_lan.slBundle}묶음 (×20)</div>
          <div style="font-size:10px;color:#BA7517;">여유 +${_lan.slSpare} 포함</div>
        </div>
      </div>
      ${una > 0 ? `<div style="font-size:11px;color:#BA7517;margin-top:6px;">미할당 ${una}/${tot} 패널</div>` : ''}
    </div>
    <div style="background:#FAEEDA;border-radius:8px;padding:10px 12px;font-size:13px;">
      <div style="font-weight:600;color:#633806;margin-bottom:8px;">파워콘</div>
      <div style="display:flex;gap:8px;">
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">1번 파워</div>
          <div style="font-size:18px;font-weight:700;color:#633806;line-height:1.2;">${_pw.c1} 개</div>
          <div style="font-size:10px;color:#888;margin-top:3px;">실 ${_pw.c1Net}개</div>
          <div style="font-size:10px;color:#BA7517;">여유 +${_pw.c1Spare}</div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">숏 파워</div>
          <div style="font-size:18px;font-weight:700;color:#633806;line-height:1.2;">${_pw.sp} 개</div>
          <div style="font-size:10px;color:#1D9E75;font-weight:600;margin-top:3px;">${_pw.spBundle}묶음 (×10)</div>
          <div style="font-size:10px;color:#BA7517;">여유 +${_pw.spSpare} 포함</div>
        </div>
      </div>
    </div>
    ${portRows ? SEC('포트 할당') + `<div style="font-size:13px;color:#555;line-height:1.8;">${portRows}</div>` : ''}
    ${memoHtml}
  `;

  // 숨겨진 div에 렌더링 후 html2canvas로 캡처
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;box-sizing:border-box;';
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <div style="font-size:16px;font-weight:700;color:#1a1a1a;">LED 설치 계산기</div>
      <div style="font-size:11px;color:#999;">${new Date().toLocaleDateString('ko-KR')}</div>
    </div>
    <div style="height:2px;background:#0F6E56;border-radius:1px;margin-bottom:4px;"></div>
    ${body}
    <div style="height:1px;background:#eee;margin-top:16px;"></div>
  `;
  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, { scale: 2, useCORS: true, backgroundColor: '#ffffff', allowTaint: true });
    showPreview(canvas.toDataURL('image/png'), 'LED_계산결과_' + dateStr() + '.png');
  } finally {
    document.body.removeChild(wrap);
  }
}

async function saveChkPng() {
  const el = document.getElementById('card-chk'); if (!el) return;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:16px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;';
  wrap.appendChild(el.cloneNode(true));
  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    showPreview(canvas.toDataURL('image/png'), 'LED_체크리스트_' + dateStr() + '.png');
  } finally {
    document.body.removeChild(wrap);
  }
}


// ── §7  확인 다이얼로그 & 전체 초기화 ────────────────────

// 범용 확인 팝업 — title·msg 표시 후 확인 시 onOk() 호출
function openConfirm(title, msg, onOk) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOk').onclick = () => {
    document.getElementById('confirmBg').style.display = 'none';
    onOk();
  };
  document.getElementById('confirmBg').style.display = 'flex';
}
function closeConfirm()    { document.getElementById('confirmBg').style.display = 'none'; }
function closeConfirmBg(e) { if (e.target === document.getElementById('confirmBg')) closeConfirm(); }

function tryResetAll() {
  openConfirm('전체 초기화', '계산기 탭의 모든 입력사항을 초기화할까요?', doFullReset);
}
function doFullReset() {
  // 면적 입력 초기화
  document.getElementById('iW').value = '';
  document.getElementById('iH').value = '';
  ['mW_L','mH_L','mW_C','mH_C','mW_R','mH_R'].forEach(id => { document.getElementById(id).value = ''; });
  // 모드 단일로 복귀
  State.areaMode = 'single';
  document.getElementById('modeBtn-single').classList.add('on');
  document.getElementById('modeBtn-multi').classList.remove('on');
  document.getElementById('area-single').style.display = '';
  document.getElementById('area-multi').style.display = 'none';
  State.spareAdj = { l1: 2, sl: 20, c1: 2, sp: 20 };
  // 칩 선택 초기화
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  State.curLed = null; State.basePH = null; State.curSending = null;
  // 장비 패널 숨기기
  document.getElementById('consoleInfo').style.display = 'none';
  document.getElementById('sendingInfo').style.display = 'none';
  document.getElementById('fiberLen').value = '';
  document.getElementById('mainLen').value = '';
  // 메모 & 체크리스트 초기화
  State.memoList = []; renderMemo();
  Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; }); renderCL();
  // 시뮬레이터 초기화 및 결과 영역 초기화
  rst(); State.cols = 0; State.layout = [];
  document.getElementById('resultBody').innerHTML = '<div class="hint-text">LED 종류와 패널 사이즈를 선택하세요</div>';
  document.getElementById('simArea').innerHTML = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
}


// ── §8  저장 / 불러오기 (localStorage) ───────────────────

// 현재 앱 전체 상태를 직렬화 가능한 객체로 반환
function getAppState(name) {
  return {
    name,
    date: new Date().toLocaleDateString('ko-KR'),
    W: document.getElementById('iW').value,
    H: document.getElementById('iH').value,
    areaMode: State.areaMode, activeSimSec: State.activeSimSec,
    mW_L: document.getElementById('mW_L').value,
    mH_L: document.getElementById('mH_L').value,
    mW_C: document.getElementById('mW_C').value,
    mH_C: document.getElementById('mH_C').value,
    mW_R: document.getElementById('mW_R').value,
    mH_R: document.getElementById('mH_R').value,
    curLed: State.curLed, basePH: State.basePH, curSending: State.curSending,
    consoleName: document.querySelector('#consoleChips .chip.on')?.dataset.v || null,
    fiberLen: document.getElementById('fiberLen').value,
    mainLen:  document.getElementById('mainLen').value,
    pA:  State.pA.map(s => [...s]),          // Set → Array (JSON 직렬화)
    pH2: State.pH2.map(a => [...a]),
    spareAdj: { ...State.spareAdj },
    memoList: [...State.memoList],
    chkState: { ...State.chkState },
    COM:  [...State.COM],
    COND: [...State.COND],
  };
}

// 저장된 상태 객체를 앱에 복원
function loadAppState(st) {
  document.getElementById('iW').value = st.W ?? '';
  document.getElementById('iH').value = st.H ?? '';
  State.spareAdj = st.spareAdj ? { ...st.spareAdj } : { l1: 2, sl: 20, c1: 2, sp: 20 };

  // 칩 상태 복원
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  State.curLed = null; State.basePH = null; State.curSending = null;
  if (st.curLed) {
    const el = document.querySelector(`#ledChips .chip[data-v="${st.curLed}"]`);
    if (el) { el.classList.add('on'); State.curLed = st.curLed; }
  }
  if (st.basePH) {
    const el = document.querySelector(`#panelChips .chip[data-v="${st.basePH}"]`);
    if (el) { el.classList.add('on'); State.basePH = st.basePH; }
  }

  // 콘솔·샌딩카드 복원 (selConsole/selSending이 UI도 업데이트)
  document.getElementById('consoleInfo').style.display = 'none';
  document.getElementById('sendingInfo').style.display = 'none';
  if (st.consoleName) {
    const el = document.querySelector(`#consoleChips .chip[data-v="${st.consoleName}"]`);
    if (el) { selConsole(el); }
  }
  document.getElementById('fiberLen').value = st.fiberLen || '';
  if (st.curSending) {
    const el = document.querySelector(`#sendingChips .chip[data-v="${st.curSending}"]`);
    if (el) { selSending(el); }
  }
  document.getElementById('mainLen').value = st.mainLen || '';

  // 체크리스트 복원
  if (st.COM) { State.COM = [...st.COM]; }
  if (st.COND) { State.COND = [...st.COND]; }
  Object.keys(State.chkState).forEach(k => delete State.chkState[k]);
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = st.chkState?.[n] ?? false; });
  renderCL();

  State.memoList = st.memoList || []; renderMemo();

  // 계산 실행 후 포트 할당 복원
  rst();
  if (st.areaMode === 'multi') {
    // 멀티 모드 복원
    setAreaMode('multi');
    ['mW_L','mH_L','mW_C','mH_C','mW_R','mH_R'].forEach(id => {
      document.getElementById(id).value = st[id] || '';
    });
    State.activeSimSec = st.activeSimSec || 'center';
    if (isReady()) { calcMulti(); }
    // 구버전 저장(multiPorts)을 새 형식(전역 State.pA 프리픽스 키)으로 마이그레이션
    if (st.multiPorts && isReady()) {
      State.pA = Array.from({length:8}, () => new Set());
      State.pH2 = Array.from({length:8}, () => []);
      ['left','center','right'].forEach(secName => {
        const mp = st.multiPorts[secName];
        if (!mp) { return; }
        mp.pA.forEach((arr, pi)  => arr.forEach(k => State.pA[pi].add(`${secName}:${k}`)));
        mp.pH2.forEach((arr, pi) => arr.forEach(k => State.pH2[pi].push(`${secName}:${k}`)));
      });
      drawCv(); renderPorts(); renderLeg(); renderSum();
    } else if (st.pA && isReady()) {
      State.pA = st.pA.map(a => new Set(a));
      State.pH2 = (st.pH2 || st.pA).map(a => [...a]);
      drawCv(); renderPorts(); renderLeg(); renderSum();
    }
  } else {
    if (isReady()) { calc(); }
    if (st.pA && isReady()) {
      State.pA = st.pA.map(a => new Set(a));
      State.pH2 = (st.pH2 || st.pA).map(a => [...a]);
      drawCv(); renderPorts(); renderLeg(); renderSum();
    }
  }
}

function saveState() {
  const inp = document.getElementById('saveNameInput');
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  const idx = saves.findIndex(s => s.name === name);
  const st = getAppState(name);
  if (idx >= 0) { saves[idx] = st; } else { saves.push(st); } // 동일 이름은 덮어쓰기
  localStorage.setItem('ledCalcSaves', JSON.stringify(saves));
  inp.value = '';
  renderSaveList();
}
function loadState(idx) {
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  if (saves[idx]) { loadAppState(saves[idx]); closeSaveModal(); }
}
function deleteState(idx) {
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  saves.splice(idx, 1);
  localStorage.setItem('ledCalcSaves', JSON.stringify(saves));
  renderSaveList();
}
function renderSaveList() {
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  const el = document.getElementById('saveList');
  if (!saves.length) {
    el.innerHTML = '<div style="color:#999;font-size:13px;text-align:center;padding:16px 0;">저장된 데이터가 없습니다</div>';
    return;
  }
  el.innerHTML = saves.map((s, i) => `
    <div class="save-item">
      <div>
        <div class="si-label">${s.name}</div>
        <div style="font-size:11px;color:#999;margin-top:2px;">${s.date}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="si-btn" onclick="loadState(${i})">불러오기</button>
        <button class="si-btn" style="background:#E24B4A;" onclick="deleteState(${i})">삭제</button>
      </div>
    </div>`).join('');
}
function openSaveModal()  { renderSaveList(); document.getElementById('saveBg').style.display = 'flex'; }
function closeSaveModal() { document.getElementById('saveBg').style.display = 'none'; }
function closeSaveBg(e)   { if (e.target === document.getElementById('saveBg')) closeSaveModal(); }


// ── §9  소형 계산기 위젯 ─────────────────────────────────


// 디스플레이 업데이트
function _cu() {
  document.getElementById('calcDisplay').textContent = State.cDisp;
  document.getElementById('calcExpr').textContent = State.cExpr;
}
function calcInput(v) {
  State.cDisp = State.cNew ? (State.cNew = false, v) : (State.cDisp === '0' ? v : State.cDisp + v);
  _cu();
}
function calcDot() {
  if (State.cNew) { State.cDisp = '0.'; State.cNew = false; } else if (!State.cDisp.includes('.')) { State.cDisp += '.'; }
  _cu();
}
function calcOper(op) {
  State.cPrev = parseFloat(State.cDisp); State.cOp = op; State.cNew = true; State.cExpr = State.cDisp + ' ' + op; _cu();
}
function calcEquals() {
  if (State.cPrev === null || State.cOp === null) { return; }
  const cur = parseFloat(State.cDisp);
  // '−' 는 U+2212 (버튼의 onclick 문자와 동일)
  let r = State.cOp === '+' ? State.cPrev + cur
        : State.cOp === '−' ? State.cPrev - cur
        : State.cOp === '×' ? State.cPrev * cur
        : cur !== 0   ? State.cPrev / cur
        : NaN;
  State.cExpr = State.cExpr + ' ' + State.cDisp + ' =';
  State.cDisp = isNaN(r) ? '오류' : String(parseFloat(r.toFixed(10)));
  State.cPrev = null; State.cOp = null; State.cNew = true; _cu();
}
function calcClear() { State.cDisp = '0'; State.cPrev = null; State.cOp = null; State.cNew = true; State.cExpr = ''; _cu(); }
function calcDel() {
  if (State.cNew || State.cDisp.length <= 1) { State.cDisp = '0'; State.cNew = true; } else State.cDisp = State.cDisp.slice(0, -1);
  _cu();
}
function toggleCalc() {
  const p = document.getElementById('calcPanel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}




// ════════════════════════════════════════════════════════════
//  §9.5  PDF 뷰어 (PDF.js 기반 인앱 전체화면 뷰어)
// ════════════════════════════════════════════════════════════

let _pdfDoc = null;
let _pdfTotal = 0;
let _pdfZoom = 1;
let _pinchStart = null;

// PDF 전체화면 뷰어 열기
async function openManual(filename, title) {
  document.getElementById('pdfModalTitle').textContent = title || '메뉴얼';
  document.getElementById('pdfPageInfo').textContent = '로딩 중...';
  document.getElementById('pdfPagesInner').innerHTML = '';
  document.getElementById('pdfBg').style.display = 'flex';
  history.pushState({ modal: 'pdf' }, '');
  _pdfZoom = 1;

  try {
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    _pdfDoc = await lib.getDocument(encodeURI(filename)).promise;
    _pdfTotal = _pdfDoc.numPages;
    await _renderAllPdfPages();
  } catch (err) {
    document.getElementById('pdfPageInfo').textContent = '파일을 불러올 수 없습니다.';
    console.warn('PDF 로드 오류:', err);
  }
}

// 모든 페이지를 고해상도로 렌더링 — 1페이지를 먼저 그려 빠르게 표시
async function _renderAllPdfPages() {
  const inner = document.getElementById('pdfPagesInner');
  const dpr = window.devicePixelRatio || 1;
  const cw = document.getElementById('pdfScrollOuter').clientWidth - 16;

  async function _renderOne(i) {
    const page = await _pdfDoc.getPage(i);
    const baseVp = page.getViewport({ scale: 1 });
    const scale = (cw / baseVp.width) * dpr;
    const viewport = page.getViewport({ scale });
    const origH = Math.round(viewport.height / dpr);
    const cv = document.createElement('canvas');
    cv.width = Math.round(viewport.width);
    cv.height = Math.round(viewport.height);
    cv.style.width = Math.round(cw * _pdfZoom) + 'px';
    cv.style.height = Math.round(origH * _pdfZoom) + 'px';
    cv.style.display = 'block';
    cv.dataset.page = i;
    cv.dataset.origW = cw;
    cv.dataset.origH = origH;
    inner.appendChild(cv);
    await page.render({ canvasContext: cv.getContext('2d'), viewport }).promise;
  }

  // 1페이지 먼저 렌더링 → 사용자가 즉시 내용 확인 가능
  await _renderOne(1);
  document.getElementById('pdfPageInfo').textContent = `1 / ${_pdfTotal}`;
  document.getElementById('pdfScrollOuter').scrollTop = 0;

  // 나머지 페이지 백그라운드 렌더링
  for (let i = 2; i <= _pdfTotal; i++) {
    if (!_pdfDoc) { return; } // 뷰어가 닫혔으면 중단
    document.getElementById('pdfPageInfo').textContent = `로딩중 ${i}/${_pdfTotal}...`;
    await _renderOne(i);
  }
  if (_pdfDoc) { document.getElementById('pdfPageInfo').textContent = `1 / ${_pdfTotal}`; }
}

// 스크롤 위치로 현재 페이지 번호 업데이트
function _pdfScrollTick() {
  if (!_pdfTotal) { return; }
  const outer = document.getElementById('pdfScrollOuter');
  const mid = outer.scrollTop + outer.clientHeight / 2;
  let cur = 1;
  document.querySelectorAll('#pdfPagesInner canvas').forEach(cv => {
    if (cv.offsetTop <= mid) { cur = +cv.dataset.page; }
  });
  document.getElementById('pdfPageInfo').textContent = `${cur} / ${_pdfTotal}`;
}

// 모든 캔버스의 CSS 크기를 zoom 배율에 맞게 직접 재조정
// minZoom: 캔버스 가로가 뷰어 너비를 꽉 채우는 배율 이하로는 축소 불가
function _applyZoom(z) {
  const canvases = document.querySelectorAll('#pdfPagesInner canvas');
  if (!canvases.length) { return; }
  const outer = document.getElementById('pdfScrollOuter');
  const minZoom = outer ? outer.clientWidth / (+canvases[0].dataset.origW) : 1;
  _pdfZoom = Math.min(4, Math.max(minZoom, z));
  canvases.forEach(cv => {
    cv.style.width = Math.round(+cv.dataset.origW * _pdfZoom) + 'px';
    cv.style.height = Math.round(+cv.dataset.origH * _pdfZoom) + 'px';
  });
}

function closePdfModal() {
  document.getElementById('pdfBg').style.display = 'none';
  document.getElementById('pdfPagesInner').innerHTML = '';
  _pdfDoc = null; _pdfTotal = 0; _pdfZoom = 1;
  if (history.state && history.state.modal === 'pdf') { history.back(); }
}

window.addEventListener('popstate', e => {
  if (document.getElementById('pdfBg').style.display !== 'none') {
    document.getElementById('pdfBg').style.display = 'none';
    document.getElementById('pdfPagesInner').innerHTML = '';
    _pdfDoc = null; _pdfTotal = 0; _pdfZoom = 1;
  }
});

// 스크롤 · 핀치줌 · Ctrl+휠 이벤트 — 페이지 로드 시 1회 등록
(function _attachPdfEvents() {
  const outer = document.getElementById('pdfScrollOuter');
  if (!outer) { return; }
  outer.addEventListener('scroll', _pdfScrollTick, { passive: true });

  outer.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) { return; }
    _pinchStart = {
      dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                       e.touches[0].clientY - e.touches[1].clientY),
      zoom: _pdfZoom,
    };
  }, { passive: true });

  outer.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !_pinchStart) { return; }
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                         e.touches[0].clientY - e.touches[1].clientY);
    _applyZoom(_pinchStart.zoom * (d / _pinchStart.dist));
  }, { passive: true });

  outer.addEventListener('touchend', () => { _pinchStart = null; }, { passive: true });

  // PC: Ctrl+휠 확대/축소
  outer.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) { return; }
    e.preventDefault();
    _applyZoom(_pdfZoom * (e.deltaY < 0 ? 1.1 : 0.909));
  }, { passive: false });
})();


// ════════════════════════════════════════════════════════════
//  §10  계산기 핵심 (면적·패널 계산 & 결과 렌더링)
// ════════════════════════════════════════════════════════════



const SECTION_GAP = 20;  // 멀티 모드 섹션 간 픽셀 간격
const SEC_LBL_H = 22;  // 섹션 레이블 바 높이

function _mkSec() {
  return { cols:0, layout:[], rH:[] };
}

function isReady() { return State.curLed && State.basePH; }

function selLed(el) {
  document.querySelectorAll('#ledChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); State.curLed = el.dataset.v;
  rst(); State.areaMode === 'single' ? calc() : calcMulti();
}
function selPanel(el) {
  document.querySelectorAll('#panelChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); State.basePH = parseInt(el.dataset.v);
  rst(); State.areaMode === 'single' ? calc() : calcMulti();
}

// ── 면적 모드 전환 ──────────────────────────────────────────
function setAreaMode(mode) {
  State.areaMode = mode;
  document.getElementById('modeBtn-single').classList.toggle('on', mode === 'single');
  document.getElementById('modeBtn-multi').classList.toggle('on',  mode === 'multi');
  document.getElementById('area-single').style.display = mode === 'single' ? '' : 'none';
  document.getElementById('area-multi').style.display = mode === 'multi'  ? '' : 'none';
  State.cols = 0; State.layout = [];
  rst();
  mode === 'single' ? calc() : calcMulti();
}

// ── 섹션 크기 복사 (from → to) ──────────────────────────────
function copySectionSize(from, to) {
  const ids = { left:['mW_L','mH_L'], center:['mW_C','mH_C'], right:['mW_R','mH_R'] };
  const wVal = document.getElementById(ids[from][0]).value;
  const hVal = document.getElementById(ids[from][1]).value;
  if (!wVal && !hVal) { return; }
  document.getElementById(ids[to][0]).value = wVal;
  document.getElementById(ids[to][1]).value = hVal;
  calcMulti();
}

// ── 섹션 레이아웃 계산 헬퍼 ────────────────────────────────
function calcSection(W, H) {
  const sec = { cols:0, layout:[] };
  if (!W || !H || !isReady()) { return sec; }
  sec.cols = Math.max(1, Math.round(W * 1000 / 500));
  const Hmm = H * 1000;
  if (State.basePH === 1000) {
    const fr = Math.floor(Hmm / 1000);
    if (Math.round(Hmm - fr * 1000) >= 400) { sec.layout.push({ type:'half' }); }
    for (let i = 0; i < fr; i++) sec.layout.push({ type:'full' });
  } else {
    const nr = Math.max(1, Math.round(Hmm / 500));
    for (let i = 0; i < nr; i++) sec.layout.push({ type:'full' });
  }
  return sec;
}

// ── 멀티 모드 계산 ─────────────────────────────────────────
function calcMulti() {
  const ids = { left:['mW_L','mH_L'], center:['mW_C','mH_C'], right:['mW_R','mH_R'] };
  let anyInput = false;

  ['left','center','right'].forEach(k => {
    const W = parseFloat(document.getElementById(ids[k][0]).value) || 0;
    const H = parseFloat(document.getElementById(ids[k][1]).value) || 0;
    const res = calcSection(W, H);
    // 범위 밖 포트 할당 제거 (전역 State.pA, 프리픽스 키 기준)
    State.pA.forEach((s, pi) => {
      [...s].forEach(key => {
        if (!key.startsWith(k + ':')) { return; }
        const [r, c] = key.slice(k.length + 1).split(',').map(Number);
        if (r >= res.layout.length || c >= res.cols) {
          s.delete(key); State.pH2[pi] = State.pH2[pi].filter(x => x !== key);
        }
      });
    });
    State.multiSec[k].cols = res.cols;
    State.multiSec[k].layout = res.layout;
    if (W && H) { anyInput = true; }
  });

  if (!isReady()) {
    document.getElementById('resultBody').innerHTML = '<div class="hint-text">LED 종류와 패널 사이즈를 선택하세요</div>';
    document.getElementById('simArea').innerHTML = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
    return;
  }
  if (!anyInput) {
    document.getElementById('resultBody').innerHTML = '<div class="hint-text">설치 면적을 입력하세요</div>';
    document.getElementById('simArea').innerHTML = '<div class="sim-locked">설치 면적을 먼저 입력해주세요</div>';
    return;
  }

  // 전역 State.cols/State.layout 을 활성 섹션과 동기화
  const as = State.multiSec[State.activeSimSec];
  State.cols = as.cols; State.layout = as.layout;

  renderResMulti();
  buildSim();
}

// ── 시뮬레이터 섹션 전환 (멀티 모드) ──────────────────────
function switchSimSec(sec) {
  State.activeSimSec = sec;
  const as = State.multiSec[sec];
  State.cols = as.cols; State.layout = as.layout;
  State.rH = as.rH.length ? as.rH : State.layout.map(r => r.type === 'full' ? (State.basePH === 1000 ? State.cellW * 2 : State.cellW) : State.cellW);
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

// 행 타입에 따른 픽셀 크기 반환
function ppx(rowType) {
  const s = SPECS[State.curLed];
  return rowType === 'half' ? s.px500 : (State.basePH === 1000 ? s.px1000 : s.px500);
}

// 파워콘 수량 계산
// 규칙: 열 2개당 1번 파워, 홀수 열이면 단독 열도 1개
// 숏파워: 각 열(2개 묶음)에서 패널 간 연결선 수 + 여유 20개
function calcPW() {
  const rows = State.layout.length;
  const pc = Math.floor(State.cols / 2), odd = State.cols % 2 === 1;
  let spNet = 0;
  for (let i = 0; i < pc; i++) spNet += (rows * 2) - 1;
  if (odd) { spNet += (rows - 1); }
  const c1Net = Math.ceil(State.cols / 2), c1Spare = State.spareAdj.c1, c1 = c1Net + c1Spare;
  const spSpare = State.spareAdj.sp, sp = spNet + spSpare, spBundle = Math.ceil(sp / 10);
  return { c1, c1Net, c1Spare, spNet, sp, spSpare, spBundle };
}

function calc() {
  const W = parseFloat(document.getElementById('iW').value) || 0;
  const H = parseFloat(document.getElementById('iH').value) || 0;

  // 면적 미입력 시 안내 메시지
  if (!W || !H) {
    State.cols = 0; State.layout = [];
    const msg = isReady() ? '설치 면적을 입력하세요' : 'LED 종류와 패널 사이즈를 선택하세요';
    const sim = isReady() ? '설치 면적을 먼저 입력해주세요' : 'LED 종류와 패널 사이즈를 먼저 선택해주세요';
    document.getElementById('resultBody').innerHTML = `<div class="hint-text">${msg}</div>`;
    document.getElementById('simArea').innerHTML = `<div class="sim-locked">${sim}</div>`;
    return;
  }

  State.cols = Math.max(1, Math.round(W * 1000 / 500));
  State.layout = [];

  if (!isReady()) {
    document.getElementById('resultBody').innerHTML = '<div class="hint-text">LED 종류와 패널 사이즈를 선택하세요</div>';
    document.getElementById('simArea').innerHTML = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
    return;
  }

  const Hmm = H * 1000;
  if (State.basePH === 1000) {
    // 1000mm 기준 — 나머지가 400mm 이상이면 상단에 500mm(half) 패널 추가
    const fr = Math.floor(Hmm / 1000);
    if (Math.round(Hmm - fr * 1000) >= 400) { State.layout.push({ type: 'half' }); }
    for (let i = 0; i < fr; i++) State.layout.push({ type: 'full' });
  } else {
    // 500mm 기준
    const nr = Math.max(1, Math.round(Hmm / 500));
    for (let i = 0; i < nr; i++) State.layout.push({ type: 'full' });
  }

  // 크기 변경으로 범위 밖이 된 포트 할당 셀 제거
  State.pA.forEach((s, pi) => {
    [...s].forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r >= State.layout.length || c >= State.cols) { s.delete(k); State.pH2[pi] = State.pH2[pi].filter(x => x !== k); }
    });
  });

  renderRes();
  buildSim();
}

// 샌딩카드 커버 가능 여부 HTML — Hz 높은 모드부터 체크
function _buildCoverHtml(tW, tH) {
  if (!State.curSending) { return ''; }
  const ss = SSPEC[State.curSending];
  const modesStr = ss.modes.map(m => `${m.maxW}×${m.maxH}@${m.maxHz}Hz`).join(' / ');
  const coverMode = [...ss.modes].sort((a, b) => b.maxHz - a.maxHz).find(m => tW <= m.maxW && tH <= m.maxH) || null;
  const ok = coverMode !== null;
  return `<div class="cover-row${ok ? '' : ' cover-over'}">
    <span>${ss.label}: ${modesStr}</span>
    <span class="cover-badge">${ok ? `✓ ${coverMode.maxHz}Hz 커버 가능` : '✗ 해상도 초과'}</span>
  </div>`;
}

function renderRes() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed]; let c5 = 0, c10 = 0;
  State.layout.forEach(r => {
    if (r.type === 'half') { c5 += State.cols; } else if (State.basePH === 1000) { c10 += State.cols; } else { c5 += State.cols; }
  });
  const tW = State.cols * sp.px500.w;
  let tH = 0; State.layout.forEach(r => { tH += ppx(r.type).h; });

  let h = '<div class="metric-grid">';
  h += `<div class="metric"><div class="ml">가로 패널 수</div><div class="mv">${State.cols}<span class="mu"> ea</span></div></div>`;
  h += `<div class="metric"><div class="ml">세로 패널 수</div><div class="mv">${State.layout.length}<span class="mu"> 행</span></div></div>`;
  h += `<div class="metric"><div class="ml">500×500 패널</div><div class="mv">${c5}<span class="mu"> ea</span></div></div>`;
  h += `<div class="metric"><div class="ml">500×1000 패널</div><div class="mv">${c10}<span class="mu"> ea</span></div></div>`;
  h += '</div>';
  h += `<div class="res-banner"><div class="rl">최종 해상도</div><div class="rv">${tW} × ${tH} px</div><button class="res-img-btn" onclick="genResImage()">이미지 생성 →</button></div>`;
  h += _buildCoverHtml(tW, tH);
  h += `<div class="panel-spec-note">패널 해상도 — 500×500: ${sp.px500.w}×${sp.px500.h}px · 500×1000: ${sp.px1000.w}×${sp.px1000.h}px</div>`;
  document.getElementById('resultBody').innerHTML = h;
}


// 섹션 행 하나를 HTML로 변환
function _buildSectionRowHtml(k, r, totalTW) {
  const label = { left:'좌측', center:'중앙', right:'우측' }[k];
  if (!r) { return `<div class="res-section"><div class="res-sec-label">${label}</div><div class="res-sec-empty">미입력</div></div>`; }
  const ratioNum = totalTW ? r.tW / totalTW : 0;
  const ratio = totalTW ? ratioNum.toFixed(5) : '—';
  let offsetHtml = '';
  if (totalTW) {
    if (k === 'left') { offsetHtml = ` <span class="res-offset-note">Y이동: ${(ratioNum - 1).toFixed(3)}</span>`; }
    if (k === 'right') { offsetHtml = ` <span class="res-offset-note">Y이동: ${(1 - ratioNum).toFixed(3)}</span>`; }
  }
  return `<div class="res-section"><div class="res-sec-label">${label} — 가로 ${r.cols}ea × 세로 ${r.rows}행 <span class="res-ratio-note">(비율 ${ratio})</span>${offsetHtml}</div><div class="res-sec-val">${r.tW} × ${r.tH} px</div></div>`;
}

function renderResMulti() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed];

  let totalC5 = 0, totalC10 = 0, totalTW = 0, maxTH = 0;
  const secInfo = {};

  ['left','center','right'].forEach(k => {
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length) { secInfo[k] = null; return; }
    let c5 = 0, c10 = 0;
    sec.layout.forEach(r => {
      if (r.type === 'half') { c5 += sec.cols; } else if (State.basePH === 1000) { c10 += sec.cols; } else { c5 += sec.cols; }
    });
    let tH = 0; sec.layout.forEach(r => { tH += ppx(r.type).h; });
    const tW = sec.cols * sp.px500.w;
    totalC5 += c5; totalC10 += c10; totalTW += tW; maxTH = Math.max(maxTH, tH);
    secInfo[k] = { c5, c10, tW, tH, cols: sec.cols, rows: sec.layout.length };
  });

  // 합산 패널 수
  let h = '<div class="metric-grid">';
  h += `<div class="metric"><div class="ml">500×500 패널 (합계)</div><div class="mv">${totalC5}<span class="mu"> ea</span></div></div>`;
  h += `<div class="metric"><div class="ml">500×1000 패널 (합계)</div><div class="mv">${totalC10}<span class="mu"> ea</span></div></div>`;
  h += '</div>';

  // 전체 해상도 배너
  if (totalTW && maxTH) {
    h += `<div class="res-banner"><div class="rl">전체 해상도</div><div class="rv">${totalTW} × ${maxTH} px</div><button class="res-img-btn" onclick="genResImageMulti()">이미지 생성 →</button></div>`;
    h += _buildCoverHtml(totalTW, maxTH);
  }

  // 섹션별 해상도 + 가로 비율
  h += '<div class="res-section-list">';
  ['left','center','right'].forEach(k => { h += _buildSectionRowHtml(k, secInfo[k], totalTW); });
  h += '</div>';
  h += `<div class="panel-spec-note">패널 해상도 — 500×500: ${sp.px500.w}×${sp.px500.h}px · 500×1000: ${sp.px1000.w}×${sp.px1000.h}px</div>`;

  // vMix 픽셀 검증 토글 섹션
  State._vmixSec = secInfo;
  State._vmixTW = totalTW;
  h += `<div style="margin-top:8px;">
    <button class="vmix-toggle-btn" onclick="toggleVmixCalc()">${State.vmixOpen ? '▲' : '▼'} vMix 픽셀 검증</button>
    <div id="vmixPanel" style="display:${State.vmixOpen ? 'block' : 'none'};">
      <div id="vmixResult"></div>
    </div>
  </div>`;

  document.getElementById('resultBody').innerHTML = h;
  if (State.vmixOpen) { renderVmixCalc(); }
}


// ── vMix 픽셀 검증 ────────────────────────────────────────

function toggleVmixCalc() {
  State.vmixOpen = !State.vmixOpen;
  const panel = document.getElementById('vmixPanel');
  const btn = document.querySelector('.vmix-toggle-btn');
  if (!panel || !btn) { return; }
  panel.style.display = State.vmixOpen ? 'block' : 'none';
  btn.textContent = (State.vmixOpen ? '▲' : '▼') + ' vMix 픽셀 검증';
  if (State.vmixOpen) { renderVmixCalc(); }
}

function setVmixAdjMode(m) {
  State.vmixAdjMode = m;
  renderVmixCalc();
}

function renderVmixCalc() {
  const el = document.getElementById('vmixResult');
  if (!el || !State._vmixSec || !State._vmixTW) { if (el) el.innerHTML = ''; return; }

  const NAMES = { left:'좌측', center:'중앙', right:'우측' };
  const keys = ['left','center','right'].filter(k => State._vmixSec[k]);
  if (keys.length < 2) { el.innerHTML = '<div style="font-size:12px;color:#bbb;padding:4px 0;">활성 섹션 2개 이상 필요</div>'; return; }

  const T = State._vmixTW;
  const hasL = keys.includes('left'), hasR = keys.includes('right'), hasC = keys.includes('center');

  // 5자리 비율 × T vs 실제 픽셀
  const S = {};
  keys.forEach(k => {
    const actual = State._vmixSec[k].tW;
    const ratio5   = parseFloat((actual / T).toFixed(5));
    const computed = ratio5 * T;
    S[k] = { actual, computed, ocha: computed - actual, ratio5 };
  });

  // 반올림: 좌·우 기준, 중앙 흡수 (오차 테이블용)
  const rnd = {};
  if (hasL) { rnd.left = Math.round(S.left.computed); }
  if (hasR) { rnd.right = Math.round(S.right.computed); }
  if (hasC) { rnd.center = T - (rnd.left || 0) - (rnd.right || 0); } else { if (hasL && hasR) rnd.right = T - rnd.left; }
  const anyRoundErr = keys.some(k => rnd[k] !== S[k].actual);

  // ── 오차 테이블 ──
  let h = `<div class="vmix-header">전체 가로 <b>${T}px</b> 기준</div>`;
  h += '<table class="vmix-tbl"><thead><tr>';
  h += '<th>섹션</th><th>실제 px</th><th>비율×전체</th><th>오차</th>';
  if (anyRoundErr) { h += '<th>반올림 px</th>'; }
  h += '</tr></thead><tbody>';
  keys.forEach(k => {
    const s = S[k];
    const noErr = s.ocha === 0;
    const compStr = noErr ? `${s.actual}` : s.computed.toFixed(4);
    const ochaStr = noErr ? '—' : (s.ocha > 0 ? '+' : '') + s.ocha.toFixed(4);
    const ochaClass = noErr ? 'vmix-zero' : (Math.abs(s.ocha) < 0.5 ? 'vmix-warn-sm' : 'vmix-frac');
    h += `<tr><td class="vmix-name">${NAMES[k]}</td><td class="vmix-int">${s.actual}</td><td>${compStr}</td><td><span class="${ochaClass}">${ochaStr}</span></td>`;
    if (anyRoundErr) {
      const r = rnd[k], diff = r - s.actual;
      const absorbMark = (k === 'center' && hasL && hasR) ? '<span class="vmix-absorb"> 흡수</span>' : '';
      const rndCell = diff === 0 ? `<span class="vmix-int">${r}</span>`
        : `<span class="vmix-frac">${r} (${diff > 0 ? '+' : ''}${diff})</span>${absorbMark}`;
      h += `<td>${rndCell}</td>`;
    }
    h += '</tr>';
  });
  h += '</tbody></table>';
  if (!anyRoundErr) {
    h += '<div class="vmix-note ok">✓ 5자리 비율 반올림 오차 없음 — 실제 픽셀과 일치</div>';
  } else {
    const parts = keys.map(k => {
      const d = rnd[k] - S[k].actual;
      if (d === 0) { return null; }
      return `${NAMES[k]} ${d > 0 ? '+' : ''}${d}px${k === 'center' && hasL && hasR ? ' (흡수)' : ''}`;
    }).filter(Boolean);
    h += `<div class="vmix-note warn">⚠ 반올림 시 픽셀 변동: ${parts.join(' · ')}</div>`;
  }

  // ── 보정 비율 계산 ──
  // 5자리 비율로 표현 가능한 최소 픽셀 단위 = T / gcd(100000, T)
  function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
  const g = gcd(100000, T);
  const step = T / g; // 유효 픽셀 단위

  h += '<div class="vmix-adj-wrap">';
  h += '<div class="vmix-adj-label">보정 비율 계산</div>';
  h += `<div class="vmix-header" style="margin-bottom:6px;">유효 픽셀 단위 <b>${step}px</b> — 최소 비율 조정 ${(step / T).toFixed(5)}</div>`;

  if (step === 1) {
    // T가 100000의 약수 → 모든 정수 픽셀 사용 가능
    h += '<div class="vmix-note ok">✓ 현재 픽셀값 그대로 정수 비율 표현 가능 — 보정 불필요</div>';
    keys.forEach(k => {
      h += `<div style="font-size:11px;padding:2px 0;"><span class="vmix-name">${NAMES[k]}</span> → 비율 <span class="vmix-ratio10">${(S[k].actual / T).toFixed(5)}</span></div>`;
    });
  } else {
    h += `<div class="vmix-adj-tabs">
      <button class="vmix-adj-tab${State.vmixAdjMode === 'center' ? ' on' : ''}" onclick="setVmixAdjMode('center')">중앙 확대</button>
      <button class="vmix-adj-tab${State.vmixAdjMode === 'sides'  ? ' on' : ''}" onclick="setVmixAdjMode('sides')">좌우 확대</button>
    </div>`;

    const L = hasL ? S.left.actual   : 0;
    const C = hasC ? S.center.actual : 0;
    const R = hasR ? S.right.actual  : 0;

    // 각 섹션을 독립적으로 최근접 유효 단위로 반올림 (픽셀 변화 최소화)
    let adjL = hasL ? Math.round(L / step) * step : 0;
    let adjC = hasC ? Math.round(C / step) * step : 0;
    let adjR = hasR ? Math.round(R / step) * step : 0;

    // 합이 T와 다를 경우 ±step 한 단계를 한 섹션이 흡수
    const sumDiff = T - adjL - adjC - adjR;
    let absorber = null;
    if (sumDiff !== 0) {
      if (State.vmixAdjMode === 'center' && hasC) {
        adjC += sumDiff; absorber = 'center';
      } else if (hasL && hasR) {
        // 좌우 중 반올림 오차가 더 큰 쪽이 흡수
        const errL = L - adjL, errR = R - adjR;
        if (sumDiff > 0) {
          if (errL >= errR) { adjL += step; absorber = 'left'; }
          else              { adjR += step; absorber = 'right'; }
        } else {
          if (errL <= errR) { adjL -= step; absorber = 'left'; }
          else              { adjR -= step; absorber = 'right'; }
        }
      } else if (hasL)  { adjL += sumDiff; absorber = 'left'; }
      else if (hasR)    { adjR += sumDiff; absorber = 'right'; }
      else if (hasC)    { adjC += sumDiff; absorber = 'center'; }
    }

    const adj = { left: hasL ? adjL : null, center: hasC ? adjC : null, right: hasR ? adjR : null };
    const maxChange = Math.max(...keys.map(k => Math.abs(adj[k] - S[k].actual)));

    h += '<table class="vmix-tbl"><thead><tr>';
    h += '<th>섹션</th><th>보정 px</th><th>보정 비율</th><th>픽셀 변화</th><th>소스 조정</th>';
    h += '</tr></thead><tbody>';
    keys.forEach(k => {
      const a = adj[k];
      if (a === null || a === undefined) { return; }
      const pxDiff = a - S[k].actual;
      const adjRatio = (a / T).toFixed(5);
      const isAbsorb = k === absorber;
      const pdStr = pxDiff === 0 ? '—' : (pxDiff > 0 ? '+' : '') + pxDiff + 'px';
      const pdCls = pxDiff === 0 ? 'vmix-zero' : (pxDiff > 0 ? 'vmix-plus' : 'vmix-minus');
      let srcAdj;
      if (pxDiff === 0) {
        srcAdj = '<span class="vmix-zero">—</span>';
      } else if (pxDiff < 0) {
        // LED가 소스보다 좁음 → 소스 양쪽을 half픽셀씩 자르기
        const half = (-pxDiff) / 2;
        const halfStr = Number.isInteger(half) ? half : half.toFixed(1);
        const cropCls = half <= 3 ? 'vmix-int' : (half <= 6 ? 'vmix-warn-sm' : 'vmix-frac');
        srcAdj = `<span class="${cropCls}">각 ${halfStr}px 자르기</span>`;
      } else {
        // LED가 소스보다 넓음 → 소스를 확대해서 채움
        const zoom = (a / S[k].actual).toFixed(5);
        srcAdj = `<span class="vmix-warn-sm">×${zoom} 확대</span>`;
      }
      h += `<tr>
        <td class="vmix-name">${NAMES[k]}${isAbsorb ? '<span class="vmix-absorb"> 흡수</span>' : ''}</td>
        <td>${a}</td>
        <td class="vmix-ratio10">${adjRatio}</td>
        <td><span class="${pdCls}">${pdStr}</span></td>
        <td style="font-size:11px;">${srcAdj}</td>
      </tr>`;
    });
    h += '</tbody></table>';

    if (maxChange === 0) {
      h += '<div class="vmix-note ok">✓ 보정 불필요 — 이미 유효 단위</div>';
    } else {
      const maxCropHalf = Math.max(0, ...keys
        .filter(k => adj[k] !== null && adj[k] < S[k].actual)
        .map(k => (S[k].actual - adj[k]) / 2));
      const maxZoom = Math.max(1, ...keys
        .filter(k => adj[k] !== null && adj[k] > S[k].actual)
        .map(k => adj[k] / S[k].actual));
      const noteParts = [];
      if (maxCropHalf > 0) { noteParts.push(`자르기 최대 ${Number.isInteger(maxCropHalf) ? maxCropHalf : maxCropHalf.toFixed(1)}px (한쪽)`); }
      if (maxZoom > 1) { noteParts.push(`확대 최대 ×${maxZoom.toFixed(5)}`); }
      const isOk = maxCropHalf <= 3 && maxZoom <= 1.02;
      h += `<div class="vmix-note ${isOk ? 'ok' : 'info'}">${noteParts.join(' · ')}</div>`;
    }
  }

  h += '</div>';
  el.innerHTML = h;
}


// ════════════════════════════════════════════════════════════
//  §11  랜선 시뮬레이터
// ════════════════════════════════════════════════════════════


// ── 상태 초기화 ───────────────────────────────────────────

function rst() {
  State.pA = Array.from({ length: 8 }, () => new Set());
  State.pH2      = Array.from({ length: 8 }, () => []);
  State.spareAdj = { l1: 2, sl: 20, c1: 2, sp: 20 };
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;
  State.multiSec = { left:_mkSec(), center:_mkSec(), right:_mkSec() };
  State.activeSimSec = 'center';
}
function rstPort(pi) {
  State.pA[pi] = new Set(); State.pH2[pi] = [];
  if (State.aPort === pi) { State.fCell = null; }
  State.aPort = firstEmpty();
}
// 데이터가 없는 첫 번째 포트 인덱스 반환
function firstEmpty() { for (let i = 0; i < 8; i++) { if (State.pA[i].size === 0) return i; } return 0; }
function nextEmpty()  { for (let i = 0; i < 8; i++) { if (State.pA[i].size === 0) return i; } return State.aPort; }

// ── 시뮬레이터 UI 빌드 ────────────────────────────────────

function buildSim() {
  const autoButtons = State.areaMode === 'multi'
    ? `<button class="reset-btn auto-assign" onclick="doAutoAssign()">⚡ 섹션별 분리</button>
       <button class="reset-btn auto-assign" onclick="doAutoAssignUnified()">⚡ 통합 자동할당</button>`
    : `<button class="reset-btn auto-assign" onclick="doAutoAssign()">⚡ 자동 할당</button>`;
  document.getElementById('simArea').innerHTML = `
    <div class="sim-hint">
      <b style="color:#333">탭/클릭</b> 할당·해제 &nbsp;·&nbsp;
      <b style="color:#333">꾹+드래그</b> 자동 포트 선택 후 연속 할당 &nbsp;·&nbsp;
      <b style="color:#333">역방향</b> 취소
    </div>
    <div class="port-strip" id="portStrip"></div>
    <div class="port-info-bar" id="portInfo"></div>
    <div class="reset-row">
      ${autoButtons}
      <button class="reset-btn all" onclick="doRstAll()">전체 초기화</button>
      <button class="reset-btn" id="rstPBtn"   onclick="doRstPort()">포트 초기화</button>
    </div>
    <canvas id="simCanvas" tabindex="0" style="outline:none;cursor:crosshair;border-radius:6px;"></canvas>
    <div class="legend" id="legend"></div>
    <div id="simSum"></div>`;
  attachEv();
  renderPorts(); buildCv(); renderLeg(); renderSum();
}

function _execRstAll() {
  rst();
  if (State.areaMode === 'multi') { calcMulti(); return; }
  drawCv(); renderPorts(); renderLeg(); renderSum();
}
function doRstAll()    { openConfirm('포트 전체 초기화', '할당된 모든 포트를 초기화할까요?', _execRstAll); }
function doRstPort()   { rstPort(State.aPort); drawCv(); renderPorts(); renderLeg(); renderSum(); }

// 특정 포트의 총 픽셀 수 계산
function pxOf(pi) {
  let px = 0;
  State.pA[pi].forEach(k => {
    let r, lay;
    if (State.areaMode === 'multi' && k.includes(':')) {
      const [sec, coords] = k.split(':');
      [r] = coords.split(',').map(Number);
      lay = State.multiSec[sec]?.layout;
    } else {
      [r] = k.split(',').map(Number);
      lay = State.layout;
    }
    if (!lay || !lay[r]) { return; }
    const p = ppx(lay[r].type);
    px += p.w * p.h;
  });
  return px;
}

// ── 포트 버튼 & 정보바 렌더링 ─────────────────────────────

function renderPorts() {
  const s = document.getElementById('portStrip'); if (!s) return;
  s.innerHTML = State.pA.map((set, i) => {
    const on = i === State.aPort, has = set.size > 0;
    return `<button class="port-btn${on?' active':''}${has?' has-data':''}"
      style="${on ? `background:${PC[i]};border-color:${PC[i]};` : has ? `border-color:${PC[i]};color:${PC[i]};` : ''}"
      onclick="setP(${i})">P${i+1}</button>`;
  }).join('');

  const px = pxOf(State.aPort);
  const pct = Math.min(100, Math.round(px / MAX_PX * 100));
  const ov = px > MAX_PX;
  const pi = document.getElementById('portInfo');
  if (pi) { pi.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:13px;font-weight:500;color:${PC[State.aPort]}">포트 ${State.aPort+1}</span>
      <span style="font-size:13px;color:#333;">${State.pA[State.aPort].size}장 · ${px.toLocaleString()} px</span>
      <span style="font-size:12px;color:${ov?'#A32D2D':'#888'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov?' ⚠ 초과':''}</span>
      ${State.drag ? `<span class="drag-badge" style="background:${PC[State.aPort]}">드래그 중</span>` : ''}
    </div>
    <div style="height:5px;background:#eee;border-radius:3px;margin-top:6px;">
      <div style="height:5px;width:${pct}%;background:${ov?'#E24B4A':PC[State.aPort]};border-radius:3px;"></div>
    </div>`; }

  const rb = document.getElementById('rstPBtn');
  if (rb) { rb.textContent = `포트 ${State.aPort+1} 초기화`; }
}
function setP(i) { State.aPort = i; renderPorts(); }

// ── 캔버스 빌드 & 드로잉 ──────────────────────────────────

function buildCv() {
  const cv = document.getElementById('simCanvas'); if (!cv) return;

  if (State.areaMode === 'multi') {
    const activeSecs = ['left','center','right'].filter(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
    if (!activeSecs.length) { return; }
    const totalCols = activeSecs.reduce((s, k) => s + State.multiSec[k].cols, 0);
    const gaps = activeSecs.length - 1;
    const cW = Math.min(cv.parentElement.clientWidth - 32, 900);
    State.cellW = Math.max(22, Math.min(60, Math.floor((cW - gaps * SECTION_GAP) / totalCols)));
    let xOff = 0;
    ['left','center','right'].forEach(k => {
      const sec = State.multiSec[k];
      if (sec.cols > 0 && sec.layout.length > 0) {
        State.multiCvOffsets[k] = xOff;
        sec.rH = sec.layout.map(r => r.type === 'full' ? (State.basePH === 1000 ? State.cellW * 2 : State.cellW) : State.cellW);
        xOff += sec.cols * State.cellW + SECTION_GAP;
      } else {
        State.multiCvOffsets[k] = -1; sec.rH = [];
      }
    });
    State.rH = State.multiSec[State.activeSimSec].rH.length ? State.multiSec[State.activeSimSec].rH : [];
    cv.width = xOff - SECTION_GAP;
    cv.height = SEC_LBL_H + Math.max(...activeSecs.map(k => State.multiSec[k].rH.reduce((s, h) => s + h, 0)));
    drawCv();
    return;
  }

  if (!State.cols || !State.layout.length) { return; }
  const cW = Math.min(cv.parentElement.clientWidth - 32, 600);
  State.cellW = Math.max(28, Math.min(64, Math.floor(cW / State.cols)));
  State.rH = State.layout.map(r => r.type === 'full' ? (State.basePH === 1000 ? State.cellW * 2 : State.cellW) : State.cellW);
  cv.width = State.cols * State.cellW;
  cv.height = State.rH.reduce((s, h) => s + h, 0);
  drawCv();
}
function cxOf(c) { return c * State.cellW + State.cellW / 2; }
function cyOf(r) { let y = 0; for (let i = 0; i < r; i++) y += State.rH[i]; return y + State.rH[r] / 2; }

// 마우스/터치 좌표 → 행·열 인덱스 변환
function cellAt(mx, my) {
  if (State.areaMode === 'multi') {
    for (const k of ['left','center','right']) {
      if (State.multiCvOffsets[k] < 0) { continue; }
      const sec = State.multiSec[k];
      if (!sec.rH || !sec.rH.length) { continue; }
      const xStart = State.multiCvOffsets[k];
      if (mx < xStart || mx >= xStart + sec.cols * State.cellW) { continue; }
      const localY = my - SEC_LBL_H;
      if (localY < 0) { return null; }
      const c = Math.floor((mx - xStart) / State.cellW);
      let y = 0, ri = -1;
      sec.rH.forEach((h, i) => { if (ri < 0 && localY >= y && localY < y + h) ri = i; y += h; });
      if (ri < 0 || c < 0 || c >= sec.cols) { return null; }
      return { key: `${k}:${ri},${c}`, r: ri, c, section: k };
    }
    return null;
  }
  if (mx < 0 || mx >= State.cols * State.cellW) { return null; }
  const c = Math.floor(mx / State.cellW); let y = 0, ri = -1;
  State.rH.forEach((h, i) => { if (ri < 0 && my >= y && my < y + h) ri = i; y += h; });
  if (ri < 0 || c < 0 || c >= State.cols) { return null; }
  return { key: `${ri},${c}`, r: ri, c, cx: cxOf(c), cy: cyOf(ri) };
}

// 특정 셀을 소유한 포트 인덱스 반환 (-1 = 미할당)
function owner(k) { let o = -1; State.pA.forEach((s, i) => { if (s.has(k)) o = i; }); return o; }

function assign(pi, k) {
  let o = -1; State.pA.forEach((s, i) => { if (s.has(k)) o = i; });
  if (o >= 0 && o !== pi) { return false; } // 다른 포트에 이미 할당된 셀은 건드리지 않음
  if (!State.pA[pi].has(k)) { State.pA[pi].add(k); State.pH2[pi].push(k); }
  return true;
}
function deassign(pi, k) { State.pA[pi].delete(k); State.pH2[pi] = State.pH2[pi].filter(x => x !== k); }

// 포트별 배선 경로를 연속 베지어 곡선으로 그리기
// 같은 열 이동: 직선, 열 전환(뱀 꺾임): 2차 베지어 곡선 (위/아래 호)
function drawPortPaths(ctx, secName) {
  const rows = State.layout.length;
  const pfx = secName ? secName + ':' : null;
  State.pA.forEach((s, pi) => {
    const h = State.pH2[pi].filter(k => s.has(k) && (!pfx || k.startsWith(pfx)));
    if (h.length < 2) { return; }
    const col = PC[pi];
    const pts = h.map(k => {
      const raw = pfx ? k.slice(pfx.length) : k;
      const [r, c] = raw.split(',').map(Number);
      return { x: cxOf(c), y: cyOf(r), r, c };
    });

    // 마지막 세그먼트 방향 사전 계산 (화살촉 각도용)
    const pL0 = pts[pts.length - 2], pL1 = pts[pts.length - 1];
    let ldx, ldy;
    if (pL0.c !== pL1.c && pL0.r === pL1.r) {
      const isTop = pL0.r < rows / 2;
      const ctY = isTop ? pL0.y - State.rH[pL0.r] * 0.7 : pL0.y + State.rH[pL0.r] * 0.7;
      ldx = pL1.x - (pL0.x + pL1.x) / 2; ldy = pL1.y - ctY;
    } else {
      ldx = pL1.x - pL0.x; ldy = pL1.y - pL0.y;
    }

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i-1], b = pts[i];
        if (a.c !== b.c && a.r === b.r) {
          const isTop = a.r < rows / 2;
          const ctY = isTop ? a.y - State.rH[a.r] * 0.7 : a.y + State.rH[a.r] * 0.7;
          ctx.quadraticCurveTo((a.x + b.x) / 2, ctY, b.x, b.y);
        } else { ctx.lineTo(b.x, b.y); }
      }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx*ldx + ldy*ldy); if (len < 1) return;
      const ux = ldx/len, uy = ldy/len, hw = 6, hl = 12, nx = -uy, ny = ux;
      const bx = pL1.x - ux*5, by = pL1.y - uy*5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux*hl + nx*hw, by - uy*hl + ny*hw);
      ctx.lineTo(bx - ux*hl - nx*hw, by - uy*hl - ny*hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });
}

function drawCv() {
  const cv = document.getElementById('simCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (State.areaMode === 'multi') { _drawCvMulti(ctx); return; }
  _drawSingleSection(ctx);
}

function _drawSingleSection(ctx, secName, passOnly) {
  // passOnly: undefined/0=전체, 1=배경만, 3=번호/레이블만
  const doP1 = !passOnly || passOnly === 1;
  const doP3 = !passOnly || passOnly === 3;
  const pfx = secName ? secName + ':' : '';
  // 셀별 순서 번호 — 전 섹션 통합 계산 (멀티 모드에서도 번호 연속)
  const stepOf = new Map();
  State.pA.forEach((s, pi) => {
    State.pH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // ── 패스 1: 셀 배경 · 테두리 · 패턴 ──────────────────────
  if (doP1) { let y = 0;
  State.layout.forEach((row, ri) => {
    const ch = State.rH[ri];
    for (let c = 0; c < State.cols; c++) {
      const k = pfx + `${ri},${c}`;
      const ow = owner(k);
      const lk = ow >= 0 && ow !== State.aPort;
      const hov = State.drag && k === State.dHov && ow < 0;
      const last = State.drag && State.dStk.length > 0 && State.dStk[State.dStk.length-1].key === k;

      ctx.fillStyle = ow >= 0
        ? PC[ow] + (lk ? '55' : '99')
        : row.type === 'half' ? '#C0DD97' : '#9FE1CB';
      ctx.fillRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2);

      if (hov) { ctx.fillStyle = PC[State.aPort] + '44'; ctx.fillRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2); }

      ctx.strokeStyle = ow >= 0 ? PC[ow] : (row.type === 'half' ? '#639922' : '#1D9E75');
      ctx.lineWidth = ow >= 0 ? 1.5 : 0.5;
      ctx.strokeRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2);

      if (last) {
        ctx.strokeStyle = 'white';   ctx.lineWidth = 2.5; ctx.strokeRect(c*State.cellW+3, y+3, State.cellW-6, ch-6);
        ctx.strokeStyle = PC[State.aPort]; ctx.lineWidth = 2;   ctx.strokeRect(c*State.cellW+3, y+3, State.cellW-6, ch-6);
      }
      if (hov) {
        ctx.setLineDash([3, 3]); ctx.strokeStyle = PC[State.aPort]; ctx.lineWidth = 1.5;
        ctx.strokeRect(c*State.cellW+2, y+2, State.cellW-4, ch-4); ctx.setLineDash([]);
      }
      if (lk) {
        ctx.save(); ctx.beginPath(); ctx.rect(c*State.cellW+1, y+1, State.cellW-2, ch-2); ctx.clip();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
        for (let i = -ch; i < State.cellW + ch; i += 6) {
          ctx.beginPath(); ctx.moveTo(c*State.cellW+i, y+1); ctx.lineTo(c*State.cellW+i+ch, y+ch); ctx.stroke();
        }
        ctx.restore();
      }
      if (State.fCell && State.fCell.r === ri && State.fCell.c === c && (!secName || State.fCell.section === secName)) {
        ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(c*State.cellW+4, y+4, State.cellW-8, ch-8);
        ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(c*State.cellW+4, y+4, State.cellW-8, ch-8);
      }
    }
    y += ch;
  }); } // end pass1

  // ── 패스 2: 포트 배선 경로 — 단일 모드만 (멀티는 _drawCvMulti에서 통합 처리)
  if (State.areaMode !== 'multi') { drawPortPaths(ctx, secName); }
  // ── 패스 3: 순서 번호 & 포트 레이블 (배선 경로 위에 그림) ─────
  if (doP3) { let y = 0;
  State.layout.forEach((row, ri) => {
    const ch = State.rH[ri];
    for (let c = 0; c < State.cols; c++) {
      const k = pfx + `${ri},${c}`;
      const ow = owner(k);
      if (ow < 0 || State.cellW < 20) { continue; }
      const lk = ow !== State.aPort;
      const step = stepOf.get(k);
      const cx2  = c*State.cellW + State.cellW/2, cy2 = y + ch/2;

      if (step) {
        const fs = Math.min(12, State.cellW - 8);
        const r = Math.max(8, fs * 0.72);
        ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
        ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.font = `700 ${fs}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : PC[ow];
        ctx.fillText(String(step), cx2, cy2);
      }

      if (State.cellW >= 32) {
        const label = 'P' + (ow + 1);
        ctx.font = '700 9px sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(label, c*State.cellW + 4, y + 4);
        ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
        ctx.fillText(label, c*State.cellW + 4, y + 4);
      }
    }
    y += ch;
  }); } // end pass3
}

// 프리픽스 키 → 캔버스 절대 좌표 변환 (멀티 모드 전용)
function _absCoords(key) {
  const colon = key.indexOf(':');
  if (colon < 0) { return null; }
  const sec = key.slice(0, colon);
  const [r, c] = key.slice(colon + 1).split(',').map(Number);
  const xOff = State.multiCvOffsets[sec];
  if (xOff < 0) { return null; }
  const secRH = State.multiSec[sec].rH;
  let y = 0;
  for (let i = 0; i < r; i++) y += secRH[i] || 0;
  y += (secRH[r] || 0) / 2;
  return { x: xOff + c * State.cellW + State.cellW / 2, y: SEC_LBL_H + y, r, c, sec };
}

// 멀티 모드 전용 — 절대 좌표로 포트 배선 경로 전체 그리기 (섹션 간 연결 포함)
function _drawPortPathsMulti(ctx) {
  State.pA.forEach((s, pi) => {
    const h = State.pH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = PC[pi];
    const pts = h.map(k => _absCoords(k)).filter(Boolean);
    if (pts.length < 2) { return; }
    const pL0 = pts[pts.length - 2], pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x, ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const a = pts[i - 1], b = pts[i];
        // 같은 섹션 내 같은 행에서 열 이동 → 베지어 호
        if (a.sec === b.sec && a.c !== b.c && a.r === b.r) {
          const secRows = State.multiSec[a.sec].layout.length;
          const isTop = a.r < secRows / 2;
          const rh = (State.multiSec[a.sec].rH[a.r] || State.cellW);
          const ctY = isTop ? a.y - rh * 0.7 : a.y + rh * 0.7;
          ctx.quadraticCurveTo((a.x + b.x) / 2, ctY, b.x, b.y);
        } else {
          ctx.lineTo(b.x, b.y);
        }
      }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) return;
      const ux = ldx / len, uy = ldy / len, hw = 6, hl = 12, nx = -uy, ny = ux;
      const bx = pL1.x - ux * 5, by = pL1.y - uy * 5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux * hl + nx * hw, by - uy * hl + ny * hw);
      ctx.lineTo(bx - ux * hl - nx * hw, by - uy * hl - ny * hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });
}

function _drawCvMulti(ctx) {
  const NAMES = { left:'좌측', center:'중앙', right:'우측' };

  // 섹션 레이블 바
  ['left','center','right'].forEach(k => {
    if (State.multiCvOffsets[k] < 0) { return; }
    const sec = State.multiSec[k];
    const xStart = State.multiCvOffsets[k];
    const secW = sec.cols * State.cellW;
    const isActive = k === State.activeSimSec;
    ctx.fillStyle = isActive ? '#3B82F6' : '#E2E8F0';
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(xStart + 1, 1, secW - 2, SEC_LBL_H - 2, 4); } else { ctx.rect(xStart + 1, 1, secW - 2, SEC_LBL_H - 2); }
    ctx.fill();
    ctx.font = `${isActive ? '700' : '600'} 11px sans-serif`;
    ctx.fillStyle = isActive ? '#fff' : '#64748B';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(NAMES[k], xStart + secW / 2, SEC_LBL_H / 2);
  });

  // 패스 1: 셀 배경·테두리 — 모든 섹션
  ['left','center','right'].forEach(k => {
    if (State.multiCvOffsets[k] < 0) { return; }
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length || !sec.rH.length) { return; }
    const [sc, sl, srH] = [State.cols, State.layout, State.rH];
    State.cols = sec.cols; State.layout = sec.layout; State.rH = sec.rH;
    ctx.save();
    ctx.translate(State.multiCvOffsets[k], SEC_LBL_H);
    _drawSingleSection(ctx, k, 1);
    ctx.restore();
    [State.cols, State.layout, State.rH] = [sc, sl, srH];
  });

  // 섹션 간 연결 포함 포트 배선 경로 (배경 위, 번호 아래)
  _drawPortPathsMulti(ctx);

  // 패스 3: 순서 번호·포트 레이블 — 배선 경로 위에 그리기
  ['left','center','right'].forEach(k => {
    if (State.multiCvOffsets[k] < 0) { return; }
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length || !sec.rH.length) { return; }
    const [sc, sl, srH] = [State.cols, State.layout, State.rH];
    State.cols = sec.cols; State.layout = sec.layout; State.rH = sec.rH;
    ctx.save();
    ctx.translate(State.multiCvOffsets[k], SEC_LBL_H);
    _drawSingleSection(ctx, k, 3);
    ctx.restore();
    [State.cols, State.layout, State.rH] = [sc, sl, srH];
  });
}

// ── 범례 & 케이블 수량 요약 ───────────────────────────────

function renderLeg() {
  const l = document.getElementById('legend'); if (!l) return;
  const used = State.pA.map((s, i) => s.size > 0 ? i : -1).filter(i => i >= 0);
  let h = `
    <div class="leg-item"><div class="leg-dot" style="background:#C0DD97;border:1px solid #639922"></div>500×500mm</div>
    <div class="leg-item"><div class="leg-dot" style="background:#9FE1CB;border:1px solid #1D9E75"></div>500×1000mm</div>`;
  used.forEach(pi => { h += `<div class="leg-item"><div class="leg-dot" style="background:${PC[pi]}"></div>포트 ${pi+1}</div>`; });
  l.innerHTML = h;
}

// 계산된 랜선 수량 반환
// 1번 랜: 포트당 메인+백업 각 1개씩 2배, 여유 2개 추가
// 숏랜: 패널 간 연결 + 여유 20개, 20개 단위 묶음 수
function _calcLan() {
  const ports = State.pA.filter(s => s.size > 0).length;
  const l1Main = ports, l1Back = ports, l1Spare = State.spareAdj.l1;
  const l1 = l1Main + l1Back + l1Spare;
  let slNet = 0; State.pA.forEach(s => { if (s.size > 0) slNet += (s.size - 1); });
  const slSpare = State.spareAdj.sl, sl = slNet + slSpare, slBundle = Math.ceil(sl / 20);
  return { l1, l1Main, l1Back, l1Spare, slNet, sl, slSpare, slBundle };
}

function calcPWMulti() {
  let c1Net = 0, spNet = 0;
  ['left','center','right'].forEach(k => {
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length) { return; }
    c1Net += Math.ceil(sec.cols / 2);
    const pc = Math.floor(sec.cols / 2), odd = sec.cols % 2 === 1, rows = sec.layout.length;
    for (let i = 0; i < pc; i++) spNet += rows * 2 - 1;
    if (odd) { spNet += rows - 1; }
  });
  const c1Spare = State.spareAdj.c1, c1 = c1Net + c1Spare;
  const spSpare = State.spareAdj.sp, sp = spNet + spSpare, spBundle = Math.ceil(sp / 10);
  return { c1, c1Net, c1Spare, spNet, sp, spSpare, spBundle };
}

function renderSum() {
  const el = document.getElementById('simSum'); if (!el) return;
  const asgn = new Set(); State.pA.forEach(s => s.forEach(k => asgn.add(k)));
  let tot = 0, pw;
  if (State.areaMode === 'multi') {
    ['left','center','right'].forEach(k => {
      const sec = State.multiSec[k];
      if (sec.cols && sec.layout.length) { tot += sec.cols * sec.layout.length; }
    });
    pw = calcPWMulti();
  } else {
    tot = State.layout.length * State.cols;
    pw = calcPW();
  }
  const una = tot - asgn.size;
  const lan = _calcLan();
  const ov = State.pA.filter((_, i) => pxOf(i) > MAX_PX).length;

  const si = (k, v) =>
    `<input class="spare-inp" type="number" min="0" value="${v}" oninput="setSpare('${k}',this.value)">`;

  el.innerHTML = `<div class="cc-grid">
    <div class="cc-section lan">
      <div class="cc-sec-title">랜선</div>
      <div class="cc-cards">
        <div class="cc-card">
          <div class="cc-lbl">1번 랜</div>
          <div class="cc-total lan" id="cc-l1-total">${lan.l1} 개</div>
          <div class="cc-note">메인 ${lan.l1Main} · 백업 ${lan.l1Back}</div>
          <div class="cc-qty-row">필요 <b>${lan.l1Main + lan.l1Back}</b> · 여유 ${si('l1', State.spareAdj.l1)}</div>
        </div>
        <div class="cc-card">
          <div class="cc-lbl">숏랜</div>
          <div class="cc-total lan" id="cc-sl-total">${lan.sl} 개</div>
          <div class="cc-bundle" id="cc-sl-bundle">${lan.slBundle}묶음 (×20)</div>
          <div class="cc-qty-row">필요 <b>${lan.slNet}</b> · 여유 ${si('sl', State.spareAdj.sl)}</div>
        </div>
      </div>
    </div>
    <div class="cc-section pwr">
      <div class="cc-sec-title">파워콘</div>
      <div class="cc-cards">
        <div class="cc-card">
          <div class="cc-lbl">1번 파워</div>
          <div class="cc-total pwr" id="cc-c1-total">${pw.c1} 개</div>
          <div class="cc-qty-row">필요 <b>${pw.c1Net}</b> · 여유 ${si('c1', State.spareAdj.c1)}</div>
        </div>
        <div class="cc-card">
          <div class="cc-lbl">숏 파워</div>
          <div class="cc-total pwr" id="cc-sp-total">${pw.sp} 개</div>
          <div class="cc-bundle" id="cc-sp-bundle">${pw.spBundle}묶음 (×10)</div>
          <div class="cc-qty-row">필요 <b>${pw.spNet}</b> · 여유 ${si('sp', State.spareAdj.sp)}</div>
        </div>
      </div>
    </div>
    ${una > 0 ? `<div class="cc-warn">미할당 ${una} / ${tot} 패널</div>` : ''}
    ${ov > 0 ? `<div class="cc-error">픽셀 초과 포트 ${ov}개 — 연결 패널 수를 줄여주세요</div>` : ''}
  </div>`;
}

// 여유분 수정 시 합계만 업데이트 (입력 포커스 유지)
function setSpare(k, v) {
  const n = parseInt(v);
  State.spareAdj[k] = (v === '' || isNaN(n) || n < 0) ? 0 : n;
  const lan = _calcLan(), pw = calcPW();
  const s = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  s('cc-l1-total', lan.l1 + ' 개');
  s('cc-sl-total', lan.sl + ' 개');
  s('cc-sl-bundle', lan.slBundle + '묶음 (×20)');
  s('cc-c1-total', pw.c1 + ' 개');
  s('cc-sp-total', pw.sp + ' 개');
  s('cc-sp-bundle', pw.spBundle + '묶음 (×10)');
}

// ── 이벤트 처리 (마우스 & 터치 & 키보드) ─────────────────

// 캔버스 내 좌표 계산 (DPR 보정 포함)
// touchend는 e.touches가 빈 TouchList(truthy)라 e.touches[0]이 undefined →
// changedTouches(방금 떨어진 손가락)를 우선 사용해야 좌표를 올바르게 읽음
function xy(cv, e) {
  const r = cv.getBoundingClientRect();
  const sx = cv.width / r.width, sy = cv.height / r.height;
  const src = (e.changedTouches && e.changedTouches[0])
            || (e.touches && e.touches[0])
            || e;
  return { mx: (src.clientX - r.left) * sx, my: (src.clientY - r.top) * sy };
}

function attachEv() {
  const cv = document.getElementById('simCanvas');

  function dn(e) {
    if (!isReady()) { return; }
    if (State.areaMode !== 'multi' && (!State.cols || !State.layout.length)) { return; }
    e.preventDefault();
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { return; }
    if (State.areaMode === 'multi' && inf.section !== State.activeSimSec) { switchSimSec(inf.section); }
    if (!State.cols || !State.layout.length) { return; }
    // 터치는 LP_TOUCH(600ms), 마우스는 LP_MS(380ms) — 일반 탭이 드래그로 오인되지 않도록
    const delay = e.touches ? LP_TOUCH : LP_MS;
    State.lpT = setTimeout(() => {
      State.lpT = null;
      const ow = owner(inf.key);
      State.aPort = ow >= 0 ? ow : nextEmpty(); // 이미 할당된 셀이면 해당 포트로 전환
      State.drag = true; State.dStk = []; State.dHov = inf.key;
      if (ow < 0) { assign(State.aPort, inf.key); }
      State.dStk.push({ key: inf.key });
      State.fCell = null;
      drawCv(); renderPorts(); renderLeg(); renderSum(); cv.focus();
    }, delay);
  }

  function mv(e) {
    if (!State.drag) { return; }
    e.preventDefault();
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { State.dHov = null; drawCv(); return; }
    State.dHov = inf.key;
    // 역방향 드래그 감지 → 마지막 셀 취소
    if (State.dStk.length >= 2) {
      const prev = State.dStk[State.dStk.length - 2];
      if (inf.key === prev.key) {
        const last = State.dStk[State.dStk.length - 1];
        deassign(State.aPort, last.key); State.dStk.pop();
        if (navigator.vibrate) { navigator.vibrate(25); }
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    }
    const top = State.dStk.length > 0 ? State.dStk[State.dStk.length - 1] : null;
    if (top && inf.key === top.key) { return; }
    const ow = owner(inf.key);
    if (ow >= 0 && ow !== State.aPort) { drawCv(); return; } // 다른 포트 셀 건드리지 않음
    assign(State.aPort, inf.key); State.dStk.push({ key: inf.key });
    if (navigator.vibrate) { navigator.vibrate(15); }
    drawCv(); renderPorts(); renderLeg(); renderSum();
  }

  function up(e) {
    clearTimeout(State.lpT); State.lpT = null;
    // 드래그 종료
    if (State.drag) { State.drag = false; State.dStk = []; State.dHov = null; drawCv(); renderPorts(); renderLeg(); renderSum(); return; }
    // 단순 탭/클릭 → 현재 포트로 토글 (할당 ↔ 해제)
    if (!isReady()) { return; }
    if (State.areaMode !== 'multi' && (!State.cols || !State.layout.length)) { return; }
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { return; }
    if (State.areaMode === 'multi' && inf.section !== State.activeSimSec) { switchSimSec(inf.section); }
    if (!State.cols || !State.layout.length) { return; }
    const ow = owner(inf.key);
    if (ow >= 0 && ow !== State.aPort) { return; } // 다른 포트 셀은 건드리지 않음
    if (State.pA[State.aPort].has(inf.key)) {
      deassign(State.aPort, inf.key);
      if (State.fCell && State.fCell.r === inf.r && State.fCell.c === inf.c) { State.fCell = null; }
    } else {
      assign(State.aPort, inf.key); State.fCell = { r: inf.r, c: inf.c, section: inf.section || null };
    }
    drawCv(); renderPorts(); renderLeg(); renderSum(); cv.focus();
  }

  function cl() { clearTimeout(State.lpT); State.lpT = null; State.drag = false; State.dStk = []; State.dHov = null; drawCv(); renderPorts(); }

  cv.addEventListener('mousedown',   dn);
  cv.addEventListener('mousemove',   mv);
  cv.addEventListener('mouseup',     up);
  cv.addEventListener('mouseleave',  cl);
  cv.addEventListener('touchstart',  dn, { passive: false });
  cv.addEventListener('touchmove',   mv, { passive: false });
  cv.addEventListener('touchend',    up, { passive: false });
  cv.addEventListener('touchcancel', cl, { passive: false });

  // 키보드 방향키 — 포커스 셀 이동 및 할당
  cv.addEventListener('keydown', function(e) {
    if (!isReady()) { return; }
    const M = { ArrowUp:{dr:-1,dc:0}, ArrowDown:{dr:1,dc:0}, ArrowLeft:{dr:0,dc:-1}, ArrowRight:{dr:0,dc:1} };
    const d = M[e.key]; if (!d) return;
    e.preventDefault();

    const secName = State.areaMode === 'multi' ? State.activeSimSec : null;
    const pfx = secName ? secName + ':' : '';
    const curLay = secName ? State.multiSec[secName].layout : State.layout;
    const curCols = secName ? State.multiSec[secName].cols    : State.cols;

    if (!State.fCell) {
      State.fCell = { r:0, c:0, section: secName };
      assign(State.aPort, pfx + '0,0');
      drawCv(); renderPorts(); renderLeg(); renderSum(); return;
    }

    // 현재 섹션 안의 히스토리만 추출
    const hist = State.pH2[State.aPort].filter(k => State.pA[State.aPort].has(k) && k.startsWith(pfx));
    const parseCoords = k => k.slice(pfx.length).split(',').map(Number);

    // 역방향 → 마지막 셀 취소
    if (hist.length >= 2) {
      const [pr, pc] = parseCoords(hist[hist.length - 2]);
      if (State.fCell.r + d.dr === pr && State.fCell.c + d.dc === pc) {
        deassign(State.aPort, pfx + `${State.fCell.r},${State.fCell.c}`);
        State.fCell = { r:pr, c:pc, section: secName };
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    } else if (hist.length === 1) {
      const nr2 = State.fCell.r + d.dr, nc2 = State.fCell.c + d.dc;
      if (nr2 < 0 || nr2 >= curLay.length || nc2 < 0 || nc2 >= curCols) {
        deassign(State.aPort, pfx + `${State.fCell.r},${State.fCell.c}`);
        State.fCell = null;
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    }

    const nr = Math.max(0, Math.min(curLay.length - 1, State.fCell.r + d.dr));
    const nc = Math.max(0, Math.min(curCols - 1, State.fCell.c + d.dc));
    if (nr === State.fCell.r && nc === State.fCell.c) { return; }
    const nk = pfx + `${nr},${nc}`;
    if (owner(nk) >= 0 && owner(nk) !== State.aPort) { return; }
    State.fCell = { r:nr, c:nc, section: secName };
    assign(State.aPort, nk);
    drawCv(); renderPorts(); renderLeg(); renderSum();
  });
}

// ── 자동 포트 할당 ────────────────────────────────────────

function _autoAssignSec(secName, secLayout, secCols, portOff) {
  const colPx = secLayout.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  const maxRaw = Math.max(1, Math.floor(MAX_PX / colPx));
  // 짝수 열로 내림 → 포트 양끝 바닥행 보장 (규칙1)
  const maxEven = maxRaw >= 2 ? (maxRaw % 2 === 0 ? maxRaw : maxRaw - 1) : maxRaw;

  let colStart = 0, portCount = 0;
  while (colStart < secCols && portOff + portCount < 8) {
    const rem = secCols - colStart;
    // 남은 열이 maxRaw 이하면 모두 할당 — 홀수여도 새 포트 강제 X (규칙2)
    const take = rem <= maxRaw ? rem : maxEven;
    const pi = portOff + portCount;
    for (let ci = 0; ci < take; ci++) {
      const col = colStart + ci;
      for (let ri = 0; ri < secLayout.length; ri++) {
        const row = ci % 2 === 0 ? secLayout.length - 1 - ri : ri;
        assign(pi, secName ? `${secName}:${row},${col}` : `${row},${col}`);
      }
    }
    colStart += take;
    portCount++;
  }
  return portCount;
}

function autoAssign() {
  if (!isReady()) { return; }
  if (State.areaMode === 'multi') {
    State.pA = Array.from({ length: 8 }, () => new Set());
    State.pH2 = Array.from({ length: 8 }, () => []);
    State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;
    let portOff = 0;
    ['left','center','right'].forEach(secName => {
      const sec = State.multiSec[secName];
      if (!sec.cols || !sec.layout.length) { return; }
      portOff += _autoAssignSec(secName, sec.layout, sec.cols, portOff);
    });
    State.aPort = 0;
    drawCv(); renderPorts(); renderLeg(); renderSum();
    return;
  }

  if (!State.cols || !State.layout.length) { return; }
  rst();
  _autoAssignSec(null, State.layout, State.cols, 0);
  State.aPort = 0;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

function doAutoAssign() {
  if (!isReady()) { return; }
  if (State.areaMode === 'multi') {
    const hasData = ['left','center','right'].some(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
    if (!hasData) { return; }
  } else if (!State.cols || !State.layout.length) { return; }
  if (State.pA.some(s => s.size > 0)) {
    openConfirm('자동 포트 할당', '기존 할당을 초기화하고 자동으로 포트를 할당할까요?', autoAssign);
  } else {
    autoAssign();
  }
}

// 통합 자동 할당 — 좌→중→우 순서로 전역 열 인덱스 기반 뱀 할당 (섹션 경계 무시)
function autoAssignUnified() {
  if (!isReady()) { return; }
  State.pA = Array.from({ length: 8 }, () => new Set());
  State.pH2 = Array.from({ length: 8 }, () => []);
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;

  const vCols = [];
  ['left','center','right'].forEach(secName => {
    const sec = State.multiSec[secName];
    if (!sec.cols || !sec.layout.length) { return; }
    for (let ci = 0; ci < sec.cols; ci++) vCols.push({ secName, ci, lay: sec.layout });
  });
  if (!vCols.length) { return; }
  const colPxOf = lay => lay.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  let gi = 0, curPort = 0;
  while (gi < vCols.length && curPort < 8) {
    // 현재 포트에 들어갈 수 있는 최대 열 수 (픽셀 한도 기준)
    let nFit = 0, accPx = 0;
    while (gi + nFit < vCols.length) {
      const px = colPxOf(vCols[gi + nFit].lay);
      if (accPx + px > MAX_PX && nFit > 0) { break; }
      accPx += px; nFit++;
    }
    if (nFit === 0) { break; }
    const rem = vCols.length - gi;
    // 남은 열이 nFit 이하면 모두 할당 (규칙2), 아니면 짝수로 내림 (규칙1)
    const maxEven = nFit >= 2 ? (nFit % 2 === 0 ? nFit : nFit - 1) : nFit;
    const take = rem <= nFit ? rem : maxEven;

    for (let ci = 0; ci < take; ci++) {
      const { secName, ci: localCi, lay } = vCols[gi + ci];
      const isEven = (gi + ci) % 2 === 0;
      for (let ri = 0; ri < lay.length; ri++) {
        const row = isEven ? lay.length - 1 - ri : ri;
        assign(curPort, `${secName}:${row},${localCi}`);
      }
    }
    gi += take;
    curPort++;
  }

  State.aPort = 0;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

function doAutoAssignUnified() {
  if (!isReady()) { return; }
  const hasData = ['left','center','right'].some(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
  if (!hasData) { return; }
  if (State.pA.some(s => s.size > 0)) {
    openConfirm('통합 자동 할당', '기존 할당을 초기화하고 통합 자동 할당을 실행할까요?', autoAssignUnified);
  } else {
    autoAssignUnified();
  }
}

// ── §12  vMix 소스 매크로 ────────────────────────────────

let _vmixRawText = '';   // 원본 raw 텍스트 (다운로드용, XMLSerializer 없이 직접 교체)
let _vmixDoc = null; // DOM (속성 읽기·커스텀 뱃지 표시용)
let _vmixFilename = '';
let _vmixCopiedKey = null;
let _vmixNewVIs = [];          // 새로 생성된 버츄얼 인풋 [{ key, parentKey, title, overlays:[k,k,k] }]
let _vmixPastedFrom = new Map();  // targetKey → 복사 원본 vmix 순번
let _vmixOrigText = '';         // 로드 시 원본 텍스트 보관 (초기화용)
let _vmixInputCount = 0;          // 원본 파일의 최상위 Input 수 (VI 순번 계산용)

const _VMIX_AR = { '0': '출력 비율', '1': '와이드스크린', '100': '원본' };

function vmixLoad(file) {
  if (!file) { return; }
  _vmixFilename = file.name;
  _vmixCopiedKey = null;
  _vmixNewVIs = [];
  _vmixPastedFrom = new Map();
  const reader = new FileReader();
  reader.onload = e => {
    _vmixOrigText = e.target.result;
    _vmixRawText = e.target.result;
    _vmixDoc = new DOMParser().parseFromString(_vmixRawText, 'text/xml');
    _vmixInputCount = Array.from(_vmixDoc.documentElement.children)
      .filter(e => e.tagName === 'Input').length;
    document.getElementById('vmixFilename').textContent = file.name;
    document.getElementById('vmixFilename').style.display = 'block';
    vmixRenderArList();
    vmixRenderPosList();
    vmixRenderVIPane();
    document.getElementById('vmixSourceCard').style.display = 'block';
    document.getElementById('vmixDownloadCard').style.display = 'none';
  };
  reader.readAsText(file, 'UTF-8');
}

// OriginalTitle이 있는 소스만 반환
function _vmixInputs() {
  return Array.from(_vmixDoc.querySelectorAll('Input'))
    .filter(inp => inp.getAttribute('OriginalTitle')?.trim());
}

// vmix 파일 전체 Input 목록 기준 1-based 순번 (이름 없는 소스 포함하여 계산)
function _vmixNum(inp) {
  return Array.from(_vmixDoc.querySelectorAll('Input')).indexOf(inp) + 1;
}

// 원본 파일 텍스트에서 특정 Key의 속성값 추출 (초기화용)
function _vmixGetOrigAttr(key, attrName) {
  const eol = _vmixOrigText.includes('\r\n') ? '\r\n' : '\n';
  for (const line of _vmixOrigText.split(eol)) {
    if (!line.includes(`Key="${key}"`)) { continue; }
    const m = new RegExp(attrName + '="([^"]*)"').exec(line);
    return m ? m[1] : null;
  }
  return null;
}

// 화면비율 초기화 (원본 AspectRatio 복원)
function vmixResetAR() {
  _vmixInputs().forEach(inp => {
    const key = inp.getAttribute('Key');
    const orig = _vmixGetOrigAttr(key, 'AspectRatio');
    if (orig !== null) {
      inp.setAttribute('AspectRatio', orig);
      _vmixSetRawAttr(key, 'AspectRatio', orig);
    }
  });
  vmixRenderArList();
}

// 포지션 복사 초기화 (붙여넣기 대상 원복 + 상태 초기화)
function vmixResetPos() {
  if (_vmixPastedFrom.size > 0) {
    const origDoc = new DOMParser().parseFromString(_vmixOrigText, 'text/xml');
    const curInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
    _vmixPastedFrom.forEach((_, targetKey) => {
      const origPos = _vmixGetOrigAttr(targetKey, 'Positions');
      const origPosExt = _vmixGetOrigAttr(targetKey, 'PositionsExtended');
      if (origPos) { _vmixSetRawAttr(targetKey, 'Positions', origPos); }
      if (origPosExt) { _vmixSetRawAttr(targetKey, 'PositionsExtended', origPosExt); }
      const origInp = Array.from(origDoc.querySelectorAll('Input'))
        .find(i => i.getAttribute('Key') === targetKey);
      const curInp = curInputs.find(i => i.getAttribute('Key') === targetKey);
      if (origInp && curInp) {
        const op = origInp.getAttribute('Positions');
        const ope = origInp.getAttribute('PositionsExtended');
        if (op) { curInp.setAttribute('Positions', op); }
        if (ope) { curInp.setAttribute('PositionsExtended', ope); }
      }
    });
  }
  _vmixCopiedKey = null;
  _vmixPastedFrom.clear();
  vmixRenderPosList();
}

// 버츄얼 인풋 생성 초기화 (생성된 VI 삭제)
function vmixResetVI() {
  if (_vmixNewVIs.length > 0) {
    const viKeys = new Set(_vmixNewVIs.map(v => v.key));
    const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
    let skipNext = false;
    const filtered = _vmixRawText.split(eol).filter(line => {
      if (skipNext) { skipNext = false; return false; }
      for (const key of viKeys) {
        if (line.includes(`Key="${key}"`)) {
          if (!line.trimEnd().endsWith('/>')) { skipNext = true; }
          return false;
        }
      }
      return true;
    });
    _vmixRawText = filtered.join(eol);
    _vmixNewVIs = [];
  }
  vmixRenderVIPane();
}

// raw 텍스트에서 특정 Key를 가진 Input 행의 속성값 교체
function _vmixSetRawAttr(key, attrName, rawValue) {
  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(`Key="${key}"`)) { continue; }
    lines[i] = lines[i].replace(
      new RegExp(`${attrName}="[^"]*"`),
      `${attrName}="${rawValue}"`
    );
    break;
  }
  _vmixRawText = lines.join(eol);
}

// raw 텍스트에서 특정 Key를 가진 Input의 지정 속성값(인코딩 유지) 추출
function _vmixGetRawAttr(key, attrName) {
  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);
  for (const line of lines) {
    if (!line.includes(`Key="${key}"`)) { continue; }
    const re = new RegExp(attrName + '="([^"]*)"');
    const m = re.exec(line);
    return m ? m[1] : null;
  }
  return null;
}

// MatrixPosition 값이 기본값(줌1, 이동0, 회전0)에서 벗어났는지 확인
function _vmixHasCustomPos(inp) {
  let posXml = inp.getAttribute('Positions');
  if (!posXml) { return false; }
  try {
    // <?xml ...?> 선언 제거 후 파싱 (encoding 선언이 브라우저 파서를 방해하는 경우 대응)
    posXml = posXml.replace(/^\s*<\?xml[^?]*\?>\s*/, '');
    const pdoc = new DOMParser().parseFromString(posXml, 'text/xml');
    for (const m of pdoc.querySelectorAll('MatrixPosition')) {
      const dc = name => Array.from(m.children).find(c => c.tagName === name)?.textContent.trim() ?? null;
      if (dc('ZoomX') !== '1' || dc('ZoomY') !== '1') { return true; }
      if (dc('PostZoomX') !== '1' || dc('PostZoomY') !== '1') { return true; }
      if (dc('PanX') !== '0' || dc('PanY') !== '0') { return true; }
      if (dc('Mirror') === 'true' || dc('Hidden') === 'true') { return true; }
      const rotEl = Array.from(m.children).find(c => c.tagName === 'Rotate');
      if (rotEl) {
        const rx = rotEl.querySelector('X')?.textContent.trim();
        const ry = rotEl.querySelector('Y')?.textContent.trim();
        const rz = rotEl.querySelector('Z')?.textContent.trim();
        if (rx !== '0' || ry !== '0' || rz !== '0') { return true; }
      }
    }
  } catch(e) {}
  return false;
}

function vmixSwitchTab(id, btn) {
  document.querySelectorAll('.vmix-sub-tab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('vmix-pane-ar').style.display = id === 'ar'  ? '' : 'none';
  document.getElementById('vmix-pane-pos').style.display = id === 'pos' ? '' : 'none';
  document.getElementById('vmix-pane-vi').style.display = id === 'vi'  ? '' : 'none';
}

function vmixRenderArList() {
  const inputs = _vmixInputs();
  document.getElementById('vmixArList').innerHTML = inputs.map(inp => {
    const title = inp.getAttribute('OriginalTitle');
    const key = inp.getAttribute('Key');
    const ar = inp.getAttribute('AspectRatio') || '-';
    const arLabel = _VMIX_AR[ar] || ar;
    const isWide = ar === '1';
    return `<div class="vmix-source-row">
      <label class="vmix-cb"><input type="checkbox" class="vmix-ar-cb" data-key="${key}"></label>
      <span class="vmix-num">${_vmixNum(inp)}</span>
      <span class="vmix-source-name" title="${title}">${title}</span>
      <span class="vmix-ar-badge${isWide ? ' wide' : ''}">${arLabel}</span>
    </div>`;
  }).join('');
}

function vmixRenderPosList() {
  const inputs = _vmixInputs();
  const hasCopied = _vmixCopiedKey !== null;
  const header = hasCopied ? `<div class="vmix-action-bar" style="margin-top:0;padding-top:0;border-top:none;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #f0f0f0;">
    <label class="vmix-selall-wrap"><input type="checkbox" id="vmixPosSelAll" onchange="vmixTogglePosAll(this.checked)"><span>전체 선택</span></label>
    <button class="vmix-act-btn accent" style="flex:none;padding:8px 14px;" onclick="vmixPasteToSelected()">선택 항목에 붙여넣기</button>
  </div>` : '';
  const rows = inputs.map(inp => {
    const title = inp.getAttribute('OriginalTitle');
    const key = inp.getAttribute('Key');
    const isCopied = key === _vmixCopiedKey;
    const pastedFrom = _vmixPastedFrom.get(key);
    const hasCustom = _vmixHasCustomPos(inp);
    const cbCell = hasCopied && !isCopied
      ? `<label class="vmix-cb"><input type="checkbox" class="vmix-pos-cb" data-key="${key}"></label>`
      : `<span class="vmix-cb-ph"></span>`;
    let badge = '';
    if (pastedFrom !== null) { badge = `<span class="vmix-pos-badge pasted">← ${pastedFrom}번</span>`; } else if (hasCustom) { badge = `<span class="vmix-pos-badge custom">커스텀</span>`; } else { badge = `<span class="vmix-pos-badge"></span>`; }
    return `<div class="vmix-source-row">
      ${cbCell}
      <span class="vmix-num">${_vmixNum(inp)}</span>
      <span class="vmix-source-name" title="${title}">${title}</span>
      ${badge}
      <button class="vmix-btn${isCopied ? ' is-copied' : ''}" onclick="vmixCopyPos('${key}')">${isCopied ? '📋 복사됨' : '포지션 복사'}</button>
    </div>`;
  }).join('');
  const resetBtn = `<div style="display:flex;justify-content:flex-end;margin-bottom:6px;">
    <button class="vmix-reset-btn" onclick="vmixResetPos()">초기화</button>
  </div>`;
  document.getElementById('vmixPosList').innerHTML = resetBtn + header + rows;
}

function vmixApplyWideSelected() {
  const checked = Array.from(document.querySelectorAll('.vmix-ar-cb:checked'));
  if (!checked.length) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  checked.forEach(cb => {
    const inp = allInputs.find(i => i.getAttribute('Key') === cb.dataset.key);
    if (inp) { inp.setAttribute('AspectRatio', '1'); }
    _vmixSetRawAttr(cb.dataset.key, 'AspectRatio', '1');
  });
  vmixRenderArList();
  document.getElementById('vmixDownloadCard').style.display = 'block';
}

function vmixApplyWide() {
  _vmixInputs().forEach(inp => inp.setAttribute('AspectRatio', '1'));
  _vmixRawText = _vmixRawText.replace(/AspectRatio="100"/g, 'AspectRatio="1"');
  vmixRenderArList();
  document.getElementById('vmixDownloadCard').style.display = 'block';
}

function vmixCopyPos(key) {
  _vmixCopiedKey = _vmixCopiedKey === key ? null : key;
  vmixRenderPosList();
}

function vmixTogglePosAll(checked) {
  document.querySelectorAll('.vmix-pos-cb').forEach(cb => cb.checked = checked);
}

function vmixPasteToSelected() {
  const checked = Array.from(document.querySelectorAll('.vmix-pos-cb:checked'));
  if (!checked.length) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const src = allInputs.find(i => i.getAttribute('Key') === _vmixCopiedKey);
  const srcName = src?.getAttribute('OriginalTitle') || '소스';
  const rawPos = _vmixGetRawAttr(_vmixCopiedKey, 'Positions');
  const rawPosExt = _vmixGetRawAttr(_vmixCopiedKey, 'PositionsExtended');
  const srcDecoded = src?.getAttribute('Positions');
  const srcDecodedExt = src?.getAttribute('PositionsExtended');
  const msg = checked.length === 1
    ? `'${srcName}'의 포지션을 '${allInputs.find(i => i.getAttribute('Key') === checked[0].dataset.key)?.getAttribute('OriginalTitle') || '소스'}'에 붙여넣을까요?`
    : `'${srcName}'의 포지션을 선택한 ${checked.length}개 소스에 붙여넣을까요?`;
  const srcNum = _vmixNum(src);
  openConfirm('포지션 붙여넣기', msg, () => {
    checked.forEach(cb => {
      // Positions + PositionsExtended 모두 교체 (vMix는 PositionsExtended를 우선 사용)
      if (rawPos) { _vmixSetRawAttr(cb.dataset.key, 'Positions', rawPos); }
      if (rawPosExt) { _vmixSetRawAttr(cb.dataset.key, 'PositionsExtended', rawPosExt); }
      // DOM 갱신 (커스텀 뱃지 표시용)
      const dst = allInputs.find(i => i.getAttribute('Key') === cb.dataset.key);
      if (dst) {
        if (srcDecoded) { dst.setAttribute('Positions', srcDecoded); }
        if (srcDecodedExt) { dst.setAttribute('PositionsExtended', srcDecodedExt); }
      }
      _vmixPastedFrom.set(cb.dataset.key, srcNum);
    });
    vmixRenderPosList();
    document.getElementById('vmixDownloadCard').style.display = 'block';
  });
}

// ── 버츄얼 인풋 생성 ─────────────────────────────────────

function _vmixGenUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function vmixRenderVIPane() {
  const pane = document.getElementById('vmix-pane-vi');
  if (!pane) { return; }
  // 원본 소스 (새로 생성된 VI 제외)
  const newKeys = new Set(_vmixNewVIs.map(v => v.key));
  const origInputs = _vmixInputs().filter(inp => !newKeys.has(inp.getAttribute('Key')));

  const srcOpts = origInputs.map(inp =>
    `<option value="${inp.getAttribute('Key')}">${_vmixNum(inp)}. ${inp.getAttribute('OriginalTitle')}</option>`
  ).join('');

  const setup = `<div class="vmix-vi-setup">
    <div class="vmix-vi-form-row">
      <span class="vmix-vi-label">소스 선택</span>
      <select id="vmixVISrcSel" class="vmix-vi-select">${srcOpts}</select>
    </div>
    <div class="vmix-vi-form-row">
      <span class="vmix-vi-label">생성 수</span>
      <input type="number" id="vmixVICount" class="vmix-vi-count" min="1" max="20" value="1">
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center;">
      <button class="vmix-act-btn" onclick="vmixCreateVirtuals()">생성하기</button>
      <button class="vmix-reset-btn" onclick="vmixResetVI()">초기화</button>
    </div>
  </div>`;

  const baseCount = _vmixInputCount;
  const cards = _vmixNewVIs.map((vi, idx) => {
    const parentTitle = origInputs.find(i => i.getAttribute('Key') === vi.parentKey)?.getAttribute('OriginalTitle') || '';
    const viNum = baseCount + idx + 1;
    const layers = [0, 1, 2].map(slot => {
      const currentKey = vi.overlays[slot] || '';
      const currentNum = currentKey
        ? (_vmixNum(origInputs.find(i => i.getAttribute('Key') === currentKey)) || '')
        : '';
      const opts = `<option value="">없음</option>` + origInputs
        .filter(inp => inp.getAttribute('Key') !== vi.parentKey)
        .map(inp => {
          const k = inp.getAttribute('Key');
          const t = inp.getAttribute('OriginalTitle');
          const sel = vi.overlays[slot] === k ? ' selected' : '';
          return `<option value="${k}"${sel}>${_vmixNum(inp)}. ${t}</option>`;
        }).join('');
      return `<div class="vmix-vi-layer-row">
        <span class="vmix-vi-layer-label">레이어 ${slot + 1}</span>
        <input type="number" class="vmix-vi-layer-num" id="vin-${vi.key}-${slot}"
          min="1" value="${currentNum}" placeholder="-"
          onchange="vmixVILayerNumChange('${vi.key}',${slot},this)">
        <select class="vmix-vi-layer-sel" id="vis-${vi.key}-${slot}"
          onchange="vmixVILayerSelChange('${vi.key}',${slot},this)">${opts}</select>
      </div>`;
    }).join('');
    return `<div class="vmix-vi-card">
      <div class="vmix-vi-card-header">
        <span class="vmix-num">${viNum}</span>
        <span class="vmix-vi-card-title">${vi.title}</span>
        <span class="vmix-vi-parent-tag">${parentTitle}</span>
      </div>
      ${layers}
    </div>`;
  }).join('');

  pane.innerHTML = setup + (cards ? `<div class="vmix-vi-list">${cards}</div>` : '');
}

function vmixCreateVirtuals() {
  const parentKey = document.getElementById('vmixVISrcSel')?.value;
  const count = parseInt(document.getElementById('vmixVICount')?.value) || 1;
  if (!parentKey || count < 1) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const parentInp = allInputs.find(i => i.getAttribute('Key') === parentKey);
  if (!parentInp) { return; }
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const parentTitle = parentInp.getAttribute('OriginalTitle') || 'Virtual';
  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);

  // 부모 Input 요소의 전체 라인 블록 파악 (멀티라인 지원)
  const openIdx = lines.findIndex(l => l.includes(`Key="${parentKey}"`));
  if (openIdx === -1) { return; }
  let parentBlock;
  if (lines[openIdx].trimEnd().endsWith('/>')) {
    parentBlock = [lines[openIdx]];               // 자기 닫힘 단일 라인
  } else {
    let closeIdx = openIdx;
    while (closeIdx < lines.length && !lines[closeIdx].includes('</Input>')) closeIdx++;
    parentBlock = lines.slice(openIdx, closeIdx + 1); // 여는 줄 ~ </Input> 줄
  }

  // <State 직전에 삽입
  const stateIdx = lines.findIndex(l => l.trimStart().startsWith('<State'));
  const insertAt = stateIdx === -1 ? lines.length : stateIdx;

  const newRawLines = [];
  for (let i = 0; i < count; i++) {
    const newKey = _vmixGenUUID();
    const block = [...parentBlock];
    let ln = block[0]; // 속성이 있는 여는 줄만 수정

    ln = ln.replace(`Key="${parentKey}"`, `Key="${newKey}"`);
    ln = ln.replace(/Type="[^"]*"/, 'Type="22"');
    ln = ln.includes('ShaderSource=')
      ? ln.replace(/ShaderSource="[^"]*"/, `ShaderSource="${parentKey}"`)
      : ln.replace(/(\/?>)$/, ` ShaderSource="${parentKey}"$1`);
    if (!ln.includes('VirtualInputKey=')) {
      ln = ln.replace(/(\/?>)$/, ` VirtualInputKey="${parentKey}" UseSourceRenderEffects="True"$1`);
    }
    ln = ln.replace('VideoShader_ColorCorrectionSourceEnabled="0"',
                    'VideoShader_ColorCorrectionSourceEnabled="-1"');
    for (let s = 0; s < 3; s++) {
      if (!ln.includes(`Overlay${s}="`)) {
        ln = ln.replace(/(\/?>)$/, ` Overlay${s}="${nullUUID}"$1`);
      }
    }

    block[0] = ln;
    newRawLines.push(...block);

    _vmixNewVIs.push({
      key:      newKey,
      parentKey,
      title:    parentTitle,
      overlays: [0, 1, 2].map(s => {
        const v = parentInp.getAttribute(`Overlay${s}`);
        return (v && v !== nullUUID) ? v : null;
      }),
    });
  }

  lines.splice(insertAt, 0, ...newRawLines);
  _vmixRawText = lines.join(eol);

  vmixRenderVIPane();
  document.getElementById('vmixDownloadCard').style.display = 'block';
}

function vmixUpdateVIOverlay(viKey, slot, sourceKey) {
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const val = sourceKey || nullUUID;
  _vmixSetRawAttr(viKey, `Overlay${slot}`, val);
  const vi = _vmixNewVIs.find(v => v.key === viKey);
  if (vi) { vi.overlays[slot] = sourceKey || null; }
}

function vmixVILayerNumChange(viKey, slot, numEl) {
  const num = parseInt(numEl.value);
  const vi = _vmixNewVIs.find(v => v.key === viKey);
  const newKeys = new Set(_vmixNewVIs.map(v => v.key));
  const origInputs = _vmixInputs().filter(inp => !newKeys.has(inp.getAttribute('Key')));
  const target = origInputs.find(inp =>
    _vmixNum(inp) === num && inp.getAttribute('Key') !== vi?.parentKey
  );
  const sel = document.getElementById(`vis-${viKey}-${slot}`);
  if (target) {
    const k = target.getAttribute('Key');
    if (sel) { sel.value = k; }
    vmixUpdateVIOverlay(viKey, slot, k);
  } else {
    numEl.value = '';
    if (sel) { sel.value = ''; }
    vmixUpdateVIOverlay(viKey, slot, '');
  }
}

function vmixVILayerSelChange(viKey, slot, selEl) {
  const sourceKey = selEl.value;
  const newKeys = new Set(_vmixNewVIs.map(v => v.key));
  const origInputs = _vmixInputs().filter(inp => !newKeys.has(inp.getAttribute('Key')));
  const numEl = document.getElementById(`vin-${viKey}-${slot}`);
  if (sourceKey) {
    const inp = origInputs.find(i => i.getAttribute('Key') === sourceKey);
    if (numEl) { numEl.value = inp ? _vmixNum(inp) : ''; }
  } else {
    if (numEl) { numEl.value = ''; }
  }
  vmixUpdateVIOverlay(viKey, slot, sourceKey);
}

function vmixDownload() {
  // XMLSerializer 대신 raw 텍스트 직접 사용 — 인코딩 변환 없이 원본 포맷 유지
  const blob = new Blob([_vmixRawText], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = _vmixFilename.replace(/\.vmix$/i, '') + '_edited.vmix';
  a.click();
  URL.revokeObjectURL(url);
}

(function () {
  const drop = document.getElementById('vmixDropArea');
  drop.addEventListener('dragover',  e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) { vmixLoad(file); }
  });
})();


// ── 초기 실행 ────────────────────────────────────────────
calc();
