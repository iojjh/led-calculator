import { State, SPECS, MAX_PX, LP_MS, LP_TOUCH, PWR_PORT_COUNT, PC, portColor } from './constants.js';
import { _toast } from './utils.js';
import { openConfirm, showResPreview, selectResVersion, _histBack } from './modal.js';
import { saveState } from './storage.js';


// ── §14 혼합 시뮬레이터 β ────────────────────────────────

// ─ 구역 색상 ─
const BETA_ZONE_BG = [
  'rgba(79,140,255,0.18)',  'rgba(255,120,80,0.18)',  'rgba(60,200,100,0.18)',
  'rgba(220,80,220,0.18)', 'rgba(255,200,0,0.18)',   'rgba(0,200,220,0.18)',
];
const BETA_ZONE_LINE = [
  '#4F8CFF', '#FF7850', '#3CC864', '#DC50DC', '#FFC800', '#00C8DC',
];

// ─ 헬퍼 ─

function _betaGW() { return Math.max(1, Math.round(State.betaAreaW / 500)); }
function _betaGH() { return Math.max(1, Math.round(State.betaAreaH / 500)); }

// 편집 캔버스 요소: 전체모드는 betaFullCanvas, 일반은 betaCanvas
function _betaEditCv() {
  return document.getElementById(State._betaFull ? 'betaFullCanvas' : 'betaCanvas');
}

function _betaSc() {
  const cv = _betaEditCv();
  if (!cv) { return 1; }
  const W = (cv.parentElement.clientWidth || 320) - 2;
  return W / (State.betaAreaW || 1);
}

// 편집 모드 전용: 격자 셀 최소 55px 보장 → 텍스트 가독성 확보 (부모 너비 초과 시 가로 스크롤)
function _betaScEdit() {
  return Math.max(_betaSc(), 55 / 500);
}

// mx, my는 mm 단위 (이벤트 핸들러에서 BCR 기반으로 변환해서 전달)
function _betaCellAt(mmX, mmY) {
  const col = Math.floor(mmX / 500);
  const row = Math.floor(mmY / 500);
  if (col < 0 || row < 0 || col >= _betaGW() || row >= _betaGH()) { return null; }
  return { r: row, c: col };
}

function _betaOverlaps(sr, sc2, rows, cols, skipId) {
  for (const z of State.betaZones) {
    if (z.id === skipId) { continue; }
    if (sr < z.startRow + z.rows && sr + rows > z.startRow &&
        sc2 < z.startCol + z.cols && sc2 + cols > z.startCol) { return true; }
  }
  return false;
}

function _betaZoneAt(r, c) {
  return State.betaZones.find(z =>
    r >= z.startRow && r < z.startRow + z.rows &&
    c >= z.startCol && c < z.startCol + z.cols
  ) || null;
}

// Zone → 패널 배열 [{key, x, y, w, h, led, zoneId}]
// 잔여(500×500) 패널은 항상 최상단(remR) · 최좌측(remC) 우선 배치
function betaPanels(zone) {
  const spanC = zone.panelW / 500;
  const spanR = zone.panelH / 500;
  const fullC = Math.floor(zone.cols / spanC);
  const fullR = Math.floor(zone.rows / spanR);
  const remC  = zone.cols % spanC;
  const remR  = zone.rows % spanR;
  const panels = [];

  // 잔여 행 (최상단)
  if (remR) {
    for (let cc = 0; cc < zone.cols; cc++) {
      panels.push({
        key: `${zone.id}:rr:${cc}`,
        x: (zone.startCol + cc) * 500,
        y: zone.startRow * 500,
        w: 500, h: 500,
        led: zone.led, zoneId: zone.id,
      });
    }
  }

  // 전체 패널 (잔여 행 아래부터, 잔여 열 오른쪽부터)
  for (let pr = 0; pr < fullR; pr++) {
    // 잔여 열 (최좌측)
    if (remC) {
      for (let rs = 0; rs < spanR; rs++) {
        panels.push({
          key: `${zone.id}:${pr}:rc${rs}`,
          x: zone.startCol * 500,
          y: (zone.startRow + remR + pr * spanR + rs) * 500,
          w: 500, h: 500,
          led: zone.led, zoneId: zone.id,
        });
      }
    }
    // 전체 크기 패널
    for (let pc = 0; pc < fullC; pc++) {
      panels.push({
        key: `${zone.id}:${pr}:${pc}`,
        x: (zone.startCol + remC + pc * spanC) * 500,
        y: (zone.startRow + remR + pr * spanR) * 500,
        w: zone.panelW, h: zone.panelH,
        led: zone.led, zoneId: zone.id,
      });
    }
  }

  return panels;
}

function _betaAllPanels() {
  if (!State._betaCache) {
    State._betaCache = State.betaZones.flatMap(z => betaPanels(z));
  }
  return State._betaCache;
}

// mmX, mmY는 mm 단위 (이벤트 핸들러에서 BCR 기반으로 변환해서 전달)
function _betaPanelAt(mmX, mmY) {
  for (const p of _betaAllPanels()) {
    if (mmX >= p.x && mmX < p.x + p.w && mmY >= p.y && mmY < p.y + p.h) { return p; }
  }
  return null;
}

function _betaPxOf(pi) {
  let total = 0;
  for (const key of State.betaPorts[pi]) {
    const p = _betaAllPanels().find(x => x.key === key);
    if (!p) { continue; }
    const sp = SPECS[p.led];
    total += Math.round(sp.px500.w / 500 * p.w) * Math.round(sp.px500.h / 500 * p.h);
  }
  return total;
}

function _betaOwner(key) {
  return State.betaPorts.findIndex(s => s.has(key));
}
function _betaPwrOwner(key) {
  return State.betaPwrPorts.findIndex(s => s.has(key));
}

// ── 탭 공통 포트 헬퍼 (lan/pwr 분기) ──
function _betaSimPorts()    { return State.betaSimTab === 'pwr' ? State.betaPwrPorts : State.betaPorts; }
function _betaSimPH2()      { return State.betaSimTab === 'pwr' ? State.betaPwrPH2   : State.betaPH2; }
function _betaSimAPort()    { return State.betaSimTab === 'pwr' ? State.betaPwrAPort : State.betaAPort; }
function _betaSetAPort(i)   { if (State.betaSimTab === 'pwr') { State.betaPwrAPort = i; } else { State.betaAPort = i; } }
function _betaSimOwner(key) { return State.betaSimTab === 'pwr' ? _betaPwrOwner(key) : _betaOwner(key); }
function _betaSimAssign(pi, key) {
  const ports = _betaSimPorts(), ph2 = _betaSimPH2();
  if (ports[pi].has(key)) { return; }
  ports[pi].add(key); ph2[pi].push(key);
  // 수동 할당 → 자동할당 플래그 해제
  if (State.betaSimTab === 'pwr') { State._betaPwrAutoAssigned = false; }
  else { State._betaLanAutoAssigned = false; }
}
function _betaSimDeassign(pi, key) {
  const ports = _betaSimPorts(), ph2 = _betaSimPH2();
  ports[pi].delete(key);
  const idx = ph2[pi].indexOf(key); if (idx >= 0) { ph2[pi].splice(idx, 1); }
  if (State.betaSimTab === 'pwr') { State._betaPwrAutoAssigned = false; }
  else { State._betaLanAutoAssigned = false; }
}
function _betaSimDraw() {
  if (State._betaFull) { const _gcv = document.getElementById('betaFullCanvas'); if (_gcv) { _betaDrawGrid(_gcv); } }
  if (State.betaSimTab === 'pwr') { betaDrawPwr(); } else { betaDrawLan(); }
}
function _betaSimRenderPorts() {
  if (State._betaFull) { _betaFullShowPortPopup(); return; }
  if (State.betaSimTab === 'pwr') { betaRenderPwrPorts(); } else { betaRenderPorts(); }
}
function _betaNextSimEmpty()   {
  const ports = _betaSimPorts();
  for (let i = 0; i < ports.length; i++) { if (ports[i].size === 0) { return i; } }
  return _betaSimAPort();
}

function _betaPanelCx(p) { return (p.x + p.w / 2) * _betaCvSc(); }
function _betaPanelCy(p) { return (p.y + p.h / 2) * _betaCvSc(); }

// 캔버스 실제 픽셀 폭 기준 스케일 (전체모드 시 betaFullCanvas 기준)
function _betaCvSc() {
  const cv = _betaEditCv();
  return cv && State.betaAreaW ? cv.width / State.betaAreaW : _betaScEdit();
}

// betaCanvasBg에 격자만 그림 (탭 전환 시 변경되지 않는 고정 레이어)
function _betaDrawGrid(cv) {
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const gW  = _betaGW(); const gH = _betaGH();
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c * 500 * sc, 0); ctx.lineTo(c * 500 * sc, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * 500 * sc); ctx.lineTo(cv.width, r * 500 * sc); ctx.stroke();
  }
}

let _betaZidSeq = 0;
function _betaZid() { return 'z' + (++_betaZidSeq); }

// ─ 면적 입력 & 모드 전환 ─

function betaApplyArea() {
  const w = Math.round((parseFloat(document.getElementById('betaW').value) || 0) * 1000);
  const h = Math.round((parseFloat(document.getElementById('betaH').value) || 0) * 1000);
  if (w < 500 || h < 500) { _toast('최소 0.5m × 0.5m 이상 입력해주세요.'); return; }
  // 구역 생성 중이면 취소
  if (State._betaSelNew) {
    State._betaSelNew = null;
    document.getElementById('betaZoneCfg').style.display = 'none';
  }
  if (State.betaZones.length > 0 && (w !== State.betaAreaW || h !== State.betaAreaH)) {
    State.betaZones    = [];
    State.betaMode     = 'edit';
    State.betaPorts    = Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = Array.from({ length: 16 }, () => []);
    State.betaPwrPorts = Array.from({ length: PWR_PORT_COUNT }, () => new Set());
    State.betaPwrPH2   = Array.from({ length: PWR_PORT_COUNT }, () => []);
  }
  State.betaAreaW  = w;
  State.betaAreaH  = h;
  State._betaCache = null;
  betaRender();
  const _wrap = document.getElementById('betaCanvasWrap');
  _wrap.classList.remove('cv-reveal');
  void _wrap.offsetWidth;
  _wrap.classList.add('cv-reveal');
  _wrap.addEventListener('animationend', () => _wrap.classList.remove('cv-reveal'), { once: true });
  const fb = document.getElementById('betaFullBtn');
  if (fb && fb.style.display !== 'none') {
    fb.classList.remove('cv-reveal');
    void fb.offsetWidth;
    fb.classList.add('cv-reveal');
    fb.addEventListener('animationend', () => fb.classList.remove('cv-reveal'), { once: true });
  }
  saveState();
}

