import 'server-only'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { getPlan, PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'

/**
 * Système d'abonnement à CRÉDITS mensuels (Phase 2) — logique SERVEUR.
 *
 *  · Chaque abonnement octroie un nombre de crédits valables 1 mois.
 *  · Les crédits non utilisés sont perdus au renouvellement (remise à zéro).
 *  · 1 crédit = 1 heure de réservation.
 *  · L'adhérent bénéficie d'une remise automatique (10 % à 30 %) sur les
 *    paiements et d'une réservation jusqu'à 10 jours à l'avance.
 *
 * Les données PURES des formules vivent dans `membership-plans.ts` (partagées
 * avec le client). ⚠️ Grille provisoire — à remplacer par la grille officielle.
 */

export {
  MEMBER_PLANS,
  PAID_PLANS,
  getPlan,
  PUBLIC_ADVANCE_DAYS,
  MEMBER_ADVANCE_DAYS,
  type MembershipPlanConfig,
} from '@/lib/membership-plans'

/** Les crédits sont-ils encore valides (période non expirée) ? */
export function creditsValid(renewAt?: Date | null): boolean {
  if (!renewAt) return true
  return new Date(renewAt).getTime() > Date.now()
}

export interface MemberRef {
  id: string
  email?: string
}

export interface MemberBenefits {
  /** Montant restant à payer après remise / crédits. */
  amountDue: number
  /** Crédits qui seront débités pour cette réservation. */
  creditsUsed: number
  /** Taux de remise appliqué (0 si aucun). */
  discountRate: number
  /** Fenêtre de réservation à l'avance autorisée (jours). */
  advanceBookingDays: number
  /** Débite réellement les crédits de l'adhérent (à appeler après création). */
  commitCredits: (bookingId: string) => Promise<void>
}

const NO_BENEFITS = (baseAmount: number): MemberBenefits => ({
  amountDue: baseAmount,
  creditsUsed: 0,
  discountRate: 0,
  advanceBookingDays: PUBLIC_ADVANCE_DAYS,
  commitCredits: async () => {},
})

/**
 * Calcule les avantages appliqués à une réservation pour un adhérent connecté.
 * Priorité aux crédits : si l'adhérent a assez de crédits valides pour couvrir
 * la durée, la réservation est gratuite (crédits débités) ; sinon on applique
 * la remise de son abonnement au montant à payer.
 */
export async function resolveMemberBenefits(opts: {
  member: MemberRef | null
  activitySlug: string
  hours: number
  partySize: number
  baseAmount: number
}): Promise<MemberBenefits> {
  const { member, hours, baseAmount } = opts
  if (!member?.id) return NO_BENEFITS(baseAmount)

  await connectDB()
  const user = await User.findById(member.id).select('plan credits renewAt')
  if (!user || user.plan === 'none') return NO_BENEFITS(baseAmount)

  const plan = getPlan(user.plan)
  const valid = creditsValid(user.renewAt)
  const available = valid ? Math.max(0, user.credits || 0) : 0
  const creditsNeeded = Math.max(1, Math.floor(hours) || 1)

  // Assez de crédits → réservation couverte par les crédits.
  if (available >= creditsNeeded) {
    return {
      amountDue: 0,
      creditsUsed: creditsNeeded,
      discountRate: plan.discountRate,
      advanceBookingDays: plan.advanceDays,
      commitCredits: async () => {
        await User.findByIdAndUpdate(member.id, { $inc: { credits: -creditsNeeded } })
      },
    }
  }

  // Sinon : remise membre sur le montant à payer.
  const amountDue = Math.round(baseAmount * (1 - plan.discountRate))
  return {
    amountDue,
    creditsUsed: 0,
    discountRate: plan.discountRate,
    advanceBookingDays: plan.advanceDays,
    commitCredits: async () => {},
  }
}
