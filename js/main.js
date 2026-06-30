import { State } from './constants.js';
import {} from './utils.js';
import { renderCL, tog, clearAllChecks, openChkResetChoice, closeChkResetChoice, _doChkResetSoft, _doChkResetFull, addItem, delItem, saveChkPng, _saveChkLayout, attachCLDragEvents, _toggleCINote, _onCINote } from './checklist.js';
import { swTab, _updateBarForTab, _onVersionTap, openTutorial, closeTutorial, closeEaster, closeEasterBg, _tutorialPrev, _tutorialNext } from './tabs.js';
import { openModal, closeModal, closeModalBg, dl, dateStr, _cvToUrl, showPreview, closePreviewModal, closePreview, confirmDownload, shareImage, showResPreview, selectResVersion, openConfirm, closeConfirm, closeConfirmBg, tryResetAll, _histBack, _consumeProgrammaticBack } from './modal.js';
import { getAppState, loadAppState, saveState, loadState, deleteState, renderSaveList, openSaveModal, closeSaveModal, closeSaveBg } from './storage.js';
import { calcInput, calcDot, calcOper, calcEquals, calcClear, calcDel, toggleCalc } from './calculator.js';
import { vmixLoad, vmixApplyWide, vmixApplyWideSelected, vmixDownload, vmixResetAR, vmixResetPos, vmixResetVI, vmixResetSplit, vmixSwitchTab, vmixSetArCat, vmixSetPosCat, vmixSetLayerCat, vmixRenderArList, vmixRenderPosList, vmixRenderLayerPane, vmixRenderSplitPane, vmixAutoSplit, vmixCreateVirtuals, vmixFullReset, vmixCopyPos, vmixTogglePosAll, vmixPasteToSelected, vmixToggleLayerCard, vmixLayerNameSearch, vmixLayerNumSearch, vmixUpdateLayer, vmixLayerNumChange, vmixLayerSelChange, vmixResetLayers, vmixRenderVIPane, vmixUpdateVIOverlay, vmixVILayerNumChange, vmixVILayerSelChange, vmixSetSplitCat, openVmixSaveModal, closeVmixSaveModal, closeVmixSaveBg } from './vmix.js';
import { openSchedModal, closeSchedModal, _schedBgClick, _schedOpenSettings } from './schedule.js';
import { betaApplyArea, betaSetMode, betaRender, betaDrawEdit, betaSaveGuideImage, betaRenderZoneList, betaSelectZone, betaDeleteZone, betaEditZone, betaShowCfgPanel, betaCfgApply, betaCfgCancel, betaAttachEditEv, betaDrawLan, betaDrawPwr, betaAddPwrPort, betaRemovePwrPort, betaRenderPwrPorts, betaSetSimTab, betaRenderLanUI, betaRenderPorts, betaRenderSum, betaRenderLeg, betaAssign, betaDeassign, betaRstPort, betaRstPwrPort, betaRstAllPorts, betaEnterFull, betaExitFull, betaReset, betaAutoAssign, betaAutoAssignPwr, betaAttachLanEv, betaPanels, setBetaSpare, _betaSendToggle, _betaCfgSelLed, _betaCfgSelPanel, _betaSimDraw } from './led-design.js';

// HTML onclick 핸들러에서 접근 가능하도록 window에 노출
Object.assign(window, {
  // checklist
  renderCL, tog, clearAllChecks, openChkResetChoice, closeChkResetChoice,
  _doChkResetSoft, _doChkResetFull, addItem, delItem, saveChkPng,
  _toggleCINote, _onCINote,
  // tabs
  swTab, _onVersionTap, openTutorial, closeTutorial,
  closeEaster, closeEasterBg, _tutorialPrev, _tutorialNext,
  // modal
  openModal, closeModal, closeModalBg,
  showPreview, closePreviewModal, closePreview, confirmDownload, shareImage,
  showResPreview, selectResVersion,
  openConfirm, closeConfirm, closeConfirmBg, tryResetAll,
  // storage
  saveState, loadState, deleteState, openSaveModal, closeSaveModal, closeSaveBg,
  // calculator
  calcInput, calcDot, calcOper, calcEquals, calcClear, calcDel, toggleCalc,
  // vmix
  vmixLoad, vmixApplyWide, vmixApplyWideSelected, vmixDownload,
  vmixResetAR, vmixResetPos, vmixResetVI, vmixResetSplit, vmixFullReset,
  vmixSwitchTab, vmixSetArCat, vmixSetPosCat, vmixSetLayerCat,
  vmixRenderArList, vmixRenderPosList, vmixRenderLayerPane, vmixRenderSplitPane,
  vmixAutoSplit, vmixCreateVirtuals,
  vmixCopyPos, vmixTogglePosAll, vmixPasteToSelected,
  vmixToggleLayerCard, vmixLayerNameSearch, vmixLayerNumSearch,
  vmixUpdateLayer, vmixLayerNumChange, vmixLayerSelChange, vmixResetLayers,
  vmixRenderVIPane, vmixUpdateVIOverlay, vmixVILayerNumChange, vmixVILayerSelChange,
  vmixSetSplitCat,
  openVmixSaveModal, closeVmixSaveModal, closeVmixSaveBg,
  // schedule
  openSchedModal, closeSchedModal, _schedBgClick, _schedOpenSettings,
  // led-design
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
  _betaSendToggle, _betaCfgSelLed, _betaCfgSelPanel, _betaSimDraw,
  // State 직접 참조 (innerHTML onclick에서 State.xxx 사용)
  State,
});

// popstate 핸들러 (modal.js에서 이동 — 모든 모듈이 로드된 후 등록)
window.addEventListener('popstate', () => {
  if (_consumeProgrammaticBack()) { return; }
  const overlays = [
    { id: 'chkResetChoiceBg', fn: closeChkResetChoice },
    { id: 'confirmBg',         fn: closeConfirm },
    { id: 'betaFullOverlay',   fn: betaExitFull },
    { id: 'modalBg',           fn: closeModal },
    { id: 'previewBg',         fn: closePreviewModal },
    { id: 'tutorialBg',        fn: closeTutorial },
    { id: 'easterBg',          fn: closeEaster },
    { id: 'saveBg',            fn: closeSaveModal },
    { id: 'vmixSaveBg',        fn: closeVmixSaveModal },
    { id: 'schedBg',           fn: closeSchedModal },
  ];
  for (const { id, fn } of overlays) {
    const el = document.getElementById(id);
    if (el && el.style.display !== 'none') { fn(); return; }
  }
  const calc = document.getElementById('calcPanel');
  if (calc && calc.style.display !== 'none') { calc.style.display = 'none'; }
});

// 앱 초기화 (ES 모듈은 defer 기본 — DOM 파싱 완료 후 실행)
renderCL();
_updateBarForTab('beta');
betaRender();
