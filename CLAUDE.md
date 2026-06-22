# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 작업 순서 (토큰·시간 절약)

코드 수정 작업 시 아래 순서를 따른다.

1. **CLAUDE.md 먼저 읽기** — 섹션 맵으로 수정 대상 위치를 특정한다.
2. **해당 섹션만 Read** — 전체 파일을 읽지 말고 필요한 줄 범위만 읽는다.
3. **관련 함수만 Grep** — 함수명·변수명으로 좁혀서 검색한다.
4. **수정 → 버전업 → 커밋** — 완료 후 버전 업 규칙을 적용한다.

> script.js 전체를 처음부터 읽는 것은 금지. CLAUDE.md 섹션 맵에 없는 내용이 필요할 때만 Grep으로 위치를 찾은 뒤 해당 범위만 읽는다.

**CLAUDE.md 동기화 원칙**: 코드 수정 후 섹션 맵(줄 번호·함수 목록)이나 State 테이블, 스타일 규칙 등 변경된 내용이 있으면 커밋 전에 CLAUDE.md도 함께 업데이트한다.

---

## 프로젝트 구조 (LED 설치 계산기 PWA)

**파일 구성**
- `script.js` — 약 4800줄, 앱 전체 로직
- `index.html` — UI 마크업
- `style.css` — 스타일
- `service-worker.js` — PWA 캐시 (버전: `CACHE_VERSION`)
- `manifest.json` — PWA 메타

**script.js 섹션 맵**

| 섹션 | 시작 줄 | 내용 |
|------|---------|------|
| §1 | 21 | 상수·스펙 데이터 (`APP_VERSION`, `APP_SW_VERSION`, `CHANGELOG`, `DEFAULT_COM`, `DEFAULT_COND`, `PWR_PORT_COUNT`, `PC`, `SPECS`, `MAX_PX`, `State`) |
| §2 | 420 | 장비 체크리스트 (`renderCL`, `tog`, `clearAllChecks`, `openChkResetChoice`, `closeChkResetChoice`, `_doChkResetSoft`, `_doChkResetFull`, `addItem`, `delItem`) |
| §3 | 575 | 메모 (`renderMemo`, `addMemo`, `delMemo`) |
| §4 | 595 | 탭 전환 & 버전 팝업 (`swTab`, `_onVersionTap`, `_updateBarForTab`) — 탭별 하단 바 버튼 동작 분기(vmix·chk·기타), 업데이트 완료 토스트 감지 IIFE 포함 |
| §5 | 737 | 콘솔 & 샌딩카드 (`selConsole`, `selSending`) |
| §6 | 763 | PNG 저장·미리보기·공유 (`saveCalcPng`, `saveChkPng`, `_buildResCanvas`, `_buildWmCanvas`, `_buildPwrCanvas`, `_stitchV`, `_getPwrPA`, `genResImage`, `showResPreview`, `selectResVersion`, `_drawBgVignette`, `_drawWmTiles`, `_drawMultiGrid`, `_drawMultiResText`, `_buildMultiResCanvas`, `_buildMultiWmCanvas`, `genResImageMulti`, `_cvToUrl`) |
| §7 | 1579 | 확인 다이얼로그 & 전체 초기화 (`openConfirm`, `closeConfirm`, `doFullReset`) — openConfirm은 fullscreen 시 confirmBg를 simFsBg 안으로 이동 |
| §8 | 1635 | localStorage 저장/불러오기 (`getAppState`, `loadAppState`, `saveState`, `loadState`) |
| §9 | 1806 | 소형 계산기 위젯 (`_buildExpr`, `_computePreview`, `_cu`, `calcInput`, `calcDot`, `calcOper`, `calcEquals`, `calcClear`, `calcDel`, `toggleCalc`) — `cExpr`非空이면 '=' 직후 상태(결과 큰/식 작음), 비어있으면 입력 중(식 큰/미리보기 작음) |
| §9.5 | ~1912 | PDF 뷰어 (`openManual`, `_renderAllPdfPages`, `_applyZoom`, `closePdfModal`) |
| §10 | 2100 | 계산기 핵심 (`selLed`, `selPanel`, `togglePanelRotate`, `setAreaMode`, `syncMultiH`, `calcSection`, `calcMulti`, `calc`, `renderRes`, `renderResMulti`) |
| §11 | 2439 | 랜선·파워콘 시뮬레이터 (`setSimTab`, `_rowSplitHint`, `_rowSplitHintMulti`, `_applyDefaultPwrWiring`, `_isDefaultPwrWiring`, `_execRstAllPwr`, `doRstAllPwr`, `buildSim`, `openSimFs`, `closeSimFs`, `_refreshSimFs`, `buildCv`, `drawCv`, `renderPorts`, `assign`, `deassign`, `_calcLan`, `_calcPwr`, `autoAssign`, `autoAssignUnified`, `autoAssignRowSplit`, `autoAssignRowSplitUnified`, `_autoAssignSec`, `_autoAssignSecRowSplit`, `attachEv`) — 파워콘 탭: PWR_PORT_COUNT=18 포트, 스네이크 기본배선, LAN/PWR 탭 전환 시 pA 스왑 |
| §12 | 3730 | vMix 소스 매크로 (`vmixLoad`, `vmixApplyWide`, `vmixDownload`, `vmixRenderSplitPane`, `vmixAutoSplit`, `vmixResetSplit` 등) |
| §13 | 4622 | 일정 불러오기 (`openSchedModal`, `closeSchedModal`, `_schedRender`, `_schedSaveSettings`, `_schedInitMsal`, `_schedLogin`, `_schedToken`, `_schedRenderEvents`, `_schedRenderList`, `_setSchedTab`, `_schedSelectEvent`, `_schedParseText`, `_schedApplyParsed`, `_toast`, `_se`) — MSAL.js 지연 로드, Outlook 일정→Claude 파싱→LED 피치·면적 자동 적용. 설정(Azure 클라이언트 ID, Claude API 키)은 localStorage `bsp_client_id`/`bsp_claude_key`. 모듈 변수: `_msalInst`, `_schedAccount`, `_schedEvents`, `_schedTab` |
| §14 | ~5060 | 혼합 시뮬레이터 β (`_betaId`, `betaPanelFromKey`, `betaOwner`, `betaPanelPx`, `betaPortPx`, `_betaBBox`, `_betaScale`, `betaCellAt`, `betaReset`, `betaAddZone`, `betaDeleteZone`, `betaUpdateZone`, `betaAddRow`, `betaDeleteRow`, `betaAddPanel`, `betaDeletePanel`, `betaUpdatePanel`, `betaAssign`, `betaCanvasClick`, `betaRenderPorts`, `betaDrawCv`, `betaRenderEditor`) — Zone→행→패널 3계층 자유 배치, 패널별 LED·사이즈 독립, LAN 포트 클릭 할당, 안정 ID 키(`zone.id:row.id:panel.id`) |

