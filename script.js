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

    // Функции для работы с localStorage
    const saveQuestState = () => {
        const activeQuest = activeQuestSection.querySelector('.quest-content');
        const availableQuests = Array.from(document.querySelectorAll('.quest-grid .quest-card')).map(card => {
            return {
                content: card.querySelector('.quest-content').innerHTML
            };
        });

        localStorage.setItem('activeQuest', activeQuest ? activeQuest.innerHTML : '');
        localStorage.setItem('availableQuests', JSON.stringify(availableQuests));
        localStorage.setItem('coins', coinCounter.textContent);
    };

    const loadQuestState = () => {
        // Загружаем монеты
        const savedCoins = localStorage.getItem('coins');
        if (savedCoins) {
            coinCounter.textContent = savedCoins;
        }

        // Загружаем активный квест
        const savedActiveQuest = localStorage.getItem('activeQuest');
        if (savedActiveQuest && savedActiveQuest !== '') {
            activeQuestSection.innerHTML = `
                <div class="quest-content">
                    ${savedActiveQuest}
                </div>
            `;
            
            // Восстанавливаем функциональность кнопки завершения
            const completeButton = activeQuestSection.querySelector('.take-quest-btn');
            if (completeButton) {
                completeButton.textContent = 'Завершить квест';
                completeButton.classList.add('complete-btn');
                setupCompleteButton(completeButton);
            }
        }

        // Загружаем доступные квесты
        const savedQuests = JSON.parse(localStorage.getItem('availableQuests') || '[]');
        const questGrid = document.querySelector('.quest-grid');
        if (savedQuests.length > 0) {
            questGrid.innerHTML = savedQuests.map(quest => `
                <div class="quest-card">
                    ${quest.content}
                </div>
            `).join('');
            
            // Восстанавливаем обработчики событий для кнопок
            setupQuestButtons();
        }
    };

    // Функция настройки кнопки завершения
    const setupCompleteButton = (button) => {
        button.addEventListener('click', function() {
            if (!this.classList.contains('completed')) {
                this.classList.add('completed');
                
                const questCard = this.closest('.quest-card');
                const reward = parseInt(questCard.querySelector('.quest-reward span').textContent);
                const currentCoins = parseInt(coinCounter.textContent.replace(',', ''));
                coinCounter.textContent = (currentCoins + reward).toLocaleString();
                
                // Анимируем исчезновение завершенного квеста
                questCard.style.opacity = '0';
                questCard.style.transform = 'translateY(-10px)';
                
                setTimeout(() => {
                    activeQuestSection.innerHTML = `
                        <div class="quest-card">
                            <div class="quest-content" style="opacity: 0; transform: translateY(10px);">
                                <h3>Нет активного квеста</h3>
                                <p>Выберите квест из списка ниже</p>
                            </div>
                        </div>
                    `;
                    
                    // Плавно показываем сообщение
                    requestAnimationFrame(() => {
                        const newContent = activeQuestSection.querySelector('.quest-content');
                        newContent.style.opacity = '1';
                        newContent.style.transform = 'translateY(0)';
                    });
                    
                    saveQuestState();
                }, 300);
            }
        });
    };

    // Функция настройки всех кнопок квестов
    const setupQuestButtons = () => {
        const takeQuestButtons = document.querySelectorAll('.take-quest-btn');
        const detailsBtns = document.querySelectorAll('.details-btn');

        takeQuestButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Если кнопка уже в активном квесте, обрабатываем завершение
                if (this.closest('.quest-card').closest('.active-quest')) {
                    if (!this.classList.contains('completed')) {
                        this.classList.add('completed');
                        
                        const questCard = this.closest('.quest-card');
                        const reward = parseInt(questCard.querySelector('.quest-reward span').textContent);
                        const currentCoins = parseInt(coinCounter.textContent.replace(',', ''));
                        coinCounter.textContent = (currentCoins + reward).toLocaleString();
                        
                        questCard.style.opacity = '0';
                        questCard.style.transform = 'translateY(-10px)';
                        
                        setTimeout(() => {
                            activeQuestSection.innerHTML = `
                                <div class="quest-card">
                                    <div class="quest-content">
                                        <h3>Нет активного квеста</h3>
                                        <p>Выберите квест из списка ниже</p>
                                    </div>
                                </div>
                            `;
                            saveQuestState();
                        }, 300);
                    }
                    return;
                }

                const questCard = this.closest('.quest-card');
                
                // Проверяем текущий активный квест
                const activeQuestContent = activeQuestSection.querySelector('.quest-content');
                const isNoActiveQuest = activeQuestContent.querySelector('p')?.textContent === 'Выберите квест из списка ниже';
                
                if (!isNoActiveQuest) {
                    alert('Сначала завершите текущий квест');
                    return;
                }

                // Создаем копию карточки квеста
                const questClone = questCard.cloneNode(true);
                
                // Меняем только свойства кнопки
                const cloneButton = questClone.querySelector('.take-quest-btn');
                cloneButton.textContent = 'Завершить квест';
                cloneButton.classList.add('complete-btn');

                // Очищаем активную секцию и добавляем клон
                activeQuestSection.innerHTML = '';
                activeQuestSection.appendChild(questClone);

                // Анимируем исчезновение оригинального квеста
                questCard.style.opacity = '0';
                questCard.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    questCard.remove();
                    saveQuestState();
                }, 200);
            });
        });

        // Настраиваем кнопки деталей
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
    };

    // Загружаем сохраненное состояние при запуске
    loadQuestState();
    
    // Настраиваем кнопки при первой загрузке
    setupQuestButtons();

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
