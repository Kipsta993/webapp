document.addEventListener('DOMContentLoaded', function() {
    // Загрузка сохраненных настроек
    loadSettings();
    
    // Загрузка общих данных (монеты, серия дней)
    loadCommonData();
    
    // Обработчики событий для выбора темы
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            selectTheme(theme);
        });
    });
    
    // Обработчик для кнопки применения пользовательской темы
    document.getElementById('apply-custom-theme').addEventListener('click', applyCustomTheme);
    
    // Обработчики для переключателей
    document.getElementById('notifications-toggle').addEventListener('change', saveSettings);
    document.getElementById('sounds-toggle').addEventListener('change', saveSettings);
    
    // Обработчик для кнопки сброса монет
    document.getElementById('reset-coins-button').addEventListener('click', resetCoins);
    
    // Обработчик для кнопки сброса серии дней
    document.getElementById('reset-streak-button').addEventListener('click', resetStreak);
    
    // Обработчик для кнопки тестового уведомления
    document.getElementById('test-notification-button').addEventListener('click', sendTestNotification);
    
    // Обработчик для кнопки сброса всех данных
    document.getElementById('reset-button').addEventListener('click', resetAllData);
    
    // Запрашиваем разрешение на отправку уведомлений при загрузке страницы
    requestNotificationPermission();
});

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

// Функция для загрузки сохраненных настроек
function loadSettings() {
    // Загрузка темы
    const theme = localStorage.getItem('theme') || 'light';
    selectTheme(theme);
    
    // Загрузка пользовательских цветов
    if (theme === 'custom') {
        const customColors = JSON.parse(localStorage.getItem('customColors') || '{}');
        
        if (customColors.background) {
            document.getElementById('background-color').value = customColors.background;
        }
        
        if (customColors.text) {
            document.getElementById('text-color').value = customColors.text;
        }
        
        if (customColors.accent) {
            document.getElementById('accent-color').value = customColors.accent;
        }
        
        applyCustomTheme();
    }
    
    // Загрузка настроек переключателей
    const notifications = localStorage.getItem('notifications');
    if (notifications !== null) {
        document.getElementById('notifications-toggle').checked = notifications === 'true';
    }
    
    const sounds = localStorage.getItem('sounds');
    if (sounds !== null) {
        document.getElementById('sounds-toggle').checked = sounds === 'true';
    }
}

// Функция для выбора темы
function selectTheme(theme) {
    // Удаляем активный класс со всех опций
    document.querySelectorAll('.theme-option').forEach(option => {
        option.classList.remove('active');
    });
    
    // Добавляем активный класс выбранной опции
    document.querySelector(`.theme-option[data-theme="${theme}"]`).classList.add('active');
    
    // Показываем/скрываем настройки пользовательской темы
    const customSettings = document.querySelector('.custom-color-settings');
    if (theme === 'custom') {
        customSettings.classList.add('active');
    } else {
        customSettings.classList.remove('active');
    }
    
    // Применяем тему
    if (theme === 'light') {
        applyLightTheme();
    } else if (theme === 'dark') {
        applyDarkTheme();
    }
    
    // Сохраняем выбранную тему
    localStorage.setItem('theme', theme);
}

// Функция для применения светлой темы
function applyLightTheme() {
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.color = '#333';
    
    // Сбрасываем пользовательские стили
    document.getElementById('custom-theme-styles')?.remove();
}

