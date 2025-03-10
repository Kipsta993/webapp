// Редактор расписания для Daily Tasks

// Глобальные переменные
let isEditingSchedule = false;
let currentDay = null;
let currentScheduleItem = null;

// Инициализация редактора расписания
function initScheduleEditor() {
    console.log('Инициализация редактора расписания...');
    
    // Создаем модальное окно для редактирования расписания
    createScheduleModal();
    
    // Добавляем обработчик клика на кнопку с тремя точками в карточке задания
    const menuButton = document.querySelector('.task-menu i');
    if (menuButton) {
        // Проверяем, существует ли функция showScheduleModal
        if (typeof window.showScheduleModal === 'function') {
            console.log('Используем существующую функцию showScheduleModal');
            // Оставляем существующий обработчик
        } else {
            console.log('Заменяем обработчик на openScheduleModal');
            // Заменяем существующий обработчик на наш
            const newMenuButton = menuButton.cloneNode(true);
            menuButton.parentNode.replaceChild(newMenuButton, menuButton);
            
            newMenuButton.addEventListener('click', function() {
                openScheduleModal();
            });
        }
    }
    
    console.log('Редактор расписания инициализирован');
}

// Создание модального окна для редактирования расписания
function createScheduleModal() {
    // Проверяем, существует ли уже модальное окно
    let modal = document.getElementById('schedule-modal');
    if (modal) return;
    
    modal = document.createElement('div');
    modal.id = 'schedule-modal';
    modal.className = 'schedule-modal';
    
    // Создаем базовую структуру модального окна
    modal.innerHTML = `
        <div class="schedule-modal-content">
            <div class="schedule-modal-header">
                <div class="day-navigation">
                    <button id="prev-day" class="nav-button"><i class="fas fa-chevron-left"></i></button>
                    <h2 id="current-day">ПОНЕДЕЛЬНИК</h2>
                    <button id="next-day" class="nav-button"><i class="fas fa-chevron-right"></i></button>
                </div>
                <button class="schedule-close-button">&times;</button>
            </div>
            <div class="schedule-modal-body">
                <div class="day-schedule"></div>
                <div class="schedule-actions">
                    <button class="edit-schedule-btn">
                        <i class="fas fa-edit"></i> Редактировать
                    </button>
                    <button class="add-schedule-btn">
                        <i class="fas fa-plus"></i> Добавить
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Добавляем обработчики событий
    const closeButton = modal.querySelector('.schedule-close-button');
    const prevDayButton = modal.querySelector('#prev-day');
    const nextDayButton = modal.querySelector('#next-day');
    const editButton = modal.querySelector('.edit-schedule-btn');
    const addButton = modal.querySelector('.add-schedule-btn');
    
    closeButton.addEventListener('click', closeScheduleModal);
    prevDayButton.addEventListener('click', () => navigateDay('prev'));
    nextDayButton.addEventListener('click', () => navigateDay('next'));
    editButton.addEventListener('click', toggleEditingSchedule);
    addButton.addEventListener('click', addScheduleItem);
    
    // Закрытие модального окна при клике вне его содержимого
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeScheduleModal();
        }
    });
}

// Открытие модального окна редактирования расписания
function openScheduleModal(day = null) {
    // Если день не указан, используем текущий день
    if (!day) {
        const now = new Date();
        const days = ["ВОСКРЕСЕНЬЕ", "ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
        day = days[now.getDay()];
    }
    
    currentDay = day;
    
    // Обновляем заголовок с текущим днем
    const dayTitle = document.querySelector('#current-day');
    if (dayTitle) {
        dayTitle.textContent = currentDay;
    }
    
    // Загружаем расписание для выбранного дня
    loadDaySchedule(currentDay);
    
    // Отображаем модальное окно
    const modal = document.getElementById('schedule-modal');
    if (modal) {
        modal.classList.add('active');
    }
}

// Закрытие модального окна редактирования расписания
function closeScheduleModal() {
    const modal = document.getElementById('schedule-modal');
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Выходим из режима редактирования при закрытии
    if (isEditingSchedule) {
        toggleEditingSchedule();
    }
}

// Переключение между днями недели
function navigateDay(direction) {
    const days = ["ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА", "ВОСКРЕСЕНЬЕ"];
    let currentIndex = days.indexOf(currentDay);
    
    if (direction === 'prev') {
        currentIndex = (currentIndex - 1 + days.length) % days.length;
    } else {
        currentIndex = (currentIndex + 1) % days.length;
    }
    
    currentDay = days[currentIndex];
    
    // Обновляем заголовок с текущим днем
    const dayTitle = document.querySelector('#current-day');
    if (dayTitle) {
        dayTitle.textContent = currentDay;
    }
    
    // Загружаем расписание для выбранного дня с анимацией
    loadDaySchedule(currentDay, direction === 'prev' ? 'right' : 'left');
}

// Загрузка расписания для выбранного дня
function loadDaySchedule(day, direction = null) {
    // Получаем расписание из localStorage или используем дефолтное
    const savedSchedule = localStorage.getItem('weeklySchedule');
    let weeklySchedule = {};
    
    if (savedSchedule) {
        weeklySchedule = JSON.parse(savedSchedule);
    } else {
        // Используем глобальное расписание из Daily.js, если оно доступно
        if (window.weeklySchedule) {
            weeklySchedule = window.weeklySchedule;
        } else {
            // Если глобальное расписание недоступно, используем базовое расписание
            weeklySchedule = {
                "ПОНЕДЕЛЬНИК": [
                    { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
                    { start: "07:30", end: "07:40", title: "Прыгание на скакалке" },
                    { start: "07:40", end: "07:50", title: "Завтрак" },
                    { start: "08:00", end: "13:50", title: "Учеба" },
                    { start: "14:10", end: "14:40", title: "Обед" },
                    { start: "14:40", end: "14:50", title: "Отдых" },
                    { start: "14:50", end: "15:00", title: "Дорога до секции футбола" },
                    { start: "15:00", end: "16:30", title: "Секция по футболу" },
                    { start: "16:30", end: "16:40", title: "Дорога домой" },
                    { start: "16:40", end: "17:00", title: "Отдых, перекус" },
                    { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
                    { start: "19:00", end: "19:30", title: "Ужин" },
                    { start: "20:30", end: "21:30", title: "Тренировка тела" },
                    { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
                    { start: "22:00", end: "07:00", title: "Сон" }
                ],
                "ВТОРНИК": [
                    { start: "07:00", end: "07:30", title: "Подъем, утренние процедуры" },
                    { start: "07:30", end: "07:50", title: "Завтрак" },
                    { start: "08:00", end: "13:50", title: "Учеба" },
                    { start: "14:10", end: "14:40", title: "Обед" },
                    { start: "14:40", end: "15:30", title: "Отдых" },
                    { start: "15:30", end: "16:30", title: "Тренировка тела" },
                    { start: "16:30", end: "17:00", title: "Отдых, перекус" },
                    { start: "17:00", end: "19:00", title: "Выполнение домашних заданий" },
                    { start: "19:00", end: "19:30", title: "Ужин" },
                    { start: "21:30", end: "22:00", title: "Подготовка ко сну" },
                    { start: "22:00", end: "07:00", title: "Сон" }
                ],
                "СРЕДА": [],
                "ЧЕТВЕРГ": [],
                "ПЯТНИЦА": [],
                "СУББОТА": [],
                "ВОСКРЕСЕНЬЕ": []
            };
        }
    }
    
    // Получаем контейнер для расписания
    const scheduleContainer = document.querySelector('.day-schedule');
    if (!scheduleContainer) return;
    
    // Добавляем класс анимации в зависимости от направления
    let animationClass = '';
    if (direction === 'left') {
        animationClass = 'slide-from-right';
    } else if (direction === 'right') {
        animationClass = 'slide-from-left';
    }
    
    // Очищаем контейнер и добавляем класс анимации
    scheduleContainer.innerHTML = '';
    scheduleContainer.className = `day-schedule ${animationClass}`;
    
    // Получаем расписание для выбранного дня
    const daySchedule = weeklySchedule[day] || [];
    
    if (daySchedule.length > 0) {
        // Сортируем задания по времени начала
        daySchedule.sort((a, b) => {
            const timeA = a.start.split(':').map(Number);
            const timeB = b.start.split(':').map(Number);
            return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
        });
        
        // Добавляем элементы расписания
        daySchedule.forEach((item, index) => {
            const scheduleItem = document.createElement('div');
            scheduleItem.className = 'schedule-item';
            scheduleItem.dataset.index = index;
            
            scheduleItem.innerHTML = `
                <div class="schedule-time">${item.start} - ${item.end}</div>
                <div class="schedule-title">${item.title}</div>
                <div class="schedule-item-actions">
                    <button class="schedule-edit-btn" title="Редактировать">
                        <i class="fas fa-pencil-alt"></i>
                    </button>
                    <button class="schedule-delete-btn" title="Удалить">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            scheduleContainer.appendChild(scheduleItem);
            
            // Добавляем обработчики для кнопок редактирования и удаления
            const editBtn = scheduleItem.querySelector('.schedule-edit-btn');
            const deleteBtn = scheduleItem.querySelector('.schedule-delete-btn');
            
            editBtn.addEventListener('click', () => editScheduleItem(index));
            deleteBtn.addEventListener('click', () => deleteScheduleItem(index));
        });
    } else {
        // Если расписание пустое, показываем сообщение
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'no-schedule';
        emptyMessage.textContent = 'Нет расписания на этот день';
        scheduleContainer.appendChild(emptyMessage);
    }
}

