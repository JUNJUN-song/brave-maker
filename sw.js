/* 오프라인 캐시 — 한 번 열면 이후 인터넷 없이도 실행된다.
 * 코드를 고쳐 다시 올릴 때는 VERSION 을 올리면 휴대폰의 앱도 새 버전으로 바뀐다.
 * (저장된 용사 기록은 캐시와 별개라 업데이트해도 지워지지 않는다)
 */
const VERSION = 'bm-v1.9.2';
const FILES = [
  './', './index.html', './diagnosis.html', './village.html', './manifest.webmanifest',
  './css/pixel.css',
  './js/config.js', './js/util.js', './js/questions.js', './js/scoring.js', './js/adaptive.js', './js/gem.js',
  './js/portraits.js', './js/brooch.js', './js/scene_art.js', './js/scene.js', './js/weather.js',
  './js/three.min.js', './js/growth.js', './js/cloud.js', './js/storage.js', './js/ui.js', './js/app.js', './js/diag.js',
  './fonts/Galmuri11.woff2', './fonts/Galmuri11-Bold.woff2', './fonts/Galmuri9.woff2',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// 캐시 우선, 없으면 네트워크 (같은 사이트 파일만)
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit || fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
