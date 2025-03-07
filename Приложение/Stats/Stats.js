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
    
    // Инициализация мультитач-жестов
    initTouchGestures();
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
    
    // Загрузка статистики дневника
    loadDiaryStatistics();
    
    // Если это первый запуск приложения, сохраняем дату начала использования
    if (!localStorage.getItem('startDate')) {
        localStorage.setItem('startDate', new Date().toISOString());
    }
}

// Функция для загрузки статистики дневника
function loadDiaryStatistics() {
    // Загрузка количества записей в дневнике
    const diaryEntries = localStorage.getItem('diaryEntries');
    const entriesCount = diaryEntries ? JSON.parse(diaryEntries).length : 0;
    document.getElementById('diary-entries-count').textContent = entriesCount;
    
    // Загрузка количества отредактированных записей
    const editedCount = localStorage.getItem('diaryEditedCount') || '0';
    document.getElementById('diary-edited-count').textContent = editedCount;
    
    // Загрузка количества удаленных записей
    const deletedCount = localStorage.getItem('diaryDeletedCount') || '0';
    document.getElementById('diary-deleted-count').textContent = deletedCount;
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
    
    // Обновление элементов на странице с эффектом увеличения
    updateTimeValueWithEffect('years-count', years);
    updateTimeValueWithEffect('months-count', months % 12);
    updateTimeValueWithEffect('days-count', days % 30);
    updateTimeValueWithEffect('hours-count', hours % 24);
    updateTimeValueWithEffect('minutes-count', minutes % 60);
    updateTimeValueWithEffect('seconds-count', seconds % 60);
}

// Функция для обновления значения времени с эффектом увеличения
function updateTimeValueWithEffect(elementId, value) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Если значение изменилось, добавляем эффект увеличения
    if (element.textContent !== value.toString()) {
        // Добавляем класс для анимации
        element.classList.add('value-scale');
        
        // Удаляем класс после завершения анимации
        setTimeout(() => {
            element.classList.remove('value-scale');
        }, 300);
    }
    
    // Обновляем значение
    element.textContent = value;
}

// Функция для инициализации слайдера статистики
function initStatsSlider() {
    const slides = document.querySelectorAll('.stat-slide');
    const prevButton = document.getElementById('prev-stat');
    const nextButton = document.getElementById('next-stat');
    const currentIndexElement = document.getElementById('current-stat-index');
    const totalStatsElement = document.getElementById('total-stats');
    
    let currentIndex = 0;
    const totalSlides = slides.length;
    
    // Устанавливаем общее количество слайдов
    totalStatsElement.textContent = totalSlides;
    
    // Функция для обновления слайдера
    function updateSlider() {
        // Обновляем индекс текущего слайда
        currentIndexElement.textContent = currentIndex + 1;
        
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
        
        h2 {
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
        
        h2 {
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

// Функция для инициализации мультитач-жестов
function initTouchGestures() {
    // Инициализация Hammer.js для основного контейнера
    const container = document.querySelector('.container');
    const statsContainer = document.querySelector('.stats-container');
    
    if (container && window.Hammer) {
        // Создаем экземпляр Hammer для контейнера
        const hammerContainer = new Hammer(container);
        
        // Включаем распознавание жестов
        hammerContainer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        
        // Обработка свайпа влево/вправо для переключения между разделами
        hammerContainer.on('swipeleft swiperight', function(event) {
            const currentPage = window.location.pathname.split('/').pop();
            const basePath = window.location.pathname.includes('/Stats/') ? '../' : '';
            const pages = [basePath + 'index.html', basePath + 'Weekly/Weekly.html', 'Stats.html', basePath + 'Diary/Diary.html', basePath + 'Settings/Settings.html'];
            
            // Находим текущую страницу в массиве
            let currentIndex = pages.findIndex(page => {
                return page === currentPage || (currentPage === 'Stats.html' && page === 'Stats.html');
            });
            
            if (currentIndex === -1) currentIndex = 2; // По умолчанию Stats
            
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
    
    // Добавляем жесты для слайдера статистики
    if (statsContainer && window.Hammer) {
        const hammerStats = new Hammer(statsContainer);
        
        // Включаем распознавание жестов
        hammerStats.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        
        // Обработка свайпа для переключения между слайдами статистики
        hammerStats.on('swipeleft swiperight', function(event) {
            const prevButton = document.getElementById('prev-stat');
            const nextButton = document.getElementById('next-stat');
            
            if (event.type === 'swipeleft' && nextButton) {
                // Свайп влево - следующий слайд
                nextButton.click();
            } else if (event.type === 'swiperight' && prevButton) {
                // Свайп вправо - предыдущий слайд
                prevButton.click();
            }
        });
    }
    
    // Настройка поддержки настоящего мультитача
    setupMultiTouch();
}

// Функция для настройки поддержки настоящего мультитача
function setupMultiTouch() {
    // Получаем все интерактивные элементы
    const statItems = document.querySelectorAll('.stat-item');
    const statRows = document.querySelectorAll('.stat-row');
    const statValues = document.querySelectorAll('.stat-value');
    
    // Отключаем стандартное поведение касаний для предотвращения масштабирования и прокрутки
    document.addEventListener('touchstart', function(e) {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Обработка мультитач-событий для элементов статистики
    statItems.forEach(statItem => {
        statItem.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        statItem.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
    
    // Обработка мультитач-событий для строк статистики
    statRows.forEach(statRow => {
        statRow.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        statRow.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
    
    // Обработка мультитач-событий для значений статистики
    statValues.forEach(statValue => {
        statValue.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        statValue.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
}

// Обработчик начала мультитач-события
function handleMultiTouchStart(e) {
    // Добавляем класс активного состояния для элемента
    if (this.classList.contains('stat-item')) {
        this.classList.add('stat-item-active');
    }
    
    // Если это значение статистики, добавляем класс для анимации
    if (this.classList.contains('stat-value')) {
        this.classList.add('value-scale');
    }
    
    // Предотвращаем стандартное поведение только для мультитача
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}

// Обработчик окончания мультитач-события
function handleMultiTouchEnd(e) {
    // Удаляем класс активного состояния для элемента
    if (this.classList.contains('stat-item')) {
        // Принудительно удаляем класс активного состояния
        this.classList.remove('stat-item-active');
        
        // Сбрасываем стили transform для гарантированного возврата к исходному состоянию
        this.style.transform = '';
    }
    
    // Если это значение статистики, удаляем класс для анимации
    if (this.classList.contains('stat-value')) {
        this.classList.remove('value-scale');
        // Сбрасываем стили transform для гарантированного возврата к исходному состоянию
        this.style.transform = '';
    }
}

// Добавляем глобальный обработчик для сброса всех активных состояний
document.addEventListener('touchend', function() {
    // Сбрасываем все активные состояния элементов статистики
    document.querySelectorAll('.stat-item-active').forEach(item => {
        item.classList.remove('stat-item-active');
        item.style.transform = '';
    });
    
    // Сбрасываем все активные состояния значений статистики
    document.querySelectorAll('.value-scale').forEach(value => {
        value.classList.remove('value-scale');
        value.style.transform = '';
    });
}, { passive: false }); 