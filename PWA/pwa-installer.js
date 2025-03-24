/**
 * PWA Installer
 * Скрипт для регистрации сервис-воркера и управления установкой PWA
 */

// Переменные для хранения отложенного события установки и статуса поддержки
let deferredPrompt;
let isPwaSupported = false;

// Регистрация сервис-воркера при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
  // Проверяем поддержку сервис-воркера
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/webapp/PWA/service-worker.js')
      .then(reg => {
        console.log('Сервис-воркер зарегистрирован успешно', reg);
      })
      .catch(error => {
        console.error('Ошибка регистрации сервис-воркера:', error);
      });
  }

  // Инициализируем кнопку установки PWA
  initInstallButton();
});

// Прослушиваем событие beforeinstallprompt для отложенного отображения установки
window.addEventListener('beforeinstallprompt', (e) => {
  // Предотвращаем показ стандартного UI браузера
  e.preventDefault();
  
  // Сохраняем событие для последующего использования
  deferredPrompt = e;
  
  // Указываем, что PWA поддерживается
  isPwaSupported = true;
  
  // Обновляем интерфейс кнопки
  updateInstallButton();
});

// Функция для инициализации кнопки установки
function initInstallButton() {
  const installButton = document.getElementById('pwa-install-button');
  
  if (installButton) {
    // Улучшенные обработчики событий для кнопки
    
    // Запрещаем стандартный эффект фокуса
    installButton.addEventListener('focus', function(e) {
      this.blur();
    });
    
    // Простой обработчик клика для всех устройств
    installButton.addEventListener('click', function(e) {
      console.log('Клик на кнопку установки обработан');
      handleInstallClick();
    });
    
    // Специальные обработчики для сенсорных устройств
    if ('ontouchstart' in window) {
      // Используем touchstart и touchend для мобильных устройств
      installButton.addEventListener('touchstart', function(e) {
        // Предотвращаем зум и другие стандартные действия браузера
        e.preventDefault();
        e.stopPropagation();
        // Визуальная обратная связь без фона
        this.style.transform = 'scale(0.95)';
      }, { passive: false });
      
      installButton.addEventListener('touchend', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Восстанавливаем обычный размер
        this.style.transform = 'scale(1)';
        // Добавляем небольшую задержку для лучшего UX
        setTimeout(() => {
          handleInstallClick();
        }, 10);
      }, { passive: false });
      
      // Отменяем действие, если пользователь передумал
      installButton.addEventListener('touchcancel', function(e) {
        this.style.transform = 'scale(1)';
      });
    }
    
    // Обработка клавиатуры для accessibility
    installButton.addEventListener('keydown', function(e) {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleInstallClick();
      }
    });
    
    // Начальное обновление состояния кнопки
    updateInstallButton();
  }
}

// Обработчик нажатия на кнопку установки
function handleInstallClick() {
  console.log('Нажатие на кнопку установки обработано');
  
  // Если PWA не поддерживается, показываем уведомление
  if (!isPwaSupported) {
    alert('Ваш браузер не поддерживает установку PWA или приложение уже установлено. Используйте Chrome или Edge.');
    return;
  }
  
  // Если у нас есть отложенное событие установки, показываем его
  if (deferredPrompt) {
    deferredPrompt.prompt();
    
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Пользователь согласился установить PWA');
      } else {
        console.log('Пользователь отказался от установки PWA');
      }
      
      // Очищаем сохраненное событие
      deferredPrompt = null;
      
      // Обновляем состояние кнопки
      updateInstallButton();
    });
  }
}

// Функция для обновления состояния кнопки установки
function updateInstallButton() {
  const installButton = document.getElementById('pwa-install-button');
  
  if (installButton) {
    // Если PWA уже установлено, делаем кнопку неактивной
    if (window.matchMedia('(display-mode: standalone)').matches || 
        navigator.standalone === true) {
      installButton.style.opacity = '0.5';
      installButton.setAttribute('title', 'Приложение уже установлено');
      installButton.setAttribute('disabled', 'disabled');
      installButton.setAttribute('aria-disabled', 'true');
    } else {
      installButton.style.opacity = '1';
      installButton.removeAttribute('disabled');
      installButton.setAttribute('aria-disabled', 'false');
      
      if (isPwaSupported) {
        installButton.setAttribute('title', 'Установить приложение');
      } else {
        installButton.setAttribute('title', 'Браузер не поддерживает установку или приложение уже установлено');
      }
    }
  }
} 