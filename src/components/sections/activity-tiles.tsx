import { ArrowRight, ArrowUpRight, LayoutGrid, Lock } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { getActivityPrice, OPENING_HOURS } from '@/lib/booking-pricing'

/**
 * Section activités — fusion de DA voulue par le client :
 *  · structure "sport-cards" d'AnyBuddy (chip d'info + lien d'action libellé)
 *  · habillage éditorial bohème de lifetime.life (en-tête asymétrique titre +
 *    paragraphe/lien, grandes cartes cinématiques, Poppins, beaucoup d'air).
 */
export function ActivityTiles() {
  const t = useTranslations('Home.tiles')
  const locale = useLocale() as Locale

  /** Chip d'info façon AnyBuddy : prix « dès X ฿ », sinon horaires. */
  function chip(slug: string): string | null {
    const price = getActivityPrice(slug)
    if (price > 0) return `${t('from')} ${price} ฿`
    return OPENING_HOURS[slug]?.[locale] ?? null
  }

  return (
    <section id="activities" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* En-tête éditorial asymétrique (Lifetime) */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <SectionEyebrow icon={LayoutGrid}>{t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-5 font-editorial text-[2.1rem] font-normal leading-[1.08] tracking-[-0.01em] text-foreground sm:text-[2.9rem]">
            {t('title')}
          </h2>
        </div>
        <div className="max-w-sm lg:text-right">
          <p className="text-[15px] leading-relaxed text-muted-foreground">{t('intro')}</p>
          <Link
            href="/book-now"
            className="group mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-accent"
          >
            {t('exploreAll')}
            <span className="flex size-7 items-center justify-center rounded-full ring-1 ring-border transition-colors group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-accent">
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </Link>
        </div>
      </div>

      {/* Grille uniforme : toutes les cartes à la même taille (image + texte
          lisible en dessous), DA « Framer » cohérente avec le blog. */}
      <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-12 sm:gap-x-6 sm:gap-y-10 lg:mt-14 lg:grid-cols-3 lg:gap-x-8">
        {activities.map((a, i) => {
          const info = chip(a.slug)
          return (
            <Link key={a.slug} href={a.path} className="group block">
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted ring-1 ring-border sm:rounded-[1.75rem]">
                <Image
                  src={a.image}
                  alt={a.altImages[0]}
                  fill
                  sizes="(min-width:1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  priority={i < 3}
                />
                {a.comingSoon && (
                  <span className="absolute left-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-foreground/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-sm sm:left-4 sm:top-4">
                    <Lock className="size-2.5" aria-hidden />
                    Coming Soon
                  </span>
                )}
                <span className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-accent group-hover:text-white sm:right-4 sm:top-4 sm:size-11">
                  <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45 sm:size-5" aria-hidden />
                </span>
              </div>

              {/* Texte en dessous */}
              <div className="mt-3 px-0.5 sm:mt-4 sm:px-1">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {a.comingSoon ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent sm:px-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                      <Lock className="size-2.5" aria-hidden />
                      Coming Soon
                    </span>
                  ) : (
                    <>
                      {a.featured && (
                        <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-accent sm:px-2.5 sm:text-[10px] sm:tracking-[0.12em]">
                          {t('signature')}
                        </span>
                      )}
                      {info && (
                        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                          {info}
                        </span>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 sm:mt-2 sm:gap-2">
                  <ActivityIcon name={a.icon} className="size-4 shrink-0 text-accent sm:size-5" />
                  <h3 className="font-display text-base leading-snug text-foreground transition-colors group-hover:text-accent sm:text-[1.35rem]">
                    {a.name[locale]}
                  </h3>
                </div>

                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:mt-2 sm:text-sm sm:line-clamp-none">
                  {a.tagline[locale]}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
