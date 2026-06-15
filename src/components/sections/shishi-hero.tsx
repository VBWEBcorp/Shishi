'use client'

import { useEffect, useState } from 'react'
import { MapPin, Search } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'

import { ActivityIcon } from '@/components/activity-icon'
import { ActivitySelect } from '@/components/activity-select'
import { BookingDialog } from '@/components/booking-dialog'
import { DatePopover } from '@/components/date-popover'
import { WeatherWidget } from '@/components/weather-widget'
import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'

/** Sépare un titre éditable pour mettre le dernier mot en italique éditorial (DA). */
function splitAccent(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { lead: '', accent: title }
  return { lead: words.slice(0, -1).join(' '), accent: words[words.length - 1] }
}

/** Petit séparateur losange repris du logo (── ◆ ──). */
function DiamondRule() {
  return (
    <div className="mt-7 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
      <span className="size-1.5 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
    </div>
  )
}

export function ShishiHero() {
  const t = useTranslations('Home.hero')
  const l = useLocale() as Locale
  const { data } = useContent('home', {} as { hero?: Record<string, string> })
  const hero = data.hero ?? {}
  const badge = hero.eyebrow || t('badge')
  const subtitle = hero.description || t('subtitle')
  const featured = activities.find((a) => a.featured) ?? activities[0]

  // Recherche fonctionnelle : activité + date → /booking pré-rempli
  const [activitySlug, setActivitySlug] = useState(featured.slug)
  const [date, setDate] = useState('')
  const [today, setToday] = useState('')
  const [videoReady, setVideoReady] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)

  // Défaut « aujourd'hui » posé après montage (évite l'écart SSR/CSR)
  useEffect(() => {
    const d = new Date().toISOString().slice(0, 10)
    setToday(d)
    setDate(d)
  }, [])

  // Réservation = popup direct (UX), pas de navigation. La page /book-now reste
  // l'URL réelle (SEO) pour les accès directs et le maillage interne.
  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBookingOpen(true)
  }

  return (
    <section className="relative isolate z-20 min-h-[94vh] bg-[oklch(0.16_0_0)]">
      {/* Vidéo drone uniquement — aucune photo avant le démarrage (ni image LCP,
          ni poster). Léger fondu depuis le fond sombre le temps que la vidéo
          charge. Remplacer /videos/hero-pool.mp4 par la vidéo définitive. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        aria-hidden
        className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 motion-reduce:hidden ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/videos/hero-pool.mp4" type="video/mp4" />
      </video>
      {/* Voile neutre : assez de contraste pour le texte, sans teinte chaude */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0_0/0.4)] via-[oklch(0.2_0_0/0.32)] to-[oklch(0.16_0_0/0.86)]"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[94vh] max-w-4xl flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6">
        {/* Eyebrow localisation + météo — petites capitales espacées (Lifetime) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 ring-1 ring-white/20 backdrop-blur">
            <MapPin className="size-3.5" aria-hidden />
            {badge}
          </span>
          <WeatherWidget />
        </div>

        {/* Titre éditorial — Poppins, dernier mot en italique orange (DA) */}
        <h1 className="mt-8 font-editorial text-[2.6rem] font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-6xl lg:text-[4.4rem]">
          {hero.title ? (
            (() => {
              const { lead, accent } = splitAccent(hero.title!)
              return lead ? (
                <>
                  {lead}{' '}
                  <span className="italic text-accent/95">{accent}</span>
                </>
              ) : (
                <span className="italic">{accent}</span>
              )
            })()
          ) : (
            t.rich('title', {
              accent: (chunks) => <span className="italic text-accent/95">{chunks}</span>,
            })
          )}
        </h1>

        <DiamondRule />

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          {subtitle}
        </p>

        {/* Barre de réservation fonctionnelle — structure Anybuddy, peau bohème claire */}
        <form
          onSubmit={handleSearch}
          className="group relative z-40 mt-9 flex w-full max-w-xl items-stretch gap-1 rounded-[1.4rem] bg-card/95 p-2 text-left shadow-[0_30px_70px_-24px_oklch(0.16_0.02_55/0.8)] ring-1 ring-black/5 backdrop-blur-md"
        >
          {/* Activité — sélecteur custom partagé (même menu que le popup de réservation) */}
          <ActivitySelect
            value={activitySlug}
            onChange={setActivitySlug}
            locale={l}
            variant="bar"
            label={t('chooseActivity')}
          />

          <span className="hidden w-px self-stretch bg-border sm:block" aria-hidden />

          {/* Date — calendrier custom (DA Shi Shi) */}
          <div className="hidden sm:flex">
            <DatePopover value={date} today={today} onChange={setDate} locale={l} />
          </div>

          <button
            type="submit"
            className="flex items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_12px_28px_-10px_oklch(0.63_0.187_47/0.7)] transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <Search className="size-4" aria-hidden />
            <span className="ml-2 hidden sm:inline">{t('bookNow')}</span>
          </button>
        </form>

        {/* Pills activités — translucides, raffinées */}
        <div className="relative z-0 mt-12 flex flex-wrap items-center justify-center gap-2 sm:mt-14">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={a.path}
              className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur transition-all ${
                a.featured
                  ? 'bg-white/15 text-white ring-1 ring-accent/80'
                  : 'bg-white/[0.07] text-white/85 ring-1 ring-white/15 hover:bg-white/15 hover:ring-white/30'
              }`}
            >
              <ActivityIcon name={a.icon} className="size-4 text-accent" />
              {a.name[l]}
            </Link>
          ))}
        </div>

      </div>

      {/* Popup de réservation — pré-rempli avec l'activité + la date choisies */}
      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        activity={activitySlug}
        date={date}
      />
    </section>
  )
}
