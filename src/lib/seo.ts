export const siteConfig = {
  name: 'Shi Shi Samui',
  url: 'https://shi-shi-samui.com',
  locale: 'en_US',
  description:
    'Shi Shi Samui, premium social club resort in Lamai, Koh Samui. Tennis, pickleball, fitness, healthy restaurant, kids club and pool. Book your court online 24/7.',
  ogImage: 'https://shi-shi-samui.com/og.png',
  twitterHandle: '@shishisamui',
  themeColor: '#0f5c4e',
  phone: '+66 00 000 0000',
  // Numéro WhatsApp au format international sans "+" ni espaces.
  // Configurable via NEXT_PUBLIC_WHATSAPP_NUMBER dans .env.local (placeholder par défaut).
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '66000000000',
  email: 'contact.shishisamui@gmail.com',
  instagram: 'https://www.instagram.com/shishisamui',
  address: {
    street: 'Lamai',
    city: 'Koh Samui',
    postalCode: '84310',
    country: 'TH',
  },
  // Coordonnées de Lamai (Koh Samui) pour le widget météo
  geo: { lat: 9.4642, lon: 100.0419 },
} as const

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

export const routes = [
  '/',
  '/a-propos',
  '/services',
  '/contact',
  '/mentions-legales',
  '/politique-de-confidentialite',
  '/conditions-generales',
  '/politique-cookies',
] as const
