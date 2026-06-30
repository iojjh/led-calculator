import { State } from './constants.js';
import { renderCL, _saveChkLayout } from './checklist.js';
import { _histBack } from './modal.js';


// ── §8  저장 / 불러오기 (localStorage) ───────────────────

// 현재 앱 전체 상태를 직렬화 가능한 객체로 반환
function getAppState(name) {
  return {
    name,
    date: new Date().toLocaleDateString('ko-KR'),
    memoList: [...State.memoList],
    chkState: { ...State.chkState },
    chkNotes: { ...State.chkNotes },
    COM:  [...State.COM],
    COND: [...State.COND],
    betaAreaW:    State.betaAreaW,
    betaAreaH:    State.betaAreaH,
    betaZones:    State.betaZones,
    betaMode:     State.betaMode,
    betaPorts:    State.betaPorts.map(s => [...s]),
    betaPH2:      State.betaPH2.map(a => [...a]),
    betaAPort:    State.betaAPort,
    betaSimTab:   State.betaSimTab,
    betaPwrPorts: State.betaPwrPorts.map(s => [...s]),
    betaPwrPH2:   State.betaPwrPH2.map(a => [...a]),
    betaPwrAPort: State.betaPwrAPort,
    betaSpareAdj: { ...State.betaSpareAdj },
    lanExpanded:  State.lanExpanded,
    betaImport:   State.betaImport || null,
  };
}

// 저장된 상태 객체를 앱에 복원
function loadAppState(st) {
  // 체크리스트 복원
  if (st.COM) { State.COM = [...st.COM]; }
  if (st.COND) { State.COND = [...st.COND]; }
  Object.keys(State.chkState).forEach(k => delete State.chkState[k]);
  Object.keys(State.chkNotes).forEach(k => delete State.chkNotes[k]);
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = st.chkState?.[n] ?? false; });
  if (st.chkNotes) { Object.assign(State.chkNotes, st.chkNotes); }
  renderCL(); _saveChkLayout();

  State.memoList = st.memoList || [];

  // 혼합 시뮬레이터 β 복원
  State.lanExpanded = !!(st.lanExpanded);
  if (st.betaZones) {
    State.betaAreaW    = st.betaAreaW || 0;
    State.betaAreaH    = st.betaAreaH || 0;
    State.betaZones    = st.betaZones;
    State.betaMode     = st.betaMode || 'edit';
    State.betaPorts    = st.betaPorts ? st.betaPorts.map(a => new Set(a)) : Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = st.betaPH2   ? st.betaPH2.map(a => [...a])       : Array.from({ length: 16 }, () => []);
    State.betaAPort    = st.betaAPort || 0;
    State.betaSimTab   = st.betaSimTab || 'lan';
    State.betaPwrPorts = st.betaPwrPorts ? st.betaPwrPorts.map(a => new Set(a)) : Array.from({ length: 18 }, () => new Set());
    State.betaPwrPH2   = st.betaPwrPH2   ? st.betaPwrPH2.map(a => [...a])       : Array.from({ length: 18 }, () => []);
    State.betaPwrAPort = st.betaPwrAPort || 0;
    State.betaSpareAdj = st.betaSpareAdj ? { l1: 2, sl: 20, c1: 2, sp: 20, ...st.betaSpareAdj } : { l1: 2, sl: 20, c1: 2, sp: 20 };
    State._betaCache   = null;
  }
  State.betaImport = st.betaImport || null;
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
  if (saves[idx]) {
    loadAppState(saves[idx]);
    closeSaveModal();
    if (document.getElementById('tab-beta')?.classList.contains('on')) { betaRender(); }
  }
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
    el.innerHTML = '<div class="empty-msg">저장된 데이터가 없습니다</div>';
    return;
  }
  el.innerHTML = saves.map((s, i) => `
    <div class="save-item">
      <div>
        <div class="si-label">${s.name}</div>
        <div class="si-date">${s.date}</div>
      </div>
      <div class="si-actions">
        <button class="si-btn" onclick="loadState(${i})">불러오기</button>
        <button class="si-btn" style="background:#E24B4A;" onclick="deleteState(${i})">삭제</button>
      </div>
    </div>`).join('');
}
function openSaveModal()  { renderSaveList(); history.pushState({ overlay: 'save' }, ''); document.getElementById('saveBg').style.display = 'flex'; }
function closeSaveModal() { document.getElementById('saveBg').style.display = 'none'; if (history.state && history.state.overlay === 'save') { _histBack(); } }
function closeSaveBg(e) { if (e.target === document.getElementById('saveBg')) closeSaveModal(); }
export { getAppState, loadAppState, saveState, loadState, deleteState, renderSaveList, openSaveModal, closeSaveModal, closeSaveBg };


