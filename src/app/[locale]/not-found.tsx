'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CalendarCheck, Home } from 'lucide-react'
import { useLocale } from 'next-intl'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

/** Étoiles fixes (positions déterministes → pas de mismatch d'hydratation). */
const STARS = [
  { top: '12%', left: '14%', size: 2, delay: 0 },
  { top: '20%', left: '78%', size: 3, delay: 0.6 },
  { top: '32%', left: '32%', size: 2, delay: 1.2 },
  { top: '16%', left: '54%', size: 2, delay: 0.3 },
  { top: '44%', left: '86%', size: 2, delay: 0.9 },
  { top: '52%', left: '8%', size: 3, delay: 1.5 },
  { top: '26%', left: '92%', size: 2, delay: 0.4 },
  { top: '60%', left: '70%', size: 2, delay: 1.1 },
  { top: '10%', left: '38%', size: 2, delay: 1.8 },
  { top: '38%', left: '62%', size: 2, delay: 0.7 },
]

const COPY = {
  fr: {
    eyebrow: 'Erreur 404',
    title: 'Cette page a pris l’air',
    text: 'Notre drone a survolé tout Lamai, scanné les courts, la piscine et même le bar à smoothies… toujours rien. La page que vous cherchez s’est envolée.',
    bubble: '404… toujours rien',
    home: 'Retour à l’accueil',
    book: 'Réserver une activité',
  },
  en: {
    eyebrow: 'Error 404',
    title: 'This page flew away',
    text: 'Our drone scanned every court, the pool and even the smoothie bar across Lamai… still nothing. The page you’re looking for has taken off.',
    bubble: '404… still nothing',
    home: 'Back to home',
    book: 'Book an activity',
  },
} as const

