// Редактор заданий для Daily и Weekly

// Глобальные переменные
let isEditingMode = false;
let currentTaskId = null;
let currentTaskType = null; // 'daily' или 'weekly'
let taskIdCounter = 1000; // Начальное значение для новых ID заданий

// Инициализация редактора заданий
function initTaskEditor() {
    // Добавляем кнопку редактирования списка
    addEditButton();
    
    // Добавляем кнопку добавления нового задания
    addNewTaskButton();
    
    // Создаем модальное окно для редактирования задания
    createTaskModal();
    
    // Создаем модальное окно для подтверждения удаления
    createConfirmModal();
    
    // Добавляем кнопки действий к заданиям
    addTaskActionButtons();
}

// Добавление кнопки редактирования списка
function addEditButton() {
    // Вместо header используем main или первую секцию
    const main = document.querySelector('main');
    if (!main) {
        console.error('Не найден элемент main');
        return;
    }
    
    // Проверяем, существует ли уже кнопка
    if (document.querySelector('.edit-list-btn')) {
        console.log('Кнопка редактирования уже существует');
        return;
    }
    
    const editButton = document.createElement('button');
    editButton.className = 'edit-list-btn';
    editButton.innerHTML = '<i class="fas fa-edit"></i>';
    editButton.title = 'Редактировать список';
    
    // Добавляем обработчик события напрямую
    editButton.onclick = function() {
        console.log('Кнопка редактирования нажата');
        toggleEditingMode();
    };
    
    // Добавляем кнопку в начало main
    main.prepend(editButton);
    console.log('Кнопка редактирования добавлена');
}

// Добавление кнопки добавления нового задания
function addNewTaskButton() {
    const container = document.querySelector('.container');
    if (!container) return;
    
    const addButton = document.createElement('button');
    addButton.className = 'add-task-btn';
    addButton.innerHTML = '<i class="fas fa-plus"></i>';
    addButton.title = 'Добавить задание';
    
    addButton.addEventListener('click', () => {
        openTaskModal(null, getCurrentTaskType());
    });
    
    container.appendChild(addButton);
}

// Создание модального окна для редактирования задания
function createTaskModal() {
    const modal = document.createElement('div');
    modal.className = 'task-modal';
    modal.id = 'task-edit-modal';
    
    modal.innerHTML = `
        <div class="task-modal-content">
            <div class="task-modal-header">
                <h2 class="task-modal-title">Редактирование задания</h2>
                <button class="task-close-btn">&times;</button>
            </div>
            <form id="task-edit-form">
                <div class="task-form-group">
                    <label for="task-title">Название задания</label>
                    <input type="text" id="task-title" required>
                </div>
                <div class="task-form-actions">
                    <button type="button" class="task-cancel-btn">Отмена</button>
                    <button type="submit" class="task-save-btn">Сохранить</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const closeBtn = modal.querySelector('.task-close-btn');
    const cancelBtn = modal.querySelector('.task-cancel-btn');
    const form = modal.querySelector('#task-edit-form');
    
    closeBtn.addEventListener('click', closeTaskModal);
    cancelBtn.addEventListener('click', closeTaskModal);
    form.addEventListener('submit', saveTask);
    
    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeTaskModal();
        }
    });
}

// Создание модального окна для подтверждения удаления
function createConfirmModal() {
    const modal = document.createElement('div');
    modal.className = 'task-confirm-modal';
    modal.id = 'task-confirm-modal';
    
    modal.innerHTML = `
        <div class="task-confirm-content">
            <h3 class="task-confirm-title">Удаление задания</h3>
            <p class="task-confirm-message">Вы уверены, что хотите удалить это задание?</p>
            <div class="task-confirm-actions">
                <button class="task-confirm-cancel">Отмена</button>
                <button class="task-confirm-delete">Удалить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const cancelBtn = modal.querySelector('.task-confirm-cancel');
    const deleteBtn = modal.querySelector('.task-confirm-delete');
    
    cancelBtn.addEventListener('click', closeConfirmModal);
    deleteBtn.addEventListener('click', confirmDeleteTask);
    
    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeConfirmModal();
        }
    });
}

