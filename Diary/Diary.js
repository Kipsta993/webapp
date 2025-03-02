document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Получение элементов DOM
    const modal = document.getElementById('entry-modal');
    const viewModal = document.getElementById('view-entry-modal');
    const confirmDeleteModal = document.getElementById('confirm-delete-modal');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const closeBtn = document.querySelector('.close-btn');
    const viewCloseBtn = document.querySelector('.view-close-btn');
    const entryForm = document.getElementById('entry-form');
    const entriesContainer = document.getElementById('entries-container');
    const imageInput = document.getElementById('entry-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const editEntryBtn = document.getElementById('edit-entry-btn');
    const deleteEntryBtn = document.getElementById('delete-entry-btn');
    const confirmCancelBtn = document.getElementById('confirm-cancel-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const editedMark = document.getElementById('edited-mark');
    
    // Массив для хранения выбранных изображений
    let selectedImages = [];
    
    // Переменная для хранения текущей просматриваемой заметки
    let currentEntry = null;
    
    // Переменная для отслеживания режима редактирования
    let isEditMode = false;
    
    // Загрузка заметок из localStorage
    loadEntries();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Инициализация фильтра при загрузке страницы
    initFilter();
    
    // Обработчики событий
    setupEventListeners();
    
    // Функция для настройки обработчиков событий
    function setupEventListeners() {
        addEntryBtn.addEventListener('click', function() {
            modal.style.display = 'flex';
            // Сброс формы и предпросмотра изображений
            entryForm.reset();
            imagePreviewContainer.innerHTML = '';
            selectedImages = [];
        });
        
        closeBtn.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        viewCloseBtn.addEventListener('click', function() {
            viewModal.style.display = 'none';
        });
        
        // Закрытие модального окна при клике вне его содержимого
        window.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
            if (event.target === viewModal) {
                viewModal.style.display = 'none';
            }
        });
        
        // Обработчик загрузки изображений
        imageInput.addEventListener('change', function(event) {
            const files = event.target.files;
            
            // Проверка количества изображений
            if (selectedImages.length + files.length > 10) {
                alert('Вы можете загрузить максимум 10 изображений');
                return;
            }
            
            // Добавление новых изображений в массив
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (file.type.startsWith('image/')) {
                    selectedImages.push(file);
                }
            }
            
            // Обновление предпросмотра
            updateImagePreview();
        });
        
        // Обработчик для кнопки редактирования
        editEntryBtn.addEventListener('click', function() {
            if (currentEntry) {
                // Заполняем форму данными текущей заметки
                document.getElementById('entry-title').value = currentEntry.title;
                document.getElementById('entry-description').value = currentEntry.description;
                
                // Очищаем предпросмотр изображений
                imagePreviewContainer.innerHTML = '';
                selectedImages = [];
                
                // Если у заметки есть изображения, загружаем их в предпросмотр
                if (currentEntry.images && currentEntry.images.length > 0) {
                    currentEntry.images.forEach(imageUrl => {
                        // Создаем объект File из URL изображения
                        fetch(imageUrl)
                            .then(res => res.blob())
                            .then(blob => {
                                const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
                                selectedImages.push(file);
                                updateImagePreview();
                            });
                    });
                }
                
                // Устанавливаем режим редактирования
                isEditMode = true;
                
                // Закрываем модальное окно просмотра
                viewModal.style.display = 'none';
                
                // Открываем модальное окно редактирования
                modal.style.display = 'flex';
            }
        });
        
        // Обработчик отправки формы
        entryForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const title = document.getElementById('entry-title').value;
            const description = document.getElementById('entry-description').value;
            
            // Если мы в режиме редактирования, обновляем существующую заметку
            if (isEditMode && currentEntry) {
                // Создание объекта обновленной заметки
                const updatedEntry = {
                    id: currentEntry.id,
                    title: title,
                    description: description,
                    date: currentEntry.date,
                    images: [],
                    edited: true // Отмечаем, что заметка была отредактирована
                };
                
                // Если есть выбранные изображения, обрабатываем их
                if (selectedImages.length > 0) {
                    // Создание массива для хранения изображений в формате base64
                    const imagePromises = selectedImages.map(image => {
                        // Если изображение уже в формате data URL, просто возвращаем его
                        if (typeof image === 'string' && image.startsWith('data:')) {
                            return Promise.resolve(image);
                        }
                        
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                resolve(reader.result);
                            };
                            reader.readAsDataURL(image);
                        });
                    });
                    
                    // Ожидание загрузки всех изображений
                    Promise.all(imagePromises).then(imageDataUrls => {
                        // Добавляем изображения к заметке
                        updatedEntry.images = imageDataUrls;
                        
                        // Обновление заметки
                        updateEntryInStorage(updatedEntry);
                        
                        // Сброс режима редактирования
                        isEditMode = false;
                        
                        // Закрытие модального окна
                        modal.style.display = 'none';
                        
                        // Сброс формы и предпросмотра
                        entryForm.reset();
                        imagePreviewContainer.innerHTML = '';
                        selectedImages = [];
                    });
                } else {
                    // Обновление заметки без изображений
                    updateEntryInStorage(updatedEntry);
                    
                    // Сброс режима редактирования
                    isEditMode = false;
                    
                    // Закрытие модального окна
                    modal.style.display = 'none';
                    
                    // Сброс формы и предпросмотра
                    entryForm.reset();
                    imagePreviewContainer.innerHTML = '';
                    selectedImages = [];
                }
            } else {
                // Создание новой заметки (существующий код)
                const date = new Date();
                
                // Создание объекта заметки
                const entry = {
                    id: Date.now(),
                    title: title,
                    description: description,
                    date: date.toISOString(),
                    images: [],
                    edited: false
                };
                
                // Если есть выбранные изображения, обрабатываем их
                if (selectedImages.length > 0) {
                    // Создание массива для хранения изображений в формате base64
                    const imagePromises = selectedImages.map(image => {
                        return new Promise((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = function() {
                                resolve(reader.result);
                            };
                            reader.readAsDataURL(image);
                        });
                    });
                    
                    // Ожидание загрузки всех изображений
                    Promise.all(imagePromises).then(imageDataUrls => {
                        // Добавляем изображения к заметке
                        entry.images = imageDataUrls;
                        
                        // Сохранение заметки
                        saveEntryToStorage(entry);
                        
                        // Обновление серии дней
                        updateStreak();
                        
                        // Закрытие модального окна
                        modal.style.display = 'none';
                        
                        // Сброс формы и предпросмотра
                        entryForm.reset();
                        imagePreviewContainer.innerHTML = '';
                        selectedImages = [];
                    });
                } else {
                    // Если изображений нет, просто сохраняем заметку
                    saveEntryToStorage(entry);
                    
                    // Обновление серии дней
                    updateStreak();
                    
                    // Закрытие модального окна
                    modal.style.display = 'none';
                    
                    // Сброс формы и предпросмотра
                    entryForm.reset();
                    imagePreviewContainer.innerHTML = '';
                    selectedImages = [];
                }
            }
        });
        
        // Обработчик для кнопки удаления
        deleteEntryBtn.addEventListener('click', function(event) {
            // Предотвращаем всплытие события, чтобы не закрывать модальное окно просмотра
            event.stopPropagation();
            
            // Показываем модальное окно подтверждения
            confirmDeleteModal.style.display = 'flex';
        });
        
        // Обработчик для кнопки отмены удаления
        confirmCancelBtn.addEventListener('click', function() {
            // Скрываем модальное окно подтверждения
            confirmDeleteModal.style.display = 'none';
        });
        
        // Обработчик для кнопки подтверждения удаления
        confirmDeleteBtn.addEventListener('click', function() {
            // Удаляем заметку
            if (currentEntry) {
                deleteEntryFromStorage(currentEntry.id);
                
                // Скрываем модальные окна
                confirmDeleteModal.style.display = 'none';
                viewModal.style.display = 'none';
            }
        });
        
        // Закрытие модального окна подтверждения при клике вне его содержимого
        window.addEventListener('click', function(event) {
            if (event.target === confirmDeleteModal) {
                confirmDeleteModal.style.display = 'none';
            }
        });
    }
    
    // Функция обновления предпросмотра изображений
    function updateImagePreview() {
        imagePreviewContainer.innerHTML = '';
        
        selectedImages.forEach((image, index) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            
            const img = document.createElement('img');
            img.src = URL.createObjectURL(image);
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '×';
            removeBtn.addEventListener('click', function() {
                selectedImages.splice(index, 1);
                updateImagePreview();
            });
            
            previewItem.appendChild(img);
            previewItem.appendChild(removeBtn);
            imagePreviewContainer.appendChild(previewItem);
        });
    }
    
    // Функция для загрузки общих данных
    function loadCommonData() {
        // Загрузка серии дней
        const streak = localStorage.getItem('streak');
        if (streak) {
            document.getElementById('streak-count').textContent = streak;
        }
    }
    
    // Функция для обновления серии дней
    function updateStreak() {
        const today = new Date().toDateString();
        const lastEntry = localStorage.getItem('lastEntryDate');
        
        if (lastEntry !== today) {
            localStorage.setItem('lastEntryDate', today);
            
            let streak = parseInt(document.getElementById('streak-count').textContent);
            streak++;
            document.getElementById('streak-count').textContent = streak;
            localStorage.setItem('streak', streak);
            
            // Обновление максимальной серии
            const maxStreak = localStorage.getItem('maxStreak') || 0;
            if (streak > maxStreak) {
                localStorage.setItem('maxStreak', streak);
            }
        }
    }
    
    // Функция для сохранения заметки в localStorage
    function saveEntryToStorage(entry) {
        // Получение существующих заметок
        let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Добавление новой заметки
        entries.push(entry);
        
        // Сохранение обновленного списка заметок
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        
        // Обновление отображения заметок
        loadEntries();
    }
    
    // Функция для загрузки заметок из localStorage
    function loadEntries() {
        entriesContainer.innerHTML = '';
        
        // Получение заметок из localStorage
        const entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Отображение заметок
        entries.forEach(entry => {
            const entryElement = createEntryElement(entry);
            entriesContainer.appendChild(entryElement);
        });
        
        // Если нет заметок, отображаем сообщение
        if (entries.length === 0) {
            const noEntriesMessage = document.createElement('p');
            noEntriesMessage.className = 'no-entries-message';
            noEntriesMessage.textContent = 'У вас пока нет заметок. Нажмите на кнопку "+", чтобы создать первую заметку.';
            entriesContainer.appendChild(noEntriesMessage);
        }
        
        // Применяем сохраненный фильтр после загрузки заметок
        const savedFilter = localStorage.getItem('diaryFilter') || 'newest';
        applyFilter(savedFilter);
    }
    
    // Функция для создания элемента заметки
    function createEntryElement(entry) {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-item';
        entryElement.setAttribute('data-date', entry.date);
        
        const entryTitle = document.createElement('h3');
        entryTitle.className = 'entry-title';
        entryTitle.textContent = entry.title;
        
        const entryDate = document.createElement('div');
        entryDate.className = 'entry-date';
        entryDate.textContent = formatDate(new Date(entry.date));
        
        entryElement.appendChild(entryTitle);
        entryElement.appendChild(entryDate);
        
        // Добавление обработчика события для просмотра заметки
        entryElement.addEventListener('click', function() {
            viewEntry(entry);
        });
        
        return entryElement;
    }
    
    // Функция для просмотра заметки
    function viewEntry(entry) {
        // Сохраняем текущую заметку
        currentEntry = entry;
        
        document.getElementById('view-entry-title').textContent = entry.title;
        document.getElementById('view-entry-date').textContent = formatDate(new Date(entry.date));
        document.getElementById('view-entry-description').textContent = entry.description;
        
        // Отображаем или скрываем метку о редактировании
        if (entry.edited) {
            editedMark.style.display = 'inline';
        } else {
            editedMark.style.display = 'none';
        }
        
        const imageContainer = document.getElementById('view-entry-image-container');
        imageContainer.innerHTML = '';
        
        // Если есть изображения, создаем слайдер
        if (entry.images && entry.images.length > 0) {
            createImageSlider(imageContainer, entry.images);
        }
        
        viewModal.style.display = 'flex';
    }
    
    // Функция для создания слайдера изображений
    function createImageSlider(container, images) {
        if (images.length === 0) return;
        
        // Создание контейнера для слайдера
        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'image-slider';
        
        // Добавление слайдов с изображениями
        images.forEach(imageUrl => {
            const slide = document.createElement('div');
            slide.className = 'image-slide';
            
            const img = document.createElement('img');
            img.src = imageUrl;
            img.alt = 'Изображение заметки';
            
            slide.appendChild(img);
            sliderContainer.appendChild(slide);
        });
        
        // Добавление элементов управления слайдером
        const controls = document.createElement('div');
        controls.className = 'slider-controls';
        
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-arrow prev-arrow';
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-arrow next-arrow';
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        
        const indicator = document.createElement('div');
        indicator.className = 'slider-indicator';
        indicator.textContent = `1/${images.length}`;
        
        controls.appendChild(prevButton);
        controls.appendChild(indicator);
        controls.appendChild(nextButton);
        
        // Добавление слайдера и элементов управления в контейнер
        container.appendChild(sliderContainer);
        
        // Если больше одного изображения, добавляем элементы управления
        if (images.length > 1) {
            container.appendChild(controls);
        } else {
            // Скрываем элементы управления, если только одно изображение
            controls.style.display = 'none';
        }
        
        // Переменная для отслеживания текущего слайда
        let currentSlide = 0;
        
        // Функция для обновления слайдера
        function updateSlider() {
            sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
            indicator.textContent = `${currentSlide + 1}/${images.length}`;
        }
        
        // Обработчики для кнопок навигации
        prevButton.addEventListener('click', function() {
            currentSlide = (currentSlide - 1 + images.length) % images.length;
            updateSlider();
        });
        
        nextButton.addEventListener('click', function() {
            currentSlide = (currentSlide + 1) % images.length;
            updateSlider();
        });
        
        // Добавление поддержки свайпов для мобильных устройств
        let touchStartX = 0;
        let touchEndX = 0;
        
        container.addEventListener('touchstart', function(e) {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        container.addEventListener('touchend', function(e) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });
        
        function handleSwipe() {
            const swipeThreshold = 50;
            if (touchEndX < touchStartX - swipeThreshold) {
                // Свайп влево - следующий слайд
                currentSlide = (currentSlide + 1) % images.length;
                updateSlider();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Свайп вправо - предыдущий слайд
                currentSlide = (currentSlide - 1 + images.length) % images.length;
                updateSlider();
            }
        }
    }
    
    // Функция для форматирования даты
    function formatDate(date) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        return date.toLocaleDateString('ru-RU', options);
    }
    
    // Функция для применения темы
    function applyTheme() {
        const theme = localStorage.getItem('theme') || 'light';
        
        if (theme === 'dark') {
            document.body.style.backgroundColor = '#333';
            document.body.style.color = '#f5f5f5';
            
            // Добавляем стили для темной темы
            const style = document.createElement('style');
            style.id = 'custom-theme-styles';
            style.textContent = `
                section, .bottom-nav, .entry-item, .modal-content {
                    background-color: #444;
                    color: #f5f5f5;
                }
                
                .bottom-nav a {
                    color: #aaa;
                }
                
                .bottom-nav a.active {
                    color: #fff;
                }
                
                .entry-date {
                    color: #ccc;
                }
            `;
            
            // Удаляем предыдущие стили, если они есть
            const existingStyle = document.getElementById('custom-theme-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            document.head.appendChild(style);
        } else if (theme === 'custom') {
            const customColors = JSON.parse(localStorage.getItem('customColors')) || {};
            
            document.body.style.backgroundColor = customColors.background || '#f5f5f5';
            document.body.style.color = customColors.text || '#333';
            
            // Добавляем стили для пользовательской темы
            const style = document.createElement('style');
            style.id = 'custom-theme-styles';
            style.textContent = `
                section, .bottom-nav {
                    background-color: ${adjustColor(customColors.background || '#f5f5f5', 20)};
                    color: ${customColors.text || '#333'};
                }
                
                .entry-item, .modal-content {
                    background-color: ${adjustColor(customColors.background || '#f5f5f5', 10)};
                    color: ${customColors.text || '#333'};
                }
                
                .bottom-nav a {
                    color: ${adjustColor(customColors.text || '#333', -30)};
                }
                
                .bottom-nav a.active {
                    color: ${customColors.accent || '#4285f4'};
                }
            `;
            
            // Удаляем предыдущие стили, если они есть
            const existingStyle = document.getElementById('custom-theme-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
            
            document.head.appendChild(style);
        } else {
            // Сброс стилей для светлой темы
            document.body.style.backgroundColor = '';
            document.body.style.color = '';
            
            // Удаляем пользовательские стили, если они есть
            const existingStyle = document.getElementById('custom-theme-styles');
            if (existingStyle) {
                existingStyle.remove();
            }
        }
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
    
    // Инициализация фильтра
    function initFilter() {
        const filterToggle = document.querySelector('.filter-toggle');
        const filterDropdown = document.querySelector('.filter-dropdown');
        const filterOptions = document.querySelectorAll('.filter-option');
        
        // Загрузка сохраненного фильтра из localStorage
        const savedFilter = localStorage.getItem('diaryFilter') || 'newest';
        
        // Установка активного фильтра
        filterOptions.forEach(option => {
            if (option.getAttribute('data-filter') === savedFilter) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Применение фильтра при загрузке
        applyFilter(savedFilter);
        
        // Обработчик клика по кнопке фильтра
        filterToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            filterDropdown.classList.toggle('active');
        });
        
        // Обработчик клика вне фильтра для закрытия выпадающего меню
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-container')) {
                filterDropdown.classList.remove('active');
            }
        });
        
        // Обработчик выбора опции фильтра
        filterOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Удаление активного класса у всех опций
                filterOptions.forEach(opt => opt.classList.remove('active'));
                
                // Добавление активного класса выбранной опции
                option.classList.add('active');
                
                // Получение значения фильтра
                const filterValue = option.getAttribute('data-filter');
                
                // Сохранение выбранного фильтра в localStorage
                localStorage.setItem('diaryFilter', filterValue);
                
                // Применение фильтра
                applyFilter(filterValue);
                
                // Закрытие выпадающего меню
                filterDropdown.classList.remove('active');
            });
        });
    }
    
    // Функция применения фильтра
    function applyFilter(filterValue) {
        const entriesContainer = document.getElementById('entries-container');
        const entries = Array.from(entriesContainer.querySelectorAll('.entry-item'));
        
        // Сортировка записей по дате
        entries.sort((a, b) => {
            const dateA = new Date(a.getAttribute('data-date'));
            const dateB = new Date(b.getAttribute('data-date'));
            
            if (filterValue === 'newest') {
                return dateB - dateA; // Сначала новые
            } else {
                return dateA - dateB; // Сначала старые
            }
        });
        
        // Очистка контейнера
        entriesContainer.innerHTML = '';
        
        // Добавление отсортированных записей обратно в контейнер
        entries.forEach(entry => {
            entriesContainer.appendChild(entry);
        });
    }
    
    // Функция для обновления заметки в localStorage
    function updateEntryInStorage(updatedEntry) {
        // Получение существующих заметок
        let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Находим индекс заметки, которую нужно обновить
        const index = entries.findIndex(entry => entry.id === updatedEntry.id);
        
        // Если заметка найдена, обновляем ее
        if (index !== -1) {
            entries[index] = updatedEntry;
            
            // Сохранение обновленного списка заметок
            localStorage.setItem('diaryEntries', JSON.stringify(entries));
            
            // Обновление отображения заметок
            loadEntries();
        }
    }
    
    // Функция для удаления заметки из localStorage
    function deleteEntryFromStorage(entryId) {
        // Получение существующих заметок
        let entries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
        
        // Фильтрация заметок, исключая удаляемую
        entries = entries.filter(entry => entry.id !== entryId);
        
        // Сохранение обновленного списка заметок
        localStorage.setItem('diaryEntries', JSON.stringify(entries));
        
        // Обновление отображения заметок
        loadEntries();
    }
});
