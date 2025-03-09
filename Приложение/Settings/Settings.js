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
    
    // Функционал для редактирования задач
    const editTasksButton = document.getElementById('edit-tasks-button');
    const taskEditModal = document.getElementById('task-edit-modal');
    const taskEditClose = document.getElementById('task-edit-close');
    const taskEditCancel = document.getElementById('task-edit-cancel');
    const taskEditSave = document.getElementById('task-edit-save');
    const taskEditTabs = document.querySelectorAll('.task-edit-tab');
    const taskEditSections = document.querySelectorAll('.task-edit-section');
    
    // Временные переменные для хранения изменений
    let tempDailyTasks = [];
    let tempWeeklyTasks = [];
    let tempSchedule = [];
    
    // Добавляем обработчик для кнопки редактирования задач
    if (editTasksButton) {
        editTasksButton.addEventListener('click', function() {
            openTaskEditModal();
        });
    }
    
    // Добавляем обработчики для закрытия модального окна
    if (taskEditClose) {
        taskEditClose.addEventListener('click', function() {
            closeTaskEditModal();
        });
    }
    
    if (taskEditCancel) {
        taskEditCancel.addEventListener('click', function() {
            closeTaskEditModal();
        });
    }
    
    // Добавляем обработчик для сохранения изменений
    if (taskEditSave) {
        taskEditSave.addEventListener('click', function() {
            saveTaskChanges();
            closeTaskEditModal();
        });
    }
    
    // Добавляем обработчики для переключения вкладок
    taskEditTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            switchTab(tabName);
        });
    });
    
    // Добавляем обработчики для добавления новых задач
    const addDailyTaskButton = document.getElementById('add-daily-task');
    const addWeeklyTaskButton = document.getElementById('add-weekly-task');
    const addScheduleItemButton = document.getElementById('add-schedule-item');
    
    if (addDailyTaskButton) {
        addDailyTaskButton.addEventListener('click', function() {
            addNewDailyTask();
        });
    }
    
    if (addWeeklyTaskButton) {
        addWeeklyTaskButton.addEventListener('click', function() {
            addNewWeeklyTask();
        });
    }
    
    if (addScheduleItemButton) {
        addScheduleItemButton.addEventListener('click', function() {
            addNewScheduleItem();
        });
    }
    
    // Добавляем обработчики для полей ввода в модальном окне
    document.getElementById('new-daily-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewDailyTask();
        }
    });
    
    document.getElementById('new-weekly-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewWeeklyTask();
        }
    });
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

// Функция для открытия модального окна редактирования задач
function openTaskEditModal() {
    // Загружаем текущие задачи
    loadCurrentTasks();
    
    // Отображаем модальное окно
    const taskEditModal = document.getElementById('task-edit-modal');
    taskEditModal.classList.add('active');
    
    // Устанавливаем активную вкладку
    switchTab('daily');
}

// Функция для закрытия модального окна
function closeTaskEditModal() {
    const taskEditModal = document.getElementById('task-edit-modal');
    taskEditModal.classList.remove('active');
}

// Функция для переключения вкладок
function switchTab(tabName) {
    // Удаляем активный класс со всех вкладок и секций
    const taskEditTabs = document.querySelectorAll('.task-edit-tab');
    const taskEditSections = document.querySelectorAll('.task-edit-section');
    
    taskEditTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    taskEditSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной вкладке и секции
    const selectedTab = document.querySelector(`.task-edit-tab[data-tab="${tabName}"]`);
    const selectedSection = document.getElementById(`${tabName}-section`);
    
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
}

// Функция для загрузки текущих задач
function loadCurrentTasks() {
    // Загружаем ежедневные задачи
    loadDailyTasks();
    
    // Загружаем расписание
    loadSchedule();
    
    // Загружаем еженедельные задачи
    loadWeeklyTasks();
}

// Функция для загрузки ежедневных задач
function loadDailyTasks() {
    const dailyTasksList = document.getElementById('daily-tasks-list');
    dailyTasksList.innerHTML = '';
    
    // Получаем сохраненные ежедневные задачи из localStorage
    const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks')) || [
        "Воркаут в \"Lumosity\"",
        "Воркаут в \"Peak\"",
        "Перевести 1 главу манги"
    ];
    
    // Сохраняем во временную переменную
    window.tempDailyTasks = [...dailyTasks];
    
    // Отображаем задачи
    dailyTasks.forEach((task, index) => {
        const li = createTaskListItem(task, index, 'daily');
        dailyTasksList.appendChild(li);
    });
}

// Функция для загрузки расписания
function loadSchedule() {
    const scheduleContainer = document.getElementById('schedule-items-container');
    scheduleContainer.innerHTML = '';
    
    // Получаем сохраненное расписание из localStorage
    const schedule = JSON.parse(localStorage.getItem('schedule')) || [
        { startTime: "10:00", endTime: "11:30", task: "Изучение JavaScript" },
        { startTime: "14:00", endTime: "15:00", task: "Физические упражнения" },
        { startTime: "18:00", endTime: "19:00", task: "Чтение книги" }
    ];
    
    // Сохраняем во временную переменную
    window.tempSchedule = [...schedule];
    
    // Отображаем элементы расписания
    schedule.forEach((item, index) => {
        const scheduleItem = createScheduleItem(item, index);
        scheduleContainer.appendChild(scheduleItem);
    });
}

