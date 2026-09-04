import type { Metadata } from 'next'
import { alternatesFor, siteConfig } from '@/lib/seo'

import { AboutContent } from './about-content'
import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'

/*
 * La page servait un titre et une description anglaise aux DEUX langues : sur /fr, Google
 * lisait « About » et un texte anglais au-dessus d'une page française. Même correction que
 * partout ailleurs sur le site : la ligne cliquable est dans la langue de la page.
 */
const TITLE = {
  en: 'About Shi Shi Samui, Sports & Social Club in Lamai',
  fr: 'À propos de Shi Shi Samui, Club de Sport à Lamai',
} as const

const DESCRIPTION = {
  en: 'Shi Shi Samui, a sports and social club in Lamai, Koh Samui: tennis, pickleball, fitness, pool, kids club and a healthy restaurant, all on one site in South Samui.',
  fr: 'Shi Shi Samui, club de sport et de loisirs à Lamai, Koh Samui : tennis, pickleball, fitness, piscine, kids club et restaurant healthy, réunis au sud de Samui.',
} as const

/** Repli anglais, conservé pour les données structurées qui n'ont pas la langue sous la main. */
const description = DESCRIPTION.en

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = locale === 'fr' ? 'fr' : 'en'
  return {
    // TITLE porte déjà le nom du club : pas de suffixe de marque, sinon la ligne
    // cliquable répète « Shi Shi Samui » deux fois.
    title: { absolute: TITLE[l] },
    description: DESCRIPTION[l],
    alternates: alternatesFor('/a-propos', locale),
    openGraph: {
      title: TITLE[l],
      description: DESCRIPTION[l],
      url: `${siteConfig.url}/${l}/a-propos`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/tennis-court-portrait.webp', alt: TITLE[l] }],
    },
  }
}

/** Le graphe suit la langue de la page : mêmes URL que celles réellement servies. */
function graphe(locale: string) {
  const fr = locale === 'fr'
  return {
    '@context': 'https://schema.org',
    '@graph': [
      webPageJsonLd(TITLE[fr ? 'fr' : 'en'], DESCRIPTION[fr ? 'fr' : 'en'], '/a-propos', locale),
      breadcrumbJsonLd(
        [
          { name: fr ? 'Accueil' : 'Home', path: '/' },
          { name: fr ? 'À propos' : 'About', path: '/a-propos' },
        ],
        locale
      ),
    ],
  }
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const jsonLd = graphe(locale)
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AboutContent />
    </>
  )
}
