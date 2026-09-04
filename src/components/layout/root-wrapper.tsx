'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Footer } from '@/components/layout/footer'
import { FloatingWhatsApp } from '@/components/floating-whatsapp'
import { MarketingBanner } from '@/components/marketing-banner'
import { Navbar } from '@/components/layout/navbar'
import { LAUNCHED, PREVIEW_CODE, PREVIEW_COOKIE } from '@/lib/launch'

/*
 * Deux surcouches qui n'apparaissent jamais tout de suite : le popup marketing attend
 * son délai (5 s par défaut) et la bannière cookies 1,5 s. Leur code n'a donc aucune
 * raison de peser sur le premier chargement, celui que mesure PageSpeed. Chargées à part,
 * elles arrivent quand elles doivent arriver, sans rien changer à l'écran.
 *
 * `ssr: false` : ni l'une ni l'autre ne rend quoi que ce soit au premier passage.
 */
const CookieConsent = dynamic(
  () => import('@/components/layout/cookie-consent').then((m) => m.CookieConsent),
  { ssr: false }
)
const MarketingPopup = dynamic(
  () => import('@/components/marketing-popup').then((m) => m.MarketingPopup),
  { ssr: false }
)

export function RootWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isAdmin, setIsAdmin] = useState(false)
  // Aperçu déverrouillé (cookie posé après saisie du code) → la home reçoit
  // l'habillage complet au lieu de la façade plein écran.
  const [unlocked, setUnlocked] = useState(false)

  useEffect(() => {
    // Vérifier si on est en espace admin ET si on est connecté
    const isAdminPath = pathname?.startsWith('/admin')
    const token = localStorage.getItem('authToken')
    setIsAdmin(isAdminPath && !!token)
    setUnlocked(
      typeof document !== 'undefined' &&
        document.cookie.split('; ').some((c) => c === `${PREVIEW_COOKIE}=${PREVIEW_CODE}`)
    )
  }, [pathname])

  // En espace admin connecté: pas de header/footer
  if (isAdmin) {
    return children
  }

  // Page de connexion adhérent : design plein écran immersif (pas de chrome).
  if (pathname?.endsWith('/member/login')) {
    return <main className="min-h-dvh">{children}</main>
  }

  // Tant que le site n'est pas lancé : l'accueil = « Coming Soon » plein écran,
  // sans navbar/footer/bannières. Une fois lancé (LAUNCHED), l'accueil reçoit
  // l'habillage complet comme toutes les autres pages.
  // (localePrefix 'always' → la home est /en ou /fr)
  const isHome = pathname === '/' || pathname === '/en' || pathname === '/fr'
  if (isHome && !LAUNCHED && !unlocked && process.env.NODE_ENV !== 'development') {
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
      <MarketingPopup />
      <CookieConsent />
    </>
  )
}