// Добавление кнопок действий к заданиям
function addTaskActionButtons() {
    const taskItems = document.querySelectorAll('.task-item');
    
    taskItems.forEach(taskItem => {
        // Проверяем, есть ли уже кнопки действий
        if (taskItem.querySelector('.task-actions')) return;
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'task-edit-btn';
        editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
        editBtn.title = 'Редактировать';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-delete-btn';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = 'Удалить';
        
        // Добавляем обработчики событий
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                openTaskModal(checkbox.id, getCurrentTaskType());
            }
        });
        
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const checkbox = taskItem.querySelector('input[type="checkbox"]');
            if (checkbox) {
                openConfirmModal(checkbox.id);
            }
        });
        
        actionsDiv.appendChild(editBtn);
        actionsDiv.appendChild(deleteBtn);
        taskItem.appendChild(actionsDiv);
    });
}

// Переключение режима редактирования
function toggleEditingMode() {
    isEditingMode = !isEditingMode;
    
    const container = document.querySelector('.container');
    if (isEditingMode) {
        container.classList.add('editing-mode');
    } else {
        container.classList.remove('editing-mode');
    }
    
    // Обновляем кнопки действий
    addTaskActionButtons();
}

// Открытие модального окна редактирования задания
function openTaskModal(taskId, taskType) {
    currentTaskId = taskId;
    currentTaskType = taskType;
    
    const modal = document.getElementById('task-edit-modal');
    const titleInput = document.getElementById('task-title');
    const modalTitle = modal.querySelector('.task-modal-title');
    
    if (taskId) {
        // Редактирование существующего задания
        const label = document.querySelector(`label[for="${taskId}"]`);
        if (label) {
            titleInput.value = label.textContent;
            modalTitle.textContent = 'Редактирование задания';
        }
    } else {
        // Создание нового задания
        titleInput.value = '';
        modalTitle.textContent = 'Новое задание';
    }
    
    modal.classList.add('active');
}

// Закрытие модального окна редактирования задания
function closeTaskModal() {
    const modal = document.getElementById('task-edit-modal');
    modal.classList.remove('active');
    currentTaskId = null;
}

// Сохранение задания
function saveTask(e) {
    e.preventDefault();
    
    const titleInput = document.getElementById('task-title');
    const title = titleInput.value.trim();
    
    if (!title) return;
    
    if (currentTaskId) {
        // Обновление существующего задания
        const label = document.querySelector(`label[for="${currentTaskId}"]`);
        if (label) {
            label.textContent = title;
            saveTasksToLocalStorage();
        }
    } else {
        // Создание нового задания
        createNewTask(title);
    }
    
    closeTaskModal();
}

