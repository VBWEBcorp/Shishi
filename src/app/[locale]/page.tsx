import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { ActivityTiles } from '@/components/sections/activity-tiles'
import { ExperienceGallery } from '@/components/sections/experience-gallery'
import { FaqSection } from '@/components/sections/faq-section'
import { ShishiHero } from '@/components/sections/shishi-hero'
import { BookingCta, StorySection, ValuesBand } from '@/components/sections/shishi-home'
import {
  localBusinessJsonLd,
  organizationJsonLd,
  webPageJsonLd,
  webSiteJsonLd,
} from '@/components/seo/json-ld'
import { siteConfig } from '@/lib/seo'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    webSiteJsonLd(),
    organizationJsonLd(),
    localBusinessJsonLd(),
    webPageJsonLd(siteConfig.name, siteConfig.description, '/'),
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
      <ShishiHero />
      <ActivityTiles />
      <ExperienceGallery />
      <ValuesBand />
      <StorySection />
      <FaqSection />
      <BookingCta />
    </>
  )
}
