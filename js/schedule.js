import { State } from './constants.js';
import { _histBack } from './modal.js';
import { _toast, _se } from './utils.js';
import { saveState } from './storage.js';
import { betaRender } from './led-design.js';
// ── §13  일정 불러오기 ────────────────────────────────────────────────────────
// 관리자: 본인 Outlook 공개 ICS URL을 아래에 설정 (빈 문자열이면 설정 화면 표시)
const _SCHED_ICS_URL = 'https://outlook.live.com/owa/calendar/00000000-0000-0000-0000-000000000000/cfc7d81d-4e85-4980-8652-3a1ecc64867d/cid-610EC8FF2A0B2E95/calendar.ics';

let _schedEvents = [];
let _schedTab    = 'upcoming';
let _schedTarget = 'beta';

function openSchedModal(target) {
  _schedTarget = target || 'beta';
  document.getElementById('schedBg').style.display = 'flex';
  history.pushState({ overlay: 'sched' }, '');
  _schedRender();
}

function closeSchedModal() {
  document.getElementById('schedBg').style.display = 'none';
  if (history.state && history.state.overlay === 'sched') { _histBack(); }
}

function _schedBgClick(e) {
  if (e.target === document.getElementById('schedBg')) { closeSchedModal(); }
}

function _schedRender() {
  const icsUrl = localStorage.getItem('bsp_ics_url') || _SCHED_ICS_URL;
  if (!icsUrl) {
    const body = document.getElementById('sched-body');
    body.innerHTML = `
      <p class="sched-hint-sm">Outlook 캘린더 공개 ICS URL을 설정하세요.<br>Outlook → 캘린더 → 공유 → 게시(Publish) → ICS 링크 복사</p>
      <label class="sched-lbl">ICS URL</label>
      <input id="sched-inp-ics" class="sched-inp" type="text" placeholder="https://outlook.live.com/owa/calendar/.../calendar.ics">
      <button class="sched-primary-btn" onclick="_schedSaveSettings()">저장 후 불러오기</button>`;
    return;
  }
  _schedFetchEvents(icsUrl);
}

function _schedOpenSettings() {
  const body = document.getElementById('sched-body');
  const cur = localStorage.getItem('bsp_ics_url') || _SCHED_ICS_URL;
  body.innerHTML = `
    <p class="sched-hint-sm">Outlook 캘린더 공개 ICS URL</p>
    <label class="sched-lbl">ICS URL</label>
    <input id="sched-inp-ics" class="sched-inp" type="text" value="${_se(cur)}" placeholder="https://outlook.live.com/owa/calendar/.../calendar.ics">
    <button class="sched-primary-btn" onclick="_schedSaveSettings()">저장</button>`;
}

function _schedSaveSettings() {
  const url = (document.getElementById('sched-inp-ics')?.value || '').trim();
  if (!url) { _toast('ICS URL을 입력하세요.'); return; }
  localStorage.setItem('bsp_ics_url', url);
  _schedFetchEvents(url);
}

async function _schedFetchEvents(icsUrl) {
  const body = document.getElementById('sched-body');
  body.innerHTML = '<div class="sched-loading">일정 불러오는 중...</div>';
  // Outlook ICS는 브라우저 직접 접근 차단 → corsproxy.io 경유
  const fetchUrl = icsUrl.startsWith('https://corsproxy.io/')
    ? icsUrl
    : 'https://corsproxy.io/?' + encodeURIComponent(icsUrl);
  try {
    const res = await fetch(fetchUrl);
    if (!res.ok) { throw new Error('HTTP ' + res.status); }
    const text = await res.text();
    _schedEvents = _parseIcs(text);
    _schedRenderList();
  } catch (e) {
    body.innerHTML = `<div class="sched-hint">일정 로드 실패: ${_se(e.message)}</div>
      <button class="sched-primary-btn secondary" onclick="_schedOpenSettings()">URL 변경</button>`;
  }
}

function _stripSchedFooter(s) {
  // 네이버밴드 → Outlook 변환 시 자동 추가되는 꼬리말 제거
  // 패턴: " - A-TEAM(CJ): 기본 캘린더, ..." 형태로 ' - 대문자'로 시작
  const idx = s.search(/ - [A-Z]/);
  return (idx > 0 ? s.slice(0, idx) : s).trim();
}

