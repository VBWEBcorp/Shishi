import { ArrowUpRight } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'

type Tone = 'dark' | 'accent' | 'light' | 'glass' | 'glassDark'

const TONES: Record<'dark' | 'accent' | 'light', { bg: string; fg: string }> = {
  dark: { bg: 'bg-foreground', fg: 'text-background' },
  accent: { bg: 'bg-accent', fg: 'text-accent-foreground' },
  light: { bg: 'bg-white', fg: 'text-foreground' },
}

/** Tons « verre dépoli » translucides (flou d'arrière-plan). */
const GLASS: Record<'glass' | 'glassDark', string> = {
  glass: 'bg-white/15 text-white ring-1 ring-white/30 hover:bg-white/25',
  glassDark: 'bg-foreground/[0.07] text-foreground ring-1 ring-foreground/15 hover:bg-foreground/[0.12]',
}

const SIZES = {
  default: { h: 'h-14', circle: 'size-14', px: 'px-7', text: 'text-base', icon: 'size-5' },
  sm: { h: 'h-12', circle: 'size-12', px: 'px-6', text: 'text-sm', icon: 'size-4' },
} as const

/**
 * CTA avec animation au survol (flèche ↗ → →).
 *  · tons pleins (dark/accent/light) : pilule + cercle fusionnés (filtre gooey)
 *    qui se détachent au survol.
 *  · tons verre (glass/glassDark) : pilule unique translucide à flou d'arrière-plan
 *    (le goo exige un fond opaque, incompatible avec le translucide).
 */
export function CtaButton({
  href,
  children,
  tone = 'dark',
  size = 'default',
  className,
}: {
  href: string
  children: React.ReactNode
  tone?: Tone
  size?: keyof typeof SIZES
  className?: string
}) {
  const s = SIZES[size]

  // Variante verre dépoli : pilule unique translucide, flèche intégrée.
  if (tone === 'glass' || tone === 'glassDark') {
    return (
      <Link
        href={href}
        className={cn(
          'group inline-flex w-fit items-center gap-2.5 rounded-full font-semibold backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5',
          s.h,
          s.px,
          s.text,
          GLASS[tone],
          className
        )}
      >
        <span>{children}</span>
        <ArrowUpRight
          className={cn('transition-transform duration-300 ease-out group-hover:rotate-45', s.icon)}
          aria-hidden
        />
      </Link>
    )
  }

  const { bg, fg } = TONES[tone]

  return (
    <Link
      href={href}
      className={cn('group relative inline-flex w-fit items-center', s.h, className)}
    >
      {/* Fond coloré fusionné (filtre gooey) */}
      <span aria-hidden className="absolute inset-0 flex items-center [filter:url(#cta-goo)]">
        <span className={cn('flex h-full items-center rounded-full', s.px, bg)}>
          <span className={cn('invisible font-semibold', s.text)}>{children}</span>
        </span>
        <span
          className={cn(
            'ml-1.5 rounded-full transition-[margin] duration-300 ease-out group-hover:ml-3',
            s.circle,
            bg
          )}
        />
      </span>

      {/* Texte + flèche, nets par-dessus */}
      <span className={cn('relative flex h-full items-center', fg)}>
        <span className={cn('flex h-full items-center rounded-full font-semibold', s.px, s.text)}>
          {children}
        </span>
        <span
          className={cn(
            'ml-1.5 flex items-center justify-center transition-[margin] duration-300 ease-out group-hover:ml-3',
            s.circle
          )}
        >
          <ArrowUpRight
            className={cn('transition-transform duration-300 ease-out group-hover:rotate-45', s.icon)}
            aria-hidden
          />
        </span>
      </span>

      <GooFilter />
    </Link>
  )
}

/** Filtre SVG « gooey » : flou puis seuil d'alpha → les formes proches fusionnent. */
function GooFilter() {
  return (
    <svg width="0" height="0" aria-hidden className="absolute">
      <defs>
        <filter id="cta-goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="goo"
          />
        </filter>
      </defs>
    </svg>
  )
}
