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

    // Добавляем обработчик для кнопки с тремя точками
    const menuButton = document.querySelector('.task-menu i');
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            showScheduleModal();
        });
    }
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

// Загрузка сохраненных состояний задач
function loadTaskStates() {
    try {
        // Загружаем состояния чекбоксов
        const savedStates = JSON.parse(localStorage.getItem('task_states') || '{}');
        
        // Применяем сохраненные состояния к чекбоксам
        Object.keys(savedStates).forEach(id => {
            const checkbox = document.getElementById(id);
            if (checkbox) {
                checkbox.checked = savedStates[id];
            }
        });
        
        // Загружаем ежедневные задачи из localStorage, если они есть
        const dailyTasks = JSON.parse(localStorage.getItem('daily_tasks') || '[]');
        if (dailyTasks.length > 0) {
            const taskList = document.querySelector('.all-day-tasks .task-list');
            if (taskList) {
                // Очищаем список
                taskList.innerHTML = '';
                
                // Добавляем задачи
                dailyTasks.forEach((task, index) => {
                    const taskItem = document.createElement('div');
                    taskItem.className = 'task-item';
                    taskItem.innerHTML = `
                        <input type="checkbox" id="task${index + 1}">
                        <label for="task${index + 1}">${task}</label>
                    `;
                    taskList.appendChild(taskItem);
                });
            }
        }
        
        // Загружаем задачи расписания из localStorage, если они есть
        const scheduleTasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
        if (scheduleTasks.length > 0) {
            // Задачи расписания обновляются через updateNextTask
            // Нам не нужно здесь ничего делать, так как updateNextTask вызывается при загрузке страницы
        }
    } catch (error) {
        console.error('Ошибка при загрузке состояний задач:', error);
    }
}

