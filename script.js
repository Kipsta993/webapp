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
}); 
