import { useEffect, useState } from 'react'

/** Devuelve Date.now() y fuerza un re-render cada `intervalMs` */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id) // sin esto, cada montaje deja un temporizador huérfano
  }, [intervalMs])

  return now
}