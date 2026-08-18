import Image from 'next/image'

import {
  MOBILE_MEDIA_QUERY,
  resolveResponsiveImage,
  type ResponsiveImageValue,
} from '@/lib/responsive-image'

interface ResponsivePhotoProps {
  /** Valeur du CMS : une URL, ou la paire { desktop, mobile }. */
  value: ResponsiveImageValue | null | undefined
  alt: string
  className?: string
  /** Remplit le parent positionné (équivalent de `fill` sur next/image). */
  fill?: boolean
  width?: number
  height?: number
  sizes?: string
  priority?: boolean
}

/**
 * Affiche une image d'emplacement en respectant les deux formats éventuels.
 *
 * Quand une seule photo est fournie, on rend un <Image> next/image normal :
 * optimisation, formats modernes et lazy-loading inchangés par rapport à
 * l'existant.
 *
 * Quand deux photos le sont, on passe à un <picture> natif avec un <source
 * media>. C'est volontaire : next/image ne sait pas faire d'art direction
 * (changer de FICHIER selon la largeur, et pas seulement de taille). Le
 * navigateur n'en télécharge alors qu'un seul — ce qu'un double <Image> masqué
 * en CSS ne permet pas, puisqu'il chargerait les deux. Les fichiers sont déjà
 * convertis en WebP et compressés à l'upload (cf. /api/upload), donc on ne perd
 * pas l'optimisation au passage.
 */
export function ResponsivePhoto({
  value,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
}: ResponsivePhotoProps) {
  const { desktop, mobile, hasBothFormats } = resolveResponsiveImage(value)

  if (!desktop) return null

  if (!hasBothFormats) {
    return (
      <Image
        src={desktop}
        alt={alt}
        className={className}
        {...(fill
          ? { fill: true, sizes: sizes ?? '100vw' }
          : { width: width ?? 1600, height: height ?? 900, sizes })}
        priority={priority}
      />
    )
  }

  return (
    <picture className={fill ? 'absolute inset-0 block h-full w-full' : undefined}>
      <source media={MOBILE_MEDIA_QUERY} srcSet={mobile ?? undefined} />
      <img
        src={desktop}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : 'lazy'}
        // `priority` sert aux visuels au-dessus de la ligne de flottaison : on
        // reproduit le comportement de next/image sans son préchargement, qui
        // ne saurait pas lequel des deux fichiers précharger.
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        {...(fill ? {} : { width, height })}
      />
    </picture>
  )
}
