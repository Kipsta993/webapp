/**
 * JavaScript для анимаций в приложении
 */

document.addEventListener('DOMContentLoaded', function() {
  // Флаг для отслеживания состояния анимации
  let isAnimating = false;
  
  // Функция для добавления классов анимации к элементам страницы
  function setupPageAnimations() {
    // Получаем все страницы
    const pages = document.querySelectorAll('.page');
    
    // Для каждой страницы находим элементы, которые нужно анимировать
    pages.forEach(page => {
      // Находим все карточки на странице
      const cards = page.querySelectorAll('.card, .tasks-card, .goal-card, .diary-card, .stats-card, .goals-card');
      
      // Анимируем карточки
      cards.forEach((card, cardIndex) => {
        // Базовая анимация для карточки
        card.classList.add('animate-item', 'animate-fade-down', `delay-${cardIndex * 2}`);
        
        // Анимируем заголовки карточек
        const cardTitles = card.querySelectorAll('.daily-card-title, .weekly-card-title, .stats-title, .card-title, .page-title');
        cardTitles.forEach((title, titleIndex) => {
          title.classList.add('animate-item', 'animate-fade-right', `delay-${cardIndex * 2 + 1}`);
          
          // Анимируем иконки в заголовках
          const icons = title.querySelectorAll('i');
          icons.forEach((icon, iconIndex) => {
            icon.classList.add('animate-item', 'animate-zoom', `delay-${cardIndex * 2 + 2}`);
          });
        });
        
        // Анимируем содержимое карточек
        const taskItems = card.querySelectorAll('.task-item, .goal-item, .entry-item, .day-column');
        taskItems.forEach((item, itemIndex) => {
          item.classList.add('animate-item', 'animate-fade-right', `delay-${cardIndex * 2 + 3 + itemIndex}`);
          
          // Анимируем чекбоксы
          const checkboxes = item.querySelectorAll('.task-checkbox, .goal-checkbox');
          checkboxes.forEach((checkbox) => {
            checkbox.classList.add('animate-item', 'animate-zoom', `delay-${cardIndex * 2 + 4 + itemIndex}`);
          });
          
          // Анимируем заголовки задач
          const taskTitles = item.querySelectorAll('.task-title, .goal-title, .entry-title');
          taskTitles.forEach((taskTitle) => {
            taskTitle.classList.add('animate-item', 'animate-fade', `delay-${cardIndex * 2 + 5 + itemIndex}`);
          });
        });
        
        // Анимируем прогресс-бар
        const progressContainers = card.querySelectorAll('.progress-container');
        progressContainers.forEach((container, containerIndex) => {
          container.classList.add('animate-item', 'animate-fade', `delay-${cardIndex * 2 + 6}`);
          
          // Анимируем элементы прогресс-бара
          const progressElements = container.querySelectorAll('.progress-info, .progress-bar');
          progressElements.forEach((element, elementIndex) => {
            element.classList.add('animate-item', 'animate-fade', `delay-${cardIndex * 2 + 7 + elementIndex}`);
          });
          
          // Анимируем заполнение прогресс-бара
          const progressFills = container.querySelectorAll('.progress-fill');
          progressFills.forEach((fill) => {
            fill.classList.add('animate-item', 'animate-fade-right', `delay-${cardIndex * 2 + 9}`);
          });
        });
        
        // Анимируем формы
        const forms = card.querySelectorAll('form, .add-goal-form, .add-entry-form');
        forms.forEach((form, formIndex) => {
          form.classList.add('animate-item', 'animate-fade-down', `delay-${cardIndex * 2 + 2}`);
          
          // Анимируем поля ввода
          const inputs = form.querySelectorAll('input, textarea, select, button, .form-group, .photo-upload-container');
          inputs.forEach((input, inputIndex) => {
            input.classList.add('animate-item', 'animate-fade', `delay-${cardIndex * 2 + 3 + inputIndex}`);
          });
        });
        
        // Анимируем другие элементы
        const otherElements = card.querySelectorAll('.next-task, .time-counter, .tasks-summary, .streak-container, .sort-controls, .sort-options');
        otherElements.forEach((element, elementIndex) => {
          element.classList.add('animate-item', 'animate-fade', `delay-${cardIndex * 2 + 3 + elementIndex}`);
          
          // Анимируем дочерние элементы
          const childElements = element.children;
          Array.from(childElements).forEach((child, childIndex) => {
            child.classList.add('animate-item', 'animate-fade', `delay-${cardIndex * 2 + 4 + elementIndex + childIndex}`);
          });
        });
      });
      
      // Анимируем заголовки страниц, которые находятся вне карточек
      const pageTitles = page.querySelectorAll('.page-title, .page-header');
      pageTitles.forEach((title, index) => {
        title.classList.add('animate-item', 'animate-fade-down', `delay-${index}`);
        
        // Анимируем иконки в заголовках
        const icons = title.querySelectorAll('i');
        icons.forEach((icon, iconIndex) => {
          icon.classList.add('animate-item', 'animate-zoom', `delay-${index + 1}`);
        });
      });
      
      // Анимируем формы, которые находятся вне карточек
      const pageForms = page.querySelectorAll('.add-goal-form, .add-entry-form');
      pageForms.forEach((form, index) => {
        if (!form.closest('.card')) { // Проверяем, что форма не внутри карточки
          form.classList.add('animate-item', 'animate-fade-down', `delay-1`);
          
          // Анимируем поля формы
          const formGroups = form.querySelectorAll('.form-group');
          formGroups.forEach((group, groupIndex) => {
            group.classList.add('animate-item', 'animate-fade', `delay-${groupIndex + 2}`);
          });
          
          // Анимируем контейнер для загрузки фото
          const photoUpload = form.querySelector('.photo-upload-container');
          if (photoUpload) photoUpload.classList.add('animate-item', 'animate-fade', `delay-4`);
        }
      });
      
      // Анимируем списки, которые находятся вне карточек
      const pageLists = page.querySelectorAll('.goals-list, .entries-list');
      pageLists.forEach((list, index) => {
        if (!list.closest('.card')) { // Проверяем, что список не внутри карточки
          list.classList.add('animate-item', 'animate-fade', `delay-5`);
        }
      });
    });
  }
  
  // Функция для сброса и запуска анимации при переключении страниц
  function resetPageAnimation(pageId) {
    // Если анимация уже выполняется, не запускаем ее снова
    if (isAnimating) return;
    
    // Устанавливаем флаг анимации
    isAnimating = true;
    
    // Находим страницу
    const page = document.getElementById(pageId + '-page');
    if (!page) {
      isAnimating = false;
      return;
    }
    
    // Специальная обработка для страницы Goals
    if (pageId === 'goals') {
      // Анимируем заголовок страницы
      const pageHeader = page.querySelector('.page-header');
      if (pageHeader) {
        pageHeader.classList.add('animate-item', 'animate-fade-down', 'delay-0');
        
        // Анимируем заголовок
        const pageTitle = pageHeader.querySelector('.page-title');
        if (pageTitle) {
          pageTitle.classList.add('animate-item', 'animate-fade-right', 'delay-1');
          
          // Анимируем иконку в заголовке
          const icon = pageTitle.querySelector('i');
          if (icon) icon.classList.add('animate-item', 'animate-zoom', 'delay-2');
        }
      }
      
      // Анимируем форму добавления цели
      const addGoalForm = page.querySelector('.add-goal-form');
      if (addGoalForm) {
        addGoalForm.classList.add('animate-item', 'animate-fade-down', 'delay-1');
        
        // Анимируем поля формы
        const formGroups = addGoalForm.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
          group.classList.add('animate-item', 'animate-fade', `delay-${index + 2}`);
        });
      }
      
      // Анимируем элементы сортировки
      const sortControls = page.querySelector('.sort-controls');
      if (sortControls) {
        sortControls.classList.add('animate-item', 'animate-fade', 'delay-3');
        
        // Анимируем опции сортировки
        const sortOptions = sortControls.querySelectorAll('.sort-option');
        sortOptions.forEach((option, index) => {
          option.classList.add('animate-item', 'animate-fade', `delay-${index + 4}`);
        });
      }
      
      // Анимируем список целей
      const goalsList = page.querySelector('.goals-list');
      if (goalsList) {
        goalsList.classList.add('animate-item', 'animate-fade', 'delay-5');
        
        // Анимируем каждую цель
        const goalItems = goalsList.querySelectorAll('.goal-item');
        goalItems.forEach((item, index) => {
          item.classList.add('animate-item', 'animate-fade-right', `delay-${index + 6}`);
          
          // Анимируем чекбокс
          const checkbox = item.querySelector('.goal-checkbox');
          if (checkbox) checkbox.classList.add('animate-item', 'animate-zoom', `delay-${index + 7}`);
          
          // Анимируем заголовок
          const title = item.querySelector('.goal-title');
          if (title) title.classList.add('animate-item', 'animate-fade', `delay-${index + 8}`);
          
          // Анимируем дедлайн
          const deadline = item.querySelector('.goal-deadline');
          if (deadline) deadline.classList.add('animate-item', 'animate-fade', `delay-${index + 9}`);
        });
      }
    }
    
    // Специальная обработка для страницы Diary
    if (pageId === 'diary') {
      // Анимируем заголовок страницы
      const pageHeader = page.querySelector('.page-header');
      if (pageHeader) {
        pageHeader.classList.add('animate-item', 'animate-fade-down', 'delay-0');
        
        // Анимируем заголовок
        const pageTitle = pageHeader.querySelector('.page-title');
        if (pageTitle) {
          pageTitle.classList.add('animate-item', 'animate-fade-right', 'delay-1');
          
          // Анимируем иконку в заголовке
          const icon = pageTitle.querySelector('i');
          if (icon) icon.classList.add('animate-item', 'animate-zoom', 'delay-2');
        }
      }
      
      // Анимируем форму добавления записи
      const addEntryForm = page.querySelector('.add-entry-form');
      if (addEntryForm) {
        addEntryForm.classList.add('animate-item', 'animate-fade-down', 'delay-1');
        
        // Анимируем поля формы
        const formGroups = addEntryForm.querySelectorAll('.form-group');
        formGroups.forEach((group, index) => {
          group.classList.add('animate-item', 'animate-fade', `delay-${index + 2}`);
        });
        
        // Анимируем контейнер для загрузки фото
        const photoUpload = addEntryForm.querySelector('.photo-upload-container');
        if (photoUpload) photoUpload.classList.add('animate-item', 'animate-fade', 'delay-4');
      }
      
      // Анимируем элементы сортировки
      const sortOptions = page.querySelector('.sort-options');
      if (sortOptions) {
        sortOptions.classList.add('animate-item', 'animate-fade', 'delay-3');
        
        // Анимируем опции сортировки
        const sortOptionItems = sortOptions.querySelectorAll('.sort-option');
        sortOptionItems.forEach((option, index) => {
          option.classList.add('animate-item', 'animate-fade', `delay-${index + 4}`);
        });
      }
      
      // Анимируем список записей
      const entriesList = page.querySelector('.entries-list');
      if (entriesList) {
        entriesList.classList.add('animate-item', 'animate-fade', 'delay-5');
        
        // Анимируем каждую запись
        const entryItems = entriesList.querySelectorAll('.entry-item');
        entryItems.forEach((item, index) => {
          item.classList.add('animate-item', 'animate-fade-right', `delay-${index + 6}`);
          
          // Анимируем заголовок
          const title = item.querySelector('.entry-title');
          if (title) title.classList.add('animate-item', 'animate-fade', `delay-${index + 7}`);
          
          // Анимируем дату
          const date = item.querySelector('.entry-date');
          if (date) date.classList.add('animate-item', 'animate-fade', `delay-${index + 8}`);
          
          // Анимируем индикатор фото
          const photoIndicator = item.querySelector('.entry-photos-indicator');
          if (photoIndicator) photoIndicator.classList.add('animate-item', 'animate-zoom', `delay-${index + 9}`);
        });
      }
    }
    
    // Находим все анимируемые элементы
    const animatableElements = page.querySelectorAll('.animate-item');
    
    // Сначала удаляем класс animate-active со всех элементов
    animatableElements.forEach(element => {
      element.classList.remove('animate-active');
      // Принудительно устанавливаем opacity в 0
      element.style.opacity = '0';
    });
    
    // Запускаем перерисовку DOM
    void page.offsetWidth;
    
    // Затем добавляем класс animate-active после небольшой задержки
    setTimeout(() => {
      animatableElements.forEach(element => {
        // Удаляем inline стиль opacity
        element.style.opacity = '';
        // Добавляем класс для запуска анимации
        element.classList.add('animate-active');
      });
      
      // Сбрасываем флаг анимации после завершения всех анимаций
      setTimeout(() => {
        isAnimating = false;
      }, 1500); // Достаточно времени для завершения всех анимаций
    }, 50);
  }
  
  // Функция для анимации динамически добавленного элемента
  function animateElement(element, type = 'fade-down', delay = 0) {
    if (!element) return;
    
    // Удаляем существующие классы анимации
    const existingClasses = Array.from(element.classList)
      .filter(cls => cls.startsWith('animate-') || cls.startsWith('delay-'));
    existingClasses.forEach(cls => element.classList.remove(cls));
    
    // Удаляем класс animate-active
    element.classList.remove('animate-active');
    
    // Принудительно устанавливаем opacity в 0
    element.style.opacity = '0';
    
    // Запускаем перерисовку DOM
    void element.offsetWidth;
    
    // Добавляем новые классы анимации
    element.classList.add('animate-item', `animate-${type}`, `delay-${delay}`);
    
    // Добавляем класс animate-active после небольшой задержки
    setTimeout(() => {
      // Удаляем inline стиль opacity
      element.style.opacity = '';
      // Добавляем класс для запуска анимации
      element.classList.add('animate-active');
      
      // Анимируем дочерние элементы
      const children = element.children;
      Array.from(children).forEach((child, index) => {
        // Пропускаем элементы, которые уже имеют анимацию
        if (child.classList.contains('animate-item')) {
          child.classList.add('animate-active');
          return;
        }
        
        // Добавляем анимацию с увеличивающейся задержкой
        child.classList.add('animate-item', 'animate-fade', `delay-${delay + index + 1}`, 'animate-active');
        
        // Рекурсивно анимируем вложенные элементы
        const nestedChildren = child.children;
        if (nestedChildren.length > 0) {
          Array.from(nestedChildren).forEach((nestedChild, nestedIndex) => {
            if (!nestedChild.classList.contains('animate-item')) {
              nestedChild.classList.add('animate-item', 'animate-fade', `delay-${delay + index + nestedIndex + 2}`, 'animate-active');
            } else {
              nestedChild.classList.add('animate-active');
            }
          });
        }
      });
    }, 10);
    
    return element;
  }
  
  // Делаем функцию анимации доступной глобально
  window.animateElement = animateElement;
  
  // Инициализация анимаций при загрузке страницы
  setupPageAnimations();
  
  // Добавляем класс animate-active ко всем элементам на активной странице
  const activePage = document.querySelector('.page.active');
  if (activePage) {
    // Если активная страница - Goals или Diary, применяем специальную обработку
    if (activePage.id === 'goals-page') {
      resetPageAnimation('goals');
    } else if (activePage.id === 'diary-page') {
      resetPageAnimation('diary');
    } else {
      // Для других страниц просто добавляем класс animate-active
      const animatableElements = activePage.querySelectorAll('.animate-item');
      animatableElements.forEach(element => {
        element.classList.add('animate-active');
      });
    }
  }
  
  // Перехватываем функцию переключения страниц
  const originalSwitchPage = window.switchPage;
  if (typeof originalSwitchPage === 'function') {
    window.switchPage = function(pageId) {
      // Вызываем оригинальную функцию
      originalSwitchPage(pageId);
      
      // Сбрасываем анимацию для новой страницы
      resetPageAnimation(pageId);
    };
  } else {
    // Если оригинальная функция не найдена, добавляем обработчики к элементам навигации
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', function() {
        const pageId = this.getAttribute('data-page');
        // Сбрасываем анимацию для новой страницы
        setTimeout(() => {
          resetPageAnimation(pageId);
        }, 50);
      });
    });
  }
});