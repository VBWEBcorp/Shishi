import { activities, type Localized } from '@/lib/activities'

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
    { label: { en: 'Day pass', fr: 'Pass journée' }, amount: 250 },
    { label: { en: 'Week', fr: 'Semaine' }, amount: 1000 },
    { label: { en: 'Month', fr: 'Mois' }, amount: 1500 },
  ],
  pool: [{ label: { en: 'Day access', fr: 'Accès journée' }, amount: 100 }],
}

/** Horaires d'ouverture affichés par activité (charte client). */
export const OPENING_HOURS: Record<string, Localized> = {
  'kids-club': { en: '8 AM – 4 PM', fr: '8H – 16H' },
  fitness: { en: '8 AM – 8 PM', fr: '8H – 20H' },
  tennis: { en: '8 AM – 8 PM', fr: '8H – 20H' },
  pool: { en: 'All day', fr: 'À la journée' },
}
