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
    
    // Добавляем раздел управления задачами
    const taskManagerSettings = document.createElement('section');
    taskManagerSettings.className = 'task-manager-settings';
    taskManagerSettings.innerHTML = `
        <h2>Управление задачами</h2>
        <div class="task-tabs">
            <div class="task-tab active" data-tab="daily">Ежедневные</div>
            <div class="task-tab" data-tab="weekly">Еженедельные</div>
        </div>
        
        <div class="task-content active" id="daily-tasks-content">
            <div class="task-list-container">
                <div class="task-list-header">
                    <button class="add-task-btn" id="add-daily-task">
                        <i class="fas fa-plus"></i> Добавить задачу
                    </button>
                </div>
                <div class="tasks-list" id="daily-tasks-list">
                    <!-- Здесь будут отображаться ежедневные задачи -->
                </div>
            </div>
        </div>
        
        <div class="task-content" id="weekly-tasks-content">
            <div class="task-list-container">
                <div class="task-list-header">
                    <button class="add-task-btn" id="add-weekly-task">
                        <i class="fas fa-plus"></i> Добавить задачу
                    </button>
                </div>
                <div class="tasks-list" id="weekly-tasks-list">
                    <!-- Здесь будут отображаться еженедельные задачи -->
                </div>
            </div>
        </div>
    `;
    
    content.appendChild(themeSettings);
    content.appendChild(appSettings);
    content.appendChild(taskManagerSettings);
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
    
    // Обработчики для вкладок задач
    const taskTabs = document.querySelectorAll('.task-tab');
    const taskContents = document.querySelectorAll('.task-content');
    
    taskTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Обновляем активную вкладку
            taskTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Обновляем активный контент
            taskContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === `${tabName}-tasks-content`) {
                    content.classList.add('active');
                }
            });
            
            // Загружаем задачи для активной вкладки
            loadTasksIndependently();
        });
    });
    
    // Загружаем задачи при открытии настроек
    loadTasksIndependently();
    
    // Обработчики для кнопок добавления задач
    const addDailyTaskBtn = document.getElementById('add-daily-task');
    if (addDailyTaskBtn) {
        addDailyTaskBtn.addEventListener('click', function() {
            showAddTaskModal('daily');
        });
    }
    
    const addWeeklyTaskBtn = document.getElementById('add-weekly-task');
    if (addWeeklyTaskBtn) {
        addWeeklyTaskBtn.addEventListener('click', function() {
            showAddTaskModal('weekly');
        });
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

// Функция для отображения подземной вкладки
function showUndergroundTab() {
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        undergroundTab.classList.add('visible');
        
        // Обновляем активную вкладку в нижней навигации
        updateBottomNavigation();
        
        // Загружаем задачи при открытии настроек
        loadTasksIndependently();
    }
}

// Скрыть подземную вкладку
function hideUndergroundTab() {
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        undergroundTab.classList.remove('visible');
    }
}

