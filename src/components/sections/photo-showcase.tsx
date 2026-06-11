'use client'

import { useLocale } from 'next-intl'
import Image from 'next/image'

/**
 * Bande de photos qui défile toute seule, sur fond blanc, juste avant la
 * section CTA pré-footer. Les photos se fondent en blanc en haut (masque
 * dégradé) pour se raccorder à la section blanche au-dessus.
 *
 * Boucle continue : 2 copies des cartes + `animate-marquee-band` (translateX -50%).
 */
const SHOWCASE_PHOTOS: { src: string; alt: string }[] = [
  { src: '/photos/pickleball.jpg', alt: 'Pickleball' },
  { src: '/photos/tennis-aerial.jpg', alt: 'Tennis' },
  { src: '/photos/pool.jpg', alt: 'Piscine' },
  { src: '/photos/restaurant.jpg', alt: 'Restaurant' },
  { src: '/photos/fitness.jpg', alt: 'Fitness' },
  { src: '/photos/kids-play.jpg', alt: 'Kids club' },
  { src: '/photos/lounge.jpg', alt: 'Lounge' },
  { src: '/photos/pool-bar.jpg', alt: 'Pool bar' },
]

export function PhotoShowcase() {
  const locale = useLocale()
  const caption =
    locale === 'fr'
      ? 'Identifiez @shishisamui pour apparaître ici.'
      : 'Tag @shishisamui to get featured.'

  const loop = [...SHOWCASE_PHOTOS, ...SHOWCASE_PHOTOS]

  return (
    <section className="relative isolate overflow-hidden bg-white pt-8 pb-16 sm:pt-12 sm:pb-20">
      {/* Carrousel auto */}
      <div className="relative">
        <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_6%,#000_94%,transparent)]">
          <ul className="animate-marquee-band flex shrink-0 items-end">
            {loop.map((p, i) => (
              <li key={i} className="shrink-0 pe-4 sm:pe-6">
                <div className="relative h-72 w-56 overflow-hidden rounded-3xl bg-muted shadow-[0_18px_40px_-20px_oklch(0.2_0_0/0.45)] ring-1 ring-black/5 sm:h-96 sm:w-72">
                  <Image
                    src={p.src}
                    alt={p.alt}
                    fill
                    sizes="(min-width:640px) 288px, 224px"
                    className="object-cover"
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Légende + filet */}
      <div className="mx-auto mt-10 flex max-w-6xl items-center gap-6 px-4 sm:mt-12 sm:px-6 lg:px-8">
        <p className="shrink-0 font-editorial text-lg text-foreground/70 sm:text-xl">{caption}</p>
        <span className="h-px flex-1 bg-border" aria-hidden />
      </div>
    </section>
  )
}
