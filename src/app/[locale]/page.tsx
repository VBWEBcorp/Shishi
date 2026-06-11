import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { ActivityTiles } from '@/components/sections/activity-tiles'
import { ComingSoon } from '@/components/sections/coming-soon'
import { ExperienceGallery } from '@/components/sections/experience-gallery'
import { FaqSection } from '@/components/sections/faq-section'
import { PhotoShowcase } from '@/components/sections/photo-showcase'
import { ShishiHero } from '@/components/sections/shishi-hero'
import { BookingCta, StorySection, ValuesBand } from '@/components/sections/shishi-home'
import {
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { siteConfig } from '@/lib/seo'

// Titre & description « à la lettre » de l'audit (Accueil), marque incluse.
const title = 'Sports & Social Club in Lamai, Koh Samui | Shi Shi Samui'
const description =
  'Discover Shi Shi Samui, a sports and social club in Lamai with tennis, pickleball, fitness, kids club, healthy food and pool.'

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

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
  keywords,
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: 'website',
    images: [{ url: '/photos/pool.jpg', width: 1200, height: 800, alt: siteConfig.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/photos/pool.jpg'],
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webSiteJsonLd(),
    organizationJsonLd(),
    localBusinessJsonLd(),
    webPageJsonLd(siteConfig.name, description, '/'),
  ],
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // En dev local : afficher le vrai site complet pour pouvoir le modifier.
  // En prod : garder la landing « Coming Soon » (indexation requête de marque).
  if (process.env.NODE_ENV === 'development') {
    return (
      <>
        <ShishiHero />
        <ActivityTiles />
        <ExperienceGallery />
        <ValuesBand />
        <StorySection />
        <FaqSection />
        <PhotoShowcase />
        <BookingCta />
      </>
    )
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ComingSoon />
    </>
  )
}
