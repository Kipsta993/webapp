document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных о монетах и серии дней
    loadCommonData();
    
    // Добавление обработчиков событий для кнопок покупки
    const buyButtons = document.querySelectorAll('.buy-btn');
    buyButtons.forEach(button => {
        button.addEventListener('click', function() {
            const actionType = this.getAttribute('data-action');
            const price = parseInt(this.getAttribute('data-price'));
            
            buyAction(actionType, price);
        });
    });
});

// Функция для загрузки общих данных
function loadCommonData() {
    // Загрузка количества монет
    const coins = localStorage.getItem('coins');
    if (coins) {
        document.getElementById('coin-count').textContent = coins;
    } else {
        localStorage.setItem('coins', 100);
    }
    
    // Загрузка серии дней
    const streak = localStorage.getItem('streak');
    if (streak) {
        document.getElementById('streak-count').textContent = streak;
    } else {
        localStorage.setItem('streak', 7);
    }
}

// Функция для покупки действия
function buyAction(actionType, price) {
    const coinCountElement = document.getElementById('coin-count');
    let currentCoins = parseInt(coinCountElement.textContent);
    
    // Проверка, достаточно ли монет
    if (currentCoins < price) {
        showNotification('Недостаточно монет для покупки!', 'error');
        return;
    }
    
    // Вычитаем стоимость
    currentCoins -= price;
    coinCountElement.textContent = currentCoins;
    localStorage.setItem('coins', currentCoins);
    
    // Применяем эффект действия
    applyActionEffect(actionType);
    
    // Показываем уведомление об успешной покупке
    showNotification('Действие успешно приобретено!', 'success');
}

// Функция для применения эффекта действия
function applyActionEffect(actionType) {
    switch(actionType) {
        case 'rest':
            // Логика для дополнительного времени отдыха
            // В реальном приложении здесь будет более сложная логика
            localStorage.setItem('restBonus', true);
            break;
            
        case 'skip':
            // Логика для пропуска задания
            localStorage.setItem('taskSkip', true);
            break;
            
        case 'streak':
            // Увеличиваем серию дней на 1
            const streakElement = document.getElementById('streak-count');
            let currentStreak = parseInt(streakElement.textContent);
            currentStreak += 1;
            streakElement.textContent = currentStreak;
            localStorage.setItem('streak', currentStreak);
            break;
    }
}

// Функция для отображения уведомлений
function showNotification(message, type) {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Добавляем уведомление на страницу
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Добавляем стили для уведомлений
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        transform: translateX(120%);
        transition: transform 0.3s ease;
        z-index: 1000;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        background-color: #2ecc71;
    }
    
    .notification.error {
        background-color: #e74c3c;
    }
`;
document.head.appendChild(style);
