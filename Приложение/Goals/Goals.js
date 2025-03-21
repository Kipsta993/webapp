/**
 * JavaScript для страницы Goals
 * Обеспечивает функциональность добавления, удаления и сортировки целей
 * Включает календарь в модальном окне для выбора даты
 */

document.addEventListener('DOMContentLoaded', function() {
  // Инициализация хранилища целей
  let goals = JSON.parse(localStorage.getItem('goals')) || [];
  let currentSort = 'newest'; // По умолчанию сортировка по новизне

  // Получение элементов DOM
  const goalForm = document.getElementById('add-goal-form');
  const goalsList = document.getElementById('goals-list');
  const goalTitle = document.getElementById('goal-title');
  const goalDeadline = document.getElementById('goal-deadline');
  const sortNewest = document.getElementById('goals-sort-newest');
  const sortOldest = document.getElementById('goals-sort-oldest');
  const emptyList = document.getElementById('goals-empty-list');
  
  // Элементы календаря
  const dateDisplayButton = document.getElementById('date-display-button');
  const selectedDateText = document.getElementById('selected-date');
  const calendarModal = document.getElementById('calendar-modal');
  const calendarClose = document.getElementById('calendar-close');
  const daysGrid = document.getElementById('days-grid');
  const currentMonthDisplay = document.querySelector('.current-month');
  const prevMonthBtn = document.querySelector('.prev-month');
  const nextMonthBtn = document.querySelector('.next-month');
  const clearDateBtn = document.getElementById('clear-date');
  
  // Текущая дата и выбранная дата
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let currentMonth = today.getMonth();
  let currentYear = today.getFullYear();
  let selectedDate = null;

  // Проверка наличия элементов на странице
  if (!goalForm || !goalsList) return;

  // Функция для генерации уникального ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Функция для форматирования даты
  function formatDate(dateString) {
    if (!dateString) return 'Бессрочно';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}.${month}.${year}`;
  }
  
  // Функция для получения названия месяца
  function getMonthName(month) {
    const monthNames = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return monthNames[month];
  }
  
  // Функция для обновления отображения текущего месяца
  function updateCurrentMonth() {
    currentMonthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
  }
  
  // Функция для открытия модального окна с календарем
  function openCalendarModal() {
    calendarModal.classList.add('active');
    document.body.classList.add('modal-open');
    generateCalendar();
  }
  
  // Функция для закрытия модального окна с календарем
  function closeCalendarModal() {
    calendarModal.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
  
  // Функция для генерации календаря
  function generateCalendar() {
    daysGrid.innerHTML = '';
    
    // Получаем первый день месяца
    const firstDay = new Date(currentYear, currentMonth, 1);
    // Получаем последний день месяца
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    // Получаем день недели первого дня (0 - воскресенье, 1 - понедельник, и т.д.)
    let firstDayOfWeek = firstDay.getDay();
    // Преобразуем для недели, начинающейся с понедельника
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Получаем последний день предыдущего месяца
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    
    // Добавляем дни предыдущего месяца
    for (let i = 0; i < firstDayOfWeek; i++) {
      const day = prevMonthLastDay - firstDayOfWeek + i + 1;
      const dayElement = document.createElement('div');
      dayElement.className = 'day other-month disabled';
      dayElement.textContent = day;
      daysGrid.appendChild(dayElement);
    }
    
    // Добавляем дни текущего месяца
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'day';
      dayElement.textContent = i;
      
      // Проверяем, является ли день сегодняшним
      const currentDate = new Date(currentYear, currentMonth, i);
      if (currentDate.toDateString() === today.toDateString()) {
        dayElement.classList.add('today');
      }
      
      // Проверяем, является ли день выбранным
      if (selectedDate && 
          currentDate.getDate() === selectedDate.getDate() && 
          currentDate.getMonth() === selectedDate.getMonth() && 
          currentDate.getFullYear() === selectedDate.getFullYear()) {
        dayElement.classList.add('selected');
      }
      
      // Проверяем, является ли день прошедшим
      if (currentDate < today) {
        dayElement.classList.add('disabled');
      } else {
        // Добавляем обработчик события для выбора дня
        dayElement.addEventListener('click', function() {
          selectDate(new Date(currentYear, currentMonth, i));
        });
      }
      
      daysGrid.appendChild(dayElement);
    }
    
    // Определяем количество ячеек, которые нужно добавить для следующего месяца
    const remainingCells = 42 - (firstDayOfWeek + lastDay.getDate());
    
    // Добавляем дни следующего месяца
    for (let i = 1; i <= remainingCells; i++) {
      const dayElement = document.createElement('div');
      dayElement.className = 'day other-month disabled';
      dayElement.textContent = i;
      daysGrid.appendChild(dayElement);
    }
  }
  
  // Функция для выбора даты
  function selectDate(date) {
    selectedDate = date;
    
    // Обновляем отображение выбранной даты
    selectedDateText.textContent = formatDate(date.toISOString());
    
    // Устанавливаем значение скрытого поля
    goalDeadline.value = date.toISOString().split('T')[0];
    
    // Закрываем модальное окно
    closeCalendarModal();
    
    // Обновляем календарь
    generateCalendar();
  }

  // Функция для очистки выбранной даты
  function clearDate(event) {
    // Предотвращаем всплытие события, чтобы не открывался календарь
    event.stopPropagation();
    
    selectedDate = null;
    selectedDateText.textContent = 'Выберите срок';
    goalDeadline.value = '';
  }

  // Функция для добавления новой цели
  function addGoal(event) {
    event.preventDefault();
    
    // Получаем элемент сообщения об ошибке
    const titleError = document.getElementById('goal-title-error');
    
    // Сбрасываем предыдущие ошибки
    goalTitle.classList.remove('error');
    titleError.classList.remove('active');
    titleError.textContent = '';
    
    const title = goalTitle.value.trim();
    if (!title) {
      // Показываем красивое уведомление об ошибке
      goalTitle.classList.add('error');
      titleError.textContent = 'Пожалуйста, введите название цели';
      titleError.classList.add('active');
      
      // Фокусируемся на поле с ошибкой
      goalTitle.focus();
      return;
    }
    
    const deadline = goalDeadline.value;
    
    const newGoal = {
      id: generateId(),
      title: title,
      deadline: deadline,
      completed: false,
      createdAt: new Date().toISOString()
    };
    
    goals.unshift(newGoal);
    saveGoals();
    renderGoals();
    
    // Сброс формы
    goalTitle.value = '';
    goalDeadline.value = '';
    selectedDate = null;
    selectedDateText.textContent = 'Выберите срок';
  }

  // Функция для удаления цели
  function deleteGoal(id) {
    goals = goals.filter(goal => goal.id !== id);
    saveGoals();
    renderGoals();
    
    // Увеличиваем счетчик удаленных целей
    const deletedGoalsCount = parseInt(localStorage.getItem('deletedGoalsCount') || '0') + 1;
    localStorage.setItem('deletedGoalsCount', deletedGoalsCount);
    
    // Обновляем статистику, если Stats доступен
    if (window.StatsPage && typeof window.StatsPage.loadGoalsStats === 'function') {
      window.StatsPage.loadGoalsStats();
    }
  }

  // Функция для переключения статуса выполнения цели
  function toggleGoalStatus(id) {
    const goal = goals.find(goal => goal.id === id);
    if (goal) {
      goal.completed = !goal.completed;
      saveGoals();
      renderGoals();
      
      // Обновляем статистику, если Stats доступен
      if (window.StatsPage && typeof window.StatsPage.loadGoalsStats === 'function') {
        window.StatsPage.loadGoalsStats();
      }
    }
  }

  // Функция для сохранения целей в localStorage
  function saveGoals() {
    localStorage.setItem('goals', JSON.stringify(goals));
  }

  // Функция для сортировки целей
  function sortGoals() {
    if (currentSort === 'newest') {
      goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      goals.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  }

  // Функция для отображения целей
  function renderGoals() {
    sortGoals();
    
    // Очистка списка
    goalsList.innerHTML = '';
    
    // Проверка на пустой список
    if (goals.length === 0) {
      emptyList.style.display = 'block';
      goalsList.style.display = 'none';
      return;
    }
    
    emptyList.style.display = 'none';
    goalsList.style.display = 'block';
    
    // Отображение целей
    goals.forEach(goal => {
      const goalItem = document.createElement('div');
      goalItem.className = `goal-item${goal.completed ? ' completed' : ''}`;
      goalItem.dataset.id = goal.id;
      
      goalItem.innerHTML = `
        <div class="goal-checkbox">
          <input type="checkbox" id="goal-${goal.id}" ${goal.completed ? 'checked' : ''}>
          <label for="goal-${goal.id}"></label>
        </div>
        <div class="goal-content">
          <div class="goal-title">${goal.title}</div>
          <div class="goal-deadline">${formatDate(goal.deadline)}</div>
        </div>
        <div class="goal-actions">
          <button class="goal-delete" aria-label="Удалить цель">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
      
      // Добавление обработчиков событий
      const checkbox = goalItem.querySelector('input[type="checkbox"]');
      checkbox.addEventListener('change', () => toggleGoalStatus(goal.id));
      
      const deleteBtn = goalItem.querySelector('.goal-delete');
      deleteBtn.addEventListener('click', () => deleteGoal(goal.id));
      
      goalsList.appendChild(goalItem);
    });
  }

  // Инициализация календаря
  function initCalendar() {
    // Обработчик для открытия модального окна с календарем
    dateDisplayButton.addEventListener('click', openCalendarModal);
    
    // Обработчик для закрытия модального окна с календарем
    calendarClose.addEventListener('click', closeCalendarModal);
    
    // Закрытие модального окна при клике на фон
    calendarModal.addEventListener('click', function(event) {
      if (event.target === calendarModal) {
        closeCalendarModal();
      }
    });
    
    // Обработчики для навигации по месяцам
    prevMonthBtn.addEventListener('click', function() {
      currentMonth--;
      if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
      }
      updateCurrentMonth();
      generateCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
      currentMonth++;
      if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
      }
      updateCurrentMonth();
      generateCalendar();
    });
    
    // Обработчик для кнопки очистки даты
    clearDateBtn.addEventListener('click', clearDate);
    
    // Инициализация текущего месяца
    updateCurrentMonth();
  }

  // Обработчики событий
  goalForm.addEventListener('submit', addGoal);
  
  sortNewest.addEventListener('click', function() {
    currentSort = 'newest';
    sortNewest.classList.add('active');
    sortOldest.classList.remove('active');
    renderGoals();
  });
  
  sortOldest.addEventListener('click', function() {
    currentSort = 'oldest';
    sortOldest.classList.add('active');
    sortNewest.classList.remove('active');
    renderGoals();
  });

  // Инициализация
  initCalendar();
  renderGoals();
});