function betaSetMode(m) {
  if (m === 'lan' && State.betaZones.length === 0) { _toast('먼저 구역을 1개 이상 설정해주세요.'); return; }
  if (m === State.betaMode) { return; }
  const wasEdit = State.betaMode === 'edit';
  const goRight = m === 'lan';
  const prevEl   = document.getElementById(wasEdit ? 'betaZoneList' : 'betaLanUI');
  const cv       = document.getElementById('betaCanvas');
  const snap     = document.getElementById('betaCanvasSnap');
  const exitCls  = goRight ? 'beta-slide-exit-l'  : 'beta-slide-exit-r';
  const enterCls = goRight ? 'beta-slide-enter-r' : 'beta-slide-enter-l';

  // 현재 오버레이를 스냅샷에 복사 → 빈 격자가 노출되지 않게
  snap.width  = cv.width;
  snap.height = cv.height;
  snap.getContext('2d').drawImage(cv, 0, 0);
  snap.style.display = 'block';
  snap.style.transition = '';
  snap.style.opacity = '1';

  // 콘텐츠 슬라이드 퇴장 시작
  prevEl.classList.add(exitCls);
  prevEl.addEventListener('animationend', () => prevEl.classList.remove(exitCls), { once: true });

  // 즉시 모드 전환 + 재렌더 (스냅샷이 위에 덮여 있으므로 캔버스 깜빡임 없음)
  if (m === 'lan') { State._betaCache = null; _betaAllPanels(); }
  State.betaMode = m;
  betaRender();
  if (m === 'lan' && wasEdit) {
    if (State.betaPorts.every(s => s.size === 0))    { betaAutoAssign(); }
    if (State.betaPwrPorts.every(s => s.size === 0)) { betaAutoAssignPwr(); }
    _betaSimDraw();
  }

  // 콘텐츠 슬라이드 진입
  const nextEl = document.getElementById(m === 'edit' ? 'betaZoneList' : 'betaLanUI');
  nextEl.classList.add(enterCls);
  nextEl.addEventListener('animationend', () => nextEl.classList.remove(enterCls), { once: true });

  // 스냅샷 페이드 아웃 → 새 캔버스 내용이 드러남
  snap.offsetHeight;
  snap.style.transition = 'opacity .28s';
  snap.style.opacity = '0';
  snap.addEventListener('transitionend', () => {
    snap.style.display = 'none';
    snap.style.transition = '';
  }, { once: true });
}

function betaRender() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  if (State.betaAreaW) { document.getElementById('betaW').value = State.betaAreaW / 1000; }
  if (State.betaAreaH) { document.getElementById('betaH').value = State.betaAreaH / 1000; }
  document.getElementById('betaModeEdit').classList.toggle('on', State.betaMode === 'edit');
  document.getElementById('betaModeLan').classList.toggle('on',  State.betaMode === 'lan');

  const cvBg = document.getElementById('betaCanvasBg');
  const fb = document.getElementById('betaFullBtn');
  if (!State.betaAreaW || !State.betaAreaH) {
    cv.style.display = 'none';
    if (cvBg) { cvBg.style.display = 'none'; }
    document.getElementById('betaZoneList').innerHTML = '<div class="beta-empty-hint">설치 면적을 입력 후 [적용]을 누르세요.</div>';
    document.getElementById('betaLanUI').style.display = 'none';
    document.getElementById('betaZoneCfg').style.display = 'none';
    if (fb) { fb.style.display = 'none'; }
    return;
  }

  cv.style.display = 'block';
  const sc = _betaScEdit(); // 두 모드 동일 스케일 — 격자 고정 유지
  cv.width  = Math.round(State.betaAreaW * sc);
  cv.height = Math.round(State.betaAreaH * sc);
  if (cvBg) {
    cvBg.style.display = 'block';
    cvBg.width  = cv.width;
    cvBg.height = cv.height;
    _betaDrawGrid(cvBg);
  }

  if (State.betaMode === 'edit') {
    document.getElementById('betaLanUI').style.display = 'none';
    document.getElementById('betaZoneList').style.display = '';
    if (fb && !State._betaFull) { fb.style.display = ''; }
    betaAttachEditEv();
    betaDrawEdit();
    betaRenderZoneList();
  } else {
    document.getElementById('betaZoneList').style.display = 'none';
    document.getElementById('betaZoneCfg').style.display = 'none';
    document.getElementById('betaLanUI').style.display = '';
    if (fb && !State._betaFull) { fb.style.display = ''; }
    betaAttachLanEv();
    _betaSimDraw();
    betaRenderLanUI();
  }
}

// ─ 편집 캔버스 ─

function betaDrawEdit() {
  const cv = _betaEditCv();
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const gW  = _betaGW(); const gH = _betaGH();
  // 전체모드: 격자 재그림 → 이전 드로잉 완전히 지움 / 일반모드: 오버레이 클리어
  if (State._betaFull) { _betaDrawGrid(cv); } else { ctx.clearRect(0, 0, cv.width, cv.height); }

  // pass2: Zone 채우기 + 패널 경계
  State.betaZones.forEach((zone, zi) => {
    const ci  = zi % BETA_ZONE_BG.length;
    const zx  = zone.startCol * 500 * sc; const zy = zone.startRow * 500 * sc;
    const zw  = zone.cols * 500 * sc; const zh = zone.rows * 500 * sc;
    const cr  = Math.min(8, zw * 0.14, zh * 0.14); // corner radius
    const _ap = State._betaAnimProg;
    const _isNew = _ap && _ap.ids.has(zone.id);
    if (_isNew) {
      ctx.save();
      ctx.globalAlpha = _ap.t;
      const _s = 0.88 + 0.12 * _ap.t;
      ctx.translate(zx + zw / 2, zy + zh / 2);
      ctx.scale(_s, _s);
      ctx.translate(-(zx + zw / 2), -(zy + zh / 2));
    }
    // 라운드 클립: fill + 패널 경계를 rounded rect 안에 가둠
    ctx.save();
    ctx.beginPath(); ctx.roundRect(zx, zy, zw, zh, cr); ctx.clip();
    ctx.fillStyle = BETA_ZONE_BG[ci]; ctx.fillRect(zx, zy, zw, zh);
    ctx.strokeStyle = BETA_ZONE_LINE[ci]; ctx.lineWidth = 1.2;
    betaPanels(zone).forEach(p => {
      ctx.strokeRect(p.x * sc + 0.6, p.y * sc + 0.6, p.w * sc - 1.2, p.h * sc - 1.2);
    });
    ctx.restore();
    // Zone 라운드 외곽선
    ctx.beginPath(); ctx.roundRect(zx + 1, zy + 1, zw - 2, zh - 2, cr);
    ctx.strokeStyle = BETA_ZONE_LINE[ci]; ctx.lineWidth = 2; ctx.stroke();
    // Zone 정보 텍스트 (흰 글씨 + 검정 아웃라인) + 번호
    const fs  = Math.max(11, Math.min(16, 500 * sc * 0.22));
    const pad = Math.max(3, Math.round(fs * 0.5)) + Math.round(cr * 0.5);
    ctx.font = `700 ${fs}px sans-serif`;
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, fs * 0.3); ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.strokeText(`z${zi + 1}`, zx + zw - pad, zy + pad);
    ctx.fillStyle = '#fff'; ctx.fillText(`z${zi + 1}`, zx + zw - pad, zy + pad);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const midY = zy + zh / 2;
    ctx.strokeText(zone.led, zx + zw / 2, midY - fs * 0.7);
    ctx.fillText(zone.led, zx + zw / 2, midY - fs * 0.7);
    ctx.strokeText(`${zone.panelW}×${zone.panelH}mm`, zx + zw / 2, midY + fs * 0.7);
    ctx.fillText(`${zone.panelW}×${zone.panelH}mm`, zx + zw / 2, midY + fs * 0.7);
    // 잔여 행/열(반쪽 셀) 라벨 — 각 셀은 500×500mm
    const _spanR = zone.panelH / 500; const _spanC = zone.panelW / 500;
    const _remR  = zone.rows % _spanR;  const _remC  = zone.cols % _spanC;
    const _fsS   = Math.max(9, Math.min(13, 500 * sc * 0.18));
    ctx.font = `700 ${_fsS}px sans-serif`;
    ctx.lineWidth = Math.max(2, _fsS * 0.28); ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (_remR) {
      const _sy = zy + (_remR * 500 * sc) / 2;
      ctx.strokeText('500×500mm', zx + zw / 2, _sy);
      ctx.fillStyle = '#fff'; ctx.fillText('500×500mm', zx + zw / 2, _sy);
    }
    if (_remC) {
      const _sx  = zx + (_remC * 500 * sc) / 2;
      const _off = _remR * 500 * sc;
      const _sy2 = zy + _off + (zh - _off) / 2;
      ctx.strokeText('500×500mm', _sx, _sy2);
      ctx.fillStyle = '#fff'; ctx.fillText('500×500mm', _sx, _sy2);
    }
    ctx.textBaseline = 'alphabetic';
    if (_isNew) { ctx.restore(); }
  });

  // pass3: 드래그 선택 미리보기 (lerp 좌표로 부드럽게 이동)
  if (State._betaDragSt && State._betaDragCur && State._betaDragLerp) {
    const l = State._betaDragLerp;
    const sx = l.c0 * 500 * sc; const sy = l.r0 * 500 * sc;
    const sw = (l.c1 - l.c0) * 500 * sc; const sh = (l.r1 - l.r0) * 500 * sc;
    const pr = Math.min(8, sw * 0.14, sh * 0.14);
    ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, pr);
    ctx.fillStyle = 'rgba(79,140,255,0.22)'; ctx.fill();
    ctx.beginPath(); ctx.roundRect(sx + 1, sy + 1, sw - 2, sh - 2, pr);
    ctx.strokeStyle = '#4F8CFF'; ctx.lineWidth = 2; ctx.stroke();
    // 치수 텍스트는 정수 스냅값 표시
    const ir0 = Math.min(State._betaDragSt.r, State._betaDragCur.r);
    const ic0 = Math.min(State._betaDragSt.c, State._betaDragCur.c);
    const ir1 = Math.max(State._betaDragSt.r, State._betaDragCur.r);
    const ic1 = Math.max(State._betaDragSt.c, State._betaDragCur.c);
    const wm = ((ic1 - ic0 + 1) * 0.5).toFixed(1).replace(/\.0$/, '');
    const hm = ((ir1 - ir0 + 1) * 0.5).toFixed(1).replace(/\.0$/, '');
    const fs2 = Math.max(11, Math.min(16, sw * 0.18));
    ctx.font = `700 ${fs2}px sans-serif`;
    ctx.fillStyle = '#1a4fcc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${wm}m × ${hm}m`, sx + sw / 2, sy + sh / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // pass3.5: 선택된 구역 하이라이트 (흰색 점선 + 밝은 overlay)
  if (State._betaSelectedId) {
    const sel = State.betaZones.find(z => z.id === State._betaSelectedId);
    if (sel) {
      const si = State.betaZones.indexOf(sel);
      const sc2 = BETA_ZONE_LINE[si % BETA_ZONE_LINE.length];
      const sx = sel.startCol * 500 * sc, sy = sel.startRow * 500 * sc;
      const sw = sel.cols * 500 * sc,    sh = sel.rows * 500 * sc;
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = sc2; ctx.lineWidth = 3;
      ctx.setLineDash([7, 3]);
      ctx.strokeRect(sx + 1.5, sy + 1.5, sw - 3, sh - 3);
      ctx.setLineDash([]);
    }
  }

  // pass4: 팝업 대기 구역
  if (State._betaSelNew) {
    const { startR, startC, rows, cols } = State._betaSelNew;
    const sx = startC * 500 * sc; const sy = startR * 500 * sc;
    const sw = cols * 500 * sc; const sh = rows * 500 * sc;
    const cr = Math.min(8, sw * 0.12, sh * 0.12);
    ctx.fillStyle = 'rgba(40,200,80,0.18)';
    ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, cr); ctx.fill();
    ctx.strokeStyle = '#28C850'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.roundRect(sx + 1, sy + 1, sw - 2, sh - 2, cr); ctx.stroke();
  }
}

// ─ 구역 목록 & 해상도 ─

function _betaCalcResolution() {
  if (!State.betaAreaW || !State.betaAreaH || !State.betaZones.length) { return null; }
  const gW = _betaGW(), gH = _betaGH();
  let totalW = 0, totalH = 0;
  for (let c = 0; c < gW; c++) {
    let maxPx = 0;
    State.betaZones.forEach(z => {
      if (c >= z.startCol && c < z.startCol + z.cols) { maxPx = Math.max(maxPx, SPECS[z.led].px500.w); }
    });
    totalW += maxPx;
  }
  for (let r = 0; r < gH; r++) {
    let maxPx = 0;
    State.betaZones.forEach(z => {
      if (r >= z.startRow && r < z.startRow + z.rows) { maxPx = Math.max(maxPx, SPECS[z.led].px500.h); }
    });
    totalH += maxPx;
  }
  if (totalW === 0 || totalH === 0) { return null; }
  const s = Math.max(totalW / State.betaAreaW, totalH / State.betaAreaH);
  return { w: Math.round(State.betaAreaW * s), h: Math.round(State.betaAreaH * s) };
}


