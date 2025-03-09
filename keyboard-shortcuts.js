// Обработчик клавиатурных сокращений
document.addEventListener('keydown', function(event) {
    // Проверяем, что нажата клавиша K и не в поле ввода
    if (event.key === 'k' || event.key === 'K') {
        // Проверяем, что фокус не в поле ввода
        const activeElement = document.activeElement;
        const isInputField = activeElement.tagName === 'INPUT' || 
                             activeElement.tagName === 'TEXTAREA' || 
                             activeElement.isContentEditable;
        
        if (!isInputField) {
            console.log('Открываю настройки по нажатию клавиши K');
            
            // Проверяем, существует ли функция showUndergroundTab
            if (typeof showUndergroundTab === 'function') {
                showUndergroundTab();
            } else {
                console.error('Функция showUndergroundTab не найдена');
                
                // Пытаемся найти элемент настроек и показать его
                const undergroundTab = document.querySelector('.underground-tab');
                if (undergroundTab) {
                    undergroundTab.classList.add('visible');
                    console.log('Настройки открыты через DOM');
                } else {
                    console.error('Элемент .underground-tab не найден');
                }
            }
            
            // Предотвращаем стандартное действие клавиши
            event.preventDefault();
        }
    }
});

console.log('Обработчик клавиатурных сокращений загружен. Нажмите K для открытия настроек.'); 