document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных
    loadTaskStates();
    
    // Проверка на смену дня и сброс заданий при необходимости
    checkDayChange();
    
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
                // Воспроизводим звук, если он включен в настройках
                playCheckboxSound();
                
                // Добавляем класс для анимации
                const taskItem = this.closest('.task-item');
                if (taskItem) {
                    // Добавляем класс для анимации пульсации
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
            }
            
            // Сохранение состояния задачи
            saveTaskStates();
        });
    });
    
    // Загрузка общих данных (серия дней)
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Обновление следующего задания
    updateNextTask();
    setInterval(updateNextTask, 60000); // Обновляем каждую минуту
    
    // Обновление времени до следующего дня
    updateTimeUntilTomorrow();
    setInterval(updateTimeUntilTomorrow, 1000);
    
    // Инициализация мультитач-жестов
    initTouchGestures();
});

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
            const pages = ['index.html', 'Weekly/Weekly.html', 'Stats/Stats.html', 'Diary/Diary.html', 'Settings/Settings.html'];
            
            // Находим текущую страницу в массиве
            let currentIndex = pages.findIndex(page => {
                return page === currentPage || (currentPage === '' && page === 'index.html');
            });
            
            if (currentIndex === -1) currentIndex = 0;
            
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
        checkbox.removeEventListener('touchend', handleCheckboxTouchEnd);
        
        // Добавляем новые обработчики
        checkbox.addEventListener('touchstart', handleMultiTouchStart, { passive: false });
        checkbox.addEventListener('touchend', handleMultiTouchEnd, { passive: false });
        
        // Добавляем обработчик для изменения состояния чекбокса при мультитаче
        checkbox.addEventListener('touchend', handleCheckboxTouchEnd, { passive: false });
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
        
        // Предотвращаем всплытие события, чтобы избежать конфликта с handleCheckboxTouchEnd
        e.stopPropagation();
    }
}

// Отдельный обработчик для чекбоксов, чтобы избежать конфликтов
function handleCheckboxTouchEnd(e) {
    // Если чекбокс не отключен, меняем его состояние
    if (!this.disabled) {
        // Предотвращаем двойное срабатывание, если это часть мультитача
        if (e.touches.length === 0) {
            this.checked = !this.checked;
            
            // Вызываем событие change вручную
            const changeEvent = new Event('change', { bubbles: true });
            this.dispatchEvent(changeEvent);
        }
    }
}

// Добавляем глобальный обработчик для сброса всех активных состояний
document.addEventListener('touchend', function(e) {
    // Проверяем, не является ли целевой элемент чекбоксом или элементом задания
    const isTaskItem = e.target.classList.contains('task-item') || e.target.closest('.task-item');
    const isCheckbox = e.target.tagName === 'INPUT' && e.target.type === 'checkbox';
    
    // Если событие уже обработано для конкретного элемента, не выполняем глобальный сброс
    if (isTaskItem || isCheckbox) {
        return;
    }
    
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

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('dailyTasks');
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
        // Также сохраняем состояние disabled
        tasks[checkbox.id + '_disabled'] = checkbox.disabled;
    });
    
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
}

