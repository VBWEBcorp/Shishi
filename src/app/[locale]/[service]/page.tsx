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
import type { Activity, Locale, Localized } from '@/lib/activities'
import { routing } from '@/i18n/routing'
import { getPageContent, orDefault, serviceContentId } from '@/lib/page-content'
import { alternatesFor, siteConfig } from '@/lib/seo'

export const dynamicParams = false

/**
 * Les pages restent pré-rendues, mais sont régénérées au plus une fois par
 * minute : une modification faite dans l'espace admin apparaît donc en ligne
 * sans redéploiement, tout en gardant la vitesse d'une page statique.
 */
export const revalidate = 60

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

  // Balise title et meta description modifiables depuis l'espace admin.
  const cms = await getPageContent(serviceContentId(svc.slug), l)
  const metaTitle = orDefault(cms.metaTitle as string, svc.metaTitle[l])
  const metaDescription = orDefault(cms.metaDescription as string, svc.metaDescription[l])

  return {
    title: { absolute: metaTitle },
    description: metaDescription,
    keywords: [...svc.keywordsPrimary, ...svc.keywordsSecondary],
    alternates: alternatesFor(svc.path, l),
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${siteConfig.url}/${l}${svc.path}`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: svc.image, alt: svc.altImages[0] }],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
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
    webPageJsonLd(svc.h1[l], desc, path, l),
    breadcrumbJsonLd(
      [
        { name: l === 'fr' ? 'Accueil' : 'Home', path: '/' },
        { name, path },
      ],
      l
    ),
  ]

  switch (svc.schema) {
    case 'sportsActivity':
      base.push(serviceJsonLd(svc.h1[l], desc, path, img, l))
      base.push(sportsActivityLocationJsonLd(name, desc, path, img, l))
      break
    case 'healthClub':
      base.push(healthClubJsonLd(name, desc, path, img, l))
      base.push(serviceJsonLd(svc.h1[l], desc, path, img, l))
      break
    case 'restaurant':
      base.push(restaurantJsonLd(name, desc, path, img, l))
      break
    case 'service':
    default:
      base.push(serviceJsonLd(svc.h1[l], desc, path, img, l))
      break
  }

  if (svc.faq.length > 0) {
    base.push(
      faqJsonLd(svc.faq.map((f) => ({ question: f.q[l], answer: f.a[l] })))
    )
  }

  return { '@context': 'https://schema.org', '@graph': base }
}

/**
 * Applique le contenu saisi dans l'espace admin par-dessus la fiche du code.
 * Chaque champ laissé vide garde sa valeur d'origine : le client n'a donc
 * jamais besoin de tout remplir pour modifier une seule ligne.
 *
 * Les champs sont mono-langue ici : `cms` est déjà la tranche de la langue
 * demandée, on la réinjecte dans la structure bilingue attendue par le gabarit.
 */
function applyCms(svc: Activity, cms: Record<string, any>, l: Locale): Activity {
  if (!cms || Object.keys(cms).length === 0) return svc

  const localized = (field: keyof Activity, value: unknown) =>
    value === undefined || value === null || (typeof value === 'string' && !value.trim())
      ? (svc[field] as Localized)
      : { ...(svc[field] as Localized), [l]: value as string }

  const faq =
    Array.isArray(cms.faq) && cms.faq.length > 0
      ? cms.faq
          .filter((item: any) => item && (item.q?.trim() || item.a?.trim()))
          .map((item: any, i: number) => ({
            q: { ...(svc.faq[i]?.q ?? { en: '', fr: '' }), [l]: item.q ?? '' },
            a: { ...(svc.faq[i]?.a ?? { en: '', fr: '' }), [l]: item.a ?? '' },
          }))
      : svc.faq

  const highlights =
    Array.isArray(cms.highlights) && cms.highlights.some((h: string) => h?.trim())
      ? { ...svc.highlights, [l]: cms.highlights.filter((h: string) => h?.trim()) }
      : svc.highlights

  return {
    ...svc,
    h1: localized('h1', cms.h1),
    tagline: localized('tagline', cms.tagline),
    description: localized('description', cms.description),
    image: orDefault(cms.image, svc.image),
    gallery: orDefault(
      Array.isArray(cms.gallery) ? cms.gallery.filter(Boolean) : undefined,
      svc.gallery
    ),
    highlights,
    faq,
  }
}

export default async function ServiceRoute({
  params,
}: {
  params: Promise<{ locale: string; service: string }>
}) {
  const { locale, service } = await params
  setRequestLocale(locale)
  const l = locale as Locale

  const base = getService(service)
  if (!base) notFound()

  // Lu sur le serveur : le texte du client est dans le HTML envoyé aux moteurs.
  const cms = await getPageContent(serviceContentId(base.slug), l)
  const svc = applyCms(base, cms, l)

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
