// Версия кеша (изменить при обновлении файлов)
const CACHE_NAME = 'myapp-cache-v1';

// Файлы для кеширования при установке
const urlsToCache = [
  'https://kipsta993.github.io/webapp/',
  'https://kipsta993.github.io/webapp/index.html',
  'https://kipsta993.github.io/webapp/Приложение/reset.css',
  'https://kipsta993.github.io/webapp/Приложение/Daily/Daily.css',
  'https://kipsta993.github.io/webapp/Приложение/Weekly/Weekly.css',
  'https://kipsta993.github.io/webapp/Приложение/Stats/Stats.css',
  'https://kipsta993.github.io/webapp/Приложение/Goals/Goals.css',
  'https://kipsta993.github.io/webapp/Приложение/Diary/Diary.css',
  'https://kipsta993.github.io/webapp/Приложение/Settings/Settings.css',
  'https://kipsta993.github.io/webapp/Приложение/Components/BottomNav.css',
  'https://kipsta993.github.io/webapp/Приложение/Components/CheckboxStyles.css',
  'https://kipsta993.github.io/webapp/Приложение/Daily/Daily.js',
  'https://kipsta993.github.io/webapp/Приложение/Weekly/Weekly.js',
  'https://kipsta993.github.io/webapp/Приложение/Stats/Stats.js',
  'https://kipsta993.github.io/webapp/Приложение/Goals/Goals.js',
  'https://kipsta993.github.io/webapp/Приложение/Diary/Diary.js',
  'https://kipsta993.github.io/webapp/Приложение/Settings/Settings.js',
  'https://kipsta993.github.io/webapp/Приложение/Components/TasksEditor.js',
  'https://kipsta993.github.io/webapp/Приложение/Tracking/ActivityTracker.js',
  'https://kipsta993.github.io/webapp/PWA/pwa-installer.js',
  'https://kipsta993.github.io/webapp/PWA/pwa-styles.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css'
];

// Установка сервис-воркера и кеширование файлов
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Открыт кеш');
        return cache.addAll(urlsToCache);
      })
  );
});

// Простой перехват запросов для обслуживания из кеша
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем из кеша, если есть
        if (response) {
          return response;
        }
        // Иначе делаем сетевой запрос
        return fetch(event.request);
      })
  );
});

// Очистка старых версий кеша
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Удаляем старый кеш:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
}); 