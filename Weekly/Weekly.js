document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных
    loadTaskStates();
    
    // Проверка на смену недели и сброс заданий при необходимости
    checkWeekChange();
    
    // Добавление обработчиков событий для чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        // Если чекбокс уже отмечен, делаем его неактивным и меняем цвет полосы
        if (checkbox.checked) {
            checkbox.disabled = true;
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) {
                label.classList.add('completed-task');
            }
            // Меняем цвет полосы слева на зеленый
            const taskItem = checkbox.closest('.task-item');
            if (taskItem) {
                taskItem.style.borderLeftColor = '#4CAF50';
            }
        }
        
        checkbox.addEventListener('change', function() {
            // Если задача отмечена как выполненная
            if (this.checked) {
                // Получаем элемент задачи
                const taskItem = this.closest('.task-item');
                
                if (taskItem) {
                    // Добавляем класс для анимации
                    taskItem.classList.add('completed');
                    
                    // Удаляем класс после завершения анимации
                    setTimeout(() => {
                        taskItem.classList.remove('completed');
                    }, 500);
                    
                    // Меняем цвет полосы слева на зеленый
                    taskItem.style.borderLeftColor = '#4CAF50';
                }
                
                // Анимация увеличения чекбокса
                this.classList.add('checkbox-scale');
                setTimeout(() => {
                    this.classList.remove('checkbox-scale');
                }, 300);
                
                // Делаем чекбокс неактивным
                this.disabled = true;
                
                // Добавляем стиль для метки
                const label = document.querySelector(`label[for="${this.id}"]`);
                if (label) {
                    label.classList.add('completed-task');
                }
                
                // Увеличиваем счетчик выполненных заданий
                incrementTasksCompleted();
                
                // Воспроизводим звук, если он включен
                playCheckboxSound();
            }
            
            // Сохранение состояния задачи
            saveTaskStates();
        });
    });
    
    // Загрузка общих данных (серия дней)
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Обновление времени до понедельника
    updateTimeUntilMonday();
    setInterval(updateTimeUntilMonday, 1000);
    
    // Проверка и сброс еженедельных задач
    checkWeeklyReset();
    
    // Инициализация мультитач-жестов
    initTouchGestures();
});

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('weeklyTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (tasks[checkbox.id] !== undefined) {
                checkbox.checked = tasks[checkbox.id];
                
                // Восстанавливаем состояние disabled
                if (tasks[checkbox.id + '_disabled']) {
                    checkbox.disabled = true;
                    
                    // Добавляем стиль для метки
                    const label = document.querySelector(`label[for="${checkbox.id}"]`);
                    if (label) {
                        label.classList.add('completed-task');
                    }
                }
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
        // Также сохраняем состояние disabled
        tasks[checkbox.id + '_disabled'] = checkbox.disabled;
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
    } else {
        applyLightTheme();
    }
}

