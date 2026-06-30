import { State } from './constants.js';
import { betaReset } from './led-design.js';



// ── §7  확인 다이얼로그 & 전체 초기화 ────────────────────

function openModal() {
  const opt = document.getElementById('pngPwrOpt');
  if (opt) { opt.style.display = 'flex'; }
  history.pushState({ overlay: 'modal' }, '');
  document.getElementById('modalBg').style.display = 'flex';
}
function closeModal()    { document.getElementById('modalBg').style.display = 'none'; if (history.state && history.state.overlay === 'modal') { _histBack(); } }
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

let pendingDownload = null; // { url, filename }
let _resVersions = null; // { normal, wm } — 해상도 이미지 이중 버전
let _blobUrls = []; // 미리보기용 blob URL, 닫을 때 일괄 revoke

function _cvToUrl(cv) {
  return new Promise((ok, err) => cv.toBlob(b => {
    if (!b) { err(new Error('toBlob failed')); return; }
    const u = URL.createObjectURL(b);
    _blobUrls.push(u);
    ok(u);
  }, 'image/png'));
}

function showPreview(url, filename) {
  pendingDownload = { url, filename };
  document.getElementById('previewImg').src = url;
  history.pushState({ overlay: 'preview' }, '');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}
function closePreviewModal() {
  document.getElementById('previewBg').style.display = 'none';
  pendingDownload = null;
  _resVersions = null;
  _blobUrls.forEach(u => URL.revokeObjectURL(u)); _blobUrls = [];
  document.getElementById('previewImg').src = '';
  document.getElementById('resVersionTabs').style.display = 'none';
  if (history.state && history.state.overlay === 'preview') { _histBack(); }
}
function closePreview(e) {
  if (e.target === document.getElementById('previewBg')) { closePreviewModal(); }
}
function confirmDownload() {
  if (pendingDownload) { dl(pendingDownload.url, pendingDownload.filename); }
  closePreviewModal();
}

// 공유 — Web Share API 사용 (모바일에서 다른 앱으로 전달)
async function shareImage() {
  if (!pendingDownload) { return; }
  try {
    const res = await fetch(pendingDownload.url);
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


// 범용 확인 팝업 — title·msg 표시 후 확인 시 onOk() 호출
function openConfirm(title, msg, onOk) {
  const bg = document.getElementById('confirmBg');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOk').onclick = () => { closeConfirm(); onOk(); };
  // 전체모드 오버레이 활성 시 confirmBg를 그 안으로 이동해야 보임
  const fsEl = document.getElementById('betaFullOverlay');
  if (fsEl && fsEl.style.display !== 'none') { fsEl.appendChild(bg); }
  history.pushState({ overlay: 'confirm' }, '');
  bg.style.display = 'flex';
}
function closeConfirm() {
  const bg = document.getElementById('confirmBg');
  bg.style.display = 'none';
  if (bg.parentElement !== document.body) { document.body.appendChild(bg); }
  if (history.state && history.state.overlay === 'confirm') { _histBack(); }
}
function closeConfirmBg(e) { if (e.target === document.getElementById('confirmBg')) closeConfirm(); }

function tryResetAll() {
  openConfirm('전체 초기화', 'LED 설계 탭의 모든 설정을 초기화할까요?', betaReset);
}

let _programmaticBack = false;
function _histBack() { _programmaticBack = true; history.back(); }
function _consumeProgrammaticBack() { const v = _programmaticBack; _programmaticBack = false; return v; }

function showResPreview(baseUrl, wmUrl, filename) {
  _resVersions = { normal: { url: baseUrl, filename } };
  if (wmUrl) { _resVersions.wm = { url: wmUrl, filename: filename.replace('.png', '_WM.png') }; }
  document.getElementById('tabWm').style.display       = '';
  document.getElementById('tabSecRes').style.display   = 'none';
  document.getElementById('tabWmSecRes').style.display = 'none';
  document.getElementById('resVersionTabs').style.display = wmUrl ? 'block' : 'none';
  selectResVersion('normal');
  history.pushState({ overlay: 'preview' }, '');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}

function selectResVersion(v) {
  if (!_resVersions || !_resVersions[v]) { return; }
  pendingDownload = _resVersions[v];
  document.getElementById('previewImg').src = pendingDownload.url;
  ['normal','wm','secRes','wmSecRes'].forEach(t => {
    const el = document.getElementById('tab' + t[0].toUpperCase() + t.slice(1));
    if (el) { el.classList.toggle('active', t === v); }
  });
}
export { openModal, closeModal, closeModalBg, dl, dateStr, _cvToUrl, showPreview, closePreviewModal, closePreview, confirmDownload, shareImage, showResPreview, selectResVersion, openConfirm, closeConfirm, closeConfirmBg, tryResetAll, _histBack, _consumeProgrammaticBack };