// Переключение режима редактирования расписания
function toggleEditingSchedule() {
    isEditingSchedule = !isEditingSchedule;
    
    const scheduleContainer = document.querySelector('.day-schedule');
    const editButton = document.querySelector('.edit-schedule-btn');
    
    if (isEditingSchedule) {
        scheduleContainer.classList.add('editing-schedule');
        editButton.innerHTML = '<i class="fas fa-check"></i> Готово';
    } else {
        scheduleContainer.classList.remove('editing-schedule');
        editButton.innerHTML = '<i class="fas fa-edit"></i> Редактировать';
    }
}

// Добавление нового элемента расписания
function addScheduleItem() {
    // Получаем контейнер для расписания
    const scheduleContainer = document.querySelector('.day-schedule');
    if (!scheduleContainer) return;
    
    // Удаляем сообщение о пустом расписании, если оно есть
    const emptyMessage = scheduleContainer.querySelector('.no-schedule');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // Создаем форму для добавления нового элемента
    const formContainer = document.createElement('div');
    formContainer.className = 'schedule-edit-form';
    
    formContainer.innerHTML = `
        <div class="schedule-form-group">
            <label for="schedule-start">Время начала</label>
            <input type="time" id="schedule-start" required>
        </div>
        <div class="schedule-form-group">
            <label for="schedule-end">Время окончания</label>
            <input type="time" id="schedule-end" required>
        </div>
        <div class="schedule-form-group">
            <label for="schedule-title">Название</label>
            <input type="text" id="schedule-title" required>
        </div>
        <div class="schedule-form-actions">
            <button type="button" class="schedule-cancel-btn">Отмена</button>
            <button type="button" class="schedule-save-btn">Сохранить</button>
        </div>
    `;
    
    // Добавляем форму в начало контейнера
    scheduleContainer.prepend(formContainer);
    
    // Добавляем обработчики для кнопок
    const cancelBtn = formContainer.querySelector('.schedule-cancel-btn');
    const saveBtn = formContainer.querySelector('.schedule-save-btn');
    
    cancelBtn.addEventListener('click', () => formContainer.remove());
    saveBtn.addEventListener('click', () => saveNewScheduleItem(formContainer));
    
    // Устанавливаем фокус на первое поле
    formContainer.querySelector('#schedule-start').focus();
}

