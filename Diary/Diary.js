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
    
    // Загрузка общих данных (серия дней)
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
                background-color: #444;
                color: #f5f5f5;
            }
            
            .bottom-nav a {
                color: #aaa;
            }
            
            .bottom-nav a.active {
                color: #fff;
            }
            
            .diary-entry-date, .view-entry-date {
                color: #ccc;
            }
            
            .form-group input, .form-group textarea {
                background-color: #555;
                color: #f5f5f5;
                border-color: #666;
            }
        `;
        
        // Удаляем предыдущие стили, если они есть
        const existingStyle = document.getElementById('custom-theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
    }
    
    // Функция для применения пользовательской темы
    function applyCustomTheme() {
        const customColors = localStorage.getItem('customColors');
        if (!customColors) return;
        
        const colors = JSON.parse(customColors);
        
        document.body.style.backgroundColor = colors.background;
        document.body.style.color = colors.text;
        
        // Добавляем стили для пользовательской темы
        const style = document.createElement('style');
        style.id = 'custom-theme-styles';
        style.textContent = `
            section, .bottom-nav, .modal-content {
                background-color: ${adjustColor(colors.background, 20)};
                color: ${colors.text};
            }
            
            .diary-entry {
                background-color: ${adjustColor(colors.background, 10)};
                color: ${colors.text};
                border-left-color: ${colors.accent};
            }
            
            .bottom-nav a {
                color: ${adjustColor(colors.text, -30)};
            }
            
            .bottom-nav a.active {
                color: ${colors.accent};
            }
            
            .diary-entry-date, .view-entry-date {
                color: ${adjustColor(colors.text, -20)};
            }
            
            .form-group input, .form-group textarea {
                background-color: ${adjustColor(colors.background, 5)};
                color: ${colors.text};
                border-color: ${adjustColor(colors.background, 30)};
            }
            
            .submit-btn {
                background-color: ${colors.accent};
            }
        `;
        
        // Удаляем предыдущие стили, если они есть
        const existingStyle = document.getElementById('custom-theme-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);
    }
    
    // Функция для настройки цвета (осветление/затемнение)
    function adjustColor(color, amount) {
        const clamp = (val) => Math.min(255, Math.max(0, val));
        
        // Преобразуем hex в rgb
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        // Настраиваем значения
        const adjustedR = clamp(r + amount);
        const adjustedG = clamp(g + amount);
        const adjustedB = clamp(b + amount);
        
        // Преобразуем обратно в hex
        return `#${adjustedR.toString(16).padStart(2, '0')}${adjustedG.toString(16).padStart(2, '0')}${adjustedB.toString(16).padStart(2, '0')}`;
    }
    
    // Открытие модального окна для добавления заметки
    function openAddModal() {
        entryModal.style.display = 'block';
        document.getElementById('entry-title').value = '';
        document.getElementById('entry-description').value = '';
        document.getElementById('entry-image').value = '';
    }
    
    // Закрытие модального окна для добавления заметки
    function closeAddModal() {
        entryModal.style.display = 'none';
    }
    
    // Открытие модального окна для просмотра заметки
    function openViewModal(entry) {
        viewEntryModal.style.display = 'block';
        
        // Заполнение данными
        viewEntryTitle.textContent = entry.title;
        viewEntryDate.textContent = new Date(entry.date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        viewEntryDescription.textContent = entry.description;
        
        // Очистка контейнера изображения
        viewEntryImageContainer.innerHTML = '';
        
        // Добавление изображения, если оно есть
        if (entry.image) {
            const img = document.createElement('img');
            img.src = entry.image;
            img.alt = entry.title;
            img.className = 'view-entry-image';
            viewEntryImageContainer.appendChild(img);
        }
    }
    
    // Закрытие модального окна для просмотра заметки
    function closeViewModal() {
        viewEntryModal.style.display = 'none';
    }
    
    // Сохранение заметки
    function saveEntry(event) {
        event.preventDefault();
        
        const titleInput = document.getElementById('entry-title');
        const descriptionInput = document.getElementById('entry-description');
        const imageInput = document.getElementById('entry-image');
        
        // Создание объекта заметки
        const entry = {
            id: Date.now(), // Уникальный идентификатор
            title: titleInput.value,
            description: descriptionInput.value,
            date: new Date().toISOString(),
            image: null // Изначально изображения нет
        };
        
        // Если выбрано изображение, добавляем его
        if (imageInput.files && imageInput.files[0]) {
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
    }
    
    // Загрузка заметок из localStorage
    function loadEntries() {
        const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Очистка контейнера
        entriesContainer.innerHTML = '';
        
        // Если заметок нет, показываем сообщение
        if (entries.length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = 'У вас пока нет заметок. Нажмите + чтобы добавить первую заметку.';
            entriesContainer.appendChild(emptyMessage);
            return;
        }
        
        // Добавление заметок в DOM в обратном порядке (новые сверху)
        entries.slice().reverse().forEach(entry => {
            addEntryToDOM(entry);
        });
    }
    
    // Добавление заметки в DOM
    function addEntryToDOM(entry) {
        const entryElement = document.createElement('div');
        entryElement.className = 'diary-entry';
        entryElement.dataset.id = entry.id;
        
        // Форматирование даты
        const formattedDate = new Date(entry.date).toLocaleString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        // Создание HTML для заметки
        entryElement.innerHTML = `
            <div class="diary-entry-header">
                <h3 class="diary-entry-title">${entry.title}</h3>
                <div class="diary-entry-date">${formattedDate}</div>
            </div>
            <p class="diary-entry-preview">${entry.description.substring(0, 100)}${entry.description.length > 100 ? '...' : ''}</p>
            ${entry.image ? '<div class="diary-entry-has-image"><i class="fas fa-image"></i></div>' : ''}
        `;
        
        // Добавление обработчика для открытия заметки
        entryElement.addEventListener('click', function() {
            openViewModal(entry);
        });
        
        // Добавление заметки в контейнер
        const emptyMessage = entriesContainer.querySelector('.empty-message');
        if (emptyMessage) {
            entriesContainer.removeChild(emptyMessage);
        }
        entriesContainer.insertBefore(entryElement, entriesContainer.firstChild);
    }
});