**핵심 전역 상태 — `const State` (§1, line 242)**

모든 전역 상태는 `State` 단일 객체로 관리된다. 개별 전역 변수(`let curLed`, `let areaMode` 등)를 새로 추가하지 말 것.

| 키 | 설명 |
|----|------|
| `State.curLed` | 선택 LED 피치 (`'2mm'`/`'3mm'`/`'4mm'`) |
| `State.basePH` | 기준 패널 높이 (`500` 또는 `1000`) |
| `State.panelRotated` | `true` = 1000mm 패널 가로 사용 (1000×500mm) |
| `State.areaMode` | `'single'` 또는 `'multi'` |
| `State.aPort` | 현재 선택 포트 번호 (LAN: 0–7, PWR: 0–17) |
| `State.pA` | 포트별 Set 배열 (LAN: 8개, PWR 탭: 18개) |
| `State.pH2` | 포트별 배선 경로 배열 (pA와 동일 크기) |
| `State.multiSec` | 멀티 섹션 `{ left, center, right }` 각각 `{ cols, rows, layout[] }` |
| `State.curSending` | 선택 샌딩카드 키 |
| `State.cols` / `State.layout` | 단일 모드 열 수 / 행 배열 |
| `State.betaZones` | 혼합 시뮬 β 존 배열 `[{id, x, y, rows:[{id, panels:[{id,w,h,led}]}]}]` |
| `State.betaPorts` | β 포트별 패널 키 Set 배열 (8개), 키 형식: `zone.id:row.id:panel.id` |
| `State.betaPH2` | β 포트별 할당 순서 배열 |
| `State.betaAPort` | β 현재 선택 포트 번호 (0–7) |

**버전 업 규칙**
코드 수정 후 반드시: `APP_VERSION` 올리기 → `APP_SW_VERSION` 올리기 → `CHANGELOG` 항목 추가 → `service-worker.js`의 `CACHE_VERSION` 동기화 → 커밋 → **푸시 전 사용자에게 확인 후 진행**

---

## 코드 스타일 규칙 (script.js 기준)

새 코드는 기존 코드와 스타일을 맞춘다. 아래 규칙을 반드시 준수할 것.

### 비교 연산자
- **항상 `===` / `!==` 사용.** `==` / `!=` 금지.
- 단, null·undefined 동시 체크가 의도된 경우에만 `== null` 허용 (명시적 주석 필요).

### `if` 중괄호
- 중괄호 추가가 코드 동작을 바꾸지 않는 경우에만 적용.
- 단순 단일문 `if`는 중괄호 추가 권장.
  ```js
  // ✓
  if (cond) { doSomething(); }
  ```
- `else if` 다단 구조에 중괄호를 기계적으로 추가하면 `else` 고아(orphan) 오류가 발생할 수 있으므로 주의. 이 경우 한 줄로 유지하거나, 전체 구조를 한 번에 올바르게 변환.
  ```js
  // ✓ — 한 줄 유지
  if (a) { x(); } else if (b) { y(); } else { z(); }
  // ✗ — else 고아 발생 위험
  if (a) { x(); } else { if (b) y(); }
  else { z(); }
  ```

### 변수 선언
- `const` 우선, 재할당 필요 시 `let`. `var` 금지.
- 전역 상태는 반드시 `State.키` 형태로 추가. 새 전역 변수 선언 금지.

### 함수 스타일
- 일반 함수는 `function` 선언문 사용 (호이스팅 활용).
- 인라인 콜백·이벤트 핸들러는 화살표 함수 사용.
- 함수명: camelCase. 내부 헬퍼는 `_` 접두어 (`_buildResCanvas`, `_drawMultiGrid`).

### 포맷
- 들여쓰기: 스페이스 2칸.
- 컬럼 정렬용 불필요한 공백 추가 금지.
- 한 줄에 여러 문장을 쓸 때는 세미콜론으로 구분 (`const a = 1; const b = 2;`).
- 섹션 구분 주석 형식: `// ── §N  섹션명 ─────...` (기존 패턴 유지).

### 코드 규모
- 새 기능은 기존 섹션에 자연스럽게 추가. 불필요한 새 파일·클래스 생성 금지.
- 헬퍼 함수는 호출 위치 바로 위에 배치.
- 주석은 WHY가 불명확한 경우에만 작성. WHAT 설명 주석 금지.