// Создание нового задания
function createNewTask(title) {
    const taskList = document.querySelector(`.${currentTaskType === 'daily' ? 'all-day-tasks' : 'weekly-tasks'} .task-list`);
    if (!taskList) return;
    
    // Генерируем новый ID
    const newId = `${currentTaskType}-task-${taskIdCounter++}`;
    
    // Создаем новый элемент задания
    const taskItem = document.createElement('div');
    taskItem.className = 'task-item';
    
    taskItem.innerHTML = `
        <input type="checkbox" id="${newId}">
        <label for="${newId}">${title}</label>
    `;
    
    // Добавляем кнопки действий
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'task-edit-btn';
    editBtn.innerHTML = '<i class="fas fa-pencil-alt"></i>';
    editBtn.title = 'Редактировать';
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-delete-btn';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.title = 'Удалить';
    
    // Добавляем обработчики событий
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openTaskModal(newId, currentTaskType);
    });
    
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openConfirmModal(newId);
    });
    
    actionsDiv.appendChild(editBtn);
    actionsDiv.appendChild(deleteBtn);
    taskItem.appendChild(actionsDiv);
    
    // Добавляем задание в список
    taskList.appendChild(taskItem);
    
    // Добавляем обработчики событий для нового задания
    const checkbox = taskItem.querySelector('input[type="checkbox"]');
    
    checkbox.addEventListener('change', function() {
        if (this.checked) {
            if (typeof markTaskAsCompleted === 'function') {
                // Используем существующую функцию, если она доступна
                markTaskAsCompleted(this);
                if (typeof incrementTasksCompleted === 'function') {
                    incrementTasksCompleted();
                }
                if (typeof saveTaskStates === 'function') {
                    saveTaskStates();
                }
            }
        }
    });
    
    taskItem.addEventListener('click', function(event) {
        // Игнорируем клики на чекбоксе, метке и кнопках
        if (event.target.matches('input[type="checkbox"]') || 
            event.target.matches('label') ||
            event.target.closest('.task-actions')) {
            return;
        }
        
        if (!checkbox.checked && !checkbox.disabled) {
            // Задание еще не выполнено - отмечаем его
            checkbox.checked = true;
            const changeEvent = new Event('change');
            checkbox.dispatchEvent(changeEvent);
        } 
        else if (checkbox.checked && checkbox.disabled) {
            // Задание уже выполнено - просто воспроизводим звук
            if (typeof playCheckboxSound === 'function') {
                playCheckboxSound();
            }
        }
    });
    
    // Сохраняем изменения
    saveTasksToLocalStorage();
}

// Открытие модального окна подтверждения удаления
function openConfirmModal(taskId) {
    currentTaskId = taskId;
    
    const modal = document.getElementById('task-confirm-modal');
    modal.classList.add('active');
}

// Закрытие модального окна подтверждения удаления
function closeConfirmModal() {
    const modal = document.getElementById('task-confirm-modal');
    modal.classList.remove('active');
    currentTaskId = null;
}

// Подтверждение удаления задания
function confirmDeleteTask() {
    if (!currentTaskId) return;
    
    const taskItem = document.querySelector(`#${currentTaskId}`).closest('.task-item');
    if (taskItem) {
        taskItem.remove();
        saveTasksToLocalStorage();
    }
    
    closeConfirmModal();
}

// Сохранение заданий в localStorage
function saveTasksToLocalStorage() {
    const taskType = getCurrentTaskType();
    
    if (taskType === 'daily') {
        // Сохраняем ежедневные задания
        const dailyTasks = {};
        
        document.querySelectorAll('.all-day-tasks .task-item input[type="checkbox"]').forEach(checkbox => {
            // Сохраняем состояние чекбокса
            dailyTasks[checkbox.id] = checkbox.checked;
            // Сохраняем состояние disabled
            dailyTasks[checkbox.id + '_disabled'] = checkbox.disabled;
            
            // Сохраняем текст задания в отдельном ключе для совместимости
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) {
                dailyTasks[checkbox.id + '_text'] = label.textContent;
            }
        });
        
        localStorage.setItem('dailyTasks', JSON.stringify(dailyTasks));
    } else {
        // Сохраняем еженедельные задания
        const weeklyTasks = {};
        
        document.querySelectorAll('.weekly-tasks .task-item input[type="checkbox"]').forEach(checkbox => {
            // Сохраняем состояние чекбокса
            weeklyTasks[checkbox.id] = checkbox.checked;
            // Сохраняем состояние disabled
            weeklyTasks[checkbox.id + '_disabled'] = checkbox.disabled;
            
            // Сохраняем текст задания в отдельном ключе для совместимости
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) {
                weeklyTasks[checkbox.id + '_text'] = label.textContent;
            }
        });
        
        localStorage.setItem('weeklyTasks', JSON.stringify(weeklyTasks));
    }
}

// Получение текущего типа заданий (daily или weekly)
function getCurrentTaskType() {
    // Определяем тип по URL
    if (window.location.href.includes('Weekly')) {
        return 'weekly';
    }
    return 'daily';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем редактор заданий после загрузки основных скриптов
    setTimeout(initTaskEditor, 500);
}); 