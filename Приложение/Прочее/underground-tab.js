// Функциональность подземной вкладки настроек

document.addEventListener('DOMContentLoaded', function() {
    // Создаем элементы подземной вкладки
    createUndergroundTab();
    
    // Инициализируем обработчики событий
    initSwipeDetection();
    
    // Загружаем настройки
    loadSettings();
    
    // Показываем подсказку о свайпе
    showSwipeHint();
});

// Создание элементов подземной вкладки
function createUndergroundTab() {
    // Создаем основной контейнер
    const undergroundTab = document.createElement('div');
    undergroundTab.className = 'underground-tab';
    
    // Добавляем индикатор для свайпа
    const pullIndicator = document.createElement('div');
    pullIndicator.className = 'pull-indicator';
    undergroundTab.appendChild(pullIndicator);
    
    // Создаем заголовок
    const header = document.createElement('div');
    header.className = 'underground-tab-header';
    
    const title = document.createElement('h2');
    title.textContent = 'Настройки';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'underground-tab-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', hideUndergroundTab);
    
    header.appendChild(title);
    header.appendChild(closeButton);
    undergroundTab.appendChild(header);
    
    // Создаем контент
    const content = document.createElement('div');
    content.className = 'underground-tab-content';
    
    // Добавляем настройки темы
    const themeSettings = document.createElement('section');
    themeSettings.className = 'theme-settings';
    themeSettings.innerHTML = `
        <h2>Настройки темы</h2>
        <div class="setting-group">
            <h3>Выберите тему</h3>
            <div class="theme-options">
                <div class="theme-option" data-theme="light">
                    <div class="theme-preview light-theme"></div>
                    <span>Светлая</span>
                </div>
                <div class="theme-option" data-theme="dark">
                    <div class="theme-preview dark-theme"></div>
                    <span>Тёмная</span>
                </div>
            </div>
        </div>
    `;
    
    // Добавляем настройки приложения
    const appSettings = document.createElement('section');
    appSettings.className = 'app-settings';
    appSettings.innerHTML = `
        <h2>Настройки приложения</h2>
        <div class="setting-item">
            <div class="setting-label">
                <span>Звуки</span>
                <p class="setting-description">Включить звуки при выполнении задач</p>
            </div>
            <label class="toggle">
                <input type="checkbox" id="sounds-toggle">
                <span class="toggle-slider"></span>
            </label>
        </div>
        <div class="setting-item">
            <div class="setting-label">
                <span>Сбросить все данные</span>
                <p class="setting-description">Сбросить все данные приложения (задания, статистику, дневник, серию дней)</p>
            </div>
            <button id="reset-all-button" class="danger-button">Сбросить</button>
        </div>
    `;
    
    content.appendChild(themeSettings);
    content.appendChild(appSettings);
    undergroundTab.appendChild(content);
    
    // Добавляем на страницу
    document.body.appendChild(undergroundTab);
    
    // Добавляем область для свайпа
    const swipeOverlay = document.createElement('div');
    swipeOverlay.className = 'swipe-overlay';
    document.body.appendChild(swipeOverlay);
    
    // Добавляем специальную область для свайпа
    const swipeHandle = document.createElement('div');
    swipeHandle.className = 'swipe-handle';
    document.body.appendChild(swipeHandle);
    
    // Добавляем подсказку о свайпе
    const swipeHint = document.createElement('div');
    swipeHint.className = 'swipe-hint';
    swipeHint.innerHTML = '<i class="fas fa-arrow-up"></i> Свайпните вверх для настроек';
    document.body.appendChild(swipeHint);
    
    // Инициализируем обработчики для настроек
    initSettingsHandlers();
}

// Показать подсказку о свайпе
function showSwipeHint() {
    // Проверяем, показывали ли мы уже подсказку
    const hintShown = localStorage.getItem('swipe_hint_shown');
    
    if (!hintShown) {
        // Показываем подсказку через 2 секунды после загрузки страницы
        setTimeout(() => {
            const swipeHint = document.querySelector('.swipe-hint');
            if (swipeHint) {
                swipeHint.classList.add('visible');
                
                // Скрываем подсказку через 5 секунд
                setTimeout(() => {
                    swipeHint.classList.remove('visible');
                    
                    // Запоминаем, что подсказка была показана
                    localStorage.setItem('swipe_hint_shown', 'true');
                }, 5000);
            }
        }, 2000);
    }
}

