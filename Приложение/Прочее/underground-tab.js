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

// Инициализация обработчиков событий для настроек
function initSettingsHandlers() {
    // Обработчики для выбора темы
    const themeOptions = document.querySelectorAll('.theme-options .theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
        });
    });
    
    // Обработчик для сброса данных
    const resetButton = document.querySelector('.danger-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите сбросить ВСЕ данные приложения? Это действие нельзя отменить.')) {
                resetAllData();
            }
        });
    }
    
    // Добавляем кнопку редактирования задач
    addTaskEditButton();
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

// Функция для сброса всех данных
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
    localStorage.setItem('streak', 1);
    
    // Устанавливаем начальные значения для задач
    localStorage.setItem('dailyTasks', JSON.stringify([
        "Воркаут в \"Lumosity\"",
        "Воркаут в \"Peak\"",
        "Перевести 1 главу манги"
    ]));
    
    localStorage.setItem('weeklyTasks', JSON.stringify([
        "Уборка квартиры",
        "Планирование на неделю",
        "Просмотр нового фильма"
    ]));
    
    localStorage.setItem('schedule', JSON.stringify([
        { startTime: "10:00", endTime: "11:30", task: "Изучение JavaScript" },
        { startTime: "14:00", endTime: "15:00", task: "Физические упражнения" },
        { startTime: "18:00", endTime: "19:00", task: "Чтение книги" }
    ]));
    
    // Сбрасываем состояния задач
    localStorage.setItem('dailyTaskStates', JSON.stringify({}));
    localStorage.setItem('weeklyTaskStates', JSON.stringify({}));
    
    // Показываем уведомление об успешном сбросе
    alert('Все данные приложения успешно сброшены!');
    
    // Перезагружаем страницу для применения изменений
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