// Функция для применения светлой темы
function applyLightTheme() {
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.color = '#333';
    
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
        
        .time-remaining {
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
    console.log('Сброс недельных задач');
    
    // Получаем все чекбоксы
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // Создаем объект для хранения состояний задач
    const tasks = {};
    
    // Сбрасываем состояние каждого чекбокса
    checkboxes.forEach(checkbox => {
        // Снимаем отметку и делаем активным
        checkbox.checked = false;
        checkbox.disabled = false;
        
        // Сохраняем состояние в объект
        tasks[checkbox.id] = false;
        tasks[checkbox.id + '_disabled'] = false;
        
        // Удаляем стиль для метки
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
            label.classList.remove('completed-task');
        }
        
        // Возвращаем исходный цвет полосы слева
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
            // Используем CSS-переход для плавного изменения цвета
            taskItem.style.borderLeftColor = '#8e44ad';
        }
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Функция для обновления времени до понедельника
function updateTimeUntilMonday() {
    const now = new Date();
    
    // Создаем дату следующего понедельника
    const nextMonday = new Date(now);
    
    // Если сегодня понедельник, то следующий понедельник через 7 дней
    // Иначе находим ближайший понедельник
    if (now.getDay() === 1) {
        nextMonday.setDate(now.getDate() + 7);
    } else {
        nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    }
    
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
    
    // Если наступил понедельник (разница меньше 1 секунды), сбрасываем задания
    if (diff < 1000) {
        resetWeeklyTasks();
    }
}

// Функция для проверки смены недели
function checkWeekChange() {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    const weekYearKey = `${currentYear}-${currentWeek}`;
    
    // Получаем номер недели последнего сброса заданий
    const lastResetWeek = localStorage.getItem('lastWeeklyReset');
    
    // Если номер недели последнего сброса не совпадает с текущим, сбрасываем задания
    if (!lastResetWeek || lastResetWeek !== weekYearKey) {
        resetWeeklyTasks();
        // Сохраняем текущий номер недели как номер недели последнего сброса
        localStorage.setItem('lastWeeklyReset', weekYearKey);
    }
}

// Функция для воспроизведения звука при отметке задания
function playCheckboxSound() {
    // Проверяем, включены ли звуки в настройках
    const soundsEnabled = localStorage.getItem('sounds');
    if (soundsEnabled === 'true') {
        const sound = document.getElementById('checkbox-sound');
        if (sound) {
            // Сбрасываем звук, чтобы его можно было воспроизвести снова
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.error('Ошибка воспроизведения звука:', error);
            });
        }
    }
}

// Функция для инициализации мультитач-жестов
function initTouchGestures() {
    // Инициализация Hammer.js для основного контейнера
    const container = document.querySelector('.container');
    const mainElement = document.querySelector('main');
    
    if (container && window.Hammer) {
        // Создаем экземпляр Hammer для контейнера
        const hammerContainer = new Hammer(container);
        
        // Включаем распознавание жестов
        hammerContainer.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });
        
        // Обработка свайпа влево/вправо для переключения между разделами
        hammerContainer.on('swipeleft swiperight', function(event) {
            const currentPage = window.location.pathname.split('/').pop();
            const basePath = window.location.pathname.includes('/Weekly/') ? '../' : '';
            const pages = [basePath + 'index.html', 'Weekly.html', basePath + 'Stats/Stats.html', basePath + 'Diary/Diary.html', basePath + 'Settings/Settings.html'];
            
            // Находим текущую страницу в массиве
            let currentIndex = pages.findIndex(page => {
                return page === currentPage || (currentPage === 'Weekly.html' && page === 'Weekly.html');
            });
            
            if (currentIndex === -1) currentIndex = 1; // По умолчанию Weekly
            
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
    
    // Добавляем жест масштабирования для основного контента
    if (mainElement && window.Hammer) {
        const hammerMain = new Hammer(mainElement);
        
        // Включаем распознавание жеста масштабирования
        hammerMain.get('pinch').set({ enable: true });
        
        // Обработка жеста масштабирования
        hammerMain.on('pinchstart pinchmove pinchend', function(event) {
            if (event.type === 'pinchstart') {
                // Сохраняем начальный масштаб
                mainElement.dataset.scale = mainElement.dataset.scale || 1;
            } else if (event.type === 'pinchmove') {
                // Изменяем масштаб в зависимости от жеста
                const newScale = Math.max(0.8, Math.min(1.2, parseFloat(mainElement.dataset.scale) * event.scale));
                mainElement.style.transform = `scale(${newScale})`;
            } else if (event.type === 'pinchend') {
                // Анимированно возвращаем к нормальному масштабу
                mainElement.style.transition = 'transform 0.3s ease';
                mainElement.style.transform = 'scale(1)';
                
                // Удаляем transition после завершения анимации
                setTimeout(() => {
                    mainElement.style.transition = '';
                }, 300);
            }
        });
    }
    
    // Настройка поддержки настоящего мультитача
    setupMultiTouch();
}

// Функция для настройки поддержки настоящего мультитача
function setupMultiTouch() {
    // Получаем все элементы задач
    const taskItems = document.querySelectorAll('.task-item');
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // Добавляем обработчики событий для элементов задач
    taskItems.forEach(taskItem => {
        // Удаляем существующие обработчики, чтобы избежать дублирования
        taskItem.removeEventListener('touchstart', handleMultiTouchStart);
        taskItem.removeEventListener('touchend', handleMultiTouchEnd);
        
        // Добавляем новые обработчики
        taskItem.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        taskItem.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
    });
    
    // Добавляем обработчики событий для чекбоксов
    checkboxes.forEach(checkbox => {
        // Удаляем существующие обработчики, чтобы избежать дублирования
        checkbox.removeEventListener('touchstart', handleMultiTouchStart);
        checkbox.removeEventListener('touchend', handleMultiTouchEnd);
        
        // Добавляем новые обработчики
        checkbox.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        checkbox.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
        
        // Добавляем обработчик для изменения состояния чекбокса при мультитаче
        checkbox.addEventListener('touchend', function(e) {
            // Если это мультитач, меняем состояние чекбокса
            if (!this.disabled) {
                this.checked = !this.checked;
                
                // Вызываем событие change вручную
                const changeEvent = new Event('change', { bubbles: true });
                this.dispatchEvent(changeEvent);
            }
        }, { passive: false });
    });
}

// Обработчик начала мультитач-события
function handleMultiTouchStart(e) {
    // Добавляем класс активного состояния для элемента
    if (this.classList.contains('task-item')) {
        this.classList.add('active');
        
        // Находим чекбокс внутри элемента задания и добавляем ему класс для анимации
        const checkbox = this.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.classList.add('checkbox-scale');
        }
    }
    
    // Если это чекбокс, добавляем класс для анимации
    if (this.tagName === 'INPUT' && this.type === 'checkbox') {
        this.classList.add('checkbox-scale');
        
        // Находим родительский элемент задания и добавляем ему класс активного состояния
        const taskItem = this.closest('.task-item');
        if (taskItem) {
            taskItem.classList.add('active');
        }
    }
    
    // Предотвращаем стандартное поведение только для мультитача
    if (e.touches.length > 1) {
        e.preventDefault();
    }
}

