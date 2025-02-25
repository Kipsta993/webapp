document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const addEntryBtn = document.getElementById('add-entry-btn');
    const entryModal = document.getElementById('entry-modal');
    const closeBtn = document.querySelector('.close-btn');
    const entryForm = document.getElementById('entry-form');
    const entriesContainer = document.getElementById('entries-container');
    
    // Загрузка существующих заметок из localStorage
    loadEntries();
    
    // Обработчики событий
    addEntryBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    entryForm.addEventListener('submit', saveEntry);
    
    // Закрытие модального окна при клике вне его содержимого
    window.addEventListener('click', function(event) {
        if (event.target === entryModal) {
            closeModal();
        }
    });
    
    // Функция открытия модального окна
    function openModal() {
        entryModal.style.display = 'flex';
    }
    
    // Функция закрытия модального окна
    function closeModal() {
        entryModal.style.display = 'none';
        entryForm.reset();
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
        closeModal();
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
        
        // Создание HTML для заметки
        let entryHTML = `
            <div class="diary-entry-header">
                <div class="diary-entry-title">${entry.title}</div>
                <div class="diary-entry-date">${entry.date}</div>
            </div>
            <div class="diary-entry-content">
                <p class="diary-entry-description">${entry.description}</p>
        `;
        
        // Добавление изображения, если оно есть
        if (entry.image) {
            entryHTML += `<img src="${entry.image}" alt="${entry.title}" class="diary-entry-image">`;
        }
        
        entryHTML += `</div>`;
        
        entryElement.innerHTML = entryHTML;
        
        // Добавление обработчика для раскрытия/скрытия содержимого
        entryElement.addEventListener('click', function() {
            this.classList.toggle('expanded');
        });
        
        // Добавление заметки в контейнер (в начало списка)
        entriesContainer.insertBefore(entryElement, entriesContainer.firstChild);
    }
});
