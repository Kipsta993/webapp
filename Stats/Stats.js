document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Загрузка статистики
    loadStatistics();
    
    // Обновление времени использования каждую секунду
    updateUsageTime();
    setInterval(updateUsageTime, 1000);
    
    // Применение сохраненной темы
    applyTheme();
});

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
        document.getElementById('current-streak').textContent = streak;
    }
    
    // Если максимальная серия не сохранена, используем текущую
    const maxStreak = localStorage.getItem('maxStreak') || streak || '0';
    document.getElementById('max-streak').textContent = maxStreak;
    
    // Если текущая серия больше максимальной, обновляем максимальную
    if (parseInt(streak || '0') > parseInt(maxStreak)) {
        localStorage.setItem('maxStreak', streak);
        document.getElementById('max-streak').textContent = streak;
    }
}

// Функция для загрузки статистики
function loadStatistics() {
    // Загрузка количества выполненных ежедневных заданий
    const dailyTasksCompleted = localStorage.getItem('dailyTasksCompleted') || '0';
    document.getElementById('daily-tasks-completed').textContent = dailyTasksCompleted;
    
    // Загрузка количества выполненных еженедельных заданий
    const weeklyTasksCompleted = localStorage.getItem('weeklyTasksCompleted') || '0';
    document.getElementById('weekly-tasks-completed').textContent = weeklyTasksCompleted;
    
    // Расчет общего количества выполненных заданий
    const totalTasks = parseInt(dailyTasksCompleted) + parseInt(weeklyTasksCompleted);
    document.getElementById('total-tasks-completed').textContent = totalTasks;
    
    // Загрузка количества записей в дневнике
    const diaryEntries = localStorage.getItem('diaryEntries');
    const entriesCount = diaryEntries ? JSON.parse(diaryEntries).length : 0;
    document.getElementById('diary-entries-count').textContent = entriesCount;
    
    // Если это первый запуск приложения, сохраняем дату начала использования
    if (!localStorage.getItem('startDate')) {
        localStorage.setItem('startDate', new Date().toISOString());
    }
}

// Функция для обновления времени использования
function updateUsageTime() {
    const startDate = localStorage.getItem('startDate');
    if (!startDate) return;
    
    const start = new Date(startDate);
    const now = new Date();
    const diff = now - start;
    
    // Расчет времени использования
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30.44); // Среднее количество дней в месяце
    const years = Math.floor(days / 365.25); // Учитываем високосные годы
    
    // Обновление элементов на странице
    document.getElementById('years-count').textContent = years;
    document.getElementById('months-count').textContent = months % 12;
    document.getElementById('days-count').textContent = days % 30;
    document.getElementById('hours-count').textContent = hours % 24;
    document.getElementById('minutes-count').textContent = minutes % 60;
    document.getElementById('seconds-count').textContent = seconds % 60;
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
        section, .bottom-nav {
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
        }
        
        .stat-item {
            background-color: #555;
        }
        
        .stat-value {
            color: #8ab4f8;
        }
        
        .stat-label {
            color: #ccc;
        }
        
        .stat-row {
            border-bottom-color: #555;
        }
        
        h2 {
            color: #8ab4f8;
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
        
        .stat-item {
            background-color: ${adjustColor(colors.background, 10)};
        }
        
        .bottom-nav a {
            color: ${adjustColor(colors.text, -30)};
        }
        
        .bottom-nav a.active {
            color: ${colors.accent};
        }
        
        .stat-value {
            color: ${colors.accent};
        }
        
        .stat-label {
            color: ${adjustColor(colors.text, -20)};
        }
        
        .stat-row {
            border-bottom-color: ${adjustColor(colors.background, 10)};
        }
        
        h2 {
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