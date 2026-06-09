// Дати — локальні, формат YYYY-MM-DD. Порівнюються як ISO-рядки (str <= str).
import { WD, MONTHS } from './i18n.js'

// Сьогодні (або довільна дата) у локальному форматі YYYY-MM-DD.
export function todayStr(d = new Date()) {
  const z = (n) => String(n).padStart(2, '0')
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate())
}

// Зсув дати на n днів. Полудень — щоб уникнути стрибків через DST.
export function shiftDate(ds, n) {
  const d = new Date(ds + 'T12:00:00')
  d.setDate(d.getDate() + n)
  return todayStr(d)
}

// Підпис дати: «Пн, 9 червня».
export function dateLabel(ds) {
  const d = new Date(ds + 'T12:00:00')
  return WD[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()]
}