// ── PNG 스냅샷 생성 ──────────────────────────────────────

function betaSaveGuideImage() {
  const res = _betaCalcResolution();
  if (!res) { return; }
  const cv = document.createElement('canvas');
  cv.width = res.w; cv.height = res.h;
  const ctx = cv.getContext('2d');
  const sX = res.w / State.betaAreaW;
  const sY = res.h / State.betaAreaH;
  const gW = _betaGW(), gH = _betaGH();
  const gridLW = Math.max(1, Math.round(res.w / 700));

  // ── Layer 1: 빈 영역 배경 + 500mm 격자 ──
  ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c*500*sX, 0); ctx.lineTo(c*500*sX, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r*500*sY); ctx.lineTo(cv.width, r*500*sY); ctx.stroke();
  }

  // ── 전체 캔버스 기준 워터마크 파라미터 (구역 경계에서 연속되도록) ──
  // 폰트 크기는 가장 작은 구역 치수 기준 — 모든 구역에서 균일하게 보임
  const wmText = '3Y Ent.';
  const minZoneDim = Math.min(...State.betaZones.map(z => Math.min(z.cols*500*sX, z.rows*500*sY)));
  const fSizeWm = Math.round(Math.max(12, Math.min(minZoneDim * 0.18, 32)));
  ctx.font = `600 ${fSizeWm}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  const wmTW = ctx.measureText(wmText).width;
  const stepX = Math.round(wmTW * 2.0);
  const stepY = Math.round(fSizeWm * 3.5);
  const halfD = Math.ceil(Math.hypot(res.w, res.h) / 2) + Math.max(stepX, stepY);

  // ── 구역별 렌더링 ──
  State.betaZones.forEach((zone, zi) => {
    const zx = zone.startCol * 500 * sX, zy = zone.startRow * 500 * sY;
    const zw = zone.cols * 500 * sX,     zh = zone.rows * 500 * sY;
    const spanC = zone.panelW / 500, spanR = zone.panelH / 500;
    const fullC = Math.floor(zone.cols / spanC), fullR = Math.floor(zone.rows / spanR);

    ctx.save();
    ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip();

    // 어두운 배경 + 비네팅
    ctx.fillStyle = '#141414'; ctx.fillRect(zx, zy, zw, zh);
    const vg = ctx.createRadialGradient(zx+zw/2, zy+zh/2, 0, zx+zw/2, zy+zh/2, Math.hypot(zw,zh)/2);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vg; ctx.fillRect(zx, zy, zw, zh);

    // 사명 워터마크 — 전체 캔버스 중앙 기준으로 타일링 (구역 간 패턴 연속)
    ctx.save();
    ctx.font = `600 ${fSizeWm}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.translate(res.w / 2, res.h / 2);
    ctx.rotate(-Math.PI / 6);
    for (let r = -Math.ceil(halfD/stepY); r <= Math.ceil(halfD/stepY)+1; r++) {
      for (let c = -Math.ceil(halfD/stepX); c <= Math.ceil(halfD/stepX)+1; c++) {
        if ((r + c) % 2 !== 0) { continue; } // 마름모꼴 간격
        ctx.fillText(wmText, c*stepX, r*stepY);
      }
    }
    ctx.restore();

    // 패널 격자선 (흰색 반투명)
    ctx.strokeStyle = 'rgba(255,255,255,0.60)'; ctx.lineWidth = gridLW;
    for (let pc = 1; pc < fullC; pc++) {
      const x = (zone.startCol + pc*spanC)*500*sX;
      ctx.beginPath(); ctx.moveTo(x, zy); ctx.lineTo(x, zy+zh); ctx.stroke();
    }
    for (let pr = 1; pr < fullR; pr++) {
      const y = (zone.startRow + pr*spanR)*500*sY;
      ctx.beginPath(); ctx.moveTo(zx, y); ctx.lineTo(zx+zw, y); ctx.stroke();
    }

    // 구역 테두리 (구역별 고유 형광색)
    const zoneCol = BETA_ZONE_LINE[zi % BETA_ZONE_LINE.length];
    ctx.strokeStyle = zoneCol; ctx.lineWidth = gridLW * 2;
    ctx.strokeRect(zx+1, zy+1, zw-2, zh-2);

    // 해상도 텍스트 (구역 크기 비례, 최소 fSizeWm 이상 보장)
    const zResW = zone.cols * SPECS[zone.led].px500.w;
    const zResH = zone.rows * SPECS[zone.led].px500.h;
    const fsRes = Math.round(Math.max(fSizeWm, Math.min(zh * 0.32, zw * 0.08, 120)));
    ctx.font = `300 ${fsRes}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const wStr = `${zResW}`, sepStr = '  ×  ', hStr = `${zResH}`;
    const wW = ctx.measureText(wStr).width;
    const sepW = ctx.measureText(sepStr).width;
    const hW = ctx.measureText(hStr).width;
    const totalTW = wW + sepW + hW;
    const tx = zx + zw/2 - totalTW/2;
    const ty = zy + zh / 2;
    ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, tx, ty);
    ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, tx + wW, ty);
    ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, tx + wW + sepW, ty);
    // 주황 바 — 텍스트 위치에 종속 (tx 기준 좌우 padding으로 감쌈)
    const padding = Math.round(fsRes * 0.15);
    const gap = Math.min(fsRes * 0.55, zh * 0.12);
    const barLW = Math.max(1, Math.round(totalTW / 300));
    const barL = tx - padding, barR = tx + totalTW + padding;
    ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = barLW;
    ctx.beginPath(); ctx.moveTo(barL, ty-gap); ctx.lineTo(barR, ty-gap); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(barL, ty+gap); ctx.lineTo(barR, ty+gap); ctx.stroke();

    ctx.restore(); // clip 해제
    ctx.textBaseline = 'alphabetic';
  });

  const url = cv.toDataURL('image/png');
  showResPreview(url, null, `guide_${res.w}x${res.h}.png`);
}

function _betaBuildPanelTable() {
  if (!State.betaZones.length) { return ''; }
  const ledOrder   = ['2mm', '3mm', '4mm'];
  const panelOrder = ['500x500', '500x1000', '1000x500'];
  const panelMeta  = {
    '500x500':  { label: '500×500mm',  rackSize: 24, pxFn: sp => `${sp.px500.w}×${sp.px500.h}` },
    '500x1000': { label: '500×1000mm', rackSize: 12, pxFn: sp => `${sp.px1000.w}×${sp.px1000.h}` },
    '1000x500': { label: '1000×500mm', rackSize: 12, pxFn: sp => `${sp.px1000.h}×${sp.px1000.w}` },
  };
  const counts = {}; const usedLeds = new Set(); const usedPanels = new Set();
  State.betaZones.forEach(zone => {
    betaPanels(zone).forEach(p => {
      const pKey = `${p.w}x${p.h}`;
      usedLeds.add(zone.led); usedPanels.add(pKey);
      if (!counts[zone.led]) { counts[zone.led] = {}; }
      counts[zone.led][pKey] = (counts[zone.led][pKey] || 0) + 1;
    });
  });
  const leds   = ledOrder.filter(l => usedLeds.has(l));
  const panels = panelOrder.filter(p => usedPanels.has(p));
  const multiLed = leds.length > 1; const multiPanel = panels.length > 1;

  // 헤더
  let h = '<table class="beta-panel-table"><thead><tr><th>LED</th>';
  panels.forEach(pKey => {
    const pm = panelMeta[pKey];
    const pxSub = !multiLed ? `<span class="beta-px-sub">(${pm.pxFn(SPECS[leds[0]])}px)</span>` : '';
    h += `<th>${pm.label}${pxSub}</th>`;
  });
  if (multiPanel) { h += '<th>합계</th>'; }
  h += '</tr></thead><tbody>';

  // 데이터 행
  leds.forEach(led => {
    const sp = SPECS[led]; let ledTotal = 0, ledRackTotal = 0;
    h += `<tr><td class="led-cell">${led}</td>`;
    panels.forEach(pKey => {
      const pm = panelMeta[pKey];
      const cnt = (counts[led] && counts[led][pKey]) || 0;
      const rack = Math.ceil(cnt / pm.rackSize);
      ledTotal += cnt; ledRackTotal += rack;
      if (cnt > 0) {
        const sub = multiLed
          ? `<span class="beta-px-sub">랙 ${rack}개 · ${pm.pxFn(sp)}px</span>`
          : `<span class="beta-px-sub">랙 ${rack}개</span>`;
        h += `<td>${cnt}ea${sub}</td>`;
      } else { h += '<td>—</td>'; }
    });
    if (multiPanel) { h += `<td class="total-cell">${ledTotal}ea<span class="beta-px-sub">랙 ${ledRackTotal}개</span></td>`; }
    h += '</tr>';
  });

  // 합계 행 (LED 종류 2개 이상일 때만)
  if (multiLed) {
    let grandTotal = 0, grandRackTotal = 0;
    h += '<tr class="trow-total"><td>합계</td>';
    panels.forEach(pKey => {
      const pm = panelMeta[pKey]; let pTotal = 0, pRack = 0;
      leds.forEach(led => { const c = (counts[led] && counts[led][pKey]) || 0; pTotal += c; pRack += Math.ceil(c / pm.rackSize); });
      grandTotal += pTotal; grandRackTotal += pRack;
      h += `<td class="total-cell">${pTotal}ea<span class="beta-px-sub">랙 ${pRack}개</span></td>`;
    });
    if (multiPanel) { h += `<td class="total-cell">${grandTotal}ea<span class="beta-px-sub">랙 ${grandRackTotal}개</span></td>`; }
    h += '</tr>';
  }
  return h + '</tbody></table>';
}

function setBetaSpare(k, v) {
  State.betaSpareAdj[k] = Math.max(0, parseInt(v) || 0);
  betaRenderSum();
  saveState();
}

function _betaSendToggle(id) {
  const el = document.getElementById(id);
  if (!el) { return; }
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function _betaBuildSendingHtml(tW, tH) {
  const fmt = n => Math.round(n).toLocaleString();

  // 660 Pro: 최대 60Hz / @60Hz 픽셀 상한 2,304,000 / @30Hz 치수(3840)만
  const PX60 = 1920 * 1200;
  const DIM  = 3840;
  const _ok660 = (w, h, hz) => {
    if (w > DIM || h > DIM) { return false; }
    if (hz === 60) { return w * h <= PX60; }
    return true;
  };
  const _eval660 = hz => {
    const px = tW * tH;
    const lim = hz === 60 ? PX60 : null;
    const single = _ok660(tW, tH, hz);
    let dual = false, splitDir = null, splitW = 0, splitH = 0, splitPx = 0;
    if (!single) {
      const hw = Math.ceil(tW / 2), hh = Math.ceil(tH / 2);
      if (_ok660(hw, tH, hz))      { dual = true; splitDir = 'h'; splitW = hw; splitH = tH; splitPx = hw * tH; }
      else if (_ok660(tW, hh, hz)) { dual = true; splitDir = 'v'; splitW = tW; splitH = hh; splitPx = tW * hh; }
    }
    const cls = single ? 'ok' : dual ? 'ok2' : 'ng';
    const txt = single ? `1대 @${hz}Hz ✓` : dual ? `2대 @${hz}Hz ✓` : `@${hz}Hz ✗`;
    return { cls, txt, hz, single, dual, splitDir, splitW, splitH, splitPx, px, lim };
  };

  // 4K: @120Hz 픽셀 상한 4,423,680 / @60Hz 8,847,360 / 최대 치수 7,680
  const PX_4K  = 4096 * 2160;
  const DIM_4K = 7680;
  const _ok4K  = (w, h, hz) => w <= DIM_4K && h <= DIM_4K && w * h <= (hz === 120 ? PX_4K / 2 : PX_4K);
  const _eval4K = hz => {
    const px = tW * tH;
    const lim = hz === 120 ? PX_4K / 2 : PX_4K;
    const single = _ok4K(tW, tH, hz);
    let dual = false, splitDir = null, splitW = 0, splitH = 0, splitPx = 0;
    if (!single) {
      const hw = Math.ceil(tW / 2), hh = Math.ceil(tH / 2);
      if (_ok4K(hw, tH, hz))      { dual = true; splitDir = 'h'; splitW = hw; splitH = tH; splitPx = hw * tH; }
      else if (_ok4K(tW, hh, hz)) { dual = true; splitDir = 'v'; splitW = tW; splitH = hh; splitPx = tW * hh; }
    }
    const cls = single ? 'ok' : dual ? 'ok2' : 'ng';
    const txt = single ? `1대 @${hz}Hz ✓` : dual ? `2대 @${hz}Hz ✓` : `@${hz}Hz ✗`;
    return { cls, txt, hz, single, dual, splitDir, splitW, splitH, splitPx, px, lim };
  };

  const badge = r => `<span class="beta-send-badge ${r.cls}">${r.txt}</span>`;

  const splitHtml = results => {
    const seen = new Set();
    return results.filter(r => r.dual).map(r => {
      const key = `${r.splitW}×${r.splitH}`;
      if (seen.has(key)) { return ''; }
      seen.add(key);
      const dir = r.splitDir === 'h' ? '가로' : '세로';
      return `<div class="beta-send-split">2대 사용 시 — ${dir} 분할: <b>${r.splitW} × ${r.splitH}</b></div>`;
    }).join('');
  };

  // 660 Pro 결과
  const r660_60 = _eval660(60);
  const r660_30 = _eval660(30);
  let badges660 = badge(r660_60);
  if (r660_60.cls === 'ng' || (r660_60.cls === 'ok2' && r660_30.cls === 'ok')) { badges660 += badge(r660_30); }

  // 4K 결과
  const r4k120 = _eval4K(120);
  const r4k60  = _eval4K(60);
  let badges4k = '', shown4k = [];
  if (r4k120.cls !== 'ng') {
    badges4k = badge(r4k120);
    shown4k = [r4k120];
    if (r4k120.cls === 'ok2' && r4k60.cls === 'ok') { badges4k += badge(r4k60); shown4k.push(r4k60); }
  } else {
    badges4k = badge(r4k60);
    shown4k = [r4k60];
  }

  return `<div class="beta-send-block">
    <div class="beta-send-card-wrap">
      <div class="beta-send-card-head" onclick="_betaSendToggle('betaSendD660')">
        <span class="beta-send-card-name">660 Pro</span>
        ${badges660}
        <span class="beta-send-card-toggle">▾</span>
      </div>
      <div class="beta-send-detail" id="betaSendD660" style="display:none">
        <table class="beta-send-spec-table">
          <tr><td>최대 가로</td><td>${fmt(DIM)} 픽셀</td></tr>
          <tr><td>최대 세로</td><td>${fmt(DIM)} 픽셀</td></tr>
          <tr><td>@60Hz 픽셀 상한</td><td>${fmt(PX60)} 픽셀</td></tr>
        </table>
        ${splitHtml([r660_60])}
      </div>
    </div>
    <div class="beta-send-card-wrap">
      <div class="beta-send-card-head" onclick="_betaSendToggle('betaSendD4k')">
        <span class="beta-send-card-name">4K</span>
        ${badges4k}
        <span class="beta-send-card-toggle">▾</span>
      </div>
      <div class="beta-send-detail" id="betaSendD4k" style="display:none">
        <table class="beta-send-spec-table">
          <tr><td>최대 가로</td><td>${fmt(DIM_4K)} 픽셀</td></tr>
          <tr><td>최대 세로</td><td>${fmt(DIM_4K)} 픽셀</td></tr>
          <tr><td>@120Hz 픽셀 상한</td><td>${fmt(PX_4K / 2)} 픽셀</td></tr>
          <tr><td>@60Hz 픽셀 상한</td><td>${fmt(PX_4K)} 픽셀</td></tr>
        </table>
        ${splitHtml(shown4k)}
      </div>
    </div>
  </div>`;
}

function betaRenderZoneList() {
  const el = document.getElementById('betaZoneList');
  if (!el) { return; }
  if (State.betaZones.length === 0) {
    el.innerHTML = '<div class="beta-empty-hint">캔버스를 드래그해서 구역을 추가하세요.</div>';
    return;
  }
  const wm = mm => (mm / 1000).toFixed(1).replace(/\.0$/, '') + 'm';
  const res = _betaCalcResolution();
  const resHtml = res
    ? `<div class="beta-res-bar">
        최종 해상도&nbsp; <strong>${res.w} × ${res.h} px</strong>&nbsp;=&nbsp;<strong>${(res.w * res.h).toLocaleString()} px</strong>
        <button class="beta-guide-btn" onclick="betaSaveGuideImage()">가이드 이미지 저장</button>
       </div>${_betaBuildSendingHtml(res.w, res.h)}${_betaBuildPanelTable()}`
    : '';
  el.innerHTML = State.betaZones.map((z, i) => {
    const col = BETA_ZONE_LINE[i % BETA_ZONE_LINE.length];
    const isSel = z.id === State._betaSelectedId;
    const selStyle = isSel ? `background:${col}18;outline:2px solid ${col};outline-offset:-1px;` : '';
    return `<div class="beta-zone-card" style="border-left:4px solid ${col};${selStyle}cursor:pointer" onclick="betaSelectZone('${z.id}')">
      <span class="beta-zone-tag" style="color:${col}">구역 ${i + 1}</span>
      <span class="beta-zone-info">${wm(z.cols * 500)} × ${wm(z.rows * 500)} | ${z.cols * SPECS[z.led].px500.w} × ${z.rows * SPECS[z.led].px500.h}px | ${z.led} | ${z.panelW}×${z.panelH}mm${((z.rows % (z.panelH / 500)) > 0 || (z.cols % (z.panelW / 500)) > 0) ? ' +500×500mm' : ''}</span>
      <button class="beta-zone-edit-btn" onclick="event.stopPropagation();betaEditZone('${z.id}')">편집</button>
      <button class="beta-zone-del-btn" onclick="event.stopPropagation();betaDeleteZone('${z.id}')">삭제</button>
    </div>`;
  }).join('') + resHtml;
}

function betaSelectZone(id) {
  State._betaSelectedId = id;
  betaRenderZoneList();
  betaDrawEdit();
}

function betaDeleteZone(id) {
  const zone = State.betaZones.find(z => z.id === id);
  if (zone) {
    const keys = new Set(betaPanels(zone).map(p => p.key));
    State.betaPorts.forEach(s => keys.forEach(k => s.delete(k)));
    State.betaPH2.forEach(arr => {
      for (let i = arr.length - 1; i >= 0; i--) { if (keys.has(arr[i])) { arr.splice(i, 1); } }
    });
  }
  State.betaZones = State.betaZones.filter(z => z.id !== id);
  State._betaCache = null;
  betaRender();
  saveState();
}

function betaEditZone(id) {
  const zone = State.betaZones.find(z => z.id === id);
  if (!zone) { return; }
  State._betaSelEdit = id;
  State._betaSelNew  = { startR: zone.startRow, startC: zone.startCol, rows: zone.rows, cols: zone.cols };
  betaShowCfgPanel();
  betaDrawEdit();
}

// ─ 구역 설정 팝업 ─

function betaShowCfgPanel() {
  const el = document.getElementById(State._betaFull ? 'betaFullZoneCfg' : 'betaZoneCfg');
  if (!el || !State._betaSelNew) { return; }
  const ev = State._betaSelEdit ? State.betaZones.find(z => z.id === State._betaSelEdit) : null;
  const curLed = ev ? ev.led : '3mm';
  const curPW  = ev ? ev.panelW : 500;
  const curPH  = ev ? ev.panelH : 1000;
  const leds = ['2mm', '3mm', '4mm'];
  const panelOpts = [
    { w: 500,  h: 500,  label: '500×500mm' },
    { w: 500,  h: 1000, label: '500×1000mm (세로)' },
    { w: 1000, h: 500,  label: '1000×500mm (가로)' },
  ];
  el.style.display = '';
  el.innerHTML = `<div class="beta-cfg-title">구역 설정</div>
    <div class="beta-cfg-row">
      <span class="beta-cfg-label">LED 피치</span>
      <div class="beta-cfg-chips" id="betaCfgLed">${
        leds.map(v => `<button class="beta-cfg-chip${v === curLed ? ' on' : ''}" onclick="_betaCfgSelLed(this,'${v}')">${v}</button>`).join('')
      }</div>
    </div>
    <div class="beta-cfg-row">
      <span class="beta-cfg-label">패널 사이즈</span>
      <div class="beta-cfg-chips" id="betaCfgPanel">${
        panelOpts.map(p => `<button class="beta-cfg-chip${p.w === curPW && p.h === curPH ? ' on' : ''}" data-w="${p.w}" data-h="${p.h}" onclick="_betaCfgSelPanel(this)">${p.label}</button>`).join('')
      }</div>
    </div>
    <div class="beta-cfg-actions">
      <button class="beta-cfg-ok" onclick="betaCfgApply()">적용</button>
      <button class="beta-cfg-cancel" onclick="betaCfgCancel()">취소</button>
    </div>`;
}

function _betaCfgSelLed(btn) {
  btn.closest('.beta-cfg-chips').querySelectorAll('.beta-cfg-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

function _betaCfgSelPanel(btn) {
  btn.closest('.beta-cfg-chips').querySelectorAll('.beta-cfg-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

function _betaAnimNewZones(ids) {
  const t0 = performance.now();
  const DUR = 380;
  function frame() {
    const p = Math.min((performance.now() - t0) / DUR, 1);
    const t = 1 - Math.pow(1 - p, 3); // ease-out cubic
    State._betaAnimProg = { ids, t };
    betaDrawEdit();
    if (p < 1) { requestAnimationFrame(frame); }
    else { State._betaAnimProg = null; }
  }
  requestAnimationFrame(frame);
}

function betaCfgApply() {
  if (!State._betaSelNew) { return; }
  const ledBtn   = document.querySelector('#betaCfgLed .beta-cfg-chip.on');
  const panelBtn = document.querySelector('#betaCfgPanel .beta-cfg-chip.on');
  const led = ledBtn ? ledBtn.textContent : '3mm';
  const pw  = panelBtn ? parseInt(panelBtn.dataset.w) : 500;
  const ph  = panelBtn ? parseInt(panelBtn.dataset.h) : 500;
  const { startR, startC, rows, cols } = State._betaSelNew;
  let _newIds = null;

  if (State._betaSelEdit) {
    if (_betaOverlaps(startR, startC, rows, cols, State._betaSelEdit)) { _toast('다른 구역과 겹칩니다.'); return; }
    const zone = State.betaZones.find(z => z.id === State._betaSelEdit);
    if (zone) {
      const oldKeys = new Set(betaPanels(zone).map(p => p.key));
      State.betaPorts.forEach(s => oldKeys.forEach(k => s.delete(k)));
      State.betaPH2.forEach(arr => {
        for (let i = arr.length - 1; i >= 0; i--) { if (oldKeys.has(arr[i])) { arr.splice(i, 1); } }
      });
      Object.assign(zone, { startRow: startR, startCol: startC, rows, cols, led, panelW: pw, panelH: ph });
    }
  } else {
    if (_betaOverlaps(startR, startC, rows, cols, null)) { _toast('다른 구역과 겹칩니다.'); return; }
    const _newZone = { id: _betaZid(), startRow: startR, startCol: startC, rows, cols, led, panelW: pw, panelH: ph };
    State.betaZones.push(_newZone);
    _newIds = new Set([_newZone.id]);
  }

  State._betaSelNew  = null;
  State._betaSelEdit = null;
  State._betaCache   = null;
  document.getElementById(State._betaFull ? 'betaFullZoneCfg' : 'betaZoneCfg').style.display = 'none';
  if (State._betaFull) { _betaRenderFull(); } else { betaRender(); }
  if (_newIds) { _betaAnimNewZones(_newIds); }
  saveState();
}

function betaCfgCancel() {
  State._betaSelNew  = null;
  State._betaSelEdit = null;
  document.getElementById(State._betaFull ? 'betaFullZoneCfg' : 'betaZoneCfg').style.display = 'none';
  betaDrawEdit();
}

// ─ 편집 모드 이벤트 ─

function _betaDragRafLoop() {
  if (!State._betaDragLerp || !State._betaDragSt) { return; }
  const st = State._betaDragSt; const cur = State._betaDragCur;
  const tr0 = Math.min(st.r, cur.r), tc0 = Math.min(st.c, cur.c);
  const tr1 = Math.max(st.r, cur.r) + 1, tc1 = Math.max(st.c, cur.c) + 1;
  const L = 0.25; const l = State._betaDragLerp;
  l.r0 += (tr0 - l.r0) * L; l.c0 += (tc0 - l.c0) * L;
  l.r1 += (tr1 - l.r1) * L; l.c1 += (tc1 - l.c1) * L;
  betaDrawEdit();
  requestAnimationFrame(_betaDragRafLoop);
}

function betaAttachEditEv() {
  const cv = _betaEditCv();
  if (!cv) { return; }
  if (cv._betaEvMode === 'edit') { return; }
  if (cv._betaAbort) { cv._betaAbort.abort(); }
  const ctrl = new AbortController();
  cv._betaAbort  = ctrl;
  cv._betaEvMode = 'edit';
  const ncv = cv;

  let wasDrag = false;

  // BCR 기반으로 CSS 스케일링 보정 → mm 좌표 반환
  function pos(e) {
    const bcr = ncv.getBoundingClientRect();
    const scX = State.betaAreaW / (bcr.width  || State.betaAreaW);
    const scY = State.betaAreaH / (bcr.height || State.betaAreaH);
    if (e.touches) {
      return { x: (e.touches[0].clientX - bcr.left) * scX, y: (e.touches[0].clientY - bcr.top) * scY };
    }
    return { x: (e.clientX - bcr.left) * scX, y: (e.clientY - bcr.top) * scY };
  }

  function onStart(e) {
    e.preventDefault();
    const { x, y } = pos(e);
    const cell = _betaCellAt(x, y);
    if (!cell) { return; }
    wasDrag = false;
    State._betaDragSt  = cell;
    State._betaDragCur = cell;
    State._betaDragLerp = { r0: cell.r, c0: cell.c, r1: cell.r + 1, c1: cell.c + 1 };
    requestAnimationFrame(_betaDragRafLoop);
  }

  function onMove(e) {
    e.preventDefault();
    if (!State._betaDragSt) { return; }
    const { x, y } = pos(e);
    const cell = _betaCellAt(x, y);
    if (!cell) { return; }
    const prev = State._betaDragCur;
    if (!prev || prev.r !== cell.r || prev.c !== cell.c) {
      State._betaDragCur = cell;
      wasDrag = true;
    }
  }

  function onEnd(e) {
    e.preventDefault();
    if (!State._betaDragSt) { return; }
    const r0 = Math.min(State._betaDragSt.r, State._betaDragCur.r);
    const c0 = Math.min(State._betaDragSt.c, State._betaDragCur.c);
    const r1 = Math.max(State._betaDragSt.r, State._betaDragCur.r);
    const c1 = Math.max(State._betaDragSt.c, State._betaDragCur.c);
    const startR = r0; const startC = c0;
    const rows = r1 - r0 + 1; const cols = c1 - c0 + 1;
    const drag = wasDrag;
    State._betaDragSt = null; State._betaDragCur = null; State._betaDragLerp = null; wasDrag = false;

    if (!drag) {
      // 단순 탭 → 구역 선택 (+ 기존 구역이면 편집 패널 열기)
      const zone = _betaZoneAt(r0, c0);
      State._betaSelectedId = zone ? zone.id : null;
      if (!State._betaFull) { betaRenderZoneList(); }
      if (zone) { betaEditZone(zone.id); return; }
      betaDrawEdit();
      return;
    }
    State._betaSelNew  = { startR, startC, rows, cols };
    State._betaSelEdit = null;
    betaDrawEdit();
    betaShowCfgPanel();
  }

  const sig = { signal: ctrl.signal, passive: false };
  ncv.addEventListener('mousedown',  onStart, sig);
  ncv.addEventListener('mousemove',  onMove,  sig);
  ncv.addEventListener('mouseup',    onEnd,   sig);
  ncv.addEventListener('touchstart', onStart, sig);
  ncv.addEventListener('touchmove',  onMove,  sig);
  ncv.addEventListener('touchend',   onEnd,   sig);
}

// ─ LAN 캔버스 ─

function betaDrawLan() {
  const cv = _betaEditCv();
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const panels = _betaAllPanels();
  const curPi  = State.betaAPort;
  if (!State._betaFull) { ctx.clearRect(0, 0, cv.width, cv.height); }

  // 배선 순서 번호 맵
  const stepOf = new Map();
  State.betaPorts.forEach((s, pi) => {
    State.betaPH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // ── pass 1: 셀 배경·테두리·패턴 ────────────────────────────
  panels.forEach(p => {
    const pi = _betaOwner(p.key);
    const px = p.x * sc; const py = p.y * sc;
    const pw = p.w * sc; const ph = p.h * sc;
    const lk  = pi >= 0 && pi !== curPi;
    const hov = State._betaLanDrag && State._betaLanDHov === p.key && pi < 0;

    ctx.fillStyle = pi >= 0
      ? portColor(pi) + (lk ? '55' : '99')
      : '#9FE1CB';
    ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

    if (hov) {
      ctx.fillStyle = portColor(curPi) + '44';
      ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
    }

    ctx.strokeStyle = pi >= 0 ? portColor(pi) : '#1D9E75';
    ctx.lineWidth   = pi >= 0 ? 1.5 : 0.5;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    // 다른 포트 → 어두운 빗금
    if (lk) {
      ctx.save();
      ctx.beginPath(); ctx.rect(px + 1, py + 1, pw - 2, ph - 2); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
      for (let d = -ph; d < pw + ph; d += 6) {
        ctx.beginPath(); ctx.moveTo(px + d, py + 1); ctx.lineTo(px + d + ph, py + ph); ctx.stroke();
      }
      ctx.restore();
    }

    // 마지막 탭 셀 하이라이트
    if (!State._betaLanDrag && State._betaFCell === p.key) {
      ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
    }
  });

  // ── pass 2: 포트 배선 경로 — 다각선 + 끝 화살촉 ───────────
  State.betaPorts.forEach((s, pi) => {
    const h = State.betaPH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const p = panels.find(x => x.key === k);
      return p ? { x: _betaPanelCx(p), y: _betaPanelCy(p) } : null;
    }).filter(Boolean);
    if (pts.length < 2) { return; }

    const pL0 = pts[pts.length - 2]; const pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x; const ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) { return; }
      const ux = ldx / len; const uy = ldy / len;
      const hw = 6; const hl = 12; const nx = -uy; const ny = ux;
      const bx = pL1.x - ux * 5; const by = pL1.y - uy * 5;
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

  // ── pass 3: 순서 번호 & 포트 레이블 ────────────────────────
  panels.forEach(p => {
    const pi = _betaOwner(p.key);
    if (pi < 0) { return; }
    const px = p.x * sc; const py = p.y * sc;
    const pw = p.w * sc; const ph = p.h * sc;
    const lk  = pi !== curPi;
    const cx2 = px + pw / 2; const cy2 = py + ph / 2;
    const step = stepOf.get(p.key);

    if (step) {
      const fs = Math.max(6, Math.min(12, pw - 8));
      const r  = Math.max(8, fs * 0.72);
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.font = `700 ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(pi);
      ctx.fillText(String(step), cx2, cy2);
    }

    if (pw >= 20) {
      const label = 'P' + (pi + 1);
      ctx.font = '700 9px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(label, px + 4, py + 4);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
      ctx.fillText(label, px + 4, py + 4);
    }
    ctx.textBaseline = 'alphabetic';
  });
}

