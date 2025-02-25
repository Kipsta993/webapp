document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных о монетах и серии дней
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
    
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

// Функция для применения сохраненной темы
function applyTheme() {
    const theme = localStorage.getItem('theme');
    if (!theme) return;
    
    if (theme === 'dark') {
        applyDarkTheme();
    } else if (theme === 'custom') {
        applyCustomTheme();
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
        section, .bottom-nav, .action-card {
            background-color: #444 !important;
            color: #f5f5f5 !important;
        }
        
        .bottom-nav a {
            color: #aaa !important;
        }
        
        .bottom-nav a.active {
            color: #8e44ad !important;
        }
        
        .action-description {
            color: #ccc !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для применения пользовательской темы
function applyCustomTheme() {
    const customColorsStr = localStorage.getItem('customColors');
    if (!customColorsStr) return;
    
    const customColors = JSON.parse(customColorsStr);
    const backgroundColor = customColors.background || '#f5f5f5';
    const textColor = customColors.text || '#333';
    const accentColor = customColors.accent || '#8e44ad';
    
    // Применяем пользовательские цвета
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    
    // Добавляем стили для пользовательской темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section {
            background-color: ${adjustColor(backgroundColor, 20)} !important;
        }
        
        .bottom-nav {
            background-color: ${adjustColor(backgroundColor, 10)} !important;
        }
        
        .bottom-nav a {
            color: ${adjustColor(textColor, -20)} !important;
        }
        
        .bottom-nav a.active {
            color: white !important;
            background-color: ${accentColor} !important;
        }
        
        .action-card {
            background-color: ${adjustColor(backgroundColor, 10)} !important;
            border-left-color: ${accentColor} !important;
        }
        
        .action-description {
            color: ${adjustColor(textColor, -20)} !important;
        }
        
        .buy-btn {
            background-color: ${accentColor} !important;
        }
    `;
    document.head.appendChild(style);
}

// Вспомогательная функция для настройки цвета
function adjustColor(color, amount) {
    // Преобразуем цвет в RGB
    let r, g, b;
    if (color.startsWith('#')) {
        r = parseInt(color.substring(1, 3), 16);
        g = parseInt(color.substring(3, 5), 16);
        b = parseInt(color.substring(5, 7), 16);
    } else {
        return color; // Если не HEX формат, возвращаем как есть
    }
    
    // Настраиваем яркость
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Преобразуем обратно в HEX
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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
