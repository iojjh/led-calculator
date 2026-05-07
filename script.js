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
// ════════════════════════════════════════════════════════════


// ── §1  스펙 데이터 & 상수 ────────────────────────────────

const APP_VERSION = '1.0.1';

// LED 피치별 패널 해상도 (px) — px500: 500×500mm 패널, px1000: 500×1000mm 패널
const SPECS = {
  '2mm': { px500: { w: 192, h: 192 }, px1000: { w: 192, h: 384 } },
  '3mm': { px500: { w: 128, h: 128 }, px1000: { w: 128, h: 256 } },
  '4mm': { px500: { w: 104, h: 104 }, px1000: { w: 104, h: 208 } },
};

const MAX_PX  = 650000; // 포트당 최대 픽셀 수 상한
const LP_MS   = 380;    // 마우스 롱프레스 임계값 (ms)
const LP_TOUCH = 600;   // 터치 롱프레스 임계값 (ms) — 일반 탭과 명확히 구분하기 위해 더 길게 설정

// 포트 8개에 대응하는 색상
const PC = ['#378ADD','#E24B4A','#EF9F27','#1D9E75','#7F77DD','#D85A30','#5DCAA5','#D4537E'];

// 콘솔 장비 스펙
const CSPEC = {
  EC90: { cable: 'LC 광케이블', rep: 'HDMI 리피터', manual: 'MIG-EC90 User Manual 1.0.pdf' },
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

let curSending = null; // 현재 선택된 샌딩카드 키


// ── §2  장비 체크리스트 ───────────────────────────────────

// 기본 항목 배열 (사용자가 추가/삭제 가능)
let COM = [
  '케이블타이','메인선','분전함','샌딩카드 (컨트롤러)','광케이블',
  '셋팅용 노트북','메인 노트북','3구 파워콘','멀티탭',
  '공구통 (쪽가위·드라이버·줄자·개퍼테이프·전동공구·깔판 등)',
  '모니터','콘솔','리피터',
];
let COND = [
  '안전모','하네스',
  '220V 1번 파워','랜선 커플러','파워콘 커플러','프로파일','웨이트',
  '옐로재킷','고무판','비닐','끈바','깔깔이','접지봉',
  'HDMI','프롬프터','전기릴선','퍼팩트큐','테이블',
  '카메라','삼각대','오인페','SDI 케이블','캡처보드',
];

// 체크 상태 객체 (항목명 → boolean)
const chkState = {};
COM.concat(COND).forEach(n => { chkState[n] = false; });

// 체크리스트 전체 렌더링
function renderCL() {
  function mk(n) {
    const d    = chkState[n];
    const safe = n.replace(/\\/g, '\\\\').replace(/'/g, "\\'"); // onclick 문자열 이스케이프
    return `<div class="ci${d ? ' done' : ''}" onclick="tog('${safe}')">
      <input type="checkbox"${d ? ' checked' : ''} onclick="event.stopPropagation();tog('${safe}')">
      <span class="cil">${n}</span>
      <button class="del-btn" onclick="event.stopPropagation();delItem('${safe}')">×</button>
    </div>`;
  }
  document.getElementById('commonList').innerHTML = COM.map(mk).join('');
  document.getElementById('condList').innerHTML   = COND.map(mk).join('');

  const all  = COM.length + COND.length;
  const done = Object.values(chkState).filter(Boolean).length;
  document.getElementById('progFill').style.width = (all ? Math.round(done / all * 100) : 0) + '%';
  document.getElementById('progTxt').textContent  = done + ' / ' + all;
}
function tog(n) { chkState[n] = !chkState[n]; renderCL(); }
function clearAllChecks() { Object.keys(chkState).forEach(k => { chkState[k] = false; }); renderCL(); }
function delItem(n) {
  const ci = COM.indexOf(n), di = COND.indexOf(n);
  if (ci >= 0)      COM.splice(ci, 1);
  else if (di >= 0) COND.splice(di, 1);
  delete chkState[n];
  renderCL();
}
function addItem(section) {
  const inp  = document.getElementById('add-' + section);
  const name = inp.value.trim();
  if (!name) return;
  if (section === 'common') { if (!COM.includes(name))  { COM.push(name);  chkState[name] = false; } }
  else                      { if (!COND.includes(name)) { COND.push(name); chkState[name] = false; } }
  inp.value = '';
  renderCL();
}
renderCL(); // 페이지 로드 시 초기 렌더링


// ── §3  메모 ──────────────────────────────────────────────

let memoList = [];

function renderMemo() {
  document.getElementById('memoList').innerHTML = memoList.map((t, i) =>
    `<div class="memo-item">
      <span class="memo-txt">${t}</span>
      <button class="del-btn" onclick="delMemo(${i})">×</button>
    </div>`
  ).join('');
}
function addMemo() {
  const inp = document.getElementById('add-memo');
  const t   = inp.value.trim();
  if (!t) return;
  memoList.push(t); inp.value = ''; renderMemo();
}
function delMemo(i) { memoList.splice(i, 1); renderMemo(); }


// ── §4  탭 전환 & 버전 표시 ──────────────────────────────

function swTab(id, btn) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tab-btn').forEach(b  => b.classList.remove('on'));
  document.getElementById('tab-' + id).classList.add('on');
  btn.classList.add('on');
}

document.getElementById('appVersion').textContent = 'v' + APP_VERSION;

// 버전 5번 탭 → 이스터에그
let _verTaps = 0, _verTimer = null;
function _onVersionTap() {
  _verTaps++;
  clearTimeout(_verTimer);
  if (_verTaps >= 5) {
    _verTaps = 0;
    document.getElementById('easterBg').style.display = 'flex';
  } else {
    _verTimer = setTimeout(() => { _verTaps = 0; }, 1800);
  }
}
function closeEaster()    { document.getElementById('easterBg').style.display = 'none'; }
function closeEasterBg(e) { if (e.target === document.getElementById('easterBg')) closeEaster(); }


// ── §5  콘솔 & 샌딩카드 ──────────────────────────────────

function selConsole(el) {
  document.querySelectorAll('#consoleChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  const s = CSPEC[el.dataset.v];
  document.getElementById('cableType').textContent     = s.cable;
  document.getElementById('repeaterType').textContent  = s.rep;
  const lnk = document.getElementById('consoleManual');
  lnk.onclick       = () => openManual(s.manual, el.dataset.v + ' 메뉴얼');
  lnk.style.display = 'inline-flex';
  document.getElementById('consoleInfo').style.display = 'block';
}
function selSending(el) {
  document.querySelectorAll('#sendingChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  curSending = el.dataset.v;
  const s = SSPEC[curSending];
  const lnk = document.getElementById('sendingManual');
  lnk.onclick       = () => openManual(s.manual, s.label + ' 메뉴얼');
  lnk.style.display = 'inline-flex';
  document.getElementById('sendingInfo').style.display = 'block';
  if (isReady()) renderRes();
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

function showPreview(dataUrl, filename) {
  pendingDownload = { dataUrl, filename };
  document.getElementById('previewImg').src          = dataUrl;
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}
function closePreviewModal() {
  document.getElementById('previewBg').style.display = 'none';
  pendingDownload = null;
  document.getElementById('previewImg').src = '';
}
function closePreview(e) {
  if (e.target === document.getElementById('previewBg')) closePreviewModal();
}
function confirmDownload() {
  if (pendingDownload) dl(pendingDownload.dataUrl, pendingDownload.filename);
  closePreviewModal();
}

// 공유 — Web Share API 사용 (모바일에서 다른 앱으로 전달)
async function shareImage() {
  if (!pendingDownload) return;
  try {
    const res  = await fetch(pendingDownload.dataUrl);
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
    if (err.name !== 'AbortError') console.warn(err); // 사용자 취소는 무시
  }
}

// ── PNG 스냅샷 생성 ──────────────────────────────────────

async function saveCalcPng() {
  if (!isReady()) { alert('LED 종류와 패널 사이즈를 먼저 선택해주세요.'); return; }

  const sp = SPECS[curLed];
  const tW = cols * sp.px500.w;
  let tH = 0; layout.forEach(r => { tH += ppx(r.type).h; });

  // 패널 수량
  let c5 = 0, c10 = 0;
  layout.forEach(r => {
    if (r.type === 'half')         c5  += cols;
    else if (basePH === 1000)      c10 += cols;
    else                           c5  += cols;
  });

  // 케이블 수량 (수동 조정값 우선 적용)
  const asgn = new Set(); pA.forEach(s => s.forEach(k => asgn.add(k)));
  const tot  = layout.length * cols, una = tot - asgn.size;
  const _lan = _calcLan(), _pw = calcPW();
  const l1   = cableAdj.l1 ?? _lan.l1;
  const sl   = cableAdj.sl ?? _lan.sl;
  const pw   = { c1: cableAdj.c1 ?? _pw.c1, sp: cableAdj.sp ?? _pw.sp };

  // 입력 필드 값 수집
  const W         = document.getElementById('iW').value;
  const H         = document.getElementById('iH').value;
  const panelEl   = document.querySelector('#panelChips .chip.on');
  const consoleEl = document.querySelector('#consoleChips .chip.on');
  const mainLen   = document.getElementById('mainLen').value;
  const fiberLen  = document.getElementById('fiberLen').value;
  const consoleName  = consoleEl  ? consoleEl.dataset.v : null;
  const consoleSpec  = consoleName ? CSPEC[consoleName] : null;
  const sendingSpec  = curSending  ? SSPEC[curSending]  : null;

  // 시뮬레이터 캔버스 → img 태그 (cloneNode는 캔버스 픽셀을 복사하지 않으므로 dataURL로 변환)
  const simCv = document.getElementById('simCanvas');
  const simImgHtml = simCv && simCv.width > 0
    ? `<img src="${simCv.toDataURL('image/png')}" style="width:100%;border-radius:6px;display:block;margin-bottom:4px;">`
    : '';

  // 스냅샷 HTML 헬퍼
  const S   = (t, v) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><span style="color:#888">${t}</span><span style="color:#1a1a1a;font-weight:500">${v}</span></div>`;
  const SEC = t      => `<div style="font-size:10px;font-weight:600;color:#999;letter-spacing:.08em;text-transform:uppercase;margin:14px 0 6px;">${t}</div>`;

  // 샌딩카드 커버 여부 표시 블록
  let coverHtml = '';
  if (sendingSpec) {
    const modesStr  = sendingSpec.modes.map(m => `${m.maxW}×${m.maxH}@${m.maxHz}Hz`).join(' / ');
    const sorted    = [...sendingSpec.modes].sort((a, b) => b.maxHz - a.maxHz);
    const coverMode = sorted.find(m => tW <= m.maxW && tH <= m.maxH) || null;
    const ok = coverMode !== null;
    coverHtml = `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:6px 10px;border-radius:6px;background:${ok?'#E1F5EE':'#FCEBEB'};font-size:12px;">
      <span style="color:${ok?'#085041':'#A32D2D'}">${sendingSpec.label}: ${modesStr}</span>
      <span style="font-weight:600;color:${ok?'#0F6E56':'#E24B4A'}">${ok ? `✓ ${coverMode.maxHz}Hz` : '✗ 초과'}</span>
    </div>`;
  }

  const portRows = pA.map((s, i) => s.size > 0 ? `P${i+1}:${s.size}장` : null).filter(Boolean).join(' · ');
  const memoHtml = memoList.length
    ? SEC('메모') + memoList.map(t => `<div style="font-size:13px;color:#444;padding:3px 0;">• ${t}</div>`).join('')
    : '';

  const body = `
    ${SEC('기본 정보')}
    ${S('설치 면적', `${W}m × ${H}m`)}
    ${S('LED 종류', curLed)}
    ${S('패널 사이즈', panelEl ? panelEl.textContent.trim() : '-')}
    ${consoleName || curSending || mainLen ? SEC('장비') : ''}
    ${consoleName ? S('콘솔', `${consoleName} (${consoleSpec.cable} · ${consoleSpec.rep})`) : ''}
    ${consoleName && fiberLen ? S('광케이블 길이', fiberLen + 'm') : ''}
    ${curSending  ? S('샌딩카드', sendingSpec.label) : ''}
    ${mainLen     ? S('분전함 메인선', mainLen + 'm') : ''}
    ${SEC('계산 결과')}
    ${S('가로 패널', cols + ' ea')}
    ${S('세로 패널', layout.length + ' 행')}
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
      <div style="font-weight:600;color:#0C447C;margin-bottom:4px;">랜선</div>
      ${S('1번 랜 (포트→첫 패널)', l1 + ' 개')}
      ${S('숏랜 (패널 간)', sl + ' 개')}
      <div style="display:flex;justify-content:space-between;font-weight:600;font-size:13px;padding:5px 0;margin-top:2px;color:#042C53;"><span>합계</span><span>${l1+sl} 개</span></div>
      ${una > 0 ? `<div style="font-size:11px;color:#BA7517;margin-top:2px;">미할당 ${una}/${tot} 패널</div>` : ''}
    </div>
    <div style="background:#FAEEDA;border-radius:8px;padding:10px 12px;font-size:13px;">
      <div style="font-weight:600;color:#633806;margin-bottom:4px;">파워콘</div>
      ${S('1번 파워 (세로 2열당 1개)', pw.c1 + ' 개')}
      ${S('숏 파워 (패널 간)', pw.sp + ' 개')}
      <div style="display:flex;justify-content:space-between;font-weight:600;font-size:13px;padding:5px 0;margin-top:2px;color:#412402;"><span>합계</span><span>${pw.c1+pw.sp} 개</span></div>
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
  document.getElementById('confirmMsg').textContent   = msg;
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
  cableAdj = { l1: null, sl: null, c1: null, sp: null };
  // 칩 선택 초기화
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  curLed = null; basePH = null; curSending = null;
  // 장비 패널 숨기기
  document.getElementById('consoleInfo').style.display = 'none';
  document.getElementById('sendingInfo').style.display = 'none';
  document.getElementById('fiberLen').value = '';
  document.getElementById('mainLen').value  = '';
  // 메모 & 체크리스트 초기화
  memoList = []; renderMemo();
  Object.keys(chkState).forEach(k => { chkState[k] = false; }); renderCL();
  // 시뮬레이터 초기화 및 결과 영역 초기화
  rst(); cols = 0; layout = [];
  document.getElementById('resultBody').innerHTML = '<div style="color:#999;font-size:13px;">LED 종류와 패널 사이즈를 선택하세요</div>';
  document.getElementById('simArea').innerHTML    = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
}


// ── §8  저장 / 불러오기 (localStorage) ───────────────────

// 현재 앱 전체 상태를 직렬화 가능한 객체로 반환
function getAppState(name) {
  return {
    name,
    date: new Date().toLocaleDateString('ko-KR'),
    W: document.getElementById('iW').value,
    H: document.getElementById('iH').value,
    curLed, basePH, curSending,
    consoleName: document.querySelector('#consoleChips .chip.on')?.dataset.v || null,
    fiberLen: document.getElementById('fiberLen').value,
    mainLen:  document.getElementById('mainLen').value,
    pA:  pA.map(s => [...s]),          // Set → Array (JSON 직렬화)
    pH2: pH2.map(a => [...a]),
    cableAdj: { ...cableAdj },
    memoList: [...memoList],
    chkState: { ...chkState },
    COM:  [...COM],
    COND: [...COND],
  };
}

// 저장된 상태 객체를 앱에 복원
function loadAppState(st) {
  document.getElementById('iW').value = st.W ?? '';
  document.getElementById('iH').value = st.H ?? '';
  cableAdj = st.cableAdj ? { ...st.cableAdj } : { l1: null, sl: null, c1: null, sp: null };

  // 칩 상태 복원
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  curLed = null; basePH = null; curSending = null;
  if (st.curLed) {
    const el = document.querySelector(`#ledChips .chip[data-v="${st.curLed}"]`);
    if (el) { el.classList.add('on'); curLed = st.curLed; }
  }
  if (st.basePH) {
    const el = document.querySelector(`#panelChips .chip[data-v="${st.basePH}"]`);
    if (el) { el.classList.add('on'); basePH = st.basePH; }
  }

  // 콘솔·샌딩카드 복원 (selConsole/selSending이 UI도 업데이트)
  document.getElementById('consoleInfo').style.display = 'none';
  document.getElementById('sendingInfo').style.display = 'none';
  if (st.consoleName) {
    const el = document.querySelector(`#consoleChips .chip[data-v="${st.consoleName}"]`);
    if (el) selConsole(el);
  }
  document.getElementById('fiberLen').value = st.fiberLen || '';
  if (st.curSending) {
    const el = document.querySelector(`#sendingChips .chip[data-v="${st.curSending}"]`);
    if (el) selSending(el);
  }
  document.getElementById('mainLen').value = st.mainLen || '';

  // 체크리스트 복원
  if (st.COM)  COM  = [...st.COM];
  if (st.COND) COND = [...st.COND];
  Object.keys(chkState).forEach(k => delete chkState[k]);
  COM.concat(COND).forEach(n => { chkState[n] = st.chkState?.[n] ?? false; });
  renderCL();

  memoList = st.memoList || []; renderMemo();

  // 계산 실행 후 포트 할당 복원 (calc()가 pA를 초기화하므로 반드시 이후에)
  rst();
  if (isReady()) calc();
  if (st.pA && isReady()) {
    pA  = st.pA.map(a => new Set(a));
    pH2 = (st.pH2 || st.pA).map(a => [...a]);
    drawCv(); renderPorts(); renderLeg(); renderSum();
  }
}

function saveState() {
  const inp  = document.getElementById('saveNameInput');
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  const idx   = saves.findIndex(s => s.name === name);
  const st    = getAppState(name);
  if (idx >= 0) saves[idx] = st; else saves.push(st); // 동일 이름은 덮어쓰기
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
  const el    = document.getElementById('saveList');
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

let cDisp = '0', cPrev = null, cOp = null, cNew = true, cExpr = '';

// 디스플레이 업데이트
function _cu() {
  document.getElementById('calcDisplay').textContent = cDisp;
  document.getElementById('calcExpr').textContent    = cExpr;
}
function calcInput(v) {
  cDisp = cNew ? (cNew = false, v) : (cDisp === '0' ? v : cDisp + v);
  _cu();
}
function calcDot() {
  if (cNew) { cDisp = '0.'; cNew = false; } else if (!cDisp.includes('.')) cDisp += '.';
  _cu();
}
function calcOper(op) {
  cPrev = parseFloat(cDisp); cOp = op; cNew = true; cExpr = cDisp + ' ' + op; _cu();
}
function calcEquals() {
  if (cPrev === null || cOp === null) return;
  const cur = parseFloat(cDisp);
  // '−' 는 U+2212 (버튼의 onclick 문자와 동일)
  let r = cOp === '+' ? cPrev + cur
        : cOp === '−' ? cPrev - cur
        : cOp === '×' ? cPrev * cur
        : cur !== 0   ? cPrev / cur
        : NaN;
  cExpr = cExpr + ' ' + cDisp + ' =';
  cDisp = isNaN(r) ? '오류' : String(parseFloat(r.toFixed(10)));
  cPrev = null; cOp = null; cNew = true; _cu();
}
function calcClear() { cDisp = '0'; cPrev = null; cOp = null; cNew = true; cExpr = ''; _cu(); }
function calcDel() {
  if (cNew || cDisp.length <= 1) { cDisp = '0'; cNew = true; } else cDisp = cDisp.slice(0, -1);
  _cu();
}
function toggleCalc() {
  const p = document.getElementById('calcPanel');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
}




// ── §9.5  PDF 뷰어 ────────────────────────────────────────

let _pdfDoc = null, _pdfPage = 1, _pdfTotal = 0;

async function openManual(url, title) {
  document.getElementById('pdfTitle').textContent = title || '메뉴얼';
  document.getElementById('pdfInfo').textContent  = '로딩 중...';
  document.getElementById('pdfPrev').disabled     = true;
  document.getElementById('pdfNext').disabled     = true;
  document.getElementById('pdfBg').style.display  = 'flex';
  try {
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    _pdfDoc   = await lib.getDocument(url).promise;
    _pdfTotal = _pdfDoc.numPages;
    _pdfPage  = 1;
    await _renderPdfPage();
  } catch {
    document.getElementById('pdfInfo').textContent = '파일을 불러올 수 없습니다.';
  }
}

async function _renderPdfPage() {
  const page = await _pdfDoc.getPage(_pdfPage);
  const cv   = document.getElementById('pdfCanvas');
  const cw   = document.getElementById('pdfBody').clientWidth - 16;
  const vp   = page.getViewport({ scale: cw / page.getViewport({ scale: 1 }).width });
  cv.width   = Math.round(vp.width);
  cv.height  = Math.round(vp.height);
  cv.style.width = '100%';
  document.getElementById('pdfBody').scrollTop = 0;
  await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
  document.getElementById('pdfInfo').textContent  = `${_pdfPage} / ${_pdfTotal}`;
  document.getElementById('pdfPrev').disabled     = _pdfPage <= 1;
  document.getElementById('pdfNext').disabled     = _pdfPage >= _pdfTotal;
}

async function pdfPrev() { if (_pdfPage > 1)         { _pdfPage--; await _renderPdfPage(); } }
async function pdfNext() { if (_pdfPage < _pdfTotal) { _pdfPage++; await _renderPdfPage(); } }
function closePdf()    { document.getElementById('pdfBg').style.display = 'none'; _pdfDoc = null; _pdfPage = 1; _pdfTotal = 0; }
function closePdfBg(e) { if (e.target === document.getElementById('pdfBg')) closePdf(); }


// ════════════════════════════════════════════════════════════
//  §10  계산기 핵심 (면적·패널 계산 & 결과 렌더링)
// ════════════════════════════════════════════════════════════

let curLed = null, basePH = null; // 선택된 LED 피치 / 기준 패널 높이(mm)
let cols = 0, layout = [];        // 가로 패널 수 / 행별 타입 배열 [{type:'full'|'half'}]

function isReady() { return curLed && basePH; }

function selLed(el) {
  document.querySelectorAll('#ledChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); curLed = el.dataset.v;
  rst(); calc();
}
function selPanel(el) {
  document.querySelectorAll('#panelChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); basePH = parseInt(el.dataset.v);
  rst(); calc();
}

// 행 타입에 따른 픽셀 크기 반환
function ppx(rowType) {
  const s = SPECS[curLed];
  return rowType === 'half' ? s.px500 : (basePH === 1000 ? s.px1000 : s.px500);
}

// 파워콘 수량 계산
// 규칙: 열 2개당 1번 파워, 홀수 열이면 단독 열도 1개
// 숏파워: 각 열(2개 묶음)에서 패널 간 연결선 수
function calcPW() {
  const rows = layout.length;
  const pc   = Math.floor(cols / 2), odd = cols % 2 === 1;
  let sp = 0;
  for (let i = 0; i < pc; i++) sp += (rows * 2) - 1; // 2열 묶음의 패널 간 연결
  if (odd) sp += (rows - 1);                          // 홀수 단독 열
  return { c1: Math.ceil(cols / 2), sp };
}

function calc() {
  const W = parseFloat(document.getElementById('iW').value) || 0;
  const H = parseFloat(document.getElementById('iH').value) || 0;

  // 면적 미입력 시 안내 메시지
  if (!W || !H) {
    cols = 0; layout = [];
    const msg = isReady() ? '설치 면적을 입력하세요' : 'LED 종류와 패널 사이즈를 선택하세요';
    const sim = isReady() ? '설치 면적을 먼저 입력해주세요' : 'LED 종류와 패널 사이즈를 먼저 선택해주세요';
    document.getElementById('resultBody').innerHTML = `<div style="color:#999;font-size:13px;">${msg}</div>`;
    document.getElementById('simArea').innerHTML    = `<div class="sim-locked">${sim}</div>`;
    return;
  }

  cols   = Math.max(1, Math.round(W * 1000 / 500));
  layout = [];

  if (!isReady()) {
    document.getElementById('resultBody').innerHTML = '<div style="color:#999;font-size:13px;">LED 종류와 패널 사이즈를 선택하세요</div>';
    document.getElementById('simArea').innerHTML    = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
    return;
  }

  const Hmm = H * 1000;
  if (basePH === 1000) {
    // 1000mm 기준 — 나머지가 400mm 이상이면 상단에 500mm(half) 패널 추가
    const fr = Math.floor(Hmm / 1000);
    if (Math.round(Hmm - fr * 1000) >= 400) layout.push({ type: 'half' });
    for (let i = 0; i < fr; i++) layout.push({ type: 'full' });
  } else {
    // 500mm 기준
    const nr = Math.max(1, Math.round(Hmm / 500));
    for (let i = 0; i < nr; i++) layout.push({ type: 'full' });
  }

  // 크기 변경으로 범위 밖이 된 포트 할당 셀 제거
  pA.forEach((s, pi) => {
    [...s].forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r >= layout.length || c >= cols) { s.delete(k); pH2[pi] = pH2[pi].filter(x => x !== k); }
    });
  });

  renderRes();
  buildSim();
}

function renderRes() {
  if (!isReady()) return;
  const sp = SPECS[curLed]; let c5 = 0, c10 = 0;
  layout.forEach(r => {
    if (r.type === 'half')    c5  += cols;
    else if (basePH === 1000) c10 += cols;
    else                      c5  += cols;
  });
  const tW = cols * sp.px500.w;
  let tH = 0; layout.forEach(r => { tH += ppx(r.type).h; });

  // 샌딩카드 커버 가능 여부 — Hz 높은 모드부터 체크
  let coverHtml = '';
  if (curSending) {
    const ss = SSPEC[curSending];
    const modesStr  = ss.modes.map(m => `${m.maxW}×${m.maxH}@${m.maxHz}Hz`).join(' / ');
    const sorted    = [...ss.modes].sort((a, b) => b.maxHz - a.maxHz);
    const coverMode = sorted.find(m => tW <= m.maxW && tH <= m.maxH) || null;
    const ok = coverMode !== null;
    coverHtml = `<div class="cover-row${ok ? '' : ' cover-over'}">
      <span>${ss.label}: ${modesStr}</span>
      <span class="cover-badge">${ok ? `✓ ${coverMode.maxHz}Hz 커버 가능` : '✗ 해상도 초과'}</span>
    </div>`;
  }

  let h = '<div class="metric-grid">';
  h += `<div class="metric"><div class="ml">가로 패널 수</div><div class="mv">${cols}<span class="mu"> ea</span></div></div>`;
  h += `<div class="metric"><div class="ml">세로 패널 수</div><div class="mv">${layout.length}<span class="mu"> 행</span></div></div>`;
  h += `<div class="metric"><div class="ml">500×500 패널</div><div class="mv">${c5}<span class="mu"> ea</span></div></div>`;
  h += `<div class="metric"><div class="ml">500×1000 패널</div><div class="mv">${c10}<span class="mu"> ea</span></div></div>`;
  h += '</div>';
  h += `<div class="res-banner"><div class="rl">최종 해상도</div><div class="rv">${tW} × ${tH} px</div></div>`;
  h += coverHtml;
  h += `<div style="font-size:12px;color:#999;margin-bottom:8px;">패널 해상도 — 500×500: ${sp.px500.w}×${sp.px500.h}px · 500×1000: ${sp.px1000.w}×${sp.px1000.h}px</div>`;
  document.getElementById('resultBody').innerHTML = h;
}


// ════════════════════════════════════════════════════════════
//  §11  랜선 시뮬레이터
// ════════════════════════════════════════════════════════════

let pA   = Array.from({ length: 8 }, () => new Set()); // 포트별 할당 셀 집합
let pH2  = Array.from({ length: 8 }, () => []);         // 포트별 할당 순서 (화살표 방향용)
let aPort = 0;                   // 현재 활성 포트 인덱스 (0~7)
let fCell = null;                // 키보드 방향키 포커스 셀 { r, c }
let cellW = 40, rH = [];         // 셀 너비(px) / 행별 픽셀 높이 배열
let lpT   = null, drag = false;  // 롱프레스 타이머 / 드래그 진행 여부
let dStk  = [], dHov  = null;    // 드래그 히스토리 스택 / 현재 호버 셀 키
let cableAdj = { l1: null, sl: null, c1: null, sp: null }; // 케이블 수량 수동 조정값 (null = 자동계산)

// ── 상태 초기화 ───────────────────────────────────────────

function rst() {
  pA       = Array.from({ length: 8 }, () => new Set());
  pH2      = Array.from({ length: 8 }, () => []);
  cableAdj = { l1: null, sl: null, c1: null, sp: null };
  fCell = null; drag = false; dStk = []; dHov = null; aPort = 0;
}
function rstPort(pi) {
  pA[pi] = new Set(); pH2[pi] = [];
  if (aPort === pi) fCell = null;
  aPort = firstEmpty();
}
// 데이터가 없는 첫 번째 포트 인덱스 반환
function firstEmpty() { for (let i = 0; i < 8; i++) { if (pA[i].size === 0) return i; } return 0; }
function nextEmpty()  { for (let i = 0; i < 8; i++) { if (pA[i].size === 0) return i; } return aPort; }

// ── 시뮬레이터 UI 빌드 ────────────────────────────────────

function buildSim() {
  document.getElementById('simArea').innerHTML = `
    <div class="sim-hint">
      <b style="color:#333">탭/클릭</b> 할당·해제 &nbsp;·&nbsp;
      <b style="color:#333">꾹+드래그</b> 자동 포트 선택 후 연속 할당 &nbsp;·&nbsp;
      <b style="color:#333">역방향</b> 취소
    </div>
    <div class="port-strip" id="portStrip"></div>
    <div class="port-info-bar" id="portInfo"></div>
    <div class="reset-row">
      <button class="reset-btn all" onclick="doRstAll()">전체 초기화</button>
      <button class="reset-btn" id="rstPBtn"   onclick="doRstPort()">포트 초기화</button>
    </div>
    <canvas id="simCanvas" tabindex="0" style="outline:none;cursor:crosshair;border-radius:6px;"></canvas>
    <div class="legend" id="legend"></div>
    <div id="simSum"></div>`;
  attachEv();
  renderPorts(); buildCv(); renderLeg(); renderSum();
}

function _execRstAll() { rst(); drawCv(); renderPorts(); renderLeg(); renderSum(); }
function doRstAll()    { openConfirm('포트 전체 초기화', '할당된 모든 포트를 초기화할까요?', _execRstAll); }
function doRstPort()   { rstPort(aPort); drawCv(); renderPorts(); renderLeg(); renderSum(); }

// 특정 포트의 총 픽셀 수 계산
function pxOf(pi) {
  let px = 0;
  pA[pi].forEach(k => {
    const [r] = k.split(',').map(Number);
    if (!layout[r]) return;
    const p = ppx(layout[r].type);
    px += p.w * p.h;
  });
  return px;
}

// ── 포트 버튼 & 정보바 렌더링 ─────────────────────────────

function renderPorts() {
  const s = document.getElementById('portStrip'); if (!s) return;
  s.innerHTML = pA.map((set, i) => {
    const on = i === aPort, has = set.size > 0;
    return `<button class="port-btn${on?' active':''}${has?' has-data':''}"
      style="${on ? `background:${PC[i]};border-color:${PC[i]};` : has ? `border-color:${PC[i]};color:${PC[i]};` : ''}"
      onclick="setP(${i})">P${i+1}</button>`;
  }).join('');

  const px  = pxOf(aPort);
  const pct = Math.min(100, Math.round(px / MAX_PX * 100));
  const ov  = px > MAX_PX;
  const pi  = document.getElementById('portInfo');
  if (pi) pi.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
      <span style="font-size:13px;font-weight:500;color:${PC[aPort]}">포트 ${aPort+1}</span>
      <span style="font-size:13px;color:#333;">${pA[aPort].size}장 · ${px.toLocaleString()} px</span>
      <span style="font-size:12px;color:${ov?'#A32D2D':'#888'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov?' ⚠ 초과':''}</span>
      ${drag ? `<span class="drag-badge" style="background:${PC[aPort]}">드래그 중</span>` : ''}
    </div>
    <div style="height:5px;background:#eee;border-radius:3px;margin-top:6px;">
      <div style="height:5px;width:${pct}%;background:${ov?'#E24B4A':PC[aPort]};border-radius:3px;"></div>
    </div>`;

  const rb = document.getElementById('rstPBtn');
  if (rb) rb.textContent = `포트 ${aPort+1} 초기화`;
}
function setP(i) { aPort = i; renderPorts(); }

// ── 캔버스 빌드 & 드로잉 ──────────────────────────────────

function buildCv() {
  const cv = document.getElementById('simCanvas'); if (!cv || !cols || !layout.length) return;
  const cW = Math.min(cv.parentElement.clientWidth - 32, 600);
  cellW = Math.max(28, Math.min(64, Math.floor(cW / cols)));
  rH    = layout.map(r => r.type === 'full' ? (basePH === 1000 ? cellW * 2 : cellW) : cellW);
  cv.width  = cols * cellW;
  cv.height = rH.reduce((s, h) => s + h, 0);
  drawCv();
}
function cxOf(c) { return c * cellW + cellW / 2; }
function cyOf(r) { let y = 0; for (let i = 0; i < r; i++) y += rH[i]; return y + rH[r] / 2; }

// 마우스/터치 좌표 → 행·열 인덱스 변환
function cellAt(mx, my) {
  if (mx < 0 || mx >= cols * cellW) return null;
  const c = Math.floor(mx / cellW); let y = 0, ri = -1;
  rH.forEach((h, i) => { if (ri < 0 && my >= y && my < y + h) ri = i; y += h; });
  if (ri < 0 || c < 0 || c >= cols) return null;
  return { key: `${ri},${c}`, r: ri, c, cx: cxOf(c), cy: cyOf(ri) };
}

// 특정 셀을 소유한 포트 인덱스 반환 (-1 = 미할당)
function owner(k) { let o = -1; pA.forEach((s, i) => { if (s.has(k)) o = i; }); return o; }

function assign(pi, k) {
  let o = -1; pA.forEach((s, i) => { if (s.has(k)) o = i; });
  if (o >= 0 && o !== pi) return false; // 다른 포트에 이미 할당된 셀은 건드리지 않음
  if (!pA[pi].has(k)) { pA[pi].add(k); pH2[pi].push(k); }
  return true;
}
function deassign(pi, k) { pA[pi].delete(k); pH2[pi] = pH2[pi].filter(x => x !== k); }

// 두 점 사이에 방향 화살표 그리기
function arrow(ctx, x1, y1, x2, y2, col) {
  const dx = x2-x1, dy = y2-y1, len = Math.sqrt(dx*dx + dy*dy);
  if (len < 4) return;
  const ux = dx/len, uy = dy/len, g = cellW * 0.28;
  const ax = x1+ux*g, ay = y1+uy*g, bx = x2-ux*g, by = y2-uy*g;
  ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
  ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.stroke();
  const hw = 4, hl = 7, px = -uy, py = ux; // 화살촉
  ctx.beginPath(); ctx.moveTo(bx, by);
  ctx.lineTo(bx - ux*hl + px*hw, by - uy*hl + py*hw);
  ctx.lineTo(bx - ux*hl - px*hw, by - uy*hl - py*hw);
  ctx.closePath(); ctx.fillStyle = col; ctx.fill();
}

function drawCv() {
  const cv = document.getElementById('simCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  let y = 0;
  layout.forEach((row, ri) => {
    const ch = rH[ri];
    for (let c = 0; c < cols; c++) {
      const k   = `${ri},${c}`;
      const ow  = owner(k);
      const lk  = ow >= 0 && ow !== aPort;                           // 다른 포트에 잠긴 셀
      const hov  = drag && k === dHov && ow < 0;                    // 드래그 호버 셀
      const last = drag && dStk.length > 0 && dStk[dStk.length-1].key === k; // 드래그 끝 셀

      // 셀 배경색
      ctx.fillStyle = ow >= 0
        ? PC[ow] + (lk ? '55' : '99')
        : row.type === 'half' ? '#C0DD97' : '#9FE1CB';
      ctx.fillRect(c * cellW + 1, y + 1, cellW - 2, ch - 2);

      if (hov) { ctx.fillStyle = PC[aPort] + '44'; ctx.fillRect(c * cellW + 1, y + 1, cellW - 2, ch - 2); }

      // 셀 테두리
      ctx.strokeStyle = ow >= 0 ? PC[ow] : (row.type === 'half' ? '#639922' : '#1D9E75');
      ctx.lineWidth   = ow >= 0 ? 1.5 : 0.5;
      ctx.strokeRect(c * cellW + 1, y + 1, cellW - 2, ch - 2);

      // 드래그 끝 셀 강조 테두리
      if (last) {
        ctx.strokeStyle = 'white';   ctx.lineWidth = 2.5; ctx.strokeRect(c*cellW+3, y+3, cellW-6, ch-6);
        ctx.strokeStyle = PC[aPort]; ctx.lineWidth = 2;   ctx.strokeRect(c*cellW+3, y+3, cellW-6, ch-6);
      }
      // 호버 점선 테두리
      if (hov) {
        ctx.setLineDash([3, 3]); ctx.strokeStyle = PC[aPort]; ctx.lineWidth = 1.5;
        ctx.strokeRect(c*cellW+2, y+2, cellW-4, ch-4); ctx.setLineDash([]);
      }
      // 잠긴 셀 빗금 패턴
      if (lk) {
        ctx.save(); ctx.beginPath(); ctx.rect(c*cellW+1, y+1, cellW-2, ch-2); ctx.clip();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
        for (let i = -ch; i < cellW + ch; i += 6) {
          ctx.beginPath(); ctx.moveTo(c*cellW+i, y+1); ctx.lineTo(c*cellW+i+ch, y+ch); ctx.stroke();
        }
        ctx.restore();
      }
      // 포트 번호 텍스트
      if (ow >= 0 && cellW >= 20) {
        ctx.fillStyle    = lk ? 'rgba(255,255,255,0.45)' : 'white';
        ctx.font         = `500 ${Math.min(11, cellW - 8)}px sans-serif`;
        ctx.textAlign    = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('P' + (ow + 1), c*cellW + cellW/2, y + ch/2);
      }
      // 키보드 포커스 셀 하이라이트
      if (fCell && fCell.r === ri && fCell.c === c) {
        ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(c*cellW+4, y+4, cellW-8, ch-8);
        ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(c*cellW+4, y+4, cellW-8, ch-8);
      }
    }
    y += ch;
  });

  // 포트 연결 순서 화살표 그리기
  pA.forEach((s, pi) => {
    if (s.size < 2) return;
    const h = pH2[pi].filter(k => s.has(k));
    if (h.length < 2) return;
    for (let i = 0; i < h.length - 1; i++) {
      const [r1, c1] = h[i].split(',').map(Number);
      const [r2, c2] = h[i+1].split(',').map(Number);
      arrow(ctx, cxOf(c1), cyOf(r1), cxOf(c2), cyOf(r2), PC[pi]);
    }
  });
}

// ── 범례 & 케이블 수량 요약 ───────────────────────────────

function renderLeg() {
  const l = document.getElementById('legend'); if (!l) return;
  const used = pA.map((s, i) => s.size > 0 ? i : -1).filter(i => i >= 0);
  let h = `
    <div class="leg-item"><div class="leg-dot" style="background:#C0DD97;border:1px solid #639922"></div>500×500mm</div>
    <div class="leg-item"><div class="leg-dot" style="background:#9FE1CB;border:1px solid #1D9E75"></div>500×1000mm</div>`;
  used.forEach(pi => { h += `<div class="leg-item"><div class="leg-dot" style="background:${PC[pi]}"></div>포트 ${pi+1}</div>`; });
  l.innerHTML = h;
}

// 계산된 랜선 수량 반환 (adjCable & saveCalcPng 공통 사용)
function _calcLan() {
  const l1 = pA.filter(s => s.size > 0).length;
  let sl = 0; pA.forEach(s => { if (s.size > 0) sl += (s.size - 1); });
  return { l1, sl };
}

// 수량 입력 변경 시 합계만 업데이트 (전체 재렌더 없이 효율적으로 처리)
function adjCable(k, v) {
  const n = parseInt(v);
  cableAdj[k] = (v === '' || isNaN(n)) ? null : Math.max(0, n);
  const lan = _calcLan(), pw = calcPW();
  const l1v = cableAdj.l1 ?? lan.l1, slv = cableAdj.sl ?? lan.sl;
  const c1v = cableAdj.c1 ?? pw.c1,  spv = cableAdj.sp ?? pw.sp;
  const lt = document.getElementById('lanTotal'), pt = document.getElementById('pwrTotal');
  if (lt) lt.textContent = (l1v + slv) + ' 개';
  if (pt) pt.textContent = (c1v + spv) + ' 개';
}

function renderSum() {
  const el = document.getElementById('simSum'); if (!el) return;
  const asgn = new Set(); pA.forEach(s => s.forEach(k => asgn.add(k)));
  const tot  = layout.length * cols, una = tot - asgn.size;
  const lan  = _calcLan(), pw = calcPW();
  // cableAdj가 null이면 자동계산값, 아니면 수동 조정값 사용
  const l1v  = cableAdj.l1 ?? lan.l1, slv = cableAdj.sl ?? lan.sl;
  const c1v  = cableAdj.c1 ?? pw.c1,  spv = cableAdj.sp ?? pw.sp;
  const ov   = pA.filter((_, i) => pxOf(i) > MAX_PX).length;

  const inp = (id, k, v, cls) =>
    `<input id="${id}" type="number" class="cable-inp${cls ? ' ' + cls : ''}" min="0" value="${v}" oninput="adjCable('${k}',this.value)">`;

  el.innerHTML = `<div style="margin-top:10px;">
    <div class="cbox lan"><div class="cbox-title">랜선</div>
      <div class="crow"><span class="cn">1번 랜 (포트 → 첫 패널)</span><span class="cv">${inp('inp-l1','l1',l1v,'')} 개</span></div>
      <div class="crow"><span class="cn">숏랜 (패널 간 연결)</span><span class="cv">${inp('inp-sl','sl',slv,'')} 개</span></div>
      <div class="crow total"><span class="cn">합계</span><span class="cv" id="lanTotal">${l1v+slv} 개</span></div>
      <div class="crow" style="margin-top:6px;font-size:11px;opacity:.7;">
        <span class="cn">미할당 패널</span>
        <span class="cv" style="${una>0?'color:#BA7517':''}">${una} / ${tot} 장</span>
      </div>
    </div>
    <div class="cbox pwr"><div class="cbox-title">파워콘 (전원 케이블)</div>
      <div class="crow"><span class="cn">1번 파워 (세로 2열당 1개)</span><span class="cv">${inp('inp-c1','c1',c1v,'pwr')} 개</span></div>
      <div class="crow"><span class="cn">숏 파워 (패널 간 연결)</span><span class="cv">${inp('inp-sp','sp',spv,'pwr')} 개</span></div>
      <div class="crow total"><span class="cn">합계</span><span class="cv" id="pwrTotal">${c1v+spv} 개</span></div>
    </div>
    ${ov > 0 ? `<div style="background:#FCEBEB;border-radius:8px;padding:8px 12px;font-size:13px;color:#A32D2D;">픽셀 초과 포트 ${ov}개 — 연결 패널 수를 줄여주세요</div>` : ''}
  </div>`;
}

// ── 이벤트 처리 (마우스 & 터치 & 키보드) ─────────────────

// 캔버스 내 좌표 계산 (DPR 보정 포함)
// touchend는 e.touches가 빈 TouchList(truthy)라 e.touches[0]이 undefined →
// changedTouches(방금 떨어진 손가락)를 우선 사용해야 좌표를 올바르게 읽음
function xy(cv, e) {
  const r  = cv.getBoundingClientRect();
  const sx = cv.width / r.width, sy = cv.height / r.height;
  const src = (e.changedTouches && e.changedTouches[0])
            || (e.touches && e.touches[0])
            || e;
  return { mx: (src.clientX - r.left) * sx, my: (src.clientY - r.top) * sy };
}

function attachEv() {
  const cv = document.getElementById('simCanvas');

  function dn(e) {
    if (!isReady() || !cols || !layout.length) return;
    e.preventDefault();
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) return;
    // 터치는 LP_TOUCH(600ms), 마우스는 LP_MS(380ms) — 일반 탭이 드래그로 오인되지 않도록
    const delay = e.touches ? LP_TOUCH : LP_MS;
    lpT = setTimeout(() => {
      lpT = null;
      const ow = owner(inf.key);
      aPort = ow >= 0 ? ow : nextEmpty(); // 이미 할당된 셀이면 해당 포트로 전환
      drag = true; dStk = []; dHov = inf.key;
      if (ow < 0) assign(aPort, inf.key);
      dStk.push({ key: inf.key });
      fCell = null;
      drawCv(); renderPorts(); renderLeg(); renderSum(); cv.focus();
    }, delay);
  }

  function mv(e) {
    if (!drag) return;
    e.preventDefault();
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { dHov = null; drawCv(); return; }
    dHov = inf.key;
    // 역방향 드래그 감지 → 마지막 셀 취소
    if (dStk.length >= 2) {
      const prev = dStk[dStk.length - 2];
      if (inf.key === prev.key) {
        const last = dStk[dStk.length - 1];
        deassign(aPort, last.key); dStk.pop();
        if (navigator.vibrate) navigator.vibrate(25);
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    }
    const top = dStk.length > 0 ? dStk[dStk.length - 1] : null;
    if (top && inf.key === top.key) return;
    const ow = owner(inf.key);
    if (ow >= 0 && ow !== aPort) { drawCv(); return; } // 다른 포트 셀 건드리지 않음
    assign(aPort, inf.key); dStk.push({ key: inf.key });
    if (navigator.vibrate) navigator.vibrate(15);
    drawCv(); renderPorts(); renderLeg(); renderSum();
  }

  function up(e) {
    clearTimeout(lpT); lpT = null;
    // 드래그 종료
    if (drag) { drag = false; dStk = []; dHov = null; drawCv(); renderPorts(); renderLeg(); renderSum(); return; }
    // 단순 탭/클릭 → 현재 포트로 토글 (할당 ↔ 해제)
    if (!isReady() || !cols || !layout.length) return;
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) return;
    const ow = owner(inf.key);
    if (ow >= 0 && ow !== aPort) return; // 다른 포트 셀은 건드리지 않음
    if (pA[aPort].has(inf.key)) {
      deassign(aPort, inf.key);
      if (fCell && `${fCell.r},${fCell.c}` === inf.key) fCell = null;
    } else {
      assign(aPort, inf.key); fCell = { r: inf.r, c: inf.c };
    }
    drawCv(); renderPorts(); renderLeg(); renderSum(); cv.focus();
  }

  function cl() { clearTimeout(lpT); lpT = null; drag = false; dStk = []; dHov = null; drawCv(); renderPorts(); }

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
    if (!isReady()) return;
    const M = { ArrowUp:{dr:-1,dc:0}, ArrowDown:{dr:1,dc:0}, ArrowLeft:{dr:0,dc:-1}, ArrowRight:{dr:0,dc:1} };
    const d = M[e.key]; if (!d) return;
    e.preventDefault();
    if (!fCell) { fCell = {r:0,c:0}; assign(aPort, '0,0'); drawCv(); renderPorts(); renderLeg(); renderSum(); return; }
    const hist = pH2[aPort].filter(k => pA[aPort].has(k));
    // 역방향 → 마지막 셀 취소
    if (hist.length >= 2) {
      const [pr, pc] = hist[hist.length-2].split(',').map(Number);
      if (fCell.r+d.dr === pr && fCell.c+d.dc === pc) {
        deassign(aPort, `${fCell.r},${fCell.c}`); fCell = {r:pr,c:pc};
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    } else if (hist.length === 1) {
      const nr2 = fCell.r+d.dr, nc2 = fCell.c+d.dc;
      if (nr2 < 0 || nr2 >= layout.length || nc2 < 0 || nc2 >= cols) {
        deassign(aPort, `${fCell.r},${fCell.c}`); fCell = null;
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    }
    const nr = Math.max(0, Math.min(layout.length-1, fCell.r+d.dr));
    const nc = Math.max(0, Math.min(cols-1, fCell.c+d.dc));
    if (nr === fCell.r && nc === fCell.c) return;
    const nk = `${nr},${nc}`;
    if (owner(nk) >= 0 && owner(nk) !== aPort) return;
    fCell = {r:nr,c:nc}; assign(aPort, nk);
    drawCv(); renderPorts(); renderLeg(); renderSum();
  });
}

// ── 초기 실행 ────────────────────────────────────────────
calc();
