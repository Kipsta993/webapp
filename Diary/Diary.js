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
