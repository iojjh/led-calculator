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
4. **기존 코드 참조 우선** — 새 로직 구현 전, 같은 도메인을 이미 처리하는 상수·테이블·함수가 있는지 먼저 Grep으로 확인한다. 직접 유도하거나 재구현하지 않는다.
5. **수정 → 버전업 → 커밋** — 완료 후 버전 업 규칙을 적용한다.

> script.js 전체를 처음부터 읽는 것은 금지. CLAUDE.md 섹션 맵에 없는 내용이 필요할 때만 Grep으로 위치를 찾은 뒤 해당 범위만 읽는다.

**CLAUDE.md 동기화 — 커밋 전 의무 체크 (해당 항목만 업데이트)**

| 트리거 | 업데이트 대상 |
|--------|-------------|
| 함수 추가·제거·이름 변경 | 해당 섹션 함수 목록 |
| `State` 키 추가·제거 | State 테이블 |
| 섹션 경계가 ±30줄 이상 이동 | 해당 섹션 이후 줄 번호 전체 |
| 새 섹션 추가 | 섹션 맵 행 추가 |

위 네 가지 중 해당 없으면 CLAUDE.md 업데이트 불필요 — 명시적으로 skip.

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
| §1 | 17 | 상수·스펙 데이터 (`APP_VERSION`, `APP_SW_VERSION`, `CHANGELOG`, `DEFAULT_COM`, `DEFAULT_COND`, `PWR_PORT_COUNT`, `PC`, `SPECS`, `MAX_PX`, `State`) |
| §2 | 858 | 장비 체크리스트 (`renderCL`, `tog`, `clearAllChecks`, `openChkResetChoice`, `closeChkResetChoice`, `_doChkResetSoft`, `_doChkResetFull`, `addItem`, `delItem`, `saveChkPng`) |
| §4 | 1060 | 탭 전환 & 버전 팝업 (`swTab`, `_onVersionTap`, `_updateBarForTab`) — 탭별 하단 바 버튼 동작 분기(vmix·chk·기타), 업데이트 완료 토스트 감지 IIFE 포함 |
| §7 | 1223 | 모달·다이얼로그·다운로드 (`openModal`, `closeModal`, `dl`, `dateStr`, `_cvToUrl`, `showPreview`, `closePreviewModal`, `confirmDownload`, `shareImage`, `openConfirm`, `closeConfirm`, `tryResetAll`) |
| §8 | 1357 | localStorage 저장/불러오기 (`getAppState`, `loadAppState`, `saveState`, `loadState`) — 계산기 탭 제거 후 beta/체크리스트/메모 상태만 저장 |
| §9 | 1469 | 소형 계산기 위젯 (`_buildExpr`, `_computePreview`, `_cu`, `calcInput`, `calcDot`, `calcOper`, `calcEquals`, `calcClear`, `calcDel`, `toggleCalc`) — `cExpr`非空이면 '=' 직후 상태(결과 큰/식 작음), 비어있으면 입력 중(식 큰/미리보기 작음) |
| §9.5 | — | **[제거됨]** PDF 뷰어 함수 제거(v2.1.6). UI 진입점(`openManual`) 없어 데드코드였음. |
| §10 | — | **[제거됨]** 계산기 핵심 함수 제거(v2.1.4). git 히스토리·script.backup.js로 복원 가능 |
| §11 | — | **[제거됨]** 랜선·파워콘 시뮬레이터 함수 제거(v2.1.4). git 히스토리·script.backup.js로 복원 가능 |
| §12 | 1573 | vMix 소스 매크로 (`vmixLoad`, `vmixApplyWide`, `vmixDownload`, `vmixRenderSplitPane`, `vmixAutoSplit`, `vmixResetSplit` 등) |
| §13 | 2465 | 일정 불러오기 (`openSchedModal`, `closeSchedModal`, `_schedRender`, `_schedSaveSettings`, `_schedInitMsal`, `_schedLogin`, `_schedToken`, `_schedRenderEvents`, `_schedRenderList`, `_setSchedTab`, `_schedSelectEvent`, `_schedParseText`, `_schedApplyParsedBeta`, `_toast`, `_se`) — MSAL.js 지연 로드, Outlook 일정→Claude 파싱→LED 피치·면적 자동 적용. 설정(Azure 클라이언트 ID, Claude API 키)은 localStorage `bsp_client_id`/`bsp_claude_key`. 모듈 변수: `_msalInst`, `_schedAccount`, `_schedEvents`, `_schedTab` |
| §14 | 2773 | LED 설계 탭 (구 혼합 시뮬레이터 β) (`showResPreview`, `selectResVersion`, `betaSaveGuideImage`, `_betaGW`, `_betaGH`, `_betaSc`, `_betaCellAt`, `_betaOverlaps`, `_betaZoneAt`, `betaPanels`, `_betaAllPanels`, `_betaPanelAt`, `_betaPxOf`, `_betaOwner`, `betaApplyArea`, `betaSetMode`, `betaRender`, `betaDrawEdit`, `_betaBuildRatioHtml`, `betaRenderZoneList`, `betaToggleRatio`, `betaSelectZone`, `betaDeleteZone`, `betaEditZone`, `betaShowCfgPanel`, `betaCfgApply`, `betaCfgCancel`, `betaAttachEditEv`, `betaDrawLan`, `betaRenderLanUI`, `betaRenderPorts`, `betaRenderSum`, `betaRenderLeg`, `betaRenderPwrPorts`, `betaAssign`, `betaDeassign`, `betaRstPort`, `betaRstAllPorts`, `betaReset`, `betaAutoAssign`, `betaAttachLanEv`) — 격자 드래그 구역 선택, LED·패널 혼합, Zone→패널 계산(`betaPanels`), 편집 모드 & LAN/PWR 모드 전환, 뱀형 자동할당 |

