// ════════════════════════════════════════════════════════════
//  LED 설치 계산기  v1.0.1
//
//  섹션 구조
//  §1  스펙 데이터 & 상수
//  §2  장비 체크리스트
//  §3  메모 (비워짐)
//  §4  탭 전환
//  §5  콘솔 & 샌딩카드 (비워짐)
//  §6  PNG 저장 · 미리보기 · 공유 (비워짐)
//  §7  확인 다이얼로그 & 전체 초기화
//  §8  저장 / 불러오기 (localStorage)
//  §9  소형 계산기 위젯
//  §10 계산기 핵심 (비워짐)
//  §11 랜선 시뮬레이터 (비워짐)
//  §12 vMix 소스 매크로
//  §13 일정 불러오기
//  §14 LED 설계 탭
// ════════════════════════════════════════════════════════════

//  §10 계산기 핵심 (면적·패널 계산 & 결과 렌더링)
//  §11 랜선 시뮬레이터 (캔버스, 포트 할당, 이벤트)
//  §12 vMix 소스 매크로 (파일 로드, 비율 변환, 다운로드)
// ════════════════════════════════════════════════════════════


// ── §1  스펙 데이터 & 상수 ────────────────────────────────

const APP_VERSION = '2.1.37';
const APP_SW_VERSION = 'v2137';

