import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { setRequestLocale } from 'next-intl/server'

import { ActivityTiles } from '@/components/sections/activity-tiles'
import { ComingSoon } from '@/components/sections/coming-soon'
import { ExperienceGallery } from '@/components/sections/experience-gallery'
import { FaqSection } from '@/components/sections/faq-section'
import { PhotoShowcase } from '@/components/sections/photo-showcase'
import { ShishiHero } from '@/components/sections/shishi-hero'
import { StorySection, ValuesBand } from '@/components/sections/shishi-home'
import { TestimonialsSection } from '@/components/sections/testimonials-section'
import { Reveal } from '@/components/reveal'
import {
  faqJsonLd,
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { homeFaqEntries } from '@/lib/home-faq'
import { LAUNCHED, PREVIEW_CODE, PREVIEW_COOKIE } from '@/lib/launch'
import { alternatesFor, siteConfig } from '@/lib/seo'

/*
 * Titre & description « à la lettre » de l'audit (Accueil), marque incluse — DANS LES DEUX
 * LANGUES. La version française servait jusqu'ici le titre anglais : le H1 de /fr était bien en
 * français, mais la balise <title>, c'est-à-dire la ligne que Google affiche et sur laquelle on
 * clique, restait « Sports & Social Club in Lamai, Koh Samui ». Le texte français n'est pas la
 * traduction mot à mot de l'anglais : il vise les tournures réellement tapées en français.
 */
const TITLE = {
  en: 'Sports & Social Club in Lamai, Koh Samui | Shi Shi Samui',
  fr: 'Club de Sport à Lamai, Koh Samui | Shi Shi Samui',
} as const

const DESCRIPTION = {
  en: 'Discover Shi Shi Samui, a sports and social club in Lamai with tennis, pickleball, fitness, kids club, healthy food and pool.',
  fr: 'Club de sport et de loisirs à Lamai, Koh Samui : tennis, pickleball, salle de sport, piscine, kids club et restaurant healthy. Ouvert à tous, résidents comme voyageurs.',
} as const

// Mots-clés principaux + complémentaires (audit Accueil).
const keywords = [
  'shi shi samui',
  'sports club lamai',
  'sports club koh samui',
  'social club lamai',
  'social club koh samui',
  'sports complex koh samui',
  'multisport club koh samui',
  'club resort koh samui',
  'wellness club koh samui',
  'expat club koh samui',
  'digital nomad club koh samui',
  'tennis pickleball fitness lamai',
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = locale === 'fr' ? 'fr' : 'en'
  const title = TITLE[l]
  const description = DESCRIPTION[l]
  return {
    title: {
      absolute: title,
    },
    description,
    keywords,
    alternates: alternatesFor('/', locale),
    openGraph: {
      title,
      description,
      url: siteConfig.url,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/pool-panorama-portrait.webp', width: 1200, height: 800, alt: siteConfig.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/photos/pool-panorama-portrait.webp'],
    },
  }
}

/* Le JSON-LD suit la langue de la page : décrire en anglais une page française reviendrait à
   donner aux moteurs une description qui ne correspond pas au texte affiché. */
const graphePour = (l: 'en' | 'fr') => ({
  '@context': 'https://schema.org',
  '@graph': [
    webSiteJsonLd(),
    organizationJsonLd(),
    localBusinessJsonLd(),
    webPageJsonLd(TITLE[l], DESCRIPTION[l], '/', l),
    // La FAQ de l'accueil est affichée depuis toujours, mais n'était déclarée nulle part.
    // C'est le premier geste GEO demandé par le rapport d'août 2026 (§7) : donner des
    // réponses directes. Une question posée à un moteur d'IA (faut-il être membre, peut-on
    // louer une raquette, où est le club) trouve maintenant la réponse du club, dans la
    // langue de la page, au lieu d'une page à interpréter.
    faqJsonLd(homeFaqEntries(l)),
  ],
})

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // Site complet si : dev local, OU site lancé (LAUNCHED), OU visiteur muni du
  // cookie d'aperçu (a saisi le code). Sinon : façade « Coming Soon ».
  // Le JSON-LD (LocalBusiness + SportsActivityLocation + Organization + WebSite
  // + WebPage) est rendu dans les deux cas — exigé par l'audit SEO (§3).
  const cookieStore = await cookies()
  const hasPreview = cookieStore.get(PREVIEW_COOKIE)?.value === PREVIEW_CODE
  const fullSite = process.env.NODE_ENV === 'development' || LAUNCHED || hasPreview

  const jsonLd = graphePour(locale === 'fr' ? 'fr' : 'en')

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {fullSite ? (
        <>
          <ShishiHero />
          <Reveal><ActivityTiles /></Reveal>
          {/* Avis Google remontés (cahier des charges : preuve sociale visible rapidement). */}
          <Reveal><TestimonialsSection /></Reveal>
          <Reveal><ExperienceGallery /></Reveal>
          <Reveal><ValuesBand /></Reveal>
          <Reveal><StorySection /></Reveal>
          <FaqSection />
          <Reveal><PhotoShowcase /></Reveal>
        </>
      ) : (
        <ComingSoon />
      )}
    </>
  )
}
