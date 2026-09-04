import type { Metadata, Viewport } from 'next'

import { AdminShell } from './admin-shell'

/*
 * L'espace admin s'installe sur l'ecran d'accueil comme une application.
 *
 * Demande de septembre 2026 : « tu vas sur le site, tu mets /admin, et tu fais
 * ajouter a l'ecran d'accueil. Ce sera plus un lien, ce sera comme une app. »
 * Sans manifeste, le raccourci garde la barre d'adresse du navigateur et une
 * icone generique. Avec, il se lance en plein ecran, avec le logo du club.
 *
 * Le manifeste est PROPRE A /admin : celui du site public (src/app/manifest.ts)
 * ouvre l'accueil, celui-ci ouvre directement le planning.
 */
export const metadata: Metadata = {
  title: 'Shi Shi Samui, espace admin',
  manifest: '/admin/manifest.webmanifest',
  // L'admin n'a rien a faire dans un moteur de recherche.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: 'Shi Shi Admin', statusBarStyle: 'black-translucent' },
}

export const viewport: Viewport = {
  themeColor: '#111111',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
