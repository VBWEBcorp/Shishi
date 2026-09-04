import type { Locale } from '@/i18n/routing'

/**
 * Texte alternatif des photos du site, par fichier et par langue.
 *
 * Rapport SEO d'août 2026 (§7) : « Renseigner les balises ALT manquantes sur toutes les
 * images, notamment les 9 visuels repérés, avec des descriptions simples et utiles pour
 * Google Images. » Neuf visuels publics portaient un `alt=""` : hero du blog, hero de la
 * galerie, bandeau CTA de l'accueil, colonnes animées du CTA, carrousel photo, panneau du
 * widget de réservation, photo de la section « Notre histoire », bannière de bas de blog et
 * image de droite des PremiumHero.
 *
 * Ces images-là ne sont pas décoratives : elles montrent le club, ses terrains, sa piscine
 * et son kids club. Elles ont donc droit à une description réelle, dans la langue de la page.
 *
 * Le fichier est la source de vérité : une photo décrite ici l'est partout où elle sert,
 * plutôt que d'écrire une phrase différente dans chaque composant.
 *
 * Écrire un ALT vide reste légitime pour un visuel purement décoratif (drapeau de pays à
 * côté du nom du pays, dégradé, filet), et ceux-là ne passent pas par cette table.
 */

const CLUB = { en: 'Shi Shi Samui', fr: 'Shi Shi Samui' }
const LIEU = { en: 'Lamai, Koh Samui', fr: 'Lamai, Koh Samui' }

