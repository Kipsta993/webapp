// Настройки приложения

document.addEventListener('DOMContentLoaded', function() {
  // Элементы настроек
  const settingsPanel = document.getElementById('settings-panel');
  const themeSelect = document.getElementById('theme-select');
  const languageToggle = document.getElementById('language-toggle');
  const soundToggle = document.getElementById('sound-toggle');
  const testNotificationBtn = document.getElementById('test-notification-btn');
  const scheduleNotificationsToggle = document.getElementById('schedule-notifications-toggle');
  
  // Переменные для отслеживания свайпа
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50; // Минимальное расстояние свайпа для активации
  
  // Настройка размера страницы
  const pageSizeDecreaseBtn = document.getElementById('page-size-decrease');
  const pageSizeIncreaseBtn = document.getElementById('page-size-increase');
  const pageSizeValue = document.getElementById('page-size-value');
  
  // Настройка размера текста
  const textSizeDecreaseBtn = document.getElementById('text-size-decrease');
  const textSizeIncreaseBtn = document.getElementById('text-size-increase');
  const textSizeValue = document.getElementById('text-size-value');
  
  // Сохраненные значения или значения по умолчанию
  const savedPageSize = localStorage.getItem('pageSize') || 100;
  const savedTextSize = localStorage.getItem('textSize') || 100;
  
  // Инициализация темы при загрузке
  initTheme();
  
  // Инициализация языка при загрузке
  initLanguage();
  
  // Инициализация настроек звука при загрузке
  initSound();
  
  // Инициализация настроек уведомлений при загрузке
  initScheduleNotifications();
  
  // Установка начальных значений
  updatePageSize(savedPageSize);
  updateTextSize(savedTextSize);
  
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
  
  // Обработчик для переключения уведомлений о заданиях
  if (scheduleNotificationsToggle) {
    scheduleNotificationsToggle.addEventListener('change', function() {
      setScheduleNotificationsEnabled(this.checked);
    });
  }
  
  // Обработчик для кнопки тестовых уведомлений
  if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', function() {
      sendTestNotification();
    });
  }
  
  // Предотвращаем стандартное поведение браузера при свайпе сверху вниз (pull-to-refresh)
  document.addEventListener('touchstart', function(e) {
    // Сохраняем начальную позицию только для предотвращения pull-to-refresh
    const touchY = e.touches[0].clientY;
    
    // Если свайп начинается в верхней части экрана
    if (touchY < 100 && window.scrollY <= 0) {
      // Предотвращаем стандартное поведение браузера
      e.preventDefault();
    }
  }, { passive: false });
  
  document.addEventListener('touchmove', function(e) {
    const touchY = e.touches[0].clientY;
    
    // Если свайп сверху вниз и мы находимся в верхней части страницы
    if (window.scrollY <= 0 && touchY < 100) {
      // Предотвращаем стандартное поведение браузера (pull-to-refresh)
      e.preventDefault();
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
      if (swipeDistance > minSwipeDistance && touchStartY < 80) {
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
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    
    // Если тянем вверх, то закрываем панель
    if (deltaY < 0) {
      const translateY = Math.abs(deltaY);
      settingsPanel.style.transform = `translateY(-${translateY / settingsPanel.offsetHeight * 100}%)`;
    }
  }, { passive: false });
  
  settingsHandle.addEventListener('touchend', function(e) {
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Если перетащили достаточно далеко вверх, закрываем панель
    if (deltaY < -settingsPanel.offsetHeight * 0.08) {
      closeSettingsPanel();
    } else {
      // Иначе возвращаем панель в открытое положение
      settingsPanel.style.transform = '';
      settingsPanel.classList.add('active');
    }
  }, { passive: false });
  
  // Добавим обработчик одиночного клика по ручке для закрытия панели
  settingsHandle.addEventListener('click', closeSettingsPanel);
  
  // Функция открытия панели настроек
  function openSettingsPanel() {
    settingsPanel.style.transform = '';
    settingsPanel.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Функция закрытия панели настроек
  function closeSettingsPanel() {
    settingsPanel.style.transform = '';
    settingsPanel.classList.remove('active');
    document.body.style.overflow = '';
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
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false'; // По умолчанию звук включен
    
    // Устанавливаем положение переключателя
    soundToggle.checked = soundEnabled;
    
    // Применяем настройки звука
    setSoundEnabled(soundEnabled);
  }
  
  // Установка настроек звука
  function setSoundEnabled(enabled) {
    // Сохраняем настройки звука в localStorage
    localStorage.setItem('soundEnabled', enabled);
    
    // Здесь можно добавить логику для включения/выключения звуков в приложении
  }
  
  // Инициализация настроек уведомлений
  function initScheduleNotifications() {
    const notificationsEnabled = localStorage.getItem('scheduleNotificationsEnabled') !== 'false'; // По умолчанию включены
    
    // Устанавливаем положение переключателя
    if (scheduleNotificationsToggle) {
      scheduleNotificationsToggle.checked = notificationsEnabled;
    }
    
    // Применяем настройки уведомлений
    setScheduleNotificationsEnabled(notificationsEnabled);
  }
  
  // Установка настроек уведомлений
  function setScheduleNotificationsEnabled(enabled) {
    // Сохраняем настройки уведомлений в localStorage
    localStorage.setItem('scheduleNotificationsEnabled', enabled);
    
    // Если уведомления включены, запрашиваем разрешение
    if (enabled && 'Notification' in window) {
      Notification.requestPermission().then(function(permission) {
        if (permission !== 'granted') {
          // Если разрешение не получено, отключаем уведомления
          localStorage.setItem('scheduleNotificationsEnabled', false);
          if (scheduleNotificationsToggle) {
            scheduleNotificationsToggle.checked = false;
          }
        }
      });
    }
  }
  
  // Функция для обновления размера страницы
  function updatePageSize(value) {
    // Ограничиваем диапазон от 70% до 130%
    value = parseInt(value);
    value = Math.max(70, Math.min(130, value));
    
    // Обновляем отображаемое значение
    pageSizeValue.textContent = value + '%';
    
    // Применяем масштаб к контейнеру
    document.querySelector('.container').style.transform = `scale(${value / 100})`;
    document.querySelector('.container').style.transformOrigin = 'top center';
    
    // Сохраняем значение
    localStorage.setItem('pageSize', value);
  }
  
  // Функция для обновления размера текста
  function updateTextSize(value) {
    // Ограничиваем диапазон от 80% до 150%
    value = parseInt(value);
    value = Math.max(80, Math.min(150, value));
    
    // Обновляем отображаемое значение
    if (textSizeValue) {
      textSizeValue.textContent = value + '%';
    }
    
    // Применяем размер текста ко всей странице
    document.documentElement.style.fontSize = value + '%';
    
    // Сохраняем значение
    localStorage.setItem('textSize', value);

    // Принудительно обновляем размер для body и всех элементов
    document.body.style.fontSize = '';
  }
  
  // Обработчики для кнопок изменения размера страницы
  if (pageSizeDecreaseBtn) {
    pageSizeDecreaseBtn.addEventListener('click', function() {
      const currentSize = parseInt(localStorage.getItem('pageSize')) || 100;
      updatePageSize(currentSize - 5);
    });
  }
  
  if (pageSizeIncreaseBtn) {
    pageSizeIncreaseBtn.addEventListener('click', function() {
      const currentSize = parseInt(localStorage.getItem('pageSize')) || 100;
      updatePageSize(currentSize + 5);
    });
  }
  
  // Обработчики для кнопок изменения размера текста
  if (textSizeDecreaseBtn) {
    textSizeDecreaseBtn.addEventListener('click', function() {
      const currentSize = parseInt(localStorage.getItem('textSize')) || 100;
      updateTextSize(currentSize - 5);
    });
  }
  
  if (textSizeIncreaseBtn) {
    textSizeIncreaseBtn.addEventListener('click', function() {
      const currentSize = parseInt(localStorage.getItem('textSize')) || 100;
      updateTextSize(currentSize + 5);
    });
  }
  
  // Функция для отправки тестового уведомления
  function sendTestNotification() {
    // Проверяем поддержку уведомлений
    if (!('Notification' in window)) {
      alert('Ваш браузер не поддерживает уведомления');
      return;
    }

    // Проверяем разрешение на уведомления
    if (Notification.permission !== 'granted') {
      alert('Пожалуйста, разрешите уведомления в настройках браузера');
      return;
    }

    // Создаем уведомление через Service Worker
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification('Тестовое уведомление', {
          body: 'Это тестовое уведомление',
          icon: 'icon-192x192.png',
          badge: 'icon-192x192.png',
          vibrate: [200, 100, 200],
          // Используем стандартный звук уведомлений Android
          sound: 'default'
        });
      });
    } else {
      // Если Service Worker недоступен, используем стандартный API уведомлений
      new Notification('Тестовое уведомление', {
        body: 'Это тестовое уведомление',
        icon: 'icon-192x192.png',
        badge: 'icon-192x192.png',
        vibrate: [200, 100, 200],
        // Используем стандартный звук уведомлений Android
        sound: 'default'
      });
    }
  }
});
