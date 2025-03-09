// TaskEditor.js - Модуль для редактирования ежедневных и еженедельных задач

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация редактора задач
    initTaskEditor();
    
    // Обработчик для кнопки закрытия модального окна
    document.getElementById('task-editor-close').addEventListener('click', function() {
        closeTaskEditor();
    });
    
    // Обработчик для кнопки сохранения изменений
    document.getElementById('save-tasks-button').addEventListener('click', function() {
        saveTasks();
    });
    
    // Обработчик для переключения между ежедневными и еженедельными задачами
    const taskTypeTabs = document.querySelectorAll('.task-type-tab');
    taskTypeTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const taskType = this.getAttribute('data-task-type');
            switchTaskType(taskType);
        });
    });
    
    // Обработчик для кнопки добавления новой задачи
    document.getElementById('add-task-button').addEventListener('click', function() {
        addNewTask();
    });
});

// Инициализация редактора задач
function initTaskEditor() {
    // Загрузка задач из localStorage
    loadTasks();
    
    // Установка первой вкладки как активной по умолчанию
    switchTaskType('daily');
}

// Загрузка задач из localStorage
function loadTasks() {
    // Загрузка ежедневных задач
    let dailyTasks = localStorage.getItem('dailyTasks');
    if (dailyTasks) {
        dailyTasks = JSON.parse(dailyTasks);
    } else {
        // Задачи по умолчанию, если нет сохраненных
        dailyTasks = [
            { id: 'task1', text: 'Утренняя зарядка', time: '07:00', completed: false },
            { id: 'task2', text: 'Чтение книги', time: '19:00', completed: false },
            { id: 'task3', text: 'Медитация', time: '22:00', completed: false }
        ];
    }
    
    // Загрузка еженедельных задач
    let weeklyTasks = localStorage.getItem('weeklyTasks');
    if (weeklyTasks) {
        weeklyTasks = JSON.parse(weeklyTasks);
    } else {
        // Задачи по умолчанию, если нет сохраненных
        weeklyTasks = [
            { id: 'wtask1', text: 'Уборка квартиры', day: 'Суббота', completed: false },
            { id: 'wtask2', text: 'Планирование на неделю', day: 'Воскресенье', completed: false },
            { id: 'wtask3', text: 'Поход в спортзал', day: 'Понедельник', completed: false }
        ];
    }
    
    // Сохраняем задачи в глобальные переменные
    window.dailyTasks = dailyTasks;
    window.weeklyTasks = weeklyTasks;
    
    // Отображаем задачи в редакторе
    renderTasks('daily');
    renderTasks('weekly');
}

