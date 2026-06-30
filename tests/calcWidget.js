// 계산기 위젯 함수 — script.js §9에서 추출. State는 아래 객체로 모킹.
const State = { cParts: [], cNew: false, cDisp: '0', cExpr: '' };

function setState(patch) { Object.assign(State, patch); }

function _buildExpr() {
  if (!State.cParts.length) { return State.cDisp; }
  return State.cNew ? State.cParts.join(' ') : State.cParts.join(' ') + ' ' + State.cDisp;
}

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

module.exports = { setState, _buildExpr, _computePreview };
