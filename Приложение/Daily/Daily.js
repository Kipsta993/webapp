document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных и инициализация
    loadTaskStates();
    checkDayChange();
    
    // Инициализация чекбоксов
    initializeCheckboxes();
    
    // Инициализация обработчиков кликов для элементов задания
    initializeTaskItems();
    
    // Обновление UI и таймеры
    updateNextTask();
    applyTheme();
    updateTimeUntilTomorrow();
    
    // Установка интервалов обновления
    setInterval(updateNextTask, 60000);
    setInterval(updateTimeUntilTomorrow, 60000);
    
    // Проверка ежедневной серии
    checkDailyStreak();
    
    // Добавляем кнопку расписания
    addScheduleButton();
    
    // Инициализируем кнопку с тремя точками
    initializeTaskMenu();
    
    // Показываем текущую задачу и запускаем обновление
    showCurrentTaskInHeader();
    startTaskUpdater();
    
    // Показываем уведомления и запускаем проверку
    showTaskNotifications();
    startNotificationChecker();
    
    // Показываем прогресс дня и запускаем обновление
    showDayProgress();
    startProgressUpdater();
});

// Инициализация чекбоксов
function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    checkboxes.forEach(checkbox => {
        // Применяем сохраненное состояние
        if (checkbox.checked) {
            markTaskAsCompleted(checkbox, false); // false = без анимации
        }
        
        // Добавляем обработчик изменения
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                markTaskAsCompleted(this, true); // true = с анимацией
                incrementTasksCompleted();
                saveTaskStates();
            }
        });
    });
}

// Инициализация обработчиков кликов для элементов задания
function initializeTaskItems() {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('click', function(event) {
            // Игнорируем клики на чекбоксе и метке
            if (event.target.matches('input[type="checkbox"]') || 
                event.target.matches('label')) {
                return;
            }
            
            const checkbox = this.querySelector('input[type="checkbox"]');
            if (!checkbox) return;
            
            if (!checkbox.checked && !checkbox.disabled) {
                // Задание еще не выполнено - отмечаем его
                checkbox.checked = true;
                const changeEvent = new Event('change');
                checkbox.dispatchEvent(changeEvent);
            } 
            else if (checkbox.checked && checkbox.disabled) {
                // Задание уже выполнено - просто воспроизводим звук
                playCheckboxSound();
            }
        });
    });
}

// Отметить задание как выполненное
function markTaskAsCompleted(checkbox, withAnimation) {
    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;
    
    // Применяем визуальные изменения
    taskItem.style.borderLeftColor = '#4CAF50';
    checkbox.disabled = true;
    
    const label = document.querySelector(`label[for="${checkbox.id}"]`);
    if (label) {
        label.classList.add('completed-task');
    }
    
    // Воспроизводим звук, если нужно
    if (withAnimation) {
        playCheckboxSound();
    }
}

// Воспроизвести анимацию задания - функция пустая, так как анимации убраны
function playTaskAnimation(taskItem, checkbox) {
    // Анимации убраны
    playCheckboxSound();
}

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

