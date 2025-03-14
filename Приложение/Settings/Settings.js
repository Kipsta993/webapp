// Настройки приложения

document.addEventListener('DOMContentLoaded', function() {
  // Элементы настроек
  const settingsPanel = document.getElementById('settings-panel');
  const closeSettingsBtn = document.getElementById('close-settings');
  const themeOptions = document.querySelectorAll('.theme-option');
  
  // Переменные для отслеживания свайпа
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50; // Минимальное расстояние свайпа для активации
  
  // Инициализация темы при загрузке
  initTheme();
  
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
  
  // Обработчики для свайпа сверху вниз
  document.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, false);
  
  document.addEventListener('touchend', function(e) {
    touchEndY = e.changedTouches[0].clientY;
    handleSwipe();
  }, false);
  
  // Обработчик для перетаскивания панели настроек
  const settingsHandle = document.querySelector('.settings-handle');
  
  settingsHandle.addEventListener('touchstart', function(e) {
    touchStartY = e.touches[0].clientY;
  }, false);
  
  settingsHandle.addEventListener('touchmove', function(e) {
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY;
    
    // Если тянем вниз, то закрываем панель
    if (deltaY > 0) {
      const translateY = deltaY;
      settingsPanel.style.transform = `translateY(-${100 - (translateY / settingsPanel.offsetHeight * 100)}%)`;
    }
  }, false);
  
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
  }, false);
  
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
});
