/**
 * JavaScript для страницы Weekly
 * Обеспечивает функциональность отображения и выполнения еженедельных заданий
 */

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы DOM
  const weekTasksContainer = document.querySelector('.week-tasks');
  
  // Проверка наличия элементов
  if (!weekTasksContainer) return;
  
  // Функция для загрузки заданий
  function loadTasks() {
    // Получаем задания из localStorage
    const tasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    
    // Очищаем контейнер
    weekTasksContainer.innerHTML = '';
    
    // Если заданий нет, показываем сообщение
    if (tasks.length === 0) {
      weekTasksContainer.innerHTML = '<div class="empty-tasks">Нет заданий на эту неделю</div>';
      return;
    }
    
    // Отображаем задания
    tasks.forEach(task => {
      const taskItem = document.createElement('div');
      taskItem.className = 'task-item';
      taskItem.dataset.id = task.id;
      
      taskItem.innerHTML = `
        <div class="task-checkbox">
          <input type="checkbox" id="week-task-${task.id}" ${task.completed ? 'checked' : ''}>
          <label for="week-task-${task.id}"></label>
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
      
      weekTasksContainer.appendChild(taskItem);
    });
  }
  
  // Функция для переключения статуса задания
  function toggleTaskStatus(taskId, completed) {
    // Получаем задания из localStorage
    const tasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    
    // Находим и обновляем задание
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].completed = completed;
      
      // Сохраняем обновленный список
      localStorage.setItem('weekly-tasks', JSON.stringify(tasks));
    }
  }
  
  // Делаем функцию loadTasks глобально доступной
  window.weeklyLoadTasks = loadTasks;
  window.loadTasks = loadTasks;
  
  // Загружаем задания при загрузке страницы
  loadTasks();
});
