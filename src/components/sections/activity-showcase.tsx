'use client'

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRef } from 'react'

import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities, type Activity } from '@/lib/activities'
import { getActivityPrice, OPENING_HOURS } from '@/lib/booking-pricing'

/**
 * Showcase activités « à la traavellio » (réf. Most Loved Destinations) :
 *  · image en fond plein écran (douce), qui change avec l'activité active ;
 *  · le NOM de l'activité répété en bande défilante, en bas ;
 *  · un PAQUET de cartes compactes empilées au centre : au scroll, la carte de
 *    devant part en tournant et la suivante se cale (effet « on feuillette »).
 *
 * Le scroll pilote une position continue `pos = p·(n-1)` ; chaque carte calcule
 * son décalage `off = i − pos` et en déduit rotation / position / opacité.
 */
export function ActivityShowcase() {
  const t = useTranslations('Home.tiles')
  const locale = useLocale() as Locale
  const reduce = useReducedMotion()

  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  const total = activities.length

  function chip(slug: string): string | null {
    const price = getActivityPrice(slug)
    if (price > 0) return `${t('from')} ${price} ฿`
    return OPENING_HOURS[slug]?.[locale] ?? null
  }

  if (reduce) {
    return (
      <section id="activities" className="bg-foreground py-20 lg:py-24">
        <Eyebrow t={t} />
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 px-4 sm:grid-cols-2 sm:px-6 lg:px-8">
          {activities.map((a) => (
            <StaticCard key={a.slug} activity={a} locale={locale} t={t} chip={chip(a.slug)} />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section id="activities">
      <div ref={trackRef} style={{ height: `${total * 80}vh` }} className="relative">
        <div className="sticky top-0 h-dvh overflow-hidden bg-foreground">
          {/* Fonds plein écran qui se croisent. */}
          {activities.map((a, i) => (
            <Background key={a.slug} activity={a} index={i} total={total} progress={scrollYProgress} locale={locale} />
          ))}
          <div className="absolute inset-0 bg-[oklch(0.14_0.02_55/0.5)]" aria-hidden />

          {/* Bandes de noms (une par activité, visible quand active). */}
          {activities.map((a, i) => (
            <NameBand key={a.slug} activity={a} index={i} total={total} progress={scrollYProgress} locale={locale} />
          ))}

          {/* Carte centrale (une seule visible, fondu enchaîné). */}
          <div className="absolute inset-0 flex items-center justify-center px-4">
            <div className="relative h-[22rem] w-[17rem] sm:h-[24rem] sm:w-[19rem]">
              {activities.map((a, i) => (
                <Card
                  key={a.slug}
                  activity={a}
                  index={i}
                  total={total}
                  progress={scrollYProgress}
                  locale={locale}
                  t={t}
                  chip={chip(a.slug)}
                />
              ))}
            </div>
          </div>

          {/* Eyebrow haut + progression bas. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-40 pt-8 sm:pt-10">
            <Eyebrow t={t} />
          </div>
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="absolute inset-x-0 bottom-0 z-40 h-[3px] origin-left bg-accent"
            aria-hidden
          />
        </div>
      </div>
    </section>
  )
}

function Eyebrow({ t }: { t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
      <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t('eyebrow')}</span>
      <h2 className="mt-3 font-editorial text-[1.7rem] font-normal leading-[1.1] tracking-[-0.01em] text-white sm:text-[2.2rem]">
        {t('title')}
      </h2>
    </div>
  )
}

type LayerProps = {
  activity: Activity
  index: number
  total: number
  progress: MotionValue<number>
  locale: Locale
}

/** Fond plein écran ; visible quand son activité est (presque) active. */
function Background({ activity: a, index: i, total, progress, locale }: LayerProps) {
  const opacity = useTransform(progress, (p) => {
    const off = i - p * (total - 1)
    return Math.max(0, 1 - Math.abs(off)) // fondu croisé avec les voisines
  })
  const scale = useTransform(progress, (p) => {
    const off = i - p * (total - 1)
    return 1.12 - Math.max(0, 1 - Math.abs(off)) * 0.08
  })
  return (
    <motion.div style={{ opacity }} className="absolute inset-0">
      <motion.div style={{ scale }} className="absolute inset-0">
        <Image src={a.image} alt={a.name[locale]} fill sizes="100vw" className="object-cover" priority={i < 2} />
      </motion.div>
    </motion.div>
  )
}

/** Nom répété qui défile, en bas ; visible seulement pour l'activité active. */
function NameBand({ activity: a, index: i, total, progress, locale }: LayerProps) {
  const opacity = useTransform(progress, (p) => {
    const off = i - p * (total - 1)
    return Math.max(0, 1 - Math.abs(off) * 1.9)
  })
  const name = a.name[locale]
  return (
    <motion.div
      style={{ opacity }}
      className="pointer-events-none absolute inset-x-0 bottom-[7vh] overflow-hidden"
      aria-hidden
    >
      <div className="flex w-max animate-marquee-band whitespace-nowrap">
        {[0, 1].map((copy) => (
          <span key={copy} className="flex shrink-0">
            {Array.from({ length: 6 }).map((_, k) => (
              <span key={k} className="px-6 font-editorial text-[8vw] font-medium leading-none text-white/85">
                {name}
              </span>
            ))}
          </span>
        ))}
      </div>
    </motion.div>
  )
}

type CardProps = LayerProps & {
  t: ReturnType<typeof useTranslations>
  chip: string | null
}

/** Carte simple : fondu enchaîné + léger glissement vertical, une seule visible. */
function Card({ activity: a, index: i, total, progress, locale, t, chip }: CardProps) {
  // off = i − pos : 0 = active, >0 = à venir (vient du bas), <0 = passée (part en haut).
  const opacity = useTransform(progress, (p) => {
    const off = i - p * (total - 1)
    return Math.max(0, 1 - Math.abs(off) * 1.7)
  })
  const y = useTransform(progress, (p) => {
    const off = i - p * (total - 1)
    return `${Math.max(-1, Math.min(1, off)) * 9}%`
  })
  const zIndex = useTransform(progress, (p) => Math.round(50 - Math.abs(i - p * (total - 1)) * 10))

  return (
    <motion.div
      style={{ opacity, y, zIndex }}
      className="absolute inset-0 overflow-hidden rounded-[1.5rem] border border-white/15 shadow-[0_40px_90px_-35px_oklch(0_0_0/0.75)]"
    >
      <Image src={a.image} alt={a.name[locale]} fill sizes="20rem" className="object-cover" priority={i < 2} />
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.02_55/0.92)] via-[oklch(0.12_0.02_55/0.2)] to-transparent" aria-hidden />

      <Link
        href={`/activities/${a.slug}`}
        aria-label={a.name[locale]}
        className="absolute right-3.5 top-3.5 z-10 flex size-9 items-center justify-center rounded-full bg-white/20 text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground hover:ring-accent"
      >
        <ArrowUpRight className="size-4" aria-hidden />
      </Link>

      {chip && (
        <span className="absolute left-3.5 top-3.5 rounded-full bg-ocean/85 px-3 py-1 text-xs font-semibold text-ocean-foreground ring-1 ring-white/15">
          {chip}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-editorial text-2xl font-medium text-white">{a.name[locale]}</h3>
        <p className="mt-1 text-sm leading-snug text-white/75">{a.tagline[locale]}</p>
        <span className="mt-2.5 inline-block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
          {a.slug === 'restaurant' ? t('discover') : t('book')}
        </span>
      </div>
    </motion.div>
  )
}

/** Carte compacte statique — repli reduced-motion. */
function StaticCard({
  activity: a,
  locale,
  t,
  chip,
}: {
  activity: Activity
  locale: Locale
  t: ReturnType<typeof useTranslations>
  chip: string | null
}) {
  return (
    <Link
      href={`/activities/${a.slug}`}
      className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-[1.5rem] ring-1 ring-white/10"
    >
      <Image src={a.image} alt={a.name[locale]} fill sizes="(min-width:640px) 40rem, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.05]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0.02_55/0.9)] to-transparent" aria-hidden />
      {chip && (
        <span className="absolute right-4 top-4 rounded-full bg-ocean/85 px-3 py-1 text-xs font-semibold text-ocean-foreground">{chip}</span>
      )}
      <div className="relative p-5">
        <h3 className="font-editorial text-2xl font-medium text-white">{a.name[locale]}</h3>
        <p className="mt-1 text-sm text-white/75">{a.tagline[locale]}</p>
      </div>
    </Link>
  )
}