// Отображение задач в редакторе
function renderTasks(taskType) {
    const tasksContainer = document.getElementById(`${taskType}-tasks-container`);
    tasksContainer.innerHTML = '';
    
    const tasks = taskType === 'daily' ? window.dailyTasks : window.weeklyTasks;
    
    tasks.forEach((task, index) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-editor-item';
        taskElement.setAttribute('data-task-id', task.id);
        
        let timeOrDaySelect = '';
        if (taskType === 'daily') {
            timeOrDaySelect = `
                <input type="time" class="task-time" value="${task.time || '12:00'}" />
            `;
        } else {
            const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
            timeOrDaySelect = `
                <select class="task-day">
                    ${days.map(day => `<option value="${day}" ${task.day === day ? 'selected' : ''}>${day}</option>`).join('')}
                </select>
            `;
        }
        
        taskElement.innerHTML = `
            <div class="task-editor-content">
                <input type="text" class="task-text" value="${task.text}" placeholder="Название задачи" />
                ${timeOrDaySelect}
            </div>
            <div class="task-editor-actions">
                <button class="move-up-button" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="move-down-button" ${index === tasks.length - 1 ? 'disabled' : ''}>
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="delete-task-button">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        tasksContainer.appendChild(taskElement);
        
        // Добавляем обработчики событий для кнопок
        const moveUpButton = taskElement.querySelector('.move-up-button');
        const moveDownButton = taskElement.querySelector('.move-down-button');
        const deleteButton = taskElement.querySelector('.delete-task-button');
        
        moveUpButton.addEventListener('click', function() {
            moveTask(taskType, index, 'up');
        });
        
        moveDownButton.addEventListener('click', function() {
            moveTask(taskType, index, 'down');
        });
        
        deleteButton.addEventListener('click', function() {
            deleteTask(taskType, index);
        });
    });
}

// Переключение между типами задач (ежедневные/еженедельные)
function switchTaskType(taskType) {
    // Обновляем активную вкладку
    const tabs = document.querySelectorAll('.task-type-tab');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-task-type') === taskType) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Показываем соответствующий контейнер задач
    const containers = document.querySelectorAll('.tasks-container');
    containers.forEach(container => {
        container.style.display = 'none';
    });
    document.getElementById(`${taskType}-tasks-container`).style.display = 'block';
}

// Добавление новой задачи
function addNewTask() {
    // Определяем текущий тип задач
    const activeTab = document.querySelector('.task-type-tab.active');
    const taskType = activeTab.getAttribute('data-task-type');
    
    // Создаем новую задачу
    const newTask = {
        id: `task${Date.now()}`,
        text: 'Новая задача',
        completed: false
    };
    
    // Добавляем специфичные поля в зависимости от типа задачи
    if (taskType === 'daily') {
        newTask.time = '12:00';
        window.dailyTasks.push(newTask);
    } else {
        newTask.day = 'Понедельник';
        window.weeklyTasks.push(newTask);
    }
    
    // Перерисовываем список задач
    renderTasks(taskType);
}

// Перемещение задачи вверх или вниз
function moveTask(taskType, index, direction) {
    const tasks = taskType === 'daily' ? window.dailyTasks : window.weeklyTasks;
    
    if (direction === 'up' && index > 0) {
        // Перемещаем задачу вверх
        [tasks[index], tasks[index - 1]] = [tasks[index - 1], tasks[index]];
    } else if (direction === 'down' && index < tasks.length - 1) {
        // Перемещаем задачу вниз
        [tasks[index], tasks[index + 1]] = [tasks[index + 1], tasks[index]];
    }
    
    // Перерисовываем список задач
    renderTasks(taskType);
}

// Удаление задачи
function deleteTask(taskType, index) {
    if (confirm('Вы уверены, что хотите удалить эту задачу?')) {
        const tasks = taskType === 'daily' ? window.dailyTasks : window.weeklyTasks;
        tasks.splice(index, 1);
        
        // Перерисовываем список задач
        renderTasks(taskType);
    }
}

// Сохранение задач
function saveTasks() {
    // Собираем данные из формы
    const dailyTasksContainer = document.getElementById('daily-tasks-container');
    const weeklyTasksContainer = document.getElementById('weekly-tasks-container');
    
    // Обновляем ежедневные задачи
    const dailyTaskElements = dailyTasksContainer.querySelectorAll('.task-editor-item');
    const updatedDailyTasks = [];
    
    dailyTaskElements.forEach(element => {
        const taskId = element.getAttribute('data-task-id');
        const taskText = element.querySelector('.task-text').value;
        const taskTime = element.querySelector('.task-time').value;
        
        // Находим оригинальную задачу, чтобы сохранить состояние completed
        const originalTask = window.dailyTasks.find(task => task.id === taskId);
        const completed = originalTask ? originalTask.completed : false;
        
        updatedDailyTasks.push({
            id: taskId,
            text: taskText,
            time: taskTime,
            completed: completed
        });
    });
    
    // Обновляем еженедельные задачи
    const weeklyTaskElements = weeklyTasksContainer.querySelectorAll('.task-editor-item');
    const updatedWeeklyTasks = [];
    
    weeklyTaskElements.forEach(element => {
        const taskId = element.getAttribute('data-task-id');
        const taskText = element.querySelector('.task-text').value;
        const taskDay = element.querySelector('.task-day').value;
        
        // Находим оригинальную задачу, чтобы сохранить состояние completed
        const originalTask = window.weeklyTasks.find(task => task.id === taskId);
        const completed = originalTask ? originalTask.completed : false;
        
        updatedWeeklyTasks.push({
            id: taskId,
            text: taskText,
            day: taskDay,
            completed: completed
        });
    });
    
    // Сохраняем обновленные задачи
    window.dailyTasks = updatedDailyTasks;
    window.weeklyTasks = updatedWeeklyTasks;
    
    localStorage.setItem('dailyTasks', JSON.stringify(updatedDailyTasks));
    localStorage.setItem('weeklyTasks', JSON.stringify(updatedWeeklyTasks));
    
    // Показываем уведомление об успешном сохранении
    showNotification('Задачи успешно сохранены!');
    
    // Закрываем редактор
    closeTaskEditor();
}

// Открытие редактора задач
function openTaskEditor() {
    const taskEditorModal = document.getElementById('task-editor-modal');
    taskEditorModal.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Блокируем прокрутку страницы
    
    // Загружаем актуальные данные
    loadTasks();
}

// Закрытие редактора задач
function closeTaskEditor() {
    const taskEditorModal = document.getElementById('task-editor-modal');
    taskEditorModal.style.display = 'none';
    document.body.style.overflow = ''; // Разблокируем прокрутку страницы
}

// Показ уведомления
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Автоматическое скрытие через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Экспортируем функцию открытия редактора, чтобы она была доступна глобально
window.openTaskEditor = openTaskEditor; 