// ─ PWR 캔버스 ─

function betaDrawPwr() {
  const cv = _betaEditCv();
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const panels = _betaAllPanels();
  const curPi  = State.betaPwrAPort;
  if (!State._betaFull) { ctx.clearRect(0, 0, cv.width, cv.height); }

  // 배선 순서 번호 맵
  const stepOf = new Map();
  State.betaPwrPorts.forEach((s, pi) => {
    State.betaPwrPH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // ── pass 1: 셀 배경·테두리·패턴 ────────────────────────────
  panels.forEach(p => {
    const pi = _betaPwrOwner(p.key);
    const px = p.x * sc, py = p.y * sc, pw = p.w * sc, ph = p.h * sc;
    const lk  = pi >= 0 && pi !== curPi;
    const hov = State._betaLanDrag && State._betaLanDHov === p.key && pi < 0;

    ctx.fillStyle = pi >= 0 ? portColor(pi) + (lk ? '55' : '99') : '#9FE1CB';
    ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
    if (hov) { ctx.fillStyle = portColor(curPi) + '44'; ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2); }
    ctx.strokeStyle = pi >= 0 ? portColor(pi) : '#1D9E75';
    ctx.lineWidth   = pi >= 0 ? 1.5 : 0.5;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);
    if (lk) {
      ctx.save();
      ctx.beginPath(); ctx.rect(px + 1, py + 1, pw - 2, ph - 2); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
      for (let d = -ph; d < pw + ph; d += 6) {
        ctx.beginPath(); ctx.moveTo(px + d, py + 1); ctx.lineTo(px + d + ph, py + ph); ctx.stroke();
      }
      ctx.restore();
    }
    if (!State._betaLanDrag && State._betaFCell === p.key) {
      ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
    }
  });

  // ── pass 2: 포트 배선 경로 — 다각선 + 끝 화살촉 ───────────
  State.betaPwrPorts.forEach((s, pi) => {
    const h = State.betaPwrPH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const p = panels.find(x => x.key === k);
      return p ? { x: _betaPanelCx(p), y: _betaPanelCy(p) } : null;
    }).filter(Boolean);
    if (pts.length < 2) { return; }

    const pL0 = pts[pts.length - 2], pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x, ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };
    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) { return; }
      const ux = ldx / len, uy = ldy / len;
      const hw = 6, hl = 12, nx = -uy, ny = ux;
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

  // ── pass 3: 순서 번호 & 포트 레이블 ────────────────────────
  panels.forEach(p => {
    const pi = _betaPwrOwner(p.key);
    if (pi < 0) { return; }
    const lk  = pi !== curPi;
    const cx2 = p.x * sc + p.w * sc / 2, cy2 = p.y * sc + p.h * sc / 2;
    const step = stepOf.get(p.key);

    if (step) {
      const fs = Math.max(6, Math.min(12, p.w * sc - 8));
      const r  = Math.max(8, fs * 0.72);
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.font = `700 ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(pi);
      ctx.fillText(String(step), cx2, cy2);
    }

    if (p.w * sc >= 20) {
      const label = 'P' + (pi + 1);
      ctx.font = '700 9px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(label, p.x * sc + 4, p.y * sc + 4);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
      ctx.fillText(label, p.x * sc + 4, p.y * sc + 4);
    }
    ctx.textBaseline = 'alphabetic';
  });
}

function betaAddPwrPort() {
  State.betaPwrPorts.push(new Set()); State.betaPwrPH2.push([]);
  betaRenderPwrPorts(); _betaSimDraw(); saveState();
}
function _doBetaRemovePwrPort() {
  if (State.betaPwrPorts.length <= 1) { return; }
  if (State.betaPwrAPort >= State.betaPwrPorts.length - 1) { State.betaPwrAPort = State.betaPwrPorts.length - 2; }
  State.betaPwrPorts.pop(); State.betaPwrPH2.pop();
  betaRenderPwrPorts(); _betaSimDraw(); saveState();
}
function betaRemovePwrPort() {
  if (State.betaPwrPorts.length <= 1) { return; }
  const last = State.betaPwrPorts[State.betaPwrPorts.length - 1];
  if (last.size > 0) {
    openConfirm(`P${State.betaPwrPorts.length} 포트 제거`, `P${State.betaPwrPorts.length}에 ${last.size}장이 할당되어 있습니다. 제거할까요?`, _doBetaRemovePwrPort);
  } else { _doBetaRemovePwrPort(); }
}

function betaRenderPwrPorts() {
  const el = document.getElementById(State._betaFull ? 'betaFullPortRow' : 'betaPortRow');
  if (!el) { return; }
  const pi    = State.betaPwrAPort;
  const count = State.betaPwrPorts.length;
  let html    = '<div class="beta-port-strip">';
  for (let i = 0; i < count; i++) {
    const sz  = State.betaPwrPorts[i].size;
    const on  = i === pi;
    const has = sz > 0;
    const _bc = portColor(i);
    html += `<button class="beta-port-btn${on ? ' sel' : ''}${has ? ' has-data' : ''}"
      style="${on ? `background:${_bc};border-color:${_bc};` : `border-color:${_bc};color:${_bc};`}"
      onclick="State.betaPwrAPort=${i};_betaSimDraw();betaRenderPwrPorts()">P${i + 1}</button>`;
  }
  html += '</div>';
  const sz   = State.betaPwrPorts[pi].size;
  const _apc = portColor(pi);
  html += `<div class="port-info-row">
    <span class="port-name" style="color:${_apc}">포트 ${pi + 1}</span>
    <span class="port-count">${sz}장</span>
    <button class="beta-rst-port-btn" onclick="betaRstPwrPort(${pi})">포트 ${pi + 1} 초기화</button>
    ${State._betaLanDrag ? `<span class="drag-badge" style="background:${_apc}">드래그 중</span>` : ''}
    <button class="port-btn expand-port-btn ml-auto" onclick="betaAddPwrPort()">+ 포트</button>
    <button class="port-btn expand-port-btn" onclick="betaRemovePwrPort()">− 포트</button>
  </div>`;
  el.innerHTML = html;
}

// ─ LAN UI ─

function betaSetSimTab(tab) {
  if (tab === State.betaSimTab) { return; }
  if (State._betaFull) {
    State.betaSimTab = tab;
    const _t = document.getElementById('betaFullHdrTitle');
    if (_t) { _t.textContent = tab === 'pwr' ? '파워콘 배선' : '랜선 배선'; }
    const fcv = document.getElementById('betaFullCanvas');
    if (fcv) { fcv._betaEvMode = null; if (fcv._betaAbort) { fcv._betaAbort.abort(); } }
    betaAttachLanEv();
    betaRenderLanUI();
    _betaSimDraw();
    return;
  }
  const cv   = document.getElementById('betaCanvas');
  const snap = document.getElementById('betaCanvasSnap');
  snap.width  = cv.width;
  snap.height = cv.height;
  snap.getContext('2d').drawImage(cv, 0, 0);
  snap.style.display = 'block';
  snap.style.transition = '';
  snap.style.opacity = '1';
  State.betaSimTab = tab;
  _betaSimDraw();
  betaRenderLanUI();
  snap.offsetHeight;
  snap.style.transition = 'opacity .28s';
  snap.style.opacity = '0';
  snap.addEventListener('transitionend', () => { snap.style.display = 'none'; snap.style.transition = ''; }, { once: true });
}

function betaRenderLanUI() {
  const el = document.getElementById(State._betaFull ? 'betaFullLanBtns' : 'betaLanBtns');
  if (el) {
    const isLan = State.betaSimTab !== 'pwr';
    if (State._betaFull) {
      // 전체모드: 탭 버튼만 표시 (버튼/포트스트립 제거 → 캔버스 공간 최대화)
      el.innerHTML = `<div class="beta-lan-tabs">
        <button class="beta-lan-tab${isLan ? ' on' : ''}" onclick="betaSetSimTab('lan')">랜선</button>
        <button class="beta-lan-tab${!isLan ? ' on' : ''}" onclick="betaSetSimTab('pwr')">파워콘</button>
      </div>`;
    } else {
      const autoApplied = isLan ? State._betaLanAutoAssigned : State._betaPwrAutoAssigned;
      const autoBtn  = autoApplied
        ? `<button class="beta-lan-btn" disabled>자동할당 적용됨</button>`
        : `<button class="beta-lan-btn" onclick="${isLan ? 'betaAutoAssign()' : 'betaAutoAssignPwr()'}">자동 할당</button>`;
      el.innerHTML = `<div class="beta-lan-tabs">
        <button class="beta-lan-tab${isLan ? ' on' : ''}" onclick="betaSetSimTab('lan')">랜선</button>
        <button class="beta-lan-tab${!isLan ? ' on' : ''}" onclick="betaSetSimTab('pwr')">파워콘</button>
      </div>
      <div class="beta-lan-btns-row">
        ${autoBtn}
        <button class="beta-lan-btn danger" onclick="betaRstAllPorts()">전체 배선 초기화</button>
      </div>`;
    }
  }
  if (!State._betaFull) {
    if (State.betaSimTab === 'pwr') { betaRenderPwrPorts(); } else { betaRenderPorts(); }
  }
  betaRenderSum();
  betaRenderLeg();
}

function betaRenderPorts() {
  const el = document.getElementById(State._betaFull ? 'betaFullPortRow' : 'betaPortRow');
  if (!el) { return; }
  const pi  = State.betaAPort;
  let html  = '<div class="beta-port-strip">';
  for (let i = 0; i < 16; i++) {
    const sz  = State.betaPorts[i].size;
    const on  = i === pi;
    const has = sz > 0;
    const _bc = portColor(i);
    html += `<button class="beta-port-btn${on ? ' sel' : ''}${has ? ' has-data' : ''}"
      style="${on ? `background:${_bc};border-color:${_bc};` : `border-color:${_bc};color:${_bc};`}"
      onclick="State.betaAPort=${i};_betaSimDraw();betaRenderPorts()">P${i + 1}</button>`;
  }
  html += '</div>';
  const sz  = State.betaPorts[pi].size;
  const px  = _betaPxOf(pi);
  const pct = Math.min(100, Math.round(px / MAX_PX * 100));
  const ov  = px > MAX_PX;
  const _apc = portColor(pi);
  html += `<div class="port-info-row">
    <span class="port-name" style="color:${_apc}">포트 ${pi + 1}</span>
    <span class="port-count">${sz}장 · ${px.toLocaleString()} px</span>
    <span class="port-px-meta ${ov ? 'over' : 'ok'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov ? ' ⚠ 초과' : ''}</span>
    <button class="beta-rst-port-btn" onclick="betaRstPort(${pi})">포트 ${pi + 1} 초기화</button>
    ${State._betaLanDrag ? `<span class="drag-badge" style="background:${_apc}">드래그 중</span>` : ''}
  </div>
  <div class="px-bar"><div class="px-bar-fill" style="width:${pct}%;background:${ov ? '#E24B4A' : _apc};"></div></div>`;
  el.innerHTML = html;
}

function betaRenderSum() {
  const el = document.getElementById('betaLanSum');
  if (!el) { return; }
  const ports  = State.betaPorts;
  const active = ports.filter(s => s.size > 0).length;
  const l1 = active * 2 + State.betaSpareAdj.l1;
  const slNet = ports.reduce((acc, s) => acc + Math.max(0, s.size - 1), 0);
  const sl = slNet + State.betaSpareAdj.sl;
  const pwrActive = State.betaPwrPorts.filter(s => s.size > 0).length;
  const c1 = pwrActive + State.betaSpareAdj.c1;
  const spNet = State.betaPwrPorts.reduce((acc, s) => acc + Math.max(0, s.size - 1), 0);
  const sp = spNet + State.betaSpareAdj.sp;
  const si = (k, v) => `<input class="spare-inp" type="number" min="0" value="${v}" oninput="setBetaSpare('${k}',this.value)">`;
  el.innerHTML = `<div class="beta-sum-block">
    <div class="beta-sum-section lan">
      <div class="beta-sum-title">랜선</div>
      <div class="beta-sum-cards">
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">1번 랜</div>
          <div class="beta-sum-val">${l1}개</div>
          <div class="beta-sum-note">메인·백업 ${active * 2} + 여유 ${si('l1', State.betaSpareAdj.l1)}</div>
        </div>
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">숏랜</div>
          <div class="beta-sum-val">${sl}개</div>
          <div class="beta-sum-note">필요 ${slNet} + 여유 ${si('sl', State.betaSpareAdj.sl)}</div>
        </div>
      </div>
    </div>
    <div class="beta-sum-section pwr">
      <div class="beta-sum-title">파워콘</div>
      <div class="beta-sum-cards">
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">1번 파워</div>
          <div class="beta-sum-val">${c1}개</div>
          <div class="beta-sum-note">필요 ${pwrActive} + 여유 ${si('c1', State.betaSpareAdj.c1)}</div>
        </div>
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">숏파워</div>
          <div class="beta-sum-val">${sp}개</div>
          <div class="beta-sum-note">필요 ${spNet} + 여유 ${si('sp', State.betaSpareAdj.sp)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

function betaRenderLeg() {
  const el = document.getElementById('betaLeg');
  if (!el) { return; }
  el.innerHTML = '';
}

// ─ 포트 할당 ─

function betaAssign(pi, key) {
  if (State.betaPorts[pi].has(key)) { return; }
  State.betaPorts[pi].add(key);
  State.betaPH2[pi].push(key);
}

function betaDeassign(pi, key) {
  State.betaPorts[pi].delete(key);
  const idx = State.betaPH2[pi].indexOf(key);
  if (idx >= 0) { State.betaPH2[pi].splice(idx, 1); }
}

function betaRstPort(pi) {
  State.betaPorts[pi] = new Set();
  State.betaPH2[pi]   = [];
  State._betaLanAutoAssigned = false;
  _betaSimDraw(); betaRenderPorts(); betaRenderSum(); saveState();
}

function betaRstPwrPort(pi) {
  State.betaPwrPorts[pi] = new Set();
  State.betaPwrPH2[pi]   = [];
  State._betaPwrAutoAssigned = false;
  _betaSimDraw(); betaRenderPwrPorts(); betaRenderSum(); saveState();
}

function betaRstAllPorts() {
  if (State.betaSimTab === 'pwr') {
    openConfirm('파워콘 배선 초기화', '모든 파워콘 배선을 초기화할까요?', () => {
      const cnt = State.betaPwrPorts.length;
      State.betaPwrPorts = Array.from({ length: cnt }, () => new Set());
      State.betaPwrPH2   = Array.from({ length: cnt }, () => []);
      State.betaPwrAPort = 0;
      State._betaPwrAutoAssigned = false;
      _betaSimDraw(); betaRenderLanUI(); saveState();
    });
  } else {
    openConfirm('배선 초기화', '모든 포트 배선을 초기화할까요?', () => {
      State.betaPorts = Array.from({ length: 16 }, () => new Set());
      State.betaPH2   = Array.from({ length: 16 }, () => []);
      State.betaAPort = 0;
      State._betaLanAutoAssigned = false;
      _betaSimDraw(); betaRenderLanUI(); saveState();
    });
  }
}

// ─ 전체모드 ─

function _betaRenderFull() {
  const cv   = document.getElementById('betaFullCanvas');
  const wrap = document.getElementById('betaFullCanvasWrap');
  if (!cv || !wrap || !State.betaAreaW || !State.betaAreaH) { return; }

  const lanUI = document.getElementById('betaFullLanUI');
  const title = document.getElementById('betaFullHdrTitle');

  if (State.betaMode === 'lan') {
    if (lanUI) { lanUI.style.display = ''; }
    if (title) { title.textContent = State.betaSimTab === 'pwr' ? '파워콘 배선' : '랜선 배선'; }
    betaRenderLanUI(); // 포트 스트립 + 탭 버튼을 먼저 DOM에 렌더
    const sc = Math.min(wrap.clientWidth / State.betaAreaW, wrap.clientHeight / State.betaAreaH);
    cv.width  = Math.round(State.betaAreaW * sc);
    cv.height = Math.round(State.betaAreaH * sc);
    betaAttachLanEv();
    _betaSimDraw(); // 격자 + 배선 드로잉
  } else {
    if (lanUI) { lanUI.style.display = 'none'; }
    if (title) { title.textContent = '구역 편집'; }
    const sc = Math.min(wrap.clientWidth / State.betaAreaW, wrap.clientHeight / State.betaAreaH);
    cv.width  = Math.round(State.betaAreaW * sc);
    cv.height = Math.round(State.betaAreaH * sc);
    betaAttachEditEv();
    betaDrawEdit(); // betaDrawEdit 내부에서 _betaDrawGrid 호출함
  }
}

function betaEnterFull() {
  const overlay = document.getElementById('betaFullOverlay');
  if (!overlay || !State.betaAreaW || !State.betaAreaH) { return; }
  State._betaFull = true;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  history.pushState({ overlay: 'betaFull' }, '');

  // 가로 방향 잠금 — PWA: 직접 lock, 브라우저: requestFullscreen 경유 fallback
  const _lockLandscape = () => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  };
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().then(_lockLandscape).catch(_lockLandscape);
  } else {
    _lockLandscape();
  }

  State._betaFullResizeHandler = () => requestAnimationFrame(() => _betaRenderFull());
  window.addEventListener('resize', State._betaFullResizeHandler);
  // 더블 rAF: 레이아웃이 완전히 확정된 뒤 캔버스 크기 계산
  requestAnimationFrame(() => requestAnimationFrame(() => _betaRenderFull()));
}

function betaExitFull() {
  const overlay = document.getElementById('betaFullOverlay');
  if (!overlay || !State._betaFull) { return; }

  // 전체모드 캔버스 이벤트 해제
  const fcv = document.getElementById('betaFullCanvas');
  if (fcv && fcv._betaAbort) { fcv._betaAbort.abort(); fcv._betaEvMode = null; }

  // 구역 설정 패널 닫기
  const fcfg = document.getElementById('betaFullZoneCfg');
  if (fcfg) { fcfg.style.display = 'none'; fcfg.innerHTML = ''; }

  // 배선 전체모드 UI 정리
  const flanUI = document.getElementById('betaFullLanUI');
  if (flanUI) { flanUI.style.display = 'none'; }
  const ftitle = document.getElementById('betaFullHdrTitle');
  if (ftitle) { ftitle.textContent = '구역 편집'; }

  State._betaFull = false;
  State._betaSelNew = null;
  State._betaSelEdit = null;
  overlay.style.display = 'none';
  document.body.style.overflow = '';

  if (screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock(); } catch (e) {}
  }
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
  const fpp = document.getElementById('betaFullPortPopup');
  if (fpp) { fpp.style.display = 'none'; }

  if (State._betaFullResizeHandler) {
    window.removeEventListener('resize', State._betaFullResizeHandler);
    State._betaFullResizeHandler = null;
  }

  if (history.state && history.state.overlay === 'betaFull') { _histBack(); }
  betaRender();

  // 방향 전환 완료 후 메인 캔버스 재렌더 (비동기 전환 대응)
  const _onExitResize = () => betaRender();
  window.addEventListener('resize', _onExitResize, { once: true, passive: true });
  setTimeout(() => window.removeEventListener('resize', _onExitResize), 1500);
}

function betaReset() {
  if (State.betaMode === 'lan') { betaRstAllPorts(); return; }
  // 전체모드 구역 편집: 설치면적은 유지, 구역 내역만 초기화
  if (State._betaFull) {
    openConfirm('구역 초기화', '구역 생성 내역을 모두 초기화할까요?', () => {
      State.betaZones = []; State._betaCache = null;
      State._betaSelNew = null; State._betaSelEdit = null;
      const fcfg = document.getElementById('betaFullZoneCfg');
      if (fcfg) { fcfg.style.display = 'none'; fcfg.innerHTML = ''; }
      _betaRenderFull(); saveState();
    });
    return;
  }
  openConfirm('혼합 시뮬 초기화', '설치 면적, 구역, 배선을 모두 초기화할까요?', () => {
    State.betaAreaW = 0; State.betaAreaH = 0;
    State.betaMode  = 'edit';
    document.getElementById('betaW').value = '';
    document.getElementById('betaH').value = '';
    State.betaZones    = []; State._betaCache = null;
    State.betaPorts    = Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = Array.from({ length: 16 }, () => []);
    State.betaAPort    = 0;
    State.betaPwrPorts = Array.from({ length: 18 }, () => new Set());
    State.betaPwrPH2   = Array.from({ length: 18 }, () => []);
    State.betaPwrAPort = 0;
    State._betaSelNew  = null; State._betaSelEdit = null;
    if (State._betaFull) { _betaRenderFull(); } else { betaRender(); }
    saveState();
  });
}

// ─ 자동 할당 ─

function _betaNextEmpty() {
  for (let i = 0; i < 16; i++) {
    if (State.betaPorts[i].size === 0) { return i; }
  }
  return State.betaAPort;
}

function _balancedCols(total, numPorts, maxRaw, maxEven) {
  if (numPorts === 1) { return [total]; }
  const base = Math.floor(total / numPorts);
  let perPort;
  if (base < 2 || base % 2 === 0) {
    const ceilBase = Math.ceil(total / numPorts);
    perPort = (base < 2 && ceilBase <= maxRaw) ? ceilBase : base;
  } else {
    const up = base + 1;
    const lastIfUp = total - up * (numPorts - 1);
    if (up <= maxEven && lastIfUp >= 1 && lastIfUp <= maxRaw) {
      perPort = up;
    } else {
      const down = base - 1;
      const lastIfDown = total - down * (numPorts - 1);
      perPort = (down >= 1 && lastIfDown >= 1 && lastIfDown <= maxRaw) ? down : base;
    }
  }
  const takes = [];
  let rem = total;
  for (let p = 0; p < numPorts - 1; p++) { takes.push(perPort); rem -= perPort; }
  takes.push(rem);
  return takes;
}

function _betaAutoAssignZone(zone, portOff) {
  const panels = betaPanels(zone);
  const colMap = new Map();
  for (const p of panels) {
    if (!colMap.has(p.x)) { colMap.set(p.x, []); }
    colMap.get(p.x).push(p);
  }
  const colKeys = [...colMap.keys()].sort((a, b) => a - b);
  const totalCols = colKeys.length;
  if (totalCols === 0) { return 0; }

  // 열당 최대 픽셀 수 → 포트당 최대 열 수 산출
  const maxColPx = Math.max(...colKeys.map(ck =>
    colMap.get(ck).reduce((sum, p) => {
      const sp = SPECS[p.led];
      return sum + Math.round(sp.px500.w / 500 * p.w) * Math.round(sp.px500.h / 500 * p.h);
    }, 0)
  ));
  if (maxColPx === 0) { return 0; }

  const maxRaw  = Math.max(1, Math.floor(MAX_PX / maxColPx));
  const maxEven = maxRaw >= 2 ? (maxRaw % 2 === 0 ? maxRaw : maxRaw - 1) : maxRaw;
  const numPorts = Math.min(16 - portOff, Math.ceil(totalCols / maxEven));
  const takes = _balancedCols(totalCols, numPorts, maxRaw, maxEven);

  let colStart = 0;
  for (let pi = 0; pi < takes.length; pi++) {
    const portIdx = portOff + pi;
    if (portIdx >= 16) { break; }
    for (let ci = 0; ci < takes[pi]; ci++) {
      const col = colMap.get(colKeys[colStart + ci]).slice().sort((a, b) => a.y - b.y);
      // 짝수 ci → 하→상, 홀수 ci → 상→하 (뱀형)
      const ordered = ci % 2 === 0 ? col.slice().reverse() : col;
      for (const p of ordered) { betaAssign(portIdx, p.key); }
    }
    colStart += takes[pi];
  }
  return takes.length;
}

function betaAutoAssign() {
  State.betaPorts  = Array.from({ length: 16 }, () => new Set());
  State.betaPH2    = Array.from({ length: 16 }, () => []);
  State.betaAPort  = 0;
  State._betaFCell = null;
  const sorted = [...State.betaZones].sort((a, b) =>
    a.startRow !== b.startRow ? a.startRow - b.startRow : a.startCol - b.startCol
  );
  let portOff = 0;
  for (const zone of sorted) {
    portOff = Math.min(16, portOff + _betaAutoAssignZone(zone, portOff));
  }
  State.betaAPort = 0;
  State._betaLanAutoAssigned = true;
  _betaSimDraw(); betaRenderLanUI(); saveState();
}

function betaAutoAssignPwr() {
  const cnt = State.betaPwrPorts.length;
  State.betaPwrPorts = Array.from({ length: cnt }, () => new Set());
  State.betaPwrPH2   = Array.from({ length: cnt }, () => []);
  State.betaPwrAPort = 0;

  const allPanels = _betaAllPanels();
  let portIdx = 0;

  for (const zone of State.betaZones) {
    if (portIdx >= cnt) { break; }
    const zonePanels = allPanels.filter(p => p.zoneId === zone.id);
    if (!zonePanels.length) { continue; }

    const _specLed  = SPECS[zone.led];
    const _specKey  = (zone.panelH === 1000 || zone.panelW === 1000) ? 'px1000' : 'px500';
    const _pitch    = parseInt(zone.led);
    const pxMain    = _specLed ? _specLed[_specKey].w * _specLed[_specKey].h
                               : (zone.panelW / _pitch) * (zone.panelH / _pitch);
    const maxPanels = Math.max(1, Math.floor(300000 / pxMain));

    // 패널 열/행 좌표 추출
    const colXs  = [...new Set(zonePanels.map(p => p.x))].sort((a, b) => a - b);
    const rowYs  = [...new Set(zonePanels.map(p => p.y))].sort((a, b) => a - b);
    const numCols = colXs.length;
    const numRows = rowYs.length;
    const byXY   = new Map(zonePanels.map(p => [`${p.x},${p.y}`, p]));

    // 범용 뱀형 빌더: yList 행 순서, xList 열 순서 (짝수행: xList 정방향, 홀수행: 역방향)
    const buildSnake = (yList, xList) => {
      const out = [];
      yList.forEach((y, i) => {
        const row = xList.map(x => byXY.get(`${x},${y}`)).filter(Boolean);
        out.push(...(i % 2 === 0 ? row : [...row].reverse()));
      });
      return out;
    };

    // 뱀 배열을 nPorts개 포트에 균등 배분
    const assignSlice = (snake, nPorts) => {
      if (!snake.length || nPorts <= 0) { return; }
      const base = Math.floor(snake.length / nPorts);
      const extra = snake.length % nPorts;
      let idx = 0;
      for (let i = 0; i < nPorts; i++) {
        if (portIdx >= cnt) { break; }
        const count = base + (i < extra ? 1 : 0);
        snake.slice(idx, idx + count).forEach(p => {
          State.betaPwrPorts[portIdx].add(p.key);
          State.betaPwrPH2[portIdx].push(p.key);
        });
        idx += count;
        portIdx++;
      }
    };

    if (numRows === 1) {
      // ── 단일 행 ────────────────────────────────────────────────
      const rowY = rowYs[0];
      if (zonePanels.length <= maxPanels) {
        // 1포트: 오른→왼 (끝이 왼쪽)
        if (portIdx < cnt) {
          [...colXs].reverse()
            .map(x => byXY.get(`${x},${rowY}`)).filter(Boolean)
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      } else {
        // 다중 포트: 앞 ceil(N/2) 그룹 왼→오(끝이 안쪽), 나머지 오→왼(끝이 안쪽)
        const nPorts = Math.min(cnt - portIdx, Math.ceil(numCols / maxPanels));
        const base1  = Math.floor(numCols / nPorts);
        const extra1 = numCols % nPorts;
        const nLeft  = Math.ceil(nPorts / 2);
        let ci = 0;
        for (let i = 0; i < nPorts && portIdx < cnt; i++) {
          const size  = base1 + (i < extra1 ? 1 : 0);
          const grpXs = colXs.slice(ci, ci + size);
          ci += size;
          const xs = (i >= nLeft) ? [...grpXs].reverse() : grpXs;
          xs.map(x => byXY.get(`${x},${rowY}`)).filter(Boolean)
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      }
    } else if (numRows === 2) {
      // ── 2행, 행 기준 뱀형 ────────────────────────────────────
      if (zonePanels.length <= maxPanels) {
        // 1포트: 오른→왼 (끝이 왼쪽)
        if (portIdx < cnt) {
          buildSnake([...rowYs].reverse(), [...colXs].reverse())
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      } else {
        // 다중 포트: 앞 ceil(N/2) 그룹 왼→오(끝이 안쪽), 나머지 오→왼(끝이 안쪽)
        const colsPerPort = Math.max(1, Math.floor(maxPanels / numRows));
        const nPorts      = Math.min(cnt - portIdx, Math.ceil(numCols / colsPerPort));
        const base1       = Math.floor(numCols / nPorts);
        const extra1      = numCols % nPorts;
        const nLeft       = Math.ceil(nPorts / 2);
        let ci = 0;
        for (let i = 0; i < nPorts && portIdx < cnt; i++) {
          const size  = base1 + (i < extra1 ? 1 : 0);
          const grpXs = colXs.slice(ci, ci + size);
          ci += size;
          const xs = (i >= nLeft) ? [...grpXs].reverse() : grpXs;
          buildSnake([...rowYs].reverse(), xs)
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      }
    } else {
      // ── 열 기준 뱀형 (행 수 > 2), 2열 고정, 시작·끝 모두 바닥 ─
      if (zonePanels.length <= maxPanels && portIdx < cnt) {
        // 전체 패널이 1포트 한도 이내: 단일 포트로 처리
        const snake = [];
        for (let dc = 0; dc < numCols; dc++) {
          const x   = colXs[dc];
          const col = rowYs.map(y => byXY.get(`${x},${y}`)).filter(Boolean);
          snake.push(...(dc % 2 === 0 ? [...col].reverse() : col));
        }
        snake.forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
        portIdx++;
      } else {
        const maxColsPerPort = Math.min(3, Math.max(1, Math.round(maxPanels / numRows)));
        const colsPerPort   = maxColsPerPort >= 2 ? 2 : 1; // 2열 고정 (시작·끝 바닥행 유지)

        let ci = 0;
        while (ci < numCols && portIdx < cnt) {
          const colCount = Math.min(colsPerPort, numCols - ci);
          const snake = [];
          for (let dc = 0; dc < colCount; dc++) {
            const x   = colXs[ci + dc];
            const col = rowYs.map(y => byXY.get(`${x},${y}`)).filter(Boolean);
            snake.push(...(dc % 2 === 0 ? [...col].reverse() : col));
          }
          snake.forEach(p => {
            State.betaPwrPorts[portIdx].add(p.key);
            State.betaPwrPH2[portIdx].push(p.key);
          });
          portIdx++;
          ci += colCount;
        }
      }
    }
  }

  State._betaPwrAutoAssigned = true;
  _betaSimDraw(); betaRenderLanUI(); saveState();
}

// ─ 전체모드 포트 팝업 ─

function _betaFullShowPortPopup() {
  const popup = document.getElementById('betaFullPortPopup');
  if (!popup) { return; }
  const pi    = _betaSimAPort();
  const isLan = State.betaSimTab !== 'pwr';
  const col   = portColor(pi);
  if (isLan) {
    const sz  = State.betaPorts[pi].size;
    const px  = _betaPxOf(pi);
    const pct = Math.min(100, Math.round(px / MAX_PX * 100));
    const ov  = px > MAX_PX;
    popup.innerHTML = `
      <button class="beta-full-popup-close" onclick="document.getElementById('betaFullPortPopup').style.display='none'">✕</button>
      <div class="port-info-row">
        <span class="port-name" style="color:${col}">포트 ${pi + 1}</span>
        <span class="port-count">${sz}장 · ${px.toLocaleString()} px</span>
        <span class="port-px-meta ${ov ? 'over' : 'ok'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov ? ' ⚠ 초과' : ''}</span>
      </div>
      <div class="px-bar"><div class="px-bar-fill" style="width:${pct}%;background:${ov ? '#E24B4A' : col};"></div></div>`;
  } else {
    const sz = State.betaPwrPorts[pi].size;
    popup.innerHTML = `
      <button class="beta-full-popup-close" onclick="document.getElementById('betaFullPortPopup').style.display='none'">✕</button>
      <div class="port-info-row">
        <span class="port-name" style="color:${col}">포트 ${pi + 1}</span>
        <span class="port-count">${sz}장</span>
      </div>`;
  }
  popup.style.display = 'block';
}

// ─ LAN/PWR 모드 이벤트 ─

function betaAttachLanEv() {
  const cv = _betaEditCv();
  if (!cv) { return; }
  if (cv._betaEvMode === 'lan') { return; }
  if (cv._betaAbort) { cv._betaAbort.abort(); }
  const ctrl = new AbortController();
  cv._betaAbort  = ctrl;
  cv._betaEvMode = 'lan';
  const ncv = cv;

  let lpT = null;

  // BCR 기반으로 CSS 스케일링 보정 → mm 좌표 반환
  function getXY(e) {
    const bcr = ncv.getBoundingClientRect();
    const scX = State.betaAreaW / (bcr.width  || State.betaAreaW);
    const scY = State.betaAreaH / (bcr.height || State.betaAreaH);
    if (e.touches) {
      return { x: (e.touches[0].clientX - bcr.left) * scX, y: (e.touches[0].clientY - bcr.top) * scY };
    }
    return { x: (e.clientX - bcr.left) * scX, y: (e.clientY - bcr.top) * scY };
  }

  // mouseleave / touchcancel 공통 정리
  function cl() {
    clearTimeout(lpT); lpT = null;
    State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
    _betaSimDraw();
  }

  function onDown(e) {
    e.preventDefault();
    const { x, y } = getXY(e);
    const panel = _betaPanelAt(x, y);
    if (!panel) { return; }
    State._betaLanDStk = [];
    State._betaFCell   = panel.key;
    State._betaLanDrag = false;
    lpT = setTimeout(() => {
      const own = _betaSimOwner(panel.key);
      _betaSetAPort(own >= 0 ? own : _betaNextSimEmpty());
      State._betaLanDrag = true;
      State._betaLanDStk = [panel.key];
      State._betaLanDHov = panel.key;
      if (own < 0) {
        _betaSimAssign(_betaSimAPort(), panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      _betaSimDraw(); _betaSimRenderPorts();
    }, e.touches ? LP_TOUCH : LP_MS);
  }

  function onMove(e) {
    e.preventDefault();
    if (!State._betaLanDrag) { return; }
    const { x, y } = getXY(e);
    const panel = _betaPanelAt(x, y);
    State._betaLanDHov = panel ? panel.key : null;
    if (!panel) { _betaSimDraw(); return; }
    const stk = State._betaLanDStk;
    if (stk.length >= 2 && stk[stk.length - 2] === panel.key) {
      const last = stk[stk.length - 1];
      if (_betaSimPorts()[_betaSimAPort()].has(last)) {
        _betaSimDeassign(_betaSimAPort(), last);
        if (navigator.vibrate) { navigator.vibrate(25); }
      }
      stk.pop();
      _betaSimDraw(); _betaSimRenderPorts();
      return;
    }
    if (stk[stk.length - 1] !== panel.key) {
      const own = _betaSimOwner(panel.key);
      if (own >= 0 && own !== _betaSimAPort()) { _betaSimDraw(); return; }
      if (!_betaSimPorts()[_betaSimAPort()].has(panel.key)) {
        _betaSimAssign(_betaSimAPort(), panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      stk.push(panel.key);
      _betaSimDraw(); _betaSimRenderPorts();
    }
  }

  function onUp(e) {
    e.preventDefault();
    clearTimeout(lpT); lpT = null;
    if (State._betaLanDrag) {
      State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
      _betaSimDraw(); _betaSimRenderPorts(); betaRenderSum(); saveState();
      return;
    }
    const bcr2 = ncv.getBoundingClientRect();
    const scX2 = State.betaAreaW / (bcr2.width  || State.betaAreaW);
    const scY2 = State.betaAreaH / (bcr2.height || State.betaAreaH);
    const pt = e.changedTouches
      ? { x: (e.changedTouches[0].clientX - bcr2.left) * scX2, y: (e.changedTouches[0].clientY - bcr2.top) * scY2 }
      : getXY(e);
    const panel = _betaPanelAt(pt.x, pt.y);
    if (panel) {
      const pi  = _betaSimAPort();
      const own = _betaSimOwner(panel.key);
      if (own === pi) {
        _betaSimDeassign(pi, panel.key);
        if (navigator.vibrate) { navigator.vibrate(25); }
      } else if (own < 0) {
        _betaSimAssign(pi, panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      State._betaFCell = panel.key;
      _betaSimDraw(); _betaSimRenderPorts();
    }
    State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
    betaRenderSum(); saveState();
  }

  const sig = { signal: ctrl.signal, passive: false };
  ncv.addEventListener('mousedown',   onDown, sig);
  ncv.addEventListener('mousemove',   onMove, sig);
  ncv.addEventListener('mouseup',     onUp,   sig);
  ncv.addEventListener('mouseleave',  cl,     sig);
  ncv.addEventListener('touchstart',  onDown, sig);
  ncv.addEventListener('touchmove',   onMove, sig);
  ncv.addEventListener('touchend',    onUp,   sig);
  ncv.addEventListener('touchcancel', cl,     { signal: ctrl.signal, passive: true });
}
export {
  betaApplyArea, betaSetMode, betaRender, betaDrawEdit,
  betaSaveGuideImage, betaRenderZoneList, betaSelectZone, betaDeleteZone, betaEditZone,
  betaShowCfgPanel, betaCfgApply, betaCfgCancel,
  betaAttachEditEv, betaDrawLan, betaDrawPwr,
  betaAddPwrPort, betaRemovePwrPort, betaRenderPwrPorts,
  betaSetSimTab, betaRenderLanUI, betaRenderPorts, betaRenderSum, betaRenderLeg,
  betaAssign, betaDeassign, betaRstPort, betaRstPwrPort, betaRstAllPorts,
  betaEnterFull, betaExitFull, betaReset,
  betaAutoAssign, betaAutoAssignPwr, betaAttachLanEv,
  betaPanels, setBetaSpare,
};


