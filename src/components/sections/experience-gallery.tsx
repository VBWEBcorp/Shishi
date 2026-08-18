'use client'

import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { CtaButton } from '@/components/cta-button'
import { SectionEyebrow } from '@/components/section-eyebrow'
import type { Locale } from '@/i18n/routing'

type Moment = {
  time: string
  image: string
  title: { en: string; fr: string }
  caption: { en: string; fr: string }
}

const ease = [0.22, 1, 0.36, 1] as const

/** Récit d'une journée au club — ambiance, pas la liste des activités. */
const MOMENTS: Moment[] = [
  {
    time: '07:30',
    image: '/photos/fitness-portrait.webp',
    title: { en: 'Morning workout', fr: 'Réveil sportif' },
    caption: {
      en: 'Start the day in motion in a fully-equipped fitness space.',
      fr: 'Commencez la journée en mouvement dans un espace fitness complet.',
    },
  },
  {
    time: '12:30',
    image: '/photos/restaurant.jpg',
    title: { en: 'Healthy lunch', fr: 'Déjeuner healthy' },
    caption: {
      en: 'Fresh, feel-good plates and smoothies right by the pool.',
      fr: 'Des assiettes fraîches et des smoothies feel-good au bord de l’eau.',
    },
  },
  {
    time: '15:00',
    image: '/photos/pool-panorama-portrait.webp',
    title: { en: 'Afternoon by the pool', fr: 'Après-midi piscine' },
    caption: {
      en: 'Swim, sunbathe and unwind at the heart of the resort.',
      fr: 'Plonger, bronzer et se détendre au cœur du resort.',
    },
  },
  {
    time: '18:30',
    image: '/photos/pool-sala-portrait.webp',
    title: { en: 'Sunset drinks', fr: 'Apéro coucher de soleil' },
    caption: {
      en: 'A drink under the Lamai sky as the day winds down.',
      fr: 'Un verre face au ciel de Lamai pour finir la journée.',
    },
  },
]

/** Grille décalée façon « éditorial » : colonnes alternées image / texte. */
export function ExperienceGallery() {
  const t = useTranslations('Home.spotlight')
  const locale = useLocale() as Locale

  const more =
    locale === 'fr'
      ? 'Et bien plus encore vous attend sur place'
      : 'And there’s plenty more waiting for you on site'

  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* En-tête centré. */}
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={Clock}>{t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-4 font-editorial text-[2rem] font-normal leading-[1.08] tracking-[-0.01em] text-foreground sm:text-[2.7rem]">
            {t('title')}
          </h2>
        </div>

        {/* Grille décalée : colonnes 2 & 4 ont le texte au-dessus de l'image. */}
        <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-8 sm:mt-14 sm:gap-x-6 sm:gap-y-12 lg:mt-16 lg:grid-cols-4 lg:gap-x-8">
          {MOMENTS.map((m, i) => {
            const textFirst = i % 2 === 1 // colonnes 2 & 4
            return (
              <motion.article
                key={m.title.en}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, ease, delay: Math.min(i, 4) * 0.08 }}
                className="group flex flex-col gap-3 sm:gap-5"
              >
                <figure className={textFirst ? 'sm:order-2' : ''}>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted sm:rounded-[1.5rem]">
                    <Image
                      src={m.image}
                      alt={m.title[locale]}
                      fill
                      sizes="(min-width:1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                      priority={i === 0}
                    />
                  </div>
                </figure>

                <figcaption className={textFirst ? 'sm:order-1' : ''}>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent sm:text-xs">
                    {m.time}
                  </span>
                  <h3 className="mt-1 font-display text-base leading-snug text-foreground sm:mt-1.5 sm:text-2xl">
                    {m.title[locale]}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2 sm:mt-2 sm:text-sm sm:line-clamp-none">
                    {m.caption[locale]}
                  </p>
                </figcaption>
              </motion.article>
            )
          })}
        </div>

        {/* Pied de section : invitation — filet — bouton pilule. */}
        <div className="mt-16 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
          <p className="text-sm text-muted-foreground">{more}</p>
          <span className="hidden h-px flex-1 bg-border sm:block" aria-hidden />
          {/* Même bouton que « En savoir plus sur Shi Shi » (CtaButton) :
              forme + animation gooey strictement identiques. */}
          <CtaButton href="/a-propos" tone="dark" size="sm" className="shrink-0">
            {t('cta')}
          </CtaButton>
        </div>
      </div>
    </section>
  )
}