// Функция для отображения модального окна с расписанием
function showScheduleModal(day) {
    // Получаем текущий день, если не указан
    if (!day) {
        const today = new Date();
        const dayIndex = today.getDay();
        // Преобразуем индекс дня недели (0 - воскресенье, 1 - понедельник, ...) в наш формат
        day = dayIndex === 0 ? 'ВОСКРЕСЕНЬЕ' : 
              dayIndex === 1 ? 'ПОНЕДЕЛЬНИК' : 
              dayIndex === 2 ? 'ВТОРНИК' : 
              dayIndex === 3 ? 'СРЕДА' : 
              dayIndex === 4 ? 'ЧЕТВЕРГ' : 
              dayIndex === 5 ? 'ПЯТНИЦА' : 'СУББОТА';
    }
    
    // Массив дней недели для навигации
    const days = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА', 'СУББОТА', 'ВОСКРЕСЕНЬЕ'];
    const daysRu = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    const daysLowerCase = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Создаем модальное окно, если оно не существует
    let modal = document.querySelector('.schedule-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'schedule-modal';
        document.body.appendChild(modal);
        
        // Добавляем обработчик клика для закрытия модального окна при клике вне контента
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeScheduleModal();
            }
        });
        
        // Добавляем обработчик клавиши Escape для закрытия модального окна
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeScheduleModal();
            }
        });
    }
    
    // Определяем индекс выбранного дня
    const selectedDayIndex = days.indexOf(day);
    
    // Генерируем содержимое модального окна
    modal.innerHTML = `
        <div class="schedule-modal-content">
            <div class="schedule-modal-header">
                <div class="schedule-modal-title">${daysRu[selectedDayIndex]}</div>
                <button class="schedule-modal-close">&times;</button>
            </div>
            <div class="schedule-modal-body">
                <div class="schedule-day-tabs">
                    ${days.map((d, i) => `
                        <div class="schedule-day-tab ${d === day ? 'active' : ''}" data-day="${d}">
                            ${daysRu[i].substring(0, 3)}
                        </div>
                    `).join('')}
                </div>
                <div class="schedule-items-container">
                    <div class="schedule-items" id="schedule-items-${daysLowerCase[selectedDayIndex]}">
                        ${generateScheduleItems(day)}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Показываем модальное окно
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Добавляем обработчик для кнопки закрытия
    const closeButton = modal.querySelector('.schedule-modal-close');
    closeButton.addEventListener('click', closeScheduleModal);
    
    // Добавляем обработчики для вкладок дней недели
    const dayTabs = modal.querySelectorAll('.schedule-day-tab');
    dayTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const selectedDay = this.getAttribute('data-day');
            if (selectedDay !== day) {
                const currentDayIndex = days.indexOf(day);
                const newDayIndex = days.indexOf(selectedDay);
                const direction = newDayIndex > currentDayIndex ? 'left' : 'right';
                
                // Обновляем активную вкладку
                dayTabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Обновляем заголовок
                modal.querySelector('.schedule-modal-title').textContent = daysRu[newDayIndex];
                
                // Создаем новый контейнер для элементов расписания
                const itemsContainer = modal.querySelector('.schedule-items-container');
                const newItems = document.createElement('div');
                newItems.className = `schedule-items slide-${direction}`;
                newItems.id = `schedule-items-${daysLowerCase[newDayIndex]}`;
                newItems.innerHTML = generateScheduleItems(selectedDay);
                
                // Удаляем предыдущие элементы и добавляем новые
                const oldItems = modal.querySelector(`#schedule-items-${daysLowerCase[currentDayIndex]}`);
                if (oldItems) {
                    oldItems.remove();
                }
                itemsContainer.appendChild(newItems);
                
                // Обновляем текущий день
                day = selectedDay;
            }
        });
    });
    
    // Добавляем поддержку свайпов для мобильных устройств
    let touchStartX = 0;
    let touchEndX = 0;
    
    const itemsContainer = modal.querySelector('.schedule-items-container');
    
    itemsContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    itemsContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const threshold = 50; // Минимальное расстояние для определения свайпа
        
        if (touchEndX + threshold < touchStartX) {
            // Свайп влево - следующий день
            const currentIndex = days.indexOf(day);
            if (currentIndex < days.length - 1) {
                const nextDay = days[currentIndex + 1];
                const nextDayTab = modal.querySelector(`.schedule-day-tab[data-day="${nextDay}"]`);
                if (nextDayTab) {
                    nextDayTab.click();
                }
            }
        }
        
        if (touchEndX > touchStartX + threshold) {
            // Свайп вправо - предыдущий день
            const currentIndex = days.indexOf(day);
            if (currentIndex > 0) {
                const prevDay = days[currentIndex - 1];
                const prevDayTab = modal.querySelector(`.schedule-day-tab[data-day="${prevDay}"]`);
                if (prevDayTab) {
                    prevDayTab.click();
                }
            }
        }
    }
}

