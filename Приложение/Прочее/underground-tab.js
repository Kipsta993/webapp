// Функциональность подземной вкладки настроек

document.addEventListener('DOMContentLoaded', function() {
    // Создаем элементы подземной вкладки
    createUndergroundTab();
    
    // Инициализируем обработчики событий
    initSwipeDetection();
    
    // Загружаем настройки
    loadSettings();
    
    // Показываем подсказку о свайпе
    showSwipeHint();
});

// Создание элементов подземной вкладки
function createUndergroundTab() {
    // Создаем основной контейнер
    const undergroundTab = document.createElement('div');
    undergroundTab.className = 'underground-tab';
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.className = 'underground-tab-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Настройки';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'underground-tab-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', hideUndergroundTab);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    undergroundTab.appendChild(header);
    
    // Создаем контент
    const content = document.createElement('div');
    content.className = 'underground-tab-content';
    
    // Добавляем настройки темы
    const themeSettings = document.createElement('section');
    themeSettings.className = 'theme-settings';
    themeSettings.innerHTML = `
        <h2>Настройки темы</h2>
        <div class="setting-group">
            <h3>Выберите тему</h3>
            <div class="theme-options">
                <div class="theme-option" data-theme="light">
                    <div class="theme-preview light-theme"></div>
                    <span>Светлая</span>
                </div>
                <div class="theme-option" data-theme="dark">
                    <div class="theme-preview dark-theme"></div>
                    <span>Тёмная</span>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем настройки приложения
    const appSettings = document.createElement('section');
    appSettings.className = 'app-settings';
    appSettings.innerHTML = `
        <h2>Настройки приложения</h2>
        <div class="setting-item">
            <div class="setting-label">
                <span>Звуки</span>
                <p class="setting-description">Включить звуки при выполнении задач</p>
            </div>
            <label class="toggle">
                <input type="checkbox" id="sounds-toggle">
                <span class="toggle-slider"></span>
            </label>
        </div>
        <div class="setting-item">
            <div class="setting-label">
                <span>Сбросить все данные</span>
                <p class="setting-description">Сбросить все данные приложения (задания, статистику, дневник, серию дней)</p>
            </div>
            <button id="reset-all-button" class="danger-button">Сбросить</button>
        </div>
    `;
    
    // Добавляем редактор задач
    const taskEditor = document.createElement('section');
    taskEditor.className = 'task-editor-section';
    taskEditor.innerHTML = `
        <h2>Редактор задач</h2>
        <div class="task-editor-tabs">
            <button class="task-tab-button active" data-tab="daily">Ежедневные</button>
            <button class="task-tab-button" data-tab="schedule">Расписание</button>
            <button class="task-tab-button" data-tab="weekly">Еженедельные</button>
        </div>
        <div class="task-editor-content">
            <div class="task-tab-content active" id="daily-tasks-tab">
                <div class="task-list-editor">
                    <div class="task-list-container" id="daily-tasks-container"></div>
                    <div class="add-task-form">
                        <input type="text" id="new-daily-task" placeholder="Новая ежедневная задача">
                        <button id="add-daily-task-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
            <div class="task-tab-content" id="schedule-tasks-tab">
                <div class="task-list-editor">
                    <div class="task-list-container" id="schedule-tasks-container"></div>
                    <div class="add-task-form">
                        <input type="text" id="new-schedule-task-title" placeholder="Название задачи">
                        <div class="time-inputs">
                            <input type="time" id="new-schedule-task-start" placeholder="Начало">
                            <input type="time" id="new-schedule-task-end" placeholder="Конец">
                        </div>
                        <button id="add-schedule-task-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
            <div class="task-tab-content" id="weekly-tasks-tab">
                <div class="task-list-editor">
                    <div class="task-list-container" id="weekly-tasks-container"></div>
                    <div class="add-task-form">
                        <input type="text" id="new-weekly-task" placeholder="Новая еженедельная задача">
                        <button id="add-weekly-task-btn"><i class="fas fa-plus"></i></button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    content.appendChild(themeSettings);
    content.appendChild(appSettings);
    content.appendChild(taskEditor);
    undergroundTab.appendChild(content);
    
    // Добавляем область для свайпа закрытия
    const closeSwipeArea = document.createElement('div');
    closeSwipeArea.className = 'close-swipe-area';
    
    const closeSwipeIndicator = document.createElement('div');
    closeSwipeIndicator.className = 'close-swipe-indicator';
    
    closeSwipeArea.appendChild(closeSwipeIndicator);
    undergroundTab.appendChild(closeSwipeArea);
    
    // Добавляем на страницу
    document.body.appendChild(undergroundTab);
    
    // Добавляем область для свайпа
    const swipeOverlay = document.createElement('div');
    swipeOverlay.className = 'swipe-overlay';
    document.body.appendChild(swipeOverlay);
    
    // Добавляем специальную область для свайпа
    const swipeHandle = document.createElement('div');
    swipeHandle.className = 'swipe-handle';
    document.body.appendChild(swipeHandle);
    
    // Добавляем подсказку о свайпе
    const swipeHint = document.createElement('div');
    swipeHint.className = 'swipe-hint';
    swipeHint.innerHTML = '<i class="fas fa-arrow-down"></i> Свайпните вниз для настроек';
    document.body.appendChild(swipeHint);
    
    // Инициализируем обработчики для настроек
    initSettingsHandlers();
    
    // Обновляем нижнюю навигацию
    updateBottomNavigation();
}

