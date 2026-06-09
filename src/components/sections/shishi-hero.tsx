'use client'

import { ChevronDown, MapPin, Search, Star } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { WeatherWidget } from '@/components/weather-widget'
import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'

/** Sépare un titre éditable pour colorer le dernier mot en accent (DA). */
function splitAccent(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 1) return { lead: '', accent: title }
  return { lead: words.slice(0, -1).join(' '), accent: words[words.length - 1] }
}

/** Petit séparateur losange repris du logo (── ◆ ──). */
function DiamondRule() {
  return (
    <div className="mt-6 flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent/70" />
      <span className="size-2 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent/70" />
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

  return (
    <section className="relative isolate min-h-[92vh] overflow-hidden">
      <Image
        src="/photos/tennis-aerial.jpg"
        alt="Shi Shi Samui — vue aérienne du complexe à Lamai, Koh Samui"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Voile sombre + tinte orange chaude, discrète (DA du logo) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0_0/0.65)] via-[oklch(0.18_0_0/0.5)] to-[oklch(0.18_0_0/0.92)]" aria-hidden />
      <div className="absolute inset-0 bg-[oklch(0.45_0.13_47/0.12)] mix-blend-overlay" aria-hidden />

      <div className="relative mx-auto flex min-h-[92vh] max-w-4xl flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:px-6">
        {/* Badge localisation + météo */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/20 backdrop-blur">
            <MapPin className="size-3.5" aria-hidden />
            {badge}
          </span>
          <WeatherWidget />
        </div>

        {/* Titre élégant — Cinzel, mots-clés en orange */}
        <h1 className="mt-7 font-display text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl">
          {hero.title ? (
            (() => {
              const { lead, accent } = splitAccent(hero.title!)
              return lead ? (
                <>
                  {lead} <span className="text-accent">{accent}</span>
                </>
              ) : (
                <span className="text-accent">{accent}</span>
              )
            })()
          ) : (
            t.rich('title', {
              accent: (chunks) => <span className="text-accent">{chunks}</span>,
            })
          )}
        </h1>

        <DiamondRule />

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
          {subtitle}
        </p>

        {/* Carte réservation (barre élégante) */}
        <Link
          href="/booking"
          className="group mt-8 flex w-full max-w-lg items-center gap-3 rounded-2xl bg-white/95 p-2 pl-5 text-left shadow-[0_24px_60px_-20px_oklch(0.18_0_0/0.7)] ring-1 ring-black/5 backdrop-blur transition-transform hover:-translate-y-0.5"
        >
          <span className="flex flex-1 flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {t('chooseActivity')}
            </span>
            <span className="font-display text-base font-semibold text-foreground">
              {t('pickActivity')}
            </span>
          </span>
          <span className="flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-[0_10px_24px_-8px_oklch(0.63_0.187_47/0.7)] transition-all group-hover:brightness-105">
            <Search className="size-4" aria-hidden />
            <span className="hidden sm:inline">{t('bookNow')}</span>
          </span>
        </Link>

        {/* Pills activités */}
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={`/activities/${a.slug}`}
              className={`group inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium backdrop-blur transition-all ${
                a.featured
                  ? 'bg-white/15 text-white ring-1 ring-accent/80'
                  : 'bg-white/8 text-white/85 ring-1 ring-white/15 hover:bg-white/15 hover:ring-white/30'
              }`}
            >
              <ActivityIcon name={a.icon} className="size-4 text-accent" />
              {a.name[l]}
            </Link>
          ))}
        </div>

        {/* Badges stats */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 text-white/85">
          <span className="inline-flex items-center gap-1.5 text-sm">
            <Star className="size-4 fill-accent text-accent" aria-hidden />
            {t('loved')}
          </span>
          <span className="text-white/30" aria-hidden>·</span>
          <span className="text-sm">6 {t('statActivities')}</span>
          <span className="text-white/30" aria-hidden>·</span>
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
