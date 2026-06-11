export const siteConfig = {
  name: 'Shi Shi Samui',
  url: 'https://shi-shi-samui.com',
  locale: 'en_US',
  description:
    'Shi Shi Samui, premium social club resort in Lamai, Koh Samui. Tennis, pickleball, fitness, healthy restaurant, kids club and pool. Book your court online 24/7.',
  ogImage: 'https://shi-shi-samui.com/og.png',
  twitterHandle: '@shishisamui',
  themeColor: '#111111',
  phone: '+33 6 51 69 27 02',
  // Numéro WhatsApp au format international sans "+" ni espaces.
  // Configurable via NEXT_PUBLIC_WHATSAPP_NUMBER dans .env.local (placeholder par défaut).
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '33651692702',
  email: 'contact.shishisamui@gmail.com',
  instagram: 'https://www.instagram.com/shishisamui',
  // ⚠️ À confirmer : URL exacte de la page Facebook du club (SEO local / sameAs).
  facebook: 'https://www.facebook.com/shishisamui',
  address: {
    street: 'Lamai',
    city: 'Koh Samui',
    region: 'Surat Thani',
    postalCode: '84310',
    country: 'TH',
  },
  // Zones desservies (SEO local — areaServed).
  areaServed: ['Lamai', 'South Lamai', 'Koh Samui'],
  // Coordonnées de Lamai (Koh Samui) — widget météo + geo JSON-LD + Google Maps.
  geo: { lat: 9.4642, lon: 100.0419 },
  // Requête Google Maps pour l'embed et le lien « Itinéraire » de la page Contact.
  mapsQuery: 'Shi Shi Samui, Lamai, Koh Samui',
} as const

/** Liens sociaux confirmés (sameAs JSON-LD + footer / page Contact). */
export const socialLinks = [siteConfig.instagram, siteConfig.facebook]

/** URL d'itinéraire Google Maps (lien « Get directions »). */
export const mapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  siteConfig.mapsQuery
)}`

/** URL d'embed Google Maps (iframe sans clé API, centrée sur Lamai). */
export const mapsEmbedUrl = `https://www.google.com/maps?q=${siteConfig.geo.lat},${siteConfig.geo.lon}&z=14&output=embed`

export type SeoMeta = {
  title?: string
  description?: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: Record<string, unknown>
}

export function buildTitle(page?: string) {
  if (!page) return siteConfig.name
  return `${page} - ${siteConfig.name}`
}

// Routes publiques indexables (structure SEO « à la lettre » de l'audit).
// Utilisé par le sitemap au lancement (cf. sitemap.ts, drapeau LAUNCHED).
export const routes = [
  '/',
  '/tennis-court-lamai',
  '/pickleball-club-lamai',
  '/fitness-gym-lamai',
  '/kids-club-lamai',
  '/babysitting-lamai',
  '/healthy-restaurant-lamai',
  '/swimming-pool-lamai',
  '/prices',
  '/book-now',
  '/contact-location',
  '/a-propos',
] as const