// Обновление нижней навигации
function updateBottomNavigation() {
    const bottomNav = document.querySelector('.bottom-nav');
    if (!bottomNav) return;
    
    // Получаем все ссылки
    const links = bottomNav.querySelectorAll('a');
    
    // Находим ссылку на Stats
    const statsLink = Array.from(links).find(link => link.textContent.trim().includes('Stats'));
    if (statsLink) {
        // Добавляем класс, если его еще нет
        if (!statsLink.classList.contains('stats-button')) {
            statsLink.classList.add('stats-button');
            
            // Проверяем, есть ли уже контейнер для содержимого
            if (!statsLink.querySelector('.stats-button-content')) {
                // Получаем иконку и текст
                const icon = statsLink.querySelector('i');
                const text = statsLink.querySelector('span');
                
                if (icon && text) {
                    // Создаем контейнер для центрирования
                    const contentContainer = document.createElement('div');
                    contentContainer.className = 'stats-button-content';
                    contentContainer.style.display = 'flex';
                    contentContainer.style.flexDirection = 'column';
                    contentContainer.style.alignItems = 'center';
                    contentContainer.style.justifyContent = 'center';
                    contentContainer.style.height = '100%';
                    
                    // Перемещаем иконку и текст в контейнер
                    statsLink.appendChild(contentContainer);
                    contentContainer.appendChild(icon);
                    contentContainer.appendChild(text);
                }
            }
        }
    }
    
    // Обновляем иконку для Goals (меняем на кубок)
    const goalsLink = Array.from(links).find(link => link.textContent.trim().includes('Goals'));
    if (goalsLink) {
        const icon = goalsLink.querySelector('i');
        if (icon && !icon.classList.contains('fa-trophy')) {
            icon.className = 'fas fa-trophy'; // Меняем иконку на кубок
        }
    }
}

// Показать подсказку о свайпе
function showSwipeHint() {
    // Проверяем, показывали ли мы уже подсказку
    const hintShown = localStorage.getItem('swipe_hint_shown');
    
    if (!hintShown) {
        // Показываем подсказку через 2 секунды после загрузки страницы
        setTimeout(() => {
            const swipeHint = document.querySelector('.swipe-hint');
            if (swipeHint) {
                swipeHint.classList.add('visible');
                
                // Скрываем подсказку через 5 секунд
                setTimeout(() => {
                    swipeHint.classList.remove('visible');
                    
                    // Запоминаем, что подсказка была показана
                    localStorage.setItem('swipe_hint_shown', 'true');
                }, 5000);
            }
        }, 2000);
    }
}

// Инициализация обработчиков для настроек
function initSettingsHandlers() {
    // Обработчики для выбора темы
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            
            // Обновляем активную опцию
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Сохраняем настройку
            localStorage.setItem('theme', theme);
        });
    });
    
    // Обработчик для переключателя звуков
    const soundsToggle = document.getElementById('sounds-toggle');
    if (soundsToggle) {
        soundsToggle.addEventListener('change', function() {
            localStorage.setItem('sounds_enabled', this.checked);
        });
    }
    
    // Обработчик для кнопки сброса
    const resetButton = document.getElementById('reset-all-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите сбросить все данные приложения? Это действие нельзя отменить.')) {
                resetAllData();
            }
        });
    }
    
    // Инициализация редактора задач
    initTaskEditor();
}

