import { State } from './constants.js';
import { openConfirm, _histBack } from './modal.js';



// ── §12  vMix 소스 매크로 ────────────────────────────────

let _vmixRawText = '';   // 원본 raw 텍스트 (다운로드용, XMLSerializer 없이 직접 교체)
let _vmixDoc = null; // DOM (속성 읽기·커스텀 뱃지 표시용)
let _vmixFilename = '';
let _vmixCopiedKey = null;
let _vmixNewVIs = [];          // 새로 생성된 버츄얼 인풋 [{ key, parentKey, title, overlays:[k,k,k] }]
let _vmixSplitVIs = [];        // 자동 분할로 생성된 VI [{ key, parentKey, title, mainSlot }]
let _vmixPastedFrom = new Map();  // targetKey → 복사 원본 vmix 순번
let _vmixOrigText = '';         // 로드 시 원본 텍스트 보관 (초기화용)
let _vmixInputCount = 0;          // 원본 파일의 최상위 Input 수 (VI 순번 계산용)

const _VMIX_AR = { '0': '출력 비율', '1': '와이드스크린', '100': '원본' };
const _VMIX_CAT_COLORS = ['#2a2a2a','#cc1111','#117711','#dd6600','#7700aa','#00aadd','#0022bb'];

let _vmixSplitMainCat = '1';
let _vmixSplitSideCat = '2';
let _vmixSplitTmplCat = '3';

let _vmixArCat    = '0';
let _vmixPosCat   = '0';
let _vmixLayerCat = '0';

let _vmixLayerEdits = new Map();    // key → true (레이어 편집된 소스 추적)
let _vmixLayerExpanded = new Set(); // 펼쳐진 카드 key 집합
let _vmixLayerNameSearch = '';      // 레이어 설정 탭 이름 검색어
let _vmixLayerNumSearch = '';       // 레이어 설정 탭 번호 검색어

function vmixLoad(file) {
  if (!file) { return; }
  _vmixFilename = file.name;
  _vmixCopiedKey = null;
  _vmixNewVIs = [];
  _vmixSplitVIs = [];
  _vmixArCat = '0'; _vmixPosCat = '0'; _vmixLayerCat = '0';
  _vmixSplitMainCat = '1'; _vmixSplitSideCat = '2'; _vmixSplitTmplCat = '3';
  _vmixLayerEdits = new Map(); _vmixLayerExpanded = new Set(); _vmixLayerNameSearch = ''; _vmixLayerNumSearch = '';
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
    vmixRenderLayerPane();
    vmixRenderSplitPane();
    document.getElementById('vmixSourceCard').style.display = 'block';
    _vmixUpdateSaveBtn();
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
  _vmixUpdateSaveBtn();
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
  _vmixUpdateSaveBtn();
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
  _vmixUpdateSaveBtn();
}

// 자동 분할 초기화 (생성된 분할 VI 삭제)
function vmixResetSplit() {
  if (_vmixSplitVIs.length > 0) {
    const splitKeys = new Set(_vmixSplitVIs.map(v => v.key));
    const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
    let skipNext = false;
    const filtered = _vmixRawText.split(eol).filter(line => {
      if (skipNext) { skipNext = false; return false; }
      for (const key of splitKeys) {
        if (line.includes(`Key="${key}"`)) {
          if (!line.trimEnd().endsWith('/>')) { skipNext = true; }
          return false;
        }
      }
      return true;
    });
    _vmixRawText = filtered.join(eol);
    _vmixSplitVIs = [];
  }
  vmixRenderSplitPane();
  _vmixUpdateSaveBtn();
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
  document.getElementById('vmix-pane-ar').style.display = id === 'ar'    ? '' : 'none';
  document.getElementById('vmix-pane-pos').style.display = id === 'pos'   ? '' : 'none';
  document.getElementById('vmix-pane-vi').style.display = id === 'vi'    ? '' : 'none';
  document.getElementById('vmix-pane-split').style.display = id === 'split' ? '' : 'none';
  const resetFns = { ar: vmixResetAR, pos: vmixResetPos, vi: vmixResetLayers, split: vmixResetSplit };
  document.getElementById('vmixSubReset').onclick = resetFns[id];
}

