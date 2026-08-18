/**
 * Images à deux formats (Pilier « art direction »).
 *
 * Le club photographie au téléphone, donc en PORTRAIT, alors qu'un hero ou une
 * tuile plein écran sur ordinateur réclame du PAYSAGE. Recadrer un portrait en
 * 16:9 coupe l'essentiel de la photo ; forcer un paysage sur mobile la réduit à
 * une bande. D'où la possibilité de fournir DEUX fichiers pour un même
 * emplacement, et de laisser le navigateur choisir selon la largeur d'écran.
 *
 * Le format de stockage est volontairement rétro-compatible :
 *  · une chaîne          → une seule photo, recadrée sur tous les écrans
 *                          (c'est tout le contenu existant, rien à migrer) ;
 *  · { desktop, mobile } → la paire. `mobile` reste optionnel : vide, on
 *                          retombe sur `desktop` exactement comme avant.
 *
 * Toute valeur venant du CMS peut donc être passée telle quelle à
 * `resolveResponsiveImage` sans savoir laquelle des deux formes elle a.
 */

/** Une image d'emplacement : soit une URL simple, soit une paire de formats. */
export type ResponsiveImageValue =
  | string
  | {
      /** Photo utilisée sur ordinateur / tablette large (idéalement paysage). */
      desktop: string
      /** Photo utilisée sur téléphone (idéalement portrait). Optionnelle. */
      mobile?: string
    }

/** Paire résolue, prête à rendre. `mobile` est null quand il n'y a qu'une photo. */
export interface ResolvedResponsiveImage {
  desktop: string
  mobile: string | null
  /** true quand deux fichiers distincts sont réellement fournis. */
  hasBothFormats: boolean
}

/** Largeur (px) en dessous de laquelle on sert la version téléphone. */
export const MOBILE_BREAKPOINT = 768

/** Media query servant la version téléphone — partagée par le rendu et l'admin. */
export const MOBILE_MEDIA_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

/**
 * Ramène n'importe quelle valeur d'image du CMS à une paire exploitable.
 * Ne lève jamais : une valeur absente ou malformée donne une paire vide, à
 * charge de l'appelant de ne rien rendre.
 */
export function resolveResponsiveImage(
  value: ResponsiveImageValue | null | undefined
): ResolvedResponsiveImage {
  if (typeof value === 'string') {
    const url = value.trim()
    return { desktop: url, mobile: null, hasBothFormats: false }
  }

  if (value && typeof value === 'object') {
    const desktop = (value.desktop || '').trim()
    const mobile = (value.mobile || '').trim()
    // Une paire dont les deux côtés sont identiques ne justifie pas un second
    // <source> : on la ramène au cas simple.
    if (mobile && mobile !== desktop) {
      // `desktop` peut être vide si seule la version téléphone a été remplie :
      // on s'en sert alors partout plutôt que de ne rien afficher.
      return desktop
        ? { desktop, mobile, hasBothFormats: true }
        : { desktop: mobile, mobile: null, hasBothFormats: false }
    }
    return { desktop, mobile: null, hasBothFormats: false }
  }

  return { desktop: '', mobile: null, hasBothFormats: false }
}

/** URL à utiliser quand un seul visuel est possible (miniature, og:image, JSON-LD). */
export function primaryImageUrl(value: ResponsiveImageValue | null | undefined): string {
  return resolveResponsiveImage(value).desktop
}

/** Y a-t-il quelque chose à afficher ? */
export function hasImage(value: ResponsiveImageValue | null | undefined): boolean {
  return resolveResponsiveImage(value).desktop.length > 0
}

/**
 * Construit une valeur d'image à partir des deux champs de l'espace admin.
 * Renvoie une simple chaîne quand la version téléphone est vide, pour ne pas
 * alourdir le contenu enregistré avec des objets à une seule clé utile.
 */
export function buildResponsiveImage(desktop: string, mobile: string): ResponsiveImageValue {
  const d = (desktop || '').trim()
  const m = (mobile || '').trim()
  if (!m || m === d) return d
  return { desktop: d, mobile: m }
}
