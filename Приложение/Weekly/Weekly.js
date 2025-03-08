document.addEventListener('DOMContentLoaded', function() {
    // Инициализация чекбоксов
    initializeCheckboxes();
    
    // Инициализация элементов задач
    initializeTaskItems();
    
    // Загрузка состояний задач
    loadTaskStates();
    
    // Загрузка общих данных
    loadCommonData();
    
    // Проверка и применение темы
    applyTheme();
    
    // Проверка сброса еженедельных задач
    checkWeeklyReset();
    
    // Обновление времени до понедельника
    updateTimeUntilMonday();
    
    // Проверка смены недели каждую минуту
    setInterval(checkWeekChange, 60000);
    
    // Инициализация навигации со стрелкой
    initializeNavigation();
});

// Функция для инициализации навигации
function initializeNavigation() {
    // Установка активного класса для текущей страницы в навигации
    const currentPage = 'weekly'; // Текущая страница - weekly
    
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

// Функция для инициализации чекбоксов
function initializeCheckboxes() {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Воспроизведение звука при отметке задачи
            if (this.checked) {
                playCheckboxSound();
                markTaskAsCompleted(this, true);
                incrementTasksCompleted();
            }
            
            // Сохранение состояний задач
            saveTaskStates();
        });
    });
}

// Функция для инициализации элементов задач
function initializeTaskItems() {
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('click', function(e) {
            // Проверяем, что клик был не по чекбоксу
            if (e.target.tagName !== 'INPUT') {
                const checkbox = this.querySelector('input[type="checkbox"]');
                if (checkbox && !checkbox.disabled) {
                    checkbox.checked = !checkbox.checked;
                    
                    // Вызываем событие change вручную
                    const event = new Event('change');
                    checkbox.dispatchEvent(event);
                }
            }
        });
    });
}

// Функция для отметки задачи как выполненной
function markTaskAsCompleted(checkbox, withAnimation) {
    const taskItem = checkbox.closest('.task-item');
    
    if (checkbox.checked) {
        taskItem.classList.add('completed-task');
        
        if (withAnimation) {
            playTaskAnimation(taskItem, checkbox);
        }
        
        // Делаем чекбокс неактивным после выполнения
        setTimeout(() => {
            checkbox.disabled = true;
        }, 300);
    } else {
        taskItem.classList.remove('completed-task');
        checkbox.disabled = false;
    }
}

// Функция для воспроизведения анимации выполнения задачи
function playTaskAnimation(taskItem, checkbox) {
    taskItem.classList.add('ripple');
    setTimeout(() => taskItem.classList.remove('ripple'), 600);
}

// Функция для загрузки состояний задач
function loadTaskStates() {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    
    // Получаем сохраненные состояния из localStorage
    const savedStates = JSON.parse(localStorage.getItem('weeklyTaskStates')) || {};
    
    // Текущий номер недели
    const currentWeek = getWeekNumber(new Date());
    
    // Если сохраненная неделя не совпадает с текущей, сбрасываем задачи
    if (savedStates.week !== currentWeek) {
        resetWeeklyTasks();
        return;
    }
    
    // Применяем сохраненные состояния к чекбоксам
    checkboxes.forEach((checkbox, index) => {
        if (savedStates[index]) {
            checkbox.checked = true;
            markTaskAsCompleted(checkbox, false);
        }
    });
}

// Функция для сохранения состояний задач
function saveTaskStates() {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    const states = {};
    
    // Сохраняем текущий номер недели
    states.week = getWeekNumber(new Date());
    
    // Сохраняем состояния чекбоксов
    checkboxes.forEach((checkbox, index) => {
        states[index] = checkbox.checked;
    });
    
    localStorage.setItem('weeklyTaskStates', JSON.stringify(states));
}