// Обработчик окончания мультитач-события
function handleMultiTouchEnd(e) {
    // Удаляем класс активного состояния для элемента
    if (this.classList.contains('task-item')) {
        // Принудительно удаляем класс активного состояния
        this.classList.remove('active');
        
        // Сбрасываем стили transform для гарантированного возврата к исходному состоянию
        this.style.transform = '';
        
        // Находим чекбокс внутри элемента задания и удаляем ему класс для анимации
        const checkbox = this.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkbox.classList.remove('checkbox-scale');
            checkbox.style.transform = '';
        }
    }
    
    // Если это чекбокс, удаляем класс для анимации
    if (this.tagName === 'INPUT' && this.type === 'checkbox') {
        this.classList.remove('checkbox-scale');
        // Сбрасываем стили transform для гарантированного возврата к исходному состоянию
        this.style.transform = '';
        
        // Находим родительский элемент задания и удаляем ему класс активного состояния
        const taskItem = this.closest('.task-item');
        if (taskItem) {
            taskItem.classList.remove('active');
            taskItem.style.transform = '';
        }
    }
}

// Добавляем глобальный обработчик для сброса всех активных состояний
document.addEventListener('touchend', function() {
    // Устанавливаем небольшую задержку для гарантированного сброса состояний
    setTimeout(() => {
        // Сбрасываем все активные состояния элементов задач
        document.querySelectorAll('.task-item.active').forEach(item => {
            item.classList.remove('active');
            item.style.transform = '';
            
            // Находим чекбокс внутри элемента задания и удаляем ему класс для анимации
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.classList.remove('checkbox-scale');
                checkbox.style.transform = '';
            }
        });
        
        // Сбрасываем все активные состояния чекбоксов
        document.querySelectorAll('input[type="checkbox"].checkbox-scale').forEach(checkbox => {
            checkbox.classList.remove('checkbox-scale');
            checkbox.style.transform = '';
            
            // Находим родительский элемент задания и удаляем ему класс активного состояния
            const taskItem = checkbox.closest('.task-item');
            if (taskItem) {
                taskItem.classList.remove('active');
                taskItem.style.transform = '';
            }
        });
    }, 50); // Небольшая задержка для гарантированного сброса
}, { passive: false });