// Функция для загрузки задач независимо от текущей страницы
function loadTasksIndependently() {
    // Определяем, какая вкладка активна
    const activeTab = document.querySelector('.task-tab.active');
    const activeTabType = activeTab ? activeTab.getAttribute('data-tab') : 'daily';
    
    // Загружаем ежедневные задачи, если активна вкладка "daily"
    const dailyTasksList = document.getElementById('daily-tasks-list');
    if (dailyTasksList && (activeTabType === 'daily')) {
        dailyTasksList.innerHTML = '<div class="loading-tasks">Загрузка задач...</div>';
        
        // Загружаем ежедневные задачи из localStorage
        const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
        const dailyTasksText = JSON.parse(localStorage.getItem('dailyTasksText') || '{}');
        
        // Загружаем задачи из index.html
        fetch('index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Получаем все задачи из документа
                const taskElements = [];
                const checkboxes = doc.querySelectorAll('.all-day-tasks .task-item input[type="checkbox"]');
                
                if (checkboxes.length === 0) {
                    dailyTasksList.innerHTML = '<div class="no-tasks">Нет ежедневных задач</div>';
                    return;
                }
                
                checkboxes.forEach(checkbox => {
                    const taskId = checkbox.id;
                    const label = doc.querySelector(`label[for="${taskId}"]`);
                    let taskText = '';
                    
                    // Сначала проверяем, есть ли сохраненный текст в localStorage
                    if (dailyTasksText[taskId]) {
                        taskText = dailyTasksText[taskId];
                    } else if (label) {
                        taskText = label.textContent;
                    }
                    
                    // Проверяем, есть ли задача в localStorage
                    const isChecked = dailyTasks[taskId] || false;
                    
                    // Создаем элемент задачи
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item-settings';
                    
                    taskElement.innerHTML = `
                        <div class="task-info">
                            <div class="task-checkbox ${isChecked ? 'checked' : ''}">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="task-text">${taskText || 'Задача без названия'}</div>
                        </div>
                        <div class="task-actions">
                            <button class="edit-task-btn" data-task-id="${taskId}" data-task-type="daily" data-task-text="${encodeURIComponent(taskText)}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-task-btn" data-task-id="${taskId}" data-task-type="daily">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    // Добавляем обработчики событий для кнопок
                    const editBtn = taskElement.querySelector('.edit-task-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', function() {
                            const taskId = this.getAttribute('data-task-id');
                            const taskType = this.getAttribute('data-task-type');
                            const taskText = decodeURIComponent(this.getAttribute('data-task-text'));
                            showEditTaskModal(taskId, taskType, taskText);
                        });
                    }
                    
                    const deleteBtn = taskElement.querySelector('.delete-task-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', function() {
                            const taskId = this.getAttribute('data-task-id');
                            const taskType = this.getAttribute('data-task-type');
                            showDeleteTaskConfirmation(taskId, taskType);
                        });
                    }
                    
                    taskElements.push(taskElement);
                });
                
                // Очищаем список и добавляем задачи
                dailyTasksList.innerHTML = '';
                taskElements.forEach(element => {
                    dailyTasksList.appendChild(element);
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке ежедневных задач:', error);
                dailyTasksList.innerHTML = '<div class="no-tasks">Ошибка при загрузке задач</div>';
            });
    }
    
    // Загружаем еженедельные задачи, если активна вкладка "weekly"
    const weeklyTasksList = document.getElementById('weekly-tasks-list');
    if (weeklyTasksList && (activeTabType === 'weekly')) {
        weeklyTasksList.innerHTML = '<div class="loading-tasks">Загрузка задач...</div>';
        
        // Загружаем еженедельные задачи из localStorage
        const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '{}');
        const weeklyTasksText = JSON.parse(localStorage.getItem('weeklyTasksText') || '{}');
        
        // Загружаем задачи из Weekly.html
        fetch('Приложение/Weekly/Weekly.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Получаем все задачи из документа
                const taskElements = [];
                const checkboxes = doc.querySelectorAll('.weekly-tasks .task-item input[type="checkbox"]');
                
                if (checkboxes.length === 0) {
                    weeklyTasksList.innerHTML = '<div class="no-tasks">Нет еженедельных задач</div>';
                    return;
                }
                
                checkboxes.forEach(checkbox => {
                    const taskId = checkbox.id;
                    const label = doc.querySelector(`label[for="${taskId}"]`);
                    let taskText = '';
                    
                    // Сначала проверяем, есть ли сохраненный текст в localStorage
                    if (weeklyTasksText[taskId]) {
                        taskText = weeklyTasksText[taskId];
                    } else if (label) {
                        taskText = label.textContent;
                    }
                    
                    // Проверяем, есть ли задача в localStorage
                    const isChecked = weeklyTasks[taskId] || false;
                    const isDisabled = weeklyTasks[taskId + '_disabled'] || false;
                    
                    // Создаем элемент задачи
                    const taskElement = document.createElement('div');
                    taskElement.className = 'task-item-settings';
                    if (isDisabled) {
                        taskElement.classList.add('disabled');
                    }
                    
                    taskElement.innerHTML = `
                        <div class="task-info">
                            <div class="task-checkbox ${isChecked ? 'checked' : ''}">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="task-text">${taskText || 'Задача без названия'}</div>
                        </div>
                        <div class="task-actions">
                            <button class="edit-task-btn" data-task-id="${taskId}" data-task-type="weekly" data-task-text="${encodeURIComponent(taskText)}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-task-btn" data-task-id="${taskId}" data-task-type="weekly">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    
                    // Добавляем обработчики событий для кнопок
                    const editBtn = taskElement.querySelector('.edit-task-btn');
                    if (editBtn) {
                        editBtn.addEventListener('click', function() {
                            const taskId = this.getAttribute('data-task-id');
                            const taskType = this.getAttribute('data-task-type');
                            const taskText = decodeURIComponent(this.getAttribute('data-task-text'));
                            showEditTaskModal(taskId, taskType, taskText);
                        });
                    }
                    
                    const deleteBtn = taskElement.querySelector('.delete-task-btn');
                    if (deleteBtn) {
                        deleteBtn.addEventListener('click', function() {
                            const taskId = this.getAttribute('data-task-id');
                            const taskType = this.getAttribute('data-task-type');
                            showDeleteTaskConfirmation(taskId, taskType);
                        });
                    }
                    
                    taskElements.push(taskElement);
                });
                
                // Очищаем список и добавляем задачи
                weeklyTasksList.innerHTML = '';
                taskElements.forEach(element => {
                    weeklyTasksList.appendChild(element);
                });
            })
            .catch(error => {
                console.error('Ошибка при загрузке еженедельных задач:', error);
                weeklyTasksList.innerHTML = '<div class="no-tasks">Ошибка при загрузке задач</div>';
            });
    }
}

