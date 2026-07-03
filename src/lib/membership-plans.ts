import type { Localized } from '@/lib/activities'

/**
 * Données PURES des formules d'abonnement (utilisables côté client ET serveur).
 * La logique serveur (crédits, remises) vit dans `membership.ts`.
 *
 * ⚠️ GRILLE PROVISOIRE — à remplacer par la grille officielle du client au
 * lancement du nouveau site.
 */

export type MembershipPlan = 'none' | 'bronze' | 'silver' | 'gold'

export interface MembershipPlanConfig {
  id: MembershipPlan
  name: Localized
  /** Crédits mensuels octroyés. */
  credits: number
  /** Remise automatique appliquée aux paiements (0.10 = 10 %). */
  discountRate: number
  /** Nombre de jours de réservation à l'avance autorisés. */
  advanceDays: number
  /** Prix mensuel indicatif (THB) — provisoire. */
  priceTHB: number
  /** Points forts affichés sur la carte d'abonnement. */
  perks: Localized[]
}

/** Fenêtre de réservation à l'avance pour un client SANS abonnement (jours). */
export const PUBLIC_ADVANCE_DAYS = 3
/** Fenêtre de réservation à l'avance pour un adhérent (jours). */
export const MEMBER_ADVANCE_DAYS = 10

export const MEMBER_PLANS: Record<MembershipPlan, MembershipPlanConfig> = {
  none: {
    id: 'none',
    name: { en: 'No membership', fr: 'Sans abonnement' },
    credits: 0,
    discountRate: 0,
    advanceDays: PUBLIC_ADVANCE_DAYS,
    priceTHB: 0,
    perks: [],
  },
  bronze: {
    id: 'bronze',
    name: { en: 'Bronze', fr: 'Bronze' },
    credits: 8,
    discountRate: 0.1,
    advanceDays: MEMBER_ADVANCE_DAYS,
    priceTHB: 2500,
    perks: [
      { en: '8 monthly credits', fr: '8 crédits par mois' },
      { en: '10% member discount', fr: '10 % de remise membre' },
      { en: 'Book up to 10 days ahead', fr: "Réservation jusqu'à 10 jours à l'avance" },
    ],
  },
  silver: {
    id: 'silver',
    name: { en: 'Silver', fr: 'Argent' },
    credits: 16,
    discountRate: 0.2,
    advanceDays: MEMBER_ADVANCE_DAYS,
    priceTHB: 4500,
    perks: [
      { en: '16 monthly credits', fr: '16 crédits par mois' },
      { en: '20% member discount', fr: '20 % de remise membre' },
      { en: 'Book up to 10 days ahead', fr: "Réservation jusqu'à 10 jours à l'avance" },
    ],
  },
  gold: {
    id: 'gold',
    name: { en: 'Gold', fr: 'Or' },
    credits: 30,
    discountRate: 0.3,
    advanceDays: MEMBER_ADVANCE_DAYS,
    priceTHB: 7500,
    perks: [
      { en: '30 monthly credits', fr: '30 crédits par mois' },
      { en: '30% member discount', fr: '30 % de remise membre' },
      { en: 'Book up to 10 days ahead', fr: "Réservation jusqu'à 10 jours à l'avance" },
    ],
  },
}

/** Liste ordonnée des formules payantes (hors « none »), pour l'affichage. */
export const PAID_PLANS: MembershipPlanConfig[] = [
  MEMBER_PLANS.bronze,
  MEMBER_PLANS.silver,
  MEMBER_PLANS.gold,
]

export function getPlan(plan: MembershipPlan | undefined | null): MembershipPlanConfig {
  return MEMBER_PLANS[plan ?? 'none'] ?? MEMBER_PLANS.none
}
