// Настройки приложения

document.addEventListener('DOMContentLoaded', function() {
  // Элементы настроек
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettingsBtn = document.getElementById('close-settings');
  const themeOptions = document.querySelectorAll('.theme-option');
  const languageToggle = document.getElementById('language-toggle');
  
  // Переменные для отслеживания свайпа
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50; // Минимальное расстояние свайпа для активации
  
  // Инициализация темы при загрузке
  initTheme();
  
  // Инициализация языка при загрузке
  initLanguage();
  
  // Обработчик закрытия панели настроек
  closeSettingsBtn.addEventListener('click', function() {
    closeSettingsPanel();
  });
  
  // Обработчики для выбора темы
  themeOptions.forEach(option => {
    option.addEventListener('click', function() {
      const theme = this.getAttribute('data-theme');
      setTheme(theme);
      
      // Обновляем активный класс
      themeOptions.forEach(opt => opt.classList.remove('active'));
      this.classList.add('active');
    });
  });
  
  // Обработчик для переключения языка
  languageToggle.addEventListener('change', function() {
    setLanguage(this.checked ? 'en' : 'ru');
  });
  
  // Предотвращаем стандартное поведение браузера при свайпе сверху вниз (pull-to-refresh)
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: false });
  
  document.addEventListener('touchmove', function(e) {
    const touchY = e.touches[0].clientY;
    const touchDiff = touchY - touchStartY;
    
    // Если свайп сверху вниз и мы находимся в верхней части страницы
    if (touchDiff > 0 && window.scrollY <= 0) {
      // Проверяем, находимся ли мы в верхней части экрана
      if (touchStartY < 100) {
        // Предотвращаем стандартное поведение браузера
        e.preventDefault();
      }
    }
  }, { passive: false });
  
  document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  }, { passive: false });
  
  // Обработчик для перетаскивания панели настроек
  const settingsHandle = document.querySelector('.settings-handle');
  
  settingsHandle.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, { passive: false });
  
  settingsHandle.addEventListener('touchmove', function(e) {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Предотвращаем стандартное поведение браузера
    e.preventDefault();
    
    // Если тянем вниз, то закрываем панель
    if (deltaY > 0) {
      const translateY = deltaY;
      settingsPanel.style.transform = `translateY(-${100 - (translateY / settingsPanel.offsetHeight * 100)}%)`;
    }
  }, { passive: false });
  
  settingsHandle.addEventListener('touchend', function(e) {
    const currentY = e.changedTouches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Если перетащили достаточно далеко вниз, закрываем панель
    if (deltaY > settingsPanel.offsetHeight * 0.2) {
      closeSettingsPanel();
    } else {
      // Иначе возвращаем панель в открытое положение
      settingsPanel.style.transform = '';
      settingsPanel.classList.add('active');
    }
  }, { passive: false });
  
  // Закрытие панели при клике вне её области
  document.addEventListener('click', function(e) {
    if (settingsPanel.classList.contains('active') && 
        !settingsPanel.contains(e.target) && 
        e.target !== settingsPanel) {
      closeSettingsPanel();
    }
  });
  
  // Функция обработки свайпа
  function handleSwipe() {
    const swipeDistance = touchEndY - touchStartY;
    
    // Если свайп сверху вниз в верхней части экрана
    if (swipeDistance > minSwipeDistance && touchStartY < 100) {
      openSettingsPanel();
    }
    
    // Если свайп снизу вверх на открытой панели
    if (swipeDistance < -minSwipeDistance && settingsPanel.classList.contains('active')) {
      closeSettingsPanel();
    }
  }
  
  // Функция открытия панели настроек
  function openSettingsPanel() {
    settingsPanel.classList.add('active');
  }
  
  // Функция закрытия панели настроек
  function closeSettingsPanel() {
    settingsPanel.style.transform = '';
    settingsPanel.classList.remove('active');
  }
  
  // Инициализация темы
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Установка активного класса для выбранной темы
    const activeThemeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (activeThemeOption) {
      activeThemeOption.classList.add('active');
    }
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
});
