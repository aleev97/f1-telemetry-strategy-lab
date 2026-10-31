import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

const STORAGE_KEY = 'f1lab-intro-seen'
const LIGHTS = 5
const FIRST_ON = 0.5 // s hasta que se enciende la primera luz
const STEP = 0.4 // s entre luz y luz
const LIGHTS_OUT = 2.9 // s en que se apagan todas
const TOTAL = 3.5 // s hasta cerrar la pantalla

function alreadySeen(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return true // si el almacenamiento está bloqueado, mejor no repetir la intro
  }
}

function Light({ index }: { index: number }) {
  const on = (FIRST_ON + index * STEP) / TOTAL
  const off = LIGHTS_OUT / TOTAL

  return (
    <span className="relative block size-12 rounded-full bg-[#1a0508] sm:size-16">
      <motion.span
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 35% 30%, #ff6b6b, #ff1e1e 55%, #b30000)',
          boxShadow: '0 0 40px 8px rgba(255,30,30,0.55)',
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1, 1, 0, 0] }}
        transition={{ duration: TOTAL, ease: 'linear', times: [0, on, on + 0.01, off, off + 0.01, 1] }}
      />
    </span>
  )
}

export function StartLights() {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = useState(() => !alreadySeen())

  const finish = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* almacenamiento bloqueado: no pasa nada */
    }
    setVisible(false)
  }, [])

  useEffect(() => {
    if (!visible) return

    const timer = setTimeout(finish, TOTAL * 1000)
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKeyDown)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [visible, finish])

  return (
    <AnimatePresence>
      {visible && !reduceMotion && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-10 bg-base"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
        >
          <div
            className="flex gap-3 rounded-2xl border border-white/10 bg-surface p-4 sm:gap-5 sm:p-6"
            aria-hidden="true"
          >
            {Array.from({ length: LIGHTS }, (_, i) => (
              <Light key={i} index={i} />
            ))}
          </div>

          <motion.p
            className="font-display text-4xl font-black uppercase italic tracking-wide sm:text-6xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 1, 1] }}
            transition={{
              duration: TOTAL,
              ease: 'linear',
              times: [0, LIGHTS_OUT / TOTAL, (LIGHTS_OUT + 0.15) / TOTAL, 1],
            }}
          >
            Lights out
          </motion.p>

          <button
            onClick={finish}
            className="absolute bottom-8 text-xs uppercase tracking-widest text-muted transition-colors hover:text-white"
          >
            Saltar intro
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}