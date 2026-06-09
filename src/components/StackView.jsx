// Екран «Стек»: рядки стеку (з інлайн-перейменуванням), форма додавання, блок «Дані» (експорт/імпорт, очищення).
import { useState, useRef, useEffect } from 'react'
import { useStore } from '../store/StoreContext.jsx'
import { TIMES, UNITS, dayWord } from '../lib/i18n.js'
import { daysLeft, unitOf, fmtAmt, stockClass, takenCount } from '../store/selectors.js'
import { exportData, parseImport } from '../lib/storage.js'
import ConfirmButton from './ConfirmButton.jsx'

// Числове поле з локальним станом: комітить на blur, щоб не збивати фокус і дозволяти ввід «0.5».
function NumberField({ value, onCommit, ...rest }) {
  const [local, setLocal] = useState(value)
  const focused = useRef(false)
  useEffect(() => {
    if (!focused.current) setLocal(value)
  }, [value])
  return (
    <input
      type="number"
      value={local}
      onFocus={() => {
        focused.current = true
      }}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={(e) => {
        focused.current = false
        onCommit(e.target.value)
      }}
      {...rest}
    />
  )
}

function StackRow({ s, dispatch }) {
  const n = daysLeft(s)
  const u = unitOf(s)
  const [restockOpen, setRestockOpen] = useState(false)
  const [restockAmt, setRestockAmt] = useState(String(u.defaultPack))

  const openRestock = () => {
    setRestockAmt(String(u.defaultPack))
    setRestockOpen(true)
  }

  return (
    <div className="stackrow">
      <div className="top">
        {/* інлайн-перейменування — нове, чого не було в прототипі */}
        <input
          className="nm-input"
          type="text"
          value={s.name}
          aria-label={`Назва: ${s.name}`}
          onChange={(e) => dispatch({ type: 'RENAME_SUPP', id: s.id, name: e.target.value })}
        />
        <select
          value={s.time}
          onChange={(e) => dispatch({ type: 'SET_TIME', id: s.id, time: e.target.value })}
          aria-label={`Час прийому ${s.name}`}
          style={{ width: 'auto', padding: '6px 8px', fontSize: '.74rem', color: 'var(--muted)' }}
        >
          {TIMES.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
        <ConfirmButton
          trigger={({ arm }) => (
            <button className="del" onClick={arm} aria-label={`Видалити ${s.name}`}>
              ✕
            </button>
          )}
          confirm={({ fire, cancel }) => (
            <>
              <button
                className="confirmdel"
                onClick={() => {
                  fire()
                  dispatch({ type: 'DELETE_SUPP', id: s.id })
                }}
              >
                Видалити?
              </button>
              <button className="del" onClick={cancel} aria-label="Скасувати">
                ↩
              </button>
            </>
          )}
        />
      </div>

      <div className="stockline">
        <span>Залишок:</span>
        <NumberField
          min="0"
          step="any"
          value={s.stock === null ? '' : String(fmtAmt(s.stock))}
          placeholder="—"
          onCommit={(v) => dispatch({ type: 'SET_STOCK', id: s.id, stock: v })}
          aria-label={`Залишок ${s.name}`}
        />
        <select
          value={s.unit}
          onChange={(e) => dispatch({ type: 'SET_UNIT', id: s.id, unit: e.target.value })}
          aria-label="Одиниця"
          style={{ width: 'auto', padding: '6px 8px', fontSize: '.78rem' }}
        >
          {UNITS.map((un) => (
            <option key={un.id} value={un.id}>
              {un.label}
            </option>
          ))}
        </select>
        <span>·</span>
        <NumberField
          min="0.1"
          step="any"
          value={String(fmtAmt(s.dose))}
          onCommit={(v) => dispatch({ type: 'SET_DOSE', id: s.id, dose: v })}
          aria-label="Доза на день"
          style={{ width: 52 }}
        />
        <span>{u.label}/день</span>
        {n !== null ? (
          <span className={'daysleft ' + stockClass(n)}>
            {n <= 0 ? '· закінчився' : '· ~' + n + ' ' + dayWord(n)}
          </span>
        ) : (
          <span style={{ opacity: 0.6 }}>· не відстежується</span>
        )}
        {s.stock !== null && !restockOpen && (
          <button className="restock" onClick={openRestock}>
            + Купив нову упаковку
          </button>
        )}
      </div>

      {restockOpen && (
        <div className="stockline" style={{ marginTop: 6 }}>
          <span>В упаковці:</span>
          <input
            type="number"
            min="0.1"
            step="any"
            value={restockAmt}
            onChange={(e) => setRestockAmt(e.target.value)}
            aria-label="Кількість у новій упаковці"
          />
          <span>{u.label}</span>
          <button
            className="restock"
            style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
            onClick={() => {
              dispatch({ type: 'RESTOCK', id: s.id, amount: restockAmt })
              setRestockOpen(false)
            }}
          >
            Додати до запасу
          </button>
          <button className="restock" onClick={() => setRestockOpen(false)}>
            Скасувати
          </button>
        </div>
      )}
    </div>
  )
}

function AddForm({ dispatch, showToast }) {
  const [name, setName] = useState('')
  const [time, setTime] = useState(TIMES[0].id)
  const [dose, setDose] = useState('1')
  const [unit, setUnit] = useState(UNITS[0].id)
  const [stock, setStock] = useState('')

  const add = () => {
    const nm = name.trim()
    if (!nm) {
      showToast('Введи назву')
      return
    }
    dispatch({
      type: 'ADD_SUPP',
      supp: {
        name: nm,
        time,
        unit,
        dose: Math.max(0.1, parseFloat(dose) || 1),
        stock: stock === '' ? null : Math.max(0, parseFloat(stock) || 0),
      },
    })
    setName('')
    setDose('1')
    setStock('')
    setTime(TIMES[0].id)
    setUnit(UNITS[0].id)
  }

  return (
    <div className="card">
      <h2>Додати добавку</h2>
      <div className="field" style={{ marginBottom: 10 }}>
        <label>Назва</label>
        <input
          type="text"
          placeholder="напр. Омега-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="row3" style={{ marginBottom: 10 }}>
        <div className="field">
          <label>Коли приймати</label>
          <select value={time} onChange={(e) => setTime(e.target.value)}>
            {TIMES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field" style={{ maxWidth: 80 }}>
          <label>Доза/день</label>
          <input
            type="number"
            min="0.1"
            step="any"
            value={dose}
            onChange={(e) => setDose(e.target.value)}
          />
        </div>
        <div className="field" style={{ maxWidth: 80 }}>
          <label>Одиниця</label>
          <select value={unit} onChange={(e) => setUnit(e.target.value)}>
            {UNITS.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="field">
        <label>Запас (необов'язково)</label>
        <input
          type="number"
          min="0"
          step="any"
          placeholder="напр. 60"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
      </div>
      <button className="btn" onClick={add}>
        Додати
      </button>
    </div>
  )
}

function DataBlock({ data, memOnly, dispatch, showToast }) {
  const fileRef = useRef(null)
  const [pendingImport, setPendingImport] = useState(null)
  const recordedDays = Object.keys(data.days).filter((ds) => takenCount(data, ds) > 0).length

  const onFile = (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = '' // дозволити повторний вибір того ж файлу
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = parseImport(String(reader.result))
        setPendingImport(parsed)
      } catch (err) {
        showToast('Помилка імпорту: ' + err.message)
      }
    }
    reader.onerror = () => showToast('Не вдалося прочитати файл')
    reader.readAsText(file)
  }

  return (
    <div className="card">
      <h2>Дані</h2>
      <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 10 }}>
        {memOnly
          ? '⚠️ Сховище недоступне — дані живуть лише до перезавантаження.'
          : 'Дані зберігаються автоматично. Коли відмічаєш прийом — запас зменшується сам.'}{' '}
        Записаних днів: {recordedDays}.
      </div>

      {/* Експорт / Імпорт — бекап на випадок, якщо localStorage злетить */}
      <div className="row2">
        <button className="btn" style={{ marginTop: 0 }} onClick={() => exportData(data)}>
          Експорт у файл
        </button>
        <button className="btn" style={{ marginTop: 0 }} onClick={() => fileRef.current?.click()}>
          Імпорт із файлу
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        style={{ display: 'none' }}
        onChange={onFile}
      />

      {pendingImport && (
        <div className="lowbanner" style={{ marginTop: 12, marginBottom: 0 }}>
          Замінити всі поточні дані вмістом файлу? Це не можна скасувати.
          <div className="row2" style={{ marginTop: 10 }}>
            <button
              className="btn"
              style={{ marginTop: 0, borderColor: 'var(--accent)', color: 'var(--accent)' }}
              onClick={() => {
                dispatch({ type: 'IMPORT_DATA', data: pendingImport })
                setPendingImport(null)
              }}
            >
              Так, замінити
            </button>
            <button className="btn" style={{ marginTop: 0 }} onClick={() => setPendingImport(null)}>
              Скасувати
            </button>
          </div>
        </div>
      )}

      {/* Очищення історії — через двокрокове підтвердження */}
      <div style={{ marginTop: 12 }}>
        <ConfirmButton
          trigger={({ arm }) => (
            <button className="btn" style={{ marginTop: 0 }} onClick={arm}>
              Очистити історію
            </button>
          )}
          confirm={({ fire, cancel }) => (
            <div className="row2">
              <button
                className="btn"
                style={{ marginTop: 0, borderColor: 'var(--err)', color: 'var(--err)' }}
                onClick={() => {
                  fire()
                  dispatch({ type: 'WIPE_HISTORY' })
                }}
              >
                Так, очистити все
              </button>
              <button className="btn" style={{ marginTop: 0 }} onClick={cancel}>
                Скасувати
              </button>
            </div>
          )}
        />
      </div>
    </div>
  )
}

export default function StackView() {
  const { data, memOnly, dispatch, showToast } = useStore()

  return (
    <>
      <h1 className="h1">Мій стек</h1>
      <div className="card">
        {data.supplements.length === 0 ? (
          <div className="empty">Список порожній</div>
        ) : (
          data.supplements.map((s) => <StackRow key={s.id} s={s} dispatch={dispatch} />)
        )}
      </div>

      <AddForm dispatch={dispatch} showToast={showToast} />
      <DataBlock data={data} memOnly={memOnly} dispatch={dispatch} showToast={showToast} />
    </>
  )
}
