document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных
    loadTaskStates();
    
    // Проверка на смену недели и сброс заданий при необходимости
    checkWeekChange();
    
    // Добавление обработчиков событий для чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        // Если чекбокс уже отмечен, делаем его неактивным и меняем цвет полосы
        if (checkbox.checked) {
            checkbox.disabled = true;
            const label = document.querySelector(`label[for="${checkbox.id}"]`);
            if (label) {
                label.classList.add('completed-task');
            }
            // Меняем цвет полосы слева на зеленый
            const taskItem = checkbox.closest('.task-item');
            if (taskItem) {
                taskItem.style.borderLeftColor = '#4CAF50';
            }
        }
        
        checkbox.addEventListener('change', function() {
            // Если задача отмечена как выполненная
            if (this.checked) {
                // Получаем элемент задачи
                const taskItem = this.closest('.task-item');
                
                if (taskItem) {
                    // Предотвращаем повторное запуск анимаций, если они уже выполняются
                    if (taskItem.classList.contains('animating')) return;
                    taskItem.classList.add('animating');
                    
                    // Сохраняем оригинальный цвет полосы для анимации
                    const originalColor = getComputedStyle(taskItem).borderLeftColor;
                    taskItem.style.setProperty('--original-color', originalColor);
                    
                    // Добавляем эффект волны
                    taskItem.classList.add('ripple');
                    
                    // Добавляем класс для анимации
                    taskItem.classList.add('completed');
                    
                    // Добавляем анимацию изменения цвета полосы
                    taskItem.classList.add('border-animation');
                    
                    // Удаляем классы после завершения анимации
                    setTimeout(() => {
                        taskItem.classList.remove('ripple');
                        taskItem.classList.remove('completed');
                        taskItem.classList.remove('border-animation');
                        taskItem.classList.remove('animating');
                        
                        // Устанавливаем финальный цвет полосы напрямую
                        taskItem.style.borderLeftColor = '#4CAF50';
                    }, 700);
                }
                
                // Анимация увеличения чекбокса
                this.classList.add('checkbox-scale');
                setTimeout(() => {
                    this.classList.remove('checkbox-scale');
                }, 300);
                
                // Делаем чекбокс неактивным
                this.disabled = true;
                
                // Добавляем стиль для метки
                const label = document.querySelector(`label[for="${this.id}"]`);
                if (label) {
                    label.classList.add('completed-task');
                }
                
                // Увеличиваем счетчик выполненных заданий
                incrementTasksCompleted();
                
                // Воспроизводим звук, если он включен
                playCheckboxSound();
            }
            
            // Сохранение состояния задачи
            saveTaskStates();
        });
    });
    
    // Добавляем обработчик клика для всего элемента задания
    const taskItems = document.querySelectorAll('.task-item');
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('click', function(event) {
            // Проверяем, что клик был не на чекбоксе и не на метке
            if (!event.target.matches('input[type="checkbox"]') && 
                !event.target.matches('label')) {
                
                // Предотвращаем повторный запуск анимаций, если они уже выполняются
                if (this.classList.contains('animating')) return;
                
                const checkbox = this.querySelector('input[type="checkbox"]');
                
                // Если задание еще не выполнено
                if (checkbox && !checkbox.disabled && !checkbox.checked) {
                    // Добавляем класс для предотвращения повторных анимаций
                    this.classList.add('animating');
                    
                    // Добавляем эффект волны
                    this.classList.add('ripple');
                    
                    // Удаляем класс эффекта волны после завершения анимации
                    setTimeout(() => {
                        this.classList.remove('ripple');
                    }, 600);
                    
                    // Имитируем клик по чекбоксу
                    checkbox.checked = true;
                    
                    // Вызываем событие change вручную
                    const changeEvent = new Event('change', { bubbles: true });
                    checkbox.dispatchEvent(changeEvent);
                }
                // Если задание уже выполнено, проигрываем только анимацию
                else if (checkbox && checkbox.checked) {
                    // Предотвращаем повторный запуск анимаций
                    this.classList.add('animating');
                    
                    // Добавляем эффект волны
                    this.classList.add('ripple');
                    
                    // Добавляем класс для анимации пульсации
                    this.classList.add('completed');
                    
                    // Удаляем классы после завершения анимации
                    setTimeout(() => {
                        this.classList.remove('ripple');
                        this.classList.remove('completed');
                        this.classList.remove('animating');
                    }, 700);
                    
                    // Анимация увеличения чекбокса
                    checkbox.classList.add('checkbox-scale');
                    setTimeout(() => {
                        checkbox.classList.remove('checkbox-scale');
                    }, 300);
                }
            }
        });
    });
    
    // Добавляем анимацию появления для секций
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        section.style.setProperty('--index', index);
    });
    
    // Загрузка общих данных (серия дней)
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Обновление времени до понедельника
    updateTimeUntilMonday();
    setInterval(updateTimeUntilMonday, 1000);
    
    // Проверка и сброс еженедельных задач
    checkWeeklyReset();
});

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('weeklyTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (tasks[checkbox.id] !== undefined) {
                checkbox.checked = tasks[checkbox.id];
                
                // Восстанавливаем состояние disabled
                if (tasks[checkbox.id + '_disabled']) {
                    checkbox.disabled = true;
                    
                    // Добавляем стиль для метки
                    const label = document.querySelector(`label[for="${checkbox.id}"]`);
                    if (label) {
                        label.classList.add('completed-task');
                    }
                }
            }
        });
    }
}

