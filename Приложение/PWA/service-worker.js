/**
 * Service Worker для приложения 
 * Обеспечивает фоновую обработку уведомлений и работу офлайн
 */

// Версия кеша
const CACHE_VERSION = 'v1.2';
const CACHE_NAME = `app-cache-${CACHE_VERSION}`;

// Файлы для кеширования
const CACHE_FILES = [
  '/',
  '/index.html',
  'Приложение/reset.css',
  'Приложение/Components/BottomNav.css',
  'Приложение/Daily/Daily.css',
  'Приложение/Weekly/Weekly.css',
  'Приложение/Stats/Stats.css',
  'Приложение/Goals/Goals.css',
  'Приложение/Diary/Diary.css',
  'Приложение/Settings/Settings.css',
  'Приложение/Components/TasksEditor.css',
  'Приложение/Components/ScheduleEditor.css',
  'Приложение/Stats/Stats.js',
  'Приложение/Goals/Goals.js',
  'Приложение/Diary/Diary.js',
  'Приложение/Daily/Daily.js',
  'Приложение/Weekly/Weekly.js',
  'Приложение/Settings/Settings.js',
  'Приложение/Components/TasksEditor.js',
  'Приложение/Components/ScheduleEditor.js',
  'Приложение/Tracking/ActivityTracker.js',
  'Приложение/PWA/manifest.json'
];

// Установка сервис-воркера
self.addEventListener('install', function(event) {
  console.log('Service Worker: Установка');
  
  // Кешируем основные файлы
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Открытие кеша');
        return cache.addAll(CACHE_FILES.map(url => {
          // Адаптируем URL с учетом возможного запуска из поддиректории
          return url.startsWith('/') ? url.substring(1) : url;
        })).catch(error => {
          console.error('Ошибка при кешировании файлов:', error);
          // Если не удалось кешировать все файлы, продолжаем установку service worker
          return Promise.resolve();
        });
      })
      .then(function() {
        // Пропускаем фазу ожидания и переходим к активации
        return self.skipWaiting();
      })
  );
});

// Активация сервис-воркера
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Активация');
  
  // Удаляем старые кеши
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('app-cache-')) {
            console.log('Service Worker: Удаление старого кеша', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      // Принимаем управление над всеми клиентами
      return self.clients.claim();
    })
  );
});

// Перехват запросов и использование кеша
self.addEventListener('fetch', function(event) {
  // Не обрабатываем запросы к внешним ресурсам
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Если ресурс найден в кеше, возвращаем его
        if (response) {
          return response;
        }
        
        // Иначе выполняем запрос к сети
        return fetch(event.request).then(function(networkResponse) {
          // Проверяем, что получили валидный ответ
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          // Клонируем ответ, так как тело ответа может быть использовано только один раз
          var responseToCache = networkResponse.clone();
          
          // Добавляем ответ в кеш для будущих запросов
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return networkResponse;
        });
      })
  );
});

// Обработка события push для получения уведомлений
self.addEventListener('push', function(event) {
  console.log('Service Worker: Получено push-уведомление');
  
  // Если нет данных в push-событии, используем дефолтные значения
  const defaultData = {
    title: 'Новое уведомление',
    body: 'У вас новое уведомление'
  };
  
  let data = {};
  
  // Пытаемся получить данные из push-события
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.error('Ошибка при парсинге данных push:', e);
    }
  }
  
  // Объединяем дефолтные данные с полученными
  const notificationData = {
    ...defaultData,
    ...data,
    timestamp: Date.now(),
    requireInteraction: true // Уведомление не будет автоматически закрыто
  };
  
  console.log('Отправка уведомления с данными:', JSON.stringify(notificationData));
  
  // Показываем уведомление с усиленной вибрацией для лучшего привлечения внимания
  const showNotification = self.registration.showNotification(
    notificationData.title, 
    {
      body: notificationData.body,
      tag: notificationData.tag || 'default',
      data: notificationData.data || {
        url: notificationData.url || '/',
        timestamp: Date.now()
      },
      vibrate: notificationData.vibrate || [200, 100, 200, 100, 200, 100, 200],
      timestamp: notificationData.timestamp,
      requireInteraction: notificationData.requireInteraction,
      sound: 'default',
      renotify: notificationData.renotify !== false, // По умолчанию true
      silent: false // Гарантируем, что уведомление не будет тихим
    }
  );
  
  // Гарантируем, что сервис-воркер не будет завершен до показа уведомления
  event.waitUntil(showNotification);
});

