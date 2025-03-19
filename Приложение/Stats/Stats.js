/**
 * JavaScript для страницы Stats
 * Обеспечивает переключение между страницами статистики с помощью свайпов
 */

document.addEventListener('DOMContentLoaded', function() {
  const statsPage = document.querySelector('.stats-page');
  const timeContent = document.getElementById('time-content');
  const tasksContent = document.getElementById('tasks-content');
  const pageDots = document.querySelectorAll('.page-dot');
  
  // Переменные для отслеживания свайпов
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 50;
  
  // Текущая страница и общее количество страниц
  let currentPage = 1;
  const totalPages = 2;
  
  // Таймер для обновления времени
  let timeUpdateTimer = null;
  
  // Время начала использования приложения (получаем из localStorage или устанавливаем текущее)
  let appStartTime = localStorage.getItem('appStartTime') ? new Date(localStorage.getItem('appStartTime')) : new Date();
  
  // Если это первый запуск, сохраняем время начала
  if (!localStorage.getItem('appStartTime')) {
    localStorage.setItem('appStartTime', appStartTime.toISOString());
  }
  
  // Глобальные переменные для статистики задач
  let tasksStats = {
    totalCompleted: 0,
    dailyCompleted: 0,
    weeklyCompleted: 0,
    currentStreak: 0,
    maxStreak: 0
  };
  
  // Функция для показа страницы времени
  function showTimePage() {
    timeContent.style.display = 'block';
    tasksContent.style.display = 'none';
    currentPage = 1;
    
    // Обновляем индикатор страницы
    pageDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === 0);
    });
    
    // Запускаем обновление времени при показе страницы времени
    startTimeUpdate();
  }
  
  // Функция для показа страницы задач
  function showTasksPage() {
    timeContent.style.display = 'none';
    tasksContent.style.display = 'block';
    currentPage = 2;
    
    // Обновляем индикатор страницы
    pageDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === 1);
    });
    
    // Останавливаем обновление времени при уходе со страницы времени
    stopTimeUpdate();
  }
  
  // Функция для запуска обновления времени
  function startTimeUpdate() {
    // Сначала остановим текущий таймер, если он есть
    stopTimeUpdate();
    
    // Обновляем время сразу
    updateAppTime();
    
    // Запускаем обновление каждую секунду
    timeUpdateTimer = setInterval(updateAppTime, 1000);
  }
  
  // Функция для остановки обновления времени
  function stopTimeUpdate() {
    if (timeUpdateTimer) {
      clearInterval(timeUpdateTimer);
      timeUpdateTimer = null;
    }
  }
  
  // Функция для обновления отображаемого времени в приложении
  function updateAppTime() {
    // Получаем текущие настройки отображения времени
    const settings = JSON.parse(localStorage.getItem('timeUnitSettings')) || {};
    
    // Получаем все элементы отображения времени
    const secondsElement = document.querySelector('.time-unit[data-time-unit="seconds"] .time-value');
    const minutesElement = document.querySelector('.time-unit[data-time-unit="minutes"] .time-value');
    const hoursElement = document.querySelector('.time-unit[data-time-unit="hours"] .time-value');
    const daysElement = document.querySelector('.time-unit[data-time-unit="days"] .time-value');
    const weeksElement = document.querySelector('.time-unit[data-time-unit="weeks"] .time-value');
    const monthsElement = document.querySelector('.time-unit[data-time-unit="months"] .time-value');
    const yearsElement = document.querySelector('.time-unit[data-time-unit="years"] .time-value');
    
    // Если элементы не найдены, выходим
    if (!secondsElement || !minutesElement || !hoursElement || !daysElement || 
        !weeksElement || !monthsElement || !yearsElement) {
      return;
    }
    
    // Рассчитываем разницу между текущим временем и временем начала использования
    const now = new Date();
    const timeDiff = now - appStartTime;
    
    // Рассчитываем время в разных единицах
    let seconds = Math.floor((timeDiff / 1000) % 60);
    let minutes = Math.floor((timeDiff / (1000 * 60)) % 60);
    let hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);
    let days = Math.floor((timeDiff / (1000 * 60 * 60 * 24)) % 30);
    let weeks = Math.floor((timeDiff / (1000 * 60 * 60 * 24 * 7)) % 4);
    let months = Math.floor((timeDiff / (1000 * 60 * 60 * 24 * 30)) % 12);
    let years = Math.floor(timeDiff / (1000 * 60 * 60 * 24 * 365));
    
    // Учитываем настройки отображения и конвертируем единицы времени
    
    // Определяем, какие единицы времени отображаются
    const showSeconds = settings.hasOwnProperty('seconds') ? settings.seconds : true;
    const showMinutes = settings.hasOwnProperty('minutes') ? settings.minutes : true;
    const showHours = settings.hasOwnProperty('hours') ? settings.hours : true;
    const showDays = settings.hasOwnProperty('days') ? settings.days : true;
    const showWeeks = settings.hasOwnProperty('weeks') ? settings.weeks : true;
    const showMonths = settings.hasOwnProperty('months') ? settings.months : true;
    const showYears = settings.hasOwnProperty('years') ? settings.years : true;
    
    // Конвертируем единицы времени с учетом отключенных меток
    
    // Если секунды отключены, добавляем их к минутам
    if (!showSeconds && showMinutes) {
      minutes += Math.floor(seconds / 60);
      seconds = 0;
    }
    
    // Если минуты отключены, добавляем их к часам
    if (!showMinutes && showHours) {
      hours += Math.floor(minutes / 60);
      minutes = 0;
    }
    
    // Если часы отключены, добавляем их к дням
    if (!showHours && showDays) {
      days += Math.floor(hours / 24);
      hours = 0;
    }
    
    // Если дни отключены, добавляем их к неделям или месяцам
    if (!showDays) {
      if (showWeeks) {
        weeks += Math.floor(days / 7);
        days = 0;
      } else if (showMonths) {
        months += Math.floor(days / 30);
        days = 0;
      } else if (showYears) {
        years += Math.floor(days / 365);
        days = 0;
      }
    }
    
    // Если недели отключены, добавляем их к месяцам
    if (!showWeeks && showMonths) {
      months += Math.floor(weeks / 4);
      weeks = 0;
    }
    
    // Если месяцы отключены, добавляем их к годам
    if (!showMonths && showYears) {
      years += Math.floor(months / 12);
      months = 0;
    }
    
    // Теперь проверяем для метрик, которые остались, нужно ли конвертировать их в более крупные единицы
    
    // Конвертируем секунды в минуты
    if (showSeconds && showMinutes && seconds >= 60) {
      minutes += Math.floor(seconds / 60);
      seconds %= 60;
    }
    
    // Конвертируем минуты в часы
    if (showMinutes && showHours && minutes >= 60) {
      hours += Math.floor(minutes / 60);
      minutes %= 60;
    }
    
    // Конвертируем часы в дни
    if (showHours && showDays && hours >= 24) {
      days += Math.floor(hours / 24);
      hours %= 24;
    }
    
    // Конвертируем дни в недели или месяцы
    if (showDays) {
      if (showWeeks && days >= 7) {
        weeks += Math.floor(days / 7);
        days %= 7;
      } else if (!showWeeks && showMonths && days >= 30) {
        months += Math.floor(days / 30);
        days %= 30;
      }
    }
    
    // Конвертируем недели в месяцы
    if (showWeeks && showMonths && weeks >= 4) {
      months += Math.floor(weeks / 4);
      weeks %= 4;
    }
    
    // Конвертируем месяцы в годы
    if (showMonths && showYears && months >= 12) {
      years += Math.floor(months / 12);
      months %= 12;
    }
    
    // Обновляем отображение
    secondsElement.textContent = seconds.toString();
    minutesElement.textContent = minutes.toString();
    hoursElement.textContent = hours.toString();
    daysElement.textContent = days.toString();
    weeksElement.textContent = weeks.toString();
    monthsElement.textContent = months.toString();
    yearsElement.textContent = years.toString();
  }
  
  // Инициализация - показываем первую страницу
  showTimePage();
  
  // Вызываем обновление времени после загрузки страницы
  // для установки правильных начальных значений
  updateAppTime();
  
  // Обработчики событий для свайпов
  statsPage.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  
  statsPage.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].clientX;
    handleSwipe();
  }, { passive: true });
  
  // Функция обработки свайпа
  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    
    // Свайп влево (следующая страница)
    if (swipeDistance < -minSwipeDistance && currentPage < totalPages) {
      showTasksPage();
    }
    
    // Свайп вправо (предыдущая страница)
    if (swipeDistance > minSwipeDistance && currentPage > 1) {
      showTimePage();
    }
  }
  
  // Добавляем обработчики кликов на точки индикатора
  pageDots.forEach((dot, index) => {
    dot.addEventListener('click', function() {
      if (index === 0) {
        showTimePage();
      } else if (index === 1) {
        showTasksPage();
      }
    });
  });
  
  // Настройки отображения времени
  const timeSettingsBtn = document.getElementById('time-settings-btn');
  const timeSettingsModal = document.getElementById('time-settings-modal');
  const timeSettingsClose = document.getElementById('time-settings-close');
  const timeSettingsSave = document.getElementById('time-settings-save');
  const timeSettingCheckboxes = document.querySelectorAll('.time-setting-checkbox');
  
  // Проверяем наличие элементов
  if (!timeSettingsBtn || !timeSettingsModal) return;
  
  // Функция для открытия модального окна настроек времени
  function openTimeSettingsModal() {
    timeSettingsModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Загружаем текущие настройки
    loadTimeSettings();
  }
  
  // Функция для закрытия модального окна настроек времени
  function closeTimeSettingsModal() {
    timeSettingsModal.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  // Функция для загрузки текущих настроек
  function loadTimeSettings() {
    // Получаем сохраненные настройки из localStorage
    const savedSettings = JSON.parse(localStorage.getItem('timeUnitSettings')) || {};
    
    // Устанавливаем состояние чекбоксов в соответствии с сохраненными настройками
    timeSettingCheckboxes.forEach(checkbox => {
      const unit = checkbox.getAttribute('data-unit');
      
      // Если настройка для этой единицы времени сохранена, используем её
      // Иначе по умолчанию все единицы времени отображаются (checked = true)
      if (savedSettings.hasOwnProperty(unit)) {
        checkbox.checked = savedSettings[unit];
      } else {
        checkbox.checked = true;
      }
    });
    
    // Обновляем отображение времени, чтобы показать текущее состояние
    updateAppTime();
  }
  
  // Функция для сохранения настроек
  function saveTimeSettings() {
    const settings = {};
    
    // Собираем настройки из чекбоксов
    timeSettingCheckboxes.forEach(checkbox => {
      const unit = checkbox.getAttribute('data-unit');
      settings[unit] = checkbox.checked;
    });
    
    // Сохраняем настройки в localStorage
    localStorage.setItem('timeUnitSettings', JSON.stringify(settings));
    
    // Применяем настройки к отображению
    applyTimeSettings();
    
    // Обновляем время немедленно и запускаем/перезапускаем таймер
    if (currentPage === 1) {
      startTimeUpdate();
    }
    
    // Закрываем модальное окно
    closeTimeSettingsModal();
  }
  
  // Функция для применения настроек к отображению
  function applyTimeSettings() {
    const settings = JSON.parse(localStorage.getItem('timeUnitSettings')) || {};
    const timeCounter = document.querySelector('.time-counter');
    
    if (!timeCounter) return;
    
    // Сначала скрываем/показываем единицы времени согласно настройкам
    const timeUnits = timeCounter.querySelectorAll('.time-unit');
    timeUnits.forEach(unit => {
      const unitType = unit.getAttribute('data-time-unit');
      
      if (settings.hasOwnProperty(unitType)) {
        unit.classList.toggle('hidden', !settings[unitType]);
      } else {
        unit.classList.remove('hidden');
      }
    });
    
    // Теперь перестраиваем разделители
    // Сначала скрываем все разделители
    const separators = timeCounter.querySelectorAll('.separator-wrapper');
    separators.forEach(separator => {
      separator.classList.add('hidden');
    });
    
    // Затем проходим по всем дочерним элементам контейнера
    const children = Array.from(timeCounter.children);
    let lastVisibleUnitIndex = -1;
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      
      // Если это видимая единица времени
      if (child.classList.contains('time-unit') && !child.classList.contains('hidden')) {
        // Если уже была найдена видимая единица времени ранее
        if (lastVisibleUnitIndex !== -1) {
          // Ищем первый разделитель между последней видимой единицей и текущей
          for (let j = lastVisibleUnitIndex + 1; j < i; j++) {
            if (children[j].classList.contains('separator-wrapper')) {
              children[j].classList.remove('hidden');
              break; // Показываем только один разделитель между видимыми единицами
            }
          }
        }
        
        lastVisibleUnitIndex = i;
      }
    }
    
    // Обновляем отображение времени
    updateAppTime();
  }
  
  // Добавляем обработчики событий
  timeSettingsBtn.addEventListener('click', openTimeSettingsModal);
  timeSettingsClose.addEventListener('click', closeTimeSettingsModal);
  timeSettingsSave.addEventListener('click', saveTimeSettings);
  
  // Закрытие модального окна при клике на фон
  timeSettingsModal.addEventListener('click', function(event) {
    if (event.target === timeSettingsModal) {
      closeTimeSettingsModal();
    }
  });
  
  // Закрытие модального окна при нажатии Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && timeSettingsModal.classList.contains('active')) {
      closeTimeSettingsModal();
    }
  });
  
  // Применяем сохраненные настройки при загрузке страницы
  applyTimeSettings();

  // Функциональность выбора недели
  const weekPrevBtn = document.querySelector('.week-prev-btn');
  const weekNextBtn = document.querySelector('.week-next-btn');
  const weekCurrentBtn = document.querySelector('.week-current-btn');
  const weekDisplay = document.querySelector('.week-display');
  
  // Текущая выбранная неделя (по умолчанию - текущая)
  let selectedWeekOffset = 0; // 0 = текущая неделя, -1 = предыдущая, 1 = следующая и т.д.
  
  // Функция для форматирования даты в формате "DD.MM" вместо "DD месяц YYYY"
  function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    return `${day}.${month}`;
  }
  
  // Функция для получения начала и конца недели по смещению от текущей
  function getWeekDates(weekOffset = 0) {
    const now = new Date();
    const currentDay = now.getDay(); // 0 = воскресенье, 1 = понедельник, ..., 6 = суббота
    
    // Корректируем для недели, начинающейся с понедельника
    const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Начало текущей недели (понедельник)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - daysFromMonday + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);
    
    // Конец текущей недели (воскресенье)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  }
  
  // Функция для обновления отображения выбранной недели
  function updateWeekDisplay() {
    const { start, end } = getWeekDates(selectedWeekOffset);
    const startFormatted = formatDate(start);
    const endFormatted = formatDate(end);
    
    // Обновляем текст отображения недели
    weekDisplay.textContent = `${startFormatted} - ${endFormatted}`;
    
    // Сохраняем выбранную дату в localStorage
    localStorage.setItem('selectedWeekStart', start.toISOString());
    
    // Обновляем данные графика
    updateChartData(start, end);
  }
  
  // Обработчики событий для кнопок навигации
  weekPrevBtn.addEventListener('click', function() {
    selectedWeekOffset--;
    updateWeekDisplay();
  });
  
  weekNextBtn.addEventListener('click', function() {
    selectedWeekOffset++;
    updateWeekDisplay();
  });
  
  weekCurrentBtn.addEventListener('click', function() {
    selectedWeekOffset = 0;
    updateWeekDisplay();
  });
  
  // Инициализация отображения текущей недели
  updateWeekDisplay();
  
  // Обработчик при уходе со страницы для остановки таймера
  document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'hidden') {
      stopTimeUpdate();
    } else if (document.visibilityState === 'visible' && currentPage === 1) {
      startTimeUpdate();
    }
  });

  // Функция для обновления данных графика 
  function updateChartData(startDate, endDate) {
    // Получаем элементы графика
    const dayBars = document.querySelectorAll('.day-bar');
    const dayTimes = document.querySelectorAll('.day-time');
    const dayColumns = document.querySelectorAll('.day-column');
    
    if (dayBars.length !== 7 || dayTimes.length !== 7 || dayColumns.length !== 7) {
      return;
    }
    
    // Получаем данные о времени использования по дням
    const usageData = getUserTimeByDay(startDate, endDate);
    
    // Находим максимальное время использования для масштабирования
    let maxTime = 0;
    for (const dayTime of Object.values(usageData)) {
      if (dayTime > maxTime) {
        maxTime = dayTime;
      }
    }
    
    // Если нет данных, устанавливаем минимальное значение
    if (maxTime === 0) {
      maxTime = 1;
    }
    
    // Текущая дата для определения, наступил ли день
    const today = new Date();
    
    // Обновляем столбики графика
    const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    
    dayBars.forEach((dayBar, index) => {
      const dayTime = usageData[index];
      const dayOfWeek = daysOfWeek[index];
      
      // Получаем дату для текущего дня недели
      const currentDayDate = new Date(startDate);
      currentDayDate.setDate(startDate.getDate() + index);
      
      // Проверяем, наступил ли этот день
      const isFutureDay = currentDayDate > today;
      
      if (isFutureDay) {
        // Скрываем столбик для будущих дней
        dayColumns[index].style.visibility = 'hidden';
      } else {
        // Показываем столбик для прошедших и текущих дней
        dayColumns[index].style.visibility = 'visible';
        
        // Вычисляем высоту столбика (максимум 98% чтобы не выходил за границы)
        const height = dayTime > 0 ? Math.min(98, (dayTime / maxTime) * 98) : 0;
        dayBars[index].style.height = `${height}%`;
        
        // Форматируем и отображаем время использования
        dayTimes[index].textContent = formatUsageTime(dayTime);
      }
    });
  }
  
  // Функция для получения времени использования по дням
  function getUserTimeByDay(startDate, endDate) {
    // Проверяем доступность ActivityTracker
    if (window.ActivityTracker && typeof window.ActivityTracker.getWeeklyActivity === 'function') {
      // Используем данные из ActivityTracker (они уже в минутах)
      return window.ActivityTracker.getWeeklyActivity(startDate, endDate);
    }
    
    // Резервный вариант, если ActivityTracker недоступен
    const timeByDay = [0, 0, 0, 0, 0, 0, 0];
    
    // Попытка загрузить данные из localStorage
    const appUsageData = localStorage.getItem('appUsageData') ? 
      JSON.parse(localStorage.getItem('appUsageData')) : {};
    
    // Текущая дата
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Перебираем дни выбранной недели
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      // Форматируем дату в строку для использования в качестве ключа
      const dateKey = formatDateKey(currentDate);
      
      // Проверяем, есть ли данные для этого дня
      if (appUsageData[dateKey]) {
        timeByDay[i] = appUsageData[dateKey];
      } else if (currentDate <= today) {
        // Если текущий день уже прошел, но данных нет, генерируем случайное значение
        // В реальном приложении эту строку следует удалить
        timeByDay[i] = Math.floor(Math.random() * 180); // Случайное время от 0 до 180 минут
      }
    }
    
    return timeByDay;
  }
  
  // Функция для форматирования ключа даты (YYYY-MM-DD)
  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Функция форматирования времени использования (в минутах) в читаемую строку
  function formatUsageTime(minutes) {
    if (minutes < 60) {
      return `${minutes}м`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (mins === 0) {
        return `${hours}ч`;
      } else {
        return `${hours}ч ${mins}м`;
      }
    }
  }
  
  // Загружаем и отображаем статистику по задачам
  loadAndUpdateTasksStats();

  // Функция для загрузки и обновления статистики задач
  function loadAndUpdateTasksStats() {
    calculateTasksStats();
    updateTasksStatsDisplay();
  }

  // Функция для расчета статистики задач
  function calculateTasksStats() {
    // Получаем задачи из localStorage
    const dailyTasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    const weeklyTasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    
    // Считаем количество выполненных задач
    tasksStats.dailyCompleted = dailyTasks.filter(task => task.completed).length;
    tasksStats.weeklyCompleted = weeklyTasks.filter(task => task.completed).length;
    tasksStats.totalCompleted = tasksStats.dailyCompleted + tasksStats.weeklyCompleted;
    
    // Рассчитываем серии дней
    calculateStreaks();
  }

  // Функция для расчета серии дней
  function calculateStreaks() {
    // Получаем историю выполнения задач или создаем ее, если не существует
    let completionHistory = JSON.parse(localStorage.getItem('tasksCompletionHistory')) || {};
    
    // Если истории нет, создаем ее
    if (Object.keys(completionHistory).length === 0) {
      createCompletionHistory();
      completionHistory = JSON.parse(localStorage.getItem('tasksCompletionHistory')) || {};
    }
    
    // Проверяем выполнение задач за текущий день
    checkTodayTasksCompletion();
    
    // Перезагружаем историю, так как она могла измениться
    completionHistory = JSON.parse(localStorage.getItem('tasksCompletionHistory')) || {};
    
    // Расчет текущей серии дней
    let currentStreak = 0;
    const today = getTodayInMoscowTimezone();
    let checkDate = new Date(today);
    
    // Уменьшаем дату на один день для проверки предыдущих дней
    checkDate.setDate(checkDate.getDate());
    
    // Проверяем каждый предыдущий день, пока не найдем день без выполненных задач
    while (true) {
      const dateKey = formatDateKey(checkDate);
      
      // Проверяем, есть ли запись за этот день и все ли задачи выполнены
      if (completionHistory[dateKey] && completionHistory[dateKey].allCompleted) {
        currentStreak++;
      } else {
        break;
      }
      
      // Переходим к предыдущему дню
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    tasksStats.currentStreak = currentStreak;
    
    // Расчет максимальной серии дней
    let maxStreak = localStorage.getItem('maxTasksStreak') ? parseInt(localStorage.getItem('maxTasksStreak')) : 0;
    
    // Обновляем максимальную серию, если текущая больше
    if (currentStreak > maxStreak) {
      maxStreak = currentStreak;
      localStorage.setItem('maxTasksStreak', maxStreak.toString());
    }
    
    tasksStats.maxStreak = maxStreak;
  }

  // Функция для создания истории выполнения задач
  function createCompletionHistory() {
    const dailyTasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    const weeklyTasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    const completionHistory = {};
    
    // Получаем текущую дату в московском часовом поясе
    const today = getTodayInMoscowTimezone();
    const dateKey = formatDateKey(today);
    
    // Проверяем, все ли задачи на сегодня выполнены
    const allDailyTasksCompleted = dailyTasks.length > 0 && dailyTasks.every(task => task.completed);
    const allWeeklyTasksCompleted = weeklyTasks.length > 0 && weeklyTasks.every(task => task.completed);
    const allTasksCompleted = (dailyTasks.length > 0 || weeklyTasks.length > 0) && 
                              (allDailyTasksCompleted && allWeeklyTasksCompleted);
    
    // Записываем информацию о выполнении задач на сегодня
    completionHistory[dateKey] = {
      dailyCompleted: dailyTasks.filter(task => task.completed).length,
      weeklyCompleted: weeklyTasks.filter(task => task.completed).length,
      totalCompleted: dailyTasks.filter(task => task.completed).length + weeklyTasks.filter(task => task.completed).length,
      allCompleted: allTasksCompleted,
      date: today.toISOString()
    };
    
    // Сохраняем историю в localStorage
    localStorage.setItem('tasksCompletionHistory', JSON.stringify(completionHistory));
  }

  // Функция для проверки выполнения задач за текущий день
  function checkTodayTasksCompletion() {
    const dailyTasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    const weeklyTasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    let completionHistory = JSON.parse(localStorage.getItem('tasksCompletionHistory')) || {};
    
    // Получаем текущую дату в московском часовом поясе
    const today = getTodayInMoscowTimezone();
    const dateKey = formatDateKey(today);
    
    // Проверяем, все ли задачи на сегодня выполнены
    const allDailyTasksCompleted = dailyTasks.length > 0 && dailyTasks.every(task => task.completed);
    const allWeeklyTasksCompleted = weeklyTasks.length > 0 && weeklyTasks.every(task => task.completed);
    const allTasksCompleted = (dailyTasks.length > 0 || weeklyTasks.length > 0) && 
                              (allDailyTasksCompleted && allWeeklyTasksCompleted);
    
    // Обновляем информацию о выполнении задач на сегодня
    completionHistory[dateKey] = {
      dailyCompleted: dailyTasks.filter(task => task.completed).length,
      weeklyCompleted: weeklyTasks.filter(task => task.completed).length,
      totalCompleted: dailyTasks.filter(task => task.completed).length + weeklyTasks.filter(task => task.completed).length,
      allCompleted: allTasksCompleted,
      date: today.toISOString()
    };
    
    // Сохраняем обновленную историю в localStorage
    localStorage.setItem('tasksCompletionHistory', JSON.stringify(completionHistory));
  }

  // Функция для получения текущей даты в московском часовом поясе (UTC+3)
  function getTodayInMoscowTimezone() {
    // Создаем объект Date с текущей датой и временем
    const now = new Date();
    
    // Получаем смещение времени пользователя в минутах
    const userOffsetMinutes = now.getTimezoneOffset();
    
    // Смещение московского времени (UTC+3) в минутах
    const moscowOffsetMinutes = -180; // -3 часа * 60 минут
    
    // Вычисляем разницу между пользовательским временем и московским
    const differenceMinutes = moscowOffsetMinutes - userOffsetMinutes;
    
    // Создаем новую дату, учитывая смещение
    const moscowDate = new Date(now.getTime() + differenceMinutes * 60000);
    
    // Устанавливаем время на начало дня
    moscowDate.setHours(0, 0, 0, 0);
    
    return moscowDate;
  }

  // Функция для обновления отображения статистики задач
  function updateTasksStatsDisplay() {
    // Обновляем отображение количества выполненных задач
    document.querySelector('.task-stat-card:nth-child(1) .task-stat-value').textContent = tasksStats.totalCompleted;
    document.querySelector('.task-stat-card:nth-child(2) .task-stat-value').textContent = tasksStats.dailyCompleted;
    document.querySelector('.task-stat-card:nth-child(3) .task-stat-value').textContent = tasksStats.weeklyCompleted;
    
    // Обновляем отображение серий дней
    document.querySelector('.streak-card:nth-child(1) .streak-value').textContent = tasksStats.currentStreak;
    document.querySelector('.streak-card:nth-child(2) .streak-value').textContent = tasksStats.maxStreak;
  }

  // Обновляем экспорт необходимых функций
  window.StatsPage = {
    currentPage: currentPage,
    selectedWeekOffset: selectedWeekOffset,
    getWeekDates: getWeekDates,
    updateChartData: updateChartData,
    loadAndUpdateTasksStats: loadAndUpdateTasksStats
  };
});
