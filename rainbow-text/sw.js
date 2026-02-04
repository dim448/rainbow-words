const CACHE_NAME = 'rainbow-text-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  // Добавь сюда все иконки и другие файлы, если они есть
  'https://cdn.jsdelivr.net/npm/djvujs@latest/dist/djvu.min.js'
];

// Установка и кэширование
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Кэш открыт');
        return cache.addAll(urlsToCache);
      })
  );
});

// Активация и очистка старых кэшей
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
});

// Стратегия кэш → сеть
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Если в кэше — возвращаем
        if (response) {
          return response;
        }
        // Иначе идём в сеть и кэшируем ответ
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        });
      })
  );
});