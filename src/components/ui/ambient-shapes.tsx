import { cn } from '@/lib/utils'

type Variant = 'hero' | 'tinted-violet' | 'tinted-indigo' | 'tinted-mix' | 'light-accent'

interface AmbientShapesProps {
  variant?: Variant
  className?: string
}

/**
 * Formes décoratives en arrière-plan (orbes flous + blob organique + grid)
 * Différents variants pour varier le placement / les couleurs entre sections.
 */
export function AmbientShapes({ variant = 'tinted-mix', className }: AmbientShapesProps) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 -z-10 overflow-hidden', className)}
      aria-hidden
    >
      {/* Dot grid pattern masqué top/bottom */}
      <div
        className="absolute inset-0 opacity-50 dark:opacity-25"
        style={{
          backgroundImage:
            'radial-gradient(oklch(0.55 0.05 264 / 0.15) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          maskImage:
            'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      />

      {variant === 'hero' && <HeroShapes />}
      {variant === 'tinted-violet' && <TintedVioletShapes />}
      {variant === 'tinted-indigo' && <TintedIndigoShapes />}
      {variant === 'tinted-mix' && <TintedMixShapes />}
      {variant === 'light-accent' && <LightAccentShapes />}
    </div>
  )
}

function Orb({
  className,
  color = 'violet',
  opacity = 0.4,
}: {
  className?: string
  color?: 'violet' | 'indigo' | 'cyan' | 'rose'
  opacity?: number
}) {
  const colors = {
    violet: 'oklch(0.55 0.2 285 / 0.4)',
    indigo: 'oklch(0.55 0.2 260 / 0.35)',
    cyan: 'oklch(0.7 0.13 210 / 0.3)',
    rose: 'oklch(0.65 0.18 0 / 0.25)',
  }
  return (
    <div
      className={cn('absolute rounded-full blur-3xl dark:opacity-60', className)}
      style={{
        background: `radial-gradient(circle, ${colors[color]} 0%, transparent 70%)`,
        opacity,
      }}
    />
  )
}

/** Blob organique SVG (forme irrégulière, plus intéressante qu'un cercle) */
function Blob({
  className,
  color = 'violet',
  opacity = 0.3,
}: {
  className?: string
  color?: 'violet' | 'indigo' | 'cyan'
  opacity?: number
}) {
  const colors = {
    violet: 'oklch(0.55 0.2 285)',
    indigo: 'oklch(0.55 0.2 260)',
    cyan: 'oklch(0.7 0.13 210)',
  }
  return (
    <svg
      className={cn('absolute blur-3xl', className)}
      style={{ opacity, color: colors[color] }}
      viewBox="0 0 200 200"
      fill="currentColor"
    >
      <path d="M44.7,-58.9C58.6,-50.8,71.4,-39.4,78.3,-24.5C85.2,-9.6,86.2,8.7,80.2,24.1C74.2,39.5,61.2,52,46.5,62.4C31.8,72.8,15.9,81.2,-0.5,81.9C-16.9,82.5,-33.8,75.4,-47.8,64.8C-61.8,54.2,-72.9,40.1,-77.7,24C-82.5,7.9,-81,-10.2,-74.3,-25.4C-67.5,-40.6,-55.6,-52.9,-41.9,-61.5C-28.2,-70.2,-14.1,-75.1,0.4,-75.7C14.9,-76.3,30.7,-67,44.7,-58.9Z" transform="translate(100 100)" />
    </svg>
  )
}

function HeroShapes() {
  return (
    <>
      <Orb className="-top-32 left-1/2 h-[600px] w-[900px] -translate-x-1/2" color="violet" opacity={0.7} />
      <Orb className="-top-10 right-[8%] h-[420px] w-[420px]" color="indigo" opacity={0.55} />
      <Orb className="top-1/3 -left-20 h-[380px] w-[380px]" color="cyan" opacity={0.3} />
      <Blob className="bottom-0 right-1/4 h-[320px] w-[320px]" color="violet" opacity={0.18} />
    </>
  )
}

function TintedVioletShapes() {
  return (
    <>
      <Orb className="-top-32 -right-20 h-[500px] w-[500px]" color="violet" opacity={0.55} />
      <Orb className="top-1/2 -left-32 h-[450px] w-[450px]" color="indigo" opacity={0.4} />
      <Blob className="-bottom-20 right-1/3 h-[400px] w-[400px]" color="violet" opacity={0.2} />
      <Orb className="bottom-10 right-10 h-[280px] w-[280px]" color="cyan" opacity={0.25} />
    </>
  )
}

function TintedIndigoShapes() {
  return (
    <>
      <Orb className="-top-20 -left-20 h-[500px] w-[500px]" color="indigo" opacity={0.5} />
      <Orb className="-bottom-32 -right-20 h-[500px] w-[500px]" color="violet" opacity={0.5} />
      <Blob className="top-1/3 left-1/2 h-[350px] w-[350px] -translate-x-1/2" color="indigo" opacity={0.15} />
      <Orb className="top-1/4 right-1/4 h-[250px] w-[250px]" color="rose" opacity={0.2} />
    </>
  )
}

function TintedMixShapes() {
  return (
    <>
      <Orb className="-top-32 -right-32 h-[550px] w-[550px]" color="violet" opacity={0.55} />
      <Orb className="top-1/2 -left-32 h-[450px] w-[450px]" color="indigo" opacity={0.45} />
      <Blob className="bottom-10 right-10 h-[380px] w-[380px]" color="violet" opacity={0.18} />
      <Orb className="bottom-1/4 left-1/3 h-[320px] w-[320px]" color="cyan" opacity={0.25} />
    </>
  )
}

function LightAccentShapes() {
  return (
    <>
      <Orb className="-top-32 -right-32 h-[450px] w-[450px]" color="violet" opacity={0.3} />
      <Orb className="-bottom-32 -left-32 h-[450px] w-[450px]" color="indigo" opacity={0.25} />
      <Blob className="top-1/3 right-1/4 h-[280px] w-[280px]" color="cyan" opacity={0.12} />
    </>
  )
}
