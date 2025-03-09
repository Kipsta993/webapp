document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Получение элементов DOM
    const modal = document.getElementById('goal-modal');
    const viewModal = document.getElementById('view-goal-modal');
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const confirmCompleteModal = document.getElementById('confirm-complete-modal');
    const addGoalBtn = document.getElementById('add-goal-btn');
    const closeBtn = document.querySelector('.close-btn');
    const viewCloseBtn = document.querySelector('.view-close-btn');
    const goalForm = document.getElementById('goal-form');
    const goalsContainer = document.getElementById('goals-container');
    const editGoalBtn = document.getElementById('edit-goal-btn');
    const deleteGoalBtn = document.getElementById('delete-goal-btn');
    const completeGoalBtn = document.getElementById('complete-goal-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const confirmCompleteCancelBtn = document.getElementById('confirm-complete-cancel-btn');
    const confirmCompleteBtn = document.getElementById('confirm-complete-btn');
    const editedMark = document.getElementById('edited-mark');
    const deadlineContainer = document.getElementById('deadline-container');
    const deadlineDate = document.getElementById('deadline-date');
    const deadlineNone = document.getElementById('deadline-none');
    
    // Переменная для хранения текущей просматриваемой цели
    let currentGoal = null;
    
    // Переменная для отслеживания режима редактирования
    let isEditMode = false;
    
    // Загрузка целей из localStorage
    loadGoals();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Инициализация фильтра при загрузке страницы
    initFilter();
    
    // Обработчики событий
    setupEventListeners();
    
    // Функция для настройки обработчиков событий
    function setupEventListeners() {
        addGoalBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            // Сброс формы
            goalForm.reset();
            // По умолчанию выбираем опцию с датой
            deadlineDate.checked = true;
            deadlineNone.checked = false;
            deadlineContainer.style.display = 'block';
            // Сбрасываем режим редактирования
            isEditMode = false;
        });
        
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        viewCloseBtn.addEventListener('click', function() {
            viewModal.style.display = 'none';
        });
        
        // Закрытие модальных окон при клике вне их содержимого
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
            if (event.target === viewModal) {
                viewModal.style.display = 'none';
            }
            if (event.target === confirmDeleteModal) {
                confirmDeleteModal.style.display = 'none';
            }
            if (event.target === confirmCompleteModal) {
                confirmCompleteModal.style.display = 'none';
            }
        });
        
        // Обработчики для переключения типа дедлайна
        deadlineDate.addEventListener('change', function() {
            if (this.checked) {
                deadlineContainer.style.display = 'block';
            }
        });
        
        deadlineNone.addEventListener('change', function() {
            if (this.checked) {
                deadlineContainer.style.display = 'none';
            }
        });
        
        // Обработчик отправки формы
        goalForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const title = document.getElementById('goal-title').value.trim();
            const description = document.getElementById('goal-description').value.trim();
            const hasDeadline = deadlineDate.checked;
            const deadline = hasDeadline ? document.getElementById('goal-deadline').value : null;
            
            if (!title) {
                alert('Пожалуйста, введите название цели');
                return;
            }
            
            if (hasDeadline && !deadline) {
                alert('Пожалуйста, выберите дату выполнения или выберите "Бессрочно"');
                return;
            }
            
            // Создаем объект цели
            const goal = {
                id: isEditMode && currentGoal ? currentGoal.id : Date.now().toString(),
                title: title,
                description: description,
                hasDeadline: hasDeadline,
                deadline: deadline,
                createdAt: isEditMode && currentGoal ? currentGoal.createdAt : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                completed: isEditMode && currentGoal ? currentGoal.completed : false,
                completedAt: isEditMode && currentGoal && currentGoal.completedAt ? currentGoal.completedAt : null,
                edited: isEditMode ? true : false
            };
            
            // Сохраняем цель
            if (isEditMode) {
                updateGoalInStorage(goal);
                
                // Если цель была отредактирована, увеличиваем счетчик
                if (!currentGoal.edited) {
                    incrementEditedGoalsCount();
                }
            } else {
                saveGoalToStorage(goal);
            }
            
            // Закрываем модальное окно
            modal.style.display = 'none';
            
            // Перезагружаем список целей
            loadGoals();
        });
        
        // Обработчик для кнопки редактирования
        editGoalBtn.addEventListener('click', function() {
            if (currentGoal) {
                // Заполняем форму данными текущей цели
                document.getElementById('goal-title').value = currentGoal.title;
                document.getElementById('goal-description').value = currentGoal.description || '';
                
                // Настраиваем переключатель дедлайна
                if (currentGoal.hasDeadline) {
                    deadlineDate.checked = true;
                    deadlineNone.checked = false;
                    document.getElementById('goal-deadline').value = currentGoal.deadline;
                    deadlineContainer.style.display = 'block';
                } else {
                    deadlineDate.checked = false;
                    deadlineNone.checked = true;
                    deadlineContainer.style.display = 'none';
                }
                
                // Включаем режим редактирования
                isEditMode = true;
                
                // Закрываем окно просмотра и открываем окно редактирования
                viewModal.style.display = 'none';
                modal.style.display = 'flex';
            }
        });
        
        // Обработчик для кнопки удаления
        deleteGoalBtn.addEventListener('click', function() {
            if (currentGoal) {
                confirmDeleteModal.style.display = 'flex';
            }
        });
        
        // Обработчик для кнопки выполнения
        completeGoalBtn.addEventListener('click', function() {
            if (currentGoal && !currentGoal.completed) {
                confirmCompleteModal.style.display = 'flex';
            }
        });
        
        // Обработчик для кнопки отмены удаления
        confirmCancelBtn.addEventListener('click', function() {
            confirmDeleteModal.style.display = 'none';
        });
        
        // Обработчик для кнопки подтверждения удаления
        confirmDeleteBtn.addEventListener('click', function() {
            if (currentGoal) {
                deleteGoalFromStorage(currentGoal.id);
                confirmDeleteModal.style.display = 'none';
                viewModal.style.display = 'none';
                loadGoals();
            }
        });
        
        // Обработчик для кнопки отмены выполнения
        confirmCompleteCancelBtn.addEventListener('click', function() {
            confirmCompleteModal.style.display = 'none';
        });
        
        // Обработчик для кнопки подтверждения выполнения
        confirmCompleteBtn.addEventListener('click', function() {
            if (currentGoal) {
                // Отмечаем цель как выполненную
                currentGoal.completed = true;
                currentGoal.completedAt = new Date().toISOString();
                updateGoalInStorage(currentGoal);
                
                // Обновляем интерфейс
                confirmCompleteModal.style.display = 'none';
                viewModal.style.display = 'none';
                loadGoals();
                
                // Увеличиваем счетчик выполненных целей
                incrementCompletedGoalsCount();
            }
        });
        
        // Инициализация фильтра
        const filterToggle = document.querySelector('.filter-toggle');
        const filterDropdown = document.querySelector('.filter-dropdown');
        
        if (filterToggle && filterDropdown) {
            filterToggle.addEventListener('click', function() {
                filterDropdown.classList.toggle('active');
            });
            
            // Закрытие выпадающего списка при клике вне его
            document.addEventListener('click', function(event) {
                if (!event.target.closest('.filter-container')) {
                    filterDropdown.classList.remove('active');
                }
            });
            
            // Обработчики для опций фильтра
            const filterOptions = document.querySelectorAll('.filter-option');
            filterOptions.forEach(option => {
                option.addEventListener('click', function() {
                    const filterValue = this.getAttribute('data-filter');
                    
                    // Обновляем активную опцию
                    filterOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    
                    // Применяем фильтр
                    applyFilter(filterValue);
                    
                    // Закрываем выпадающий список
                    filterDropdown.classList.remove('active');
                    
                    // Сохраняем выбранный фильтр
                    localStorage.setItem('goals_filter', filterValue);
                });
            });
        }
    }
    
    // Функция для загрузки общих данных
    function loadCommonData() {
        // Загрузка и отображение серии дней
        updateStreak();
    }
    
    // Функция для обновления серии дней
    function updateStreak() {
        const streakCount = document.getElementById('streak-count');
        if (streakCount) {
            const streak = localStorage.getItem('streak') || '0';
            streakCount.textContent = streak;
        }
    }
    
    // Функция для сохранения цели в localStorage
    function saveGoalToStorage(goal) {
        // Получаем текущие цели
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        // Добавляем новую цель
        goals.push(goal);
        
        // Сохраняем обновленный список
        localStorage.setItem('goals', JSON.stringify(goals));
        
        // Обновляем статистику
        incrementGoalsCount();
    }
    
    // Функция для загрузки целей из localStorage
    function loadGoals() {
        const goalsContainer = document.getElementById('goals-container');
        if (!goalsContainer) return;
        
        // Очищаем контейнер
        goalsContainer.innerHTML = '';
        
        // Получаем цели из localStorage
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        // Если целей нет, показываем сообщение
        if (goals.length === 0) {
            goalsContainer.innerHTML = '<div class="no-goals">У вас пока нет целей. Нажмите на кнопку "+" чтобы добавить первую цель.</div>';
            return;
        }
        
        // Применяем сохраненный фильтр
        const savedFilter = localStorage.getItem('goals_filter') || 'newest';
        applyFilter(savedFilter);
        
        // Отмечаем активную опцию фильтра
        const filterOptions = document.querySelectorAll('.filter-option');
        filterOptions.forEach(option => {
            if (option.getAttribute('data-filter') === savedFilter) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
        }
    });
}

    // Функция для создания элемента цели
