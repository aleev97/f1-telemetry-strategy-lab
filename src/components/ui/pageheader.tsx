import { Badge } from './badge'

interface PageHeaderProps {
  eyebrow: string
  title: string
  description: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <Badge>{eyebrow}</Badge>
            <h1 className="mt-3 bg-linear-to-r from-white via-white to-team bg-clip-text font-display text-5xl font-black uppercase italic leading-[0.9] tracking-tight text-transparent sm:text-7xl">
               {title}
            </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p>
    </header>
  )
}