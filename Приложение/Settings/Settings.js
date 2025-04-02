// Настройки приложения

document.addEventListener('DOMContentLoaded', function() {
  // Сбрасываем размер текста к 100%
  document.documentElement.style.fontSize = '100%';
  localStorage.removeItem('textSize');
  
  // Определение типа устройства - перемещаем в начало скрипта
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || ('ontouchstart' in window);
  console.log('Текущее устройство определено как ' + (isMobileDevice ? 'мобильное' : 'настольное'));
  
  // Элементы настроек
  const settingsPanel = document.getElementById('settings-panel');
  const themeSelect = document.getElementById('theme-select');
  const languageToggle = document.getElementById('language-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const checkboxStyleSelect = document.getElementById('checkbox-style-select');
  const checkboxMarkSelect = document.getElementById('checkbox-mark-select');
  
  // Переменные для отслеживания свайпа
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50; // Минимальное расстояние свайпа для активации
  
  // Элементы для настройки размера страницы
  const openSizeEditorBtn = document.getElementById('openSizeEditorBtn');
  const currentPageSizeValue = document.getElementById('currentPageSizeValue');
  
  // Элементы плавающей панели размера
  const sizeControlPanel = document.getElementById('size-control-panel');
  const sizePanelSlider = document.getElementById('sizePanelSlider');
  const sizePanelValue = document.getElementById('sizePanelValue');
  const sizePanelResetBtn = document.getElementById('sizePanelResetBtn');
  const sizePanelSaveBtn = document.getElementById('sizePanelSaveBtn');
  
  // Элементы модального окна настройки чекбоксов
  const checkboxSettingsModal = document.getElementById('checkbox-settings-modal');
  const checkboxPageTitle = document.getElementById('checkbox-page-title');
  const modalCheckboxStyleSelect = document.getElementById('modal-checkbox-style-select');
  const modalCheckboxMarkSelect = document.getElementById('modal-checkbox-mark-select');
  const modalCheckboxShapeSelect = document.getElementById('modal-checkbox-shape-select');
  const checkboxSettingsClose = document.getElementById('checkbox-settings-close');
  const checkboxSettingsSave = document.getElementById('checkbox-settings-save');
  const checkboxSettingsReset = document.getElementById('checkbox-settings-reset');
  const previewCheckbox = document.getElementById('preview-checkbox');
  
  // Текущая страница для настройки чекбоксов
  let currentCheckboxPage = 'all';
  
  // Временное хранение размера (до сохранения)
  let tempPageSize = 0;
  
  // Сохраненный размер страницы или значение по умолчанию
  let savedPageSize = localStorage.getItem('pageSize') || '100';
  let currentPageSize = savedPageSize;
  
  // Сразу устанавливаем переменные CSS для прогресса слайдеров
  document.documentElement.style.setProperty('--size-panel-progress', `${((parseInt(currentPageSize) - 70) / 60) * 100}%`);
  document.documentElement.style.setProperty('--size-compact-progress', `${((parseInt(currentPageSize) - 70) / 60) * 100}%`);
  
  // Инициализация всех настроек при загрузке страницы
  initTheme();
  initLanguage();
  initSound();
  initCheckboxStyle();
  setupSizeControls();
  
  // Применяем сохраненный размер страницы
  applyPageSize(savedPageSize);
  
  // Инициализируем слайдеры с текущим значением
  if (sizePanelSlider) {
    sizePanelSlider.value = currentPageSize;
    updateSliderProgress(sizePanelSlider);
  }
  
  // Обработчик для выбора темы
  themeSelect.addEventListener('change', function() {
    setTheme(this.value);
  });
  
  // Обработчик для переключения языка
  languageToggle.addEventListener('change', function() {
    setLanguage(this.checked ? 'en' : 'ru');
  });
  
  // Обработчик для переключения звука
  soundToggle.addEventListener('change', function() {
    setSoundEnabled(this.checked);
  });
  
  // Обработчик для переключения стиля чекбоксов
  if (checkboxStyleSelect) {
  checkboxStyleSelect.addEventListener('change', function() {
    setCheckboxStyle(this.value);
  });
  }
  
  // Слушаем событие touchstart для отслеживания начала свайпа
  document.addEventListener('touchstart', function(e) {
    // Игнорируем сенсорные события на полях ввода
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    touchStartY = e.touches[0].clientY;
    
    // Если касание началось на верхней части экрана
    if (touchStartY < 100 && window.scrollY <= 0) {
      // Можно добавить логику для свайпа вниз
    }
  }, { passive: true });
  
  document.addEventListener('touchmove', function(e) {
    // Проверяем, можно ли отменить событие перед вызовом preventDefault
    if (e.cancelable) {
    const touchY = e.touches[0].clientY;
    
    // Если свайп сверху вниз и мы находимся в верхней части страницы
    if (window.scrollY <= 0 && touchY < 100) {
      // Предотвращаем стандартное поведение браузера (pull-to-refresh)
      e.preventDefault();
      }
    }
  }, { passive: false });
  
  // Обработчик для открытия панели настроек при свайпе сверху вниз
  document.addEventListener('touchstart', function(e) {
    // Сохраняем начальную позицию для открытия панели настроек
    if (!settingsPanel.classList.contains('active')) {
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });
  
  document.addEventListener('touchend', function(e) {
    // Обрабатываем свайп только если панель настроек не открыта
    if (!settingsPanel.classList.contains('active')) {
      touchEndY = e.changedTouches[0].clientY;
      
      // Если свайп сверху вниз в верхней части экрана
      const swipeDistance = touchEndY - touchStartY;
      if (swipeDistance > minSwipeDistance && touchStartY < 100) {
        openSettingsPanel();
      }
    }
  }, { passive: true });
  
  // Обработчик для перетаскивания панели настроек только за хендл
  const settingsHandle = document.querySelector('.settings-handle');
  
  settingsHandle.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: false });
  
  settingsHandle.addEventListener('touchmove', function(e) {
    // Проверяем, можно ли отменить событие перед вызовом preventDefault
    if (e.cancelable) {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    
    // Если тянем вверх, то закрываем панель
    if (deltaY < 0) {
      const translateY = Math.abs(deltaY);
      settingsPanel.style.transform = `translateY(-${translateY / settingsPanel.offsetHeight * 100}%)`;
      }
    }
  }, { passive: false });
  
  settingsHandle.addEventListener('touchend', function(e) {
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Если перетащили достаточно далеко вверх, закрываем панель
    if (deltaY < -settingsPanel.offsetHeight * 0.1) {
      closeSettingsPanel();
    } else {
      // Иначе возвращаем панель в открытое положение
      settingsPanel.style.transform = '';
      settingsPanel.classList.add('active');
    }
  }, { passive: false });
  
  // Функция открытия панели настроек
  function openSettingsPanel() {
    settingsPanel.classList.add('active');
  }
  
  // Функция закрытия панели настроек
  function closeSettingsPanel() {
    settingsPanel.style.transform = '';
    settingsPanel.classList.remove('active');
  }
  
  // Обработчик для открытия плавающей панели размера
  if (openSizeEditorBtn) {
    // Добавляем обработчик касания для мобильных устройств
    openSizeEditorBtn.addEventListener('touchstart', function(e) {
      // Предотвращаем двойные события на мобильных
      e.preventDefault();
      
      // Закрываем панель настроек
      closeSettingsPanel();
      
      // Сохраняем текущий размер во временной переменной
      tempPageSize = currentPageSize;
      
      // Устанавливаем текущее значение на слайдере
      sizePanelSlider.value = currentPageSize;
      sizePanelValue.textContent = currentPageSize + '%';
      
      // Сразу обновляем CSS-переменные для прогресса
      const percent = ((parseInt(currentPageSize) - 70) / 60) * 100;
      document.documentElement.style.setProperty('--size-panel-progress', `${percent}%`);
      
      // Открываем панель размера немедленно без задержки
      sizeControlPanel.classList.add('active');
      
      // Обновляем полосу прогресса слайдера при открытии
      updateSliderProgress(sizePanelSlider);
      
      // Принудительно вызываем перерисовку для обновления полосы
      window.getComputedStyle(sizePanelSlider).getPropertyValue('--size-panel-progress');
    }, { passive: false });
    
    // Оставляем обработчик клика для десктопов
    openSizeEditorBtn.addEventListener('click', function() {
      // Закрываем панель настроек
      closeSettingsPanel();
      
      // Сохраняем текущий размер во временной переменной
      tempPageSize = currentPageSize;
      
      // Устанавливаем текущее значение на слайдере
      sizePanelSlider.value = currentPageSize;
      sizePanelValue.textContent = currentPageSize + '%';
      
      // Сразу обновляем CSS-переменные для прогресса
      const percent = ((parseInt(currentPageSize) - 70) / 60) * 100;
      document.documentElement.style.setProperty('--size-panel-progress', `${percent}%`);
      
      // Открываем панель размера немедленно без задержки
      sizeControlPanel.classList.add('active');
      
      // Обновляем полосу прогресса слайдера при открытии
      updateSliderProgress(sizePanelSlider);
      
      // Принудительно вызываем перерисовку для обновления полосы
      window.getComputedStyle(sizePanelSlider).getPropertyValue('--size-panel-progress');
    });
  }
  
  // Переменные для отслеживания свайпа панели вправо
  let sizeControlTouchStartX = 0;
  let sizeControlTouchEndX = 0;
  const minSizeControlSwipeDistance = 30; // Уменьшаем минимальное расстояние свайпа для активации с 50 до 30px
  
  // Инициализация обработчиков свайпа для всех устройств (не только мобильных)
  if (sizeControlPanel) {
    console.log('Инициализация обработчиков свайпа для панели размера');
    
    // Обработчики для свайпа панели настройки размера вправо для открытия настроек чекбоксов
    sizeControlPanel.addEventListener('touchstart', function(e) {
      if (this.classList.contains('active')) {
        // Сохраняем начальную позицию X для отслеживания свайпа вправо
        sizeControlTouchStartX = e.touches[0].clientX;
        console.log('Начало свайпа на X:', sizeControlTouchStartX);
      }
    }, { passive: true });
    
    // Упрощенный обработчик touchmove - только для отладки
    sizeControlPanel.addEventListener('touchmove', function(e) {
      if (this.classList.contains('active')) {
        // Просто логгируем для отладки
        const currentX = e.touches[0].clientX;
        const moveDistance = currentX - sizeControlTouchStartX;
        console.log('Движение свайпа, расстояние:', moveDistance);
      }
    }, { passive: true });
    
    // Обработчик touchend - просто переключаем панели
    sizeControlPanel.addEventListener('touchend', function(e) {
      if (this.classList.contains('active')) {
        // Получаем конечную позицию X
        sizeControlTouchEndX = e.changedTouches[0].clientX;
        
        // Вычисляем расстояние свайпа
        const swipeDistance = sizeControlTouchEndX - sizeControlTouchStartX;
        
        console.log('Конец свайпа, расстояние:', swipeDistance, 'минимальное требуемое:', minSizeControlSwipeDistance);
        
        // Если свайп вправо достаточно длинный
        if (swipeDistance > minSizeControlSwipeDistance) {
          console.log('Свайп вправо сработал - открываем настройки чекбоксов');
          
          // Закрываем панель настройки размера
          this.classList.remove('active');
          
          // Открываем настройки чекбоксов для всех страниц
          openCheckboxSettings('all');
        }
      }
    }, { passive: true });
  }
  
  // Обработчики для плавающей панели размера
  if (sizePanelSlider) {
    // Преобразуем события касания в события мыши, чтобы улучшить отзывчивость на мобильных
    sizePanelSlider.addEventListener('touchstart', function(e) {
      // Предотвращаем скролл во время управления слайдером
      e.preventDefault();
      
      // Получаем координаты касания
      const touch = e.touches[0];
      const sliderRect = this.getBoundingClientRect();
      const percent = (touch.clientX - sliderRect.left) / sliderRect.width;
      
      // Устанавливаем значение слайдера на основе позиции касания
      const min = parseInt(this.min) || 0;
      const max = parseInt(this.max) || 100;
      this.value = Math.round(min + percent * (max - min));
      
      // Инициируем событие input, чтобы обновить интерфейс
      this.dispatchEvent(new Event('input'));
    }, { passive: false });
    
    // Обработчик перемещения пальца по слайдеру
    sizePanelSlider.addEventListener('touchmove', function(e) {
      // Предотвращаем скролл во время управления слайдером
      e.preventDefault();
      
      // Получаем координаты касания
      const touch = e.touches[0];
      const sliderRect = this.getBoundingClientRect();
      const percent = (touch.clientX - sliderRect.left) / sliderRect.width;
      
      // Устанавливаем значение слайдера на основе позиции касания
      const min = parseInt(this.min) || 0;
      const max = parseInt(this.max) || 100;
      this.value = Math.round(min + percent * (max - min));
      
      // Инициируем событие input, чтобы обновить интерфейс
      this.dispatchEvent(new Event('input'));
    }, { passive: false });
    
    // Обработчик во время движения ползунка
    sizePanelSlider.addEventListener('input', function() {
      const size = this.value;
      sizePanelValue.textContent = size + '%';
      
      // Применяем размер временно (без сохранения)
      applyTempPageSize(size);
      
      // Обновляем полосу прогресса
      updateSliderProgress(this);
    });
    
    // Дополнительный обработчик для завершения изменения
    sizePanelSlider.addEventListener('change', function() {
      updateSliderProgress(this);
    });
    
    // Инициализируем полосу прогресса при загрузке страницы
    updateSliderProgress(sizePanelSlider);
  }
  
  // Добавляем обработчик клика по значению размера для возможности ручного ввода
  if (sizePanelValue) {
    // Функция для входа в режим редактирования размера
    function enterSizeEditMode() {
      const currentValue = parseInt(tempPageSize);
      
      // Создаем поле ввода
      const input = document.createElement('input');
      input.type = 'number';
      input.min = 70;
      input.max = 130;
      input.value = currentValue;
      input.className = 'size-value-input';
      input.pattern = "[0-9]*"; // Для вызова числовой клавиатуры на мобильных
      
      // Заменяем текст на поле ввода
      sizePanelValue.textContent = '';
      sizePanelValue.appendChild(input);
      
      // Устанавливаем фокус на поле ввода
      input.focus();
      input.select();
      
      // Обработчик изменения значения
      input.addEventListener('input', function() {
        let value = parseInt(this.value);
        
        // Проверяем, что значение - число
        if (isNaN(value)) return;
        
        // Ограничиваем значение от 70 до 130
        if (value < 70) value = 70;
        if (value > 130) value = 130;
        
        // Обновляем слайдер
        sizePanelSlider.value = value;
        
        // Обновляем полосу прогресса
        updateSliderProgress(sizePanelSlider);
        
        // Применяем размер временно
        applyTempPageSize(value);
      });
      
      // Обработчик потери фокуса
      input.addEventListener('blur', function() {
        let value = parseInt(this.value);
        
        // Ограничиваем значение от 70 до 130
        if (isNaN(value) || value < 70) value = 70;
        if (value > 130) value = 130;
        
        // Возвращаем текстовое представление
        sizePanelValue.textContent = value + '%';
        
        // Обновляем слайдер
        sizePanelSlider.value = value;
        
        // Обновляем полосу прогресса
        updateSliderProgress(sizePanelSlider);
        
        // Применяем размер временно
        applyTempPageSize(value);
      });
      
      // Обработчик нажатия Enter
      input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          this.blur();
        }
      });
    }
    
    // Обработчик для клика (десктоп)
    sizePanelValue.addEventListener('click', enterSizeEditMode);
    
    // Обработчик для касания (мобильные)
    sizePanelValue.addEventListener('touchstart', function(e) {
      // Предотвращаем двойные события на мобильных
      e.preventDefault();
      enterSizeEditMode();
    }, { passive: false });
  }
  
  if (sizePanelResetBtn) {
    sizePanelResetBtn.addEventListener('touchstart', function(e) {
      e.preventDefault(); // Предотвращаем двойные события на мобильных
      resetTempPageSize();
      sizePanelSlider.value = 100;
      sizePanelValue.textContent = '100%';
      
      // Обновляем полосу прогресса
      updateSliderProgress(sizePanelSlider);
    }, { passive: false });
    
    sizePanelResetBtn.addEventListener('click', function() {
      resetTempPageSize();
      sizePanelSlider.value = 100;
      sizePanelValue.textContent = '100%';
      
      // Обновляем полосу прогресса
      updateSliderProgress(sizePanelSlider);
    });
  }
  
  if (sizePanelSaveBtn) {
    sizePanelSaveBtn.addEventListener('touchstart', function(e) {
      e.preventDefault(); // Предотвращаем двойные события на мобильных
      // Сохраняем временный размер
      savePageSize();
      
      // Закрываем панель настройки размера
      sizeControlPanel.classList.remove('active');
    }, { passive: false });
    
    sizePanelSaveBtn.addEventListener('click', function() {
      // Сохраняем временный размер
      savePageSize();
      
      // Закрываем панель настройки размера
      sizeControlPanel.classList.remove('active');
    });
  }
  
  // Инициализация темы
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    
    // Устанавливаем положение переключателя
    themeSelect.value = savedTheme;
    
    // Применяем сохраненную тему
    setTheme(savedTheme);
  }
  
  // Установка темы
  function setTheme(theme) {
    // Сохраняем выбор темы в localStorage
    localStorage.setItem('theme', theme);
    
    // Удаляем все классы тем с body
    document.body.classList.remove('light-theme', 'dark-theme');
    
    // Применяем выбранную тему
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
    } else if (theme === 'system') {
      // Определяем системную тему
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.classList.add('dark-theme');
      }
      
      // Слушаем изменения системной темы
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('theme') === 'system') {
          if (e.matches) {
            document.body.classList.add('dark-theme');
          } else {
            document.body.classList.remove('dark-theme');
          }
        }
      });
    }
  }
  
  // Инициализация языка
  function initLanguage() {
    const savedLanguage = localStorage.getItem('navLanguage') || 'ru';
    
    // Устанавливаем положение переключателя
    languageToggle.checked = savedLanguage === 'en';
    
    // Применяем сохраненный язык
    setLanguage(savedLanguage);
  }
  
  // Установка языка
  function setLanguage(language) {
    // Сохраняем выбор языка в localStorage
    localStorage.setItem('navLanguage', language);
    
    // Определяем тексты для навигации
    const navTexts = {
      ru: {
        daily: 'Ежедневные',
        weekly: 'Еженедельные',
        stats: 'Статистика',
        goals: 'Цели',
        diary: 'Дневник'
      },
      en: {
        daily: 'Daily',
        weekly: 'Weekly',
        stats: 'Stats',
        goals: 'Goals',
        diary: 'Diary'
      }
    };
    
    // Получаем все элементы навигации
    const navItems = document.querySelectorAll('.nav-item');
    
    // Обновляем тексты
    navItems.forEach(item => {
      const page = item.getAttribute('data-page');
      const textSpan = item.querySelector('span');
      
      if (textSpan && navTexts[language][page]) {
        textSpan.textContent = navTexts[language][page];
      }
    });
  }
  
  // Инициализация настроек звука
  function initSound() {
    const savedSound = localStorage.getItem('soundEnabled');
    
    // Устанавливаем положение переключателя
    soundToggle.checked = savedSound !== 'false';
    
    // Добавляем обработчик событий
    soundToggle.addEventListener('change', function() {
      setSoundEnabled(this.checked);
    });
  }
  
  // Установка состояния звука
  function setSoundEnabled(enabled) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('soundEnabled', enabled);
    
    // Здесь можно добавить дополнительную логику для управления звуками
  }
  
  // Функция инициализации настроек чекбоксов
  function initCheckboxStyle() {
    // Проверяем, запускается ли приложение впервые или после обновления
    const checkboxInitialized = localStorage.getItem('checkboxInitialized');
    
    // Если первый запуск или после обновления, очищаем все старые стили
    if (!checkboxInitialized) {
      clearAllCheckboxClasses();
      // Отмечаем, что инициализация выполнена
      localStorage.setItem('checkboxInitialized', 'true');
    }
    
    // Находим все кнопки для открытия настроек чекбоксов
    const checkboxSettingsButtons = document.querySelectorAll('.checkbox-settings-button');
    
    // Устанавливаем обработчики для кнопок открытия настроек
    checkboxSettingsButtons.forEach(button => {
      button.addEventListener('click', function() {
        const page = this.getAttribute('data-page');
        openCheckboxSettings(page);
      });
    });
    
    // Устанавливаем обработчики событий для селектов в модальном окне
    if (modalCheckboxStyleSelect) {
      modalCheckboxStyleSelect.addEventListener('change', function() {
        // Применяем изменения стиля в реальном времени
        const style = this.value;
        setCheckboxStyle(style, currentCheckboxPage);
        showNotification('Стиль применен', 'info');
      });
    }
    
    if (modalCheckboxMarkSelect) {
      modalCheckboxMarkSelect.addEventListener('change', function() {
        // Применяем изменения метки в реальном времени
        const style = this.value;
        setCheckboxMarkStyle(style, currentCheckboxPage);
        showNotification('Вид чекбоксов применен', 'info');
      });
    }
    
    if (modalCheckboxShapeSelect) {
      modalCheckboxShapeSelect.addEventListener('change', function() {
        // Применяем изменения формы в реальном времени
        const style = this.value;
        setCheckboxShapeStyle(style, currentCheckboxPage);
        showNotification('Форма чекбоксов применена', 'info');
      });
    }
    
    // Обработчик кнопки закрытия
    if (checkboxSettingsClose) {
      checkboxSettingsClose.addEventListener('click', closeCheckboxSettings);
    }
    
    // Обработчик кнопки сброса
    if (checkboxSettingsReset) {
      checkboxSettingsReset.addEventListener('click', function() {
        resetCheckboxSettings(currentCheckboxPage);
      });
    }
    
    // Добавляем кнопку настроек чекбоксов на страницу Goals, если её ещё нет
    const goalsHeader = document.querySelector('.goals-header');
    if (goalsHeader && !goalsHeader.querySelector('.checkbox-settings-button')) {
      const settingsButton = document.createElement('button');
      settingsButton.className = 'settings-button-small checkbox-settings-button';
      settingsButton.setAttribute('data-page', 'goals');
      settingsButton.innerHTML = '<i class="fas fa-cog"></i>';
      settingsButton.addEventListener('click', function() {
        openCheckboxSettings('goals');
      });
      goalsHeader.appendChild(settingsButton);
    }
    
    // Применяем сохраненные настройки при загрузке страницы
    applyCheckboxSettings();
  }
  
  // Настройка контролов размера страницы
  function setupSizeControls() {
    // Кнопка открытия панели настройки размера
    if (openSizeEditorBtn) {
      openSizeEditorBtn.addEventListener('click', function() {
        sizeControlPanel.classList.add('active');
      });
    }
    
    // Кнопка сброса размера
    if (sizePanelResetBtn) {
      sizePanelResetBtn.addEventListener('click', function() {
        sizePanelSlider.value = 100;
        sizePanelValue.textContent = '100%';
        applyTempPageSize(100);
        updateSliderProgress(sizePanelSlider);
      });
    }
    
    // Кнопка сохранения размера
    if (sizePanelSaveBtn) {
      sizePanelSaveBtn.addEventListener('click', function() {
        const size = sizePanelSlider.value;
        applyPageSize(size);
        sizeControlPanel.classList.remove('active');
        
        // Обновляем значение в панели настроек
        if (currentPageSizeValue) {
          currentPageSizeValue.textContent = size + '%';
        }
      });
    }
    
    // Закрытие панели при клике вне панели
    document.addEventListener('click', function(e) {
      // Проверяем, что клик не на поле ввода и не на текстовой области
      const isInputField = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      
      // Если клик на поле ввода, не выполняем никаких действий
      if (isInputField) {
        return;
      }
      
      if (sizeControlPanel.classList.contains('active')) {
        // Проверяем, что клик был не по панели и не по кнопке открытия
        if (!sizeControlPanel.contains(e.target) && e.target !== openSizeEditorBtn) {
          sizeControlPanel.classList.remove('active');
        }
      }
    });
    
    // Обработчик для слайдера размера
    if (sizePanelSlider) {
      // Предотвращаем скролл во время взаимодействия со слайдером
      sizePanelSlider.addEventListener('touchstart', function(e) {
        e.preventDefault();
      }, { passive: false });
    }
  }
  
  // Функция применения временного размера страницы (без сохранения)
  function applyTempPageSize(size) {
    size = parseInt(size);
    
    // Ограничиваем значение от 70 до 130
    if (size < 70) size = 70;
    if (size > 130) size = 130;
    
    // Сохраняем временный размер
    tempPageSize = size;
    
    // Применяем размер через transform: scale()
    const scale = size / 100;
    const container = document.querySelector('.container');
    if (container) {
      container.style.transform = `scale(${scale})`;
    }
  }
  
  // Функция применения размера страницы
  function applyPageSize(size) {
    size = parseInt(size);
    
    // Ограничиваем значение от 70 до 130
    if (size < 70) size = 70;
    if (size > 130) size = 130;
    
    // Применяем размер через transform: scale()
    const scale = size / 100;
    const container = document.querySelector('.container');
    if (container) {
      container.style.transform = `scale(${scale})`;
    }
    
    // Обновляем отображение текущего размера
    if (currentPageSizeValue) {
      currentPageSizeValue.textContent = size + '%';
    }
    
    // Сохраняем текущий размер в переменной
    currentPageSize = size;
  }
  
  // Функция для сброса временного размера страницы на 100%
  function resetTempPageSize() {
    // Применяем размер 100% временно
    applyTempPageSize(100);
    
    // Обновляем временный размер
    tempPageSize = 100;
  }
  
  // Функция для сброса размера страницы на 100%
  function resetPageSize() {
    // Применяем размер 100%
    applyPageSize(100);
  }
  
  // Функция для сохранения размера страницы
  function savePageSize() {
    // Сохраняем временный размер как текущий
    currentPageSize = tempPageSize;
    
    // Сохраняем текущий размер в localStorage
    localStorage.setItem('pageSize', currentPageSize);
    
    // Обновляем сохраненный размер
    savedPageSize = currentPageSize;
    
    // Обновляем отображение в настройках
    if (currentPageSizeValue) {
      currentPageSizeValue.textContent = currentPageSize + '%';
    }
    
    // Показываем уведомление о сохранении
    showSaveNotification();
  }
  
  // Функция для отображения уведомления о сохранении
  function showSaveNotification() {
    // Проверяем, есть ли уже уведомление
    let notification = document.querySelector('.save-notification');
    
    // Если нет, создаем новое
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'save-notification';
      notification.innerHTML = '<i class="fas fa-check-circle"></i> Размер сохранен';
      document.body.appendChild(notification);
    }
    
    // Показываем уведомление
    notification.classList.add('active');
    
    // Скрываем через 2 секунды без анимации
    setTimeout(() => {
      notification.classList.remove('active');
    }, 2000);
  }
  
  // Функция для обновления полосы прогресса слайдера
  function updateSliderProgress(slider) {
    if (!slider) return;
    
    const min = parseInt(slider.min) || 0;
    const max = parseInt(slider.max) || 100;
    const value = parseInt(slider.value) || (min + (max - min) / 2);
    
    // Вычисляем процент заполнения
    const percent = ((value - min) / (max - min)) * 100;
    
    // Напрямую применяем к CSS переменной для мгновенного эффекта
    if (slider.classList.contains('size-slider-panel')) {
      document.documentElement.style.setProperty('--size-panel-progress', `${percent}%`);
    } else if (slider.classList.contains('size-slider-compact')) {
      document.documentElement.style.setProperty('--size-compact-progress', `${percent}%`);
    }
  }
  
  // Обновляем полосы прогресса для всех слайдеров
  const allSliders = document.querySelectorAll('input[type="range"]');
  allSliders.forEach(updateSliderProgress);
  
  // Установка стиля чекбоксов
  function setCheckboxStyle(style, page) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('checkboxStyle-' + page, style);
    
    // Получаем все страницы
    const pages = page === 'all' ? ['all', 'daily', 'weekly', 'goals'] : [page];
    
    // Для каждой затронутой страницы
    pages.forEach(p => {
      // Сначала удаляем все классы стилей для этой страницы
      document.body.classList.remove('gold-checkboxes-' + p);
      document.body.classList.remove('standard-checkboxes-' + p);
      
      // Если выбран стиль "По умолчанию", не применяем новые классы
      if (style === 'default') return;
      
      // Применяем выбранный стиль
      document.body.classList.add(style + '-checkboxes-' + p);
      
      // Если выбрано "Все страницы", сохраняем этот стиль для каждой отдельной страницы
      if (page === 'all') {
        localStorage.setItem('checkboxStyle-' + p, style);
      }
    });
    
    // Удаляем устаревший общий класс gold-checkboxes при любых изменениях
    document.body.classList.remove('gold-checkboxes');
  }
  
  // Установка стиля отображения невыполненных чекбоксов
  function setCheckboxMarkStyle(style, page) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('checkboxMarkStyle-' + page, style);
    
    // Получаем все страницы
    const pages = page === 'all' ? ['all', 'daily', 'weekly', 'goals'] : [page];
    
    // Для каждой затронутой страницы
    pages.forEach(p => {
      // Сначала удаляем все классы стилей для этой страницы
      document.body.classList.remove('empty-checkboxes-' + p);
      document.body.classList.remove('cross-checkboxes-' + p);
      
      // Если выбран стиль "По умолчанию", не применяем новые классы
      if (style === 'default') return;
      
      // Применяем выбранный стиль
      document.body.classList.add(style + '-checkboxes-' + p);
      
      // Если выбрано "Все страницы", сохраняем этот стиль для каждой отдельной страницы
      if (page === 'all') {
        localStorage.setItem('checkboxMarkStyle-' + p, style);
      }
    });
  }
  
  // Установка стиля формы чекбоксов
  function setCheckboxShapeStyle(shape, page) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('checkboxShapeStyle-' + page, shape);
    
    // Получаем все страницы
    const pages = page === 'all' ? ['all', 'daily', 'weekly', 'goals'] : [page];
    
    // Для каждой затронутой страницы
    pages.forEach(p => {
      // Сначала удаляем все классы форм для этой страницы
      document.body.classList.remove('circle-checkboxes-' + p);
      document.body.classList.remove('square-checkboxes-' + p);
      
      // Если выбрана форма "По умолчанию", не применяем новые классы
      if (shape === 'default') return;
      
      // Применяем выбранную форму
      document.body.classList.add(shape + '-checkboxes-' + p);
      
      // Если выбрано "Все страницы", сохраняем эту форму для каждой отдельной страницы
      if (page === 'all') {
        localStorage.setItem('checkboxShapeStyle-' + p, shape);
      }
    });
  }

  // Функция обновления значений селектов в зависимости от выбранной страницы
  function updateCheckboxSelectValues(page) {
    // Получаем сохраненные настройки для указанной страницы
    const savedStyle = localStorage.getItem('checkboxStyle-' + page) || 'default';
    const savedMarkStyle = localStorage.getItem('checkboxMarkStyle-' + page) || 'default';
    const savedShapeStyle = localStorage.getItem('checkboxShapeStyle-' + page) || 'default';

    // Устанавливаем значения выпадающих списков
    if (modalCheckboxStyleSelect) modalCheckboxStyleSelect.value = savedStyle;
    if (modalCheckboxMarkSelect) modalCheckboxMarkSelect.value = savedMarkStyle; 
    if (modalCheckboxShapeSelect) modalCheckboxShapeSelect.value = savedShapeStyle;
  }

  // Функция для отображения уведомления
  function showNotification(message, type = 'success') {
    // Проверяем, есть ли уже уведомление
    let notification = document.querySelector('.notification');
    
    // Если нет, создаем новое
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'notification';
      document.body.appendChild(notification);
    }
    
    // Устанавливаем тип уведомления
    notification.className = 'notification ' + type;
    
    // Устанавливаем иконку в зависимости от типа
    let icon = type === 'success' ? 'fa-check' : 
               type === 'info' ? 'fa-info' : 'fa-exclamation';
    
    // Устанавливаем содержимое
    notification.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    
    // Показываем уведомление
    notification.classList.add('active');
    
    // Скрываем через 2 секунды
    setTimeout(() => {
      notification.classList.remove('active');
    }, 2000);
  }

  // Функция открытия модального окна настроек чекбоксов
  function openCheckboxSettings(page) {
    // Закрываем панель настроек, если она открыта
    closeSettingsPanel();
    // Закрываем панель размера страницы, если она открыта
    if (sizeControlPanel && sizeControlPanel.classList.contains('active')) {
      sizeControlPanel.classList.remove('active');
    }
    
    const modal = document.getElementById('checkbox-settings-modal');
    const pageSelect = document.getElementById('checkbox-page-select');
    
    // Устанавливаем выбранную страницу в выпадающем списке
    if (pageSelect) {
      pageSelect.value = page;
      
      // Сохраняем текущую страницу
      currentCheckboxPage = page;
    }
    
    // Загружаем текущие настройки
    loadCheckboxSettings(page);
    
    // Показываем модальное окно
    document.body.classList.add('modal-open');
    modal.classList.add('active');
    
    // Добавляем обработчики для выпадающих списков
    setupModalHandlers();
  }
  
  // Функция закрытия модального окна
  function closeCheckboxSettings() {
    const modal = document.getElementById('checkbox-settings-modal');
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = '';
      }, 300);
    }
  }
  
  // Функция загрузки сохраненных настроек
  function loadCheckboxSettings(page) {
    // Устанавливаем значения селектов на основе сохраненных настроек
    updateCheckboxSelectValues(page);
  }
  
  // Функция применения сохраненных настроек чекбоксов
  function applyCheckboxSettings() {
    // Удаляем устаревший класс, если он был сохранен ранее
    document.body.classList.remove('gold-checkboxes');
    
    // Применяем настройки для каждой страницы
    const pages = ['daily', 'weekly', 'goals'];
    
    pages.forEach(page => {
      const style = localStorage.getItem('checkboxStyle-' + page) || 'default';
      const markStyle = localStorage.getItem('checkboxMarkStyle-' + page) || 'default';
      const shapeStyle = localStorage.getItem('checkboxShapeStyle-' + page) || 'default';
      
      // Применяем сохраненные стили
      if (style !== 'default') {
        document.body.classList.add(style + '-checkboxes-' + page);
      }
      
      if (markStyle !== 'default') {
        document.body.classList.add(markStyle + '-checkboxes-' + page);
      }
      
      if (shapeStyle !== 'default') {
        document.body.classList.add(shapeStyle + '-checkboxes-' + page);
      }
    });
    
    // Применяем общие настройки
    const allStyle = localStorage.getItem('checkboxStyle-all') || 'default';
    const allMarkStyle = localStorage.getItem('checkboxMarkStyle-all') || 'default';
    const allShapeStyle = localStorage.getItem('checkboxShapeStyle-all') || 'default';
    
    if (allStyle !== 'default') {
      document.body.classList.add(allStyle + '-checkboxes-all');
    }
    
    if (allMarkStyle !== 'default') {
      document.body.classList.add(allMarkStyle + '-checkboxes-all');
    }
    
    if (allShapeStyle !== 'default') {
      document.body.classList.add(allShapeStyle + '-checkboxes-all');
    }
  }

  function setupModalHandlers() {
    // Обработчики для выпадающих списков
    const styleSelect = document.getElementById('modal-checkbox-style-select');
    const markSelect = document.getElementById('modal-checkbox-mark-select');
    const shapeSelect = document.getElementById('modal-checkbox-shape-select');
    const pageSelect = document.getElementById('checkbox-page-select');
    
    if (styleSelect) {
      styleSelect.onchange = function() {
        setCheckboxStyle(this.value, currentCheckboxPage);
        showNotification('Стиль чекбоксов изменен', 'info');
      };
    }
    
    if (markSelect) {
      markSelect.onchange = function() {
        setCheckboxMarkStyle(this.value, currentCheckboxPage);
        showNotification('Вид отметки чекбоксов изменен', 'info');
      };
    }
    
    if (shapeSelect) {
      shapeSelect.onchange = function() {
        setCheckboxShapeStyle(this.value, currentCheckboxPage);
        showNotification('Форма чекбоксов изменена', 'info');
      };
    }
    
    // Обработчик для выбора страницы
    if (pageSelect) {
      pageSelect.onchange = function() {
        // Сохраняем новую выбранную страницу
        currentCheckboxPage = this.value;
        
        // Загружаем настройки для выбранной страницы
        loadCheckboxSettings(currentCheckboxPage);
        
        // Получаем текст выбранной опции
        const selectedText = this.options[this.selectedIndex].text;
        showNotification('Выбрана страница: ' + selectedText, 'info');
      };
    }
    
    // Обработчик сброса настроек
    const resetBtn = document.getElementById('checkbox-settings-reset');
    if (resetBtn) {
      resetBtn.onclick = function() {
        resetCheckboxSettings(currentCheckboxPage);
        showNotification('Настройки чекбоксов сброшены', 'info');
      };
    }
    
    // Обработчик закрытия модального окна
    const closeBtn = document.getElementById('checkbox-settings-close');
    if (closeBtn) {
      closeBtn.onclick = function() {
        closeCheckboxSettings();
      };
    }
  }
});
