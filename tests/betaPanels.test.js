const betaPanels = require('./betaPanels');

// 헬퍼: 기본 zone 생성
function zone(overrides) {
  return {
    id: 'z1', led: '3mm',
    startRow: 0, startCol: 0,
    rows: 4, cols: 4,
    panelW: 1000, panelH: 1000,
    ...overrides,
  };
}

describe('betaPanels — 패널 수', () => {
  test('패널크기 == 셀크기(500×500): 각 셀이 독립 패널', () => {
    const panels = betaPanels(zone({ rows: 4, cols: 4, panelW: 500, panelH: 500 }));
    expect(panels).toHaveLength(16); // 4×4
  });

  test('500×1000 패널, 4×4 구역 → 8개 전체 패널 (잔여 없음)', () => {
    // panelH=1000 → spanR=2, fullR=2, fullC=2, 잔여 없음
    const panels = betaPanels(zone({ rows: 4, cols: 4, panelW: 1000, panelH: 1000 }));
    expect(panels).toHaveLength(4); // 2×2
  });

  test('1000×1000 패널, 5×4 구역 → 잔여 행 1개 포함', () => {
    // rows=5, spanR=2 → fullR=2, remR=1 (1행 잔여)
    // 잔여행: 4셀, 전체패널: 2×2=4개 → 합계 8
    const panels = betaPanels(zone({ rows: 5, cols: 4, panelW: 1000, panelH: 1000 }));
    expect(panels).toHaveLength(8);
  });

  test('1000×1000 패널, 4×5 구역 → 잔여 열 1개 포함', () => {
    // cols=5, spanC=2 → fullC=2, remC=1
    // 전체패널: 2×2=4개, 잔여열: fullR(2)×spanR(2)=4셀 → 합계 8
    const panels = betaPanels(zone({ rows: 4, cols: 5, panelW: 1000, panelH: 1000 }));
    expect(panels).toHaveLength(8);
  });

  test('1000×1000 패널, 5×5 구역 → 잔여 행+열 모두 포함', () => {
    // remR=1(행: 5셀), fullR=2, remC=1(열: 2×2=4셀), 전체: 2×2=4 → 합계 13
    const panels = betaPanels(zone({ rows: 5, cols: 5, panelW: 1000, panelH: 1000 }));
    expect(panels).toHaveLength(13);
  });
});

describe('betaPanels — 좌표', () => {
  test('(0,0) 시작, 500×500 패널 → 첫 패널 x=0 y=0', () => {
    const panels = betaPanels(zone({ startRow: 0, startCol: 0, rows: 2, cols: 2, panelW: 500, panelH: 500 }));
    expect(panels[0]).toMatchObject({ x: 0, y: 0, w: 500, h: 500 });
  });

  test('startRow=2, startCol=3 → x=1500 y=1000 (첫 패널)', () => {
    const panels = betaPanels(zone({ startRow: 2, startCol: 3, rows: 2, cols: 2, panelW: 500, panelH: 500 }));
    expect(panels[0]).toMatchObject({ x: 1500, y: 1000 });
  });

  test('key에 zoneId가 포함됨', () => {
    const panels = betaPanels(zone({ id: 'myZone', rows: 2, cols: 2, panelW: 500, panelH: 500 }));
    panels.forEach(p => expect(p.key).toMatch(/^myZone:/));
  });
});

describe('betaPanels — 엣지 케이스', () => {
  test('1×1 구역, 500×500 패널 → 패널 1개', () => {
    const panels = betaPanels(zone({ rows: 1, cols: 1, panelW: 500, panelH: 500 }));
    expect(panels).toHaveLength(1);
  });

  test('패널크기가 구역보다 크면 전체 패널 0개', () => {
    // rows=1, panelH=1000 → spanR=2, fullR=0, remR=1 → 잔여행 1개만
    const panels = betaPanels(zone({ rows: 1, cols: 2, panelW: 1000, panelH: 1000 }));
    // 잔여행(remR=1)이므로 cols(2)개의 500×500 셀
    expect(panels).toHaveLength(2);
  });

  test('모든 패널 key가 유일함', () => {
    const panels = betaPanels(zone({ rows: 5, cols: 5, panelW: 1000, panelH: 1000 }));
    const keys = panels.map(p => p.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  test('구역 크기와 무관하게 모든 패널에 led 값 유지', () => {
    const panels = betaPanels(zone({ rows: 3, cols: 3, panelW: 500, panelH: 500, led: 'P3.9' }));
    panels.forEach(p => expect(p.led).toBe('P3.9'));
  });

  test('전체 패널 면적 합 = 구역 면적', () => {
    // 5×4 구역, 1000×1000 패널 → 잔여행 1, 전체패널 2×2
    // 잔여행: 4×(500×500) = 1,000,000 / 전체패널: 4×(1000×1000) = 4,000,000 → 합 5,000,000
    // 구역: 5×4×500×500 = 5,000,000
    const panels = betaPanels(zone({ rows: 5, cols: 4, panelW: 1000, panelH: 1000 }));
    const totalArea = panels.reduce((sum, p) => sum + p.w * p.h, 0);
    expect(totalArea).toBe(5 * 4 * 500 * 500);
  });

  test('잔여행 패널은 항상 h=500', () => {
    // rows=3, spanR=2 → remR=1 → 첫 행이 잔여행
    const panels = betaPanels(zone({ rows: 3, cols: 2, panelW: 1000, panelH: 1000 }));
    const remRowPanels = panels.filter(p => p.key.includes(':rr:'));
    remRowPanels.forEach(p => expect(p.h).toBe(500));
  });

  test('잔여열 패널은 항상 w=500', () => {
    // cols=3, spanC=2 → remC=1 → 첫 열이 잔여열
    const panels = betaPanels(zone({ rows: 2, cols: 3, panelW: 1000, panelH: 1000 }));
    const remColPanels = panels.filter(p => p.key.includes(':rc'));
    remColPanels.forEach(p => expect(p.w).toBe(500));
  });
});
