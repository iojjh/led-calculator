const CACHE_VERSION = 'v2134';
const CORE_CACHE    = `led-calc-core-${CACHE_VERSION}`;

// Core assets — always cached; bump CACHE_VERSION to force update
const CORE_ASSETS = [
  './index.html',
  './style.css',
  './script.js',
  './manifest.json',
];

// Extra assets — cached opportunistically (failures ignored)
const EXTRA_ASSETS = [
  './',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './3Y_text.png',
  './3Y_no_bg.png',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  './온보딩 이미지/2.png',
  './온보딩 이미지/3.png',
  './온보딩 이미지/4.png',
  './온보딩 이미지/6.png',
  './온보딩 이미지/7.png',
  './온보딩 이미지/8.png',
  './온보딩 이미지/9.png',
  './MIG-EC90_User_Manual_1.0.pdf',
  './J6-Seamless-Switcher-Specifications-V2.2.0.pdf',
  './MCTRL660PRO.pdf',
  './MCTRL4K.pdf',
];


// Install: cache core + extra assets, then skip waiting
self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CORE_CACHE);
    await cache.addAll(CORE_ASSETS);
    await Promise.allSettled(
      EXTRA_ASSETS.map(url => cache.add(url).catch(() => {}))
    );
    await self.skipWaiting();
  })());
});


// Activate: delete old caches
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => k !== CORE_CACHE)
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});


// Fetch: cache-first, fallback to network
self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) { return; }
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('./index.html'))
  );
});


// Message: SKIP_WAITING or RECACHE_CORE
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
