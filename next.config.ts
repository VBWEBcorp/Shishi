import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

// Anciennes URLs → nouvelles URLs SEO (audit). Redirections 301 locale-aware
// pour ne perdre ni les liens externes ni les éventuelles indexations.
const SLUG_REDIRECTS: { from: string; to: string }[] = [
  { from: 'activities/tennis', to: 'tennis-court-lamai' },
  { from: 'activities/pickleball', to: 'pickleball-club-lamai' },
  { from: 'activities/fitness', to: 'fitness-gym-lamai' },
  { from: 'activities/restaurant', to: 'healthy-restaurant-lamai' },
  { from: 'activities/kids-club', to: 'kids-club-lamai' },
  { from: 'activities/pool', to: 'swimming-pool-lamai' },
  { from: 'booking', to: 'book-now' },
  { from: 'contact', to: 'contact-location' },
]

const nextConfig: NextConfig = {
  compress: true,
  poweredByHeader: false,
  // Une page = une adresse, sans barre oblique finale (rapport SEO août 2026, §3 :
  // /fr et /fr/ apparaissaient comme deux pages dans Search Console). C'est déjà le
  // défaut de Next, mais l'écrire noir sur blanc évite qu'un réglage d'hébergeur ou
  // une mise à jour ne le retourne sans que personne ne s'en aperçoive. La redirection
  // elle-même est posée dans src/middleware.ts, en amont de tout le reste.
  trailingSlash: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  async redirects() {
    return SLUG_REDIRECTS.flatMap(({ from, to }) => [
      // URL préfixée par la locale (cas standard : localePrefix 'always')
      {
        source: `/:locale(en|fr)/${from}`,
        destination: `/:locale/${to}`,
        permanent: true,
      },
      // URL sans locale (lien externe historique) → locale par défaut
      {
        source: `/${from}`,
        destination: `/en/${to}`,
        permanent: true,
      },
    ])
  },
}

export default withNextIntl(nextConfig)
