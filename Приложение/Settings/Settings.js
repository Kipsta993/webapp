document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Загрузка настроек
    loadSettings();
    
    // Добавление обработчиков событий для выбора темы
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            selectTheme(theme);
        });
    });
    
    // Добавление обработчика события для сброса всех данных
    const resetAllButton = document.getElementById('reset-all-button');
    resetAllButton.addEventListener('click', function() {
        if (confirm('Вы уверены, что хотите сбросить ВСЕ данные приложения? Это действие нельзя отменить.')) {
            resetAllData();
        }
    });
    
    // Добавление обработчиков событий для переключателей
    const soundsToggle = document.getElementById('sounds-toggle');
    soundsToggle.addEventListener('change', function() {
        saveSettings();
    });

    // Инициализация модального окна для редактирования задач
    initTasksEditModal();
});

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    } else {
        localStorage.setItem('streak', 7);
    }
}

// Функция для загрузки сохраненных настроек
function loadSettings() {
    // Загрузка темы
    const theme = localStorage.getItem('theme');
    if (theme) {
        selectTheme(theme);
    }
    
    // Загрузка настроек звуков
    const sounds = localStorage.getItem('sounds');
    if (sounds !== null) {
        document.getElementById('sounds-toggle').checked = sounds === 'true';
    }
}

// Функция для выбора темы
function selectTheme(theme) {
    // Удаляем активный класс со всех опций
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной опции
    const selectedOption = document.querySelector(`.theme-option[data-theme="${theme}"]`);
    if (selectedOption) {
        selectedOption.classList.add('active');
    }
    
    // Сохраняем выбранную тему
    localStorage.setItem('theme', theme);
    
    // Применяем тему
    if (theme === 'light') {
        applyLightTheme();
    } else if (theme === 'dark') {
        applyDarkTheme();
    }
}

