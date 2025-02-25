document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных данных
    loadTaskStates();
    
    // Добавление обработчиков событий для чекбоксов
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Сохранение состояния задачи
            saveTaskStates();
            
            // Если задача выполнена, добавляем монеты
            if (this.checked) {
                addCoins(5);
            }
        });
    });
    
    // Обновление времени для следующего задания
    updateNextTask();
});

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('dailyTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (tasks[checkbox.id]) {
                checkbox.checked = tasks[checkbox.id];
            }
        });
    }
    
    // Загрузка количества монет
    const coins = localStorage.getItem('coins');
    if (coins) {
        document.getElementById('coin-count').textContent = coins;
    }
    
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    }
}

// Функция для сохранения состояний задач
function saveTaskStates() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const tasks = {};
    
    checkboxes.forEach(checkbox => {
        tasks[checkbox.id] = checkbox.checked;
    });
    
    localStorage.setItem('dailyTasks', JSON.stringify(tasks));
}

// Функция для добавления монет
function addCoins(amount) {
    const coinCountElement = document.getElementById('coin-count');
    let currentCoins = parseInt(coinCountElement.textContent);
    currentCoins += amount;
    
    coinCountElement.textContent = currentCoins;
    localStorage.setItem('coins', currentCoins);
}

// Функция для обновления следующего задания
function updateNextTask() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Пример логики для определения следующего задания
    // В реальном приложении здесь будет более сложная логика
    const taskTimeElement = document.querySelector('.task-time');
    const taskTitleElement = document.querySelector('.task-title');
    
    // Простой пример: если сейчас утро, показываем одно задание, если день - другое
    if (hours < 12) {
        taskTimeElement.textContent = '10:00 - 11:30';
        taskTitleElement.textContent = 'Встреча с командой';
    } else if (hours < 17) {
        taskTimeElement.textContent = '14:00 - 15:30';
        taskTitleElement.textContent = 'Работа над проектом';
    } else {
        taskTimeElement.textContent = '18:00 - 19:00';
        taskTitleElement.textContent = 'Вечерняя тренировка';
    }
}

// Функция для проверки и обновления серии дней
function checkDailyStreak() {
    const lastVisit = localStorage.getItem('lastVisit');
    const today = new Date().toDateString();
    
    if (lastVisit) {
        const lastDate = new Date(lastVisit);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Если последний визит был вчера, увеличиваем серию
        if (lastDate.toDateString() === yesterday.toDateString()) {
            let streak = parseInt(localStorage.getItem('streak') || '0');
            streak++;
            document.getElementById('streak-count').textContent = streak;
            localStorage.setItem('streak', streak);
        } 
        // Если последний визит был раньше чем вчера, сбрасываем серию
        else if (lastDate.toDateString() !== today) {
            document.getElementById('streak-count').textContent = '1';
            localStorage.setItem('streak', 1);
        }
    }
    
    // Сохраняем текущую дату как последний визит
    localStorage.setItem('lastVisit', today);
}

// Проверяем серию дней при загрузке страницы
checkDailyStreak();