const CHANGELOG = [
  { v: '2.1.37', items: [
    '자동할당 적용 시 버튼 비활성화 + "자동할당 적용됨" 표시',
  ]},
  { v: '2.1.36', items: [
    '배선 탭 재진입 시 이미 할당된 경우 자동할당 자동 실행 생략',
  ]},
  { v: '2.1.35', items: [
    '랜선↔파워콘 탭 전환 시 스냅샷 크로스페이드 적용',
    '자동 할당 이미 적용 시 안내 토스트 표시',
  ]},
  { v: '2.1.34', items: [
    '모드 전환 스냅샷 크로스페이드 — 빈 격자 노출 제거, 콘텐츠 슬라이드 동시 적용',
  ]},
  { v: '2.1.32', items: [
    '캔버스 격자/오버레이 레이어 분리 — 모드 전환 시 격자 고정·오버레이 페이드',
  ]},
  { v: '2.1.28', items: [
    '설계탭 구역편집↔배선 전환 시 슬라이드 애니메이션 추가',
  ]},
  { v: '2.1.27', items: [
    '구역 드래그 미리보기에 라운드 모서리 적용',
  ]},
  { v: '2.1.26', items: [
    '잔여 500×500 패널을 구역 최상단(행) · 최좌측(열) 우선 배치',
  ]},
  { v: '2.1.25', items: [
    '잔여 500×500 패널을 구역 정보 텍스트 및 패널 집계 표에 반영',
  ]},
  { v: '2.1.24', items: [
    '하나의 구역 내 잔여 공간 500×500 패널 캔버스에 함께 표시',
  ]},
  { v: '2.1.23', items: [
    '구역 모서리 라운드 처리 + 존 라벨 위치 보정',
    '구역 생성 시 패널 크기 불일치 자동 분할 구역 제거 (단일 구역 생성)',
  ]},
  { v: '2.1.22', items: [
    '구역 드래그 미리보기 박스 부드러운 lerp 이동 애니메이션 추가',
  ]},
  { v: '2.1.21', items: [
    '구역 생성 시 캔버스 내 페이드+스케일 애니메이션 추가',
  ]},
  { v: '2.1.20', items: [
    '설치면적 재적용 시에도 캔버스 펼침 애니메이션 적용',
    '설계탭 초기화 시 설치 면적까지 완전 초기화',
  ]},
  { v: '2.1.19', items: [
    '설치면적 적용 시 캔버스 위→아래 펼침 애니메이션 추가',
  ]},
  { v: '2.1.18', items: [
    '탭 전환 슬라이드 애니메이션 추가',
  ]},
  { v: '2.1.17', items: [
    '구역 설정 기본 패널 사이즈를 500×500mm → 500×1000mm(세로)로 변경',
  ]},
  { v: '2.1.16', items: [
    '전체모드 재구현 — DOM 이동 방식 제거, betaFullCanvas 독립 캔버스 팝업 방식으로 변경. 구역 목록·해상도 정보 등 불필요한 정보 미표시, 구역 생성 패널만 표시',
  ]},
  { v: '2.1.15', items: [
    '버그 수정 — 전체모드 복귀 후 구역 드래그 시 캔버스 스케일 불일치로 화면이 흔들리던 문제 수정 (betaDrawEdit를 캔버스 픽셀 폭 기준 sc로 변경)',
  ]},
  { v: '2.1.14', items: [
    'UI 개선 — 편집 모드 격자 셀 최소 55px 보장(_betaScEdit)으로 구역 텍스트 가독성 향상, 폰트 최솟값 9→11px',
  ]},
  { v: '2.1.13', items: [
    '전체모드 개선 — 진입 시 가로 방향 잠금(landscape lock) + 전체화면 전환, 닫을 때 잠금 해제. 회전 완료 후 캔버스 자동 재렌더',
  ]},
  { v: '2.1.12', items: [
    '신규 기능 — LED 설계 탭 구역 편집 전체모드 추가 (가로로 긴 설치면적 모바일 대응, 격자 드래그 + 초기화 지원)',
  ]},
  { v: '2.1.11', items: [
    'UI 수정 — 랜선·파워콘 포트 버튼 크기 통일 (두 자릿수 포트 번호일 때 버튼이 커지던 문제 수정)',
  ]},
  { v: '2.1.10', items: [
    '버그 수정 — §11 제거 시 누락된 _balancedCols 함수 §14로 복원, 랜선 자동할당 오류 수정',
  ]},
  { v: '2.1.9', items: [
    '핵심 버그 수정 — §10 제거 시 누락된 _mkSec() 호출이 State 초기화를 중단시켜 모든 전역 변수가 TDZ 상태로 남던 문제 수정',
  ]},
  { v: '2.1.8', items: [
    '버그 수정 — v2.1.6 §9.5 제거 시 같이 삭제된 _histBack·_programmaticBack·popstate 핸들러 복원',
  ]},
  { v: '2.1.7', items: [
    '버그 수정 — 제거된 calc() 초기 실행 호출 삭제, _schedTarget fallback을 beta로 수정',
  ]},
  { v: '2.1.6', items: [
    '전역 최적화 — doFullReset 제거·tryResetAll을 betaReset으로 교체, _schedTarget 기본값 수정, _schedApplyParsed 제거, §9.5 PDF 뷰어 제거, CSPEC/SSPEC 제거, style.css 고아 선택자 제거',
  ]},
  { v: '2.1.5', items: [
    '§3·§5·§6·§14 데드코드 정리 — 살아있는 함수는 §2·§7·§14로 이동, 빈 섹션은 헤더만 유지 (총 2978줄 제거)',
  ]},
  { v: '2.1.4', items: [
    '§10(계산기 핵심)·§11(랜선 시뮬레이터) 데드코드 2241줄 제거 — 섹션 헤더만 유지, git 히스토리·backup 파일로 복원 가능',
  ]},
  { v: '2.1.3', items: [
    'PNG 저장 모달에서 계산기 탭 제거로 동작 불가한 "계산 결과" 저장 버튼 제거',
  ]},
  { v: '2.1.2', items: [
    '불러오기 수정 — renderMemo가 삭제된 #memoList 요소에 접근해 crash 발생하던 문제 해결 (null 가드 추가)',
  ]},
  { v: '2.1.1', items: [
    '저장/불러오기 수정 — getAppState/loadAppState에서 삭제된 계산기 탭 DOM 참조 제거, 현재 앱 구조(LED 설계 탭)에 맞게 최적화',
  ]},
  { v: '2.1.0', items: [
    '버전 2.1.0 — LED 설계 탭 중심 UI로 전환 완료',
  ]},
  { v: '2.0.106', items: [
    '혼합 시뮬β → LED 설계로 탭명 변경, 탭 순서 가장 왼쪽으로 이동, 계산기 탭 제거(calc-tab-backup.html 백업)',
  ]},
  { v: '2.0.105', items: [
    '업데이트 완료 알람 표시 시간 3.5초→1.75초로 단축, 앱 토스트(_toast)를 전용 appToast 요소로 분리(일정 적용 메시지 오버레이 오동작 수정), 장비 제거 시 확인 팝업 추가',
  ]},
  { v: '2.0.104', items: [
    '혼합 시뮬 배선 UI — 포트 초기화 버튼을 픽셀제한 퍼센트 오른쪽 인라인으로 이동, LED/패널 범례 제거',
  ]},
  { v: '2.0.103', items: [
    '업데이트 알림 디자인 개선 — 하단 배너·토스트 → 앱 중앙 팝업 + 어두운 오버레이',
  ]},
  { v: '2.0.102', items: [
    '혼합 시뮬 일정 기능 이식 — 하단 바 "일정" 버튼 추가, 일정 불러오면 설치면적+단일 구역 자동 생성(기본 500×1000mm), 배선 탭 전환 시 랜선·파워콘 자동할당',
  ]},
  { v: '2.0.101', items: [
    '혼합 시뮬 — 랜선 배선 탭 이름 "랜선 배선"→"배선" 변경, 계산기로 내보내기 버튼 제거',
  ]},
  { v: '2.0.100', items: [
    '혼합 시뮬 파워콘 자동할당 — 2행(numRows=2) 규칙 세분화: 1포트=오→왼(끝 왼쪽), 2포트=양쪽 끝 중앙 수렴, 3+포트=앞ceil(N/2)그룹 왼→오·나머지 오→왼(끝이 안쪽으로 모임)',
  ]},
  { v: '2.0.99', items: [
    '혼합 시뮬 파워콘 자동할당 — 단일 행(numRows=1) 규칙 세분화: 1포트=오→왼(끝 왼쪽), 2포트=양쪽 끝 중앙 수렴, 3+포트=앞ceil(N/2)그룹 왼→오·나머지 오→왼(끝이 안쪽으로 모임)',
  ]},
  { v: '2.0.98', items: [
    '랜선 자동할당 _balancedCols 배분 버그 수정 — base < maxEven 시 ceil 올림으로 마지막 포트 누적 방지 (13열÷7포트=1→2열 균등 분배)',
  ]},
  { v: '2.0.97', items: [
    '파워콘 자동할당 — pxMain 계산 버그 수정: 부동소수점 나눗셈(pitch²) 대신 SPECS 테이블 실제 픽셀 수 사용 (예: 3mm 500×1000mm → 55,556→32,768 보정)',
  ]},
  { v: '2.0.96', items: [
    '파워콘 자동할당 — 3행 이상 구역 colsPerPort 계산 Math.floor→Math.round: 6행 구역도 2열 묶음 가능',
  ]},
  { v: '2.0.95', items: [
    '파워콘 자동할당 — 2행 이하 구역 다중포트: 시작·끝이 모두 가운데 열에서 이루어지도록 뱀형 방향 수정',
    '파워콘 자동할당 — 3행 이상 구역: 전체 패널이 300k 이내이면 포트 수에 무관하게 단일 포트로 처리',
  ]},
  { v: '2.0.94', items: [
    '파워콘 자동할당 — 포트 수 최소화: 2행 이하 구역에서 300k 이내이면 단일 포트 처리',
    '파워콘 자동할당 — 3행 이상 구역: colsPerPort 2열 고정 복구',
  ]},
  { v: '2.0.92', items: [
    '파워콘 자동할당 — 2행 이하 구역: 행 기준 뱀형, 열 기준 좌우 가운데 수렴',
    '파워콘 자동할당 — 3행 이상 구역: 2열씩 묶어 뱀형, 시작·끝 모두 바닥행',
    '파워콘 자동할당 — 구역별 분리, 30만픽셀/최대3열 포트 한도',
  ]},
  { v: '2.0.90', items: [
    '혼합 시뮬 파워콘 배선 그래픽 — 경로선+화살촉+순서번호(LAN과 동일)',
    '혼합 시뮬 파워콘 포트 동적 추가/제거 — + 포트 / − 포트 버튼',
  ]},
  { v: '2.0.89', items: [
    '혼합 시뮬 파워콘 배선 탭 추가 — 18포트, 자동할당(2열씩), 탭 전환(랜선↔파워콘)',
    '혼합 시뮬 샌딩카드 커버 가능 체크 — 660Pro/4K 1대·2대 Hz별 표시',
    '혼합 시뮬 랜선/파워콘 케이블 수량 통합 표시 (예비 조정 포함)',
  ] },
  { v: '2.0.88', items: [
    '혼합 시뮬 가이드 이미지 저장 전 미리보기 팝업 추가',
    '혼합 시뮬 구역 생성 시 500×1000·1000×500 패널 남는 격자 자동 500×500 채움',
    '혼합 시뮬 탭 저장 불러오기 후 즉시 화면 반영',
    '혼합 시뮬 구역 텍스트(z번호·LED·패널사이즈) 흰 글씨 + 검정 아웃라인',
  ] },
  { v: '2.0.87', items: ['패널 집계 표 LED 셀 중앙정렬 수정'] },
  { v: '2.0.86', items: ['혼합 시뮬 구역편집 탭: 최종 해상도 아래 패널 집계 표 추가 — LED×패널사이즈 교차표, 단일 행·열이면 합계 생략'] },
  { v: '2.0.85', items: ['혼합 시뮬 구역 텍스트: LED종류·패널사이즈 정중앙 2줄 중앙정렬'] },
  { v: '2.0.84', items: [
    '혼합 시뮬 구역 선택 연동: 캔버스↔구역 정보란 양방향 선택 하이라이트, 구역 텍스트 검정 2줄(좌상단), 우상단 z번호 표시',
  ] },
  { v: '2.0.83', items: [
    '혼합 시뮬 가이드 이미지: 로고 제거, 주황 바 텍스트 종속 위치(tx 기준 padding 감쌈), 구역 테두리 BETA_ZONE_LINE 고유 형광색 적용',
  ] },
  { v: '2.0.82', items: [
    '혼합 시뮬 가이드 이미지: 워터마크 마름모꼴 간격(격행 skip), 주황 바 두께 zone폭 기준, 로고 crossOrigin 제거(PWA 환경 렌더링 수정)',
  ] },
  { v: '2.0.81', items: [
    '혼합 시뮬 가이드 이미지 개선: 사명 "3Y Ent." 축약·최소 구역 기준 폰트·촘촘한 간격, 해상도 폰트 구역 높이 비례, 주황 바 길이·갭 제한, 로고 구역 좌상단 비율 고정',
  ] },
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

  multiSec:       { left: { cols:0, layout:[], rH:[] }, center: { cols:0, layout:[], rH:[] }, right: { cols:0, layout:[], rH:[] } },
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
  betaSimTab:   'lan',
  betaPorts:    Array.from({ length: 16 }, () => new Set()),
  betaPH2:      Array.from({ length: 16 }, () => []),
  betaAPort:    0,
  betaPwrPorts: Array.from({ length: 18 }, () => new Set()),
  betaPwrPH2:   Array.from({ length: 18 }, () => []),
  betaPwrAPort: 0,
  betaSpareAdj: { l1: 2, sl: 20, c1: 2, sp: 20 },
  _betaDragSt:  null,
  _betaDragCur: null,
  _betaSelNew:  null,
  _betaSelEdit:     null,
  _betaSelectedId:  null,
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
  openConfirm('장비 제거', '장비 목록에서 제거하시겠습니까?', () => {
    const ci = State.COM.indexOf(n), di = State.COND.indexOf(n);
    if (ci >= 0) { State.COM.splice(ci, 1); } else { if (di >= 0) State.COND.splice(di, 1); }
    delete State.chkState[n];
    renderCL(); _saveChkLayout();
  });
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
renderCL();
// beta 탭이 기본 탭이므로 초기 렌더링 및 하단 바 설정
document.addEventListener('DOMContentLoaded', () => { _updateBarForTab('beta'); betaRender(); });



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

// ── §3  메모 ──────────────────────────────────────────────


// ── §4  탭 전환 & 버전 표시 ──────────────────────────────

const _TAB_ORDER = ['beta', 'chk', 'vmix'];

function swTab(id, btn) {
  const prev = document.querySelector('.tab-page.on');
  const next = document.getElementById('tab-' + id);
  if (prev === next) { return; }

  const fromIdx = prev ? _TAB_ORDER.indexOf(prev.id.replace('tab-', '')) : -1;
  const goRight = _TAB_ORDER.indexOf(id) > fromIdx;

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  _updateBarForTab(id);

  if (prev) {
    prev.classList.add(goRight ? 'slide-exit-l' : 'slide-exit-r');
    prev.addEventListener('animationend', () => {
      prev.classList.remove('on', 'slide-exit-l', 'slide-exit-r');
    }, { once: true });
  }

  next.classList.add('on', goRight ? 'slide-enter-r' : 'slide-enter-l');
  if (id === 'beta') { betaRender(); }
  next.addEventListener('animationend', () => {
    next.classList.remove('slide-enter-r', 'slide-enter-l');
  }, { once: true });
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
    btnMain.textContent = '일정';
    btnMain.onclick = () => openSchedModal('beta');
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
      const t  = document.getElementById('updateToast');
      const tc = document.getElementById('updateToastCard');
      if (!t || !tc) { return; }
      tc.textContent = 'v' + APP_VERSION + '으로 업데이트되었습니다';
      t.classList.add('show');
      setTimeout(() => { t.classList.remove('show'); }, 1750);
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


// ── §6  PNG 저장 · 미리보기 · 공유 ───────────────────────

// ── §7  확인 다이얼로그 & 전체 초기화 ────────────────────

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


// 범용 확인 팝업 — title·msg 표시 후 확인 시 onOk() 호출
function openConfirm(title, msg, onOk) {
  const bg = document.getElementById('confirmBg');
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOk').onclick = () => { closeConfirm(); onOk(); };
  // 전체모드 오버레이 활성 시 confirmBg를 그 안으로 이동해야 보임
  const fsEl = document.getElementById('betaFullOverlay');
  if (fsEl && fsEl.style.display !== 'none') { fsEl.appendChild(bg); }
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
  openConfirm('전체 초기화', 'LED 설계 탭의 모든 설정을 초기화할까요?', betaReset);
}

let _programmaticBack = false;
function _histBack() { _programmaticBack = true; history.back(); }

window.addEventListener('popstate', () => {
  if (_programmaticBack) { _programmaticBack = false; return; }
  const _ov = [
    { id: 'chkResetChoiceBg', fn: closeChkResetChoice },
    { id: 'confirmBg',         fn: closeConfirm },
    { id: 'betaFullOverlay',   fn: betaExitFull },
    { id: 'modalBg',           fn: closeModal },
    { id: 'previewBg',         fn: closePreviewModal },
    { id: 'tutorialBg',        fn: closeTutorial },
    { id: 'easterBg',          fn: closeEaster },
    { id: 'saveBg',            fn: closeSaveModal },
    { id: 'vmixSaveBg',        fn: closeVmixSaveModal },
    { id: 'schedBg',           fn: closeSchedModal },
  ];
  for (const { id, fn } of _ov) {
    const el = document.getElementById(id);
    if (el && el.style.display !== 'none') { fn(); return; }
  }
  const calc = document.getElementById('calcPanel');
  if (calc && calc.style.display !== 'none') { calc.style.display = 'none'; }
});


// ── §8  저장 / 불러오기 (localStorage) ───────────────────

// 현재 앱 전체 상태를 직렬화 가능한 객체로 반환
function getAppState(name) {
  return {
    name,
    date: new Date().toLocaleDateString('ko-KR'),
    memoList: [...State.memoList],
    chkState: { ...State.chkState },
    chkNotes: { ...State.chkNotes },
    COM:  [...State.COM],
    COND: [...State.COND],
    betaAreaW:    State.betaAreaW,
    betaAreaH:    State.betaAreaH,
    betaZones:    State.betaZones,
    betaMode:     State.betaMode,
    betaPorts:    State.betaPorts.map(s => [...s]),
    betaPH2:      State.betaPH2.map(a => [...a]),
    betaAPort:    State.betaAPort,
    betaSimTab:   State.betaSimTab,
    betaPwrPorts: State.betaPwrPorts.map(s => [...s]),
    betaPwrPH2:   State.betaPwrPH2.map(a => [...a]),
    betaPwrAPort: State.betaPwrAPort,
    betaSpareAdj: { ...State.betaSpareAdj },
    lanExpanded:  State.lanExpanded,
    betaImport:   State.betaImport || null,
  };
}

// 저장된 상태 객체를 앱에 복원
function loadAppState(st) {
  // 체크리스트 복원
  if (st.COM) { State.COM = [...st.COM]; }
  if (st.COND) { State.COND = [...st.COND]; }
  Object.keys(State.chkState).forEach(k => delete State.chkState[k]);
  Object.keys(State.chkNotes).forEach(k => delete State.chkNotes[k]);
  State.COM.concat(State.COND).forEach(n => { State.chkState[n] = st.chkState?.[n] ?? false; });
  if (st.chkNotes) { Object.assign(State.chkNotes, st.chkNotes); }
  renderCL(); _saveChkLayout();

  State.memoList = st.memoList || [];

  // 혼합 시뮬레이터 β 복원
  State.lanExpanded = !!(st.lanExpanded);
  if (st.betaZones) {
    State.betaAreaW    = st.betaAreaW || 0;
    State.betaAreaH    = st.betaAreaH || 0;
    State.betaZones    = st.betaZones;
    State.betaMode     = st.betaMode || 'edit';
    State.betaPorts    = st.betaPorts ? st.betaPorts.map(a => new Set(a)) : Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = st.betaPH2   ? st.betaPH2.map(a => [...a])       : Array.from({ length: 16 }, () => []);
    State.betaAPort    = st.betaAPort || 0;
    State.betaSimTab   = st.betaSimTab || 'lan';
    State.betaPwrPorts = st.betaPwrPorts ? st.betaPwrPorts.map(a => new Set(a)) : Array.from({ length: 18 }, () => new Set());
    State.betaPwrPH2   = st.betaPwrPH2   ? st.betaPwrPH2.map(a => [...a])       : Array.from({ length: 18 }, () => []);
    State.betaPwrAPort = st.betaPwrAPort || 0;
    State.betaSpareAdj = st.betaSpareAdj ? { l1: 2, sl: 20, c1: 2, sp: 20, ...st.betaSpareAdj } : { l1: 2, sl: 20, c1: 2, sp: 20 };
    State._betaCache   = null;
  }
  State.betaImport = st.betaImport || null;
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
  if (saves[idx]) {
    loadAppState(saves[idx]);
    closeSaveModal();
    if (document.getElementById('tab-beta')?.classList.contains('on')) { betaRender(); }
  }
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

let _toastTimer = null;
function _toast(msg) {
  const t = document.getElementById('appToast');
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

// 편집 캔버스 요소: 전체모드는 betaFullCanvas, 일반은 betaCanvas
function _betaEditCv() {
  return document.getElementById(State._betaFull ? 'betaFullCanvas' : 'betaCanvas');
}

function _betaSc() {
  const cv = _betaEditCv();
  if (!cv) { return 1; }
  const W = (cv.parentElement.clientWidth || 320) - 2;
  return W / (State.betaAreaW || 1);
}

// 편집 모드 전용: 격자 셀 최소 55px 보장 → 텍스트 가독성 확보 (부모 너비 초과 시 가로 스크롤)
function _betaScEdit() {
  return Math.max(_betaSc(), 55 / 500);
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
// 잔여(500×500) 패널은 항상 최상단(remR) · 최좌측(remC) 우선 배치
function betaPanels(zone) {
  const spanC = zone.panelW / 500;
  const spanR = zone.panelH / 500;
  const fullC = Math.floor(zone.cols / spanC);
  const fullR = Math.floor(zone.rows / spanR);
  const remC  = zone.cols % spanC;
  const remR  = zone.rows % spanR;
  const panels = [];

  // 잔여 행 (최상단)
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

  // 전체 패널 (잔여 행 아래부터, 잔여 열 오른쪽부터)
  for (let pr = 0; pr < fullR; pr++) {
    // 잔여 열 (최좌측)
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
    // 전체 크기 패널
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
function _betaPwrOwner(key) {
  return State.betaPwrPorts.findIndex(s => s.has(key));
}

// ── 탭 공통 포트 헬퍼 (lan/pwr 분기) ──
function _betaSimPorts()    { return State.betaSimTab === 'pwr' ? State.betaPwrPorts : State.betaPorts; }
function _betaSimPH2()      { return State.betaSimTab === 'pwr' ? State.betaPwrPH2   : State.betaPH2; }
function _betaSimAPort()    { return State.betaSimTab === 'pwr' ? State.betaPwrAPort : State.betaAPort; }
function _betaSetAPort(i)   { if (State.betaSimTab === 'pwr') { State.betaPwrAPort = i; } else { State.betaAPort = i; } }
function _betaSimOwner(key) { return State.betaSimTab === 'pwr' ? _betaPwrOwner(key) : _betaOwner(key); }
function _betaSimAssign(pi, key) {
  const ports = _betaSimPorts(), ph2 = _betaSimPH2();
  if (ports[pi].has(key)) { return; }
  ports[pi].add(key); ph2[pi].push(key);
}
function _betaSimDeassign(pi, key) {
  const ports = _betaSimPorts(), ph2 = _betaSimPH2();
  ports[pi].delete(key);
  const idx = ph2[pi].indexOf(key); if (idx >= 0) { ph2[pi].splice(idx, 1); }
}
function _betaSimDraw()        { if (State.betaSimTab === 'pwr') { betaDrawPwr(); } else { betaDrawLan(); } }
function _betaSimRenderPorts() { if (State.betaSimTab === 'pwr') { betaRenderPwrPorts(); } else { betaRenderPorts(); } }
function _betaNextSimEmpty()   {
  const ports = _betaSimPorts();
  for (let i = 0; i < ports.length; i++) { if (ports[i].size === 0) { return i; } }
  return _betaSimAPort();
}

function _betaPanelCx(p) { return (p.x + p.w / 2) * _betaCvSc(); }
function _betaPanelCy(p) { return (p.y + p.h / 2) * _betaCvSc(); }

// 캔버스 실제 픽셀 폭 기준 스케일 (betaCanvas 혹은 betaCanvasBg로부터 계산)
function _betaCvSc() {
  const cv = document.getElementById('betaCanvas');
  return cv && State.betaAreaW ? cv.width / State.betaAreaW : _betaScEdit();
}

// betaCanvasBg에 격자만 그림 (탭 전환 시 변경되지 않는 고정 레이어)
function _betaDrawGrid(cv) {
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const gW  = _betaGW(); const gH = _betaGH();
  ctx.fillStyle = '#f0f0f0';
  ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#d0d0d0'; ctx.lineWidth = 0.5;
  for (let c = 0; c <= gW; c++) {
    ctx.beginPath(); ctx.moveTo(c * 500 * sc, 0); ctx.lineTo(c * 500 * sc, cv.height); ctx.stroke();
  }
  for (let r = 0; r <= gH; r++) {
    ctx.beginPath(); ctx.moveTo(0, r * 500 * sc); ctx.lineTo(cv.width, r * 500 * sc); ctx.stroke();
  }
}

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
  const _wrap = document.getElementById('betaCanvasWrap');
  _wrap.classList.remove('cv-reveal');
  void _wrap.offsetWidth;
  _wrap.classList.add('cv-reveal');
  _wrap.addEventListener('animationend', () => _wrap.classList.remove('cv-reveal'), { once: true });
  saveState();
}

function betaSetMode(m) {
  if (m === 'lan' && State.betaZones.length === 0) { _toast('먼저 구역을 1개 이상 설정해주세요.'); return; }
  if (m === State.betaMode) { return; }
  const wasEdit = State.betaMode === 'edit';
  const goRight = m === 'lan';
  const prevEl   = document.getElementById(wasEdit ? 'betaZoneList' : 'betaLanUI');
  const cv       = document.getElementById('betaCanvas');
  const snap     = document.getElementById('betaCanvasSnap');
  const exitCls  = goRight ? 'beta-slide-exit-l'  : 'beta-slide-exit-r';
  const enterCls = goRight ? 'beta-slide-enter-r' : 'beta-slide-enter-l';

  // 현재 오버레이를 스냅샷에 복사 → 빈 격자가 노출되지 않게
  snap.width  = cv.width;
  snap.height = cv.height;
  snap.getContext('2d').drawImage(cv, 0, 0);
  snap.style.display = 'block';
  snap.style.transition = '';
  snap.style.opacity = '1';

  // 콘텐츠 슬라이드 퇴장 시작
  prevEl.classList.add(exitCls);
  prevEl.addEventListener('animationend', () => prevEl.classList.remove(exitCls), { once: true });

  // 즉시 모드 전환 + 재렌더 (스냅샷이 위에 덮여 있으므로 캔버스 깜빡임 없음)
  if (m === 'lan') { State._betaCache = null; _betaAllPanels(); }
  State.betaMode = m;
  betaRender();
  if (m === 'lan' && wasEdit) {
    if (State.betaPorts.every(s => s.size === 0))    { betaAutoAssign(); }
    if (State.betaPwrPorts.every(s => s.size === 0)) { betaAutoAssignPwr(); }
    _betaSimDraw();
  }

  // 콘텐츠 슬라이드 진입
  const nextEl = document.getElementById(m === 'edit' ? 'betaZoneList' : 'betaLanUI');
  nextEl.classList.add(enterCls);
  nextEl.addEventListener('animationend', () => nextEl.classList.remove(enterCls), { once: true });

  // 스냅샷 페이드 아웃 → 새 캔버스 내용이 드러남
  snap.offsetHeight;
  snap.style.transition = 'opacity .28s';
  snap.style.opacity = '0';
  snap.addEventListener('transitionend', () => {
    snap.style.display = 'none';
    snap.style.transition = '';
  }, { once: true });
}

function betaRender() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  if (State.betaAreaW) { document.getElementById('betaW').value = State.betaAreaW / 1000; }
  if (State.betaAreaH) { document.getElementById('betaH').value = State.betaAreaH / 1000; }
  document.getElementById('betaModeEdit').classList.toggle('on', State.betaMode === 'edit');
  document.getElementById('betaModeLan').classList.toggle('on',  State.betaMode === 'lan');

  const cvBg = document.getElementById('betaCanvasBg');
  const fb = document.getElementById('betaFullBtn');
  if (!State.betaAreaW || !State.betaAreaH) {
    cv.style.display = 'none';
    if (cvBg) { cvBg.style.display = 'none'; }
    document.getElementById('betaZoneList').innerHTML = '<div class="beta-empty-hint">설치 면적을 입력 후 [적용]을 누르세요.</div>';
    document.getElementById('betaLanUI').style.display = 'none';
    document.getElementById('betaZoneCfg').style.display = 'none';
    if (fb) { fb.style.display = 'none'; }
    return;
  }

  cv.style.display = 'block';
  const sc = _betaScEdit(); // 두 모드 동일 스케일 — 격자 고정 유지
  cv.width  = Math.round(State.betaAreaW * sc);
  cv.height = Math.round(State.betaAreaH * sc);
  if (cvBg) {
    cvBg.style.display = 'block';
    cvBg.width  = cv.width;
    cvBg.height = cv.height;
    _betaDrawGrid(cvBg);
  }

  if (State.betaMode === 'edit') {
    document.getElementById('betaLanUI').style.display = 'none';
    document.getElementById('betaZoneList').style.display = '';
    if (fb && !State._betaFull) { fb.style.display = ''; }
    betaAttachEditEv();
    betaDrawEdit();
    betaRenderZoneList();
  } else {
    document.getElementById('betaZoneList').style.display = 'none';
    document.getElementById('betaZoneCfg').style.display = 'none';
    document.getElementById('betaLanUI').style.display = '';
    if (fb) { fb.style.display = 'none'; }
    betaAttachLanEv();
    _betaSimDraw();
    betaRenderLanUI();
  }
}

// ─ 편집 캔버스 ─

function betaDrawEdit() {
  const cv = _betaEditCv();
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const gW  = _betaGW(); const gH = _betaGH();
  ctx.clearRect(0, 0, cv.width, cv.height); // 오버레이만 클리어 (격자는 betaCanvasBg에 있음)

  // pass2: Zone 채우기 + 패널 경계
  State.betaZones.forEach((zone, zi) => {
    const ci  = zi % BETA_ZONE_BG.length;
    const zx  = zone.startCol * 500 * sc; const zy = zone.startRow * 500 * sc;
    const zw  = zone.cols * 500 * sc; const zh = zone.rows * 500 * sc;
    const cr  = Math.min(8, zw * 0.14, zh * 0.14); // corner radius
    const _ap = State._betaAnimProg;
    const _isNew = _ap && _ap.ids.has(zone.id);
    if (_isNew) {
      ctx.save();
      ctx.globalAlpha = _ap.t;
      const _s = 0.88 + 0.12 * _ap.t;
      ctx.translate(zx + zw / 2, zy + zh / 2);
      ctx.scale(_s, _s);
      ctx.translate(-(zx + zw / 2), -(zy + zh / 2));
    }
    // 라운드 클립: fill + 패널 경계를 rounded rect 안에 가둠
    ctx.save();
    ctx.beginPath(); ctx.roundRect(zx, zy, zw, zh, cr); ctx.clip();
    ctx.fillStyle = BETA_ZONE_BG[ci]; ctx.fillRect(zx, zy, zw, zh);
    ctx.strokeStyle = BETA_ZONE_LINE[ci]; ctx.lineWidth = 1.2;
    betaPanels(zone).forEach(p => {
      ctx.strokeRect(p.x * sc + 0.6, p.y * sc + 0.6, p.w * sc - 1.2, p.h * sc - 1.2);
    });
    ctx.restore();
    // Zone 라운드 외곽선
    ctx.beginPath(); ctx.roundRect(zx + 1, zy + 1, zw - 2, zh - 2, cr);
    ctx.strokeStyle = BETA_ZONE_LINE[ci]; ctx.lineWidth = 2; ctx.stroke();
    // Zone 정보 텍스트 (흰 글씨 + 검정 아웃라인) + 번호
    const fs  = Math.max(11, Math.min(16, 500 * sc * 0.22));
    const pad = Math.max(3, Math.round(fs * 0.5)) + Math.round(cr * 0.5);
    ctx.font = `700 ${fs}px sans-serif`;
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, fs * 0.3); ctx.strokeStyle = 'rgba(0,0,0,0.85)';
    ctx.textAlign = 'right'; ctx.textBaseline = 'top';
    ctx.strokeText(`z${zi + 1}`, zx + zw - pad, zy + pad);
    ctx.fillStyle = '#fff'; ctx.fillText(`z${zi + 1}`, zx + zw - pad, zy + pad);
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const midY = zy + zh / 2;
    ctx.strokeText(zone.led, zx + zw / 2, midY - fs * 0.7);
    ctx.fillText(zone.led, zx + zw / 2, midY - fs * 0.7);
    ctx.strokeText(`${zone.panelW}×${zone.panelH}mm`, zx + zw / 2, midY + fs * 0.7);
    ctx.fillText(`${zone.panelW}×${zone.panelH}mm`, zx + zw / 2, midY + fs * 0.7);
    ctx.textBaseline = 'alphabetic';
    if (_isNew) { ctx.restore(); }
  });

  // pass3: 드래그 선택 미리보기 (lerp 좌표로 부드럽게 이동)
  if (State._betaDragSt && State._betaDragCur && State._betaDragLerp) {
    const l = State._betaDragLerp;
    const sx = l.c0 * 500 * sc; const sy = l.r0 * 500 * sc;
    const sw = (l.c1 - l.c0) * 500 * sc; const sh = (l.r1 - l.r0) * 500 * sc;
    const pr = Math.min(8, sw * 0.14, sh * 0.14);
    ctx.beginPath(); ctx.roundRect(sx, sy, sw, sh, pr);
    ctx.fillStyle = 'rgba(79,140,255,0.22)'; ctx.fill();
    ctx.beginPath(); ctx.roundRect(sx + 1, sy + 1, sw - 2, sh - 2, pr);
    ctx.strokeStyle = '#4F8CFF'; ctx.lineWidth = 2; ctx.stroke();
    // 치수 텍스트는 정수 스냅값 표시
    const ir0 = Math.min(State._betaDragSt.r, State._betaDragCur.r);
    const ic0 = Math.min(State._betaDragSt.c, State._betaDragCur.c);
    const ir1 = Math.max(State._betaDragSt.r, State._betaDragCur.r);
    const ic1 = Math.max(State._betaDragSt.c, State._betaDragCur.c);
    const wm = ((ic1 - ic0 + 1) * 0.5).toFixed(1).replace(/\.0$/, '');
    const hm = ((ir1 - ir0 + 1) * 0.5).toFixed(1).replace(/\.0$/, '');
    const fs2 = Math.max(11, Math.min(16, sw * 0.18));
    ctx.font = `700 ${fs2}px sans-serif`;
    ctx.fillStyle = '#1a4fcc'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(`${wm}m × ${hm}m`, sx + sw / 2, sy + sh / 2);
    ctx.textBaseline = 'alphabetic';
  }

  // pass3.5: 선택된 구역 하이라이트 (흰색 점선 + 밝은 overlay)
  if (State._betaSelectedId) {
    const sel = State.betaZones.find(z => z.id === State._betaSelectedId);
    if (sel) {
      const si = State.betaZones.indexOf(sel);
      const sc2 = BETA_ZONE_LINE[si % BETA_ZONE_LINE.length];
      const sx = sel.startCol * 500 * sc, sy = sel.startRow * 500 * sc;
      const sw = sel.cols * 500 * sc,    sh = sel.rows * 500 * sc;
      ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(sx, sy, sw, sh);
      ctx.strokeStyle = sc2; ctx.lineWidth = 3;
      ctx.setLineDash([7, 3]);
      ctx.strokeRect(sx + 1.5, sy + 1.5, sw - 3, sh - 3);
      ctx.setLineDash([]);
    }
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

function betaSaveGuideImage() {
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
  // 폰트 크기는 가장 작은 구역 치수 기준 — 모든 구역에서 균일하게 보임
  const wmText = '3Y Ent.';
  const minZoneDim = Math.min(...State.betaZones.map(z => Math.min(z.cols*500*sX, z.rows*500*sY)));
  const fSizeWm = Math.round(Math.max(12, Math.min(minZoneDim * 0.18, 32)));
  ctx.font = `600 ${fSizeWm}px 'Helvetica Neue',Helvetica,Arial,sans-serif`;
  const wmTW = ctx.measureText(wmText).width;
  const stepX = Math.round(wmTW * 2.0);
  const stepY = Math.round(fSizeWm * 3.5);
  const halfD = Math.ceil(Math.hypot(res.w, res.h) / 2) + Math.max(stepX, stepY);

  // ── 구역별 렌더링 ──
  State.betaZones.forEach((zone, zi) => {
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
        if ((r + c) % 2 !== 0) { continue; } // 마름모꼴 간격
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

    // 구역 테두리 (구역별 고유 형광색)
    const zoneCol = BETA_ZONE_LINE[zi % BETA_ZONE_LINE.length];
    ctx.strokeStyle = zoneCol; ctx.lineWidth = gridLW * 2;
    ctx.strokeRect(zx+1, zy+1, zw-2, zh-2);

    // 해상도 텍스트 (구역 크기 비례, 최소 fSizeWm 이상 보장)
    const zResW = zone.cols * SPECS[zone.led].px500.w;
    const zResH = zone.rows * SPECS[zone.led].px500.h;
    const fsRes = Math.round(Math.max(fSizeWm, Math.min(zh * 0.32, zw * 0.08, 120)));
    ctx.font = `300 ${fsRes}px 'Inter','Helvetica Neue',Helvetica,Arial,sans-serif`;
    ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    const wStr = `${zResW}`, sepStr = '  ×  ', hStr = `${zResH}`;
    const wW = ctx.measureText(wStr).width;
    const sepW = ctx.measureText(sepStr).width;
    const hW = ctx.measureText(hStr).width;
    const totalTW = wW + sepW + hW;
    const tx = zx + zw/2 - totalTW/2;
    const ty = zy + zh / 2;
    ctx.fillStyle = '#ffffff'; ctx.fillText(wStr, tx, ty);
    ctx.fillStyle = '#FF7A2A'; ctx.fillText(sepStr, tx + wW, ty);
    ctx.fillStyle = '#ffffff'; ctx.fillText(hStr, tx + wW + sepW, ty);
    // 주황 바 — 텍스트 위치에 종속 (tx 기준 좌우 padding으로 감쌈)
    const padding = Math.round(fsRes * 0.15);
    const gap = Math.min(fsRes * 0.55, zh * 0.12);
    const barLW = Math.max(1, Math.round(totalTW / 300));
    const barL = tx - padding, barR = tx + totalTW + padding;
    ctx.strokeStyle = '#FF7A2A'; ctx.lineWidth = barLW;
    ctx.beginPath(); ctx.moveTo(barL, ty-gap); ctx.lineTo(barR, ty-gap); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(barL, ty+gap); ctx.lineTo(barR, ty+gap); ctx.stroke();

    ctx.restore(); // clip 해제
    ctx.textBaseline = 'alphabetic';
  });

  const url = cv.toDataURL('image/png');
  showResPreview(url, null, `guide_${res.w}x${res.h}.png`);
}

function _betaBuildPanelTable() {
  if (!State.betaZones.length) { return ''; }
  const ledOrder   = ['2mm', '3mm', '4mm'];
  const panelOrder = ['500x500', '500x1000', '1000x500'];
  const panelMeta  = {
    '500x500':  { label: '500×500mm',  rackSize: 24, pxFn: sp => `${sp.px500.w}×${sp.px500.h}` },
    '500x1000': { label: '500×1000mm', rackSize: 12, pxFn: sp => `${sp.px1000.w}×${sp.px1000.h}` },
    '1000x500': { label: '1000×500mm', rackSize: 12, pxFn: sp => `${sp.px1000.h}×${sp.px1000.w}` },
  };
  const counts = {}; const usedLeds = new Set(); const usedPanels = new Set();
  State.betaZones.forEach(zone => {
    betaPanels(zone).forEach(p => {
      const pKey = `${p.w}x${p.h}`;
      usedLeds.add(zone.led); usedPanels.add(pKey);
      if (!counts[zone.led]) { counts[zone.led] = {}; }
      counts[zone.led][pKey] = (counts[zone.led][pKey] || 0) + 1;
    });
  });
  const leds   = ledOrder.filter(l => usedLeds.has(l));
  const panels = panelOrder.filter(p => usedPanels.has(p));
  const multiLed = leds.length > 1; const multiPanel = panels.length > 1;

  // 헤더
  let h = '<table class="beta-panel-table"><thead><tr><th>LED</th>';
  panels.forEach(pKey => {
    const pm = panelMeta[pKey];
    const pxSub = !multiLed ? `<span class="beta-px-sub">(${pm.pxFn(SPECS[leds[0]])}px)</span>` : '';
    h += `<th>${pm.label}${pxSub}</th>`;
  });
  if (multiPanel) { h += '<th>합계</th>'; }
  h += '</tr></thead><tbody>';

  // 데이터 행
  leds.forEach(led => {
    const sp = SPECS[led]; let ledTotal = 0, ledRackTotal = 0;
    h += `<tr><td class="led-cell">${led}</td>`;
    panels.forEach(pKey => {
      const pm = panelMeta[pKey];
      const cnt = (counts[led] && counts[led][pKey]) || 0;
      const rack = Math.ceil(cnt / pm.rackSize);
      ledTotal += cnt; ledRackTotal += rack;
      if (cnt > 0) {
        const sub = multiLed
          ? `<span class="beta-px-sub">랙 ${rack}개 · ${pm.pxFn(sp)}px</span>`
          : `<span class="beta-px-sub">랙 ${rack}개</span>`;
        h += `<td>${cnt}ea${sub}</td>`;
      } else { h += '<td>—</td>'; }
    });
    if (multiPanel) { h += `<td class="total-cell">${ledTotal}ea<span class="beta-px-sub">랙 ${ledRackTotal}개</span></td>`; }
    h += '</tr>';
  });

  // 합계 행 (LED 종류 2개 이상일 때만)
  if (multiLed) {
    let grandTotal = 0, grandRackTotal = 0;
    h += '<tr class="trow-total"><td>합계</td>';
    panels.forEach(pKey => {
      const pm = panelMeta[pKey]; let pTotal = 0, pRack = 0;
      leds.forEach(led => { const c = (counts[led] && counts[led][pKey]) || 0; pTotal += c; pRack += Math.ceil(c / pm.rackSize); });
      grandTotal += pTotal; grandRackTotal += pRack;
      h += `<td class="total-cell">${pTotal}ea<span class="beta-px-sub">랙 ${pRack}개</span></td>`;
    });
    if (multiPanel) { h += `<td class="total-cell">${grandTotal}ea<span class="beta-px-sub">랙 ${grandRackTotal}개</span></td>`; }
    h += '</tr>';
  }
  return h + '</tbody></table>';
}

function setBetaSpare(k, v) {
  State.betaSpareAdj[k] = Math.max(0, parseInt(v) || 0);
  betaRenderSum();
  saveState();
}

function _betaBuildSendingHtml(tW, tH) {
  const cards = [
    { label: '660 Pro', count: 2, modes: [
      { hz: 60, maxW: 1920, maxH: 1200 },
      { hz: 30, maxW: 2560, maxH: 1600 },
    ]},
    { label: '4K', count: 2, modes: [
      { hz: 60, maxW: 3840, maxH: 2160 },
    ]},
  ];
  let h = '<div class="beta-send-block">';
  for (const card of cards) {
    h += `<div class="beta-send-row"><span class="beta-send-name">${card.label}</span>`;
    for (const m of card.modes) {
      const single = tW <= m.maxW && tH <= m.maxH;
      const dual   = !single && ((tW <= m.maxW * 2 && tH <= m.maxH) || (tW <= m.maxW && tH <= m.maxH * 2));
      const cls = single ? 'ok' : dual ? 'ok2' : 'ng';
      const txt = single ? `1대 @${m.hz}Hz ✓` : dual ? `2대 @${m.hz}Hz ✓` : `@${m.hz}Hz ✗`;
      h += `<span class="beta-send-badge ${cls}">${txt}</span>`;
    }
    h += '</div>';
  }
  h += '</div>';
  return h;
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
       </div>${_betaBuildSendingHtml(res.w, res.h)}${_betaBuildPanelTable()}`
    : '';
  el.innerHTML = State.betaZones.map((z, i) => {
    const col = BETA_ZONE_LINE[i % BETA_ZONE_LINE.length];
    const isSel = z.id === State._betaSelectedId;
    const selStyle = isSel ? `background:${col}18;outline:2px solid ${col};outline-offset:-1px;` : '';
    return `<div class="beta-zone-card" style="border-left:4px solid ${col};${selStyle}cursor:pointer" onclick="betaSelectZone('${z.id}')">
      <span class="beta-zone-tag" style="color:${col}">구역 ${i + 1}</span>
      <span class="beta-zone-info">${wm(z.cols * 500)} × ${wm(z.rows * 500)} | ${z.cols * SPECS[z.led].px500.w} × ${z.rows * SPECS[z.led].px500.h}px | ${z.led} | ${z.panelW}×${z.panelH}mm${((z.rows % (z.panelH / 500)) > 0 || (z.cols % (z.panelW / 500)) > 0) ? ' +500×500mm' : ''}</span>
      <button class="beta-zone-edit-btn" onclick="event.stopPropagation();betaEditZone('${z.id}')">편집</button>
      <button class="beta-zone-del-btn" onclick="event.stopPropagation();betaDeleteZone('${z.id}')">삭제</button>
    </div>`;
  }).join('') + resHtml;
}

function betaSelectZone(id) {
  State._betaSelectedId = id;
  betaRenderZoneList();
  betaDrawEdit();
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
  const el = document.getElementById(State._betaFull ? 'betaFullZoneCfg' : 'betaZoneCfg');
  if (!el || !State._betaSelNew) { return; }
  const ev = State._betaSelEdit ? State.betaZones.find(z => z.id === State._betaSelEdit) : null;
  const curLed = ev ? ev.led : '3mm';
  const curPW  = ev ? ev.panelW : 500;
  const curPH  = ev ? ev.panelH : 1000;
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

function _betaAnimNewZones(ids) {
  const t0 = performance.now();
  const DUR = 380;
  function frame() {
    const p = Math.min((performance.now() - t0) / DUR, 1);
    const t = 1 - Math.pow(1 - p, 3); // ease-out cubic
    State._betaAnimProg = { ids, t };
    betaDrawEdit();
    if (p < 1) { requestAnimationFrame(frame); }
    else { State._betaAnimProg = null; }
  }
  requestAnimationFrame(frame);
}

function betaCfgApply() {
  if (!State._betaSelNew) { return; }
  const ledBtn   = document.querySelector('#betaCfgLed .beta-cfg-chip.on');
  const panelBtn = document.querySelector('#betaCfgPanel .beta-cfg-chip.on');
  const led = ledBtn ? ledBtn.textContent : '3mm';
  const pw  = panelBtn ? parseInt(panelBtn.dataset.w) : 500;
  const ph  = panelBtn ? parseInt(panelBtn.dataset.h) : 500;
  const { startR, startC, rows, cols } = State._betaSelNew;
  let _newIds = null;

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
    const _newZone = { id: _betaZid(), startRow: startR, startCol: startC, rows, cols, led, panelW: pw, panelH: ph };
    State.betaZones.push(_newZone);
    _newIds = new Set([_newZone.id]);
  }

  State._betaSelNew  = null;
  State._betaSelEdit = null;
  State._betaCache   = null;
  document.getElementById(State._betaFull ? 'betaFullZoneCfg' : 'betaZoneCfg').style.display = 'none';
  if (State._betaFull) { _betaRenderFull(); } else { betaRender(); }
  if (_newIds) { _betaAnimNewZones(_newIds); }
  saveState();
}

function betaCfgCancel() {
  State._betaSelNew  = null;
  State._betaSelEdit = null;
  document.getElementById(State._betaFull ? 'betaFullZoneCfg' : 'betaZoneCfg').style.display = 'none';
  betaDrawEdit();
}

// ─ 편집 모드 이벤트 ─

function _betaDragRafLoop() {
  if (!State._betaDragLerp || !State._betaDragSt) { return; }
  const st = State._betaDragSt; const cur = State._betaDragCur;
  const tr0 = Math.min(st.r, cur.r), tc0 = Math.min(st.c, cur.c);
  const tr1 = Math.max(st.r, cur.r) + 1, tc1 = Math.max(st.c, cur.c) + 1;
  const L = 0.25; const l = State._betaDragLerp;
  l.r0 += (tr0 - l.r0) * L; l.c0 += (tc0 - l.c0) * L;
  l.r1 += (tr1 - l.r1) * L; l.c1 += (tc1 - l.c1) * L;
  betaDrawEdit();
  requestAnimationFrame(_betaDragRafLoop);
}

function betaAttachEditEv() {
  const cv = _betaEditCv();
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
    State._betaDragLerp = { r0: cell.r, c0: cell.c, r1: cell.r + 1, c1: cell.c + 1 };
    requestAnimationFrame(_betaDragRafLoop);
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
    State._betaDragSt = null; State._betaDragCur = null; State._betaDragLerp = null; wasDrag = false;

    if (!drag) {
      // 단순 탭 → 구역 선택 (+ 기존 구역이면 편집 패널 열기)
      const zone = _betaZoneAt(r0, c0);
      State._betaSelectedId = zone ? zone.id : null;
      if (!State._betaFull) { betaRenderZoneList(); }
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
  const sc  = cv.width / (State.betaAreaW || 1);
  const panels = _betaAllPanels();
  const curPi  = State.betaAPort;
  ctx.clearRect(0, 0, cv.width, cv.height);

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

// ─ PWR 캔버스 ─

function betaDrawPwr() {
  const cv = document.getElementById('betaCanvas');
  if (!cv) { return; }
  const ctx = cv.getContext('2d');
  const sc  = cv.width / (State.betaAreaW || 1);
  const panels = _betaAllPanels();
  const curPi  = State.betaPwrAPort;
  ctx.clearRect(0, 0, cv.width, cv.height);

  // 배선 순서 번호 맵
  const stepOf = new Map();
  State.betaPwrPorts.forEach((s, pi) => {
    State.betaPwrPH2[pi].filter(k => s.has(k)).forEach((k, idx) => stepOf.set(k, idx + 1));
  });

  // ── pass 1: 셀 배경·테두리·패턴 ────────────────────────────
  panels.forEach(p => {
    const pi = _betaPwrOwner(p.key);
    const px = p.x * sc, py = p.y * sc, pw = p.w * sc, ph = p.h * sc;
    const lk  = pi >= 0 && pi !== curPi;
    const hov = State._betaLanDrag && State._betaLanDHov === p.key && pi < 0;

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
    if (!State._betaLanDrag && State._betaFCell === p.key) {
      ctx.strokeStyle = 'white';   ctx.lineWidth = 3; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
      ctx.strokeStyle = '#378ADD'; ctx.lineWidth = 2; ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);
    }
  });

  // ── pass 2: 포트 배선 경로 — 다각선 + 끝 화살촉 ───────────
  State.betaPwrPorts.forEach((s, pi) => {
    const h = State.betaPwrPH2[pi].filter(k => s.has(k));
    if (h.length < 2) { return; }
    const col = portColor(pi);
    const pts = h.map(k => {
      const p = panels.find(x => x.key === k);
      return p ? { x: _betaPanelCx(p), y: _betaPanelCy(p) } : null;
    }).filter(Boolean);
    if (pts.length < 2) { return; }

    const pL0 = pts[pts.length - 2], pL1 = pts[pts.length - 1];
    const ldx = pL1.x - pL0.x, ldy = pL1.y - pL0.y;

    const strokePath = (style, lw) => {
      ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) { ctx.lineTo(pts[i].x, pts[i].y); }
      ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.stroke();
    };
    const fillArrow = (style) => {
      const len = Math.sqrt(ldx * ldx + ldy * ldy); if (len < 1) { return; }
      const ux = ldx / len, uy = ldy / len;
      const hw = 6, hl = 12, nx = -uy, ny = ux;
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

  // ── pass 3: 순서 번호 & 포트 레이블 ────────────────────────
  panels.forEach(p => {
    const pi = _betaPwrOwner(p.key);
    if (pi < 0) { return; }
    const lk  = pi !== curPi;
    const cx2 = p.x * sc + p.w * sc / 2, cy2 = p.y * sc + p.h * sc / 2;
    const step = stepOf.get(p.key);

    if (step) {
      const fs = Math.max(6, Math.min(12, p.w * sc - 8));
      const r  = Math.max(8, fs * 0.72);
      ctx.beginPath(); ctx.arc(cx2, cy2, r, 0, Math.PI * 2);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.9)';
      ctx.fill();
      ctx.font = `700 ${fs}px sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillStyle = lk ? 'rgba(80,80,80,0.6)' : portColor(pi);
      ctx.fillText(String(step), cx2, cy2);
    }

    if (p.w * sc >= 20) {
      const label = 'P' + (pi + 1);
      ctx.font = '700 9px sans-serif';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.lineJoin = 'round'; ctx.lineWidth = 2.5;
      ctx.strokeStyle = 'rgba(0,0,0,0.55)';
      ctx.strokeText(label, p.x * sc + 4, p.y * sc + 4);
      ctx.fillStyle = lk ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.97)';
      ctx.fillText(label, p.x * sc + 4, p.y * sc + 4);
    }
    ctx.textBaseline = 'alphabetic';
  });
}

function betaAddPwrPort() {
  State.betaPwrPorts.push(new Set()); State.betaPwrPH2.push([]);
  betaRenderPwrPorts(); betaDrawPwr(); saveState();
}
function _doBetaRemovePwrPort() {
  if (State.betaPwrPorts.length <= 1) { return; }
  if (State.betaPwrAPort >= State.betaPwrPorts.length - 1) { State.betaPwrAPort = State.betaPwrPorts.length - 2; }
  State.betaPwrPorts.pop(); State.betaPwrPH2.pop();
  betaRenderPwrPorts(); betaDrawPwr(); saveState();
}
function betaRemovePwrPort() {
  if (State.betaPwrPorts.length <= 1) { return; }
  const last = State.betaPwrPorts[State.betaPwrPorts.length - 1];
  if (last.size > 0) {
    openConfirm(`P${State.betaPwrPorts.length} 포트 제거`, `P${State.betaPwrPorts.length}에 ${last.size}장이 할당되어 있습니다. 제거할까요?`, _doBetaRemovePwrPort);
  } else { _doBetaRemovePwrPort(); }
}

function betaRenderPwrPorts() {
  const el = document.getElementById('betaPortRow');
  if (!el) { return; }
  const pi    = State.betaPwrAPort;
  const count = State.betaPwrPorts.length;
  let html    = '<div class="beta-port-strip">';
  for (let i = 0; i < count; i++) {
    const sz  = State.betaPwrPorts[i].size;
    const on  = i === pi;
    const has = sz > 0;
    const _bc = portColor(i);
    html += `<button class="beta-port-btn${on ? ' sel' : ''}${has ? ' has-data' : ''}"
      style="${on ? `background:${_bc};border-color:${_bc};` : `border-color:${_bc};color:${_bc};`}"
      onclick="State.betaPwrAPort=${i};betaDrawPwr();betaRenderPwrPorts()">P${i + 1}</button>`;
  }
  html += '</div>';
  const sz   = State.betaPwrPorts[pi].size;
  const _apc = portColor(pi);
  html += `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
    <span style="font-size:13px;font-weight:500;color:${_apc}">포트 ${pi + 1}</span>
    <span style="font-size:13px;color:#333;">${sz}장</span>
    <button class="beta-rst-port-btn" onclick="betaRstPwrPort(${pi})">포트 ${pi + 1} 초기화</button>
    ${State._betaLanDrag ? `<span class="drag-badge" style="background:${_apc}">드래그 중</span>` : ''}
    <button class="port-btn expand-port-btn" onclick="betaAddPwrPort()" style="margin-left:auto">+ 포트</button>
    <button class="port-btn expand-port-btn" onclick="betaRemovePwrPort()">− 포트</button>
  </div>`;
  el.innerHTML = html;
}

// ─ LAN UI ─

function betaSetSimTab(tab) {
  if (tab === State.betaSimTab) { return; }
  const cv   = document.getElementById('betaCanvas');
  const snap = document.getElementById('betaCanvasSnap');
  snap.width  = cv.width;
  snap.height = cv.height;
  snap.getContext('2d').drawImage(cv, 0, 0);
  snap.style.display = 'block';
  snap.style.transition = '';
  snap.style.opacity = '1';
  State.betaSimTab = tab;
  _betaSimDraw();
  betaRenderLanUI();
  snap.offsetHeight;
  snap.style.transition = 'opacity .28s';
  snap.style.opacity = '0';
  snap.addEventListener('transitionend', () => { snap.style.display = 'none'; snap.style.transition = ''; }, { once: true });
}

function betaRenderLanUI() {
  const el = document.getElementById('betaLanBtns');
  if (el) {
    const isLan    = State.betaSimTab !== 'pwr';
    const assigned = isLan ? State.betaPorts.some(s => s.size > 0)
                           : State.betaPwrPorts.some(s => s.size > 0);
    const autoBtn  = assigned
      ? `<button class="beta-lan-btn" disabled>자동할당 적용됨</button>`
      : `<button class="beta-lan-btn" onclick="${isLan ? 'betaAutoAssign()' : 'betaAutoAssignPwr()'}">자동 할당</button>`;
    el.innerHTML = `<div class="beta-lan-tabs">
      <button class="beta-lan-tab${isLan ? ' on' : ''}" onclick="betaSetSimTab('lan')">랜선</button>
      <button class="beta-lan-tab${!isLan ? ' on' : ''}" onclick="betaSetSimTab('pwr')">파워콘</button>
    </div>
    <div class="beta-lan-btns-row">
      ${autoBtn}
      <button class="beta-lan-btn danger" onclick="betaRstAllPorts()">전체 배선 초기화</button>
    </div>`;
  }
  if (State.betaSimTab === 'pwr') {
    betaRenderPwrPorts();
  } else {
    betaRenderPorts();
  }
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
    <button class="beta-rst-port-btn" onclick="betaRstPort(${pi})">포트 ${pi + 1} 초기화</button>
    ${State._betaLanDrag ? `<span class="drag-badge" style="background:${_apc}">드래그 중</span>` : ''}
  </div>
  <div style="height:5px;background:#eee;border-radius:3px;margin-top:6px;">
    <div style="height:5px;width:${pct}%;background:${ov ? '#E24B4A' : _apc};border-radius:3px;"></div>
  </div>`;
  el.innerHTML = html;
}

function betaRenderSum() {
  const el = document.getElementById('betaLanSum');
  if (!el) { return; }
  const ports  = State.betaPorts;
  const active = ports.filter(s => s.size > 0).length;
  const l1 = active * 2 + State.betaSpareAdj.l1;
  const slNet = ports.reduce((acc, s) => acc + Math.max(0, s.size - 1), 0);
  const sl = slNet + State.betaSpareAdj.sl;
  const pwrActive = State.betaPwrPorts.filter(s => s.size > 0).length;
  const c1 = pwrActive + State.betaSpareAdj.c1;
  const spNet = State.betaPwrPorts.reduce((acc, s) => acc + Math.max(0, s.size - 1), 0);
  const sp = spNet + State.betaSpareAdj.sp;
  const si = (k, v) => `<input class="spare-inp" type="number" min="0" value="${v}" oninput="setBetaSpare('${k}',this.value)">`;
  el.innerHTML = `<div class="beta-sum-block">
    <div class="beta-sum-section lan">
      <div class="beta-sum-title">랜선</div>
      <div class="beta-sum-cards">
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">1번 랜</div>
          <div class="beta-sum-val">${l1}개</div>
          <div class="beta-sum-note">메인·백업 ${active * 2} + 여유 ${si('l1', State.betaSpareAdj.l1)}</div>
        </div>
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">숏랜</div>
          <div class="beta-sum-val">${sl}개</div>
          <div class="beta-sum-note">필요 ${slNet} + 여유 ${si('sl', State.betaSpareAdj.sl)}</div>
        </div>
      </div>
    </div>
    <div class="beta-sum-section pwr">
      <div class="beta-sum-title">파워콘</div>
      <div class="beta-sum-cards">
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">1번 파워</div>
          <div class="beta-sum-val">${c1}개</div>
          <div class="beta-sum-note">필요 ${pwrActive} + 여유 ${si('c1', State.betaSpareAdj.c1)}</div>
        </div>
        <div class="beta-sum-card">
          <div class="beta-sum-lbl">숏파워</div>
          <div class="beta-sum-val">${sp}개</div>
          <div class="beta-sum-note">필요 ${spNet} + 여유 ${si('sp', State.betaSpareAdj.sp)}</div>
        </div>
      </div>
    </div>
  </div>`;
}

function betaRenderLeg() {
  const el = document.getElementById('betaLeg');
  if (!el) { return; }
  el.innerHTML = '';
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

function betaRstPwrPort(pi) {
  State.betaPwrPorts[pi] = new Set();
  State.betaPwrPH2[pi]   = [];
  betaDrawPwr(); betaRenderPwrPorts(); betaRenderSum(); saveState();
}

function betaRstAllPorts() {
  if (State.betaSimTab === 'pwr') {
    openConfirm('파워콘 배선 초기화', '모든 파워콘 배선을 초기화할까요?', () => {
      const cnt = State.betaPwrPorts.length;
      State.betaPwrPorts = Array.from({ length: cnt }, () => new Set());
      State.betaPwrPH2   = Array.from({ length: cnt }, () => []);
      State.betaPwrAPort = 0;
      betaDrawPwr(); betaRenderLanUI(); saveState();
    });
  } else {
    openConfirm('배선 초기화', '모든 포트 배선을 초기화할까요?', () => {
      State.betaPorts = Array.from({ length: 16 }, () => new Set());
      State.betaPH2   = Array.from({ length: 16 }, () => []);
      State.betaAPort = 0;
      betaDrawLan(); betaRenderLanUI(); saveState();
    });
  }
}

// ─ 전체모드 ─

function _betaRenderFull() {
  const cv = document.getElementById('betaFullCanvas');
  if (!cv || !State.betaAreaW || !State.betaAreaH) { return; }
  const sc = _betaScEdit();
  cv.width  = Math.round(State.betaAreaW * sc);
  cv.height = Math.round(State.betaAreaH * sc);
  betaAttachEditEv();
  betaDrawEdit();
}

function betaEnterFull() {
  const overlay = document.getElementById('betaFullOverlay');
  if (!overlay || !State.betaAreaW || !State.betaAreaH) { return; }
  State._betaFull = true;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  history.pushState({ overlay: 'betaFull' }, '');

  // 가로 방향 잠금 — PWA 설치 시 직접 동작, 브라우저는 fullscreen 경유 fallback
  const _lockLandscape = () => {
    if (screen.orientation && screen.orientation.lock) {
      screen.orientation.lock('landscape').catch(() => {});
    }
  };
  if (document.documentElement.requestFullscreen) {
    document.documentElement.requestFullscreen().then(_lockLandscape).catch(_lockLandscape);
  } else {
    _lockLandscape();
  }

  State._betaFullResizeHandler = () => _betaRenderFull();
  window.addEventListener('resize', State._betaFullResizeHandler);
  requestAnimationFrame(() => _betaRenderFull());
}

function betaExitFull() {
  const overlay = document.getElementById('betaFullOverlay');
  if (!overlay || !State._betaFull) { return; }

  // 전체모드 캔버스 이벤트 해제
  const fcv = document.getElementById('betaFullCanvas');
  if (fcv && fcv._betaAbort) { fcv._betaAbort.abort(); fcv._betaEvMode = null; }

  // 구역 설정 패널 닫기
  const fcfg = document.getElementById('betaFullZoneCfg');
  if (fcfg) { fcfg.style.display = 'none'; fcfg.innerHTML = ''; }

  State._betaFull = false;
  State._betaSelNew = null;
  State._betaSelEdit = null;
  overlay.style.display = 'none';
  document.body.style.overflow = '';

  if (screen.orientation && screen.orientation.unlock) {
    try { screen.orientation.unlock(); } catch (e) {}
  }
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }

  if (State._betaFullResizeHandler) {
    window.removeEventListener('resize', State._betaFullResizeHandler);
    State._betaFullResizeHandler = null;
  }

  if (history.state && history.state.overlay === 'betaFull') { _histBack(); }
  betaRender();

  // 방향 전환 완료 후 메인 캔버스 재렌더 (비동기 전환 대응)
  const _onExitResize = () => betaRender();
  window.addEventListener('resize', _onExitResize, { once: true, passive: true });
  setTimeout(() => window.removeEventListener('resize', _onExitResize), 1500);
}

function betaReset() {
  if (State.betaMode === 'lan') { betaRstAllPorts(); return; }
  openConfirm('혼합 시뮬 초기화', '설치 면적, 구역, 배선을 모두 초기화할까요?', () => {
    State.betaAreaW = 0; State.betaAreaH = 0;
    State.betaMode  = 'edit';
    document.getElementById('betaW').value = '';
    document.getElementById('betaH').value = '';
    State.betaZones    = []; State._betaCache = null;
    State.betaPorts    = Array.from({ length: 16 }, () => new Set());
    State.betaPH2      = Array.from({ length: 16 }, () => []);
    State.betaAPort    = 0;
    State.betaPwrPorts = Array.from({ length: 18 }, () => new Set());
    State.betaPwrPH2   = Array.from({ length: 18 }, () => []);
    State.betaPwrAPort = 0;
    State._betaSelNew  = null; State._betaSelEdit = null;
    if (State._betaFull) { _betaRenderFull(); } else { betaRender(); }
    saveState();
  });
}

// ─ 자동 할당 ─

function _betaNextEmpty() {
  for (let i = 0; i < 16; i++) {
    if (State.betaPorts[i].size === 0) { return i; }
  }
  return State.betaAPort;
}

function _balancedCols(total, numPorts, maxRaw, maxEven) {
  if (numPorts === 1) { return [total]; }
  const base = Math.floor(total / numPorts);
  let perPort;
  if (base < 2 || base % 2 === 0) {
    const ceilBase = Math.ceil(total / numPorts);
    perPort = (base < 2 && ceilBase <= maxRaw) ? ceilBase : base;
  } else {
    const up = base + 1;
    const lastIfUp = total - up * (numPorts - 1);
    if (up <= maxEven && lastIfUp >= 1 && lastIfUp <= maxRaw) {
      perPort = up;
    } else {
      const down = base - 1;
      const lastIfDown = total - down * (numPorts - 1);
      perPort = (down >= 1 && lastIfDown >= 1 && lastIfDown <= maxRaw) ? down : base;
    }
  }
  const takes = [];
  let rem = total;
  for (let p = 0; p < numPorts - 1; p++) { takes.push(perPort); rem -= perPort; }
  takes.push(rem);
  return takes;
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

function betaAutoAssignPwr() {
  const cnt = State.betaPwrPorts.length;
  State.betaPwrPorts = Array.from({ length: cnt }, () => new Set());
  State.betaPwrPH2   = Array.from({ length: cnt }, () => []);
  State.betaPwrAPort = 0;

  const allPanels = _betaAllPanels();
  let portIdx = 0;

  for (const zone of State.betaZones) {
    if (portIdx >= cnt) { break; }
    const zonePanels = allPanels.filter(p => p.zoneId === zone.id);
    if (!zonePanels.length) { continue; }

    const _specLed  = SPECS[zone.led];
    const _specKey  = (zone.panelH === 1000 || zone.panelW === 1000) ? 'px1000' : 'px500';
    const _pitch    = parseInt(zone.led);
    const pxMain    = _specLed ? _specLed[_specKey].w * _specLed[_specKey].h
                               : (zone.panelW / _pitch) * (zone.panelH / _pitch);
    const maxPanels = Math.max(1, Math.floor(300000 / pxMain));

    // 패널 열/행 좌표 추출
    const colXs  = [...new Set(zonePanels.map(p => p.x))].sort((a, b) => a - b);
    const rowYs  = [...new Set(zonePanels.map(p => p.y))].sort((a, b) => a - b);
    const numCols = colXs.length;
    const numRows = rowYs.length;
    const byXY   = new Map(zonePanels.map(p => [`${p.x},${p.y}`, p]));

    // 범용 뱀형 빌더: yList 행 순서, xList 열 순서 (짝수행: xList 정방향, 홀수행: 역방향)
    const buildSnake = (yList, xList) => {
      const out = [];
      yList.forEach((y, i) => {
        const row = xList.map(x => byXY.get(`${x},${y}`)).filter(Boolean);
        out.push(...(i % 2 === 0 ? row : [...row].reverse()));
      });
      return out;
    };

    // 뱀 배열을 nPorts개 포트에 균등 배분
    const assignSlice = (snake, nPorts) => {
      if (!snake.length || nPorts <= 0) { return; }
      const base = Math.floor(snake.length / nPorts);
      const extra = snake.length % nPorts;
      let idx = 0;
      for (let i = 0; i < nPorts; i++) {
        if (portIdx >= cnt) { break; }
        const count = base + (i < extra ? 1 : 0);
        snake.slice(idx, idx + count).forEach(p => {
          State.betaPwrPorts[portIdx].add(p.key);
          State.betaPwrPH2[portIdx].push(p.key);
        });
        idx += count;
        portIdx++;
      }
    };

    if (numRows === 1) {
      // ── 단일 행 ────────────────────────────────────────────────
      const rowY = rowYs[0];
      if (zonePanels.length <= maxPanels) {
        // 1포트: 오른→왼 (끝이 왼쪽)
        if (portIdx < cnt) {
          [...colXs].reverse()
            .map(x => byXY.get(`${x},${rowY}`)).filter(Boolean)
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      } else {
        // 다중 포트: 앞 ceil(N/2) 그룹 왼→오(끝이 안쪽), 나머지 오→왼(끝이 안쪽)
        const nPorts = Math.min(cnt - portIdx, Math.ceil(numCols / maxPanels));
        const base1  = Math.floor(numCols / nPorts);
        const extra1 = numCols % nPorts;
        const nLeft  = Math.ceil(nPorts / 2);
        let ci = 0;
        for (let i = 0; i < nPorts && portIdx < cnt; i++) {
          const size  = base1 + (i < extra1 ? 1 : 0);
          const grpXs = colXs.slice(ci, ci + size);
          ci += size;
          const xs = (i >= nLeft) ? [...grpXs].reverse() : grpXs;
          xs.map(x => byXY.get(`${x},${rowY}`)).filter(Boolean)
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      }
    } else if (numRows === 2) {
      // ── 2행, 행 기준 뱀형 ────────────────────────────────────
      if (zonePanels.length <= maxPanels) {
        // 1포트: 오른→왼 (끝이 왼쪽)
        if (portIdx < cnt) {
          buildSnake([...rowYs].reverse(), [...colXs].reverse())
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      } else {
        // 다중 포트: 앞 ceil(N/2) 그룹 왼→오(끝이 안쪽), 나머지 오→왼(끝이 안쪽)
        const colsPerPort = Math.max(1, Math.floor(maxPanels / numRows));
        const nPorts      = Math.min(cnt - portIdx, Math.ceil(numCols / colsPerPort));
        const base1       = Math.floor(numCols / nPorts);
        const extra1      = numCols % nPorts;
        const nLeft       = Math.ceil(nPorts / 2);
        let ci = 0;
        for (let i = 0; i < nPorts && portIdx < cnt; i++) {
          const size  = base1 + (i < extra1 ? 1 : 0);
          const grpXs = colXs.slice(ci, ci + size);
          ci += size;
          const xs = (i >= nLeft) ? [...grpXs].reverse() : grpXs;
          buildSnake([...rowYs].reverse(), xs)
            .forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
          portIdx++;
        }
      }
    } else {
      // ── 열 기준 뱀형 (행 수 > 2), 2열 고정, 시작·끝 모두 바닥 ─
      if (zonePanels.length <= maxPanels && portIdx < cnt) {
        // 전체 패널이 1포트 한도 이내: 단일 포트로 처리
        const snake = [];
        for (let dc = 0; dc < numCols; dc++) {
          const x   = colXs[dc];
          const col = rowYs.map(y => byXY.get(`${x},${y}`)).filter(Boolean);
          snake.push(...(dc % 2 === 0 ? [...col].reverse() : col));
        }
        snake.forEach(p => { State.betaPwrPorts[portIdx].add(p.key); State.betaPwrPH2[portIdx].push(p.key); });
        portIdx++;
      } else {
        const maxColsPerPort = Math.min(3, Math.max(1, Math.round(maxPanels / numRows)));
        const colsPerPort   = maxColsPerPort >= 2 ? 2 : 1; // 2열 고정 (시작·끝 바닥행 유지)

        let ci = 0;
        while (ci < numCols && portIdx < cnt) {
          const colCount = Math.min(colsPerPort, numCols - ci);
          const snake = [];
          for (let dc = 0; dc < colCount; dc++) {
            const x   = colXs[ci + dc];
            const col = rowYs.map(y => byXY.get(`${x},${y}`)).filter(Boolean);
            snake.push(...(dc % 2 === 0 ? [...col].reverse() : col));
          }
          snake.forEach(p => {
            State.betaPwrPorts[portIdx].add(p.key);
            State.betaPwrPH2[portIdx].push(p.key);
          });
          portIdx++;
          ci += colCount;
        }
      }
    }
  }

  betaDrawPwr(); betaRenderLanUI(); saveState();
}

// ─ LAN/PWR 모드 이벤트 ─

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
    _betaSimDraw();
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
      const own = _betaSimOwner(panel.key);
      _betaSetAPort(own >= 0 ? own : _betaNextSimEmpty());
      State._betaLanDrag = true;
      State._betaLanDStk = [panel.key];
      State._betaLanDHov = panel.key;
      if (own < 0) {
        _betaSimAssign(_betaSimAPort(), panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      _betaSimDraw(); _betaSimRenderPorts();
    }, e.touches ? LP_TOUCH : LP_MS);
  }

  function onMove(e) {
    e.preventDefault();
    if (!State._betaLanDrag) { return; }
    const { x, y } = getXY(e);
    const panel = _betaPanelAt(x, y);
    State._betaLanDHov = panel ? panel.key : null;
    if (!panel) { _betaSimDraw(); return; }
    const stk = State._betaLanDStk;
    if (stk.length >= 2 && stk[stk.length - 2] === panel.key) {
      const last = stk[stk.length - 1];
      if (_betaSimPorts()[_betaSimAPort()].has(last)) {
        _betaSimDeassign(_betaSimAPort(), last);
        if (navigator.vibrate) { navigator.vibrate(25); }
      }
      stk.pop();
      _betaSimDraw(); _betaSimRenderPorts();
      return;
    }
    if (stk[stk.length - 1] !== panel.key) {
      const own = _betaSimOwner(panel.key);
      if (own >= 0 && own !== _betaSimAPort()) { _betaSimDraw(); return; }
      if (!_betaSimPorts()[_betaSimAPort()].has(panel.key)) {
        _betaSimAssign(_betaSimAPort(), panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      stk.push(panel.key);
      _betaSimDraw(); _betaSimRenderPorts();
    }
  }

  function onUp(e) {
    e.preventDefault();
    clearTimeout(lpT); lpT = null;
    if (State._betaLanDrag) {
      State._betaLanDrag = false; State._betaLanDStk = []; State._betaLanDHov = null;
      _betaSimDraw(); _betaSimRenderPorts(); betaRenderSum(); saveState();
      return;
    }
    const bcr2 = ncv.getBoundingClientRect();
    const scX2 = State.betaAreaW / (bcr2.width  || State.betaAreaW);
    const scY2 = State.betaAreaH / (bcr2.height || State.betaAreaH);
    const pt = e.changedTouches
      ? { x: (e.changedTouches[0].clientX - bcr2.left) * scX2, y: (e.changedTouches[0].clientY - bcr2.top) * scY2 }
      : getXY(e);
    const panel = _betaPanelAt(pt.x, pt.y);
    if (panel) {
      const pi  = _betaSimAPort();
      const own = _betaSimOwner(panel.key);
      if (own === pi) {
        _betaSimDeassign(pi, panel.key);
        if (navigator.vibrate) { navigator.vibrate(25); }
      } else if (own < 0) {
        _betaSimAssign(pi, panel.key);
        if (navigator.vibrate) { navigator.vibrate(15); }
      }
      State._betaFCell = panel.key;
      _betaSimDraw(); _betaSimRenderPorts();
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
