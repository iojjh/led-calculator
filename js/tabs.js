import { State, APP_VERSION, APP_SW_VERSION, CHANGELOG, TUTORIAL_IMAGES } from './constants.js';
import { _toast } from './utils.js';
import { saveState, loadAppState } from './storage.js';
import { _histBack } from './modal.js';

// ── §4  탭 전환 & 버전 표시 ──────────────────────────────

const _TAB_ORDER = ['beta', 'chk', 'vmix'];

function swTab(id, btn) {
  const prev = document.querySelector('.tab-page.on');
  const next = document.getElementById('tab-' + id);
  if (prev === next) { return; }

  const fromIdx = prev ? _TAB_ORDER.indexOf(prev.id.replace('tab-', '')) : -1;
  const goRight = _TAB_ORDER.indexOf(id) > fromIdx;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  _updateBarForTab(id);

  if (prev) {
    prev.classList.add(goRight ? 'slide-exit-l' : 'slide-exit-r');
    prev.addEventListener('animationend', () => {
      prev.classList.remove('on', 'slide-exit-l', 'slide-exit-r');
    }, { once: true });
  }

  next.classList.add('on', goRight ? 'slide-enter-r' : 'slide-enter-l');
  if (id === 'beta') { betaRender(); }
  next.addEventListener('animationend', () => {
    next.classList.remove('slide-enter-r', 'slide-enter-l');
  }, { once: true });
}

function _updateBarForTab(id) {
  const btnReset = document.getElementById('btnBarReset');
  const btnMain  = document.getElementById('btnBarMain');
  const btnHelp  = document.getElementById('helpBtn');
  if (id === 'vmix') {
    btnReset.onclick = vmixFullReset;
    btnReset.title = 'vMix 초기화';
    btnMain.textContent = '수정된 .vmix 저장';
    btnMain.onclick = openVmixSaveModal;
    btnMain.disabled = !_vmixAnyChanged();
  } else if (id === 'chk') {
    btnReset.onclick = openChkResetChoice;
    btnReset.title = '체크리스트 초기화';
    btnMain.textContent = 'PNG 저장';
    btnMain.onclick = openModal;
    btnMain.disabled = false;
  } else if (id === 'beta') {
    btnReset.onclick = betaReset;
    btnReset.title = '혼합 시뮬 초기화';
    btnMain.textContent = '일정';
    btnMain.onclick = () => openSchedModal('beta');
    btnMain.disabled = false;
  }
  if (id === 'chk' || id === 'vmix') {
    btnHelp.style.display = '';
    btnHelp.onclick = () => openTutorial(id);
  } else {
    btnHelp.style.display = 'none';
  }
}

function openTutorial(tabId) {
  const imgs = TUTORIAL_IMAGES[tabId];
  if (!imgs) { return; }
  State._tutImgs = imgs;
  if (!State._tutReady) { _tutAttachEvents(); State._tutReady = true; }
  _tutSetImg(0);
  history.pushState({ overlay: 'tutorial' }, '');
  document.getElementById('tutorialBg').style.display = 'flex';
}
function closeTutorial() {
  document.getElementById('tutorialBg').style.display = 'none';
  State._tutZoom = 1;
  const img = document.getElementById('tutImg');
  if (img) { img.style.transform = ''; }
  if (history.state && history.state.overlay === 'tutorial') { _histBack(); }
}
function _tutSetImg(idx) {
  State._tutIdx = idx;
  State._tutZoom = 1;
  const img = document.getElementById('tutImg');
  img.src = State._tutImgs[idx];
  img.style.transform = '';
  const n = State._tutImgs.length;
  document.getElementById('tutDots').innerHTML = State._tutImgs.map((_, i) =>
    `<span class="tut-dot${i === idx ? ' on' : ''}" onclick="_tutSetImg(${i})"></span>`
  ).join('');
  document.getElementById('tutPrev').style.visibility = idx > 0 ? '' : 'hidden';
  document.getElementById('tutNext').style.visibility = idx < n - 1 ? '' : 'hidden';
}
function _tutorialPrev() { if (State._tutIdx > 0) { _tutSetImg(State._tutIdx - 1); } }
function _tutorialNext() { if (State._tutIdx < State._tutImgs.length - 1) { _tutSetImg(State._tutIdx + 1); } }
function _tutAttachEvents() {
  const wrap = document.getElementById('tutImgWrap');
  let swipeX = null, pinchD = null, pinchZ = 1, lastTap = 0;
  wrap.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      pinchD = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      pinchZ = State._tutZoom; swipeX = null;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap < 300) { _tutSetImg(State._tutIdx); lastTap = 0; }
      else { lastTap = now; swipeX = e.touches[0].clientX; }
    }
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinchD !== null) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      State._tutZoom = Math.min(4, Math.max(1, pinchZ * d / pinchD));
      document.getElementById('tutImg').style.transform = `scale(${State._tutZoom})`;
    }
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    if (e.changedTouches.length === 1 && swipeX !== null && State._tutZoom <= 1.05) {
      const dx = e.changedTouches[0].clientX - swipeX;
      if (Math.abs(dx) > 50) { if (dx < 0) { _tutorialNext(); } else { _tutorialPrev(); } }
    }
    if (e.touches.length < 2) { pinchD = null; }
    if (e.touches.length === 0) { swipeX = null; }
  }, { passive: true });
}

document.getElementById('appVersion').textContent = 'v' + APP_VERSION;
(function() {
  const prev = localStorage.getItem('sw-app-version');
  if (prev && prev !== APP_VERSION) { sessionStorage.setItem('sw-just-updated', '1'); }
  localStorage.setItem('sw-app-version', APP_VERSION);
  if (sessionStorage.getItem('sw-just-updated')) {
    sessionStorage.removeItem('sw-just-updated');
    // script.js는 updateToast div보다 먼저 로드되므로 DOMContentLoaded 후 DOM 접근
    document.addEventListener('DOMContentLoaded', function() {
      const t  = document.getElementById('updateToast');
      const tc = document.getElementById('updateToastCard');
      if (!t || !tc) { return; }
      tc.textContent = 'v' + APP_VERSION + '으로 업데이트되었습니다';
      t.classList.add('show');
      setTimeout(() => { t.classList.remove('show'); }, 1750);
    });
  }
})();

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
    history.pushState({ overlay: 'easter' }, '');
    document.getElementById('easterBg').style.display = 'flex';
  } else {
    State._verTimer = setTimeout(() => { State._verTaps = 0; }, 1800);
  }
}
function closeEaster()    { document.getElementById('easterBg').style.display = 'none'; if (history.state && history.state.overlay === 'easter') { _histBack(); } }
function closeEasterBg(e) { if (e.target === document.getElementById('easterBg')) closeEaster(); }
export { swTab, _onVersionTap, _updateBarForTab, openTutorial, closeTutorial, closeEaster, closeEasterBg, _tutorialPrev, _tutorialNext };

