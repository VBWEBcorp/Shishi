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
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={cls} aria-hidden>
          <path d="M14.5 3.5a4.5 4.5 0 0 1 0 9c-1.6 0-3-.8-3.9-2.1L4.2 17a2 2 0 1 1-2.2-2.2l6.7-6.4A4.5 4.5 0 0 1 14.5 3.5Z" />
          <circle cx="14.5" cy="8" r="1" />
          <circle cx="11.5" cy="6.5" r="1" />
          <circle cx="16.5" cy="10.5" r="1" />
        </svg>
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
