import type { Metadata } from 'next'

import { AboutContent } from './about-content'
import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'

const description =
  'Shi Shi Samui, a premium social club resort in Lamai, Koh Samui. Discover the story of two young French founders building the reference for sport and lifestyle in South Samui.'

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: '/a-propos' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webPageJsonLd('About', description, '/a-propos'),
    breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'About', path: '/a-propos' },
    ]),
  ],
}

export default function AboutPage() {
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
