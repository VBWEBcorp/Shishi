import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { alternatesFor, siteConfig } from '@/lib/seo'

import { ServicesContent } from './services-content'
import {
  breadcrumbJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { activities, type Locale } from '@/lib/activities'

/*
 * Page carrefour des activités. Elle servait le MÊME titre et la MÊME description
 * anglaise aux deux langues, et déclarait ses sept services en anglais même sur /fr,
 * alors que la page affichée, elle, est bien en français. C'est le défaut que le rapport
 * SEO d'août 2026 pointe pour toute la partie /fr : la page française se présentait à
 * Google avec l'étiquette de la page anglaise.
 */
const TITLE = {
  en: 'Sports Activities in Lamai, Koh Samui',
  fr: 'Nos Activités à Lamai, Koh Samui',
} as const

const DESCRIPTION = {
  en: 'Everything Shi Shi Samui offers in Lamai, Koh Samui: tennis, pickleball, a fitness gym, a healthy restaurant, a kids club, babysitting and a swimming pool.',
  fr: 'Toutes les activités de Shi Shi Samui à Lamai, Koh Samui : tennis, pickleball, salle de fitness, restaurant healthy, kids club, baby-sitting et piscine.',
} as const

const FIL = {
  en: { home: 'Home', here: 'Activities' },
  fr: { home: 'Accueil', here: 'Activités' },
} as const

function langue(locale: string): Locale {
  return locale === 'fr' ? 'fr' : 'en'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = langue(locale)
  return {
    title: { absolute: `${TITLE[l]} | ${siteConfig.name}` },
    description: DESCRIPTION[l],
    alternates: alternatesFor('/services', locale),
    openGraph: {
      title: TITLE[l],
      description: DESCRIPTION[l],
      url: `${siteConfig.url}/${l}/services`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/fitness-portrait.webp', alt: TITLE[l] }],
    },
  }
}

/** Le graphe décrit les sept activités dans la langue de la page, aux bonnes adresses. */
function graphe(l: Locale) {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      webPageJsonLd(TITLE[l], DESCRIPTION[l], '/services', l),
      breadcrumbJsonLd(
        [
          { name: FIL[l].home, path: '/' },
          { name: FIL[l].here, path: '/services' },
        ],
        l
      ),
      ...activities.map((a) =>
        serviceJsonLd(a.h1[l], a.metaDescription[l], a.path, a.image, l)
      ),
    ],
  }
}

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const jsonLd = graphe(langue(locale))

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicesContent />
    </>
  )
}