// Сохранение нового элемента расписания
function saveNewScheduleItem(formContainer) {
    const startInput = formContainer.querySelector('#schedule-start');
    const endInput = formContainer.querySelector('#schedule-end');
    const titleInput = formContainer.querySelector('#schedule-title');
    
    // Проверяем, что все поля заполнены
    if (!startInput.value || !endInput.value || !titleInput.value.trim()) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Создаем новый элемент расписания
    const newItem = {
        start: startInput.value,
        end: endInput.value,
        title: titleInput.value.trim()
    };
    
    // Получаем текущее расписание из localStorage
    const savedSchedule = localStorage.getItem('weeklySchedule');
    let weeklySchedule = {};
    
    if (savedSchedule) {
        weeklySchedule = JSON.parse(savedSchedule);
    }
    
    // Инициализируем расписание для текущего дня, если его нет
    if (!weeklySchedule[currentDay]) {
        weeklySchedule[currentDay] = [];
    }
    
    // Добавляем новый элемент
    weeklySchedule[currentDay].push(newItem);
    
    // Сохраняем обновленное расписание
    localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));
    
    // Обновляем отображение расписания
    loadDaySchedule(currentDay);
    
    // Обновляем отображение следующего задания на главном экране
    if (typeof updateNextTask === 'function') {
        updateNextTask();
    }
}