// Функция для добавления новой задачи
function addNewTask(taskText, taskType) {
    if (taskType === 'daily') {
        // Создаем уникальный ID для новой задачи
        const taskId = 'task' + Date.now();
        
        // Обновляем localStorage
        const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
        dailyTasks[taskId] = false;
        localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
        
        // Проверяем, открыта ли страница Daily
        const dailyTaskList = document.querySelector('.all-day-tasks .task-list');
        if (dailyTaskList) {
            // Получаем существующий элемент задачи для копирования стиля
            const existingTaskItem = document.querySelector('.all-day-tasks .task-item');
            
            if (existingTaskItem) {
                // Клонируем существующий элемент и изменяем его
                const taskItem = existingTaskItem.cloneNode(true);
                const checkbox = taskItem.querySelector('input[type="checkbox"]');
                const label = taskItem.querySelector('label');
                
                // Обновляем ID и атрибуты
                checkbox.id = taskId;
                checkbox.checked = false;
                label.setAttribute('for', taskId);
                label.textContent = taskText;
                
                // Добавляем задачу в список
                dailyTaskList.appendChild(taskItem);
                
                // Добавляем обработчики событий для нового чекбокса
                checkbox.addEventListener('change', function() {
                    // Вызываем функцию markTaskAsCompleted, если она существует
                    if (typeof markTaskAsCompleted === 'function') {
                        markTaskAsCompleted(this, true);
                    }
                    
                    // Сохраняем состояние задач
                    if (typeof saveTaskStates === 'function') {
                        saveTaskStates();
                    } else {
                        // Если функция не существует, сохраняем напрямую
                        const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
                        dailyTasks[taskId] = this.checked;
                        localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
                    }
                });
            } else {
                // Если нет существующих задач, создаем новый элемент
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                    <input type="checkbox" id="${taskId}">
                    <label for="${taskId}">${taskText}</label>
                `;
                
                // Добавляем задачу в список
                dailyTaskList.appendChild(taskItem);
                
                // Добавляем обработчики событий для нового чекбокса
                const newCheckbox = taskItem.querySelector('input[type="checkbox"]');
                newCheckbox.addEventListener('change', function() {
                    // Сохраняем состояние задач
                    const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
                    dailyTasks[taskId] = this.checked;
                    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
                });
            }
        } else {
            // Если страница Daily не открыта, добавляем задачу только в localStorage
            // Это нормально, задача будет отображаться при следующем открытии страницы
            console.log('Страница Daily не открыта, задача добавлена только в localStorage');
        }
    } else if (taskType === 'weekly') {
        // Создаем уникальный ID для новой задачи
        const taskId = 'weekly-task' + Date.now();
        
        // Обновляем localStorage
        const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '{}');
        weeklyTasks[taskId] = false;
        weeklyTasks[taskId + '_disabled'] = false;
        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
        
        // Проверяем, открыта ли страница Weekly
        const weeklyTaskList = document.querySelector('.weekly-tasks .task-list');
        if (weeklyTaskList) {
            // Получаем существующий элемент задачи для копирования стиля
            const existingTaskItem = document.querySelector('.weekly-tasks .task-item');
            
            if (existingTaskItem) {
                // Клонируем существующий элемент и изменяем его
                const taskItem = existingTaskItem.cloneNode(true);
                const checkbox = taskItem.querySelector('input[type="checkbox"]');
                const label = taskItem.querySelector('label');
                
                // Обновляем ID и атрибуты
                checkbox.id = taskId;
                checkbox.checked = false;
                checkbox.disabled = false;
                label.setAttribute('for', taskId);
                label.textContent = taskText;
                label.classList.remove('completed-task');
                
                // Добавляем задачу в список
                weeklyTaskList.appendChild(taskItem);
                
                // Добавляем обработчики событий для нового чекбокса
                checkbox.addEventListener('change', function() {
                    // Вызываем функцию markTaskAsCompleted, если она существует
                    if (typeof markTaskAsCompleted === 'function') {
                        markTaskAsCompleted(this, true);
                    }
                    
                    // Сохраняем состояние задач
                    if (typeof saveTaskStates === 'function') {
                        saveTaskStates();
                    } else {
                        // Если функция не существует, сохраняем напрямую
                        const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '{}');
                        weeklyTasks[taskId] = this.checked;
                        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
                    }
                });
            } else {
                // Если нет существующих задач, создаем новый элемент
                const taskItem = document.createElement('div');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                    <input type="checkbox" id="${taskId}">
                    <label for="${taskId}">${taskText}</label>
                `;
                
                // Добавляем задачу в список
                weeklyTaskList.appendChild(taskItem);
                
                // Добавляем обработчики событий для нового чекбокса
                const newCheckbox = taskItem.querySelector('input[type="checkbox"]');
                newCheckbox.addEventListener('change', function() {
                    // Сохраняем состояние задач
                    const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '{}');
                    weeklyTasks[taskId] = this.checked;
                    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
                });
            }
        } else {
            // Если страница Weekly не открыта, добавляем задачу только в localStorage
            // Это нормально, задача будет отображаться при следующем открытии страницы
            console.log('Страница Weekly не открыта, задача добавлена только в localStorage');
            
            // Добавляем задачу в HTML-файл Weekly.html
            fetch('Приложение/Weekly/Weekly.html')
                .then(response => response.text())
                .then(html => {
                    console.log('Задача добавлена в Weekly.html');
                })
                .catch(error => {
                    console.error('Ошибка при добавлении задачи в Weekly.html:', error);
                });
        }
    }
    
    // Обновляем список задач в менеджере
    loadTasksIndependently();
}

