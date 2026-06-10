'use client'

import { useEffect, useRef, useState } from 'react'
import { CalendarDays, Check, ChevronDown, MapPin, Search, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { WeatherWidget } from '@/components/weather-widget'
import { useContent } from '@/hooks/use-content'
import { Link, useRouter } from '@/i18n/navigation'
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
  const router = useRouter()
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
  const [actOpen, setActOpen] = useState(false)
  const actRef = useRef<HTMLDivElement>(null)
  const selected = activities.find((a) => a.slug === activitySlug) ?? featured

  // Défaut « aujourd'hui » posé après montage (évite l'écart SSR/CSR)
  useEffect(() => {
    const d = new Date().toISOString().slice(0, 10)
    setToday(d)
    setDate(d)
  }, [])

  // Ferme le menu activité au clic extérieur / Échap
  useEffect(() => {
    if (!actOpen) return
    function onDown(e: MouseEvent) {
      if (actRef.current && !actRef.current.contains(e.target as Node)) setActOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setActOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [actOpen])

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const qs = new URLSearchParams({ activity: activitySlug })
    if (date) qs.set('date', date)
    router.push(`/booking?${qs.toString()}`)
  }

  return (
    <section className="relative isolate z-20 min-h-[94vh]">
      {/* Poster instantané (LCP) + repli si la vidéo ne charge pas / reduced-motion */}
      <Image
        src="/photos/pool.jpg"
        alt="Shi Shi Samui — piscine du complexe à Lamai, Koh Samui"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Vidéo de fond cinématique (esprit Traavellio). Remplacer
          /videos/hero-pool.mp4 par la vidéo définitive du client. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/photos/pool.jpg"
        onCanPlay={() => setVideoReady(true)}
        aria-hidden
        className={`absolute inset-0 size-full object-cover transition-opacity duration-1000 motion-reduce:hidden ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/videos/hero-pool.mp4" type="video/mp4" />
      </video>
      {/* Voile bohème : doux et chaud (esprit Lifetime), assez de contraste pour le texte */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0.02_60/0.4)] via-[oklch(0.2_0.02_60/0.32)] to-[oklch(0.16_0.02_55/0.86)]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-[oklch(0.55_0.12_55/0.1)] mix-blend-soft-light" aria-hidden />

      <div className="relative mx-auto flex min-h-[94vh] max-w-4xl flex-col items-center justify-center px-4 pb-24 pt-28 text-center sm:px-6">
        {/* Eyebrow localisation + météo — petites capitales espacées (Lifetime) */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 ring-1 ring-white/20 backdrop-blur">
            <MapPin className="size-3.5" aria-hidden />
            {badge}
          </span>
          <WeatherWidget />
        </div>

        {/* Titre éditorial — Fraunces, dernier mot en italique orange (DA) */}
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
          {/* Activité — dropdown custom (DA bohème) */}
          <div ref={actRef} className="relative flex flex-1">
            <button
              type="button"
              onClick={() => setActOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={actOpen}
              className="flex w-full items-center gap-3 rounded-2xl px-4 py-2.5 text-left transition-colors hover:bg-secondary/50 aria-expanded:bg-secondary/60"
            >
              <ActivityIcon name={selected.icon} className="size-5 shrink-0 text-accent" />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {t('chooseActivity')}
                </span>
                <span className="truncate font-editorial text-[15px] font-medium text-foreground">
                  {selected.name[l]}
                </span>
              </span>
              <ChevronDown
                className={`size-4 shrink-0 text-muted-foreground transition-transform ${actOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>

            {actOpen && (
              <ul
                role="listbox"
                className="absolute left-0 top-[calc(100%+0.6rem)] z-30 w-[min(20rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-border bg-popover p-1.5 shadow-[0_30px_70px_-24px_oklch(0.16_0.02_55/0.55)]"
              >
                {activities.map((a) => {
                  const active = a.slug === activitySlug
                  return (
                    <li key={a.slug}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setActivitySlug(a.slug)
                          setActOpen(false)
                        }}
                        className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                          active
                            ? 'bg-accent/10 text-accent ring-1 ring-accent/20'
                            : 'text-foreground hover:bg-secondary/70'
                        }`}
                      >
                        <ActivityIcon
                          name={a.icon}
                          className={`size-5 shrink-0 ${active ? 'text-accent' : 'text-muted-foreground'}`}
                        />
                        <span className="flex-1 truncate font-medium">{a.name[l]}</span>
                        {a.featured && !active && (
                          <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                            Signature
                          </span>
                        )}
                        {active && <Check className="size-4 shrink-0 text-accent" aria-hidden />}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          <span className="hidden w-px self-stretch bg-border sm:block" aria-hidden />

          {/* Date */}
          <label className="hidden flex-col justify-center px-4 py-2.5 transition-colors focus-within:bg-secondary/60 hover:bg-secondary/40 sm:flex sm:rounded-2xl">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('when')}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 shrink-0 text-ocean" aria-hidden />
              <input
                type="date"
                aria-label={t('when')}
                value={date}
                min={today || undefined}
                onChange={(e) => setDate(e.target.value)}
                className="cursor-pointer bg-transparent font-editorial text-[15px] font-medium text-foreground focus:outline-none [color-scheme:light]"
              />
            </span>
          </label>

          <button
            type="submit"
            className="flex items-center rounded-2xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_12px_28px_-10px_oklch(0.63_0.187_47/0.7)] transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <Search className="size-4" aria-hidden />
            <span className="ml-2 hidden sm:inline">{t('bookNow')}</span>
          </button>
        </form>

        {/* Pills activités — translucides, raffinées */}
        <div className="relative z-0 mt-8 flex flex-wrap items-center justify-center gap-2">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={`/activities/${a.slug}`}
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

        {/* Ligne de confiance */}
        <div className="relative z-0 mt-9 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-white/80">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Star className="size-4 fill-accent text-accent" aria-hidden />
            {t('loved')}
          </span>
          <span className="text-white/25" aria-hidden>◆</span>
          <span className="text-sm">6 {t('statActivities')}</span>
          <span className="text-white/25" aria-hidden>◆</span>
          <span className="text-sm">24/7 · {t('statBooking')}</span>
        </div>
      </div>

      {/* Chevron scroll */}
      <Link
        href="/#activities"
        aria-label={t('explore')}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 transition-colors hover:text-white"
      >
        <ChevronDown className="size-7 animate-bounce" aria-hidden />
      </Link>
    </section>
  )
}
