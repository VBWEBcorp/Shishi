'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useState } from 'react'

export type FaqEntry = { q: string; a: string }

/**
 * Accordéon FAQ animé (style « Framer ») — réutilisé par les pages service et
 * la FAQ d'accueil. Apparition en cascade au scroll, ouverture fluide en
 * hauteur, icône « + » qui pivote en « × » (ressort), carte surélevée avec halo
 * accent et tinte chaude à l'ouverture, lift au survol. Un seul panneau ouvert
 * à la fois (par instance/colonne).
 */
export function FaqAccordion({
  items,
  startIndex = 0,
}: {
  items: FaqEntry[]
  startIndex?: number
}) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div className="flex flex-col gap-3.5 sm:gap-4">
      {items.map((item, i) => {
        const isOpen = open === i
        return (
          <motion.div
            key={item.q}
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{
              duration: 0.55,
              delay: (startIndex + i) * 0.06,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -3 }}
            className={`group relative overflow-hidden rounded-[1.4rem] border backdrop-blur-sm transition-[border-color,box-shadow,background-color] duration-300 ${
              isOpen
                ? 'border-accent/45 bg-gradient-to-br from-accent/[0.06] via-card to-card shadow-[0_30px_70px_-30px_oklch(0.63_0.187_47/0.55)]'
                : 'border-border bg-card/90 shadow-[0_2px_10px_-6px_oklch(0.18_0_0/0.18)] hover:border-accent/30 hover:shadow-[0_24px_55px_-32px_oklch(0.18_0_0/0.45)]'
            }`}
          >
            {/* Liseré accent à gauche, révélé à l'ouverture. */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-full bg-gradient-to-b from-accent to-accent/30"
              initial={false}
              animate={{ opacity: isOpen ? 1 : 0, scaleY: isOpen ? 1 : 0.4 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              style={{ transformOrigin: 'center' }}
            />

            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="relative flex w-full items-center justify-between gap-4 px-6 py-5 text-left sm:px-7 sm:py-6"
            >
              <span
                className={`text-[1.02rem] font-semibold tracking-[-0.01em] transition-colors duration-300 sm:text-lg ${
                  isOpen ? 'text-accent' : 'text-foreground'
                }`}
              >
                {item.q}
              </span>
              <span
                className={`relative flex size-9 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                  isOpen
                    ? 'bg-accent text-accent-foreground shadow-[0_10px_22px_-8px_oklch(0.63_0.187_47/0.65)]'
                    : 'bg-accent/10 text-accent group-hover:bg-accent/15'
                }`}
              >
                <motion.span
                  animate={{ rotate: isOpen ? 135 : 0 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="flex"
                >
                  <Plus className="size-[18px]" aria-hidden />
                </motion.span>
              </span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="relative overflow-hidden"
                >
                  <div className="px-6 pb-6 sm:px-7">
                    <span
                      className="block h-px w-full bg-gradient-to-r from-accent/35 via-border to-transparent"
                      aria-hidden
                    />
                    <p className="pt-4 text-[0.95rem] leading-relaxed text-muted-foreground">
                      {item.a}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