function createGoalElement(goal) {
    const goalElement = document.createElement('div');
    goalElement.className = 'goal-item';
        if (goal.completed) {
            goalElement.classList.add('completed');
        }
        
        // Создаем HTML для дедлайна
        let deadlineHtml = '';
        if (goal.hasDeadline) {
            const deadlineDate = new Date(goal.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const deadlineClass = goal.completed ? 'completed' : 
                                 (deadlineDate < today ? 'urgent' : '');
            
            const deadlineText = goal.completed ? 'Выполнено' : 
                                `Срок: ${formatDate(deadlineDate)}`;
            
            const icon = goal.completed ? '<i class="fas fa-check-circle"></i>' : 
                        (deadlineDate < today ? '<i class="fas fa-exclamation-circle"></i>' : 
                        '<i class="fas fa-calendar-alt"></i>');
            
            deadlineHtml = `<div class="goal-deadline ${deadlineClass}">${icon} ${deadlineText}</div>`;
        } else {
            deadlineHtml = '<div class="goal-deadline"><i class="fas fa-infinity"></i> Бессрочно</div>';
        }
        
        // Создаем превью описания (если есть)
        let descriptionHtml = '';
        if (goal.description && goal.description.trim() !== '') {
            const descriptionPreview = goal.description.length > 100 ? 
                                      goal.description.substring(0, 100) + '...' : 
                                      goal.description;
            descriptionHtml = `<div class="goal-preview">${descriptionPreview}</div>`;
        }
    
    goalElement.innerHTML = `
            <div class="goal-title">${goal.title}</div>
            ${deadlineHtml}
            ${descriptionHtml}
        `;
        
        // Добавляем обработчик клика
        goalElement.addEventListener('click', function() {
            viewGoal(goal);
        });
    
    return goalElement;
}

    // Функция для просмотра цели
    function viewGoal(goal) {
        // Сохраняем текущую цель
        currentGoal = goal;
        
        // Заполняем данные
        document.getElementById('view-goal-title').textContent = goal.title;
        
        // Отображаем описание (если есть)
        const descriptionElement = document.getElementById('view-goal-description');
        if (goal.description && goal.description.trim() !== '') {
            descriptionElement.textContent = goal.description;
            descriptionElement.style.display = 'block';
        } else {
            descriptionElement.textContent = '';
            descriptionElement.style.display = 'block'; // Показываем пустой элемент для отображения "Нет описания"
        }
        
        // Отображаем дедлайн
        const deadlineElement = document.getElementById('view-goal-deadline');
        if (goal.hasDeadline) {
            const deadlineDate = new Date(goal.deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const deadlineClass = goal.completed ? 'completed' : 
                                 (deadlineDate < today ? 'urgent' : '');
            
            const deadlineText = goal.completed ? 'Выполнено' : 
                                `Срок: ${formatDate(deadlineDate)}`;
            
            const icon = goal.completed ? '<i class="fas fa-check-circle"></i>' : 
                        (deadlineDate < today ? '<i class="fas fa-exclamation-circle"></i>' : 
                        '<i class="fas fa-calendar-alt"></i>');
            
            deadlineElement.className = `view-goal-deadline ${deadlineClass}`;
            deadlineElement.innerHTML = `${icon} ${deadlineText}`;
        } else {
            deadlineElement.className = 'view-goal-deadline';
            deadlineElement.innerHTML = '<i class="fas fa-infinity"></i> Бессрочно';
        }
        
        // Отображаем метку редактирования, если цель была отредактирована
        if (goal.edited) {
            editedMark.style.display = 'inline';
        } else {
            editedMark.style.display = 'none';
        }
        
        // Настраиваем кнопку выполнения
        if (goal.completed) {
            completeGoalBtn.style.display = 'none';
    } else {
            completeGoalBtn.style.display = 'flex';
        }
        
        // Открываем модальное окно
        viewModal.style.display = 'flex';
    }
    
    // Функция для форматирования даты
    function formatDate(date) {
        return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    
    // Функция для применения темы
    function applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    }
    
    // Функция для инициализации фильтра
    function initFilter() {
        const filterOptions = document.querySelectorAll('.filter-option');
        const savedFilter = localStorage.getItem('goals_filter') || 'newest';
        
        // Отмечаем активную опцию
        filterOptions.forEach(option => {
            if (option.getAttribute('data-filter') === savedFilter) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Применяем фильтр
        applyFilter(savedFilter);
    }
    
    // Функция для применения фильтра
    function applyFilter(filterValue) {
        const goalsContainer = document.getElementById('goals-container');
        if (!goalsContainer) return;
        
        // Получаем цели из localStorage
        let goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        // Применяем фильтр
        switch (filterValue) {
            case 'newest':
                goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'oldest':
                goals.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'deadline':
                // Сначала сортируем по наличию дедлайна (с дедлайном в начале)
                // Затем по дате дедлайна (ближайшие в начале)
                // Затем по статусу выполнения (невыполненные в начале)
                goals.sort((a, b) => {
                    // Если у обоих есть дедлайн, сравниваем даты
                    if (a.hasDeadline && b.hasDeadline) {
                        // Если одна цель выполнена, а другая нет, невыполненная идет первой
                        if (a.completed !== b.completed) {
                            return a.completed ? 1 : -1;
                        }
                        return new Date(a.deadline) - new Date(b.deadline);
                    }
                    // Если только у одной есть дедлайн, она идет первой
                    return a.hasDeadline ? -1 : (b.hasDeadline ? 1 : 0);
                });
                break;
            default:
                goals.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
        
        // Очищаем контейнер
        goalsContainer.innerHTML = '';
        
        // Добавляем цели в контейнер
        goals.forEach(goal => {
            const goalElement = createGoalElement(goal);
            goalsContainer.appendChild(goalElement);
        });
    }
    
    // Функция для обновления цели в localStorage
    function updateGoalInStorage(updatedGoal) {
        // Получаем текущие цели
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        // Находим индекс обновляемой цели
        const index = goals.findIndex(goal => goal.id === updatedGoal.id);
        
        if (index !== -1) {
            // Обновляем цель
            goals[index] = updatedGoal;
            
            // Сохраняем обновленный список
    localStorage.setItem('goals', JSON.stringify(goals));
        }
    }
    
    // Функция для удаления цели из localStorage
    function deleteGoalFromStorage(goalId) {
        // Получаем текущие цели
        const goals = JSON.parse(localStorage.getItem('goals') || '[]');
        
        // Фильтруем список, исключая удаляемую цель
        const updatedGoals = goals.filter(goal => goal.id !== goalId);
        
        // Сохраняем обновленный список
        localStorage.setItem('goals', JSON.stringify(updatedGoals));
        
        // Увеличиваем счетчик удаленных целей
        incrementDeletedGoalsCount();
    }
    
    // Функция для увеличения счетчика целей
    function incrementGoalsCount() {
        const count = parseInt(localStorage.getItem('goals_count') || '0');
        localStorage.setItem('goals_count', (count + 1).toString());
    }
    
    // Функция для увеличения счетчика отредактированных целей
    function incrementEditedGoalsCount() {
        const count = parseInt(localStorage.getItem('goals_edited_count') || '0');
        localStorage.setItem('goals_edited_count', (count + 1).toString());
    }
    
    // Функция для увеличения счетчика удаленных целей
    function incrementDeletedGoalsCount() {
        const count = parseInt(localStorage.getItem('goals_deleted_count') || '0');
        localStorage.setItem('goals_deleted_count', (count + 1).toString());
    }
    
    // Функция для увеличения счетчика выполненных целей
    function incrementCompletedGoalsCount() {
        const count = parseInt(localStorage.getItem('goals_completed_count') || '0');
        localStorage.setItem('goals_completed_count', (count + 1).toString());
    }
}); 