// Функция для увеличения счетчика выполненных задач
function incrementTasksCompleted() {
    let tasksCompleted = parseInt(localStorage.getItem('weeklyTasksCompleted') || '0');
    tasksCompleted++;
    localStorage.setItem('weeklyTasksCompleted', tasksCompleted.toString());
}

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка серии дней
    const streak = localStorage.getItem('streak') || '0';
    document.getElementById('streak-count').textContent = streak;
}

// Функция для применения темы
function applyTheme() {
    // Проверяем сохраненную тему в localStorage
    const darkTheme = localStorage.getItem('darkTheme') === 'true';
    
    // Применяем темную тему, если она была активирована
    if (darkTheme) {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
}

// Функция для применения светлой темы
function applyLightTheme() {
    document.body.classList.remove('dark-theme');
    
    // Дополнительные настройки для светлой темы
    document.querySelectorAll('.task-item').forEach(item => {
        item.style.borderLeftColor = '#e0e0e0';
    });
}

// Функция для применения темной темы
function applyDarkTheme() {
    document.body.classList.add('dark-theme');
    
    // Дополнительные настройки для темной темы
    document.querySelectorAll('.task-item').forEach(item => {
        item.style.borderLeftColor = '#444';
    });
}

// Функция для проверки сброса еженедельных задач
function checkWeeklyReset() {
    // Получаем сохраненные состояния из localStorage
    const savedStates = JSON.parse(localStorage.getItem('weeklyTaskStates')) || {};
    
    // Текущий номер недели
    const currentWeek = getWeekNumber(new Date());
    
    // Если сохраненная неделя не совпадает с текущей, сбрасываем задачи
    if (savedStates.week !== currentWeek) {
        resetWeeklyTasks();
    }
}

// Функция для получения номера недели
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Функция для сброса еженедельных задач
function resetWeeklyTasks() {
    const checkboxes = document.querySelectorAll('.task-item input[type="checkbox"]');
    
    // Сбрасываем все чекбоксы
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
        checkbox.disabled = false;
        
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
            taskItem.classList.remove('completed-task');
        }
    });
    
    // Сохраняем новые состояния
    const states = {
        week: getWeekNumber(new Date())
    };
    
    checkboxes.forEach((checkbox, index) => {
        states[index] = false;
    });
    
    localStorage.setItem('weeklyTaskStates', JSON.stringify(states));
}

// Функция для обновления времени до понедельника
function updateTimeUntilMonday() {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 - воскресенье, 1 - понедельник, ...
    
    // Находим следующий понедельник
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const nextMonday = new Date(now);
    nextMonday.setDate(now.getDate() + daysUntilMonday);
    nextMonday.setHours(0, 0, 0, 0);
    
    // Вычисляем разницу во времени
    const timeUntilMonday = nextMonday - now;
    
    // Преобразуем миллисекунды в дни, часы, минуты
    const days = Math.floor(timeUntilMonday / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilMonday % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilMonday % (1000 * 60 * 60)) / (1000 * 60));
    
    // Формируем строку с оставшимся временем
    let timeString = '';
    if (days > 0) {
        timeString += `${days}д `;
    }
    timeString += `${hours}ч ${minutes}м`;
    
    // Обновляем элемент на странице
    const timeElement = document.getElementById('time-until-monday');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
    
    // Обновляем каждую минуту
    setTimeout(updateTimeUntilMonday, 60000);
}

// Функция для проверки смены недели
function checkWeekChange() {
    const savedStates = JSON.parse(localStorage.getItem('weeklyTaskStates')) || {};
    const currentWeek = getWeekNumber(new Date());
    
    if (savedStates.week !== currentWeek) {
        resetWeeklyTasks();
        updateTimeUntilMonday();
        
        // Показываем уведомление о сбросе задач
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Еженедельные задачи сброшены', {
                body: 'Началась новая неделя. Все еженедельные задачи были сброшены.'
            });
        }
    }
}

// Функция для воспроизведения звука при отметке задачи
function playCheckboxSound() {
    const sound = document.getElementById('checkbox-sound');
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log('Ошибка воспроизведения звука:', error);
        });
    }
}
