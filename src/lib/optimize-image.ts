import sharp from 'sharp'

interface OptimizeOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
}

/**
 * Bornes de redimensionnement, volontairement CARRÉES.
 *
 * Un cadre 1920×1080 pénalise lourdement les photos verticales : une photo
 * d'iPhone en portrait (3024×4032) se retrouve limitée par sa hauteur et tombe
 * à 810×1080 — trop peu pour un écran de téléphone moderne, qui affiche autour
 * de 1200 px de large en pixels réels. Avec un cadre carré, la même photo sort
 * en 1500×2000 : nette sur mobile, et toujours légère une fois en WebP.
 *
 * Le club photographie au téléphone, donc en portrait : c'est le cas courant
 * ici, pas l'exception.
 */
const MAX_EDGE = 2000

/** Qualité WebP. 82 : gain de poids net sans artefact visible sur des photos. */
const DEFAULT_QUALITY = 82

export async function optimizeImage(
  buffer: Buffer,
  options: OptimizeOptions = {}
): Promise<{ buffer: Buffer; contentType: string; ext: string }> {
  const { maxWidth = MAX_EDGE, maxHeight = MAX_EDGE, quality = DEFAULT_QUALITY } = options

  // `rotate()` sans argument applique l'orientation EXIF puis l'efface. Sans
  // lui, une photo prise en tenant le téléphone de côté s'afficherait couchée :
  // les navigateurs ne lisent pas l'EXIF des WebP générés ici.
  const image = sharp(buffer).rotate()
  const metadata = await image.metadata()

  if (
    (metadata.width && metadata.width > maxWidth) ||
    (metadata.height && metadata.height > maxHeight)
  ) {
    image.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true })
  }

  const optimized = await image.webp({ quality }).toBuffer()

  return {
    buffer: optimized,
    contentType: 'image/webp',
    ext: 'webp',
  }
}
