/**
 * Компонент нижней навигации для To-Do веб-приложения
 * Содержит 5 вкладок: Daily, Weekly, Stats, Goals, Diary
 */

// Импортируем цвета из нашей библиотеки цветов
const colors = require('../Colors');

// Создаем компонент BottomNav
class BottomNav {
  constructor() {
    this.activeTab = 'daily'; // По умолчанию активна вкладка Daily
    this.tabs = [
      {
        id: 'daily',
        label: 'Daily',
        activeColor: colors.blue[300], // Синий цвет для Daily
        icon: this.createCalendarDailyIcon()
      },
      {
        id: 'weekly',
        label: 'Weekly',
        activeColor: colors.deepPurple[300], // Фиолетовый цвет для Weekly
        icon: this.createCalendarWeeklyIcon()
      },
      {
        id: 'stats',
        label: 'Stats',
        activeColor: colors.green[300], // Зеленый цвет для Stats
        icon: this.createStatsIcon()
      },
      {
        id: 'goals',
        label: 'Goals',
        activeColor: colors.additionalColors.metallic.gold, // Золотой цвет для Goals
        icon: this.createTrophyIcon()
      },
      {
        id: 'diary',
        label: 'Diary',
        activeColor: colors.deepPurple[300], // Фиолетовый цвет для Diary
        icon: this.createBookIcon()
      }
    ];
  }

  // Метод для создания иконки календаря для Daily
  createCalendarDailyIcon() {
    return `<i class="fas fa-calendar-day" style="font-size: 1.2rem;"></i>`;
  }

  // Метод для создания иконки календаря для Weekly
  createCalendarWeeklyIcon() {
    return `<i class="fas fa-calendar-week" style="font-size: 1.2rem;"></i>`;
  }

  // Метод для создания иконки статистики
  createStatsIcon() {
    return `<i class="fas fa-chart-bar" style="font-size: 1.2rem;"></i>`;
  }

  // Метод для создания иконки кубка/трофея
  createTrophyIcon() {
    return `<i class="fas fa-trophy" style="font-size: 1.2rem;"></i>`;
  }

  // Метод для создания иконки книги
  createBookIcon() {
    return `<i class="fas fa-book" style="font-size: 1.2rem;"></i>`;
  }

  // Метод для установки активной вкладки
  setActiveTab(tabId) {
    this.activeTab = tabId;
    this.render();
  }

  // Метод для рендеринга компонента
  render() {
    const navElement = document.getElementById('bottom-nav');
    if (!navElement) return;

    // Очищаем содержимое
    navElement.innerHTML = '';

    // Создаем контейнер для навигации
    const navContainer = document.createElement('div');
    navContainer.className = 'bottom-nav-container';
    
    // Добавляем стили для контейнера
    navContainer.style.display = 'flex';
    navContainer.style.justifyContent = 'space-around';
    navContainer.style.alignItems = 'center';
    navContainer.style.position = 'fixed';
    navContainer.style.bottom = '0';
    navContainer.style.left = '0';
    navContainer.style.width = '100%';
    navContainer.style.height = '60px';
    navContainer.style.backgroundColor = colors.grey[50];
    navContainer.style.boxShadow = '0 -2px 5px rgba(0, 0, 0, 0.1)';
    navContainer.style.zIndex = '1000';

    // Создаем элементы для каждой вкладки
    this.tabs.forEach(tab => {
      const tabElement = document.createElement('div');
      tabElement.className = 'nav-tab';
      tabElement.id = `tab-${tab.id}`;
      
      // Добавляем стили для вкладки
      tabElement.style.display = 'flex';
      tabElement.style.flexDirection = 'column';
      tabElement.style.alignItems = 'center';
      tabElement.style.justifyContent = 'center';
      tabElement.style.padding = '5px';
      tabElement.style.cursor = 'pointer';
      tabElement.style.width = '20%';
      tabElement.style.textAlign = 'center';
      
      // Определяем цвет в зависимости от активности вкладки
      const isActive = this.activeTab === tab.id;
      const color = isActive ? tab.activeColor : colors.grey[400];
      
      // Создаем контейнер для иконки
      const iconContainer = document.createElement('div');
      iconContainer.className = 'nav-icon';
      iconContainer.innerHTML = tab.icon;
      iconContainer.style.color = color;
      
      // Создаем элемент для текста
      const labelElement = document.createElement('span');
      labelElement.className = 'nav-label';
      labelElement.textContent = tab.label;
      labelElement.style.fontSize = '12px';
      labelElement.style.marginTop = '2px';
      labelElement.style.color = color;
      
      // Добавляем обработчик клика
      tabElement.addEventListener('click', () => {
        this.setActiveTab(tab.id);
        // Здесь можно добавить логику для переключения между страницами
      });
      
      // Добавляем элементы в DOM
      tabElement.appendChild(iconContainer);
      tabElement.appendChild(labelElement);
      navContainer.appendChild(tabElement);
    });
    
    // Добавляем контейнер в DOM
    navElement.appendChild(navContainer);
  }

  // Метод для инициализации компонента
  init() {
    // Создаем элемент для навигации, если его нет
    if (!document.getElementById('bottom-nav')) {
      const navElement = document.createElement('div');
      navElement.id = 'bottom-nav';
      document.body.appendChild(navElement);
    }
    
    // Рендерим компонент
    this.render();
  }
}

// Экспортируем компонент
module.exports = BottomNav; 