# PWA (Progressive Web App)

Файлы в этой папке отвечают за функциональность Progressive Web App (PWA), которая позволяет устанавливать веб-приложение на устройство и использовать его в офлайн-режиме.

## Содержимое

1. **manifest.json** - основной файл конфигурации PWA. Содержит:
   - Название и описание приложения
   - URL для запуска
   - Настройки отображения
   - Цвета темы

2. **sw.js** (Service Worker) - скрипт, отвечающий за кеширование и работу в офлайн-режиме.

3. **icons/** - папка с иконками для PWA:
   - `icon-192x192.png` - маленькая иконка (192x192)
   - `icon-512x512.png` - большая иконка (512x512)

## Подключение PWA

В `index.html` PWA подключается следующим образом:

```html
<!-- Метатеги для PWA -->
<link rel="manifest" href="Приложение/PWA/manifest.json">
<meta name="theme-color" content="#ffffff">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="MyApp">

<!-- Регистрация Service Worker -->
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('Приложение/PWA/sw.js')
        .then(registration => {
          console.log('Service Worker зарегистрирован:', registration.scope);
        })
        .catch(error => {
          console.error('Ошибка регистрации Service Worker:', error);
        });
    });
  }
</script>
```

## Установка приложения

Пользователь может установить приложение, нажав на иконку загрузки рядом с заголовком "Общее" в настройках приложения. 