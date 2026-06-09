// Екран «Сьогодні»: навігація по днях, кільце прогресу, серія, банер запасів, список за групами.
import { useStore } from '../store/StoreContext.jsx'
import { TIMES, LOW_DAYS, dayWord } from '../lib/i18n.js'
import { todayStr, dateLabel } from '../lib/dates.js'
import {
  takenCount,
  daysLeft,
  lowList,
  streak,
} from '../store/selectors.js'
import ProgressRing from './ProgressRing.jsx'

export default function TodayView({ viewDate, onNav }) {
  const { data, dispatch } = useStore()
  const isToday = viewDate === todayStr()
  const total = data.supplements.length
  const taken = takenCount(data, viewDate)
  const st = streak(data)
  const low = lowList(data)
  const day = data.days[viewDate] || {}

  const toggle = (id) => dispatch({ type: 'TOGGLE_SUPP', id, ds: viewDate })

  return (
    <>
      <div className="daynav">
        <button onClick={() => onNav(-1)} aria-label="Попередній день">
          ‹
        </button>
        <div className="label">
          <div className="display">{isToday ? 'Сьогодні' : dateLabel(viewDate)}</div>
          <div className="sub">{isToday ? dateLabel(viewDate) : 'натисни › щоб повернутись'}</div>
        </div>
        <button onClick={() => onNav(1)} disabled={isToday} aria-label="Наступний день">
          ›
        </button>
      </div>

      <div className="ringwrap">
        <ProgressRing taken={taken} total={total} />
        <div className="streak">
          {st > 0 ? (
            <>
              🔥 Серія: <b>{st} {dayWord(st)}</b> без пропусків
            </>
          ) : (
            'Прийми все сьогодні, щоб почати серію 🔥'
          )}
        </div>
      </div>

      {low.length > 0 && (
        <div className="lowbanner">
          🛒 <b>Час докупити:</b>{' '}
          {low
            .map((x) => x.s.name + (x.n <= 0 ? ' (закінчився)' : ` (~${x.n} ${dayWord(x.n)})`))
            .join(', ')}
        </div>
      )}

      <div className="card">
        <div className="cardhead">
          <h2>Мій стек</h2>
          <span className={'badge' + (taken === total && total > 0 ? ' done' : '')}>
            {taken === total && total > 0 ? 'усе прийнято ✓' : taken + '/' + total}
          </span>
        </div>

        {total > 0 ? (
          TIMES.map((t) => {
            const items = data.supplements.filter((s) => s.time === t.id)
            if (!items.length) return null
            return (
              <div key={t.id}>
                <div className="group">{t.label}</div>
                {items.map((s) => {
                  const n = daysLeft(s)
                  const hint =
                    n === null
                      ? ''
                      : n <= 0
                      ? 'закінчився!'
                      : n <= LOW_DAYS
                      ? `залишилось на ${n} ${dayWord(n)}`
                      : ''
                  const on = !!day[s.id]
                  return (
                    <div
                      key={s.id}
                      className={'supp' + (on ? ' on' : '')}
                      onClick={() => toggle(s.id)}
                      role="checkbox"
                      aria-checked={on}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          toggle(s.id)
                        }
                      }}
                    >
                      <div className="box">{on ? '✓' : ''}</div>
                      <div>
                        <div className="name">{s.name}</div>
                        {hint && <div className="stockhint low">⚠ {hint}</div>}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })
        ) : (
          <div className="empty">Список порожній — додай добавки у вкладці «Стек»</div>
        )}

        {total > 0 && taken < total && (
          <button className="allbtn" onClick={() => dispatch({ type: 'MARK_ALL', ds: viewDate })}>
            Відмітити все одразу
          </button>
        )}
      </div>
    </>
  )
}
