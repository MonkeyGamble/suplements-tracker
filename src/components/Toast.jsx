// Toast: показує повідомлення зі стора на ~1.7 с. Жодних alert/confirm.
import { useEffect, useState } from 'react'
import { useStore } from '../store/StoreContext.jsx'

export default function Toast() {
  const { toast } = useStore()
  const [shown, setShown] = useState(false)

  useEffect(() => {
    if (!toast.msg) return
    setShown(true)
    const t = setTimeout(() => setShown(false), 1700)
    return () => clearTimeout(t)
    // спрацьовує на кожну зміну id (навіть якщо текст той самий)
  }, [toast.id, toast.msg])

  return (
    <div className={'toast' + (shown ? ' show' : '')} role="status" aria-live="polite">
      {toast.msg}
    </div>
  )
}
