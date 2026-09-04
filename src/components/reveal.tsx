'use client'

import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Apparition douce au scroll (fondu + léger glissement vers le haut), une seule
 * fois quand l'élément entre dans le viewport. Respecte « prefers-reduced-motion »
 * (rendu statique sans animation pour les utilisateurs concernés).
 *
 * Utilisé pour révéler progressivement les sections de l'accueil « au fur et à
 * mesure » du défilement.
 *
 * ANIMATION EN CSS, PAS EN JAVASCRIPT. Ce composant s'appuyait sur framer-motion :
 * six sections de l'accueil, donc six composants animés à hydrater et six boucles
 * d'animation pilotées par le fil principal, pour un simple fondu. Le rapport SEO
 * d'août 2026 (§6, §7) mesure 800 ms de temps de blocage sur mobile et demande
 * d'alléger les scripts chargés au démarrage : un fondu n'a pas à coûter ça.
 *
 * Ne reste ici qu'un IntersectionObserver, natif et passif, qui pose `data-vu` au
 * moment où la section entre dans l'écran. Le fondu lui-même est une animation CSS
 * (`.reveal-defilement` dans src/index.css), donc traitée par le compositeur.
 * Le rendu à l'écran est identique.
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
  const ref = useRef<HTMLElement | null>(null)
  const [vu, setVu] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Navigateur sans IntersectionObserver : on montre, sans jamais rien cacher.
    if (typeof IntersectionObserver === 'undefined') {
      setVu(true)
      return
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setVu(true)
          observateur.disconnect()
        }
      },
      // Même marge que l'ancien réglage framer-motion : la section se révèle
      // 80 px avant d'atteindre le bas de l'écran.
      { rootMargin: '0px 0px -80px 0px' }
    )

    observateur.observe(el)
    return () => observateur.disconnect()
  }, [])

  const style = {
    '--reveal-y': `${y}px`,
    '--reveal-duree': `${duration}s`,
    '--reveal-delai': `${delay}s`,
  } as React.CSSProperties

  const classes = ['reveal-defilement', className].filter(Boolean).join(' ')

  if (as === 'li') {
    return (
      <li
        ref={ref as React.Ref<HTMLLIElement>}
        className={classes}
        style={style}
        data-vu={vu}
      >
        {children}
      </li>
    )
  }

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={classes}
      style={style}
      data-vu={vu}
    >
      {children}
    </div>
  )
}