function _vmixFilterByCat(inputs, cat) {
  if (cat === '0') { return inputs; }
  return inputs.filter(i => i.getAttribute('Category') === cat);
}

function _vmixCatSwatchHtml(selCat, onclickFn) {
  const swatches = _VMIX_CAT_COLORS.map((color, i) =>
    `<div class="vmix-cat-swatch${String(i) === selCat ? ' sel' : ''}" style="background:${color};"
      onclick="${onclickFn}('${i}')">${i}</div>`
  ).join('');
  return `<div class="vmix-cat-swatches" style="margin-bottom:10px;">${swatches}</div>`;
}

function vmixSetArCat(cat)    { _vmixArCat    = cat; vmixRenderArList(); }
function vmixSetPosCat(cat)   { _vmixPosCat   = cat; vmixRenderPosList(); }
function vmixSetLayerCat(cat) { _vmixLayerCat = cat; vmixRenderLayerPane(); }

function vmixRenderArList() {
  const allInputs = _vmixInputs();
  const inputs = _vmixFilterByCat(allInputs, _vmixArCat);
  const rows = inputs.map(inp => {
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
  document.getElementById('vmixArList').innerHTML = _vmixCatSwatchHtml(_vmixArCat, 'vmixSetArCat') + rows;
}

function vmixRenderPosList() {
  const inputs = _vmixFilterByCat(_vmixInputs(), _vmixPosCat);
  const hasCopied = _vmixCopiedKey !== null;
  const header = hasCopied ? `<div class="vmix-action-bar" style="margin-top:0;padding-top:0;border-top:none;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #f0f0f0;">
    <label class="vmix-selall-wrap"><input type="checkbox" id="vmixPosSelAll" onchange="vmixTogglePosAll(this.checked)"><span>전체 선택</span></label>
    <button class="vmix-act-btn accent vmix-paste-btn" onclick="vmixPasteToSelected()">선택 항목에 붙여넣기</button>
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
    if (pastedFrom !== undefined) { badge = `<span class="vmix-pos-badge pasted">← ${pastedFrom}번</span>`; } else if (hasCustom) { badge = `<span class="vmix-pos-badge custom">커스텀</span>`; } else { badge = `<span class="vmix-pos-badge"></span>`; }
    return `<div class="vmix-source-row">
      ${cbCell}
      <span class="vmix-num">${_vmixNum(inp)}</span>
      <span class="vmix-source-name" title="${title}">${title}</span>
      ${badge}
      <button class="vmix-btn${isCopied ? ' is-copied' : ''}" onclick="vmixCopyPos('${key}')">${isCopied ? '📋 복사됨' : '포지션 복사'}</button>
    </div>`;
  }).join('');
  document.getElementById('vmixPosList').innerHTML = _vmixCatSwatchHtml(_vmixPosCat, 'vmixSetPosCat') + header + rows;
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
  _vmixUpdateSaveBtn();
}

function vmixApplyWide() {
  _vmixInputs().forEach(inp => inp.setAttribute('AspectRatio', '1'));
  _vmixRawText = _vmixRawText.replace(/AspectRatio="100"/g, 'AspectRatio="1"');
  vmixRenderArList();
  _vmixUpdateSaveBtn();
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
    _vmixUpdateSaveBtn();
  });
}

// ── 버츄얼 인풋 생성 ─────────────────────────────────────

function _vmixGenUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function vmixToggleLayerCard(key) {
  const layerEl = document.getElementById(`vlayers-${key}`);
  const arrowEl = document.getElementById(`varrow-${key}`);
  if (!layerEl) { return; }
  const isOpen = layerEl.style.display !== 'none';
  layerEl.style.display = isOpen ? 'none' : '';
  if (arrowEl) { arrowEl.textContent = isOpen ? '▶' : '▼'; }
  if (isOpen) { _vmixLayerExpanded.delete(key); } else { _vmixLayerExpanded.add(key); }
}

function vmixRenderLayerPane() {
  const pane = document.getElementById('vmix-pane-vi');
  if (!pane) { return; }
  if (!_vmixDoc) { pane.innerHTML = ''; return; }
  const allInputs = _vmixInputs();
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const nameTerm = _vmixLayerNameSearch.trim().toLowerCase();
  const numTerm = _vmixLayerNumSearch.trim();
  const catFiltered = _vmixFilterByCat(allInputs, _vmixLayerCat);
  const filtered = catFiltered.filter(i => {
    const nameOk = !nameTerm || i.getAttribute('OriginalTitle').toLowerCase().includes(nameTerm);
    const numOk  = !numTerm  || String(_vmixNum(i)) === numTerm;
    return nameOk && numOk;
  });
  const baseOpts = allInputs.map(i =>
    `<option value="${i.getAttribute('Key')}">${_vmixNum(i)}. ${i.getAttribute('OriginalTitle')}</option>`
  ).join('');
  const cards = filtered.map(inp => {
    const key = inp.getAttribute('Key');
    const title = inp.getAttribute('OriginalTitle');
    const isEdited = _vmixLayerEdits.has(key);
    const layers = [0, 1, 2].map(slot => {
      const rawOv = inp.getAttribute(`Overlay${slot}`) || '';
      const curKey = (rawOv && rawOv !== nullUUID) ? rawOv : '';
      const curRef = curKey ? allInputs.find(i => i.getAttribute('Key') === curKey) : null;
      const curNum = curRef ? _vmixNum(curRef) : '';
      const opts = '<option value="">없음</option>' +
        (curKey ? baseOpts.replace(`value="${curKey}"`, `value="${curKey}" selected`) : baseOpts);
      return `<div class="vmix-vi-layer-row">
        <span class="vmix-vi-layer-label">레이어 ${slot + 1}</span>
        <input type="number" class="vmix-vi-layer-num" id="ln-${key}-${slot}"
          min="1" value="${curNum}" placeholder="-"
          onchange="vmixLayerNumChange('${key}',${slot},this)">
        <select class="vmix-vi-layer-sel" id="ls-${key}-${slot}"
          onchange="vmixLayerSelChange('${key}',${slot},this)">${opts}</select>
      </div>`;
    }).join('');
    const badge = isEdited
      ? `<span class="vmix-vi-parent-tag vmix-tag-modified">수정됨</span>` : '';
    const isExpanded = _vmixLayerExpanded.has(key);
    return `<div class="vmix-vi-card">
      <div class="vmix-vi-card-header" style="cursor:pointer;" onclick="vmixToggleLayerCard('${key}')">
        <span class="vmix-num">${_vmixNum(inp)}</span>
        <span class="vmix-vi-card-title">${title}</span>
        ${badge}
        <span id="varrow-${key}" class="vmix-expand-arrow">${isExpanded ? '▼' : '▶'}</span>
      </div>
      <div id="vlayers-${key}" class="vmix-vi-layers" style="display:${isExpanded ? '' : 'none'};">${layers}</div>
    </div>`;
  }).join('');
  const emptyMsg = filtered.length === 0
    ? `<div class="empty-msg">검색 결과 없음</div>` : '';
  pane.innerHTML = _vmixCatSwatchHtml(_vmixLayerCat, 'vmixSetLayerCat') +
    `<div class="vmix-search-row">
    <input type="number" class="vmix-layer-search" style="width:72px;" placeholder="번호"
      value="${_vmixLayerNumSearch}" oninput="vmixLayerNumSearch(this.value)">
    <input type="text" class="vmix-layer-search" style="flex:1;" placeholder="이름 검색..."
      value="${_vmixLayerNameSearch.replace(/"/g, '&quot;')}" oninput="vmixLayerNameSearch(this.value)">
  </div>${cards ? `<div class="vmix-vi-list">${cards}</div>` : emptyMsg}`;
}

function vmixLayerNameSearch(term) { _vmixLayerNameSearch = term; vmixRenderLayerPane(); }
function vmixLayerNumSearch(term) { _vmixLayerNumSearch = term; vmixRenderLayerPane(); }

function vmixUpdateLayer(key, slot, sourceKey) {
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const val = sourceKey || nullUUID;
  const attrName = `Overlay${slot}`;
  if (_vmixGetRawAttr(key, attrName) !== null) {
    _vmixSetRawAttr(key, attrName, val);
  } else {
    const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
    const lines = _vmixRawText.split(eol);
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes(`Key="${key}"`)) { continue; }
      lines[i] = lines[i].replace(/(\/?>)$/, ` ${attrName}="${val}"$1`);
      break;
    }
    _vmixRawText = lines.join(eol);
  }
  const inp = Array.from(_vmixDoc.querySelectorAll('Input')).find(i => i.getAttribute('Key') === key);
  if (inp) { inp.setAttribute(attrName, val); }
  _vmixLayerEdits.set(key, true);
  _vmixUpdateSaveBtn();
}

function vmixLayerNumChange(key, slot, numEl) {
  const num = parseInt(numEl.value);
  const allInputs = _vmixInputs();
  const target = allInputs.find(i => _vmixNum(i) === num);
  const sel = document.getElementById(`ls-${key}-${slot}`);
  if (target) {
    const k = target.getAttribute('Key');
    if (sel) { sel.value = k; }
    vmixUpdateLayer(key, slot, k);
  } else {
    numEl.value = '';
    if (sel) { sel.value = ''; }
    vmixUpdateLayer(key, slot, '');
  }
}

function vmixLayerSelChange(key, slot, selEl) {
  const sourceKey = selEl.value;
  const allInputs = _vmixInputs();
  const numEl = document.getElementById(`ln-${key}-${slot}`);
  const ref = sourceKey ? allInputs.find(i => i.getAttribute('Key') === sourceKey) : null;
  if (numEl) { numEl.value = ref ? _vmixNum(ref) : ''; }
  vmixUpdateLayer(key, slot, sourceKey);
}

function vmixResetLayers() {
  if (_vmixLayerEdits.size > 0) {
    const nullUUID = '00000000-0000-0000-0000-000000000000';
    _vmixLayerEdits.forEach((_, key) => {
      for (let s = 0; s < 3; s++) {
        const attrName = `Overlay${s}`;
        const origVal = _vmixGetOrigAttr(key, attrName);
        const restoreVal = origVal !== null ? origVal : nullUUID;
        _vmixSetRawAttr(key, attrName, restoreVal);
        const inp = Array.from(_vmixDoc.querySelectorAll('Input')).find(i => i.getAttribute('Key') === key);
        if (inp) { inp.setAttribute(attrName, restoreVal); }
      }
    });
    _vmixLayerEdits.clear();
  }
  vmixRenderLayerPane();
  _vmixUpdateSaveBtn();
}

// ── 구 vmixRenderVIPane 제거 후 진입점 유지 (dead code) ───
function vmixRenderVIPane() {
  const pane = document.getElementById('vmix-pane-vi');
  if (!pane) { return; }
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
    <div class="vmix-action-row">
      <button class="vmix-act-btn" onclick="vmixCreateVirtuals()">생성하기</button>
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

function vmixRenderSplitPane() {
  const pane = document.getElementById('vmix-pane-split');
  if (!pane) { return; }
  if (!_vmixDoc) { pane.innerHTML = ''; return; }

  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const locked = _vmixSplitVIs.length > 0;

  // 카테고리 선택 행
  const roles = [
    { key: 'main', label: '메인 장표', val: _vmixSplitMainCat },
    { key: 'side', label: '사이드 장표', val: _vmixSplitSideCat },
    { key: 'tmpl', label: '템플릿',     val: _vmixSplitTmplCat },
  ];
  const catRows = roles.map(r => {
    const swatches = _VMIX_CAT_COLORS.map((color, i) => {
      const iSel = String(i) === r.val;
      const cls = 'vmix-cat-swatch' + (iSel ? ' sel' : '') + (locked ? ' locked' : '');
      const handler = locked ? '' : `onclick="vmixSetSplitCat('${r.key}','${i}')"`;
      return `<div class="${cls}" style="background:${color};" ${handler}>${i}</div>`;
    }).join('');
    return `<div class="vmix-cat-row">
      <span class="vmix-split-label">${r.label}</span>
      <div class="vmix-cat-swatches">${swatches}</div>
    </div>`;
  }).join('');

  // 분석
  const catMain = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitMainCat && i.getAttribute('OriginalTitle')?.trim());
  const catTmpl = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitTmplCat && i.getAttribute('OriginalTitle')?.trim());
  const tmpl = catTmpl[0] || null;
  let mainSlot = -1;
  if (tmpl) {
    for (let s = 0; s < 3; s++) {
      const ovKey = tmpl.getAttribute(`Overlay${s}`);
      if (!ovKey || ovKey === nullUUID) { continue; }
      const ref = allInputs.find(i => i.getAttribute('Key') === ovKey);
      if (ref && ref.getAttribute('Category') === _vmixSplitMainCat) { mainSlot = s; break; }
    }
  }

  const statusLines = [];
  if (!catTmpl.length) {
    statusLines.push(`<div class="vmix-split-warn">카테고리 ${_vmixSplitTmplCat}에 템플릿 없음</div>`);
  } else {
    statusLines.push(`<div class="vmix-split-info"><span class="vmix-split-label">템플릿</span><span>${_vmixNum(tmpl)}. ${tmpl.getAttribute('OriginalTitle')}</span></div>`);
    if (mainSlot === -1) {
      statusLines.push(`<div class="vmix-split-warn">템플릿에 카테고리 ${_vmixSplitMainCat} 레이어 없음</div>`);
    }
  }
  if (!catMain.length) {
    statusLines.push(`<div class="vmix-split-warn">카테고리 ${_vmixSplitMainCat}에 소스 없음</div>`);
  } else {
    statusLines.push(`<div class="vmix-split-info"><span class="vmix-split-label">메인 장표</span><span>${catMain.length}개</span></div>`);
  }

  const canRun = !locked && tmpl && mainSlot >= 0 && catMain.length > 0;
  const setup = `<div class="vmix-vi-setup">
    ${catRows}
    <hr class="vmix-split-divider">
    ${statusLines.join('')}
    <div style="margin-top:10px;">
      <button class="vmix-act-btn${canRun ? ' accent' : ''}" ${canRun ? '' : 'disabled'} onclick="vmixAutoSplit()">자동 분할 생성</button>
    </div>
  </div>`;

  const baseCount = _vmixInputCount + _vmixNewVIs.length;
  const cards = _vmixSplitVIs.map((vi, idx) => {
    const viNum = baseCount + idx + 1;
    return `<div class="vmix-vi-card">
      <div class="vmix-vi-card-header">
        <span class="vmix-num">${viNum}</span>
        <span class="vmix-vi-card-title">${vi.title}</span>
        <span class="vmix-vi-parent-tag">레이어 ${vi.mainSlot + 1}</span>
      </div>
    </div>`;
  }).join('');

  pane.innerHTML = setup + (cards ? `<div class="vmix-vi-list">${cards}</div>` : '');
}

function vmixSetSplitCat(role, cat) {
  if (role === 'main') { _vmixSplitMainCat = cat; }
  else if (role === 'side') { _vmixSplitSideCat = cat; }
  else if (role === 'tmpl') { _vmixSplitTmplCat = cat; }
  vmixRenderSplitPane();
}

function vmixAutoSplit() {
  if (!_vmixDoc) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const cat1 = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitMainCat && i.getAttribute('OriginalTitle')?.trim());
  const cat3 = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitTmplCat && i.getAttribute('OriginalTitle')?.trim());
  if (!cat3.length || !cat1.length) { return; }

  const tmpl = cat3[0];
  const tmplKey = tmpl.getAttribute('Key');
  let mainSlot = -1;
  for (let s = 0; s < 3; s++) {
    const ovKey = tmpl.getAttribute(`Overlay${s}`);
    if (!ovKey || ovKey === nullUUID) { continue; }
    const ref = allInputs.find(i => i.getAttribute('Key') === ovKey);
    if (ref && ref.getAttribute('Category') === _vmixSplitMainCat) { mainSlot = s; break; }
  }
  if (mainSlot === -1) { return; }

  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);

  const openIdx = lines.findIndex(l => l.includes(`Key="${tmplKey}"`));
  if (openIdx === -1) { return; }
  let tmplBlock;
  if (lines[openIdx].trimEnd().endsWith('/>')) {
    tmplBlock = [lines[openIdx]];
  } else {
    let closeIdx = openIdx;
    while (closeIdx < lines.length && !lines[closeIdx].includes('</Input>')) { closeIdx++; }
    tmplBlock = lines.slice(openIdx, closeIdx + 1);
  }

  const stateIdx = lines.findIndex(l => l.trimStart().startsWith('<State'));
  const insertAt = stateIdx === -1 ? lines.length : stateIdx;

  const newRawLines = [];
  for (let i = 0; i < cat1.length; i++) {
    const newKey = _vmixGenUUID();
    const cat1Key = cat1[i].getAttribute('Key');
    const block = [...tmplBlock];
    let ln = block[0];

    ln = ln.replace(`Key="${tmplKey}"`, `Key="${newKey}"`);
    ln = ln.replace(/Type="[^"]*"/, 'Type="22"');
    if (ln.includes('ShaderSource=')) {
      ln = ln.replace(/ShaderSource="[^"]*"/, `ShaderSource="${tmplKey}"`);
    } else {
      ln = ln.replace(/(\/?>)$/, ` ShaderSource="${tmplKey}"$1`);
    }
    if (!ln.includes('VirtualInputKey=')) {
      ln = ln.replace(/(\/?>)$/, ` VirtualInputKey="${tmplKey}" UseSourceRenderEffects="True"$1`);
    }
    ln = ln.replace('VideoShader_ColorCorrectionSourceEnabled="0"',
                    'VideoShader_ColorCorrectionSourceEnabled="-1"');
    for (let s = 0; s < 3; s++) {
      if (!ln.includes(`Overlay${s}="`)) {
        ln = ln.replace(/(\/?>)$/, ` Overlay${s}="${nullUUID}"$1`);
      }
    }
    ln = ln.replace(new RegExp(`Overlay${mainSlot}="[^"]*"`), `Overlay${mainSlot}="${cat1Key}"`);

    block[0] = ln;
    newRawLines.push(...block);
    _vmixSplitVIs.push({ key: newKey, parentKey: tmplKey, title: cat1[i].getAttribute('OriginalTitle'), mainSlot });
  }

  lines.splice(insertAt, 0, ...newRawLines);
  _vmixRawText = lines.join(eol);
  vmixRenderSplitPane();
  _vmixUpdateSaveBtn();
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
  _vmixUpdateSaveBtn();
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

