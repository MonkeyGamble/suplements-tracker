// Двокрокове інлайн-підтвердження з автоскасуванням через 4 с.
// Гнучкий: render-props для тригера й стану підтвердження, щоб відтворити різні візуальні стилі прототипу.
import { useState, useRef, useEffect, useCallback } from 'react'

export default function ConfirmButton({ trigger, confirm, timeout = 4000 }) {
  const [armed, setArmed] = useState(false)
  const timer = useRef(null)

  const cancel = useCallback(() => {
    clearTimeout(timer.current)
    setArmed(false)
  }, [])

  const arm = useCallback(() => {
    setArmed(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setArmed(false), timeout)
  }, [timeout])

  // прибрати таймер при анмаунті
  useEffect(() => () => clearTimeout(timer.current), [])

  const fire = useCallback(() => {
    clearTimeout(timer.current)
    setArmed(false)
  }, [])

  if (armed) return confirm({ fire, cancel })
  return trigger({ arm })
}
