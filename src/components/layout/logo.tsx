import Image from 'next/image'

import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/seo'

type LogoProps = {
  className?: string
  /** Variante claire (sur fond sombre / overlay hero) */
  light?: boolean
}

export function Logo({ className, light }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={`${siteConfig.name} home`}
      className={cn(
        'group inline-flex items-center transition-opacity hover:opacity-90',
        className
      )}
    >
      <Image
        src={light ? '/logo-light.png' : '/logo.png'}
        alt={siteConfig.name}
        width={754}
        height={573}
        priority
        className="h-11 w-auto sm:h-12"
      />
    </Link>
  )
}
