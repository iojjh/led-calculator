// 순수 유틸 함수 — script.js에서 추출. 의존성 없음.

function _se(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function _stripSchedFooter(s) {
  const idx = s.search(/ - [A-Z]/);
  return (idx > 0 ? s.slice(0, idx) : s).trim();
}

module.exports = { _se, _stripSchedFooter };
