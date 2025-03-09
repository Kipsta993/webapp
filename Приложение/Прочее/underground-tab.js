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
    
    // Добавляем индикатор для свайпа
    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-indicator';
    undergroundTab.appendChild(pullIndicator);
    
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
    
    // Добавляем настройки
    const settingsSection = document.createElement('section');
    settingsSection.className = 'settings-section';
    
    // Настройка темы
    const themeSettingItem = document.createElement('div');
    themeSettingItem.className = 'setting-item';
    themeSettingItem.innerHTML = `
        <div class="setting-label">
            <i class="fas fa-moon"></i>
            <span>Темная тема</span>
        </div>
        <label class="toggle">
            <input type="checkbox" id="theme-toggle">
            <span class="toggle-slider">
                <i class="fas fa-moon toggle-icon left"></i>
                <i class="fas fa-sun toggle-icon right"></i>
            </span>
        </label>
    `;
    
    // Настройка звука
    const soundSettingItem = document.createElement('div');
    soundSettingItem.className = 'setting-item';
    soundSettingItem.innerHTML = `
        <div class="setting-label">
            <i class="fas fa-volume-up"></i>
            <span>Звуки</span>
        </div>
        <label class="toggle">
            <input type="checkbox" id="sounds-toggle">
            <span class="toggle-slider">
                <i class="fas fa-volume-up toggle-icon left"></i>
                <i class="fas fa-volume-mute toggle-icon right"></i>
            </span>
        </label>
    `;
    
    // Кнопка настроек заданий
    const tasksSettingsButton = document.createElement('button');
    tasksSettingsButton.className = 'settings-button';
    tasksSettingsButton.innerHTML = '<i class="fas fa-tasks"></i> Настройка заданий';
    tasksSettingsButton.addEventListener('click', showTasksSettingsModal);
    
    // Добавляем элементы в секцию настроек
    settingsSection.appendChild(themeSettingItem);
    settingsSection.appendChild(soundSettingItem);
    settingsSection.appendChild(tasksSettingsButton);
    
    content.appendChild(settingsSection);
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
    
    // Создаем модальное окно настроек заданий
    createTasksSettingsModal();
    
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

// Создание модального окна настроек заданий
function createTasksSettingsModal() {
    const modal = document.createElement('div');
    modal.className = 'tasks-settings-modal';
    modal.id = 'tasks-settings-modal';
    
    const content = document.createElement('div');
    content.className = 'tasks-settings-content';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'tasks-settings-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Настройка заданий';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'tasks-settings-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', function() {
        document.getElementById('tasks-settings-modal').style.display = 'none';
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    content.appendChild(header);
    
    // Вкладки
    const tabs = document.createElement('div');
    tabs.className = 'tasks-settings-tabs';
    
    const dailyTab = document.createElement('div');
    dailyTab.className = 'tasks-settings-tab active';
    dailyTab.textContent = 'Ежедневные';
    dailyTab.setAttribute('data-tab', 'daily');
    
    const weeklyTab = document.createElement('div');
    weeklyTab.className = 'tasks-settings-tab';
    weeklyTab.textContent = 'Еженедельные';
    weeklyTab.setAttribute('data-tab', 'weekly');
    
    tabs.appendChild(dailyTab);
    tabs.appendChild(weeklyTab);
    content.appendChild(tabs);
    
    // Панели с заданиями
    const dailyPanel = document.createElement('div');
    dailyPanel.className = 'tasks-settings-panel active';
    dailyPanel.id = 'daily-tasks-panel';
    
    const weeklyPanel = document.createElement('div');
    weeklyPanel.className = 'tasks-settings-panel';
    weeklyPanel.id = 'weekly-tasks-panel';
    
    // Добавляем панели
    content.appendChild(dailyPanel);
    content.appendChild(weeklyPanel);
    
    // Кнопка сохранения
    const saveButton = document.createElement('button');
    saveButton.className = 'save-tasks-button';
    saveButton.textContent = 'Сохранить';
    saveButton.addEventListener('click', saveTasksSettings);
    
    content.appendChild(saveButton);
    modal.appendChild(content);
    
    // Добавляем модальное окно на страницу
    document.body.appendChild(modal);
    
    // Добавляем обработчики для вкладок
    initTasksSettingsTabs();
}

// Инициализация вкладок в настройках заданий
function initTasksSettingsTabs() {
    const tabs = document.querySelectorAll('.tasks-settings-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Убираем активный класс со всех вкладок
            tabs.forEach(t => t.classList.remove('active'));
            
            // Добавляем активный класс на текущую вкладку
            this.classList.add('active');
            
            // Скрываем все панели
            const panels = document.querySelectorAll('.tasks-settings-panel');
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Показываем нужную панель
            const tabName = this.getAttribute('data-tab');
            document.getElementById(`${tabName}-tasks-panel`).classList.add('active');
        });
    });
}

