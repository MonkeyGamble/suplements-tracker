// Екран «Статистика» (7 днів): загальний %, днів без пропусків, бар-чарт, рейтинг пропусків.
import { useStore } from '../store/StoreContext.jsx'
import { WD } from '../lib/i18n.js'
import { stats7 } from '../store/selectors.js'

export default function StatsView() {
  const { data } = useStore()
  const { days, pcts, avg, perfect, perSupp } = stats7(data)

  return (
    <>
      <h1 className="h1">Останні 7 днів</h1>

      <div className="statgrid">
        <div className="stat">
          <div className="num">{avg}%</div>
          <div className="lab">загальний прийом</div>
        </div>
        <div className="stat">
          <div className="num">{perfect}/7</div>
          <div className="lab">днів без пропусків</div>
        </div>
      </div>

      <div className="card">
        <h2>По днях</h2>
        <div className="bars">
          {days.map((ds, i) => {
            const d = new Date(ds + 'T12:00:00')
            return (
              <div key={ds} className="barcol">
                <div
                  className="bar"
                  style={{ height: Math.round(pcts[i] * 100) + '%', opacity: pcts[i] ? 1 : 0.18 }}
                />
                <div className="d">{WD[d.getDay()]}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h2>Що пропускається найчастіше</h2>
        {data.supplements.length ? (
          perSupp.map((s) => (
            <div key={s.id} className="perSupp">
              <span>{s.name}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className="meter">
                  <i style={{ width: Math.round(s.p * 100) + '%' }} />
                </span>
                <span
                  style={{ color: 'var(--muted)', fontSize: '.75rem', width: 34, textAlign: 'right' }}
                >
                  {Math.round(s.p * 100)}%
                </span>
              </span>
            </div>
          ))
        ) : (
          <div className="empty">Додай добавки, щоб бачити статистику</div>
        )}
      </div>
    </>
  )
}
