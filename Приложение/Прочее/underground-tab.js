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
    
    // Создаем редактор задач
    createTaskEditor();
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
    
    // Добавляем кнопку редактора задач
    const taskEditorButton = document.createElement('button');
    taskEditorButton.className = 'task-editor-button';
    taskEditorButton.innerHTML = '<i class="fas fa-tasks"></i> Редактировать задачи';
    taskEditorButton.addEventListener('click', showTaskEditor);
    
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
    `;
    
    // Вставляем кнопку редактора задач перед настройкой звуков
    appSettings.insertBefore(taskEditorButton, appSettings.querySelector('.setting-item'));
    
    // Добавляем кнопку сброса данных
    const resetItem = document.createElement('div');
    resetItem.className = 'setting-item';
    resetItem.innerHTML = `
        <div class="setting-label">
            <span>Сбросить все данные</span>
            <p class="setting-description">Сбросить все данные приложения (задания, статистику, дневник, серию дней)</p>
        </div>
        <button id="reset-all-button" class="danger-button">Сбросить</button>
    `;
    appSettings.appendChild(resetItem);
    
    content.appendChild(themeSettings);
    content.appendChild(appSettings);
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

// Создание редактора задач
function createTaskEditor() {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'task-editor-modal';
    
    // Создаем контейнер
    const container = document.createElement('div');
    container.className = 'task-editor-container';
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.className = 'task-editor-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Редактор задач';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'task-editor-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', hideTaskEditor);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    container.appendChild(header);
    
    // Создаем вкладки
    const tabs = document.createElement('div');
    tabs.className = 'task-editor-tabs';
    
    const dailyTab = document.createElement('div');
    dailyTab.className = 'task-editor-tab active';
    dailyTab.textContent = 'Ежедневные задачи';
    dailyTab.dataset.tab = 'daily';
    
    const weeklyTab = document.createElement('div');
    weeklyTab.className = 'task-editor-tab';
    weeklyTab.textContent = 'Еженедельные задачи';
    weeklyTab.dataset.tab = 'weekly';
    
    tabs.appendChild(dailyTab);
    tabs.appendChild(weeklyTab);
    container.appendChild(tabs);
    
    // Создаем контент
    const content = document.createElement('div');
    content.className = 'task-editor-content';
    
    // Создаем редактор ежедневных задач
    const dailyEditor = document.createElement('div');
    dailyEditor.className = 'task-list-editor';
    dailyEditor.id = 'daily-tasks-editor';
    
    // Создаем редактор еженедельных задач
    const weeklyEditor = document.createElement('div');
    weeklyEditor.className = 'task-list-editor';
    weeklyEditor.id = 'weekly-tasks-editor';
    weeklyEditor.style.display = 'none';
    
    content.appendChild(dailyEditor);
    content.appendChild(weeklyEditor);
    container.appendChild(content);
    
    // Добавляем кнопку добавления задачи
    const addButton = document.createElement('button');
    addButton.className = 'add-task-button';
    addButton.innerHTML = '<i class="fas fa-plus"></i> Добавить задачу';
    addButton.addEventListener('click', function() {
        const activeTab = document.querySelector('.task-editor-tab.active').dataset.tab;
        addNewTask(activeTab);
    });
    container.appendChild(addButton);
    
    // Добавляем кнопку сохранения
    const saveButton = document.createElement('button');
    saveButton.className = 'save-tasks-button';
    saveButton.textContent = 'Сохранить изменения';
    saveButton.addEventListener('click', saveTaskChanges);
    container.appendChild(saveButton);
    
    // Добавляем обработчики для вкладок
    dailyTab.addEventListener('click', function() {
        weeklyTab.classList.remove('active');
        dailyTab.classList.add('active');
        weeklyEditor.style.display = 'none';
        dailyEditor.style.display = 'block';
    });
    
    weeklyTab.addEventListener('click', function() {
        dailyTab.classList.remove('active');
        weeklyTab.classList.add('active');
        dailyEditor.style.display = 'none';
        weeklyEditor.style.display = 'block';
    });
    
    modal.appendChild(container);
    document.body.appendChild(modal);
}

// Показать редактор задач
function showTaskEditor() {
    // Скрываем подземную вкладку
    hideUndergroundTab();
    
    // Загружаем текущие задачи
    loadTasksToEditor();
    
    // Показываем модальное окно
    const modal = document.querySelector('.task-editor-modal');
    if (modal) {
        setTimeout(() => {
            modal.classList.add('visible');
        }, 100);
    }
}

// Скрыть редактор задач
function hideTaskEditor() {
    const modal = document.querySelector('.task-editor-modal');
    if (modal) {
        modal.classList.remove('visible');
    }
}

// Загрузить задачи в редактор
function loadTasksToEditor() {
    // Загружаем ежедневные задачи
    loadDailyTasksToEditor();
    
    // Загружаем еженедельные задачи
    loadWeeklyTasksToEditor();
}

// Загрузить ежедневные задачи в редактор
function loadDailyTasksToEditor() {
    const editor = document.getElementById('daily-tasks-editor');
    if (!editor) return;
    
    // Очищаем редактор
    editor.innerHTML = '';
    
    // Получаем все ежедневные задачи
    const taskItems = document.querySelectorAll('.all-day-tasks .task-item');
    
    // Если задач нет, добавляем пустую
    if (taskItems.length === 0) {
        addNewTask('daily');
        return;
    }
    
    // Добавляем каждую задачу в редактор
    taskItems.forEach((taskItem, index) => {
        const label = taskItem.querySelector('label');
        if (!label) return;
        
        const taskText = label.textContent;
        addTaskToEditor('daily', taskText, index);
    });
}

// Загрузить еженедельные задачи в редактор
function loadWeeklyTasksToEditor() {
    const editor = document.getElementById('weekly-tasks-editor');
    if (!editor) return;
    
    // Очищаем редактор
    editor.innerHTML = '';
    
    // Проверяем, находимся ли мы на странице Weekly
    const isWeeklyPage = window.location.href.includes('Weekly');
    
    if (isWeeklyPage) {
        // Получаем все еженедельные задачи со страницы
        const taskItems = document.querySelectorAll('.weekly-tasks .task-item');
        
        // Если задач нет, добавляем пустую
        if (taskItems.length === 0) {
            addNewTask('weekly');
            return;
        }
        
        // Добавляем каждую задачу в редактор
        taskItems.forEach((taskItem, index) => {
            const label = taskItem.querySelector('label');
            if (!label) return;
            
            const taskText = label.textContent;
            addTaskToEditor('weekly', taskText, index);
        });
    } else {
        // Загружаем еженедельные задачи из localStorage
        const savedTasks = localStorage.getItem('weeklyTasks');
        if (savedTasks) {
            try {
                const tasks = JSON.parse(savedTasks);
                
                // Получаем только названия задач (без состояний)
                const taskNames = [];
                for (const key in tasks) {
                    if (!key.includes('_disabled') && key.startsWith('weekly-task')) {
                        const taskNumber = key.replace('weekly-task', '');
                        const labelKey = `weekly-task${taskNumber}_label`;
                        if (tasks[labelKey]) {
                            taskNames.push(tasks[labelKey]);
                        }
                    }
                }
                
                // Если задач нет, добавляем пустую
                if (taskNames.length === 0) {
                    addNewTask('weekly');
                    return;
                }
                
                // Добавляем каждую задачу в редактор
                taskNames.forEach((taskText, index) => {
                    addTaskToEditor('weekly', taskText, index);
                });
            } catch (error) {
                console.error('Ошибка при загрузке еженедельных задач:', error);
                addNewTask('weekly');
            }
        } else {
            // Если нет сохраненных задач, добавляем пустую
            addNewTask('weekly');
        }
    }
}

// Добавить задачу в редактор
function addTaskToEditor(type, text, index) {
    const editor = document.getElementById(`${type}-tasks-editor`);
    if (!editor) return;
    
    const item = document.createElement('div');
    item.className = 'task-list-editor-item';
    item.dataset.index = index;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'task-list-editor-text';
    input.value = text || '';
    input.placeholder = 'Введите текст задачи';
    
    const actions = document.createElement('div');
    actions.className = 'task-list-editor-actions';
    
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-btn';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
    deleteButton.addEventListener('click', function() {
        item.remove();
    });
    
    actions.appendChild(deleteButton);
    item.appendChild(input);
    item.appendChild(actions);
    editor.appendChild(item);
}

// Добавить новую задачу
function addNewTask(type) {
    const editor = document.getElementById(`${type}-tasks-editor`);
    if (!editor) return;
    
    const index = editor.children.length;
    addTaskToEditor(type, '', index);
}

// Сохранить изменения задач
function saveTaskChanges() {
    // Сохраняем ежедневные задачи
    saveDailyTasks();
    
    // Сохраняем еженедельные задачи
    saveWeeklyTasks();
    
    // Скрываем редактор
    hideTaskEditor();
    
    // Перезагружаем страницу для применения изменений
    window.location.reload();
}

// Сохранить ежедневные задачи
function saveDailyTasks() {
    const editor = document.getElementById('daily-tasks-editor');
    if (!editor) return;
    
    // Получаем все задачи из редактора
    const taskItems = editor.querySelectorAll('.task-list-editor-item');
    
    // Проверяем, находимся ли мы на странице Daily
    const isDailyPage = !window.location.href.includes('Weekly') && 
                        !window.location.href.includes('Goals') && 
                        !window.location.href.includes('Diary') && 
                        !window.location.href.includes('Stats');
    
    if (isDailyPage) {
        // Получаем контейнер для задач
        const taskList = document.querySelector('.all-day-tasks .task-list');
        if (!taskList) return;
        
        // Очищаем список задач
        taskList.innerHTML = '';
        
        // Добавляем новые задачи
        taskItems.forEach((item, index) => {
            const input = item.querySelector('input');
            if (!input || !input.value.trim()) return;
            
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `task${index + 1}`;
            
            const label = document.createElement('label');
            label.setAttribute('for', `task${index + 1}`);
            label.textContent = input.value.trim();
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(label);
            taskList.appendChild(taskItem);
        });
        
        // Инициализируем чекбоксы
        if (typeof initializeCheckboxes === 'function') {
            initializeCheckboxes();
        }
        
        // Инициализируем обработчики кликов
        if (typeof initializeTaskItems === 'function') {
            initializeTaskItems();
        }
        
        // Сохраняем состояния задач
        if (typeof saveTaskStates === 'function') {
            saveTaskStates();
        }
    } else {
        // Сохраняем задачи в localStorage для применения при открытии страницы Daily
        const tasks = {};
        
        taskItems.forEach((item, index) => {
            const input = item.querySelector('input');
            if (!input || !input.value.trim()) return;
            
            tasks[`task${index + 1}_label`] = input.value.trim();
            tasks[`task${index + 1}`] = false;
            tasks[`task${index + 1}_disabled`] = false;
        });
        
        localStorage.setItem('dailyTasksEditor', JSON.stringify(tasks));
    }
}

// Сохранить еженедельные задачи
function saveWeeklyTasks() {
    const editor = document.getElementById('weekly-tasks-editor');
    if (!editor) return;
    
    // Получаем все задачи из редактора
    const taskItems = editor.querySelectorAll('.task-list-editor-item');
    
    // Проверяем, находимся ли мы на странице Weekly
    const isWeeklyPage = window.location.href.includes('Weekly');
    
    if (isWeeklyPage) {
        // Получаем контейнер для задач
        const taskList = document.querySelector('.weekly-tasks .task-list');
        if (!taskList) return;
        
        // Очищаем список задач
        taskList.innerHTML = '';
        
        // Добавляем новые задачи
        taskItems.forEach((item, index) => {
            const input = item.querySelector('input');
            if (!input || !input.value.trim()) return;
            
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `weekly-task${index + 1}`;
            
            const label = document.createElement('label');
            label.setAttribute('for', `weekly-task${index + 1}`);
            label.textContent = input.value.trim();
            
            taskItem.appendChild(checkbox);
            taskItem.appendChild(label);
            taskList.appendChild(taskItem);
        });
        
        // Инициализируем чекбоксы
        if (typeof initializeCheckboxes === 'function') {
            initializeCheckboxes();
        }
        
        // Инициализируем обработчики кликов
        if (typeof initializeTaskItems === 'function') {
            initializeTaskItems();
        }
        
        // Сохраняем состояния задач
        if (typeof saveTaskStates === 'function') {
            saveTaskStates();
        }
    } else {
        // Сохраняем задачи в localStorage для применения при открытии страницы Weekly
        const tasks = {};
        
        taskItems.forEach((item, index) => {
            const input = item.querySelector('input');
            if (!input || !input.value.trim()) return;
            
            tasks[`weekly-task${index + 1}_label`] = input.value.trim();
            tasks[`weekly-task${index + 1}`] = false;
            tasks[`weekly-task${index + 1}_disabled`] = false;
        });
        
        localStorage.setItem('weeklyTasksEditor', JSON.stringify(tasks));
    }
} 