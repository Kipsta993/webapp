/**
 * JavaScript для страницы Weekly
 * Обеспечивает функциональность отображения и выполнения еженедельных заданий
 */

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы DOM
  const weekTasksContainer = document.querySelector('.week-tasks');
  const weeklyCardTitle = document.querySelector('.weekly-card-title');
  
  // Переменные для пагинации
  let currentPage = 1;
  let totalPages = 1;
  let tasksPerPage = 7;
  let allTasks = [];
  
  // Проверка наличия элементов
  if (!weekTasksContainer) return;
  
  // Функция для загрузки заданий
  function loadTasks() {
    // Получаем задания из localStorage
    allTasks = JSON.parse(localStorage.getItem('weekly-tasks')) || [];
    
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
  }
  
  // Функция для обновления индикатора страниц
  function updatePageIndicator() {
    // Находим все заголовки weekly-card-title
    const allTitles = document.querySelectorAll('.weekly-card-title');
    let tasksTitleElement = null;
    
    // Ищем заголовок, содержащий текст "Задания на неделю"
    for (const title of allTitles) {
      if (title.textContent.includes('Задания на неделю')) {
        tasksTitleElement = title;
        break;
      }
    }
    
    // Если не нашли нужный заголовок, используем текущий weeklyCardTitle
    if (!tasksTitleElement) {
      tasksTitleElement = weeklyCardTitle;
    }
    
    // Удаляем старый индикатор страниц, если он есть
    const oldIndicator = tasksTitleElement.querySelector('.page-indicator');
    if (oldIndicator) {
      tasksTitleElement.removeChild(oldIndicator);
    }
    
    // Создаем новый индикатор страниц
    const pageIndicator = document.createElement('span');
    pageIndicator.className = 'page-indicator';
    pageIndicator.textContent = ` (${currentPage}/${totalPages})`;
    
    // Очищаем заголовок и добавляем иконку и текст
    tasksTitleElement.innerHTML = '';
    
    // Добавляем иконку, если она была
    const iconElement = document.createElement('i');
    iconElement.className = 'fas fa-calendar-week';
    tasksTitleElement.appendChild(iconElement);
    
    // Добавляем пробел после иконки
    tasksTitleElement.appendChild(document.createTextNode(' '));
    
    // Добавляем текст "Задания на неделю"
    tasksTitleElement.appendChild(document.createTextNode('Задания на неделю'));
    
    // Добавляем индикатор страниц
    tasksTitleElement.appendChild(pageIndicator);
  }
  
  // Функция для отображения заданий текущей страницы
  function displayTasksForCurrentPage() {
    // Очищаем контейнер
    weekTasksContainer.innerHTML = '';
    
    // Если заданий нет, показываем сообщение
    if (allTasks.length === 0) {
      weekTasksContainer.innerHTML = '<div class="empty-tasks">Нет заданий на эту неделю</div>';
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
      
      // Если задание уже выполнено, добавляем класс для зачеркивания и отключаем чекбокс
      if (task.completed) {
        const taskTitle = taskItem.querySelector('.task-title');
        if (taskTitle) {
          taskTitle.classList.add('completed');
        }
        checkbox.disabled = true;
      }
      
      weekTasksContainer.appendChild(taskItem);
    }
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
      
      // Обновляем локальный массив заданий
      allTasks = tasks;
      
      // Если задание выполнено, добавляем класс для анимации
      if (completed) {
        const taskItem = document.querySelector(`[data-id="${taskId}"]`);
        if (taskItem) {
          const taskTitle = taskItem.querySelector('.task-title');
          const checkbox = taskItem.querySelector('input[type="checkbox"]');
          
          if (taskTitle) {
            taskTitle.classList.add('completed');
          }
          
          // Отключаем чекбокс после анимации
          if (checkbox) {
            setTimeout(() => {
              checkbox.disabled = true;
            }, 300);
          }
        }
      }
    }
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
  
  // Инициализация свайпов для пагинации
  function initSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    // Минимальное расстояние свайпа для срабатывания (в пикселях)
    const minSwipeDistance = 50;
    
    weekTasksContainer.addEventListener('touchstart', function(e) {
      touchStartX = e.changedTouches[0].screenX;
    }, false);
    
    weekTasksContainer.addEventListener('touchend', function(e) {
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
  
  // Делаем функцию loadTasks глобально доступной
  window.weeklyLoadTasks = loadTasks;
  window.loadTasks = loadTasks;
  
  // Загружаем задания при загрузке страницы
  loadTasks();
  
  // Инициализируем свайпы
  initSwipeGestures();
});
