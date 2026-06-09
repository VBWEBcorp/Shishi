import { ArrowUpRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { cn } from '@/lib/utils'

/**
 * Grille de tuiles d'activités cliquables ("thème en carrés" demandé par le
 * client). Chaque tuile mène à la page activité dédiée /activities/<slug>.
 */
export function ActivityTiles() {
  const t = useTranslations('Home.tiles')
  const locale = useLocale() as Locale

  return (
    <section id="activities" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
          <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
          {t('eyebrow')}
        </span>
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t('title')}
        </h2>
        <p className="mt-4 text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activities.map((a, i) => (
          <Link
            key={a.slug}
            href={`/activities/${a.slug}`}
            className={cn(
              'group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_oklch(0.18_0_0/0.3)]',
              a.featured && 'lg:col-span-2 lg:aspect-[16/9]'
            )}
          >
            <Image
              src={a.image}
              alt={a.name[locale]}
              fill
              sizes={a.featured ? '(min-width:1024px) 66vw, 100vw' : '(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw'}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority={i < 2}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.18_0_0/0.9)] via-[oklch(0.18_0_0/0.3)] to-transparent" aria-hidden />

            {a.featured && (
              <span className="absolute left-4 top-4 rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-accent-foreground">
                {t('signature')}
              </span>
            )}

            <div className="relative p-5">
              <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                <ActivityIcon name={a.icon} className="size-6" />
              </span>
              <div className="mt-3 flex items-end justify-between gap-2">
                <div>
                  <h3 className="font-display text-xl font-semibold text-white">{a.name[locale]}</h3>
                  <p className="mt-0.5 text-sm text-white/75">{a.tagline[locale]}</p>
                </div>
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/25 backdrop-blur transition-all duration-300 group-hover:bg-accent group-hover:text-accent-foreground">
                  <ArrowUpRight className="size-4" aria-hidden />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
