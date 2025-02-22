const themeBtn = document.querySelector('.theme-btn');
const body = document.body;

// Проверяем сохраненную тему
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-theme');
}

themeBtn.addEventListener('click', () => {
    body.classList.toggle('light-theme');
    // Сохраняем выбор темы
    localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
});

document.querySelectorAll('.complete-btn').forEach((button, index) => {
    // Проверяем сохраненное состояние при загрузке
    const isCompleted = localStorage.getItem(`task_${index}_completed`) === 'true';
    if (isCompleted) {
        button.classList.add('completed');
        button.closest('.task-card').classList.add('completed');
    }

    button.addEventListener('click', function() {
        if (!this.classList.contains('completed')) {
            this.classList.add('completed');
            this.closest('.task-card').classList.add('completed');
            // Сохраняем состояние в localStorage
            localStorage.setItem(`task_${index}_completed`, 'true');
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const completeButtons = document.querySelectorAll('.complete-btn');
    const streakCounter = document.querySelector('.streak-counter span');
    
    completeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Добавляем класс completed для кнопки
            this.classList.add('completed');
            
            // Добавляем класс completed для карточки квеста
            const questCard = this.closest('.quest-card');
            questCard.classList.add('completed');
            
            // Увеличиваем счетчик дней
            let currentStreak = parseInt(streakCounter.textContent);
            streakCounter.textContent = currentStreak + 1;
            
            // Удаляем карточку после анимации
            setTimeout(() => {
                questCard.style.display = 'none';
            }, 500);
        });
    });

    // Обработка кнопок "Взять квест"
    const takeQuestButtons = document.querySelectorAll('.take-quest-btn');
    const activeQuestSection = document.querySelector('.active-quest .quest-card');
    const coinCounter = document.querySelector('.coin-counter span');

    takeQuestButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questCard = this.closest('.quest-card');
            const questContent = questCard.innerHTML;

            activeQuestSection.innerHTML = questContent;
            const completeButton = activeQuestSection.querySelector('.take-quest-btn');
            completeButton.textContent = 'Завершить квест';
            completeButton.classList.add('complete-btn');

            completeButton.addEventListener('click', function() {
                if (!this.classList.contains('completed')) {
                    this.classList.add('completed');
                    
                    const reward = parseInt(questCard.querySelector('.quest-reward-badge span').textContent);
                    const currentCoins = parseInt(coinCounter.textContent.replace(',', ''));
                    coinCounter.textContent = (currentCoins + reward).toLocaleString();
                    
                    setTimeout(() => {
                        activeQuestSection.innerHTML = `
                            <div class="quest-content">
                                <h3>Нет активного квеста</h3>
                                <p>Выберите квест из списка ниже</p>
                            </div>
                        `;
                    }, 500);
                }
            });
        });
    });

    // Обновление таймера
    function updateTimer() {
        const timerElement = document.querySelector('.quest-timer span');
        if (!timerElement) return;

        let [hours, minutes, seconds] = timerElement.textContent.split(':').map(Number);
        
        setInterval(() => {
            if (seconds > 0) {
                seconds--;
            } else if (minutes > 0) {
                minutes--;
                seconds = 59;
            } else if (hours > 0) {
                hours--;
                minutes = 59;
                seconds = 59;
            }
            
            timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }, 1000);
    }

    updateTimer();

    // Добавляем стили для анимации завершения квеста
    const style = document.createElement('style');
    style.textContent = `
        @keyframes questComplete {
            0% {
                transform: scale(1);
                opacity: 1;
            }
            50% {
                transform: scale(1.05);
            }
            100% {
                transform: scale(0);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}); 
