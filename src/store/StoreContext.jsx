// Глобальний стор: useReducer + Context. Один Provider на застосунок.
import { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react'
import { reducer, initState } from './reducer.js'
import { loadData, createSaver } from '../lib/storage.js'

const StoreContext = createContext(null)

// Завантажуємо дані один раз (до першого рендеру), щоб уникнути миготіння.
const initial = loadData() // { data, memOnly }

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial, initState)

  // Saver із debounce ~400 мс, прив'язаний до memOnly.
  const saveRef = useRef(createSaver(state.memOnly))
  useEffect(() => {
    saveRef.current(state.data)
  }, [state.data])

  // Зручний помічник для показу тосту з компонентів.
  const showToast = useCallback((msg) => dispatch({ type: 'SHOW_TOAST', msg }), [])

  const value = {
    data: state.data,
    memOnly: state.memOnly,
    toast: state.toast,
    dispatch,
    showToast,
  }
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