const ALTS: Record<string, { en: string; fr: string }> = {
  'cta-pret-a-jouer.png': {
    en: `Pool, sun loungers and thatched pool bar at ${CLUB.en} in ${LIEU.en}`,
    fr: `Piscine, transats et pool bar sous toit de chaume de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-panorama-portrait.webp': {
    en: `Swimming pool and tennis courts seen from the sun deck at ${CLUB.en} in ${LIEU.en}`,
    fr: `Piscine et terrains de tennis vus depuis la terrasse de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-grand-angle-portrait.webp': {
    en: `Wide view of the swimming pool, sun loungers and sala at ${CLUB.en} in ${LIEU.en}`,
    fr: `Vue grand angle de la piscine, des transats et du sala de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-courts-portrait.webp': {
    en: `Pool terrace with the tennis and pickleball courts behind, ${CLUB.en}, ${LIEU.en}`,
    fr: `Terrasse de la piscine avec les terrains de tennis et de pickleball en fond, ${CLUB.fr}, ${LIEU.fr}`,
  },
  'pool-transats-portrait.webp': {
    en: `Sun loungers and parasols along the pool at ${CLUB.en} in ${LIEU.en}`,
    fr: `Transats et parasols au bord de la piscine de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-parasols-portrait.webp': {
    en: `Shaded poolside daybeds under large parasols at ${CLUB.en} in ${LIEU.en}`,
    fr: `Bains de soleil ombragés sous de grands parasols au bord de la piscine de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-sala-portrait.webp': {
    en: `Swimming pool, paddling area and covered sala at ${CLUB.en} in ${LIEU.en}`,
    fr: `Piscine, pataugeoire et sala couvert de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-bar.jpg': {
    en: `Pool bar at ${CLUB.en} in ${LIEU.en}`,
    fr: `Pool bar de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool.jpg': {
    en: `Swimming pool at ${CLUB.en} in ${LIEU.en}`,
    fr: `Piscine de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pool-2.jpg': {
    en: `Poolside at ${CLUB.en} in ${LIEU.en}`,
    fr: `Bord de piscine de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'tennis-court-portrait.webp': {
    en: `Blue hard tennis court under the palms at ${CLUB.en} in ${LIEU.en}`,
    fr: `Terrain de tennis en dur bleu sous les palmiers de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'tennis-jardin-portrait.webp': {
    en: `Tennis court and garden at ${CLUB.en} in ${LIEU.en}`,
    fr: `Terrain de tennis et jardin de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'tennis-aerial.jpg': {
    en: `Aerial view of the tennis courts at ${CLUB.en} in ${LIEU.en}`,
    fr: `Vue aérienne des terrains de tennis de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'pickleball.jpg': {
    en: `Pickleball court at ${CLUB.en} in ${LIEU.en}`,
    fr: `Terrain de pickleball de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'fitness-portrait.webp': {
    en: `Air-conditioned gym opening onto the garden at ${CLUB.en} in ${LIEU.en}`,
    fr: `Salle de fitness climatisée ouverte sur le jardin de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'fitness.jpg': {
    en: `Fitness equipment in the gym at ${CLUB.en} in ${LIEU.en}`,
    fr: `Matériel de musculation de la salle de fitness de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'fitness-2.jpg': {
    en: `Cardio and weights area of the gym at ${CLUB.en} in ${LIEU.en}`,
    fr: `Espace cardio et musculation de la salle de fitness de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'restaurant.jpg': {
    en: `Open-air healthy restaurant and lounge at ${CLUB.en} in ${LIEU.en}`,
    fr: `Restaurant healthy en plein air et son lounge à ${CLUB.fr}, ${LIEU.fr}`,
  },
  'restaurant-2.jpg': {
    en: `Dining terrace of the healthy restaurant at ${CLUB.en} in ${LIEU.en}`,
    fr: `Terrasse du restaurant healthy de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'lounge.jpg': {
    en: `Lounge area at ${CLUB.en} in ${LIEU.en}`,
    fr: `Espace lounge de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'kids-aire-jeu-portrait.webp': {
    en: `Shi Shi Kids outdoor play area with slide and ride-on toys, ${LIEU.en}`,
    fr: `Aire de jeu extérieure Shi Shi Kids avec toboggan et porteurs, ${LIEU.fr}`,
  },
  'equipe-kids-bulles-portrait.webp': {
    en: `Shi Shi Kids team blowing bubbles in the kids club, ${LIEU.en}`,
    fr: `L'équipe Shi Shi Kids fait des bulles dans le club enfants, ${LIEU.fr}`,
  },
  'equipe-kids-portrait.webp': {
    en: `Shi Shi Kids team in the kids club at ${CLUB.en}, ${LIEU.en}`,
    fr: `L'équipe Shi Shi Kids dans le club enfants de ${CLUB.fr}, ${LIEU.fr}`,
  },
  'kids-club.jpg': {
    en: `Indoor kids club at ${CLUB.en} in ${LIEU.en}`,
    fr: `Club enfants couvert de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'kids-outdoor.jpg': {
    en: `Children playing outdoors at ${CLUB.en} in ${LIEU.en}`,
    fr: `Enfants qui jouent en extérieur à ${CLUB.fr}, ${LIEU.fr}`,
  },
  'kids-play.jpg': {
    en: `Play area of the kids club at ${CLUB.en} in ${LIEU.en}`,
    fr: `Espace de jeu du club enfants de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'kids-trampoline.jpg': {
    en: `Trampoline in the kids club garden at ${CLUB.en} in ${LIEU.en}`,
    fr: `Trampoline du jardin du club enfants de ${CLUB.fr} à ${LIEU.fr}`,
  },
  'kids-welcome.jpg': {
    en: `Welcome desk of the kids club at ${CLUB.en} in ${LIEU.en}`,
    fr: `Accueil du club enfants de ${CLUB.fr} à ${LIEU.fr}`,
  },
}

/** Repli : jamais vide, jamais « image », toujours le club et sa ville. */
const FALLBACK = {
  en: `${CLUB.en}, sports and social club in ${LIEU.en}`,
  fr: `${CLUB.fr}, club de sport et de loisirs à ${LIEU.fr}`,
}

/**
 * ALT d'une photo du site à partir de son chemin. Les images déposées depuis l'espace
 * admin (R2, Unsplash…) ne sont pas dans la table : `titre` sert alors de description,
 * et le repli ferme la marche.
 */
export function photoAlt(src: string | undefined, locale: Locale = 'en', titre?: string): string {
  const l: 'en' | 'fr' = locale === 'fr' ? 'fr' : 'en'
  if (src) {
    const file = src.split('?')[0].split('/').pop() ?? ''
    const found = ALTS[file]
    if (found) return found[l]
  }
  const t = titre?.trim()
  if (t) return `${t} (${CLUB[l]}, ${LIEU[l]})`
  return FALLBACK[l]
}
