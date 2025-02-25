// Версия кеша
const CACHE_VERSION = 'v1';
const CACHE_NAME = `daily-tasks-${CACHE_VERSION}`;

// Файлы для кеширования
const urlsToCache = [
  '/',
  '/index.html',
  '/Daily/Daily.css',
  '/Daily/Daily.js',
  '/Weekly/Weekly.html',
  '/Weekly/Weekly.css',
  '/Weekly/Weekly.js',
  '/Settings/Settings.html',
  '/Settings/Settings.css',
  '/Settings/Settings.js',
  '/Прочее/Монета.png',
  '/Прочее/Огонь.png'
];

// Установка Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker: Установка');
  
  // Кешируем файлы
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Кеширование файлов');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker: Активация');
  
  // Удаляем старые кеши
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Удаление старого кеша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Перехват запросов
self.addEventListener('fetch', event => {
  console.log('Service Worker: Перехват запроса', event.request.url);
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кешированный ответ, если он есть
        if (response) {
          console.log('Service Worker: Возвращаем из кеша', event.request.url);
          return response;
        }
        
        // Иначе делаем запрос к сети
        console.log('Service Worker: Запрос к сети', event.request.url);
        return fetch(event.request).then(response => {
          // Проверяем, что ответ валидный
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Клонируем ответ, так как он может быть использован только один раз
          const responseToCache = response.clone();
          
          // Кешируем ответ
          caches.open(CACHE_NAME)
            .then(cache => {
              console.log('Service Worker: Кеширование нового ресурса', event.request.url);
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// Обработка уведомлений
self.addEventListener('push', event => {
  console.log('Service Worker: Получено push-уведомление', event);
  
  const title = 'Daily Tasks';
  const options = {
    body: event.data ? event.data.text() : 'Новое уведомление',
    icon: '/Прочее/Огонь.png',
    badge: '/Прочее/Монета.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Открыть приложение'
      },
      {
        action: 'close',
        title: 'Закрыть'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Клик по уведомлению', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // Открываем приложение
    event.waitUntil(
      clients.openWindow('/')
    );
  }
}); 