'use client'

import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Apparition douce au scroll (fondu + léger glissement vers le haut), une seule
 * fois quand l'élément entre dans le viewport. Respecte « prefers-reduced-motion »
 * (rendu statique sans animation pour les utilisateurs concernés).
 *
 * Utilisé pour révéler progressivement les sections de l'accueil « au fur et à
 * mesure » du défilement.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 26,
  duration = 0.6,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  duration?: number
  /** Élément rendu : 'div' (défaut) ou 'li' (pour les listes/grilles). */
  as?: 'div' | 'li'
}) {
  const reduce = useReducedMotion()

  if (reduce) {
    const Tag = as
    return <Tag className={className}>{children}</Tag>
  }

  const MotionTag = as === 'li' ? motion.li : motion.div

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionTag>
  )
}
