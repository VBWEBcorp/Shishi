import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { ComingSoon } from '@/components/sections/coming-soon'
import {
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { siteConfig } from '@/lib/seo'

// Titre optimisé pour la requête de marque « Shi Shi Samui / shishi samui ».
const title = 'Shi Shi Samui — Premium Social Club Resort · Lamai, Koh Samui'
const description =
  'Shi Shi Samui, the premium social club resort opening soon in Lamai, Koh Samui. Tennis, pickleball, fitness, healthy restaurant, kids club and pool. Get in touch on WhatsApp.'

export const metadata: Metadata = {
  title: {
    absolute: title,
  },
  description,
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
