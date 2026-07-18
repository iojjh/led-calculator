// _betaAreaInchLabel 순수 함수 — script.js §14 에서 추출. 의존성 없음.
function betaAreaInchLabel(w, h) {
  if (!w || !h) { return ''; }
  const inch = Math.sqrt(w ** 2 + h ** 2) / 25.4;
  return `대각선 ${inch.toFixed(1)}" (약 ${Math.round(inch)}형)`;
}

module.exports = betaAreaInchLabel;
