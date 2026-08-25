import type { Metadata } from 'next'
import { alternatesFor } from '@/lib/seo'

import { AboutContent } from './about-content'
import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'

const description =
  'Shi Shi Samui, a premium social club resort in Lamai, Koh Samui. Sport, wellness and good company in one place in South Samui.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: 'About',
    description,
    alternates: alternatesFor('/a-propos', locale),
  }
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