// Функция для обновления задачи
function updateTask(taskId, newTaskText, taskType) {
    // Обновляем текст задачи в DOM, если страница открыта
    const label = document.querySelector(`label[for="${taskId}"]`);
    if (label) {
        label.textContent = newTaskText;
    } else {
        console.log('Элемент задачи не найден в DOM, обновляем только в менеджере задач');
    }
    
    // Сохраняем обновленный текст в localStorage для будущего использования
    if (taskType === 'daily') {
        // Для ежедневных задач сохраняем текст в специальном объекте
        const dailyTasksText = JSON.parse(localStorage.getItem('dailyTasksText') || '{}');
        dailyTasksText[taskId] = newTaskText;
        localStorage.setItem('dailyTasksText', JSON.stringify(dailyTasksText));
    } else if (taskType === 'weekly') {
        // Для еженедельных задач сохраняем текст в специальном объекте
        const weeklyTasksText = JSON.parse(localStorage.getItem('weeklyTasksText') || '{}');
        weeklyTasksText[taskId] = newTaskText;
        localStorage.setItem('weeklyTasksText', JSON.stringify(weeklyTasksText));
    }
    
    // Обновляем список задач в менеджере
    loadTasksIndependently();
}

// Функция для удаления задачи
function deleteTask(taskId, taskType) {
    if (taskType === 'daily') {
        // Удаляем задачу из DOM, если страница открыта
        const taskItem = document.querySelector(`#${taskId}`);
        if (taskItem && taskItem.closest('.task-item')) {
            taskItem.closest('.task-item').remove();
        } else {
            console.log('Элемент задачи не найден в DOM, удаляем только из localStorage');
        }
        
        // Обновляем localStorage
        const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '{}');
        delete dailyTasks[taskId];
        localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    } else if (taskType === 'weekly') {
        // Удаляем задачу из DOM, если страница открыта
        const taskItem = document.querySelector(`#${taskId}`);
        if (taskItem && taskItem.closest('.task-item')) {
            taskItem.closest('.task-item').remove();
        } else {
            console.log('Элемент задачи не найден в DOM, удаляем только из localStorage');
        }
        
        // Обновляем localStorage
        const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '{}');
        delete weeklyTasks[taskId];
        delete weeklyTasks[taskId + '_disabled'];
        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
    }
    
    // Обновляем список задач в менеджере
    loadTasksIndependently();
}

