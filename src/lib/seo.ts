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
  email: 'contact@shi-shi-samui.com',
  instagram: 'https://www.instagram.com/shishisamui',
  facebook: 'https://www.facebook.com/shishisamui/',
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

/**
 * Canonical + alternances de langue d'une page, à partir de son chemin SANS locale.
 *
 * À poser dans `alternates` de CHAQUE page. Les pages déclaraient jusqu'ici un canonical
 * sans préfixe de langue (`canonical: '/tennis-court-lamai'`), donc identique en anglais et
 * en français. Or ce chemin n'existe pas : il répond 307 et redirige vers /en. La page
 * française annonçait ainsi à Google que sa version de référence était la page anglaise —
 * autrement dit elle se retirait elle-même de l'index français. Vingt-six des trente URL du
 * sitemap étaient dans ce cas ; seuls les articles de blog, qui construisaient déjà leur
 * canonical avec la locale, y échappaient.
 *
 * `languages` double le hreflang déjà présent dans le sitemap. Les deux sont valables pour
 * Google, et le mettre aussi dans la page rend le couple fr/en explicite là où il était
 * précisément cassé. `x-default` pointe vers l'anglais, langue par défaut du routage.
 */
export function alternatesFor(path: string, locale: string) {
  const p = path === '/' ? '' : path
  return {
    canonical: `/${locale}${p}`,
    languages: { en: `/en${p}`, fr: `/fr${p}`, 'x-default': `/en${p}` },
  }
}

/**
 * Sérialise un objet JSON-LD pour injection dans une balise <script>. `JSON.stringify`
 * n'échappe pas la séquence `</script>` ni `<`/`>` : un champ contrôlé par l'admin
 * (titre d'article, tags…) contenant `</script><img onerror=…>` pourrait sinon
 * fermer la balise et injecter du HTML exécutable (XSS). On échappe donc `<`, `>`
 * et `&` en séquences unicode, neutres pour le JSON mais sûres dans le HTML.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

// Routes publiques indexables (structure SEO « à la lettre » de l'audit).
// Utilisé par le sitemap au lancement (cf. sitemap.ts, drapeau LAUNCHED).
export const routes = [
  '/',
  // Page carrefour des activités : elle lie les sept pages service et reçoit leurs liens
  // de retour. Elle était absente du sitemap alors qu'elle est liée depuis le menu, donc
  // connue de Google, mais jamais proposée (rapport SEO août 2026, §7 : « vérifier le
  // sitemap et les liens internes »).
  '/services',
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
  // Réindexée le 18/08/2026 : la page ne nomme plus aucun gérant ni leur
  // nombre, le motif du masquage a donc disparu. Google attend une page
  // « À propos » pour rattacher le site à une entité — autant la garder.
  '/a-propos',
] as const
