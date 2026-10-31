import { Link, NavLink, useMatch } from 'react-router'
import { motion } from 'framer-motion'
import { Activity, Flag, Timer } from 'lucide-react'
import clsx from 'clsx'
import { TeamSelector } from './teamselector'

const LINKS = [
  { to: '/', label: 'Season', icon: Flag, end: true },
  { to: '/telemetry', label: 'Telemetry', icon: Activity, end: false },
  { to: '/strategy-lab', label: 'Strategy Lab', icon: Timer, end: false },
]

export function Navbar() {
  // Las páginas de detalle de carrera cuentan como parte de "Season"
  const onRacePage = useMatch('/race/:round') !== null

  return (
    <nav
      aria-label="Principal"
      className="sticky top-0 z-50 border-b border-white/10 bg-base/80 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link
          to="/"
          aria-label="F1/Lab, ir al inicio"
          className="font-display text-2xl font-black uppercase italic tracking-tight"
        >
          F1<span className="text-team">/</span>Lab
        </Link>

        <ul className="flex items-center gap-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) => {
                  const active = isActive || (to === '/' && onRacePage)
                  return clsx(
                    'relative flex items-center gap-2 px-3 py-2 text-xs uppercase tracking-widest transition-colors',
                    active ? 'text-white' : 'text-muted hover:text-white',
                  )
                }}
              >
                {({ isActive }) => {
                  const active = isActive || (to === '/' && onRacePage)
                  return (
                    <>
                      <Icon className="size-4" />
                      <span className="hidden sm:inline">{label}</span>
                      {active && (
                        <motion.span
                          layoutId="nav-underline"
                          className="absolute inset-x-2 -bottom-3 h-0.5 bg-team"
                        />
                      )}
                    </>
                  )
                }}
              </NavLink>
            </li>
          ))}
        </ul>

        <TeamSelector />
      </div>
    </nav>
  )
}