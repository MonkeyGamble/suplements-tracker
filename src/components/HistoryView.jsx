// Екран «Історія»: список днів із прийомами; тап відкриває день у вкладці «Сьогодні».
import { useStore } from '../store/StoreContext.jsx'
import { dateLabel } from '../lib/dates.js'
import { takenCount, pct, historyDays } from '../store/selectors.js'

export default function HistoryView({ onOpenDay }) {
  const { data } = useStore()
  const keys = historyDays(data)
  const total = data.supplements.length

  return (
    <>
      <h1 className="h1">Історія</h1>
      <div className="card">
        {keys.length === 0 ? (
          <div className="empty">
            Поки що порожньо.
            <br />
            Перший відмічений день з'явиться тут.
          </div>
        ) : (
          keys.map((ds) => {
            const p = Math.round(pct(data, ds) * 100)
            return (
              <div key={ds} className="hday" onClick={() => onOpenDay(ds)}>
                <span className="dt">{dateLabel(ds)}</span>
                <span
                  className="pc"
                  style={{ color: p >= 100 ? 'var(--accent)' : 'var(--muted)' }}
                >
                  {takenCount(data, ds)}/{total}
                </span>
              </div>
            )
          })
        )}
      </div>
    </>
  )
}