function _vmixSplitChanged() { return _vmixSplitVIs.length > 0; }
function _vmixLayerChanged() { return _vmixLayerEdits.size > 0; }
function _vmixArChanged() {
  if (!_vmixDoc) { return false; }
  return _vmixInputs().some(inp => {
    const orig = _vmixGetOrigAttr(inp.getAttribute('Key'), 'AspectRatio');
    return orig !== null && inp.getAttribute('AspectRatio') !== orig;
  });
}
function _vmixPosChanged() { return _vmixPastedFrom.size > 0; }
function _vmixVIChanged()  { return _vmixNewVIs.length > 0; }
function _vmixAnyChanged() { return _vmixArChanged() || _vmixPosChanged() || _vmixLayerChanged() || _vmixSplitChanged(); }

function _vmixUpdateSaveBtn() {
  if (!document.getElementById('tab-vmix').classList.contains('on')) { return; }
  document.getElementById('btnBarMain').disabled = !_vmixAnyChanged();
}

function openVmixSaveModal() {
  if (!_vmixAnyChanged()) { return; }
  const chk = v => v
    ? '<span class="chk-mark">✓</span>'
    : '<span class="chk-mark-off">✓</span>';
  document.getElementById('vmixSaveSummary').innerHTML = [
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:${_vmixArChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixArChanged())} 화면비율</div>`,
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:${_vmixPosChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixPosChanged())} 포지션 복사</div>`,
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:${_vmixLayerChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixLayerChanged())} 레이어 설정</div>`,
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:14px;color:${_vmixSplitChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixSplitChanged())} 자동 분할</div>`,
  ].join('');
  history.pushState({ overlay: 'vmixSave' }, '');
  document.getElementById('vmixSaveBg').style.display = 'flex';
}
function closeVmixSaveModal() { document.getElementById('vmixSaveBg').style.display = 'none'; if (history.state && history.state.overlay === 'vmixSave') { _histBack(); } }
function closeVmixSaveBg(e) { if (e.target === document.getElementById('vmixSaveBg')) { closeVmixSaveModal(); } }

