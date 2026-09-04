import type { MetadataRoute } from 'next'

import { siteConfig } from '@/lib/seo'

/**
 * Manifeste du SITE PUBLIC.
 *
 * Il rend le site installable sur un téléphone, et c'est aussi lui qui donne au
 * navigateur le nom, la couleur et l'icône à utiliser quand quelqu'un ajoute la
 * page à son écran d'accueil. Sans manifeste, on obtient un signet avec une
 * capture d'écran en guise d'icône.
 *
 * L'espace admin a le sien (src/app/admin/manifest.webmanifest), qui ouvre
 * directement le planning : ce sont deux usages différents, et le club installe
 * l'admin, pas la vitrine.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name}, Sports & Social Club in Lamai`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    // Langue par défaut du routage : une installation ouvre la version anglaise.
    start_url: '/en',
    scope: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: siteConfig.themeColor,
    orientation: 'portrait',
    icons: [
      { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
      { src: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
    ],
  }
}
