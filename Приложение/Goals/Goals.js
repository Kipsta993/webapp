/**
 * JavaScript для страницы Goals
 * Обеспечивает функциональность добавления, удаления и сортировки целей
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
  const goalPermanent = document.getElementById('goal-permanent');
  const sortNewest = document.getElementById('goals-sort-newest');
  const sortOldest = document.getElementById('goals-sort-oldest');
  const emptyList = document.getElementById('goals-empty-list');

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

  // Функция для добавления новой цели
  function addGoal(event) {
    event.preventDefault();
    
    const title = goalTitle.value.trim();
    if (!title) return;
    
    const deadline = goalPermanent.checked ? null : goalDeadline.value;
    
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
    goalPermanent.checked = false;
    toggleDeadlineField();
  }

  // Функция для удаления цели
  function deleteGoal(id) {
    goals = goals.filter(goal => goal.id !== id);
    saveGoals();
    renderGoals();
  }

  // Функция для переключения статуса выполнения цели
  function toggleGoalStatus(id) {
    const goal = goals.find(goal => goal.id === id);
    if (goal) {
      goal.completed = !goal.completed;
      saveGoals();
      renderGoals();
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
    
    // Прокрутка к началу
    window.scrollTo(0, 0);
  }

  // Функция для переключения поля дедлайна
  function toggleDeadlineField() {
    goalDeadline.disabled = goalPermanent.checked;
    if (goalPermanent.checked) {
      goalDeadline.value = '';
    }
  }

  // Обработчики событий
  goalForm.addEventListener('submit', addGoal);
  goalPermanent.addEventListener('change', toggleDeadlineField);
  
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
  toggleDeadlineField();
  renderGoals();
});
