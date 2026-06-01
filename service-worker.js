// ════════════════════════════════════════════════════════════
//  LED 설치 계산기 — Service Worker
//  전략: 모든 에셋(PDF 포함)을 설치 시 즉시 캐시
//  버전 업데이트 시 CACHE_VERSION 숫자를 올리면 구 캐시가 자동 삭제됨
// ════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v93';
const CORE_CACHE    = `led-calc-core-${CACHE_VERSION}`;

// 앱 구동에 필수인 에셋 — 캐시 실패 시 SW 설치가 중단됨
const CORE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
];

// 선택적 에셋 — 캐시 실패해도 설치는 계속됨 (PDF는 용량이 커 실패 허용)
const EXTRA_ASSETS = [
  './',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './3Y_text.png',
  './3Y_no_bg.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
  './MIG-EC90_User_Manual_1.0.pdf',
  './J6-Seamless-Switcher-Specifications-V2.2.0.pdf',
  './MCTRL660PRO.pdf',
  './MCTRL4K.pdf',
];


// ── 설치 ─────────────────────────────────────────────────
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await cache.addAll(CORE_ASSETS);                              // 필수 에셋
    await Promise.allSettled(                                     // 선택 에셋 (실패 무시)
      EXTRA_ASSETS.map(url => cache.add(url).catch(() => {}))
    );
    await self.skipWaiting(); // 새 SW를 즉시 활성화
  })());
});


// ── 활성화 ────────────────────────────────────────────────
// 이전 버전 캐시 삭제
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== CORE_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim(); // 열려 있는 탭에 즉시 적용
  })());
});


// ── 요청 가로채기 ─────────────────────────────────────────
// 캐시 우선, 없으면 네트워크
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('./index.html'))
  );
});


// ── 페이지 → SW 메시지 ────────────────────────────────────
// RECACHE_CORE: 핵심 에셋을 네트워크에서 강제 재캐시 (배포 완료 후 호출)
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') { self.skipWaiting(); return; }
  if (e.data !== 'RECACHE_CORE') { return; }
  e.waitUntil(
    caches.open(CORE_CACHE).then(cache =>
      Promise.all(CORE_ASSETS.map(url =>
        fetch(url, { cache: 'no-store' })
          .then(res => { if (res.ok) { return cache.put(url, res); } })
          .catch(() => {})
      ))
    )
  );
});