// Функция для сохранения состояний задач
function saveTaskStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const tasks = {};
    
    checkboxes.forEach(checkbox => {
        tasks[checkbox.id] = checkbox.checked;
        // Также сохраняем состояние disabled
        tasks[checkbox.id + '_disabled'] = checkbox.disabled;
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Функция для увеличения счетчика выполненных заданий
function incrementTasksCompleted() {
    let weeklyTasksCompleted = parseInt(localStorage.getItem('weeklyTasksCompleted') || '0');
    weeklyTasksCompleted++;
    localStorage.setItem('weeklyTasksCompleted', weeklyTasksCompleted);
}

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    }
}

// Функция для применения сохраненной темы
function applyTheme() {
    const theme = localStorage.getItem('theme');
    if (!theme) return;
    
    if (theme === 'dark') {
        applyDarkTheme();
    } else {
        applyLightTheme();
    }
}

// Функция для применения светлой темы
function applyLightTheme() {
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.color = '#333';
    
    // Удаляем пользовательские стили, если они есть
    const customStyles = document.getElementById('custom-theme-styles');
    if (customStyles) {
        customStyles.remove();
    }
}

// Функция для применения темной темы
function applyDarkTheme() {
    document.body.style.backgroundColor = '#333';
    document.body.style.color = '#f5f5f5';
    
    // Добавляем стили для темной темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section, .bottom-nav, .task-item {
            background-color: #444;
            color: #f5f5f5;
        }
        
        .bottom-nav a {
            color: #aaa;
        }
        
        .bottom-nav a.active {
            color: #fff;
        }
        
        .time-remaining {
            color: #ccc;
        }
    `;
    
    // Удаляем предыдущие стили, если они есть
    const existingStyle = document.getElementById('custom-theme-styles');
    if (existingStyle) {
        existingStyle.remove();
    }
    
    document.head.appendChild(style);
}

// Проверка и сброс недельных задач
checkWeeklyReset();

// Функция для проверки необходимости сброса недельных задач
function checkWeeklyReset() {
    const lastWeek = localStorage.getItem('lastWeek');
    const currentDate = new Date();
    const currentWeek = getWeekNumber(currentDate);
    
    // Если неделя изменилась или данных о последней неделе нет
    if (!lastWeek || lastWeek !== currentWeek.toString()) {
        resetWeeklyTasks();
        localStorage.setItem('lastWeek', currentWeek);
    }
}

// Функция для получения номера недели
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    return Math.ceil((((date - firstDayOfYear) / 86400000) + firstDayOfYear.getDay() + 1) / 7);
}

// Функция для сброса недельных задач
function resetWeeklyTasks() {
    console.log('Сброс недельных задач');
    
    // Получаем все чекбоксы
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    
    // Создаем объект для хранения состояний задач
    const tasks = {};
    
    // Сбрасываем состояние каждого чекбокса
    checkboxes.forEach(checkbox => {
        // Снимаем отметку и делаем активным
        checkbox.checked = false;
        checkbox.disabled = false;
        
        // Сохраняем состояние в объект
        tasks[checkbox.id] = false;
        tasks[checkbox.id + '_disabled'] = false;
        
        // Удаляем стиль для метки
        const label = document.querySelector(`label[for="${checkbox.id}"]`);
        if (label) {
            label.classList.remove('completed-task');
        }
        
        // Возвращаем исходный цвет полосы слева
        const taskItem = checkbox.closest('.task-item');
        if (taskItem) {
            // Используем CSS-переход для плавного изменения цвета
            taskItem.style.borderLeftColor = '#8e44ad';
        }
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Функция для обновления времени до понедельника
function updateTimeUntilMonday() {
    const now = new Date();
    
    // Создаем дату следующего понедельника
    const nextMonday = new Date(now);
    
    // Если сегодня понедельник, то следующий понедельник через 7 дней
    // Иначе находим ближайший понедельник
    if (now.getDay() === 1) {
        nextMonday.setDate(now.getDate() + 7);
    } else {
        nextMonday.setDate(now.getDate() + (8 - now.getDay()) % 7);
    }
    
    nextMonday.setHours(0, 0, 0, 0);
    
    // Разница в миллисекундах
    const diff = nextMonday - now;
    
    // Переводим в дни, часы, минуты, секунды
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    // Форматируем строку
    let timeString = '';
    if (days > 0) {
        timeString += `${days}д `;
    }
    timeString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Обновляем элемент
    document.getElementById('time-until-monday').textContent = timeString;
    
    // Если наступил понедельник (разница меньше 1 секунды), сбрасываем задания
    if (diff < 1000) {
        resetWeeklyTasks();
    }
}

// Функция для проверки смены недели
function checkWeekChange() {
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    const currentYear = now.getFullYear();
    const weekYearKey = `${currentYear}-${currentWeek}`;
    
    // Получаем номер недели последнего сброса заданий
    const lastResetWeek = localStorage.getItem('lastWeeklyReset');
    
    // Если номер недели последнего сброса не совпадает с текущим, сбрасываем задания
    if (!lastResetWeek || lastResetWeek !== weekYearKey) {
        resetWeeklyTasks();
        // Сохраняем текущий номер недели как номер недели последнего сброса
        localStorage.setItem('lastWeeklyReset', weekYearKey);
    }
}

// Функция для воспроизведения звука при отметке задания
function playCheckboxSound() {
    // Проверяем, включены ли звуки в настройках
    const soundsEnabled = localStorage.getItem('sounds');
    if (soundsEnabled === 'true') {
        const sound = document.getElementById('checkbox-sound');
        if (sound) {
            // Сбрасываем звук, чтобы его можно было воспроизвести снова
            sound.currentTime = 0;
            sound.play().catch(error => {
                console.error('Ошибка воспроизведения звука:', error);
            });
        }
    }
}