export default function NotFound() {
  const locale = useLocale() as Locale
  const t = COPY[locale] ?? COPY.en

  return (
    <section className="relative isolate flex min-h-[88vh] flex-col items-center justify-center overflow-hidden bg-[oklch(0.17_0.01_60)] px-4 py-24 text-center">
      {/* Ciel nocturne — dégradés superposés (lueur orange + fondu bas) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(120%_80%_at_50%_-10%,oklch(0.63_0.187_47/0.18),transparent_55%),linear-gradient(to_bottom,oklch(0.17_0.01_60),oklch(0.13_0.005_60))]"
      />

      {/* Étoiles scintillantes */}
      {STARS.map((s, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute rounded-full bg-white/80"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size }}
          animate={{ opacity: [0.15, 0.9, 0.15], scale: [0.8, 1.15, 0.8] }}
          transition={{ duration: 2.6, repeat: Infinity, delay: s.delay, ease: 'easeInOut' }}
        />
      ))}

      {/* Silhouettes de palmiers (ambiance Koh Samui) */}
      <svg aria-hidden className="absolute bottom-0 left-2 h-28 w-28 text-black/40 sm:h-36 sm:w-36" viewBox="0 0 100 100" fill="currentColor">
        <path d="M48 100c-1-22-3-40-6-52 8-3 16-2 22 3-7-3-15-2-20 2 6-9 16-13 26-11-9-1-19 3-24 10 4-11 14-18 25-18-11-2-23 4-28 15 0-10 6-19 16-24-12 2-21 12-22 24-2-4-6-7-11-7 4 2 7 6 7 11-3 12-2 30-2 52z" />
      </svg>
      <svg aria-hidden className="absolute bottom-0 right-3 h-24 w-24 -scale-x-100 text-black/35 sm:h-32 sm:w-32" viewBox="0 0 100 100" fill="currentColor">
        <path d="M48 100c-1-22-3-40-6-52 8-3 16-2 22 3-7-3-15-2-20 2 6-9 16-13 26-11-9-1-19 3-24 10 4-11 14-18 25-18-11-2-23 4-28 15 0-10 6-19 16-24-12 2-21 12-22 24-2-4-6-7-11-7 4 2 7 6 7 11-3 12-2 30-2 52z" />
      </svg>

      {/* ——— LE DRONE QUI CHERCHE ——— */}
      <motion.div
        className="relative mb-2 h-[200px] w-[300px] sm:h-[240px] sm:w-[360px]"
        animate={{ y: [0, -14, 0], rotate: [-1.6, 1.6, -1.6] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Faisceau de recherche — balaie de gauche à droite */}
        <motion.div
          aria-hidden
          className="absolute left-1/2 top-[57%] -z-10 h-[280px] w-[230px] -translate-x-1/2 mix-blend-screen blur-[2px]"
          style={{
            transformOrigin: 'top center',
            clipPath: 'polygon(45% 0, 55% 0, 100% 100%, 0% 100%)',
            background:
              'linear-gradient(to bottom, oklch(0.72 0.17 55 / 0.42), oklch(0.72 0.17 55 / 0.06) 70%, transparent)',
          }}
          animate={{ rotate: [-14, 14, -14] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Corps du drone */}
        <svg viewBox="0 0 300 200" className="absolute inset-0 h-full w-full drop-shadow-[0_18px_24px_oklch(0.1_0_0/0.6)]">
          {/* Bras (X) */}
          <g stroke="oklch(0.4 0.02 60)" strokeWidth="9" strokeLinecap="round">
            <line x1="150" y1="104" x2="62" y2="60" />
            <line x1="150" y1="104" x2="238" y2="60" />
            <line x1="150" y1="104" x2="62" y2="150" />
            <line x1="150" y1="104" x2="238" y2="150" />
          </g>

          {/* Rotors — disque de flou + hélices en rotation rapide */}
          {[
            { x: 62, y: 60 },
            { x: 238, y: 60 },
            { x: 62, y: 150 },
            { x: 238, y: 150 },
          ].map((r, i) => (
            <g key={i}>
              <ellipse cx={r.x} cy={r.y} rx="34" ry="11" fill="oklch(1 0 0 / 0.06)" />
              <motion.g
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.32, repeat: Infinity, ease: 'linear' }}
              >
                <ellipse cx={r.x} cy={r.y} rx="32" ry="5" fill="oklch(0.85 0.02 60 / 0.55)" />
                <ellipse cx={r.x} cy={r.y} rx="5" ry="32" fill="oklch(0.85 0.02 60 / 0.35)" />
                <circle cx={r.x} cy={r.y} r="4" fill="oklch(0.63 0.187 47)" />
              </motion.g>
            </g>
          ))}

          {/* Châssis central */}
          <rect x="112" y="80" width="76" height="40" rx="18" fill="oklch(0.26 0.01 60)" stroke="oklch(1 0 0 / 0.16)" strokeWidth="2" />
          <rect x="124" y="88" width="52" height="13" rx="6" fill="oklch(0.63 0.187 47)" />

          {/* Caméra / nacelle + objectif */}
          <circle cx="150" cy="122" r="13" fill="oklch(0.2 0.01 60)" stroke="oklch(1 0 0 / 0.18)" strokeWidth="2" />
          <circle cx="150" cy="124" r="5.5" fill="oklch(0.78 0.17 55)" />

          {/* Feu de navigation clignotant */}
          <motion.circle
            cx="150" cy="78" r="3.5" fill="oklch(0.7 0.2 25)"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Petite balle de tennis suspendue (clin d'œil club) */}
          <line x1="150" y1="134" x2="150" y2="156" stroke="oklch(1 0 0 / 0.25)" strokeWidth="1.5" />
          <circle cx="150" cy="164" r="8" fill="oklch(0.86 0.19 120)" />
          <path d="M143 161a10 10 0 0 1 14 0M143 167a10 10 0 0 0 14 0" stroke="oklch(1 0 0 / 0.7)" strokeWidth="1" fill="none" />
        </svg>

        {/* Bulle « recherche en cours » */}
        <motion.div
          className="absolute -right-1 top-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur-sm sm:-right-4"
          animate={{ y: [0, -3, 0], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {t.bubble}
        </motion.div>
      </motion.div>

      {/* ——— TEXTE ——— */}
      <span className="text-xs font-semibold uppercase tracking-[0.32em] text-accent">{t.eyebrow}</span>
      <h1 className="mt-3 font-display text-[5.5rem] leading-none tracking-tight text-white sm:text-[8rem]">
        4<span className="text-accent">0</span>4
      </h1>
      <h2 className="mt-2 font-display text-2xl text-white sm:text-3xl">{t.title}</h2>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 sm:text-base">{t.text}</p>

      {/* ——— CTA ——— */}
      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground shadow-[0_12px_34px_-10px_oklch(0.63_0.187_47/0.7)] transition-all hover:brightness-105"
        >
          <Home className="size-4" aria-hidden />
          {t.home}
        </Link>
        <Link
          href="/book-now"
          className="group inline-flex h-12 items-center gap-2 rounded-full px-7 text-sm font-semibold text-white ring-1 ring-white/20 transition-colors hover:bg-white/10"
        >
          <CalendarCheck className="size-4" aria-hidden />
          {t.book}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
    </section>
  )
}
