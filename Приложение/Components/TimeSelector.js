/**
 * Кастомный селектор времени
 * Обеспечивает удобный выбор времени с помощью интерактивного интерфейса
 */

class TimeSelector {
  constructor(inputElement, options = {}) {
    this.inputElement = inputElement;
    this.options = {
      minuteStep: options.minuteStep || 5,
      format24h: options.format24h !== undefined ? options.format24h : true,
      defaultTime: options.defaultTime || '09:00'
    };
    
    this.isOpen = false;
    this.selectedHour = 9;
    this.selectedMinute = 0;
    
    this.init();
  }
  
  init() {
    // Создаем контейнер для селектора
    this.container = document.createElement('div');
    this.container.className = 'time-selector-container';
    
    // Создаем элементы селектора
    this.createSelectorElements();
    
    // Устанавливаем начальное значение
    this.setInitialValue();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Добавляем селектор после инпута
    this.inputElement.parentNode.insertBefore(this.container, this.inputElement.nextSibling);
    
    // Скрываем селектор
    this.container.style.display = 'none';
  }
  
  createSelectorElements() {
    // Создаем структуру селектора
    this.container.innerHTML = `
      <div class="time-selector">
        <div class="time-selector-header">
          <div class="time-display">
            <span class="hour-display">09</span>
            <span class="time-separator">:</span>
            <span class="minute-display">00</span>
          </div>
        </div>
        <div class="time-selector-body">
          <div class="hour-selector">
            ${this.generateHourOptions()}
          </div>
          <div class="minute-selector">
            ${this.generateMinuteOptions()}
          </div>
        </div>
        <div class="time-selector-footer">
          <button class="time-selector-close">Готово</button>
        </div>
      </div>
    `;
    
    // Получаем ссылки на элементы
    this.hourDisplay = this.container.querySelector('.hour-display');
    this.minuteDisplay = this.container.querySelector('.minute-display');
    this.hourSelector = this.container.querySelector('.hour-selector');
    this.minuteSelector = this.container.querySelector('.minute-selector');
    this.closeButton = this.container.querySelector('.time-selector-close');
  }
  
  generateHourOptions() {
    let html = '';
    const hoursCount = this.options.format24h ? 24 : 12;
    
    for (let i = 0; i < hoursCount; i++) {
      const hour = this.options.format24h ? i : (i === 0 ? 12 : i);
      const hourText = hour.toString().padStart(2, '0');
      html += `<div class="time-option hour-option" data-value="${i}">${hourText}</div>`;
    }
    
    return html;
  }
  
  generateMinuteOptions() {
    let html = '';
    
    for (let i = 0; i < 60; i += this.options.minuteStep) {
      const minuteText = i.toString().padStart(2, '0');
      html += `<div class="time-option minute-option" data-value="${i}">${minuteText}</div>`;
    }
    
    return html;
  }
  
  setInitialValue() {
    // Парсим начальное значение из инпута или используем значение по умолчанию
    const initialValue = this.inputElement.value || this.options.defaultTime;
    
    if (initialValue) {
      const [hours, minutes] = initialValue.split(':').map(Number);
      this.selectedHour = hours || 0;
      this.selectedMinute = minutes || 0;
      
      // Округляем минуты до ближайшего шага
      this.selectedMinute = Math.round(this.selectedMinute / this.options.minuteStep) * this.options.minuteStep;
      if (this.selectedMinute >= 60) {
        this.selectedMinute = 0;
        this.selectedHour = (this.selectedHour + 1) % (this.options.format24h ? 24 : 12);
      }
    }
    
    this.updateDisplay();
    this.updateInputValue();
  }
  
  updateDisplay() {
    // Обновляем отображение выбранного времени
    this.hourDisplay.textContent = this.selectedHour.toString().padStart(2, '0');
    this.minuteDisplay.textContent = this.selectedMinute.toString().padStart(2, '0');
    
    // Обновляем активные классы
    const hourOptions = this.hourSelector.querySelectorAll('.hour-option');
    hourOptions.forEach(option => {
      option.classList.toggle('active', parseInt(option.dataset.value) === this.selectedHour);
    });
    
    const minuteOptions = this.minuteSelector.querySelectorAll('.minute-option');
    minuteOptions.forEach(option => {
      option.classList.toggle('active', parseInt(option.dataset.value) === this.selectedMinute);
    });
    
    // Прокручиваем к выбранным значениям
    this.scrollToSelected();
  }
  