function vmixFullReset() {
  if (!_vmixOrigText) { return; }
  _vmixRawText = _vmixOrigText;
  _vmixDoc = new DOMParser().parseFromString(_vmixOrigText, 'text/xml');
  _vmixCopiedKey = null; _vmixNewVIs = []; _vmixSplitVIs = []; _vmixPastedFrom = new Map();
  _vmixArCat = '0'; _vmixPosCat = '0'; _vmixLayerCat = '0';
  _vmixSplitMainCat = '1'; _vmixSplitSideCat = '2'; _vmixSplitTmplCat = '3';
  _vmixLayerEdits = new Map(); _vmixLayerExpanded = new Set(); _vmixLayerNameSearch = ''; _vmixLayerNumSearch = '';
  vmixRenderArList(); vmixRenderPosList(); vmixRenderLayerPane(); vmixRenderSplitPane();
  _vmixUpdateSaveBtn();
}


function vmixDownload() {
  if (!_vmixRawText) { return; }
  const blob = new Blob([_vmixRawText], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = _vmixFilename.replace(/\.vmix/i, '') + '_edited.vmix';
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
export {
  vmixLoad, vmixApplyWide, vmixApplyWideSelected, vmixDownload,
  vmixResetAR, vmixResetPos, vmixResetVI, vmixResetSplit,
  vmixSwitchTab, vmixSetArCat, vmixSetPosCat, vmixSetLayerCat,
  vmixRenderArList, vmixRenderPosList, vmixRenderLayerPane, vmixRenderSplitPane,
  vmixAutoSplit, vmixCreateVirtuals, vmixFullReset,
  vmixCopyPos, vmixTogglePosAll, vmixPasteToSelected,
  vmixToggleLayerCard, vmixLayerNameSearch, vmixLayerNumSearch,
  vmixUpdateLayer, vmixLayerNumChange, vmixLayerSelChange, vmixResetLayers,
  vmixRenderVIPane, vmixUpdateVIOverlay, vmixVILayerNumChange, vmixVILayerSelChange,
  vmixSetSplitCat,
  openVmixSaveModal, closeVmixSaveModal, closeVmixSaveBg,
};


