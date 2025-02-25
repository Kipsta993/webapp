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
                addCoins(5);
            }
        });
    });
    
    // Обновление времени для следующего задания
    updateNextTask();
    
    // Применение сохраненной темы
    applyTheme();
});

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (tasks[checkbox.id]) {
                checkbox.checked = tasks[checkbox.id];
            }
        });
    }
    
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

// Функция для сохранения состояний задач
function saveTaskStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const tasks = {};
    
    checkboxes.forEach(checkbox => {
        tasks[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
}

// Функция для добавления монет
function addCoins(amount) {
    const coinCountElement = document.getElementById('coin-count');
    let currentCoins = parseInt(coinCountElement.textContent);
    currentCoins += amount;
    
    coinCountElement.textContent = currentCoins;
    localStorage.setItem('coins', currentCoins);
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
        section, .bottom-nav, .task-item, .task-card {
            background-color: #444 !important;
            color: #f5f5f5 !important;
        }
        
        .bottom-nav a {
            color: #aaa !important;
        }
        
        .bottom-nav a.active {
            color: #8e44ad !important;
        }
        
        .task-time {
            color: #ccc !important;
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
        
        .task-item, .task-card {
            background-color: ${adjustColor(backgroundColor, 10)} !important;
            border-left-color: ${accentColor} !important;
        }
        
        .task-time {
            color: ${adjustColor(textColor, -20)} !important;
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

// Функция для обновления следующего задания
function updateNextTask() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Пример логики для определения следующего задания
    // В реальном приложении здесь будет более сложная логика
    const taskTimeElement = document.querySelector('.task-time');
    const taskTitleElement = document.querySelector('.task-title');
    
    // Простой пример: если сейчас утро, показываем одно задание, если день - другое
    if (hours < 12) {
        taskTimeElement.textContent = '10:00 - 11:30';
        taskTitleElement.textContent = 'Встреча с командой';
    } else if (hours < 17) {
        taskTimeElement.textContent = '14:00 - 15:30';
        taskTitleElement.textContent = 'Работа над проектом';
    } else {
        taskTimeElement.textContent = '18:00 - 19:00';
        taskTitleElement.textContent = 'Вечерняя тренировка';
    }
}

// Функция для проверки и обновления серии дней
function checkDailyStreak() {
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Если последний визит был вчера, увеличиваем серию
        if (lastDate.toDateString() === yesterday.toDateString()) {
            let streak = parseInt(localStorage.getItem('streak') || '0');
            streak++;
            document.getElementById('streak-count').textContent = streak;
            localStorage.setItem('streak', streak);
        } 
        // Если последний визит был раньше чем вчера, сбрасываем серию
        else if (lastDate.toDateString() !== today) {
            document.getElementById('streak-count').textContent = '1';
            localStorage.setItem('streak', 1);
        }
    }
    
    // Сохраняем текущую дату как последний визит
    localStorage.setItem('lastVisit', today);
}

// Проверяем серию дней при загрузке страницы
checkDailyStreak();
