'use client'

import { useState } from 'react'
import { ArrowUpRight, Instagram, Mail, MapPin, MessageCircle } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { WeatherWidget } from '@/components/weather-widget'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { siteConfig } from '@/lib/seo'

/** Délai de stagger pour la révélation CSS (ordre d'apparition). */
function reveal(step: number): React.CSSProperties {
  return { animationDelay: `${0.1 + step * 0.09}s` }
}

/** Petit séparateur losange repris du logo (── ◆ ──). */
function DiamondRule() {
  return (
    <div className="flex items-center justify-center gap-3" aria-hidden>
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-white/45" />
      <span className="size-1.5 rotate-45 bg-accent" />
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-white/45" />
    </div>
  )
}

export function ComingSoon() {
  const t = useTranslations('ComingSoon')
  const l = useLocale() as Locale
  const [videoReady, setVideoReady] = useState(false)

  const whatsappHref = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    t('whatsappPrefill')
  )}`

  return (
    <section className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-[oklch(0.16_0_0)]">
      {/* Fond cinématique : poster (LCP, visible sans JS) + vidéo de la piscine */}
      <Image
        src="/photos/pool.jpg"
        alt="Shi Shi Samui — le club resort à Lamai, Koh Samui"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/photos/pool.jpg"
        onCanPlay={() => setVideoReady(true)}
        aria-hidden
        className={`absolute inset-0 size-full object-cover transition-opacity duration-[1200ms] motion-reduce:hidden ${
          videoReady ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <source src="/videos/hero-pool.mp4" type="video/mp4" />
      </video>

      {/* Voiles : dégradé vertical pour le contraste + vignette radiale premium */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[oklch(0.14_0_0/0.62)] via-[oklch(0.14_0_0/0.5)] to-[oklch(0.12_0_0/0.92)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 [background:radial-gradient(120%_85%_at_50%_30%,transparent_38%,oklch(0.1_0_0/0.55)_100%)]"
        aria-hidden
      />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-7 px-5 py-16 text-center sm:px-6">
        {/* Logo */}
        <Image
          src="/logo-light.png"
          alt={siteConfig.name}
          width={754}
          height={573}
          priority
          className="animate-reveal h-16 w-auto sm:h-20"
          style={reveal(0)}
        />

        {/* Eyebrow localisation + météo en direct */}
        <div
          className="animate-reveal flex flex-wrap items-center justify-center gap-3"
          style={reveal(1)}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 ring-1 ring-white/20 backdrop-blur">
            <MapPin className="size-3.5" aria-hidden />
            {t('location')}
          </span>
          <WeatherWidget />
        </div>

        {/* Badge « Ouverture prochaine » avec point animé */}
        <div className="animate-reveal" style={reveal(2)}>
          <span className="inline-flex items-center gap-2.5 rounded-full bg-accent/15 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.24em] text-accent ring-1 ring-accent/30 backdrop-blur">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {t('badge')}
          </span>
        </div>

        {/* Titre éditorial — la marque, dernier mot en italique orange (DA) */}
        <h1
          className="animate-reveal font-editorial text-[2.9rem] font-normal leading-[1.04] tracking-[-0.015em] text-white sm:text-6xl lg:text-7xl"
          style={reveal(3)}
        >
          {/* H1 sémantique « à la lettre » de l'audit (lu par Google / lecteurs
              d'écran) — le wordmark visuel reste l'identité de marque. */}
          <span className="sr-only">Sports &amp; Social Club in Lamai, Koh Samui — Shi Shi Samui</span>
          <span aria-hidden="true">
            Shi Shi <span className="italic text-accent/95">Samui</span>
          </span>
        </h1>

        <p
          className="animate-reveal max-w-xl font-editorial text-lg italic text-white/85 sm:text-xl"
          style={reveal(4)}
        >
          {t('tagline')}
        </p>

        <div className="animate-reveal" style={reveal(5)}>
          <DiamondRule />
        </div>

        <p
          className="animate-reveal max-w-xl text-[15px] leading-relaxed text-white/75 sm:text-base"
          style={reveal(6)}
        >
          {t('description')}
        </p>

        {/* Pills activités — aperçu de ce qui arrive (et mots-clés) */}
        <ul
          className="animate-reveal flex flex-wrap items-center justify-center gap-2"
          style={reveal(7)}
        >
          {activities.map((a) => (
            <li key={a.slug}>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.08] px-3.5 py-1.5 text-sm font-medium text-white/85 ring-1 ring-white/15 backdrop-blur">
                <ActivityIcon name={a.icon} className="size-4 text-accent" />
                {a.name[l]}
              </span>
            </li>
          ))}
        </ul>

        {/* CTAs — WhatsApp prioritaire, e-mail, Instagram */}
        <div
          className="animate-reveal mt-2 flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
          style={reveal(8)}
        >
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground shadow-[0_16px_36px_-12px_oklch(0.63_0.187_47/0.8)] transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            <MessageCircle className="size-4" aria-hidden />
            {t('ctaWhatsapp')}
          </a>
          <a
            href={`mailto:${siteConfig.email}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white/15"
          >
            <Mail className="size-4" aria-hidden />
            {t('ctaEmail')}
          </a>
          <a
            href={siteConfig.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <Instagram className="size-4" aria-hidden />
            <span className="hidden sm:inline">Instagram</span>
            <ArrowUpRight className="size-3.5 opacity-70" aria-hidden />
          </a>
        </div>
      </div>

      {/* Pied discret : adresse + copyright (NAP pour le SEO local) */}
      <footer className="relative z-10 border-t border-white/10 px-5 py-5 text-center text-xs text-white/55">
        <p>
          {siteConfig.address.street} · {siteConfig.address.city},{' '}
          {siteConfig.address.postalCode} · Thailand
        </p>
        <p className="mt-1">
          © 2026 {siteConfig.name} — {t('rights')}
        </p>
      </footer>
    </section>
  )
}
