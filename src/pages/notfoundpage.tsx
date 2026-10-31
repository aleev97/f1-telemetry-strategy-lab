import { Link } from 'react-router'
import { PageHeader } from '@/components/ui/pageheader'

export default function NotFoundPage() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="Pista no encontrada"
        description="La ruta que buscas no existe o salió de boxes."
      />
      <Link to="/" className="text-sm text-team underline underline-offset-4">
        Volver al inicio
      </Link>
    </>
  )
}