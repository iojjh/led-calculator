import { State, DEFAULT_COM, DEFAULT_COND, TUTORIAL_IMAGES } from './constants.js';
import { _toast } from './utils.js';
import { showPreview, _cvToUrl, openConfirm, dateStr, _histBack } from './modal.js';
import { saveState } from './storage.js';


// ── §2  장비 체크리스트 ───────────────────────────────────

// 체크리스트 전체 렌더링
function renderCL() {
  function mk(n, sec, idx) {
    const d = State.chkState[n];
    const note = State.chkNotes[n] || '';
    const safe = n.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeNote = note.replace(/"/g, '&quot;');
    const hasNote = note.length > 0;
    return `<div class="ci${d ? ' done' : ''}${hasNote ? ' has-note' : ''}" draggable="true" data-sec="${sec}" data-idx="${idx}">
      <div class="ci-main" onclick="tog('${safe}')">
        <span class="ci-drag-handle" onclick="event.stopPropagation()">⠿</span>
        <input type="checkbox"${d ? ' checked' : ''} onclick="event.stopPropagation();tog('${safe}')">
        <span class="cil">${n}</span>
        <button class="ci-note-btn" onclick="event.stopPropagation();_toggleCINote(this)" title="메모">✎</button>
        <button class="del-btn" onclick="event.stopPropagation();delItem('${safe}')">×</button>
      </div>
      <input class="ci-note-input" type="text" placeholder="메모 (종류, 수량, 길이...)" value="${safeNote}" data-name="${safe}" oninput="_onCINote(this)" onclick="event.stopPropagation()">
    </div>`;
  }
  document.getElementById('commonList').innerHTML = State.COM.map((n, i) => mk(n, 'common', i)).join('');
  document.getElementById('condList').innerHTML = State.COND.map((n, i) => mk(n, 'cond', i)).join('');
  attachCLDragEvents();

  const all = State.COM.length + State.COND.length;
  const done = Object.values(State.chkState).filter(Boolean).length;
  document.getElementById('progFill').style.width = (all ? Math.round(done / all * 100) : 0) + '%';
  document.getElementById('progTxt').textContent = done + ' / ' + all;
}
function tog(n) { State.chkState[n] = !State.chkState[n]; renderCL(); _saveChkLayout(); }
function clearAllChecks() { Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; }); renderCL(); _saveChkLayout(); }
function openChkResetChoice() { history.pushState({ overlay: 'chkReset' }, ''); document.getElementById('chkResetChoiceBg').style.display = 'flex'; }
function closeChkResetChoice() { document.getElementById('chkResetChoiceBg').style.display = 'none'; if (history.state && history.state.overlay === 'chkReset') { _histBack(); } }
function _doChkResetSoft() {
  Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; });
  Object.keys(State.chkNotes).forEach(k => { delete State.chkNotes[k]; });
  renderCL(); _saveChkLayout(); closeChkResetChoice();
}
function _doChkResetFull() {
  State.COM = [...DEFAULT_COM]; State.COND = [...DEFAULT_COND];
  Object.keys(State.chkState).forEach(k => { delete State.chkState[k]; });
  Object.keys(State.chkNotes).forEach(k => { delete State.chkNotes[k]; });
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = false; });
  renderCL(); _saveChkLayout(); closeChkResetChoice();
}
function delItem(n) {
  openConfirm('장비 제거', '장비 목록에서 제거하시겠습니까?', () => {
    const ci = State.COM.indexOf(n), di = State.COND.indexOf(n);
    if (ci >= 0) { State.COM.splice(ci, 1); } else { if (di >= 0) State.COND.splice(di, 1); }
    delete State.chkState[n];
    renderCL(); _saveChkLayout();
  });
}
function addItem(section) {
  const inp = document.getElementById('add-' + section);
  const name = inp.value.trim();
  if (!name) { return; }
  if (section === 'common') { if (!State.COM.includes(name))  { State.COM.push(name);  State.chkState[name] = false; } }
  else                      { if (!State.COND.includes(name)) { State.COND.push(name); State.chkState[name] = false; } }
  inp.value = '';
  renderCL(); _saveChkLayout();
}
function _saveChkLayout() {
  localStorage.setItem('ledCalcChkCustom', JSON.stringify({ COM: State.COM, COND: State.COND, chkState: State.chkState, chkNotes: State.chkNotes }));
}
function _toggleCINote(btn) {
  const ci = btn.closest('.ci');
  ci.classList.toggle('note-open');
  if (ci.classList.contains('note-open')) { ci.querySelector('.ci-note-input').focus(); }
}
function _onCINote(el) {
  const name = el.dataset.name;
  if (el.value) { State.chkNotes[name] = el.value; } else { delete State.chkNotes[name]; }
  el.closest('.ci').classList.toggle('has-note', !!el.value);
  _saveChkLayout();
}

