// betaPanels 순수 함수 — script.js §14 에서 추출. 의존성 없음.
function betaPanels(zone) {
  const spanC = zone.panelW / 500;
  const spanR = zone.panelH / 500;
  const fullC = Math.floor(zone.cols / spanC);
  const fullR = Math.floor(zone.rows / spanR);
  const remC  = zone.cols % spanC;
  const remR  = zone.rows % spanR;
  const panels = [];

  if (remR) {
    for (let cc = 0; cc < zone.cols; cc++) {
      panels.push({
        key: `${zone.id}:rr:${cc}`,
        x: (zone.startCol + cc) * 500,
        y: zone.startRow * 500,
        w: 500, h: 500,
        led: zone.led, zoneId: zone.id,
      });
    }
  }

  for (let pr = 0; pr < fullR; pr++) {
    if (remC) {
      for (let rs = 0; rs < spanR; rs++) {
        panels.push({
          key: `${zone.id}:${pr}:rc${rs}`,
          x: zone.startCol * 500,
          y: (zone.startRow + remR + pr * spanR + rs) * 500,
          w: 500, h: 500,
          led: zone.led, zoneId: zone.id,
        });
      }
    }
    for (let pc = 0; pc < fullC; pc++) {
      panels.push({
        key: `${zone.id}:${pr}:${pc}`,
        x: (zone.startCol + remC + pc * spanC) * 500,
        y: (zone.startRow + remR + pr * spanR) * 500,
        w: zone.panelW, h: zone.panelH,
        led: zone.led, zoneId: zone.id,
      });
    }
  }

  return panels;
}

module.exports = betaPanels;
