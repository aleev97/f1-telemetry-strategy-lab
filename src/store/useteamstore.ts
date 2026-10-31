import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { TEAMS, type TeamId } from '@/lib/teams'

interface TeamState {
  team: TeamId
  /** Veces que se eligió una escudería distinta en esta sesión. No se persiste: dispara el Team Takeover */
  changes: number
  setTeam: (team: TeamId) => void
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      team: 'ferrari',
      changes: 0,
      // Elegir la misma escudería no cambia nada (ni dispara la animación)
      setTeam: (team) => set((s) => (s.team === team ? s : { team, changes: s.changes + 1 })),
    }),
    {
      name: 'f1lab-team',
      partialize: (s) => ({ team: s.team }), // solo la escudería va a localStorage
      merge: (persisted, current) => {
        const saved = (persisted as Partial<TeamState> | undefined)?.team
        return { ...current, team: saved && saved in TEAMS ? saved : current.team }
      },
    },
  ),
)