**핵심 전역 상태 — `const State` (§1, line 759)**

모든 전역 상태는 `State` 단일 객체로 관리된다. 개별 전역 변수(`let curLed`, `let areaMode` 등)를 새로 추가하지 말 것.

**활성 State 키 (LED 설계 탭)**

| 키 | 설명 |
|----|------|
| `State.lanExpanded` | `false` = 기본 8포트, `true` = 샌딩카드 확장 16포트 |
| `State.betaAreaW` / `State.betaAreaH` | 혼합 시뮬 β 설치 면적 가로·세로 (mm) |
| `State.betaZones` | 구역 배열 `[{id, startRow, startCol, rows, cols, led, panelW, panelH}]` |
| `State.betaMode` | `'edit'` (구역 편집) 또는 `'lan'` (랜선 배선) |
| `State.betaPorts` | β LAN 포트별 패널 키 Set 배열, 키 형식: `zoneId:panelRow:panelCol` |
| `State.betaPH2` | β LAN 포트별 할당 순서 배열 |
| `State.betaAPort` | β LAN 현재 선택 포트 번호 |
| `State.betaPwrPorts` | β PWR 포트별 패널 키 Set 배열 (18개) |
| `State.betaPwrPH2` | β PWR 포트별 할당 순서 배열 |
| `State.betaPwrAPort` | β PWR 현재 선택 포트 번호 |
| `State.betaSpareAdj` | β 케이블 예비 설정 `{l1, sl}` |
| `State._betaCache` | `_betaAllPanels()` 결과 캐시 (편집 시 `null`로 초기화) |
| `State._betaRatioOpen` | 구역별 비율 토글 패널 열림 여부 (`false` = 접힘) |

**비활성 State 키 (계산기 탭 제거·내보내기 버튼 제거로 데드코드)**

`State.curLed`, `State.basePH`, `State.panelRotated`, `State.areaMode`, `State.aPort`, `State.pA`, `State.pH2`, `State.spareAdj`, `State.multiSec`, `State.cols`, `State.layout`, `State.curSending`, `State.betaImport`
— 객체에는 존재하지만 현재 UI에서 세팅·읽기가 이루어지지 않음. 수정하지 말 것.

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
