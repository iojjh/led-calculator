// ════════════════════════════════════════════════════════════
//  LED 설치 계산기 — Service Worker
//  전략: 핵심 에셋은 설치 시 즉시 캐시, PDF는 첫 요청 시 캐시(lazy)
//  버전 업데이트 시 CACHE_VERSION 숫자를 올리면 구 캐시가 자동 삭제됨
// ════════════════════════════════════════════════════════════

const CACHE_VERSION = 'v5';
const CORE_CACHE    = `led-calc-core-${CACHE_VERSION}`;
const PDF_CACHE     = `led-calc-pdf-${CACHE_VERSION}`;

// 앱 구동에 필수인 에셋 — 캐시 실패 시 SW 설치가 중단됨
const CORE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
];

// 선택적 에셋 — 캐시 실패해도 설치는 계속됨
const EXTRA_ASSETS = [
  './',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js',
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
        .filter(k => k !== CORE_CACHE && k !== PDF_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim(); // 열려 있는 탭에 즉시 적용
  })());
});


// ── 요청 가로채기 ─────────────────────────────────────────
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // PDF 메뉴얼: 캐시 우선, 없으면 네트워크에서 받아 PDF 캐시에 저장
  if (url.endsWith('.pdf')) {
    e.respondWith((async () => {
      const cache  = await caches.open(PDF_CACHE);
      const cached = await cache.match(e.request);
      if (cached) return cached;
      try {
        const res = await fetch(e.request);
        cache.put(e.request, res.clone()); // 다음번을 위해 캐시 저장
        return res;
      } catch {
        return new Response('오프라인 상태에서는 PDF를 열 수 없습니다.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    })());
    return;
  }

  // 나머지 모든 요청: 캐시 우선, 없으면 네트워크
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('./index.html')) // 네트워크도 실패하면 앱 홈으로
  );
});
