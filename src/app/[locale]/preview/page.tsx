import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import { ActivityTiles } from '@/components/sections/activity-tiles'
import { ExperienceGallery } from '@/components/sections/experience-gallery'
import { FaqSection } from '@/components/sections/faq-section'
import { PhotoShowcase } from '@/components/sections/photo-showcase'
import { ShishiHero } from '@/components/sections/shishi-hero'
import { BookingCta, StorySection, ValuesBand } from '@/components/sections/shishi-home'

// Aperçu privé du site complet pendant la phase "Coming Soon".
// noindex : on ne veut indexer QUE la page d'accueil pour l'instant.
export const metadata: Metadata = {
  title: 'Preview',
  alternates: { canonical: '/preview' },
  robots: { index: false, follow: false },
}

export default async function PreviewHomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

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
