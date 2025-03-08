document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных целей
    loadGoals();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Инициализация обработчиков событий
    initializeEventListeners();
    
    // Инициализация навигации со стрелочкой
    initializeNavigation();
    
    // Загрузка общих данных (серия дней)
    loadCommonData();
});

// Инициализация обработчиков событий
function initializeEventListeners() {
    // Обработчики для кнопок добавления цели
    const addButtons = document.querySelectorAll('.add-goal');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            showGoalModal('add');
        });
    });
    
    // Обработчики для кнопок действий с целями
    const actionButtons = document.querySelectorAll('.goal-actions');
    actionButtons.forEach(button => {
        button.addEventListener('click', function(event) {
            event.stopPropagation();
            const goalItem = this.closest('.goal-item');
            const goalId = goalItem.dataset.id;
            showGoalContextMenu(goalId, event);
        });
    });
    
    // Обработчик для элементов цели (открытие для редактирования)
    const goalItems = document.querySelectorAll('.goal-item');
    goalItems.forEach(item => {
        item.addEventListener('click', function() {
            const goalId = this.dataset.id;
            showGoalModal('edit', goalId);
        });
    });
    
    // Обработчик для закрытия модального окна
    const closeButton = document.querySelector('.close-button');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            hideGoalModal();
        });
    }
    
    // Обработчик для формы добавления/редактирования цели
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        goalForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveGoal();
        });
    }
    
    // Обработчик для слайдера прогресса
    const progressSlider = document.getElementById('goal-progress');
    const progressValue = document.getElementById('progress-value');
    if (progressSlider && progressValue) {
        progressSlider.addEventListener('input', function() {
            progressValue.textContent = this.value + '%';
        });
    }
}

// Функция для инициализации навигации
function initializeNavigation() {
    // Установка активного класса для текущей страницы в навигации
    const currentPage = 'goals'; // Текущая страница - goals
    
    // Находим все ссылки в нижней навигации
    const navLinks = document.querySelectorAll('.bottom-nav a');
    navLinks.forEach(link => {
        // Удаляем класс active со всех ссылок
        link.classList.remove('active');
        
        // Проверяем, содержит ли href текущую страницу
        if (link.getAttribute('href').includes(currentPage)) {
            link.classList.add('active');
        }
    });
    
    // Инициализация стрелки и всплывающего меню
    initializePopupMenu();
}

// Функция для инициализации всплывающего меню
function initializePopupMenu() {
    const navArrow = document.querySelector('.nav-arrow');
    const popupMenu = document.querySelector('.popup-menu');
    
    if (navArrow && popupMenu) {
        // Обработчик клика по стрелке
        navArrow.addEventListener('click', function() {
            this.classList.toggle('active');
            popupMenu.classList.toggle('active');
        });
        
        // Обработчик клика вне меню для его закрытия
        document.addEventListener('click', function(event) {
            if (popupMenu.classList.contains('active')) {
                // Если клик был не по меню и не по стрелке
                if (!popupMenu.contains(event.target) && !navArrow.contains(event.target)) {
                    popupMenu.classList.remove('active');
                    navArrow.classList.remove('active');
                }
            }
        });
    }
}

// Загрузка сохраненных целей
function loadGoals() {
    // Получаем сохраненные цели из localStorage
    const savedGoals = localStorage.getItem('goals');
    let goals = [];
    
    if (savedGoals) {
        try {
            goals = JSON.parse(savedGoals);
        } catch (error) {
            console.error('Ошибка при загрузке целей:', error);
        }
    }
    
    // Если целей нет, используем демо-данные
    if (!goals || goals.length === 0) {
        goals = getDemoGoals();
        localStorage.setItem('goals', JSON.stringify(goals));
    }
    
    // Отображаем цели на странице
    displayGoals(goals);
}

// Получение демо-данных для целей
function getDemoGoals() {
    return [
        {
            id: 'goal1',
            title: 'Выучить JavaScript',
            date: '2023-12-31',
            type: 'long-term',
            progress: 65
        },
        {
            id: 'goal2',
            title: 'Прочитать 20 книг',
            date: '2023-12-31',
            type: 'long-term',
            progress: 40
        },
        {
            id: 'goal3',
            title: 'Завершить курс по React',
            date: '2023-09-30',
            type: 'short-term',
            progress: 80
        }
    ];
}

