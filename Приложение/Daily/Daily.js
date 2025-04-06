/**
 * JavaScript для страницы Daily
 * Обеспечивает функциональность отображения и выполнения ежедневных заданий
 */

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы DOM
  const dayTasksContainer = document.querySelector('.day-tasks');
  const nextTaskContainer = document.querySelector('.next-task');
  const dailyCardTitle = document.querySelector('.daily-card-title');
  
  // Инициализация правильных размеров для элементов
  initializeItemSizes();
  
  // Переменные для пагинации
  let currentPage = 1;
  let totalPages = 1;
  let tasksPerPage = 3;
  let allTasks = [];
  
  // Добавляем переменную для хранения названий страниц
  let pageNames = JSON.parse(localStorage.getItem('daily-page-names')) || {};
  
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
  }
  
  // Функция для обновления индикатора страниц
  function updatePageIndicator() {
    // Находим все заголовки daily-card-title
    const allTitles = document.querySelectorAll('.daily-card-title');
    let tasksTitleElement = null;
    
    // Ищем заголовок, содержащий текст "Задания на сегодня"
    for (const title of allTitles) {
      if (title.textContent.includes('Задания на сегодня') || title.querySelector('.page-indicator')) {
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
    
    // Используем сохраненное название страницы или дефолтное
    const pageTitleText = pageNames[`page-${currentPage}`] || 'Задания на сегодня';
    
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
    inputElement.style.color = '#2196F3';
    inputElement.style.background = 'transparent';
    inputElement.style.border = '1px solid #2196F3';
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
    const newTitle = inputElement.value.trim() || 'Задания на сегодня';
    
    // Сохраняем новое название в localStorage
    pageNames[`page-${pageNumber}`] = newTitle;
    localStorage.setItem('daily-page-names', JSON.stringify(pageNames));
    
    // Обновляем текстовый элемент
    titleElement.textContent = newTitle;
    
    // Заменяем поле ввода обратно на текстовый элемент
    inputElement.parentNode.replaceChild(titleElement, inputElement);
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
      
      // Если задание уже выполнено, добавляем класс для зачеркивания и отключаем чекбокс
      if (task.completed) {
        const taskTitle = taskItem.querySelector('.task-title');
        if (taskTitle) {
          taskTitle.classList.add('completed');
        }
        checkbox.disabled = true;
      }
      
      dayTasksContainer.appendChild(taskItem);
    }
    
    // Пересчитываем размеры элементов после их создания
    setTimeout(initializeItemSizes, 0);
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
      
      // Обновляем индикатор страниц
      updatePageIndicator();
      
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
  
  // Инициализация страницы
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

  // Функция для инициализации правильных размеров элементов task-item
  function initializeItemSizes() {
    const tasksCard = document.querySelector('.card.tasks-card');
    if (tasksCard && dayTasksContainer) {
      // Ширина карточки с заданиями
      const cardWidth = tasksCard.offsetWidth;
      console.log('Daily tasks container initialized, card width =', cardWidth);
      
      // JavaScript больше не управляет шириной, так как мы используем CSS margin
    }
  }

  // Обработчик изменения размеров окна
  window.addEventListener('resize', function() {
    initializeItemSizes();
  });
});