// Инициализация редактора задач
function initTaskEditor() {
    // Загружаем задачи
    loadTasksForEditor();
    
    // Обработчики для табов
    const tabButtons = document.querySelectorAll('.task-tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Обновляем активную кнопку
            tabButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем активный контент
            const tabContents = document.querySelectorAll('.task-tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabName}-tasks-tab`).classList.add('active');
        });
    });
    
    // Обработчики для добавления задач
    const addDailyTaskBtn = document.getElementById('add-daily-task-btn');
    if (addDailyTaskBtn) {
        addDailyTaskBtn.addEventListener('click', function() {
            addDailyTask();
        });
        
        // Добавление по Enter
        const newDailyTaskInput = document.getElementById('new-daily-task');
        if (newDailyTaskInput) {
            newDailyTaskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addDailyTask();
                }
            });
        }
    }
    
    const addWeeklyTaskBtn = document.getElementById('add-weekly-task-btn');
    if (addWeeklyTaskBtn) {
        addWeeklyTaskBtn.addEventListener('click', function() {
            addWeeklyTask();
        });
        
        // Добавление по Enter
        const newWeeklyTaskInput = document.getElementById('new-weekly-task');
        if (newWeeklyTaskInput) {
            newWeeklyTaskInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    addWeeklyTask();
                }
            });
        }
    }
    
    const addScheduleTaskBtn = document.getElementById('add-schedule-task-btn');
    if (addScheduleTaskBtn) {
        addScheduleTaskBtn.addEventListener('click', function() {
            addScheduleTask();
        });
    }
}

// Загрузка задач для редактора
function loadTasksForEditor() {
    // Загружаем ежедневные задачи
    loadDailyTasksForEditor();
    
    // Загружаем задачи расписания
    loadScheduleTasksForEditor();
    
    // Загружаем еженедельные задачи
    loadWeeklyTasksForEditor();
}

// Загрузка ежедневных задач для редактора
function loadDailyTasksForEditor() {
    const container = document.getElementById('daily-tasks-container');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Получаем задачи из localStorage
    const dailyTasks = JSON.parse(localStorage.getItem('daily_tasks') || '[]');
    
    // Добавляем задачи в контейнер
    dailyTasks.forEach((task, index) => {
        const taskElement = createEditableTaskElement(task, index, 'daily');
        container.appendChild(taskElement);
    });
    
    // Если задач нет, показываем сообщение
    if (dailyTasks.length === 0) {
        container.innerHTML = '<div class="empty-tasks-message">Нет ежедневных задач</div>';
    }
}

// Загрузка задач расписания для редактора
function loadScheduleTasksForEditor() {
    const container = document.getElementById('schedule-tasks-container');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Получаем задачи из localStorage
    const scheduleTasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
    
    // Добавляем задачи в контейнер
    scheduleTasks.forEach((task, index) => {
        const taskElement = createEditableTaskElement(task, index, 'schedule');
        container.appendChild(taskElement);
    });
    
    // Если задач нет, показываем сообщение
    if (scheduleTasks.length === 0) {
        container.innerHTML = '<div class="empty-tasks-message">Нет задач в расписании</div>';
    }
}

// Загрузка еженедельных задач для редактора
function loadWeeklyTasksForEditor() {
    const container = document.getElementById('weekly-tasks-container');
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Получаем задачи из localStorage
    const weeklyTasks = JSON.parse(localStorage.getItem('weekly_tasks') || '[]');
    
    // Добавляем задачи в контейнер
    weeklyTasks.forEach((task, index) => {
        const taskElement = createEditableTaskElement(task, index, 'weekly');
        container.appendChild(taskElement);
    });
    
    // Если задач нет, показываем сообщение
    if (weeklyTasks.length === 0) {
        container.innerHTML = '<div class="empty-tasks-message">Нет еженедельных задач</div>';
    }
}

