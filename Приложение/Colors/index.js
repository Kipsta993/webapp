/**
 * Индексный файл для экспорта цветов
 * Позволяет импортировать цвета в приложении через import { colors } from 'path/to/Colors'
 */

const colors = require('./colors');

module.exports = {
  ...colors
}; 