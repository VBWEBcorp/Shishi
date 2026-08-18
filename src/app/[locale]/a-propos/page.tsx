import type { Metadata } from 'next'

import { AboutContent } from './about-content'
import { breadcrumbJsonLd, webPageJsonLd } from '@/components/seo/json-ld'

const description =
  'Shi Shi Samui, a premium social club resort in Lamai, Koh Samui. Sport, wellness and good company in one place in South Samui.'

export const metadata: Metadata = {
  title: 'About',
  description,
  alternates: { canonical: '/a-propos' },
  // MASQUAGE TEMPORAIRE (18/08/2026) — en attente des work permits.
  // La page reste accessible par son adresse directe : elle n'est ni
  // supprimée, ni redirigée, donc rien à recréer ensuite. Elle sort seulement
  // de l'index Google, le temps que la situation soit régularisée.
  // Pour la réactiver : retirer ce bloc `robots` ET remettre '/a-propos' dans
  // `routes` (src/lib/seo.ts).
  robots: { index: false, follow: true },
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