// Функция для загрузки еженедельных задач
function loadWeeklyTasks() {
    const weeklyTasksList = document.getElementById('weekly-tasks-list');
    weeklyTasksList.innerHTML = '';
    
    // Получаем сохраненные еженедельные задачи из localStorage
    const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks')) || [
        "Уборка квартиры",
        "Планирование на неделю",
        "Просмотр нового фильма"
    ];
    
    // Сохраняем во временную переменную
    window.tempWeeklyTasks = [...weeklyTasks];
    
    // Отображаем задачи
    weeklyTasks.forEach((task, index) => {
        const li = createTaskListItem(task, index, 'weekly');
        weeklyTasksList.appendChild(li);
    });
}

// Функция для создания элемента списка задач
function createTaskListItem(task, index, type) {
    const li = document.createElement('li');
    li.className = 'task-edit-item';
    li.dataset.index = index;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = task;
    input.addEventListener('input', function() {
        if (type === 'daily') {
            window.tempDailyTasks[index] = this.value;
        } else if (type === 'weekly') {
            window.tempWeeklyTasks[index] = this.value;
        }
    });
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-edit-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        if (type === 'daily') {
            window.tempDailyTasks.splice(index, 1);
            loadDailyTasks();
        } else if (type === 'weekly') {
            window.tempWeeklyTasks.splice(index, 1);
            loadWeeklyTasks();
        }
    });
    
    actionsDiv.appendChild(deleteButton);
    li.appendChild(input);
    li.appendChild(actionsDiv);
    
    return li;
}

// Функция для создания элемента расписания
function createScheduleItem(item, index) {
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.dataset.index = index;
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'schedule-time';
    
    const startTimeInput = document.createElement('input');
    startTimeInput.type = 'time';
    startTimeInput.value = item.startTime;
    startTimeInput.addEventListener('change', function() {
        window.tempSchedule[index].startTime = this.value;
    });
    
    const timeSpan = document.createElement('span');
    timeSpan.textContent = '-';
    
    const endTimeInput = document.createElement('input');
    endTimeInput.type = 'time';
    endTimeInput.value = item.endTime;
    endTimeInput.addEventListener('change', function() {
        window.tempSchedule[index].endTime = this.value;
    });
    
    timeDiv.appendChild(startTimeInput);
    timeDiv.appendChild(timeSpan);
    timeDiv.appendChild(endTimeInput);
    
    const taskDiv = document.createElement('div');
    taskDiv.className = 'schedule-task';
    
    const taskInput = document.createElement('input');
    taskInput.type = 'text';
    taskInput.value = item.task;
    taskInput.addEventListener('input', function() {
        window.tempSchedule[index].task = this.value;
    });
    
    taskDiv.appendChild(taskInput);
    
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'schedule-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        window.tempSchedule.splice(index, 1);
        loadSchedule();
    });
    
    actionsDiv.appendChild(deleteButton);
    
    scheduleItem.appendChild(timeDiv);
    scheduleItem.appendChild(taskDiv);
    scheduleItem.appendChild(actionsDiv);
    
    return scheduleItem;
}

// Функция для добавления новой ежедневной задачи
function addNewDailyTask() {
    const newTaskInput = document.getElementById('new-daily-task');
    const taskText = newTaskInput.value.trim();
    
    if (taskText) {
        window.tempDailyTasks.push(taskText);
        newTaskInput.value = '';
        loadDailyTasks();
    }
}

// Функция для добавления новой еженедельной задачи
function addNewWeeklyTask() {
    const newTaskInput = document.getElementById('new-weekly-task');
    const taskText = newTaskInput.value.trim();
    
    if (taskText) {
        window.tempWeeklyTasks.push(taskText);
        newTaskInput.value = '';
        loadWeeklyTasks();
    }
}

// Функция для добавления нового элемента расписания
function addNewScheduleItem() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // Создаем новый элемент расписания с текущим временем
    const newItem = {
        startTime: currentTime,
        endTime: currentTime,
        task: "Новая задача"
    };
    
    window.tempSchedule.push(newItem);
    loadSchedule();
}

// Функция для сохранения изменений
function saveTaskChanges() {
    // Сохраняем ежедневные задачи
    localStorage.setItem('dailyTasks', JSON.stringify(window.tempDailyTasks));
    
    // Сохраняем расписание
    localStorage.setItem('schedule', JSON.stringify(window.tempSchedule));
    
    // Сохраняем еженедельные задачи
    localStorage.setItem('weeklyTasks', JSON.stringify(window.tempWeeklyTasks));
    
    // Показываем уведомление об успешном сохранении
    alert('Изменения успешно сохранены!');
}
