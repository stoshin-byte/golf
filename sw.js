const CACHE_NAME = 'golf-pwa-v2'; // ★ バージョンを v2 に変更
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

// インストール時に新しいキャッシュを作成し、即座に有効化
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 古いSWの終了を待たずに即時適用
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

// 古いバージョンのキャッシュ（v1など）を自動削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// ネットワーク優先（ネットに繋がっていれば常に最新を取得）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 取得に成功したらキャッシュも更新
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, resClone));
        return response;
      })
      .catch(() => caches.match(event.request)) // 電波がない時だけキャッシュを使用
  );
});
