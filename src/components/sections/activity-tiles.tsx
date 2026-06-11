import { ArrowRight, ArrowUpRight, LayoutGrid } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { getActivityPrice, OPENING_HOURS } from '@/lib/booking-pricing'
import { cn } from '@/lib/utils'

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

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((a, i) => {
          const info = chip(a.slug)
          return (
            <Link
              key={a.slug}
              href={a.path}
              className={cn(
                'group relative isolate flex aspect-[4/3] transform-gpu flex-col justify-end overflow-hidden rounded-3xl ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_56px_-22px_oklch(0.16_0.02_55/0.4)]',
                a.featured && 'lg:col-span-2 lg:aspect-[16/9]'
              )}
            >
              <Image
                src={a.image}
                alt={a.altImages[0]}
                fill
                sizes={a.featured ? '(min-width:1024px) 66vw, 100vw' : '(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw'}
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                priority={i < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.16_0_0/0.92)] via-[oklch(0.16_0_0/0.35)] to-transparent" aria-hidden />

              {/* Badges haut — Signature (gauche) + chip info type AnyBuddy (droite) */}
              <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
                {a.featured ? (
                  <span className="rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent-foreground shadow-sm">
                    {t('signature')}
                  </span>
                ) : (
                  <span aria-hidden />
                )}
                {info && (
                  <span className="rounded-full bg-ocean/85 px-3 py-1 text-[11px] font-semibold text-ocean-foreground ring-1 ring-white/15 backdrop-blur">
                    {info}
                  </span>
                )}
              </div>

              <div className="relative p-5 sm:p-6">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                  <ActivityIcon name={a.icon} className="size-6" />
                </span>
                <h3 className="mt-3.5 font-editorial text-2xl font-medium text-white sm:text-[1.7rem]">
                  {a.name[locale]}
                </h3>
                <p className="mt-1 text-sm text-white/75">{a.tagline[locale]}</p>

                {/* Les tuiles mènent à la page détail → « Découvrir » (la réservation se fait là-bas). */}
                <span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
                  {t('discover')}
                  <span className="flex size-7 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/25 backdrop-blur transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-accent">
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:rotate-45" aria-hidden />
                  </span>
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
