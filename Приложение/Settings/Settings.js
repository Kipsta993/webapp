// Настройки приложения

document.addEventListener('DOMContentLoaded', function() {
  // Сбрасываем размер текста к 100%
  document.documentElement.style.fontSize = '100%';
  localStorage.removeItem('textSize');
  
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
  checkboxStyleSelect.addEventListener('change', function() {
    setCheckboxStyle(this.value);
  });
  
  // Предотвращаем стандартное поведение браузера при свайпе сверху вниз (pull-to-refresh)
  document.addEventListener('touchstart', function(e) {
    // Проверяем, можно ли отменить событие перед вызовом preventDefault
    if (e.cancelable) {
    // Сохраняем начальную позицию только для предотвращения pull-to-refresh
    const touchY = e.touches[0].clientY;
    
    // Если свайп начинается в верхней части экрана
    if (touchY < 100 && window.scrollY <= 0) {
      // Предотвращаем стандартное поведение браузера
      e.preventDefault();
      }
    }
  }, { passive: false });
  
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
  
  // Инициализация стиля чекбоксов
  function initCheckboxStyle() {
    const savedStyle = localStorage.getItem('checkboxStyle') || 'standard';
    const savedMarkStyle = localStorage.getItem('checkboxMarkStyle') || 'cross';
    
    // Устанавливаем положение выпадающего списка для стиля
    if (checkboxStyleSelect) {
      checkboxStyleSelect.value = savedStyle;
      
      // Добавляем обработчик для изменения стиля
      checkboxStyleSelect.addEventListener('change', function() {
        setCheckboxStyle(this.value);
      });
    }
    
    // Устанавливаем положение выпадающего списка для отображения невыполненных
    if (checkboxMarkSelect) {
      checkboxMarkSelect.value = savedMarkStyle;
      
      // Добавляем обработчик для изменения отображения меток
      checkboxMarkSelect.addEventListener('change', function() {
        setCheckboxMarkStyle(this.value);
      });
    }
    
    // Применяем сохраненные стили
    setCheckboxStyle(savedStyle);
    setCheckboxMarkStyle(savedMarkStyle);
  }
  
  // Установка стиля чекбоксов
  function setCheckboxStyle(style) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('checkboxStyle', style);
    
    // Применяем выбранный стиль
    if (style === 'gold') {
      document.body.classList.add('gold-checkboxes');
    } else {
      document.body.classList.remove('gold-checkboxes');
    }
  }
  
  // Установка стиля отображения невыполненных чекбоксов
  function setCheckboxMarkStyle(style) {
    // Сохраняем выбор в localStorage
    localStorage.setItem('checkboxMarkStyle', style);
    
    // Применяем выбранный стиль
    if (style === 'empty') {
      document.body.classList.add('empty-checkboxes');
    } else {
      document.body.classList.remove('empty-checkboxes');
    }
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
});