  scrollToSelected() {
    // Прокручиваем к выбранному часу
    const selectedHourElement = this.hourSelector.querySelector(`.hour-option[data-value="${this.selectedHour}"]`);
    if (selectedHourElement) {
      this.hourSelector.scrollTop = selectedHourElement.offsetTop - this.hourSelector.offsetHeight / 2 + selectedHourElement.offsetHeight / 2;
    }
    
    // Прокручиваем к выбранной минуте
    const selectedMinuteElement = this.minuteSelector.querySelector(`.minute-option[data-value="${this.selectedMinute}"]`);
    if (selectedMinuteElement) {
      this.minuteSelector.scrollTop = selectedMinuteElement.offsetTop - this.minuteSelector.offsetHeight / 2 + selectedMinuteElement.offsetHeight / 2;
    }
  }
  
  updateInputValue() {
    // Обновляем значение в инпуте
    const hourText = this.selectedHour.toString().padStart(2, '0');
    const minuteText = this.selectedMinute.toString().padStart(2, '0');
    this.inputElement.value = `${hourText}:${minuteText}`;
    
    // Вызываем событие изменения для инпута
    const event = new Event('change', { bubbles: true });
    this.inputElement.dispatchEvent(event);
  }
  
  addEventListeners() {
    // Открытие селектора при клике на инпут
    this.inputElement.addEventListener('click', (e) => {
      e.preventDefault();
      this.open();
    });
    
    // Закрытие селектора при клике на кнопку "Готово"
    this.closeButton.addEventListener('click', () => {
      this.close();
    });
    
    // Выбор часа
    this.hourSelector.addEventListener('click', (e) => {
      if (e.target.classList.contains('hour-option')) {
        this.selectedHour = parseInt(e.target.dataset.value);
        this.updateDisplay();
        this.updateInputValue();
      }
    });
    
    // Выбор минуты
    this.minuteSelector.addEventListener('click', (e) => {
      if (e.target.classList.contains('minute-option')) {
        this.selectedMinute = parseInt(e.target.dataset.value);
        this.updateDisplay();
        this.updateInputValue();
      }
    });
    
    // Закрытие селектора при клике вне его
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.container.contains(e.target) && e.target !== this.inputElement) {
        this.close();
      }
    });
  }
  
  open() {
    if (!this.isOpen) {
      this.container.style.display = 'block';
      this.isOpen = true;
      this.scrollToSelected();
      
      // Анимация открытия
      setTimeout(() => {
        this.container.classList.add('active');
      }, 10);
    }
  }
  
  close() {
    if (this.isOpen) {
      this.container.classList.remove('active');
      
      // Анимация закрытия
      setTimeout(() => {
        this.container.style.display = 'none';
        this.isOpen = false;
      }, 200);
    }
  }
}

// Инициализация селекторов времени при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Находим все инпуты для времени
  const timeInputs = document.querySelectorAll('input[type="time"]');
  
  // Создаем селекторы времени для каждого инпута
  timeInputs.forEach(input => {
    // Создаем кастомный инпут
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.className = 'custom-time-input';
    customInput.placeholder = 'ЧЧ:ММ';
    customInput.readOnly = true;
    customInput.autocomplete = 'off';
    
    // Копируем атрибуты
    if (input.id) customInput.id = input.id + '-custom';
    if (input.name) customInput.name = input.name;
    if (input.required) customInput.required = true;
    if (input.value) customInput.value = input.value;
    
    // Заменяем оригинальный инпут на кастомный
    input.style.display = 'none';
    input.parentNode.insertBefore(customInput, input);
    
    // Создаем селектор времени
    new TimeSelector(customInput);
    
    // Синхронизируем значения
    customInput.addEventListener('change', () => {
      input.value = customInput.value;
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    });
  });
}); 