import type { Metadata } from 'next'

import { ServicesContent } from './services-content'
import {
  breadcrumbJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { activities } from '@/lib/activities'

const description =
  'Discover everything Shi Shi Samui offers in Lamai, Koh Samui: tennis, pickleball, a premium fitness gym, a healthy restaurant, a kids club and a pool.'

export const metadata: Metadata = {
  title: 'Sports & Wellness Activities in Lamai',
  description,
  alternates: { canonical: '/services' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd('Activities at Shi Shi Samui', description, '/services'),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Activities', path: '/services' },
    ]),
    ...activities.map((a) =>
      serviceJsonLd(a.h1.en, a.metaDescription.en, a.path, a.image)
    ),
  ],
}

export default function ServicesPage() {
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
