import { siteConfig, socialLinks } from '@/lib/seo'

const ORG_ID = `${siteConfig.url}/#organization`
const LOCALBUSINESS_ID = `${siteConfig.url}/#localbusiness`

/** Adresse postale partagée (PostalAddress). */
function postalAddress() {
  return {
    '@type': 'PostalAddress',
    streetAddress: siteConfig.address.street,
    addressLocality: siteConfig.address.city,
    addressRegion: siteConfig.address.region,
    postalCode: siteConfig.address.postalCode,
    addressCountry: siteConfig.address.country,
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': ORG_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.png`,
    image: siteConfig.ogImage,
    email: siteConfig.email,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: siteConfig.phone,
      contactType: 'customer service',
      availableLanguage: ['English', 'French'],
    },
    sameAs: socialLinks,
  }
}

/**
 * LocalBusiness enrichi (SEO local) : NAP, géolocalisation, zones desservies,
 * réseaux sociaux. Pas d'horaires globaux ni d'avis inventés (règle de l'audit).
 */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'SportsActivityLocation'],
    '@id': LOCALBUSINESS_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    telephone: siteConfig.phone,
    email: siteConfig.email,
    image: siteConfig.ogImage,
    logo: `${siteConfig.url}/icon.png`,
    address: postalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lon,
    },
    areaServed: siteConfig.areaServed.map((name) => ({
      '@type': 'Place',
      name,
    })),
    sameAs: socialLinks,
  }
}

export function webSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    publisher: { '@id': ORG_ID },
    inLanguage: ['en', 'fr'],
  }
}

export function webPageJsonLd(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `${siteConfig.url}${path}`,
    isPartOf: {
      '@type': 'WebSite',
      name: siteConfig.name,
      url: siteConfig.url,
    },
  }
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

/** Service générique fourni par Shi Shi Samui. */
export function serviceJsonLd(
  name: string,
  description: string,
  path: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    ...(image ? { image: `${siteConfig.url}${image}` } : {}),
    areaServed: siteConfig.areaServed.map((a) => ({ '@type': 'Place', name: a })),
    provider: { '@id': LOCALBUSINESS_ID },
    url: `${siteConfig.url}${path}`,
  }
}

/**
 * Lieu d'activité sportive (tennis, pickleball, piscine, kids club…).
 * Combiné avec un Service dans le @graph de la page.
 */
export function sportsActivityLocationJsonLd(
  name: string,
  description: string,
  path: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: `${siteConfig.name} — ${name}`,
    description,
    ...(image ? { image: `${siteConfig.url}${image}` } : {}),
    url: `${siteConfig.url}${path}`,
    telephone: siteConfig.phone,
    address: postalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lon,
    },
    parentOrganization: { '@id': ORG_ID },
    sameAs: socialLinks,
  }
}

/** Salle de sport (fitness). */
export function healthClubJsonLd(
  name: string,
  description: string,
  path: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HealthClub',
    name: `${siteConfig.name} — ${name}`,
    description,
    ...(image ? { image: `${siteConfig.url}${image}` } : {}),
    url: `${siteConfig.url}${path}`,
    telephone: siteConfig.phone,
    address: postalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lon,
    },
    parentOrganization: { '@id': ORG_ID },
    sameAs: socialLinks,
  }
}

/** Restaurant healthy. */
export function restaurantJsonLd(
  name: string,
  description: string,
  path: string,
  image?: string
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: `${siteConfig.name} — ${name}`,
    description,
    ...(image ? { image: `${siteConfig.url}${image}` } : {}),
    url: `${siteConfig.url}${path}`,
    telephone: siteConfig.phone,
    address: postalAddress(),
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.lat,
      longitude: siteConfig.geo.lon,
    },
    servesCuisine: ['Healthy', 'International'],
    parentOrganization: { '@id': ORG_ID },
    sameAs: socialLinks,
  }
}

/** Catalogue d'offres (page Prices) — tarifs réellement affichés uniquement. */
export function offerCatalogJsonLd(
  name: string,
  offers: { name: string; price: number; unit?: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    name,
    url: `${siteConfig.url}/prices`,
    provider: { '@id': LOCALBUSINESS_ID },
    itemListElement: offers.map((o) => ({
      '@type': 'Offer',
      name: o.name,
      price: o.price,
      priceCurrency: 'THB',
      ...(o.unit ? { description: o.unit } : {}),
      availability: 'https://schema.org/InStock',
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${siteConfig.url}${item.path}`,
    })),
  }
}
