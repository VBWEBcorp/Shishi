'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Cookie } from 'lucide-react'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const handleRefuse = () => {
    localStorage.setItem('cookie-consent', 'refused')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 12, opacity: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:right-auto z-[100] sm:max-w-sm"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
        >
          <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-md">
            <Cookie className="size-5 shrink-0 text-amber-500" strokeWidth={2} aria-hidden />

            <p id="cookie-desc" className="flex-1 text-[13px] text-muted-foreground leading-snug">
              <span id="cookie-title" className="text-foreground font-medium">Cookies.</span>{' '}
              <Link
                href="/politique-cookies"
                className="text-primary underline-offset-2 hover:underline"
              >
                En savoir plus
              </Link>
            </p>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handleRefuse}
                className="text-xs font-medium text-muted-foreground px-2 py-1 rounded-md transition-colors hover:text-foreground"
              >
                Refuser
              </button>
              <button
                onClick={handleAccept}
                className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1.5 rounded-md transition-colors hover:bg-primary/90"
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
