// Кореневий компонент: таб-бар + перемикання вкладок (стан, без react-router).
import { useState } from 'react'
import { todayStr, shiftDate } from './lib/dates.js'
import TodayView from './components/TodayView.jsx'
import HistoryView from './components/HistoryView.jsx'
import StatsView from './components/StatsView.jsx'
import StackView from './components/StackView.jsx'
import Toast from './components/Toast.jsx'

const TABS = [
  { id: 'today', ico: '✓', label: 'Сьогодні' },
  { id: 'history', ico: '📒', label: 'Історія' },
  { id: 'stats', ico: '📈', label: 'Статистика' },
  { id: 'stack', ico: '💊', label: 'Стек' },
]

export default function App() {
  const [tab, setTab] = useState('today')
  const [viewDate, setViewDate] = useState(todayStr())

  // навігація по днях — майбутні дні заблоковані
  const nav = (delta) => {
    const next = shiftDate(viewDate, delta)
    if (next > todayStr()) return
    setViewDate(next)
  }

  // відкрити конкретний день з історії
  const openDay = (ds) => {
    setViewDate(ds)
    setTab('today')
    window.scrollTo(0, 0)
  }

  const changeTab = (t) => {
    setTab(t)
    window.scrollTo(0, 0)
  }

  return (
    <>
      <div className="app">
        {tab === 'today' && <TodayView viewDate={viewDate} onNav={nav} />}
        {tab === 'history' && <HistoryView onOpenDay={openDay} />}
        {tab === 'stats' && <StatsView />}
        {tab === 'stack' && <StackView />}
      </div>

      <nav className="tabbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={tab === t.id ? 'on' : ''}
            onClick={() => changeTab(t.id)}
            aria-label={t.label}
            aria-current={tab === t.id ? 'page' : undefined}
          >
            <span className="ico" aria-hidden="true">
              {t.ico}
            </span>
            {t.label}
          </button>
        ))}
      </nav>

      <Toast />
    </>
  )
}
