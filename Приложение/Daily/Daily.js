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
  const dailyCardTitle = document.querySelector('.daily-card-title');
  
  // Переменные для пагинации
  let currentPage = 1;
  let totalPages = 1;
  let tasksPerPage = 7;
  let allTasks = [];
  
  // Проверка наличия элементов
  if (!dayTasksContainer) return;
  
  // Функция для загрузки заданий
  function loadTasks() {
    // Получаем задания из localStorage
    allTasks = JSON.parse(localStorage.getItem('daily-tasks')) || [];
    
    // Вычисляем общее количество страниц
    totalPages = Math.max(1, Math.ceil(allTasks.length / tasksPerPage));
    
    // Сбрасываем текущую страницу, если она больше общего количества страниц
    if (currentPage > totalPages) {
      currentPage = 1;
    }
    
    // Обновляем индикатор страниц
    updatePageIndicator();
    
    // Отображаем задания текущей страницы
    displayTasksForCurrentPage();
    
    // Обновляем прогресс
    updateProgress(allTasks.filter(task => task.completed).length, allTasks.length);
  }
  
  // Функция для обновления индикатора страниц
  function updatePageIndicator() {
    // Находим все заголовки daily-card-title
    const allTitles = document.querySelectorAll('.daily-card-title');
    let tasksTitleElement = null;
    
    // Ищем заголовок, содержащий текст "Задания на сегодня"
    for (const title of allTitles) {
      if (title.textContent.includes('Задания на сегодня')) {
        tasksTitleElement = title;
        break;
      }
    }
    
    // Если не нашли нужный заголовок, используем текущий dailyCardTitle
    if (!tasksTitleElement) {
      tasksTitleElement = dailyCardTitle;
    }
    
    // Удаляем старый индикатор страниц, если он есть
    const oldIndicator = tasksTitleElement.querySelector('.page-indicator');
    if (oldIndicator) {
      tasksTitleElement.removeChild(oldIndicator);
    }
    
    // Сохраняем оригинальное содержимое заголовка
    const originalHTML = tasksTitleElement.innerHTML;
    
    // Создаем новый индикатор страниц
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'page-indicator';
    pageIndicator.textContent = ` (${currentPage}/${totalPages})`;
    
    // Очищаем заголовок и добавляем иконку и текст
    tasksTitleElement.innerHTML = '';
    
    // Добавляем иконку, если она была
    const iconElement = document.createElement('i');
    iconElement.className = 'fas fa-list';
    tasksTitleElement.appendChild(iconElement);
    
    // Добавляем пробел после иконки
    tasksTitleElement.appendChild(document.createTextNode(' '));
    
    // Добавляем текст "Задания на сегодня"
    tasksTitleElement.appendChild(document.createTextNode('Задания на сегодня'));
    
    // Добавляем индикатор страниц
    tasksTitleElement.appendChild(pageIndicator);
  }
  
  // Функция для отображения заданий текущей страницы
  function displayTasksForCurrentPage() {
    // Очищаем контейнер
    dayTasksContainer.innerHTML = '';
    
    // Если заданий нет, показываем сообщение
    if (allTasks.length === 0) {
      dayTasksContainer.innerHTML = '<div class="empty-tasks">Нет заданий на сегодня</div>';
      return;
    }
    
    // Вычисляем индексы заданий для текущей страницы
    const startIndex = (currentPage - 1) * tasksPerPage;
    const endIndex = Math.min(startIndex + tasksPerPage, allTasks.length);
    
    // Отображаем задания текущей страницы
    for (let i = startIndex; i < endIndex; i++) {
      const task = allTasks[i];
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
    }
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
      
      // Обновляем локальный массив заданий
      allTasks = tasks;
      
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
  
  // Функция для перехода на следующую страницу
  function goToNextPage() {
    if (currentPage < totalPages) {
      currentPage++;
      updatePageIndicator();
      displayTasksForCurrentPage();
    }
  }
  
  // Функция для перехода на предыдущую страницу
  function goToPrevPage() {
    if (currentPage > 1) {
      currentPage--;
      updatePageIndicator();
      displayTasksForCurrentPage();
    }
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
  
  // Инициализация свайпов для пагинации
  function initSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Минимальное расстояние свайпа для срабатывания (в пикселях)
    const minSwipeDistance = 50;
    
    dayTasksContainer.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    dayTasksContainer.addEventListener('touchend', function(e) {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, false);
    
    function handleSwipe() {
      const swipeDistance = touchEndX - touchStartX;
      
      // Если свайп достаточно длинный
      if (Math.abs(swipeDistance) >= minSwipeDistance) {
        if (swipeDistance > 0) {
          // Свайп вправо - предыдущая страница
          goToPrevPage();
        } else {
          // Свайп влево - следующая страница
          goToNextPage();
        }
      }
    }
  }
  
  // Делаем функции глобально доступными
  window.dailyLoadTasks = loadTasks;
  window.loadTasks = loadTasks;
  
  // Загружаем задания при загрузке страницы
  loadTasks();
  
  // Инициализируем свайпы
  initSwipeGestures();
  
  // Обновляем карточку "Следующее задание" при загрузке страницы
  updateNextTask();
  
  // Обновляем карточку "Следующее задание" каждую минуту
  setInterval(updateNextTask, 60000);
  
  // Делаем функцию updateNextTask глобально доступной, чтобы её можно было вызвать из редактора расписания
  window.updateNextTask = updateNextTask;
});