// Показать модальное окно настроек заданий
function showTasksSettingsModal() {
    // Загружаем текущие задания
    loadTasksForSettings();
    
    // Показываем модальное окно
    const modal = document.getElementById('tasks-settings-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Загрузка заданий для настроек
function loadTasksForSettings() {
    // Загружаем ежедневные задания
    const dailyTasks = JSON.parse(localStorage.getItem('dailyTasks') || '[]');
    const dailyPanel = document.getElementById('daily-tasks-panel');
    
    // Очищаем панель
    dailyPanel.innerHTML = '';
    
    // Добавляем задания
    dailyTasks.forEach((task, index) => {
        const taskItem = createTaskEditItem(task, index, 'daily');
        dailyPanel.appendChild(taskItem);
    });
    
    // Добавляем кнопку для добавления нового задания
    const addButton = document.createElement('button');
    addButton.className = 'add-task-button';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Добавить задание';
    addButton.addEventListener('click', function() {
        const newTask = { text: 'Новое задание' };
        dailyTasks.push(newTask);
        
        const taskItem = createTaskEditItem(newTask, dailyTasks.length - 1, 'daily');
        dailyPanel.insertBefore(taskItem, addButton);
    });
    
    dailyPanel.appendChild(addButton);
    
    // Загружаем еженедельные задания
    const weeklyTasks = JSON.parse(localStorage.getItem('weeklyTasks') || '[]');
    const weeklyPanel = document.getElementById('weekly-tasks-panel');
    
    // Очищаем панель
    weeklyPanel.innerHTML = '';
    
    // Добавляем задания
    weeklyTasks.forEach((task, index) => {
        const taskItem = createTaskEditItem(task, index, 'weekly');
        weeklyPanel.appendChild(taskItem);
    });
    
    // Добавляем кнопку для добавления нового задания
    const addWeeklyButton = document.createElement('button');
    addWeeklyButton.className = 'add-task-button';
    addWeeklyButton.innerHTML = '<i class="fas fa-plus"></i> Добавить задание';
    addWeeklyButton.addEventListener('click', function() {
        const newTask = { text: 'Новое задание' };
        weeklyTasks.push(newTask);
        
        const taskItem = createTaskEditItem(newTask, weeklyTasks.length - 1, 'weekly');
        weeklyPanel.insertBefore(taskItem, addWeeklyButton);
    });
    
    weeklyPanel.appendChild(addWeeklyButton);
}

// Создание элемента редактирования задания
function createTaskEditItem(task, index, type) {
    const taskItem = document.createElement('div');
    taskItem.className = 'task-edit-item';
    taskItem.setAttribute('data-index', index);
    taskItem.setAttribute('data-type', type);
    
    const input = document.createElement('input');
    input.className = 'task-edit-input';
    input.type = 'text';
    input.value = task.text;
    
    const actions = document.createElement('div');
    actions.className = 'task-edit-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'task-edit-button delete';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        taskItem.remove();
    });
    
    actions.appendChild(deleteButton);
    taskItem.appendChild(input);
    taskItem.appendChild(actions);
    
    return taskItem;
}

// Сохранение настроек заданий
function saveTasksSettings() {
    // Сохраняем ежедневные задания
    const dailyTaskItems = document.querySelectorAll('#daily-tasks-panel .task-edit-item');
    const dailyTasks = [];
    
    dailyTaskItems.forEach(item => {
        const text = item.querySelector('.task-edit-input').value;
        dailyTasks.push({ text: text });
    });
    
    localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    
    // Сохраняем еженедельные задания
    const weeklyTaskItems = document.querySelectorAll('#weekly-tasks-panel .task-edit-item');
    const weeklyTasks = [];
    
    weeklyTaskItems.forEach(item => {
        const text = item.querySelector('.task-edit-input').value;
        weeklyTasks.push({ text: text });
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
    
    // Закрываем модальное окно
    document.getElementById('tasks-settings-modal').style.display = 'none';
    
    // Показываем уведомление об успешном сохранении
    alert('Настройки заданий сохранены. Изменения вступят в силу после перезагрузки страницы.');
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
    // Обработчик для переключателя темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('change', function() {
            setTheme(this.checked ? 'dark' : 'light');
            localStorage.setItem('theme', this.checked ? 'dark' : 'light');
        });
    }
    
    // Обработчик для переключателя звуков
    const soundsToggle = document.getElementById('sounds-toggle');
    if (soundsToggle) {
        soundsToggle.addEventListener('change', function() {
            localStorage.setItem('sounds_enabled', this.checked);
        });
    }
}

// Загрузка сохраненных настроек
function loadSettings() {
    // Загружаем тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Устанавливаем переключатель темы
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.checked = savedTheme === 'dark';
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