// Отображение целей на странице
function displayGoals(goals) {
    // Очищаем списки целей
    const longTermList = document.querySelector('.goals-section:nth-child(1) .goals-list');
    const shortTermList = document.querySelector('.goals-section:nth-child(2) .goals-list');
    
    if (longTermList) {
        longTermList.innerHTML = '';
    }
    
    if (shortTermList) {
        shortTermList.innerHTML = '';
    }
    
    // Отображаем цели в соответствующих разделах
    goals.forEach(goal => {
        const goalElement = createGoalElement(goal);
        
        if (goal.type === 'long-term' && longTermList) {
            longTermList.appendChild(goalElement);
        } else if (goal.type === 'short-term' && shortTermList) {
            shortTermList.appendChild(goalElement);
        }
    });
}

// Создание элемента цели
function createGoalElement(goal) {
    const goalElement = document.createElement('div');
    goalElement.className = 'goal-item';
    goalElement.dataset.id = goal.id;
    
    // Форматируем дату
    const dateObj = new Date(goal.date);
    const formattedDate = `До ${dateObj.getDate()} ${getMonthName(dateObj.getMonth())} ${dateObj.getFullYear()}`;
    
    goalElement.innerHTML = `
        <div class="goal-info">
            <h3>${goal.title}</h3>
            <div class="goal-date">${formattedDate}</div>
            <div class="goal-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%;"></div>
                </div>
                <div class="progress-text">${goal.progress}%</div>
            </div>
        </div>
        <div class="goal-actions">
            <i class="fas fa-ellipsis-v"></i>
        </div>
    `;
    
    return goalElement;
}

// Получение названия месяца
function getMonthName(monthIndex) {
    const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
    ];
    return months[monthIndex];
}

// Показать модальное окно для добавления/редактирования цели
function showGoalModal(mode, goalId) {
    const modal = document.getElementById('goal-modal');
    const modalTitle = modal.querySelector('.modal-header h2');
    const form = document.getElementById('goal-form');
    
    // Очищаем форму
    form.reset();
    
    if (mode === 'edit' && goalId) {
        // Режим редактирования
        modalTitle.textContent = 'Редактировать цель';
        
        // Загружаем данные цели
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        const goal = goals.find(g => g.id === goalId);
        
        if (goal) {
            document.getElementById('goal-title').value = goal.title;
            document.getElementById('goal-date').value = goal.date;
            document.getElementById('goal-type').value = goal.type;
            document.getElementById('goal-progress').value = goal.progress;
            document.getElementById('progress-value').textContent = goal.progress + '%';
            
            // Сохраняем ID редактируемой цели
            form.dataset.goalId = goalId;
        }
    } else {
        // Режим добавления
        modalTitle.textContent = 'Добавить цель';
        delete form.dataset.goalId;
    }
    
    // Показываем модальное окно
    modal.style.display = 'flex';
}

// Скрыть модальное окно
function hideGoalModal() {
    const modal = document.getElementById('goal-modal');
    modal.style.display = 'none';
}

// Сохранить цель
function saveGoal() {
    const form = document.getElementById('goal-form');
    const title = document.getElementById('goal-title').value;
    const date = document.getElementById('goal-date').value;
    const type = document.getElementById('goal-type').value;
    const progress = parseInt(document.getElementById('goal-progress').value);
    
    // Получаем сохраненные цели
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    if (form.dataset.goalId) {
        // Редактирование существующей цели
        const goalIndex = goals.findIndex(g => g.id === form.dataset.goalId);
        
        if (goalIndex !== -1) {
            goals[goalIndex] = {
                id: form.dataset.goalId,
                title,
                date,
                type,
                progress
            };
        }
    } else {
        // Добавление новой цели
        const newGoal = {
            id: 'goal' + Date.now(),
            title,
            date,
            type,
            progress
        };
        
        goals.push(newGoal);
    }
    
    // Сохраняем обновленные цели
    localStorage.setItem('goals', JSON.stringify(goals));
    
    // Обновляем отображение
    displayGoals(goals);
    
    // Скрываем модальное окно
    hideGoalModal();
}

// Показать контекстное меню для цели
function showGoalContextMenu(goalId, event) {
    // Здесь можно реализовать контекстное меню для действий с целью
    // Например, редактирование, удаление и т.д.
    console.log('Показать контекстное меню для цели:', goalId);
    
    // Для простоты сейчас просто открываем модальное окно редактирования
    showGoalModal('edit', goalId);
}

// Загрузка общих данных (серия дней)
function loadCommonData() {
    // Загружаем серию дней из localStorage
    const streakCount = localStorage.getItem('streakCount');
    
    if (streakCount) {
        document.getElementById('streak-count').textContent = streakCount;
    }
}

// Применение сохраненной темы
function applyTheme() {
    const darkTheme = localStorage.getItem('darkTheme') === 'true';
    
    if (darkTheme) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
} 