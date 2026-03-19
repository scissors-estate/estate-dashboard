// Service Worker for PWA

const CACHE_NAME = 'minpaku-dashboard-v1';

// インストール時
self.addEventListener('install', (event) => {
  console.log('Service Worker インストール');
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  console.log('Service Worker アクティベート');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時
self.addEventListener('fetch', (event) => {
  // GET リクエストのみ処理
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // キャッシュに追加
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // オフライン時の対応
        console.log('オフラインです');
      });
    })
  );
});