// Создание элемента редактируемой задачи
function createEditableTaskElement(task, index, type) {
    const taskElement = document.createElement('div');
    taskElement.className = `editable-task-item ${type}-task`;
    taskElement.setAttribute('data-index', index);
    
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    if (type === 'schedule') {
        // Для задач расписания показываем название и время
        taskContent.innerHTML = `
            <div>${task.title}</div>
            <div class="task-time">${task.startTime} - ${task.endTime}</div>
        `;
    } else {
        // Для обычных задач показываем только название
        taskContent.textContent = task.title || task;
    }
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-task-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.addEventListener('click', function() {
        editTask(index, type);
    });
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-task-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        deleteTask(index, type);
    });
    
    taskActions.appendChild(editButton);
    taskActions.appendChild(deleteButton);
    
    taskElement.appendChild(taskContent);
    taskElement.appendChild(taskActions);
    
    return taskElement;
}

// Добавление ежедневной задачи
function addDailyTask() {
    const input = document.getElementById('new-daily-task');
    if (!input || !input.value.trim()) return;
    
    // Получаем текущие задачи
    const dailyTasks = JSON.parse(localStorage.getItem('daily_tasks') || '[]');
    
    // Добавляем новую задачу
    dailyTasks.push(input.value.trim());
    
    // Сохраняем обновленный список
    localStorage.setItem('daily_tasks', JSON.stringify(dailyTasks));
    
    // Очищаем поле ввода
    input.value = '';
    
    // Обновляем отображение
    loadDailyTasksForEditor();
    
    // Обновляем страницу Daily, если она открыта
    updateDailyTasksUI();
}

// Добавление задачи расписания
function addScheduleTask() {
    const titleInput = document.getElementById('new-schedule-task-title');
    const startTimeInput = document.getElementById('new-schedule-task-start');
    const endTimeInput = document.getElementById('new-schedule-task-end');
    
    if (!titleInput || !startTimeInput || !endTimeInput || 
        !titleInput.value.trim() || !startTimeInput.value || !endTimeInput.value) {
        alert('Пожалуйста, заполните все поля для задачи расписания');
        return;
    }
    
    // Получаем текущие задачи
    const scheduleTasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
    
    // Добавляем новую задачу
    scheduleTasks.push({
        title: titleInput.value.trim(),
        startTime: startTimeInput.value,
        endTime: endTimeInput.value
    });
    
    // Сортируем задачи по времени начала
    scheduleTasks.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    });
    
    // Сохраняем обновленный список
    localStorage.setItem('schedule_tasks', JSON.stringify(scheduleTasks));
    
    // Очищаем поля ввода
    titleInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    
    // Обновляем отображение
    loadScheduleTasksForEditor();
    
    // Обновляем страницу Daily, если она открыта
    updateScheduleTasksUI();
}

// Добавление еженедельной задачи
function addWeeklyTask() {
    const input = document.getElementById('new-weekly-task');
    if (!input || !input.value.trim()) return;
    
    // Получаем текущие задачи
    const weeklyTasks = JSON.parse(localStorage.getItem('weekly_tasks') || '[]');
    
    // Добавляем новую задачу
    weeklyTasks.push(input.value.trim());
    
    // Сохраняем обновленный список
    localStorage.setItem('weekly_tasks', JSON.stringify(weeklyTasks));
    
    // Очищаем поле ввода
    input.value = '';
    
    // Обновляем отображение
    loadWeeklyTasksForEditor();
    
    // Обновляем страницу Weekly, если она открыта
    updateWeeklyTasksUI();
}

