document.addEventListener('DOMContentLoaded', function() {
    try {
        // Загрузка сохраненных данных и инициализация
        loadTaskStates();
        checkWeekChange();
        
        // Загрузка задач из localStorage
        loadTasksFromStorage();
        
        // Инициализация чекбоксов
        initializeCheckboxes();
        
        // Инициализация обработчиков кликов для элементов задания
        initializeTaskItems();
        
        // Добавляем анимацию появления для секций
        const sections = document.querySelectorAll('section');
        sections.forEach((section, index) => {
            section.style.setProperty('--index', index);
        });
        
        // Загрузка общих данных и применение темы
        loadCommonData();
        applyTheme();
        
        // Обновление времени до понедельника
        updateTimeUntilMonday();
        setInterval(updateTimeUntilMonday, 1000);
        
        // Проверка и сброс еженедельных задач
        checkWeeklyReset();
        
        // Добавляем обработчик для плавающей кнопки редактора задач
        const floatingTaskEditorButton = document.createElement('div');
        floatingTaskEditorButton.className = 'floating-task-editor-button';
        floatingTaskEditorButton.innerHTML = '<i class="fas fa-tasks"></i>';
        document.body.appendChild(floatingTaskEditorButton);
        
        floatingTaskEditorButton.addEventListener('click', function() {
            // Проверяем, загружен ли скрипт редактора задач
            if (typeof openTaskEditor === 'function') {
                openTaskEditor();
            } else {
                // Если скрипт не загружен, загружаем его динамически
                loadTaskEditorScript();
            }
        });
    } catch (error) {
        console.error('Ошибка при инициализации страницы:', error);
        // Показываем сообщение об ошибке на странице
        document.body.innerHTML = `
            <div style="padding: 20px; text-align: center;">
                <h1>Произошла ошибка при загрузке страницы</h1>
                <p>Пожалуйста, обновите страницу или очистите кэш браузера.</p>
                <p>Детали ошибки: ${error.message}</p>
                <button onclick="location.reload()" style="padding: 10px 20px; margin-top: 20px; cursor: pointer;">
                    Обновить страницу
                </button>
            </div>
        `;
    }
});

