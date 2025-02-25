document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных настроек
    loadSettings();
    
    // Загрузка общих данных (монеты, серия дней)
    loadCommonData();
    
    // Обработчики событий для выбора темы
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            selectTheme(theme);
        });
    });
    
    // Обработчик для кнопки применения пользовательской темы
    document.getElementById('apply-custom-theme').addEventListener('click', applyCustomTheme);
    
    // Обработчики для переключателей
    document.getElementById('notifications-toggle').addEventListener('change', saveSettings);
    document.getElementById('sounds-toggle').addEventListener('change', saveSettings);
    
    // Обработчик для кнопки сброса
    document.getElementById('reset-button').addEventListener('click', resetAllData);
});

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка количества монет
    const coins = localStorage.getItem('coins');
    if (coins) {
        document.getElementById('coin-count').textContent = coins;
    }
    
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    }
}

// Функция для загрузки сохраненных настроек
function loadSettings() {
    // Загрузка темы
    const theme = localStorage.getItem('theme') || 'light';
    selectTheme(theme);
    
    // Загрузка пользовательских цветов
    if (theme === 'custom') {
        const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
        
        if (customColors.background) {
            document.getElementById('background-color').value = customColors.background;
        }
        
        if (customColors.text) {
            document.getElementById('text-color').value = customColors.text;
        }
        
        if (customColors.accent) {
            document.getElementById('accent-color').value = customColors.accent;
        }
        
        applyCustomTheme();
    }
    
    // Загрузка настроек переключателей
    const notifications = localStorage.getItem('notifications');
    if (notifications !== null) {
        document.getElementById('notifications-toggle').checked = notifications === 'true';
    }
    
    const sounds = localStorage.getItem('sounds');
    if (sounds !== null) {
        document.getElementById('sounds-toggle').checked = sounds === 'true';
    }
}

// Функция для выбора темы
function selectTheme(theme) {
    // Удаляем активный класс со всех опций
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной опции
    document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');
    
    // Показываем/скрываем настройки пользовательской темы
    const customSettings = document.querySelector('.custom-color-settings');
    if (theme === 'custom') {
        customSettings.classList.add('active');
    } else {
        customSettings.classList.remove('active');
    }
    
    // Применяем тему
    if (theme === 'light') {
        applyLightTheme();
    } else if (theme === 'dark') {
        applyDarkTheme();
    }
    
    // Сохраняем выбранную тему
    localStorage.setItem('theme', theme);
}

// Функция для применения светлой темы
function applyLightTheme() {
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.color = '#333';
    
    // Сбрасываем пользовательские стили
    document.getElementById('custom-theme-styles')?.remove();
}

// Функция для применения темной темы
function applyDarkTheme() {
    document.body.style.backgroundColor = '#333';
    document.body.style.color = '#f5f5f5';
    
    // Сбрасываем пользовательские стили
    document.getElementById('custom-theme-styles')?.remove();
    
    // Добавляем стили для темной темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section, .bottom-nav, .action-card, .task-item {
            background-color: #444 !important;
            color: #f5f5f5 !important;
        }
        
        .bottom-nav a {
            color: #aaa !important;
        }
        
        .bottom-nav a.active {
            color: #4285f4 !important;
        }
        
        .setting-description, h3 {
            color: #ccc !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для применения пользовательской темы
function applyCustomTheme() {
    const backgroundColor = document.getElementById('background-color').value;
    const textColor = document.getElementById('text-color').value;
    const accentColor = document.getElementById('accent-color').value;
    
    // Сохраняем пользовательские цвета
    const customColors = {
        background: backgroundColor,
        text: textColor,
        accent: accentColor
    };
    localStorage.setItem('customColors', JSON.stringify(customColors));
    
    // Применяем пользовательские цвета
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    
    // Удаляем предыдущие пользовательские стили
    document.getElementById('custom-theme-styles')?.remove();
    
    // Добавляем новые пользовательские стили
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        .bottom-nav a.active, input:checked + .toggle-slider, #apply-custom-theme {
            color: ${accentColor} !important;
            background-color: ${accentColor} !important;
        }
        
        input:checked + .toggle-slider {
            background-color: ${accentColor} !important;
        }
        
        .theme-option.active .theme-preview {
            border-color: ${accentColor} !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для сохранения настроек
function saveSettings() {
    const notificationsEnabled = document.getElementById('notifications-toggle').checked;
    const soundsEnabled = document.getElementById('sounds-toggle').checked;
    
    localStorage.setItem('notifications', notificationsEnabled);
    localStorage.setItem('sounds', soundsEnabled);
}

// Функция для сброса всех данных
function resetAllData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        // Сохраняем текущую тему перед сбросом
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Очищаем все данные из localStorage
        localStorage.clear();
        
        // Восстанавливаем тему
        localStorage.setItem('theme', currentTheme);
        
        // Устанавливаем начальные значения
        localStorage.setItem('coins', '100');
        localStorage.setItem('streak', '1');
        
        // Обновляем отображение
        document.getElementById('coin-count').textContent = '100';
        document.getElementById('streak-count').textContent = '1';
        
        // Показываем уведомление
        alert('Все данные успешно сброшены!');
        
        // Перезагружаем страницу
        window.location.reload();
    }
}
