'use client'

import { HelpCircle } from 'lucide-react'
import { useLocale } from 'next-intl'

import { FaqAccordion } from '@/components/faq-accordion'
import { SectionEyebrow } from '@/components/section-eyebrow'
import type { Locale } from '@/i18n/routing'

import { HOME_FAQ, type Bilingue } from '@/lib/home-faq'

const EYEBROW: Bilingue = { en: 'Frequently asked questions', fr: 'Questions fréquentes' }
const TITLE: Bilingue = {
  en: 'Everything you need to know before you visit',
  fr: 'Tout ce qu’il faut savoir avant de venir',
}

// Les questions vivent dans src/lib/home-faq.ts : la page d’accueil les déclare aussi en
// JSON-LD (FAQPage), et une réponse modifiée ici l’est donc au même instant pour Google
// et pour les moteurs d’IA. Sans cette source commune, les deux finissent par diverger.
const ITEMS = HOME_FAQ

/** FAQ deux colonnes, accordéon animé « Framer » (cf. FaqAccordion). */
export function FaqSection() {
  const locale = useLocale() as Locale

  const half = Math.ceil(ITEMS.length / 2)
  const columns = [ITEMS.slice(0, half), ITEMS.slice(half)]

  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* En-tête centré. */}
        <div className="flex flex-col items-center text-center">
          <SectionEyebrow icon={HelpCircle}>{EYEBROW[locale]}</SectionEyebrow>
          <h2 className="mt-4 max-w-2xl font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.7rem]">
            {TITLE[locale]}
          </h2>
        </div>

        {/* Deux colonnes d'accordéons animés. */}
        <div className="mx-auto mt-12 grid max-w-5xl items-start gap-4 md:grid-cols-2 md:gap-5">
          {columns.map((col, c) => (
            <FaqAccordion
              key={c}
              startIndex={c}
              items={col.map((item) => ({ q: item.q[locale], a: item.a[locale] }))}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
