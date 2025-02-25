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
                addCoins(10); // За недельные задачи даем больше монет
            }
        });
    });
    
    // Загрузка общих данных (монеты, серия дней)
    loadCommonData();
});

// Функция для загрузки сохраненных состояний задач
function loadTaskStates() {
    // Загрузка состояний чекбоксов
    const savedTasks = localStorage.getItem('weeklyTasks');
    if (savedTasks) {
        const tasks = JSON.parse(savedTasks);
        const checkboxes = document.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            if (tasks[checkbox.id]) {
                checkbox.checked = tasks[checkbox.id];
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
    });
    
    localStorage.setItem('weeklyTasks', JSON.stringify(tasks));
}

// Функция для загрузки общих данных
function loadCommonData() {
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

// Функция для добавления монет
function addCoins(amount) {
    const coinCountElement = document.getElementById('coin-count');
    let currentCoins = parseInt(coinCountElement.textContent);
    currentCoins += amount;
    
    coinCountElement.textContent = currentCoins;
    localStorage.setItem('coins', currentCoins);
}

// Функция для проверки и сброса недельных заданий
function checkWeeklyReset() {
    const lastWeekCheck = localStorage.getItem('lastWeekCheck');
    const now = new Date();
    const currentWeek = getWeekNumber(now);
    
    if (lastWeekCheck) {
        const [lastYear, lastWeek] = JSON.parse(lastWeekCheck);
        const currentYear = now.getFullYear();
        
        // Если неделя изменилась, сбрасываем задания
        if (lastYear !== currentYear || lastWeek !== currentWeek) {
            resetWeeklyTasks();
        }
    }
    
    // Сохраняем текущую неделю
    localStorage.setItem('lastWeekCheck', JSON.stringify([now.getFullYear(), currentWeek]));
}

// Функция для получения номера недели
function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Функция для сброса недельных заданий
function resetWeeklyTasks() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    
    saveTaskStates();
}

// Проверяем необходимость сброса недельных заданий
checkWeeklyReset();
