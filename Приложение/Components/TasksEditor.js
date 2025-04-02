/**
 * JavaScript для редактора заданий
 * Обеспечивает функциональность добавления, редактирования и удаления заданий
 * для ежедневных и еженедельных задач
 */

document.addEventListener('DOMContentLoaded', function() {
  // Элементы DOM для модального окна
  const tasksEditorModal = document.getElementById('tasks-editor-modal');
  const tasksEditorTitle = document.getElementById('tasks-editor-title');
  const tasksEditorClose = document.getElementById('tasks-editor-close');
  const addTaskForm = document.getElementById('add-task-form');
  const newTaskTitle = document.getElementById('new-task-title');
  const editableTasksList = document.getElementById('editable-tasks-list');
  
  // Кнопки для открытия редактора
  const editDailyTasksBtn = document.getElementById('edit-daily-tasks');
  const editWeeklyTasksBtn = document.getElementById('edit-weekly-tasks');
  
  // Текущий тип редактируемых заданий (daily или weekly)
  let currentTasksType = '';
  
  // Проверка наличия элементов
  if (!tasksEditorModal || !editDailyTasksBtn || !editWeeklyTasksBtn) return;
  
  // Функция для открытия модального окна редактора заданий
  function openTasksEditor(tasksType) {
    // Закрываем панель настроек
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && settingsPanel.classList.contains('active')) {
      settingsPanel.classList.remove('active');
    }
    
    // Устанавливаем текущий тип заданий
    currentTasksType = tasksType;
    
    // Обновляем заголовок модального окна
    if (tasksType === 'daily') {
      tasksEditorTitle.textContent = 'Редактор ежедневных заданий';
    } else if (tasksType === 'weekly') {
      tasksEditorTitle.textContent = 'Редактор еженедельных заданий';
    }
    
    // Загружаем задания
    loadTasks();
    
    // Открываем модальное окно
    tasksEditorModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Функция для закрытия модального окна редактора заданий
  function closeTasksEditor() {
    tasksEditorModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Очищаем форму и список
    newTaskTitle.value = '';
    editableTasksList.innerHTML = '';
    
    // Обновляем отображение заданий на главном экране
    if (currentTasksType === 'daily' && window.dailyLoadTasks) {
      window.dailyLoadTasks();
    } else if (currentTasksType === 'weekly' && window.weeklyLoadTasks) {
      window.weeklyLoadTasks();
    }
    
    // Сбрасываем текущий тип заданий
    currentTasksType = '';
  }
  
  // Функция для загрузки заданий
  function loadTasks() {
    // Очищаем список
    editableTasksList.innerHTML = '';
    
    // Получаем задания из localStorage
    let tasks = [];
    if (currentTasksType === 'daily') {
      tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    } else if (currentTasksType === 'weekly') {
      tasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    }
    
    // Отображаем задания
    tasks.forEach(task => {
      addTaskToList(task);
    });
  }
  
  // Функция для добавления задания в список
  function addTaskToList(task) {
    const taskItem = document.createElement('div');
    taskItem.className = 'editable-task-item';
    taskItem.dataset.id = task.id;
    
    taskItem.innerHTML = `
      <div class="editable-task-title">${task.title}</div>
      <div class="editable-task-actions">
        <button class="task-edit-btn" aria-label="Редактировать задание">
          <i class="fas fa-edit"></i>
        </button>
        <button class="task-delete-btn" aria-label="Удалить задание">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    
    // Добавляем обработчики событий
    const editBtn = taskItem.querySelector('.task-edit-btn');
    const deleteBtn = taskItem.querySelector('.task-delete-btn');
    
    editBtn.addEventListener('click', () => {
      enterEditMode(taskItem, task);
    });
    
    deleteBtn.addEventListener('click', () => {
      deleteTask(task.id);
    });
    
    editableTasksList.appendChild(taskItem);
  }
  
  // Функция для входа в режим редактирования задания
  function enterEditMode(taskItem, task) {
    const taskTitle = taskItem.querySelector('.editable-task-title');
    const taskActions = taskItem.querySelector('.editable-task-actions');
    
    // Сохраняем текущее значение
    const currentTitle = taskTitle.textContent;
    
    // Создаем форму редактирования
    const editForm = document.createElement('div');
    editForm.className = 'task-edit-mode';
    editForm.innerHTML = `
      <input type="text" class="task-edit-input" value="${currentTitle}" autocomplete="off" id="edit-task-${task.id}" name="edit-task-${task.id}">
      <button class="task-save-btn" aria-label="Сохранить">
        <i class="fas fa-check"></i>
      </button>
      <button class="task-cancel-btn" aria-label="Отменить">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Заменяем содержимое
    taskItem.innerHTML = '';
    taskItem.appendChild(editForm);
    
    // Фокусируемся на поле ввода
    const input = editForm.querySelector('.task-edit-input');
    input.focus();
    input.setSelectionRange(0, input.value.length);
    
    // Добавляем обработчики событий
    const saveBtn = editForm.querySelector('.task-save-btn');
    const cancelBtn = editForm.querySelector('.task-cancel-btn');
    
    saveBtn.addEventListener('click', () => {
      saveTaskEdit(task.id, input.value);
    });
    
    cancelBtn.addEventListener('click', () => {
      cancelTaskEdit(taskItem, task);
    });
    
    // Обработчик нажатия Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        saveTaskEdit(task.id, input.value);
      } else if (e.key === 'Escape') {
        cancelTaskEdit(taskItem, task);
      }
    });
  }
  
  // Функция для сохранения отредактированного задания
  function saveTaskEdit(taskId, newTitle) {
    if (!newTitle.trim()) return;
    
    // Получаем задания из localStorage
    let tasks = [];
    if (currentTasksType === 'daily') {
      tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    } else if (currentTasksType === 'weekly') {
      tasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    }
    
    // Находим и обновляем задание
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].title = newTitle.trim();
      
      // Сохраняем обновленный список
      if (currentTasksType === 'daily') {
        localStorage.setItem('daily-tasks', JSON.stringify(tasks));
      } else if (currentTasksType === 'weekly') {
        localStorage.setItem('weekly-tasks', JSON.stringify(tasks));
      }
      
      // Перезагружаем список
      loadTasks();
    }
  }
  
  // Функция для отмены редактирования задания
  function cancelTaskEdit(taskItem, task) {
    // Перезагружаем список
    loadTasks();
  }
  
  // Функция для удаления задания
  function deleteTask(taskId) {
    // Получаем задания из localStorage
    let tasks = [];
    if (currentTasksType === 'daily') {
      tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    } else if (currentTasksType === 'weekly') {
      tasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    }
    
    // Удаляем задание
    tasks = tasks.filter(task => task.id !== taskId);
    
    // Сохраняем обновленный список
    if (currentTasksType === 'daily') {
      localStorage.setItem('daily-tasks', JSON.stringify(tasks));
    } else if (currentTasksType === 'weekly') {
      localStorage.setItem('weekly-tasks', JSON.stringify(tasks));
    }
    
    // Перезагружаем список
    loadTasks();
    
    // Обновляем статистику задач, если доступна
    if (window.StatsPage && typeof window.StatsPage.loadAndUpdateTasksStats === 'function') {
      window.StatsPage.loadAndUpdateTasksStats();
    }
  }
  
  // Функция для добавления нового задания
  function addTask(event) {
    event.preventDefault();
    
    const title = newTaskTitle.value.trim();
    if (!title) return;
    
    // Получаем задания из localStorage
    let tasks = [];
    if (currentTasksType === 'daily') {
      tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    } else if (currentTasksType === 'weekly') {
      tasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    }
    
    // Создаем новое задание
    const newTask = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title: title,
      completed: false
    };
    
    // Добавляем задание в список
    tasks.push(newTask);
    
    // Сохраняем обновленный список
    if (currentTasksType === 'daily') {
      localStorage.setItem('daily-tasks', JSON.stringify(tasks));
    } else if (currentTasksType === 'weekly') {
      localStorage.setItem('weekly-tasks', JSON.stringify(tasks));
    }
    
    // Очищаем поле ввода
    newTaskTitle.value = '';
    
    // Перезагружаем список
    loadTasks();
    
    // Закрываем модальное окно
    closeTasksEditor();
    
    // Обновляем статистику задач, если доступна
    if (window.StatsPage && typeof window.StatsPage.loadAndUpdateTasksStats === 'function') {
      window.StatsPage.loadAndUpdateTasksStats();
    }
  }
  
  // Обработчики событий
  editDailyTasksBtn.addEventListener('click', () => {
    openTasksEditor('daily');
  });
  
  editWeeklyTasksBtn.addEventListener('click', () => {
    openTasksEditor('weekly');
  });
  
  // Улучшенная обработка событий для кнопки закрытия
  tasksEditorClose.addEventListener('click', closeTasksEditor);
  tasksEditorClose.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Предотвращаем стандартное поведение
  });
  tasksEditorClose.addEventListener('touchend', function(e) {
    e.preventDefault(); // Предотвращаем стандартное поведение
    closeTasksEditor();
  });
  
  // Закрытие модального окна при клике на фон
  tasksEditorModal.addEventListener('click', function(event) {
    if (event.target === tasksEditorModal) {
      closeTasksEditor();
    }
  });
  
  // Закрытие модального окна при нажатии Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && tasksEditorModal.classList.contains('active')) {
      closeTasksEditor();
    }
  });
  
  // Обработчик отправки формы
  addTaskForm.addEventListener('submit', addTask);
}); 