import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ContactContent } from './contact-content'
import {
  breadcrumbJsonLd,
  localBusinessJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { siteConfig } from '@/lib/seo'

const CONTACT_KEYWORDS = [
  'shi shi samui contact',
  'shi shi samui location',
  'shi shi samui lamai',
  'sports club in lamai location',
  'tennis court lamai location',
  'sports club near me lamai',
  'gym near me lamai',
  'kids club near me lamai',
  'restaurant near me lamai',
  'sports club near lamai beach',
]

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Contact' })
  return {
    title: { absolute: t('metaTitle') },
    description: t('metaDescription'),
    keywords: CONTACT_KEYWORDS,
    alternates: { canonical: '/contact-location' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${siteConfig.url}/contact-location`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/pool-bar.jpg', alt: 'Shi Shi Samui location in Lamai' }],
    },
  }
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'Contact' })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      localBusinessJsonLd(),
      webPageJsonLd(t('h1'), t('metaDescription'), '/contact-location'),
      breadcrumbJsonLd([
        { name: locale === 'fr' ? 'Accueil' : 'Home', path: '/' },
        { name: t('breadcrumb'), path: '/contact-location' },
      ]),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ContactContent />
    </>
  )
}
