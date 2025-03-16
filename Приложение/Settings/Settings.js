// Настройки приложения

document.addEventListener('DOMContentLoaded', function() {
  // Элементы настроек
  const settingsPanel = document.getElementById('settings-panel');
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
