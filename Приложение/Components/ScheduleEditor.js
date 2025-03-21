/**
 * JavaScript для редактора расписания
 * Обеспечивает функциональность добавления, редактирования и удаления заданий в расписании
 * с проверкой на пересечение временных интервалов
 */

document.addEventListener('DOMContentLoaded', function() {
  // Получаем элементы редактора заданий
  const editScheduleBtn = document.getElementById('edit-schedule-btn');
  const scheduleEditorModal = document.getElementById('schedule-editor-modal');
  const scheduleEditorClose = document.getElementById('schedule-editor-close');
  const scheduleForm = document.getElementById('schedule-form');
  const scheduleItemsList = document.getElementById('schedule-items-list');
  const scheduleItemTitle = document.getElementById('schedule-item-title');
  const scheduleItemStartTime = document.getElementById('schedule-item-start-time');
  const scheduleItemEndTime = document.getElementById('schedule-item-end-time');
  
  // Добавляем обработчик события для формы добавления задания
  if (scheduleForm) {
    scheduleForm.addEventListener('submit', addScheduleItem);
  } else {
    console.error('Форма добавления заданий не найдена!');
  }
  
  // Элементы DOM для модального окна
  const addScheduleForm = document.getElementById('add-schedule-form');
  const newScheduleTitle = document.getElementById('new-schedule-title');
  const scheduleStartTime = document.getElementById('schedule-start-time');
  const scheduleEndTime = document.getElementById('schedule-end-time');
  const editableScheduleList = document.getElementById('editable-schedule-list');
  
  // Проверка наличия элементов
  if (!scheduleEditorModal) return;
  
  // Инициализация кастомных селекторов времени
  initTimeSelectors();
  
  // Функция для инициализации кастомных селекторов времени
  function initTimeSelectors() {
    // Проверяем, если возле полей времени уже есть селекторы, не создаем их повторно
    if (scheduleStartTime && !scheduleStartTime.parentNode.classList.contains('custom-time-selector')) {
      createCustomTimeSelector(scheduleStartTime);
    }
    
    if (scheduleEndTime && !scheduleEndTime.parentNode.classList.contains('custom-time-selector')) {
      createCustomTimeSelector(scheduleEndTime);
    }
  }
  
  // Функция для создания кастомного селектора времени
  function createCustomTimeSelector(inputElement) {
    if (!inputElement) return;
    
    // Проверяем, не был ли уже создан кастомный селектор для этого поля
    if (inputElement.parentNode.classList.contains('custom-time-selector')) {
      console.log(`Селектор времени для ${inputElement.id} уже был создан`);
      return;
    }
    
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
  
  // Функция для сохранения элементов расписания
  function saveScheduleItems(items) {
    localStorage.setItem('scheduleItems', JSON.stringify(items));
  }
  
  // Функция для загрузки элементов расписания
  function loadScheduleItems() {
    const storedItems = localStorage.getItem('scheduleItems');
    let scheduleItems = [];
    
    if (storedItems) {
      try {
        scheduleItems = JSON.parse(storedItems);
      } catch (e) {
        console.error('Ошибка при парсинге заданий:', e);
        // Пробуем альтернативный ключ для обратной совместимости
        const alternativeStoredItems = localStorage.getItem('schedule-items');
        if (alternativeStoredItems) {
          try {
            scheduleItems = JSON.parse(alternativeStoredItems);
            console.log('Загружены задания из альтернативного ключа "schedule-items"');
            // Перемещаем данные в новый ключ
            localStorage.setItem('scheduleItems', alternativeStoredItems);
            localStorage.removeItem('schedule-items');
          } catch (e2) {
            console.error('Ошибка при парсинге заданий из альтернативного ключа:', e2);
          }
        }
      }
    }
    
    // Обновляем отображение элементов
    editableScheduleList.innerHTML = '';
    
    if (scheduleItems.length === 0) {
      editableScheduleList.innerHTML = '<div class="empty-message">Нет заданий в расписании</div>';
    } else {
      scheduleItems.forEach((item, index) => {
        const scheduleItem = createScheduleItemElement(item, index);
        editableScheduleList.appendChild(scheduleItem);
      });
    }
    
    return scheduleItems;
  }
  
  // Функция для создания элемента расписания
  function createScheduleItemElement(item, index) {
    const scheduleItem = document.createElement('div');
    scheduleItem.className = 'schedule-item';
    scheduleItem.setAttribute('data-id', item.id);
    
    scheduleItem.innerHTML = `
      <div class="schedule-item-time">${item.startTime} - ${item.endTime}</div>
        <div class="schedule-item-title">${item.title}</div>
      <button class="schedule-item-delete" data-id="${item.id}">
        <i class="fas fa-trash"></i>
        </button>
    `;
    
    // Добавляем обработчик для кнопки удаления
    const deleteButton = scheduleItem.querySelector('.schedule-item-delete');
    deleteButton.addEventListener('click', function(e) {
      e.stopPropagation(); // Предотвращаем всплытие события
      deleteScheduleItem(item.id);
    });
    
    return scheduleItem;
  }
  
  // Функция для добавления нового элемента расписания
  function addScheduleItem(event) {
    event.preventDefault();
    
    // Получаем значения из формы
    const title = scheduleItemTitle.value.trim();
    const startTime = scheduleItemStartTime.value;
    const endTime = scheduleItemEndTime.value;
    
    if (!title || !startTime || !endTime) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    // Генерируем уникальный ID для нового задания
    const newItemId = Date.now().toString();
    
    // Создаем новый элемент расписания
    const newItem = {
      id: newItemId,
      title: title,
      startTime: startTime,
      endTime: endTime
    };
    
    // Получаем задания из localStorage
    const scheduleItems = JSON.parse(localStorage.getItem('scheduleItems')) || [];
    
    // Проверяем на пересечение с другими заданиями
    const overlapping = scheduleItems.some(item => 
      (startTime < item.endTime && endTime > item.startTime)
    );
    
    if (overlapping) {
      const confirmAdd = confirm('Это задание пересекается с другими по времени. Всё равно добавить?');
      if (!confirmAdd) return;
    }
    
    // Добавляем новый элемент
    scheduleItems.push(newItem);
    
    // Сортируем задания по времени начала
    scheduleItems.sort((a, b) => a.startTime.localeCompare(b.startTime));
      
      // Сохраняем обновленный список
    saveScheduleItems(scheduleItems);
    
    // Очищаем поля формы
    scheduleItemTitle.value = '';
    scheduleItemStartTime.value = '';
    scheduleItemEndTime.value = '';
      
      // Перезагружаем список
    const updatedItems = loadScheduleItems();
      
      // Обновляем карточку "Следующее задание"
      if (window.updateNextTask) {
      // Немедленно обновляем
      console.log('Немедленное обновление карточки "Следующее задание"');
        window.updateNextTask();
      
      // Также проверяем, нужно ли отправить уведомление для только что добавленного задания
      checkNewItemForNotification(newItem);
    }
  }
  
  // Функция для удаления задания из расписания
  function deleteScheduleItem(itemId) {
    if (confirm('Вы уверены, что хотите удалить это задание из расписания?')) {
      // Получаем задания из localStorage
      const scheduleItems = JSON.parse(localStorage.getItem('scheduleItems')) || [];
      
      // Удаляем задание
      const updatedItems = scheduleItems.filter(item => item.id !== itemId);
      
      // Сохраняем обновленный список
      saveScheduleItems(updatedItems);
      
      // Удаляем информацию о последнем уведомлении для этого задания
      localStorage.removeItem(`notification_${itemId}`);
      
      // Перезагружаем список
      loadScheduleItems();
      
      // Обновляем карточку "Следующее задание"
      if (window.updateNextTask) {
        window.updateNextTask();
      }
      
      console.log(`Задание с ID ${itemId} удалено из расписания`);
    }
  }
  
  // Функция для проверки необходимости отправки уведомления для нового задания
  function checkNewItemForNotification(item) {
    // Получаем текущее время
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
    
    console.log(`Проверка нового задания "${item.title}" на необходимость отправки уведомления (${item.startTime} vs ${currentTimeString})`);
    
    // Если время начала задания совпадает с текущим временем
    if (item.startTime === currentTimeString) {
      console.log(`Отправка немедленного уведомления для нового задания: ${item.title}`);
      
      // Проверяем поддержку уведомлений
      if (!('Notification' in window)) {
        console.log('Ваш браузер не поддерживает уведомления');
      return;
    }
    
      // Проверяем и запрашиваем разрешение, если нужно
      if (Notification.permission === 'granted') {
        // Отправляем уведомление
        sendTaskNotification(item, now);
      } else if (Notification.permission !== 'denied') {
        // Запрашиваем разрешение
        Notification.requestPermission().then(function(permission) {
          if (permission === 'granted') {
            // Отправляем уведомление после получения разрешения
            sendTaskNotification(item, now);
          } else {
            console.log('Разрешение на отправку уведомлений не было предоставлено');
          }
        });
      } else {
        console.log('Пользователь запретил отправку уведомлений');
      }
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
  
  // Делаем функцию загрузки расписания глобально доступной
  window.loadScheduleItems = loadScheduleItems;
  
  // Запускаем проверку уведомлений
  startScheduleNotifications();

  // Инициализация
  function init() {
    // Загружаем существующие задания
    loadScheduleItems();
    
    // Инициализируем систему уведомлений
    initScheduleNotifications();
  }

  // Функция для инициализации системы уведомлений
  function initScheduleNotifications() {
    console.log('Инициализация системы уведомлений для расписания...');
    
    // Проверяем, включены ли уведомления
    const scheduleNotificationsEnabled = localStorage.getItem('scheduleNotificationsEnabled') === 'true';
    
    if (scheduleNotificationsEnabled) {
      // Запускаем проверку уведомлений
      console.log('✅ Уведомления включены. Запуск системы уведомлений...');
      startScheduleNotifications();
    } else {
      console.log('ℹ️ Уведомления отключены. Система уведомлений не запущена.');
    }
    
    // Публикуем функцию для внешнего доступа
    window.initScheduleNotifications = initScheduleNotifications;
  }

  // Вызываем инициализацию
  init();
});

// Функция для проверки времени и отправки уведомлений
function checkScheduleNotifications() {
  // Проверяем, включены ли уведомления
  const scheduleNotificationsEnabled = localStorage.getItem('scheduleNotificationsEnabled') === 'true';
  
  if (!scheduleNotificationsEnabled) {
    // Убираем лишнее логирование при отключенных уведомлениях
    // console.log('Уведомления о заданиях отключены');
    return;
  }
  
  // Проверяем поддержку Notification API
  if (!('Notification' in window)) {
    console.error('❌ Ваш браузер не поддерживает уведомления!');
    return;
  }
  
  // Проверяем разрешение на отправку уведомлений
  if (Notification.permission !== 'granted') {
    // console.log(`Нет разрешения на отправку уведомлений (текущий статус: ${Notification.permission})`);
    return;
  }
  
  // Получаем текущее время
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentSeconds = now.getSeconds();
  const currentTimeString = `${currentHours.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`;
  const currentDetailedTime = `${currentTimeString}:${currentSeconds.toString().padStart(2, '0')}`;
  
  // Получаем задания из хранилища
  const storedItems = localStorage.getItem('scheduleItems');
  let scheduleItems = [];
  
  if (storedItems) {
    try {
      scheduleItems = JSON.parse(storedItems);
      // Логируем проверку уведомлений только если есть задания и секунды равны 0
      if (currentSeconds === 0) {
        console.log(`Проверка уведомлений для ${scheduleItems.length} заданий в ${currentDetailedTime}`);
      }
    } catch (e) {
      console.error('Ошибка при парсинге заданий:', e);
      return;
    }
  } else {
    // Нет заданий для проверки
    return;
  }
  
  // Проверяем каждое задание
  scheduleItems.forEach(item => {
    // Условие активации: текущее время совпадает с временем начала задания,
    // и секунды равны 0 (это означает, что мы срабатываем точно в начале минуты)
    const isStartTimeMatched = item.startTime === currentTimeString && currentSeconds === 0;
    
    if (isStartTimeMatched) {
      // Проверяем, не было ли уже отправлено уведомление для этого задания
      const lastNotification = localStorage.getItem(`notification_${item.id}`);
      const lastNotificationTime = lastNotification ? new Date(lastNotification) : null;
      
      // Если уведомление уже было отправлено сегодня, пропускаем
      if (lastNotificationTime && 
          lastNotificationTime.getDate() === now.getDate() && 
          lastNotificationTime.getMonth() === now.getMonth() && 
          lastNotificationTime.getFullYear() === now.getFullYear()) {
        console.log(`Уведомление для "${item.title}" уже было отправлено сегодня`);
        return;
      }
      
      // Если время точно совпало и уведомление ещё не отправлялось сегодня
      console.log(`🔔 ВРЕМЯ СОВПАЛО! Отправка уведомления для задания: "${item.title}" в ${currentDetailedTime}`);
      console.log(`Диагностика окружения: ServiceWorker доступен: ${!!navigator.serviceWorker}, ServiceWorker контроллер: ${!!navigator.serviceWorker?.controller}`);
      
      // Отправляем уведомление
      sendTaskNotification(item, now);
    }
  });
}

// Функция для отправки уведомления о задании - на основе функции sendTestNotification из Settings.js
function sendTaskNotification(item, now) {
  // Проверяем поддержку уведомлений
  if (!('Notification' in window)) {
    console.error('❌ Ваш браузер не поддерживает уведомления!');
    return;
  }

  // Проверяем разрешение на уведомления
  if (Notification.permission !== 'granted') {
    console.log(`Запрос разрешения на отправку уведомлений (текущий статус: ${Notification.permission})`);
    Notification.requestPermission().then(function(permission) {
      if (permission === 'granted') {
        console.log('✅ Разрешение на отправку уведомлений получено!');
        sendTaskNotification(item, now); // Пробуем снова после получения разрешения
      } else {
        console.log(`❌ Разрешение на уведомления не было предоставлено (новый статус: ${permission})`);
      }
    });
    return;
  }

  console.log(`🔄 Отправка уведомления для задания: "${item.title}" (ID: ${item.id})`);
  console.log(`Диагностика: ServiceWorker API: ${typeof navigator.serviceWorker}, controller: ${!!navigator.serviceWorker?.controller}`);
  
  // Создаем уведомление через Service Worker
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    console.log('✅ Service Worker активен, используем его для отправки уведомления');
    
    navigator.serviceWorker.ready.then(registration => {
      console.log('✅ Service Worker готов, отправляем уведомление');
      // Создаем уникальный идентификатор для уведомления
      const notificationId = `task-${item.id}-${Date.now()}`;
      
      console.log(`Вызов registration.showNotification со следующими параметрами:`);
      console.log(`- Заголовок: 'Начало задания'`);
      console.log(`- Тело: 'Начинается задание: ${item.title}'`);
      console.log(`- Тег: ${notificationId}`);
      
      registration.showNotification('Начало задания', {
        body: `Начинается задание: ${item.title}`,
        vibrate: [200, 100, 200, 100, 200], // Усиленная вибрация для мобильных устройств
        sound: 'default',
        requireInteraction: true,  // Уведомление не будет автоматически закрыто
        tag: notificationId,       // Уникальный тег для каждого уведомления
        renotify: true,            // Всегда уведомлять пользователя
        data: {
          type: 'task',
          taskId: item.id,
          timestamp: Date.now()
        }
      }).then(() => {
        console.log(`✅ Уведомление успешно отправлено для задания: "${item.title}"`);
        // Сохраняем время отправки уведомления
        localStorage.setItem(`notification_${item.id}`, now.toISOString());
        
        // Вибрация для подтверждения успешной отправки на мобильных устройствах
        if ('vibrate' in navigator) {
          navigator.vibrate(100);
        }
      }).catch(error => {
        console.error(`❌ Ошибка при отправке уведомления через Service Worker: ${error.message}`, error);
        // Если произошла ошибка, используем стандартный API
        sendStandardTaskNotification(item, now);
      });
    }).catch(error => {
      console.error(`❌ Ошибка при получении готового Service Worker: ${error.message}`, error);
      // Если произошла ошибка, используем стандартный API
      sendStandardTaskNotification(item, now);
    });
  } else {
    // Если Service Worker недоступен, используем стандартный API уведомлений
    console.log('❌ Service Worker недоступен, используем альтернативные методы отправки уведомлений');
    sendStandardTaskNotification(item, now);
  }
}

// Функция для отправки стандартного уведомления о задании
function sendStandardTaskNotification(item, now) {
  try {
    console.log(`Попытка отправки стандартного уведомления для задания: ${item.title}`);
    
    // Пытаемся отправить уведомление через API Notification
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      // Сначала попробуем использовать ServiceWorkerRegistration.showNotification
      navigator.serviceWorker.ready.then(registration => {
        console.log(`Отправка через ServiceWorkerRegistration.showNotification для задания: ${item.title}`);
        
        // Создаем уникальный идентификатор для уведомления
        const notificationId = `fallback-task-${item.id}-${Date.now()}`;
        
        registration.showNotification('Начало задания', {
          body: `Начинается задание: ${item.title}`,
          vibrate: [200, 100, 200, 100, 200], // Усиленная вибрация для мобильных устройств
          requireInteraction: true,  // Уведомление не будет автоматически закрыто
          tag: notificationId,       // Уникальный тег для каждого уведомления
          renotify: true            // Всегда уведомлять пользователя
        }).then(() => {
          console.log(`Стандартное уведомление успешно отправлено для задания: ${item.title}`);
          // Сохраняем время отправки уведомления
          localStorage.setItem(`notification_${item.id}`, now.toISOString());
          
          // Вибрация для подтверждения успешной отправки на мобильных устройствах
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
        }).catch(error => {
          console.error(`Ошибка при отправке fallback-уведомления через ServiceWorkerRegistration: ${error.message}`);
          // В случае ошибки, пытаемся использовать alert как самый надежный вариант
          tryAlertNotification(item);
        });
      }).catch(error => {
        console.error(`Ошибка при получении готового Service Worker для fallback: ${error.message}`);
        tryAlertNotification(item);
      });
    } else {
      // Service Worker недоступен или не поддерживается
      console.log(`Service Worker недоступен для стандартного уведомления. Используем альтернативные методы.`);
      tryAlertNotification(item);
    }
  } catch (error) {
    console.error('Ошибка при отправке стандартного уведомления:', error);
    console.log(`Не удалось отправить уведомление для задания: ${item.title}. Ошибка: ${error.message}`);
    
    // В случае критической ошибки пытаемся показать уведомление через alert
    tryAlertNotification(item);
  }
}

// Вспомогательная функция для отправки уведомления через alert как запасной вариант
function tryAlertNotification(item) {
  try {
    alert(`Начинается задание: ${item.title}`);
    console.log(`Уведомление через alert для задания: ${item.title}`);
  } catch (e) {
    // В самом крайнем случае, просто логируем
    console.log('ВНИМАНИЕ! Начинается задание: ' + item.title);
  }
}

// Функция для запуска проверки уведомлений
function startScheduleNotifications() {
  // Удаляем предыдущий интервал, если он был установлен
  if (window.scheduleNotificationsInterval) {
    clearInterval(window.scheduleNotificationsInterval);
    console.log('Предыдущий интервал проверки уведомлений удален');
  }
  
  // Проверяем каждую СЕКУНДУ (вместо минуты)
  console.log('👋 Запуск системы уведомлений для расписания с проверкой КАЖДУЮ СЕКУНДУ');
  window.scheduleNotificationsInterval = setInterval(() => {
    // Убираем лишнее логирование, так как проверка будет выполняться очень часто
    checkScheduleNotifications();
  }, 1000); // 1000 мс = 1 секунда
  
  // Запрашиваем разрешение на уведомления, если оно еще не получено
  if ('Notification' in window) {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      console.log('Запрос разрешения на отправку уведомлений');
      Notification.requestPermission().then(permission => {
        console.log(`Получено решение пользователя: ${permission}`);
        // Если получено разрешение, сразу проверяем уведомления
        if (permission === 'granted') {
          checkScheduleNotifications();
        }
      });
    } else {
      console.log(`Текущее состояние разрешения уведомлений: ${Notification.permission}`);
    }
  } else {
    console.log('Браузер не поддерживает уведомления');
  }
  
  // Проверяем сразу при запуске
  checkScheduleNotifications();
  
  // Добавляем объявление о запуске более точной системы уведомлений
  const lastMessage = localStorage.getItem('notificationSystemMessage');
  if (!lastMessage || Date.now() - parseInt(lastMessage) > 86400000) { // Показываем раз в день
    console.log('%c🚀 УЛУЧШЕННАЯ СИСТЕМА УВЕДОМЛЕНИЙ АКТИВИРОВАНА! Проверка каждую секунду.', 'background: #4CAF50; color: white; padding: 5px; border-radius: 3px;');
    localStorage.setItem('notificationSystemMessage', Date.now().toString());
  }
} 