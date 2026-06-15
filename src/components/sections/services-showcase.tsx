'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, LayoutGrid, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { Link } from '@/i18n/navigation'
import { activities } from '@/lib/activities'
import type { Locale } from '@/lib/activities'

const ease = [0.22, 1, 0.36, 1] as const

/**
 * Bloc de maillage interne « nos services » (hors page d'accueil).
 *
 * Design : image à gauche, liste des pôles à droite (icône + nom + accroche).
 * Au survol/focus d'un service, son image se balaye de droite à gauche.
 * Chaque ligne est un vrai lien vers la page service → maillage interne
 * crawlable (stratégie SEO), le clic ouvre directement la page.
 */
export function ServicesShowcase({
  locale,
  eyebrow,
  title,
  description,
  excludeSlug,
  icon: Icon = LayoutGrid,
}: {
  locale: Locale
  eyebrow?: string
  title?: string
  description?: string
  /** Masque ce pôle (ex. la page service en cours). */
  excludeSlug?: string
  icon?: LucideIcon
}) {
  const list = activities.filter((a) => a.slug !== excludeSlug)
  const [activeSlug, setActiveSlug] = useState(list[0]?.slug)
  const reduceMotion = useReducedMotion()

  const active = list.find((a) => a.slug === activeSlug) ?? list[0]
  if (!active) return null

  const ey = eyebrow ?? (locale === 'fr' ? 'Le complexe' : 'The club')
  const heading =
    title ?? (locale === 'fr' ? 'Tous nos pôles' : 'Everything we offer')

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow icon={Icon}>{ey}</SectionEyebrow>
          <h2 className="mt-5 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.6rem]">
            {heading}
          </h2>
          {description && (
            <p className="mt-4 text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-2 lg:gap-10">
          {/* Image — balayage droite → gauche au changement de service */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-border/70 shadow-[0_24px_60px_-30px_oklch(0.18_0_0/0.4)] lg:aspect-auto lg:min-h-[26rem]">
            <AnimatePresence initial={false}>
              <motion.div
                key={active.slug}
                className="absolute inset-0"
                initial={reduceMotion ? { opacity: 0 } : { x: '100%' }}
                animate={reduceMotion ? { opacity: 1 } : { x: '0%' }}
                exit={reduceMotion ? { opacity: 0 } : { x: '-100%' }}
                transition={{ duration: 0.55, ease }}
              >
                <Image
                  src={active.image}
                  alt={active.altImages[0] ?? active.name[locale]}
                  fill
                  sizes="(min-width:1024px) 45vw, 100vw"
                  className="object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/55 via-transparent to-transparent"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
                  <span className="font-editorial text-2xl font-medium text-white drop-shadow-sm">
                    {active.name[locale]}
                  </span>
                  <span className="mt-1 block max-w-sm text-sm text-white/85">
                    {active.tagline[locale]}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Liste des pôles — chaque ligne = lien crawlable */}
          <ul className="flex flex-col justify-center divide-y divide-border/70 overflow-hidden rounded-3xl border border-border/70 bg-card">
            {list.map((s) => {
              const isActive = s.slug === active.slug
              return (
                <li key={s.slug}>
                  <Link
                    href={s.path}
                    onMouseEnter={() => setActiveSlug(s.slug)}
                    onFocus={() => setActiveSlug(s.slug)}
                    className={`group flex items-center gap-4 px-5 py-5 transition-colors sm:px-6 ${
                      isActive ? 'bg-accent/[0.06]' : 'hover:bg-foreground/[0.03]'
                    }`}
                  >
                    <span
                      className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1 transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent ring-accent/25'
                          : 'bg-foreground/[0.04] text-foreground ring-border'
                      }`}
                    >
                      <ActivityIcon name={s.icon} className="size-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block font-editorial text-lg font-medium transition-colors ${
                          isActive ? 'text-accent' : 'text-foreground'
                        }`}
                      >
                        {s.name[locale]}
                      </span>
                      <span className="mt-0.5 block truncate text-sm leading-relaxed text-muted-foreground">
                        {s.tagline[locale]}
                      </span>
                    </span>
                    <ArrowRight
                      className={`size-4 shrink-0 transition-all ${
                        isActive
                          ? 'translate-x-0.5 text-accent'
                          : 'text-muted-foreground/50 group-hover:text-accent'
                      }`}
                      aria-hidden
                    />
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