// Функция для создания модального окна редактирования задач
function createTaskEditModal() {
    // Проверяем, существует ли уже модальное окно
    if (document.getElementById('task-edit-modal')) {
        return;
    }
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'task-edit-modal';
    modal.id = 'task-edit-modal';
    
    // Создаем контейнер модального окна
    const container = document.createElement('div');
    container.className = 'task-edit-container';
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.className = 'task-edit-header';
    
    const title = document.createElement('h3');
    title.textContent = 'Редактирование задач';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'task-edit-close';
    closeButton.id = 'task-edit-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', closeTaskEditModal);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Создаем вкладки
    const tabs = document.createElement('div');
    tabs.className = 'task-edit-tabs';
    
    const dailyTab = document.createElement('button');
    dailyTab.className = 'task-edit-tab active';
    dailyTab.setAttribute('data-tab', 'daily');
    dailyTab.textContent = 'Ежедневные';
    dailyTab.addEventListener('click', function() {
        switchTab('daily');
    });
    
    const scheduleTab = document.createElement('button');
    scheduleTab.className = 'task-edit-tab';
    scheduleTab.setAttribute('data-tab', 'schedule');
    scheduleTab.textContent = 'Расписание';
    scheduleTab.addEventListener('click', function() {
        switchTab('schedule');
    });
    
    const weeklyTab = document.createElement('button');
    weeklyTab.className = 'task-edit-tab';
    weeklyTab.setAttribute('data-tab', 'weekly');
    weeklyTab.textContent = 'Еженедельные';
    weeklyTab.addEventListener('click', function() {
        switchTab('weekly');
    });
    
    tabs.appendChild(dailyTab);
    tabs.appendChild(scheduleTab);
    tabs.appendChild(weeklyTab);
    
    // Создаем контент
    const content = document.createElement('div');
    content.className = 'task-edit-content';
    
    // Секция ежедневных задач
    const dailySection = document.createElement('div');
    dailySection.className = 'task-edit-section active';
    dailySection.id = 'daily-section';
    
    const dailyList = document.createElement('ul');
    dailyList.className = 'task-edit-list';
    dailyList.id = 'daily-tasks-list';
    
    const dailyAdd = document.createElement('div');
    dailyAdd.className = 'task-edit-add';
    
    const dailyInput = document.createElement('input');
    dailyInput.type = 'text';
    dailyInput.id = 'new-daily-task';
    dailyInput.placeholder = 'Новая ежедневная задача';
    dailyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewDailyTask();
        }
    });
    
    const dailyAddButton = document.createElement('button');
    dailyAddButton.id = 'add-daily-task';
    dailyAddButton.textContent = 'Добавить';
    dailyAddButton.addEventListener('click', addNewDailyTask);
    
    dailyAdd.appendChild(dailyInput);
    dailyAdd.appendChild(dailyAddButton);
    
    dailySection.appendChild(dailyList);
    dailySection.appendChild(dailyAdd);
    
    // Секция расписания
    const scheduleSection = document.createElement('div');
    scheduleSection.className = 'task-edit-section';
    scheduleSection.id = 'schedule-section';
    
    const scheduleTitle = document.createElement('h4');
    scheduleTitle.textContent = 'Расписание на день';
    
    const scheduleContainer = document.createElement('div');
    scheduleContainer.id = 'schedule-items-container';
    
    const addScheduleButton = document.createElement('button');
    addScheduleButton.className = 'add-schedule-item';
    addScheduleButton.id = 'add-schedule-item';
    addScheduleButton.textContent = 'Добавить задачу в расписание';
    addScheduleButton.addEventListener('click', addNewScheduleItem);
    
    scheduleSection.appendChild(scheduleTitle);
    scheduleSection.appendChild(scheduleContainer);
    scheduleSection.appendChild(addScheduleButton);
    
    // Секция еженедельных задач
    const weeklySection = document.createElement('div');
    weeklySection.className = 'task-edit-section';
    weeklySection.id = 'weekly-section';
    
    const weeklyList = document.createElement('ul');
    weeklyList.className = 'task-edit-list';
    weeklyList.id = 'weekly-tasks-list';
    
    const weeklyAdd = document.createElement('div');
    weeklyAdd.className = 'task-edit-add';
    
    const weeklyInput = document.createElement('input');
    weeklyInput.type = 'text';
    weeklyInput.id = 'new-weekly-task';
    weeklyInput.placeholder = 'Новая еженедельная задача';
    weeklyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewWeeklyTask();
        }
    });
    
    const weeklyAddButton = document.createElement('button');
    weeklyAddButton.id = 'add-weekly-task';
    weeklyAddButton.textContent = 'Добавить';
    weeklyAddButton.addEventListener('click', addNewWeeklyTask);
    
    weeklyAdd.appendChild(weeklyInput);
    weeklyAdd.appendChild(weeklyAddButton);
    
    weeklySection.appendChild(weeklyList);
    weeklySection.appendChild(weeklyAdd);
    
    content.appendChild(dailySection);
    content.appendChild(scheduleSection);
    content.appendChild(weeklySection);
    
    // Создаем футер
    const footer = document.createElement('div');
    footer.className = 'task-edit-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel';
    cancelButton.id = 'task-edit-cancel';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', closeTaskEditModal);
    
    const saveButton = document.createElement('button');
    saveButton.className = 'save';
    saveButton.id = 'task-edit-save';
    saveButton.textContent = 'Сохранить';
    saveButton.addEventListener('click', function() {
        saveTaskChanges();
        closeTaskEditModal();
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(saveButton);
    
    // Собираем все вместе
    container.appendChild(header);
    container.appendChild(tabs);
    container.appendChild(content);
    container.appendChild(footer);
    
    modal.appendChild(container);
    
    // Добавляем модальное окно в body
    document.body.appendChild(modal);
    
    // Добавляем кнопку редактирования задач в подземную вкладку
    addTaskEditButton();
}

// Функция для добавления кнопки редактирования задач в подземную вкладку
function addTaskEditButton() {
    const undergroundTab = document.querySelector('.underground-tab-content');
    if (!undergroundTab) return;
    
    // Проверяем, существует ли уже секция настроек задач
    let taskSettings = undergroundTab.querySelector('.task-settings');
    
    if (!taskSettings) {
        // Создаем секцию настроек задач
        taskSettings = document.createElement('section');
        taskSettings.className = 'task-settings';
        
        const title = document.createElement('h2');
        title.textContent = 'Настройки задач';
        
        taskSettings.appendChild(title);
        
        // Добавляем секцию в подземную вкладку
        undergroundTab.appendChild(taskSettings);
    }
    
    // Проверяем, существует ли уже кнопка редактирования задач
    if (!taskSettings.querySelector('#edit-tasks-button')) {
        const settingItem = document.createElement('div');
        settingItem.className = 'setting-item';
        
        const settingLabel = document.createElement('div');
        settingLabel.className = 'setting-label';
        
        const span = document.createElement('span');
        span.textContent = 'Редактирование задач';
        
        const description = document.createElement('p');
        description.className = 'setting-description';
        description.textContent = 'Изменение ежедневных, еженедельных и расписания задач';
        
        settingLabel.appendChild(span);
        settingLabel.appendChild(description);
        
        const button = document.createElement('button');
        button.id = 'edit-tasks-button';
        button.className = 'action-button';
        button.textContent = 'Редактировать';
        button.addEventListener('click', openTaskEditModal);
        
        settingItem.appendChild(settingLabel);
        settingItem.appendChild(button);
        
        taskSettings.appendChild(settingItem);
    }
}

// Функция для открытия модального окна редактирования задач
function openTaskEditModal() {
    // Создаем модальное окно, если оно еще не создано
    createTaskEditModal();
    
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
    if (!dailyTasksList) return;
    
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
    if (!scheduleContainer) return;
    
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
    if (!weeklyTasksList) return;
    
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
    if (!newTaskInput) return;
    
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
    if (!newTaskInput) return;
    
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

// Инициализация модального окна при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Добавляем кнопку редактирования задач в подземную вкладку
    setTimeout(function() {
        addTaskEditButton();
    }, 500); // Небольшая задержка, чтобы убедиться, что подземная вкладка уже создана
}); 