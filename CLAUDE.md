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
- `script.js` — 약 3358줄, 앱 전체 로직
- `index.html` — UI 마크업
- `style.css` — 스타일
- `service-worker.js` — PWA 캐시 (버전: `CACHE_VERSION`)
- `manifest.json` — PWA 메타

**script.js 섹션 맵**

| 섹션 | 시작 줄 | 내용 |
|------|---------|------|
| §1 | 21 | 상수·스펙 데이터 (`APP_VERSION`, `APP_SW_VERSION`, `CHANGELOG`, `SPECS`, `CSPEC`, `SSPEC`, `PC`, `MAX_PX`, `State`) |
| §2 | 211 | 장비 체크리스트 (`renderCL`, `tog`, `addItem`, `delItem`) |
| §3 | 252 | 메모 (`renderMemo`, `addMemo`, `delMemo`) |
| §4 | 272 | 탭 전환 & 버전 팝업 (`swTab`, `_onVersionTap`) |
| §5 | 319 | 콘솔 & 샌딩카드 (`selConsole`, `selSending`) |
| §6 | 345 | PNG 저장·미리보기·공유 (`saveCalcPng`, `saveChkPng`, `_buildResCanvas`, `_buildWmCanvas`, `genResImage`, `showResPreview`, `selectResVersion`, `_drawBgVignette`, `_drawWmTiles`, `_drawMultiGrid`, `_drawMultiResText`, `_buildMultiResCanvas`, `_buildMultiWmCanvas`, `genResImageMulti`, `genIntroImage`, `_cvToUrl`) |
| §7 | 1063 | 확인 다이얼로그 & 전체 초기화 (`openConfirm`, `closeConfirm`, `doFullReset`) — openConfirm은 fullscreen 시 confirmBg를 simFsBg 안으로 이동 |
| §8 | 1116 | localStorage 저장/불러오기 (`getAppState`, `loadAppState`, `saveState`, `loadState`) |
| §9 | 1269 | 소형 계산기 위젯 (`calcInput`, `calcOper`, `calcEquals`, `toggleCalc`) — `State.cParts[]`에 숫자·연산자 누적, `=` 눌렀을 때 좌→우 계산. DEL은 cNew 상태면 마지막 연산자 취소 |
| §9.5 | 1324 | PDF 뷰어 (`openManual`, `_renderAllPdfPages`, `_applyZoom`, `closePdfModal`) |
| §10 | 1468 | 계산기 핵심 (`selLed`, `selPanel`, `setAreaMode`, `syncMultiH`, `calcSection`, `calcMulti`, `calc`, `renderRes`, `renderResMulti`) |
| §11 | 1947 | 랜선 시뮬레이터 (`buildSim`, `openSimFs`, `closeSimFs`, `_refreshSimFs`, `buildCv`, `drawCv`, `renderPorts`, `assign`, `deassign`, `autoAssign`, `autoAssignUnified`, `attachEv`) — attachEv는 buildSim에서만 호출(openSimFs·_refreshSimFs에서 중복 호출 금지), buildCv는 fsMode 시 height 방향 제약도 적용 |
| §12 | 2893 | vMix 소스 매크로 (`vmixLoad`, `vmixApplyWide`, `vmixDownload` 등) |

**핵심 전역 상태 — `const State` (§1, line 126)**

모든 전역 상태는 `State` 단일 객체로 관리된다. 개별 전역 변수(`let curLed`, `let areaMode` 등)를 새로 추가하지 말 것.

| 키 | 설명 |
|----|------|
| `State.curLed` | 선택 LED 피치 (`'2mm'`/`'3mm'`/`'4mm'`) |
| `State.basePH` | 기준 패널 높이 (`500` 또는 `1000`) |
| `State.areaMode` | `'single'` 또는 `'multi'` |
| `State.aPort` | 현재 선택 포트 번호 (0–7) |
| `State.pA[8]` | 포트별 Set (셀 키 저장) |
| `State.pH2[8]` | 포트별 배선 경로 배열 |
| `State.multiSec` | 멀티 섹션 `{ left, center, right }` 각각 `{ cols, rows, layout[] }` |
| `State.curSending` | 선택 샌딩카드 키 |
| `State.cols` / `State.layout` | 단일 모드 열 수 / 행 배열 |

**버전 업 규칙**
코드 수정 후 반드시: `APP_VERSION` 올리기 → `APP_SW_VERSION` 올리기 → `CHANGELOG` 항목 추가 → `service-worker.js`의 `CACHE_VERSION` 동기화 → git push

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