// Функция для применения темной темы
function applyDarkTheme() {
    document.body.style.backgroundColor = '#333';
    document.body.style.color = '#f5f5f5';
    
    // Сбрасываем пользовательские стили
    document.getElementById('custom-theme-styles')?.remove();
    
    // Добавляем стили для темной темы
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        section, .bottom-nav, .action-card, .task-item {
            background-color: #444 !important;
            color: #f5f5f5 !important;
        }
        
        .bottom-nav a {
            color: #aaa !important;
        }
        
        .bottom-nav a.active {
            color: #4285f4 !important;
        }
        
        .setting-description, h3 {
            color: #ccc !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для применения пользовательской темы
function applyCustomTheme() {
    const backgroundColor = document.getElementById('background-color').value;
    const textColor = document.getElementById('text-color').value;
    const accentColor = document.getElementById('accent-color').value;
    
    // Сохраняем пользовательские цвета
    const customColors = {
        background: backgroundColor,
        text: textColor,
        accent: accentColor
    };
    localStorage.setItem('customColors', JSON.stringify(customColors));
    
    // Применяем пользовательские цвета
    document.body.style.backgroundColor = backgroundColor;
    document.body.style.color = textColor;
    
    // Удаляем предыдущие пользовательские стили
    document.getElementById('custom-theme-styles')?.remove();
    
    // Добавляем новые пользовательские стили
    const style = document.createElement('style');
    style.id = 'custom-theme-styles';
    style.textContent = `
        .bottom-nav a.active, input:checked + .toggle-slider, #apply-custom-theme {
            color: ${accentColor} !important;
            background-color: ${accentColor} !important;
        }
        
        input:checked + .toggle-slider {
            background-color: ${accentColor} !important;
        }
        
        .theme-option.active .theme-preview {
            border-color: ${accentColor} !important;
        }
    `;
    document.head.appendChild(style);
}

// Функция для сохранения настроек
function saveSettings() {
    const notificationsEnabled = document.getElementById('notifications-toggle').checked;
    const soundsEnabled = document.getElementById('sounds-toggle').checked;
    
    localStorage.setItem('notifications', notificationsEnabled);
    localStorage.setItem('sounds', soundsEnabled);
}

// Функция для сброса всех данных
function resetAllData() {
    if (confirm('Вы уверены, что хотите сбросить все данные? Это действие нельзя отменить.')) {
        // Сохраняем текущую тему перед сбросом
        const currentTheme = localStorage.getItem('theme') || 'light';
        
        // Очищаем все данные из localStorage
        localStorage.clear();
        
        // Восстанавливаем тему
        localStorage.setItem('theme', currentTheme);
        
        // Устанавливаем начальные значения
        localStorage.setItem('coins', '100');
        localStorage.setItem('streak', '1');
        
        // Обновляем отображение
        document.getElementById('coin-count').textContent = '100';
        document.getElementById('streak-count').textContent = '1';
        
        // Показываем уведомление
        alert('Все данные успешно сброшены!');
        
        // Перезагружаем страницу
        window.location.reload();
    }
}

// Функция для сброса монет
function resetCoins() {
    if (confirm('Вы уверены, что хотите сбросить количество монет до начального значения?')) {
        // Устанавливаем начальное значение монет
        localStorage.setItem('coins', '100');
        
        // Обновляем отображение
        document.getElementById('coin-count').textContent = '100';
        
        // Показываем уведомление
        alert('Количество монет успешно сброшено!');
    }
}

// Функция для сброса серии дней
function resetStreak() {
    if (confirm('Вы уверены, что хотите сбросить серию дней до начального значения?')) {
        // Устанавливаем начальное значение серии дней
        localStorage.setItem('streak', '1');
        
        // Обновляем отображение
        document.getElementById('streak-count').textContent = '1';
        
        // Показываем уведомление
        alert('Серия дней успешно сброшена!');
    }
}

// Функция для запроса разрешения на отправку уведомлений
function requestNotificationPermission() {
    // Проверяем поддержку уведомлений в браузере
    if ('Notification' in window) {
        console.log('Уведомления поддерживаются');
        
        // Если разрешение еще не запрошено
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission()
                .then(permission => {
                    console.log('Получено разрешение:', permission);
                    
                    // Если разрешение получено, регистрируем Service Worker
                    if (permission === 'granted' && 'serviceWorker' in navigator) {
                        registerServiceWorker();
                    }
                });
        } else if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
            // Если разрешение уже получено, регистрируем Service Worker
            registerServiceWorker();
        }
    } else {
        console.log('Уведомления не поддерживаются в этом браузере');
    }
}

// Функция для регистрации Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('../service-worker.js')
            .then(registration => {
                console.log('Service Worker зарегистрирован:', registration);
            })
            .catch(error => {
                console.error('Ошибка при регистрации Service Worker:', error);
            });
    }
}