function _schedRenderList() {
  const body = document.getElementById('sched-body');
  const now = new Date(); now.setHours(0, 0, 0, 0);

  const upcoming = [], past = [];
  _schedEvents.forEach((e, i) => {
    const dt = new Date(e.start.dateTime || e.start.date);
    (dt < now ? past : upcoming).push({ e, i, dt });
  });
  past.sort((a, b) => b.dt - a.dt);

  const tabRow = `<div class="sched-tab-row">
    <button class="sched-tab-btn${_schedTab === 'upcoming' ? ' on' : ''}" onclick="_setSchedTab('upcoming')">예정 <span class="sched-tab-cnt">${upcoming.length}</span></button>
    <button class="sched-tab-btn${_schedTab === 'past' ? ' on' : ''}" onclick="_setSchedTab('past')">지난 일정</button>
    <button class="sched-refresh" style="margin-left:auto" onclick="_schedRender()">새로고침</button>
  </div>`;

  const list = _schedTab === 'upcoming' ? upcoming : past;
  const emptyMsg = _schedTab === 'upcoming' ? '예정된 일정이 없습니다.' : '지난 일정이 없습니다.';

  const items = list.map(({ e, i, dt }) => {
    const dateStr = dt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
    const content = _stripSchedFooter(e.bodyPreview || '');
    return `<div class="sched-ev${_schedTab === 'past' ? ' sched-ev-past' : ''}">
      <div class="sched-ev-row">
        <div class="sched-ev-info">
          <div class="sched-ev-title">${_se(e.subject || '(제목 없음)')}</div>
          <div class="sched-ev-date">${dateStr}</div>
          ${e.location ? `<button type="button" class="sched-ev-loc" onclick="_schedOpenMap(event,${i})" ontouchend="event.stopPropagation()">📍 ${_se(e.location)}</button>` : ''}
          ${content ? `<div class="sched-ev-body">${_se(content)}</div>` : ''}
        </div>
        <button type="button" class="sched-ev-load" onclick="_schedSelectEvent(${i})">불러오기</button>
      </div>
    </div>`;
  }).join('');

  body.innerHTML = tabRow + (items || `<div class="sched-hint">${emptyMsg}</div>`);
}

function _setSchedTab(tab) {
  _schedTab = tab;
  _schedRenderList();
}

function _schedSelectEvent(idx) {
  const ev = _schedEvents[idx];
  if (!ev) { return; }
  const text = (ev.subject || '') + '\n' + (ev.bodyPreview || '').trim();
  try {
    const parsed = _schedParseText(text);
    if (_schedTarget === 'beta') {
      _schedApplyParsedBeta(parsed);
      closeSchedModal();
      const pitchStr = parsed.pitch ? parsed.pitch + 'mm' : null;
      const areaStr  = (parsed.width != null && parsed.height != null)
        ? parsed.width + '×' + parsed.height + 'm' : null;
      const parts = [pitchStr, areaStr].filter(Boolean);
      _toast(parts.length ? '혼합 시뮬 적용됨: ' + parts.join(' · ') : '혼합 시뮬 적용됨 (면적 정보 없음)');
    }
  } catch (e) {
    const body = document.getElementById('sched-body');
    body.innerHTML = `<div class="sched-hint">${_se(e.message)}</div>
      <button class="sched-primary-btn secondary" onclick="_schedRenderList()">목록으로</button>`;
  }
}

function _extractMapAddr(location) {
  // 대괄호와 내용 제거
  const s = location.replace(/\[.*?\]/g, '').trim();
  // 광역시도 키워드로 시작하는 주소 부분만 추출, 없으면 전체 사용
  const m = s.match(/((?:서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)\S*[\s\S]+)/);
  return (m ? m[1] : s).trim();
}

function _schedOpenMap(ev, idx) {
  ev.preventDefault();
  ev.stopPropagation();
  const location = _schedEvents[idx]?.location;
  if (!location) { return; }
  const addr = _extractMapAddr(location);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = 'geo:0,0?q=' + encodeURIComponent(addr);
  } else {
    window.open('https://maps.google.com/maps?q=' + encodeURIComponent(addr), '_blank', 'noopener');
  }
}

