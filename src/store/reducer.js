// Єдиний reducer — уся бізнес-логіка (зокрема облік запасів) живе тут, а не в компонентах.
import { LOW_DAYS, dayWord } from '../lib/i18n.js'
import { daysLeft, unitOf, fmtAmt } from './selectors.js'

// Початковий стан стора.
export function initState({ data, memOnly }) {
  return { data, memOnly, toast: { id: 0, msg: '' } }
}

// Оновити поле однієї добавки за id (імутабельно).
function patchSupp(data, id, patch) {
  return {
    ...data,
    supplements: data.supplements.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  }
}

export function reducer(state, action) {
  const { data } = state
  // локальний помічник тостів — кожен виклик дає новий id, щоб тост перезапускався
  let toast = state.toast
  const say = (msg) => {
    toast = { id: toast.id + 1, msg }
  }
  const done = (newData) => ({ ...state, data: newData, toast })

  switch (action.type) {
    case 'TOGGLE_SUPP': {
      const { id, ds } = action
      const supp = data.supplements.find((x) => x.id === id)
      if (!supp) return state
      const willOn = !(data.days[ds] && data.days[ds][id])
      const days = { ...data.days, [ds]: { ...(data.days[ds] || {}), [id]: willOn } }
      let supplements = data.supplements
      if (supp.stock !== null && supp.stock !== undefined) {
        const newStock = Math.max(0, supp.stock + (willOn ? -supp.dose : supp.dose))
        supplements = data.supplements.map((x) => (x.id === id ? { ...x, stock: newStock } : x))
        const n = daysLeft({ ...supp, stock: newStock })
        if (willOn && n !== null && n > 0 && n <= LOW_DAYS) {
          say(`⚠ ${supp.name}: залишилось на ${n} ${dayWord(n)}`)
        }
        if (willOn && n !== null && n <= 0) {
          say(`🛒 ${supp.name} закінчився — час докупити`)
        }
      }
      const newData = { ...data, supplements, days }
      const dnow = newData.days[ds]
      if (newData.supplements.length && newData.supplements.every((x) => dnow[x.id])) {
        say('Усе прийнято! 💪')
      }
      return done(newData)
    }

    case 'MARK_ALL': {
      const { ds } = action
      const d = { ...(data.days[ds] || {}) }
      const supplements = data.supplements.map((s) => {
        if (!d[s.id]) {
          d[s.id] = true
          if (s.stock !== null && s.stock !== undefined) {
            return { ...s, stock: Math.max(0, s.stock - s.dose) }
          }
        }
        return s
      })
      const days = { ...data.days, [ds]: d }
      say('Усе прийнято! 💪')
      return done({ ...data, supplements, days })
    }

    case 'ADD_SUPP': {
      const { name, time, unit, dose, stock } = action.supp
      const supp = {
        id: 's' + Date.now(),
        name,
        time,
        unit,
        dose: Math.max(0.1, dose || 1),
        stock: stock === null || stock === undefined ? null : Math.max(0, stock),
      }
      say('Додано')
      return done({ ...data, supplements: [...data.supplements, supp] })
    }

    case 'DELETE_SUPP': {
      const supp = data.supplements.find((s) => s.id === action.id)
      if (!supp) return state
      say('«' + supp.name + '» видалено')
      return done({ ...data, supplements: data.supplements.filter((s) => s.id !== action.id) })
    }

    case 'RENAME_SUPP': {
      // без тосту — викликається під час введення
      return { ...state, data: patchSupp(data, action.id, { name: action.name }) }
    }

    case 'SET_TIME': {
      say('Час прийому оновлено')
      return done(patchSupp(data, action.id, { time: action.time }))
    }

    case 'SET_UNIT':
      return done(patchSupp(data, action.id, { unit: action.unit }))

    case 'SET_DOSE': {
      const dose = Math.max(0.1, parseFloat(action.dose) || 1)
      return done(patchSupp(data, action.id, { dose }))
    }

    case 'SET_STOCK': {
      const stock =
        action.stock === '' || action.stock === null
          ? null
          : Math.max(0, parseFloat(action.stock) || 0)
      return done(patchSupp(data, action.id, { stock }))
    }

    case 'RESTOCK': {
      const supp = data.supplements.find((s) => s.id === action.id)
      if (!supp) return state
      const amt = parseFloat(action.amount)
      if (isNaN(amt) || amt <= 0) {
        say('Введи число більше нуля')
        return { ...state, toast }
      }
      const newStock = (supp.stock || 0) + amt
      say('Запас оновлено: ' + fmtAmt(newStock) + ' ' + unitOf(supp).label)
      return done(patchSupp(data, action.id, { stock: newStock }))
    }

    case 'WIPE_HISTORY': {
      say('Історію очищено')
      return done({ ...data, days: {} })
    }

    case 'IMPORT_DATA': {
      say('Дані імпортовано')
      return done(action.data)
    }

    case 'SHOW_TOAST': {
      say(action.msg)
      return { ...state, toast }
    }

    default:
      return state
  }
}
