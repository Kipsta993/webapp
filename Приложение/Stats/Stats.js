/**
 * JavaScript для страницы Stats
 * Обеспечивает переключение между вкладками Time и Tasks
 */

document.addEventListener('DOMContentLoaded', function() {
  // Находим элементы вкладок и контента
  const timeTab = document.getElementById('time-tab');
  const tasksTab = document.getElementById('tasks-tab');
  const timeContent = document.getElementById('time-content');
  const tasksContent = document.getElementById('tasks-content');

  // Функция для переключения на вкладку Time
  function showTimeTab() {
    timeTab.classList.add('active');
    tasksTab.classList.remove('active');
    timeContent.classList.add('active');
    tasksContent.classList.remove('active');
  }

  // Функция для переключения на вкладку Tasks
  function showTasksTab() {
    tasksTab.classList.add('active');
    timeTab.classList.remove('active');
    tasksContent.classList.add('active');
    timeContent.classList.remove('active');
  }

  // Добавляем обработчики событий для вкладок
  timeTab.addEventListener('click', showTimeTab);
  tasksTab.addEventListener('click', showTasksTab);

  // По умолчанию показываем вкладку Time
  showTimeTab();
});
