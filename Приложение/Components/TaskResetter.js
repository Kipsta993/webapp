/**
 * TaskResetter.js
 * Модуль для автоматического сброса задач по расписанию:
 * - Ежедневные задачи сбрасываются каждый день в 00:00
 * - Еженедельные задачи сбрасываются в 00:00 с воскресенья на понедельник
 */

// Самовыполняющаяся функция для изоляции переменных
(function() {
  // Таймаут для сброса задач
  let resetTimeout = null;
  
  // Инициализация после полной загрузки страницы
  window.addEventListener('load', function() {
    // Даем небольшую задержку, чтобы убедиться, что все скрипты загрузились
    setTimeout(function() {
      console.log('Инициализация TaskResetter...');
      // Проверяем доступность необходимых функций
      if (!window.dailyResetTasks) {
        console.warn('TaskResetter: функция dailyResetTasks не найдена');
      }
      if (!window.weeklyResetTasks) {
        console.warn('TaskResetter: функция weeklyResetTasks не найдена');
      }
      
      // Планируем первый сброс
      scheduleTaskReset();
    }, 500);
  });
  
  /**
   * Запланировать сброс задач
   */
  function scheduleTaskReset() {
    // Очищаем предыдущий таймаут, если он был
    if (resetTimeout) {
      clearTimeout(resetTimeout);
    }
    
    // Получаем текущую дату и время
    const now = new Date();
    
    // Вычисляем время до полуночи
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0); // Устанавливаем на полночь следующего дня
    
    const timeToMidnight = midnight - now;
    console.log(`Запланирован сброс задач через ${Math.round(timeToMidnight / 1000 / 60)} минут`);
    
    // Устанавливаем таймаут на полночь
    resetTimeout = setTimeout(function() {
      // При наступлении полуночи сбрасываем задачи
      resetTasks();
      
      // Планируем следующий сброс
      scheduleTaskReset();
    }, timeToMidnight);
  }
  
  /**
   * Сброс выполненных задач
   */
  function resetTasks() {
    const now = new Date();
    console.log('Выполняется сброс задач в', now.toLocaleTimeString());
    
    // Сбрасываем ежедневные задачи каждый день
    resetDailyTasks();
    
    // Сбрасываем еженедельные задачи только в понедельник (0 - воскресенье, 1 - понедельник)
    const dayOfWeek = now.getDay();
    if (dayOfWeek === 1) { // Если понедельник
      resetWeeklyTasks();
    }
  }
  
  /**
   * Сброс ежедневных задач
   */
  function resetDailyTasks() {
    // Используем функцию из Daily.js, если она доступна
    if (window.dailyResetTasks && typeof window.dailyResetTasks === 'function') {
      window.dailyResetTasks();
    } else {
      console.log('Функция сброса ежедневных задач недоступна');
    }
  }
  
  /**
   * Сброс еженедельных задач
   */
  function resetWeeklyTasks() {
    // Используем функцию из Weekly.js, если она доступна
    if (window.weeklyResetTasks && typeof window.weeklyResetTasks === 'function') {
      window.weeklyResetTasks();
    } else {
      console.log('Функция сброса еженедельных задач недоступна');
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
  
  // Экспортируем функции для доступа из других модулей
  window.TaskResetter = {
    scheduleTaskReset: scheduleTaskReset,
    resetDailyTasks: resetDailyTasks,
    resetWeeklyTasks: resetWeeklyTasks
  };
})(); 