// Загрузка скрипта редактора задач
function loadTaskEditorScript() {
    // Загружаем CSS
    if (!document.querySelector('link[href="../Settings/TaskEditor.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '../Settings/TaskEditor.css';
        document.head.appendChild(link);
    }
    
    // Загружаем JS
    if (!document.querySelector('script[src="../Settings/TaskEditor.js"]')) {
        const script = document.createElement('script');
        script.src = '../Settings/TaskEditor.js';
        script.onload = function() {
            // После загрузки скрипта открываем редактор
            if (typeof openTaskEditor === 'function') {
                openTaskEditor();
            }
        };
        document.body.appendChild(script);
    }
    
    // Добавляем HTML-структуру редактора задач, если её нет
    if (!document.getElementById('task-editor-modal')) {
        const taskEditorHTML = `
            <div id="task-editor-modal">
                <div class="task-editor-container">
                    <div class="task-editor-header">
                        <h2>Редактор задач</h2>
                        <button id="task-editor-close">&times;</button>
                    </div>
                    
                    <div class="task-editor-tabs">
                        <div class="task-type-tab active" data-task-type="daily">Ежедневные задачи</div>
                        <div class="task-type-tab" data-task-type="weekly">Еженедельные задачи</div>
                    </div>
                    
                    <div class="task-editor-content">
                        <div id="daily-tasks-container" class="tasks-container"></div>
                        <div id="weekly-tasks-container" class="tasks-container"></div>
                    </div>
                    
                    <div class="task-editor-footer">
                        <button id="add-task-button">
                            <i class="fas fa-plus"></i> Добавить задачу
                        </button>
                        <button id="save-tasks-button">Сохранить изменения</button>
                    </div>
                </div>
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = taskEditorHTML;
        document.body.appendChild(div.firstElementChild);
    }
}

// Загрузка задач из localStorage
function loadTasksFromStorage() {
    // Получаем задачи из localStorage
    let weeklyTasks = localStorage.getItem('weeklyTasks');
    
    if (weeklyTasks) {
        weeklyTasks = JSON.parse(weeklyTasks);
        
        // Группируем задачи по дням недели
        const tasksByDay = {};
        const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        
        days.forEach(day => {
            tasksByDay[day] = weeklyTasks.filter(task => task.day === day);
        });
        
        // Обновляем секции для каждого дня недели
        days.forEach(day => {
            const dayTasks = tasksByDay[day];
            const sectionId = day.toLowerCase();
            const section = document.getElementById(sectionId);
            
            if (section) {
                const tasksContainer = section.querySelector('.tasks');
                if (tasksContainer) {
                    // Очищаем контейнер
                    tasksContainer.innerHTML = '';
                    
                    // Создаем элементы для каждой задачи
                    dayTasks.forEach((task, index) => {
                        const taskItem = document.createElement('div');
                        taskItem.className = 'task-item';
                        taskItem.setAttribute('data-task-id', task.id);
                        
                        const taskId = `${sectionId}-task${index}`;
                        
                        taskItem.innerHTML = `
                            <input type="checkbox" id="${taskId}" ${task.completed ? 'checked disabled' : ''}>
                            <label for="${taskId}">${task.text}</label>
                        `;
                        
                        tasksContainer.appendChild(taskItem);
                        
                        // Если задача уже выполнена, применяем соответствующие стили
                        if (task.completed) {
                            taskItem.style.borderLeftColor = '#4CAF50';
                            const label = taskItem.querySelector(`label[for="${taskId}"]`);
                            if (label) {
                                label.classList.add('completed-task');
                            }
                        }
                    });
                }
            }
        });
    }
}

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
                
                // Обновляем состояние задачи в localStorage
                updateTaskCompletionState(this);
            }
        });
    });
}

// Обновление состояния выполнения задачи в localStorage
function updateTaskCompletionState(checkbox) {
    const taskItem = checkbox.closest('.task-item');
    if (!taskItem) return;
    
    const taskId = taskItem.getAttribute('data-task-id');
    if (!taskId) return;
    
    // Получаем задачи из localStorage
    let weeklyTasks = localStorage.getItem('weeklyTasks');
    if (!weeklyTasks) return;
    
    weeklyTasks = JSON.parse(weeklyTasks);
    
    // Находим задачу по ID и обновляем её состояние
    const taskIndex = weeklyTasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        weeklyTasks[taskIndex].completed = checkbox.checked;
        
        // Сохраняем обновленные задачи
        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
    }
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

// Функция для воспроизведения анимации задания
function playTaskAnimation(taskItem, checkbox) {
    // Удаляем анимацию
}

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('weeklyTasks');
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
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Функция для увеличения счетчика выполненных заданий
function incrementTasksCompleted() {
    let weeklyTasksCompleted = parseInt(localStorage.getItem('weeklyTasksCompleted') || '0');
    weeklyTasksCompleted++;
    localStorage.setItem('weeklyTasksCompleted', weeklyTasksCompleted);
}

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    }
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
        section, .bottom-nav, .task-item {
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
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

// Функция для проверки необходимости сброса недельных задач
function checkWeeklyReset() {
    const lastWeek = localStorage.getItem('lastWeek');
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    
    // Если неделя изменилась или данных о последней неделе нет
    if (!lastWeek || lastWeek !== currentWeek.toString()) {
        resetWeeklyTasks();
        localStorage.setItem('lastWeek', currentWeek);
    }
}

// Функция для получения номера недели
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
}

// Функция для сброса недельных задач
function resetWeeklyTasks() {
    console.log('Сброс еженедельных задач...');
    
    // Сбрасываем состояние чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.disabled = false;
        
        // Сбрасываем стили для задания
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
            taskItem.style.borderLeftColor = '';
            
            // Сбрасываем стиль метки
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) {
                label.classList.remove('completed-task');
            }
        }
    });
    
    // Сбрасываем состояние задач в localStorage
    let weeklyTasks = localStorage.getItem('weeklyTasks');
    if (weeklyTasks) {
        weeklyTasks = JSON.parse(weeklyTasks);
        
        // Сбрасываем состояние completed для всех задач
        weeklyTasks.forEach(task => {
            task.completed = false;
        });
        
        // Сохраняем обновленные задачи
        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
    }
    
    // Сбрасываем счетчик выполненных заданий
    localStorage.setItem('weeklyTasksCompleted', '0');
    
    // Сбрасываем состояние в localStorage
    const taskStates = {};
    checkboxes.forEach(checkbox => {
        taskStates[checkbox.id] = false;
    });
    localStorage.setItem('weeklyTaskStates', JSON.stringify(taskStates));
    
    console.log('Еженедельные задачи сброшены.');
}

// Функция для обновления времени до понедельника
function updateTimeUntilMonday() {
    const now = new Date();
    
    // Создаем дату следующего понедельника
    const nextMonday = new Date(now);
    
    // Если сегодня понедельник, то следующий понедельник через 7 дней
    // Иначе находим ближайший понедельник
    if (now.getDay() === 1) {
        nextMonday.setDate(now.getDate() + 7);
    } else {
        nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    }
    
    nextMonday.setHours(0, 0, 0, 0);
    
    // Разница в миллисекундах
    const diff = nextMonday - now;
    
    // Переводим в дни, часы, минуты, секунды
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Форматируем строку
    let timeString = '';
    if (days > 0) {
        timeString += `${days}д `;
    }
    timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновляем элемент
    document.getElementById('time-until-monday').textContent = timeString;
    
    // Если наступил понедельник (разница меньше 1 секунды), сбрасываем задания
    if (diff < 1000) {
        resetWeeklyTasks();
    }
}

// Функция для проверки смены недели
function checkWeekChange() {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    const weekYearKey = `${currentYear}-${currentWeek}`;
    
    // Получаем номер недели последнего сброса заданий
    const lastResetWeek = localStorage.getItem('lastWeeklyReset');
    
    // Если номер недели последнего сброса не совпадает с текущим, сбрасываем задания
    if (!lastResetWeek || lastResetWeek !== weekYearKey) {
        resetWeeklyTasks();
        // Сохраняем текущий номер недели как номер недели последнего сброса
        localStorage.setItem('lastWeeklyReset', weekYearKey);
    }
}

// Функция для воспроизведения звука при отметке задания
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