// Редактирование задачи
function editTask(index, type) {
    let tasks, task, newValue;
    
    if (type === 'daily') {
        tasks = JSON.parse(localStorage.getItem('daily_tasks') || '[]');
        task = tasks[index];
        newValue = prompt('Редактировать ежедневную задачу:', task);
        
        if (newValue !== null && newValue.trim()) {
            tasks[index] = newValue.trim();
            localStorage.setItem('daily_tasks', JSON.stringify(tasks));
            loadDailyTasksForEditor();
            updateDailyTasksUI();
        }
    } 
    else if (type === 'weekly') {
        tasks = JSON.parse(localStorage.getItem('weekly_tasks') || '[]');
        task = tasks[index];
        newValue = prompt('Редактировать еженедельную задачу:', task);
        
        if (newValue !== null && newValue.trim()) {
            tasks[index] = newValue.trim();
            localStorage.setItem('weekly_tasks', JSON.stringify(tasks));
            loadWeeklyTasksForEditor();
            updateWeeklyTasksUI();
        }
    } 
    else if (type === 'schedule') {
        tasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
        task = tasks[index];
        
        const newTitle = prompt('Название задачи:', task.title);
        if (newTitle === null) return;
        
        const newStartTime = prompt('Время начала (HH:MM):', task.startTime);
        if (newStartTime === null) return;
        
        const newEndTime = prompt('Время окончания (HH:MM):', task.endTime);
        if (newEndTime === null) return;
        
        if (newTitle.trim() && newStartTime.trim() && newEndTime.trim()) {
            tasks[index] = {
                title: newTitle.trim(),
                startTime: newStartTime.trim(),
                endTime: newEndTime.trim()
            };
            
            // Сортируем задачи по времени начала
            tasks.sort((a, b) => {
                return a.startTime.localeCompare(b.startTime);
            });
            
            localStorage.setItem('schedule_tasks', JSON.stringify(tasks));
            loadScheduleTasksForEditor();
            updateScheduleTasksUI();
        }
    }
}

// Удаление задачи
function deleteTask(index, type) {
    if (!confirm('Вы уверены, что хотите удалить эту задачу?')) return;
    
    let tasks;
    
    if (type === 'daily') {
        tasks = JSON.parse(localStorage.getItem('daily_tasks') || '[]');
        tasks.splice(index, 1);
        localStorage.setItem('daily_tasks', JSON.stringify(tasks));
        loadDailyTasksForEditor();
        updateDailyTasksUI();
    } 
    else if (type === 'weekly') {
        tasks = JSON.parse(localStorage.getItem('weekly_tasks') || '[]');
        tasks.splice(index, 1);
        localStorage.setItem('weekly_tasks', JSON.stringify(tasks));
        loadWeeklyTasksForEditor();
        updateWeeklyTasksUI();
    } 
    else if (type === 'schedule') {
        tasks = JSON.parse(localStorage.getItem('schedule_tasks') || '[]');
        tasks.splice(index, 1);
        localStorage.setItem('schedule_tasks', JSON.stringify(tasks));
        loadScheduleTasksForEditor();
        updateScheduleTasksUI();
    }
}

