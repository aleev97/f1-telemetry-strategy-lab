import { motion, useReducedMotion } from 'framer-motion'
import { TEAMS, teamStyle } from '@/lib/teams'
import { useTeamStore } from '@/store/useteamstore'

export function TeamTakeover() {
  const team = useTeamStore((s) => s.team)
  const changes = useTeamStore((s) => s.changes)
  const reduceMotion = useReducedMotion()

  // No se reproduce al cargar la página ni con "reducir movimiento"
  if (changes === 0 || reduceMotion) return null

  return (
    // La key cambia con cada cambio de equipo → se remonta y la animación vuelve a empezar
    <div
      key={changes}
      aria-hidden="true"
      style={teamStyle(team)} // el overlay nace con los colores NUEVOS, sin esperar la transición
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <motion.div
        className="absolute inset-y-0 -left-1/2 flex w-[200%] items-center justify-center"
        style={{
          background: 'linear-gradient(100deg, var(--team) 40%, var(--team-2))',
          skewX: -20,
        }}
        initial={{ x: '-110%' }}
        animate={{ x: ['-110%', '0%', '0%', '110%'] }}
        transition={{ duration: 1.1, times: [0, 0.4, 0.6, 1], ease: [0.76, 0, 0.24, 1] }}
      >
        <motion.span
          className="font-display text-[16vw] font-black uppercase italic leading-none"
          style={{ skewX: 20, color: '#0B0E14' }}
        >
          {TEAMS[team].name}
        </motion.span>
      </motion.div>
    </div>
  )
}