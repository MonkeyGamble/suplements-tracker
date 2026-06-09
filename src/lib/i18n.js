// Уся мова інтерфейсу — українська. Константи й плюралізація.

// Поріг «закінчується»: запасу залишилось <= LOW_DAYS днів.
export const LOW_DAYS = 7

// Дні тижня (нд першим — як у Date.getDay()).
export const WD = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

// Назви місяців у родовому відмінку (для «9 червня»).
export const MONTHS = [
  'січня', 'лютого', 'березня', 'квітня', 'травня', 'червня',
  'липня', 'серпня', 'вересня', 'жовтня', 'листопада', 'грудня',
]

// Часи прийому — саме в цьому порядку групи виводяться на екрані «Сьогодні».
export const TIMES = [
  { id: 'fasted', label: 'Натще' },
  { id: 'beforemeal', label: 'Перед їжею' },
  { id: 'morning', label: 'Вранці, з їжею' },
  { id: 'noon', label: 'Пообіді, з їжею' },
  { id: 'evemeal', label: 'Ввечері, з їжею' },
  { id: 'bedtime', label: 'Перед сном' },
]

// Одиниці виміру + дефолтні розміри упаковки.
export const UNITS = [
  { id: 'pcs', label: 'шт', defaultPack: 60 },
  { id: 'g', label: 'г', defaultPack: 300 },
  { id: 'scoop', label: 'лож.', defaultPack: 30 },
  { id: 'ml', label: 'мл', defaultPack: 100 },
]

// Українська плюралізація: 1 день / 2-4 дні / 5+ днів.
export function dayWord(n) {
  n = Math.abs(n)
  const m10 = n % 10
  const m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'день'
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'дні'
  return 'днів'
}
