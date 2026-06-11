'use client'

import { ArrowRight, ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'

import { SectionEyebrow } from '@/components/section-eyebrow'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'

type Moment = {
  time: string
  image: string
  title: { en: string; fr: string }
  caption: { en: string; fr: string }
}

/** Récit d'une journée au club — ambiance, pas la liste des activités. */
const MOMENTS: Moment[] = [
  {
    time: '07:30',
    image: '/photos/fitness.jpg',
    title: { en: 'Morning workout', fr: 'Réveil sportif' },
    caption: { en: 'Start the day in motion', fr: 'Commencez la journée en mouvement' },
  },
  {
    time: '12:30',
    image: '/photos/restaurant.jpg',
    title: { en: 'Healthy lunch', fr: 'Déjeuner healthy' },
    caption: { en: 'Fresh plates by the pool', fr: 'Des assiettes fraîches au bord de l’eau' },
  },
  {
    time: '15:00',
    image: '/photos/pool.jpg',
    title: { en: 'Afternoon by the pool', fr: 'Après-midi piscine' },
    caption: { en: 'Swim, sunbathe, repeat', fr: 'Plonger, bronzer, recommencer' },
  },
  {
    time: '18:30',
    image: '/photos/pool-bar.jpg',
    title: { en: 'Sunset drinks', fr: 'Apéro coucher de soleil' },
    caption: { en: 'A drink under the Lamai sky', fr: 'Un verre face au ciel de Lamai' },
  },
  {
    time: '21:00',
    image: '/photos/lounge.jpg',
    title: { en: 'Lounge evenings', fr: 'Soirée lounge' },
    caption: { en: 'Meet the community', fr: 'Se retrouver entre membres' },
  },
  {
    time: 'all day',
    image: '/photos/kids-welcome.jpg',
    title: { en: 'Family time', fr: 'En famille' },
    caption: { en: 'The kids club looks after the little ones', fr: 'Le kids club veille sur les petits' },
  },
]

/** Carrousel d'images simple : défilement auto, flèches, points, pause au survol. */
export function ExperienceGallery() {
  const t = useTranslations('Home.spotlight')
  const locale = useLocale() as Locale
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const count = MOMENTS.length

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + count) % count), [count])

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 5000)
    return () => clearInterval(id)
  }, [paused, count])

  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* En-tête éditorial. */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <SectionEyebrow icon={Clock}>{t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-4 max-w-2xl font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.7rem]">
            {t('title')}
          </h2>
        </div>
        <Link
          href="/a-propos"
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-foreground transition-colors hover:text-accent"
        >
          {t('cta')}
          <span className="flex size-7 items-center justify-center rounded-full ring-1 ring-border transition-colors group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-accent">
            <ArrowRight className="size-3.5" aria-hidden />
          </span>
        </Link>
      </div>

      {/* Carrousel. */}
      <div
        className="group relative mt-10 overflow-hidden rounded-[1.75rem] ring-1 ring-border"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className="flex aspect-[4/3] transition-transform duration-700 ease-out sm:aspect-[16/9]"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {MOMENTS.map((m, i) => (
            <div key={m.title.en} className="relative h-full w-full shrink-0">
              <Image
                src={m.image}
                alt={m.title[locale]}
                fill
                sizes="(min-width:1024px) 72rem, 100vw"
                className="object-cover"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0_0/0.85)] via-transparent to-transparent" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-9">
                <span className="rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] font-medium text-white ring-1 ring-white/20 backdrop-blur">
                  {m.time}
                </span>
                <h3 className="mt-3 font-editorial text-2xl font-medium text-white sm:text-3xl">{m.title[locale]}</h3>
                <p className="mt-1 text-sm text-white/80">{m.caption[locale]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Flèches. */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label={locale === 'fr' ? 'Précédent' : 'Previous'}
          className="absolute left-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white opacity-0 ring-1 ring-white/30 backdrop-blur transition-all hover:bg-white/30 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label={locale === 'fr' ? 'Suivant' : 'Next'}
          className="absolute right-4 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white opacity-0 ring-1 ring-white/30 backdrop-blur transition-all hover:bg-white/30 focus-visible:opacity-100 group-hover:opacity-100"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>

        {/* Points. */}
        <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
          {MOMENTS.map((m, i) => (
            <button
              key={m.title.en}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-6 bg-accent' : 'w-1.5 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>
      </div>
    </section>
  )
}
