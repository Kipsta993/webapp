/**
 * ActivityTracker.js
 * Модуль для отслеживания времени нахождения пользователя на сайте
 * Отслеживает всё время, пока страница открыта и видима, с точностью до секунды
 * Обновляет данные в реальном времени и сохраняет статистику по дням
 * Сбрасывает счетчик ежедневно в 00:00
 */

// Самовыполняющаяся функция для изоляции переменных
(function() {
  // Основные переменные для отслеживания активности
  let isActive = true;        // Флаг активности пользователя (теперь всегда true, когда страница видима)
  let trackingInterval = null; // Интервал отслеживания
  let resetTimeout = null;     // Таймаут для сброса в 00:00
  let lastActivity = 0;        // Время последней активности пользователя
  
  // Инициализация при загрузке страницы
  document.addEventListener('DOMContentLoaded', function() {
    initTracker();
  });
  
  /**
   * Инициализация трекера активности
   */
  function initTracker() {
    // Инициализация данных в localStorage при первом запуске
    if (!localStorage.getItem('dailyActivityData')) {
      localStorage.setItem('dailyActivityData', JSON.stringify({}));
    }
    
    // Загружаем текущий день
    const today = formatDateKey(new Date());
    let activityData = JSON.parse(localStorage.getItem('dailyActivityData'));
    
    // Если для текущего дня нет данных, создаем запись
    if (!activityData[today]) {
      activityData[today] = 0;
      localStorage.setItem('dailyActivityData', JSON.stringify(activityData));
    }
    
    // Устанавливаем обработчики событий для отслеживания активности
    setupEventListeners();
    
    // Запускаем отслеживание активности
    startActivityTracking();
    
    // Устанавливаем таймер для сброса счетчика в полночь
    scheduleResetAtMidnight();
    
    // Обновляем график активности при загрузке
    updateChartData();
  }
  
  /**
   * Настройка обработчиков событий для отслеживания активности
   */
  function setupEventListeners() {
    // События, указывающие на активность пользователя
    const activityEvents = [
      'mousedown', 'mousemove', 'keydown', 
      'scroll', 'touchstart', 'touchmove', 'click'
    ];
    
    // Добавляем обработчики для каждого события
    activityEvents.forEach(eventType => {
      document.addEventListener(eventType, handleUserActivity, { passive: true });
    });
    
    // События видимости страницы
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Обработка закрытия страницы
    window.addEventListener('beforeunload', saveCurrentActivity);
  }
  
  /**
   * Обработчик активности пользователя
   */
  function handleUserActivity() {
    // Обновляем время последней активности (оставляем для совместимости)
    lastActivity = Date.now();
    
    // Теперь нам не нужно менять isActive, так как он всегда true при видимой странице
  }
  
  /**
   * Обработчик видимости страницы
   */
  function handleVisibilityChange() {
    if (document.visibilityState === 'hidden') {
      // Страница скрыта, сохраняем текущую активность и останавливаем отслеживание
      saveCurrentActivity();
      stopActivityTracking();
      isActive = false; // Устанавливаем неактивно только когда страница скрыта
    } else {
      // Страница снова видима, возобновляем отслеживание
      isActive = true; // Активно, когда страница видима
      startActivityTracking();
      // Обновляем индикатор активности
      handleUserActivity();
    }
  }
  
  /**
   * Запуск отслеживания активности
   */
  function startActivityTracking() {
    if (trackingInterval) return; // Уже запущено
    
    // Запускаем отслеживание активности каждую секунду
    trackingInterval = setInterval(function() {
      // Удаляем проверку на неактивность по таймауту
      // Теперь пользователь считается активным всегда, пока страница видима
      
      // Если страница видима, увеличиваем счетчик активности
      if (isActive) {
        incrementActivityCounter();
      }
      
      // Обновляем данные на графике в реальном времени
      if (window.StatsPage && window.StatsPage.currentPage === 1) {
        updateChartData();
      }
    }, 1000); // Каждую секунду
  }
  
  /**
   * Остановка отслеживания активности
   */
  function stopActivityTracking() {
    if (trackingInterval) {
      clearInterval(trackingInterval);
      trackingInterval = null;
    }
  }
  
  /**
   * Увеличение счетчика активности
   */
  function incrementActivityCounter() {
    const today = formatDateKey(new Date());
    let activityData = JSON.parse(localStorage.getItem('dailyActivityData'));
    
    // Увеличиваем счетчик для текущего дня
    if (!activityData[today]) {
      activityData[today] = 0;
    }
    
    // Увеличиваем на 1 секунду
    activityData[today] += 1;
    
    // Сохраняем обновленные данные
    localStorage.setItem('dailyActivityData', JSON.stringify(activityData));
  }
  
  /**
   * Сохранение текущей активности
   */
  function saveCurrentActivity() {
    // Этот метод сохраняет текущую активность перед закрытием страницы или скрытием вкладки
    // Уже реализовано в incrementActivityCounter, который вызывается каждую секунду
  }
  
  /**
   * Запланировать сброс счетчика в полночь
   */
  function scheduleResetAtMidnight() {
    // Очищаем предыдущий таймаут, если он был
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }
    
    // Получаем текущую дату и время
    const now = new Date();
    
    // Вычисляем время до полуночи
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    
    const timeToMidnight = midnight - now;
    
    // Устанавливаем таймаут на полночь
    resetTimeout = setTimeout(function() {
      // При наступлении полуночи обновляем данные графика
      updateChartData();
      
      // Планируем следующий сброс
      scheduleResetAtMidnight();
    }, timeToMidnight);
  }
  
  /**
   * Обновление данных графика активности
   */
  function updateChartData() {
    // Проверяем наличие функции обновления графика в Stats.js
    if (window.StatsPage && typeof window.StatsPage.updateChartData === 'function') {
      // Получаем текущую выбранную неделю
      const weekDates = window.StatsPage.getWeekDates(window.StatsPage.selectedWeekOffset);
      
      // Передаем даты для обновления графика
      window.StatsPage.updateChartData(weekDates.start, weekDates.end);
    }
  }
  
  /**
   * Форматирование ключа даты (YYYY-MM-DD)
   */
  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  /**
   * Получение времени активности для указанного дня в секундах
   */
  function getActivityForDay(date) {
    const dateKey = formatDateKey(date);
    const activityData = JSON.parse(localStorage.getItem('dailyActivityData')) || {};
    return activityData[dateKey] || 0;
  }
  
  /**
   * Получение времени активности за неделю
   */
  function getWeeklyActivity(startDate, endDate) {
    const activityData = [];
    const currentDate = new Date(startDate);
    
    // Перебираем дни недели
    for (let i = 0; i < 7; i++) {
      const dateKey = formatDateKey(currentDate);
      const dayActivity = getActivityForDay(currentDate);
      
      // Добавляем активность в массив (конвертируем из секунд в минуты)
      activityData.push(Math.floor(dayActivity / 60));
      
      // Переходим к следующему дню
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return activityData;
  }
  
  // Экспортируем публичные методы и свойства
  window.ActivityTracker = {
    getActivityForDay: getActivityForDay,
    getWeeklyActivity: getWeeklyActivity
  };
})(); 