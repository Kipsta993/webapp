// Мультитач-функциональность для Weekly
(function() {
    // Получаем элементы задач
    const taskItems = document.querySelectorAll('.task-item');
    
    // Массив для отслеживания активных касаний
    let currentTouches = [];
    
    // Генерация случайного цвета для каждого касания
    function getRandomColor() {
        const colors = [
            '#FF5733', '#33FF57', '#3357FF', '#F033FF', '#FF33A8',
            '#33FFF6', '#FFD133', '#8C33FF', '#FF8C33', '#33FFBD'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    // Находит индекс касания в массиве currentTouches по идентификатору
    function findCurrentTouchIndex(idToFind) {
        for (let i = 0; i < currentTouches.length; i++) {
            if (currentTouches[i].identifier === idToFind) {
                return i;
            }
        }
        return -1;
    }
    
    // Обработчик начала касания
    function touchStartHandler(event) {
        event.preventDefault();
        
        const touches = event.changedTouches;
        const taskItem = this;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            
            // Создаем эффект касания
            const touchEffect = document.createElement('div');
            touchEffect.className = 'touch-effect';
            touchEffect.style.position = 'absolute';
            touchEffect.style.left = (touch.pageX - 25) + 'px';
            touchEffect.style.top = (touch.pageY - 25) + 'px';
            touchEffect.style.width = '50px';
            touchEffect.style.height = '50px';
            touchEffect.style.borderRadius = '50%';
            touchEffect.style.opacity = '0.5';
            
            // Генерируем случайный цвет для касания
            const color = getRandomColor();
            touchEffect.style.backgroundColor = color;
            touchEffect.style.zIndex = '1000';
            touchEffect.style.pointerEvents = 'none';
            touchEffect.style.transition = 'transform 0.3s, opacity 0.3s';
            touchEffect.style.transform = 'scale(1)';
            
            // Добавляем эффект на страницу
            document.body.appendChild(touchEffect);
            
            // Сохраняем информацию о касании
            currentTouches.push({
                identifier: touch.identifier,
                pageX: touch.pageX,
                pageY: touch.pageY,
                color: color,
                element: taskItem,
                effect: touchEffect
            });
            
            // Добавляем класс активного касания к элементу задачи
            taskItem.classList.add('touch-active');
            
            // Анимация при касании
            taskItem.style.transform = 'scale(1.02)';
            taskItem.style.transition = 'transform 0.2s';
        }
    }
    
    // Обработчик движения касания
    function touchMoveHandler(event) {
        event.preventDefault();
        
        const touches = event.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const currentTouchIndex = findCurrentTouchIndex(touch.identifier);
            
            if (currentTouchIndex >= 0) {
                const currentTouch = currentTouches[currentTouchIndex];
                
                // Обновляем позицию эффекта касания
                if (currentTouch.effect) {
                    currentTouch.effect.style.left = (touch.pageX - 25) + 'px';
                    currentTouch.effect.style.top = (touch.pageY - 25) + 'px';
                }
                
                // Обновляем информацию о касании
                currentTouch.pageX = touch.pageX;
                currentTouch.pageY = touch.pageY;
                
                // Обновляем массив
                currentTouches.splice(currentTouchIndex, 1, currentTouch);
            }
        }
    }
    
    // Обработчик окончания касания
    function touchEndHandler(event) {
        event.preventDefault();
        
        const touches = event.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const currentTouchIndex = findCurrentTouchIndex(touch.identifier);
            
            if (currentTouchIndex >= 0) {
                const currentTouch = currentTouches[currentTouchIndex];
                
                // Анимация исчезновения эффекта касания
                if (currentTouch.effect) {
                    currentTouch.effect.style.transform = 'scale(0)';
                    currentTouch.effect.style.opacity = '0';
                    
                    // Удаляем эффект после завершения анимации
                    setTimeout(() => {
                        if (currentTouch.effect && currentTouch.effect.parentNode) {
                            currentTouch.effect.parentNode.removeChild(currentTouch.effect);
                        }
                    }, 300);
                }
                
                // Удаляем класс активного касания
                if (currentTouch.element) {
                    currentTouch.element.classList.remove('touch-active');
                    currentTouch.element.style.transform = '';
                }
                
                // Удаляем информацию о касании из массива
                currentTouches.splice(currentTouchIndex, 1);
                
                // Если касание завершилось на элементе задачи, активируем чекбокс
                if (currentTouch.element) {
                    const checkbox = currentTouch.element.querySelector('input[type="checkbox"]');
                    if (checkbox && !checkbox.disabled && !checkbox.checked) {
                        checkbox.checked = true;
                        
                        // Вызываем событие change, чтобы сработали обработчики
                        const event = new Event('change');
                        checkbox.dispatchEvent(event);
                    }
                }
            }
        }
    }
    
    // Обработчик отмены касания
    function touchCancelHandler(event) {
        event.preventDefault();
        
        const touches = event.changedTouches;
        
        for (let i = 0; i < touches.length; i++) {
            const touch = touches[i];
            const currentTouchIndex = findCurrentTouchIndex(touch.identifier);
            
            if (currentTouchIndex >= 0) {
                const currentTouch = currentTouches[currentTouchIndex];
                
                // Удаляем эффект касания
                if (currentTouch.effect && currentTouch.effect.parentNode) {
                    currentTouch.effect.parentNode.removeChild(currentTouch.effect);
                }
                
                // Удаляем класс активного касания
                if (currentTouch.element) {
                    currentTouch.element.classList.remove('touch-active');
                    currentTouch.element.style.transform = '';
                }
                
                // Удаляем информацию о касании из массива
                currentTouches.splice(currentTouchIndex, 1);
            }
        }
    }
    
    // Добавляем обработчики событий к элементам задач
    taskItems.forEach(taskItem => {
        taskItem.addEventListener('touchstart', touchStartHandler);
        taskItem.addEventListener('touchmove', touchMoveHandler);
        taskItem.addEventListener('touchend', touchEndHandler);
        taskItem.addEventListener('touchcancel', touchCancelHandler);
    });
    
    // Добавляем стили для мультитач-эффектов
    const style = document.createElement('style');
    style.textContent = `
        .task-item {
            position: relative;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .task-item.touch-active {
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 10;
        }
        
        .touch-effect {
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.7; }
            100% { transform: scale(1); opacity: 0.5; }
        }
    `;
    document.head.appendChild(style);
})(); 