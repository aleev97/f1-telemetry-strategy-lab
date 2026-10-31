import { isRouteErrorResponse, Link, useRouteError } from 'react-router'
import { PageHeader } from '@/components/ui/pageheader'

export default function RouteError() {
  const error = useRouteError()
  const isNotFound = isRouteErrorResponse(error) && error.status === 404
  const detail = error instanceof Error ? error.message : null

  return (
    <>
      <PageHeader
        eyebrow="Error"
        title={isNotFound ? 'Pista no encontrada' : 'Algo se salió de la pista'}
        description="No se pudo mostrar esta pantalla. Puedes reintentar o volver al inicio."
      />

      {import.meta.env.DEV && detail && (
        <pre className="mb-6 overflow-x-auto rounded-lg border border-white/10 bg-surface p-4 text-xs text-timing-yellow">
          {detail}
        </pre>
      )}

      <div className="flex flex-wrap items-center gap-6">
        <button
          onClick={() => window.location.reload()}
          className="rounded border border-white/10 px-4 py-2 text-xs uppercase tracking-widest transition-shadow hover:glow-team"
        >
          Reintentar
        </button>
        <Link to="/" className="text-xs uppercase tracking-widest text-team underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    </>
  )
}