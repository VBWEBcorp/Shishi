'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect, useRef, useState } from 'react'

/**
 * Google Analytics 4.
 *
 * Rapport SEO d'août 2026 (§7) : « Mettre en place ou récupérer l'accès à Google
 * Analytics 4 pour suivre le trafic du site et les actions réalisées par les visiteurs. »
 * Le site n'avait aucune mesure d'audience : Search Console dit ce que Google montre,
 * pas ce que les visiteurs font une fois arrivés.
 *
 * Trois précautions, dans cet ordre :
 *
 *  1. RIEN ne part sans identifiant. `NEXT_PUBLIC_GA_ID` absent = composant inerte.
 *     L'identifiant se règle dans les variables d'environnement de l'hébergeur, pas
 *     dans le code : le dépôt n'a pas à connaître le compte du client.
 *
 *  2. RIEN ne part sans consentement. Le site affiche déjà une bannière cookies ; elle
 *     ne servait à rien puisqu'aucun traceur n'était posé. Elle sert maintenant : le
 *     script n'est chargé qu'après « J'accepte », et l'événement émis par la bannière
 *     déclenche le chargement dans la foulée, sans rechargement de page.
 *
 *  3. `lazyOnload` : le script part une fois la page chargée, pas pendant. Le rapport
 *     pointe 800 ms de temps de blocage sur mobile (§6), ce n'est pas le moment
 *     d'ajouter un tiers dans le chemin critique.
 *
 * Les pages du site changent sans rechargement (navigation Next). GA4 ne verrait donc
 * que la première page : on lui signale les suivantes à la main.
 */

/** Identifiant de mesure GA4 (format « G-XXXXXXXXXX »), fourni par le client. */
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? ''

/** Clé de la décision cookies, partagée avec <CookieConsent />. */
export const CONSENT_KEY = 'cookie-consent'

/** Événement émis par la bannière au moment du choix (même onglet). */
export const CONSENT_EVENT = 'shishi:cookie-consent'

type Gtag = (...args: unknown[]) => void

export function GoogleAnalytics() {
  const pathname = usePathname()
  const [autorise, setAutorise] = useState(false)
  const dernierChemin = useRef<string | null>(null)

  // Décision de l'utilisateur : au montage, puis à chaque changement, dans cet onglet
  // (événement de la bannière) comme dans un autre (événement « storage »).
  useEffect(() => {
    const lire = () => {
      try {
        setAutorise(localStorage.getItem(CONSENT_KEY) === 'accepted')
      } catch {
        // Navigateur qui refuse le stockage local : pas de consentement lisible,
        // donc pas de mesure. C'est le bon sens par défaut.
      }
    }
    lire()
    window.addEventListener(CONSENT_EVENT, lire)
    window.addEventListener('storage', lire)
    return () => {
      window.removeEventListener(CONSENT_EVENT, lire)
      window.removeEventListener('storage', lire)
    }
  }, [])

  // Pages vues des navigations internes. La toute première est déjà envoyée par
  // `gtag('config')` ci-dessous : on la laisse passer sans la compter deux fois.
  useEffect(() => {
    if (!autorise || !GA_ID) return
    if (dernierChemin.current === null) {
      dernierChemin.current = pathname
      return
    }
    if (dernierChemin.current === pathname) return
    dernierChemin.current = pathname

    const gtag = (window as Window & { gtag?: Gtag }).gtag
    if (typeof gtag !== 'function') return
    gtag('event', 'page_view', {
      page_path: pathname,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [autorise, pathname])

  if (!GA_ID || !autorise) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="lazyOnload"
      />
      <Script id="ga4-init" strategy="lazyOnload">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GA_ID}', { anonymize_ip: true });`}
      </Script>
    </>
  )
}
