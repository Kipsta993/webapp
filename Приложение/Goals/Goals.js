/**
 * JavaScript для страницы Goals
 * Базовая функциональность без визуального оформления
 */

// Инициализация страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded: Инициализация страницы Goals');
    
    // Удаляем флаги подсказок редактирования заголовков из localStorage
    localStorage.removeItem('title-edit-hint-shown');
    localStorage.removeItem('weekly-title-edit-hint-shown');
    
    // Инициализируем страницу целей
    initializeGoalsPage();
    
    // Инициализируем календарь с небольшой задержкой для гарантии загрузки DOM
    console.log('Планируем вызов initializeCalendarDirect с задержкой');
    setTimeout(() => {
        console.log('Вызываем initializeCalendarDirect после задержки');
        initializeCalendarDirect();
    }, 100);
});

// Инициализация страницы целей
function initializeGoalsPage() {
    // Инициализация элементов формы
    const addGoalForm = document.getElementById('add-goal-form');
    const goalTitleInput = document.getElementById('goal-title');
    const goalContentInput = document.getElementById('goal-content');
    const goalsList = document.getElementById('goals-list');
    const emptyList = document.getElementById('empty-list');
    const dateDisplay = document.querySelector('.date-display');
    const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
    const customDatePicker = document.querySelector('.custom-date-picker');
    
    // Инициализация переменных состояния - убираем локальные переменные, используем глобальные
    // Проверяем наличие глобальных переменных, если их нет - создаем
    if (typeof window.selectedDate === 'undefined') {
        window.selectedDate = '';
    }
    if (typeof window.lastDeletedDate === 'undefined') {
        window.lastDeletedDate = null;
    }
    
    // Миграция данных из старого формата, если необходимо
    migrateGoalsData();
    
    let goals = loadGoals();
    let activeSortOption = 'date-desc'; // Сортировка по умолчанию (сначала новые)
    
    // Функция обновления отображения выбранной даты, определяем до ее вызова
    function updateSelectedDateDisplay() {
        console.log(`Обновляем отображение даты: ${window.selectedDate}`);
        const selectedDateElement = document.getElementById('selected-date');
        if (!selectedDateElement) return;
        
        if (window.selectedDate) {
            selectedDateElement.textContent = formatDate(window.selectedDate);
        } else {
            selectedDateElement.textContent = 'Бессрочно';
        }
    }
    
    // Обновление интерфейса при загрузке
    updateSelectedDateDisplay();
    displayGoals();
    
    // Инициализация сортировки
    initializeSorting();
    
    // Обработчик добавления новой цели
    addGoalForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addNewGoal();
    });
    
    // Функция для отображения модального окна с календарем
    function showCalendarModal() {
        calendarModalOverlay.classList.add('active');
        // Сбросим текущую дату в календаре на текущий месяц
        const calendarCurrentDate = new Date();
        
        // Проверяем, инициализирован ли календарь
        if (typeof updateCalendarDates === 'function') {
            // Вызываем функцию обновления дат календаря с текущей датой
            updateCalendarDates(calendarCurrentDate);
        } else {
            console.log('Календарь уже инициализирован, просто открываем его');
            // Здесь мы больше не вызываем initializeCalendar(), так как это дублирование
        }
        
        // Добавим класс для открытия модального окна
        document.body.classList.add('modal-open');
    }
    
    // Обработчик для выбора даты
    if (dateDisplay) {
    dateDisplay.addEventListener('click', function() {
        showCalendarModal();
    });
    }
    
    // Добавление обработчиков свайпа для даты
    if (customDatePicker) {
        let startX = 0;
        let currentX = 0;
        
        // Обработчики для сенсорных устройств
        customDatePicker.addEventListener('touchstart', function(e) {
            startX = e.touches[0].clientX;
        }, { passive: true });
        
        customDatePicker.addEventListener('touchmove', function(e) {
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            // Ограничиваем смещение до 30px в каждую сторону
            const translateX = Math.min(Math.max(diffX, -30), 30);
            customDatePicker.style.transform = `translateX(${translateX}px)`;
        }, { passive: true });
        
        customDatePicker.addEventListener('touchend', function() {
            const diffX = currentX - startX;
            
            if (diffX > 20) {
                // Свайп вправо - удаляем дату
                if (window.selectedDate) {
                    window.lastDeletedDate = window.selectedDate;
                    window.selectedDate = '';
                    updateSelectedDateDisplay();
                }
            } else if (diffX < -20) {
                // Свайп влево - восстанавливаем последнюю удалённую дату
                if (window.lastDeletedDate) {
                    window.selectedDate = window.lastDeletedDate;
                    window.lastDeletedDate = null;
        updateSelectedDateDisplay();
                }
            }
            
            // В любом случае возвращаем элемент на место
            customDatePicker.style.transform = 'translateX(0px)';
        }, { passive: true });
        
        // Обработчики для мышки (опционально)
        let isDragging = false;
        
        customDatePicker.addEventListener('mousedown', function(e) {
            isDragging = true;
            startX = e.clientX;
            customDatePicker.style.cursor = 'grabbing';
        });
        
        document.addEventListener('mousemove', function(e) {
            if (!isDragging) return;
            
            currentX = e.clientX;
            const diffX = currentX - startX;
            
            // Ограничиваем смещение до 30px в каждую сторону
            const translateX = Math.min(Math.max(diffX, -30), 30);
            customDatePicker.style.transform = `translateX(${translateX}px)`;
        });
        
        document.addEventListener('mouseup', function(e) {
            if (isDragging) {
                const diffX = currentX - startX;
                
                if (diffX > 20) {
                    // Свайп вправо - удаляем дату
                    if (window.selectedDate) {
                        window.lastDeletedDate = window.selectedDate;
                        window.selectedDate = '';
                        updateSelectedDateDisplay();
                    }
                } else if (diffX < -20) {
                    // Свайп влево - восстанавливаем последнюю удалённую дату
                    if (window.lastDeletedDate) {
                        window.selectedDate = window.lastDeletedDate;
                        window.lastDeletedDate = null;
        updateSelectedDateDisplay();
                    }
                }
                
                isDragging = false;
                customDatePicker.style.cursor = '';
                // Возвращаем элемент на место
                customDatePicker.style.transform = 'translateX(0px)';
            }
        });
    }
    
    // Инициализация модальных окон для просмотра целей
    initializeGoalModal();
    
    // Функция добавления новой цели
    function addNewGoal() {
        const title = goalTitleInput.value.trim();
        const content = goalContentInput.value.trim();
        const titleError = document.getElementById('title-error');
        const contentError = document.getElementById('content-error');
        
        // Сбрасываем предыдущие ошибки
        goalTitleInput.classList.remove('error');
        goalContentInput.classList.remove('error');
        if (titleError) titleError.classList.remove('active');
        if (contentError) contentError.classList.remove('active');
        if (titleError) titleError.textContent = '';
        if (contentError) contentError.textContent = '';
        
        // Проверка ввода только для заголовка
        let hasError = false;
        
        if (!title) {
            // Показываем стилизованное уведомление об ошибке для заголовка
            goalTitleInput.classList.add('error');
            if (titleError) {
                titleError.textContent = 'Пожалуйста, введите название цели';
                titleError.classList.add('active');
            }
            hasError = true;
        }
        
        if (hasError) {
            // Фокусируемся на поле с ошибкой
            goalTitleInput.focus();
            return;
        }
        
        console.log('Создаем цель с датой:', window.selectedDate);
        
        // Создание новой цели
        const newGoal = {
            id: generateId(),
            title: title,
            content: content || '', // Если описание не заполнено, сохраняем пустую строку
            date: window.selectedDate || '', // Используем глобальную переменную
            timestamp: new Date().getTime(),
            completed: false, // Статус выполнения
            createdAt: new Date().toISOString()
        };
        
        // Добавление цели и обновление интерфейса
        goals.unshift(newGoal);
        saveGoals(goals);
        displayGoals();
        
        // Очистка формы
        goalTitleInput.value = '';
        goalContentInput.value = '';
        window.selectedDate = ''; // Используем глобальную переменную
        updateSelectedDateDisplay();
    }
    
    // Функция отображения списка целей
    function displayGoals() {
        // Сортировка списка целей
        sortGoals();
        
        // Очистка текущего списка
        goalsList.innerHTML = '';
        
        if (goals.length === 0) {
            // Показать сообщение, если нет целей
            if (emptyList) emptyList.style.display = 'block';
        } else {
            // Скрыть сообщение, если есть цели
            if (emptyList) emptyList.style.display = 'none';
            
            // Отображение каждой цели
            goals.forEach(goal => {
                const goalElement = createGoalElement(goal);
                goalsList.appendChild(goalElement);
            });
        }
    }
    
    // Создание элемента цели для списка
    function createGoalElement(goal) {
        const goalElement = document.createElement('div');
        goalElement.className = 'goal-item';
        goalElement.setAttribute('data-id', goal.id);
        
        const dateDisplay = goal.date ? formatDate(goal.date) : 'Бессрочно';
        const isCompleted = goal.completed; // Проверяем статус выполнения
        
        goalElement.innerHTML = `
            <div class="goal-checkbox">
                <input type="checkbox" id="goal-${goal.id}" ${isCompleted ? 'checked' : ''}>
                <label for="goal-${goal.id}"></label>
            </div>
            <div class="goal-content">
                <div class="goal-title ${isCompleted ? 'completed' : ''}">${escapeHtml(goal.title)}</div>
                <div class="goal-date">${dateDisplay}</div>
            </div>
            <div class="goal-actions">
                <button class="goal-delete" aria-label="Удалить цель">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;
        
        // Добавляем обработчик для просмотра цели в модальном окне
        const goalContent = goalElement.querySelector('.goal-content');
        goalContent.addEventListener('click', function() {
            showGoalModal(goal);
        });
        
        // Добавляем обработчик для удаления цели
        const deleteButton = goalElement.querySelector('.goal-delete');
        deleteButton.addEventListener('click', function(e) {
            e.stopPropagation();
            confirmDeleteGoal(goal.id);
        });
        
        // Добавляем обработчик для изменения статуса цели
        const checkbox = goalElement.querySelector('.goal-checkbox input[type="checkbox"]');
        const titleElement = goalElement.querySelector('.goal-title');
        
        checkbox.addEventListener('change', function(e) {
            e.stopPropagation();
            const isChecked = this.checked;
            toggleGoalStatus(goal.id, isChecked);
            
            // Обновляем стиль заголовка
            if (isChecked) {
                titleElement.classList.add('completed');
            } else {
                titleElement.classList.remove('completed');
            }
        });
        
        return goalElement;
    }
    
    // Функция для показа модального окна с деталями цели
    function showGoalModal(goal) {
        const modalOverlay = document.getElementById('goal-modal-overlay');
        const modalTitle = document.getElementById('goal-modal-title');
        const modalDate = document.getElementById('goal-modal-date');
        const modalContent = document.getElementById('goal-modal-content');
        
        if (!modalOverlay || !modalTitle || !modalDate || !modalContent) return;
        
        // Заполнение модального окна данными
        modalTitle.textContent = goal.title;
        modalDate.textContent = goal.date ? formatDate(goal.date) : 'Бессрочно';
        modalContent.textContent = goal.content || 'Нет описания';
        
        // Показать модальное окно
        modalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // Инициализация модального окна цели
    function initializeGoalModal() {
        const modalOverlay = document.getElementById('goal-modal-overlay');
        const modalClose = document.getElementById('goal-modal-close');
        
        if (!modalOverlay || !modalClose) return;
        
        // Закрытие модального окна
        modalClose.addEventListener('click', function() {
            modalOverlay.classList.remove('active');
            document.body.classList.remove('modal-open');
        });
        
        // Закрытие по клику вне модального окна
        modalOverlay.addEventListener('click', function(e) {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
                document.body.classList.remove('modal-open');
            }
        });
    }
    
    // Функция подтверждения удаления цели
    function confirmDeleteGoal(goalId) {
        if (confirm('Вы уверены, что хотите удалить эту цель?')) {
            deleteGoal(goalId);
        }
    }
    
    // Функция удаления цели
    function deleteGoal(goalId) {
        goals = goals.filter(goal => goal.id !== goalId);
        saveGoals(goals);
        displayGoals();
    }
    
    // Функция изменения статуса цели
    function toggleGoalStatus(goalId, isChecked) {
        const goals = loadGoals();
        const goalIndex = goals.findIndex(goal => goal.id === goalId);
        
        if (goalIndex !== -1) {
            goals[goalIndex].completed = isChecked;
            saveGoals(goals);
        }
    }
    
    // Функция сортировки целей
    function sortGoals() {
        switch (activeSortOption) {
            case 'date-desc': // Новые вверху
                goals.sort((a, b) => new Date(b.date) - new Date(a.date));
                break;
            case 'date-asc': // Старые вверху
                goals.sort((a, b) => new Date(a.date) - new Date(b.date));
                break;
            case 'alpha-asc': // По алфавиту (А-Я)
                goals.sort((a, b) => a.title.localeCompare(b.title));
                break;
            case 'alpha-desc': // По алфавиту (Я-А)
                goals.sort((a, b) => b.title.localeCompare(a.title));
                break;
        }
    }
    
    // Инициализация сортировки
    function initializeSorting() {
        const sortOptions = document.querySelectorAll('.sort-option');
        
        sortOptions.forEach(option => {
            option.addEventListener('click', function() {
                const sortType = this.getAttribute('data-sort');
                
                // Обновление активной кнопки
                sortOptions.forEach(opt => opt.classList.remove('active'));
                this.classList.add('active');
                
                // Установка активного типа сортировки
                activeSortOption = sortType;
                
                // Обновление списка
                displayGoals();
            });
        });
    }
}

// Функция получения текущей даты в формате YYYY-MM-DD
function getCurrentDate() {
    const now = new Date();
    return formatDateForStorage(now);
}

// Форматирование даты для хранения
function formatDateForStorage(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    return `${year}-${month}-${day}`;
}

// Форматирование даты для отображения
function formatDate(dateString) {
    if (!dateString) return 'Бессрочно';
    
    try {
        const parts = dateString.split('-');
        if (parts.length !== 3) return 'Бессрочно';
        
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        
        if (isNaN(year) || isNaN(month) || isNaN(day)) return 'Бессрочно';
        
        const date = new Date(year, month, day);
        if (date.toString() === 'Invalid Date') return 'Бессрочно';
        
        const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
        return `${day} ${monthNames[month]} ${year}`;
    } catch (e) {
        console.error('Ошибка при форматировании даты:', e);
        return 'Бессрочно';
    }
}

// Получение названия месяца
function getMonthName(monthIndex) {
    const monthNames = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return monthNames[monthIndex];
}

// Сохранение целей в localStorage
function saveGoals(goals) {
    localStorage.setItem('goals', JSON.stringify(goals));
}

// Загрузка целей из localStorage
function loadGoals() {
    const goalsData = localStorage.getItem('goals');
    let goals = [];
    
    if (goalsData) {
        try {
            goals = JSON.parse(goalsData);
            
            // Убедимся, что у всех целей есть поле completed
            goals.forEach(goal => {
                if (typeof goal.completed === 'undefined') {
                    goal.completed = false;
                }
            });
        } catch (e) {
            console.error('Ошибка загрузки целей:', e);
            goals = [];
        }
    }
    
    return goals;
}

// Генерация уникального ID
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

// Экранирование HTML
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Прямая инициализация календаря (новый подход)
function initializeCalendarDirect() {
    console.log('Инициализация календаря напрямую');
    
    // Находим элементы календаря с правильными селекторами
    const calendarModalOverlay = document.getElementById('calendar-modal-overlay');
    const prevMonthButton = document.querySelector('.prev-month');
    const nextMonthButton = document.querySelector('.next-month');
    const dateDisplay = document.querySelector('.date-display');
    const currentMonthDisplay = document.querySelector('.current-month');
    
    // Проверка наличия основных элементов календаря
    if (!calendarModalOverlay) {
        console.error('Не найдено модальное окно календаря');
        return;
    }
    
    // Глобальная переменная для хранения выбранной даты
    window.selectedDate = '';
    window.lastDeletedDate = null;
    
    // Глобальные переменные для отслеживания текущего отображаемого месяца и года
    // Инициализируем их текущей системной датой
    window.displayMonth = new Date().getMonth() + 1; // 1-12
    window.displayYear = new Date().getFullYear();
    
    // Функция обновления отображения выбранной даты, определяем до ее вызова
    function updateSelectedDateDisplay() {
        console.log(`Обновляем отображение даты: ${window.selectedDate}`);
        const selectedDateElement = document.getElementById('selected-date');
        if (!selectedDateElement) return;
        
        if (window.selectedDate) {
            selectedDateElement.textContent = formatDate(window.selectedDate);
        } else {
            selectedDateElement.textContent = 'Бессрочно';
        }
    }
    
    // Открытие календаря при клике на элемент даты
    if (dateDisplay) {
        dateDisplay.addEventListener('click', function() {
            console.log('Клик по элементу выбора даты');
            openCalendar();
        });
    }
    
    // Закрытие по клику вне модального окна
    calendarModalOverlay.addEventListener('click', function(e) {
        if (e.target === calendarModalOverlay) {
            closeCalendar();
        }
    });
    
    // Функция открытия календаря
    function openCalendar() {
        console.log('Открываем календарь');
        
        // При открытии календаря сбрасываем отображаемый месяц и год на текущие системные
        window.displayMonth = new Date().getMonth() + 1; // 1-12
        window.displayYear = new Date().getFullYear();
        
        // При открытии календаря не показываем ранее выбранный день
        // (будет выбран только после явного клика пользователя)
        const selectedDayTemp = window.selectedDate;
        window.selectedDate = ''; // Временно очищаем выбранную дату, чтобы календарь открылся "чистым"
        
        calendarModalOverlay.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Обновляем календарь без выделения выбранного дня
        updateCalendar();
        
        // Возвращаем выбранную дату (она будет применена только при выборе новой даты или закрытии)
        window.selectedDate = selectedDayTemp;
    }
    
    // Функция закрытия календаря
    function closeCalendar() {
        console.log('Закрываем календарь');
        calendarModalOverlay.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // Обновление календаря
    function updateCalendar() {
        console.log('Обновляем календарь');
        
        // Получаем текущую дату для проверки сегодняшнего дня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Используем отслеживаемый месяц и год вместо текущих системных
        const currentMonth = window.displayMonth;
        const currentYear = window.displayYear;
        
        console.log(`Отображаем календарь для месяца: ${currentMonth}, года: ${currentYear}`);
        
        // Обновляем заголовок месяца
        const currentMonthDisplay = document.querySelector('.current-month');
        if (currentMonthDisplay) {
            const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
            currentMonthDisplay.textContent = `${monthNames[currentMonth - 1]} ${currentYear}`;
            console.log(`Заголовок месяца обновлен на ${monthNames[currentMonth - 1]} ${currentYear}`);
        } else {
            console.error('Не найден элемент для отображения текущего месяца');
        }
        
        // Вычисляем предыдущий и следующий месяц
        const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
        const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
        
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;
        
        // Получаем контейнер для дней календаря
        let daysGrid = document.getElementById('days-grid');
        if (!daysGrid) {
            console.error('Не найден контейнер для дней календаря с id="days-grid"');
            
            // Пытаемся найти родительский элемент для создания контейнера дней
            const calendarContainer = document.querySelector('.calendar-container');
            if (calendarContainer) {
                console.log('Найден контейнер календаря, создаем контейнер для дней');
                
                // Создаем новый контейнер для дней, если не нашли существующий
                const newDaysGrid = document.createElement('div');
                newDaysGrid.id = 'days-grid';
                newDaysGrid.className = 'days-grid';
                
                // Добавляем после блока с названиями дней недели
                const weekdays = calendarContainer.querySelector('.weekdays');
                if (weekdays) {
                    weekdays.insertAdjacentElement('afterend', newDaysGrid);
                    console.log('Контейнер для дней календаря успешно создан');
                    daysGrid = newDaysGrid;
                } else {
                    console.error('Не найден элемент с днями недели, добавляем в конец контейнера календаря');
                    calendarContainer.appendChild(newDaysGrid);
                    daysGrid = newDaysGrid;
                }
            } else {
                console.error('Не найден контейнер календаря, обновление календаря невозможно');
                return;
            }
        }
        
        console.log('Контейнер для дней календаря:', daysGrid);
        
        // Очищаем сетку дней
        daysGrid.innerHTML = '';
        console.log('Сетка дней очищена');
        
        // Определяем первый день месяца и количество дней
        const firstDay = new Date(currentYear, currentMonth - 1, 1);
        const lastDay = new Date(currentYear, currentMonth, 0);
        const daysInMonth = lastDay.getDate();
        
        // Определяем день недели для первого дня месяца (0 - воскресенье, 1 - понедельник, ...)
        let firstDayOfWeek = firstDay.getDay();
        // Переводим из воскресенья (0) в понедельник (1) для начала недели
        firstDayOfWeek = firstDayOfWeek === 0 ? 7 : firstDayOfWeek;
        
        console.log(`Первый день месяца: ${firstDay}, день недели: ${firstDayOfWeek}`);
        console.log(`Дней в месяце: ${daysInMonth}`);
        
        // Определяем количество дней в предыдущем месяце
        const daysInPrevMonth = new Date(currentYear, currentMonth - 1, 0).getDate();
        console.log(`Дней в предыдущем месяце: ${daysInPrevMonth}`);
        
        // Создаем дни из предыдущего месяца
        for (let i = 1; i < firstDayOfWeek; i++) {
            const dayNumber = daysInPrevMonth - firstDayOfWeek + i + 1;
            const dateStr = `${prevYear}-${prevMonth.toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
            const dayDate = new Date(prevYear, prevMonth - 1, dayNumber);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'day other-month';
            dayElement.textContent = dayNumber;
            dayElement.setAttribute('data-date', dateStr);
            
            // Проверяем, является ли день прошедшим
            if (dayDate < today) {
                // Делаем прошедшие дни неактивными
                dayElement.classList.add('disabled');
            } else {
                // Добавляем обработчик для будущих дат
                dayElement.addEventListener('click', function() {
                    console.log(`Клик по дню ${dayNumber} из предыдущего месяца, дата: ${dateStr}`);
                    selectDate(dateStr);
                });
            }
            
            // Отмечаем сегодняшний день
            if (dayDate.getFullYear() === today.getFullYear() && 
                dayDate.getMonth() === today.getMonth() && 
                dayDate.getDate() === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Отмечаем выбранный день, если он явно выбран
            if (window.selectedDate && window.selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            
            daysGrid.appendChild(dayElement);
        }
        
        console.log('Добавлены дни из предыдущего месяца');
        
        // Создаем дни текущего месяца
        for (let dayNumber = 1; dayNumber <= daysInMonth; dayNumber++) {
            const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
            const dayDate = new Date(currentYear, currentMonth - 1, dayNumber);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = dayNumber;
            dayElement.setAttribute('data-date', dateStr);
            
            // Проверяем, является ли день прошедшим
            if (dayDate < today) {
                // Делаем прошедшие дни неактивными
                dayElement.classList.add('disabled');
            } else {
                // Добавляем обработчик для будущих дат
                dayElement.addEventListener('click', function() {
                    console.log(`Клик по дню ${dayNumber}, дата: ${dateStr}`);
                    selectDate(dateStr);
                });
            }
            
            // Отмечаем сегодняшний день
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() + 1 && 
                dayNumber === today.getDate()) {
                dayElement.classList.add('today');
                console.log('Отмечаем сегодняшний день:', dayNumber);
            }
            
            // Отмечаем выбранный день, если он явно выбран
            if (window.selectedDate && window.selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            
            daysGrid.appendChild(dayElement);
        }
        
        console.log('Добавлены дни текущего месяца');
        
        // Вычисляем количество дней для заполнения сетки (6 строк по 7 дней)
        const totalDays = 42; // 6 рядов по 7 дней
        const daysFromCurrentMonth = firstDayOfWeek - 1 + daysInMonth;
        const daysFromNextMonth = totalDays - daysFromCurrentMonth;
        
        // Создаем дни из следующего месяца
        for (let dayNumber = 1; dayNumber <= daysFromNextMonth; dayNumber++) {
            const dateStr = `${nextYear}-${nextMonth.toString().padStart(2, '0')}-${dayNumber.toString().padStart(2, '0')}`;
            const dayDate = new Date(nextYear, nextMonth - 1, dayNumber);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'day other-month';
            dayElement.textContent = dayNumber;
            dayElement.setAttribute('data-date', dateStr);
            
            // Все дни следующего месяца доступны для выбора
            dayElement.addEventListener('click', function() {
                console.log(`Клик по дню ${dayNumber} из следующего месяца, дата: ${dateStr}`);
                selectDate(dateStr);
            });
            
            // Отмечаем выбранный день, если он явно выбран
            if (window.selectedDate && window.selectedDate === dateStr) {
                dayElement.classList.add('selected');
            }
            
            daysGrid.appendChild(dayElement);
        }
        
        console.log('Добавлены дни следующего месяца');
        console.log('Календарь успешно обновлен. Всего добавлено дней:', daysGrid.children.length);
    }
    
    // Функция выбора даты
    function selectDate(date) {
        console.log(`Выбираем дату: ${date}`);
        
        // Устанавливаем выбранную дату
        window.selectedDate = date;
        
        // Обновляем отображение даты в интерфейсе
        updateSelectedDateDisplay();
        
        // Закрываем календарь
        closeCalendar();
        
        // Если нужно, можно здесь добавить дополнительные действия при выборе даты
        console.log('Дата успешно выбрана:', formatDate(date));
    }
    
    // Добавление обработчиков для кнопок навигации по месяцам
    if (prevMonthButton) {
        prevMonthButton.addEventListener('click', function() {
            console.log('Клик по кнопке предыдущего месяца');
            
            // Переходим к предыдущему месяцу
            if (window.displayMonth === 1) {
                window.displayMonth = 12;
                window.displayYear--;
            } else {
                window.displayMonth--;
            }
            
            console.log(`Переключаемся на месяц: ${window.displayMonth}, год: ${window.displayYear}`);
            
            // Временно скрываем выбранный день
            const selectedDayTemp = window.selectedDate;
            window.selectedDate = '';
            
            // Обновляем календарь без выделения выбранного дня
            updateCalendar();
            
            // Возвращаем выбранную дату
            window.selectedDate = selectedDayTemp;
        });
    }
    
    if (nextMonthButton) {
        nextMonthButton.addEventListener('click', function() {
            console.log('Клик по кнопке следующего месяца');
            
            // Переходим к следующему месяцу
            if (window.displayMonth === 12) {
                window.displayMonth = 1;
                window.displayYear++;
            } else {
                window.displayMonth++;
            }
            
            console.log(`Переключаемся на месяц: ${window.displayMonth}, год: ${window.displayYear}`);
            
            // Временно скрываем выбранный день
            const selectedDayTemp = window.selectedDate;
            window.selectedDate = '';
            
            // Обновляем календарь без выделения выбранного дня
            updateCalendar();
            
            // Возвращаем выбранную дату
            window.selectedDate = selectedDayTemp;
        });
    }
    
    // Делаем функцию updateSelectedDateDisplay доступной глобально
    window.updateSelectedDateDisplay = updateSelectedDateDisplay;
}

// Миграция данных из старого формата, если необходимо
function migrateGoalsData() {
    const goals = loadGoals();
    let needsMigration = false;
    
    // Обновляем структуру данных для обратной совместимости
    goals.forEach(goal => {
        // Заменяем progress на статус completed
        if (typeof goal.completed === 'undefined') {
            // Если есть progress, используем его для определения статуса
            if (typeof goal.progress !== 'undefined') {
                goal.completed = goal.progress >= 100;
                delete goal.progress; // Удаляем устаревшее поле
            } else {
                goal.completed = false;
            }
            needsMigration = true;
        }
    });
    
    if (needsMigration) {
        console.log('Миграция данных целей выполнена');
        saveGoals(goals);
    }
}