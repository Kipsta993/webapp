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
  
  // Создаем элемент выбора дня недели для еженедельных заданий
  const weekDaySelector = document.createElement('div');
  weekDaySelector.className = 'week-day-selector';
  weekDaySelector.innerHTML = `
    <label for="week-day-select">День недели:</label>
    <select id="week-day-select" class="week-day-select">
      <option value="">Не выбрано</option>
      <option value="Пн">Понедельник</option>
      <option value="Вт">Вторник</option>
      <option value="Ср">Среда</option>
      <option value="Чт">Четверг</option>
      <option value="Пт">Пятница</option>
      <option value="Сб">Суббота</option>
      <option value="Вс">Воскресенье</option>
    </select>
  `;
  
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
      
      // Удаляем селектор дня недели, если он был добавлен
      const existingSelector = addTaskForm.querySelector('.week-day-selector');
      if (existingSelector) {
        addTaskForm.removeChild(existingSelector);
      }
    } else if (tasksType === 'weekly') {
      tasksEditorTitle.textContent = 'Редактор еженедельных заданий';
      
      // Добавляем селектор дня недели, если его еще нет
      const existingSelector = addTaskForm.querySelector('.week-day-selector');
      if (!existingSelector) {
        // Вставляем перед кнопкой добавления
        addTaskForm.insertBefore(weekDaySelector, addTaskForm.querySelector('button[type="submit"]'));
      }
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
    const weekDaySelect = document.getElementById('week-day-select');
    if (weekDaySelect) {
      weekDaySelect.value = '';
    }
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
    
    let taskContent = `<div class="editable-task-title">${task.title}</div>`;
    
    // Добавляем индикатор дня недели для еженедельных заданий, если он задан
    if (currentTasksType === 'weekly' && task.weekDay) {
      taskContent += `<div class="editable-task-weekday">${task.weekDay}</div>`;
    }
    
    taskItem.innerHTML = `
      <div class="editable-task-content">
        ${taskContent}
      </div>
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
    const taskContent = taskItem.querySelector('.editable-task-content');
    const taskActions = taskItem.querySelector('.editable-task-actions');
    
    // Сохраняем текущее значение
    const currentTitle = task.title;
    const currentWeekDay = task.weekDay || '';
    
    // Создаем форму редактирования
    const editForm = document.createElement('div');
    editForm.className = 'task-edit-mode';
    
    let weekDaySelectHtml = '';
    if (currentTasksType === 'weekly') {
      weekDaySelectHtml = `
        <select class="task-edit-weekday" id="edit-weekday-${task.id}">
          <option value="">Не выбрано</option>
          <option value="Пн" ${currentWeekDay === 'Пн' ? 'selected' : ''}>Понедельник</option>
          <option value="Вт" ${currentWeekDay === 'Вт' ? 'selected' : ''}>Вторник</option>
          <option value="Ср" ${currentWeekDay === 'Ср' ? 'selected' : ''}>Среда</option>
          <option value="Чт" ${currentWeekDay === 'Чт' ? 'selected' : ''}>Четверг</option>
          <option value="Пт" ${currentWeekDay === 'Пт' ? 'selected' : ''}>Пятница</option>
          <option value="Сб" ${currentWeekDay === 'Сб' ? 'selected' : ''}>Суббота</option>
          <option value="Вс" ${currentWeekDay === 'Вс' ? 'selected' : ''}>Воскресенье</option>
        </select>
      `;
    }
    
    editForm.innerHTML = `
      <input type="text" class="task-edit-input" value="${currentTitle}" autocomplete="off" id="edit-task-${task.id}" name="edit-task-${task.id}">
      ${weekDaySelectHtml}
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
      const weekDaySelect = document.getElementById(`edit-weekday-${task.id}`);
      const selectedWeekDay = weekDaySelect ? weekDaySelect.value : currentWeekDay;
      saveTaskEdit(task.id, input.value, selectedWeekDay);
    });
    
    cancelBtn.addEventListener('click', () => {
      cancelTaskEdit(taskItem, task);
    });
    
    // Обработчик нажатия Enter
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const weekDaySelect = document.getElementById(`edit-weekday-${task.id}`);
        const selectedWeekDay = weekDaySelect ? weekDaySelect.value : currentWeekDay;
        saveTaskEdit(task.id, input.value, selectedWeekDay);
      } else if (e.key === 'Escape') {
        cancelTaskEdit(taskItem, task);
      }
    });
  }
  
  // Функция для сохранения отредактированного задания
  function saveTaskEdit(taskId, newTitle, weekDay) {
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
      
      // Обновляем день недели для еженедельных заданий
      if (currentTasksType === 'weekly') {
        tasks[taskIndex].weekDay = weekDay;
      }
      
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
    
    // Добавляем день недели для еженедельных заданий
    if (currentTasksType === 'weekly') {
      const weekDaySelect = document.getElementById('week-day-select');
      if (weekDaySelect) {
        newTask.weekDay = weekDaySelect.value;
      }
    }
    
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
    
    // Сбрасываем селектор дня недели
    const weekDaySelect = document.getElementById('week-day-select');
    if (weekDaySelect) {
      weekDaySelect.value = '';
    }
    
    // Перезагружаем список
    loadTasks();
    
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