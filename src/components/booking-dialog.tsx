'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

import { BookingForm } from '@/app/[locale]/book-now/booking-form'
import { BookingVisualPanel, activityBackground } from '@/components/booking-visual-panel'

/**
 * Popup de réservation — réutilise le formulaire de /book-now (créneaux + coordonnées),
 * pré-rempli avec l'activité et la date choisies dans le hero de l'accueil.
 *
 * Desktop : modal large à 2 panneaux (visuel sombre « DA home » + formulaire).
 * Mobile/tablette : le visuel se masque, le formulaire occupe toute la largeur.
 * Modal maison (framer-motion), calé sur la charte : noir + orange, zéro violet.
 */
export function BookingDialog({
  open,
  onClose,
  activity,
  date,
}: {
  open: boolean
  onClose: () => void
  activity?: string
  date?: string
}) {
  // Rendu via portal sur <body> : la popup est déclarée dans le hero (qui a
  // `isolate`), donc sans portal son z-index resterait piégé sous la navbar.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Fond réactif : activité courante (init depuis la prop, resync à l'ouverture).
  const [activeSlug, setActiveSlug] = useState(activity || '')
  useEffect(() => setActiveSlug(activity || ''), [activity])

  // Verrouille le scroll de la page tant que le popup est ouvert.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // Échap pour fermer.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Réservation"
        >
          {/* Voile sombre flouté — clic = fermeture */}
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="absolute inset-0 -z-10 cursor-default bg-[oklch(0.16_0_0/0.6)] backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl bg-card shadow-[0_40px_90px_-30px_oklch(0.16_0_0/0.55)] ring-1 ring-border sm:max-w-lg lg:max-w-4xl"
          >
            {/* Bouton fermer */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fermer"
              className="absolute right-3 top-3 z-20 flex size-9 items-center justify-center rounded-full bg-background/85 text-muted-foreground ring-1 ring-border backdrop-blur transition-colors hover:text-foreground"
            >
              <X className="size-4" aria-hidden />
            </button>

            <div className="grid lg:grid-cols-[0.82fr_1fr]">
              {/* Panneau visuel — fond réactif selon l'activité choisie. Desktop only. */}
              <BookingVisualPanel image={activityBackground(activeSlug)} />

              {/* Formulaire */}
              <div className="max-h-[85vh] overflow-y-auto overflow-x-hidden">
                <Suspense fallback={null}>
                  <BookingForm
                    initialActivity={activity}
                    initialDate={date}
                    variant="dialog"
                    onActivityChange={setActiveSlug}
                  />
                </Suspense>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}
