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
  let lastDeletedPhoto = null; // Последнее удаленное фото

  // Получение элементов DOM
  const entryForm = document.getElementById('add-entry-form');
  const entriesList = document.getElementById('entries-list');
  let entryTitle = document.getElementById('entry-title');
  let entryContent = document.getElementById('entry-content');
  const entryPhotos = document.getElementById('entry-photos');
  const photoPreview = document.getElementById('photo-preview');
  const sortNewest = document.getElementById('diary-sort-newest');
  const sortOldest = document.getElementById('diary-sort-oldest');
  const emptyList = document.getElementById('diary-empty-list');
  
  // Исправление проблемы с полем ввода
  if (entryTitle) {
    // Запоминаем родительский элемент и стили оригинального поля
    const parentElement = entryTitle.parentElement;
    const originalId = entryTitle.id;
    const originalClasses = entryTitle.className;
    const originalPlaceholder = entryTitle.placeholder;
    const originalRequired = entryTitle.required;
    const originalAutocomplete = entryTitle.autocomplete;
    
    // Удаляем проблемное поле
    entryTitle.remove();
    
    // Создаем новое поле с теми же атрибутами
    const newEntryTitle = document.createElement('input');
    newEntryTitle.type = 'text';
    newEntryTitle.id = originalId;
    newEntryTitle.className = originalClasses;
    newEntryTitle.placeholder = originalPlaceholder;
    newEntryTitle.required = originalRequired;
    newEntryTitle.autocomplete = originalAutocomplete;
    
    // Добавляем дополнительные стили и атрибуты для гарантии работы
    newEntryTitle.style.zIndex = '100';
    newEntryTitle.style.position = 'relative';
    newEntryTitle.style.pointerEvents = 'auto';
    
    // Добавляем новое поле в DOM
    parentElement.prepend(newEntryTitle);
    
    // Обновляем ссылку на поле
    entryTitle = newEntryTitle;
  }
  
  if (entryContent) {
    // Запоминаем родительский элемент и стили оригинального поля
    const parentElement = entryContent.parentElement;
    const originalId = entryContent.id;
    const originalClasses = entryContent.className;
    const originalPlaceholder = entryContent.placeholder;
    const originalRequired = entryContent.required;
    const originalAutocomplete = entryContent.autocomplete;
    const originalRows = entryContent.rows;
    
    // Удаляем проблемное поле
    entryContent.remove();
    
    // Создаем новое поле с теми же атрибутами
    const newEntryContent = document.createElement('textarea');
    newEntryContent.id = originalId;
    newEntryContent.className = originalClasses;
    newEntryContent.placeholder = originalPlaceholder;
    newEntryContent.required = originalRequired;
    newEntryContent.autocomplete = originalAutocomplete;
    newEntryContent.rows = originalRows;
    
    // Добавляем дополнительные стили и атрибуты для гарантии работы
    newEntryContent.style.zIndex = '100';
    newEntryContent.style.position = 'relative';
    newEntryContent.style.pointerEvents = 'auto';
    
    // Добавляем новое поле в DOM
    parentElement.prepend(newEntryContent);
    
    // Обновляем ссылку на поле
    entryContent = newEntryContent;
  }
  
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
        // Добавляем фото в массив
        selectedPhotos.push({
          file: file,
          preview: e.target.result
        });
        resolve(e.target.result);
      };
      
      reader.onerror = function(error) {
        reject(error);
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
          console.error('Ошибка чтения файла:', error);
        }
      }
    }
    
    // Обновляем превью фотографий
    updatePhotoPreview();
    
    // Сброс input для возможности повторного выбора тех же файлов
    event.target.value = '';
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
    
    // Подготавливаем массив фотографий для сохранения
    const entryPhotos = selectedPhotos.map(photo => photo.preview);
    
    const newEntry = {
      id: generateId(),
      title: title,
      content: content,
      photos: entryPhotos, // Сохраняем только URL-адреса фотографий
      createdAt: new Date().toISOString()
    };
    
    entries.unshift(newEntry);
    saveEntries();
    renderEntries();
    
    // Сброс формы
    entryTitle.value = '';
    entryContent.value = '';
    selectedPhotos = [];
    
    // Обновляем счетчик фото в кнопке
    const photoUploadText = document.querySelector('.photo-upload-text');
    if (photoUploadText) {
      photoUploadText.textContent = `Добавить фото (0/${MAX_PHOTOS})`;
    }
    
    // Скрываем контейнер предпросмотра
    photoPreview.style.display = 'none';
    photoPreview.innerHTML = '';
  }

  // Функция для удаления записи
  function deleteEntry(id) {
    entries = entries.filter(entry => entry.id !== id);
    saveEntries();
    renderEntries();
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
      entry.photos.forEach((photoUrl, index) => {
        const photoElement = document.createElement('div');
        photoElement.className = 'modal-photo';
        photoElement.innerHTML = `<img src="${photoUrl}" alt="Фото ${index + 1}">`;
        
        // Открытие полноэкранного просмотра при клике на фото
        photoElement.addEventListener('click', () => {
          openFullscreenPhoto(entry.photos, index);
        });
        
        modalPhotos.appendChild(photoElement);
      });
    }
    
    // Сначала блокируем прокрутку и добавляем класс для затемнения
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');
    
    // Затем активируем модальное окно
    setTimeout(() => {
      modal.classList.add('active');
    }, 10);
  }

  // Функция для закрытия модального окна
  function closeModal() {
    // Сначала убираем активный класс с модального окна
    modal.classList.remove('active');
    
    // Затем с небольшой задержкой убираем класс modal-open и разблокируем прокрутку
    setTimeout(() => {
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
    }, 50);
    
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
    
    // Если не добавлен класс modal-open, добавляем его для дополнительной гарантии
    if (!document.body.classList.contains('modal-open')) {
      document.body.classList.add('modal-open');
    }
    
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

  // Обновление превью фотографий
  function updatePhotoPreview() {
    photoPreview.innerHTML = '';
    
    // Обновляем текст кнопки загрузки фото с добавлением счетчика
    const photoUploadText = document.querySelector('.photo-upload-text');
    if (photoUploadText) {
      photoUploadText.textContent = `Добавить фото (${selectedPhotos.length}/${MAX_PHOTOS})`;
    }
    
    // Скрываем контейнер предпросмотра, даже если есть фотографии
    photoPreview.style.display = 'none';
  }
  
  // Добавляем обработчики свайпов для фото
  function addSwipeHandlers(element, index) {
    let startX = 0;
    let currentX = 0;
    
    // Обработчики только для сенсорных устройств
    element.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    element.addEventListener('touchmove', function(e) {
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      
      // Ограничиваем смещение до 30px
      const translateX = Math.min(Math.max(diffX, -30), 30);
      element.style.transform = `translateX(${translateX}px)`;
    }, { passive: true });
    
    element.addEventListener('touchend', function(e) {
      const diffX = currentX - startX;
      
      if (diffX > 20) {
        // Свайп вправо - удаляем фото (порог 20px)
        lastDeletedPhoto = selectedPhotos[index];
        selectedPhotos.splice(index, 1);
        updatePhotoPreview();
      } else if (diffX < -20) {
        // Свайп влево - восстанавливаем последнее удаленное фото (порог 20px)
        if (lastDeletedPhoto) {
          selectedPhotos.push(lastDeletedPhoto);
          lastDeletedPhoto = null;
          updatePhotoPreview();
        }
      } else {
        // Возвращаем элемент на место, если свайп был недостаточным
        element.style.transform = 'translateX(0)';
      }
    });
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

  // Добавляем обработчики свайпа для кнопки добавления фото
  if (document.querySelector('.photo-upload-label')) {
    const photoUploadLabel = document.querySelector('.photo-upload-label');
    let startX = 0;
    let currentX = 0;
    
    // Устанавливаем начальный текст с счетчиком
    const photoUploadText = photoUploadLabel.querySelector('.photo-upload-text');
    if (photoUploadText) {
      photoUploadText.textContent = `Добавить фото (0/${MAX_PHOTOS})`;
    }
    
    photoUploadLabel.addEventListener('touchstart', function(e) {
      startX = e.touches[0].clientX;
    }, { passive: true });
    
    photoUploadLabel.addEventListener('touchmove', function(e) {
      currentX = e.touches[0].clientX;
      const diffX = currentX - startX;
      
      // Ограничиваем смещение до 30px
      const translateX = Math.min(Math.max(diffX, -30), 30);
      photoUploadLabel.style.transform = `translateX(${translateX}px)`;
    }, { passive: true });
    
    photoUploadLabel.addEventListener('touchend', function(e) {
      const diffX = currentX - startX;
      
      if (diffX > 20) {
        // Свайп вправо - удаляем последнее добавленное фото
        if (selectedPhotos.length > 0) {
          lastDeletedPhoto = selectedPhotos.pop();
          updatePhotoPreview();
        }
      } else if (diffX < -20) {
        // Свайп влево - восстанавливаем последнее удаленное фото
        if (lastDeletedPhoto) {
          selectedPhotos.push(lastDeletedPhoto);
          lastDeletedPhoto = null;
          updatePhotoPreview();
        }
      }
      
      // Возвращаем элемент на место в любом случае
      photoUploadLabel.style.transform = 'translateX(0)';
    });
  }

  // Инициализация
  renderEntries();
});