// Функция для отправки тестового уведомления
function sendTestNotification() {
    console.log('Попытка отправить уведомление');
    
    // Создаем элемент для отображения статуса уведомления на странице
    showNotificationStatus('Отправка уведомления...');
    
    // Проверяем поддержку уведомлений в браузере
    if (!('Notification' in window)) {
        console.log('Браузер не поддерживает уведомления');
        showNotificationStatus('Ваш браузер не поддерживает уведомления!', 'error');
        alert('Ваш браузер не поддерживает уведомления!');
        return;
    }
    
    console.log('Текущее разрешение:', Notification.permission);
    
    // Если разрешение уже получено
    if (Notification.permission === 'granted') {
        try {
            // Проверяем, зарегистрирован ли Service Worker
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                // Пытаемся использовать Service Worker для отправки уведомления
                sendNotificationViaServiceWorker();
            } else {
                // Если Service Worker не поддерживается, используем обычное уведомление
                sendSimpleNotification();
            }
        } catch (error) {
            console.error('Ошибка при создании уведомления:', error);
            showNotificationStatus('Ошибка при создании уведомления: ' + error.message, 'error');
            alert('Ошибка при создании уведомления: ' + error.message);
        }
    } else if (Notification.permission !== 'denied') {
        // Если разрешение еще не запрошено, запрашиваем его
        console.log('Запрашиваем разрешение');
        showNotificationStatus('Запрашиваем разрешение на отправку уведомлений...');
        
        Notification.requestPermission()
            .then(permission => {
                console.log('Получено разрешение:', permission);
                if (permission === 'granted') {
                    // Повторно вызываем функцию после получения разрешения
                    sendTestNotification();
                } else {
                    console.log('Разрешение не получено');
                    showNotificationStatus('Для отправки уведомлений необходимо разрешение!', 'error');
                    alert('Для отправки уведомлений необходимо разрешение!');
                }
            })
            .catch(error => {
                console.error('Ошибка при запросе разрешения:', error);
                showNotificationStatus('Ошибка при запросе разрешения: ' + error.message, 'error');
                alert('Ошибка при запросе разрешения: ' + error.message);
            });
    } else {
        // Если разрешение отклонено
        console.log('Разрешение отклонено');
        showNotificationStatus('Вы отклонили разрешение на отправку уведомлений', 'error');
        alert('Вы отклонили разрешение на отправку уведомлений. Пожалуйста, измените настройки в браузере.');
    }
}

// Функция для отправки уведомления через Service Worker
function sendNotificationViaServiceWorker() {
    navigator.serviceWorker.ready
        .then(registration => {
            console.log('Service Worker готов:', registration);
            
            // Отправляем уведомление через Service Worker
            registration.showNotification('Тестовое уведомление', {
                body: 'Это тестовое уведомление от приложения Daily Tasks (через Service Worker)',
                icon: '../Прочее/Огонь.png',
                badge: '../Прочее/Монета.png',
                vibrate: [100, 50, 100],
                tag: 'test-notification',
                requireInteraction: true,
                actions: [
                    {
                        action: 'explore',
                        title: 'Открыть'
                    },
                    {
                        action: 'close',
                        title: 'Закрыть'
                    }
                ]
            })
            .then(() => {
                console.log('Уведомление отправлено через Service Worker');
                showNotificationStatus('Уведомление отправлено!', 'success');
            })
            .catch(error => {
                console.error('Ошибка при отправке уведомления через Service Worker:', error);
                // Если не удалось отправить через Service Worker, пробуем обычное уведомление
                sendSimpleNotification();
            });
        })
        .catch(error => {
            console.error('Service Worker не готов:', error);
            // Если Service Worker не готов, используем обычное уведомление
            sendSimpleNotification();
        });
}

// Функция для отправки обычного уведомления
function sendSimpleNotification() {
    console.log('Отправка обычного уведомления');
    
    // Создаем и показываем уведомление
    const notification = new Notification('Тестовое уведомление', {
        body: 'Это тестовое уведомление от приложения Daily Tasks',
        icon: '../Прочее/Огонь.png',
        tag: 'test-notification',
        requireInteraction: true
    });
    
    console.log('Уведомление создано:', notification);
    showNotificationStatus('Уведомление отправлено!', 'success');
    
    // Добавляем обработчики событий для уведомления
    notification.onclick = function() {
        console.log('Уведомление нажато');
        window.focus();
        notification.close();
    };
    
    notification.onshow = function() {
        console.log('Уведомление показано');
    };
    
    notification.onerror = function(e) {
        console.error('Ошибка уведомления:', e);
        showNotificationStatus('Ошибка при отправке уведомления', 'error');
    };
    
    // Закрываем уведомление через 10 секунд
    setTimeout(() => {
        notification.close();
    }, 10000);
}

// Функция для отображения статуса уведомления на странице
function showNotificationStatus(message, type = 'info') {
    // Удаляем предыдущий статус, если он есть
    const existingStatus = document.getElementById('notification-status');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // Создаем элемент для отображения статуса
    const statusElement = document.createElement('div');
    statusElement.id = 'notification-status';
    statusElement.className = `notification-status ${type}`;
    statusElement.textContent = message;
    
    // Добавляем элемент на страницу
    const testNotificationButton = document.getElementById('test-notification-button');
    const parentElement = testNotificationButton.parentElement.parentElement;
    parentElement.appendChild(statusElement);
    
    // Удаляем статус через 5 секунд, если это не ошибка
    if (type !== 'error') {
        setTimeout(() => {
            statusElement.remove();
        }, 5000);
    }
}
