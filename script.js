// ════════════════════════════════════════════════════════════
//  LED 설치 계산기  v1.0.1
//
//  섹션 구조
//  §1  스펙 데이터 & 상수
//  §2  장비 체크리스트
//  §3  메모
//  §4  탭 전환
//  §5  콘솔 & 샌딩카드
//  §6  PNG 저장 · 미리보기 · 공유
//  §7  확인 다이얼로그 & 전체 초기화
//  §8  저장 / 불러오기 (localStorage)
//  §9  소형 계산기 위젯
//  §9.5 PDF 뷰어 (PDF.js, 페이지 단위 이동)
//  §10 계산기 핵심 (면적·패널 계산 & 결과 렌더링)
//  §11 랜선 시뮬레이터 (캔버스, 포트 할당, 이벤트)
//  §12 vMix 소스 매크로 (파일 로드, 비율 변환, 다운로드)
// ════════════════════════════════════════════════════════════


// ── §1  스펙 데이터 & 상수 ────────────────────────────────

const APP_VERSION = '2.0.80';
const APP_SW_VERSION = 'v183';

const CHANGELOG = [
  { v: '2.0.80', items: [
    '혼합 시뮬 가이드 이미지: 계산기 탭 워터마크 서식 적용 — 어두운 배경·비네팅·사명 연속 타일·구역별 해상도 텍스트·로고',
  ] },
  { v: '2.0.79', items: [
    '혼합 시뮬 가이드 이미지: 물리 비율 보존 — max(sX,sY) 단일 스케일로 가로·세로 통일',
  ] },
  { v: '2.0.78', items: [
    '혼합 시뮬 구역 목록: 각 구역 해상도(W×Hpx) 표시 추가 — 구역 크기와 LED 종류 사이',
  ] },
  { v: '2.0.77', items: [
    '혼합 시뮬 랜선 탭: 포트 레이블(P1·P2…) 표시 임계값 32px→20px 완화, step 배지 fs 최솟값 클램프 추가',
  ] },
  { v: '2.0.76', items: [
    '혼합 시뮬 최종 해상도: 각 500mm 격자 열·행에서 최고 LED 픽셀 밀도 기준으로 실제 픽셀 수 계산',
    '혼합 시뮬 구역 편집 탭: 가이드 이미지 저장 기능 추가 (실제 최종 해상도 크기 PNG)',
  ] },
  { v: '2.0.75', items: [
    'betaImport PWR 시뮬: 500×1000mm 패널을 LAN sim처럼 실물 크기 하나의 직사각형으로 렌더링 (기존 서브셀 분할 방식 제거)',
  ] },
  { v: '2.0.74', items: [
    'betaImport PWR 시뮬: _drawImportedCvPwr() 신규 — 패널 실물 형태 기반 그리드 렌더링',
    'betaImport PWR: buildCv/cellAt 모두 imp.areaW/areaH 기반으로 통일 (LAN sim과 동일 좌표계)',
    '계산기탭 내보내기 시 사용된 모든 패널 크기 칩 동시 활성화',
  ]},
  { v: '2.0.73', items: [
    '파워콘 + 포트 / − 포트 버튼을 힌트 바 오른쪽 고정 위치로 이동',
    'portColor() hex 변환 수정 — hsl 문자열 반환 시 alpha 접미가 깨지던 버그 수정',
  ]},
  { v: '2.0.72', items: [
    '포트 색상 시스템 개선 — portColor() 헬퍼로 18개 초과 포트에 골든앵글 HSL 색상 자동 생성',
    '비어있는 포트도 고유 색상 테두리 표시',
  ]},
  { v: '2.0.71', items: [
    '혼합 내보내기 LAN 자동할당 수정 — 초기화 후 자동할당 시 원본 배치 복원',
    '파워콘 포트 동적 추가/제거 — + 포트 / − 포트 버튼',
  ]},
  { v: '2.0.70', items: [
    '혼합 내보내기 파워콘 자동할당: 구역(zone)별 분리 포트 배선',
  ]},
  { v: '2.0.69', items: [
    '혼합 내보내기 시 파워콘 시뮬레이터 데드존 회색 표시·선택 불가',
  ]},
  { v: '2.0.68', items: [
    '합계 열에 총 랙 수 표시 (HTML 결과·PNG 모두 적용)',
  ]},
  { v: '2.0.67', items: [
    'PNG 저장 계산결과에 LED×패널 표 반영 (일반·혼합 모드)',
    '혼합 내보내기 최종 해상도: 최고 픽셀 LED 기준 + 구역별 해상도 표시',
  ]},
  { v: '2.0.66', items: [
    '내보내기 계산결과 표: 500×1000·1000×500 동일 패널로 열 통합',
  ]},
  { v: '2.0.65', items: [
    '혼합 LED 내보내기 저장/불러오기 시 LED 칩 다중선택 상태 복원',
  ]},
  { v: '2.0.64', items: [
    '혼합 시뮬 내보내기 계산결과: 랙 수 표시 추가 (기존 계산기탭 양식 통일)',
  ]},
  { v: '2.0.63', items: [
    '계산결과 패널 표 형식 적용 (단일·멀티): LED×패널크기별 장 수·랙 수·해상도 표시',
  ]},
  { v: '2.0.62', items: [
    '내보내기 계산결과: LED×패널 크기별 장 수 표 및 해상도 표시',
    '파워콘 자동배선 데드존 제외 (내보내기·기본값 초기화 모두)',
    '내보내기 후 저장/불러오기 정상 복원',
  ]},
  { v: '2.0.61', items: [
    '혼합 시뮬β 계산기로 내보내기: 탭 활성화·PNG저장 버튼·결과 즉시 표시 수정',
  ]},
  { v: '2.0.60', items: [
    '혼합 시뮬β 내보내기 즉시 렌더링 수정 (Issue 1)',
    '혼합 패널 레이아웃(500×500+500×1000 등) 랜선 시뮬레이터에 그대로 반영 (Issue 2)',
  ]},
  { v: '2.0.59', items: [
    '혼합 시뮬β → 계산기 내보내기: 설치면적·LED·패널·LAN배선 자동 적용, 파워 배선 자동 생성',
    'LAN 시뮬레이터 포트 16개 확장 버튼 추가 (P8 옆 샌딩카드 확장)',
    '1000×500mm(가로) 패널 선택란 항상 표시',
  ]},
  { v: '2.0.58', items: [
    '혼합 시뮬β — LAN 배선 그래픽을 기존 랜선 시뮬레이터와 동일하게 통일 (셀 색상, 경로 굵기, 화살촉, 번호 배지, 포트 레이블, 포트 버튼 스타일)',
  ] },
  { v: '2.0.57', items: [
    '혼합 시뮬β — 랜선 배선 포트 8개→16개로 확장',
  ] },
  { v: '2.0.56', items: [
    '혼합 시뮬β — 면적 입력칸 너비 축소, white-space:nowrap 적용으로 한 행 표시 안정화',
  ] },
  { v: '2.0.55', items: [
    '혼합 시뮬β — 면적 입력 가로×세로×적용 한 행으로 수정',
  ] },
  { v: '2.0.54', items: [
    '혼합 시뮬β — 꾹 누르기 시 다음 빈 포트 자동 전환, mouseleave/touchcancel 정리, 구역별 균등 자동할당(_balancedCols) 적용',
  ] },
  { v: '2.0.53', items: [
    '혼합 시뮬β — PC 창 크기 변화 시 격자 좌표 오류 수정, resize 리렌더링 추가',
  ] },
  { v: '2.0.52', items: [
    '혼합 시뮬β — 설치 면적 입력 단위 mm → m로 변경',
  ] },
  { v: '2.0.51', items: [
    '혼합 시뮬레이터 β 재설계 — 격자 드래그 구역 선택, LED·패널 혼합, 랜선 시뮬레이터 완전 구현',
  ] },
  { v: '2.0.50', items: [
    '혼합 시뮬레이터 β 탭 추가 — Zone·행·패널 단위 자유 배치, 패널별 LED 피치·사이즈 독립 설정, LAN 포트 클릭 할당',
  ] },
  { v: '2.0.49', items: [
    '일정 불러오기 — 2mm LED 장비 적용 시 패널 기본값 500×500mm로 설정',
  ] },
  { v: '2.0.48', items: [
    '일정 불러오기 — 위치 링크 "지도" 텍스트 제거, PC에서 구글 지도 웹으로 폴백',
  ] },
  { v: '2.0.47', items: [
    '일정 불러오기 — 일정 카드에 불러오기 버튼 추가, 위치에서 주소만 추출하여 지도 앱 검색',
  ] },
  { v: '2.0.46', items: [
    '일정 불러오기 — 위치 링크 터치 시 geo: URI로 OS 지도 앱 선택창 호출',
  ] },
  { v: '2.0.45', items: [
    '일정 불러오기 — 위치 링크를 하이퍼링크 스타일로 변경, 모바일 터치 이벤트 분리 수정',
  ] },
  { v: '2.0.44', items: [
    '일정 불러오기 — 위치 링크 클릭 시 지도 앱(네이버·카카오·구글) 선택 바텀 시트',
  ] },
  { v: '2.0.43', items: [
    '일정 불러오기 — 위치 정보를 지도 앱 연결 링크로 표시',
  ] },
  { v: '2.0.42', items: [
    '일정 불러오기 — 아웃룩 일정의 위치(장소) 정보 표시',
  ] },
  { v: '2.0.41', items: [
    '랜선 시뮬레이터 — 포트당 픽셀 상한을 655,360으로 상향',
  ] },
  { v: '2.0.40', items: [
    '일정 불러오기 — 지난 일정 탭 카운트 뱃지 제거',
    '랜선 자동할당 — maxRaw가 홀수일 때 포트 끝이 바닥행 아닌 상단에서 끝나는 버그 수정 (numPorts 계산에 maxEven 기준 적용)',
  ] },
  { v: '2.0.39', items: [
    '일정 불러오기 — 지난 일정 탭에 과거 일정이 표시되지 않던 버그 수정',
  ] },
  { v: '2.0.38', items: [
    '랜선 자동할당 — 포트 수 동일 조건에서 포트별 열 수 균등 배분 (기본·바닥행분리 모드)',
  ] },
  { v: '2.0.37', items: [
    '일정 불러오기 — 예정/지난 일정 탭 분리',
    '랜선 시뮬레이터 — 첫 표시 시 자동할당 자동 적용',
  ] },
  { v: '2.0.36', items: [
    '일정 불러오기 — 패널 사이즈 자동 적용 시 "가로 사용" 버튼이 보이지 않던 버그 수정',
  ] },
  { v: '2.0.35', items: [
    'PNG 저장 — 가로 모드 시 해상도 이미지·파워콘 캔버스 패널 폭을 1000mm 픽셀 기준으로 수정',
    '시뮬레이터 캔버스 — 가로 모드 시 cellW 상한을 128px(단일)/120px(멀티)로 확대해 캔버스가 화면 폭 채우도록 수정',
    'PNG 스냅샷 — 가로 모드 시 패널 사이즈를 "1000 × 500 mm (가로 사용)"으로 표시',
  ] },
  { v: '2.0.34', items: [
    '계산 결과 — 최종 해상도 옆 대각선 인치수 뱃지 표시 (단일·멀티 모드 모두)',
    '패널 가로 사용 옵션 — 500×1000mm 선택 시 "↔ 가로 사용" 토글 활성화, 1000×500mm 배치로 계산·시뮬레이터 동작',
  ] },
  { v: '2.0.33', items: [
    '뒤로가기 종료 guard 완전 제거 — Android PWA OS 레벨 제약으로 JS 해결 불가',
  ] },
  { v: '2.0.31', items: [
    '뒤로가기 두 번 종료 기능 제거 — _pushGuardIfNeeded, _showExitToast, 관련 이벤트 리스너 삭제',
  ] },
  { v: '2.0.30', items: [
    '뒤로가기 종료 — location.hash 방식 롤백 (시작 시 토스트 표시 버그 수정), pushState 방식 복원',
  ] },
  { v: '2.0.26', items: [
    '뒤로가기 종료 — guard 중복 삽입 방지 (_pushGuardIfNeeded), pageshow 타이밍 보완, 두 번째 back 시 타이머 즉시 취소',
  ] },
  { v: '2.0.25', items: [
    '뒤로가기 종료 — 백그라운드 복귀 시 guard 자동 복원 (visibilitychange 감지)',
  ] },
  { v: '2.0.24', items: [
    '뒤로가기 종료 — window.close() 제거 (Android PWA 미지원), 히스토리 소진 방식 복원',
    '종료 토스트 — 화면 정중앙 표시, 크기·가독성 개선',
  ] },
  { v: '2.0.23', items: [
    '뒤로가기 종료 — guard 즉시 재삽입 + window.close() 호출로 두 번째 뒤로가기 앱 종료 보장',
    'CSS — overscroll-behavior-y:none 추가 (당겨서 새로고침 비활성)',
  ] },
  { v: '2.0.22', items: [
    '저장/불러오기 — 랜선·파워콘 여유 선 수치 저장 버그 수정 (rst() 호출이 spareAdj를 덮어쓰던 문제)',
    '일정 불러오기 — 지난 날짜 일정은 목록에 표시하지 않음',
  ] },
  { v: '2.0.21', items: [
    '_lanPA 이중 선언 SyntaxError 수정 — 앱 전체 먹통 긴급 수정',
  ] },
  { v: '2.0.20', items: [
    'PNG 저장 — 랜선/파워콘 필요 개수 표시 추가 (필요 N · 여유 N 형식)',
    'PNG 저장 — 파워콘 탭 활성 시 랜선 수량이 파워콘 데이터로 오염되던 버그 수정',
  ] },
  { v: '2.0.19', items: [
    'PNG 저장 — 포트 할당 영역이 파워콘 탭 활성 여부와 무관하게 항상 랜선 데이터 표시',
  ] },
  { v: '2.0.18', items: [
    '계산 결과 — 패널 수 옆에 랙 개수 표시 (500×1000: 12장/랙, 500×500: 24장/랙)',
  ] },
  { v: '2.0.17', items: [
    '일정 파싱 — 멀티 섹션 지원 (중앙/좌우/좌측/우측 키워드 자동 인식, 멀티 모드 자동 전환)',
  ] },
  { v: '2.0.16', items: [
    '일정 목록 — 네이버밴드 자동 꼬리말 제거, 날짜·내용 가독성 개선',
  ] },
  { v: '2.0.15', items: [
    'SW 캐시 — msal-browser.min.js 항목 제거',
  ] },
  { v: '2.0.14', items: [
    '일정 fetch — corsproxy.io 자동 경유 (Outlook CORS 차단 자동 우회)',
  ] },
  { v: '2.0.13', items: [
    '일정 ICS URL 코드에 내장 — 사용자 설정 불필요',
  ] },
  { v: '2.0.12', items: [
    '일정 불러오기 — MSAL/Azure 제거, Outlook 공개 ICS URL 방식으로 전환 (로그인 불필요)',
    'ICS 파서 내장 — VEVENT 블록 파싱, 오늘 이후 일정만 표시',
  ] },
  { v: '2.0.11', items: [
    '일정 파싱 — Claude API 제거, 로컬 정규식으로 전환 (CORS 오류 해결)',
    '일정 설정 — Claude API 키 항목 제거, Azure 클라이언트 ID만 필요',
  ] },
  { v: '2.0.10', items: [
    'MSAL 로컬 파일로 전환 (msal-browser.min.js) — 외부 CDN 의존 제거',
  ] },
  { v: '2.0.9', items: [
    'SW fetch 핸들러 — 크로스오리진 요청 SW 개입 제거 (외부 CDN 로드 실패 원인 수정)',
    'MSAL CDN jsDelivr로 변경',
  ] },
  { v: '2.0.8', items: [
    '일정 모달 — 헤더 설정 버튼 추가, API 키 변경 가능',
    'MSAL CDN을 unpkg로 변경 (Microsoft CDN 로드 실패 대응)',
  ] },
  { v: '2.0.7', items: [
    '일정 불러오기 — 계산기 탭에서 Outlook 일정 선택 시 Claude API가 LED 피치·설치 면적을 파싱해 자동 적용',
  ] },
  { v: '2.0.6', items: [
    '뒤로가기 모달 처리 — PNG저장·상태저장·vMix저장·체크리스트초기화·이스터에그 모달 열린 상태에서 뒤로가기 시 닫힘',
    '종료 안내 토스트 스타일 통일 — z-index 600, 배경색 #1a1a1a으로 조정',
  ] },
  { v: '2.0.5', items: [
    '뒤로가기 탭 이동 제거 — 탭 전환은 history 기록 없이 종료 안내 토스트만 작동',
  ] },
  { v: '2.0.4', items: [
    '뒤로가기 탭 이동 — 탭 전환 시 history 기록, 뒤로가기로 이전 탭 복원',
    '뒤로가기 종료 안내 토스트 개선 — 전용 요소로 교체, _showExitToast 안정화',
  ] },
  { v: '2.0.3', items: [
    '뒤로가기 종료 안내 — 열린 레이어 없을 때 뒤로가기 시 "한 번 더 누르면 앱이 종료됩니다" 토스트 표시, 2.5초 내 재입력 시 앱 종료',
  ] },
  { v: '2.0.2', items: [
    '모바일 뒤로가기 버튼으로 앱 종료 방지 — 미리보기·PDF·튜토리얼·시뮬레이터·계산기·확인 다이얼로그 열린 상태에서 뒤로가기 시 레이어만 닫힘',
  ] },
  { v: '2.0.1', items: [
    '튜토리얼 이미지 뷰어 추가 — 장비 체크리스트·vMix 탭 상단 ? 버튼으로 탭별 튜토리얼 이미지 슬라이드 뷰어 (좌우 스와이프·핀치 줌)',
  ] },
  { v: '2.0.0', items: [
    '정식 버전 2.0 출시',
  ] },
  { v: '1.0.89', items: [
    '상단 업데이트 버튼 및 이스터에그 기능소개 이미지 만들기 기능 제거',
  ] },
  { v: '1.0.88', items: [
    '멀티섹션 계산 결과에서 vMix 픽셀 검증 기능 제거',
  ] },
  { v: '1.0.87', items: [
    '체크리스트 초기화 선택 기능 추가 — 체크박스·메모만 초기화 / 장비 목록 및 순서까지 완전 초기화 선택 가능',
  ] },
  { v: '1.0.86', items: [
    'vMix 화면비율·포지션복사·레이어설정 탭에 카테고리 스와치 필터 추가 — 카테고리0 선택 시 전체 소스 표시',
  ] },
  { v: '1.0.85', items: [
    'vMix 레이어 설정 아코디언 — 소스 카드 클릭 시 레이어 설정 펼치기/접기, 번호·이름 검색창 순서 변경',
  ] },
  { v: '1.0.84', items: [
    'vMix 레이어 설정 검색 분리 — 이름 검색(텍스트)·번호 검색(숫자) 입력창 분리, AND 조건 필터',
  ] },
  { v: '1.0.83', items: [
    'vMix 레이어 설정 탭 신설 — 소스 이름·번호 검색, 소스별 레이어 1~3 직접 편집, 수정됨 뱃지·초기화 지원',
  ] },
  { v: '1.0.82', items: [
    'vMix 분할 장표 생성 탭 개선 — 메인/사이드/템플릿 카테고리를 색상 스와치로 직접 지정, 분석 결과(템플릿명·메인 장표 수) 실시간 표시',
  ] },
  { v: '1.0.81', items: [
    'vMix 자동 분할 탭 추가 — Cat3 통합 템플릿 기반으로 Cat1 메인 장표 수만큼 VI 자동 생성, 메인 슬롯 자동 탐지',
  ] },
  { v: '1.0.80', items: [
    '전체 초기화 시 체크리스트 항목별 메모(chkNotes)도 함께 초기화',
  ] },
  { v: '1.0.79', items: [
    'EC100 콘솔 추가 — LC 광케이블 · HDMI 리피터, 메뉴얼은 추후 업로드 예정',
  ] },
  { v: '1.0.78', items: [
    '체크리스트 항목별 메모 추가 — ✎ 버튼으로 인라인 입력, 메모 유무가 아이콘 색으로 표시, 앱 재실행 후에도 유지',
    '체크리스트 PNG 저장 개선 — 체크됐거나 메모가 있는 항목만 표시, 메모 내용 포함 출력',
  ] },
  { v: '1.0.77', items: [
    '체크리스트 순서 변경을 드래그 앤 드롭으로 교체 — 핸들(⠿) 터치/드래그로 재정렬, 데스크톱·모바일 모두 지원',
  ] },
  { v: '1.0.76', items: [
    '체크리스트 개인화 영구 저장 — 항목 추가/제거/순서 변경·체크 상태가 앱 재실행·업데이트 후에도 유지 (ledCalcChkCustom)',
  ] },
  { v: '1.0.75', items: [
    'vMix 저장 버튼 개선 — 수정사항 없으면 비활성(무채색), 있으면 활성화; 클릭 시 수정된 탭 체크 팝업 후 다운로드',
    'vMix 탭 내 수정된 .vmix 파일 다운로드 버튼 제거 (하단 바 버튼으로 통합)',
  ] },
  { v: '1.0.74', items: [
    '하단 바 탭별 동작 분리 — vMix 탭: 초기화→원본 복원, PNG 저장→.vmix 파일 저장',
    'vMix 서브탭 초기화 버튼 공통 위치(서브탭 오른쪽)로 통합 — 활성 탭 전환 시 자동으로 해당 초기화 함수 연결',
  ] },
  { v: '1.0.73', items: [
    'PNG 저장 파워콘 포함 여부 선택 — 배선 커스텀 유무·탭 방문 여부 무관하게 체크박스 항상 표시, 미방문 시 기본 배선 임시 생성',
    'PNG 파워콘 캔버스 simCanvas 직접 캡처 — _buildPwrCanvas 대신 실제 시뮬레이터 화면 그대로 저장',
  ] },
  { v: '1.0.72', items: [
    '바닥행 분리 멀티 모드 픽셀 초과 수정 — 통합 바닥행 포트가 MAX_PX 초과 시 자동 분할 할당',
    '파워콘 배선 수량 실시간 연동 — 실제 할당 기반 1번 파워·숏파워 개수 계산(_calcPwr), 배선 변경 즉시 반영',
    '계산 결과 PNG 시뮬레이터 개선 — 활성 탭 무관하게 랜선 캔버스 항상 포함, 커스텀 파워콘 배선도 자동 추가',
  ] },
  { v: '1.0.71', items: [
    '배선 직선화 추가 수정 — 열 전환 시 돌출 꺾임 제거, LED 셀 중앙에서 바로 직선으로 이어지게 변경',
    '파워콘 탭 전체 초기화 버튼 추가 — 기본값 초기화 왼쪽에 배치, 모든 배선 완전 삭제',
    'PNG 저장·미리보기 파워콘 캔버스 멀티 모드 지원 — genResImageMulti에 파워콘 배선 레이아웃 추가',
  ] },
  { v: '1.0.70', items: [
    '바닥행분리 유·불리 칩 개선 — 컬러 배경 chip(초록/주황/회색) 으로 더 눈에 띄게 변경, 멀티 모드에서도 바닥행분리 버튼에 유·불리 표시',
    '배선 연결선 직선화 — quadraticCurveTo 곡선 제거, 꺾임 부분도 직각 꺾임선(lineTo 3단계)으로 변경',
    '파워콘 기본배선 스네이크 패턴 — 짝수 열 아래→위, 홀수 열 위→아래로 수정하여 바닥행에서 시작·끝 보장',
    '멀티 모드 파워콘 시뮬레이터 정상 동작 — _isDefaultPwrWiring 멀티 모드 지원 추가',
    '파워콘 포트 18개로 확장 — PWR_PORT_COUNT = 18, PC 색상 18개',
    'simSum 상시 랜선+파워콘 표시 — 파워콘 탭에서도 LAN 배선 현황과 파워콘 배선 현황 함께 표시',
  ] },
  { v: '1.0.69', items: [
    '자동할당 버튼 그룹 UI — 랜선 탭에서 "자동할당" 라벨 아래 기본·바닥행분리 버튼 묶음 표시, 단일 모드에 유·불리 뱃지 표시',
    '멀티 모드 자동할당 — 기본(통합)/섹션별분리/바닥행분리 3버튼 구성, 바닥행분리는 섹션 경계 무시 통합 방식 적용',
    '파워콘 시뮬레이터 탭 추가 — 랜선 시뮬 영역에 "파워콘" 탭 신설, 기본 2열당 1개 자동 배선, 자동할당·픽셀 제한 미표시',
    'PNG 저장 시 파워콘 커스텀 배선이면 LED 그리드 아래에 파워콘 배선 레이아웃 자동 추가',
  ] },
  { v: '1.0.68', items: ['랜선 자동할당 "바닥행 분리" 옵션 추가 — 바닥행 전체를 별도 포트에 수평 배선하고 나머지 행을 열 단위 뱀형 배선하여 포트 수 절감'] },
  { v: '1.0.67', items: ['토스트 IIFE에서 updateToast 미존재 시 TypeError → 이후 let 선언 TDZ 에러 연쇄 수정 — DOMContentLoaded 후 DOM 접근으로 변경'] },
  { v: '1.0.66', items: ['새로고침 버튼 수정 — RECACHE_CORE로 SW 캐시 갱신 후 reload, sessionStorage fail-safe 처리', '계산기 디스플레이 개편 — 식이 큰 폰트로 실시간 표시, 중간 계산 결과가 작은 폰트 미리보기로 표시, = 누를 때만 결과가 큰 폰트로 전환'] },
  { v: '1.0.65', items: ['PWA 자동 업데이트 — 백그라운드 중 새 SW 활성화 시 포그라운드 복귀 때 자동 리로드, 앱 재시작 시 버전 비교로 자동 업데이트 감지. 업데이트 적용 시 토스트 알림 표시'] },
  { v: '1.0.64', items: ['PWA 새로고침 버튼 스코프 버그 수정 — async function 선언은 if 블록 안에서 전역 호이스팅 안 됨, window._swReload 명시 할당으로 onclick 접근 보장'] },
  { v: '1.0.63', items: ['PWA 새로고침 버튼 수정 — reg.waiting 존재 시 SKIP_WAITING 메시지로 새 SW 명시 활성화 후 controllerchange 대기, 구 SW에 RECACHE_CORE 보내던 경쟁 조건 해소'] },
  { v: '1.0.62', items: ['계산기 수식 표시 개선 — cParts 배열로 수식 누적, = 누를 때만 계산하여 다항식 전체를 cExpr에 표시, DEL로 연산자 취소 가능'] },
  { v: '1.0.61', items: ['랜선 시뮬레이터 "전체화면" 버튼 → "가로모드" 이름 변경', '가로모드 캔버스 크기를 상하단 UI 영역 제외한 가용 높이에 맞게 자동 조정(단일·멀티 모드)', 'PNG 미리보기 스크롤 추가 — 긴 이미지 전체 확인 가능', 'PNG 저장 성능 개선 — toDataURL → toBlob+createObjectURL 전환, 저장 후 blob URL revoke로 메모리 누수 방지', '계산기 다항식 지원 — 연산자 연속 입력 시 중간 결과 누적 계산'] },
  { v: '1.0.60', items: ['업데이트 내역 버튼 추가 — 탭 우측 상단에 기능 추가 이력만 날짜와 함께 표시하는 모달 버튼, 이스터에그 패치 내역과 분리'] },
  { v: '1.0.59', items: ['PWA 업데이트 배너 타이밍 수정 — 배포 완료 전 알림 방지: script.js no-store 폴링으로 새 APP_VERSION 확인 후 배너 표시, 새로고침 시 SW에 RECACHE_CORE 메시지로 핵심 에셋 강제 재캐시 후 reload'] },
  { v: '1.0.58', items: ['포지션 복사 탭 "undefined번" 버그 수정 — Map.get() 미존재 키가 undefined를 반환할 때 !==null 조건 통과하는 문제를 !==undefined로 교체'] },
  { v: '1.0.57', items: ['기능 소개 이미지 생성 추가 — 이스터에그 팝업에서 앱 주요 기능 6종을 담은 1080×1920 PNG 다운로드'] },
  { v: '1.0.56', items: ['전체화면 픽셀 제한 표시를 자동할당 버튼 행 우측으로 이동(한 줄 컴팩트), LED 캔버스 영역 확보', '워터마크 로고 크기 4m×4m 기준으로 수정(sp.px500.w × 1.84)'] },
  { v: '1.0.55', items: ['전체화면 시뮬레이터 터치 시 포트 자동 전환 버그 수정 — openSimFs·_refreshSimFs에서 attachEv 중복 호출 제거(캔버스 이동 시 리스너 유지됨)'] },
  { v: '1.0.54', items: ['워터마크 로고 크기 고정 — 4x4 px500 패널 기준값(sp.px500.w × 1.04)으로 단일·멀티 모드 동일 고정, tH 캡 제거'] },
  { v: '1.0.53', items: ['워터마크 로고 배수 1.2→2.4 확대'] },
  { v: '1.0.52', items: ['워터마크 로고 크기 기준을 패널 1열 픽셀 폭(sp.px500.w * 1.2) 고정으로 변경 — 단일·멀티 모드 동일 공식 적용, 열 수에 무관하게 일정한 로고 크기'] },
  { v: '1.0.51', items: ['전체화면 시뮬레이터 안에서 확인 팝업이 보이지 않는 문제 근본 수정 — openConfirm 호출 시 confirmBg를 fullscreen 컨테이너(simFsBg) 안으로 이동, 닫을 때 body로 복원'] },
  { v: '1.0.50', items: ['전체화면 시뮬레이터 위에서 확인 팝업 가려짐 수정 — modal-bg z-index 200→400', '단일 모드 워터마크 로고 크기를 캔버스 가로·세로 비율 모두 고려하도록 수정(tW*0.23 vs tH*0.26 중 작은 값)'] },
  { v: '1.0.49', items: ['랜선 시뮬레이터 전체화면 — 가로화면 자동 전환, 포트·픽셀정보·자동할당·초기화 표시, 캔버스 중앙 배치, 화면 너비 제한 해제'] },
  { v: '1.0.48', items: ['워터마크 로고 8% 확대(0.213→0.230), y 위치 상단 플러시', '랜선 시뮬레이터 전체화면 — 캔버스만 표시, 닫기 버튼 우상단 고정, 전체화면 시 너비 제한 해제'] },
  { v: '1.0.47', items: ['멀티 섹션 세로 통일 버튼 추가, 좌우 동일 버튼 제거', '워터마크 로고 7% 확대(0.199→0.213), 멀티모드 로고 중앙 패널 좌상단 기준으로 위치·크기 동기화'] },
  { v: '1.0.46', items: ['워터마크 이미지 탭 사라짐 수정 — _loadImg crossOrigin:anonymous 추가로 canvas taint SecurityError 방지'] },
  { v: '1.0.45', items: ['워터마크 로고 크기 15% 축소(0.234→0.199), 좌상단 구석 배치(margin 3%→1%), 단일·멀티 모드 동기화'] },
  { v: '1.0.44', items: ['미리보기 이미지 스크롤 없이 한 화면에 맞게 조정', '워터마크 로고 크기 30% 확대(0.18→0.234)', '랜선 시뮬레이터 전체화면 버튼 추가 — 전체화면에서 모든 할당 기능 동작'] },
  { v: '1.0.43', items: ['PWA 업데이트 감지 개선 — updateViaCache:none 적용(GitHub Pages 캐시 우회), updatefound/statechange 핸들러 추가', '멀티 섹션 이미지 탭 가시성 수정 — wmUrl 없을 때 워터마크 탭 숨김, 단일↔멀티 전환 시 탭 상태 올바르게 리셋'] },
  { v: '1.0.42', items: ['멀티 섹션 모드 이름 변경 (좌·중·우 → 멀티 섹션)', '멀티 섹션 해상도 이미지 생성 추가 — 기본·워터마크·섹션별·워터마크+섹션별 4종'] },
  { v: '1.0.41', items: ['if 중괄호 추가 시 else if 구조 오파스 수정 — SyntaxError 해결'] },
  { v: '1.0.40', items: ['리팩토링 — 30+ 전역 변수를 State 단일 객체로 통합, 느슨한 비교(==)→엄격한 비교(===) 전수 교체, if 문 중괄호 전수 추가, 컬럼 정렬 공백 제거'] },
  { v: '1.0.39', items: ['EC90 메뉴얼 파일명 공백 제거(MIG-EC90_User_Manual_1.0.pdf) — file:// 환경 경로 오류 수정', '워터마크 로고 getImageData 제거 — 3Y_no_bg.png는 투명 PNG이므로 drawImage 직접 렌더로 교체(CORS SecurityError 방지)'] },
  { v: '1.0.38', items: ['코드 정돈 — HTML 인라인 스타일 CSS 클래스 분리, renderResMulti 헬퍼 함수 추출(_buildCoverHtml·_buildSectionRowHtml)'] },
  { v: '1.0.37', items: ['vMix 버츄얼 인풋 생성 탭 추가 — 소스 선택·생성 수 입력 후 일괄 생성, 각 VI별 레이어(Overlay0~2) 숫자 입력+드롭다운 편집', '각 기능 탭 초기화 버튼 추가(화면비율·포지션 복사·버츄얼 인풋 생성)', '포지션 복사 적용 소스에 복사 원본 번호 표시, 전체 선택·붙여넣기 컨트롤 목록 상단 이동', '화면비율 탭 전체 선택 체크박스 제거', 'VI 순번 정확도 개선(최상위 Input 직접 카운트), 레이어 번호 입력칸 소형화'] },
  { v: '1.0.36', items: ['vMix 매크로 소스 선택 적용 — 순서 번호 표시, 개별 체크박스로 선택 후 Widescreen 변환, 소스 위치값(줌·이동·레이어 전체) 복사→다른 소스에 붙여넣기'] },
  { v: '1.0.35', items: ['vMix 소스 매크로 탭 추가 — .vmix 파일 업로드 후 소스 화면비율을 원본→와이드스크린(16:9)으로 일괄 변환, 수정된 파일 다운로드'] },
  { v: '1.0.34', items: ['vMix 보정 비율에 소스 조정값 추가 — LED < 소스 시 양쪽 자르기 픽셀(각 Xpx), LED > 소스 시 확대 배율(×Z), 한쪽 자르기 3px 이하/확대 2% 이하면 시각 오차 미미 표시'] },
  { v: '1.0.33', items: ['vMix 보정 비율 알고리즘 개선 — 각 섹션 독립 반올림으로 픽셀 변화 최소화, 합산 오차는 오차가 큰 섹션이 ±1스텝 흡수, 최대 픽셀 변화 표시'] },
  { v: '1.0.32', items: ['vMix 보정 비율 재설계 — 유효 픽셀 단위(T/gcd(100000,T)) 기반, 중앙 확대(좌우 내림)·좌우 확대(좌우 올림) 두 모드, 좌우 대칭 자동 적용, 보정 비율 5자리 표기, 픽셀 변화 표시'] },
  { v: '1.0.31', items: ['vMix 보정 비율 계산 추가 — 중앙 조정(좌우 확정·중앙 흡수)·좌우 대칭 조정(중앙 확정·좌우 동일) 두 모드, 대칭 불가 시 중앙 ±1px 두 옵션 제시, 보정 비율(10자리)·비율·픽셀 변화 표시'] },
  { v: '1.0.30', items: ['vMix 픽셀 검증 재설계 — LED 실제 해상도 고정 기준, 5자리 비율×전체 vs 실제 픽셀 오차 비교, 반올림 시 중앙 흡수 픽셀 변동, 오차 있을 때 10자리 정수화 비율 제시'] },
  { v: '1.0.29', items: ['멀티 모드 Y이동 소수점 3자리로 축소, vMix 픽셀 계산 숨김 패널 추가 (해상도 입력 → 정수 여부·흡수 섹션·최소 권장 해상도 표시)'] },
  { v: '1.0.28', items: ['멀티 모드 비율 소수점 5자리로 확대, 좌측·우측에 vMix Y축 이동값 추가 표시 (좌: 비율-1, 우: 1-비율)'] },
  { v: '1.0.27', items: ['멀티 모드 계산 결과에 섹션별 가로 해상도 비율 표시 — 전체 가로를 1로 두고 소수점 4자리'] },
  { v: '1.0.26', items: ['자동 할당 규칙 적용 — 포트 양끝 바닥행 보장을 위해 짝수 열 단위로 분배, 나머지는 새 포트 강제 없이 그대로 할당 (섹션별 분리·통합 모두 적용)'] },
  { v: '1.0.25', items: ['멀티 모드 키보드 방향키 할당 수정 — 섹션 프리픽스 처리로 화면 표시 정상화', '할당 순서 번호가 배선 경로 위에 표시되도록 드로우 순서 수정', '자동 할당 두 가지 모드 추가 — 섹션별 분리(기존) · 통합(전체 하나의 벽으로 처리)'] },
  { v: '1.0.24', items: ['멀티 모드 배선 경로 수정 — 섹션 간 포트 연결 시 배선 연속 표시, 순서 번호 전 섹션 통합'] },
  { v: '1.0.23', items: ['랜선 시뮬레이터 멀티 모드 — 좌/중/우 섹션 통합 캔버스 표시(섹션 간 간격 구분)', '포트 1개로 여러 섹션 패널 동시 할당 가능(섹션 간 포트 연결)', '자동 할당 시 섹션 순서대로 포트 연속 배분'] },
  { v: '1.0.22', items: ['설치 면적 단일/멀티(좌·중·우) 모드 토글 추가', '멀티 모드: 좌측·중앙·우측 각각 독립 입력, 좌↔우 크기 복사 버튼', '계산 결과: 합산 패널 수 + 섹션별/전체 해상도 분리 표시'] },
  { v: '1.0.21', items: ['워터마크 레이어 순서 개선 — 사명 타일 최하단 배치, 우하단 로고 제거, 좌상단 로고 크기 확대(18%)'] },
  { v: '1.0.20', items: ['로고 이미지 git 추가(배포 누락 수정), 흰 배경 픽셀 제거 후 투명 PNG로 합성'] },
  { v: '1.0.19', items: ['워터마크 로고 렌더링 수정 — getImageData 제거(CORS SecurityError 원인), drawImage 직접 렌더로 교체'] },
  { v: '1.0.18', items: ['해상도 숫자·주황 바 완전 불투명, 워터마크 로고 좌상단 추가(좌상단·우하단 양쪽 배치)'] },
  { v: '1.0.17', items: ['워터마크 사명 타일 → 캔버스 텍스트 직접 렌더(이미지 의존 제거), 로고 RGB>230 투명 처리 + 0.80'] },
  { v: '1.0.16', items: ['워터마크 가시성 재개선 — 텍스트 알파 이중곱 제거(→순백 255), 타일 0.30·로고 0.70'] },
  { v: '1.0.15', items: ['워터마크 가시성 개선 — 픽셀 처리로 흰 배경 제거, 텍스트 흰색 반투명 타일, 로고 흰 배경 제거'] },
  { v: '1.0.14', items: ['주황 장식선 두께 격자선의 2배로 수정', '_buildWmCanvas 구조 개선 — 탭 항상 표시, 이미지 로드 실패 격리'] },
  { v: '1.0.13', items: ['격자선 볼드(opacity 0.60, lineWidth 개선)', 'SW캐시에 3Y 이미지 추가 → 워터마크 탭 정상 표시'] },
  { v: '1.0.12', items: ['해상도 이미지 격자 실선·폰트 1.5배 확대', '워터마크 버전 추가 — 사명 대각선 타일·우하단 로고, 기본/워터마크 탭 선택'] },
  { v: '1.0.11', items: ['해상도 이미지 리디자인 — 라벨·px 단위 제거, 폰트 60% 축소, × 주황 강조, 비네팅·장식선 추가'] },
  { v: '1.0.10', items: ['자동할당 배분 방식 변경 — 앞 포트부터 최대 열 수 채우기 (Greedy, 균등 배분 후순위)'] },
  { v: '1.0.9', items: ['여유분 입력 필드 전역 CSS 충돌 해소 (width:100% 덮어쓰기 방지, 여유 텍스트 옆 인라인 배치)'] },
  { v: '1.0.8', items: ['여유분 입력 필드 줄바꿈 방지 (여유 텍스트와 동일 줄 배치, 세 자리 수 표시 너비)'] },
  { v: '1.0.7', items: ['자동할당 4규칙 적용 (65만px·바닥시작·바닥끝허용·포트최소화)', '해상도 이미지 생성 기능 추가 (패널 격자 점선·중앙 해상도 표시)'] },
  { v: '1.0.6', items: ['자동할당 포트당 65만px 초과 방지 (열 수 정확 제한)', '자동할당 뱀 경로 시작·끝 항상 바닥행 보장 (짝수 열 단위)', '1번랜 메인·백업 카운트 폰트 가시성 개선', '여유분 입력필드 너비 축소 (여유 텍스트 옆 배치)'] },
  { v: '1.0.5', items: ['비활성 포트 레이블 시인성 개선 (아웃라인 강도 동일화)', '순서 번호를 배선 경로 위에 렌더링 (3-pass 구조)', '순서 번호 흰 원형 배지 디자인', 'cc-qty-row 13px / 여유분 입력 필드 20px 소형화'] },
  { v: '1.0.4', items: ['포트 레이블 다크 아웃라인으로 시인성 개선', '케이블 수량 카드 컴팩트 재설계 (필요·여유 한 줄 표시, 인라인 입력 필드)'] },
  { v: '1.0.3', items: ['랜선 시뮬레이터 배선 경로 베지어 곡선으로 매끄럽게 개선', '셀에 포트 내 연결 순서 번호 표시', '케이블 여유분 직접 수정 가능 (필요 개수·여유분 분리 표시)'] },
  { v: '1.0.2', items: ['콘솔 칩 순서 변경 (EC90 → J6 우선)', '케이블 수량 표시 UI 전면 개선 (카드형 컴팩트 레이아웃)', '1번 랜 계산 메인+백업 2배 적용', '전 케이블 여유분 자동 포함 및 표시', '숏랜 20개/숏파워 10개 묶음 수 표시', '뱀경로 화살표 시인성 개선 (흰 외곽선 추가)'] },
  { v: '1.0.1', items: ['SW 캐시 버전 관리 개선', 'PDF 뷰어 풀스크린 · 연속 스크롤', '핀치 줌 · 줌아웃 최솟값 적용', 'Samsung Internet 다운로드 버그 수정', '앱 업데이트 자동감지 배너 추가', 'PDF 뷰어 뒤로가기 버튼 앱 종료 버그 수정', 'EC90 메뉴얼 파일명 공백 오류 수정', 'manifest id 추가 — Google Play Protect 경고 해소', '랜선 시뮬레이터 자동 포트 할당 기능 추가'] },
  { v: '1.0.0', items: ['최초 릴리스 — 면적/패널 계산, 체크리스트, 메모, PNG 저장'] },
];


// LED 피치별 패널 해상도 (px) — px500: 500×500mm 패널, px1000: 500×1000mm 패널
const SPECS = {
  '2mm': { px500: { w: 192, h: 192 }, px1000: { w: 192, h: 384 } },
  '3mm': { px500: { w: 128, h: 128 }, px1000: { w: 128, h: 256 } },
  '4mm': { px500: { w: 104, h: 104 }, px1000: { w: 104, h: 208 } },
};

const MAX_PX = 655360; // 포트당 최대 픽셀 수 상한
const LP_MS = 380;    // 마우스 롱프레스 임계값 (ms)
const LP_TOUCH = 600;   // 터치 롱프레스 임계값 (ms) — 일반 탭과 명확히 구분하기 위해 더 길게 설정

const PWR_PORT_COUNT = 18;

// 포트 색상 (기본 18개 + 확장 색상 생성)
const PC = [
  '#378ADD','#E24B4A','#EF9F27','#1D9E75','#7F77DD','#D85A30','#5DCAA5','#D4537E',
  '#2196F3','#9C27B0','#FF5722','#00BCD4','#8BC34A','#FF9800','#607D8B','#E91E63',
  '#795548','#009688',
];
function _hslToHex(h, s, l) {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1))).toString(16).padStart(2, '0'); };
  return `#${f(0)}${f(8)}${f(4)}`;
}
function portColor(i) {
  if (i < PC.length) { return PC[i]; }
  // PC 범위 초과 시 골든 앵글 분산으로 hex 색상 생성 (alpha 접미 호환)
  return _hslToHex(Math.round((i * 137.508) % 360), 65, 42);
}

// 콘솔 장비 스펙
const CSPEC = {
  EC90:  { cable: 'LC 광케이블', rep: 'HDMI 리피터', manual: 'MIG-EC90_User_Manual_1.0.pdf' },
  EC100: { cable: 'LC 광케이블', rep: 'HDMI 리피터', manual: null },
  J6:    { cable: 'SC 광케이블', rep: 'DVI 리피터',  manual: 'J6-Seamless-Switcher-Specifications-V2.2.0.pdf' },
};

// 샌딩카드 스펙 — modes 배열: Hz 내림차순으로 커버 가능 여부를 판단
const SSPEC = {
  '660pro': {
    label: '660 Pro',
    manual: 'MCTRL660PRO.pdf',
    modes: [
      { maxW: 1920, maxH: 1200, maxHz: 60 },
      { maxW: 2560, maxH: 1600, maxHz: 30 },
    ],
  },
  '4k': {
    label: '4K',
    manual: 'MCTRL4K.pdf',
    modes: [{ maxW: 3840, maxH: 2160, maxHz: 60 }],
  },
};


// ── 전역 앱 상태 ──────────────────────────────────────────

const TUTORIAL_IMAGES = {
  chk:  ['온보딩 이미지/2.png', '온보딩 이미지/3.png', '온보딩 이미지/4.png'],
  vmix: ['온보딩 이미지/6.png', '온보딩 이미지/7.png', '온보딩 이미지/8.png', '온보딩 이미지/9.png'],
};

const DEFAULT_COM = [
  '케이블타이','메인선','분전함','샌딩카드 (컨트롤러)','광케이블',
  '셋팅용 노트북','메인 노트북','3구 파워콘','멀티탭',
  '공구통 (쪽가위·드라이버·줄자·개퍼테이프·전동공구·깔판 등)',
  '모니터','콘솔','리피터',
];
const DEFAULT_COND = [
  '안전모','하네스',
  '220V 1번 파워','랜선 커플러','파워콘 커플러','프로파일','웨이트',
  '옐로재킷','고무판','비닐','끈바','깔깔이','접지봉',
  'HDMI','프롬프터','전기릴선','퍼팩트큐','테이블',
  '카메라','삼각대','오인페','SDI 케이블','캡처보드',
];

const State = {
  // 선택 상태
  curLed:      null,
  basePH:      null,
  panelRotated: false,
  curSending:  null,

  // 면적 / 시뮬레이터 모드
  areaMode:     'single',
  activeSimSec: 'center',

  // 단일 모드 레이아웃
  cols:   0,
  layout: [],

  // 멀티 모드 레이아웃 (_mkSec 은 함수 선언이라 호이스팅됨)
  multiSec:       { left: _mkSec(), center: _mkSec(), right: _mkSec() },
  multiCvOffsets: { left: -1, center: -1, right: -1 },

  // 랜선 시뮬레이터
  pA:       Array.from({ length: 8 }, () => new Set()),
  pH2:      Array.from({ length: 8 }, () => []),
  aPort:    0,
  fCell:    null,
  cellW:    40,
  rH:       [],
  lpT:      null,
  drag:     false,
  dStk:     [],
  dHov:     null,
  spareAdj: { l1: 2, sl: 20, c1: 2, sp: 20 },

  // 체크리스트
  COM: [...DEFAULT_COM],
  COND: [...DEFAULT_COND],
  chkState: {},
  chkNotes: {},

  // 메모
  memoList: [],

  // 버전 이스터에그
  _verTaps:  0,
  _verTimer: null,

  // 튜토리얼 뷰어
  _tutImgs: [], _tutIdx: 0, _tutReady: false, _tutZoom: 1,

  // 소형 계산기
  cDisp: '0', cParts: [], cNew: true, cExpr: '',

  // 시뮬레이터 탭 ('lan' | 'pwr')
  simTab: 'lan',
  _savedLan: null,  // 파워콘 탭 활성 중 저장해 둔 랜선 상태
  _savedPwr: null,  // 랜선 탭 활성 중 저장해 둔 파워콘 상태

  // 혼합 시뮬레이터 β
  betaAreaW:    0,
  betaAreaH:    0,
  betaZones:    [],
  betaMode:     'edit',
  betaPorts:    Array.from({ length: 16 }, () => new Set()),
  betaPH2:      Array.from({ length: 16 }, () => []),
  betaAPort:    0,
  betaSpareAdj: { l1: 2, sl: 20 },
  _betaDragSt:  null,
  _betaDragCur: null,
  _betaSelNew:  null,
  _betaSelEdit: null,
  _betaLanDrag: false,
  _betaLanDStk: [],
  _betaLanLpT:  null,
  _betaFCell:   null,
  _betaLanDHov: null,
  _betaCache:   null,

  lanExpanded:  false,
  betaImport:   null,
};
(function() {
  const raw = localStorage.getItem('ledCalcChkCustom');
  if (raw) {
    try {
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.COM))  { State.COM  = saved.COM; }
      if (Array.isArray(saved.COND)) { State.COND = saved.COND; }
      if (saved.chkNotes) { State.chkNotes = saved.chkNotes; }
      State.COM.concat(State.COND).forEach(n => { State.chkState[n] = saved.chkState?.[n] ?? false; });
      return;
    } catch(e) {}
  }
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = false; });
})();


// ── §2  장비 체크리스트 ───────────────────────────────────

// 체크리스트 전체 렌더링
function renderCL() {
  function mk(n, sec, idx) {
    const d = State.chkState[n];
    const note = State.chkNotes[n] || '';
    const safe = n.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    const safeNote = note.replace(/"/g, '&quot;');
    const hasNote = note.length > 0;
    return `<div class="ci${d ? ' done' : ''}${hasNote ? ' has-note' : ''}" draggable="true" data-sec="${sec}" data-idx="${idx}">
      <div class="ci-main" onclick="tog('${safe}')">
        <span class="ci-drag-handle" onclick="event.stopPropagation()">⠿</span>
        <input type="checkbox"${d ? ' checked' : ''} onclick="event.stopPropagation();tog('${safe}')">
        <span class="cil">${n}</span>
        <button class="ci-note-btn" onclick="event.stopPropagation();_toggleCINote(this)" title="메모">✎</button>
        <button class="del-btn" onclick="event.stopPropagation();delItem('${safe}')">×</button>
      </div>
      <input class="ci-note-input" type="text" placeholder="메모 (종류, 수량, 길이...)" value="${safeNote}" data-name="${safe}" oninput="_onCINote(this)" onclick="event.stopPropagation()">
    </div>`;
  }
  document.getElementById('commonList').innerHTML = State.COM.map((n, i) => mk(n, 'common', i)).join('');
  document.getElementById('condList').innerHTML = State.COND.map((n, i) => mk(n, 'cond', i)).join('');
  attachCLDragEvents();

  const all = State.COM.length + State.COND.length;
  const done = Object.values(State.chkState).filter(Boolean).length;
  document.getElementById('progFill').style.width = (all ? Math.round(done / all * 100) : 0) + '%';
  document.getElementById('progTxt').textContent = done + ' / ' + all;
}
function tog(n) { State.chkState[n] = !State.chkState[n]; renderCL(); _saveChkLayout(); }
function clearAllChecks() { Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; }); renderCL(); _saveChkLayout(); }
function openChkResetChoice() { history.pushState({ overlay: 'chkReset' }, ''); document.getElementById('chkResetChoiceBg').style.display = 'flex'; }
function closeChkResetChoice() { document.getElementById('chkResetChoiceBg').style.display = 'none'; if (history.state && history.state.overlay === 'chkReset') { _histBack(); } }
function _doChkResetSoft() {
  Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; });
  Object.keys(State.chkNotes).forEach(k => { delete State.chkNotes[k]; });
  renderCL(); _saveChkLayout(); closeChkResetChoice();
}
function _doChkResetFull() {
  State.COM = [...DEFAULT_COM]; State.COND = [...DEFAULT_COND];
  Object.keys(State.chkState).forEach(k => { delete State.chkState[k]; });
  Object.keys(State.chkNotes).forEach(k => { delete State.chkNotes[k]; });
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = false; });
  renderCL(); _saveChkLayout(); closeChkResetChoice();
}
function delItem(n) {
  const ci = State.COM.indexOf(n), di = State.COND.indexOf(n);
  if (ci >= 0) { State.COM.splice(ci, 1); } else { if (di >= 0) State.COND.splice(di, 1); }
  delete State.chkState[n];
  renderCL(); _saveChkLayout();
}
function addItem(section) {
  const inp = document.getElementById('add-' + section);
  const name = inp.value.trim();
  if (!name) { return; }
  if (section === 'common') { if (!State.COM.includes(name))  { State.COM.push(name);  State.chkState[name] = false; } }
  else                      { if (!State.COND.includes(name)) { State.COND.push(name); State.chkState[name] = false; } }
  inp.value = '';
  renderCL(); _saveChkLayout();
}
function _saveChkLayout() {
  localStorage.setItem('ledCalcChkCustom', JSON.stringify({ COM: State.COM, COND: State.COND, chkState: State.chkState, chkNotes: State.chkNotes }));
}
function _toggleCINote(btn) {
  const ci = btn.closest('.ci');
  ci.classList.toggle('note-open');
  if (ci.classList.contains('note-open')) { ci.querySelector('.ci-note-input').focus(); }
}
function _onCINote(el) {
  const name = el.dataset.name;
  if (el.value) { State.chkNotes[name] = el.value; } else { delete State.chkNotes[name]; }
  el.closest('.ci').classList.toggle('has-note', !!el.value);
  _saveChkLayout();
}

function attachCLDragEvents() {
  let dragEl = null;

  const onTouchMove = e => {
    if (!dragEl) { return; }
    e.preventDefault();
    const t = e.touches[0];
    dragEl.style.pointerEvents = 'none';
    const target = document.elementFromPoint(t.clientX, t.clientY)?.closest('.ci[data-sec]');
    dragEl.style.pointerEvents = '';
    document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
    if (target && target !== dragEl && target.dataset.sec === dragEl.dataset.sec) {
      target.classList.add('drag-over');
    }
  };
  const onTouchEnd = () => {
    if (!dragEl) { return; }
    dragEl.classList.remove('dragging');
    const target = document.querySelector('.ci.drag-over');
    document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
    if (target) {
      const fromSec = dragEl.dataset.sec, fromIdx = +dragEl.dataset.idx;
      const toSec   = target.dataset.sec, toIdx   = +target.dataset.idx;
      if (fromSec === toSec && fromIdx !== toIdx) {
        const arr = fromSec === 'common' ? State.COM : State.COND;
        const [item] = arr.splice(fromIdx, 1);
        arr.splice(toIdx, 0, item);
        renderCL(); _saveChkLayout();
      }
    }
    dragEl = null;
    document.removeEventListener('touchmove', onTouchMove);
    document.removeEventListener('touchend', onTouchEnd);
  };

  document.querySelectorAll('.ci[data-sec]').forEach(el => {
    // 데스크톱 HTML5 DnD
    el.addEventListener('dragstart', e => {
      dragEl = el;
      el.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });
    el.addEventListener('dragend', () => {
      if (dragEl) { dragEl.classList.remove('dragging'); dragEl = null; }
      document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
    });
    el.addEventListener('dragover', e => {
      e.preventDefault();
      if (!dragEl || dragEl === el || dragEl.dataset.sec !== el.dataset.sec) { return; }
      document.querySelectorAll('.ci.drag-over').forEach(x => x.classList.remove('drag-over'));
      el.classList.add('drag-over');
    });
    el.addEventListener('drop', e => {
      e.preventDefault();
      if (!dragEl || dragEl === el) { return; }
      const fromSec = dragEl.dataset.sec, fromIdx = +dragEl.dataset.idx;
      const toSec   = el.dataset.sec,     toIdx   = +el.dataset.idx;
      if (fromSec !== toSec) { return; }
      const arr = fromSec === 'common' ? State.COM : State.COND;
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      renderCL(); _saveChkLayout();
    });

    // 모바일 터치 — 핸들에서만 시작
    const handle = el.querySelector('.ci-drag-handle');
    if (!handle) { return; }
    handle.addEventListener('touchstart', e => {
      e.preventDefault();
      dragEl = el;
      el.classList.add('dragging');
      document.addEventListener('touchmove', onTouchMove, { passive: false });
      document.addEventListener('touchend', onTouchEnd);
    }, { passive: false });
  });
}
renderCL(); // 페이지 로드 시 초기 렌더링


// ── §3  메모 ──────────────────────────────────────────────


function renderMemo() {
  document.getElementById('memoList').innerHTML = State.memoList.map((t, i) =>
    `<div class="memo-item">
      <span class="memo-txt">${t}</span>
      <button class="del-btn" onclick="delMemo(${i})">×</button>
    </div>`
  ).join('');
}
function addMemo() {
  const inp = document.getElementById('add-memo');
  const t = inp.value.trim();
  if (!t) { return; }
  State.memoList.push(t); inp.value = ''; renderMemo();
}
function delMemo(i) { State.memoList.splice(i, 1); renderMemo(); }


// ── §4  탭 전환 & 버전 표시 ──────────────────────────────

function swTab(id, btn) {
  document.querySelectorAll('.tab-page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.tab-btn').forEach(b  => b.classList.remove('on'));
  document.getElementById('tab-' + id).classList.add('on');
  btn.classList.add('on');
  _updateBarForTab(id);
  if (id === 'beta') { betaRender(); }
}

function _updateBarForTab(id) {
  const btnReset = document.getElementById('btnBarReset');
  const btnMain  = document.getElementById('btnBarMain');
  const btnHelp  = document.getElementById('helpBtn');
  if (id === 'vmix') {
    btnReset.onclick = vmixFullReset;
    btnReset.title = 'vMix 초기화';
    btnMain.textContent = '수정된 .vmix 저장';
    btnMain.onclick = openVmixSaveModal;
    btnMain.disabled = !_vmixAnyChanged();
  } else if (id === 'chk') {
    btnReset.onclick = openChkResetChoice;
    btnReset.title = '체크리스트 초기화';
    btnMain.textContent = 'PNG 저장';
    btnMain.onclick = openModal;
    btnMain.disabled = false;
  } else if (id === 'beta') {
    btnReset.onclick = betaReset;
    btnReset.title = '혼합 시뮬 초기화';
    btnMain.textContent = '혼합 시뮬β';
    btnMain.onclick = null;
    btnMain.disabled = true;
  } else {
    btnReset.onclick = tryResetAll;
    btnReset.title = '전체 초기화';
    btnMain.textContent = 'PNG 저장';
    btnMain.onclick = openModal;
    btnMain.disabled = false;
  }
  if (id === 'chk' || id === 'vmix') {
    btnHelp.style.display = '';
    btnHelp.onclick = () => openTutorial(id);
  } else {
    btnHelp.style.display = 'none';
  }
}

function openTutorial(tabId) {
  const imgs = TUTORIAL_IMAGES[tabId];
  if (!imgs) { return; }
  State._tutImgs = imgs;
  if (!State._tutReady) { _tutAttachEvents(); State._tutReady = true; }
  _tutSetImg(0);
  history.pushState({ overlay: 'tutorial' }, '');
  document.getElementById('tutorialBg').style.display = 'flex';
}
function closeTutorial() {
  document.getElementById('tutorialBg').style.display = 'none';
  State._tutZoom = 1;
  const img = document.getElementById('tutImg');
  if (img) { img.style.transform = ''; }
  if (history.state && history.state.overlay === 'tutorial') { _histBack(); }
}
function _tutSetImg(idx) {
  State._tutIdx = idx;
  State._tutZoom = 1;
  const img = document.getElementById('tutImg');
  img.src = State._tutImgs[idx];
  img.style.transform = '';
  const n = State._tutImgs.length;
  document.getElementById('tutDots').innerHTML = State._tutImgs.map((_, i) =>
    `<span class="tut-dot${i === idx ? ' on' : ''}" onclick="_tutSetImg(${i})"></span>`
  ).join('');
  document.getElementById('tutPrev').style.visibility = idx > 0 ? '' : 'hidden';
  document.getElementById('tutNext').style.visibility = idx < n - 1 ? '' : 'hidden';
}
function _tutorialPrev() { if (State._tutIdx > 0) { _tutSetImg(State._tutIdx - 1); } }
function _tutorialNext() { if (State._tutIdx < State._tutImgs.length - 1) { _tutSetImg(State._tutIdx + 1); } }
function _tutAttachEvents() {
  const wrap = document.getElementById('tutImgWrap');
  let swipeX = null, pinchD = null, pinchZ = 1, lastTap = 0;
  wrap.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      pinchD = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      pinchZ = State._tutZoom; swipeX = null;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      if (now - lastTap < 300) { _tutSetImg(State._tutIdx); lastTap = 0; }
      else { lastTap = now; swipeX = e.touches[0].clientX; }
    }
  }, { passive: true });
  wrap.addEventListener('touchmove', e => {
    if (e.touches.length === 2 && pinchD !== null) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      State._tutZoom = Math.min(4, Math.max(1, pinchZ * d / pinchD));
      document.getElementById('tutImg').style.transform = `scale(${State._tutZoom})`;
    }
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    if (e.changedTouches.length === 1 && swipeX !== null && State._tutZoom <= 1.05) {
      const dx = e.changedTouches[0].clientX - swipeX;
      if (Math.abs(dx) > 50) { if (dx < 0) { _tutorialNext(); } else { _tutorialPrev(); } }
    }
    if (e.touches.length < 2) { pinchD = null; }
    if (e.touches.length === 0) { swipeX = null; }
  }, { passive: true });
}

document.getElementById('appVersion').textContent = 'v' + APP_VERSION;
(function() {
  const prev = localStorage.getItem('sw-app-version');
  if (prev && prev !== APP_VERSION) { sessionStorage.setItem('sw-just-updated', '1'); }
  localStorage.setItem('sw-app-version', APP_VERSION);
  if (sessionStorage.getItem('sw-just-updated')) {
    sessionStorage.removeItem('sw-just-updated');
    // script.js는 updateToast div보다 먼저 로드되므로 DOMContentLoaded 후 DOM 접근
    document.addEventListener('DOMContentLoaded', function() {
      const t = document.getElementById('updateToast');
      if (!t) { return; }
      t.textContent = 'v' + APP_VERSION + '으로 업데이트되었습니다';
      t.classList.add('show');
      setTimeout(() => { t.classList.remove('show'); }, 3500);
    });
  }
})();

// 버전 5번 탭 → 이스터에그
function _onVersionTap() {
  State._verTaps++;
  clearTimeout(State._verTimer);
  if (State._verTaps >= 5) {
    State._verTaps = 0;
    document.getElementById('easterSwVer').textContent = 'SW ' + APP_SW_VERSION;
    const log = document.getElementById('easterLog');
    log.innerHTML = CHANGELOG.map(c =>
      `<div class="e-log-row"><span class="e-log-v">v${c.v}</span><ul>${c.items.map(i=>`<li>${i}</li>`).join('')}</ul></div>`
    ).join('');
    history.pushState({ overlay: 'easter' }, '');
    document.getElementById('easterBg').style.display = 'flex';
  } else {
    State._verTimer = setTimeout(() => { State._verTaps = 0; }, 1800);
  }
}
function closeEaster()    { document.getElementById('easterBg').style.display = 'none'; if (history.state && history.state.overlay === 'easter') { _histBack(); } }
function closeEasterBg(e) { if (e.target === document.getElementById('easterBg')) closeEaster(); }



// ── §5  콘솔 & 샌딩카드 ──────────────────────────────────

function selConsole(el) {
  document.querySelectorAll('#consoleChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  const s = CSPEC[el.dataset.v];
  document.getElementById('cableType').textContent = s.cable;
  document.getElementById('repeaterType').textContent = s.rep;
  const lnk = document.getElementById('consoleManual');
  lnk.onclick = s.manual ? () => openManual(s.manual, el.dataset.v + ' 메뉴얼') : null;
  lnk.style.display = s.manual ? 'inline-flex' : 'none';
  document.getElementById('consoleInfo').style.display = 'block';
}
function selSending(el) {
  document.querySelectorAll('#sendingChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on');
  State.curSending = el.dataset.v;
  const s = SSPEC[State.curSending];
  const lnk = document.getElementById('sendingManual');
  lnk.onclick = () => openManual(s.manual, s.label + ' 메뉴얼');
  lnk.style.display = 'inline-flex';
  document.getElementById('sendingInfo').style.display = 'block';
  if (isReady()) { renderRes(); }
}


// ── §6  PNG 저장 · 미리보기 · 공유 ───────────────────────

function openModal() {
  const opt = document.getElementById('pngPwrOpt');
  if (opt) { opt.style.display = 'flex'; }
  history.pushState({ overlay: 'modal' }, '');
  document.getElementById('modalBg').style.display = 'flex';
}
function closeModal()    { document.getElementById('modalBg').style.display = 'none'; if (history.state && history.state.overlay === 'modal') { _histBack(); } }
function closeModalBg(e) { if (e.target === document.getElementById('modalBg')) closeModal(); }

// dataURL → 파일 다운로드 (앵커를 DOM에 추가·제거해야 모든 브라우저에서 동작)
function dl(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
}
function dateStr() {
  return new Date().toLocaleDateString('ko-KR').replace(/\./g, '').replace(/ /g, '');
}

// ── 미리보기 모달 ─────────────────────────────────────────

let pendingDownload = null; // { url, filename }
let _resVersions = null; // { normal, wm } — 해상도 이미지 이중 버전
let _blobUrls = []; // 미리보기용 blob URL, 닫을 때 일괄 revoke

function _cvToUrl(cv) {
  return new Promise((ok, err) => cv.toBlob(b => {
    if (!b) { err(new Error('toBlob failed')); return; }
    const u = URL.createObjectURL(b);
    _blobUrls.push(u);
    ok(u);
  }, 'image/png'));
}

function showPreview(url, filename) {
  pendingDownload = { url, filename };
  document.getElementById('previewImg').src = url;
  history.pushState({ overlay: 'preview' }, '');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}
function closePreviewModal() {
  document.getElementById('previewBg').style.display = 'none';
  pendingDownload = null;
  _resVersions = null;
  _blobUrls.forEach(u => URL.revokeObjectURL(u)); _blobUrls = [];
  document.getElementById('previewImg').src = '';
  document.getElementById('resVersionTabs').style.display = 'none';
  if (history.state && history.state.overlay === 'preview') { _histBack(); }
}
function closePreview(e) {
  if (e.target === document.getElementById('previewBg')) { closePreviewModal(); }
}
function confirmDownload() {
  if (pendingDownload) { dl(pendingDownload.url, pendingDownload.filename); }
  closePreviewModal();
}

// 공유 — Web Share API 사용 (모바일에서 다른 앱으로 전달)
async function shareImage() {
  if (!pendingDownload) { return; }
  try {
    const res = await fetch(pendingDownload.url);
    const blob = await res.blob();
    const file = new File([blob], pendingDownload.filename, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      // 파일 공유 지원 (Android Chrome 등)
      await navigator.share({ files: [file], title: 'LED 설치 계산기' });
    } else if (navigator.share) {
      // 파일 미지원, 텍스트만 공유
      await navigator.share({ title: 'LED 설치 계산기', text: pendingDownload.filename });
    } else {
      alert('이 브라우저는 공유 기능을 지원하지 않습니다.\n다운로드 후 공유해주세요.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') { console.warn(err); } // 사용자 취소는 무시
  }
}

// ── 해상도 이미지 생성 ────────────────────────────────────

function _loadImg(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

function _buildResCanvas(sp, tW, tH) {
  const cv = document.createElement('canvas');
  cv.width = tW;
  cv.height = tH;
  const ctx = cv.getContext('2d');

  // 배경
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, tW, tH);

  // 중앙 비네팅 — 텍스트 대비 강조
  const vg = ctx.createRadialGradient(tW/2, tH/2, 0, tW/2, tH/2, Math.hypot(tW, tH) / 2);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, tW, tH);

  // 실선 격자 — 패널 경계선
  const gridLW = Math.max(2, Math.round(tW / 700));
  ctx.strokeStyle = 'rgba(255,255,255,0.60)';
  ctx.lineWidth = gridLW;
  ctx.setLineDash([]);

  const pw = State.panelRotated && State.basePH === 1000 ? sp.px1000.h : sp.px500.w;
  for (let x = pw; x < tW; x += pw) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tH); ctx.stroke();
  }

  let y = 0;
  State.layout.forEach(r => {
    y += ppx(r.type).h;
    if (y < tH) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tW, y); ctx.stroke();
    }
  });

  // 중앙 해상도 텍스트 (기존 60% 대비 1.5배 = 원본 90%)
  const fs = Math.round(Math.max(28, Math.min(Math.round(tH * 0.13), 120)) * 0.9);
  const font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.font = font;

  // W × H — × 만 주황색
  const wStr = `${tW}`, sepStr = '  ×  ', hStr = `${tH}`;
  const wW = ctx.measureText(wStr).width;
  const sepW = ctx.measureText(sepStr).width;
  const hW = ctx.measureText(hStr).width;
  const sx = tW / 2 - (wW + sepW + hW) / 2;

  ctx.fillStyle = '#ffffff';
  ctx.fillText(wStr, sx, tH / 2);
  ctx.fillStyle = '#FF7A2A';
  ctx.fillText(sepStr, sx + wW, tH / 2);
  ctx.fillStyle = '#ffffff';
  ctx.fillText(hStr, sx + wW + sepW, tH / 2);

  // 주황 장식선 — 격자선 두께의 2배, 완전 불투명
  const lineLen = (wW + sepW + hW) * 1.2;
  const gap = fs * 0.72;
  ctx.strokeStyle = '#FF7A2A';
  ctx.lineWidth = gridLW * 2;
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 - gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 - gap); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 + gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 + gap); ctx.stroke();

  return cv;
}

async function _buildWmCanvas(sp, tW, tH) {
  const cv = document.createElement('canvas');
  cv.width = tW;
  cv.height = tH;
  const ctx = cv.getContext('2d');

  // ── Layer 1: 배경 + 비네팅 ──
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, tW, tH);
  const vg = ctx.createRadialGradient(tW/2, tH/2, 0, tW/2, tH/2, Math.hypot(tW, tH) / 2);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, tW, tH);

  // ── Layer 2: 사명 타일 (최하단 — 격자·텍스트 아래) ──
  const wmText = '3Y ENTERTAINMENT';
  const fSize = Math.round(Math.max(24, tW * 0.022));
  ctx.save();
  ctx.font = `600 ${fSize}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(wmText).width;
  const stepX = Math.round(textW  * 1.6);
  const stepY = Math.round(fSize  * 5.2);
  const halfD = Math.ceil(Math.hypot(tW, tH) / 2) + Math.max(stepX, stepY);
  ctx.translate(tW / 2, tH / 2);
  ctx.rotate(-Math.PI / 6);
  for (let r = -Math.ceil(halfD / stepY); r <= Math.ceil(halfD / stepY) + 1; r++) {
    for (let c = -Math.ceil(halfD / stepX); c <= Math.ceil(halfD / stepX) + 1; c++) {
      ctx.fillText(wmText, c * stepX, r * stepY);
    }
  }
  ctx.restore();

  // ── Layer 3: 격자선 ──
  const gridLW = Math.max(2, Math.round(tW / 700));
  ctx.strokeStyle = 'rgba(255,255,255,0.60)';
  ctx.lineWidth = gridLW;
  ctx.setLineDash([]);
  const pw = State.panelRotated && State.basePH === 1000 ? sp.px1000.h : sp.px500.w;
  for (let x = pw; x < tW; x += pw) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, tH); ctx.stroke();
  }
  let y = 0;
  State.layout.forEach(r => {
    y += ppx(r.type).h;
    if (y < tH) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tW, y); ctx.stroke(); }
  });

  // ── Layer 4: 해상도 텍스트 + 주황 바 ──
  const fs = Math.round(Math.max(28, Math.min(Math.round(tH * 0.13), 120)) * 0.9);
  ctx.font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const wStr = `${tW}`, sepStr = '  ×  ', hStr = `${tH}`;
  const wW = ctx.measureText(wStr).width;
  const sepW = ctx.measureText(sepStr).width;
  const hW = ctx.measureText(hStr).width;
  const sx = tW / 2 - (wW + sepW + hW) / 2;
  ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, sx, tH / 2);
  ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, sx + wW, tH / 2);
  ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, sx + wW + sepW, tH / 2);
  const lineLen = (wW + sepW + hW) * 1.2;
  const gap = fs * 0.72;
  ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 - gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 - gap); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(tW/2 - lineLen/2, tH/2 + gap); ctx.lineTo(tW/2 + lineLen/2, tH/2 + gap); ctx.stroke();

  // ── Layer 5: 회사 로고 (좌상단, 충분히 크게) ──
  // 3Y_no_bg.png는 이미 투명 PNG이므로 getImageData 픽셀 처리 불필요
  try {
    const logoImg = await _loadImg('3Y_no_bg.png');
    const logoW = Math.round(sp.px500.w * 1.84);
    const logoH = Math.round(logoW * logoImg.height / logoImg.width);
    const margin = Math.round(tW * 0.01);
    ctx.save();
    ctx.globalAlpha = 0.90;
    ctx.drawImage(logoImg, margin, 0, logoW, logoH);
    ctx.restore();
  } catch { /* 로고 없이 계속 */ }

  return cv;
}

// 파워콘 배선 캔버스 (단일 모드) — 메인 이미지 아래에 이어 붙이기용
function _buildPwrCanvas(sp, tW, tH, pwrPA) {
  const hdr = Math.max(48, Math.round(tH * 0.09));
  const cv = document.createElement('canvas');
  cv.width = tW; cv.height = hdr + tH;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, tW, hdr + tH);
  // 구분선
  ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = Math.max(2, Math.round(tH / 400));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(tW, 0); ctx.stroke();
  // 헤더
  const fs = Math.round(hdr * 0.38);
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${fs}px 'Inter','Helvetica Neue',sans-serif`;
  ctx.fillStyle = '#FF7A2A';
  ctx.textAlign = 'left';
  ctx.fillText('파워콘 배선', Math.round(tW * 0.025), hdr / 2);
  const usedPorts = pwrPA.filter(s => s.size > 0).length;
  ctx.fillStyle = '#ccc';
  ctx.textAlign = 'right';
  ctx.fillText(`1번 파워콘 ${usedPorts}개`, Math.round(tW * 0.975), hdr / 2);
  // 셀 그리기
  const C = State.cols, layout = State.layout;
  const cellW = State.panelRotated && State.basePH === 1000 ? sp.px1000.h : sp.px500.w;
  let y = hdr;
  layout.forEach((row, ri) => {
    const cellH = ppx(row.type).h;
    for (let ci = 0; ci < C; ci++) {
      const key = `${ri},${ci}`;
      const pi = pwrPA.findIndex(s => s.has(key));
      ctx.fillStyle = pi >= 0 ? portColor(pi) : '#2e2e2e';
      ctx.fillRect(ci * cellW + 1, y + 1, cellW - 2, cellH - 2);
    }
    y += cellH;
  });
  // 격자선
  ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2; ctx.setLineDash([]);
  for (let ci = 1; ci < C; ci++) {
    ctx.beginPath(); ctx.moveTo(ci * cellW, hdr); ctx.lineTo(ci * cellW, hdr + tH); ctx.stroke();
  }
  y = hdr;
  layout.forEach(row => {
    y += ppx(row.type).h;
    if (y < hdr + tH) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(tW, y); ctx.stroke(); }
  });
  return cv;
}

// 파워콘 배선 캔버스 (멀티 모드) — 메인 이미지 아래에 이어 붙이기용
function _buildPwrCanvasMulti(sp, secInfo, totalTW, maxTH, pwrPA) {
  const hdr = Math.max(48, Math.round(maxTH * 0.09));
  const cv = document.createElement('canvas');
  cv.width = totalTW; cv.height = hdr + maxTH;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, totalTW, hdr + maxTH);
  ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = Math.max(2, Math.round(maxTH / 400));
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(totalTW, 0); ctx.stroke();
  const fs = Math.round(hdr * 0.38);
  ctx.textBaseline = 'middle';
  ctx.font = `600 ${fs}px 'Inter','Helvetica Neue',sans-serif`;
  ctx.fillStyle = '#FF7A2A'; ctx.textAlign = 'left';
  ctx.fillText('파워콘 배선', Math.round(totalTW * 0.025), hdr / 2);
  const usedPorts = pwrPA.filter(s => s.size > 0).length;
  ctx.fillStyle = '#ccc'; ctx.textAlign = 'right';
  ctx.fillText(`1번 파워콘 ${usedPorts}개`, Math.round(totalTW * 0.975), hdr / 2);
  const cellW = State.panelRotated && State.basePH === 1000 ? sp.px1000.h : sp.px500.w;
  let xOff = 0;
  ['left','center','right'].forEach(sn => {
    const sec = secInfo[sn]; if (!sec) { return; }
    const { cols, layout } = sec;
    let y = hdr;
    layout.forEach((row, ri) => {
      const cellH = ppx(row.type).h;
      for (let ci = 0; ci < cols; ci++) {
        const pi = pwrPA.findIndex(s => s.has(`${sn}:${ri},${ci}`));
        ctx.fillStyle = pi >= 0 ? portColor(pi) : '#2e2e2e';
        ctx.fillRect(xOff + ci * cellW + 1, y + 1, cellW - 2, cellH - 2);
      }
      y += cellH;
    });
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'; ctx.lineWidth = 2;
    for (let ci = 1; ci < cols; ci++) {
      ctx.beginPath(); ctx.moveTo(xOff + ci * cellW, hdr); ctx.lineTo(xOff + ci * cellW, hdr + sec.tH); ctx.stroke();
    }
    let yr = hdr;
    layout.forEach(row => {
      yr += ppx(row.type).h;
      if (yr < hdr + sec.tH) { ctx.beginPath(); ctx.moveTo(xOff, yr); ctx.lineTo(xOff + cols * cellW, yr); ctx.stroke(); }
    });
    xOff += cols * cellW;
  });
  return cv;
}

// 두 캔버스를 수직으로 이어 붙이기
function _stitchV(cvTop, cvBot) {
  const cv = document.createElement('canvas');
  cv.width = cvTop.width; cv.height = cvTop.height + cvBot.height;
  const ctx = cv.getContext('2d');
  ctx.drawImage(cvTop, 0, 0);
  ctx.drawImage(cvBot, 0, cvTop.height);
  return cv;
}

// 현재 파워콘 상태(저장된 값 포함) 반환
function _getPwrPA() {
  if (State.simTab === 'pwr') { return State.pA.map(s => new Set(s)); }
  return State._savedPwr ? State._savedPwr.pA.map(s => new Set(s)) : null;
}

async function genResImage() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed];
  const isLand = State.panelRotated && State.basePH === 1000;
  const tW = isLand ? State.cols * sp.px1000.h : State.cols * sp.px500.w;
  let tH = 0;
  State.layout.forEach(r => { tH += ppx(r.type).h; });

  let baseCv = _buildResCanvas(sp, tW, tH);
  // 파워콘 커스텀 배선이면 아래에 이어 붙이기
  const pwrPA = _getPwrPA();
  if (pwrPA && !_isDefaultPwrWiring(pwrPA)) {
    baseCv = _stitchV(baseCv, _buildPwrCanvas(sp, tW, tH, pwrPA));
  }
  const filename = `LED_${tW}x${tH}_${dateStr()}.png`;

  // _buildWmCanvas는 throw하지 않으므로 탭이 항상 표시됨
  let wmUrl = null;
  try {
    let wmCv = await _buildWmCanvas(sp, tW, tH);
    if (pwrPA && !_isDefaultPwrWiring(pwrPA)) {
      wmCv = _stitchV(wmCv, _buildPwrCanvas(sp, tW, tH, pwrPA));
    }
    wmUrl = await _cvToUrl(wmCv);
  } catch { /* 치명적 실패 시 탭 없이 기본 버전만 */ }

  const baseUrl = await _cvToUrl(baseCv);
  showResPreview(baseUrl, wmUrl, filename);
}

// ── 멀티 섹션 이미지 생성 ─────────────────────────────────

function _drawBgVignette(ctx, tW, tH) {
  ctx.fillStyle = '#141414';
  ctx.fillRect(0, 0, tW, tH);
  const vg = ctx.createRadialGradient(tW/2, tH/2, 0, tW/2, tH/2, Math.hypot(tW, tH)/2);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, tW, tH);
}

function _drawWmTiles(ctx, tW, tH) {
  const wmText = '3Y ENTERTAINMENT';
  const fSize = Math.round(Math.max(24, tW * 0.022));
  ctx.save();
  ctx.font = `600 ${fSize}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,0.28)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const textW = ctx.measureText(wmText).width;
  const stepX = Math.round(textW * 1.6);
  const stepY = Math.round(fSize * 5.2);
  const halfD = Math.ceil(Math.hypot(tW, tH) / 2) + Math.max(stepX, stepY);
  ctx.translate(tW / 2, tH / 2);
  ctx.rotate(-Math.PI / 6);
  for (let r = -Math.ceil(halfD / stepY); r <= Math.ceil(halfD / stepY) + 1; r++) {
    for (let c = -Math.ceil(halfD / stepX); c <= Math.ceil(halfD / stepX) + 1; c++) {
      ctx.fillText(wmText, c * stepX, r * stepY);
    }
  }
  ctx.restore();
}

function _drawMultiGrid(ctx, sp, secInfo, totalTW, maxTH) {
  const gridLW = Math.max(2, Math.round(totalTW / 700));
  const pw = State.panelRotated && State.basePH === 1000 ? sp.px1000.h : sp.px500.w;
  const active = ['left','center','right'].filter(k => secInfo[k]);
  ctx.strokeStyle = 'rgba(255,255,255,0.60)';
  ctx.lineWidth = gridLW;
  let secX = 0;
  active.forEach(k => {
    const sec = secInfo[k];
    for (let x = pw; x < sec.tW; x += pw) {
      ctx.beginPath(); ctx.moveTo(secX + x, 0); ctx.lineTo(secX + x, maxTH); ctx.stroke();
    }
    let y = 0;
    sec.layout.forEach(r => {
      y += ppx(r.type).h;
      if (y < maxTH) { ctx.beginPath(); ctx.moveTo(secX, y); ctx.lineTo(secX + sec.tW, y); ctx.stroke(); }
    });
    secX += sec.tW;
  });
  if (active.length > 1) {
    ctx.strokeStyle = 'rgba(255,255,255,0.90)';
    ctx.lineWidth = gridLW * 2;
    let dx = 0;
    active.slice(0, -1).forEach(k => {
      dx += secInfo[k].tW;
      ctx.beginPath(); ctx.moveTo(dx, 0); ctx.lineTo(dx, maxTH); ctx.stroke();
    });
  }
  return gridLW;
}

function _drawMultiResText(ctx, secInfo, totalTW, maxTH, gridLW, showSecRes) {
  if (showSecRes) {
    const LABELS = { left: '좌측', center: '중앙', right: '우측' };
    const active = ['left','center','right'].filter(k => secInfo[k]);
    let sx = 0;
    active.forEach(k => {
      const sec = secInfo[k];
      const cx = sx + sec.tW / 2;
      const cy = maxTH / 2;
      const fs = Math.round(Math.max(18, Math.min(sec.tH * 0.13, sec.tW * 0.12, 100)) * 0.9);
      const gap = fs * 0.72;
      const lfs = Math.round(fs * 0.48);
      ctx.font = `500 ${lfs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
      ctx.fillStyle = '#FF7A2A'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(LABELS[k], cx, cy - gap - lfs);
      const wStr = `${sec.tW}`, sepStr = '  ×  ', hStr = `${sec.tH}`;
      ctx.font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      const wW = ctx.measureText(wStr).width;
      const sepW = ctx.measureText(sepStr).width;
      const hW = ctx.measureText(hStr).width;
      const textX = cx - (wW + sepW + hW) / 2;
      ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, textX, cy);
      ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, textX + wW, cy);
      ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, textX + wW + sepW, cy);
      const lineLen = (wW + sepW + hW) * 1.2;
      ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
      ctx.beginPath(); ctx.moveTo(cx - lineLen/2, cy - gap); ctx.lineTo(cx + lineLen/2, cy - gap); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx - lineLen/2, cy + gap); ctx.lineTo(cx + lineLen/2, cy + gap); ctx.stroke();
      sx += sec.tW;
    });
  } else {
    const fs = Math.round(Math.max(28, Math.min(maxTH * 0.13, 120)) * 0.9);
    ctx.font = `300 ${fs}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const wStr = `${totalTW}`, sepStr = '  ×  ', hStr = `${maxTH}`;
    const wW = ctx.measureText(wStr).width;
    const sepW = ctx.measureText(sepStr).width;
    const hW = ctx.measureText(hStr).width;
    const sx2 = totalTW / 2 - (wW + sepW + hW) / 2;
    ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, sx2, maxTH / 2);
    ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, sx2 + wW, maxTH / 2);
    ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, sx2 + wW + sepW, maxTH / 2);
    const lineLen = (wW + sepW + hW) * 1.2;
    const gap = fs * 0.72;
    ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
    ctx.beginPath(); ctx.moveTo(totalTW/2 - lineLen/2, maxTH/2 - gap); ctx.lineTo(totalTW/2 + lineLen/2, maxTH/2 - gap); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(totalTW/2 - lineLen/2, maxTH/2 + gap); ctx.lineTo(totalTW/2 + lineLen/2, maxTH/2 + gap); ctx.stroke();
  }
}

function _buildMultiResCanvas(sp, secInfo, totalTW, maxTH, showSecRes) {
  const cv = document.createElement('canvas');
  cv.width = totalTW; cv.height = maxTH;
  const ctx = cv.getContext('2d');
  _drawBgVignette(ctx, totalTW, maxTH);
  const gridLW = _drawMultiGrid(ctx, sp, secInfo, totalTW, maxTH);
  _drawMultiResText(ctx, secInfo, totalTW, maxTH, gridLW, showSecRes);
  return cv;
}

async function _buildMultiWmCanvas(sp, secInfo, totalTW, maxTH, showSecRes) {
  const cv = document.createElement('canvas');
  cv.width = totalTW; cv.height = maxTH;
  const ctx = cv.getContext('2d');
  _drawBgVignette(ctx, totalTW, maxTH);
  _drawWmTiles(ctx, totalTW, maxTH);
  const gridLW = _drawMultiGrid(ctx, sp, secInfo, totalTW, maxTH);
  _drawMultiResText(ctx, secInfo, totalTW, maxTH, gridLW, showSecRes);
  try {
    const logoImg = await _loadImg('3Y_no_bg.png');
    const cSec = secInfo.center;
    const lSec = secInfo.left;
    const baseTW = cSec ? cSec.tW : (lSec ? lSec.tW : totalTW);
    const logoXOff = cSec && lSec ? lSec.tW : 0;
    const logoW = Math.round(sp.px500.w * 1.84);
    const logoH = Math.round(logoW * logoImg.height / logoImg.width);
    const margin = Math.round(baseTW * 0.01);
    ctx.save(); ctx.globalAlpha = 0.90;
    ctx.drawImage(logoImg, logoXOff + margin, 0, logoW, logoH);
    ctx.restore();
  } catch { /* 로고 없이 계속 */ }
  return cv;
}

async function genResImageMulti() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed];
  const isLand = State.panelRotated && State.basePH === 1000;
  let totalTW = 0, maxTH = 0;
  const secInfo = {};
  ['left','center','right'].forEach(k => {
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length) { secInfo[k] = null; return; }
    let tH = 0; sec.layout.forEach(r => { tH += ppx(r.type).h; });
    const tW = isLand ? sec.cols * sp.px1000.h : sec.cols * sp.px500.w;
    totalTW += tW; maxTH = Math.max(maxTH, tH);
    secInfo[k] = { tW, tH, cols: sec.cols, layout: [...sec.layout] };
  });
  if (!totalTW || !maxTH) { return; }
  const filename = `LED_${totalTW}x${maxTH}_${dateStr()}.png`;
  const pwrPA = _getPwrPA();
  const hasCustPwr = pwrPA && !_isDefaultPwrWiring(pwrPA);
  const _stitch = cv => hasCustPwr ? _stitchV(cv, _buildPwrCanvasMulti(sp, secInfo, totalTW, maxTH, pwrPA)) : cv;
  const baseUrl = await _cvToUrl(_stitch(_buildMultiResCanvas(sp, secInfo, totalTW, maxTH, false)));
  const secUrl  = await _cvToUrl(_stitch(_buildMultiResCanvas(sp, secInfo, totalTW, maxTH, true)));
  let wmUrl = null, wmSecUrl = null;
  try {
    wmUrl    = await _cvToUrl(_stitch(await _buildMultiWmCanvas(sp, secInfo, totalTW, maxTH, false)));
    wmSecUrl = await _cvToUrl(_stitch(await _buildMultiWmCanvas(sp, secInfo, totalTW, maxTH, true)));
  } catch { /* 치명적 실패 시 기본만 */ }
  _resVersions = { normal: { url: baseUrl, filename } };
  if (wmUrl)    { _resVersions.wm      = { url: wmUrl,    filename: filename.replace('.png', '_WM.png') }; }
  if (secUrl)   { _resVersions.secRes  = { url: secUrl,   filename: filename.replace('.png', '_SEC.png') }; }
  if (wmSecUrl) { _resVersions.wmSecRes = { url: wmSecUrl, filename: filename.replace('.png', '_WM_SEC.png') }; }
  document.getElementById('tabWm').style.display       = wmUrl    ? '' : 'none';
  document.getElementById('tabSecRes').style.display   = secUrl   ? '' : 'none';
  document.getElementById('tabWmSecRes').style.display = wmSecUrl ? '' : 'none';
  document.getElementById('resVersionTabs').style.display = 'block';
  selectResVersion('normal');
  history.pushState({ overlay: 'preview' }, '');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}


function showResPreview(baseUrl, wmUrl, filename) {
  _resVersions = { normal: { url: baseUrl, filename } };
  if (wmUrl) { _resVersions.wm = { url: wmUrl, filename: filename.replace('.png', '_WM.png') }; }
  document.getElementById('tabWm').style.display       = '';
  document.getElementById('tabSecRes').style.display   = 'none';
  document.getElementById('tabWmSecRes').style.display = 'none';
  document.getElementById('resVersionTabs').style.display = wmUrl ? 'block' : 'none';
  selectResVersion('normal');
  history.pushState({ overlay: 'preview' }, '');
  document.getElementById('previewBg').style.display = 'flex';
  closeModal();
}

function selectResVersion(v) {
  if (!_resVersions || !_resVersions[v]) { return; }
  pendingDownload = _resVersions[v];
  document.getElementById('previewImg').src = pendingDownload.url;
  ['normal','wm','secRes','wmSecRes'].forEach(t => {
    const el = document.getElementById('tab' + t[0].toUpperCase() + t.slice(1));
    if (el) { el.classList.toggle('active', t === v); }
  });
}

// ── PNG 스냅샷 생성 ──────────────────────────────────────

async function saveCalcPng() {
  if (!isReady()) { alert('LED 종류와 패널 사이즈를 먼저 선택해주세요.'); return; }

  const sp = SPECS[State.curLed];
  const isLand = State.panelRotated && State.basePH === 1000;
  const tW = isLand ? State.cols * sp.px1000.h : State.cols * sp.px500.w;
  let tH = 0; State.layout.forEach(r => { tH += ppx(r.type).h; });

  // 패널 수량
  let c5 = 0, c10 = 0;
  State.layout.forEach(r => {
    if (isLand) { c10 += State.cols; }
    else if (r.type === 'half') { c5 += State.cols; }
    else if (State.basePH === 1000) { c10 += State.cols; }
    else { c5 += State.cols; }
  });

  // 케이블 수량 — PWR 탭 활성 시에도 LAN pA 기준으로 계산
  const _lanPA = State.simTab === 'pwr' && State._savedLan ? State._savedLan.pA : State.pA;
  const asgn = new Set(); _lanPA.forEach(s => s.forEach(k => asgn.add(k)));
  const tot = State.layout.length * State.cols, una = tot - asgn.size;
  const _lan = _calcLan(_lanPA), _pw = _calcPwr(State.simTab === 'pwr' ? State.pA : State._savedPwr?.pA);

  // 입력 필드 값 수집
  const W = document.getElementById('iW').value;
  const H = document.getElementById('iH').value;
  const panelEl = document.querySelector('#panelChips .chip.on');
  const consoleEl = document.querySelector('#consoleChips .chip.on');
  const mainLen = document.getElementById('mainLen').value;
  const fiberLen = document.getElementById('fiberLen').value;
  const consoleName = consoleEl  ? consoleEl.dataset.v : null;
  const consoleSpec = consoleName ? CSPEC[consoleName] : null;
  const sendingSpec = State.curSending  ? SSPEC[State.curSending]  : null;

  // 파워콘 포함 여부: 체크박스 선택 여부만 확인
  const includePwr = document.getElementById('pngIncludePwr')?.checked !== false;

  // 랜선·파워콘 캔버스: simCanvas 직접 캡처 (임시 상태 전환으로 양쪽 모두 확보)
  const simCv = document.getElementById('simCanvas');
  let lanDataUrl = null, pwrDataUrl = null;
  if (simCv && simCv.width > 0) {
    if (State.simTab === 'lan') {
      lanDataUrl = simCv.toDataURL('image/png');
      if (includePwr) {
        const cur = { pA: State.pA, pH2: State.pH2, aPort: State.aPort, fCell: State.fCell, drag: State.drag, dStk: State.dStk, dHov: State.dHov };
        if (State._savedPwr) {
          State.pA = State._savedPwr.pA; State.pH2 = State._savedPwr.pH2; State.aPort = State._savedPwr.aPort;
        } else {
          // 파워콘 탭 미방문 — 기본 배선 임시 생성
          State.pA = Array.from({ length: PWR_PORT_COUNT }, () => new Set());
          State.pH2 = Array.from({ length: PWR_PORT_COUNT }, () => []);
          _applyDefaultPwrWiring();
        }
        State.simTab = 'pwr'; drawCv();
        pwrDataUrl = simCv.toDataURL('image/png');
        State.simTab = 'lan';
        State.pA = cur.pA; State.pH2 = cur.pH2; State.aPort = cur.aPort;
        State.fCell = cur.fCell; State.drag = cur.drag; State.dStk = cur.dStk; State.dHov = cur.dHov;
        drawCv();
      }
    } else {
      if (includePwr) { pwrDataUrl = simCv.toDataURL('image/png'); }
      if (State._savedLan) {
        const cur = { pA: State.pA, pH2: State.pH2, aPort: State.aPort };
        State.pA = State._savedLan.pA; State.pH2 = State._savedLan.pH2; State.aPort = State._savedLan.aPort;
        State.simTab = 'lan'; drawCv();
        lanDataUrl = simCv.toDataURL('image/png');
        State.simTab = 'pwr'; State.pA = cur.pA; State.pH2 = cur.pH2; State.aPort = cur.aPort;
        drawCv();
      }
    }
  }

  // 스냅샷 HTML 헬퍼
  const S = (t, v) => `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;font-size:13px;"><span style="color:#888">${t}</span><span style="color:#1a1a1a;font-weight:500">${v}</span></div>`;
  const SEC = t      => `<div style="font-size:10px;font-weight:600;color:#999;letter-spacing:.08em;text-transform:uppercase;margin:14px 0 6px;">${t}</div>`;

  // 샌딩카드 커버 여부 표시 블록
  let coverHtml = '';
  if (sendingSpec) {
    const modesStr = sendingSpec.modes.map(m => `${m.maxW}×${m.maxH}@${m.maxHz}Hz`).join(' / ');
    const sorted = [...sendingSpec.modes].sort((a, b) => b.maxHz - a.maxHz);
    const coverMode = sorted.find(m => tW <= m.maxW && tH <= m.maxH) || null;
    const ok = coverMode !== null;
    coverHtml = `<div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;padding:6px 10px;border-radius:6px;background:${ok?'#E1F5EE':'#FCEBEB'};font-size:12px;">
      <span style="color:${ok?'#085041':'#A32D2D'}">${sendingSpec.label}: ${modesStr}</span>
      <span style="font-weight:600;color:${ok?'#0F6E56':'#E24B4A'}">${ok ? `✓ ${coverMode.maxHz}Hz` : '✗ 초과'}</span>
    </div>`;
  }

  const portRows = _lanPA.map((s, i) => s.size > 0 ? `P${i+1}:${s.size}장` : null).filter(Boolean).join(' · ');
  const memoHtml = State.memoList.length
    ? SEC('메모') + State.memoList.map(t => `<div style="font-size:13px;color:#444;padding:3px 0;">• ${t}</div>`).join('')
    : '';

  // 패널 표 인라인 스타일 (html2canvas용)
  const TS  = 'width:100%;border-collapse:collapse;font-size:12px;margin:8px 0;';
  const TH  = 'background:#f0f8f5;color:#0F6E56;font-weight:600;font-size:10px;padding:5px 6px;border:1px solid #e0e0e0;text-align:center;';
  const TD  = 'padding:5px 6px;border:1px solid #e0e0e0;text-align:center;font-size:12px;';
  const TDL = 'padding:5px 6px;border:1px solid #e0e0e0;font-weight:600;background:#f8f8f8;font-size:12px;';
  const TDT = 'padding:5px 6px;border:1px solid #e0e0e0;text-align:center;font-weight:700;background:#e8f5ee;color:#085041;font-size:12px;';
  const pRack = (sk, n) => Math.ceil(n / (sk === '500×500' ? 24 : 12));

  // 계산결과 섹션 HTML — 일반/betaImport 분기
  let calcResHtml, ledInfoVal;
  const imp = State.betaImport;
  if (imp && imp.allPanels && imp.allPanels.length) {
    // betaImport 모드: LED × 패널 크기 표
    const bCounts = {}, bSzSet = new Set();
    imp.allPanels.forEach(p => {
      const sk = (p.w === 1000 && p.h === 500) ? '500×1000' : `${p.w}×${p.h}`;
      bSzSet.add(sk); if (!bCounts[p.led]) { bCounts[p.led] = {}; }
      bCounts[p.led][sk] = (bCounts[p.led][sk] || 0) + 1;
    });
    const bLeds = Object.keys(bCounts).sort(), bSizes = [...bSzSet].sort();
    const highL = bLeds.reduce((b, l) => { const s = SPECS[l], bs = SPECS[b]; return (s && bs && s.px500.w * s.px500.h > bs.px500.w * bs.px500.h) ? l : b; }, bLeds[0]);
    const hs = SPECS[highL];
    const hTW = hs ? Math.round(imp.areaW / 500) * hs.px500.w : 0;
    const hTH = hs ? Math.round(imp.areaH / 500) * hs.px500.h : 0;
    const grand = imp.allPanels.length;
    const bColTots = bSizes.map(sk => bLeds.reduce((s, l) => s + (bCounts[l]?.[sk] || 0), 0));
    const bColRacks = bSizes.map((sk, i) => bColTots[i] > 0 ? pRack(sk, bColTots[i]) : 0);
    const grandRack = bColRacks.reduce((a, b) => a + b, 0);
    const bTotRow = '<tr><td style="' + TDT + '">합계</td>' + bColTots.map((t, i) => `<td style="${TDT}">${t}ea / 랙 ${bColRacks[i]}개</td>`).join('') + `<td style="${TDT}">${grand}ea / 랙 ${grandRack}개</td></tr>`;
    const bTh = `<tr><th style="${TH}">LED</th>${bSizes.map(sk => `<th style="${TH}">${sk}mm</th>`).join('')}<th style="${TH}">합계</th></tr>`;
    const bTb = bLeds.map(led => {
      const tot = bSizes.reduce((s, sk) => s + (bCounts[led]?.[sk] || 0), 0);
      const totRack = bSizes.reduce((s, sk) => s + (bCounts[led]?.[sk] ? pRack(sk, bCounts[led][sk]) : 0), 0);
      return `<tr><td style="${TDL}">${led}</td>${bSizes.map(sk => { const n = bCounts[led]?.[sk] || 0; return `<td style="${TD}">${n ? `${n}ea / 랙 ${pRack(sk, n)}개` : '-'}</td>`; }).join('')}<td style="${TDT}">${tot}ea / 랙 ${totRack}개</td></tr>`;
    }).join('');
    let zoneHtml = '';
    if (imp.zones && imp.zones.length) {
      zoneHtml = '<div style="font-size:11px;color:#888;margin:8px 0 3px;">구역별 해상도</div>' + imp.zones.map(z => {
        const zsp = SPECS[z.led]; if (!zsp) { return ''; }
        const pC = Math.floor(z.cols / (z.panelW / 500)), pR = Math.floor(z.rows / (z.panelH / 500));
        let pxW, pxH;
        if (z.panelW === 1000) { pxW = zsp.px1000.h; pxH = zsp.px1000.w; }
        else if (z.panelH === 1000) { pxW = zsp.px1000.w; pxH = zsp.px1000.h; }
        else { pxW = zsp.px500.w; pxH = zsp.px500.h; }
        return `<div style="display:flex;gap:6px;font-size:11px;background:#f8f8f8;border-radius:5px;padding:4px 7px;margin-bottom:3px;"><b style="color:#0F6E56;min-width:22px">${z.id}</b><span style="color:#666;flex:1">${z.led} · ${z.panelW}×${z.panelH}mm</span><b style="color:#1a1a1a">${pC * pxW}×${pR * pxH}px</b><span style="color:#999;font-size:10px">${(z.cols * 500 / 1000).toFixed(1)}×${(z.rows * 500 / 1000).toFixed(1)}m</span></div>`;
      }).join('');
    }
    ledInfoVal = bLeds.join(' · ') + ' (혼합)';
    calcResHtml = `
      <table style="${TS}">${bTh}${bTb}${bTotRow}</table>
      <div style="background:#E1F5EE;border-radius:8px;padding:10px 14px;margin:10px 0;text-align:center;">
        <div style="font-size:11px;color:#0F6E56;margin-bottom:3px;">최종 해상도 (${highL} 기준 최대)</div>
        <div style="font-size:20px;font-weight:600;color:#085041;">${hTW ? `${hTW.toLocaleString()} × ${hTH.toLocaleString()} px` : '—'}</div>
      </div>
      ${zoneHtml}`;
  } else {
    // 일반 모드: 단일 LED 표
    const colDefs = [];
    if (c5  > 0) { colDefs.push({ sk: '500×500',  label: '500×500mm',  count: c5,  rack: pRack('500×500', c5) }); }
    if (c10 > 0) { colDefs.push({ sk: '500×1000', label: isLand ? '1000×500mm' : '500×1000mm', count: c10, rack: pRack('500×1000', c10) }); }
    const total = c5 + c10;
    const totalRackPng = colDefs.reduce((s, cd) => s + cd.rack, 0);
    const th = `<tr><th style="${TH}">LED</th>${colDefs.map(cd => `<th style="${TH}">${cd.label}</th>`).join('')}<th style="${TH}">합계</th></tr>`;
    const tb = `<tr><td style="${TDL}">${State.curLed}</td>${colDefs.map(cd => `<td style="${TD}">${cd.count}ea / 랙 ${cd.rack}개</td>`).join('')}<td style="${TDT}">${total}ea / 랙 ${totalRackPng}개</td></tr>`;
    ledInfoVal = State.curLed;
    calcResHtml = `
      <div style="font-size:11px;color:#999;margin:6px 0 2px;">가로 ${State.cols}ea × 세로 ${State.layout.length}행</div>
      <table style="${TS}">${th}${tb}</table>
      <div style="background:#E1F5EE;border-radius:8px;padding:10px 14px;margin:10px 0;text-align:center;">
        <div style="font-size:11px;color:#0F6E56;margin-bottom:3px;">최종 해상도</div>
        <div style="font-size:20px;font-weight:600;color:#085041;">${tW} × ${tH} px</div>
      </div>`;
  }

  const body = `
    ${SEC('기본 정보')}
    ${S('설치 면적', imp ? `${(imp.areaW/1000).toFixed(1)}m × ${(imp.areaH/1000).toFixed(1)}m` : `${W}m × ${H}m`)}
    ${S('LED 종류', ledInfoVal)}
    ${imp ? '' : S('패널 사이즈', panelEl ? (isLand ? '1000 × 500 mm (가로 사용)' : panelEl.textContent.trim()) : '-')}
    ${consoleName || State.curSending || mainLen ? SEC('장비') : ''}
    ${consoleName ? S('콘솔', `${consoleName} (${consoleSpec.cable} · ${consoleSpec.rep})`) : ''}
    ${consoleName && fiberLen ? S('광케이블 길이', fiberLen + 'm') : ''}
    ${State.curSending  ? S('샌딩카드', sendingSpec.label) : ''}
    ${mainLen     ? S('분전함 메인선', mainLen + 'm') : ''}
    ${SEC('계산 결과')}
    ${calcResHtml}
    ${coverHtml}
    ${lanDataUrl ? SEC('랜선 시뮬레이터') + `<img src="${lanDataUrl}" style="width:100%;border-radius:6px;display:block;margin-bottom:4px;">` : ''}
    ${pwrDataUrl ? SEC('파워콘 배선') + `<img src="${pwrDataUrl}" style="width:100%;border-radius:6px;display:block;margin-bottom:4px;">` : ''}
    ${SEC('케이블')}
    <div style="background:#E6F1FB;border-radius:8px;padding:10px 12px;margin-bottom:8px;font-size:13px;">
      <div style="font-weight:600;color:#0C447C;margin-bottom:8px;">랜선</div>
      <div style="display:flex;gap:8px;">
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">1번 랜</div>
          <div style="font-size:18px;font-weight:700;color:#0C447C;line-height:1.2;">${_lan.l1} 개</div>
          <div style="font-size:10px;color:#888;margin-top:3px;">메인 ${_lan.l1Main} · 백업 ${_lan.l1Back}</div>
          <div style="font-size:10px;color:#555;margin-top:2px;">필요 <b>${_lan.l1Main + _lan.l1Back}</b> · 여유 ${_lan.l1Spare}</div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">숏랜</div>
          <div style="font-size:18px;font-weight:700;color:#0C447C;line-height:1.2;">${_lan.sl} 개</div>
          <div style="font-size:10px;color:#1D9E75;font-weight:600;margin-top:3px;">${_lan.slBundle}묶음 (×20)</div>
          <div style="font-size:10px;color:#555;margin-top:2px;">필요 <b>${_lan.slNet}</b> · 여유 ${_lan.slSpare}</div>
        </div>
      </div>
      ${una > 0 ? `<div style="font-size:11px;color:#BA7517;margin-top:6px;">미할당 ${una}/${tot} 패널</div>` : ''}
    </div>
    <div style="background:#FAEEDA;border-radius:8px;padding:10px 12px;font-size:13px;">
      <div style="font-weight:600;color:#633806;margin-bottom:8px;">파워콘</div>
      <div style="display:flex;gap:8px;">
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">1번 파워</div>
          <div style="font-size:18px;font-weight:700;color:#633806;line-height:1.2;">${_pw.c1} 개</div>
          <div style="font-size:10px;color:#555;margin-top:3px;">필요 <b>${_pw.c1Net}</b> · 여유 ${_pw.c1Spare}</div>
        </div>
        <div style="flex:1;background:rgba(255,255,255,0.65);border-radius:8px;padding:8px 10px;">
          <div style="font-size:10px;color:#666;margin-bottom:2px;">숏 파워</div>
          <div style="font-size:18px;font-weight:700;color:#633806;line-height:1.2;">${_pw.sp} 개</div>
          <div style="font-size:10px;color:#1D9E75;font-weight:600;margin-top:3px;">${_pw.spBundle}묶음 (×10)</div>
          <div style="font-size:10px;color:#555;margin-top:2px;">필요 <b>${_pw.spNet}</b> · 여유 ${_pw.spSpare}</div>
        </div>
      </div>
    </div>
    ${portRows ? SEC('포트 할당') + `<div style="font-size:13px;color:#555;line-height:1.8;">${portRows}</div>` : ''}
    ${memoHtml}
  `;

  // 숨겨진 div에 렌더링 후 html2canvas로 캡처
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;box-sizing:border-box;';
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <div style="font-size:16px;font-weight:700;color:#1a1a1a;">LED 설치 계산기</div>
      <div style="font-size:11px;color:#999;">${new Date().toLocaleDateString('ko-KR')}</div>
    </div>
    <div style="height:2px;background:#0F6E56;border-radius:1px;margin-bottom:4px;"></div>
    ${body}
    <div style="height:1px;background:#eee;margin-top:16px;"></div>
  `;
  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, { scale: 2, useCORS: true, backgroundColor: '#ffffff', allowTaint: true });
    showPreview(await _cvToUrl(canvas), 'LED_계산결과_' + dateStr() + '.png');
  } finally {
    document.body.removeChild(wrap);
  }
}

async function saveChkPng() {
  const filter = arr => arr.filter(n => State.chkState[n] || State.chkNotes[n]);
  const comItems = filter(State.COM);
  const condItems = filter(State.COND);
  if (!comItems.length && !condItems.length) { return; }

  const row = n => {
    const checked = State.chkState[n];
    const note = State.chkNotes[n] || '';
    return `<div style="display:flex;align-items:flex-start;gap:10px;padding:7px 0;border-bottom:1px solid #f5f5f5;">
      <span style="font-size:15px;color:${checked ? '#0F6E56' : '#bbb'};flex-shrink:0;margin-top:1px;">${checked ? '✓' : '○'}</span>
      <div style="flex:1;">
        <div style="font-size:13px;color:${checked ? '#1a1a1a' : '#666'};">${n}</div>
        ${note ? `<div style="font-size:11px;color:#888;margin-top:2px;">${note}</div>` : ''}
      </div>
    </div>`;
  };
  const sec = (label, items) => items.length === 0 ? '' :
    `<div style="font-size:10px;font-weight:600;color:#999;letter-spacing:.05em;text-transform:uppercase;margin:12px 0 4px;">${label}</div>${items.map(row).join('')}`;

  const all = State.COM.length + State.COND.length;
  const done = Object.values(State.chkState).filter(Boolean).length;
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;left:-9999px;top:0;width:400px;background:#fff;padding:20px;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;box-sizing:border-box;';
  wrap.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
      <div style="font-size:16px;font-weight:700;color:#1a1a1a;">장비 체크리스트</div>
      <div style="font-size:11px;color:#999;">${new Date().toLocaleDateString('ko-KR')}</div>
    </div>
    <div style="height:2px;background:#0F6E56;border-radius:1px;margin-bottom:6px;"></div>
    <div style="font-size:12px;color:#0F6E56;margin-bottom:4px;">${done} / ${all} 완료</div>
    ${sec('공통 장비', comItems)}${sec('현장 상황별 장비', condItems)}
    <div style="height:1px;background:#eee;margin-top:12px;"></div>`;
  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    showPreview(await _cvToUrl(canvas), 'LED_체크리스트_' + dateStr() + '.png');
  } finally {
    document.body.removeChild(wrap);
  }
}



// ── §7  확인 다이얼로그 & 전체 초기화 ────────────────────

// 범용 확인 팝업 — title·msg 표시 후 확인 시 onOk() 호출
function openConfirm(title, msg, onOk) {
  const bg = document.getElementById('confirmBg');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOk').onclick = () => { closeConfirm(); onOk(); };
  // fullscreen 모드일 때 confirmBg를 fullscreen 컨테이너 안으로 이동해야 보임
  const fsEl = document.getElementById('simFsBg');
  if (fsEl) { fsEl.appendChild(bg); }
  history.pushState({ overlay: 'confirm' }, '');
  bg.style.display = 'flex';
}
function closeConfirm() {
  const bg = document.getElementById('confirmBg');
  bg.style.display = 'none';
  if (bg.parentElement !== document.body) { document.body.appendChild(bg); }
  if (history.state && history.state.overlay === 'confirm') { _histBack(); }
}
function closeConfirmBg(e) { if (e.target === document.getElementById('confirmBg')) closeConfirm(); }

function tryResetAll() {
  openConfirm('전체 초기화', '계산기 탭의 모든 입력사항을 초기화할까요?', doFullReset);
}
function doFullReset() {
  // 면적 입력 초기화
  document.getElementById('iW').value = '';
  document.getElementById('iH').value = '';
  ['mW_L','mH_L','mW_C','mH_C','mW_R','mH_R'].forEach(id => { document.getElementById(id).value = ''; });
  // 모드 단일로 복귀
  State.areaMode = 'single';
  document.getElementById('modeBtn-single').classList.add('on');
  document.getElementById('modeBtn-multi').classList.remove('on');
  document.getElementById('area-single').style.display = '';
  document.getElementById('area-multi').style.display = 'none';
  State.spareAdj = { l1: 2, sl: 20, c1: 2, sp: 20 };
  // 칩 선택 초기화
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  State.curLed = null; State.basePH = null; State.curSending = null;
  // 장비 패널 숨기기
  document.getElementById('consoleInfo').style.display = 'none';
  document.getElementById('sendingInfo').style.display = 'none';
  document.getElementById('fiberLen').value = '';
  document.getElementById('mainLen').value = '';
  // 메모 & 체크리스트 초기화
  State.memoList = []; renderMemo();
  Object.keys(State.chkNotes).forEach(k => delete State.chkNotes[k]);
  Object.keys(State.chkState).forEach(k => { State.chkState[k] = false; }); renderCL(); _saveChkLayout();
  // 시뮬레이터 초기화 및 결과 영역 초기화
  State.lanExpanded = false; State.betaImport = null;
  rst(); State.cols = 0; State.layout = [];
  document.getElementById('resultBody').innerHTML = '<div class="hint-text">LED 종류와 패널 사이즈를 선택하세요</div>';
  document.getElementById('simArea').innerHTML = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
}


// ── §8  저장 / 불러오기 (localStorage) ───────────────────

// 현재 앱 전체 상태를 직렬화 가능한 객체로 반환
function getAppState(name) {
  return {
    name,
    date: new Date().toLocaleDateString('ko-KR'),
    W: document.getElementById('iW').value,
    H: document.getElementById('iH').value,
    areaMode: State.areaMode, activeSimSec: State.activeSimSec,
    mW_L: document.getElementById('mW_L').value,
    mH_L: document.getElementById('mH_L').value,
    mW_C: document.getElementById('mW_C').value,
    mH_C: document.getElementById('mH_C').value,
    mW_R: document.getElementById('mW_R').value,
    mH_R: document.getElementById('mH_R').value,
    curLed: State.curLed, basePH: State.basePH, panelRotated: State.panelRotated, curSending: State.curSending,
    consoleName: document.querySelector('#consoleChips .chip.on')?.dataset.v || null,
    fiberLen: document.getElementById('fiberLen').value,
    mainLen:  document.getElementById('mainLen').value,
    pA:  State.pA.map(s => [...s]),          // Set → Array (JSON 직렬화)
    pH2: State.pH2.map(a => [...a]),
    spareAdj: { ...State.spareAdj },
    memoList: [...State.memoList],
    chkState: { ...State.chkState },
    chkNotes: { ...State.chkNotes },
    COM:  [...State.COM],
    COND: [...State.COND],
    pwrPA: (State.simTab === 'pwr' ? State.pA : State._savedPwr?.pA)?.map(s => [...s]) || null,
    pwrPH: (State.simTab === 'pwr' ? State.pH2 : State._savedPwr?.pH2)?.map(a => [...a]) || null,
    betaAreaW:    State.betaAreaW,
    betaAreaH:    State.betaAreaH,
    betaZones:    State.betaZones,
    betaMode:     State.betaMode,
    betaPorts:    State.betaPorts.map(s => [...s]),
    betaPH2:      State.betaPH2.map(a => [...a]),
    betaAPort:    State.betaAPort,
    betaSpareAdj: { ...State.betaSpareAdj },
    lanExpanded:  State.lanExpanded,
    betaImport:   State.betaImport || null,
  };
}

// 저장된 상태 객체를 앱에 복원
function loadAppState(st) {
  document.getElementById('iW').value = st.W ?? '';
  document.getElementById('iH').value = st.H ?? '';

  // 칩 상태 복원
  document.querySelectorAll('.chip.on').forEach(c => c.classList.remove('on'));
  State.curLed = null; State.basePH = null; State.curSending = null;
  if (st.curLed) {
    const el = document.querySelector(`#ledChips .chip[data-v="${st.curLed}"]`);
    if (el) { el.classList.add('on'); State.curLed = st.curLed; }
  }
  if (st.basePH) {
    const el = document.querySelector(`#panelChips .chip[data-v="${st.basePH}"]`);
    if (el) { el.classList.add('on'); State.basePH = st.basePH; }
  }
  State.panelRotated = !!(st.panelRotated && st.basePH === 1000);
  const rotBtn  = document.getElementById('panelRotateBtn');
  if (rotBtn)  { rotBtn.classList.toggle('on', State.panelRotated); }

  // 콘솔·샌딩카드 복원 (selConsole/selSending이 UI도 업데이트)
  document.getElementById('consoleInfo').style.display = 'none';
  document.getElementById('sendingInfo').style.display = 'none';
  if (st.consoleName) {
    const el = document.querySelector(`#consoleChips .chip[data-v="${st.consoleName}"]`);
    if (el) { selConsole(el); }
  }
  document.getElementById('fiberLen').value = st.fiberLen || '';
  if (st.curSending) {
    const el = document.querySelector(`#sendingChips .chip[data-v="${st.curSending}"]`);
    if (el) { selSending(el); }
  }
  document.getElementById('mainLen').value = st.mainLen || '';

  // 체크리스트 복원
  if (st.COM) { State.COM = [...st.COM]; }
  if (st.COND) { State.COND = [...st.COND]; }
  Object.keys(State.chkState).forEach(k => delete State.chkState[k]);
  Object.keys(State.chkNotes).forEach(k => delete State.chkNotes[k]);
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = st.chkState?.[n] ?? false; });
  if (st.chkNotes) { Object.assign(State.chkNotes, st.chkNotes); }
  renderCL(); _saveChkLayout();

  State.memoList = st.memoList || []; renderMemo();

  // 계산 실행 후 포트 할당 복원
  rst();
  State.spareAdj = st.spareAdj ? { ...st.spareAdj } : { l1: 2, sl: 20, c1: 2, sp: 20 };
  if (st.areaMode === 'multi') {
    // 멀티 모드 복원
    setAreaMode('multi');
    ['mW_L','mH_L','mW_C','mH_C','mW_R','mH_R'].forEach(id => {
      document.getElementById(id).value = st[id] || '';
    });
    State.activeSimSec = st.activeSimSec || 'center';
    if (isReady()) { calcMulti(); }
    // 구버전 저장(multiPorts)을 새 형식(전역 State.pA 프리픽스 키)으로 마이그레이션
    if (st.multiPorts && isReady()) {
      State.pA = Array.from({length:8}, () => new Set());
      State.pH2 = Array.from({length:8}, () => []);
      ['left','center','right'].forEach(secName => {
        const mp = st.multiPorts[secName];
        if (!mp) { return; }
        mp.pA.forEach((arr, pi)  => arr.forEach(k => State.pA[pi].add(`${secName}:${k}`)));
        mp.pH2.forEach((arr, pi) => arr.forEach(k => State.pH2[pi].push(`${secName}:${k}`)));
      });
      drawCv(); renderPorts(); renderLeg(); renderSum();
    } else if (st.pA && isReady()) {
      State.pA = st.pA.map(a => new Set(a));
      State.pH2 = (st.pH2 || st.pA).map(a => [...a]);
      drawCv(); renderPorts(); renderLeg(); renderSum();
    }
  } else {
    if (isReady()) { calc(); }
    if (st.pA && isReady()) {
      State.pA = st.pA.map(a => new Set(a));
      State.pH2 = (st.pH2 || st.pA).map(a => [...a]);
      drawCv(); renderPorts(); renderLeg(); renderSum();
    }
  }
  // 파워콘 배선 복원 (LAN 상태로 복원된 뒤 _savedPwr에 저장)
  if (st.pwrPA && isReady()) {
    State._savedPwr = {
      pA: st.pwrPA.map(a => new Set(a)),
      pH2: (st.pwrPH || st.pwrPA).map(a => [...a]),
      aPort: 0,
    };
  }
  // 혼합 시뮬레이터 β 복원
  if (st.betaZones) {
    State.betaAreaW    = st.betaAreaW || 0;
    State.betaAreaH    = st.betaAreaH || 0;
    State.betaZones    = st.betaZones;
    State.betaMode     = st.betaMode || 'edit';
    State.betaPorts    = st.betaPorts ? st.betaPorts.map(a => new Set(a)) : Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = st.betaPH2   ? st.betaPH2.map(a => [...a])       : Array.from({ length: 16 }, () => []);
    State.betaAPort    = st.betaAPort || 0;
    State.betaSpareAdj = st.betaSpareAdj ? { ...st.betaSpareAdj } : { l1: 2, sl: 20 };
    State._betaCache   = null;
  }
  State.lanExpanded = !!(st.lanExpanded);
  if (st.betaImport) {
    State.betaImport = st.betaImport;
    // 혼합 LED 칩 다중선택 복원 (betaImport.usedLeds 기준)
    const usedLeds = st.betaImport.usedLeds;
    if (usedLeds && usedLeds.length > 1) {
      document.querySelectorAll('#ledChips .chip').forEach(c => c.classList.remove('on'));
      usedLeds.forEach(led => {
        const el = document.querySelector(`#ledChips .chip[data-v="${led}"]`);
        if (el) { el.classList.add('on'); }
      });
    }
    renderRes();
    buildCv(); drawCv(); renderPorts(); renderLeg(); renderSum();
  } else {
    State.betaImport = null;
  }
}

function saveState() {
  const inp = document.getElementById('saveNameInput');
  const name = inp.value.trim();
  if (!name) { inp.focus(); return; }
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  const idx = saves.findIndex(s => s.name === name);
  const st = getAppState(name);
  if (idx >= 0) { saves[idx] = st; } else { saves.push(st); } // 동일 이름은 덮어쓰기
  localStorage.setItem('ledCalcSaves', JSON.stringify(saves));
  inp.value = '';
  renderSaveList();
}
function loadState(idx) {
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  if (saves[idx]) { loadAppState(saves[idx]); closeSaveModal(); }
}
function deleteState(idx) {
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  saves.splice(idx, 1);
  localStorage.setItem('ledCalcSaves', JSON.stringify(saves));
  renderSaveList();
}
function renderSaveList() {
  const saves = JSON.parse(localStorage.getItem('ledCalcSaves') || '[]');
  const el = document.getElementById('saveList');
  if (!saves.length) {
    el.innerHTML = '<div style="color:#999;font-size:13px;text-align:center;padding:16px 0;">저장된 데이터가 없습니다</div>';
    return;
  }
  el.innerHTML = saves.map((s, i) => `
    <div class="save-item">
      <div>
        <div class="si-label">${s.name}</div>
        <div style="font-size:11px;color:#999;margin-top:2px;">${s.date}</div>
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="si-btn" onclick="loadState(${i})">불러오기</button>
        <button class="si-btn" style="background:#E24B4A;" onclick="deleteState(${i})">삭제</button>
      </div>
    </div>`).join('');
}
function openSaveModal()  { renderSaveList(); history.pushState({ overlay: 'save' }, ''); document.getElementById('saveBg').style.display = 'flex'; }
function closeSaveModal() { document.getElementById('saveBg').style.display = 'none'; if (history.state && history.state.overlay === 'save') { _histBack(); } }
function closeSaveBg(e)   { if (e.target === document.getElementById('saveBg')) closeSaveModal(); }


// ── §9  소형 계산기 위젯 ─────────────────────────────────


// 현재 입력 중인 식 텍스트 반환
function _buildExpr() {
  if (!State.cParts.length) { return State.cDisp; }
  return State.cNew ? State.cParts.join(' ') : State.cParts.join(' ') + ' ' + State.cDisp;
}

// 현재 식의 중간 계산 결과 (숫자 2개+연산자 1개 이상일 때만)
function _computePreview() {
  const parts = State.cNew ? State.cParts.slice(0, -1) : [...State.cParts, State.cDisp];
  if (parts.length < 3) { return null; }
  let r = parseFloat(parts[0]);
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const right = parseFloat(parts[i + 1]);
    r = parts[i] === '+' ? r + right
      : parts[i] === '−' ? r - right
      : parts[i] === '×' ? r * right
      : right !== 0       ? r / right : NaN;
    if (isNaN(r)) { break; }
  }
  return isNaN(r) ? null : String(parseFloat(r.toFixed(10)));
}

// cExpr非空 = '=' 직후 → 큰 폰트 결과 + 작은 폰트 식
// 그 외 → 큰 폰트 식 + 작은 폰트 미리보기
function _cu() {
  const eDisp = document.getElementById('calcDisplay');
  const eExpr = document.getElementById('calcExpr');
  if (State.cExpr !== '') {
    eDisp.textContent = State.cDisp;
    eExpr.textContent = State.cExpr;
  } else {
    eDisp.textContent = _buildExpr();
    const p = _computePreview();
    eExpr.textContent = p ? '= ' + p : '';
  }
}
function calcInput(v) {
  State.cExpr = '';
  State.cDisp = State.cNew ? (State.cNew = false, v) : (State.cDisp === '0' ? v : State.cDisp + v);
  _cu();
}
function calcDot() {
  State.cExpr = '';
  if (State.cNew) { State.cDisp = '0.'; State.cNew = false; } else if (!State.cDisp.includes('.')) { State.cDisp += '.'; }
  _cu();
}
function calcOper(op) {
  State.cExpr = '';
  if (State.cNew && State.cParts.length > 0) {
    State.cParts[State.cParts.length - 1] = op;
  } else {
    State.cParts.push(State.cDisp, op);
    State.cNew = true;
  }
  _cu();
}
function calcEquals() {
  if (!State.cParts.length) { return; }
  const parts = State.cNew ? State.cParts.slice(0, -1) : [...State.cParts, State.cDisp];
  if (parts.length < 3) { State.cExpr = ''; State.cParts = []; State.cNew = true; _cu(); return; }
  let result = parseFloat(parts[0]);
  for (let i = 1; i + 1 < parts.length; i += 2) {
    const right = parseFloat(parts[i + 1]);
    result = parts[i] === '+' ? result + right
           : parts[i] === '−' ? result - right
           : parts[i] === '×' ? result * right
           : right !== 0       ? result / right
           : NaN;
    if (isNaN(result)) { break; }
  }
  State.cExpr = parts.join(' ') + ' =';
  State.cDisp = isNaN(result) ? '오류' : String(parseFloat(result.toFixed(10)));
  State.cParts = []; State.cNew = true; _cu();
}
function calcClear() { State.cDisp = '0'; State.cParts = []; State.cNew = true; State.cExpr = ''; _cu(); }
function calcDel() {
  State.cExpr = '';
  if (State.cNew && State.cParts.length >= 2) {
    State.cParts.pop();
    State.cDisp = State.cParts.pop();
    State.cNew = false;
  } else if (State.cDisp.length <= 1 || State.cNew) {
    State.cDisp = '0'; State.cNew = true;
  } else {
    State.cDisp = State.cDisp.slice(0, -1);
  }
  _cu();
}
function toggleCalc() {
  const p = document.getElementById('calcPanel');
  if (p.style.display === 'none') {
    history.pushState({ overlay: 'calc' }, '');
    p.style.display = 'block';
  } else {
    p.style.display = 'none';
    if (history.state && history.state.overlay === 'calc') { _histBack(); }
  }
}




// ════════════════════════════════════════════════════════════
//  §9.5  PDF 뷰어 (PDF.js 기반 인앱 전체화면 뷰어)
// ════════════════════════════════════════════════════════════

let _pdfDoc = null;
let _pdfTotal = 0;
let _pdfZoom = 1;
let _pinchStart = null;

// PDF 전체화면 뷰어 열기
async function openManual(filename, title) {
  document.getElementById('pdfModalTitle').textContent = title || '메뉴얼';
  document.getElementById('pdfPageInfo').textContent = '로딩 중...';
  document.getElementById('pdfPagesInner').innerHTML = '';
  document.getElementById('pdfBg').style.display = 'flex';
  history.pushState({ modal: 'pdf' }, '');
  _pdfZoom = 1;

  try {
    const lib = window.pdfjsLib;
    lib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    _pdfDoc = await lib.getDocument(encodeURI(filename)).promise;
    _pdfTotal = _pdfDoc.numPages;
    await _renderAllPdfPages();
  } catch (err) {
    document.getElementById('pdfPageInfo').textContent = '파일을 불러올 수 없습니다.';
    console.warn('PDF 로드 오류:', err);
  }
}

// 모든 페이지를 고해상도로 렌더링 — 1페이지를 먼저 그려 빠르게 표시
async function _renderAllPdfPages() {
  const inner = document.getElementById('pdfPagesInner');
  const dpr = window.devicePixelRatio || 1;
  const cw = document.getElementById('pdfScrollOuter').clientWidth - 16;

  async function _renderOne(i) {
    const page = await _pdfDoc.getPage(i);
    const baseVp = page.getViewport({ scale: 1 });
    const scale = (cw / baseVp.width) * dpr;
    const viewport = page.getViewport({ scale });
    const origH = Math.round(viewport.height / dpr);
    const cv = document.createElement('canvas');
    cv.width = Math.round(viewport.width);
    cv.height = Math.round(viewport.height);
    cv.style.width = Math.round(cw * _pdfZoom) + 'px';
    cv.style.height = Math.round(origH * _pdfZoom) + 'px';
    cv.style.display = 'block';
    cv.dataset.page = i;
    cv.dataset.origW = cw;
    cv.dataset.origH = origH;
    inner.appendChild(cv);
    await page.render({ canvasContext: cv.getContext('2d'), viewport }).promise;
  }

  // 1페이지 먼저 렌더링 → 사용자가 즉시 내용 확인 가능
  await _renderOne(1);
  document.getElementById('pdfPageInfo').textContent = `1 / ${_pdfTotal}`;
  document.getElementById('pdfScrollOuter').scrollTop = 0;

  // 나머지 페이지 백그라운드 렌더링
  for (let i = 2; i <= _pdfTotal; i++) {
    if (!_pdfDoc) { return; } // 뷰어가 닫혔으면 중단
    document.getElementById('pdfPageInfo').textContent = `로딩중 ${i}/${_pdfTotal}...`;
    await _renderOne(i);
  }
  if (_pdfDoc) { document.getElementById('pdfPageInfo').textContent = `1 / ${_pdfTotal}`; }
}

// 스크롤 위치로 현재 페이지 번호 업데이트
function _pdfScrollTick() {
  if (!_pdfTotal) { return; }
  const outer = document.getElementById('pdfScrollOuter');
  const mid = outer.scrollTop + outer.clientHeight / 2;
  let cur = 1;
  document.querySelectorAll('#pdfPagesInner canvas').forEach(cv => {
    if (cv.offsetTop <= mid) { cur = +cv.dataset.page; }
  });
  document.getElementById('pdfPageInfo').textContent = `${cur} / ${_pdfTotal}`;
}

// 모든 캔버스의 CSS 크기를 zoom 배율에 맞게 직접 재조정
// minZoom: 캔버스 가로가 뷰어 너비를 꽉 채우는 배율 이하로는 축소 불가
function _applyZoom(z) {
  const canvases = document.querySelectorAll('#pdfPagesInner canvas');
  if (!canvases.length) { return; }
  const outer = document.getElementById('pdfScrollOuter');
  const minZoom = outer ? outer.clientWidth / (+canvases[0].dataset.origW) : 1;
  _pdfZoom = Math.min(4, Math.max(minZoom, z));
  canvases.forEach(cv => {
    cv.style.width = Math.round(+cv.dataset.origW * _pdfZoom) + 'px';
    cv.style.height = Math.round(+cv.dataset.origH * _pdfZoom) + 'px';
  });
}

function closePdfModal() {
  document.getElementById('pdfBg').style.display = 'none';
  document.getElementById('pdfPagesInner').innerHTML = '';
  _pdfDoc = null; _pdfTotal = 0; _pdfZoom = 1;
  if (history.state && history.state.modal === 'pdf') { _histBack(); }
}

let _programmaticBack = false;
function _histBack() { _programmaticBack = true; history.back(); }


window.addEventListener('popstate', e => {
  if (_programmaticBack) { _programmaticBack = false; return; }
  const confirmBg  = document.getElementById('confirmBg');
  const simFsBg    = document.getElementById('simFsBg');
  const previewBg  = document.getElementById('previewBg');
  const pdfBg      = document.getElementById('pdfBg');
  const tutorialBg = document.getElementById('tutorialBg');
  const calcPanel  = document.getElementById('calcPanel');
  // 우선순위: 최상위 레이어부터 닫기 (UI만, _histBack() 호출 없음)
  if (confirmBg && confirmBg.style.display !== 'none') {
    confirmBg.style.display = 'none';
    if (confirmBg.parentElement !== document.body) { document.body.appendChild(confirmBg); }
  } else if (simFsBg) {
    simFsBg.remove();
    if (document.fullscreenElement) { document.exitFullscreen(); }
    buildSim();
  } else if (previewBg && previewBg.style.display !== 'none') {
    previewBg.style.display = 'none';
    pendingDownload = null; _resVersions = null;
    _blobUrls.forEach(u => URL.revokeObjectURL(u)); _blobUrls = [];
    document.getElementById('previewImg').src = '';
    document.getElementById('resVersionTabs').style.display = 'none';
  } else if (pdfBg && pdfBg.style.display !== 'none') {
    pdfBg.style.display = 'none';
    document.getElementById('pdfPagesInner').innerHTML = '';
    _pdfDoc = null; _pdfTotal = 0; _pdfZoom = 1;
  } else if (tutorialBg && tutorialBg.style.display !== 'none') {
    tutorialBg.style.display = 'none';
    State._tutZoom = 1;
    const img = document.getElementById('tutImg');
    if (img) { img.style.transform = ''; }
  } else if (calcPanel && calcPanel.style.display !== 'none') {
    calcPanel.style.display = 'none';
  } else if (document.getElementById('schedBg') && document.getElementById('schedBg').style.display !== 'none') {
    document.getElementById('schedBg').style.display = 'none';
  } else if (document.getElementById('modalBg').style.display !== 'none') {
    document.getElementById('modalBg').style.display = 'none';
  } else if (document.getElementById('saveBg').style.display !== 'none') {
    document.getElementById('saveBg').style.display = 'none';
  } else if (document.getElementById('vmixSaveBg').style.display !== 'none') {
    document.getElementById('vmixSaveBg').style.display = 'none';
  } else if (document.getElementById('chkResetChoiceBg').style.display !== 'none') {
    document.getElementById('chkResetChoiceBg').style.display = 'none';
  } else if (document.getElementById('easterBg').style.display !== 'none') {
    document.getElementById('easterBg').style.display = 'none';
  }
});

// 스크롤 · 핀치줌 · Ctrl+휠 이벤트 — 페이지 로드 시 1회 등록
(function _attachPdfEvents() {
  const outer = document.getElementById('pdfScrollOuter');
  if (!outer) { return; }
  outer.addEventListener('scroll', _pdfScrollTick, { passive: true });

  outer.addEventListener('touchstart', e => {
    if (e.touches.length !== 2) { return; }
    _pinchStart = {
      dist: Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                       e.touches[0].clientY - e.touches[1].clientY),
      zoom: _pdfZoom,
    };
  }, { passive: true });

  outer.addEventListener('touchmove', e => {
    if (e.touches.length !== 2 || !_pinchStart) { return; }
    const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX,
                         e.touches[0].clientY - e.touches[1].clientY);
    _applyZoom(_pinchStart.zoom * (d / _pinchStart.dist));
  }, { passive: true });

  outer.addEventListener('touchend', () => { _pinchStart = null; }, { passive: true });

  // PC: Ctrl+휠 확대/축소
  outer.addEventListener('wheel', e => {
    if (!e.ctrlKey && !e.metaKey) { return; }
    e.preventDefault();
    _applyZoom(_pdfZoom * (e.deltaY < 0 ? 1.1 : 0.909));
  }, { passive: false });
})();


// ════════════════════════════════════════════════════════════
//  §10  계산기 핵심 (면적·패널 계산 & 결과 렌더링)
// ════════════════════════════════════════════════════════════



const SECTION_GAP = 20;  // 멀티 모드 섹션 간 픽셀 간격
const SEC_LBL_H = 22;  // 섹션 레이블 바 높이

function _mkSec() {
  return { cols:0, layout:[], rH:[] };
}

function isReady() { return State.curLed && State.basePH; }

function selLed(el) {
  State.betaImport = null;
  document.querySelectorAll('#ledChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); State.curLed = el.dataset.v;
  rst(); State.areaMode === 'single' ? calc() : calcMulti();
}
function selPanel(el) {
  document.querySelectorAll('#panelChips .chip').forEach(c => c.classList.remove('on'));
  el.classList.add('on'); State.basePH = parseInt(el.dataset.v);
  if (State.basePH !== 1000) { State.panelRotated = false; }
  const btn  = document.getElementById('panelRotateBtn');
  if (btn)  { btn.classList.toggle('on', State.panelRotated); }
  rst(); State.areaMode === 'single' ? calc() : calcMulti();
}

function togglePanelRotate() {
  if (State.basePH !== 1000) { return; }
  State.panelRotated = !State.panelRotated;
  const btn = document.getElementById('panelRotateBtn');
  if (btn) { btn.classList.toggle('on', State.panelRotated); }
  rst(); State.areaMode === 'single' ? calc() : calcMulti();
}

// ── 면적 모드 전환 ──────────────────────────────────────────
function setAreaMode(mode) {
  State.areaMode = mode;
  document.getElementById('modeBtn-single').classList.toggle('on', mode === 'single');
  document.getElementById('modeBtn-multi').classList.toggle('on',  mode === 'multi');
  document.getElementById('area-single').style.display = mode === 'single' ? '' : 'none';
  document.getElementById('area-multi').style.display = mode === 'multi'  ? '' : 'none';
  State.cols = 0; State.layout = [];
  rst();
  mode === 'single' ? calc() : calcMulti();
}

// ── 섹션 크기 복사 (from → to) ──────────────────────────────
function syncMultiH() {
  const val = document.getElementById('mH_L').value
           || document.getElementById('mH_C').value
           || document.getElementById('mH_R').value;
  if (!val) { return; }
  document.getElementById('mH_L').value = val;
  document.getElementById('mH_C').value = val;
  document.getElementById('mH_R').value = val;
  calcMulti();
}

// ── 섹션 레이아웃 계산 헬퍼 ────────────────────────────────
function calcSection(W, H) {
  const sec = { cols:0, layout:[] };
  if (!W || !H || !isReady()) { return sec; }
  const Hmm = H * 1000;
  if (State.panelRotated && State.basePH === 1000) {
    // 가로 사용: 1000mm 폭 × 500mm 높이
    sec.cols = Math.max(1, Math.round(W * 1000 / 1000));
    const nr = Math.max(1, Math.round(Hmm / 500));
    for (let i = 0; i < nr; i++) sec.layout.push({ type:'full' });
  } else {
    sec.cols = Math.max(1, Math.round(W * 1000 / 500));
    if (State.basePH === 1000) {
      const fr = Math.floor(Hmm / 1000);
      if (Math.round(Hmm - fr * 1000) >= 400) { sec.layout.push({ type:'half' }); }
      for (let i = 0; i < fr; i++) sec.layout.push({ type:'full' });
    } else {
      const nr = Math.max(1, Math.round(Hmm / 500));
      for (let i = 0; i < nr; i++) sec.layout.push({ type:'full' });
    }
  }
  return sec;
}

// ── 멀티 모드 계산 ─────────────────────────────────────────
function calcMulti() {
  const ids = { left:['mW_L','mH_L'], center:['mW_C','mH_C'], right:['mW_R','mH_R'] };
  let anyInput = false;

  ['left','center','right'].forEach(k => {
    const W = parseFloat(document.getElementById(ids[k][0]).value) || 0;
    const H = parseFloat(document.getElementById(ids[k][1]).value) || 0;
    const res = calcSection(W, H);
    // 범위 밖 포트 할당 제거 (전역 State.pA, 프리픽스 키 기준)
    State.pA.forEach((s, pi) => {
      [...s].forEach(key => {
        if (!key.startsWith(k + ':')) { return; }
        const [r, c] = key.slice(k.length + 1).split(',').map(Number);
        if (r >= res.layout.length || c >= res.cols) {
          s.delete(key); State.pH2[pi] = State.pH2[pi].filter(x => x !== key);
        }
      });
    });
    State.multiSec[k].cols = res.cols;
    State.multiSec[k].layout = res.layout;
    if (W && H) { anyInput = true; }
  });

  if (!isReady()) {
    document.getElementById('resultBody').innerHTML = '<div class="hint-text">LED 종류와 패널 사이즈를 선택하세요</div>';
    document.getElementById('simArea').innerHTML = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
    return;
  }
  if (!anyInput) {
    document.getElementById('resultBody').innerHTML = '<div class="hint-text">설치 면적을 입력하세요</div>';
    document.getElementById('simArea').innerHTML = '<div class="sim-locked">설치 면적을 먼저 입력해주세요</div>';
    return;
  }

  // 전역 State.cols/State.layout 을 활성 섹션과 동기화
  const as = State.multiSec[State.activeSimSec];
  State.cols = as.cols; State.layout = as.layout;

  renderResMulti();
  buildSim();
}

// ── 시뮬레이터 섹션 전환 (멀티 모드) ──────────────────────
function switchSimSec(sec) {
  State.activeSimSec = sec;
  const as = State.multiSec[sec];
  State.cols = as.cols; State.layout = as.layout;
  State.rH = as.rH.length ? as.rH : State.layout.map(r => r.type === 'full' ? (State.basePH === 1000 ? State.cellW * 2 : State.cellW) : State.cellW);
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

// 행 타입에 따른 픽셀 크기 반환
function ppx(rowType) {
  const s = SPECS[State.curLed];
  if (State.panelRotated && State.basePH === 1000) {
    // 1000mm 패널 가로 사용: 물리 크기 1000×500mm → 픽셀 h×w 교환
    return { w: s.px1000.h, h: s.px1000.w };
  }
  return rowType === 'half' ? s.px500 : (State.basePH === 1000 ? s.px1000 : s.px500);
}

// 파워콘 수량 계산
// 규칙: 열 2개당 1번 파워, 홀수 열이면 단독 열도 1개
// 숏파워: 각 열(2개 묶음)에서 패널 간 연결선 수 + 여유 20개
function calcPW() {
  const rows = State.layout.length;
  const pc = Math.floor(State.cols / 2), odd = State.cols % 2 === 1;
  let spNet = 0;
  for (let i = 0; i < pc; i++) spNet += (rows * 2) - 1;
  if (odd) { spNet += (rows - 1); }
  const c1Net = Math.ceil(State.cols / 2), c1Spare = State.spareAdj.c1, c1 = c1Net + c1Spare;
  const spSpare = State.spareAdj.sp, sp = spNet + spSpare, spBundle = Math.ceil(sp / 10);
  return { c1, c1Net, c1Spare, spNet, sp, spSpare, spBundle };
}

function calc() {
  State.betaImport = null;
  const W = parseFloat(document.getElementById('iW').value) || 0;
  const H = parseFloat(document.getElementById('iH').value) || 0;

  // 면적 미입력 시 안내 메시지
  if (!W || !H) {
    State.cols = 0; State.layout = [];
    const msg = isReady() ? '설치 면적을 입력하세요' : 'LED 종류와 패널 사이즈를 선택하세요';
    const sim = isReady() ? '설치 면적을 먼저 입력해주세요' : 'LED 종류와 패널 사이즈를 먼저 선택해주세요';
    document.getElementById('resultBody').innerHTML = `<div class="hint-text">${msg}</div>`;
    document.getElementById('simArea').innerHTML = `<div class="sim-locked">${sim}</div>`;
    return;
  }

  const Hmm = H * 1000;
  if (State.panelRotated && State.basePH === 1000) {
    State.cols = Math.max(1, Math.round(W * 1000 / 1000));
  } else {
    State.cols = Math.max(1, Math.round(W * 1000 / 500));
  }
  State.layout = [];

  if (!isReady()) {
    document.getElementById('resultBody').innerHTML = '<div class="hint-text">LED 종류와 패널 사이즈를 선택하세요</div>';
    document.getElementById('simArea').innerHTML = '<div class="sim-locked">LED 종류와 패널 사이즈를 먼저 선택해주세요</div>';
    return;
  }

  if (State.panelRotated && State.basePH === 1000) {
    // 가로 사용: 1000mm 폭 × 500mm 높이
    const nr = Math.max(1, Math.round(Hmm / 500));
    for (let i = 0; i < nr; i++) State.layout.push({ type: 'full' });
  } else if (State.basePH === 1000) {
    // 1000mm 기준 — 나머지가 400mm 이상이면 상단에 500mm(half) 패널 추가
    const fr = Math.floor(Hmm / 1000);
    if (Math.round(Hmm - fr * 1000) >= 400) { State.layout.push({ type: 'half' }); }
    for (let i = 0; i < fr; i++) State.layout.push({ type: 'full' });
  } else {
    // 500mm 기준
    const nr = Math.max(1, Math.round(Hmm / 500));
    for (let i = 0; i < nr; i++) State.layout.push({ type: 'full' });
  }

  // 크기 변경으로 범위 밖이 된 포트 할당 셀 제거
  State.pA.forEach((s, pi) => {
    [...s].forEach(k => {
      const [r, c] = k.split(',').map(Number);
      if (r >= State.layout.length || c >= State.cols) { s.delete(k); State.pH2[pi] = State.pH2[pi].filter(x => x !== k); }
    });
  });

  renderRes();
  buildSim();
}

// 샌딩카드 커버 가능 여부 HTML — Hz 높은 모드부터 체크
function _buildCoverHtml(tW, tH) {
  if (!State.curSending) { return ''; }
  const ss = SSPEC[State.curSending];
  const modesStr = ss.modes.map(m => `${m.maxW}×${m.maxH}@${m.maxHz}Hz`).join(' / ');
  const coverMode = [...ss.modes].sort((a, b) => b.maxHz - a.maxHz).find(m => tW <= m.maxW && tH <= m.maxH) || null;
  const ok = coverMode !== null;
  return `<div class="cover-row${ok ? '' : ' cover-over'}">
    <span>${ss.label}: ${modesStr}</span>
    <span class="cover-badge">${ok ? `✓ ${coverMode.maxHz}Hz 커버 가능` : '✗ 해상도 초과'}</span>
  </div>`;
}

function _renderResBeta() {
  const imp = State.betaImport;

  if (!imp.allPanels || !imp.allPanels.length) {
    let h = `<div class="metric-grid"><div class="metric"><div class="ml">LED 패널 수</div><div class="mv">${imp.totalPanels}<span class="mu"> ea</span></div></div></div>`;
    const resStr = imp.isRect && imp.tW ? `${imp.tW.toLocaleString()} × ${imp.tH.toLocaleString()} px` : '—';
    h += `<div class="res-banner"><div class="rl">최종 해상도</div><div class="rv">${resStr}</div></div>`;
    document.getElementById('resultBody').innerHTML = h;
    return;
  }

  // LED × 패널 크기 집계 (1000×500 가로 패널은 500×1000으로 정규화 — 동일 제품)
  const counts = {};
  const sizeSet = new Set();
  imp.allPanels.forEach(p => {
    const sk = (p.w === 1000 && p.h === 500) ? '500×1000' : `${p.w}×${p.h}`;
    sizeSet.add(sk);
    if (!counts[p.led]) { counts[p.led] = {}; }
    counts[p.led][sk] = (counts[p.led][sk] || 0) + 1;
  });
  const leds  = Object.keys(counts).sort();
  const sizes = [...sizeSet].sort();

  // 패널 단위 해상도 (led + 크기 → px 문자열)
  const panelPx = (led, sk) => {
    const sp = SPECS[led]; if (!sp) { return '?'; }
    const [pw, ph] = sk.split('×').map(Number);
    if (pw === 1000) { return `${sp.px1000.h}×${sp.px1000.w}`; }
    if (ph === 1000) { return `${sp.px1000.w}×${sp.px1000.h}`; }
    return `${sp.px500.w}×${sp.px500.h}`;
  };
  // 패널 크기별 랙 수 계산 (500×500: 24장/랙, 그 외: 12장/랙)
  const rackCount = (sk, n) => Math.ceil(n / (sk === '500×500' ? 24 : 12));
  // 헤더 해상도: 대표 LED(첫 번째) 기준 표시
  const repLed = leds[0];

  const th = '<tr><th>LED</th>' + sizes.map(sk =>
    `<th>${sk}mm<span class="beta-px-sub">(${panelPx(repLed, sk)}px)</span></th>`
  ).join('') + '<th>합계</th></tr>';
  const tbody = leds.map(led => {
    const total = sizes.reduce((s, sk) => s + (counts[led]?.[sk] || 0), 0);
    const totalRack = sizes.reduce((s, sk) => s + (counts[led]?.[sk] ? rackCount(sk, counts[led][sk]) : 0), 0);
    const cells = sizes.map(sk => {
      const n = counts[led]?.[sk] || 0;
      if (!n) { return '<td>-</td>'; }
      return `<td>${n}ea<span class="beta-px-sub">랙 ${rackCount(sk, n)}개</span></td>`;
    }).join('');
    return `<tr><td class="led-cell">${led}</td>${cells}<td class="total-cell">${total}ea<span class="beta-px-sub">랙 ${totalRack}개</span></td></tr>`;
  }).join('');
  const colTots = sizes.map(sk => leds.reduce((s, led) => s + (counts[led]?.[sk] || 0), 0));
  const colRacks = sizes.map((sk, i) => colTots[i] > 0 ? rackCount(sk, colTots[i]) : 0);
  const grand = colTots.reduce((a, b) => a + b, 0);
  const grandRack = colRacks.reduce((a, b) => a + b, 0);
  const totRow = '<tr class="trow-total"><td>합계</td>' + colTots.map((t, i) => `<td>${t}ea<span class="beta-px-sub">랙 ${colRacks[i]}개</span></td>`).join('') + `<td>${grand}ea<span class="beta-px-sub">랙 ${grandRack}개</span></td></tr>`;

  let h = `<table class="beta-panel-table">${th}${tbody}${totRow}</table>`;

  // 최고 픽셀 LED로 설치 면적 전체 해상도 계산
  const highLed = leds.reduce((best, led) => {
    const s = SPECS[led]; const bs = SPECS[best];
    return (s && bs && s.px500.w * s.px500.h > bs.px500.w * bs.px500.h) ? led : best;
  }, leds[0]);
  const hsp = SPECS[highLed];
  const maxTW = hsp ? Math.round(imp.areaW / 500) * hsp.px500.w : 0;
  const maxTH = hsp ? Math.round(imp.areaH / 500) * hsp.px500.h : 0;
  const resStr = maxTW ? `${maxTW.toLocaleString()} × ${maxTH.toLocaleString()} px` : '—';
  const resNote = leds.length > 1
    ? `<span style="font-size:11px;color:#aaa">(${highLed} 기준 최대)</span>`
    : '<span style="font-size:11px;color:#aaa">(설치 면적 기준)</span>';
  h += `<div class="res-banner"><div class="rl">최종 해상도</div><div class="rv">${resStr} ${resNote}</div></div>`;

  // 구역별 해상도
  if (imp.zones && imp.zones.length) {
    const zoneRows = imp.zones.map(z => {
      const zsp = SPECS[z.led]; if (!zsp) { return ''; }
      const spanC = z.panelW / 500, spanR = z.panelH / 500;
      const pCols = Math.floor(z.cols / spanC), pRows = Math.floor(z.rows / spanR);
      let pxW, pxH;
      if (z.panelW === 1000) { pxW = zsp.px1000.h; pxH = zsp.px1000.w; }
      else if (z.panelH === 1000) { pxW = zsp.px1000.w; pxH = zsp.px1000.h; }
      else { pxW = zsp.px500.w; pxH = zsp.px500.h; }
      const physW = (z.cols * 500 / 1000).toFixed(1);
      const physH = (z.rows * 500 / 1000).toFixed(1);
      return `<div class="zone-res-row"><span class="zr-id">${z.id}</span><span class="zr-spec">${z.led} · ${z.panelW}×${z.panelH}mm</span><span class="zr-px">${pCols * pxW}×${pRows * pxH}px</span><span class="zr-phys">${physW}×${physH}m</span></div>`;
    }).join('');
    h += `<div style="font-size:11px;color:#888;margin:4px 0 2px;">구역별 해상도</div><div class="zone-res-list">${zoneRows}</div>`;
  }

  document.getElementById('resultBody').innerHTML = h;
}

function renderRes() {
  if (!isReady()) { return; }
  if (State.betaImport) { _renderResBeta(); return; }
  const sp = SPECS[State.curLed];
  const isLand = State.panelRotated && State.basePH === 1000;
  let c5 = 0, c10 = 0;
  State.layout.forEach(r => {
    if (isLand) { c10 += State.cols; }
    else if (r.type === 'half') { c5 += State.cols; }
    else if (State.basePH === 1000) { c10 += State.cols; }
    else { c5 += State.cols; }
  });
  const tW = isLand ? State.cols * sp.px1000.h : State.cols * sp.px500.w;
  let tH = 0; State.layout.forEach(r => { tH += ppx(r.type).h; });

  // 물리 크기 → 대각선 인치
  const physW = State.cols * (isLand ? 1000 : 500);
  let physH = 0;
  State.layout.forEach(r => { physH += isLand ? 500 : (r.type === 'half' ? 500 : State.basePH); });
  const diagInch = Math.round(Math.sqrt(physW ** 2 + physH ** 2) / 25.4);

  // 패널 크기별 컬럼 정의 (실제 패널이 있는 크기만 표시)
  const colDefs = [];
  if (c5  > 0) { colDefs.push({ label: '500×500mm',  resPx: `${sp.px500.w}×${sp.px500.h}`,   count: c5,  rack: Math.ceil(c5  / 24) }); }
  if (c10 > 0) { colDefs.push(isLand
    ? { label: '1000×500mm', resPx: `${sp.px1000.h}×${sp.px1000.w}`, count: c10, rack: Math.ceil(c10 / 12) }
    : { label: '500×1000mm', resPx: `${sp.px1000.w}×${sp.px1000.h}`, count: c10, rack: Math.ceil(c10 / 12) }
  ); }
  const total = c5 + c10;
  const totalRack = colDefs.reduce((s, cd) => s + cd.rack, 0);
  const thCols = colDefs.map(cd => `<th>${cd.label}<span class="beta-px-sub">(${cd.resPx}px)</span></th>`).join('');
  const tdCols = colDefs.map(cd => `<td>${cd.count}ea<span class="beta-px-sub">랙 ${cd.rack}개</span></td>`).join('');

  let h = `<div class="res-layout-info">가로 ${State.cols}ea × 세로 ${State.layout.length}행</div>`;
  h += `<table class="beta-panel-table"><thead><tr><th>LED</th>${thCols}<th>합계</th></tr></thead>`;
  h += `<tbody><tr><td class="led-cell">${State.curLed}</td>${tdCols}<td class="total-cell">${total}ea<span class="beta-px-sub">랙 ${totalRack}개</span></td></tr></tbody></table>`;
  h += `<div class="res-banner"><div class="rl">최종 해상도</div><div class="rv">${tW} × ${tH} px <span class="res-inch">${diagInch}"</span></div><button class="res-img-btn" onclick="genResImage()">이미지 생성 →</button></div>`;
  h += _buildCoverHtml(tW, tH);
  document.getElementById('resultBody').innerHTML = h;
}


// 섹션 행 하나를 HTML로 변환
function _buildSectionRowHtml(k, r, totalTW) {
  const label = { left:'좌측', center:'중앙', right:'우측' }[k];
  if (!r) { return `<div class="res-section"><div class="res-sec-label">${label}</div><div class="res-sec-empty">미입력</div></div>`; }
  const ratioNum = totalTW ? r.tW / totalTW : 0;
  const ratio = totalTW ? ratioNum.toFixed(5) : '—';
  let offsetHtml = '';
  if (totalTW) {
    if (k === 'left') { offsetHtml = ` <span class="res-offset-note">Y이동: ${(ratioNum - 1).toFixed(3)}</span>`; }
    if (k === 'right') { offsetHtml = ` <span class="res-offset-note">Y이동: ${(1 - ratioNum).toFixed(3)}</span>`; }
  }
  return `<div class="res-section"><div class="res-sec-label">${label} — 가로 ${r.cols}ea × 세로 ${r.rows}행 <span class="res-ratio-note">(비율 ${ratio})</span>${offsetHtml}</div><div class="res-sec-val">${r.tW} × ${r.tH} px</div></div>`;
}

function renderResMulti() {
  if (!isReady()) { return; }
  const sp = SPECS[State.curLed];
  const isLand = State.panelRotated && State.basePH === 1000;

  let totalC5 = 0, totalC10 = 0, totalTW = 0, totalPhysW = 0, maxTH = 0, maxPhysH = 0;
  const secInfo = {};

  ['left','center','right'].forEach(k => {
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length) { secInfo[k] = null; return; }
    let c5 = 0, c10 = 0;
    sec.layout.forEach(r => {
      if (isLand) { c10 += sec.cols; }
      else if (r.type === 'half') { c5 += sec.cols; }
      else if (State.basePH === 1000) { c10 += sec.cols; }
      else { c5 += sec.cols; }
    });
    let tH = 0; sec.layout.forEach(r => { tH += ppx(r.type).h; });
    const tW = isLand ? sec.cols * sp.px1000.h : sec.cols * sp.px500.w;
    const physW = sec.cols * (isLand ? 1000 : 500);
    let physH = 0; sec.layout.forEach(r => { physH += isLand ? 500 : (r.type === 'half' ? 500 : State.basePH); });
    totalC5 += c5; totalC10 += c10; totalTW += tW; totalPhysW += physW;
    maxTH = Math.max(maxTH, tH); maxPhysH = Math.max(maxPhysH, physH);
    secInfo[k] = { c5, c10, tW, tH, cols: sec.cols, rows: sec.layout.length };
  });

  // 패널 표 (합계)
  const mColDefs = [];
  if (totalC5  > 0 && !isLand) { mColDefs.push({ label: '500×500mm',  resPx: `${sp.px500.w}×${sp.px500.h}`,   count: totalC5,  rack: Math.ceil(totalC5  / 24) }); }
  if (totalC10 > 0) { mColDefs.push(isLand
    ? { label: '1000×500mm', resPx: `${sp.px1000.h}×${sp.px1000.w}`, count: totalC10, rack: Math.ceil(totalC10 / 12) }
    : { label: '500×1000mm', resPx: `${sp.px1000.w}×${sp.px1000.h}`, count: totalC10, rack: Math.ceil(totalC10 / 12) }
  ); }
  const mGrand = totalC5 + totalC10;
  const mThCols = mColDefs.map(cd => `<th>${cd.label}<span class="beta-px-sub">(${cd.resPx}px)</span></th>`).join('');
  const mTdCols = mColDefs.map(cd => `<td>${cd.count}ea<span class="beta-px-sub">랙 ${cd.rack}개</span></td>`).join('');

  let h = `<table class="beta-panel-table"><thead><tr><th>LED</th>${mThCols}<th>합계</th></tr></thead>`;
  const mGrandRack = mColDefs.reduce((s, cd) => s + cd.rack, 0);
  h += `<tbody><tr><td class="led-cell">${State.curLed}</td>${mTdCols}<td class="total-cell">${mGrand}ea<span class="beta-px-sub">랙 ${mGrandRack}개</span></td></tr></tbody></table>`;

  // 전체 해상도 배너
  if (totalTW && maxTH) {
    const diagInch = Math.round(Math.sqrt(totalPhysW ** 2 + maxPhysH ** 2) / 25.4);
    h += `<div class="res-banner"><div class="rl">전체 해상도</div><div class="rv">${totalTW} × ${maxTH} px <span class="res-inch">${diagInch}"</span></div><button class="res-img-btn" onclick="genResImageMulti()">이미지 생성 →</button></div>`;
    h += _buildCoverHtml(totalTW, maxTH);
  }

  // 섹션별 해상도 + 가로 비율
  h += '<div class="res-section-list">';
  ['left','center','right'].forEach(k => { h += _buildSectionRowHtml(k, secInfo[k], totalTW); });
  h += '</div>';

  document.getElementById('resultBody').innerHTML = h;
}


// ════════════════════════════════════════════════════════════
//  §11  랜선 시뮬레이터
// ════════════════════════════════════════════════════════════


// ── 상태 초기화 ───────────────────────────────────────────

function rst() {
  const _n = State.lanExpanded ? 16 : 8;
  State.pA  = Array.from({ length: _n }, () => new Set());
  State.pH2 = Array.from({ length: _n }, () => []);
  State.spareAdj = { l1: 2, sl: 20, c1: 2, sp: 20 };
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;
  State.multiSec = { left:_mkSec(), center:_mkSec(), right:_mkSec() };
  State.activeSimSec = 'center';
  State.simTab = 'lan'; State._savedLan = null; State._savedPwr = null;
}
function rstPort(pi) {
  State.pA[pi] = new Set(); State.pH2[pi] = [];
  if (State.aPort === pi) { State.fCell = null; }
  State.aPort = firstEmpty();
}
// 데이터가 없는 첫 번째 포트 인덱스 반환
function firstEmpty() { for (let i = 0; i < State.pA.length; i++) { if (State.pA[i].size === 0) return i; } return 0; }
function nextEmpty()  { for (let i = 0; i < State.pA.length; i++) { if (State.pA[i].size === 0) return i; } return State.aPort; }

// ── 시뮬레이터 탭 전환 & 파워콘 헬퍼 ────────────────────────

// 단일 모드에서 바닥행 분리 유·불리 계산
function _rowSplitHint() {
  if (!isReady() || !State.cols || State.layout.length < 2) { return null; }
  const C = State.cols, layout = State.layout;
  const bPx = ppx(layout[layout.length - 1].type);
  const bottomPx = bPx.w * bPx.h;
  if (C * bottomPx > MAX_PX) { return '불가'; }
  const colPx = layout.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  const m = Math.floor(MAX_PX / colPx);
  const mP = Math.floor(MAX_PX / (colPx - bottomPx));
  if (mP <= m) { return '불리'; }
  return C > (m * mP) / (mP - m) ? '유리' : '불리';
}

// 멀티 모드에서 바닥행 분리 유·불리 계산 (섹션 독립 판정)
function _rowSplitHintMulti() {
  if (!isReady()) { return null; }
  const secs = ['left','center','right'].map(k => State.multiSec[k]).filter(s => s.cols && s.layout.length >= 2);
  if (!secs.length) { return null; }
  let anyGood = false;
  for (const sec of secs) {
    const C = sec.cols, layout = sec.layout;
    const bPx = ppx(layout[layout.length - 1].type);
    const bottomPx = bPx.w * bPx.h;
    if (C * bottomPx > MAX_PX) { return '불가'; }
    const colPx = layout.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
    const m = Math.floor(MAX_PX / colPx);
    const mP = Math.floor(MAX_PX / (colPx - bottomPx));
    if (mP <= m) { continue; }
    if (C > (m * mP) / (mP - m)) { anyGood = true; }
  }
  return anyGood ? '유리' : '불리';
}

// 파워콘 기본 배선 적용 (2열당 1개, 스네이크: 짝수열 아래→위, 홀수열 위→아래)
function _applyDefaultPwrWiring() {
  for (let i = 0; i < State.pA.length; i++) { State.pA[i].clear(); State.pH2[i] = []; }
  State.aPort = 0; State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null;
  let pi = 0;
  if (State.betaImport) {
    const imp = State.betaImport;
    const R = imp.rows, pW = imp.areaW / imp.cols, pH = imp.areaH / imp.rows;
    const zones = imp.zones && imp.zones.length ? imp.zones : [null];
    zones.forEach(z => {
      if (pi >= PWR_PORT_COUNT) { return; }
      const panels = z ? imp.allPanels.filter(p => p.zoneId === z.id) : imp.allPanels;
      const zCells = new Set();
      panels.forEach(p => {
        const ci0 = Math.round(p.x / pW), ri0 = Math.round(p.y / pH);
        const ci1 = Math.round((p.x + p.w) / pW), ri1 = Math.round((p.y + p.h) / pH);
        for (let ri = ri0; ri < ri1; ri++) { for (let ci = ci0; ci < ci1; ci++) { zCells.add(`${ri},${ci}`); } }
      });
      if (!zCells.size) { return; }
      const colList = [...new Set([...zCells].map(k => +k.split(',')[1]))].sort((a, b) => a - b);
      for (let i = 0; i < colList.length && pi < State.pA.length; i += 2) {
        const c0 = colList[i], c1 = i + 1 < colList.length ? colList[i + 1] : null;
        for (let ri = R - 1; ri >= 0; ri--) { if (zCells.has(`${ri},${c0}`)) { assign(pi, `${ri},${c0}`); } }
        if (c1 !== null) { for (let ri = 0; ri < R; ri++) { if (zCells.has(`${ri},${c1}`)) { assign(pi, `${ri},${c1}`); } } }
        pi++;
      }
    });
    return;
  }
  if (State.areaMode === 'multi') {
    ['left','center','right'].forEach(sn => {
      const sec = State.multiSec[sn];
      if (!sec.cols || !sec.layout.length) { return; }
      const C = sec.cols, R = sec.layout.length;
      for (let ci = 0; ci < C && pi < State.pA.length; ci += 2) {
        for (let ri = R - 1; ri >= 0; ri--) { assign(pi, `${sn}:${ri},${ci}`); }
        if (ci + 1 < C) { for (let ri = 0; ri < R; ri++) { assign(pi, `${sn}:${ri},${ci + 1}`); } }
        pi++;
      }
    });
  } else {
    const C = State.cols, R = State.layout.length;
    for (let ci = 0; ci < C && pi < State.pA.length; ci += 2) {
      for (let ri = R - 1; ri >= 0; ri--) { assign(pi, `${ri},${ci}`); }
      if (ci + 1 < C) { for (let ri = 0; ri < R; ri++) { assign(pi, `${ri},${ci + 1}`); } }
      pi++;
    }
  }
}

// 파워콘 배선이 기본값(2열당 1개)인지 확인
function _isDefaultPwrWiring(pwrPA) {
  if (State.areaMode === 'multi') {
    let p = 0;
    for (const sn of ['left','center','right']) {
      const sec = State.multiSec[sn];
      if (!sec.cols || !sec.layout.length) { continue; }
      const C = sec.cols, R = sec.layout.length;
      for (let ci = 0; ci < C; ci += 2) {
        if (p >= pwrPA.length || pwrPA[p].size === 0) { return false; }
        const ci2 = ci + 1;
        const sz = R * (ci2 < C ? 2 : 1);
        if (pwrPA[p].size !== sz) { return false; }
        for (let ri = 0; ri < R; ri++) {
          if (!pwrPA[p].has(`${sn}:${ri},${ci}`)) { return false; }
          if (ci2 < C && !pwrPA[p].has(`${sn}:${ri},${ci2}`)) { return false; }
        }
        p++;
      }
    }
    for (let i = p; i < pwrPA.length; i++) { if (pwrPA[i].size > 0) { return false; } }
    return true;
  }
  const C = State.cols, R = State.layout.length;
  if (!C || !R) { return true; }
  const expected = Math.ceil(C / 2);
  if (pwrPA.filter(s => s.size > 0).length !== expected) { return false; }
  for (let p = 0; p < expected; p++) {
    const ci1 = p * 2, ci2 = ci1 + 1;
    const sz = R * (ci2 < C ? 2 : 1);
    if (pwrPA[p].size !== sz) { return false; }
    for (let ri = 0; ri < R; ri++) {
      if (!pwrPA[p].has(`${ri},${ci1}`)) { return false; }
      if (ci2 < C && !pwrPA[p].has(`${ri},${ci2}`)) { return false; }
    }
  }
  return true;
}

function _execRstAllPwr() {
  _applyDefaultPwrWiring();
  drawCv(); renderPorts(); renderLeg(); renderSum();
}
function doRstAllPwr() { openConfirm('파워콘 기본값 초기화', '파워콘 배선을 기본값(2열당 1개)으로 초기화할까요?', _execRstAllPwr); }

function _execRstAllPwrClear() {
  for (let i = 0; i < State.pA.length; i++) { State.pA[i].clear(); State.pH2[i] = []; }
  State.aPort = 0; State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}
function doRstAllPwrClear() { openConfirm('파워콘 전체 초기화', '파워콘 배선 전체를 초기화할까요?', _execRstAllPwrClear); }

function addPwrPort() {
  if (State.simTab !== 'pwr') { return; }
  State.pA.push(new Set()); State.pH2.push([]);
  renderPorts(); renderSum();
}
function _doRemovePwrPort() {
  if (State.pA.length <= 1) { return; }
  if (State.aPort >= State.pA.length - 1) { State.aPort = State.pA.length - 2; }
  State.pA.pop(); State.pH2.pop();
  renderPorts(); drawCv(); renderSum();
}
function removePwrPort() {
  if (State.simTab !== 'pwr' || State.pA.length <= 1) { return; }
  const last = State.pA[State.pA.length - 1];
  if (last.size > 0) {
    openConfirm(`P${State.pA.length} 포트 제거`, `P${State.pA.length}에 ${last.size}장이 할당되어 있습니다. 제거할까요?`, _doRemovePwrPort);
  } else { _doRemovePwrPort(); }
}

// 랜선 ↔ 파워콘 탭 전환
function setSimTab(tab) {
  if (State.simTab === tab) { return; }
  // 현재 탭 상태 저장
  if (State.simTab === 'lan') {
    State._savedLan = { pA: State.pA.map(s => new Set(s)), pH2: State.pH2.map(a => [...a]), aPort: State.aPort };
  } else {
    State._savedPwr = { pA: State.pA.map(s => new Set(s)), pH2: State.pH2.map(a => [...a]), aPort: State.aPort };
  }
  State.simTab = tab;
  // 새 탭 상태 복원
  const saved = tab === 'lan' ? State._savedLan : State._savedPwr;
  if (saved) {
    State.pA = saved.pA; State.pH2 = saved.pH2; State.aPort = saved.aPort;
  } else {
    State.pA = Array.from({ length: tab === 'pwr' ? PWR_PORT_COUNT : 8 }, () => new Set());
    State.pH2 = Array.from({ length: tab === 'pwr' ? PWR_PORT_COUNT : 8 }, () => []);
    State.aPort = 0;
    if (tab === 'pwr') { _applyDefaultPwrWiring(); }
  }
  buildSim();
}

// ── 시뮬레이터 UI 빌드 ────────────────────────────────────

function buildSim() {
  const isPwr = State.simTab === 'pwr';
  const isFs = !!document.getElementById('simFsBg');
  const fsBtn = isFs ? '' : `<button class="reset-btn sim-fs" onclick="openSimFs()">가로모드</button>`;
  const tabRow = `<div class="sim-tab-row">
    <button class="sim-tab${!isPwr ? ' active' : ''}" onclick="setSimTab('lan')">랜선</button>
    <button class="sim-tab${isPwr ? ' active' : ''}" onclick="setSimTab('pwr')">파워콘</button>
  </div>`;

  let controlRow;
  if (isPwr) {
    controlRow = `<div class="reset-row">
      <button class="reset-btn all" onclick="doRstAllPwrClear()">전체 초기화</button>
      <button class="reset-btn" onclick="doRstAllPwr()">기본값 초기화</button>
      <button class="reset-btn" id="rstPBtn" onclick="doRstPort()">포트 초기화</button>
      ${fsBtn}
    </div>`;
  } else if (State.areaMode === 'multi') {
    const hintM = _rowSplitHintMulti();
    const chipClsM = hintM === '유리' ? 'good' : hintM === '불가' ? 'na' : 'bad';
    const chipM = hintM ? `<span class="rs-chip ${chipClsM}">${hintM}</span>` : '';
    controlRow = `<div class="reset-row">
      <div class="auto-assign-group">
        <span class="aag-lbl">자동할당</span>
        <button class="reset-btn auto-assign" onclick="doAutoAssignUnified()">기본</button>
        <button class="reset-btn auto-assign" onclick="doAutoAssign()">섹션별 분리</button>
        <button class="reset-btn auto-assign" onclick="doAutoAssignRowSplitUnified()">↕ 바닥행 분리${chipM}</button>
      </div>
      <button class="reset-btn all" onclick="doRstAll()">전체 초기화</button>
      <button class="reset-btn" id="rstPBtn" onclick="doRstPort()">포트 초기화</button>
      ${fsBtn}
    </div>`;
  } else {
    const hint = _rowSplitHint();
    const chipCls = hint === '유리' ? 'good' : hint === '불가' ? 'na' : 'bad';
    const chip = hint ? `<span class="rs-chip ${chipCls}">${hint}</span>` : '';
    controlRow = `<div class="reset-row">
      <div class="auto-assign-group">
        <span class="aag-lbl">자동할당</span>
        <button class="reset-btn auto-assign" onclick="doAutoAssign()">기본</button>
        <button class="reset-btn auto-assign" onclick="doAutoAssignRowSplit()">↕ 바닥행 분리${chip}</button>
      </div>
      <button class="reset-btn all" onclick="doRstAll()">전체 초기화</button>
      <button class="reset-btn" id="rstPBtn" onclick="doRstPort()">포트 초기화</button>
      ${fsBtn}
    </div>`;
  }

  const _hint2Text = isPwr
    ? '<b style="color:#333">탭/클릭</b> 할당·해제 &nbsp;·&nbsp; <b style="color:#333">꾹+드래그</b> 연속 할당 &nbsp;·&nbsp; <b style="color:#333">기본값</b> 2열당 1개'
    : '<b style="color:#333">탭/클릭</b> 할당·해제 &nbsp;·&nbsp; <b style="color:#333">꾹+드래그</b> 자동 포트 선택 후 연속 할당 &nbsp;·&nbsp; <b style="color:#333">역방향</b> 취소';
  const hintBar = isPwr
    ? `<div class="sim-hint" style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
        <span>${_hint2Text}</span>
        <span style="display:flex;gap:4px;flex-shrink:0;">
          <button class="port-btn expand-port-btn" onclick="addPwrPort()" title="포트 추가">+ 포트</button>
          <button class="port-btn expand-port-btn" onclick="removePwrPort()" title="마지막 포트 제거">− 포트</button>
        </span>
      </div>`
    : `<div class="sim-hint">${_hint2Text}</div>`;

  document.getElementById('simArea').innerHTML = `
    ${tabRow}
    ${hintBar}
    <div class="port-strip" id="portStrip"></div>
    <div class="port-info-bar" id="portInfo"></div>
    ${controlRow}
    <canvas id="simCanvas" tabindex="0" style="outline:none;cursor:crosshair;border-radius:6px;"></canvas>
    <div class="legend" id="legend"></div>
    <div id="simSum"></div>`;
  attachEv();
  renderPorts(); buildCv(); renderLeg(); renderSum();
  if (isFs) { _refreshSimFs(); }
  if (!isPwr && State.pA.every(s => s.size === 0)) {
    if (State.areaMode === 'multi') { autoAssignUnified(); } else { autoAssign(); }
  }
}

function openSimFs() {
  if (document.getElementById('simFsBg')) { return; }

  // simArea의 기존 ID 제거 (오버레이 ID와 충돌 방지)
  ['portStrip', 'portInfo', 'rstPBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.removeAttribute('id'); }
  });

  const isPwr = State.simTab === 'pwr';
  const isMulti = State.areaMode === 'multi';
  const tabRowFs = `<div class="sim-tab-row" style="margin-bottom:6px;">
    <button class="sim-tab${!isPwr?' active':''}" onclick="setSimTab('lan')">랜선</button>
    <button class="sim-tab${isPwr?' active':''}" onclick="setSimTab('pwr')">파워콘</button>
  </div>`;
  let autoButtons;
  if (isPwr) {
    autoButtons = `<button class="reset-btn all" onclick="doRstAllPwrClear()">전체 초기화</button>
      <button class="reset-btn" onclick="doRstAllPwr()">기본값 초기화</button>`;
  } else if (isMulti) {
    const hintMFs = _rowSplitHintMulti();
    const chipClsMFs = hintMFs === '유리' ? 'good' : hintMFs === '불가' ? 'na' : 'bad';
    const chipMFs = hintMFs ? `<span class="rs-chip ${chipClsMFs}">${hintMFs}</span>` : '';
    autoButtons = `<div class="auto-assign-group">
      <span class="aag-lbl">자동할당</span>
      <button class="reset-btn auto-assign" onclick="doAutoAssignUnified()">기본</button>
      <button class="reset-btn auto-assign" onclick="doAutoAssign()">섹션별</button>
      <button class="reset-btn auto-assign" onclick="doAutoAssignRowSplitUnified()">↕ 바닥행${chipMFs}</button>
    </div>`;
  } else {
    const hint = _rowSplitHint();
    const chipCls = hint === '유리' ? 'good' : hint === '불가' ? 'na' : 'bad';
    const chip = hint ? `<span class="rs-chip ${chipCls}">${hint}</span>` : '';
    autoButtons = `<div class="auto-assign-group">
      <span class="aag-lbl">자동할당</span>
      <button class="reset-btn auto-assign" onclick="doAutoAssign()">기본</button>
      <button class="reset-btn auto-assign" onclick="doAutoAssignRowSplit()">↕ 바닥행${chip}</button>
    </div>`;
  }

  const rstAllBtn = isPwr
    ? `<button class="reset-btn all" onclick="doRstAllPwr()">기본값 초기화</button>`
    : `<button class="reset-btn all" onclick="doRstAll()">전체 초기화</button>`;

  const bg = document.createElement('div');
  bg.id = 'simFsBg';
  bg.className = 'sim-fs-bg';
  bg.innerHTML = `
    <div class="sim-fs-topbar">
      <div class="port-strip" id="portStrip"></div>
      <button class="sim-fs-close" onclick="closeSimFs()">✕</button>
    </div>
    <div class="sim-fs-canvas-wrap" id="simFsCanvasWrap"></div>
    <div class="sim-fs-bottom">
      ${tabRowFs}
      <div class="reset-row">
        ${autoButtons}
        ${rstAllBtn}
        <button class="reset-btn" id="rstPBtn" onclick="doRstPort()">포트 초기화</button>
        <div class="port-info-bar" id="portInfo"></div>
      </div>
    </div>`;

  const cv = document.getElementById('simCanvas');
  if (cv) { bg.querySelector('#simFsCanvasWrap').appendChild(cv); }
  document.body.appendChild(bg);
  history.pushState({ overlay: 'simFs' }, '');

  bg.requestFullscreen()
    .then(() => screen.orientation.lock('landscape').catch(() => {}))
    .catch(() => {});

  renderPorts(); buildCv();
}

function closeSimFs() {
  const bg = document.getElementById('simFsBg');
  if (!bg) { return; }
  bg.remove();
  if (document.fullscreenElement) { document.exitFullscreen(); }
  if (history.state && history.state.overlay === 'simFs') { _histBack(); }
  buildSim();
}

function _refreshSimFs() {
  const wrap = document.getElementById('simFsCanvasWrap');
  if (!wrap) { return; }
  const cv = document.getElementById('simCanvas');
  if (cv) { wrap.innerHTML = ''; wrap.appendChild(cv); }
  renderPorts(); buildCv();
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) { closeSimFs(); }
});

window.addEventListener('resize', () => {
  if (document.getElementById('simFsBg')) { buildCv(); }
  if (document.getElementById('tab-beta')?.classList.contains('on') && State.betaAreaW) { betaRender(); }
});

function _execRstAll() {
  rst();
  if (State.areaMode === 'multi') { calcMulti(); return; }
  drawCv(); renderPorts(); renderLeg(); renderSum();
}
function doRstAll()    { openConfirm('포트 전체 초기화', '할당된 모든 포트를 초기화할까요?', _execRstAll); }
function doRstPort()   { rstPort(State.aPort); drawCv(); renderPorts(); renderLeg(); renderSum(); }

// 특정 포트의 총 픽셀 수 계산
function pxOf(pi) {
  if (State.betaImport && State.simTab === 'lan') {
    let px = 0;
    State.pA[pi].forEach(k => {
      const p = State.betaImport.allPanels.find(q => q.key === k);
      if (!p) { return; }
      const sp = SPECS[p.led] || SPECS[State.curLed];
      const isLand = p.w === 1000 && p.h === 500;
      const isPort = p.w === 500 && p.h === 1000;
      if (isLand)      { px += sp.px1000.h * sp.px1000.w; }
      else if (isPort) { px += sp.px1000.w * sp.px1000.h; }
      else             { px += sp.px500.w  * sp.px500.h; }
    });
    return px;
  }
  let px = 0;
  State.pA[pi].forEach(k => {
    let r, lay;
    if (State.areaMode === 'multi' && k.includes(':')) {
      const [sec, coords] = k.split(':');
      [r] = coords.split(',').map(Number);
      lay = State.multiSec[sec]?.layout;
    } else {
      [r] = k.split(',').map(Number);
      lay = State.layout;
    }
    if (!lay || !lay[r]) { return; }
    const p = ppx(lay[r].type);
    px += p.w * p.h;
  });
  return px;
}

// ── 포트 버튼 & 정보바 렌더링 ─────────────────────────────

function renderPorts() {
  const s = document.getElementById('portStrip'); if (!s) return;
  s.innerHTML = (() => {
    let _h = '';
    State.pA.forEach((set, i) => {
      const on = i === State.aPort, has = set.size > 0;
      const _col = portColor(i);
      _h += `<button class="port-btn${on?' active':''}${has?' has-data':''}"
        style="${on ? `background:${_col};border-color:${_col};` : `border-color:${_col};color:${_col};`}"
        onclick="setP(${i})">P${i+1}</button>`;
      if (i === 7 && !State.lanExpanded && State.simTab === 'lan') {
        _h += `<button class="port-btn expand-port-btn" onclick="expandLanPorts()" title="샌딩카드 확장 — 포트 16개">샌딩카드 확장</button>`;
      }
    });
    return _h;
  })();

  const pi = document.getElementById('portInfo');
  if (pi) {
    const fsMode = !!document.getElementById('simFsBg');
    const cnt = State.pA[State.aPort].size;
    const _aCol = portColor(State.aPort);
    if (State.simTab === 'pwr') {
      const label = fsMode ? `P${State.aPort+1}` : `파워콘 ${State.aPort+1}`;
      pi.innerHTML = `<div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:${fsMode?12:13}px;font-weight:${fsMode?600:500};color:${_aCol}">${label}</span>
        <span style="font-size:${fsMode?12:13}px;color:#333;">${cnt}장</span>
        ${State.drag ? `<span class="drag-badge" style="background:${_aCol}">드래그 중</span>` : ''}
      </div>`;
    } else {
      const px = pxOf(State.aPort);
      const pct = Math.min(100, Math.round(px / MAX_PX * 100));
      const ov = px > MAX_PX;
      pi.innerHTML = fsMode
        ? `<div style="display:flex;align-items:center;gap:6px;white-space:nowrap;">
            <span style="font-size:12px;font-weight:600;color:${_aCol}">P${State.aPort+1}</span>
            <span style="font-size:12px;color:#333;">${cnt}장 · ${px.toLocaleString()} px</span>
            <span style="font-size:12px;color:${ov?'#A32D2D':'#888'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov?' ⚠ 초과':''}</span>
            ${State.drag ? `<span class="drag-badge" style="background:${_aCol}">드래그 중</span>` : ''}
          </div>`
        : `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <span style="font-size:13px;font-weight:500;color:${_aCol}">포트 ${State.aPort+1}</span>
            <span style="font-size:13px;color:#333;">${cnt}장 · ${px.toLocaleString()} px</span>
            <span style="font-size:12px;color:${ov?'#A32D2D':'#888'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov?' ⚠ 초과':''}</span>
            ${State.drag ? `<span class="drag-badge" style="background:${_aCol}">드래그 중</span>` : ''}
          </div>
          <div style="height:5px;background:#eee;border-radius:3px;margin-top:6px;">
            <div style="height:5px;width:${pct}%;background:${ov?'#E24B4A':_aCol};border-radius:3px;"></div>
          </div>`;
    }
  }

  const rb = document.getElementById('rstPBtn');
  if (rb) { rb.textContent = `포트 ${State.aPort+1} 초기화`; }
}
function expandLanPorts() {
  State.lanExpanded = true;
  while (State.pA.length  < 16) { State.pA.push(new Set()); }
  while (State.pH2.length < 16) { State.pH2.push([]); }
  renderPorts(); drawCv(); renderSum(); saveState();
}
function setP(i) { State.aPort = i; renderPorts(); }

// ── 캔버스 빌드 & 드로잉 ──────────────────────────────────

function buildCv() {
  const cv = document.getElementById('simCanvas'); if (!cv) return;
  const fsMode = !!document.getElementById('simFsBg');

  if (State.areaMode === 'multi') {
    const activeSecs = ['left','center','right'].filter(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
    if (!activeSecs.length) { return; }
    const totalCols = activeSecs.reduce((s, k) => s + State.multiSec[k].cols, 0);
    const gaps = activeSecs.length - 1;
    const cW = Math.min(cv.parentElement.clientWidth - 32, fsMode ? 9999 : 900);
    const maxCellWM = State.panelRotated && State.basePH === 1000 ? 120 : 60;
    State.cellW = Math.max(22, Math.min(maxCellWM, Math.floor((cW - gaps * SECTION_GAP) / totalCols)));
    if (fsMode) {
      const availH = cv.parentElement.clientHeight - 8;
      if (availH > 0) {
        const isLandCv = State.panelRotated && State.basePH === 1000;
        const maxFactor = Math.max(...activeSecs.map(k => {
          const sec = State.multiSec[k];
          if (isLandCv) { return sec.layout.length * 0.5; }
          return sec.layout.reduce((s, r) => s + (r.type === 'full' && State.basePH === 1000 ? 2 : 1), 0);
        }));
        const cellWFromH = Math.floor((availH - SEC_LBL_H) / Math.max(0.5, maxFactor));
        State.cellW = Math.min(State.cellW, Math.max(22, cellWFromH));
      }
    }
    let xOff = 0;
    ['left','center','right'].forEach(k => {
      const sec = State.multiSec[k];
      if (sec.cols > 0 && sec.layout.length > 0) {
        State.multiCvOffsets[k] = xOff;
        sec.rH = State.panelRotated && State.basePH === 1000
          ? sec.layout.map(() => Math.max(14, Math.round(State.cellW / 2)))
          : sec.layout.map(r => r.type === 'full' ? (State.basePH === 1000 ? State.cellW * 2 : State.cellW) : State.cellW);
        xOff += sec.cols * State.cellW + SECTION_GAP;
      } else {
        State.multiCvOffsets[k] = -1; sec.rH = [];
      }
    });
    State.rH = State.multiSec[State.activeSimSec].rH.length ? State.multiSec[State.activeSimSec].rH : [];
    cv.width = xOff - SECTION_GAP;
    cv.height = SEC_LBL_H + Math.max(...activeSecs.map(k => State.multiSec[k].rH.reduce((s, h) => s + h, 0)));
    drawCv();
    return;
  }

  if (!State.cols || !State.layout.length) { return; }
  if (State.betaImport) {
    const imp = State.betaImport;
    const cW = Math.min(cv.parentElement.clientWidth - 32, fsMode ? 9999 : 600);
    let sc = Math.max(0.05, cW / imp.areaW);
    if (fsMode) {
      const availH = cv.parentElement.clientHeight - 8;
      if (availH > 0) { sc = Math.min(sc, availH / imp.areaH); }
    }
    cv.width  = Math.round(imp.areaW * sc);
    cv.height = Math.round(imp.areaH * sc);
    drawCv();
    return;
  }
  const cW = Math.min(cv.parentElement.clientWidth - 32, fsMode ? 9999 : 600);
  const maxCellW = State.panelRotated && State.basePH === 1000 ? 128 : 64;
  State.cellW = Math.max(28, Math.min(maxCellW, Math.floor(cW / State.cols)));
  if (fsMode) {
    const availH = cv.parentElement.clientHeight - 8;
    if (availH > 0) {
      const totalFactor = State.panelRotated && State.basePH === 1000
        ? State.layout.length * 0.5
        : State.layout.reduce((s, r) => s + (r.type === 'full' && State.basePH === 1000 ? 2 : 1), 0);
      const cellWFromH = Math.floor(availH / Math.max(0.5, totalFactor));
      State.cellW = Math.min(State.cellW, Math.max(28, cellWFromH));
    }
  }
  State.rH = State.panelRotated && State.basePH === 1000
    ? State.layout.map(() => Math.max(14, Math.round(State.cellW / 2)))
    : State.layout.map(r => r.type === 'full' ? (State.basePH === 1000 ? State.cellW * 2 : State.cellW) : State.cellW);
  cv.width = State.cols * State.cellW;
  cv.height = State.rH.reduce((s, h) => s + h, 0);
  drawCv();
}
function cxOf(c) { return c * State.cellW + State.cellW / 2; }
function cyOf(r) { let y = 0; for (let i = 0; i < r; i++) y += State.rH[i]; return y + State.rH[r] / 2; }

// 마우스/터치 좌표 → 행·열 인덱스 변환
function _impCellAtPwr(mx, my) {
  const imp = State.betaImport;
  const cv  = document.getElementById('simCanvas');
  if (!imp || !cv) { return null; }
  const sc = cv.width / imp.areaW;
  const pW = imp.areaW / imp.cols, pH = imp.areaH / imp.rows;
  const mmX = mx / sc, mmY = my / sc;
  const ci = Math.min(imp.cols-1, Math.max(0, Math.floor(mmX / pW)));
  const ri = Math.min(imp.rows-1, Math.max(0, Math.floor(mmY / pH)));
  // 데드존 제외
  if (!imp.allPanels.some(p =>
    Math.round(p.x/pW) <= ci && Math.round((p.x+p.w)/pW) > ci &&
    Math.round(p.y/pH) <= ri && Math.round((p.y+p.h)/pH) > ri
  )) { return null; }
  return { key: `${ri},${ci}`, r: ri, c: ci, cx: (ci*pW+pW/2)*sc, cy: (ri*pH+pH/2)*sc };
}

function cellAt(mx, my) {
  if (State.betaImport && State.simTab === 'lan') { return _impCellAt(mx, my); }
  if (State.betaImport && State.simTab === 'pwr') { return _impCellAtPwr(mx, my); }
  if (State.areaMode === 'multi') {
    for (const k of ['left','center','right']) {
      if (State.multiCvOffsets[k] < 0) { continue; }
      const sec = State.multiSec[k];
      if (!sec.rH || !sec.rH.length) { continue; }
      const xStart = State.multiCvOffsets[k];
      if (mx < xStart || mx >= xStart + sec.cols * State.cellW) { continue; }
      const localY = my - SEC_LBL_H;
      if (localY < 0) { return null; }
      const c = Math.floor((mx - xStart) / State.cellW);
      let y = 0, ri = -1;
      sec.rH.forEach((h, i) => { if (ri < 0 && localY >= y && localY < y + h) ri = i; y += h; });
      if (ri < 0 || c < 0 || c >= sec.cols) { return null; }
      return { key: `${k}:${ri},${c}`, r: ri, c, section: k };
    }
    return null;
  }
  if (mx < 0 || mx >= State.cols * State.cellW) { return null; }
  const c = Math.floor(mx / State.cellW); let y = 0, ri = -1;
  State.rH.forEach((h, i) => { if (ri < 0 && my >= y && my < y + h) ri = i; y += h; });
  if (ri < 0 || c < 0 || c >= State.cols) { return null; }
  // betaImport 데드존 셀 선택 불가
  if (State.betaImport && State.simTab === 'pwr') {
    const imp = State.betaImport;
    const pW = imp.areaW / imp.cols, pH = imp.areaH / imp.rows;
    if (!imp.allPanels.some(p => p.x < (c+1)*pW && p.x+p.w > c*pW && p.y < (ri+1)*pH && p.y+p.h > ri*pH)) { return null; }
  }
  return { key: `${ri},${c}`, r: ri, c, cx: cxOf(c), cy: cyOf(ri) };
}

function _impCellAt(mx, my) {
  const imp = State.betaImport;
  const cv  = document.getElementById('simCanvas');
  if (!imp || !cv) { return null; }
  const sc  = cv.width / imp.areaW;
  const mmX = mx / sc, mmY = my / sc;
  for (const p of imp.allPanels) {
    if (mmX >= p.x && mmX < p.x + p.w && mmY >= p.y && mmY < p.y + p.h) {
      return { key: p.key, cx: (p.x + p.w / 2) * sc, cy: (p.y + p.h / 2) * sc };
    }
  }
  return null;
}

// 특정 셀을 소유한 포트 인덱스 반환 (-1 = 미할당)
function owner(k) { let o = -1; State.pA.forEach((s, i) => { if (s.has(k)) o = i; }); return o; }

function assign(pi, k) {
  let o = -1; State.pA.forEach((s, i) => { if (s.has(k)) o = i; });
  if (o >= 0 && o !== pi) { return false; } // 다른 포트에 이미 할당된 셀은 건드리지 않음
  if (!State.pA[pi].has(k)) { State.pA[pi].add(k); State.pH2[pi].push(k); }
  return true;
}
function deassign(pi, k) { State.pA[pi].delete(k); State.pH2[pi] = State.pH2[pi].filter(x => x !== k); }

// 포트별 배선 경로를 연속 베지어 곡선으로 그리기
// 같은 열 이동: 직선, 열 전환(뱀 꺾임): 2차 베지어 곡선 (위/아래 호)
function drawPortPaths(ctx, secName) {
  const rows = State.layout.length;
  const pfx = secName ? secName + ':' : null;
  State.pA.forEach((s, pi) => {
    const h = State.pH2[pi].filter(k => s.has(k) && (!pfx || k.startsWith(pfx)));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const raw = pfx ? k.slice(pfx.length) : k;
      const [r, c] = raw.split(',').map(Number);
      return { x: cxOf(c), y: cyOf(r), r, c };
    });

    // 마지막 세그먼트 방향 사전 계산 (화살촉 각도용)
    const pL0 = pts[pts.length - 2], pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x, ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx*ldx + ldy*ldy); if (len < 1) return;
      const ux = ldx/len, uy = ldy/len, hw = 6, hl = 12, nx = -uy, ny = ux;
      const bx = pL1.x - ux*5, by = pL1.y - uy*5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux*hl + nx*hw, by - uy*hl + ny*hw);
      ctx.lineTo(bx - ux*hl - nx*hw, by - uy*hl - ny*hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });
}

function drawCv() {
  const cv = document.getElementById('simCanvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  ctx.clearRect(0, 0, cv.width, cv.height);
  if (State.betaImport && State.simTab === 'lan') { _drawImportedCv(ctx, cv); return; }
  if (State.betaImport && State.simTab === 'pwr') { _drawImportedCvPwr(ctx, cv); return; }
  if (State.areaMode === 'multi') { _drawCvMulti(ctx); return; }
  _drawSingleSection(ctx);
}

function _drawImportedCv(ctx, cv) {
  const imp   = State.betaImport;
  const sc    = cv.width / imp.areaW;
  const curPi = State.aPort;

  // 격자 배경
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, cv.width, cv.height);
  const gW = Math.round(imp.areaW / 500); const gH = Math.round(imp.areaH / 500);
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c * 500 * sc, 0); ctx.lineTo(c * 500 * sc, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * 500 * sc); ctx.lineTo(cv.width, r * 500 * sc); ctx.stroke();
  }

  // 배선 순서 번호 맵
  const stepOf = new Map();
  State.pA.forEach((s, pi) => {
    State.pH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // pass 1: 셀 배경·테두리·패턴
  imp.allPanels.forEach(p => {
    const pi  = owner(p.key);
    const px  = p.x * sc; const py = p.y * sc;
    const pw  = p.w * sc; const ph = p.h * sc;
    const lk  = pi >= 0 && pi !== curPi;
    const hov = State.drag && State.dHov === p.key && pi < 0;

    ctx.fillStyle = pi >= 0 ? portColor(pi) + (lk ? '55' : '99') : '#9FE1CB';
    ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

    if (hov) { ctx.fillStyle = portColor(curPi) + '44'; ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2); }

    ctx.strokeStyle = pi >= 0 ? portColor(pi) : '#1D9E75';
    ctx.lineWidth   = pi >= 0 ? 1.5 : 0.5;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    if (lk) {
      ctx.save();
      ctx.beginPath(); ctx.rect(px + 1, py + 1, pw - 2, ph - 2); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
      for (let d = -ph; d < pw + ph; d += 6) {
        ctx.beginPath(); ctx.moveTo(px + d, py + 1); ctx.lineTo(px + d + ph, py + ph); ctx.stroke();
      }
      ctx.restore();
    }

    if (!State.drag && State.fCell === p.key) {
      ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
    }
  });

  // pass 2: 포트 배선 경로
  State.pA.forEach((s, pi) => {
    const h = State.pH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const p = imp.allPanels.find(q => q.key === k);
      return p ? { x: (p.x + p.w / 2) * sc, y: (p.y + p.h / 2) * sc } : null;
    }).filter(Boolean);
    if (pts.length < 2) { return; }

    const pL0 = pts[pts.length - 2]; const pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x; const ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) { return; }
      const ux = ldx / len; const uy = ldy / len;
      const hw = 6; const hl = 12; const nx = -uy; const ny = ux;
      const bx = pL1.x - ux * 5; const by = pL1.y - uy * 5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux * hl + nx * hw, by - uy * hl + ny * hw);
      ctx.lineTo(bx - ux * hl - nx * hw, by - uy * hl - ny * hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });

  // pass 3: 순서 번호 & 포트 레이블
  imp.allPanels.forEach(p => {
    const pi = owner(p.key); if (pi < 0) { return; }
    const px = p.x * sc; const py = p.y * sc;
    const pw = p.w * sc; const ph = p.h * sc;
    const lk = pi !== curPi;
    const cx2 = px + pw / 2; const cy2 = py + ph / 2;
    const step = stepOf.get(p.key);

    if (step) {
      const fs = Math.min(12, pw - 8);
      const r  = Math.max(8, fs * 0.72);
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.font = `700 ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(pi);
      ctx.fillText(String(step), cx2, cy2);
    }

    if (pw >= 32) {
      const label = 'P' + (pi + 1);
      ctx.font = '700 9px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(label, px + 4, py + 4);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
      ctx.fillText(label, px + 4, py + 4);
    }
    ctx.textBaseline = 'alphabetic';
  });
}

// betaImport PWR 전용 — 패널 실물 형태 렌더링 (LAN sim과 동일한 좌표계, ri,ci 키 기반 할당)
function _drawImportedCvPwr(ctx, cv) {
  const imp   = State.betaImport;
  const sc    = cv.width / imp.areaW;
  const pW    = imp.areaW / imp.cols;  // mm per grid cell
  const pH    = imp.areaH / imp.rows;
  const curPi = State.aPort;

  // 배경 격자 (LAN sim과 동일)
  ctx.fillStyle = '#d8d8d8'; ctx.fillRect(0, 0, cv.width, cv.height);
  const gW = Math.round(imp.areaW / 500), gH = Math.round(imp.areaH / 500);
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c*500*sc, 0); ctx.lineTo(c*500*sc, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r*500*sc); ctx.lineTo(cv.width, r*500*sc); ctx.stroke();
  }

  // 배선 순서 번호 맵
  const stepOf = new Map();
  State.pA.forEach((s, pi) => {
    State.pH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // pass 1: 패널 전체를 실물 크기로 하나의 직사각형으로 그리기 (LAN sim 방식)
  // 색상은 패널의 primary 셀(top-left ri,ci) 소유 포트 기준
  imp.allPanels.forEach(p => {
    const ci0    = Math.round(p.x / pW), ri0 = Math.round(p.y / pH);
    const ci1    = Math.round((p.x + p.w) / pW), ri1 = Math.round((p.y + p.h) / pH);
    const primOw = owner(`${ri0},${ci0}`);
    const lk     = primOw >= 0 && primOw !== curPi;
    const px = p.x * sc, py = p.y * sc, pw = p.w * sc, ph = p.h * sc;

    // 패널 내 어떤 서브셀이 현재 hover/last/selected 인지 확인
    let isHov = false, isLast = false, isSel = false;
    for (let ri = ri0; ri < ri1 && !isHov && !isLast && !isSel; ri++) {
      for (let ci = ci0; ci < ci1; ci++) {
        const k = `${ri},${ci}`;
        if (State.drag && State.dHov === k && primOw < 0) isHov = true;
        if (State.drag && State.dStk.length > 0 && State.dStk[State.dStk.length-1].key === k) isLast = true;
        if (!State.drag && State.fCell === k) isSel = true;
      }
    }

    ctx.fillStyle = primOw >= 0
      ? portColor(primOw) + (lk ? '55' : '99')
      : (p.h > 500 ? '#9FE1CB' : '#9FE1CB');  // 500×1000 미할당도 동일 초록
    ctx.fillRect(px+1, py+1, pw-2, ph-2);

    if (isHov) { ctx.fillStyle = portColor(curPi)+'44'; ctx.fillRect(px+1, py+1, pw-2, ph-2); }

    ctx.strokeStyle = primOw >= 0 ? portColor(primOw) : '#1D9E75';
    ctx.lineWidth   = primOw >= 0 ? 1.5 : 0.5;
    ctx.strokeRect(px+1, py+1, pw-2, ph-2);

    if (lk) {
      ctx.save(); ctx.beginPath(); ctx.rect(px+1, py+1, pw-2, ph-2); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
      for (let d = -ph; d < pw+ph; d += 6) {
        ctx.beginPath(); ctx.moveTo(px+d, py+1); ctx.lineTo(px+d+ph, py+ph); ctx.stroke();
      }
      ctx.restore();
    }
    if (isLast) {
      ctx.strokeStyle = 'white';          ctx.lineWidth = 2.5; ctx.strokeRect(px+3, py+3, pw-6, ph-6);
      ctx.strokeStyle = portColor(curPi); ctx.lineWidth = 2;   ctx.strokeRect(px+3, py+3, pw-6, ph-6);
    }
    if (isHov) {
      ctx.setLineDash([3,3]); ctx.strokeStyle = portColor(curPi); ctx.lineWidth = 1.5;
      ctx.strokeRect(px+2, py+2, pw-4, ph-4); ctx.setLineDash([]);
    }
    if (isSel) {
      ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(px+4, py+4, pw-8, ph-8);
      ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(px+4, py+4, pw-8, ph-8);
    }
  });

  // 데드존 (패널 없는 셀)
  for (let ri = 0; ri < imp.rows; ri++) {
    for (let ci = 0; ci < imp.cols; ci++) {
      if (!imp.allPanels.some(p =>
        Math.round(p.x/pW) <= ci && Math.round((p.x+p.w)/pW) > ci &&
        Math.round(p.y/pH) <= ri && Math.round((p.y+p.h)/pH) > ri
      )) {
        const spx=ci*pW*sc, spy=ri*pH*sc, spw=pW*sc, sph=pH*sc;
        ctx.fillStyle = '#d4d4d4'; ctx.fillRect(spx+1, spy+1, spw-2, sph-2);
        ctx.save(); ctx.beginPath(); ctx.rect(spx+1, spy+1, spw-2, sph-2); ctx.clip();
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
        for (let d = -sph; d < spw+sph; d += 8) {
          ctx.beginPath(); ctx.moveTo(spx+d, spy+1); ctx.lineTo(spx+d+sph, spy+sph); ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = '#b0b0b0'; ctx.lineWidth = 0.5;
        ctx.strokeRect(spx+1, spy+1, spw-2, sph-2);
      }
    }
  }

  // pass 2: 포트 배선 경로 (셀 중심점 기준)
  State.pA.forEach((s, pi) => {
    const h = State.pH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const [ri, ci] = k.split(',').map(Number);
      return { x: (ci*pW + pW/2)*sc, y: (ri*pH + pH/2)*sc };
    });
    const pL0 = pts[pts.length-2], pL1 = pts[pts.length-1];
    const ldx = pL1.x-pL0.x, ldy = pL1.y-pL0.y;
    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };
    const fillArrow = (style) => {
      const len = Math.sqrt(ldx*ldx+ldy*ldy); if (len < 1) { return; }
      const ux = ldx/len, uy = ldy/len, hw = 6, hl = 12, nx = -uy, ny = ux;
      const bx = pL1.x-ux*5, by = pL1.y-uy*5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx-ux*hl+nx*hw, by-uy*hl+ny*hw);
      ctx.lineTo(bx-ux*hl-nx*hw, by-uy*hl-ny*hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });

  // pass 3: 순서 번호 & 포트 레이블 (서브셀 중심에 표시)
  State.pA.forEach((s, pi) => {
    State.pH2[pi].filter(k => s.has(k)).forEach(k => {
      const [ri, ci] = k.split(',').map(Number);
      const lk  = pi !== curPi;
      const spx = ci*pW*sc, spy = ri*pH*sc, spw = pW*sc, sph = pH*sc;
      const cx2 = spx + spw/2, cy2 = spy + sph/2;
      const step = stepOf.get(k);
      if (step) {
        const fs = Math.min(12, spw-8), r = Math.max(8, fs*0.72);
        ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI*2);
        ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)'; ctx.fill();
        ctx.font = `700 ${fs}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(pi);
        ctx.fillText(String(step), cx2, cy2);
      }
      if (spw >= 32) {
        const label = 'P'+(pi+1);
        ctx.font = '700 9px sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)'; ctx.strokeText(label, spx+4, spy+4);
        ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
        ctx.fillText(label, spx+4, spy+4);
      }
      ctx.textBaseline = 'alphabetic';
    });
  });
}

function _drawSingleSection(ctx, secName, passOnly) {
  // passOnly: undefined/0=전체, 1=배경만, 3=번호/레이블만
  const doP1 = !passOnly || passOnly === 1;
  const doP3 = !passOnly || passOnly === 3;
  const pfx = secName ? secName + ':' : '';

  // betaImport 데드존 셀 집합 (PWR 탭 전용)
  let deadSet = null;
  if (State.betaImport && !secName && State.simTab === 'pwr') {
    const imp = State.betaImport;
    const pW = imp.areaW / imp.cols, pH = imp.areaH / imp.rows;
    deadSet = new Set();
    for (let ri = 0; ri < imp.rows; ri++) {
      for (let ci = 0; ci < imp.cols; ci++) {
        if (!imp.allPanels.some(p => p.x < (ci+1)*pW && p.x+p.w > ci*pW && p.y < (ri+1)*pH && p.y+p.h > ri*pH)) {
          deadSet.add(`${ri},${ci}`);
        }
      }
    }
  }

  // 셀별 순서 번호 — 전 섹션 통합 계산 (멀티 모드에서도 번호 연속)
  const stepOf = new Map();
  State.pA.forEach((s, pi) => {
    State.pH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // ── 패스 1: 셀 배경 · 테두리 · 패턴 ──────────────────────
  if (doP1) { let y = 0;
  State.layout.forEach((row, ri) => {
    const ch = State.rH[ri];
    for (let c = 0; c < State.cols; c++) {
      const k = pfx + `${ri},${c}`;

      // 데드존 셀: 회색 + 사선 패턴
      if (deadSet && deadSet.has(`${ri},${c}`)) {
        ctx.fillStyle = '#d4d4d4';
        ctx.fillRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2);
        ctx.save();
        ctx.beginPath(); ctx.rect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2); ctx.clip();
        ctx.strokeStyle = '#bbb'; ctx.lineWidth = 1;
        for (let d = -ch; d < State.cellW + ch; d += 8) {
          ctx.beginPath(); ctx.moveTo(c * State.cellW + d, y + 1); ctx.lineTo(c * State.cellW + d + ch, y + ch); ctx.stroke();
        }
        ctx.restore();
        ctx.strokeStyle = '#b0b0b0'; ctx.lineWidth = 0.5;
        ctx.strokeRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2);
        continue;
      }

      const ow = owner(k);
      const lk = ow >= 0 && ow !== State.aPort;
      const hov = State.drag && k === State.dHov && ow < 0;
      const last = State.drag && State.dStk.length > 0 && State.dStk[State.dStk.length-1].key === k;

      ctx.fillStyle = ow >= 0
        ? portColor(ow) + (lk ? '55' : '99')
        : row.type === 'half' ? '#C0DD97' : '#9FE1CB';
      ctx.fillRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2);

      if (hov) { ctx.fillStyle = portColor(State.aPort) + '44'; ctx.fillRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2); }

      ctx.strokeStyle = ow >= 0 ? portColor(ow) : (row.type === 'half' ? '#639922' : '#1D9E75');
      ctx.lineWidth = ow >= 0 ? 1.5 : 0.5;
      ctx.strokeRect(c * State.cellW + 1, y + 1, State.cellW - 2, ch - 2);

      if (last) {
        ctx.strokeStyle = 'white';        ctx.lineWidth = 2.5; ctx.strokeRect(c*State.cellW+3, y+3, State.cellW-6, ch-6);
        ctx.strokeStyle = portColor(State.aPort); ctx.lineWidth = 2;   ctx.strokeRect(c*State.cellW+3, y+3, State.cellW-6, ch-6);
      }
      if (hov) {
        ctx.setLineDash([3, 3]); ctx.strokeStyle = portColor(State.aPort); ctx.lineWidth = 1.5;
        ctx.strokeRect(c*State.cellW+2, y+2, State.cellW-4, ch-4); ctx.setLineDash([]);
      }
      if (lk) {
        ctx.save(); ctx.beginPath(); ctx.rect(c*State.cellW+1, y+1, State.cellW-2, ch-2); ctx.clip();
        ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
        for (let i = -ch; i < State.cellW + ch; i += 6) {
          ctx.beginPath(); ctx.moveTo(c*State.cellW+i, y+1); ctx.lineTo(c*State.cellW+i+ch, y+ch); ctx.stroke();
        }
        ctx.restore();
      }
      if (State.fCell && State.fCell.r === ri && State.fCell.c === c && (!secName || State.fCell.section === secName)) {
        ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(c*State.cellW+4, y+4, State.cellW-8, ch-8);
        ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(c*State.cellW+4, y+4, State.cellW-8, ch-8);
      }
    }
    y += ch;
  }); } // end pass1

  // ── 패스 2: 포트 배선 경로 — 단일 모드만 (멀티는 _drawCvMulti에서 통합 처리)
  if (State.areaMode !== 'multi') { drawPortPaths(ctx, secName); }
  // ── 패스 3: 순서 번호 & 포트 레이블 (배선 경로 위에 그림) ─────
  if (doP3) { let y = 0;
  State.layout.forEach((row, ri) => {
    const ch = State.rH[ri];
    for (let c = 0; c < State.cols; c++) {
      const k = pfx + `${ri},${c}`;
      const ow = owner(k);
      if (ow < 0 || State.cellW < 20) { continue; }
      const lk = ow !== State.aPort;
      const step = stepOf.get(k);
      const cx2  = c*State.cellW + State.cellW/2, cy2 = y + ch/2;

      if (step) {
        const fs = Math.min(12, State.cellW - 8);
        const r = Math.max(8, fs * 0.72);
        ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
        ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
        ctx.fill();
        ctx.font = `700 ${fs}px sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(ow);
        ctx.fillText(String(step), cx2, cy2);
      }

      if (State.cellW >= 32) {
        const label = 'P' + (ow + 1);
        ctx.font = '700 9px sans-serif';
        ctx.textAlign = 'left'; ctx.textBaseline = 'top';
        ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.55)';
        ctx.strokeText(label, c*State.cellW + 4, y + 4);
        ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
        ctx.fillText(label, c*State.cellW + 4, y + 4);
      }
    }
    y += ch;
  }); } // end pass3
}

// 프리픽스 키 → 캔버스 절대 좌표 변환 (멀티 모드 전용)
function _absCoords(key) {
  const colon = key.indexOf(':');
  if (colon < 0) { return null; }
  const sec = key.slice(0, colon);
  const [r, c] = key.slice(colon + 1).split(',').map(Number);
  const xOff = State.multiCvOffsets[sec];
  if (xOff < 0) { return null; }
  const secRH = State.multiSec[sec].rH;
  let y = 0;
  for (let i = 0; i < r; i++) y += secRH[i] || 0;
  y += (secRH[r] || 0) / 2;
  return { x: xOff + c * State.cellW + State.cellW / 2, y: SEC_LBL_H + y, r, c, sec };
}

// 멀티 모드 전용 — 절대 좌표로 포트 배선 경로 전체 그리기 (섹션 간 연결 포함)
function _drawPortPathsMulti(ctx) {
  State.pA.forEach((s, pi) => {
    const h = State.pH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => _absCoords(k)).filter(Boolean);
    if (pts.length < 2) { return; }
    const pL0 = pts[pts.length - 2], pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x, ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) return;
      const ux = ldx / len, uy = ldy / len, hw = 6, hl = 12, nx = -uy, ny = ux;
      const bx = pL1.x - ux * 5, by = pL1.y - uy * 5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux * hl + nx * hw, by - uy * hl + ny * hw);
      ctx.lineTo(bx - ux * hl - nx * hw, by - uy * hl - ny * hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });
}

function _drawCvMulti(ctx) {
  const NAMES = { left:'좌측', center:'중앙', right:'우측' };

  // 섹션 레이블 바
  ['left','center','right'].forEach(k => {
    if (State.multiCvOffsets[k] < 0) { return; }
    const sec = State.multiSec[k];
    const xStart = State.multiCvOffsets[k];
    const secW = sec.cols * State.cellW;
    const isActive = k === State.activeSimSec;
    ctx.fillStyle = isActive ? '#3B82F6' : '#E2E8F0';
    ctx.beginPath();
    if (ctx.roundRect) { ctx.roundRect(xStart + 1, 1, secW - 2, SEC_LBL_H - 2, 4); } else { ctx.rect(xStart + 1, 1, secW - 2, SEC_LBL_H - 2); }
    ctx.fill();
    ctx.font = `${isActive ? '700' : '600'} 11px sans-serif`;
    ctx.fillStyle = isActive ? '#fff' : '#64748B';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(NAMES[k], xStart + secW / 2, SEC_LBL_H / 2);
  });

  // 패스 1: 셀 배경·테두리 — 모든 섹션
  ['left','center','right'].forEach(k => {
    if (State.multiCvOffsets[k] < 0) { return; }
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length || !sec.rH.length) { return; }
    const [sc, sl, srH] = [State.cols, State.layout, State.rH];
    State.cols = sec.cols; State.layout = sec.layout; State.rH = sec.rH;
    ctx.save();
    ctx.translate(State.multiCvOffsets[k], SEC_LBL_H);
    _drawSingleSection(ctx, k, 1);
    ctx.restore();
    [State.cols, State.layout, State.rH] = [sc, sl, srH];
  });

  // 섹션 간 연결 포함 포트 배선 경로 (배경 위, 번호 아래)
  _drawPortPathsMulti(ctx);

  // 패스 3: 순서 번호·포트 레이블 — 배선 경로 위에 그리기
  ['left','center','right'].forEach(k => {
    if (State.multiCvOffsets[k] < 0) { return; }
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length || !sec.rH.length) { return; }
    const [sc, sl, srH] = [State.cols, State.layout, State.rH];
    State.cols = sec.cols; State.layout = sec.layout; State.rH = sec.rH;
    ctx.save();
    ctx.translate(State.multiCvOffsets[k], SEC_LBL_H);
    _drawSingleSection(ctx, k, 3);
    ctx.restore();
    [State.cols, State.layout, State.rH] = [sc, sl, srH];
  });
}

// ── 범례 & 케이블 수량 요약 ───────────────────────────────

function renderLeg() {
  const l = document.getElementById('legend'); if (!l) return;
  const used = State.pA.map((s, i) => s.size > 0 ? i : -1).filter(i => i >= 0);
  let h = `
    <div class="leg-item"><div class="leg-dot" style="background:#C0DD97;border:1px solid #639922"></div>500×500mm</div>
    <div class="leg-item"><div class="leg-dot" style="background:#9FE1CB;border:1px solid #1D9E75"></div>500×1000mm</div>`;
  used.forEach(pi => { h += `<div class="leg-item"><div class="leg-dot" style="background:${portColor(pi)}"></div>포트 ${pi+1}</div>`; });
  l.innerHTML = h;
}

// 계산된 랜선 수량 반환
// 1번 랜: 포트당 메인+백업 각 1개씩 2배, 여유 2개 추가
// 숏랜: 패널 간 연결 + 여유 20개, 20개 단위 묶음 수
function _calcLan(pA = State.pA) {
  const ports = pA.filter(s => s.size > 0).length;
  const l1Main = ports, l1Back = ports, l1Spare = State.spareAdj.l1;
  const l1 = l1Main + l1Back + l1Spare;
  let slNet = 0; pA.forEach(s => { if (s.size > 0) slNet += (s.size - 1); });
  const slSpare = State.spareAdj.sl, sl = slNet + slSpare, slBundle = Math.ceil(sl / 20);
  return { l1, l1Main, l1Back, l1Spare, slNet, sl, slSpare, slBundle };
}

// 실제 파워콘 배선 기반 수량 계산 (pwrPA 없으면 레이아웃 공식으로 폴백)
function _calcPwr(pwrPA) {
  if (!pwrPA) { return State.areaMode === 'multi' ? calcPWMulti() : calcPW(); }
  const c1Net = pwrPA.filter(s => s.size > 0).length;
  let spNet = 0; pwrPA.forEach(s => { if (s.size > 0) { spNet += s.size - 1; } });
  const c1Spare = State.spareAdj.c1, c1 = c1Net + c1Spare;
  const spSpare = State.spareAdj.sp, sp = spNet + spSpare, spBundle = Math.ceil(sp / 10);
  return { c1, c1Net, c1Spare, spNet, sp, spSpare, spBundle };
}

function calcPWMulti() {
  let c1Net = 0, spNet = 0;
  ['left','center','right'].forEach(k => {
    const sec = State.multiSec[k];
    if (!sec.cols || !sec.layout.length) { return; }
    c1Net += Math.ceil(sec.cols / 2);
    const pc = Math.floor(sec.cols / 2), odd = sec.cols % 2 === 1, rows = sec.layout.length;
    for (let i = 0; i < pc; i++) spNet += rows * 2 - 1;
    if (odd) { spNet += rows - 1; }
  });
  const c1Spare = State.spareAdj.c1, c1 = c1Net + c1Spare;
  const spSpare = State.spareAdj.sp, sp = spNet + spSpare, spBundle = Math.ceil(sp / 10);
  return { c1, c1Net, c1Spare, spNet, sp, spSpare, spBundle };
}

function renderSum() {
  const el = document.getElementById('simSum'); if (!el) return;

  // 랜선 pA: pwr 탭이면 저장된 LAN 상태 사용
  const lanPA = State.simTab === 'pwr' && State._savedLan ? State._savedLan.pA : State.pA;
  // 파워콘 pA: lan 탭이면 저장된 PWR 상태 사용
  const pwrState = State.simTab === 'pwr' ? State.pA : State._savedPwr?.pA;

  const asgn = new Set(); State.pA.forEach(s => s.forEach(k => asgn.add(k)));
  let tot = 0;
  if (State.areaMode === 'multi') {
    ['left','center','right'].forEach(k => {
      const sec = State.multiSec[k];
      if (sec.cols && sec.layout.length) { tot += sec.cols * sec.layout.length; }
    });
  } else {
    tot = State.layout.length * State.cols;
  }
  const pw = _calcPwr(pwrState);
  const una = tot - asgn.size;
  const lan = _calcLan(lanPA);
  const ov = State.simTab === 'pwr' ? 0 : State.pA.filter((_, i) => pxOf(i) > MAX_PX).length;

  // 파워콘 배선 상태
  const isDefault = pwrState ? _isDefaultPwrWiring(pwrState) : null;
  const pwrNote = isDefault === true ? '<div class="cc-note" style="color:#888">기본 배선</div>'
    : isDefault === false ? '<div class="cc-note" style="color:#B35C00;font-weight:600">커스텀 배선</div>' : '';

  const si = (k, v) =>
    `<input class="spare-inp" type="number" min="0" value="${v}" oninput="setSpare('${k}',this.value)">`;

  el.innerHTML = `<div class="cc-grid">
    <div class="cc-section lan">
      <div class="cc-sec-title">랜선</div>
      <div class="cc-cards">
        <div class="cc-card">
          <div class="cc-lbl">1번 랜</div>
          <div class="cc-total lan" id="cc-l1-total">${lan.l1} 개</div>
          <div class="cc-note">메인 ${lan.l1Main} · 백업 ${lan.l1Back}</div>
          <div class="cc-qty-row">필요 <b>${lan.l1Main + lan.l1Back}</b> · 여유 ${si('l1', State.spareAdj.l1)}</div>
        </div>
        <div class="cc-card">
          <div class="cc-lbl">숏랜</div>
          <div class="cc-total lan" id="cc-sl-total">${lan.sl} 개</div>
          <div class="cc-bundle" id="cc-sl-bundle">${lan.slBundle}묶음 (×20)</div>
          <div class="cc-qty-row">필요 <b>${lan.slNet}</b> · 여유 ${si('sl', State.spareAdj.sl)}</div>
        </div>
      </div>
    </div>
    <div class="cc-section pwr">
      <div class="cc-sec-title">파워콘</div>
      <div class="cc-cards">
        <div class="cc-card">
          <div class="cc-lbl">1번 파워</div>
          <div class="cc-total pwr" id="cc-c1-total">${pw.c1} 개</div>
          <div class="cc-qty-row">필요 <b>${pw.c1Net}</b> · 여유 ${si('c1', State.spareAdj.c1)}</div>
          ${pwrNote}
        </div>
        <div class="cc-card">
          <div class="cc-lbl">숏 파워</div>
          <div class="cc-total pwr" id="cc-sp-total">${pw.sp} 개</div>
          <div class="cc-bundle" id="cc-sp-bundle">${pw.spBundle}묶음 (×10)</div>
          <div class="cc-qty-row">필요 <b>${pw.spNet}</b> · 여유 ${si('sp', State.spareAdj.sp)}</div>
        </div>
      </div>
    </div>
    ${una > 0 ? `<div class="cc-warn">미할당 ${una} / ${tot} 패널</div>` : ''}
    ${ov > 0 ? `<div class="cc-error">픽셀 초과 포트 ${ov}개 — 연결 패널 수를 줄여주세요</div>` : ''}
  </div>`;
}

// 여유분 수정 시 합계만 업데이트 (입력 포커스 유지)
function setSpare(k, v) {
  const n = parseInt(v);
  State.spareAdj[k] = (v === '' || isNaN(n) || n < 0) ? 0 : n;
  const lanPA = State.simTab === 'pwr' && State._savedLan ? State._savedLan.pA : State.pA;
  const pwrPA = State.simTab === 'pwr' ? State.pA : State._savedPwr?.pA;
  const lan = _calcLan(lanPA), pw = _calcPwr(pwrPA);
  const s = (id, val) => { const e = document.getElementById(id); if (e) e.textContent = val; };
  s('cc-l1-total', lan.l1 + ' 개');
  s('cc-sl-total', lan.sl + ' 개');
  s('cc-sl-bundle', lan.slBundle + '묶음 (×20)');
  s('cc-c1-total', pw.c1 + ' 개');
  s('cc-sp-total', pw.sp + ' 개');
  s('cc-sp-bundle', pw.spBundle + '묶음 (×10)');
}

// ── 이벤트 처리 (마우스 & 터치 & 키보드) ─────────────────

// 캔버스 내 좌표 계산 (DPR 보정 포함)
// touchend는 e.touches가 빈 TouchList(truthy)라 e.touches[0]이 undefined →
// changedTouches(방금 떨어진 손가락)를 우선 사용해야 좌표를 올바르게 읽음
function xy(cv, e) {
  const r = cv.getBoundingClientRect();
  const sx = cv.width / r.width, sy = cv.height / r.height;
  const src = (e.changedTouches && e.changedTouches[0])
            || (e.touches && e.touches[0])
            || e;
  return { mx: (src.clientX - r.left) * sx, my: (src.clientY - r.top) * sy };
}

function attachEv() {
  const cv = document.getElementById('simCanvas');

  function dn(e) {
    if (!isReady()) { return; }
    if (State.areaMode !== 'multi' && (!State.cols || !State.layout.length)) { return; }
    e.preventDefault();
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { return; }
    if (State.areaMode === 'multi' && inf.section !== State.activeSimSec) { switchSimSec(inf.section); }
    if (!State.cols || !State.layout.length) { return; }
    // 터치는 LP_TOUCH(600ms), 마우스는 LP_MS(380ms) — 일반 탭이 드래그로 오인되지 않도록
    const delay = e.touches ? LP_TOUCH : LP_MS;
    State.lpT = setTimeout(() => {
      State.lpT = null;
      const ow = owner(inf.key);
      State.aPort = ow >= 0 ? ow : nextEmpty(); // 이미 할당된 셀이면 해당 포트로 전환
      State.drag = true; State.dStk = []; State.dHov = inf.key;
      if (ow < 0) { assign(State.aPort, inf.key); }
      State.dStk.push({ key: inf.key });
      State.fCell = null;
      drawCv(); renderPorts(); renderLeg(); renderSum(); cv.focus();
    }, delay);
  }

  function mv(e) {
    if (!State.drag) { return; }
    e.preventDefault();
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { State.dHov = null; drawCv(); return; }
    State.dHov = inf.key;
    // 역방향 드래그 감지 → 마지막 셀 취소
    if (State.dStk.length >= 2) {
      const prev = State.dStk[State.dStk.length - 2];
      if (inf.key === prev.key) {
        const last = State.dStk[State.dStk.length - 1];
        deassign(State.aPort, last.key); State.dStk.pop();
        if (navigator.vibrate) { navigator.vibrate(25); }
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    }
    const top = State.dStk.length > 0 ? State.dStk[State.dStk.length - 1] : null;
    if (top && inf.key === top.key) { return; }
    const ow = owner(inf.key);
    if (ow >= 0 && ow !== State.aPort) { drawCv(); return; } // 다른 포트 셀 건드리지 않음
    assign(State.aPort, inf.key); State.dStk.push({ key: inf.key });
    if (navigator.vibrate) { navigator.vibrate(15); }
    drawCv(); renderPorts(); renderLeg(); renderSum();
  }

  function up(e) {
    clearTimeout(State.lpT); State.lpT = null;
    // 드래그 종료
    if (State.drag) { State.drag = false; State.dStk = []; State.dHov = null; drawCv(); renderPorts(); renderLeg(); renderSum(); return; }
    // 단순 탭/클릭 → 현재 포트로 토글 (할당 ↔ 해제)
    if (!isReady()) { return; }
    if (State.areaMode !== 'multi' && (!State.cols || !State.layout.length)) { return; }
    const { mx, my } = xy(cv, e), inf = cellAt(mx, my);
    if (!inf) { return; }
    if (State.areaMode === 'multi' && inf.section !== State.activeSimSec) { switchSimSec(inf.section); }
    if (!State.cols || !State.layout.length) { return; }
    const ow = owner(inf.key);
    if (ow >= 0 && ow !== State.aPort) { return; } // 다른 포트 셀은 건드리지 않음
    if (State.pA[State.aPort].has(inf.key)) {
      deassign(State.aPort, inf.key);
      if (State.fCell && State.fCell.r === inf.r && State.fCell.c === inf.c) { State.fCell = null; }
    } else {
      assign(State.aPort, inf.key); State.fCell = { r: inf.r, c: inf.c, section: inf.section || null };
    }
    drawCv(); renderPorts(); renderLeg(); renderSum(); cv.focus();
  }

  function cl() { clearTimeout(State.lpT); State.lpT = null; State.drag = false; State.dStk = []; State.dHov = null; drawCv(); renderPorts(); }

  cv.addEventListener('mousedown',   dn);
  cv.addEventListener('mousemove',   mv);
  cv.addEventListener('mouseup',     up);
  cv.addEventListener('mouseleave',  cl);
  cv.addEventListener('touchstart',  dn, { passive: false });
  cv.addEventListener('touchmove',   mv, { passive: false });
  cv.addEventListener('touchend',    up, { passive: false });
  cv.addEventListener('touchcancel', cl, { passive: false });

  // 키보드 방향키 — 포커스 셀 이동 및 할당
  cv.addEventListener('keydown', function(e) {
    if (!isReady()) { return; }
    const M = { ArrowUp:{dr:-1,dc:0}, ArrowDown:{dr:1,dc:0}, ArrowLeft:{dr:0,dc:-1}, ArrowRight:{dr:0,dc:1} };
    const d = M[e.key]; if (!d) return;
    e.preventDefault();

    const secName = State.areaMode === 'multi' ? State.activeSimSec : null;
    const pfx = secName ? secName + ':' : '';
    const curLay = secName ? State.multiSec[secName].layout : State.layout;
    const curCols = secName ? State.multiSec[secName].cols    : State.cols;

    if (!State.fCell) {
      State.fCell = { r:0, c:0, section: secName };
      assign(State.aPort, pfx + '0,0');
      drawCv(); renderPorts(); renderLeg(); renderSum(); return;
    }

    // 현재 섹션 안의 히스토리만 추출
    const hist = State.pH2[State.aPort].filter(k => State.pA[State.aPort].has(k) && k.startsWith(pfx));
    const parseCoords = k => k.slice(pfx.length).split(',').map(Number);

    // 역방향 → 마지막 셀 취소
    if (hist.length >= 2) {
      const [pr, pc] = parseCoords(hist[hist.length - 2]);
      if (State.fCell.r + d.dr === pr && State.fCell.c + d.dc === pc) {
        deassign(State.aPort, pfx + `${State.fCell.r},${State.fCell.c}`);
        State.fCell = { r:pr, c:pc, section: secName };
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    } else if (hist.length === 1) {
      const nr2 = State.fCell.r + d.dr, nc2 = State.fCell.c + d.dc;
      if (nr2 < 0 || nr2 >= curLay.length || nc2 < 0 || nc2 >= curCols) {
        deassign(State.aPort, pfx + `${State.fCell.r},${State.fCell.c}`);
        State.fCell = null;
        drawCv(); renderPorts(); renderLeg(); renderSum(); return;
      }
    }

    const nr = Math.max(0, Math.min(curLay.length - 1, State.fCell.r + d.dr));
    const nc = Math.max(0, Math.min(curCols - 1, State.fCell.c + d.dc));
    if (nr === State.fCell.r && nc === State.fCell.c) { return; }
    const nk = pfx + `${nr},${nc}`;
    if (owner(nk) >= 0 && owner(nk) !== State.aPort) { return; }
    State.fCell = { r:nr, c:nc, section: secName };
    assign(State.aPort, nk);
    drawCv(); renderPorts(); renderLeg(); renderSum();
  });
}

// ── 자동 포트 할당 ────────────────────────────────────────

// 포트별 열 수를 균등하게 배분. 비-마지막 포트는 짝수 규칙(규칙1) 적용, 마지막은 나머지(규칙2).
// 포트 수 증가 없이 균등화 불가 시 짝수 규칙 포기 (포트 최소화 > 짝수 > 균등).
function _balancedCols(total, numPorts, maxRaw, maxEven) {
  if (numPorts === 1) { return [total]; }
  const base = Math.floor(total / numPorts);
  let perPort;
  if (base < 2 || base % 2 === 0) {
    perPort = base;
  } else {
    const up = base + 1;
    const lastIfUp = total - up * (numPorts - 1);
    if (up <= maxEven && lastIfUp >= 1 && lastIfUp <= maxRaw) {
      perPort = up;
    } else {
      const down = base - 1;
      const lastIfDown = total - down * (numPorts - 1);
      if (down >= 1 && lastIfDown >= 1 && lastIfDown <= maxRaw) {
        perPort = down;
      } else {
        perPort = base;
      }
    }
  }
  const takes = [];
  let rem = total;
  for (let p = 0; p < numPorts - 1; p++) { takes.push(perPort); rem -= perPort; }
  takes.push(rem);
  return takes;
}

function _autoAssignSec(secName, secLayout, secCols, portOff) {
  const colPx = secLayout.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  const maxRaw = Math.max(1, Math.floor(MAX_PX / colPx));
  // 짝수 열로 내림 → 포트 양끝 바닥행 보장 (규칙1)
  const maxEven = maxRaw >= 2 ? (maxRaw % 2 === 0 ? maxRaw : maxRaw - 1) : maxRaw;
  // maxEven 기준으로 포트 수 계산 — maxRaw가 홀수일 때 짝수 열 보장
  const numPorts = Math.min(State.pA.length - portOff, Math.ceil(secCols / maxEven));
  const takes = _balancedCols(secCols, numPorts, maxRaw, maxEven);

  let colStart = 0, portCount = 0;
  for (let p = 0; p < takes.length && portOff + portCount < State.pA.length; p++) {
    const pi = portOff + portCount;
    for (let ci = 0; ci < takes[p]; ci++) {
      const col = colStart + ci;
      for (let ri = 0; ri < secLayout.length; ri++) {
        const row = ci % 2 === 0 ? secLayout.length - 1 - ri : ri;
        assign(pi, secName ? `${secName}:${row},${col}` : `${row},${col}`);
      }
    }
    colStart += takes[p];
    portCount++;
  }
  return portCount;
}

function autoAssign() {
  if (!isReady()) { return; }
  // betaImport LAN: 혼합시뮬 원본 포트 배치 복원
  if (State.betaImport && State.simTab === 'lan') {
    const _n = State.lanExpanded ? 16 : 8;
    State.pA = Array.from({ length: _n }, () => new Set());
    State.pH2 = Array.from({ length: _n }, () => []);
    State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;
    for (let pi = 0; pi < Math.min(_n, State.betaPorts.length); pi++) {
      State.betaPH2[pi].forEach(k => {
        if (State.betaPorts[pi].has(k)) { State.pA[pi].add(k); State.pH2[pi].push(k); }
      });
    }
    State.aPort = 0;
    drawCv(); renderPorts(); renderLeg(); renderSum();
    return;
  }
  if (State.areaMode === 'multi') {
    const _an = State.lanExpanded ? 16 : 8;
    State.pA = Array.from({ length: _an }, () => new Set());
    State.pH2 = Array.from({ length: _an }, () => []);
    State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;
    let portOff = 0;
    ['left','center','right'].forEach(secName => {
      const sec = State.multiSec[secName];
      if (!sec.cols || !sec.layout.length) { return; }
      portOff += _autoAssignSec(secName, sec.layout, sec.cols, portOff);
    });
    State.aPort = 0;
    drawCv(); renderPorts(); renderLeg(); renderSum();
    return;
  }

  if (!State.cols || !State.layout.length) { return; }
  rst();
  _autoAssignSec(null, State.layout, State.cols, 0);
  State.aPort = 0;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

function doAutoAssign() {
  if (!isReady()) { return; }
  if (State.areaMode === 'multi') {
    const hasData = ['left','center','right'].some(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
    if (!hasData) { return; }
  } else if (!State.cols || !State.layout.length) { return; }
  if (State.pA.some(s => s.size > 0)) {
    openConfirm('자동 포트 할당', '기존 할당을 초기화하고 자동으로 포트를 할당할까요?', autoAssign);
  } else {
    autoAssign();
  }
}

// 통합 자동 할당 — 좌→중→우 순서로 전역 열 인덱스 기반 뱀 할당 (섹션 경계 무시)
function autoAssignUnified() {
  if (!isReady()) { return; }
  const _un = State.lanExpanded ? 16 : 8;
  State.pA = Array.from({ length: _un }, () => new Set());
  State.pH2 = Array.from({ length: _un }, () => []);
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null; State.aPort = 0;

  const vCols = [];
  ['left','center','right'].forEach(secName => {
    const sec = State.multiSec[secName];
    if (!sec.cols || !sec.layout.length) { return; }
    for (let ci = 0; ci < sec.cols; ci++) vCols.push({ secName, ci, lay: sec.layout });
  });
  if (!vCols.length) { return; }
  const colPxOf = lay => lay.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  let gi = 0, curPort = 0;
  while (gi < vCols.length && curPort < State.pA.length) {
    // 현재 포트에 들어갈 수 있는 최대 열 수 (픽셀 한도 기준)
    let nFit = 0, accPx = 0;
    while (gi + nFit < vCols.length) {
      const px = colPxOf(vCols[gi + nFit].lay);
      if (accPx + px > MAX_PX && nFit > 0) { break; }
      accPx += px; nFit++;
    }
    if (nFit === 0) { break; }
    const rem = vCols.length - gi;
    // 남은 열이 nFit 이하면 모두 할당 (규칙2), 아니면 짝수로 내림 (규칙1)
    const maxEven = nFit >= 2 ? (nFit % 2 === 0 ? nFit : nFit - 1) : nFit;
    const take = rem <= nFit ? rem : maxEven;

    for (let ci = 0; ci < take; ci++) {
      const { secName, ci: localCi, lay } = vCols[gi + ci];
      const isEven = (gi + ci) % 2 === 0;
      for (let ri = 0; ri < lay.length; ri++) {
        const row = isEven ? lay.length - 1 - ri : ri;
        assign(curPort, `${secName}:${row},${localCi}`);
      }
    }
    gi += take;
    curPort++;
  }

  State.aPort = 0;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

function doAutoAssignUnified() {
  if (!isReady()) { return; }
  const hasData = ['left','center','right'].some(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
  if (!hasData) { return; }
  if (State.pA.some(s => s.size > 0)) {
    openConfirm('통합 자동 할당', '기존 할당을 초기화하고 통합 자동 할당을 실행할까요?', autoAssignUnified);
  } else {
    autoAssignUnified();
  }
}

// 멀티 모드 바닥행 분리 통합 할당 — 섹션 경계 무시, 전체 바닥행을 포트0에 수평 배선, 나머지 상위 행을 통합 뱀형 배선
function autoAssignRowSplitUnified() {
  if (!isReady()) { return; }
  const vCols = [];
  ['left','center','right'].forEach(sn => {
    const sec = State.multiSec[sn];
    if (!sec.cols || !sec.layout.length) { return; }
    for (let ci = 0; ci < sec.cols; ci++) { vCols.push({ sn, ci, lay: sec.layout }); }
  });
  if (!vCols.length) { return; }
  const _rn = State.lanExpanded ? 16 : 8;
  State.pA = Array.from({ length: _rn }, () => new Set());
  State.pH2 = Array.from({ length: _rn }, () => []);
  State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null;
  // 바닥행: 픽셀 한도 고려, 초과 시 다음 포트로 분할
  let pi = 0, accBottom = 0;
  for (const { sn, ci, lay } of vCols) {
    const bPx = ppx(lay[lay.length - 1].type);
    const px = bPx.w * bPx.h;
    if (accBottom + px > MAX_PX && accBottom > 0) { pi++; accBottom = 0; }
    assign(pi, `${sn}:${lay.length - 1},${ci}`);
    accBottom += px;
  }
  pi++;
  // 상위 행 통합 뱀형
  const upperOf = lay => lay.slice(0, lay.length - 1);
  const colPxOf = lay => lay.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  let gi = 0, curPort = pi;
  while (gi < vCols.length && curPort < State.pA.length) {
    const uLay0 = upperOf(vCols[gi].lay);
    if (!uLay0.length) { gi++; continue; }
    let nFit = 0, accPx = 0;
    while (gi + nFit < vCols.length) {
      const uL = upperOf(vCols[gi + nFit].lay);
      if (!uL.length) { break; }
      const px = colPxOf(uL);
      if (accPx + px > MAX_PX && nFit > 0) { break; }
      accPx += px; nFit++;
    }
    if (nFit === 0) { gi++; continue; }
    const rem = vCols.length - gi;
    const maxEven = nFit >= 2 ? (nFit % 2 === 0 ? nFit : nFit - 1) : nFit;
    const take = rem <= nFit ? rem : maxEven;
    for (let ci = 0; ci < take; ci++) {
      const { sn, ci: lci, lay } = vCols[gi + ci];
      const uL = upperOf(lay);
      const isEven = (gi + ci) % 2 === 0;
      for (let ri = 0; ri < uL.length; ri++) {
        const row = isEven ? uL.length - 1 - ri : ri;
        assign(curPort, `${sn}:${row},${lci}`);
      }
    }
    gi += take; curPort++;
  }
  State.aPort = 0;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

function doAutoAssignRowSplitUnified() {
  if (!isReady()) { return; }
  const hasData = ['left','center','right'].some(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
  if (!hasData) { return; }
  if (State.pA.some(s => s.size > 0)) {
    openConfirm('바닥행 분리 할당', '기존 할당을 초기화하고 바닥행 분리 할당을 실행할까요?', autoAssignRowSplitUnified);
  } else {
    autoAssignRowSplitUnified();
  }
}

// 바닥행 분리 할당 — 바닥행 전체를 별도 포트에 수평 배선, 나머지 행은 열 단위 뱀형 배선
function _autoAssignSecRowSplit(secName, secLayout, secCols, portOff) {
  if (secLayout.length < 2) { return _autoAssignSec(secName, secLayout, secCols, portOff); }
  const bottomIdx = secLayout.length - 1;
  const bottomPx = ppx(secLayout[bottomIdx].type).w * ppx(secLayout[bottomIdx].type).h;
  if (secCols * bottomPx > MAX_PX) { return _autoAssignSec(secName, secLayout, secCols, portOff); }
  for (let ci = 0; ci < secCols; ci++) {
    assign(portOff, secName ? `${secName}:${bottomIdx},${ci}` : `${bottomIdx},${ci}`);
  }
  const upper = secLayout.slice(0, bottomIdx);
  if (!upper.length) { return 1; }
  const colPx = upper.reduce((s, r) => s + ppx(r.type).w * ppx(r.type).h, 0);
  const maxRaw = Math.max(1, Math.floor(MAX_PX / colPx));
  const maxEven = maxRaw >= 2 ? (maxRaw % 2 === 0 ? maxRaw : maxRaw - 1) : maxRaw;
  const numPorts = Math.min(State.pA.length - portOff - 1, Math.ceil(secCols / maxEven));
  const takes = _balancedCols(secCols, numPorts, maxRaw, maxEven);
  let colStart = 0, portCount = 1;
  for (let p = 0; p < takes.length && portOff + portCount < State.pA.length; p++) {
    const pi = portOff + portCount;
    for (let ci = 0; ci < takes[p]; ci++) {
      const col = colStart + ci;
      for (let ri = 0; ri < upper.length; ri++) {
        const row = ci % 2 === 0 ? upper.length - 1 - ri : ri;
        assign(pi, secName ? `${secName}:${row},${col}` : `${row},${col}`);
      }
    }
    colStart += takes[p];
    portCount++;
  }
  return portCount;
}

function autoAssignRowSplit() {
  if (!isReady() || !State.cols || !State.layout.length) { return; }
  rst();
  _autoAssignSecRowSplit(null, State.layout, State.cols, 0);
  State.aPort = 0;
  drawCv(); renderPorts(); renderLeg(); renderSum();
}

function doAutoAssignRowSplit() {
  if (!isReady()) { return; }
  if (State.areaMode === 'multi') {
    const hasData = ['left','center','right'].some(k => State.multiSec[k].cols > 0 && State.multiSec[k].layout.length > 0);
    if (!hasData) { return; }
  } else if (!State.cols || !State.layout.length) { return; }
  if (State.pA.some(s => s.size > 0)) {
    openConfirm('바닥행 분리 할당', '기존 할당을 초기화하고 바닥행 분리 할당을 실행할까요?', autoAssignRowSplit);
  } else {
    autoAssignRowSplit();
  }
}

// ── §12  vMix 소스 매크로 ────────────────────────────────

let _vmixRawText = '';   // 원본 raw 텍스트 (다운로드용, XMLSerializer 없이 직접 교체)
let _vmixDoc = null; // DOM (속성 읽기·커스텀 뱃지 표시용)
let _vmixFilename = '';
let _vmixCopiedKey = null;
let _vmixNewVIs = [];          // 새로 생성된 버츄얼 인풋 [{ key, parentKey, title, overlays:[k,k,k] }]
let _vmixSplitVIs = [];        // 자동 분할로 생성된 VI [{ key, parentKey, title, mainSlot }]
let _vmixPastedFrom = new Map();  // targetKey → 복사 원본 vmix 순번
let _vmixOrigText = '';         // 로드 시 원본 텍스트 보관 (초기화용)
let _vmixInputCount = 0;          // 원본 파일의 최상위 Input 수 (VI 순번 계산용)

const _VMIX_AR = { '0': '출력 비율', '1': '와이드스크린', '100': '원본' };
const _VMIX_CAT_COLORS = ['#2a2a2a','#cc1111','#117711','#dd6600','#7700aa','#00aadd','#0022bb'];

let _vmixSplitMainCat = '1';
let _vmixSplitSideCat = '2';
let _vmixSplitTmplCat = '3';

let _vmixArCat    = '0';
let _vmixPosCat   = '0';
let _vmixLayerCat = '0';

let _vmixLayerEdits = new Map();    // key → true (레이어 편집된 소스 추적)
let _vmixLayerExpanded = new Set(); // 펼쳐진 카드 key 집합
let _vmixLayerNameSearch = '';      // 레이어 설정 탭 이름 검색어
let _vmixLayerNumSearch = '';       // 레이어 설정 탭 번호 검색어

function vmixLoad(file) {
  if (!file) { return; }
  _vmixFilename = file.name;
  _vmixCopiedKey = null;
  _vmixNewVIs = [];
  _vmixSplitVIs = [];
  _vmixArCat = '0'; _vmixPosCat = '0'; _vmixLayerCat = '0';
  _vmixSplitMainCat = '1'; _vmixSplitSideCat = '2'; _vmixSplitTmplCat = '3';
  _vmixLayerEdits = new Map(); _vmixLayerExpanded = new Set(); _vmixLayerNameSearch = ''; _vmixLayerNumSearch = '';
  _vmixPastedFrom = new Map();
  const reader = new FileReader();
  reader.onload = e => {
    _vmixOrigText = e.target.result;
    _vmixRawText = e.target.result;
    _vmixDoc = new DOMParser().parseFromString(_vmixRawText, 'text/xml');
    _vmixInputCount = Array.from(_vmixDoc.documentElement.children)
      .filter(e => e.tagName === 'Input').length;
    document.getElementById('vmixFilename').textContent = file.name;
    document.getElementById('vmixFilename').style.display = 'block';
    vmixRenderArList();
    vmixRenderPosList();
    vmixRenderLayerPane();
    vmixRenderSplitPane();
    document.getElementById('vmixSourceCard').style.display = 'block';
    _vmixUpdateSaveBtn();
  };
  reader.readAsText(file, 'UTF-8');
}

// OriginalTitle이 있는 소스만 반환
function _vmixInputs() {
  return Array.from(_vmixDoc.querySelectorAll('Input'))
    .filter(inp => inp.getAttribute('OriginalTitle')?.trim());
}

// vmix 파일 전체 Input 목록 기준 1-based 순번 (이름 없는 소스 포함하여 계산)
function _vmixNum(inp) {
  return Array.from(_vmixDoc.querySelectorAll('Input')).indexOf(inp) + 1;
}

// 원본 파일 텍스트에서 특정 Key의 속성값 추출 (초기화용)
function _vmixGetOrigAttr(key, attrName) {
  const eol = _vmixOrigText.includes('\r\n') ? '\r\n' : '\n';
  for (const line of _vmixOrigText.split(eol)) {
    if (!line.includes(`Key="${key}"`)) { continue; }
    const m = new RegExp(attrName + '="([^"]*)"').exec(line);
    return m ? m[1] : null;
  }
  return null;
}

// 화면비율 초기화 (원본 AspectRatio 복원)
function vmixResetAR() {
  _vmixInputs().forEach(inp => {
    const key = inp.getAttribute('Key');
    const orig = _vmixGetOrigAttr(key, 'AspectRatio');
    if (orig !== null) {
      inp.setAttribute('AspectRatio', orig);
      _vmixSetRawAttr(key, 'AspectRatio', orig);
    }
  });
  vmixRenderArList();
  _vmixUpdateSaveBtn();
}

// 포지션 복사 초기화 (붙여넣기 대상 원복 + 상태 초기화)
function vmixResetPos() {
  if (_vmixPastedFrom.size > 0) {
    const origDoc = new DOMParser().parseFromString(_vmixOrigText, 'text/xml');
    const curInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
    _vmixPastedFrom.forEach((_, targetKey) => {
      const origPos = _vmixGetOrigAttr(targetKey, 'Positions');
      const origPosExt = _vmixGetOrigAttr(targetKey, 'PositionsExtended');
      if (origPos) { _vmixSetRawAttr(targetKey, 'Positions', origPos); }
      if (origPosExt) { _vmixSetRawAttr(targetKey, 'PositionsExtended', origPosExt); }
      const origInp = Array.from(origDoc.querySelectorAll('Input'))
        .find(i => i.getAttribute('Key') === targetKey);
      const curInp = curInputs.find(i => i.getAttribute('Key') === targetKey);
      if (origInp && curInp) {
        const op = origInp.getAttribute('Positions');
        const ope = origInp.getAttribute('PositionsExtended');
        if (op) { curInp.setAttribute('Positions', op); }
        if (ope) { curInp.setAttribute('PositionsExtended', ope); }
      }
    });
  }
  _vmixCopiedKey = null;
  _vmixPastedFrom.clear();
  vmixRenderPosList();
  _vmixUpdateSaveBtn();
}

// 버츄얼 인풋 생성 초기화 (생성된 VI 삭제)
function vmixResetVI() {
  if (_vmixNewVIs.length > 0) {
    const viKeys = new Set(_vmixNewVIs.map(v => v.key));
    const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
    let skipNext = false;
    const filtered = _vmixRawText.split(eol).filter(line => {
      if (skipNext) { skipNext = false; return false; }
      for (const key of viKeys) {
        if (line.includes(`Key="${key}"`)) {
          if (!line.trimEnd().endsWith('/>')) { skipNext = true; }
          return false;
        }
      }
      return true;
    });
    _vmixRawText = filtered.join(eol);
    _vmixNewVIs = [];
  }
  vmixRenderVIPane();
  _vmixUpdateSaveBtn();
}

// 자동 분할 초기화 (생성된 분할 VI 삭제)
function vmixResetSplit() {
  if (_vmixSplitVIs.length > 0) {
    const splitKeys = new Set(_vmixSplitVIs.map(v => v.key));
    const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
    let skipNext = false;
    const filtered = _vmixRawText.split(eol).filter(line => {
      if (skipNext) { skipNext = false; return false; }
      for (const key of splitKeys) {
        if (line.includes(`Key="${key}"`)) {
          if (!line.trimEnd().endsWith('/>')) { skipNext = true; }
          return false;
        }
      }
      return true;
    });
    _vmixRawText = filtered.join(eol);
    _vmixSplitVIs = [];
  }
  vmixRenderSplitPane();
  _vmixUpdateSaveBtn();
}

// raw 텍스트에서 특정 Key를 가진 Input 행의 속성값 교체
function _vmixSetRawAttr(key, attrName, rawValue) {
  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].includes(`Key="${key}"`)) { continue; }
    lines[i] = lines[i].replace(
      new RegExp(`${attrName}="[^"]*"`),
      `${attrName}="${rawValue}"`
    );
    break;
  }
  _vmixRawText = lines.join(eol);
}

// raw 텍스트에서 특정 Key를 가진 Input의 지정 속성값(인코딩 유지) 추출
function _vmixGetRawAttr(key, attrName) {
  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);
  for (const line of lines) {
    if (!line.includes(`Key="${key}"`)) { continue; }
    const re = new RegExp(attrName + '="([^"]*)"');
    const m = re.exec(line);
    return m ? m[1] : null;
  }
  return null;
}

// MatrixPosition 값이 기본값(줌1, 이동0, 회전0)에서 벗어났는지 확인
function _vmixHasCustomPos(inp) {
  let posXml = inp.getAttribute('Positions');
  if (!posXml) { return false; }
  try {
    // <?xml ...?> 선언 제거 후 파싱 (encoding 선언이 브라우저 파서를 방해하는 경우 대응)
    posXml = posXml.replace(/^\s*<\?xml[^?]*\?>\s*/, '');
    const pdoc = new DOMParser().parseFromString(posXml, 'text/xml');
    for (const m of pdoc.querySelectorAll('MatrixPosition')) {
      const dc = name => Array.from(m.children).find(c => c.tagName === name)?.textContent.trim() ?? null;
      if (dc('ZoomX') !== '1' || dc('ZoomY') !== '1') { return true; }
      if (dc('PostZoomX') !== '1' || dc('PostZoomY') !== '1') { return true; }
      if (dc('PanX') !== '0' || dc('PanY') !== '0') { return true; }
      if (dc('Mirror') === 'true' || dc('Hidden') === 'true') { return true; }
      const rotEl = Array.from(m.children).find(c => c.tagName === 'Rotate');
      if (rotEl) {
        const rx = rotEl.querySelector('X')?.textContent.trim();
        const ry = rotEl.querySelector('Y')?.textContent.trim();
        const rz = rotEl.querySelector('Z')?.textContent.trim();
        if (rx !== '0' || ry !== '0' || rz !== '0') { return true; }
      }
    }
  } catch(e) {}
  return false;
}

function vmixSwitchTab(id, btn) {
  document.querySelectorAll('.vmix-sub-tab').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  document.getElementById('vmix-pane-ar').style.display = id === 'ar'    ? '' : 'none';
  document.getElementById('vmix-pane-pos').style.display = id === 'pos'   ? '' : 'none';
  document.getElementById('vmix-pane-vi').style.display = id === 'vi'    ? '' : 'none';
  document.getElementById('vmix-pane-split').style.display = id === 'split' ? '' : 'none';
  const resetFns = { ar: vmixResetAR, pos: vmixResetPos, vi: vmixResetLayers, split: vmixResetSplit };
  document.getElementById('vmixSubReset').onclick = resetFns[id];
}

function _vmixFilterByCat(inputs, cat) {
  if (cat === '0') { return inputs; }
  return inputs.filter(i => i.getAttribute('Category') === cat);
}

function _vmixCatSwatchHtml(selCat, onclickFn) {
  const swatches = _VMIX_CAT_COLORS.map((color, i) =>
    `<div class="vmix-cat-swatch${String(i) === selCat ? ' sel' : ''}" style="background:${color};"
      onclick="${onclickFn}('${i}')">${i}</div>`
  ).join('');
  return `<div class="vmix-cat-swatches" style="margin-bottom:10px;">${swatches}</div>`;
}

function vmixSetArCat(cat)    { _vmixArCat    = cat; vmixRenderArList(); }
function vmixSetPosCat(cat)   { _vmixPosCat   = cat; vmixRenderPosList(); }
function vmixSetLayerCat(cat) { _vmixLayerCat = cat; vmixRenderLayerPane(); }

function vmixRenderArList() {
  const allInputs = _vmixInputs();
  const inputs = _vmixFilterByCat(allInputs, _vmixArCat);
  const rows = inputs.map(inp => {
    const title = inp.getAttribute('OriginalTitle');
    const key = inp.getAttribute('Key');
    const ar = inp.getAttribute('AspectRatio') || '-';
    const arLabel = _VMIX_AR[ar] || ar;
    const isWide = ar === '1';
    return `<div class="vmix-source-row">
      <label class="vmix-cb"><input type="checkbox" class="vmix-ar-cb" data-key="${key}"></label>
      <span class="vmix-num">${_vmixNum(inp)}</span>
      <span class="vmix-source-name" title="${title}">${title}</span>
      <span class="vmix-ar-badge${isWide ? ' wide' : ''}">${arLabel}</span>
    </div>`;
  }).join('');
  document.getElementById('vmixArList').innerHTML = _vmixCatSwatchHtml(_vmixArCat, 'vmixSetArCat') + rows;
}

function vmixRenderPosList() {
  const inputs = _vmixFilterByCat(_vmixInputs(), _vmixPosCat);
  const hasCopied = _vmixCopiedKey !== null;
  const header = hasCopied ? `<div class="vmix-action-bar" style="margin-top:0;padding-top:0;border-top:none;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid #f0f0f0;">
    <label class="vmix-selall-wrap"><input type="checkbox" id="vmixPosSelAll" onchange="vmixTogglePosAll(this.checked)"><span>전체 선택</span></label>
    <button class="vmix-act-btn accent" style="flex:none;padding:8px 14px;" onclick="vmixPasteToSelected()">선택 항목에 붙여넣기</button>
  </div>` : '';
  const rows = inputs.map(inp => {
    const title = inp.getAttribute('OriginalTitle');
    const key = inp.getAttribute('Key');
    const isCopied = key === _vmixCopiedKey;
    const pastedFrom = _vmixPastedFrom.get(key);
    const hasCustom = _vmixHasCustomPos(inp);
    const cbCell = hasCopied && !isCopied
      ? `<label class="vmix-cb"><input type="checkbox" class="vmix-pos-cb" data-key="${key}"></label>`
      : `<span class="vmix-cb-ph"></span>`;
    let badge = '';
    if (pastedFrom !== undefined) { badge = `<span class="vmix-pos-badge pasted">← ${pastedFrom}번</span>`; } else if (hasCustom) { badge = `<span class="vmix-pos-badge custom">커스텀</span>`; } else { badge = `<span class="vmix-pos-badge"></span>`; }
    return `<div class="vmix-source-row">
      ${cbCell}
      <span class="vmix-num">${_vmixNum(inp)}</span>
      <span class="vmix-source-name" title="${title}">${title}</span>
      ${badge}
      <button class="vmix-btn${isCopied ? ' is-copied' : ''}" onclick="vmixCopyPos('${key}')">${isCopied ? '📋 복사됨' : '포지션 복사'}</button>
    </div>`;
  }).join('');
  document.getElementById('vmixPosList').innerHTML = _vmixCatSwatchHtml(_vmixPosCat, 'vmixSetPosCat') + header + rows;
}

function vmixApplyWideSelected() {
  const checked = Array.from(document.querySelectorAll('.vmix-ar-cb:checked'));
  if (!checked.length) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  checked.forEach(cb => {
    const inp = allInputs.find(i => i.getAttribute('Key') === cb.dataset.key);
    if (inp) { inp.setAttribute('AspectRatio', '1'); }
    _vmixSetRawAttr(cb.dataset.key, 'AspectRatio', '1');
  });
  vmixRenderArList();
  _vmixUpdateSaveBtn();
}

function vmixApplyWide() {
  _vmixInputs().forEach(inp => inp.setAttribute('AspectRatio', '1'));
  _vmixRawText = _vmixRawText.replace(/AspectRatio="100"/g, 'AspectRatio="1"');
  vmixRenderArList();
  _vmixUpdateSaveBtn();
}

function vmixCopyPos(key) {
  _vmixCopiedKey = _vmixCopiedKey === key ? null : key;
  vmixRenderPosList();
}

function vmixTogglePosAll(checked) {
  document.querySelectorAll('.vmix-pos-cb').forEach(cb => cb.checked = checked);
}

function vmixPasteToSelected() {
  const checked = Array.from(document.querySelectorAll('.vmix-pos-cb:checked'));
  if (!checked.length) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const src = allInputs.find(i => i.getAttribute('Key') === _vmixCopiedKey);
  const srcName = src?.getAttribute('OriginalTitle') || '소스';
  const rawPos = _vmixGetRawAttr(_vmixCopiedKey, 'Positions');
  const rawPosExt = _vmixGetRawAttr(_vmixCopiedKey, 'PositionsExtended');
  const srcDecoded = src?.getAttribute('Positions');
  const srcDecodedExt = src?.getAttribute('PositionsExtended');
  const msg = checked.length === 1
    ? `'${srcName}'의 포지션을 '${allInputs.find(i => i.getAttribute('Key') === checked[0].dataset.key)?.getAttribute('OriginalTitle') || '소스'}'에 붙여넣을까요?`
    : `'${srcName}'의 포지션을 선택한 ${checked.length}개 소스에 붙여넣을까요?`;
  const srcNum = _vmixNum(src);
  openConfirm('포지션 붙여넣기', msg, () => {
    checked.forEach(cb => {
      // Positions + PositionsExtended 모두 교체 (vMix는 PositionsExtended를 우선 사용)
      if (rawPos) { _vmixSetRawAttr(cb.dataset.key, 'Positions', rawPos); }
      if (rawPosExt) { _vmixSetRawAttr(cb.dataset.key, 'PositionsExtended', rawPosExt); }
      // DOM 갱신 (커스텀 뱃지 표시용)
      const dst = allInputs.find(i => i.getAttribute('Key') === cb.dataset.key);
      if (dst) {
        if (srcDecoded) { dst.setAttribute('Positions', srcDecoded); }
        if (srcDecodedExt) { dst.setAttribute('PositionsExtended', srcDecodedExt); }
      }
      _vmixPastedFrom.set(cb.dataset.key, srcNum);
    });
    vmixRenderPosList();
    _vmixUpdateSaveBtn();
  });
}

// ── 버츄얼 인풋 생성 ─────────────────────────────────────

function _vmixGenUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

function vmixToggleLayerCard(key) {
  const layerEl = document.getElementById(`vlayers-${key}`);
  const arrowEl = document.getElementById(`varrow-${key}`);
  if (!layerEl) { return; }
  const isOpen = layerEl.style.display !== 'none';
  layerEl.style.display = isOpen ? 'none' : '';
  if (arrowEl) { arrowEl.textContent = isOpen ? '▶' : '▼'; }
  if (isOpen) { _vmixLayerExpanded.delete(key); } else { _vmixLayerExpanded.add(key); }
}

function vmixRenderLayerPane() {
  const pane = document.getElementById('vmix-pane-vi');
  if (!pane) { return; }
  if (!_vmixDoc) { pane.innerHTML = ''; return; }
  const allInputs = _vmixInputs();
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const nameTerm = _vmixLayerNameSearch.trim().toLowerCase();
  const numTerm = _vmixLayerNumSearch.trim();
  const catFiltered = _vmixFilterByCat(allInputs, _vmixLayerCat);
  const filtered = catFiltered.filter(i => {
    const nameOk = !nameTerm || i.getAttribute('OriginalTitle').toLowerCase().includes(nameTerm);
    const numOk  = !numTerm  || String(_vmixNum(i)) === numTerm;
    return nameOk && numOk;
  });
  const baseOpts = allInputs.map(i =>
    `<option value="${i.getAttribute('Key')}">${_vmixNum(i)}. ${i.getAttribute('OriginalTitle')}</option>`
  ).join('');
  const cards = filtered.map(inp => {
    const key = inp.getAttribute('Key');
    const title = inp.getAttribute('OriginalTitle');
    const isEdited = _vmixLayerEdits.has(key);
    const layers = [0, 1, 2].map(slot => {
      const rawOv = inp.getAttribute(`Overlay${slot}`) || '';
      const curKey = (rawOv && rawOv !== nullUUID) ? rawOv : '';
      const curRef = curKey ? allInputs.find(i => i.getAttribute('Key') === curKey) : null;
      const curNum = curRef ? _vmixNum(curRef) : '';
      const opts = '<option value="">없음</option>' +
        (curKey ? baseOpts.replace(`value="${curKey}"`, `value="${curKey}" selected`) : baseOpts);
      return `<div class="vmix-vi-layer-row">
        <span class="vmix-vi-layer-label">레이어 ${slot + 1}</span>
        <input type="number" class="vmix-vi-layer-num" id="ln-${key}-${slot}"
          min="1" value="${curNum}" placeholder="-"
          onchange="vmixLayerNumChange('${key}',${slot},this)">
        <select class="vmix-vi-layer-sel" id="ls-${key}-${slot}"
          onchange="vmixLayerSelChange('${key}',${slot},this)">${opts}</select>
      </div>`;
    }).join('');
    const badge = isEdited
      ? `<span class="vmix-vi-parent-tag" style="background:#fff3e0;color:#e65100;">수정됨</span>` : '';
    const isExpanded = _vmixLayerExpanded.has(key);
    return `<div class="vmix-vi-card">
      <div class="vmix-vi-card-header" style="cursor:pointer;" onclick="vmixToggleLayerCard('${key}')">
        <span class="vmix-num">${_vmixNum(inp)}</span>
        <span class="vmix-vi-card-title">${title}</span>
        ${badge}
        <span id="varrow-${key}" style="font-size:11px;color:#999;">${isExpanded ? '▼' : '▶'}</span>
      </div>
      <div id="vlayers-${key}" class="vmix-vi-layers" style="display:${isExpanded ? '' : 'none'};">${layers}</div>
    </div>`;
  }).join('');
  const emptyMsg = filtered.length === 0
    ? `<div style="color:#999;font-size:13px;text-align:center;padding:20px 0;">검색 결과 없음</div>` : '';
  pane.innerHTML = _vmixCatSwatchHtml(_vmixLayerCat, 'vmixSetLayerCat') +
    `<div style="display:flex;gap:8px;margin-bottom:12px;">
    <input type="number" class="vmix-layer-search" style="width:72px;" placeholder="번호"
      value="${_vmixLayerNumSearch}" oninput="vmixLayerNumSearch(this.value)">
    <input type="text" class="vmix-layer-search" style="flex:1;" placeholder="이름 검색..."
      value="${_vmixLayerNameSearch.replace(/"/g, '&quot;')}" oninput="vmixLayerNameSearch(this.value)">
  </div>${cards ? `<div class="vmix-vi-list">${cards}</div>` : emptyMsg}`;
}

function vmixLayerNameSearch(term) { _vmixLayerNameSearch = term; vmixRenderLayerPane(); }
function vmixLayerNumSearch(term) { _vmixLayerNumSearch = term; vmixRenderLayerPane(); }

function vmixUpdateLayer(key, slot, sourceKey) {
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const val = sourceKey || nullUUID;
  const attrName = `Overlay${slot}`;
  if (_vmixGetRawAttr(key, attrName) !== null) {
    _vmixSetRawAttr(key, attrName, val);
  } else {
    const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
    const lines = _vmixRawText.split(eol);
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].includes(`Key="${key}"`)) { continue; }
      lines[i] = lines[i].replace(/(\/?>)$/, ` ${attrName}="${val}"$1`);
      break;
    }
    _vmixRawText = lines.join(eol);
  }
  const inp = Array.from(_vmixDoc.querySelectorAll('Input')).find(i => i.getAttribute('Key') === key);
  if (inp) { inp.setAttribute(attrName, val); }
  _vmixLayerEdits.set(key, true);
  _vmixUpdateSaveBtn();
}

function vmixLayerNumChange(key, slot, numEl) {
  const num = parseInt(numEl.value);
  const allInputs = _vmixInputs();
  const target = allInputs.find(i => _vmixNum(i) === num);
  const sel = document.getElementById(`ls-${key}-${slot}`);
  if (target) {
    const k = target.getAttribute('Key');
    if (sel) { sel.value = k; }
    vmixUpdateLayer(key, slot, k);
  } else {
    numEl.value = '';
    if (sel) { sel.value = ''; }
    vmixUpdateLayer(key, slot, '');
  }
}

function vmixLayerSelChange(key, slot, selEl) {
  const sourceKey = selEl.value;
  const allInputs = _vmixInputs();
  const numEl = document.getElementById(`ln-${key}-${slot}`);
  const ref = sourceKey ? allInputs.find(i => i.getAttribute('Key') === sourceKey) : null;
  if (numEl) { numEl.value = ref ? _vmixNum(ref) : ''; }
  vmixUpdateLayer(key, slot, sourceKey);
}

function vmixResetLayers() {
  if (_vmixLayerEdits.size > 0) {
    const nullUUID = '00000000-0000-0000-0000-000000000000';
    _vmixLayerEdits.forEach((_, key) => {
      for (let s = 0; s < 3; s++) {
        const attrName = `Overlay${s}`;
        const origVal = _vmixGetOrigAttr(key, attrName);
        const restoreVal = origVal !== null ? origVal : nullUUID;
        _vmixSetRawAttr(key, attrName, restoreVal);
        const inp = Array.from(_vmixDoc.querySelectorAll('Input')).find(i => i.getAttribute('Key') === key);
        if (inp) { inp.setAttribute(attrName, restoreVal); }
      }
    });
    _vmixLayerEdits.clear();
  }
  vmixRenderLayerPane();
  _vmixUpdateSaveBtn();
}

// ── 구 vmixRenderVIPane 제거 후 진입점 유지 (dead code) ───
function vmixRenderVIPane() {
  const pane = document.getElementById('vmix-pane-vi');
  if (!pane) { return; }
  const newKeys = new Set(_vmixNewVIs.map(v => v.key));
  const origInputs = _vmixInputs().filter(inp => !newKeys.has(inp.getAttribute('Key')));

  const srcOpts = origInputs.map(inp =>
    `<option value="${inp.getAttribute('Key')}">${_vmixNum(inp)}. ${inp.getAttribute('OriginalTitle')}</option>`
  ).join('');

  const setup = `<div class="vmix-vi-setup">
    <div class="vmix-vi-form-row">
      <span class="vmix-vi-label">소스 선택</span>
      <select id="vmixVISrcSel" class="vmix-vi-select">${srcOpts}</select>
    </div>
    <div class="vmix-vi-form-row">
      <span class="vmix-vi-label">생성 수</span>
      <input type="number" id="vmixVICount" class="vmix-vi-count" min="1" max="20" value="1">
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;align-items:center;">
      <button class="vmix-act-btn" onclick="vmixCreateVirtuals()">생성하기</button>
    </div>
  </div>`;

  const baseCount = _vmixInputCount;
  const cards = _vmixNewVIs.map((vi, idx) => {
    const parentTitle = origInputs.find(i => i.getAttribute('Key') === vi.parentKey)?.getAttribute('OriginalTitle') || '';
    const viNum = baseCount + idx + 1;
    const layers = [0, 1, 2].map(slot => {
      const currentKey = vi.overlays[slot] || '';
      const currentNum = currentKey
        ? (_vmixNum(origInputs.find(i => i.getAttribute('Key') === currentKey)) || '')
        : '';
      const opts = `<option value="">없음</option>` + origInputs
        .filter(inp => inp.getAttribute('Key') !== vi.parentKey)
        .map(inp => {
          const k = inp.getAttribute('Key');
          const t = inp.getAttribute('OriginalTitle');
          const sel = vi.overlays[slot] === k ? ' selected' : '';
          return `<option value="${k}"${sel}>${_vmixNum(inp)}. ${t}</option>`;
        }).join('');
      return `<div class="vmix-vi-layer-row">
        <span class="vmix-vi-layer-label">레이어 ${slot + 1}</span>
        <input type="number" class="vmix-vi-layer-num" id="vin-${vi.key}-${slot}"
          min="1" value="${currentNum}" placeholder="-"
          onchange="vmixVILayerNumChange('${vi.key}',${slot},this)">
        <select class="vmix-vi-layer-sel" id="vis-${vi.key}-${slot}"
          onchange="vmixVILayerSelChange('${vi.key}',${slot},this)">${opts}</select>
      </div>`;
    }).join('');
    return `<div class="vmix-vi-card">
      <div class="vmix-vi-card-header">
        <span class="vmix-num">${viNum}</span>
        <span class="vmix-vi-card-title">${vi.title}</span>
        <span class="vmix-vi-parent-tag">${parentTitle}</span>
      </div>
      ${layers}
    </div>`;
  }).join('');

  pane.innerHTML = setup + (cards ? `<div class="vmix-vi-list">${cards}</div>` : '');
}

function vmixRenderSplitPane() {
  const pane = document.getElementById('vmix-pane-split');
  if (!pane) { return; }
  if (!_vmixDoc) { pane.innerHTML = ''; return; }

  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const locked = _vmixSplitVIs.length > 0;

  // 카테고리 선택 행
  const roles = [
    { key: 'main', label: '메인 장표', val: _vmixSplitMainCat },
    { key: 'side', label: '사이드 장표', val: _vmixSplitSideCat },
    { key: 'tmpl', label: '템플릿',     val: _vmixSplitTmplCat },
  ];
  const catRows = roles.map(r => {
    const swatches = _VMIX_CAT_COLORS.map((color, i) => {
      const iSel = String(i) === r.val;
      const cls = 'vmix-cat-swatch' + (iSel ? ' sel' : '') + (locked ? ' locked' : '');
      const handler = locked ? '' : `onclick="vmixSetSplitCat('${r.key}','${i}')"`;
      return `<div class="${cls}" style="background:${color};" ${handler}>${i}</div>`;
    }).join('');
    return `<div class="vmix-cat-row">
      <span class="vmix-split-label">${r.label}</span>
      <div class="vmix-cat-swatches">${swatches}</div>
    </div>`;
  }).join('');

  // 분석
  const catMain = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitMainCat && i.getAttribute('OriginalTitle')?.trim());
  const catTmpl = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitTmplCat && i.getAttribute('OriginalTitle')?.trim());
  const tmpl = catTmpl[0] || null;
  let mainSlot = -1;
  if (tmpl) {
    for (let s = 0; s < 3; s++) {
      const ovKey = tmpl.getAttribute(`Overlay${s}`);
      if (!ovKey || ovKey === nullUUID) { continue; }
      const ref = allInputs.find(i => i.getAttribute('Key') === ovKey);
      if (ref && ref.getAttribute('Category') === _vmixSplitMainCat) { mainSlot = s; break; }
    }
  }

  const statusLines = [];
  if (!catTmpl.length) {
    statusLines.push(`<div class="vmix-split-warn">카테고리 ${_vmixSplitTmplCat}에 템플릿 없음</div>`);
  } else {
    statusLines.push(`<div class="vmix-split-info"><span class="vmix-split-label">템플릿</span><span>${_vmixNum(tmpl)}. ${tmpl.getAttribute('OriginalTitle')}</span></div>`);
    if (mainSlot === -1) {
      statusLines.push(`<div class="vmix-split-warn">템플릿에 카테고리 ${_vmixSplitMainCat} 레이어 없음</div>`);
    }
  }
  if (!catMain.length) {
    statusLines.push(`<div class="vmix-split-warn">카테고리 ${_vmixSplitMainCat}에 소스 없음</div>`);
  } else {
    statusLines.push(`<div class="vmix-split-info"><span class="vmix-split-label">메인 장표</span><span>${catMain.length}개</span></div>`);
  }

  const canRun = !locked && tmpl && mainSlot >= 0 && catMain.length > 0;
  const setup = `<div class="vmix-vi-setup">
    ${catRows}
    <hr class="vmix-split-divider">
    ${statusLines.join('')}
    <div style="margin-top:10px;">
      <button class="vmix-act-btn${canRun ? ' accent' : ''}" ${canRun ? '' : 'disabled'} onclick="vmixAutoSplit()">자동 분할 생성</button>
    </div>
  </div>`;

  const baseCount = _vmixInputCount + _vmixNewVIs.length;
  const cards = _vmixSplitVIs.map((vi, idx) => {
    const viNum = baseCount + idx + 1;
    return `<div class="vmix-vi-card">
      <div class="vmix-vi-card-header">
        <span class="vmix-num">${viNum}</span>
        <span class="vmix-vi-card-title">${vi.title}</span>
        <span class="vmix-vi-parent-tag">레이어 ${vi.mainSlot + 1}</span>
      </div>
    </div>`;
  }).join('');

  pane.innerHTML = setup + (cards ? `<div class="vmix-vi-list">${cards}</div>` : '');
}

function vmixSetSplitCat(role, cat) {
  if (role === 'main') { _vmixSplitMainCat = cat; }
  else if (role === 'side') { _vmixSplitSideCat = cat; }
  else if (role === 'tmpl') { _vmixSplitTmplCat = cat; }
  vmixRenderSplitPane();
}

function vmixAutoSplit() {
  if (!_vmixDoc) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const cat1 = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitMainCat && i.getAttribute('OriginalTitle')?.trim());
  const cat3 = allInputs.filter(i => i.getAttribute('Category') === _vmixSplitTmplCat && i.getAttribute('OriginalTitle')?.trim());
  if (!cat3.length || !cat1.length) { return; }

  const tmpl = cat3[0];
  const tmplKey = tmpl.getAttribute('Key');
  let mainSlot = -1;
  for (let s = 0; s < 3; s++) {
    const ovKey = tmpl.getAttribute(`Overlay${s}`);
    if (!ovKey || ovKey === nullUUID) { continue; }
    const ref = allInputs.find(i => i.getAttribute('Key') === ovKey);
    if (ref && ref.getAttribute('Category') === _vmixSplitMainCat) { mainSlot = s; break; }
  }
  if (mainSlot === -1) { return; }

  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);

  const openIdx = lines.findIndex(l => l.includes(`Key="${tmplKey}"`));
  if (openIdx === -1) { return; }
  let tmplBlock;
  if (lines[openIdx].trimEnd().endsWith('/>')) {
    tmplBlock = [lines[openIdx]];
  } else {
    let closeIdx = openIdx;
    while (closeIdx < lines.length && !lines[closeIdx].includes('</Input>')) { closeIdx++; }
    tmplBlock = lines.slice(openIdx, closeIdx + 1);
  }

  const stateIdx = lines.findIndex(l => l.trimStart().startsWith('<State'));
  const insertAt = stateIdx === -1 ? lines.length : stateIdx;

  const newRawLines = [];
  for (let i = 0; i < cat1.length; i++) {
    const newKey = _vmixGenUUID();
    const cat1Key = cat1[i].getAttribute('Key');
    const block = [...tmplBlock];
    let ln = block[0];

    ln = ln.replace(`Key="${tmplKey}"`, `Key="${newKey}"`);
    ln = ln.replace(/Type="[^"]*"/, 'Type="22"');
    if (ln.includes('ShaderSource=')) {
      ln = ln.replace(/ShaderSource="[^"]*"/, `ShaderSource="${tmplKey}"`);
    } else {
      ln = ln.replace(/(\/?>)$/, ` ShaderSource="${tmplKey}"$1`);
    }
    if (!ln.includes('VirtualInputKey=')) {
      ln = ln.replace(/(\/?>)$/, ` VirtualInputKey="${tmplKey}" UseSourceRenderEffects="True"$1`);
    }
    ln = ln.replace('VideoShader_ColorCorrectionSourceEnabled="0"',
                    'VideoShader_ColorCorrectionSourceEnabled="-1"');
    for (let s = 0; s < 3; s++) {
      if (!ln.includes(`Overlay${s}="`)) {
        ln = ln.replace(/(\/?>)$/, ` Overlay${s}="${nullUUID}"$1`);
      }
    }
    ln = ln.replace(new RegExp(`Overlay${mainSlot}="[^"]*"`), `Overlay${mainSlot}="${cat1Key}"`);

    block[0] = ln;
    newRawLines.push(...block);
    _vmixSplitVIs.push({ key: newKey, parentKey: tmplKey, title: cat1[i].getAttribute('OriginalTitle'), mainSlot });
  }

  lines.splice(insertAt, 0, ...newRawLines);
  _vmixRawText = lines.join(eol);
  vmixRenderSplitPane();
  _vmixUpdateSaveBtn();
}

function vmixCreateVirtuals() {
  const parentKey = document.getElementById('vmixVISrcSel')?.value;
  const count = parseInt(document.getElementById('vmixVICount')?.value) || 1;
  if (!parentKey || count < 1) { return; }
  const allInputs = Array.from(_vmixDoc.querySelectorAll('Input'));
  const parentInp = allInputs.find(i => i.getAttribute('Key') === parentKey);
  if (!parentInp) { return; }
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const parentTitle = parentInp.getAttribute('OriginalTitle') || 'Virtual';
  const eol = _vmixRawText.includes('\r\n') ? '\r\n' : '\n';
  const lines = _vmixRawText.split(eol);

  // 부모 Input 요소의 전체 라인 블록 파악 (멀티라인 지원)
  const openIdx = lines.findIndex(l => l.includes(`Key="${parentKey}"`));
  if (openIdx === -1) { return; }
  let parentBlock;
  if (lines[openIdx].trimEnd().endsWith('/>')) {
    parentBlock = [lines[openIdx]];               // 자기 닫힘 단일 라인
  } else {
    let closeIdx = openIdx;
    while (closeIdx < lines.length && !lines[closeIdx].includes('</Input>')) closeIdx++;
    parentBlock = lines.slice(openIdx, closeIdx + 1); // 여는 줄 ~ </Input> 줄
  }

  // <State 직전에 삽입
  const stateIdx = lines.findIndex(l => l.trimStart().startsWith('<State'));
  const insertAt = stateIdx === -1 ? lines.length : stateIdx;

  const newRawLines = [];
  for (let i = 0; i < count; i++) {
    const newKey = _vmixGenUUID();
    const block = [...parentBlock];
    let ln = block[0]; // 속성이 있는 여는 줄만 수정

    ln = ln.replace(`Key="${parentKey}"`, `Key="${newKey}"`);
    ln = ln.replace(/Type="[^"]*"/, 'Type="22"');
    ln = ln.includes('ShaderSource=')
      ? ln.replace(/ShaderSource="[^"]*"/, `ShaderSource="${parentKey}"`)
      : ln.replace(/(\/?>)$/, ` ShaderSource="${parentKey}"$1`);
    if (!ln.includes('VirtualInputKey=')) {
      ln = ln.replace(/(\/?>)$/, ` VirtualInputKey="${parentKey}" UseSourceRenderEffects="True"$1`);
    }
    ln = ln.replace('VideoShader_ColorCorrectionSourceEnabled="0"',
                    'VideoShader_ColorCorrectionSourceEnabled="-1"');
    for (let s = 0; s < 3; s++) {
      if (!ln.includes(`Overlay${s}="`)) {
        ln = ln.replace(/(\/?>)$/, ` Overlay${s}="${nullUUID}"$1`);
      }
    }

    block[0] = ln;
    newRawLines.push(...block);

    _vmixNewVIs.push({
      key:      newKey,
      parentKey,
      title:    parentTitle,
      overlays: [0, 1, 2].map(s => {
        const v = parentInp.getAttribute(`Overlay${s}`);
        return (v && v !== nullUUID) ? v : null;
      }),
    });
  }

  lines.splice(insertAt, 0, ...newRawLines);
  _vmixRawText = lines.join(eol);

  vmixRenderVIPane();
  _vmixUpdateSaveBtn();
}

function vmixUpdateVIOverlay(viKey, slot, sourceKey) {
  const nullUUID = '00000000-0000-0000-0000-000000000000';
  const val = sourceKey || nullUUID;
  _vmixSetRawAttr(viKey, `Overlay${slot}`, val);
  const vi = _vmixNewVIs.find(v => v.key === viKey);
  if (vi) { vi.overlays[slot] = sourceKey || null; }
}

function vmixVILayerNumChange(viKey, slot, numEl) {
  const num = parseInt(numEl.value);
  const vi = _vmixNewVIs.find(v => v.key === viKey);
  const newKeys = new Set(_vmixNewVIs.map(v => v.key));
  const origInputs = _vmixInputs().filter(inp => !newKeys.has(inp.getAttribute('Key')));
  const target = origInputs.find(inp =>
    _vmixNum(inp) === num && inp.getAttribute('Key') !== vi?.parentKey
  );
  const sel = document.getElementById(`vis-${viKey}-${slot}`);
  if (target) {
    const k = target.getAttribute('Key');
    if (sel) { sel.value = k; }
    vmixUpdateVIOverlay(viKey, slot, k);
  } else {
    numEl.value = '';
    if (sel) { sel.value = ''; }
    vmixUpdateVIOverlay(viKey, slot, '');
  }
}

function vmixVILayerSelChange(viKey, slot, selEl) {
  const sourceKey = selEl.value;
  const newKeys = new Set(_vmixNewVIs.map(v => v.key));
  const origInputs = _vmixInputs().filter(inp => !newKeys.has(inp.getAttribute('Key')));
  const numEl = document.getElementById(`vin-${viKey}-${slot}`);
  if (sourceKey) {
    const inp = origInputs.find(i => i.getAttribute('Key') === sourceKey);
    if (numEl) { numEl.value = inp ? _vmixNum(inp) : ''; }
  } else {
    if (numEl) { numEl.value = ''; }
  }
  vmixUpdateVIOverlay(viKey, slot, sourceKey);
}

function _vmixSplitChanged() { return _vmixSplitVIs.length > 0; }
function _vmixLayerChanged() { return _vmixLayerEdits.size > 0; }
function _vmixArChanged() {
  if (!_vmixDoc) { return false; }
  return _vmixInputs().some(inp => {
    const orig = _vmixGetOrigAttr(inp.getAttribute('Key'), 'AspectRatio');
    return orig !== null && inp.getAttribute('AspectRatio') !== orig;
  });
}
function _vmixPosChanged() { return _vmixPastedFrom.size > 0; }
function _vmixVIChanged()  { return _vmixNewVIs.length > 0; }
function _vmixAnyChanged() { return _vmixArChanged() || _vmixPosChanged() || _vmixLayerChanged() || _vmixSplitChanged(); }

function _vmixUpdateSaveBtn() {
  if (!document.getElementById('tab-vmix').classList.contains('on')) { return; }
  document.getElementById('btnBarMain').disabled = !_vmixAnyChanged();
}

function openVmixSaveModal() {
  if (!_vmixAnyChanged()) { return; }
  const chk = v => v
    ? '<span style="color:#0F6E56;font-weight:600;">✓</span>'
    : '<span style="color:#ccc;">✓</span>';
  document.getElementById('vmixSaveSummary').innerHTML = [
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:${_vmixArChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixArChanged())} 화면비율</div>`,
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:${_vmixPosChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixPosChanged())} 포지션 복사</div>`,
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:${_vmixLayerChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixLayerChanged())} 레이어 설정</div>`,
    `<div style="display:flex;align-items:center;gap:8px;padding:8px 0;font-size:14px;color:${_vmixSplitChanged() ? '#1a1a1a' : '#bbb'};">${chk(_vmixSplitChanged())} 자동 분할</div>`,
  ].join('');
  history.pushState({ overlay: 'vmixSave' }, '');
  document.getElementById('vmixSaveBg').style.display = 'flex';
}
function closeVmixSaveModal() { document.getElementById('vmixSaveBg').style.display = 'none'; if (history.state && history.state.overlay === 'vmixSave') { _histBack(); } }
function closeVmixSaveBg(e) { if (e.target === document.getElementById('vmixSaveBg')) { closeVmixSaveModal(); } }

function vmixFullReset() {
  if (!_vmixOrigText) { return; }
  _vmixRawText = _vmixOrigText;
  _vmixDoc = new DOMParser().parseFromString(_vmixOrigText, 'text/xml');
  _vmixCopiedKey = null; _vmixNewVIs = []; _vmixSplitVIs = []; _vmixPastedFrom = new Map();
  _vmixArCat = '0'; _vmixPosCat = '0'; _vmixLayerCat = '0';
  _vmixSplitMainCat = '1'; _vmixSplitSideCat = '2'; _vmixSplitTmplCat = '3';
  _vmixLayerEdits = new Map(); _vmixLayerExpanded = new Set(); _vmixLayerNameSearch = ''; _vmixLayerNumSearch = '';
  vmixRenderArList(); vmixRenderPosList(); vmixRenderLayerPane(); vmixRenderSplitPane();
  _vmixUpdateSaveBtn();
}

// ── §13  일정 불러오기 ────────────────────────────────────────────────────────
// 관리자: 본인 Outlook 공개 ICS URL을 아래에 설정 (빈 문자열이면 설정 화면 표시)
const _SCHED_ICS_URL = 'https://outlook.live.com/owa/calendar/00000000-0000-0000-0000-000000000000/cfc7d81d-4e85-4980-8652-3a1ecc64867d/cid-610EC8FF2A0B2E95/calendar.ics';

let _schedEvents = [];
let _schedTab = 'upcoming';

function openSchedModal() {
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
      <button class="sched-primary-btn" style="margin-top:14px;background:#555" onclick="_schedOpenSettings()">URL 변경</button>`;
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
    _schedApplyParsed(parsed);
    closeSchedModal();
    const pitchStr = parsed.pitch ? parsed.pitch + 'mm' : null;
    let areaStr;
    if (parsed.mode === 'multi') {
      const ap = [];
      if (parsed.center) { ap.push('중앙 ' + parsed.center.w + '×' + parsed.center.h + 'm'); }
      if (parsed.left)   { ap.push('좌우 ' + parsed.left.w   + '×' + parsed.left.h   + 'm'); }
      areaStr = ap.join(' ');
    } else {
      areaStr = (parsed.width != null && parsed.height != null)
        ? parsed.width + '×' + parsed.height + 'm' : null;
    }
    const parts = [pitchStr, areaStr].filter(Boolean);
    _toast(parts.length ? '적용됨: ' + parts.join(' · ') : '일정 적용됨 (면적 정보 없음)');
  } catch (e) {
    const body = document.getElementById('sched-body');
    body.innerHTML = `<div class="sched-hint">${_se(e.message)}</div>
      <button class="sched-primary-btn" style="margin-top:12px;background:#555" onclick="_schedRenderList()">목록으로</button>`;
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

function _schedApplyParsed(parsed) {
  // LED 피치 (단일·멀티 공통)
  if (parsed.pitch) {
    document.querySelectorAll('#ledChips .chip').forEach(c => c.classList.remove('on'));
    const el = document.querySelector('#ledChips .chip[data-v="' + parsed.pitch + 'mm"]');
    if (el) { el.classList.add('on'); State.curLed = parsed.pitch + 'mm'; }
  }
  // 패널: 2mm LED는 500×500mm 고정, 그 외는 기본 500×1000mm
  document.querySelectorAll('#panelChips .chip').forEach(c => c.classList.remove('on'));
  const rotBtn  = document.getElementById('panelRotateBtn');
  if (parsed.pitch === 2) {
    const panelEl = document.querySelector('#panelChips .chip[data-v="500"]');
    if (panelEl) { panelEl.classList.add('on'); State.basePH = 500; }
    State.panelRotated = false;
  } else {
    const panelEl = document.querySelector('#panelChips .chip[data-v="1000"]');
    if (panelEl) { panelEl.classList.add('on'); State.basePH = 1000; }
    if (rotBtn)  { rotBtn.classList.toggle('on', State.panelRotated); }
  }

  if (parsed.mode === 'multi') {
    setAreaMode('multi');
    if (parsed.center) {
      document.getElementById('mW_C').value = parsed.center.w;
      document.getElementById('mH_C').value = parsed.center.h;
    }
    if (parsed.left) {
      document.getElementById('mW_L').value = parsed.left.w;
      document.getElementById('mH_L').value = parsed.left.h;
    }
    if (parsed.right) {
      document.getElementById('mW_R').value = parsed.right.w;
      document.getElementById('mH_R').value = parsed.right.h;
    }
    calcMulti();
  } else {
    setAreaMode('single');
    if (parsed.width != null)  { document.getElementById('iW').value = parsed.width; }
    if (parsed.height != null) { document.getElementById('iH').value = parsed.height; }
    rst();
    calc();
  }
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

let _toastTimer = null;
function _toast(msg) {
  const t = document.getElementById('updateToast');
  if (!t) { return; }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

function _se(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function vmixDownload() {
  if (!_vmixRawText) { return; }
  // XMLSerializer 대신 raw 텍스트 직접 사용 — 인코딩 변환 없이 원본 포맷 유지
  const blob = new Blob([_vmixRawText], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = _vmixFilename.replace(/\.vmix$/i, '') + '_edited.vmix';
  a.click();
  URL.revokeObjectURL(url);
}

(function () {
  const drop = document.getElementById('vmixDropArea');
  drop.addEventListener('dragover',  e => { e.preventDefault(); drop.classList.add('drag-over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('drag-over'));
  drop.addEventListener('drop', e => {
    e.preventDefault();
    drop.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) { vmixLoad(file); }
  });
})();


// ── §14 혼합 시뮬레이터 β ────────────────────────────────

// ─ 구역 색상 ─
const BETA_ZONE_BG = [
  'rgba(79,140,255,0.18)',  'rgba(255,120,80,0.18)',  'rgba(60,200,100,0.18)',
  'rgba(220,80,220,0.18)', 'rgba(255,200,0,0.18)',   'rgba(0,200,220,0.18)',
];
const BETA_ZONE_LINE = [
  '#4F8CFF', '#FF7850', '#3CC864', '#DC50DC', '#FFC800', '#00C8DC',
];

// ─ 헬퍼 ─

function _betaGW() { return Math.max(1, Math.round(State.betaAreaW / 500)); }
function _betaGH() { return Math.max(1, Math.round(State.betaAreaH / 500)); }

function _betaSc() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return 1; }
  const W = (cv.parentElement.clientWidth || 320) - 2;
  return W / (State.betaAreaW || 1);
}

// mx, my는 mm 단위 (이벤트 핸들러에서 BCR 기반으로 변환해서 전달)
function _betaCellAt(mmX, mmY) {
  const col = Math.floor(mmX / 500);
  const row = Math.floor(mmY / 500);
  if (col < 0 || row < 0 || col >= _betaGW() || row >= _betaGH()) { return null; }
  return { r: row, c: col };
}

function _betaOverlaps(sr, sc2, rows, cols, skipId) {
  for (const z of State.betaZones) {
    if (z.id === skipId) { continue; }
    if (sr < z.startRow + z.rows && sr + rows > z.startRow &&
        sc2 < z.startCol + z.cols && sc2 + cols > z.startCol) { return true; }
  }
  return false;
}

function _betaZoneAt(r, c) {
  return State.betaZones.find(z =>
    r >= z.startRow && r < z.startRow + z.rows &&
    c >= z.startCol && c < z.startCol + z.cols
  ) || null;
}

// Zone → 패널 배열 [{key, x, y, w, h, led, zoneId}]
function betaPanels(zone) {
  const spanC = zone.panelW / 500;
  const spanR = zone.panelH / 500;
  const fullC = Math.floor(zone.cols / spanC);
  const fullR = Math.floor(zone.rows / spanR);
  const remC  = zone.cols % spanC;
  const remR  = zone.rows % spanR;
  const panels = [];
  for (let pr = 0; pr < fullR; pr++) {
    for (let pc = 0; pc < fullC; pc++) {
      panels.push({
        key: `${zone.id}:${pr}:${pc}`,
        x: (zone.startCol + pc * spanC) * 500,
        y: (zone.startRow + pr * spanR) * 500,
        w: zone.panelW, h: zone.panelH,
        led: zone.led, zoneId: zone.id,
      });
    }
    if (remC) {
      for (let rs = 0; rs < spanR; rs++) {
        panels.push({
          key: `${zone.id}:${pr}:rc${rs}`,
          x: (zone.startCol + fullC * spanC) * 500,
          y: (zone.startRow + pr * spanR + rs) * 500,
          w: 500, h: 500,
          led: zone.led, zoneId: zone.id,
        });
      }
    }
  }
  if (remR) {
    for (let cc = 0; cc < zone.cols; cc++) {
      panels.push({
        key: `${zone.id}:rr:${cc}`,
        x: (zone.startCol + cc) * 500,
        y: (zone.startRow + fullR * spanR) * 500,
        w: 500, h: 500,
        led: zone.led, zoneId: zone.id,
      });
    }
  }
  return panels;
}

function _betaAllPanels() {
  if (!State._betaCache) {
    State._betaCache = State.betaZones.flatMap(z => betaPanels(z));
  }
  return State._betaCache;
}

// mmX, mmY는 mm 단위 (이벤트 핸들러에서 BCR 기반으로 변환해서 전달)
function _betaPanelAt(mmX, mmY) {
  for (const p of _betaAllPanels()) {
    if (mmX >= p.x && mmX < p.x + p.w && mmY >= p.y && mmY < p.y + p.h) { return p; }
  }
  return null;
}

function _betaPxOf(pi) {
  let total = 0;
  for (const key of State.betaPorts[pi]) {
    const p = _betaAllPanels().find(x => x.key === key);
    if (!p) { continue; }
    const sp = SPECS[p.led];
    total += Math.round(sp.px500.w / 500 * p.w) * Math.round(sp.px500.h / 500 * p.h);
  }
  return total;
}

function _betaOwner(key) {
  return State.betaPorts.findIndex(s => s.has(key));
}

function _betaPanelCx(p) { return (p.x + p.w / 2) * _betaSc(); }
function _betaPanelCy(p) { return (p.y + p.h / 2) * _betaSc(); }

let _betaZidSeq = 0;
function _betaZid() { return 'z' + (++_betaZidSeq); }

// ─ 면적 입력 & 모드 전환 ─

function betaApplyArea() {
  const w = Math.round((parseFloat(document.getElementById('betaW').value) || 0) * 1000);
  const h = Math.round((parseFloat(document.getElementById('betaH').value) || 0) * 1000);
  if (w < 500 || h < 500) { _toast('최소 0.5m × 0.5m 이상 입력해주세요.'); return; }
  State.betaAreaW = w;
  State.betaAreaH = h;
  const gW = _betaGW(); const gH = _betaGH();
  State.betaZones = State.betaZones.filter(z => z.startRow < gH && z.startCol < gW);
  State.betaZones.forEach(z => {
    if (z.startRow + z.rows > gH) { z.rows = gH - z.startRow; }
    if (z.startCol + z.cols > gW) { z.cols = gW - z.startCol; }
  });
  State._betaCache = null;
  betaRender();
  saveState();
}

function betaSetMode(m) {
  if (m === 'lan' && State.betaZones.length === 0) { _toast('먼저 구역을 1개 이상 설정해주세요.'); return; }
  if (m === 'lan') { State._betaCache = null; _betaAllPanels(); }
  State.betaMode = m;
  betaRender();
}

function betaRender() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  if (State.betaAreaW) { document.getElementById('betaW').value = State.betaAreaW / 1000; }
  if (State.betaAreaH) { document.getElementById('betaH').value = State.betaAreaH / 1000; }
  document.getElementById('betaModeEdit').classList.toggle('on', State.betaMode === 'edit');
  document.getElementById('betaModeLan').classList.toggle('on',  State.betaMode === 'lan');

  if (!State.betaAreaW || !State.betaAreaH) {
    cv.style.display = 'none';
    document.getElementById('betaZoneList').innerHTML = '<div class="beta-empty-hint">설치 면적을 입력 후 [적용]을 누르세요.</div>';
    document.getElementById('betaLanUI').style.display = 'none';
    document.getElementById('betaZoneCfg').style.display = 'none';
    return;
  }

  cv.style.display = 'block';
  const sc = _betaSc();
  cv.width  = Math.round(State.betaAreaW * sc);
  cv.height = Math.round(State.betaAreaH * sc);

  if (State.betaMode === 'edit') {
    document.getElementById('betaLanUI').style.display = 'none';
    document.getElementById('betaZoneList').style.display = '';
    betaAttachEditEv();
    betaDrawEdit();
    betaRenderZoneList();
  } else {
    document.getElementById('betaZoneList').style.display = 'none';
    document.getElementById('betaZoneCfg').style.display = 'none';
    document.getElementById('betaLanUI').style.display = '';
    betaAttachLanEv();
    betaDrawLan();
    betaRenderLanUI();
  }
}

// ─ 편집 캔버스 ─

function betaDrawEdit() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = _betaSc();
  const gW  = _betaGW(); const gH = _betaGH();
  ctx.clearRect(0, 0, cv.width, cv.height);

  // pass1: 격자
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c * 500 * sc, 0); ctx.lineTo(c * 500 * sc, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * 500 * sc); ctx.lineTo(cv.width, r * 500 * sc); ctx.stroke();
  }

  // pass2: Zone 채우기 + 패널 경계
  State.betaZones.forEach((zone, zi) => {
    const ci  = zi % BETA_ZONE_BG.length;
    const zx  = zone.startCol * 500 * sc; const zy = zone.startRow * 500 * sc;
    const zw  = zone.cols * 500 * sc; const zh = zone.rows * 500 * sc;
    ctx.fillStyle = BETA_ZONE_BG[ci];
    ctx.fillRect(zx, zy, zw, zh);
    // 패널 경계
    const spanC = zone.panelW / 500; const spanR = zone.panelH / 500;
    const fullC = Math.floor(zone.cols / spanC); const fullR = Math.floor(zone.rows / spanR);
    ctx.strokeStyle = BETA_ZONE_LINE[ci]; ctx.lineWidth = 1.2;
    for (let pr = 0; pr < fullR; pr++) {
      for (let pc = 0; pc < fullC; pc++) {
        ctx.strokeRect(
          (zone.startCol + pc * spanC) * 500 * sc + 0.6,
          (zone.startRow + pr * spanR) * 500 * sc + 0.6,
          zone.panelW * sc - 1.2, zone.panelH * sc - 1.2
        );
      }
    }
    // Zone 외곽선
    ctx.strokeStyle = BETA_ZONE_LINE[ci]; ctx.lineWidth = 2;
    ctx.strokeRect(zx + 1, zy + 1, zw - 2, zh - 2);
    // Zone 정보 텍스트
    const fs = Math.max(9, Math.min(14, 500 * sc * 0.22));
    ctx.font = `700 ${fs}px sans-serif`;
    ctx.fillStyle = BETA_ZONE_LINE[ci];
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${zone.led} / ${zone.panelW}×${zone.panelH}mm`, zx + zw / 2, zy + zh / 2);
    ctx.textBaseline = 'alphabetic';
  });

  // pass3: 드래그 선택 미리보기
  if (State._betaDragSt && State._betaDragCur) {
    const r0 = Math.min(State._betaDragSt.r, State._betaDragCur.r);
    const c0 = Math.min(State._betaDragSt.c, State._betaDragCur.c);
    const r1 = Math.max(State._betaDragSt.r, State._betaDragCur.r);
    const c1 = Math.max(State._betaDragSt.c, State._betaDragCur.c);
    const sx = c0 * 500 * sc; const sy = r0 * 500 * sc;
    const sw = (c1 - c0 + 1) * 500 * sc; const sh = (r1 - r0 + 1) * 500 * sc;
    ctx.fillStyle = 'rgba(79,140,255,0.22)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#4F8CFF'; ctx.lineWidth = 2;
    ctx.strokeRect(sx + 1, sy + 1, sw - 2, sh - 2);
    const wm = ((c1 - c0 + 1) * 0.5).toFixed(1).replace(/\.0$/, '');
    const hm = ((r1 - r0 + 1) * 0.5).toFixed(1).replace(/\.0$/, '');
    const fs2 = Math.max(11, Math.min(16, sw * 0.18));
    ctx.font = `700 ${fs2}px sans-serif`;
    ctx.fillStyle = '#1a4fcc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${wm}m × ${hm}m`, sx + sw / 2, sy + sh / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // pass4: 팝업 대기 구역
  if (State._betaSelNew) {
    const { startR, startC, rows, cols } = State._betaSelNew;
    const sx = startC * 500 * sc; const sy = startR * 500 * sc;
    const sw = cols * 500 * sc; const sh = rows * 500 * sc;
    ctx.fillStyle = 'rgba(40,200,80,0.18)';
    ctx.fillRect(sx, sy, sw, sh);
    ctx.strokeStyle = '#28C850'; ctx.lineWidth = 2.5;
    ctx.strokeRect(sx + 1, sy + 1, sw - 2, sh - 2);
  }
}

// ─ 구역 목록 & 해상도 ─

function _betaCalcResolution() {
  if (!State.betaAreaW || !State.betaAreaH || !State.betaZones.length) { return null; }
  const gW = _betaGW(), gH = _betaGH();
  let totalW = 0, totalH = 0;
  for (let c = 0; c < gW; c++) {
    let maxPx = 0;
    State.betaZones.forEach(z => {
      if (c >= z.startCol && c < z.startCol + z.cols) { maxPx = Math.max(maxPx, SPECS[z.led].px500.w); }
    });
    totalW += maxPx;
  }
  for (let r = 0; r < gH; r++) {
    let maxPx = 0;
    State.betaZones.forEach(z => {
      if (r >= z.startRow && r < z.startRow + z.rows) { maxPx = Math.max(maxPx, SPECS[z.led].px500.h); }
    });
    totalH += maxPx;
  }
  if (totalW === 0 || totalH === 0) { return null; }
  const s = Math.max(totalW / State.betaAreaW, totalH / State.betaAreaH);
  return { w: Math.round(State.betaAreaW * s), h: Math.round(State.betaAreaH * s) };
}

async function betaSaveGuideImage() {
  const res = _betaCalcResolution();
  if (!res) { return; }
  const cv = document.createElement('canvas');
  cv.width = res.w; cv.height = res.h;
  const ctx = cv.getContext('2d');
  const sX = res.w / State.betaAreaW;
  const sY = res.h / State.betaAreaH;
  const gW = _betaGW(), gH = _betaGH();
  const gridLW = Math.max(1, Math.round(res.w / 700));

  // ── Layer 1: 빈 영역 배경 + 500mm 격자 ──
  ctx.fillStyle = '#f0f0f0'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c*500*sX, 0); ctx.lineTo(c*500*sX, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r*500*sY); ctx.lineTo(cv.width, r*500*sY); ctx.stroke();
  }

  // ── 전체 캔버스 기준 워터마크 파라미터 (구역 경계에서 연속되도록) ──
  const wmText = '3Y ENTERTAINMENT';
  const fSizeWm = Math.round(Math.max(24, res.w * 0.022));
  ctx.font = `600 ${fSizeWm}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  const wmTW = ctx.measureText(wmText).width;
  const stepX = Math.round(wmTW * 1.6);
  const stepY = Math.round(fSizeWm * 5.2);
  const halfD = Math.ceil(Math.hypot(res.w, res.h) / 2) + Math.max(stepX, stepY);

  // ── 로고 로드 ──
  let logoImg = null;
  try { logoImg = await _loadImg('3Y_no_bg.png'); } catch { }

  // ── 구역별 렌더링 ──
  State.betaZones.forEach(zone => {
    const zx = zone.startCol * 500 * sX, zy = zone.startRow * 500 * sY;
    const zw = zone.cols * 500 * sX,     zh = zone.rows * 500 * sY;
    const spanC = zone.panelW / 500, spanR = zone.panelH / 500;
    const fullC = Math.floor(zone.cols / spanC), fullR = Math.floor(zone.rows / spanR);

    ctx.save();
    ctx.beginPath(); ctx.rect(zx, zy, zw, zh); ctx.clip();

    // 어두운 배경 + 비네팅
    ctx.fillStyle = '#141414'; ctx.fillRect(zx, zy, zw, zh);
    const vg = ctx.createRadialGradient(zx+zw/2, zy+zh/2, 0, zx+zw/2, zy+zh/2, Math.hypot(zw,zh)/2);
    vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vg; ctx.fillRect(zx, zy, zw, zh);

    // 사명 워터마크 — 전체 캔버스 중앙 기준으로 타일링 (구역 간 패턴 연속)
    ctx.save();
    ctx.font = `600 ${fSizeWm}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.fillStyle = 'rgba(255,255,255,0.28)';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.translate(res.w / 2, res.h / 2);
    ctx.rotate(-Math.PI / 6);
    for (let r = -Math.ceil(halfD/stepY); r <= Math.ceil(halfD/stepY)+1; r++) {
      for (let c = -Math.ceil(halfD/stepX); c <= Math.ceil(halfD/stepX)+1; c++) {
        ctx.fillText(wmText, c*stepX, r*stepY);
      }
    }
    ctx.restore();

    // 패널 격자선 (흰색 반투명)
    ctx.strokeStyle = 'rgba(255,255,255,0.60)'; ctx.lineWidth = gridLW;
    for (let pc = 1; pc < fullC; pc++) {
      const x = (zone.startCol + pc*spanC)*500*sX;
      ctx.beginPath(); ctx.moveTo(x, zy); ctx.lineTo(x, zy+zh); ctx.stroke();
    }
    for (let pr = 1; pr < fullR; pr++) {
      const y = (zone.startRow + pr*spanR)*500*sY;
      ctx.beginPath(); ctx.moveTo(zx, y); ctx.lineTo(zx+zw, y); ctx.stroke();
    }

    // 구역 테두리
    ctx.strokeStyle = 'rgba(255,255,255,0.80)'; ctx.lineWidth = gridLW * 2;
    ctx.strokeRect(zx+1, zy+1, zw-2, zh-2);

    // 해상도 텍스트 (구역 중앙, 계산기 탭 워터마크 서식)
    const zResW = zone.cols * SPECS[zone.led].px500.w;
    const zResH = zone.rows * SPECS[zone.led].px500.h;
    const fsRes = Math.round(Math.max(16, Math.min(Math.round(zh * 0.13), 120)) * 0.9);
    ctx.font = `300 ${fsRes}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const wStr = `${zResW}`, sepStr = '  ×  ', hStr = `${zResH}`;
    const wW = ctx.measureText(wStr).width;
    const sepW = ctx.measureText(sepStr).width;
    const hW = ctx.measureText(hStr).width;
    const tx = zx + zw/2 - (wW + sepW + hW) / 2;
    const ty = zy + zh / 2;
    ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, tx, ty);
    ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, tx + wW, ty);
    ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, tx + wW + sepW, ty);
    const lineLen = (wW + sepW + hW) * 1.2;
    const gap = fsRes * 0.72;
    ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = gridLW * 2;
    ctx.beginPath(); ctx.moveTo(zx+zw/2-lineLen/2, ty-gap); ctx.lineTo(zx+zw/2+lineLen/2, ty-gap); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(zx+zw/2-lineLen/2, ty+gap); ctx.lineTo(zx+zw/2+lineLen/2, ty+gap); ctx.stroke();

    // 로고 (구역 좌상단, 계산기 탭과 동일 비율)
    if (logoImg) {
      const logoW = Math.round(1.84 * zone.panelW * sX);
      const logoH = Math.round(logoW * logoImg.height / logoImg.width);
      const margin = Math.round(res.w * 0.01);
      ctx.save(); ctx.globalAlpha = 0.90;
      ctx.drawImage(logoImg, zx + margin, zy, logoW, logoH);
      ctx.restore();
    }

    ctx.restore(); // clip 해제
    ctx.textBaseline = 'alphabetic';
  });

  const url = cv.toDataURL('image/png');
  const a = document.createElement('a'); a.href = url;
  a.download = `guide_${res.w}x${res.h}.png`; a.click();
}

function betaRenderZoneList() {
  const el = document.getElementById('betaZoneList');
  if (!el) { return; }
  if (State.betaZones.length === 0) {
    el.innerHTML = '<div class="beta-empty-hint">캔버스를 드래그해서 구역을 추가하세요.</div>';
    return;
  }
  const wm = mm => (mm / 1000).toFixed(1).replace(/\.0$/, '') + 'm';
  const res = _betaCalcResolution();
  const resHtml = res
    ? `<div class="beta-res-bar">
        최종 해상도&nbsp; <strong>${res.w} × ${res.h} px</strong>
        <button class="beta-guide-btn" onclick="betaSaveGuideImage()">가이드 이미지 저장</button>
       </div>`
    : '';
  el.innerHTML = State.betaZones.map((z, i) => {
    const col = BETA_ZONE_LINE[i % BETA_ZONE_LINE.length];
    return `<div class="beta-zone-card" style="border-left:4px solid ${col}">
      <span class="beta-zone-tag" style="color:${col}">구역 ${i + 1}</span>
      <span class="beta-zone-info">${wm(z.cols * 500)} × ${wm(z.rows * 500)} | ${z.cols * SPECS[z.led].px500.w} × ${z.rows * SPECS[z.led].px500.h}px | ${z.led} | ${z.panelW}×${z.panelH}mm</span>
      <button class="beta-zone-edit-btn" onclick="betaEditZone('${z.id}')">편집</button>
      <button class="beta-zone-del-btn" onclick="betaDeleteZone('${z.id}')">삭제</button>
    </div>`;
  }).join('') + resHtml;
}

function betaDeleteZone(id) {
  const zone = State.betaZones.find(z => z.id === id);
  if (zone) {
    const keys = new Set(betaPanels(zone).map(p => p.key));
    State.betaPorts.forEach(s => keys.forEach(k => s.delete(k)));
    State.betaPH2.forEach(arr => {
      for (let i = arr.length - 1; i >= 0; i--) { if (keys.has(arr[i])) { arr.splice(i, 1); } }
    });
  }
  State.betaZones = State.betaZones.filter(z => z.id !== id);
  State._betaCache = null;
  betaRender();
  saveState();
}

function betaEditZone(id) {
  const zone = State.betaZones.find(z => z.id === id);
  if (!zone) { return; }
  State._betaSelEdit = id;
  State._betaSelNew  = { startR: zone.startRow, startC: zone.startCol, rows: zone.rows, cols: zone.cols };
  betaShowCfgPanel();
  betaDrawEdit();
}

// ─ 구역 설정 팝업 ─

function betaShowCfgPanel() {
  const el = document.getElementById('betaZoneCfg');
  if (!el || !State._betaSelNew) { return; }
  const ev = State._betaSelEdit ? State.betaZones.find(z => z.id === State._betaSelEdit) : null;
  const curLed = ev ? ev.led : '3mm';
  const curPW  = ev ? ev.panelW : 500;
  const curPH  = ev ? ev.panelH : 500;
  const leds = ['2mm', '3mm', '4mm'];
  const panelOpts = [
    { w: 500,  h: 500,  label: '500×500mm' },
    { w: 500,  h: 1000, label: '500×1000mm (세로)' },
    { w: 1000, h: 500,  label: '1000×500mm (가로)' },
  ];
  el.style.display = '';
  el.innerHTML = `<div class="beta-cfg-title">구역 설정</div>
    <div class="beta-cfg-row">
      <span class="beta-cfg-label">LED 피치</span>
      <div class="beta-cfg-chips" id="betaCfgLed">${
        leds.map(v => `<button class="beta-cfg-chip${v === curLed ? ' on' : ''}" onclick="_betaCfgSelLed(this,'${v}')">${v}</button>`).join('')
      }</div>
    </div>
    <div class="beta-cfg-row">
      <span class="beta-cfg-label">패널 사이즈</span>
      <div class="beta-cfg-chips" id="betaCfgPanel">${
        panelOpts.map(p => `<button class="beta-cfg-chip${p.w === curPW && p.h === curPH ? ' on' : ''}" data-w="${p.w}" data-h="${p.h}" onclick="_betaCfgSelPanel(this)">${p.label}</button>`).join('')
      }</div>
    </div>
    <div class="beta-cfg-actions">
      <button class="beta-cfg-ok" onclick="betaCfgApply()">적용</button>
      <button class="beta-cfg-cancel" onclick="betaCfgCancel()">취소</button>
    </div>`;
}

function _betaCfgSelLed(btn) {
  btn.closest('.beta-cfg-chips').querySelectorAll('.beta-cfg-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

function _betaCfgSelPanel(btn) {
  btn.closest('.beta-cfg-chips').querySelectorAll('.beta-cfg-chip').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
}

function betaCfgApply() {
  if (!State._betaSelNew) { return; }
  const ledBtn   = document.querySelector('#betaCfgLed .beta-cfg-chip.on');
  const panelBtn = document.querySelector('#betaCfgPanel .beta-cfg-chip.on');
  const led = ledBtn ? ledBtn.textContent : '3mm';
  const pw  = panelBtn ? parseInt(panelBtn.dataset.w) : 500;
  const ph  = panelBtn ? parseInt(panelBtn.dataset.h) : 500;
  const { startR, startC, rows, cols } = State._betaSelNew;

  if (State._betaSelEdit) {
    if (_betaOverlaps(startR, startC, rows, cols, State._betaSelEdit)) { _toast('다른 구역과 겹칩니다.'); return; }
    const zone = State.betaZones.find(z => z.id === State._betaSelEdit);
    if (zone) {
      const oldKeys = new Set(betaPanels(zone).map(p => p.key));
      State.betaPorts.forEach(s => oldKeys.forEach(k => s.delete(k)));
      State.betaPH2.forEach(arr => {
        for (let i = arr.length - 1; i >= 0; i--) { if (oldKeys.has(arr[i])) { arr.splice(i, 1); } }
      });
      Object.assign(zone, { startRow: startR, startCol: startC, rows, cols, led, panelW: pw, panelH: ph });
    }
  } else {
    if (_betaOverlaps(startR, startC, rows, cols, null)) { _toast('다른 구역과 겹칩니다.'); return; }
    State.betaZones.push({ id: _betaZid(), startRow: startR, startCol: startC, rows, cols, led, panelW: pw, panelH: ph });
  }

  State._betaSelNew  = null;
  State._betaSelEdit = null;
  State._betaCache   = null;
  document.getElementById('betaZoneCfg').style.display = 'none';
  betaRender();
  saveState();
}

function betaCfgCancel() {
  State._betaSelNew  = null;
  State._betaSelEdit = null;
  document.getElementById('betaZoneCfg').style.display = 'none';
  betaDrawEdit();
}

// ─ 편집 모드 이벤트 ─

function betaAttachEditEv() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  if (cv._betaEvMode === 'edit') { return; }
  if (cv._betaAbort) { cv._betaAbort.abort(); }
  const ctrl = new AbortController();
  cv._betaAbort  = ctrl;
  cv._betaEvMode = 'edit';
  const ncv = cv;

  let wasDrag = false;

  // BCR 기반으로 CSS 스케일링 보정 → mm 좌표 반환
  function pos(e) {
    const bcr = ncv.getBoundingClientRect();
    const scX = State.betaAreaW / (bcr.width  || State.betaAreaW);
    const scY = State.betaAreaH / (bcr.height || State.betaAreaH);
    if (e.touches) {
      return { x: (e.touches[0].clientX - bcr.left) * scX, y: (e.touches[0].clientY - bcr.top) * scY };
    }
    return { x: (e.clientX - bcr.left) * scX, y: (e.clientY - bcr.top) * scY };
  }

  function onStart(e) {
    e.preventDefault();
    const { x, y } = pos(e);
    const cell = _betaCellAt(x, y);
    if (!cell) { return; }
    wasDrag = false;
    State._betaDragSt  = cell;
    State._betaDragCur = cell;
  }

  function onMove(e) {
    e.preventDefault();
    if (!State._betaDragSt) { return; }
    const { x, y } = pos(e);
    const cell = _betaCellAt(x, y);
    if (!cell) { return; }
    const prev = State._betaDragCur;
    if (!prev || prev.r !== cell.r || prev.c !== cell.c) {
      State._betaDragCur = cell;
      wasDrag = true;
      betaDrawEdit();
    }
  }

  function onEnd(e) {
    e.preventDefault();
    if (!State._betaDragSt) { return; }
    const r0 = Math.min(State._betaDragSt.r, State._betaDragCur.r);
    const c0 = Math.min(State._betaDragSt.c, State._betaDragCur.c);
    const r1 = Math.max(State._betaDragSt.r, State._betaDragCur.r);
    const c1 = Math.max(State._betaDragSt.c, State._betaDragCur.c);
    const startR = r0; const startC = c0;
    const rows = r1 - r0 + 1; const cols = c1 - c0 + 1;
    const drag = wasDrag;
    State._betaDragSt = null; State._betaDragCur = null; wasDrag = false;

    if (!drag) {
      // 단순 탭 → 기존 구역 편집
      const zone = _betaZoneAt(r0, c0);
      if (zone) { betaEditZone(zone.id); return; }
      betaDrawEdit();
      return;
    }
    State._betaSelNew  = { startR, startC, rows, cols };
    State._betaSelEdit = null;
    betaDrawEdit();
    betaShowCfgPanel();
  }

  const sig = { signal: ctrl.signal, passive: false };
  ncv.addEventListener('mousedown',  onStart, sig);
  ncv.addEventListener('mousemove',  onMove,  sig);
  ncv.addEventListener('mouseup',    onEnd,   sig);
  ncv.addEventListener('touchstart', onStart, sig);
  ncv.addEventListener('touchmove',  onMove,  sig);
  ncv.addEventListener('touchend',   onEnd,   sig);
}

// ─ LAN 캔버스 ─

function betaDrawLan() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = _betaSc();
  const panels = _betaAllPanels();
  const curPi  = State.betaAPort;
  ctx.clearRect(0, 0, cv.width, cv.height);

  // 격자 배경
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(0, 0, cv.width, cv.height);
  const gW = _betaGW(); const gH = _betaGH();
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c * 500 * sc, 0); ctx.lineTo(c * 500 * sc, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * 500 * sc); ctx.lineTo(cv.width, r * 500 * sc); ctx.stroke();
  }

  // 배선 순서 번호 맵
  const stepOf = new Map();
  State.betaPorts.forEach((s, pi) => {
    State.betaPH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // ── pass 1: 셀 배경·테두리·패턴 ────────────────────────────
  panels.forEach(p => {
    const pi = _betaOwner(p.key);
    const px = p.x * sc; const py = p.y * sc;
    const pw = p.w * sc; const ph = p.h * sc;
    const lk  = pi >= 0 && pi !== curPi;
    const hov = State._betaLanDrag && State._betaLanDHov === p.key && pi < 0;

    ctx.fillStyle = pi >= 0
      ? portColor(pi) + (lk ? '55' : '99')
      : '#9FE1CB';
    ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);

    if (hov) {
      ctx.fillStyle = portColor(curPi) + '44';
      ctx.fillRect(px + 1, py + 1, pw - 2, ph - 2);
    }

    ctx.strokeStyle = pi >= 0 ? portColor(pi) : '#1D9E75';
    ctx.lineWidth   = pi >= 0 ? 1.5 : 0.5;
    ctx.strokeRect(px + 1, py + 1, pw - 2, ph - 2);

    // 다른 포트 → 어두운 빗금
    if (lk) {
      ctx.save();
      ctx.beginPath(); ctx.rect(px + 1, py + 1, pw - 2, ph - 2); ctx.clip();
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1;
      for (let d = -ph; d < pw + ph; d += 6) {
        ctx.beginPath(); ctx.moveTo(px + d, py + 1); ctx.lineTo(px + d + ph, py + ph); ctx.stroke();
      }
      ctx.restore();
    }

    // 마지막 탭 셀 하이라이트
    if (!State._betaLanDrag && State._betaFCell === p.key) {
      ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
    }
  });

  // ── pass 2: 포트 배선 경로 — 다각선 + 끝 화살촉 ───────────
  State.betaPorts.forEach((s, pi) => {
    const h = State.betaPH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const p = panels.find(x => x.key === k);
      return p ? { x: _betaPanelCx(p), y: _betaPanelCy(p) } : null;
    }).filter(Boolean);
    if (pts.length < 2) { return; }

    const pL0 = pts[pts.length - 2]; const pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x; const ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };

    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) { return; }
      const ux = ldx / len; const uy = ldy / len;
      const hw = 6; const hl = 12; const nx = -uy; const ny = ux;
      const bx = pL1.x - ux * 5; const by = pL1.y - uy * 5;
      ctx.beginPath(); ctx.moveTo(bx, by);
      ctx.lineTo(bx - ux * hl + nx * hw, by - uy * hl + ny * hw);
      ctx.lineTo(bx - ux * hl - nx * hw, by - uy * hl - ny * hw);
      ctx.closePath(); ctx.fillStyle = style; ctx.fill();
    };

    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    strokePath('rgba(255,255,255,0.85)', 6);
    strokePath(col, 3.5);
    fillArrow('rgba(255,255,255,0.85)');
    fillArrow(col);
    ctx.restore();
  });

  // ── pass 3: 순서 번호 & 포트 레이블 ────────────────────────
  panels.forEach(p => {
    const pi = _betaOwner(p.key);
    if (pi < 0) { return; }
    const px = p.x * sc; const py = p.y * sc;
    const pw = p.w * sc; const ph = p.h * sc;
    const lk  = pi !== curPi;
    const cx2 = px + pw / 2; const cy2 = py + ph / 2;
    const step = stepOf.get(p.key);

    if (step) {
      const fs = Math.max(6, Math.min(12, pw - 8));
      const r  = Math.max(8, fs * 0.72);
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.font = `700 ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(pi);
      ctx.fillText(String(step), cx2, cy2);
    }

    if (pw >= 20) {
      const label = 'P' + (pi + 1);
      ctx.font = '700 9px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(label, px + 4, py + 4);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
      ctx.fillText(label, px + 4, py + 4);
    }
    ctx.textBaseline = 'alphabetic';
  });
}

// ─ LAN UI ─

function betaExportToCalc() {
  if (!State.betaZones.length) { _toast('내보낼 구역이 없습니다.'); return; }
  State._betaCache = null;
  const allPanels = _betaAllPanels();

  // 지배적 LED·패널 크기 (면적 기준)
  const ledArea = {}, panelArea = {};
  for (const z of State.betaZones) {
    const a = z.rows * z.cols;
    ledArea[z.led] = (ledArea[z.led] || 0) + a;
    const pk = `${z.panelW}:${z.panelH}`;
    panelArea[pk] = (panelArea[pk] || 0) + a;
  }
  const domLed = Object.entries(ledArea).sort((a, b) => b[1] - a[1])[0][0];
  const [domPW, domPH] = Object.entries(panelArea).sort((a, b) => b[1] - a[1])[0][0].split(':').map(Number);
  const domRotated = domPW === 1000;
  const domBasePH  = (domPH === 1000 || domRotated) ? 1000 : 500;

  // 직사각형 여부 (전체 격자를 빈틈없이 덮는지)
  const gW = _betaGW(), gH = _betaGH();
  const covered = new Set(); let isRect = true;
  for (const z of State.betaZones) {
    for (let r = z.startRow; r < z.startRow + z.rows && isRect; r++) {
      for (let c = z.startCol; c < z.startCol + z.cols; c++) {
        const k = `${r},${c}`; if (covered.has(k)) { isRect = false; break; } covered.add(k);
      }
    }
  }
  isRect = isRect && covered.size === gW * gH;

  // 계산기 탭 기본 상태 (LED·패널 칩 설정, iW/iH 입력)
  const usedLeds = Object.keys(ledArea);
  State.areaMode = 'single';
  document.getElementById('modeBtn-single').classList.add('on');
  document.getElementById('modeBtn-multi').classList.remove('on');
  document.getElementById('area-single').style.display = '';
  document.getElementById('area-multi').style.display = 'none';
  document.getElementById('iW').value = (State.betaAreaW / 1000).toFixed(1);
  document.getElementById('iH').value = (State.betaAreaH / 1000).toFixed(1);
  document.querySelectorAll('#ledChips .chip').forEach(el => el.classList.remove('on'));
  usedLeds.forEach(led => {
    const el = document.querySelector(`#ledChips .chip[data-v="${led}"]`);
    if (el) { el.classList.add('on'); }
  });
  State.curLed = domLed;
  document.querySelectorAll('#panelChips .chip').forEach(el => el.classList.remove('on'));
  // 사용된 모든 패널 크기 칩 활성화 (혼합 레이아웃 시 500·1000 모두 표시)
  const usedPanelSizes = new Set(State.betaZones.map(z => (z.panelH === 1000 || z.panelW === 1000) ? 1000 : 500));
  usedPanelSizes.forEach(size => {
    const el = document.querySelector(`#panelChips .chip[data-v="${size}"]`);
    if (el) { el.classList.add('on'); }
  });
  State.basePH = domBasePH;
  State.panelRotated = domRotated;
  const rotBtn = document.getElementById('panelRotateBtn');
  if (rotBtn) { rotBtn.classList.toggle('on', domRotated); }

  // 해상도 계산 (지배적 LED·패널 기준)
  const calcCols = Math.round(State.betaAreaW / domPW);
  const calcRows = Math.round(State.betaAreaH / domPH);
  const sp = SPECS[domLed];
  const panelPxW = domRotated ? sp.px1000.h : (domBasePH === 1000 ? sp.px500.w : sp.px500.w);
  const panelPxH = domRotated ? sp.px1000.w : (domBasePH === 1000 ? sp.px1000.h : sp.px500.h);

  // betaImport 구성 — allPanels 스냅샷 포함 (LAN 렌더링용)
  const importData = {
    isRect, totalPanels: allPanels.length,
    cols: calcCols, rows: calcRows,
    tW: calcCols * panelPxW, tH: calcRows * panelPxH,
    usedLeds,
    areaW: State.betaAreaW, areaH: State.betaAreaH,
    allPanels: allPanels.map(p => ({ ...p })),
    zones: State.betaZones.map(z => ({ id: z.id, startRow: z.startRow, startCol: z.startCol, rows: z.rows, cols: z.cols, led: z.led, panelW: z.panelW, panelH: z.panelH })),
  };

  // LAN 배선: beta 패널 키 그대로 유지 (변환 없음)
  const maxUsedPort = State.betaPorts.reduce((mx, s, i) => s.size > 0 ? i : mx, -1) + 1;
  const needExpand  = maxUsedPort > 8;
  const lanN = needExpand ? 16 : 8;
  const newPA  = Array.from({ length: lanN }, () => new Set());
  const newPH2 = Array.from({ length: lanN }, () => []);
  for (let pi = 0; pi < Math.min(16, lanN); pi++) {
    if (pi >= State.betaPorts.length) { break; }
    State.betaPH2[pi].forEach(k => {
      if (State.betaPorts[pi].has(k)) { newPA[pi].add(k); newPH2[pi].push(k); }
    });
  }

  // PWR 자동 배선 (구역별 2열당 1포트 스네이크, 데드존 제외)
  const tmpPwrPA  = Array.from({ length: PWR_PORT_COUNT }, () => new Set());
  const tmpPwrPH2 = Array.from({ length: PWR_PORT_COUNT }, () => []);
  const _pCellW = State.betaAreaW / calcCols, _pCellH = State.betaAreaH / calcRows;
  const _pa = (pi, k) => { tmpPwrPA[pi].add(k); tmpPwrPH2[pi].push(k); };
  let pwrPi = 0;
  const _zoneList = State.betaZones && State.betaZones.length ? State.betaZones : [null];
  _zoneList.forEach(z => {
    if (pwrPi >= PWR_PORT_COUNT) { return; }
    const panels = z ? allPanels.filter(p => p.zoneId === z.id) : allPanels;
    const zCells = new Set();
    panels.forEach(p => {
      const ci0 = Math.round(p.x / _pCellW), ri0 = Math.round(p.y / _pCellH);
      const ci1 = Math.round((p.x + p.w) / _pCellW), ri1 = Math.round((p.y + p.h) / _pCellH);
      for (let ri = ri0; ri < ri1; ri++) { for (let ci = ci0; ci < ci1; ci++) { zCells.add(`${ri},${ci}`); } }
    });
    if (!zCells.size) { return; }
    const colList = [...new Set([...zCells].map(k => +k.split(',')[1]))].sort((a, b) => a - b);
    for (let i = 0; i < colList.length && pwrPi < tmpPwrPA.length; i += 2) {
      const c0 = colList[i], c1 = i + 1 < colList.length ? colList[i + 1] : null;
      for (let ri = calcRows - 1; ri >= 0; ri--) { if (zCells.has(`${ri},${c0}`)) { _pa(pwrPi, `${ri},${c0}`); } }
      if (c1 !== null) { for (let ri = 0; ri < calcRows; ri++) { if (zCells.has(`${ri},${c1}`)) { _pa(pwrPi, `${ri},${c1}`); } } }
      pwrPi++;
    }
  });

  // 탭 전환 후 calc() 호출 → simArea HTML 완전 초기화 (Issue 1 수정)
  swTab('calc', document.querySelector(".tab-btn[onclick*=\"'calc'\"]"));
  calc();

  // calc()가 betaImport=null로 만들었으므로 복원, LAN 배선도 복원
  State.betaImport  = importData;
  State.lanExpanded = needExpand;
  State.pA          = newPA;
  State.pH2         = newPH2;
  State.aPort       = 0; State.fCell = null; State.drag = false; State.dStk = []; State.dHov = null;
  State.simTab      = 'lan';
  State._savedLan   = null;
  State._savedPwr   = { pA: tmpPwrPA.map(s => new Set(s)), pH2: tmpPwrPH2.map(a => [...a]), aPort: 0 };

  // betaImport 기반으로 재렌더
  renderRes();
  buildCv(); renderPorts(); renderLeg(); renderSum();
  saveState();
  _toast('혼합 시뮬 데이터를 계산기에 적용했습니다.');
}

function betaRenderLanUI() {
  const el = document.getElementById('betaLanBtns');
  if (el) {
    el.innerHTML = `<div class="beta-lan-btns-row">
      <button class="beta-lan-btn" onclick="betaAutoAssign()">자동 할당</button>
      <button class="beta-lan-btn danger" onclick="betaRstAllPorts()">전체 배선 초기화</button>
      <button class="beta-lan-btn export" onclick="betaExportToCalc()">계산기로 내보내기</button>
    </div>`;
  }
  betaRenderPorts();
  betaRenderSum();
  betaRenderLeg();
}

function betaRenderPorts() {
  const el = document.getElementById('betaPortRow');
  if (!el) { return; }
  const pi  = State.betaAPort;
  let html  = '<div class="beta-port-strip">';
  for (let i = 0; i < 16; i++) {
    const sz  = State.betaPorts[i].size;
    const on  = i === pi;
    const has = sz > 0;
    const _bc = portColor(i);
    html += `<button class="beta-port-btn${on ? ' sel' : ''}${has ? ' has-data' : ''}"
      style="${on ? `background:${_bc};border-color:${_bc};` : `border-color:${_bc};color:${_bc};`}"
      onclick="State.betaAPort=${i};betaDrawLan();betaRenderPorts()">P${i + 1}</button>`;
  }
  html += '</div>';
  const sz  = State.betaPorts[pi].size;
  const px  = _betaPxOf(pi);
  const pct = Math.min(100, Math.round(px / MAX_PX * 100));
  const ov  = px > MAX_PX;
  const _apc = portColor(pi);
  html += `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
    <span style="font-size:13px;font-weight:500;color:${_apc}">포트 ${pi + 1}</span>
    <span style="font-size:13px;color:#333;">${sz}장 · ${px.toLocaleString()} px</span>
    <span style="font-size:12px;color:${ov ? '#A32D2D' : '#888'}">/ ${MAX_PX.toLocaleString()} (${pct}%)${ov ? ' ⚠ 초과' : ''}</span>
    ${State._betaLanDrag ? `<span class="drag-badge" style="background:${_apc}">드래그 중</span>` : ''}
  </div>
  <div style="height:5px;background:#eee;border-radius:3px;margin-top:6px;">
    <div style="height:5px;width:${pct}%;background:${ov ? '#E24B4A' : _apc};border-radius:3px;"></div>
  </div>
  <div style="margin-top:4px;">
    <button class="beta-rst-port-btn" onclick="betaRstPort(${pi})">포트 ${pi + 1} 초기화</button>
  </div>`;
  el.innerHTML = html;
}

function betaRenderSum() {
  const el = document.getElementById('betaLanSum');
  if (!el) { return; }
  const ports  = State.betaPorts;
  const active = ports.filter(s => s.size > 0).length;
  const l1 = active * 2 + State.betaSpareAdj.l1;
  const sl = ports.reduce((acc, s) => acc + Math.max(0, s.size - 1), 0) + State.betaSpareAdj.sl;
  el.innerHTML = `<div class="beta-sum-row">
    1번 랜: <strong>${l1}개</strong>&nbsp; 숏랜: <strong>${sl}개</strong>
    <span class="beta-spare-label">(예비 포함)</span>
  </div>`;
}

function betaRenderLeg() {
  const el = document.getElementById('betaLeg');
  if (!el) { return; }
  const leds = [...new Set(State.betaZones.map(z => z.led))];
  el.innerHTML = leds.map(led => {
    const sp = SPECS[led];
    return `<span class="beta-leg-item">${led}: ${sp.px500.w}×${sp.px500.h}px/패널</span>`;
  }).join(' ');
}

// ─ 포트 할당 ─

function betaAssign(pi, key) {
  if (State.betaPorts[pi].has(key)) { return; }
  State.betaPorts[pi].add(key);
  State.betaPH2[pi].push(key);
}

function betaDeassign(pi, key) {
  State.betaPorts[pi].delete(key);
  const idx = State.betaPH2[pi].indexOf(key);
  if (idx >= 0) { State.betaPH2[pi].splice(idx, 1); }
}

function betaRstPort(pi) {
  State.betaPorts[pi] = new Set();
  State.betaPH2[pi]   = [];
  betaDrawLan(); betaRenderPorts(); betaRenderSum(); saveState();
}

function betaRstAllPorts() {
  openConfirm('배선 초기화', '모든 포트 배선을 초기화할까요?', () => {
    State.betaPorts = Array.from({ length: 16 }, () => new Set());
    State.betaPH2   = Array.from({ length: 16 }, () => []);
    State.betaAPort = 0;
    betaDrawLan(); betaRenderLanUI(); saveState();
  });
}

function betaReset() {
  if (State.betaMode === 'lan') { betaRstAllPorts(); return; }
  openConfirm('혼합 시뮬 초기화', '구역과 배선을 모두 초기화할까요?', () => {
    State.betaZones    = []; State._betaCache = null;
    State.betaPorts    = Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = Array.from({ length: 16 }, () => []);
    State.betaAPort    = 0;
    State._betaSelNew  = null; State._betaSelEdit = null;
    betaRender(); saveState();
  });
}

// ─ 자동 할당 ─

function _betaNextEmpty() {
  for (let i = 0; i < 16; i++) {
    if (State.betaPorts[i].size === 0) { return i; }
  }
  return State.betaAPort;
}

function _betaAutoAssignZone(zone, portOff) {
  const panels = betaPanels(zone);
  const colMap = new Map();
  for (const p of panels) {
    if (!colMap.has(p.x)) { colMap.set(p.x, []); }
    colMap.get(p.x).push(p);
  }
  const colKeys = [...colMap.keys()].sort((a, b) => a - b);
  const totalCols = colKeys.length;
  if (totalCols === 0) { return 0; }

  // 열당 최대 픽셀 수 → 포트당 최대 열 수 산출
  const maxColPx = Math.max(...colKeys.map(ck =>
    colMap.get(ck).reduce((sum, p) => {
      const sp = SPECS[p.led];
      return sum + Math.round(sp.px500.w / 500 * p.w) * Math.round(sp.px500.h / 500 * p.h);
    }, 0)
  ));
  if (maxColPx === 0) { return 0; }

  const maxRaw  = Math.max(1, Math.floor(MAX_PX / maxColPx));
  const maxEven = maxRaw >= 2 ? (maxRaw % 2 === 0 ? maxRaw : maxRaw - 1) : maxRaw;
  const numPorts = Math.min(16 - portOff, Math.ceil(totalCols / maxEven));
  const takes = _balancedCols(totalCols, numPorts, maxRaw, maxEven);

  let colStart = 0;
  for (let pi = 0; pi < takes.length; pi++) {
    const portIdx = portOff + pi;
    if (portIdx >= 16) { break; }
    for (let ci = 0; ci < takes[pi]; ci++) {
      const col = colMap.get(colKeys[colStart + ci]).slice().sort((a, b) => a.y - b.y);
      // 짝수 ci → 하→상, 홀수 ci → 상→하 (뱀형)
      const ordered = ci % 2 === 0 ? col.slice().reverse() : col;
      for (const p of ordered) { betaAssign(portIdx, p.key); }
    }
    colStart += takes[pi];
  }
  return takes.length;
}

function betaAutoAssign() {
  State.betaPorts  = Array.from({ length: 16 }, () => new Set());
  State.betaPH2    = Array.from({ length: 16 }, () => []);
  State.betaAPort  = 0;
  State._betaFCell = null;
  const sorted = [...State.betaZones].sort((a, b) =>
    a.startRow !== b.startRow ? a.startRow - b.startRow : a.startCol - b.startCol
  );
  let portOff = 0;
  for (const zone of sorted) {
    portOff = Math.min(16, portOff + _betaAutoAssignZone(zone, portOff));
  }
  State.betaAPort = 0;
  betaDrawLan(); betaRenderLanUI(); saveState();
}

// ─ LAN 모드 이벤트 ─

function betaAttachLanEv() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  if (cv._betaEvMode === 'lan') { return; }
  if (cv._betaAbort) { cv._betaAbort.abort(); }
  const ctrl = new AbortController();
  cv._betaAbort  = ctrl;
  cv._betaEvMode = 'lan';
  const ncv = cv;

  let lpT = null;

  // BCR 기반으로 CSS 스케일링 보정 → mm 좌표 반환
  function getXY(e) {
    const bcr = ncv.getBoundingClientRect();
    const scX = State.betaAreaW / (bcr.width  || State.betaAreaW);
    const scY = State.betaAreaH / (bcr.height || State.betaAreaH);
    if (e.touches) {
      return { x: (e.touches[0].clientX - bcr.left) * scX, y: (e.touches[0].clientY - bcr.top) * scY };
    }
    return { x: (e.clientX - bcr.left) * scX, y: (e.clientY - bcr.top) * scY };
  }

  // mouseleave / touchcancel 공통 정리
  function cl() {
    clearTimeout(lpT); lpT = null;
    State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
    betaDrawLan();
  }

  function onDown(e) {
    e.preventDefault();
    const { x, y } = getXY(e);
    const panel = _betaPanelAt(x, y);
    if (!panel) { return; }
    State._betaLanDStk = [];
    State._betaFCell   = panel.key;
    State._betaLanDrag = false;
    lpT = setTimeout(() => {
      const own = _betaOwner(panel.key);
      // 이미 할당된 셀이면 해당 포트로 전환, 비어있으면 다음 빈 포트 자동 선택
      State.betaAPort = own >= 0 ? own : _betaNextEmpty();
      State._betaLanDrag = true;
      State._betaLanDStk = [panel.key];
      State._betaLanDHov = panel.key;
      if (own < 0) {
        betaAssign(State.betaAPort, panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      betaDrawLan(); betaRenderPorts();
    }, e.touches ? LP_TOUCH : LP_MS);
  }

  function onMove(e) {
    e.preventDefault();
    if (!State._betaLanDrag) { return; }
    const { x, y } = getXY(e);
    const panel = _betaPanelAt(x, y);
    State._betaLanDHov = panel ? panel.key : null;
    if (!panel) { betaDrawLan(); return; }
    const stk = State._betaLanDStk;
    // 역방향 → 마지막 해제
    if (stk.length >= 2 && stk[stk.length - 2] === panel.key) {
      const last = stk[stk.length - 1];
      if (State.betaPorts[State.betaAPort].has(last)) {
        betaDeassign(State.betaAPort, last);
        if (navigator.vibrate) { navigator.vibrate(25); }
      }
      stk.pop();
      betaDrawLan(); betaRenderPorts();
      return;
    }
    if (stk[stk.length - 1] !== panel.key) {
      const own = _betaOwner(panel.key);
      if (own >= 0 && own !== State.betaAPort) { betaDrawLan(); return; }
      if (!State.betaPorts[State.betaAPort].has(panel.key)) {
        betaAssign(State.betaAPort, panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      stk.push(panel.key);
      betaDrawLan(); betaRenderPorts();
    }
  }

  function onUp(e) {
    e.preventDefault();
    clearTimeout(lpT); lpT = null;
    if (State._betaLanDrag) {
      State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
      betaDrawLan(); betaRenderPorts(); betaRenderSum(); saveState();
      return;
    }
    // 단순 탭 (changedTouches도 mm 변환)
    const bcr2 = ncv.getBoundingClientRect();
    const scX2 = State.betaAreaW / (bcr2.width  || State.betaAreaW);
    const scY2 = State.betaAreaH / (bcr2.height || State.betaAreaH);
    const pt = e.changedTouches
      ? { x: (e.changedTouches[0].clientX - bcr2.left) * scX2, y: (e.changedTouches[0].clientY - bcr2.top) * scY2 }
      : getXY(e);
    const panel = _betaPanelAt(pt.x, pt.y);
    if (panel) {
      const pi  = State.betaAPort;
      const own = _betaOwner(panel.key);
      if (own === pi) {
        betaDeassign(pi, panel.key);
        if (navigator.vibrate) { navigator.vibrate(25); }
      } else if (own < 0) {
        betaAssign(pi, panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      State._betaFCell = panel.key;
      betaDrawLan(); betaRenderPorts();
    }
    State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
    betaRenderSum(); saveState();
  }

  const sig = { signal: ctrl.signal, passive: false };
  ncv.addEventListener('mousedown',   onDown, sig);
  ncv.addEventListener('mousemove',   onMove, sig);
  ncv.addEventListener('mouseup',     onUp,   sig);
  ncv.addEventListener('mouseleave',  cl,     sig);
  ncv.addEventListener('touchstart',  onDown, sig);
  ncv.addEventListener('touchmove',   onMove, sig);
  ncv.addEventListener('touchend',    onUp,   sig);
  ncv.addEventListener('touchcancel', cl,     { signal: ctrl.signal, passive: true });
}


// ── 초기 실행 ────────────────────────────────────────────
calc();