// Инициализация обработчиков для настроек
function initSettingsHandlers() {
    // Обработчики для выбора темы
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            
            // Обновляем активную опцию
            themeOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            // Сохраняем настройку
            localStorage.setItem('theme', theme);
        });
    });
    
    // Обработчик для переключателя звуков
    const soundsToggle = document.getElementById('sounds-toggle');
    if (soundsToggle) {
        soundsToggle.addEventListener('change', function() {
            localStorage.setItem('sounds_enabled', this.checked);
        });
    }
    
    // Обработчик для кнопки сброса
    const resetButton = document.getElementById('reset-all-button');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            if (confirm('Вы уверены, что хотите сбросить все данные приложения? Это действие нельзя отменить.')) {
                resetAllData();
            }
        });
    }
}

// Загрузка сохраненных настроек
function loadSettings() {
    // Загружаем тему
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Отмечаем активную опцию темы
    const activeThemeOption = document.querySelector(`.theme-option[data-theme="${savedTheme}"]`);
    if (activeThemeOption) {
        activeThemeOption.classList.add('active');
    }
    
    // Загружаем настройку звуков
    const soundsEnabled = localStorage.getItem('sounds_enabled') !== 'false';
    const soundsToggle = document.getElementById('sounds-toggle');
    if (soundsToggle) {
        soundsToggle.checked = soundsEnabled;
    }
}

// Установка темы
function setTheme(theme) {
    if (theme === 'dark') {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Сброс всех данных
function resetAllData() {
    // Очищаем все данные из localStorage, кроме настроек темы
    const theme = localStorage.getItem('theme');
    const soundsEnabled = localStorage.getItem('sounds_enabled');
    
    localStorage.clear();
    
    // Восстанавливаем настройки темы
    localStorage.setItem('theme', theme || 'light');
    localStorage.setItem('sounds_enabled', soundsEnabled !== 'false');
    
    // Перезагружаем страницу
    window.location.reload();
}

// Инициализация обнаружения свайпа
function initSwipeDetection() {
    // Используем специальную область для свайпа вместо оверлея
    const swipeHandle = document.querySelector('.swipe-handle');
    if (!swipeHandle) return;
    
    let startY = 0;
    let startTime = 0;
    
    // Обработчик начала касания
    swipeHandle.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        startTime = Date.now();
    });
    
    // Обработчик движения пальца
    swipeHandle.addEventListener('touchmove', function(e) {
        if (!startY) return;
        
        const currentY = e.touches[0].clientY;
        const diff = startY - currentY;
        
        // Если свайп вверх и достаточно длинный
        if (diff > 30) {
            e.preventDefault();
            showUndergroundTab();
            startY = 0;
        }
    });
    
    // Обработчик окончания касания
    swipeHandle.addEventListener('touchend', function(e) {
        const endTime = Date.now();
        const timeDiff = endTime - startTime;
        
        // Сбрасываем начальную позицию
        startY = 0;
    });
    
    // Добавляем обработчик свайпа вниз для закрытия вкладки
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        let tabStartY = 0;
        
        undergroundTab.addEventListener('touchstart', function(e) {
            tabStartY = e.touches[0].clientY;
        });
        
        undergroundTab.addEventListener('touchmove', function(e) {
            if (!tabStartY) return;
            
            const currentY = e.touches[0].clientY;
            const diff = currentY - tabStartY;
            
            // Если свайп вниз и достаточно длинный
            if (diff > 50) {
                hideUndergroundTab();
                tabStartY = 0;
            }
        });
        
        undergroundTab.addEventListener('touchend', function() {
            tabStartY = 0;
        });
    }
    
    // Добавляем обработчик клика на нижнюю навигацию
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        // Убедимся, что клики на нижней навигации работают
        bottomNav.addEventListener('click', function(e) {
            // Если клик был на ссылке, убедимся, что она работает
            if (e.target.closest('a')) {
                e.stopPropagation(); // Останавливаем всплытие события
            }
        });
    }
}

// Показать подземную вкладку
function showUndergroundTab() {
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        undergroundTab.classList.add('visible');
    }
}

// Скрыть подземную вкладку
function hideUndergroundTab() {
    const undergroundTab = document.querySelector('.underground-tab');
    if (undergroundTab) {
        undergroundTab.classList.remove('visible');
    }
} 