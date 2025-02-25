document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных
    loadTaskStates();
    
    // Добавление обработчиков событий для чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Сохранение состояния задачи
            saveTaskStates();
            
            // Если задача выполнена, добавляем монеты
            if (this.checked) {
                addCoins(10); // За недельные задачи даем больше монет
            }
        });
    });
    
    // Загрузка общих данных (монеты, серия дней)
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
});

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('weeklyTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (tasks[checkbox.id]) {
                checkbox.checked = tasks[checkbox.id];
            }
        });
    }
}

// Функция для сохранения состояний задач
function saveTaskStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const tasks = {};
    
    checkboxes.forEach(checkbox => {
        tasks[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

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

// Функция для применения сохраненной темы
function applyTheme() {
    const theme = localStorage.getItem('theme');
    if (!theme) return;
    
    if (theme === 'dark') {
        applyDarkTheme();
    } else if (theme === 'custom') {
        applyCustomTheme();
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
        section, .bottom-nav, .task-item {
            background-color: #444 !important;
            color: #f5f5f5 !important;
        }
        
        .bottom-nav a {
            color: #aaa !important;
        }
        
        .bottom-nav a.active {
            color: #8e44ad !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для применения пользовательской темы
function applyCustomTheme() {
    const customColorsStr = localStorage.getItem('customColors');
    if (!customColorsStr) return;
    
    const customColors = JSON.parse(customColorsStr);
    const backgroundColor = customColors.background || '#f5f5f5';
    const textColor = customColors.text || '#333';
    const accentColor = customColors.accent || '#8e44ad';
    
    // Применяем пользовательские цвета
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    
    // Добавляем стили для пользовательской темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section {
            background-color: ${adjustColor(backgroundColor, 20)} !important;
        }
        
        .bottom-nav {
            background-color: ${adjustColor(backgroundColor, 10)} !important;
        }
        
        .bottom-nav a {
            color: ${adjustColor(textColor, -20)} !important;
        }
        
        .bottom-nav a.active {
            color: white !important;
            background-color: ${accentColor} !important;
        }
        
        .task-item {
            background-color: ${adjustColor(backgroundColor, 10)} !important;
            border-left-color: ${accentColor} !important;
        }
    `;
    document.head.appendChild(style);
}

// Вспомогательная функция для настройки цвета
function adjustColor(color, amount) {
    // Преобразуем цвет в RGB
    let r, g, b;
    if (color.startsWith('#')) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    } else {
        return color; // Если не HEX формат, возвращаем как есть
    }
    
    // Настраиваем яркость
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Преобразуем обратно в HEX
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Функция для добавления монет
function addCoins(amount) {
    const coinCountElement = document.getElementById('coin-count');
    let currentCoins = parseInt(coinCountElement.textContent);
    currentCoins += amount;
    
    coinCountElement.textContent = currentCoins;
    localStorage.setItem('coins', currentCoins);
}

// Функция для проверки и сброса недельных заданий
function checkWeeklyReset() {
    const lastWeekCheck = localStorage.getItem('lastWeekCheck');
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    
    if (lastWeekCheck) {
        const [lastYear, lastWeek] = JSON.parse(lastWeekCheck);
        const currentYear = now.getFullYear();
        
        // Если неделя изменилась, сбрасываем задания
        if (lastYear !== currentYear || lastWeek !== currentWeek) {
            resetWeeklyTasks();
        }
    }
    
    // Сохраняем текущую неделю
    localStorage.setItem('lastWeekCheck', JSON.stringify([now.getFullYear(), currentWeek]));
}

// Функция для получения номера недели
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Функция для сброса недельных заданий
function resetWeeklyTasks() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    saveTaskStates();
}

// Проверяем необходимость сброса недельных заданий
checkWeeklyReset();
