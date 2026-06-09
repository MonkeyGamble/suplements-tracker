// Чисті функції-селектори над станом DATA ({ supplements, days }).
import { LOW_DAYS, UNITS } from '../lib/i18n.js'
import { todayStr, shiftDate } from '../lib/dates.js'

// Одиниця виміру добавки.
export function unitOf(s) {
  return UNITS.find((u) => u.id === s.unit) || UNITS[0]
}

// Округлення кількості до 0.1.
export function fmtAmt(v) {
  return Math.round(v * 10) / 10
}

// Скільки добавок відмічено в конкретний день.
export function takenCount(data, ds) {
  const d = data.days[ds]
  if (!d) return 0
  return data.supplements.filter((s) => d[s.id]).length
}

// Частка прийнятого за день (0..1).
export function pct(data, ds) {
  const t = data.supplements.length
  return t ? takenCount(data, ds) / t : 0
}

// На скільки днів вистачить запасу. null = не відстежується.
export function daysLeft(s) {
  if (s.stock === null || s.stock === undefined) return null
  if (s.dose <= 0) return null
  return Math.floor(s.stock / s.dose)
}

// Клас для індикатора «днів лишилось».
export function stockClass(n) {
  if (n === null) return ''
  if (n <= 0) return 'out'
  if (n <= LOW_DAYS) return 'low'
  return 'ok'
}

// Список добавок, що закінчуються (≤ LOW_DAYS), відсортований за днями.
export function lowList(data) {
  return data.supplements
    .map((s) => ({ s, n: daysLeft(s) }))
    .filter((x) => x.n !== null && x.n <= LOW_DAYS)
    .sort((a, b) => a.n - b.n)
}

// Серія днів поспіль зі 100% прийомом.
// Сьогодні рахується лише якщо вже все прийнято, інакше відлік від учора.
export function streak(data) {
  if (data.supplements.length === 0) return 0
  let n = 0
  let ds = todayStr()
  if (pct(data, ds) < 1) ds = shiftDate(ds, -1)
  while (pct(data, ds) >= 1 && data.supplements.length > 0) {
    n++
    ds = shiftDate(ds, -1)
  }
  return n
}

// Статистика за останні 7 днів.
export function stats7(data) {
  const days = [...Array(7)].map((_, i) => shiftDate(todayStr(), i - 6))
  const pcts = days.map((ds) => pct(data, ds))
  const avg = Math.round((pcts.reduce((a, b) => a + b, 0) / 7) * 100)
  const perfect = pcts.filter((p) => p >= 1).length
  // рейтинг «що пропускається найчастіше» — від найменшого % прийому
  const perSupp = data.supplements
    .map((s) => {
      const taken = days.filter((ds) => data.days[ds] && data.days[ds][s.id]).length
      return { id: s.id, name: s.name, p: taken / 7 }
    })
    .sort((a, b) => a.p - b.p)
  return { days, pcts, avg, perfect, perSupp }
}

// Дні з історії (де щось відмічено), новіші зверху.
export function historyDays(data) {
  return Object.keys(data.days)
    .sort()
    .reverse()
    .filter((ds) => takenCount(data, ds) > 0)
}