function _schedParseText(text) {
  const pitchM = text.match(/(\d+)\s*mm/i);
  const pitch  = pitchM ? parseInt(pitchM[1], 10) : null;
  const SZ     = '(\\d+\\.?\\d*)\\s*[*×xX]\\s*(\\d+\\.?\\d*)';
  const toSize = m => m ? { w: parseFloat(m[1]), h: parseFloat(m[2]) } : null;

  // 좌우/좌/우 키워드가 있으면 멀티 모드
  const isMulti = /좌우|좌측|우측/.test(text) || /[좌우]\s*\d/.test(text);

  if (isMulti) {
    const centerM = text.match(new RegExp('중앙\\s*' + SZ));
    const sideM   = text.match(new RegExp('좌우\\s*' + SZ));
    // 좌우가 있으면 좌/우 개별 매칭 불필요
    const leftM   = sideM ? null : text.match(new RegExp('(?:좌측|좌)\\s*' + SZ));
    const rightM  = sideM ? null : text.match(new RegExp('(?:우측|우)\\s*' + SZ));

    let center = toSize(centerM);
    const left  = toSize(sideM) || toSize(leftM);
    const right = toSize(sideM) || toSize(rightM);

    // 중앙 미표기 시 라벨 없는 첫 번째 N*M을 중앙으로
    if (!center) {
      let tmp = text;
      [sideM, leftM, rightM].forEach(m => { if (m) { tmp = tmp.replace(m[0], ''); } });
      const rem = tmp.match(new RegExp(SZ));
      if (rem) { center = { w: parseFloat(rem[1]), h: parseFloat(rem[2]) }; }
    }

    if (!center && !left && !right) {
      throw new Error('멀티 섹션 면적을 찾을 수 없습니다.');
    }
    return { mode: 'multi', pitch, center, left, right };
  }

  // 단일 모드
  const sizeM  = text.match(new RegExp(SZ));
  const width  = sizeM ? parseFloat(sizeM[1]) : null;
  const height = sizeM ? parseFloat(sizeM[2]) : null;
  if (pitch === null && width === null) {
    throw new Error('일정에서 LED 피치 또는 설치 면적을 찾을 수 없습니다.\n(예: 3mm 9*4.5)');
  }
  return { mode: 'single', pitch, width, height };
}


function _schedApplyParsedBeta(parsed) {
  if (parsed.width == null || parsed.height == null) {
    throw new Error('면적 정보가 없습니다. (예: 3mm 6×2.5)');
  }
  const gridCols = Math.round(parsed.width  * 1000 / 500);
  const gridRows = Math.round(parsed.height * 1000 / 500);
  const led      = parsed.pitch ? parsed.pitch + 'mm' : '3mm';
  const panelH   = parsed.pitch === 2 ? 500 : 1000;
  State.betaAreaW    = gridCols * 500;
  State.betaAreaH    = gridRows * 500;
  State.betaZones    = [{ id: Date.now(), startRow: 0, startCol: 0, rows: gridRows, cols: gridCols, led, panelW: 500, panelH }];
  State._betaCache   = null;
  State.betaMode     = 'edit';
  State.betaPorts    = Array.from({ length: 16 }, () => new Set());
  State.betaPH2      = Array.from({ length: 16 }, () => []);
  State.betaAPort    = 0;
  State.betaPwrPorts = Array.from({ length: 18 }, () => new Set());
  State.betaPwrPH2   = Array.from({ length: 18 }, () => []);
  State.betaPwrAPort = 0;
  betaRender();
  saveState();
}

// ── ICS 파서 ─────────────────────────────────────────────────────────────────
function _parseIcs(raw) {
  const text = raw.replace(/\r\n[ \t]/g, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const events = [];
  for (const block of text.split('BEGIN:VEVENT').slice(1)) {
    const ev = {};
    for (const line of block.split('\n')) {
      const sep = line.indexOf(':');
      if (sep < 0) { continue; }
      const key = line.slice(0, sep).split(';')[0].toUpperCase();
      const val = line.slice(sep + 1).trim();
      if (key === 'SUMMARY')     { ev.subject    = _icsUnescape(val); }
      if (key === 'DESCRIPTION') { ev.bodyPreview = _icsUnescape(val); }
      if (key === 'LOCATION')    { ev.location   = _icsUnescape(val); }
      if (key === 'DTSTART')     { ev.start = { dateTime: _icsDate(val) }; }
    }
    if (ev.subject && ev.start) { events.push(ev); }
  }
  return events.sort((a, b) => new Date(a.start.dateTime) - new Date(b.start.dateTime));
}

function _icsUnescape(s) {
  return s.replace(/\\n/g, '\n').replace(/\\,/g, ',').replace(/\\;/g, ';').replace(/\\\\/g, '\\');
}

function _icsDate(val) {
  const s = val.replace(/Z$/, '');
  if (s.length === 8) { return s.slice(0,4) + '-' + s.slice(4,6) + '-' + s.slice(6,8); }
  return s.slice(0,4) + '-' + s.slice(4,6) + '-' + s.slice(6,8) +
    'T' + s.slice(9,11) + ':' + s.slice(11,13) + ':' + s.slice(13,15);
}
export { openSchedModal, closeSchedModal, _schedBgClick, _schedOpenSettings };



