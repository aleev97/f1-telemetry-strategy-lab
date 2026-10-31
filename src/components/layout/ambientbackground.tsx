export function AmbientBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -left-1/4 -top-1/3 size-[70vmax] rounded-full opacity-30"
        style={{ background: 'radial-gradient(closest-side, var(--team), transparent)' }}
      />
      <div
        className="absolute -bottom-1/3 -right-1/4 size-[60vmax] rounded-full opacity-20"
        style={{ background: 'radial-gradient(closest-side, var(--team-2), transparent)' }}
      />

      <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      {/* Cada 120 px se repite el patrón y se desplaza 120 px: el bucle es perfecto */}
      <div
        className="animate-speed-lines absolute inset-y-0 -inset-x-40 opacity-[0.07] motion-reduce:animate-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 118px, var(--team) 118px 120px)',
          transform: 'skewX(-20deg)',
        }}
      />
    </div>
  )
}