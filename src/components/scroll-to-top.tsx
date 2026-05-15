'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ScrollToTop() {
  const [visible, setVisible] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? 'auto' : 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Retour en haut"
          initial={{ opacity: 0, scale: 0.7, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.7, y: 12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="group/scroll fixed bottom-6 right-6 z-[90] flex size-11 items-center justify-center overflow-hidden rounded-full text-primary-foreground shadow-[0_8px_24px_-6px_oklch(0.48_0.22_285/0.5)] transition-shadow hover:shadow-[0_12px_32px_-6px_oklch(0.48_0.22_285/0.65)] sm:size-12"
        >
          {/* Fond gradient */}
          <span
            className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.42_0.22_280)] dark:from-primary dark:via-primary dark:to-[oklch(0.65_0.18_280)]"
            aria-hidden
          />
          {/* Shimmer au hover */}
          <span
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/scroll:translate-x-full"
            aria-hidden
          />
          {/* Highlight top */}
          <span
            className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
            aria-hidden
          />
          <ArrowUp
            className="relative size-5 transition-transform duration-300 group-hover/scroll:-translate-y-0.5"
            strokeWidth={2.25}
            aria-hidden
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
