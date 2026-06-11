'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { CookieConsent } from '@/components/layout/cookie-consent'
import { Footer } from '@/components/layout/footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { MarketingBanner } from '@/components/marketing-banner'
import { MarketingPopup } from '@/components/marketing-popup'
import { Navbar } from '@/components/layout/navbar'
import { ScrollToTop } from '@/components/scroll-to-top'

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Vérifier si on est en espace admin ET si on est connecté
    const isAdminPath = pathname?.startsWith('/admin')
    const token = localStorage.getItem('authToken')
    setIsAdmin(isAdminPath && !!token)
  }, [pathname])

  // En espace admin connecté: pas de header/footer
  if (isAdmin) {
    return children
  }

  // Page d'accueil = « Coming Soon » plein écran : pas de navbar/footer/bannières.
  // (localePrefix 'always' → la home est /en ou /fr)
  // En dev, la home affiche le vrai site → on garde navbar/footer.
  const isHome = pathname === '/' || pathname === '/en' || pathname === '/fr'
  if (isHome && process.env.NODE_ENV !== 'development') {
    return <main className="flex-1">{children}</main>
  }

  // Sinon: header + contenu + footer complet
  return (
    <>
      <MarketingBanner />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <FloatingWhatsApp />
      <ScrollToTop />
      <MarketingPopup />
      <CookieConsent />
    </>
  )
}