// Обновление UI ежедневных задач на странице Daily
function updateDailyTasksUI() {
    // Проверяем, находимся ли мы на странице Daily
    const dailyTaskList = document.querySelector('.all-day-tasks .task-list');
    if (!dailyTaskList) return;
    
    // Получаем задачи
    const dailyTasks = JSON.parse(localStorage.getItem('daily_tasks') || '[]');
    
    // Очищаем список
    dailyTaskList.innerHTML = '';
    
    // Добавляем задачи
    dailyTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type="checkbox" id="task${index + 1}">
            <label for="task${index + 1}">${task}</label>
        `;
        dailyTaskList.appendChild(taskItem);
    });
    
    // Инициализируем чекбоксы
    if (typeof initializeCheckboxes === 'function') {
        initializeCheckboxes();
    }
    
    // Инициализируем обработчики кликов
    if (typeof initializeTaskItems === 'function') {
        initializeTaskItems();
    }
}

// Обновление UI задач расписания на странице Daily
function updateScheduleTasksUI() {
    // Проверяем, находимся ли мы на странице Daily
    const nextTaskCard = document.querySelector('.timed-task .task-card');
    if (!nextTaskCard) return;
    
    // Обновляем следующее задание
    if (typeof updateNextTask === 'function') {
        updateNextTask();
    }
}

// Обновление UI еженедельных задач на странице Weekly
function updateWeeklyTasksUI() {
    // Проверяем, находимся ли мы на странице Weekly
    const weeklyTaskList = document.querySelector('.weekly-tasks .task-list');
    if (!weeklyTaskList) return;
    
    // Получаем задачи
    const weeklyTasks = JSON.parse(localStorage.getItem('weekly_tasks') || '[]');
    
    // Очищаем список
    weeklyTaskList.innerHTML = '';
    
    // Добавляем задачи
    weeklyTasks.forEach((task, index) => {
        const taskItem = document.createElement('div');
        taskItem.className = 'task-item';
        taskItem.innerHTML = `
            <input type="checkbox" id="weekly-task${index + 1}">
            <label for="weekly-task${index + 1}">${task}</label>
        `;
        weeklyTaskList.appendChild(taskItem);
    });
    
    // Инициализируем чекбоксы
    if (typeof initializeCheckboxes === 'function') {
        initializeCheckboxes();
    }
    
    // Инициализируем обработчики кликов
    if (typeof initializeTaskItems === 'function') {
        initializeTaskItems();
    }
}

// Загрузка сохраненных настроек
function loadSettings() {
    // Загружаем тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Отмечаем активную опцию темы
    const activeThemeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (activeThemeOption) {
        activeThemeOption.classList.add('active');
    }
    
    // Загружаем настройку звуков
    const soundsEnabled = localStorage.getItem('sounds_enabled') !== 'false';
    const soundsToggle = document.getElementById('sounds-toggle');
    if (soundsToggle) {
        soundsToggle.checked = soundsEnabled;
    }
}

// Установка темы
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Сброс всех данных
function resetAllData() {
    // Очищаем все данные из localStorage, кроме настроек темы
    const theme = localStorage.getItem('theme');
    const soundsEnabled = localStorage.getItem('sounds_enabled');
    
    localStorage.clear();
    
    // Восстанавливаем настройки темы
    localStorage.setItem('theme', theme || 'light');
    localStorage.setItem('sounds_enabled', soundsEnabled !== 'false');
    
    // Перезагружаем страницу
    window.location.reload();
}

// Инициализация обнаружения свайпа
function initSwipeDetection() {
    // Используем специальную область для свайпа
    const swipeHandle = document.querySelector('.swipe-handle');
    if (!swipeHandle) return;
    
    let startY = 0;
    let startTime = 0;
    
    // Обработчик начала касания
    swipeHandle.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        startTime = Date.now();
    });
    
    // Обработчик движения пальца
    swipeHandle.addEventListener('touchmove', function(e) {
        if (!startY) return;
        
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY; // Изменено для свайпа вниз
        
        // Если свайп вниз и достаточно длинный
        if (diff > 30) {
            e.preventDefault();
            showUndergroundTab();
            startY = 0;
        }
    });
    
    // Обработчик окончания касания
    swipeHandle.addEventListener('touchend', function(e) {
        const endTime = Date.now();
        const timeDiff = endTime - startTime;
        
        // Сбрасываем начальную позицию
        startY = 0;
    });
    
    // Добавляем обработчик свайпа вверх ТОЛЬКО для области свайпа закрытия
    const closeSwipeArea = document.querySelector('.close-swipe-area');
    if (closeSwipeArea) {
        let tabStartY = 0;
        
        closeSwipeArea.addEventListener('touchstart', function(e) {
            tabStartY = e.touches[0].clientY;
            e.stopPropagation(); // Предотвращаем всплытие события
        });
        
        closeSwipeArea.addEventListener('touchmove', function(e) {
            if (!tabStartY) return;
            
            const currentY = e.touches[0].clientY;
            const diff = tabStartY - currentY; // Изменено для свайпа вверх
            
            // Если свайп вверх и достаточно длинный
            if (diff > 30) {
                e.preventDefault();
                hideUndergroundTab();
                tabStartY = 0;
            }
            
            e.stopPropagation(); // Предотвращаем всплытие события
        });
        
        closeSwipeArea.addEventListener('touchend', function(e) {
            tabStartY = 0;
            e.stopPropagation(); // Предотвращаем всплытие события
        });
    }
    
    // Добавляем обработчик клика на нижнюю навигацию
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        // Убедимся, что клики на нижней навигации работают
        bottomNav.addEventListener('click', function(e) {
            // Если клик был на ссылке, убедимся, что она работает
            if (e.target.closest('a')) {
                e.stopPropagation(); // Останавливаем всплытие события
            }
        });
    }
}

// Показать подземную вкладку
function showUndergroundTab() {
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        undergroundTab.classList.add('visible');
    }
}

// Скрыть подземную вкладку
function hideUndergroundTab() {
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        undergroundTab.classList.remove('visible');
    }
} 