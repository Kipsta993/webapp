/**
 * NotificationManager.js
 * Модуль для управления системой уведомлений о расписании
 */

const NotificationManager = (function() {
  // Приватные переменные
  let scheduledNotifications = [];
  
  // Проверка поддержки уведомлений
  function checkNotificationSupport() {
    if (!('Notification' in window)) {
      console.log('Браузер не поддерживает уведомления');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.log('Нет разрешения на отправку уведомлений');
      return false;
    }
    
    return true;
  }
  
  // Функция для запроса разрешения на уведомления
  function requestPermission() {
    return new Promise((resolve, reject) => {
      if (!('Notification' in window)) {
        reject('Уведомления не поддерживаются');
        return;
      }
      
      // Уже имеем разрешение
      if (Notification.permission === 'granted') {
        resolve();
        return;
      }
      
      // Разрешение было отклонено ранее
      if (Notification.permission === 'denied') {
        reject('Уведомления были отклонены пользователем');
        return;
      }
      
      // Запрашиваем разрешение
      Notification.requestPermission()
        .then(permission => {
          if (permission === 'granted') {
            resolve();
          } else {
            reject('Пользователь отклонил запрос на уведомления');
          }
        })
        .catch(error => {
          reject(`Ошибка запроса разрешения: ${error}`);
        });
    });
  }
  
  // Отправка уведомления
  function sendNotification(title, options = {}) {
    if (!checkNotificationSupport()) {
      return Promise.reject('Уведомления не поддерживаются или запрещены');
    }
    
    // Стандартные опции уведомления
    const defaultOptions = {
      body: '',
      icon: 'icon-192x192.png',
      badge: 'icon-192x192.png', 
      vibrate: [200, 100, 200],
      sound: 'default',
      requireInteraction: true
    };
    
    // Объединяем пользовательские опции с дефолтными
    const notificationOptions = { ...defaultOptions, ...options };
    
    // Отправляем уведомление через Service Worker, если доступен
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      return navigator.serviceWorker.ready
        .then(registration => {
          return registration.showNotification(title, notificationOptions);
        })
        .catch(error => {
          console.error('Ошибка отправки уведомления через Service Worker:', error);
          // Запасной вариант - отправка через стандартный API
          new Notification(title, notificationOptions);
          return Promise.resolve();
        });
    } else {
      // Отправка через стандартный API, если Service Worker недоступен
      new Notification(title, notificationOptions);
      return Promise.resolve();
    }
  }
  
  // Планирование уведомлений для задания из расписания
  function scheduleTaskNotifications(task) {
    // Удаляем старые уведомления для этого задания, если они существуют
    cancelTaskNotifications(task.id);
    
    // Преобразуем строки с временем в объекты Date
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const [startHours, startMinutes] = task.startTime.split(':').map(Number);
    const taskStartTime = new Date(today);
    taskStartTime.setHours(startHours, startMinutes, 0, 0);
    
    // Рассчитываем время для уведомления за 10 минут до начала
    const reminderTime = new Date(taskStartTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - 10);
    
    // Проверяем, не прошло ли уже время для уведомлений
    if (reminderTime > now) {
      // Планируем уведомление за 10 минут до начала
      const reminderTimeoutId = setTimeout(() => {
        sendNotification('Скоро начнется задание', {
          body: `${task.title} начнется через 10 минут`,
          tag: `reminder-${task.id}`
        });
      }, reminderTime - now);
      
      scheduledNotifications.push({
        id: task.id,
        type: 'reminder',
        timeoutId: reminderTimeoutId
      });
    }
    
    if (taskStartTime > now) {
      // Планируем уведомление на начало задания
      const startTimeoutId = setTimeout(() => {
        sendNotification('Задание началось', {
          body: `${task.title} началось сейчас`,
          tag: `start-${task.id}`
        });
      }, taskStartTime - now);
      
      scheduledNotifications.push({
        id: task.id,
        type: 'start',
        timeoutId: startTimeoutId
      });
    }
  }
  
  // Отмена запланированных уведомлений для задания
  function cancelTaskNotifications(taskId) {
    const toRemove = scheduledNotifications.filter(item => item.id === taskId);
    for (const item of toRemove) {
      clearTimeout(item.timeoutId);
    }
    
    // Удаляем отмененные уведомления из массива
    scheduledNotifications = scheduledNotifications.filter(item => item.id !== taskId);
  }
  
  // Планирование всех уведомлений на сегодня
  function scheduleAllTodayTasks() {
    // Получаем список заданий из localStorage
    const schedule = JSON.parse(localStorage.getItem('schedule') || '[]');
    
    // Отменяем все существующие уведомления
    cancelAllNotifications();
    
    // Планируем новые уведомления для каждого задания
    for (const task of schedule) {
      scheduleTaskNotifications(task);
    }
  }
  
  // Отмена всех запланированных уведомлений
  function cancelAllNotifications() {
    for (const item of scheduledNotifications) {
      clearTimeout(item.timeoutId);
    }
    
    scheduledNotifications = [];
  }
  
  // Инициализация при загрузке страницы
  function init() {
    // Запрашиваем разрешение на уведомления и планируем уведомления
    requestPermission()
      .then(() => {
        console.log('Разрешение на уведомления получено');
        scheduleAllTodayTasks();
      })
      .catch(error => {
        console.log('Не удалось получить разрешение на уведомления:', error);
      });
    
    // Очищаем и перепланируем уведомления при полночи
    scheduleResetAtMidnight();
  }
  
  // Планирование перезапуска уведомлений в полночь
  function scheduleResetAtMidnight() {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    
    const timeUntilMidnight = midnight - now;
    
    setTimeout(() => {
      scheduleAllTodayTasks();
      scheduleResetAtMidnight(); // Планируем снова для следующего дня
    }, timeUntilMidnight);
  }
  
  // Публичные методы
  return {
    init,
    requestPermission,
    sendNotification,
    scheduleTaskNotifications,
    cancelTaskNotifications,
    scheduleAllTodayTasks,
    cancelAllNotifications
  };
})();

// Экспортируем в глобальное пространство имен
window.NotificationManager = NotificationManager; 