// Редактирование элемента расписания
function editScheduleItem(index) {
    // Получаем текущее расписание из localStorage
    const savedSchedule = localStorage.getItem('weeklySchedule');
    if (!savedSchedule) return;
    
    const weeklySchedule = JSON.parse(savedSchedule);
    const daySchedule = weeklySchedule[currentDay];
    
    if (!daySchedule || !daySchedule[index]) return;
    
    const item = daySchedule[index];
    currentScheduleItem = index;
    
    // Получаем контейнер для расписания
    const scheduleContainer = document.querySelector('.day-schedule');
    if (!scheduleContainer) return;
    
    // Создаем форму для редактирования элемента
    const formContainer = document.createElement('div');
    formContainer.className = 'schedule-edit-form';
    
    formContainer.innerHTML = `
        <div class="schedule-form-group">
            <label for="schedule-start-edit">Время начала</label>
            <input type="time" id="schedule-start-edit" value="${item.start}" required>
        </div>
        <div class="schedule-form-group">
            <label for="schedule-end-edit">Время окончания</label>
            <input type="time" id="schedule-end-edit" value="${item.end}" required>
        </div>
        <div class="schedule-form-group">
            <label for="schedule-title-edit">Название</label>
            <input type="text" id="schedule-title-edit" value="${item.title}" required>
        </div>
        <div class="schedule-form-actions">
            <button type="button" class="schedule-cancel-btn">Отмена</button>
            <button type="button" class="schedule-save-btn">Сохранить</button>
        </div>
    `;
    
    // Находим элемент, который редактируем
    const scheduleItem = scheduleContainer.querySelector(`.schedule-item[data-index="${index}"]`);
    
    // Вставляем форму перед редактируемым элементом
    if (scheduleItem) {
        scheduleItem.style.display = 'none';
        scheduleItem.insertAdjacentElement('beforebegin', formContainer);
    } else {
        scheduleContainer.appendChild(formContainer);
    }
    
    // Добавляем обработчики для кнопок
    const cancelBtn = formContainer.querySelector('.schedule-cancel-btn');
    const saveBtn = formContainer.querySelector('.schedule-save-btn');
    
    cancelBtn.addEventListener('click', () => {
        formContainer.remove();
        if (scheduleItem) {
            scheduleItem.style.display = '';
        }
    });
    
    saveBtn.addEventListener('click', () => saveEditedScheduleItem(formContainer, scheduleItem));
    
    // Устанавливаем фокус на первое поле
    formContainer.querySelector('#schedule-start-edit').focus();
}

// Сохранение отредактированного элемента расписания
function saveEditedScheduleItem(formContainer, scheduleItem) {
    const startInput = formContainer.querySelector('#schedule-start-edit');
    const endInput = formContainer.querySelector('#schedule-end-edit');
    const titleInput = formContainer.querySelector('#schedule-title-edit');
    
    // Проверяем, что все поля заполнены
    if (!startInput.value || !endInput.value || !titleInput.value.trim()) {
        alert('Пожалуйста, заполните все поля');
        return;
    }
    
    // Получаем текущее расписание из localStorage
    const savedSchedule = localStorage.getItem('weeklySchedule');
    if (!savedSchedule) return;
    
    const weeklySchedule = JSON.parse(savedSchedule);
    
    // Обновляем элемент расписания
    weeklySchedule[currentDay][currentScheduleItem] = {
        start: startInput.value,
        end: endInput.value,
        title: titleInput.value.trim()
    };
    
    // Сохраняем обновленное расписание
    localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));
    
    // Удаляем форму
    formContainer.remove();
    
    // Обновляем отображение расписания
    loadDaySchedule(currentDay);
    
    // Обновляем отображение следующего задания на главном экране
    if (typeof updateNextTask === 'function') {
        updateNextTask();
    }
}

// Удаление элемента расписания
function deleteScheduleItem(index) {
    if (!confirm('Вы уверены, что хотите удалить это задание?')) return;
    
    // Получаем текущее расписание из localStorage
    const savedSchedule = localStorage.getItem('weeklySchedule');
    if (!savedSchedule) return;
    
    const weeklySchedule = JSON.parse(savedSchedule);
    
    // Удаляем элемент расписания
    weeklySchedule[currentDay].splice(index, 1);
    
    // Сохраняем обновленное расписание
    localStorage.setItem('weeklySchedule', JSON.stringify(weeklySchedule));
    
    // Обновляем отображение расписания
    loadDaySchedule(currentDay);
    
    // Обновляем отображение следующего задания на главном экране
    if (typeof updateNextTask === 'function') {
        updateNextTask();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализация редактора расписания...');
    // Инициализируем редактор расписания
    initScheduleEditor();
});

// Дополнительная проверка на случай, если DOMContentLoaded уже произошел
if (document.readyState === 'interactive' || document.readyState === 'complete') {
    console.log('DOM уже загружен, инициализация редактора расписания...');
    initScheduleEditor();
} 