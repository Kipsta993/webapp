/**
 * JavaScript для страницы Diary
 * Обеспечивает функциональность добавления, удаления и сортировки записей дневника
 */

document.addEventListener('DOMContentLoaded', function() {
  // Инициализация хранилища записей
  let entries = JSON.parse(localStorage.getItem('diary-entries')) || [];
  let currentSort = 'newest'; // По умолчанию сортировка по новизне
  let currentEntry = null; // Текущая открытая запись

  // Получение элементов DOM
  const entryForm = document.getElementById('add-entry-form');
  const entriesList = document.getElementById('entries-list');
  const entryTitle = document.getElementById('entry-title');
  const entryContent = document.getElementById('entry-content');
  const sortNewest = document.getElementById('diary-sort-newest');
  const sortOldest = document.getElementById('diary-sort-oldest');
  const emptyList = document.getElementById('diary-empty-list');
  
  // Элементы модального окна
  const modal = document.getElementById('entry-modal');
  const modalTitle = modal ? modal.querySelector('.modal-title') : null;
  const modalDate = modal ? modal.querySelector('.modal-date') : null;
  const modalContent = modal ? modal.querySelector('.modal-content') : null;
  const modalClose = modal ? modal.querySelector('.modal-close') : null;

  // Проверка наличия элементов на странице
  if (!entryForm || !entriesList || !modal) return;

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

  // Функция для добавления новой записи
  function addEntry(event) {
    event.preventDefault();
    
    const title = entryTitle.value.trim();
    const content = entryContent.value.trim();
    
    if (!title || !content) return;
    
    const newEntry = {
      id: generateId(),
      title: title,
      content: content,
      createdAt: new Date().toISOString()
    };
    
    entries.unshift(newEntry);
    saveEntries();
    renderEntries();
    
    // Сброс формы
    entryTitle.value = '';
    entryContent.value = '';
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
      return;
    }
    
    emptyList.style.display = 'none';
    
    // Отображение записей
    entries.forEach(entry => {
      const entryItem = document.createElement('div');
      entryItem.className = 'entry-item';
      entryItem.dataset.id = entry.id;
      
      entryItem.innerHTML = `
        <div class="entry-header">
          <h3 class="entry-title">${entry.title}</h3>
          <div class="entry-actions">
            <button class="entry-delete" aria-label="Удалить запись">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="entry-date">${formatDateTime(entry.createdAt)}</div>
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
  }

  // Функция для открытия модального окна
  function openModal(entry) {
    currentEntry = entry;
    
    modalTitle.textContent = entry.title;
    modalDate.textContent = formatDateTime(entry.createdAt);
    modalContent.innerHTML = entry.content.replace(/\n/g, '<br>');
    
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

  // Обработчики событий
  entryForm.addEventListener('submit', addEntry);
  
  sortNewest.addEventListener('click', function() {
    currentSort = 'newest';
    sortNewest.classList.add('active');
    sortOldest.classList.remove('active');
    renderEntries();
  });
  
  sortOldest.addEventListener('click', function() {
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
  
  // Закрытие модального окна при нажатии Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  // Инициализация
  renderEntries();
});
