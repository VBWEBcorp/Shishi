import { Baby, Dumbbell, UtensilsCrossed, Waves } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Icône par pôle d'activité. Lucide ne fournit pas d'icône de raquette :
 * tennis et pickleball utilisent des SVG sur mesure, le reste vient de Lucide.
 */
export function ActivityIcon({
  name,
  className,
}: {
  name: string
  className?: string
}) {
  const cls = cn('size-6', className)

  switch (name) {
    case 'tennis':
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
          <circle cx="12" cy="12" r="9" />
          <path d="M5.6 5.6a13 13 0 0 0 12.8 12.8M18.4 5.6A13 13 0 0 1 5.6 18.4" />
        </svg>
      )
    case 'pickleball':
      // Icône fournie par le client (raquette + balle), affichée via masque CSS
      // pour hériter de la couleur courante (currentColor), comme les autres icônes.
      return (
        <span
          className={cls}
          style={{
            display: 'inline-block',
            backgroundColor: 'currentColor',
            WebkitMaskImage: 'url(/icons/pickleball.png)',
            maskImage: 'url(/icons/pickleball.png)',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
          }}
          aria-hidden
        />
      )
    case 'fitness':
      return <Dumbbell className={cls} aria-hidden />
    case 'restaurant':
      return <UtensilsCrossed className={cls} aria-hidden />
    case 'kids':
      return <Baby className={cls} aria-hidden />
    case 'pool':
      return <Waves className={cls} aria-hidden />
    default:
      return <Waves className={cls} aria-hidden />
  }
}
