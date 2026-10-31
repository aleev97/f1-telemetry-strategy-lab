import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { TEAMS, TEAM_IDS } from '@/lib/teams'
import { useTeamStore } from '@/store/useteamstore'

const listVariants = {
  hidden: { opacity: 0, y: -6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.15, staggerChildren: 0.03 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
}

export function TeamSelector() {
  const team = useTeamStore((s) => s.team)
  const setTeam = useTeamStore((s) => s.setTeam)
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  // Cerrar con clic afuera o con Escape
  useEffect(() => {
    if (!open) return

    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-xs uppercase tracking-widest transition-shadow hover:glow-team"
      >
                <span className="size-3 rounded-full bg-linear-to-br from-team to-team-2" />
        <span className="hidden sm:inline">{TEAMS[team].name}</span>
        <ChevronDown className={clsx('size-4 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            variants={listVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, y: -6, transition: { duration: 0.1 } }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-surface p-1 shadow-2xl"
          >
            {TEAM_IDS.map((id) => (
              <motion.li key={id} variants={itemVariants} role="presentation">
                <button
                  role="option"
                  aria-selected={id === team}
                  onClick={() => {
                    setTeam(id)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs uppercase tracking-widest text-muted transition-colors hover:bg-white/5 hover:text-white"
                >
                  <span
                    className="size-2.5 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${TEAMS[id].color}, ${TEAMS[id].secondary})`,
                    }}
                  />
                  <span className="flex-1">{TEAMS[id].name}</span>
                  {id === team && <Check className="size-4" />}
                </button>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  )
}