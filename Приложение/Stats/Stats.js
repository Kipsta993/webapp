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
  
  // Функция для показа страницы времени
  function showTimePage() {
    timeContent.style.display = 'block';
    tasksContent.style.display = 'none';
    currentPage = 1;
    
    // Обновляем индикатор страницы
    pageDots.forEach((dot, index) => {
      dot.classList.toggle('active', index === 0);
    });
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
  }
  
  // Инициализация - показываем первую страницу
  showTimePage();
  
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
  const weekValue = document.querySelector('.week-value');
  
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
    
    weekValue.textContent = `${startFormatted} - ${endFormatted}`;
    
    // Здесь можно добавить код для обновления данных графика
    // на основе выбранной недели
    console.log(`Выбрана неделя: ${startFormatted} - ${endFormatted}`);
    
    // Пример данных для разных недель (в реальном приложении данные будут загружаться из базы данных)
    const weeklyData = [
      // Текущая неделя
      [
        { day: 'Пн', time: '1ч 20м', height: 40 },
        { day: 'Вт', time: '2ч 10м', height: 65 },
        { day: 'Ср', time: '1ч 00м', height: 30 },
        { day: 'Чт', time: '2ч 40м', height: 80 },
        { day: 'Пт', time: '1ч 50м', height: 55 },
        { day: 'Сб', time: '0ч 50м', height: 25 },
        { day: 'Вс', time: '1ч 30м', height: 45 }
      ],
      // Предыдущая неделя
      [
        { day: 'Пн', time: '0ч 50м', height: 25 },
        { day: 'Вт', time: '1ч 30м', height: 45 },
        { day: 'Ср', time: '2ч 00м', height: 60 },
        { day: 'Чт', time: '1ч 40м', height: 50 },
        { day: 'Пт', time: '2ч 20м', height: 70 },
        { day: 'Сб', time: '3ч 00м', height: 90 },
        { day: 'Вс', time: '1ч 10м', height: 35 }
      ],
      // Неделя до предыдущей
      [
        { day: 'Пн', time: '1ч 40м', height: 50 },
        { day: 'Вт', time: '1ч 20м', height: 40 },
        { day: 'Ср', time: '0ч 30м', height: 15 },
        { day: 'Чт', time: '1ч 10м', height: 35 },
        { day: 'Пт', time: '2ч 30м', height: 75 },
        { day: 'Сб', time: '1ч 50м', height: 55 },
        { day: 'Вс', time: '2ч 00м', height: 60 }
      ]
    ];
    
    // Получаем индекс данных для выбранной недели
    // В реальном приложении здесь будет логика получения данных из базы
    const dataIndex = Math.abs(selectedWeekOffset) % weeklyData.length;
    
    // Временно отключаем обновление высоты столбцов и значений времени
    /*
    const dayBars = document.querySelectorAll('.day-bar');
    const dayTimes = document.querySelectorAll('.day-time');
    
    if (dayBars.length === 7 && dayTimes.length === 7) {
      weeklyData[dataIndex].forEach((dayData, index) => {
        dayBars[index].style.height = `${dayData.height}%`;
        dayTimes[index].textContent = dayData.time;
      });
    }
    */
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
});
