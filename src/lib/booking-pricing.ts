import { activities } from '@/lib/activities'

/**
 * Tarifs de réservation "drop-in" par activité, en unité lisible de la devise
 * (ex: 500 = 500 THB). PLACEHOLDER — les prix officiels viendront du client
 * (VBWEB). Modifier ici met à jour le moteur de réservation partout.
 */
const DROP_IN_PRICE: Record<string, number> = {
  pickleball: 500,
  tennis: 600,
  fitness: 300,
  restaurant: 0,
  'kids-club': 400,
  pool: 200,
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
