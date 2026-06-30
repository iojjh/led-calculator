const { setState, _buildExpr, _computePreview } = require('./calcWidget');

// 각 테스트 전 State 초기화
beforeEach(() => {
  setState({ cParts: [], cNew: false, cDisp: '0', cExpr: '' });
});

describe('_buildExpr — 수식 문자열 조합', () => {
  test('cParts 없으면 cDisp 그대로 반환', () => {
    setState({ cDisp: '42' });
    expect(_buildExpr()).toBe('42');
  });

  test('입력 중(cNew=false): 식 + 현재 입력값 포함', () => {
    setState({ cParts: ['3', '+'], cNew: false, cDisp: '5' });
    expect(_buildExpr()).toBe('3 + 5');
  });

  test('연산자 직후(cNew=true): 현재 입력값 미포함', () => {
    setState({ cParts: ['3', '+'], cNew: true, cDisp: '0' });
    expect(_buildExpr()).toBe('3 +');
  });

  test('긴 수식', () => {
    setState({ cParts: ['10', '+', '5', '−'], cNew: false, cDisp: '3' });
    expect(_buildExpr()).toBe('10 + 5 − 3');
  });
});

describe('_computePreview — 중간 계산 결과', () => {
  test('피연산자가 2개 미만이면 null', () => {
    setState({ cParts: ['3'], cNew: false, cDisp: '5' });
    expect(_computePreview()).toBeNull();
  });

  test('덧셈 미리보기', () => {
    setState({ cParts: ['3', '+'], cNew: false, cDisp: '5' });
    expect(_computePreview()).toBe('8');
  });

  test('뺄셈 미리보기', () => {
    setState({ cParts: ['10', '−'], cNew: false, cDisp: '3' });
    expect(_computePreview()).toBe('7');
  });

  test('곱셈 미리보기', () => {
    setState({ cParts: ['4', '×'], cNew: false, cDisp: '5' });
    expect(_computePreview()).toBe('20');
  });

  test('나눗셈 미리보기', () => {
    setState({ cParts: ['9', '÷'], cNew: false, cDisp: '3' });
    expect(_computePreview()).toBe('3');
  });

  test('0으로 나누면 null', () => {
    setState({ cParts: ['9', '÷'], cNew: false, cDisp: '0' });
    expect(_computePreview()).toBeNull();
  });

  test('연산자 직후(cNew=true)는 이전 결과 기준', () => {
    // cParts = ['3', '+', '5', '×'], cNew=true → 3+5=8까지만 계산
    setState({ cParts: ['3', '+', '5', '×'], cNew: true, cDisp: '0' });
    expect(_computePreview()).toBe('8');
  });

  test('소수 연산', () => {
    setState({ cParts: ['1.5', '+'], cNew: false, cDisp: '2.5' });
    expect(_computePreview()).toBe('4');
  });
});
