/**
 * JavaScript для редактора расписания
 * Обеспечивает функциональность добавления, редактирования и удаления заданий в расписании
 * с проверкой на пересечение временных интервалов
 */

document.addEventListener('DOMContentLoaded', function() {
  // Элементы DOM для модального окна
  const scheduleEditorModal = document.getElementById('schedule-editor-modal');
  const scheduleEditorClose = document.getElementById('schedule-editor-close');
  const addScheduleForm = document.getElementById('add-schedule-form');
  const newScheduleTitle = document.getElementById('new-schedule-title');
  const scheduleStartTime = document.getElementById('schedule-start-time');
  const scheduleEndTime = document.getElementById('schedule-end-time');
  const editableScheduleList = document.getElementById('editable-schedule-list');
  
  // Кнопка для открытия редактора расписания
  const editScheduleBtn = document.getElementById('edit-schedule-btn');
  
  // Проверка наличия элементов
  if (!scheduleEditorModal) return;
  
  // Инициализация кастомных селекторов времени
  initTimeSelectors();
  
  // Функция для инициализации кастомных селекторов времени
  function initTimeSelectors() {
    // Создаем кастомные селекторы для полей времени
    createCustomTimeSelector(scheduleStartTime);
    createCustomTimeSelector(scheduleEndTime);
  }
  
  // Функция для создания кастомного селектора времени
  function createCustomTimeSelector(inputElement) {
    if (!inputElement) return;
    
    // Создаем обертку для селектора
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-time-selector';
    inputElement.parentNode.insertBefore(wrapper, inputElement);
    wrapper.appendChild(inputElement);
    
    // Скрываем стандартный input
    inputElement.style.display = 'none';
    
    // Создаем контейнер для полей ввода
    const timeInputContainer = document.createElement('div');
    timeInputContainer.className = 'time-input-container';
    wrapper.appendChild(timeInputContainer);
    
    // Создаем элементы для часов и минут
    const hoursInput = document.createElement('input');
    hoursInput.type = 'number';
    hoursInput.className = 'time-input hours-input';
    hoursInput.min = 0;
    hoursInput.max = 23;
    hoursInput.placeholder = 'ЧЧ';
    hoursInput.autocomplete = 'off';
    
    const separator = document.createElement('span');
    separator.className = 'time-separator';
    separator.textContent = ':';
    
    const minutesInput = document.createElement('input');
    minutesInput.type = 'number';
    minutesInput.className = 'time-input minutes-input';
    minutesInput.min = 0;
    minutesInput.max = 59;
    minutesInput.placeholder = 'ММ';
    minutesInput.autocomplete = 'off';
    
    // Добавляем элементы в контейнер
    timeInputContainer.appendChild(hoursInput);
    timeInputContainer.appendChild(separator);
    timeInputContainer.appendChild(minutesInput);
    
    // Функция обновления времени из полей ввода
    function updateTimeValue() {
      let hours = parseInt(hoursInput.value);
      let minutes = parseInt(minutesInput.value);
      
      // Проверяем корректность значений
      if (isNaN(hours)) hours = 0;
      if (isNaN(minutes)) minutes = 0;
      
      hours = Math.max(0, Math.min(23, hours));
      minutes = Math.max(0, Math.min(59, minutes));
      
      // Форматируем значения
      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      
      // Обновляем значение в скрытом input
      const newValue = `${formattedHours}:${formattedMinutes}`;
      inputElement.value = newValue;
      
      // Обновляем значения в полях ввода
      hoursInput.value = formattedHours;
      minutesInput.value = formattedMinutes;
      
      // Создаем событие изменения для input
      const event = new Event('change', { bubbles: true });
      inputElement.dispatchEvent(event);
    }
    
    // Обработчики для полей ввода
    hoursInput.addEventListener('input', function() {
      // Ограничиваем значение
      let value = parseInt(this.value);
      if (!isNaN(value)) {
        if (value > 23) this.value = '23';
        if (value < 0) this.value = '00';
      }
    });
    
    hoursInput.addEventListener('blur', updateTimeValue);
    
    minutesInput.addEventListener('input', function() {
      // Ограничиваем значение
      let value = parseInt(this.value);
      if (!isNaN(value)) {
        if (value > 59) this.value = '59';
        if (value < 0) this.value = '00';
      }
    });
    
    minutesInput.addEventListener('blur', updateTimeValue);
    
    // Обработчик нажатия Enter в полях ввода
    hoursInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        updateTimeValue();
        minutesInput.focus();
      }
    });
    
    minutesInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        updateTimeValue();
        this.blur();
      }
    });
    
    // Автоматический переход к минутам после ввода часов
    hoursInput.addEventListener('input', function() {
      if (this.value.length >= 2) {
        minutesInput.focus();
      }
    });
    
    // Если у поля уже есть значение, устанавливаем его в поля ввода
    if (inputElement.value) {
      const [hours, minutes] = inputElement.value.split(':');
      hoursInput.value = hours;
      minutesInput.value = minutes;
    } else {
      // Устанавливаем текущее время, если поле пустое
      const now = new Date();
      hoursInput.value = now.getHours().toString().padStart(2, '0');
      minutesInput.value = now.getMinutes().toString().padStart(2, '0');
      updateTimeValue();
    }
  }
  
  // Функция для открытия модального окна редактора расписания
  function openScheduleEditor() {
    // Загружаем задания
    loadScheduleItems();
    
    // Закрываем панель настроек, если она открыта
    const settingsPanel = document.getElementById('settings-panel');
    if (settingsPanel && settingsPanel.classList.contains('active')) {
      const closeSettingsBtn = document.getElementById('close-settings');
      if (closeSettingsBtn) {
        closeSettingsBtn.click();
      }
    }
    
    // Открываем модальное окно
    scheduleEditorModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  // Функция для закрытия модального окна редактора расписания
  function closeScheduleEditor() {
    scheduleEditorModal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Очищаем форму
    newScheduleTitle.value = '';
    scheduleStartTime.value = '';
    scheduleEndTime.value = '';
    
    // Обновляем отображение расписания на главном экране
    if (window.loadSchedule) {
      window.loadSchedule();
    }
    
    // Обновляем карточку "Следующее задание"
    if (window.updateNextTask) {
      window.updateNextTask();
    }
  }
  
  // Функция для загрузки заданий расписания
  function loadScheduleItems() {
    // Очищаем список
    editableScheduleList.innerHTML = '';
    
    // Получаем задания из localStorage
    const scheduleItems = JSON.parse(localStorage.getItem('schedule-items')) || [];
    
    // Сортируем задания по времени начала
    scheduleItems.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Отображаем задания
    scheduleItems.forEach(item => {
      addScheduleItemToList(item);
    });
  }
  
  // Функция для добавления задания в список
  function addScheduleItemToList(item) {
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'editable-schedule-item';
    scheduleItem.dataset.id = item.id;
    
    scheduleItem.innerHTML = `
      <div class="schedule-item-info">
        <div class="schedule-item-title">${item.title}</div>
        <div class="schedule-item-time">${formatTimeRange(item.startTime, item.endTime)}</div>
      </div>
      <div class="schedule-item-actions">
        <button class="schedule-edit-btn" aria-label="Редактировать задание">
          <i class="fas fa-edit"></i>
        </button>
        <button class="schedule-delete-btn" aria-label="Удалить задание">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    `;
    
    // Добавляем обработчики событий
    const editBtn = scheduleItem.querySelector('.schedule-edit-btn');
    const deleteBtn = scheduleItem.querySelector('.schedule-delete-btn');
    
    editBtn.addEventListener('click', () => {
      enterEditMode(scheduleItem, item);
    });
    
    deleteBtn.addEventListener('click', () => {
      deleteScheduleItem(item.id);
    });
    
    editableScheduleList.appendChild(scheduleItem);
  }
  
  // Функция для форматирования временного диапазона
  function formatTimeRange(startTime, endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
  
  // Функция для форматирования времени
  function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  }
  
  // Функция для входа в режим редактирования задания
  function enterEditMode(scheduleItem, item) {
    const itemInfo = scheduleItem.querySelector('.schedule-item-info');
    const itemActions = scheduleItem.querySelector('.schedule-item-actions');
    
    // Создаем форму редактирования
    const editForm = document.createElement('div');
    editForm.className = 'schedule-edit-mode';
    editForm.innerHTML = `
      <input type="text" class="schedule-edit-input" value="${item.title}" placeholder="Название задания" autocomplete="off">
      <div class="schedule-edit-time">
        <input type="time" class="schedule-edit-start-time" value="${item.startTime}" autocomplete="off">
        <input type="time" class="schedule-edit-end-time" value="${item.endTime}" autocomplete="off">
      </div>
      <div class="schedule-edit-actions">
        <button class="schedule-save-btn" aria-label="Сохранить">
          <i class="fas fa-check"></i> Сохранить
        </button>
        <button class="schedule-cancel-btn" aria-label="Отменить">
          <i class="fas fa-times"></i> Отменить
        </button>
      </div>
    `;
    
    // Заменяем содержимое
    scheduleItem.innerHTML = '';
    scheduleItem.appendChild(editForm);
    
    // Фокусируемся на поле ввода
    const input = editForm.querySelector('.schedule-edit-input');
    input.focus();
    
    // Добавляем обработчики событий
    const saveBtn = editForm.querySelector('.schedule-save-btn');
    const cancelBtn = editForm.querySelector('.schedule-cancel-btn');
    const startTimeInput = editForm.querySelector('.schedule-edit-start-time');
    const endTimeInput = editForm.querySelector('.schedule-edit-end-time');
    
    saveBtn.addEventListener('click', () => {
      saveScheduleEdit(item.id, input.value, startTimeInput.value, endTimeInput.value);
    });
    
    cancelBtn.addEventListener('click', () => {
      cancelScheduleEdit();
    });
  }
  
  // Функция для сохранения отредактированного задания
  function saveScheduleEdit(itemId, newTitle, newStartTime, newEndTime) {
    if (!newTitle.trim() || !newStartTime || !newEndTime) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    if (newStartTime >= newEndTime) {
      alert('Время начала должно быть раньше времени окончания');
      return;
    }
    
    // Получаем задания из localStorage
    const scheduleItems = JSON.parse(localStorage.getItem('schedule-items')) || [];
    
    // Проверяем на пересечение с другими заданиями
    const hasOverlap = scheduleItems.some(item => {
      // Пропускаем текущее редактируемое задание
      if (item.id === itemId) return false;
      
      // Проверяем пересечение временных интервалов
      return (
        (newStartTime < item.endTime && newEndTime > item.startTime) ||
        (item.startTime < newEndTime && item.endTime > newStartTime)
      );
    });
    
    if (hasOverlap) {
      alert('Это задание пересекается по времени с другим заданием в расписании');
      return;
    }
    
    // Находим и обновляем задание
    const itemIndex = scheduleItems.findIndex(item => item.id === itemId);
    if (itemIndex !== -1) {
      scheduleItems[itemIndex].title = newTitle.trim();
      scheduleItems[itemIndex].startTime = newStartTime;
      scheduleItems[itemIndex].endTime = newEndTime;
      
      // Сохраняем обновленный список
      localStorage.setItem('schedule-items', JSON.stringify(scheduleItems));
      
      // Перезагружаем список
      loadScheduleItems();
      
      // Обновляем карточку "Следующее задание"
      if (window.updateNextTask) {
        window.updateNextTask();
      }
    }
  }
  
  // Функция для отмены редактирования задания
  function cancelScheduleEdit() {
    // Перезагружаем список
    loadScheduleItems();
  }
  
  // Функция для удаления задания
  function deleteScheduleItem(itemId) {
    if (confirm('Вы уверены, что хотите удалить это задание из расписания?')) {
      // Получаем задания из localStorage
      const scheduleItems = JSON.parse(localStorage.getItem('schedule-items')) || [];
      
      // Удаляем задание
      const updatedItems = scheduleItems.filter(item => item.id !== itemId);
      
      // Сохраняем обновленный список
      localStorage.setItem('schedule-items', JSON.stringify(updatedItems));
      
      // Перезагружаем список
      loadScheduleItems();
      
      // Обновляем карточку "Следующее задание"
      if (window.updateNextTask) {
        window.updateNextTask();
      }
    }
  }
  
  // Функция для добавления нового задания
  function addScheduleItem(event) {
    event.preventDefault();
    
    const title = newScheduleTitle.value.trim();
    const startTime = scheduleStartTime.value;
    const endTime = scheduleEndTime.value;
    
    if (!title || !startTime || !endTime) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    if (startTime >= endTime) {
      alert('Время начала должно быть раньше времени окончания');
      return;
    }
    
    // Получаем задания из localStorage
    const scheduleItems = JSON.parse(localStorage.getItem('schedule-items')) || [];
    
    // Проверяем на пересечение с другими заданиями
    const hasOverlap = scheduleItems.some(item => {
      return (
        (startTime < item.endTime && endTime > item.startTime) ||
        (item.startTime < endTime && item.endTime > startTime)
      );
    });
    
    if (hasOverlap) {
      alert('Это задание пересекается по времени с другим заданием в расписании');
      return;
    }
    
    // Создаем новое задание
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      title: title,
      startTime: startTime,
      endTime: endTime
    };
    
    // Добавляем задание в список
    scheduleItems.push(newItem);
    
    // Сохраняем обновленный список
    localStorage.setItem('schedule-items', JSON.stringify(scheduleItems));
    
    // Очищаем поля формы
    newScheduleTitle.value = '';
    scheduleStartTime.value = '';
    scheduleEndTime.value = '';
    
    // Перезагружаем список
    loadScheduleItems();
    
    // Обновляем карточку "Следующее задание"
    if (window.updateNextTask) {
      window.updateNextTask();
    }
  }
  
  // Обработчики событий
  editScheduleBtn.addEventListener('click', openScheduleEditor);
  
  // Улучшенная обработка событий для кнопки закрытия
  scheduleEditorClose.addEventListener('click', closeScheduleEditor);
  scheduleEditorClose.addEventListener('touchstart', function(e) {
    e.preventDefault(); // Предотвращаем стандартное поведение
  });
  scheduleEditorClose.addEventListener('touchend', function(e) {
    e.preventDefault(); // Предотвращаем стандартное поведение
    closeScheduleEditor();
  });
  
  // Закрытие модального окна при клике на фон
  scheduleEditorModal.addEventListener('click', function(event) {
    if (event.target === scheduleEditorModal) {
      closeScheduleEditor();
    }
  });
  
  // Закрытие модального окна при нажатии Escape
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && scheduleEditorModal.classList.contains('active')) {
      closeScheduleEditor();
    }
  });
  
  // Обработчик отправки формы
  addScheduleForm.addEventListener('submit', addScheduleItem);
  
  // Делаем функцию загрузки расписания глобально доступной
  window.loadScheduleItems = loadScheduleItems;
}); 