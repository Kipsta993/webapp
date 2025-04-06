/**
 * JavaScript для страницы Weekly
 * Обеспечивает функциональность отображения и выполнения еженедельных заданий
 */

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы DOM
  const weekTasksContainer = document.querySelector('.week-tasks');
  const weeklyCardTitle = document.querySelector('.weekly-card-title');
  
  // Инициализация правильных размеров для элементов
  initializeItemSizes();
  
  // Переменные для пагинации
  let currentPage = 1;
  let totalPages = 1;
  let tasksPerPage = 7;
  let allTasks = [];
  
  // Добавляем переменную для хранения названий страниц
  let pageNames = JSON.parse(localStorage.getItem('weekly-page-names')) || {};
  
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
      if (title.textContent.includes('Задания на неделю') || title.querySelector('.page-indicator')) {
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
    
    // Используем сохраненное название страницы или дефолтное
    const pageTitleText = pageNames[`page-${currentPage}`] || 'Задания на неделю';
    
    // Создаем элемент для текста названия страницы
    const pageTitleElement = document.createElement('span');
    pageTitleElement.className = 'page-title-text';
    pageTitleElement.textContent = pageTitleText;
    tasksTitleElement.appendChild(pageTitleElement);
    
    // Добавляем индикатор страниц
    tasksTitleElement.appendChild(pageIndicator);
    
    // Добавляем обработчики событий для редактирования на мобильных устройствах
    setupTitleEditing(pageTitleElement, currentPage);
  }
  
  // Функция для настройки редактирования заголовка
  function setupTitleEditing(titleElement, pageNumber) {
    let longPressTimer;
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Для долгого нажатия на мобильных устройствах
      titleElement.addEventListener('touchstart', function(e) {
        longPressTimer = setTimeout(() => {
          startEditing(titleElement, pageNumber);
        }, 800); // Время для долгого нажатия - 800 мс
      });
      
      titleElement.addEventListener('touchend', function(e) {
        clearTimeout(longPressTimer);
      });
      
      titleElement.addEventListener('touchmove', function(e) {
        clearTimeout(longPressTimer);
      });
    }
  }
  
  // Функция для начала редактирования
  function startEditing(titleElement, pageNumber) {
    const currentText = titleElement.textContent;
    const parent = titleElement.parentNode;
    
    // Создаем поле ввода
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.value = currentText;
    inputElement.className = 'title-edit-input';
    inputElement.style.width = '150px';
    inputElement.style.fontSize = '18px';
    inputElement.style.fontWeight = '600';
    inputElement.style.color = '#673AB7';
    inputElement.style.background = 'transparent';
    inputElement.style.border = '1px solid #673AB7';
    inputElement.style.borderRadius = '4px';
    inputElement.style.padding = '2px 5px';
    
    // Заменяем текстовый элемент на поле ввода
    parent.replaceChild(inputElement, titleElement);
    
    // Устанавливаем фокус и выделяем текст
    inputElement.focus();
    inputElement.select();
    
    // Обработчик для завершения редактирования по нажатию Enter
    inputElement.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        finishEditing(inputElement, titleElement, pageNumber);
      }
    });
    
    // Обработчик для завершения редактирования при потере фокуса
    inputElement.addEventListener('blur', function() {
      finishEditing(inputElement, titleElement, pageNumber);
    });
  }
  
  // Функция для завершения редактирования
  function finishEditing(inputElement, titleElement, pageNumber) {
    const newTitle = inputElement.value.trim() || 'Задания на неделю';
    
    // Сохраняем новое название в localStorage
    pageNames[`page-${pageNumber}`] = newTitle;
    localStorage.setItem('weekly-page-names', JSON.stringify(pageNames));
    
    // Обновляем текстовый элемент
    titleElement.textContent = newTitle;
    
    // Заменяем поле ввода обратно на текстовый элемент
    inputElement.parentNode.replaceChild(titleElement, inputElement);
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
      
      // Создаем HTML для задания, добавляя день недели, если он указан
      let taskHTML = `
        <div class="task-checkbox">
          <input type="checkbox" id="week-task-${task.id}" ${task.completed ? 'checked' : ''}>
          <label for="week-task-${task.id}"></label>
        </div>
        <div class="task-info">
          <div class="task-title">${task.title}</div>
        </div>
      `;
      
      // Добавляем индикатор дня недели, если он задан
      if (task.weekDay) {
        taskHTML = `
          <div class="task-checkbox">
            <input type="checkbox" id="week-task-${task.id}" ${task.completed ? 'checked' : ''}>
            <label for="week-task-${task.id}"></label>
          </div>
          <div class="task-info">
            <div class="task-title">${task.title}</div>
          </div>
          <div class="task-weekday">${task.weekDay}</div>
        `;
      }
      
      taskItem.innerHTML = taskHTML;
      
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
    
    // Пересчитываем размеры элементов после их создания
    setTimeout(initializeItemSizes, 0);
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
      
      // Обновляем статистику задач, если доступна
      if (window.StatsPage && typeof window.StatsPage.loadAndUpdateTasksStats === 'function') {
        window.StatsPage.loadAndUpdateTasksStats();
      }
      
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
  
  // Функция для инициализации правильных размеров элементов task-item
  function initializeItemSizes() {
    const tasksCard = document.querySelector('.card.tasks-card');
    if (tasksCard && weekTasksContainer) {
      // Ширина карточки с заданиями
      const cardWidth = tasksCard.offsetWidth;
      console.log('Initialize Weekly tasks sizes: Card width =', cardWidth);
      
      // Получаем все элементы task-item и устанавливаем им ширину
      const taskItems = weekTasksContainer.querySelectorAll('.task-item');
      taskItems.forEach(item => {
        // Устанавливаем ширину на 20px меньше, чем ширина карточки (по 10px с каждой стороны)
        item.style.width = (cardWidth - 20) + 'px';
      });
    }
  }

  // Обработчик изменения размеров окна
  window.addEventListener('resize', function() {
    initializeItemSizes();
  });
  
  // Инициализация страницы
  window.weeklyLoadTasks = loadTasks;
  window.loadTasks = loadTasks;
  
  // Загружаем задания при загрузке страницы
  loadTasks();
  
  // Инициализируем свайпы
  initSwipeGestures();
});
