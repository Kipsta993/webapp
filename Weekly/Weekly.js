document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных
    loadTaskStates();
    
    // Добавление обработчиков событий для чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Сохранение состояния задачи
            saveTaskStates();
            
            // Если задача выполнена, увеличиваем счетчик выполненных заданий
            if (this.checked) {
                incrementTasksCompleted();
            }
        });
    });
    
    // Загрузка общих данных (серия дней)
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Обновление времени до понедельника
    updateTimeUntilMonday();
    setInterval(updateTimeUntilMonday, 1000);
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

// Функция для увеличения счетчика выполненных заданий
function incrementTasksCompleted() {
    let weeklyTasksCompleted = parseInt(localStorage.getItem('weeklyTasksCompleted') || '0');
    weeklyTasksCompleted++;
    localStorage.setItem('weeklyTasksCompleted', weeklyTasksCompleted);
}

// Функция для загрузки общих данных
function loadCommonData() {
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
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
        }
    `;
    
    // Удаляем предыдущие стили, если они есть
    const existingStyle = document.getElementById('custom-theme-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
}

// Функция для применения пользовательской темы
function applyCustomTheme() {
    const customColors = localStorage.getItem('customColors');
    if (!customColors) return;
    
    const colors = JSON.parse(customColors);
    
    document.body.style.backgroundColor = colors.background;
    document.body.style.color = colors.text;
    
    // Добавляем стили для пользовательской темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section, .bottom-nav {
            background-color: ${adjustColor(colors.background, 20)};
            color: ${colors.text};
        }
        
        .task-item {
            background-color: ${adjustColor(colors.background, 10)};
            color: ${colors.text};
        }
        
        .bottom-nav a {
            color: ${adjustColor(colors.text, -30)};
        }
        
        .bottom-nav a.active {
            color: ${colors.accent};
        }
    `;
    
    // Удаляем предыдущие стили, если они есть
    const existingStyle = document.getElementById('custom-theme-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
}

// Функция для настройки цвета (осветление/затемнение)
function adjustColor(color, amount) {
    const clamp = (val) => Math.min(255, Math.max(0, val));
    
    // Преобразуем hex в rgb
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Настраиваем значения
    const adjustedR = clamp(r + amount);
    const adjustedG = clamp(g + amount);
    const adjustedB = clamp(b + amount);
    
    // Преобразуем обратно в hex
    return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
}

// Проверка и сброс недельных задач
checkWeeklyReset();

// Функция для проверки необходимости сброса недельных задач
function checkWeeklyReset() {
    const lastWeek = localStorage.getItem('lastWeek');
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    
    // Если неделя изменилась или данных о последней неделе нет
    if (!lastWeek || lastWeek !== currentWeek.toString()) {
        resetWeeklyTasks();
        localStorage.setItem('lastWeek', currentWeek);
    }
}

// Функция для получения номера недели
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
}

// Функция для сброса недельных задач
function resetWeeklyTasks() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const tasks = {};
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        tasks[checkbox.id] = false;
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Функция для обновления времени до понедельника
function updateTimeUntilMonday() {
    const now = new Date();
    
    // Создаем дату следующего понедельника
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    nextMonday.setHours(0, 0, 0, 0);
    
    // Разница в миллисекундах
    const diff = nextMonday - now;
    
    // Переводим в дни, часы, минуты, секунды
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Форматируем строку
    let timeString = '';
    if (days > 0) {
        timeString += `${days}д `;
    }
    timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновляем элемент
    document.getElementById('time-until-monday').textContent = timeString;
}
