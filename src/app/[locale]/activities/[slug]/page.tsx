import { ArrowRight, Check, Clock, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import { getLocale, getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { ActivityIcon } from '@/components/activity-icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import { activities, activitySlugs, getActivity } from '@/lib/activities'
import { OPENING_HOURS, PRICE_TIERS } from '@/lib/booking-pricing'
import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    activitySlugs.map((slug) => ({ locale, slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const activity = getActivity(slug)
  if (!activity) return {}
  const l = locale as Locale

  const title = `${activity.name[l]} in Lamai, Koh Samui`
  return {
    title,
    description: activity.description[l],
    keywords: activity.keywords,
    alternates: { canonical: `/activities/${slug}` },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description: activity.description[l],
      images: [{ url: activity.image }],
    },
  }
}

// Avantages génériques par activité (placeholder — à affiner avec le client)
const highlightsBySlug: Record<string, { en: string[]; fr: string[] }> = {
  pickleball: {
    en: ['Dedicated pickleball courts', 'Beginner clinics & open play', 'Paddle & ball rental', 'Social tournaments'],
    fr: ['Terrains de pickleball dédiés', 'Initiations & jeu libre', 'Location de raquette & balles', 'Tournois conviviaux'],
  },
  tennis: {
    en: ['Quality tennis courts', 'Private & group coaching', 'Racket rental', 'Singles & doubles booking'],
    fr: ['Courts de tennis de qualité', 'Coaching privé & collectif', 'Location de raquette', 'Réservation simple & double'],
  },
  fitness: {
    en: ['Strength & cardio zones', 'Functional training area', 'Day passes & memberships', 'Towel service'],
    fr: ['Zones force & cardio', 'Espace functional training', 'Pass journée & abonnements', 'Service de serviettes'],
  },
  restaurant: {
    en: ['Fresh healthy menu', 'Smoothies & bowls', 'Poolside dining', 'Vegetarian & vegan options'],
    fr: ['Carte fraîche & healthy', 'Smoothies & bowls', 'Repas au bord de la piscine', 'Options végétariennes & vegan'],
  },
  'kids-club': {
    en: ['Supervised activities', 'Babysitting on request', 'Safe & shaded play area', 'Family-friendly all day'],
    fr: ['Activités encadrées', 'Babysitting sur demande', 'Aire de jeu sûre & ombragée', 'Convivial pour les familles'],
  },
  pool: {
    en: ['Sun loungers & shade', 'Poolside service', 'Day pass access', 'Steps from the restaurant'],
    fr: ['Transats & coins ombragés', 'Service au bord de l’eau', 'Accès pass journée', 'À deux pas du restaurant'],
  },
}

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const activity = getActivity(slug)
  if (!activity) notFound()

  const t = await getTranslations('Activity')
  const highlights = highlightsBySlug[slug]?.[l] ?? []
  const others = activities.filter((a) => a.slug !== slug)
  const tiers = PRICE_TIERS[slug] ?? []
  const hours = OPENING_HOURS[slug]?.[l]
  const fmtPrice = (amount: number) =>
    `฿${amount.toLocaleString(l === 'fr' ? 'fr-FR' : 'en-US')}`

  return (
    <>
      <section className="relative isolate min-h-[60vh] overflow-hidden pt-14">
        <Image src={activity.image} alt={activity.name[l]} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0_0/0.55)] via-[oklch(0.18_0_0/0.5)] to-[oklch(0.18_0_0/0.85)]" aria-hidden />

        <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-white">{t('breadcrumbHome')}</Link>
            <span aria-hidden>/</span>
            <Link href="/#activities" className="transition-colors hover:text-white">{t('breadcrumbActivities')}</Link>
            <span aria-hidden>/</span>
            <span className="text-white">{activity.name[l]}</span>
          </nav>

          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
            <ActivityIcon name={activity.icon} className="size-7" />
          </span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {activity.name[l]}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">{activity.tagline[l]}</p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> Lamai, Koh Samui
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {hours ?? t('openDaily')}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              {t('about', { name: activity.name[l] })}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{activity.description[l]}</p>

            {highlights.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Check className="size-4" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {t('pricing')}
              </p>
              {hours && (
                <p className="mt-1 text-sm font-medium text-foreground">{hours}</p>
              )}
              <ul className="mt-5 space-y-3">
                {tiers.length > 0 ? (
                  tiers.map((tier) => (
                    <PriceRow
                      key={tier.label[l]}
                      label={tier.label[l]}
                      value={fmtPrice(tier.amount)}
                    />
                  ))
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{t('pricingNote')}</p>
                    <PriceRow label={t('dropIn')} hint={t('dropInHint')} value="฿—" />
                  </>
                )}
              </ul>
              <Link
                href="/booking"
                className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)] transition-all hover:brightness-105"
              >
                {t('bookName', { name: activity.name[l] })}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">{t('securePayment')}</p>
            </div>
          </aside>
        </div>

        <div className="mt-20 border-t border-border pt-12">
          <h2 className="font-display text-xl font-bold text-foreground">{t('exploreOther')}</h2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {others.map((a) => (
              <Link
                key={a.slug}
                href={`/activities/${a.slug}`}
                className="group flex items-center gap-2.5 rounded-xl border border-border bg-card p-3 transition-colors hover:bg-muted"
              >
                <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ring-1 ring-border', a.gradient)}>
                  <ActivityIcon name={a.icon} className="size-4" />
                </span>
                <span className="truncate text-sm font-medium text-foreground">{a.name[l]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

function PriceRow({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className="shrink-0 font-display text-sm font-bold text-foreground">{value}</span>
    </li>
  )
}
