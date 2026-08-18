import { activities, type Localized } from '@/lib/activities'
import { getBookingConfig, MAX_BOOKING_MINUTES } from '@/lib/availability'

/**
 * Tarifs de réservation "drop-in" par activité, en unité lisible de la devise
 * (ex: 600 = 600 THB / ฿). Source : charte tarifaire client (Shi Shi Samui).
 * Modifier ici met à jour le moteur de réservation partout.
 */
const DROP_IN_PRICE: Record<string, number> = {
  pickleball: 500,
  tennis: 600, // 600 ฿ / heure
  fitness: 250, // 250 ฿ / jour
  restaurant: 0,
  'kids-club': 200, // 200 ฿ / heure
  pool: 100, // 100 ฿ / jour
}

const DEFAULT_PRICE = 500

/** Prix drop-in d'une activité (unité lisible, ex: THB). */
export function getActivityPrice(slug: string): number {
  return DROP_IN_PRICE[slug] ?? DEFAULT_PRICE
}

/**
 * Libellé de l'UNITÉ de facturation par activité (« / heure », « / séance »…).
 * Prioritaire sur le mot par défaut déduit du type de créneau. Permet, par ex.,
 * d'afficher le fitness « par séance » (et non « par jour ») comme demandé par
 * le client, sans changer la mécanique d'accès à la journée.
 */
const UNIT_LABEL: Record<string, Localized> = {
  tennis: { en: 'hour', fr: 'heure' },
  'kids-club': { en: 'hour', fr: 'heure' },
  fitness: { en: 'session', fr: 'séance' },
  pool: { en: 'day', fr: 'jour' },
  pickleball: { en: 'hour', fr: 'heure' },
}

/** Mot d'unité tarifaire d'une activité dans la locale donnée (null si inconnu). */
export function getUnitLabel(slug: string, locale: 'en' | 'fr'): string | null {
  return UNIT_LABEL[slug]?.[locale] ?? null
}

/**
 * Activités dont le tarif se multiplie par le NOMBRE D'HEURES choisi par le
 * client (sélecteur de durée). Ex : Kids Club — l'utilisateur choisit combien
 * d'heures et le prix se met à jour automatiquement.
 */
const SUPPORTS_HOURS = new Set(['kids-club'])

/** L'activité propose-t-elle un choix du nombre d'heures (durée variable) ? */
export function supportsHours(slug: string): boolean {
  return SUPPORTS_HOURS.has(slug)
}

/** Nombre d'heures maximum réservable en une fois (activités à durée variable). */
export const MAX_BOOKING_HOURS = MAX_BOOKING_MINUTES / 60

/**
 * Offre de lancement affichée en attendant la grille d'abonnements (Phase 1).
 * Rendu sur la page Tennis et dans le moteur de réservation.
 */
export const LAUNCH_OFFER: Record<string, Localized> = {
  tennis: {
    en: 'Launch offer: flat rate of 600 THB / hour, while we prepare our upcoming, very attractive membership plans.',
    fr: "Offre de lancement : tarif unique de 600 THB / heure, en attendant de vous proposer nos offres d'inscription très intéressantes.",
  },
}

/**
 * Activités facturées PAR PERSONNE : chaque participant ajoute son tarif au
 * total. Le tennis est une réservation de TERRAIN (prix fixe par session, quel
 * que soit le nombre de joueurs) → il n'est pas dans cette liste.
 */
const PRICE_PER_PERSON = new Set(['fitness', 'kids-club', 'pool'])

/** Le tarif se multiplie-t-il par le nombre de participants ? */
export function isPricePerPerson(slug: string): boolean {
  return PRICE_PER_PERSON.has(slug)
}

/**
 * Montant total d'une réservation.
 *  · `partySize` : nombre de participants (multiplie le tarif si l'activité est
 *    facturée par personne).
 *  · `hours` : nombre d'heures choisi (multiplie le tarif pour les activités à
 *    durée variable, ex. Kids Club). Ignoré ailleurs.
 */
export function getBookingAmount(
  slug: string,
  partySize: number,
  hours = 1
): number {
  const unit = getActivityPrice(slug)
  const n = Math.max(1, Math.floor(partySize) || 1)
  const h = Math.max(1, Math.floor(hours) || 1)
  const base = isPricePerPerson(slug) ? unit * n : unit
  return supportsHours(slug) ? base * h : base
}

/**
 * Montant total d'une réservation à DURÉE LIBRE (saisie de l'espace admin).
 * Les activités facturées à l'heure (tennis, Kids Club) sont proratisées à la
 * demi-heure près : 1 h 30 de tennis = 600 × 1,5 = 900 ฿. Les pass journée
 * restent au forfait, la durée n'entrant pas en compte.
 *
 * Pour une durée d'exactement un créneau, le montant est identique à celui de
 * `getBookingAmount` : le tunnel public n'est donc pas impacté.
 */
export function getBookingAmountForMinutes(
  slug: string,
  partySize: number,
  durationMinutes: number
): number {
  const unit = getActivityPrice(slug)
  const n = Math.max(1, Math.floor(partySize) || 1)
  const base = isPricePerPerson(slug) ? unit * n : unit

  const cfg = getBookingConfig(slug)
  // Pass journée (ou activité inconnue) : tarif forfaitaire.
  if (!cfg || cfg.unit === 'day') return base

  const slotMin = cfg.slotMinutes || 60
  const minutes = Math.min(
    MAX_BOOKING_MINUTES,
    Math.max(0, Math.round(Number(durationMinutes))) || slotMin
  )
  return Math.round(base * (minutes / slotMin))
}

/** Vérifie qu'un slug correspond bien à une activité connue. */
export function getActivityBySlug(slug: string) {
  return activities.find((a) => a.slug === slug)
}

/** Un palier tarifaire affiché sur la page activité (label + montant + unité). */
export interface PriceTier {
  /** Intitulé du palier (ex: "Par heure", "Pass journée") */
  label: Localized
  /** Montant en bahts (฿) */
  amount: number
}

/**
 * Grille tarifaire officielle par activité (affichage page activité).
 * Source : charte tarifaire client. Les activités absentes utilisent le
 * placeholder "sur demande".
 */
export const PRICE_TIERS: Record<string, PriceTier[]> = {
  'kids-club': [{ label: { en: 'Per hour', fr: 'Par heure' }, amount: 200 }],
  tennis: [{ label: { en: 'Per hour', fr: 'Par heure' }, amount: 600 }],
  fitness: [
    { label: { en: 'Per session', fr: 'Par séance' }, amount: 250 },
    { label: { en: 'Week', fr: 'Semaine' }, amount: 1000 },
    { label: { en: 'Month', fr: 'Mois' }, amount: 1500 },
  ],
  pool: [{ label: { en: 'Day access', fr: 'Accès journée' }, amount: 100 }],
}

/**
 * Horaires d'ouverture affichés par activité (charte client).
 * ATTENTION — doit rester cohérent avec `BOOKING_CONFIG` (availability.ts) :
 * ici c'est du texte d'affichage, là-bas c'est ce que le moteur vend vraiment.
 * Le tennis ouvre plus large que le reste depuis le 18/08/2026.
 */
export const OPENING_HOURS: Record<string, Localized> = {
  'kids-club': { en: '8 AM – 4 PM', fr: '8H – 16H' },
  fitness: { en: '8 AM – 8 PM', fr: '8H – 20H' },
  tennis: { en: '7 AM – 10 PM', fr: '7H – 22H' },
  pool: { en: 'All day', fr: 'À la journée' },
}
