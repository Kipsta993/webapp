// Инициализация анимаций для всех страниц

document.addEventListener('DOMContentLoaded', function() {
    // Проверяем, что мы не на странице Settings
    if (!window.location.href.includes('Settings')) {
        // Инициализируем анимацию для секций
        initSectionAnimations();
        
        // Инициализируем анимацию для других элементов с классом animated-item
        initAnimatedItems();
        
        // Добавляем класс animated-item к элементам внутри секций
        addAnimationToSectionItems();
        
        // Специальная инициализация для страницы Stats
        if (window.location.href.includes('Stats')) {
            initStatsAnimations();
        }
    }
});

// Функция для инициализации анимаций секций
function initSectionAnimations() {
    const sections = document.querySelectorAll('section');
    sections.forEach((section, index) => {
        // Устанавливаем индекс для задержки анимации
        section.style.setProperty('--index', index);
    });
}

// Функция для инициализации анимаций других элементов
function initAnimatedItems() {
    const animatedItems = document.querySelectorAll('.animated-item');
    animatedItems.forEach((item, index) => {
        // Устанавливаем индекс для задержки анимации
        item.style.setProperty('--index', index);
    });
}

// Функция для добавления анимации к элементам внутри секций
function addAnimationToSectionItems() {
    // Элементы, которые нужно анимировать внутри секций
    const selectors = [
        '.task-item',
        '.goal-item',
        '.entry-item',
        '.stat-item',
        '.stat-row',
        '.stat-slide'
    ];
    
    // Для каждого селектора
    selectors.forEach(selector => {
        const items = document.querySelectorAll(selector);
        items.forEach((item, index) => {
            // Добавляем класс для анимации
            item.classList.add('animated-item');
            // Устанавливаем индекс с учетом позиции внутри секции
            // Базовый индекс 10 чтобы анимация началась после появления секции
            item.style.setProperty('--index', 10 + index * 0.5);
        });
    });
}

// Функция для инициализации анимаций на странице Stats
function initStatsAnimations() {
    // Анимация для слайдов статистики
    const statSlides = document.querySelectorAll('.stat-slide');
    statSlides.forEach((slide, index) => {
        // Устанавливаем индекс для задержки анимации
        slide.style.setProperty('--index', index);
        
        // Если это активный слайд, делаем его видимым сразу
        if (slide.classList.contains('active')) {
            slide.style.opacity = '0';
        } else {
            // Неактивные слайды остаются невидимыми
            slide.style.opacity = '0';
            slide.style.animation = 'none';
        }
    });
    
    // Анимация для элементов внутри слайдов
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((item, index) => {
        item.classList.add('animated-item');
        item.style.setProperty('--index', 15 + index * 0.2);
    });
    
    const statRows = document.querySelectorAll('.stat-row');
    statRows.forEach((row, index) => {
        row.classList.add('animated-item');
        row.style.setProperty('--index', 15 + index * 0.3);
    });
} 