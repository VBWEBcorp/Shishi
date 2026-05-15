'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Cookie, X } from 'lucide-react'

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

  const handleClose = () => {
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 16, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 z-[100] sm:right-auto sm:max-w-2xl"
          role="dialog"
          aria-labelledby="cookie-title"
          aria-describedby="cookie-desc"
        >
          <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-card px-5 py-4 shadow-[0_20px_50px_-12px_oklch(0.2_0.02_264/0.2)]">
            {/* Halo violet subtil top-right (cohérent DA) */}
            <div
              className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/10 blur-3xl"
              aria-hidden
            />
            {/* Bordure dégradée premium */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl p-px"
              aria-hidden
              style={{
                background:
                  'linear-gradient(135deg, oklch(0.55 0.2 285 / 0.35) 0%, oklch(0.91 0.012 264 / 0.5) 50%, oklch(0.55 0.2 285 / 0.35) 100%)',
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5">
              {/* Icône cookie animée */}
              <motion.span
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.15,
                  type: 'spring',
                  stiffness: 260,
                  damping: 14,
                }}
                whileHover={{ scale: 1.08, rotate: -6 }}
                className="relative flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20"
              >
                {/* Halo pulsant subtil */}
                <span
                  className="absolute inset-0 animate-ping rounded-xl bg-primary/15 opacity-60"
                  style={{ animationDuration: '2.5s' }}
                  aria-hidden
                />
                {/* Cookie qui bobotte gentiment */}
                <motion.span
                  animate={{ rotate: [0, -4, 4, -2, 2, 0] }}
                  transition={{
                    duration: 3.5,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    repeatDelay: 1.5,
                  }}
                  className="relative inline-flex"
                >
                  <Cookie className="size-5" strokeWidth={2} aria-hidden />
                </motion.span>
                {/* Crumb qui tombe occasionnellement */}
                <motion.span
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [0, 4, 14, 18],
                  }}
                  transition={{
                    duration: 1.4,
                    ease: 'easeIn',
                    repeat: Infinity,
                    repeatDelay: 3,
                    delay: 1,
                  }}
                  className="absolute bottom-1 left-1/2 size-0.5 -translate-x-1/2 rounded-full bg-primary/70"
                  aria-hidden
                />
              </motion.span>

              {/* Texte */}
              <div className="flex-1 pr-8 sm:pr-0">
                <p id="cookie-title" className="font-display text-sm font-semibold text-foreground">
                  Nous utilisons des cookies
                </p>
                <p id="cookie-desc" className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  Pour améliorer votre expérience. En continuant votre navigation, vous acceptez notre utilisation des cookies.{' '}
                  <Link
                    href="/politique-cookies"
                    className="text-primary underline-offset-2 hover:underline"
                  >
                    En savoir plus
                  </Link>
                </p>
              </div>

              {/* Boutons */}
              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={handleRefuse}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                >
                  Refuser
                </button>
                <button
                  onClick={handleAccept}
                  className="group/cta relative inline-flex h-9 items-center overflow-hidden rounded-xl px-4 text-xs font-semibold text-primary-foreground shadow-[0_4px_14px_-4px_oklch(0.48_0.22_285/0.5)] transition-all hover:shadow-[0_6px_20px_-4px_oklch(0.48_0.22_285/0.6)] active:translate-y-px"
                >
                  <span
                    className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.42_0.22_280)] dark:from-primary dark:via-primary dark:to-[oklch(0.65_0.18_280)]"
                    aria-hidden
                  />
                  <span
                    className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
                    aria-hidden
                  />
                  <span
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    aria-hidden
                  />
                  <span className="relative">Accepter</span>
                </button>
              </div>

              {/* Bouton fermer top-right (absolute mobile) */}
              <button
                type="button"
                onClick={handleClose}
                aria-label="Fermer"
                className="absolute right-0 top-0 flex size-7 items-center justify-center rounded-full text-muted-foreground/60 transition-colors hover:bg-foreground/[0.06] hover:text-foreground sm:relative sm:right-auto sm:top-auto"
              >
                <X className="size-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