// Функция для генерации элементов расписания
function generateScheduleItems(day) {
    const schedule = weeklySchedule[day];
    
    if (!schedule || schedule.length === 0) {
        return `<div class="no-schedule">Нет запланированных задач на этот день</div>`;
    }
    
    return schedule.map(item => {
        // Определяем класс для типа задачи
        let taskClass = '';
        const taskName = item.title.toLowerCase();
        
        if (taskName.includes('учеба') || taskName.includes('занятия') || taskName.includes('уроки') || taskName.includes('домашнее задание')) {
            taskClass = 'study';
        } else if (taskName.includes('завтрак') || taskName.includes('обед') || taskName.includes('ужин') || taskName.includes('еда')) {
            taskClass = 'meal';
        } else if (taskName.includes('отдых') || taskName.includes('перерыв')) {
            taskClass = 'rest';
        } else if (taskName.includes('футбол') || taskName.includes('тренировка') || taskName.includes('спорт')) {
            taskClass = 'sport';
        } else if (taskName.includes('сон') || taskName.includes('спать')) {
            taskClass = 'sleep';
        } else if (taskName.includes('свободное время') || taskName.includes('прогулка')) {
            taskClass = 'free';
        }
        
        return `
            <div class="schedule-item ${taskClass}">
                <div class="schedule-item-time">${item.start} - ${item.end}</div>
                <div class="schedule-item-name">${item.title}</div>
            </div>
        `;
    }).join('');
}

// Функция для закрытия модального окна
function closeScheduleModal() {
    const modal = document.querySelector('.schedule-modal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            // Не удаляем модальное окно, просто скрываем его
        }, 300);
    }
}

