// Имя кеша и список файлов для кеширования
const CACHE_NAME = 'myapp-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/Приложение/reset.css',
  '/Приложение/Components/BottomNav.css',
  '/Приложение/Daily/Daily.css',
  '/Приложение/Weekly/Weekly.css',
  '/Приложение/Stats/Stats.css',
  '/Приложение/Goals/Goals.css',
  '/Приложение/Diary/Diary.css',
  '/Приложение/Settings/Settings.css',
  '/Приложение/Components/TasksEditor.css',
  '/Приложение/Components/ScheduleEditor.css',
  '/Приложение/Components/CheckboxStyles.css',
  '/Приложение/Daily/Daily.js',
  '/Приложение/Weekly/Weekly.js',
  '/Приложение/Stats/Stats.js',
  '/Приложение/Goals/Goals.js',
  '/Приложение/Diary/Diary.js',
  '/Приложение/Settings/Settings.js',
  '/Приложение/Components/TasksEditor.js',
  '/Приложение/Components/ScheduleEditor.js',
  '/Приложение/Tracking/ActivityTracker.js'
];

// Установка Service Worker и кеширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Открыт кеш:', CACHE_NAME);
        // Кешируем каждый файл по отдельности, чтобы ошибка с одним файлом не прерывала кеширование остальных
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(error => {
              console.log('Не удалось кешировать:', url, error);
            })
          )
        );
      })
  );
});

// Активация Service Worker и удаление старых кешей
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Перехват запросов и возврат кешированных ресурсов
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Возвращаем кешированный ресурс, если он есть
        if (response) {
          return response;
        }
        
        // Иначе выполняем запрос к сети
        return fetch(event.request).then(
          (response) => {
            // Не кешируем ответы с ошибками
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Клонируем ответ, так как тело ответа может быть прочитано только один раз
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }
        );
      })
  );
}); 