// Функция для увеличения счетчика выполненных заданий
function incrementTasksCompleted() {
    let dailyTasksCompleted = parseInt(localStorage.getItem('dailyTasksCompleted') || '0');
    dailyTasksCompleted++;
    localStorage.setItem('dailyTasksCompleted', dailyTasksCompleted);
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
        section, .bottom-nav, .task-item, .task-card {
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
        }
        
        .task-time {
            color: #ccc;
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

// Расписание на неделю
const weeklySchedule = {
    "ПОНЕДЕЛЬНИК": [
        { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
        { start: "07:30", end: "07:40", title: "Прыгание на скакалке" },
        { start: "07:40", end: "07:50", title: "Завтрак" },
        { start: "08:00", end: "13:50", title: "Учеба" },
        { start: "14:10", end: "14:40", title: "Обед" },
        { start: "14:40", end: "14:50", title: "Отдых" },
        { start: "14:50", end: "15:00", title: "Дорога до секции футбола" },
        { start: "15:00", end: "16:30", title: "Секция по футболу" },
        { start: "16:30", end: "16:40", title: "Дорога домой" },
        { start: "16:40", end: "17:00", title: "Отдых, перекус" },
        { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
        { start: "19:00", end: "19:30", title: "Ужин" },
        { start: "20:30", end: "21:30", title: "Тренировка тела" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "07:00", title: "Сон" }
    ],
    "ВТОРНИК": [
        { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
        { start: "07:30", end: "07:50", title: "Завтрак" },
        { start: "08:00", end: "13:50", title: "Учеба" },
        { start: "14:10", end: "14:40", title: "Обед" },
        { start: "14:40", end: "15:30", title: "Отдых" },
        { start: "15:30", end: "16:30", title: "Тренировка тела" },
        { start: "16:30", end: "17:00", title: "Отдых, перекус" },
        { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
        { start: "19:00", end: "19:30", title: "Ужин" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "07:00", title: "Сон" }
    ],
    "СРЕДА": [
        { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
        { start: "07:30", end: "07:40", title: "Прыгание на скакалке" },
        { start: "07:40", end: "07:50", title: "Завтрак" },
        { start: "08:00", end: "13:50", title: "Учеба" },
        { start: "14:10", end: "14:40", title: "Обед" },
        { start: "14:40", end: "15:30", title: "Отдых" },
        { start: "15:30", end: "16:30", title: "Тренировка тела" },
        { start: "16:30", end: "17:00", title: "Отдых, перекус" },
        { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "07:00", title: "Сон" }
    ],
    "ЧЕТВЕРГ": [
        { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
        { start: "07:30", end: "07:50", title: "Завтрак" },
        { start: "08:00", end: "13:50", title: "Учеба" },
        { start: "14:10", end: "14:40", title: "Обед" },
        { start: "14:40", end: "15:30", title: "Отдых" },
        { start: "15:30", end: "16:30", title: "Тренировка тела" },
        { start: "16:30", end: "17:00", title: "Отдых, перекус" },
        { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
        { start: "19:00", end: "19:30", title: "Ужин" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "07:00", title: "Сон" }
    ],
    "ПЯТНИЦА": [
        { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
        { start: "07:30", end: "07:40", title: "Прыгание на скакалке" },
        { start: "07:40", end: "07:50", title: "Завтрак" },
        { start: "08:00", end: "13:50", title: "Учеба" },
        { start: "14:10", end: "14:40", title: "Обед" },
        { start: "14:40", end: "15:30", title: "Отдых" },
        { start: "15:30", end: "16:30", title: "Тренировка тела" },
        { start: "16:30", end: "17:00", title: "Отдых, перекус" },
        { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
        { start: "19:00", end: "19:30", title: "Ужин" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "07:00", title: "Сон" }
    ],
    "СУББОТА": [
        { start: "09:00", end: "09:30", title: "Подъем, утренние процедуры" },
        { start: "09:30", end: "10:00", title: "Завтрак" },
        { start: "10:00", end: "12:00", title: "Свободное время" },
        { start: "12:00", end: "13:00", title: "Прогулка" },
        { start: "13:00", end: "13:30", title: "Обед" },
        { start: "13:30", end: "16:00", title: "Свободное время" },
        { start: "16:00", end: "16:30", title: "Перекус" },
        { start: "16:30", end: "19:00", title: "Свободное время" },
        { start: "19:00", end: "19:30", title: "Ужин" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "09:00", title: "Сон" }
    ],
    "ВОСКРЕСЕНЬЕ": [
        { start: "09:00", end: "09:30", title: "Подъем, утренние процедуры" },
        { start: "09:30", end: "10:00", title: "Завтрак" },
        { start: "10:00", end: "12:00", title: "Свободное время" },
        { start: "12:00", end: "13:00", title: "Прогулка" },
        { start: "13:00", end: "13:30", title: "Обед" },
        { start: "13:30", end: "16:00", title: "Свободное время" },
        { start: "16:00", end: "16:30", title: "Перекус" },
        { start: "16:30", end: "19:00", title: "Подготовка к учебной неделе" },
        { start: "19:00", end: "19:30", title: "Ужин" },
        { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
        { start: "22:00", end: "09:00", title: "Сон" }
    ]
};

// Функция для обновления следующего задания
function updateNextTask() {
    const now = new Date();
    const days = ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
    const currentDay = days[now.getDay()];
    
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeMinutes = currentHours * 60 + currentMinutes;
    
    const daySchedule = weeklySchedule[currentDay];
    if (!daySchedule) return;
    
    let currentTask = null;
    
    // Находим текущее задание
    for (const task of daySchedule) {
        // Преобразуем время в минуты для сравнения
        const taskStartParts = task.start.split(':');
        const taskEndParts = task.end.split(':');
        
        let taskStartMinutes = parseInt(taskStartParts[0]) * 60 + parseInt(taskStartParts[1]);
        let taskEndMinutes = parseInt(taskEndParts[0]) * 60 + parseInt(taskEndParts[1]);
        
        // Обработка задач, которые переходят на следующий день (например, сон)
        if (taskEndMinutes < taskStartMinutes) {
            taskEndMinutes += 24 * 60; // Добавляем 24 часа в минутах
        }
        
        // Проверяем, находится ли текущее время в интервале задачи
        if (currentTimeMinutes >= taskStartMinutes && currentTimeMinutes < taskEndMinutes) {
            currentTask = task;
            break;
        }
    }
    
    // Обновляем информацию о текущем задании
    const taskTimeElement = document.querySelector('.task-time');
    const taskTitleElement = document.querySelector('.task-title');
    
    if (currentTask) {
        taskTimeElement.textContent = `${currentTask.start} - ${currentTask.end}`;
        taskTitleElement.textContent = currentTask.title;
    } else {
        taskTimeElement.textContent = "Нет активных заданий";
        taskTitleElement.textContent = "Проверьте расписание";
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
            
            // Обновляем максимальную серию, если текущая больше
            const maxStreak = parseInt(localStorage.getItem('maxStreak') || '0');
            if (streak > maxStreak) {
                localStorage.setItem('maxStreak', streak);
            }
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

// Функция для обновления времени до следующего дня
function updateTimeUntilTomorrow() {
    const now = new Date();
    
    // Создаем дату следующего дня в 00:00 по московскому времени
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    // Разница в миллисекундах
    const diff = tomorrow - now;
    
    // Переводим в часы, минуты, секунды
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Форматируем строку
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновляем элемент
    document.getElementById('time-until-tomorrow').textContent = timeString;
    
    // Если наступила полночь (разница меньше 1 секунды), сбрасываем задания
    if (diff < 1000) {
        resetDailyTasks();
    }
}

// Функция для сброса ежедневных заданий
function resetDailyTasks() {
    console.log('Сброс ежедневных заданий');
    
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
    
    // Сохраняем обновленные состояния в localStorage
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
}

// Обновляем время каждую секунду
setInterval(updateTimeUntilTomorrow, 1000);
updateTimeUntilTomorrow(); // Вызываем сразу при загрузке

// Функция для воспроизведения звука при отметке задачи
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

// Функция для проверки смены дня
function checkDayChange() {
    const now = new Date();
    const today = now.toDateString();
    
    // Получаем дату последнего сброса заданий
    const lastResetDate = localStorage.getItem('lastDailyReset');
    
    // Если дата последнего сброса не совпадает с сегодняшней, сбрасываем задания
    if (!lastResetDate || lastResetDate !== today) {
        resetDailyTasks();
        // Сохраняем текущую дату как дату последнего сброса
        localStorage.setItem('lastDailyReset', today);
    }
}
