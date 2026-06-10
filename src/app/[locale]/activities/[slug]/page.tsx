import { ArrowRight, Check, Clock, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { notFound } from 'next/navigation'

import { ActivityIcon } from '@/components/activity-icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { routing } from '@/i18n/routing'
import { activities, activitySlugs, getActivity } from '@/lib/activities'
import { OPENING_HOURS, PRICE_TIERS } from '@/lib/booking-pricing'
import { siteConfig } from '@/lib/seo'

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

// Galerie photo par activité (réutilise les visuels du complexe disponibles —
// à compléter avec les vraies photos client par pôle).
const galleryBySlug: Record<string, string[]> = {
  pickleball: ['/photos/pickleball.jpg', '/photos/tennis-aerial.jpg', '/photos/pool.jpg', '/photos/lounge.jpg'],
  tennis: ['/photos/tennis-aerial.jpg', '/photos/pickleball.jpg', '/photos/pool.jpg', '/photos/lounge.jpg'],
  fitness: ['/photos/fitness.jpg', '/photos/fitness-2.jpg', '/photos/lounge.jpg', '/photos/pool.jpg'],
  restaurant: ['/photos/restaurant.jpg', '/photos/restaurant-2.jpg', '/photos/pool-bar.jpg', '/photos/lounge.jpg'],
  'kids-club': ['/photos/kids-welcome.jpg', '/photos/kids-play.jpg', '/photos/kids-outdoor.jpg', '/photos/kids-trampoline.jpg'],
  pool: ['/photos/pool.jpg', '/photos/pool-2.jpg', '/photos/pool-bar.jpg', '/photos/lounge.jpg'],
}

// Vidéo de fond du hero, par activité (clips stock libres Pexels, paysage ~720p —
// placeholders thématiques à remplacer par les vraies vidéos client par pôle).
const videoBySlug: Record<string, string> = {
  pickleball: '/videos/pickleball.mp4',
  tennis: '/videos/tennis.mp4',
  fitness: '/videos/fitness.mp4',
  restaurant: '/videos/restaurant.mp4',
  'kids-club': '/videos/kids.mp4',
  pool: '/videos/hero-pool.mp4',
}
const FALLBACK_VIDEO = '/videos/hero-pool.mp4'

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
  const gallery = galleryBySlug[slug] ?? []
  const heroVideo = videoBySlug[slug] ?? FALLBACK_VIDEO
  const others = activities.filter((a) => a.slug !== slug)
  const tiers = PRICE_TIERS[slug] ?? []
  const hours = OPENING_HOURS[slug]?.[l]
  const fmtPrice = (amount: number) =>
    `฿${amount.toLocaleString(l === 'fr' ? 'fr-FR' : 'en-US')}`

  return (
    <>
      {/* 1 · HERO — vidéo de fond (photo = poster/repli), sombre */}
      <section className="relative isolate min-h-[60vh] overflow-hidden pt-14">
        <Image src={activity.image} alt={activity.name[l]} fill priority sizes="100vw" className="object-cover" />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={activity.image}
          aria-hidden
          className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.02_55/0.55)] via-[oklch(0.16_0.02_55/0.5)] to-[oklch(0.14_0.02_55/0.88)]" aria-hidden />

        <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:px-6 lg:px-8">
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-white">{t('breadcrumbHome')}</Link>
            <span aria-hidden>/</span>
            <Link href="/#activities" className="transition-colors hover:text-white">{t('breadcrumbActivities')}</Link>
            <span aria-hidden>/</span>
            <span className="text-white">{activity.name[l]}</span>
          </nav>

          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
            <ActivityIcon name={activity.icon} className="size-7" />
          </span>
          <h1 className="mt-5 font-editorial text-4xl font-medium tracking-[-0.01em] text-white sm:text-6xl">
            {activity.name[l]}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">{activity.tagline[l]}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> Lamai, Koh Samui
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {hours ?? t('openDaily')}
            </span>
          </div>

        </div>
      </section>

      {/* 2 · À PROPOS + TARIFS — crème */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {t('breadcrumbActivities')}
            </span>
            <h2 className="mt-4 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.5rem]">
              {t('about', { name: activity.name[l] })}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{activity.description[l]}</p>

            {highlights.length > 0 && (
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean ring-1 ring-ocean/20">
                      <Check className="size-4" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_50px_-30px_oklch(0.16_0.02_55/0.35)]">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                {t('pricing')}
              </span>
              {hours && <p className="mt-2 text-sm font-medium text-foreground">{hours}</p>}
              <ul className="mt-5 space-y-3">
                {tiers.length > 0 ? (
                  tiers.map((tier) => (
                    <PriceRow key={tier.label[l]} label={tier.label[l]} value={fmtPrice(tier.amount)} />
                  ))
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">{t('pricingNote')}</p>
                    <PriceRow label={t('dropIn')} hint={t('dropInHint')} value="฿—" />
                  </>
                )}
              </ul>
              <Link
                href={slug === 'restaurant' ? '/contact' : `/booking?activity=${slug}`}
                className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)] transition-all hover:brightness-105"
              >
                {t('bookName', { name: activity.name[l] })}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <p className="mt-3 text-center text-xs text-muted-foreground">{t('securePayment')}</p>
            </div>
          </aside>
        </div>
      </section>

      {/* 3 · GALERIE — bande sable */}
      {gallery.length > 0 && (
        <section className="border-y border-border bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="font-editorial text-2xl font-normal text-foreground sm:text-3xl">
              {l === 'fr' ? 'En images' : 'In pictures'}
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {gallery.map((src, i) => (
                <div
                  key={src}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-border"
                >
                  <Image
                    src={src}
                    alt={`${activity.name[l]} — ${i + 1}`}
                    fill
                    sizes="(min-width:1024px) 18rem, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4 · AUTRES ACTIVITÉS — crème */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="font-editorial text-2xl font-normal text-foreground sm:text-3xl">{t('exploreOther')}</h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {others.map((a) => (
              <Link
                key={a.slug}
                href={`/activities/${a.slug}`}
                className="group flex items-center gap-2.5 rounded-2xl border border-border bg-background p-3 transition-colors hover:border-accent/40"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-foreground text-white ring-1 ring-border transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
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
      <span className="shrink-0 font-editorial text-base font-medium text-foreground">{value}</span>
    </li>
  )
}