// Функция для применения светлой темы
function applyLightTheme() {
    // Сбрасываем стили
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    document.body.classList.remove('dark-theme');
    
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
    document.body.classList.add('dark-theme');
    
    // Добавляем стили для темной темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section, .bottom-nav, .setting-item, .theme-option {
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
        }
        
        .setting-description {
            color: #ccc;
        }
        
        .theme-preview {
            border-color: #555;
        }
        
        button {
            background-color: #4285f4;
            color: white;
        }
        
        .danger-button {
            background-color: #f44336;
        }
    `;
    
    // Удаляем предыдущие стили, если они есть
    const existingStyle = document.getElementById('custom-theme-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
}

// Функция для сохранения настроек
function saveSettings() {
    const soundsToggle = document.getElementById('sounds-toggle');
    localStorage.setItem('sounds', soundsToggle.checked);
}

// Функция для сброса всех данных приложения
function resetAllData() {
    // Список ключей, которые нужно сохранить (например, настройки темы)
    const keysToKeep = ['theme'];
    
    // Сохраняем значения ключей, которые нужно оставить
    const savedValues = {};
    keysToKeep.forEach(key => {
        savedValues[key] = localStorage.getItem(key);
    });
    
    // Очищаем все данные из localStorage
    localStorage.clear();
    
    // Восстанавливаем сохраненные значения
    for (const key in savedValues) {
        if (savedValues[key] !== null) {
            localStorage.setItem(key, savedValues[key]);
        }
    }
    
    // Устанавливаем начальные значения для серии дней
    const streakCountElement = document.getElementById('streak-count');
    streakCountElement.textContent = '1';
    localStorage.setItem('streak', 1);
    
    // Показываем уведомление об успешном сбросе
    alert('Все данные приложения успешно сброшены!');
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
}

// Функция для запроса разрешения на отправку уведомлений
function requestNotificationPermission() {
    // Проверяем поддержку уведомлений в браузере
    if ('Notification' in window) {
        // Если разрешение еще не запрошено
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }
}

// Инициализация модального окна для редактирования задач
function initTasksEditModal() {
    const editTasksButton = document.getElementById('edit-tasks-button');
    const modal = document.getElementById('tasks-edit-modal');
    const closeModal = document.querySelector('.close-modal');
    const tabButtons = document.querySelectorAll('.tab-button');
    const saveTasksButton = document.getElementById('save-tasks-button');
    
    // Кнопка открытия модального окна
    editTasksButton.addEventListener('click', function() {
        modal.style.display = 'block';
        loadTasksData();
    });
    
    // Кнопка закрытия модального окна
    closeModal.addEventListener('click', function() {
        modal.style.display = 'none';
    });
    
    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Переключение вкладок
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Удаляем активный класс со всех кнопок и содержимого вкладок
            tabButtons.forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Добавляем активный класс выбранной кнопке и соответствующему содержимому
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Добавление ежедневных задач
    const addDailyTaskButton = document.getElementById('add-daily-task');
    addDailyTaskButton.addEventListener('click', function() {
        addDailyTask();
    });
    
    // Добавление задач расписания
    const addScheduleTaskButton = document.getElementById('add-schedule-task');
    addScheduleTaskButton.addEventListener('click', function() {
        addScheduleTask();
    });
    
    // Добавление еженедельных задач
    const addWeeklyTaskButton = document.getElementById('add-weekly-task');
    addWeeklyTaskButton.addEventListener('click', function() {
        addWeeklyTask();
    });
    
    // Обработка нажатия Enter в полях ввода
    document.getElementById('new-daily-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addDailyTask();
        }
    });
    
    document.getElementById('new-schedule-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addScheduleTask();
        }
    });
    
    document.getElementById('new-weekly-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addWeeklyTask();
        }
    });
    
    // Сохранение всех задач
    saveTasksButton.addEventListener('click', function() {
        saveTasksData();
        modal.style.display = 'none';
        alert('Задачи успешно сохранены!');
    });
}

// Загрузка данных задач
function loadTasksData() {
    // Загрузка ежедневных задач
    loadDailyTasks();
    
    // Загрузка задач расписания
    loadScheduleTasks();
    
    // Загрузка еженедельных задач
    loadWeeklyTasks();
}

// Загрузка ежедневных задач
function loadDailyTasks() {
    const dailyTasksList = document.getElementById('daily-tasks-list');
    dailyTasksList.innerHTML = '';
    
    // Получаем сохраненные ежедневные задачи
    const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];
    
    // Отображаем каждую задачу
    dailyTasks.forEach((task, index) => {
        const taskItem = createTaskEditItem(task, index, 'daily');
        dailyTasksList.appendChild(taskItem);
    });
}

// Загрузка задач расписания
function loadScheduleTasks() {
    const scheduleTasksList = document.getElementById('schedule-tasks-list');
    scheduleTasksList.innerHTML = '';
    
    // Получаем сохраненные задачи расписания
    const scheduleTasks = JSON.parse(localStorage.getItem('scheduleTasks')) || [];
    
    // Отображаем каждую задачу
    scheduleTasks.forEach((task, index) => {
        const taskItem = createTaskEditItem(task, index, 'schedule');
        scheduleTasksList.appendChild(taskItem);
    });
}

// Загрузка еженедельных задач
function loadWeeklyTasks() {
    const weeklyTasksList = document.getElementById('weekly-tasks-list');
    weeklyTasksList.innerHTML = '';
    
    // Получаем сохраненные еженедельные задачи
    const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [];
    
    // Отображаем каждую задачу
    weeklyTasks.forEach((task, index) => {
        const taskItem = createTaskEditItem(task, index, 'weekly');
        weeklyTasksList.appendChild(taskItem);
    });
}

// Создание элемента задачи для редактирования
function createTaskEditItem(task, index, type) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-edit-item';
    taskItem.dataset.index = index;
    
    // Для задач расписания добавляем время
    if (type === 'schedule') {
        const timeSpan = document.createElement('span');
        timeSpan.className = 'task-time';
        timeSpan.textContent = `${task.startTime} - ${task.endTime}`;
        taskItem.appendChild(timeSpan);
    }
    
    // Текст задачи
    const taskText = document.createElement('div');
    taskText.className = 'task-text';
    taskText.textContent = type === 'schedule' ? task.text : task;
    taskItem.appendChild(taskText);
    
    // Кнопка удаления
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        deleteTask(index, type);
    });
    taskItem.appendChild(deleteButton);
    
    return taskItem;
}

// Добавление ежедневной задачи
function addDailyTask() {
    const newTaskInput = document.getElementById('new-daily-task');
    const taskText = newTaskInput.value.trim();
    
    if (taskText) {
        // Получаем текущие задачи
        const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [];
        
        // Добавляем новую задачу
        dailyTasks.push(taskText);
        
        // Сохраняем обновленный список
        localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
        
        // Обновляем отображение
        loadDailyTasks();
        
        // Очищаем поле ввода
        newTaskInput.value = '';
    }
}

// Добавление задачи расписания
function addScheduleTask() {
    const newTaskInput = document.getElementById('new-schedule-task');
    const startTimeInput = document.getElementById('schedule-start-time');
    const endTimeInput = document.getElementById('schedule-end-time');
    
    const taskText = newTaskInput.value.trim();
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    
    if (taskText && startTime && endTime) {
        // Получаем текущие задачи расписания
        const scheduleTasks = JSON.parse(localStorage.getItem('scheduleTasks')) || [];
        
        // Добавляем новую задачу
        scheduleTasks.push({
            text: taskText,
            startTime: startTime,
            endTime: endTime
        });
        
        // Сортируем задачи по времени начала
        scheduleTasks.sort((a, b) => {
            return a.startTime.localeCompare(b.startTime);
        });
        
        // Сохраняем обновленный список
        localStorage.setItem('scheduleTasks', JSON.stringify(scheduleTasks));
        
        // Обновляем отображение
        loadScheduleTasks();
        
        // Очищаем поля ввода
        newTaskInput.value = '';
        startTimeInput.value = '';
        endTimeInput.value = '';
    } else {
        alert('Пожалуйста, заполните все поля для задачи расписания');
    }
}

// Добавление еженедельной задачи
function addWeeklyTask() {
    const newTaskInput = document.getElementById('new-weekly-task');
    const taskText = newTaskInput.value.trim();
    
    if (taskText) {
        // Получаем текущие еженедельные задачи
        const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [];
        
        // Добавляем новую задачу
        weeklyTasks.push(taskText);
        
        // Сохраняем обновленный список
        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
        
        // Обновляем отображение
        loadWeeklyTasks();
        
        // Очищаем поле ввода
        newTaskInput.value = '';
    }
}

// Удаление задачи
function deleteTask(index, type) {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        let tasks;
        let storageKey;
        
        // Определяем тип задачи и соответствующий ключ хранилища
        if (type === 'daily') {
            storageKey = 'dailyTasks';
        } else if (type === 'schedule') {
            storageKey = 'scheduleTasks';
        } else if (type === 'weekly') {
            storageKey = 'weeklyTasks';
        }
        
        // Получаем текущие задачи
        tasks = JSON.parse(localStorage.getItem(storageKey)) || [];
        
        // Удаляем задачу по индексу
        tasks.splice(index, 1);
        
        // Сохраняем обновленный список
        localStorage.setItem(storageKey, JSON.stringify(tasks));
        
        // Обновляем отображение в зависимости от типа
        if (type === 'daily') {
            loadDailyTasks();
        } else if (type === 'schedule') {
            loadScheduleTasks();
        } else if (type === 'weekly') {
            loadWeeklyTasks();
        }
    }
}

// Сохранение всех данных задач
function saveTasksData() {
    // Данные уже сохраняются при добавлении/удалении задач,
    // но здесь можно добавить дополнительную логику при необходимости
    
    // Например, можно обновить состояние задач на других страницах
    localStorage.setItem('tasksUpdated', 'true');
}
