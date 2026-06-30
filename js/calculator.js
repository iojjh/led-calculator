import { State } from './constants.js';
import { _histBack } from './modal.js';


// ── §9  소형 계산기 위젯 ─────────────────────────────────


// 현재 입력 중인 식 텍스트 반환
function _buildExpr() {
  if (!State.cParts.length) { return State.cDisp; }
  return State.cNew ? State.cParts.join(' ') : State.cParts.join(' ') + ' ' + State.cDisp;
}

// 현재 식의 중간 계산 결과 (숫자 2개+연산자 1개 이상일 때만)
function _computePreview() {
  const parts = State.cNew ? State.cParts.slice(0, -1) : [...State.cParts, State.cDisp];
  if (parts.length < 3) { return null; }
  let r = parseFloat(parts[0]);
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const right = parseFloat(parts[i + 1]);
    r = parts[i] === '+' ? r + right
      : parts[i] === '−' ? r - right
      : parts[i] === '×' ? r * right
      : right !== 0       ? r / right : NaN;
    if (isNaN(r)) { break; }
  }
  return isNaN(r) ? null : String(parseFloat(r.toFixed(10)));
}

// cExpr非空 = '=' 직후 → 큰 폰트 결과 + 작은 폰트 식
// 그 외 → 큰 폰트 식 + 작은 폰트 미리보기
function _cu() {
  const eDisp = document.getElementById('calcDisplay');
  const eExpr = document.getElementById('calcExpr');
  if (State.cExpr !== '') {
    eDisp.textContent = State.cDisp;
    eExpr.textContent = State.cExpr;
  } else {
    eDisp.textContent = _buildExpr();
    const p = _computePreview();
    eExpr.textContent = p ? '= ' + p : '';
  }
}
function calcInput(v) {
  State.cExpr = '';
  State.cDisp = State.cNew ? (State.cNew = false, v) : (State.cDisp === '0' ? v : State.cDisp + v);
  _cu();
}
function calcDot() {
  State.cExpr = '';
  if (State.cNew) { State.cDisp = '0.'; State.cNew = false; } else if (!State.cDisp.includes('.')) { State.cDisp += '.'; }
  _cu();
}
function calcOper(op) {
  State.cExpr = '';
  if (State.cNew && State.cParts.length > 0) {
    State.cParts[State.cParts.length - 1] = op;
  } else {
    State.cParts.push(State.cDisp, op);
    State.cNew = true;
  }
  _cu();
}
function calcEquals() {
  if (!State.cParts.length) { return; }
  const parts = State.cNew ? State.cParts.slice(0, -1) : [...State.cParts, State.cDisp];
  if (parts.length < 3) { State.cExpr = ''; State.cParts = []; State.cNew = true; _cu(); return; }
  let result = parseFloat(parts[0]);
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const right = parseFloat(parts[i + 1]);
    result = parts[i] === '+' ? result + right
           : parts[i] === '−' ? result - right
           : parts[i] === '×' ? result * right
           : right !== 0       ? result / right
           : NaN;
    if (isNaN(result)) { break; }
  }
  State.cExpr = parts.join(' ') + ' =';
  State.cDisp = isNaN(result) ? '오류' : String(parseFloat(result.toFixed(10)));
  State.cParts = []; State.cNew = true; _cu();
}
function calcClear() { State.cDisp = '0'; State.cParts = []; State.cNew = true; State.cExpr = ''; _cu(); }
function calcDel() {
  State.cExpr = '';
  if (State.cNew && State.cParts.length >= 2) {
    State.cParts.pop();
    State.cDisp = State.cParts.pop();
    State.cNew = false;
  } else if (State.cDisp.length <= 1 || State.cNew) {
    State.cDisp = '0'; State.cNew = true;
  } else {
    State.cDisp = State.cDisp.slice(0, -1);
  }
  _cu();
}
function toggleCalc() {
  const p = document.getElementById('calcPanel');
  if (p.style.display === 'none') {
    history.pushState({ overlay: 'calc' }, '');
    p.style.display = 'block';
  } else {
    p.style.display = 'none';
    if (history.state && history.state.overlay === 'calc') { _histBack(); }
  }
}
export { calcInput, calcDot, calcOper, calcEquals, calcClear, calcDel, toggleCalc };
