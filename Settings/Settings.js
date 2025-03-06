document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Загрузка настроек
    loadSettings();
    
    // Добавление обработчиков событий для выбора темы
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            selectTheme(theme);
        });
    });
    
    // Добавление обработчика события для сброса всех данных
    const resetAllButton = document.getElementById('reset-all-button');
    resetAllButton.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите сбросить ВСЕ данные приложения? Это действие нельзя отменить.')) {
            resetAllData();
        }
    });
    
    // Добавление обработчиков событий для переключателей
    const soundsToggle = document.getElementById('sounds-toggle');
    soundsToggle.addEventListener('change', function() {
        saveSettings();
    });
});

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
