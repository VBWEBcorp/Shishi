'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { ActivityIcon } from '@/components/activity-icon'
import { CONSENT_EVENT, CONSENT_KEY } from '@/components/analytics/google-analytics'
import { Link } from '@/i18n/navigation'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const decide = (value: 'accepted' | 'refused') => {
    localStorage.setItem(CONSENT_KEY, value)
    // La bannière ne faisait que ranger une valeur dans le navigateur : rien ne l'écoutait.
    // Elle prévient maintenant la page, pour que la mesure d'audience démarre (ou reste
    // éteinte) tout de suite, sans attendre un rechargement.
    window.dispatchEvent(new Event(CONSENT_EVENT))
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.94 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 z-[100] w-[min(19rem,calc(100vw-2rem))]"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
        >
          <div className="rounded-2xl border border-border bg-card/95 p-4 shadow-[0_18px_44px_-16px_oklch(0.18_0_0/0.22)] backdrop-blur-sm">
            {/* En-tête : icône raquette + titre */}
            <div className="flex items-center gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent ring-1 ring-accent/15">
                <ActivityIcon name="pickleball" className="size-4" />
              </span>
              <p id="cookie-title" className="text-sm font-semibold text-foreground">
                Cookies
              </p>
            </div>

            <p id="cookie-desc" className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              On utilise des cookies pour améliorer votre visite.{' '}
              <Link
                href="/politique-cookies"
                className="text-accent underline-offset-2 hover:underline"
              >
                En savoir plus
              </Link>
            </p>

            {/* Boutons — deux pastilles côte à côte */}
            <div className="mt-3.5 flex items-center gap-2">
              <button
                onClick={() => decide('refused')}
                className="flex-1 rounded-full px-3 py-1.5 text-xs font-medium text-muted-foreground ring-1 ring-border transition-colors hover:bg-muted hover:text-foreground"
              >
                Refuser
              </button>
              <button
                onClick={() => decide('accepted')}
                className="flex-1 rounded-full bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-90"
              >
                Accepter
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
