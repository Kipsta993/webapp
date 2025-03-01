document.addEventListener('DOMContentLoaded', function() {
    // Загрузка общих данных
    loadCommonData();
    
    // Получение элементов DOM
    const modal = document.getElementById('entry-modal');
    const viewModal = document.getElementById('view-entry-modal');
    const addEntryBtn = document.getElementById('add-entry-btn');
    const closeBtn = document.querySelector('.close-btn');
    const viewCloseBtn = document.querySelector('.view-close-btn');
    const entryForm = document.getElementById('entry-form');
    const entriesContainer = document.getElementById('entries-container');
    const imageInput = document.getElementById('entry-images');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    
    // Массив для хранения выбранных изображений
    let selectedImages = [];
    
    // Загрузка заметок из localStorage
    loadEntries();
    
    // Применение сохраненной темы
    applyTheme();
    
    // Обработчики событий
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
    
    // Обработчик отправки формы
    entryForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const title = document.getElementById('entry-title').value;
        const description = document.getElementById('entry-description').value;
        const date = new Date();
        
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
            // Создание объекта заметки
            const entry = {
                id: Date.now(),
                title: title,
                description: description,
                date: date.toISOString(),
                images: imageDataUrls
            };
            
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
    });
    
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
        
        // Сортировка заметок по дате (от новых к старым)
        entries.sort((a, b) => new Date(b.date) - new Date(a.date));
        
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
    }
    
    // Функция для создания элемента заметки
    function createEntryElement(entry) {
        const entryElement = document.createElement('div');
        entryElement.className = 'entry-item';
        
        const entryTitle = document.createElement('h3');
        entryTitle.className = 'entry-title';
        entryTitle.textContent = entry.title;
        
        const entryDate = document.createElement('div');
        entryDate.className = 'entry-date';
        entryDate.textContent = formatDate(new Date(entry.date));
        
        const entryPreview = document.createElement('div');
        entryPreview.className = 'entry-preview';
        
        // Добавление превью текста
        const textPreview = document.createElement('p');
        textPreview.className = 'entry-text-preview';
        textPreview.textContent = entry.description.length > 100 
            ? entry.description.substring(0, 100) + '...' 
            : entry.description;
        
        entryPreview.appendChild(textPreview);
        
        // Добавление превью изображения, если есть
        if (entry.images && entry.images.length > 0) {
            const imagePreview = document.createElement('div');
            imagePreview.className = 'entry-image-preview';
            
            const img = document.createElement('img');
            img.src = entry.images[0];
            img.alt = 'Превью изображения';
            
            imagePreview.appendChild(img);
            entryPreview.appendChild(imagePreview);
            
            // Добавление индикатора количества изображений, если их больше одного
            if (entry.images.length > 1) {
                const imageCount = document.createElement('div');
                imageCount.className = 'image-count';
                imageCount.textContent = `+${entry.images.length - 1}`;
                imagePreview.appendChild(imageCount);
            }
        }
        
        // Добавление обработчика клика для просмотра заметки
        entryElement.addEventListener('click', function() {
            viewEntry(entry);
        });
        
        entryElement.appendChild(entryTitle);
        entryElement.appendChild(entryDate);
        entryElement.appendChild(entryPreview);
        
        return entryElement;
    }
    
    // Функция для просмотра заметки
    function viewEntry(entry) {
        document.getElementById('view-entry-title').textContent = entry.title;
        document.getElementById('view-entry-date').textContent = formatDate(new Date(entry.date));
        document.getElementById('view-entry-description').textContent = entry.description;
        
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
        document.body.className = theme;
        
        // Если выбрана пользовательская тема, применяем сохраненные цвета
        if (theme === 'custom') {
            const customColors = JSON.parse(localStorage.getItem('customColors')) || {};
            
            if (customColors.bgColor) {
                document.documentElement.style.setProperty('--bg-color', customColors.bgColor);
            }
            if (customColors.textColor) {
                document.documentElement.style.setProperty('--text-color', customColors.textColor);
            }
            if (customColors.accentColor) {
                document.documentElement.style.setProperty('--accent-color', customColors.accentColor);
            }
        } else {
            // Сброс пользовательских цветов при использовании стандартных тем
            document.documentElement.style.removeProperty('--bg-color');
            document.documentElement.style.removeProperty('--text-color');
            document.documentElement.style.removeProperty('--accent-color');
        }
    }
});
