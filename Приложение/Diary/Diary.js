/**
 * JavaScript для страницы Diary
 * Обеспечивает функциональность добавления, удаления и сортировки записей дневника
 */

document.addEventListener('DOMContentLoaded', function() {
  // Инициализация хранилища записей
  let entries = JSON.parse(localStorage.getItem('diary-entries')) || [];
  let currentSort = 'newest'; // По умолчанию сортировка по новизне
  let currentEntry = null; // Текущая открытая запись
  let selectedPhotos = []; // Массив для хранения выбранных фотографий
  let currentPhotoIndex = 0; // Индекс текущей фотографии в полноэкранном режиме

  // Получение элементов DOM
  const entryForm = document.getElementById('add-entry-form');
  const entriesList = document.getElementById('entries-list');
  const entryTitle = document.getElementById('entry-title');
  const entryContent = document.getElementById('entry-content');
  const entryPhotos = document.getElementById('entry-photos');
  const photoPreview = document.getElementById('photo-preview');
  const photoCounter = document.getElementById('photo-counter');
  const sortNewest = document.getElementById('diary-sort-newest');
  const sortOldest = document.getElementById('diary-sort-oldest');
  const emptyList = document.getElementById('diary-empty-list');
  
  // Элементы модального окна
  const modal = document.getElementById('entry-modal');
  const modalTitle = modal ? modal.querySelector('.modal-title') : null;
  const modalDate = modal ? modal.querySelector('.modal-date') : null;
  const modalContent = modal ? modal.querySelector('.modal-content') : null;
  const modalPhotos = modal ? modal.querySelector('.modal-photos') : null;
  const modalClose = modal ? modal.querySelector('.modal-close') : null;
  
  // Элементы полноэкранного просмотра
  const fullscreenPhoto = document.getElementById('fullscreen-photo');
  const fullscreenImg = fullscreenPhoto ? fullscreenPhoto.querySelector('.fullscreen-photo-img') : null;
  const fullscreenClose = fullscreenPhoto ? fullscreenPhoto.querySelector('.fullscreen-close') : null;
  const fullscreenPrev = fullscreenPhoto ? fullscreenPhoto.querySelector('.fullscreen-arrow-prev') : null;
  const fullscreenNext = fullscreenPhoto ? fullscreenPhoto.querySelector('.fullscreen-arrow-next') : null;
  const fullscreenNav = fullscreenPhoto ? fullscreenPhoto.querySelector('.fullscreen-nav') : null;

  // Проверка наличия элементов на странице
  if (!entryForm || !entriesList || !modal || !fullscreenPhoto) return;

  // Максимальное количество фотографий
  const MAX_PHOTOS = 10;

  // Функция для генерации уникального ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Функция для форматирования даты и времени
  function formatDateTime(dateString) {
    const date = new Date(dateString);
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  // Функция для преобразования файла в Data URL
  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function(e) {
        previewImage.src = e.target.result;
        
        // Добавляем фото в массив
        selectedPhotos.push({
          file: file,
          preview: e.target.result
        });
        
        // Обновляем счетчик фото
        photoCounter.textContent = `(${selectedPhotos.length}/${MAX_PHOTOS})`;
      };
      
      reader.onerror = function(error) {
        // Обработка ошибки чтения файла
      };
      
      reader.readAsDataURL(file);
    });
  }

  // Функция для обработки выбора фотографий
  async function handlePhotoSelect(event) {
    const files = Array.from(event.target.files);
    
    // Проверка на максимальное количество фотографий
    if (selectedPhotos.length + files.length > MAX_PHOTOS) {
      alert(`Вы можете загрузить максимум ${MAX_PHOTOS} фотографий. Выбрано: ${selectedPhotos.length}`);
      return;
    }
    
    // Преобразование файлов в Data URL
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        try {
          await fileToDataUrl(file);
        } catch (error) {
          // Обработка ошибки чтения файла
        }
      }
    }
    
    // Сброс input для возможности повторного выбора тех же файлов
    event.target.value = '';
  }

  // Функция для добавления превью фотографии
  function addPhotoPreview(dataUrl) {
    const previewItem = document.createElement('div');
    previewItem.className = 'photo-preview-item';
    
    previewItem.innerHTML = `
      <img src="${dataUrl}" class="photo-preview-img" alt="Превью фото">
      <button class="photo-preview-remove" aria-label="Удалить фото">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Добавление обработчика для удаления фото
    const removeBtn = previewItem.querySelector('.photo-preview-remove');
    removeBtn.addEventListener('click', () => {
      const index = Array.from(photoPreview.children).indexOf(previewItem);
      if (index !== -1) {
        selectedPhotos.splice(index, 1);
        photoPreview.removeChild(previewItem);
        updatePhotoCounter();
      }
    });
    
    photoPreview.appendChild(previewItem);
  }

  // Функция для обновления счетчика фотографий
  function updatePhotoCounter() {
    photoCounter.textContent = `(${selectedPhotos.length}/${MAX_PHOTOS})`;
  }

  // Функция для добавления новой записи
  function addEntry(event) {
    event.preventDefault();
    
    // Получаем элементы сообщений об ошибках
    const titleError = document.getElementById('entry-title-error');
    const contentError = document.getElementById('entry-content-error');
    
    // Сбрасываем предыдущие ошибки
    entryTitle.classList.remove('error');
    entryContent.classList.remove('error');
    titleError.classList.remove('active');
    contentError.classList.remove('active');
    titleError.textContent = '';
    contentError.textContent = '';
    
    const title = entryTitle.value.trim();
    const content = entryContent.value.trim();
    
    let hasError = false;
    
    if (!title) {
      // Показываем красивое уведомление об ошибке для заголовка
      entryTitle.classList.add('error');
      titleError.textContent = 'Пожалуйста, введите заголовок записи';
      titleError.classList.add('active');
      hasError = true;
    }
    
    if (!content) {
      // Показываем красивое уведомление об ошибке для содержания
      entryContent.classList.add('error');
      contentError.textContent = 'Пожалуйста, введите текст записи';
      contentError.classList.add('active');
      hasError = true;
    }
    
    if (hasError) {
      // Фокусируемся на первом поле с ошибкой
      if (!title) {
        entryTitle.focus();
      } else {
        entryContent.focus();
      }
      return;
    }
    
    const newEntry = {
      id: generateId(),
      title: title,
      content: content,
      photos: selectedPhotos,
      createdAt: new Date().toISOString()
    };
    
    entries.unshift(newEntry);
    saveEntries();
    renderEntries();
    
    // Сброс формы
    entryTitle.value = '';
    entryContent.value = '';
    selectedPhotos = [];
    photoPreview.innerHTML = '';
    updatePhotoCounter();
  }

  // Функция для удаления записи
  function deleteEntry(id) {
    entries = entries.filter(entry => entry.id !== id);
    saveEntries();
    renderEntries();
    
    // Увеличиваем счетчик удаленных записей
    const deletedEntriesCount = parseInt(localStorage.getItem('deletedEntriesCount') || '0') + 1;
    localStorage.setItem('deletedEntriesCount', deletedEntriesCount);
    
    // Обновляем статистику, если Stats доступен
    if (window.StatsPage && typeof window.StatsPage.loadDiaryStats === 'function') {
      window.StatsPage.loadDiaryStats();
    }
  }

  // Функция для сохранения записей в localStorage
  function saveEntries() {
    localStorage.setItem('diary-entries', JSON.stringify(entries));
  }

  // Функция для сортировки записей
  function sortEntries() {
    if (currentSort === 'newest') {
      entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      entries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
  }

  // Функция для отображения записей
  function renderEntries() {
    sortEntries();
    
    // Очистка списка
    entriesList.innerHTML = '';
    
    // Проверка на пустой список
    if (entries.length === 0) {
      emptyList.style.display = 'block';
      entriesList.style.display = 'none';
    } else {
      emptyList.style.display = 'none';
      entriesList.style.display = 'block';
      
      // Отображение записей
      entries.forEach(entry => {
        const entryItem = document.createElement('div');
        entryItem.className = 'entry-item';
        entryItem.dataset.id = entry.id;
        
        let photosIndicator = '';
        if (entry.photos && entry.photos.length > 0) {
          photosIndicator = `
            <div class="entry-photos-indicator">
              <i class="fas fa-camera"></i> ${entry.photos.length}
            </div>
          `;
        }
        
        entryItem.innerHTML = `
          <div class="entry-header">
            <h3 class="entry-title">${entry.title}</h3>
          </div>
          <div class="entry-info">
            <span class="entry-date">${formatDateTime(entry.createdAt)}</span>
            ${photosIndicator}
          </div>
          <div class="entry-actions">
            <button class="entry-delete" aria-label="Удалить запись">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        `;
        
        // Добавление обработчиков событий
        const deleteBtn = entryItem.querySelector('.entry-delete');
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation(); // Предотвращаем открытие модального окна при клике на кнопку удаления
          deleteEntry(entry.id);
        });
        
        // Открытие модального окна при клике на запись
        entryItem.addEventListener('click', () => openModal(entry));
        
        entriesList.appendChild(entryItem);
      });
      
      // Прокрутка к началу
      window.scrollTo(0, 0);
    }
  }

  // Функция для открытия модального окна
  function openModal(entry) {
    currentEntry = entry;
    
    modalTitle.textContent = entry.title;
    modalDate.textContent = formatDateTime(entry.createdAt);
    modalContent.innerHTML = entry.content.replace(/\n/g, '<br>');
    
    // Отображение фотографий
    modalPhotos.innerHTML = '';
    if (entry.photos && entry.photos.length > 0) {
      entry.photos.forEach((photo, index) => {
        const photoElement = document.createElement('div');
        photoElement.className = 'modal-photo';
        photoElement.innerHTML = `<img src="${photo}" alt="Фото ${index + 1}">`;
        
        // Открытие полноэкранного просмотра при клике на фото
        photoElement.addEventListener('click', () => {
          openFullscreenPhoto(entry.photos, index);
        });
        
        modalPhotos.appendChild(photoElement);
      });
    }
    
    modal.classList.add('active');
    
    // Блокируем прокрутку страницы и добавляем класс для затемнения нижней навигации
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
  }

  // Функция для закрытия модального окна
  function closeModal() {
    modal.classList.remove('active');
    
    // Разблокируем прокрутку страницы и удаляем класс для затемнения нижней навигации
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    
    // Очищаем текущую запись
    currentEntry = null;
  }

  // Функция для открытия полноэкранного просмотра фотографий
  function openFullscreenPhoto(photos, index) {
    currentPhotoIndex = index;
    
    // Отображение текущей фотографии
    fullscreenImg.src = photos[index];
    
    // Создание навигационных точек
    fullscreenNav.innerHTML = '';
    photos.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = `fullscreen-nav-dot${i === index ? ' active' : ''}`;
      dot.addEventListener('click', () => {
        currentPhotoIndex = i;
        updateFullscreenPhoto(photos);
      });
      fullscreenNav.appendChild(dot);
    });
    
    // Показываем/скрываем кнопки навигации
    fullscreenPrev.style.display = photos.length > 1 ? 'flex' : 'none';
    fullscreenNext.style.display = photos.length > 1 ? 'flex' : 'none';
    
    // Открываем полноэкранный просмотр
    fullscreenPhoto.classList.add('active');
  }

  // Функция для обновления полноэкранного просмотра
  function updateFullscreenPhoto(photos) {
    // Отображение текущей фотографии
    fullscreenImg.src = photos[currentPhotoIndex];
    
    // Обновление активной точки
    const dots = fullscreenNav.querySelectorAll('.fullscreen-nav-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentPhotoIndex);
    });
  }

  // Функция для закрытия полноэкранного просмотра
  function closeFullscreenPhoto() {
    fullscreenPhoto.classList.remove('active');
  }

  // Функция для перехода к предыдущей фотографии
  function prevPhoto() {
    if (!currentEntry || !currentEntry.photos || currentEntry.photos.length <= 1) return;
    
    currentPhotoIndex = (currentPhotoIndex - 1 + currentEntry.photos.length) % currentEntry.photos.length;
    updateFullscreenPhoto(currentEntry.photos);
  }

  // Функция для перехода к следующей фотографии
  function nextPhoto() {
    if (!currentEntry || !currentEntry.photos || currentEntry.photos.length <= 1) return;
    
    currentPhotoIndex = (currentPhotoIndex + 1) % currentEntry.photos.length;
    updateFullscreenPhoto(currentEntry.photos);
  }

  // Обработчики событий
  entryForm.addEventListener('submit', addEntry);
  entryPhotos.addEventListener('change', handlePhotoSelect);
  
  sortNewest.addEventListener('click', function(e) {
    e.stopPropagation(); // Останавливаем распространение события
    currentSort = 'newest';
    sortNewest.classList.add('active');
    sortOldest.classList.remove('active');
    renderEntries();
  });
  
  sortOldest.addEventListener('click', function(e) {
    e.stopPropagation(); // Останавливаем распространение события
    currentSort = 'oldest';
    sortOldest.classList.add('active');
    sortNewest.classList.remove('active');
    renderEntries();
  });
  
  // Обработчики событий для модального окна
  modalClose.addEventListener('click', closeModal);
  
  // Закрытие модального окна при клике на фон
  modal.addEventListener('click', function(event) {
    if (event.target === modal) {
      closeModal();
    }
  });
  
  // Обработчики событий для полноэкранного просмотра
  fullscreenClose.addEventListener('click', closeFullscreenPhoto);
  fullscreenPrev.addEventListener('click', prevPhoto);
  fullscreenNext.addEventListener('click', nextPhoto);
  
  // Закрытие полноэкранного просмотра при клике на фон
  fullscreenPhoto.addEventListener('click', function(event) {
    if (event.target === fullscreenPhoto) {
      closeFullscreenPhoto();
    }
  });
  
  // Закрытие модального окна и полноэкранного просмотра при нажатии Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      if (fullscreenPhoto.classList.contains('active')) {
        closeFullscreenPhoto();
      } else if (modal.classList.contains('active')) {
        closeModal();
      }
    } else if (event.key === 'ArrowLeft' && fullscreenPhoto.classList.contains('active')) {
      prevPhoto();
    } else if (event.key === 'ArrowRight' && fullscreenPhoto.classList.contains('active')) {
      nextPhoto();
    }
  });

  // Инициализация
  updatePhotoCounter();
  renderEntries();
});
