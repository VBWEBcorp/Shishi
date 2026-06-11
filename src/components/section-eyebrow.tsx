import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * En-tête de section épuré : petite icône + label au-dessus du titre.
 * Pattern unifié sur toute la home (activités, galerie, FAQ, CTA…).
 *
 * `tone="light"` pour les fonds sombres (CTA), `align` pour centrer.
 */
export function SectionEyebrow({
  icon: Icon,
  children,
  tone = 'accent',
  className,
}: {
  icon: LucideIcon
  children: React.ReactNode
  tone?: 'accent' | 'light'
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em]',
        tone === 'light' ? 'text-white/70' : 'text-accent',
        className
      )}
    >
      <Icon className="size-4" aria-hidden />
      {children}
    </span>
  )
}
