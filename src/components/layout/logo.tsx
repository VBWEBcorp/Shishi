import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/seo'

type LogoProps = {
  className?: string
  /** Texte en blanc (sur fond sombre / overlay) */
  light?: boolean
}

export function Logo({ className, light }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        'group inline-flex items-center gap-2.5 font-display text-lg font-semibold tracking-tight transition-opacity hover:opacity-90',
        light ? 'text-white' : 'text-foreground',
        className
      )}
    >
      {/* Marque provisoire : soleil + vague (esprit club resort tropical).
         À remplacer par le logo officiel une fois la charte reçue. */}
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.42_0.09_180)] text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-[1.03]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className="size-[18px]" aria-hidden>
          <circle cx="12" cy="9" r="3.2" />
          <path d="M12 2.5v1.4M12 14.1v1.4M4.8 9H3.4M20.6 9h-1.4M6.9 3.9l-1 -1M18.1 3.9l1 -1" />
          <path d="M3 19c1.6 0 1.6-1.2 3.2-1.2S7.8 19 9.4 19s1.6-1.2 3.2-1.2S14.2 19 15.8 19s1.6-1.2 3.2-1.2 1.6 1.2 3.2 1.2" />
        </svg>
      </span>
      <span className="leading-none">
        Shi Shi{' '}
        <span className={cn('font-normal', light ? 'text-white/60' : 'text-muted-foreground')}>
          Samui
        </span>
      </span>
    </Link>
  )
}
