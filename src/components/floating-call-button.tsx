import { Phone } from 'lucide-react'

import { siteConfig } from '@/lib/seo'

export function FloatingCallButton() {
  return (
    <a
      href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
      aria-label="Appeler"
      className="group fixed bottom-6 right-6 z-50 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-1 ring-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary/20 active:scale-95 sm:size-13"
    >
      <Phone className="size-5 transition-transform duration-300 group-hover:rotate-12" />
      <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" style={{ animationDuration: '3s' }} />
    </a>
  )
}