function attachCLDragEvents() {
  let dragEl = null;

  const onTouchMove = e => {
    if (!dragEl) { return; }
    e.preventDefault();
    const t = e.touches[0];
    dragEl.style.pointerEvents = 'none';
    const target = document.elementFromPoint(t.clientX, t.clientY)?.closest('.ci[data-sec]');
    dragEl.style.pointerEvents = '';
    document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
    if (target && target !== dragEl && target.dataset.sec === dragEl.dataset.sec) {
      target.classList.add('drag-over');
    }
  };
  const onTouchEnd = () => {
    if (!dragEl) { return; }
    dragEl.classList.remove('dragging');
    const target = document.querySelector('.ci.drag-over');
    document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
    if (target) {
      const fromSec = dragEl.dataset.sec, fromIdx = +dragEl.dataset.idx;
      const toSec   = target.dataset.sec, toIdx   = +target.dataset.idx;
      if (fromSec === toSec && fromIdx !== toIdx) {
        const arr = fromSec === 'common' ? State.COM : State.COND;
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        renderCL(); _saveChkLayout();
      }
    }
    dragEl = null;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  document.querySelectorAll('.ci[data-sec]').forEach(el => {
    // 데스크톱 HTML5 DnD
    el.addEventListener('dragstart', e => {
      dragEl = el;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      if (dragEl) { dragEl.classList.remove('dragging'); dragEl = null; }
      document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragEl || dragEl === el || dragEl.dataset.sec !== el.dataset.sec) { return; }
      document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
      el.classList.add('drag-over');
    });
    el.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragEl || dragEl === el) { return; }
      const fromSec = dragEl.dataset.sec, fromIdx = +dragEl.dataset.idx;
      const toSec   = el.dataset.sec,     toIdx   = +el.dataset.idx;
      if (fromSec !== toSec) { return; }
      const arr = fromSec === 'common' ? State.COM : State.COND;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      renderCL(); _saveChkLayout();
    });

    // 모바일 터치 — 핸들에서만 시작
    const handle = el.querySelector('.ci-drag-handle');
    if (!handle) { return; }
    handle.addEventListener('touchstart', e => {
      e.preventDefault();
      dragEl = el;
      el.classList.add('dragging');
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: false });
  });
}
renderCL();
// beta 탭이 기본 탭이므로 초기 렌더링 및 하단 바 설정
document.addEventListener('DOMContentLoaded', () => { _updateBarForTab('beta'); betaRender(); });



async function saveChkPng() {
  const filter = arr => arr.filter(n => State.chkState[n] || State.chkNotes[n]);
  const comItems = filter(State.COM);
  const condItems = filter(State.COND);
  if (!comItems.length && !condItems.length) { return; }

  const row = n => {
    const checked = State.chkState[n];
    const note = State.chkNotes[n] || '';
    return `<div class="chk-row">
      <span style="font-size:15px;color:${checked ? '#0F6E56' : '#bbb'};flex-shrink:0;margin-top:1px;">${checked ? '✓' : '○'}</span>
      <div class="chk-row-body">
        <div class="chk-row-name" style="color:${checked ? '#1a1a1a' : '#666'};">${n}</div>
        ${note ? `<div class="chk-row-note">${note}</div>` : ''}
      </div>
    </div>`;
  };
  const sec = (label, items) => items.length === 0 ? '' :
    `<div class="chk-section-label">${label}</div>${items.map(row).join('')}`;

  const all = State.COM.length + State.COND.length;
  const done = Object.values(State.chkState).filter(Boolean).length;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;box-sizing:border-box;';
  wrap.innerHTML = `
    <div class="chk-png-hdr">
      <div class="chk-png-title">장비 체크리스트</div>
      <div class="chk-png-date">${new Date().toLocaleDateString('ko-KR')}</div>
    </div>
    <div class="chk-png-bar"></div>
    <div class="chk-png-progress">${done} / ${all} 완료</div>
    ${sec('공통 장비', comItems)}${sec('현장 상황별 장비', condItems)}
    <div class="chk-png-footer"></div>`;
  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    showPreview(await _cvToUrl(canvas), 'LED_체크리스트_' + dateStr() + '.png');
  } finally {
    document.body.removeChild(wrap);
  }
}
export { renderCL, tog, clearAllChecks, openChkResetChoice, closeChkResetChoice, _doChkResetSoft, _doChkResetFull, addItem, delItem, saveChkPng, _saveChkLayout, attachCLDragEvents };


