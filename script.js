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
    const activeQuestSection = document.querySelector('.active-quest');
    const availableQuestsGrid = document.querySelector('.quest-grid');

    takeQuestButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Проверяем, есть ли уже активный квест
            const activeQuest = document.querySelector('.quest-card.active');
            if (activeQuest) {
                alert('У вас уже есть активный квест. Сначала завершите его.');
                return;
            }

            // Получаем карточку квеста
            const questCard = this.closest('.quest-card');
            const questContent = questCard.innerHTML;

            // Создаем новую карточку для активного квеста
            const newActiveQuest = document.createElement('div');
            newActiveQuest.className = 'quest-card active';
            newActiveQuest.innerHTML = questContent;

            // Заменяем кнопку "Взять квест" на кнопку "Завершить"
            const takeButton = newActiveQuest.querySelector('.take-quest-btn');
            const completeButton = document.createElement('button');
            completeButton.className = 'complete-btn';
            completeButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <span>Завершить квест</span>
            `;

            takeButton.parentNode.replaceChild(completeButton, takeButton);

            // Добавляем прогресс-бар
            const questContentDiv = newActiveQuest.querySelector('.quest-content');
            const progressDiv = document.createElement('div');
            progressDiv.className = 'quest-progress';
            progressDiv.innerHTML = `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
                <span>0%</span>
            `;
            questContentDiv.insertBefore(progressDiv, completeButton);

            // Обновляем активный квест
            activeQuestSection.querySelector('.quest-card')?.remove();
            activeQuestSection.appendChild(newActiveQuest);

            // Удаляем квест из доступных
            questCard.remove();

            // Добавляем обработчик для кнопки завершения
            completeButton.addEventListener('click', function() {
                if (!this.classList.contains('completed')) {
                    this.classList.add('completed');
                    
                    // Анимация завершения
                    const questCard = this.closest('.quest-card');
                    questCard.style.animation = 'questComplete 0.5s ease forwards';
                    
                    // Обновляем счетчик монет
                    const reward = parseInt(questCard.querySelector('.quest-reward-badge span').textContent);
                    const currentCoins = parseInt(document.querySelector('.coin-counter span').textContent.replace(',', ''));
                    document.querySelector('.coin-counter span').textContent = (currentCoins + reward).toLocaleString();
                    
                    // Удаляем квест после анимации
                    setTimeout(() => {
                        questCard.remove();
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
