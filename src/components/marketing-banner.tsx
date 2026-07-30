'use client'

import { useEffect, useState } from 'react'
import { safeUrl } from '@/lib/utils'

interface BannerData {
  enabled: boolean
  text: string
  link?: string
  bgColor: string
  textColor: string
}

/**
 * Bannière défilante (marquee) — présentation seule, réutilisée par le site
 * public et par l'aperçu de l'admin. Le défilement est seamless : deux groupes
 * identiques + translation -50 % (cf. `animate-marquee-band` dans index.css).
 * Stoppé si l'utilisateur préfère réduire les animations (motion-reduce).
 */
export function BannerMarquee({
  text,
  bgColor,
  textColor,
}: {
  text: string
  bgColor: string
  textColor: string
}) {
  const group = (
    <div className="flex shrink-0 items-center">
      {Array.from({ length: 8 }, (_, i) => (
        <span key={i} className="flex items-center gap-4 whitespace-nowrap px-6 text-sm font-medium">
          {text}
          <span
            aria-hidden
            className="inline-block size-1.5 rotate-45"
            style={{ backgroundColor: textColor, opacity: 0.5 }}
          />
        </span>
      ))}
    </div>
  )

  return (
    <div className="w-full overflow-hidden py-2" style={{ backgroundColor: bgColor, color: textColor }}>
      <span className="sr-only">{text}</span>
      <div aria-hidden className="flex w-max animate-marquee-band items-center motion-reduce:animate-none">
        {group}
        {group}
      </div>
    </div>
  )
}

export function MarketingBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null)

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const res = await fetch('/api/marketing')
        const data = await res.json()
        if (data?.banner?.enabled && data.banner.text) {
          setBanner(data.banner)
        }
      } catch {
        // silently fail
      }
    }
    fetchBanner()
  }, [])

  if (!banner) return null

  const marquee = (
    <BannerMarquee text={banner.text} bgColor={banner.bgColor} textColor={banner.textColor} />
  )

  if (banner.link) {
    return (
      <a href={safeUrl(banner.link)} className="block transition-opacity hover:opacity-90">
        {marquee}
      </a>
    )
  }

  return marquee
}
