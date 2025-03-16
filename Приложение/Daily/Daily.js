/**
 * JavaScript для страницы Daily
 * Обеспечивает функциональность отображения и выполнения ежедневных заданий
 */

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы DOM
  const dayTasksContainer = document.querySelector('.day-tasks');
  const progressFill = document.querySelector('.progress-fill');
  const progressPercentage = document.querySelector('.progress-percentage');
  const nextTaskContainer = document.querySelector('.next-task');
  
  // Проверка наличия элементов
  if (!dayTasksContainer) return;
  
  // Функция для загрузки заданий
  function loadTasks() {
    // Получаем задания из localStorage
    const tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    
    // Очищаем контейнер
    dayTasksContainer.innerHTML = '';
    
    // Если заданий нет, показываем сообщение
    if (tasks.length === 0) {
      dayTasksContainer.innerHTML = '<div class="empty-tasks">Нет заданий на сегодня</div>';
      updateProgress(0, 0);
      return;
    }
    
    // Отображаем задания
    tasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.className = 'task-item';
      taskItem.dataset.id = task.id;
      
      taskItem.innerHTML = `
        <div class="task-checkbox">
          <input type="checkbox" id="task-${task.id}" ${task.completed ? 'checked' : ''}>
          <label for="task-${task.id}"></label>
        </div>
        <div class="task-info">
          <div class="task-title">${task.title}</div>
        </div>
      `;
      
      // Добавляем обработчик изменения статуса
      const checkbox = taskItem.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => {
        toggleTaskStatus(task.id, checkbox.checked);
      });
      
      dayTasksContainer.appendChild(taskItem);
    });
    
    // Обновляем прогресс
    updateProgress(tasks.filter(task => task.completed).length, tasks.length);
  }
  
  // Функция для переключения статуса задания
  function toggleTaskStatus(taskId, completed) {
    // Получаем задания из localStorage
    const tasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    
    // Находим и обновляем задание
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = completed;
      
      // Сохраняем обновленный список
      localStorage.setItem('daily-tasks', JSON.stringify(tasks));
      
      // Обновляем прогресс
      updateProgress(tasks.filter(task => task.completed).length, tasks.length);
    }
  }
  
  // Функция для обновления прогресса
  function updateProgress(completedCount, totalCount) {
    if (totalCount === 0) {
      progressFill.style.width = '0%';
      progressPercentage.textContent = '0%';
      return;
    }
    
    const percentage = Math.round((completedCount / totalCount) * 100);
    progressFill.style.width = `${percentage}%`;
    progressPercentage.textContent = `${percentage}%`;
  }
  
  // Функция для обновления следующего задания
  function updateNextTask() {
    // Проверяем наличие контейнера
    if (!nextTaskContainer) return;
    
    // Получаем задания из расписания
    const scheduleItems = JSON.parse(localStorage.getItem('schedule-items')) || [];
    const taskContent = nextTaskContainer.querySelector('.task-content');
    
    // Если нет заданий в расписании, показываем сообщение
    if (scheduleItems.length === 0) {
      taskContent.innerHTML = `
        <div class="task-time-small">Нет заданий в расписании</div>
        <div class="task-title">Добавьте задания в редакторе расписания</div>
      `;
      return;
    }
    
    // Получаем текущее время
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    // Сортируем задания по времени начала
    scheduleItems.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    // Проверяем, есть ли текущее задание (которое идёт прямо сейчас)
    let currentItem = null;
    for (const item of scheduleItems) {
      if (item.startTime <= currentTimeString && item.endTime > currentTimeString) {
        currentItem = item;
        break;
      }
    }
    
    // Если есть текущее задание, показываем его
    if (currentItem) {
      taskContent.innerHTML = `
        <div class="task-time-small">${formatTimeRange(currentItem.startTime, currentItem.endTime)}</div>
        <div class="task-title">${currentItem.title}</div>
      `;
      return;
    }
    
    // Если нет текущего задания, показываем сообщение
    taskContent.innerHTML = `
      <div class="task-time-small">Нет текущих заданий</div>
      <div class="task-title">Сейчас ничего не запланировано</div>
    `;
  }
  
  // Функция для форматирования временного диапазона
  function formatTimeRange(startTime, endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
  
  // Функция для форматирования времени
  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }
  
  // Делаем функции глобально доступными
  window.dailyLoadTasks = loadTasks;
  window.loadTasks = loadTasks;
  
  // Загружаем задания при загрузке страницы
  loadTasks();
  
  // Обновляем карточку "Следующее задание" при загрузке страницы
  updateNextTask();
  
  // Обновляем карточку "Следующее задание" каждую минуту
  setInterval(updateNextTask, 60000);
  
  // Делаем функцию updateNextTask глобально доступной, чтобы её можно было вызвать из редактора расписания
  window.updateNextTask = updateNextTask;
});
