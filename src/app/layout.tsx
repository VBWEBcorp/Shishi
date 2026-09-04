import type { Metadata, Viewport } from 'next'
import { Cal_Sans, Poppins } from 'next/font/google'

import { ThemeScript } from '@/components/theme/theme-script'
import { siteConfig } from '@/lib/seo'

import '../index.css'

// Corps de texte — Poppins.
const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-poppins',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
})

// Gros titres — Cal Sans (police d'affichage, une seule graisse).
// adjustFontFallback: false → pas de métriques de fallback à générer pour
// Cal Sans (police récente absente de la table de Next), ce qui supprime le
// warning « Failed to find font override values ».
const calSans = Cal_Sans({
  subsets: ['latin'],
  variable: '--font-cal-sans',
  weight: '400',
  display: 'swap',
  adjustFontFallback: false,
})

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [{ url: siteConfig.ogImage }],
  },
  twitter: {
    card: 'summary_large_image',
    site: siteConfig.twitterHandle,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: 'RuN6jLULSKgk4b1oaznEhxfvs8FGNGYWJC713GkPHLM',
  },
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${poppins.variable} ${calSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
        {/* Les sections de l'accueil arrivent en fondu au défilement (cf. <Reveal />),
            donc masquées tant que le JavaScript ne les a pas vues passer. Sans JavaScript
            (robot qui n'exécute rien, script bloqué), elles resteraient invisibles : cette
            règle les rend simplement visibles. Trois lignes, et la page ne dépend plus du
            JavaScript pour montrer son contenu. */}
        <noscript>
          <style>{'.reveal-defilement{opacity:1;transform:none}'}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">{children}</body>
    </html>
  )
}