// Функция для добавления кнопки расписания
function addScheduleButton() {
    // Проверяем, существует ли уже кнопка расписания
    if (document.getElementById('schedule-button')) return;
    
    // Создаем кнопку расписания
    const scheduleButton = document.createElement('button');
    scheduleButton.id = 'schedule-button';
    scheduleButton.className = 'icon-button';
    scheduleButton.innerHTML = '<i class="fas fa-calendar-alt"></i>';
    scheduleButton.title = 'Расписание на неделю';
    
    // Добавляем обработчик события для кнопки
    scheduleButton.addEventListener('click', function() {
        showScheduleModal();
    });
    
    // Находим элемент stats в заголовке
    const statsElement = document.querySelector('.stats');
    if (statsElement) {
        // Добавляем кнопку рядом с элементом stats
        statsElement.appendChild(scheduleButton);
    } else {
        // Если элемент stats не найден, добавляем кнопку в заголовок
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(scheduleButton);
        }
    }
    
    // Добавляем стили для кнопки
    const style = document.createElement('style');
    style.textContent = `
        #schedule-button {
            background-color: #f0f0f0;
            border: none;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            margin-left: 10px;
            transition: all 0.2s;
            position: relative;
            overflow: hidden;
        }
        
        #schedule-button:hover {
            background-color: #e0e0e0;
        }
        
        #schedule-button:active {
            transform: scale(0.95);
        }
        
        #schedule-button i {
            font-size: 1.2rem;
            color: #555;
        }
        
        #schedule-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(66, 133, 244, 0.1) 0%, rgba(66, 133, 244, 0) 70%);
            opacity: 0;
            transition: opacity 0.3s;
        }
        
        #schedule-button:hover::before {
            opacity: 1;
        }
        
        body.dark-theme #schedule-button {
            background-color: #333;
        }
        
        body.dark-theme #schedule-button:hover {
            background-color: #444;
        }
        
        body.dark-theme #schedule-button i {
            color: #ccc;
        }
        
        @keyframes pulse {
            0% {
                transform: scale(1);
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
            }
        }
        
        #schedule-button.pulse {
            animation: pulse 1.5s infinite;
        }
        
        /* Стили для мобильных устройств */
        @media (max-width: 768px) {
            #schedule-button {
                width: 36px;
                height: 36px;
            }
            
            #schedule-button i {
                font-size: 1rem;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Добавляем пульсацию кнопки при первом запуске
    setTimeout(() => {
        scheduleButton.classList.add('pulse');
        setTimeout(() => {
            scheduleButton.classList.remove('pulse');
        }, 5000);
    }, 2000);
}

// Функция для отображения текущей задачи в заголовке
function showCurrentTaskInHeader() {
    const headerTitle = document.querySelector('h1');
    if (!headerTitle) return;
    
    // Получаем текущий день недели
    const today = new Date();
    const dayIndex = today.getDay();
    const day = dayIndex === 0 ? 'ВОСКРЕСЕНЬЕ' : 
                dayIndex === 1 ? 'ПОНЕДЕЛЬНИК' : 
                dayIndex === 2 ? 'ВТОРНИК' : 
                dayIndex === 3 ? 'СРЕДА' : 
                dayIndex === 4 ? 'ЧЕТВЕРГ' : 
                dayIndex === 5 ? 'ПЯТНИЦА' : 'СУББОТА';
    
    // Получаем текущее время
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    
    // Получаем расписание на текущий день
    const daySchedule = weeklySchedule[day];
    if (!daySchedule || daySchedule.length === 0) return;
    
    // Находим текущую задачу
    let currentTask = null;
    let nextTask = null;
    
    for (let i = 0; i < daySchedule.length; i++) {
        const task = daySchedule[i];
        
        // Преобразуем время начала и окончания в минуты
        const [startHours, startMinutes] = task.start.split(':').map(Number);
        const [endHours, endMinutes] = task.end.split(':').map(Number);
        
        const startTimeInMinutes = startHours * 60 + startMinutes;
        const endTimeInMinutes = endHours * 60 + endMinutes;
        
        // Проверяем, находится ли текущее время в интервале задачи
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
            currentTask = task;
            
            // Находим следующую задачу
            if (i < daySchedule.length - 1) {
                nextTask = daySchedule[i + 1];
            }
            
            break;
        }
        
        // Если текущее время меньше времени начала задачи, значит это следующая задача
        if (currentTimeInMinutes < startTimeInMinutes) {
            nextTask = task;
            break;
        }
    }
    
    // Обновляем заголовок
    if (currentTask) {
        // Вычисляем оставшееся время
        const [endHours, endMinutes] = currentTask.end.split(':').map(Number);
        const endTimeInMinutes = endHours * 60 + endMinutes;
        const remainingMinutes = endTimeInMinutes - currentTimeInMinutes;
        
        const remainingHours = Math.floor(remainingMinutes / 60);
        const remainingMins = remainingMinutes % 60;
        
        let remainingTimeText = '';
        if (remainingHours > 0) {
            remainingTimeText = `${remainingHours} ч ${remainingMins} мин`;
        } else {
            remainingTimeText = `${remainingMins} мин`;
        }
        
        // Создаем элемент для отображения текущей задачи
        const currentTaskElement = document.createElement('div');
        currentTaskElement.className = 'current-task';
        currentTaskElement.innerHTML = `
            <div class="current-task-title">
                <i class="fas fa-clock"></i>
                <span>${currentTask.title}</span>
            </div>
            <div class="current-task-time">
                <span>Осталось: ${remainingTimeText}</span>
            </div>
        `;
        
        // Заменяем содержимое заголовка
        headerTitle.innerHTML = '';
        headerTitle.appendChild(currentTaskElement);
        
        // Добавляем стили для текущей задачи
        if (!document.getElementById('current-task-styles')) {
            const style = document.createElement('style');
            style.id = 'current-task-styles';
            style.textContent = `
                .current-task {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .current-task-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                
                .current-task-title i {
                    color: #4285f4;
                }
                
                .current-task-time {
                    font-size: 0.85rem;
                    color: #777;
                }
                
                body.dark-theme .current-task-time {
                    color: #aaa;
                }
                
                @keyframes pulse-text {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                
                .current-task-time.ending {
                    color: #ea4335;
                    animation: pulse-text 1s infinite;
                }
                
                body.dark-theme .current-task-time.ending {
                    color: #ff6b6b;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Добавляем класс "ending", если осталось менее 5 минут
        const currentTaskTime = currentTaskElement.querySelector('.current-task-time');
        if (remainingMinutes < 5) {
            currentTaskTime.classList.add('ending');
        }
    } else if (nextTask) {
        // Вычисляем время до следующей задачи
        const [startHours, startMinutes] = nextTask.start.split(':').map(Number);
        const startTimeInMinutes = startHours * 60 + startMinutes;
        const timeUntilNextTask = startTimeInMinutes - currentTimeInMinutes;
        
        const hoursUntilNext = Math.floor(timeUntilNextTask / 60);
        const minsUntilNext = timeUntilNextTask % 60;
        
        let timeUntilNextText = '';
        if (hoursUntilNext > 0) {
            timeUntilNextText = `${hoursUntilNext} ч ${minsUntilNext} мин`;
        } else {
            timeUntilNextText = `${minsUntilNext} мин`;
        }
        
        // Создаем элемент для отображения следующей задачи
        const nextTaskElement = document.createElement('div');
        nextTaskElement.className = 'next-task';
        nextTaskElement.innerHTML = `
            <div class="next-task-title">
                <i class="fas fa-hourglass-start"></i>
                <span>Следующая задача: ${nextTask.title}</span>
            </div>
            <div class="next-task-time">
                <span>Через: ${timeUntilNextText}</span>
            </div>
        `;
        
        // Заменяем содержимое заголовка
        headerTitle.innerHTML = '';
        headerTitle.appendChild(nextTaskElement);
        
        // Добавляем стили для следующей задачи
        if (!document.getElementById('next-task-styles')) {
            const style = document.createElement('style');
            style.id = 'next-task-styles';
            style.textContent = `
                .next-task {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                
                .next-task-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 600;
                    font-size: 1.1rem;
                }
                
                .next-task-title i {
                    color: #fbbc05;
                }
                
                .next-task-time {
                    font-size: 0.85rem;
                    color: #777;
                }
                
                body.dark-theme .next-task-time {
                    color: #aaa;
                }
                
                @keyframes pulse-soon {
                    0% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                    100% {
                        opacity: 1;
                    }
                }
                
                .next-task-time.soon {
                    color: #fbbc05;
                    animation: pulse-soon 1s infinite;
                }
                
                body.dark-theme .next-task-time.soon {
                    color: #ffd54f;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Добавляем класс "soon", если до следующей задачи осталось менее 10 минут
        const nextTaskTime = nextTaskElement.querySelector('.next-task-time');
        if (timeUntilNextTask < 10) {
            nextTaskTime.classList.add('soon');
        }
    }
}

// Обновляем информацию о текущей задаче каждую минуту
function startTaskUpdater() {
    // Обновляем каждую минуту
    setInterval(showCurrentTaskInHeader, 60000);
}

// Функция для отображения уведомлений о предстоящих задачах
function showTaskNotifications() {
    // Проверяем поддержку уведомлений
    if (!("Notification" in window)) {
        console.log("Этот браузер не поддерживает уведомления");
        return;
    }
    
    // Запрашиваем разрешение на отображение уведомлений
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Разрешение на уведомления получено");
            }
        });
    }
    
    // Если разрешение не получено, выходим
    if (Notification.permission !== "granted") {
        return;
    }
    
    // Получаем текущий день недели
    const today = new Date();
    const dayIndex = today.getDay();
    const day = dayIndex === 0 ? 'ВОСКРЕСЕНЬЕ' : 
                dayIndex === 1 ? 'ПОНЕДЕЛЬНИК' : 
                dayIndex === 2 ? 'ВТОРНИК' : 
                dayIndex === 3 ? 'СРЕДА' : 
                dayIndex === 4 ? 'ЧЕТВЕРГ' : 
                dayIndex === 5 ? 'ПЯТНИЦА' : 'СУББОТА';
    
    // Получаем текущее время
    const currentHours = today.getHours();
    const currentMinutes = today.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;
    
    // Получаем расписание на текущий день
    const daySchedule = weeklySchedule[day];
    if (!daySchedule || daySchedule.length === 0) return;
    
    // Находим следующую задачу
    let nextTask = null;
    
    for (let i = 0; i < daySchedule.length; i++) {
        const task = daySchedule[i];
        
        // Преобразуем время начала в минуты
        const [startHours, startMinutes] = task.start.split(':').map(Number);
        const startTimeInMinutes = startHours * 60 + startMinutes;
        
        // Если задача начинается в будущем и до нее осталось не более 5 минут
        const timeUntilTask = startTimeInMinutes - currentTimeInMinutes;
        if (timeUntilTask > 0 && timeUntilTask <= 5) {
            nextTask = task;
            
            // Отображаем уведомление
            const notification = new Notification("Скоро начнется задача", {
                body: `${task.title} начнется через ${timeUntilTask} мин`,
                icon: "/favicon.ico"
            });
            
            // Закрываем уведомление через 10 секунд
            setTimeout(() => {
                notification.close();
            }, 10000);
            
            break;
        }
    }
}

// Запускаем проверку уведомлений каждую минуту
function startNotificationChecker() {
    // Проверяем каждую минуту
    setInterval(showTaskNotifications, 60000);
}

// Функция для отображения прогресса дня
function showDayProgress() {
    // Проверяем, существует ли уже прогресс-бар
    let progressBar = document.querySelector('.day-progress');
    if (!progressBar) {
        // Создаем контейнер для прогресс-бара
        const progressContainer = document.createElement('div');
        progressContainer.className = 'day-progress-container';
        
        // Создаем прогресс-бар
        progressBar = document.createElement('div');
        progressBar.className = 'day-progress';
        
        // Создаем текст с процентом выполнения
        const progressText = document.createElement('div');
        progressText.className = 'day-progress-text';
        
        // Добавляем элементы в DOM
        progressContainer.appendChild(progressBar);
        progressContainer.appendChild(progressText);
        
        // Находим подходящее место для вставки
        const header = document.querySelector('.header');
        if (header) {
            header.after(progressContainer);
        } else {
            document.body.prepend(progressContainer);
        }
        
        // Добавляем стили для прогресс-бара
        const style = document.createElement('style');
        style.textContent = `
            .day-progress-container {
                width: 100%;
                height: 4px;
                background-color: #f0f0f0;
                position: relative;
                overflow: hidden;
                transition: height 0.3s;
            }
            
            .day-progress-container:hover {
                height: 8px;
            }
            
            .day-progress {
                height: 100%;
                background-color: #4285f4;
                width: 0;
                transition: width 0.5s ease;
                position: relative;
            }
            
            .day-progress::after {
                content: '';
                position: absolute;
                top: 0;
                right: 0;
                width: 100px;
                height: 100%;
                background: linear-gradient(90deg, rgba(66, 133, 244, 0) 0%, rgba(255, 255, 255, 0.2) 50%, rgba(66, 133, 244, 0) 100%);
                animation: shine 2s infinite;
            }
            
            @keyframes shine {
                0% {
                    transform: translateX(-100%);
                }
                100% {
                    transform: translateX(100%);
                }
            }
            
            .day-progress-text {
                position: absolute;
                top: 8px;
                right: 10px;
                font-size: 0.75rem;
                color: #777;
                background-color: rgba(255, 255, 255, 0.8);
                padding: 2px 6px;
                border-radius: 10px;
                opacity: 0;
                transition: opacity 0.3s;
            }
            
            .day-progress-container:hover .day-progress-text {
                opacity: 1;
            }
            
            body.dark-theme .day-progress-container {
                background-color: #333;
            }
            
            body.dark-theme .day-progress-text {
                color: #ddd;
                background-color: rgba(51, 51, 51, 0.8);
            }
        `;
        document.head.appendChild(style);
    }
    
    // Получаем текущее время
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentSeconds = now.getSeconds();
    
    // Вычисляем прогресс дня (от 0 до 1)
    const totalSecondsInDay = 24 * 60 * 60;
    const currentSecondOfDay = currentHours * 3600 + currentMinutes * 60 + currentSeconds;
    const progress = currentSecondOfDay / totalSecondsInDay;
    
    // Обновляем ширину прогресс-бара
    progressBar.style.width = `${progress * 100}%`;
    
    // Обновляем текст с процентом выполнения
    const progressText = document.querySelector('.day-progress-text');
    if (progressText) {
        const progressPercent = Math.round(progress * 100);
        const remainingHours = 23 - currentHours;
        const remainingMinutes = 59 - currentMinutes;
        
        progressText.textContent = `${progressPercent}% дня прошло • Осталось ${remainingHours}ч ${remainingMinutes}м`;
    }
}

// Запускаем обновление прогресса дня
function startProgressUpdater() {
    // Обновляем каждую минуту
    setInterval(showDayProgress, 60000);
}

// Функция для инициализации кнопки с тремя точками
function initializeTaskMenu() {
    const taskMenu = document.querySelector('.task-menu');
    if (!taskMenu) return;
    
    // Добавляем обработчик клика
    taskMenu.addEventListener('click', function() {
        showScheduleModal();
    });
    
    // Добавляем анимацию пульсации при первом запуске
    setTimeout(() => {
        taskMenu.classList.add('pulse');
        setTimeout(() => {
            taskMenu.classList.remove('pulse');
        }, 5000);
    }, 3000);
}
