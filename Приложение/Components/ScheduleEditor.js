/**
 * JavaScript для редактора расписания
 * Обеспечивает функциональность добавления, редактирования и удаления заданий в расписании
 * с интеграцией системы уведомлений
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
  
  // Массив заданий расписания и переменная для редактирования
  let scheduleItems = [];
  let editingItemId = null;
  
  // Проверка наличия элементов
  if (!scheduleEditorModal || !addScheduleForm) return;
  
  // Инициализация кастомных селекторов времени
  initTimeSelectors();
  
  // Привязываем обработчики событий
  if (editScheduleBtn) {
    editScheduleBtn.addEventListener('click', openScheduleEditor);
  }
  
  if (scheduleEditorClose) {
    scheduleEditorClose.addEventListener('click', closeScheduleEditor);
  }
  
  if (addScheduleForm) {
    addScheduleForm.addEventListener('submit', addScheduleItem);
  }
  
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
  
  // Функция для генерации уникального ID
  function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
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
    document.body.classList.add('modal-open');
  }
  
  // Функция для закрытия модального окна редактора расписания
  function closeScheduleEditor() {
    scheduleEditorModal.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('modal-open');
    
    // Очищаем форму
    resetForm();
    
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
    // Получаем задания из localStorage
    const savedItems = localStorage.getItem('schedule');
    if (savedItems) {
      scheduleItems = JSON.parse(savedItems);
    } else {
      scheduleItems = [];
    }
    
    // Сортируем задания по времени начала
    scheduleItems.sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Отображаем задания
    renderScheduleItems();
  }
  
  // Функция для отображения заданий расписания
  function renderScheduleItems() {
    if (!editableScheduleList) return;
    
    // Очищаем список
    editableScheduleList.innerHTML = '';
    
    // Добавляем задания в список
    scheduleItems.forEach(item => {
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
        editScheduleItem(item);
      });
      
      deleteBtn.addEventListener('click', () => {
        deleteScheduleItem(item.id);
      });
      
      editableScheduleList.appendChild(scheduleItem);
    });
  }
  
  // Форматирование временного интервала
  function formatTimeRange(startTime, endTime) {
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  }
  
  // Форматирование времени
  function formatTime(timeString) {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  }
  
  // Функция для редактирования задания расписания
  function editScheduleItem(item) {
    editingItemId = item.id;
    
    // Заполняем форму данными задания
    newScheduleTitle.value = item.title;
    scheduleStartTime.value = item.startTime;
    scheduleEndTime.value = item.endTime;
    
    // Обновляем кастомные селекторы времени
    const startTimeWrapper = scheduleStartTime.closest('.custom-time-selector');
    const endTimeWrapper = scheduleEndTime.closest('.custom-time-selector');
    
    if (startTimeWrapper) {
      const hoursInput = startTimeWrapper.querySelector('.hours-input');
      const minutesInput = startTimeWrapper.querySelector('.minutes-input');
      const [hours, minutes] = item.startTime.split(':');
      
      if (hoursInput) hoursInput.value = hours;
      if (minutesInput) minutesInput.value = minutes;
    }
    
    if (endTimeWrapper) {
      const hoursInput = endTimeWrapper.querySelector('.hours-input');
      const minutesInput = endTimeWrapper.querySelector('.minutes-input');
      const [hours, minutes] = item.endTime.split(':');
      
      if (hoursInput) hoursInput.value = hours;
      if (minutesInput) minutesInput.value = minutes;
    }
    
    // Изменяем текст кнопки
    const submitButton = addScheduleForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-save"></i> Сохранить изменения';
    }
  }
  
  // Функция для добавления или обновления задания расписания
  function addScheduleItem(event) {
    event.preventDefault();
    
    const title = newScheduleTitle.value.trim();
    const startTime = scheduleStartTime.value;
    const endTime = scheduleEndTime.value;
    
    // Проверка заполнения полей
    if (!title || !startTime || !endTime) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    // Проверка корректности временного интервала
    if (startTime >= endTime) {
      alert('Время окончания должно быть позже времени начала');
      return;
    }
    
    // Проверка на пересечение с другими заданиями расписания
    const overlappingItem = scheduleItems.find(item => {
      // Пропускаем проверку для редактируемого задания
      if (item.id === editingItemId) return false;
      
      // Проверяем пересечение временных интервалов
      return (startTime < item.endTime && endTime > item.startTime);
    });
    
    if (overlappingItem) {
      alert(`Задание пересекается с существующим: "${overlappingItem.title}" (${formatTimeRange(overlappingItem.startTime, overlappingItem.endTime)})`);
      return;
    }
    
    if (editingItemId) {
      // Обновляем существующее задание
      const index = scheduleItems.findIndex(item => item.id === editingItemId);
      if (index !== -1) {
        scheduleItems[index] = {
          id: editingItemId,
          title,
          startTime,
          endTime
        };
      }
    } else {
      // Добавляем новое задание
      const newItem = {
        id: generateId(),
        title,
        startTime,
        endTime
      };
      scheduleItems.push(newItem);
    }
    
    // Сохраняем изменения
    saveScheduleItems();
    
    // Обновляем список заданий
    renderScheduleItems();
    
    // Сбрасываем форму
    resetForm();
  }
  
  // Функция для сохранения заданий расписания
  function saveScheduleItems() {
    localStorage.setItem('schedule', JSON.stringify(scheduleItems));
    
    // Обновляем запланированные уведомления, если доступны
    if (window.NotificationManager) {
      window.NotificationManager.scheduleAllTodayTasks();
    }
  }
  
  // Функция для удаления задания из расписания
  function deleteScheduleItem(id) {
    if (confirm('Вы уверены, что хотите удалить это задание из расписания?')) {
      // Отменяем уведомления для удаляемого задания
      if (window.NotificationManager) {
        window.NotificationManager.cancelTaskNotifications(id);
      }
      
      // Удаляем задание из массива
      scheduleItems = scheduleItems.filter(item => item.id !== id);
      
      // Сохраняем изменения
      saveScheduleItems();
      
      // Обновляем список заданий
      renderScheduleItems();
      
      // Сбрасываем форму, если удаляем задание, которое сейчас редактируется
      if (editingItemId === id) {
        resetForm();
      }
    }
  }
  
  // Функция для сброса формы
  function resetForm() {
    addScheduleForm.reset();
    editingItemId = null;
    
    // Возвращаем текст кнопки
    const submitButton = addScheduleForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.innerHTML = '<i class="fas fa-plus"></i> Добавить в расписание';
    }
    
    // Сбрасываем кастомные селекторы времени
    const timeSelectors = document.querySelectorAll('.custom-time-selector');
    timeSelectors.forEach(selector => {
      const hoursInput = selector.querySelector('.hours-input');
      const minutesInput = selector.querySelector('.minutes-input');
      
      if (hoursInput && minutesInput) {
        const now = new Date();
        hoursInput.value = now.getHours().toString().padStart(2, '0');
        minutesInput.value = now.getMinutes().toString().padStart(2, '0');
        
        // Обновляем скрытый input
        const hiddenInput = selector.querySelector('input[type="time"]');
        if (hiddenInput) {
          hiddenInput.value = `${hoursInput.value}:${minutesInput.value}`;
        }
      }
    });
  }
}); 