// Сохранение состояний задач
function saveTaskStates() {
    try {
        // Сохраняем состояния чекбоксов
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        const states = {};
        
        checkboxes.forEach(checkbox => {
            states[checkbox.id] = checkbox.checked;
        });
        
        localStorage.setItem('task_states', JSON.stringify(states));
    } catch (error) {
        console.error('Ошибка при сохранении состояний задач:', error);
    }
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

// Обновление следующего задания
function updateNextTask() {
    const taskCard = document.querySelector('.task-card');
    if (!taskCard) return;
    
    // Получаем текущее время
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Получаем задачи расписания из localStorage
    const scheduleTasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
    
    // Если нет задач расписания, показываем сообщение по умолчанию
    if (scheduleTasks.length === 0) {
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-time">--:-- - --:--</div>
                <div class="task-menu">
                    <i class="fas fa-ellipsis-v"></i>
                </div>
            </div>
            <div class="task-title">Нет активных заданий</div>
        `;
        return;
    }
    
    // Преобразуем время в минуты для сравнения
    const currentTimeInMinutes = currentHour * 60 + currentMinute;
    
    // Находим ближайшую задачу
    let nextTask = null;
    let minDifference = Infinity;
    
    scheduleTasks.forEach(task => {
        // Разбиваем время начала на часы и минуты
        const [startHour, startMinute] = task.startTime.split(':').map(Number);
        const startTimeInMinutes = startHour * 60 + startMinute;
        
        // Вычисляем разницу во времени
        let difference = startTimeInMinutes - currentTimeInMinutes;
        
        // Если задача уже началась, но еще не закончилась, она имеет приоритет
        const [endHour, endMinute] = task.endTime.split(':').map(Number);
        const endTimeInMinutes = endHour * 60 + endMinute;
        
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes < endTimeInMinutes) {
            difference = 0; // Текущая задача
        }
        
        // Если задача на сегодня уже закончилась, пропускаем ее
        if (difference < 0 && Math.abs(difference) > 5) {
            return;
        }
        
        // Обновляем ближайшую задачу
        if (difference >= 0 && difference < minDifference) {
            minDifference = difference;
            nextTask = task;
        }
    });
    
    // Обновляем UI
    if (nextTask) {
        const isActive = minDifference === 0;
        
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-time">${nextTask.startTime} - ${nextTask.endTime}</div>
                <div class="task-menu">
                    <i class="fas fa-ellipsis-v"></i>
                </div>
            </div>
            <div class="task-title ${isActive ? 'active-task' : ''}">${nextTask.title}</div>
        `;
        
        // Если задача активна, добавляем класс к карточке
        if (isActive) {
            taskCard.classList.add('active-task-card');
        } else {
            taskCard.classList.remove('active-task-card');
        }
    } else {
        // Если нет подходящих задач, показываем сообщение по умолчанию
        taskCard.innerHTML = `
            <div class="task-header">
                <div class="task-time">--:-- - --:--</div>
                <div class="task-menu">
                    <i class="fas fa-ellipsis-v"></i>
                </div>
            </div>
            <div class="task-title">Нет активных заданий</div>
        `;
        taskCard.classList.remove('active-task-card');
    }
    
    // Добавляем обработчик для кнопки с тремя точками
    const menuButton = taskCard.querySelector('.task-menu i');
    if (menuButton) {
        menuButton.addEventListener('click', function() {
            showScheduleModal();
        });
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

// Функция для отображения модального окна с расписанием на выбранный день
function showScheduleModal(selectedDay = null, direction = null) {
    // Если день не указан, используем текущий день
    if (!selectedDay) {
        const now = new Date();
        const days = ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
        selectedDay = days[now.getDay()];
    }
    
    // Создаем модальное окно, если его еще нет
    let modal = document.getElementById('schedule-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'schedule-modal';
        modal.className = 'modal';
        document.body.appendChild(modal);
    }
    
    // Создаем содержимое модального окна
    const days = ["ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА", "ВОСКРЕСЕНЬЕ"];
    const currentDayIndex = days.indexOf(selectedDay);
    
    // Создаем контейнер для содержимого с эффектом свайпа
    let modalContent = `
        <div class="modal-content">
            <div class="modal-header">
                <div class="day-navigation">
                    <button id="prev-day" class="nav-button"><i class="fas fa-chevron-left"></i></button>
                    <h2>${selectedDay}</h2>
                    <button id="next-day" class="nav-button"><i class="fas fa-chevron-right"></i></button>
                </div>
                <button class="close-button">&times;</button>
            </div>
            <div class="modal-body">`;
    
    // Добавляем класс анимации в зависимости от направления
    let animationClass = '';
    if (direction === 'left') {
        animationClass = 'slide-from-right';
    } else if (direction === 'right') {
        animationClass = 'slide-from-left';
    }
    
    modalContent += `<div class="day-schedule ${animationClass}">`;
    
    // Получаем расписание для выбранного дня
    const daySchedule = weeklySchedule[selectedDay];
    if (daySchedule && daySchedule.length > 0) {
        daySchedule.forEach(task => {
            modalContent += `
                <div class="schedule-item">
                    <div class="schedule-time">${task.start} - ${task.end}</div>
                    <div class="schedule-title">${task.title}</div>
                </div>`;
        });
    } else {
        modalContent += `<div class="no-schedule">Нет расписания на этот день</div>`;
    }
    
    modalContent += `
                </div>
            </div>
        </div>`;
    
    // Если модальное окно уже открыто, обновляем только содержимое с анимацией
    if (modal.style.display === 'flex') {
        const oldSchedule = modal.querySelector('.day-schedule');
        const modalBody = modal.querySelector('.modal-body');
        const dayTitle = modal.querySelector('.day-navigation h2');
        
        // Обновляем заголовок
        dayTitle.textContent = selectedDay;
        
        // Создаем новый элемент расписания
        const newSchedule = document.createElement('div');
        newSchedule.className = `day-schedule ${animationClass}`;
        
        // Заполняем новое расписание
        if (daySchedule && daySchedule.length > 0) {
            daySchedule.forEach(task => {
                const scheduleItem = document.createElement('div');
                scheduleItem.className = 'schedule-item';
                scheduleItem.innerHTML = `
                    <div class="schedule-time">${task.start} - ${task.end}</div>
                    <div class="schedule-title">${task.title}</div>
                `;
                newSchedule.appendChild(scheduleItem);
            });
        } else {
            const noSchedule = document.createElement('div');
            noSchedule.className = 'no-schedule';
            noSchedule.textContent = 'Нет расписания на этот день';
            newSchedule.appendChild(noSchedule);
        }
        
        // Добавляем новое расписание рядом со старым
        modalBody.appendChild(newSchedule);
        
        // Запускаем анимацию
        setTimeout(() => {
            // Удаляем старое расписание после завершения анимации
            oldSchedule.remove();
        }, 300);
    } else {
        // Устанавливаем содержимое модального окна
        modal.innerHTML = modalContent;
        
        // Показываем модальное окно
        modal.style.display = 'flex';
    }
    
    // Добавляем обработчики событий для кнопок
    const closeButton = modal.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Обработчик для кнопки предыдущего дня
    const prevDayButton = modal.querySelector('#prev-day');
    prevDayButton.addEventListener('click', () => {
        const newIndex = (currentDayIndex - 1 + days.length) % days.length;
        showScheduleModal(days[newIndex], 'right');
    });
    
    // Обработчик для кнопки следующего дня
    const nextDayButton = modal.querySelector('#next-day');
    nextDayButton.addEventListener('click', () => {
        const newIndex = (currentDayIndex + 1) % days.length;
        showScheduleModal(days[newIndex], 'left');
    });
    
    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Добавляем обработчики свайпов для мобильных устройств
    const modalBodyElement = modal.querySelector('.modal-body');
    let touchStartX = 0;
    let touchEndX = 0;
    
    modalBodyElement.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    modalBodyElement.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, false);
    
    function handleSwipe() {
        const swipeThreshold = 50; // Минимальное расстояние для определения свайпа
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Свайп влево - следующий день
            const newIndex = (currentDayIndex + 1) % days.length;
            showScheduleModal(days[newIndex], 'left');
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // Свайп вправо - предыдущий день
            const newIndex = (currentDayIndex - 1 + days.length) % days.length;
            showScheduleModal(days[newIndex], 'right');
        }
    }
}
