import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useMatches, useNavigation, useOutlet } from 'react-router'
import { teamStyle } from '@/lib/teams'
import { useTeamStore } from '@/store/useteamstore'
import { AmbientBackground } from './ambientbackground'
import { Footer } from './footer'
import { Navbar } from './navbar'
import { TeamTakeover } from './teamtakeover'

const APP_NAME = 'F1/Lab'

/** Título de la ruta activa: el del match más profundo que defina `handle.title` */
function useRouteTitle(): string {
  const matches = useMatches()
  for (let i = matches.length - 1; i >= 0; i--) {
    const handle = matches[i].handle
    if (typeof handle === 'object' && handle !== null && 'title' in handle && typeof handle.title === 'string') {
      return handle.title
    }
  }
  return ''
}

export function Layout() {
  const location = useLocation()
  const outlet = useOutlet()
  const navigation = useNavigation()
  const team = useTeamStore((s) => s.team)
  const title = useRouteTitle()

  // Sincroniza la pestaña del navegador con la ruta actual
  useEffect(() => {
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  }, [title])

  return (
    <div
      style={teamStyle(team)}
      className="theme-transition relative isolate flex min-h-screen flex-col motion-reduce:transition-none"
    >
      <a
        href="#contenido"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('contenido')?.focus()
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded focus:bg-base focus:px-4 focus:py-2 focus:text-sm focus:text-white focus:ring-2 focus:ring-team"
      >
        Saltar al contenido
      </a>

      {/* Anuncia el cambio de página a lectores de pantalla */}
      <p role="status" aria-live="polite" className="sr-only">
        {title}
      </p>

      {/* Barra de progreso mientras se descarga el código de una pantalla */}
      <AnimatePresence>
        {navigation.state !== 'idle' && (
          <motion.div
            aria-hidden="true"
            className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-linear-to-r from-team to-team-2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.85 }}
            exit={{ scaleX: 1, opacity: 0 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      <AmbientBackground />
      <TeamTakeover />
      <Navbar />

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          id="contenido"
          tabIndex={-1}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="mx-auto w-full max-w-7xl flex-1 px-6 py-10 focus:outline-none"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>

      <Footer />
    </div>
  )
}