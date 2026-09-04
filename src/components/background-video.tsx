'use client'

import { useEffect, useState } from 'react'

/**
 * Vidéo de fond décorative, chargée APRÈS le reste de la page.
 *
 * Rapport SEO d'août 2026 (§6) : le mobile plafonne à 74/100, avec un Speed Index de
 * 5,1 s et un temps de blocage de 800 ms. Les quatre héros du site posaient une vidéo
 * en `preload="auto"` : le navigateur la téléchargeait en concurrence directe avec le
 * texte, les polices et les images du premier écran, sur une connexion de vacances en
 * Thaïlande. La photo de fond, elle, était déjà là.
 *
 * Ce composant ne change rien à ce que le visiteur voit une fois la page chargée. Il
 * décale seulement le moment : la balise <video> n'apparaît qu'une fois la page chargée
 * ET le fil principal libre, et le navigateur ne préchargera rien de son côté.
 *
 * Quatre cas où la vidéo ne se charge pas du tout, la photo de fond suffisant :
 *  · l'écran est plus étroit que `minLargeur` (1024 px par défaut, donc : pas de vidéo
 *    de fond sur téléphone ni sur tablette) ;
 *  · l'utilisateur a demandé à réduire les animations (avant, on téléchargeait la vidéo
 *    pour la masquer ensuite en CSS : le poids était payé pour rien) ;
 *  · le navigateur signale un mode « économie de données » ;
 *  · la connexion est annoncée en 2G.
 *
 * POURQUOI COUPER SUR MOBILE. `public/videos/hero-pool.mp4` pèse 40 Mo. C'est le fond de
 * l'accueil, de la page Réserver et de la page piscine. Quarante mégaoctets sur une donnée
 * mobile en Thaïlande pour un décor derrière un voile sombre, alors que le rapport d'août
 * 2026 mesure justement le mobile à 74/100 avec un Speed Index de 5,1 s : le calcul est vite
 * fait. Le visiteur mobile garde la photo, nette et immédiate.
 *
 * Pour rétablir la vidéo partout : passer `minLargeur={0}` à l'appel concerné. Et si le
 * client fournit un jour une version web du fichier (720p, sans audio, quelques mégaoctets),
 * la question ne se pose plus.
 */
export function BackgroundVideo({
  src,
  poster,
  className,
  onReady,
  minLargeur = 1024,
}: {
  src?: string
  poster?: string
  className?: string
  /** Appelé au premier `canplay`, pour un fondu d'apparition côté appelant. */
  onReady?: () => void
  /** Largeur d'écran minimale pour charger la vidéo. `0` = toujours la charger. */
  minLargeur?: number
}) {
  const [monte, setMonte] = useState(false)

  useEffect(() => {
    if (!src) return
    setMonte(false)

    if (minLargeur > 0 && window.innerWidth < minLargeur) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const reseau = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string }
      }
    ).connection
    if (reseau?.saveData) return
    if (typeof reseau?.effectiveType === 'string' && reseau.effectiveType.includes('2g')) return

    let annule = false
    const afficher = () => {
      if (!annule) setMonte(true)
    }
    const planifier = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void })
        .requestIdleCallback
      if (idle) idle(afficher, { timeout: 3000 })
      else setTimeout(afficher, 1200)
    }

    if (document.readyState === 'complete') {
      planifier()
    } else {
      window.addEventListener('load', planifier, { once: true })
    }

    return () => {
      annule = true
      window.removeEventListener('load', planifier)
    }
  }, [src, minLargeur])

  if (!src || !monte) return null

  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      onCanPlay={onReady}
      aria-hidden
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  )
}
