// Зберігання у localStorage + міграції + експорт/імпорт JSON.
import { TIMES } from './i18n.js'

export const KEY = 'supptracker-v1'
export const VERSION = 1

// Дефолтний стек для першого запуску (із прототипу).
export const DEFAULT_SUPPS = [
  { id: 'cit', name: 'L-цитрулін', time: 'fasted', unit: 'g', dose: 3, stock: null },
  { id: 'zn', name: 'Цинк', time: 'morning', unit: 'pcs', dose: 1, stock: null },
  { id: 'k2', name: 'Вітамін K2 (MK-7)', time: 'morning', unit: 'pcs', dose: 1, stock: null },
  { id: 'c', name: 'Вітамін C', time: 'morning', unit: 'pcs', dose: 1, stock: null },
  { id: 'cre', name: 'Креатин', time: 'morning', unit: 'g', dose: 5, stock: null },
  { id: 'mg', name: 'Магній бісгліцинат', time: 'bedtime', unit: 'pcs', dose: 1, stock: null },
  { id: 'gly', name: 'Гліцин', time: 'bedtime', unit: 'pcs', dose: 1, stock: null },
]

function defaultData() {
  return { version: VERSION, supplements: DEFAULT_SUPPS.map((s) => ({ ...s })), days: {} }
}

// Міграції при завантаженні: відсутні поля → дефолти; старі значення time → нові.
export function migrate(data) {
  if (!data || typeof data !== 'object') return defaultData()
  if (!Array.isArray(data.supplements)) data.supplements = DEFAULT_SUPPS.map((s) => ({ ...s }))
  if (!data.days || typeof data.days !== 'object') data.days = {}
  data.version = VERSION
  data.supplements.forEach((s) => {
    if (s.dose === undefined) s.dose = 1
    if (s.stock === undefined) s.stock = null
    if (s.unit === undefined) s.unit = 'pcs'
    // міграція старих часів прийому
    if (s.time === 'meal') s.time = 'morning'
    if (s.time === 'evening') s.time = 'bedtime'
    if (s.time === 'any') s.time = 'morning'
    if (!TIMES.some((t) => t.id === s.time)) s.time = 'morning'
  })
  return data
}

// Завантаження зі сховища. Повертає { data, memOnly }.
// memOnly=true означає, що localStorage недоступний — дані живуть лише до перезавантаження.
export function loadData() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw == null) {
      const data = defaultData()
      // спроба одразу зберегти дефолт; якщо сховище зламане — memOnly
      try {
        localStorage.setItem(KEY, JSON.stringify(data))
      } catch (e) {
        return { data, memOnly: true }
      }
      return { data, memOnly: false }
    }
    return { data: migrate(JSON.parse(raw)), memOnly: false }
  } catch (e) {
    // сховище недоступне або зіпсований JSON
    return { data: defaultData(), memOnly: true }
  }
}

// Збереження з debounce ~400 мс. Створює функцію, прив'язану до конкретного memOnly-прапора.
export function createSaver(memOnly) {
  let timer = null
  return function save(data) {
    if (memOnly) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      try {
        localStorage.setItem(KEY, JSON.stringify(data))
      } catch (e) {
        console.error('save failed', e)
      }
    }, 400)
  }
}

// Експорт у JSON-файл (через тимчасове посилання).
export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `miy-stek-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

// Парсинг та валідація імпортованого JSON. Кидає Error при некоректній структурі.
export function parseImport(text) {
  let obj
  try {
    obj = JSON.parse(text)
  } catch (e) {
    throw new Error('Файл не є коректним JSON')
  }
  if (!obj || typeof obj !== 'object') throw new Error('Неправильна структура файлу')
  if (!Array.isArray(obj.supplements)) throw new Error('У файлі немає списку добавок')
  if (obj.days && typeof obj.days !== 'object') throw new Error('Неправильний формат історії')
  // базова перевірка елементів стеку
  for (const s of obj.supplements) {
    if (!s || typeof s !== 'object' || typeof s.name !== 'string') {
      throw new Error('Пошкоджений запис добавки у файлі')
    }
  }
  return migrate(obj)
}
