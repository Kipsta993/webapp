document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Загрузка настроек
    loadSettings();
    
    // Добавление обработчиков событий для настроек
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            selectTheme(theme);
        });
    });
    
    // Обработчик для переключателя звуков
    const soundsToggle = document.getElementById('sounds-toggle');
    if (soundsToggle) {
        soundsToggle.addEventListener('change', function() {
            localStorage.setItem('sounds', this.checked);
            saveSettings();
        });
    }
    
    // Обработчик для кнопки сброса
    const resetButton = document.getElementById('reset-all-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
                resetAllData();
            }
        });
    }
    
    // Инициализация мультитач-жестов
    initTouchGestures();
});

// Функция для инициализации мультитач-жестов
function initTouchGestures() {
    // Инициализация Hammer.js для основного контейнера
    const container = document.querySelector('.container');
    
    if (container && window.Hammer) {
        // Создаем экземпляр Hammer для контейнера
        const hammerContainer = new Hammer(container);
        
        // Включаем распознавание жестов
        hammerContainer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        
        // Обработка свайпа влево/вправо для переключения между разделами
        hammerContainer.on('swipeleft swiperight', function(event) {
            const currentPage = window.location.pathname.split('/').pop();
            const basePath = window.location.pathname.includes('/Settings/') ? '../' : '';
            const pages = [basePath + 'index.html', basePath + 'Weekly/Weekly.html', basePath + 'Stats/Stats.html', basePath + 'Diary/Diary.html', 'Settings.html'];
            
            // Находим текущую страницу в массиве
            let currentIndex = pages.findIndex(page => {
                return page === currentPage || (currentPage === 'Settings.html' && page === 'Settings.html');
            });
            
            if (currentIndex === -1) currentIndex = 4; // По умолчанию Settings
            
            // Определяем следующую страницу в зависимости от направления свайпа
            if (event.type === 'swipeleft') {
                // Свайп влево - переход на следующую страницу
                currentIndex = (currentIndex + 1) % pages.length;
            } else {
                // Свайп вправо - переход на предыдущую страницу
                currentIndex = (currentIndex - 1 + pages.length) % pages.length;
            }
            
            // Переходим на новую страницу
            window.location.href = pages[currentIndex];
        });
    }
    
    // Настройка поддержки настоящего мультитача
    setupMultiTouch();
}

