const { _se, _stripSchedFooter } = require('./utils');

describe('_se — HTML 이스케이프', () => {
  test('일반 문자열은 그대로 반환', () => {
    expect(_se('hello world')).toBe('hello world');
  });

  test('< > 를 엔티티로 변환', () => {
    expect(_se('<script>')).toBe('&lt;script&gt;');
  });

  test('& 를 &amp; 로 변환', () => {
    expect(_se('a & b')).toBe('a &amp; b');
  });

  test('" 를 &quot; 로 변환', () => {
    expect(_se('"quoted"')).toBe('&quot;quoted&quot;');
  });

  test('복합 — XSS 패턴 무력화', () => {
    expect(_se('<img src="x" onerror="alert(1)">')).toBe('&lt;img src=&quot;x&quot; onerror=&quot;alert(1)&quot;&gt;');
  });

  test('숫자 입력 → 문자열로 변환', () => {
    expect(_se(42)).toBe('42');
  });

  test('null → 빈 문자열', () => {
    expect(_se(null)).toBe('');
  });

  test('undefined → 빈 문자열', () => {
    expect(_se(undefined)).toBe('');
  });
});

describe('_stripSchedFooter — 일정 꼬리말 제거', () => {
  test('꼬리말 없으면 원본 반환', () => {
    expect(_stripSchedFooter('정기 공연 리허설')).toBe('정기 공연 리허설');
  });

  test('" - 대문자" 패턴 이후 제거', () => {
    expect(_stripSchedFooter('정기 공연 - A-TEAM(CJ): 기본 캘린더')).toBe('정기 공연');
  });

  test('앞뒤 공백 제거', () => {
    expect(_stripSchedFooter('  공연 제목  ')).toBe('공연 제목');
  });

  test('소문자로 시작하는 " - x"는 제거하지 않음', () => {
    expect(_stripSchedFooter('제목 - 부제')).toBe('제목 - 부제');
  });

  test('빈 문자열 → 빈 문자열', () => {
    expect(_stripSchedFooter('')).toBe('');
  });
});
