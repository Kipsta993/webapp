document.addEventListener('DOMContentLoaded', function() {
    // Тема
    const themeBtn = document.querySelector('.theme-btn');
    const body = document.body;

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        body.classList.add('light-theme');
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            body.classList.toggle('light-theme');
            localStorage.setItem('theme', body.classList.contains('light-theme') ? 'light' : 'dark');
        });
    }

    // Квесты
    const takeQuestButtons = document.querySelectorAll('.take-quest-btn');
    const activeQuestSection = document.querySelector('.active-quest .quest-card');
    const coinCounter = document.querySelector('.coin-counter span');
    const modal = document.getElementById('questDetailsModal');
    const detailsBtns = document.querySelectorAll('.details-btn');
    const closeModal = document.querySelector('.close-modal');

    // Данные квестов
    const questDetails = {
        'Утренняя зарядка': {
            description: 'Выполни комплекс упражнений для поддержания здоровья',
            requirements: [
                '20 отжиманий',
                '30 приседаний',
                '10 подтягиваний'
            ],
            reward: 50
        },
        'Чтение книги': {
            description: 'Прочитай определенное количество страниц для развития',
            requirements: [
                'Прочитать 50 страниц',
                'Сделать заметки',
                'Уделить минимум 1 час'
            ],
            reward: 30
        }
    };

    // Обработка кнопок взятия квеста
    if (takeQuestButtons && activeQuestSection) {
        takeQuestButtons.forEach(button => {
            button.addEventListener('click', function() {
                const questCard = this.closest('.quest-card');
                const questContent = questCard.querySelector('.quest-content').innerHTML;
                
                // Проверяем, нет ли уже активного квеста
                const currentActiveQuest = activeQuestSection.querySelector('.quest-content h3').textContent;
                if (currentActiveQuest !== 'Нет активного квеста') {
                    alert('Сначала завершите текущий квест');
                    return;
                }

                // Обновляем содержимое активного квеста
                activeQuestSection.querySelector('.quest-content').innerHTML = questContent;
                
                // Меняем кнопку на "Завершить"
                const completeButton = activeQuestSection.querySelector('.take-quest-btn');
                completeButton.textContent = 'Завершить квест';
                completeButton.classList.add('complete-btn');

                // Удаляем кнопку деталей из активного квеста
                const detailsBtn = activeQuestSection.querySelector('.details-btn');
                if (detailsBtn) {
                    detailsBtn.remove();
                }

                // Обработчик завершения квеста
                completeButton.addEventListener('click', function() {
                    if (!this.classList.contains('completed')) {
                        this.classList.add('completed');
                        
                        // Получаем награду
                        const reward = parseInt(activeQuestSection.querySelector('.quest-reward span').textContent);
                        const currentCoins = parseInt(coinCounter.textContent.replace(',', ''));
                        coinCounter.textContent = (currentCoins + reward).toLocaleString();
                        
                        // Возвращаем исходное состояние
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

                // Анимация исчезновения квеста из доступных
                questCard.style.opacity = '0';
                questCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    questCard.remove();
                }, 200);
            });
        });
    }

    // Обработка кнопок деталей
    if (detailsBtns && modal) {
        detailsBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const questCard = this.closest('.quest-card');
                const questName = questCard.querySelector('h3').textContent;
                const details = questDetails[questName];

                modal.querySelector('.modal-header h3').textContent = questName;
                modal.querySelector('.quest-description').textContent = details.description;
                
                const requirementsList = modal.querySelector('.quest-requirements ul');
                requirementsList.innerHTML = details.requirements
                    .map(req => `<li>${req}</li>`)
                    .join('');

                modal.querySelector('.reward-details').innerHTML = `
                    <div class="quest-reward">
                        <img src="image2.png" alt="Coin" class="reward-icon">
                        <span>${details.reward}</span>
                    </div>
                `;

                modal.classList.add('show');
            });
        });

        // Закрытие модального окна
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.classList.remove('show');
            });
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }
}); 