// Функция для настройки поддержки настоящего мультитача
function setupMultiTouch() {
    // Получаем все интерактивные элементы
    const settingItems = document.querySelectorAll('.setting-item');
    const themeOptions = document.querySelectorAll('.theme-option');
    const toggles = document.querySelectorAll('.toggle');
    const buttons = document.querySelectorAll('button');
    
    // Отключаем стандартное поведение касаний для предотвращения масштабирования и прокрутки
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Обработка мультитач-событий для элементов настроек
    settingItems.forEach(settingItem => {
        settingItem.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        settingItem.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
    
    // Обработка мультитач-событий для опций тем
    themeOptions.forEach(themeOption => {
        themeOption.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        themeOption.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
    
    // Обработка мультитач-событий для переключателей
    toggles.forEach(toggle => {
        toggle.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        toggle.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
    
    // Обработка мультитач-событий для кнопок
    buttons.forEach(button => {
        button.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        button.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
}

// Обработчик начала мультитач-события
function handleMultiTouchStart(e) {
    // Добавляем класс активного состояния для элемента настроек
    if (this.classList.contains('setting-item')) {
        this.classList.add('setting-item-active');
    }
    
    // Добавляем класс активного состояния для опции темы
    if (this.classList.contains('theme-option')) {
        this.classList.add('theme-option-active');
    }
    
    // Добавляем класс активного состояния для кнопки
    if (this.tagName === 'BUTTON') {
        this.classList.add('button-active');
    }
    
    // Предотвращаем стандартное поведение только для мультитача
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}

// Обработчик окончания мультитач-события
function handleMultiTouchEnd(e) {
    // Удаляем класс активного состояния для элемента настроек
    if (this.classList.contains('setting-item')) {
        setTimeout(() => {
            this.classList.remove('setting-item-active');
        }, 300);
        
        // Если это элемент с переключателем, меняем его состояние
        const toggle = this.querySelector('input[type="checkbox"]');
        if (toggle && !e.target.classList.contains('toggle-slider') && !e.target.classList.contains('toggle')) {
            toggle.checked = !toggle.checked;
            
            // Вызываем событие change вручную
            const changeEvent = new Event('change', { bubbles: true });
            toggle.dispatchEvent(changeEvent);
        }
    }
    
    // Удаляем класс активного состояния для опции темы
    if (this.classList.contains('theme-option')) {
        setTimeout(() => {
            this.classList.remove('theme-option-active');
        }, 300);
        
        // Выбираем тему
        const theme = this.getAttribute('data-theme');
        if (theme) {
            selectTheme(theme);
        }
    }
    
    // Удаляем класс активного состояния для кнопки
    if (this.tagName === 'BUTTON') {
        setTimeout(() => {
            this.classList.remove('button-active');
        }, 300);
    }
}

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    } else {
        localStorage.setItem('streak', 7);
    }
}

// Функция для загрузки сохраненных настроек
function loadSettings() {
    // Загрузка темы
    const theme = localStorage.getItem('theme');
    if (theme) {
        selectTheme(theme);
    }
    
    // Загрузка настроек звуков
    const sounds = localStorage.getItem('sounds');
    if (sounds !== null) {
        document.getElementById('sounds-toggle').checked = sounds === 'true';
    }
}

// Функция для выбора темы
function selectTheme(theme) {
    // Удаляем активный класс со всех опций
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной опции
    const selectedOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Сохраняем выбранную тему
    localStorage.setItem('theme', theme);
    
    // Применяем тему
    if (theme === 'light') {
        applyLightTheme();
    } else if (theme === 'dark') {
        applyDarkTheme();
    }
}

// Функция для применения светлой темы
function applyLightTheme() {
    // Сбрасываем стили
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    
    // Удаляем пользовательские стили, если они есть
    const customStyles = document.getElementById('custom-theme-styles');
    if (customStyles) {
        customStyles.remove();
    }
}

// Функция для применения темной темы
function applyDarkTheme() {
    document.body.style.backgroundColor = '#333';
    document.body.style.color = '#f5f5f5';
    
    // Добавляем стили для темной темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section, .bottom-nav, .setting-item, .theme-option {
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
        }
        
        .setting-description {
            color: #ccc;
        }
        
        .theme-preview {
            border-color: #555;
        }
        
        button {
            background-color: #4285f4;
            color: white;
        }
        
        .danger-button {
            background-color: #f44336;
        }
    `;
    
    // Удаляем предыдущие стили, если они есть
    const existingStyle = document.getElementById('custom-theme-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
}

// Функция для сохранения настроек
function saveSettings() {
    const soundsToggle = document.getElementById('sounds-toggle');
    localStorage.setItem('sounds', soundsToggle.checked);
}

// Функция для сброса всех данных приложения
function resetAllData() {
    // Список ключей, которые нужно сохранить (например, настройки темы)
    const keysToKeep = ['theme'];
    
    // Сохраняем значения ключей, которые нужно оставить
    const savedValues = {};
    keysToKeep.forEach(key => {
        savedValues[key] = localStorage.getItem(key);
    });
    
    // Очищаем все данные из localStorage
    localStorage.clear();
    
    // Восстанавливаем сохраненные значения
    for (const key in savedValues) {
        if (savedValues[key] !== null) {
            localStorage.setItem(key, savedValues[key]);
        }
    }
    
    // Устанавливаем начальные значения для серии дней
    const streakCountElement = document.getElementById('streak-count');
    streakCountElement.textContent = '1';
    localStorage.setItem('streak', 1);
    
    // Показываем уведомление об успешном сбросе
    alert('Все данные приложения успешно сброшены!');
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
}

// Функция для запроса разрешения на отправку уведомлений
function requestNotificationPermission() {
    // Проверяем поддержку уведомлений в браузере
    if ('Notification' in window) {
        // Если разрешение еще не запрошено
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
}
