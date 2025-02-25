document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addEntryBtn = document.getElementById('add-entry-btn');
    const entryModal = document.getElementById('entry-modal');
    const viewEntryModal = document.getElementById('view-entry-modal');
    const closeBtn = document.querySelector('.close-btn');
    const viewCloseBtn = document.querySelector('.view-close-btn');
    const entryForm = document.getElementById('entry-form');
    const entriesContainer = document.getElementById('entries-container');
    
    // Элементы модального окна просмотра
    const viewEntryTitle = document.getElementById('view-entry-title');
    const viewEntryDate = document.getElementById('view-entry-date');
    const viewEntryDescription = document.getElementById('view-entry-description');
    const viewEntryImageContainer = document.getElementById('view-entry-image-container');
    
    // Загрузка общих данных (монеты, серия дней)
    loadCommonData();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Загрузка существующих заметок из localStorage
    loadEntries();
    
    // Обработчики событий
    addEntryBtn.addEventListener('click', openAddModal);
    closeBtn.addEventListener('click', closeAddModal);
    viewCloseBtn.addEventListener('click', closeViewModal);
    entryForm.addEventListener('submit', saveEntry);
    
    // Закрытие модальных окон при клике вне их содержимого
    window.addEventListener('click', function(event) {
        if (event.target === entryModal) {
            closeAddModal();
        }
        if (event.target === viewEntryModal) {
            closeViewModal();
        }
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
            section, .bottom-nav, .diary-entry, .modal-content {
                background-color: #444 !important;
                color: #f5f5f5 !important;
            }
            
            .bottom-nav a {
                color: #aaa !important;
            }
            
            .bottom-nav a.active {
                color: #8e44ad !important;
            }
            
            .diary-entry-date, .view-entry-date {
                color: #ccc !important;
            }
            
            .form-group input, .form-group textarea {
                background-color: #555 !important;
                color: #f5f5f5 !important;
                border-color: #666 !important;
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
            section, .modal-content {
                background-color: ${adjustColor(backgroundColor, 20)} !important;
            }
            
            .bottom-nav {
                background-color: ${adjustColor(backgroundColor, 10)} !important;
            }
            
            .bottom-nav a {
                color: ${adjustColor(textColor, -20)} !important;
            }
            
            .bottom-nav a.active, .add-entry-btn, .submit-btn {
                color: white !important;
                background-color: ${accentColor} !important;
            }
            
            .diary-entry {
                background-color: ${adjustColor(backgroundColor, 10)} !important;
                border-left-color: ${accentColor} !important;
            }
            
            .diary-entry-date, .view-entry-date {
                color: ${adjustColor(textColor, -20)} !important;
            }
            
            .form-group input, .form-group textarea {
                background-color: ${backgroundColor} !important;
                color: ${textColor} !important;
                border-color: ${adjustColor(backgroundColor, -20)} !important;
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
    
    // Функция открытия модального окна добавления
    function openAddModal() {
        entryModal.style.display = 'flex';
    }
    
    // Функция закрытия модального окна добавления
    function closeAddModal() {
        entryModal.style.display = 'none';
        entryForm.reset();
    }
    
    // Функция открытия модального окна просмотра
    function openViewModal(entry) {
        // Заполнение данными
        viewEntryTitle.textContent = entry.title;
        viewEntryDate.textContent = entry.date;
        viewEntryDescription.textContent = entry.description;
        
        // Очистка контейнера изображения
        viewEntryImageContainer.innerHTML = '';
        
        // Добавление изображения, если оно есть
        if (entry.image) {
            const img = document.createElement('img');
            img.src = entry.image;
            img.alt = entry.title;
            img.classList.add('view-entry-image');
            viewEntryImageContainer.appendChild(img);
        }
        
        // Отображение модального окна
        viewEntryModal.style.display = 'flex';
    }
    
    // Функция закрытия модального окна просмотра
    function closeViewModal() {
        viewEntryModal.style.display = 'none';
    }
    
    // Функция сохранения заметки
    function saveEntry(event) {
        event.preventDefault();
        
        const title = document.getElementById('entry-title').value;
        const description = document.getElementById('entry-description').value;
        const imageInput = document.getElementById('entry-image');
        
        // Создание новой заметки
        const entry = {
            id: Date.now(),
            title: title,
            description: description,
            date: new Date().toLocaleDateString('ru-RU'),
            image: null
        };
        
        // Обработка изображения, если оно выбрано
        if (imageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(e) {
                entry.image = e.target.result;
                saveEntryToStorage(entry);
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            saveEntryToStorage(entry);
        }
    }
    
    // Сохранение заметки в localStorage
    function saveEntryToStorage(entry) {
        // Получение существующих заметок
        let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Добавление новой заметки
        entries.push(entry);
        
        // Сохранение обновленного списка заметок
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        
        // Обновление отображения
        addEntryToDOM(entry);
        
        // Закрытие модального окна
        closeAddModal();
        
        // Добавляем монеты за создание заметки
        addCoins(3);
    }
    
    // Функция для добавления монет
    function addCoins(amount) {
        const coinCountElement = document.getElementById('coin-count');
        let currentCoins = parseInt(coinCountElement.textContent);
        currentCoins += amount;
        
        coinCountElement.textContent = currentCoins;
        localStorage.setItem('coins', currentCoins);
    }
    
    // Загрузка заметок из localStorage
    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Если заметок нет, показываем сообщение
        if (entries.length === 0) {
            entriesContainer.innerHTML = '<p class="no-entries">У вас пока нет заметок. Нажмите на кнопку "+" чтобы добавить первую заметку.</p>';
            return;
        }
        
        // Очистка контейнера
        entriesContainer.innerHTML = '';
        
        // Добавление заметок в DOM
        entries.forEach(entry => {
            addEntryToDOM(entry);
        });
    }
    
    // Добавление заметки в DOM
    function addEntryToDOM(entry) {
        // Удаление сообщения о пустом списке, если оно есть
        const noEntriesMsg = document.querySelector('.no-entries');
        if (noEntriesMsg) {
            noEntriesMsg.remove();
        }
        
        // Создание элемента заметки
        const entryElement = document.createElement('div');
        entryElement.classList.add('diary-entry');
        entryElement.dataset.id = entry.id;
        
        // Создание HTML для заметки (только заголовок и дата)
        let entryHTML = `
            <div class="diary-entry-header">
                <div class="diary-entry-title">${entry.title}</div>
                <div class="diary-entry-date">${entry.date}</div>
            </div>
        `;
        
        entryElement.innerHTML = entryHTML;
        
        // Добавление обработчика для открытия модального окна просмотра
        entryElement.addEventListener('click', function() {
            openViewModal(entry);
        });
        
        // Добавление заметки в контейнер (в начало списка)
        entriesContainer.insertBefore(entryElement, entriesContainer.firstChild);
    }
});