// Обработка события клика по уведомлению
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Клик по уведомлению', event.notification.tag);
  
  // Закрываем уведомление
  event.notification.close();
  
  // Определяем URL для открытия при клике
  let targetUrl = '/';
  
  // Получаем URL из данных уведомления, если он есть
  if (event.notification.data && event.notification.data.url) {
    targetUrl = event.notification.data.url;
  }
  
  // Пытаемся вызвать вибрацию для обратной связи
  try {
    // Вибрация при клике для обратной связи на мобильных устройствах
    if (self.clients && self.clients.matchAll) {
      self.clients.matchAll().then(clients => {
        if (clients && clients.length) {
          // Пытаемся отправить сообщение клиенту для вибрации
          clients.forEach(client => {
            client.postMessage({
              type: 'VIBRATE',
              pattern: [100]
            });
          });
        }
      });
    }
  } catch (e) {
    console.log('Не удалось вызвать вибрацию:', e);
  }
  
  // Открываем/фокусируем окно с нужным URL
  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then(function(clientList) {
      // Ищем уже открытое окно с нашим приложением
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ((client.url === targetUrl || client.url.includes('/index.html')) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Если окно не найдено, открываем новое
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

// Обработка события закрытия уведомления
self.addEventListener('notificationclose', function(event) {
  console.log('Service Worker: Уведомление закрыто', event.notification.tag);
});

// Обработка сообщений от клиентов (страниц приложения)
self.addEventListener('message', function(event) {
  console.log('Service Worker: Получено сообщение от клиента', event.data);
  
  // Если сообщение запрашивает отправку уведомления
  if (event.data && event.data.type === 'SEND_NOTIFICATION') {
    const notificationData = event.data.notification;
    
    // Отправляем уведомление
    self.registration.showNotification(
      notificationData.title, 
      {
        body: notificationData.body,
        tag: notificationData.tag || `notification-${Date.now()}`,
        data: notificationData.data || { timestamp: Date.now() },
        vibrate: notificationData.vibrate || [200, 100, 200, 100, 200],
        requireInteraction: notificationData.requireInteraction !== false, // По умолчанию true
        renotify: notificationData.renotify !== false, // По умолчанию true
        silent: false
      }
    ).then(() => {
      // Отправляем ответ клиенту
      if (event.source) {
        event.source.postMessage({
          type: 'NOTIFICATION_SENT',
          success: true,
          tag: notificationData.tag
        });
      }
    }).catch(error => {
      console.error('Ошибка при отправке уведомления:', error);
      // Отправляем ответ об ошибке клиенту
      if (event.source) {
        event.source.postMessage({
          type: 'NOTIFICATION_SENT',
          success: false,
          error: error.message
        });
      }
    });
  }
});

// Обработка события синхронизации (для отложенных действий)
self.addEventListener('sync', function(event) {
  console.log('Service Worker: Событие синхронизации', event.tag);
  
  // Обрабатываем различные теги синхронизации
  if (event.tag === 'notification-sync') {
    // Здесь можно реализовать отложенную отправку уведомлений
  }
});

// Обработка ошибок
self.addEventListener('error', function(event) {
  console.error('Service Worker: Произошла ошибка', event.error);
});

console.log('Service Worker зарегистрирован версии ' + CACHE_VERSION); 