// Имя кеша и список файлов для кеширования
const CACHE_NAME = 'myapp-v1';
const BASE_URL = 'https://kipsta993.github.io/webapp';
const urlsToCache = [
  `${BASE_URL}/`,
  `${BASE_URL}/index.html`,
  `${BASE_URL}/manifest.json`,
  `${BASE_URL}/Приложение/reset.css`,
  `${BASE_URL}/Приложение/Components/BottomNav.css`,
  `${BASE_URL}/Приложение/Daily/Daily.css`,
  `${BASE_URL}/Приложение/Weekly/Weekly.css`,
  `${BASE_URL}/Приложение/Stats/Stats.css`,
  `${BASE_URL}/Приложение/Goals/Goals.css`,
  `${BASE_URL}/Приложение/Diary/Diary.css`,
  `${BASE_URL}/Приложение/Settings/Settings.css`,
  `${BASE_URL}/Приложение/Components/TasksEditor.css`,
  `${BASE_URL}/Приложение/Components/ScheduleEditor.css`,
  `${BASE_URL}/Приложение/Components/CheckboxStyles.css`,
  `${BASE_URL}/Приложение/Daily/Daily.js`,
  `${BASE_URL}/Приложение/Weekly/Weekly.js`,
  `${BASE_URL}/Приложение/Stats/Stats.js`,
  `${BASE_URL}/Приложение/Goals/Goals.js`,
  `${BASE_URL}/Приложение/Diary/Diary.js`,
  `${BASE_URL}/Приложение/Settings/Settings.js`,
  `${BASE_URL}/Приложение/Components/TasksEditor.js`,
  `${BASE_URL}/Приложение/Components/ScheduleEditor.js`,
  `${BASE_URL}/Приложение/Tracking/ActivityTracker.js`
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