// Функция для отображения модального окна добавления задачи
function showAddTaskModal(taskType) {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'task-modal';
    
    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Добавить ${taskType === 'daily' ? 'ежедневную' : 'еженедельную'} задачу</h3>
                <button class="close-modal-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="task-modal-body">
                <div class="form-group">
                    <label for="task-text">Текст задачи</label>
                    <input type="text" id="task-text" placeholder="Введите текст задачи">
                </div>
            </div>
            <div class="task-modal-footer">
                <button class="cancel-btn">Отмена</button>
                <button class="save-btn">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const closeBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveBtn = modal.querySelector('.save-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', function() {
        const taskText = document.getElementById('task-text').value.trim();
        
        if (taskText) {
            addNewTask(taskText, taskType);
            closeModal();
        }
    });
}

// Функция для отображения модального окна редактирования задачи
function showEditTaskModal(taskId, taskType, taskText = null) {
    // Получаем текст задачи, если он не был передан
    if (taskText === null) {
        if (taskType === 'daily') {
            const label = document.querySelector(`label[for="${taskId}"]`);
            if (label) {
                taskText = label.textContent;
            }
        } else if (taskType === 'weekly') {
            const label = document.querySelector(`label[for="${taskId}"]`);
            if (label) {
                taskText = label.textContent;
            }
        }
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'task-modal';
    
    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Редактировать задачу</h3>
                <button class="close-modal-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="task-modal-body">
                <div class="form-group">
                    <label for="edit-task-text">Текст задачи</label>
                    <input type="text" id="edit-task-text" value="${taskText ? taskText.replace(/"/g, '&quot;') : ''}" placeholder="Введите текст задачи">
                </div>
            </div>
            <div class="task-modal-footer">
                <button class="cancel-btn">Отмена</button>
                <button class="save-btn">Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const closeBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const saveBtn = modal.querySelector('.save-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    saveBtn.addEventListener('click', function() {
        const newTaskText = document.getElementById('edit-task-text').value.trim();
        
        if (newTaskText) {
            updateTask(taskId, newTaskText, taskType);
            closeModal();
        }
    });
}

// Функция для отображения подтверждения удаления задачи
function showDeleteTaskConfirmation(taskId, taskType) {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'task-modal';
    
    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h3>Удалить задачу</h3>
                <button class="close-modal-btn">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="task-modal-body">
                <p>Вы уверены, что хотите удалить эту задачу?</p>
            </div>
            <div class="task-modal-footer">
                <button class="cancel-btn">Отмена</button>
                <button class="delete-confirm-btn">Удалить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const closeBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');
    const deleteBtn = modal.querySelector('.delete-confirm-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    deleteBtn.addEventListener('click', function() {
        deleteTask(taskId, taskType);
        closeModal();
    });
}