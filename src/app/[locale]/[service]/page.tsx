import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { ServicePage } from '@/components/sections/service-page'
import {
  breadcrumbJsonLd,
  faqJsonLd,
  healthClubJsonLd,
  restaurantJsonLd,
  serviceJsonLd,
  sportsActivityLocationJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { getService, serviceUrlSlugs } from '@/lib/activities'
import type { Activity, Locale } from '@/lib/activities'
import { routing } from '@/i18n/routing'
import { siteConfig } from '@/lib/seo'

export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.flatMap((locale) =>
    serviceUrlSlugs.map((service) => ({ locale, service }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; service: string }>
}): Promise<Metadata> {
  const { locale, service } = await params
  const svc = getService(service)
  if (!svc) return {}
  const l = locale as Locale

  return {
    title: { absolute: svc.metaTitle[l] },
    description: svc.metaDescription[l],
    keywords: [...svc.keywordsPrimary, ...svc.keywordsSecondary],
    alternates: { canonical: svc.path },
    openGraph: {
      title: svc.metaTitle[l],
      description: svc.metaDescription[l],
      url: `${siteConfig.url}${svc.path}`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: svc.image, alt: svc.altImages[0] }],
    },
    twitter: {
      card: 'summary_large_image',
      title: svc.metaTitle[l],
      description: svc.metaDescription[l],
      images: [svc.image],
    },
  }
}

/** Données structurées par type de service (audit « Données structurées »). */
function serviceGraph(svc: Activity, l: Locale) {
  const name = svc.name[l]
  const desc = svc.metaDescription[l]
  const path = svc.path
  const img = svc.image

  const base: Record<string, unknown>[] = [
    webPageJsonLd(svc.h1[l], desc, path),
    breadcrumbJsonLd([
      { name: l === 'fr' ? 'Accueil' : 'Home', path: '/' },
      { name, path },
    ]),
  ]

  switch (svc.schema) {
    case 'sportsActivity':
      base.push(serviceJsonLd(svc.h1[l], desc, path, img))
      base.push(sportsActivityLocationJsonLd(name, desc, path, img))
      break
    case 'healthClub':
      base.push(healthClubJsonLd(name, desc, path, img))
      base.push(serviceJsonLd(svc.h1[l], desc, path, img))
      break
    case 'restaurant':
      base.push(restaurantJsonLd(name, desc, path, img))
      break
    case 'service':
    default:
      base.push(serviceJsonLd(svc.h1[l], desc, path, img))
      break
  }

  if (svc.faq.length > 0) {
    base.push(
      faqJsonLd(svc.faq.map((f) => ({ question: f.q[l], answer: f.a[l] })))
    )
  }

  return { '@context': 'https://schema.org', '@graph': base }
}

export default async function ServiceRoute({
  params,
}: {
  params: Promise<{ locale: string; service: string }>
}) {
  const { locale, service } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const svc = getService(service)
  if (!svc) notFound()

  const jsonLd = serviceGraph(svc, l)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ServicePage service={svc} locale={l} />
    </>
  )
}
