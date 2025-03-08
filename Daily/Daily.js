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
    
    // Обновление времени для следующего задания
    updateNextTask();
    
    // Применение сохраненной темы
    applyTheme();

    // Обновление времени до следующего дня
    updateTimeUntilTomorrow();

    // Обновляем задание каждую минуту
    setInterval(updateNextTask, 60000);
    
    // Обновляем время до завтра каждую минуту
    setInterval(updateTimeUntilTomorrow, 60000);
    
    // Проверяем ежедневную серию
    checkDailyStreak();
    
    // Добавляем обработчик для иконки с тремя точками
    const taskMenuIcon = document.querySelector('.task-menu i');
    if (taskMenuIcon) {
        taskMenuIcon.addEventListener('click', function() {
            showDailyScheduleModal();
        });
    }
});

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

// Функция для отображения модального окна с расписанием по дням
function showDailyScheduleModal() {
    // Создаем модальное окно, если его еще нет
    let modal = document.getElementById('schedule-modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'schedule-modal';
        modal.className = 'modal';
        
        // Создаем содержимое модального окна
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Создаем заголовок модального окна с навигацией по дням
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        
        // Добавляем кнопки навигации и заголовок
        modalHeader.innerHTML = `
            <div class="day-navigation">
                <button class="nav-btn prev-day"><i class="fas fa-chevron-left"></i></button>
                <h3 id="modal-day-title">СЕГОДНЯ</h3>
                <button class="nav-btn next-day"><i class="fas fa-chevron-right"></i></button>
            </div>
            <button class="close-modal"><i class="fas fa-times"></i></button>
        `;
        
        // Создаем контейнер для списка заданий
        const scheduleContainer = document.createElement('div');
        scheduleContainer.id = 'day-schedule-container';
        scheduleContainer.className = 'day-schedule-container';
        
        // Добавляем элементы в модальное окно
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(scheduleContainer);
        modal.appendChild(modalContent);
        
        // Добавляем модальное окно в DOM
        document.body.appendChild(modal);
        
        // Добавляем обработчики событий для кнопок навигации
        const prevDayBtn = modal.querySelector('.prev-day');
        const nextDayBtn = modal.querySelector('.next-day');
        const closeBtn = modal.querySelector('.close-modal');
        
        prevDayBtn.addEventListener('click', function() {
            navigateDay(-1);
        });
        
        nextDayBtn.addEventListener('click', function() {
            navigateDay(1);
        });
        
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
    }
    
    // Отображаем модальное окно
    modal.style.display = 'flex';
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // Загружаем расписание на текущий день
    loadDaySchedule(0); // 0 означает текущий день
}

// Глобальная переменная для отслеживания текущего дня относительно сегодня
let currentDayOffset = 0;

// Функция для навигации по дням
function navigateDay(direction) {
    currentDayOffset += direction;
    loadDaySchedule(currentDayOffset);
}

// Функция для загрузки расписания на выбранный день
function loadDaySchedule(dayOffset) {
    // Получаем дату для выбранного дня
    const selectedDate = new Date();
    selectedDate.setDate(selectedDate.getDate() + dayOffset);
    
    // Получаем день недели
    const days = ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
    const selectedDay = days[selectedDate.getDay()];
    
    // Форматируем дату для отображения
    const options = { day: 'numeric', month: 'long' };
    const formattedDate = selectedDate.toLocaleDateString('ru-RU', options);
    
    // Обновляем заголовок модального окна
    const modalDayTitle = document.getElementById('modal-day-title');
    if (dayOffset === 0) {
        modalDayTitle.textContent = `СЕГОДНЯ (${formattedDate})`;
    } else if (dayOffset === 1) {
        modalDayTitle.textContent = `ЗАВТРА (${formattedDate})`;
    } else if (dayOffset === -1) {
        modalDayTitle.textContent = `ВЧЕРА (${formattedDate})`;
    } else {
        modalDayTitle.textContent = `${selectedDay} (${formattedDate})`;
    }
    
    // Получаем расписание на выбранный день
    const daySchedule = weeklySchedule[selectedDay];
    
    // Очищаем контейнер
    const scheduleContainer = document.getElementById('day-schedule-container');
    scheduleContainer.innerHTML = '';
    
    // Если расписание на этот день существует, отображаем его
    if (daySchedule && daySchedule.length > 0) {
        // Сортируем задания по времени начала
        daySchedule.sort((a, b) => {
            const aTime = a.start.split(':');
            const bTime = b.start.split(':');
            const aMinutes = parseInt(aTime[0]) * 60 + parseInt(aTime[1]);
            const bMinutes = parseInt(bTime[0]) * 60 + parseInt(bTime[1]);
            return aMinutes - bMinutes;
        });
        
        // Создаем элементы для каждого задания
        daySchedule.forEach(task => {
            const taskElement = document.createElement('div');
            taskElement.className = 'schedule-task-item';
            
            // Определяем, является ли задание текущим
            const now = new Date();
            const currentHours = now.getHours();
            const currentMinutes = now.getMinutes();
            const currentTimeMinutes = currentHours * 60 + currentMinutes;
            
            const taskStartParts = task.start.split(':');
            const taskEndParts = task.end.split(':');
            let taskStartMinutes = parseInt(taskStartParts[0]) * 60 + parseInt(taskStartParts[1]);
            let taskEndMinutes = parseInt(taskEndParts[0]) * 60 + parseInt(taskEndParts[1]);
            
            // Обработка задач, которые переходят на следующий день
            if (taskEndMinutes < taskStartMinutes) {
                taskEndMinutes += 24 * 60;
            }
            
            // Проверяем, является ли задание текущим и сегодняшним днем
            let isCurrentTask = false;
            if (dayOffset === 0 && currentTimeMinutes >= taskStartMinutes && currentTimeMinutes < taskEndMinutes) {
                isCurrentTask = true;
                taskElement.classList.add('current-task');
            }
            
            // Заполняем содержимое элемента задания
            taskElement.innerHTML = `
                <div class="schedule-task-time">${task.start} - ${task.end}</div>
                <div class="schedule-task-title">${task.title}</div>
                ${isCurrentTask ? '<div class="current-task-indicator">Сейчас</div>' : ''}
            `;
            
            scheduleContainer.appendChild(taskElement);
        });
    } else {
        // Если расписания нет, показываем сообщение
        const noScheduleElement = document.createElement('div');
        noScheduleElement.className = 'no-schedule-message';
        noScheduleElement.textContent = 'На этот день нет запланированных заданий';
        scheduleContainer.appendChild(noScheduleElement);
    }
}
