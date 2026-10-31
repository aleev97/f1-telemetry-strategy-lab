import { AlertTriangle, RotateCw } from 'lucide-react'
import { ApiError } from '@/lib/api/https'
import { Card } from './card'

interface ErrorStateProps {
  error: Error
  onRetry: () => void
}

const TITLES = {
  network: 'Sin conexión con el servidor',
  http: 'La API respondió con un error',
  shape: 'Los datos llegaron en un formato inesperado',
} as const

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const title = error instanceof ApiError ? TITLES[error.kind] : 'Algo salió mal'

  return (
    <Card role="alert" className="flex max-w-xl items-start gap-4">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-team" />
      <div className="flex-1">
        <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
        <p className="mt-1 text-sm text-muted">{error.message}</p>
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded border border-white/10 px-3 py-1.5 text-xs uppercase tracking-widest transition-shadow hover:glow-team"
        >
          <RotateCw className="size-3.5" />
          Reintentar
        </button>
      </div>
    </Card>
  )
}