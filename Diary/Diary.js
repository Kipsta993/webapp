document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных (монеты, серия дней)
    loadCommonData();
    
    // Загрузка записей дневника
    loadDiaryEntries();
    
    // Элементы DOM
    const entriesList = document.getElementById('entries-list');
    const entryForm = document.getElementById('entry-form');
    const entryView = document.getElementById('entry-view');
    const entriesContainer = document.getElementById('entries-container');
    
    // Кнопки
    const addEntryBtn = document.getElementById('add-entry-btn');
    const closeFormBtn = document.getElementById('close-form-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const closeViewBtn = document.getElementById('close-view-btn');
    const editEntryBtn = document.getElementById('edit-entry-btn');
    
    // Форма
    const diaryForm = document.getElementById('diary-form');
    const entryTitleInput = document.getElementById('entry-title');
    const entryContentInput = document.getElementById('entry-content');
    const entryIdInput = document.getElementById('entry-id');
    
    // Обработчики событий
    addEntryBtn.addEventListener('click', showAddEntryForm);
    closeFormBtn.addEventListener('click', hideEntryForm);
    cancelBtn.addEventListener('click', hideEntryForm);
    diaryForm.addEventListener('submit', saveEntry);
    closeViewBtn.addEventListener('click', hideEntryView);
    editEntryBtn.addEventListener('click', editCurrentEntry);
    
    // Функция для загрузки общих данных
    function loadCommonData() {
        // Загрузка количества монет
        const coins = localStorage.getItem('coins');
        if (coins) {
            document.getElementById('coin-count').textContent = coins;
        } else {
            localStorage.setItem('coins', 100);
        }
        
        // Загрузка серии дней
        const streak = localStorage.getItem('streak');
        if (streak) {
            document.getElementById('streak-count').textContent = streak;
        } else {
            localStorage.setItem('streak', 7);
        }
    }
    
    // Функция для загрузки записей дневника
    function loadDiaryEntries() {
        const entries = getEntriesFromStorage();
        
        // Очищаем контейнер
        entriesContainer.innerHTML = '';
        
        if (entries.length === 0) {
            // Если записей нет, показываем сообщение
            entriesContainer.innerHTML = '<div class="no-entries">У вас пока нет записей. Нажмите "+" чтобы создать первую запись.</div>';
            return;
        }
        
        // Сортируем записи по дате (новые сверху)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Добавляем записи в контейнер
        entries.forEach(entry => {
            const entryElement = createEntryElement(entry);
            entriesContainer.appendChild(entryElement);
        });
    }
    
    // Функция для создания элемента записи
    function createEntryElement(entry) {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-item';
        entryElement.dataset.id = entry.id;
        
        const title = document.createElement('h3');
        title.textContent = entry.title;
        
        const preview = document.createElement('div');
        preview.className = 'entry-preview';
        preview.textContent = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');
        
        const date = document.createElement('div');
        date.className = 'entry-date';
        date.textContent = formatDate(new Date(entry.date));
        
        entryElement.appendChild(title);
        entryElement.appendChild(preview);
        entryElement.appendChild(date);
        
        // Добавляем обработчик клика для просмотра записи
        entryElement.addEventListener('click', function() {
            viewEntry(entry.id);
        });
        
        return entryElement;
    }
    
    // Функция для форматирования даты
    function formatDate(date) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        
        return `${day}.${month}.${year} ${hours}:${minutes}`;
    }
    
    // Функция для получения записей из localStorage
    function getEntriesFromStorage() {
        const entriesJson = localStorage.getItem('diaryEntries');
        return entriesJson ? JSON.parse(entriesJson) : [];
    }
    
    // Функция для сохранения записей в localStorage
    function saveEntriesToStorage(entries) {
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
    }
    
    // Функция для показа формы добавления записи
    function showAddEntryForm() {
        // Очищаем форму
        diaryForm.reset();
        entryIdInput.value = '';
        
        // Меняем заголовок формы
        document.getElementById('form-title').textContent = 'Новая запись';
        
        // Скрываем список и показываем форму
        entriesList.style.display = 'none';
        entryForm.style.display = 'block';
        entryView.style.display = 'none';
        
        // Фокус на поле заголовка
        entryTitleInput.focus();
    }
    
    // Функция для скрытия формы
    function hideEntryForm() {
        entryForm.style.display = 'none';
        entriesList.style.display = 'block';
    }
    
    // Функция для скрытия просмотра записи
    function hideEntryView() {
        entryView.style.display = 'none';
        entriesList.style.display = 'block';
    }
    
    // Функция для сохранения записи
    function saveEntry(e) {
        e.preventDefault();
        
        const title = entryTitleInput.value.trim();
        const content = entryContentInput.value.trim();
        const id = entryIdInput.value || generateId();
        const date = new Date().toISOString();
        
        // Получаем все записи
        const entries = getEntriesFromStorage();
        
        // Проверяем, редактируем ли мы существующую запись
        const existingEntryIndex = entries.findIndex(entry => entry.id === id);
        
        if (existingEntryIndex !== -1) {
            // Обновляем существующую запись
            entries[existingEntryIndex] = {
                ...entries[existingEntryIndex],
                title,
                content,
                lastEdited: date
            };
        } else {
            // Добавляем новую запись
            entries.push({
                id,
                title,
                content,
                date,
                lastEdited: date
            });
            
            // Добавляем монеты за новую запись
            addCoins(10);
        }
        
        // Сохраняем записи
        saveEntriesToStorage(entries);
        
        // Обновляем список записей
        loadDiaryEntries();
        
        // Скрываем форму
        hideEntryForm();
    }
    
    // Функция для просмотра записи
    function viewEntry(id) {
        const entries = getEntriesFromStorage();
        const entry = entries.find(entry => entry.id === id);
        
        if (!entry) return;
        
        // Заполняем данные для просмотра
        document.getElementById('view-title').textContent = entry.title;
        document.getElementById('view-content').textContent = entry.content;
        
        let dateText = `Создано: ${formatDate(new Date(entry.date))}`;
        if (entry.lastEdited && entry.lastEdited !== entry.date) {
            dateText += `\nОтредактировано: ${formatDate(new Date(entry.lastEdited))}`;
        }
        document.getElementById('view-date').textContent = dateText;
        
        // Сохраняем ID текущей записи для редактирования
        editEntryBtn.dataset.id = id;
        
        // Показываем просмотр
        entriesList.style.display = 'none';
        entryForm.style.display = 'none';
        entryView.style.display = 'block';
    }
    
    // Функция для редактирования текущей записи
    function editCurrentEntry() {
        const id = editEntryBtn.dataset.id;
        const entries = getEntriesFromStorage();
        const entry = entries.find(entry => entry.id === id);
        
        if (!entry) return;
        
        // Заполняем форму данными записи
        entryTitleInput.value = entry.title;
        entryContentInput.value = entry.content;
        entryIdInput.value = entry.id;
        
        // Меняем заголовок формы
        document.getElementById('form-title').textContent = 'Редактирование записи';
        
        // Показываем форму
        entriesList.style.display = 'none';
        entryView.style.display = 'none';
        entryForm.style.display = 'block';
        
        // Фокус на поле заголовка
        entryTitleInput.focus();
    }
    
    // Функция для генерации уникального ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
    
    // Функция для добавления монет
    function addCoins(amount) {
        const coinCountElement = document.getElementById('coin-count');
        let currentCoins = parseInt(coinCountElement.textContent);
        currentCoins += amount;
        
        coinCountElement.textContent = currentCoins;
        localStorage.setItem('coins', currentCoins);
    }
});
