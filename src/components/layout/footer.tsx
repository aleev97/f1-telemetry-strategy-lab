const LINK = 'underline underline-offset-2 transition-colors hover:text-white'

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-2 text-[11px] leading-relaxed text-muted">
        <p>
          Proyecto personal, sin fines de lucro y no oficial. No está afiliado, asociado ni respaldado
          por Formula 1, la FIA ni ninguna escudería o piloto. F1, FORMULA 1 y los nombres relacionados
          son marcas de sus respectivos titulares y aquí se usan solo para identificar equipos y pilotos.
        </p>
        <p>
          Datos de{' '}
          <a href="https://openf1.org" target="_blank" rel="noreferrer" className={LINK}>
            OpenF1
          </a>{' '}
          y{' '}
          <a
            href="https://github.com/jolpica/jolpica-f1"
            target="_blank"
            rel="noreferrer"
            className={LINK}
          >
            Jolpica F1
          </a>
          . Los trazados de los circuitos se generan a partir de datos de posición de OpenF1. Este sitio
          no usa imágenes ni logos de terceros.
        </p>
      </div>
    </footer>
  )
}