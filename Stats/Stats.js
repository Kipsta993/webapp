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
    
    // Инициализация слайдера статистики
    initStatsSlider();
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

// Функция для инициализации слайдера статистики
function initStatsSlider() {
    const slides = document.querySelectorAll('.stat-slide');
    const prevButton = document.getElementById('prev-stat');
    const nextButton = document.getElementById('next-stat');
    const currentIndexElement = document.getElementById('current-stat-index');
    const totalStatsElement = document.getElementById('total-stats');
    const currentStatTitle = document.getElementById('current-stat-title');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    // Устанавливаем общее количество слайдов
    totalStatsElement.textContent = totalSlides;
    
    // Функция для обновления слайдера
    function updateSlider() {
        // Обновляем индекс текущего слайда
        currentIndexElement.textContent = currentIndex + 1;
        
        // Обновляем заголовок текущей статистики
        const currentSlideName = slides[currentIndex].getAttribute('data-stat-name');
        currentStatTitle.textContent = currentSlideName;
        
        // Обновляем классы слайдов
        slides.forEach((slide, index) => {
            slide.classList.remove('active', 'prev');
            
            if (index === currentIndex) {
                slide.classList.add('active');
            } else if (index < currentIndex) {
                slide.classList.add('prev');
            }
        });
    }
    
    // Обработчик для кнопки "Предыдущий"
    prevButton.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateSlider();
        }
    });
    
    // Обработчик для кнопки "Следующий"
    nextButton.addEventListener('click', function() {
        if (currentIndex < totalSlides - 1) {
            currentIndex++;
            updateSlider();
        }
    });
    
    // Обработчик для свайпов на мобильных устройствах
    let touchStartX = 0;
    let touchEndX = 0;
    
    const statsContainer = document.querySelector('.stats-container');
    
    statsContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    statsContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50; // Минимальное расстояние для определения свайпа
        
        // Свайп влево (следующий слайд)
        if (touchEndX < touchStartX - swipeThreshold) {
            if (currentIndex < totalSlides - 1) {
                currentIndex++;
                updateSlider();
            }
        }
        
        // Свайп вправо (предыдущий слайд)
        if (touchEndX > touchStartX + swipeThreshold) {
            if (currentIndex > 0) {
                currentIndex--;
                updateSlider();
            }
        }
    }
    
    // Инициализация слайдера
    updateSlider();
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
        .stat-slide, .bottom-nav {
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
        
        h2, .stat-title {
            color: #8ab4f8;
        }
        
        .slider-indicator {
            color: #ccc;
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
        .stat-slide, .bottom-nav {
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
        
        h2, .stat-title {
            color: ${colors.accent};
        }
        
        .slider-arrow {
            background-color: ${colors.accent};
        }
        
        .slider-arrow:hover {
            background-color: ${adjustColor(colors.accent, -20)};
        }
        
        .slider-indicator {
            color: ${adjustColor(colors.text, -10)};
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