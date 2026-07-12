import 'server-only'
import { connectDB } from '@/lib/db'
import User, { type IActivityCredit } from '@/models/User'
import { MEMBER_ADVANCE_DAYS, PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'

/**
 * Système de CRÉDITS PAR ACTIVITÉ — logique SERVEUR.
 *
 *  · Chaque crédit est PROPRE à une activité (ex. crédits tennis) :
 *    1 crédit = 1 h (ou 1 accès) de cette activité, non transférable.
 *  · L'admin attribue les crédits lors du passage au club (paiement sur
 *    place) : en ponctuel (valables 1 mois, perdus à l'expiration) ou en
 *    recharge AUTOMATIQUE mensuelle (le solde repart à N chaque mois).
 *  · À la réservation, si le portefeuille de l'activité couvre la durée, la
 *    réservation est gratuite et les crédits sont débités. Sinon : plein
 *    tarif, paiement sur place.
 *  · Un adhérent connecté peut réserver jusqu'à 10 jours à l'avance
 *    (3 jours pour le public).
 */

export { MEMBER_ADVANCE_DAYS, PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'

/** Durée d'une période de crédits (mois glissant). */
export const CREDIT_PERIOD_MS = 30 * 24 * 60 * 60 * 1000

/**
 * État COURANT d'un portefeuille d'activité, rollover appliqué (pur, sans
 * écriture). Période expirée : `monthly` > 0 → le solde repart à `monthly`
 * sur la période suivante ; sinon les crédits sont perdus.
 */
export function effectiveWallet(
  w: IActivityCredit,
  now = Date.now()
): { credits: number; renewAt: Date | null } {
  const renewAt = w.renewAt ? new Date(w.renewAt) : null
  // Période encore valide (ou crédits sans échéance) → solde tel quel.
  if (!renewAt || renewAt.getTime() > now) return { credits: Math.max(0, w.credits || 0), renewAt }
  // Expirée sans automatique → plus rien.
  if (!(w.monthly > 0)) return { credits: 0, renewAt }
  // Automatique : avance de périodes de 30 j jusqu'à retomber dans le futur.
  const next = new Date(renewAt)
  while (next.getTime() <= now) next.setTime(next.getTime() + CREDIT_PERIOD_MS)
  return { credits: w.monthly, renewAt: next }
}

export interface MemberRef {
  id: string
  email?: string
}

export interface MemberBenefits {
  /** Montant restant à payer (0 si couvert par les crédits). */
  amountDue: number
  /** Crédits qui seront débités pour cette réservation. */
  creditsUsed: number
  /** Fenêtre de réservation à l'avance autorisée (jours). */
  advanceBookingDays: number
  /**
   * Débite les crédits de l'adhérent de façon ATOMIQUE et conditionnelle.
   * À appeler AVANT de figer la réservation. Renvoie `true` si le débit a bien
   * eu lieu, `false` si le solde ne couvrait plus (crédits consommés entre-temps
   * par une réservation simultanée) → la réservation doit alors basculer en
   * plein tarif. Empêche la double-dépense.
   */
  commitCredits: () => Promise<boolean>
}

const NO_BENEFITS = (baseAmount: number): MemberBenefits => ({
  amountDue: baseAmount,
  creditsUsed: 0,
  advanceBookingDays: PUBLIC_ADVANCE_DAYS,
  commitCredits: async () => false,
})

/**
 * Calcule les avantages appliqués à une réservation pour un adhérent connecté.
 * Si le portefeuille de l'activité réservée couvre la durée (1 crédit = 1 h),
 * la réservation est gratuite et les crédits sont débités ; sinon plein tarif
 * (paiement sur place). Tout adhérent connecté réserve 10 j à l'avance.
 */
export async function resolveMemberBenefits(opts: {
  member: MemberRef | null
  activitySlug: string
  hours: number
  partySize: number
  baseAmount: number
}): Promise<MemberBenefits> {
  const { member, activitySlug, hours, baseAmount } = opts
  if (!member?.id) return NO_BENEFITS(baseAmount)

  await connectDB()
  const user = await User.findById(member.id).select('activityCredits')
  if (!user) return NO_BENEFITS(baseAmount)

  const creditsNeeded = Math.max(1, Math.floor(hours) || 1)
  const wallet = (user.activityCredits || []).find((w) => w.activity === activitySlug)

  if (wallet) {
    const eff = effectiveWallet(wallet)
    if (eff.credits >= creditsNeeded) {
      // La période a-t-elle été avancée par le rollover ? (période expirée +
      // recharge auto). Si oui, il faut matérialiser le nouveau solde en base.
      const storedRenewAt = wallet.renewAt ? new Date(wallet.renewAt) : null
      const rolledRenewAt = eff.renewAt
      const rolled =
        !!rolledRenewAt && (!storedRenewAt || storedRenewAt.getTime() !== rolledRenewAt.getTime())
      const rolledCredits = eff.credits // = `monthly` en cas de rollover

      return {
        amountDue: 0,
        creditsUsed: creditsNeeded,
        advanceBookingDays: MEMBER_ADVANCE_DAYS,
        commitCredits: async () => {
          // 1) Matérialise le rollover mensuel si la période était expirée.
          //    Conditionnel (`renewAt` encore ancien) et idempotent : une seule
          //    des réservations concurrentes réinitialise le solde à `monthly`.
          if (rolled && rolledRenewAt) {
            await User.updateOne(
              {
                _id: member.id,
                activityCredits: {
                  $elemMatch: { activity: activitySlug, monthly: { $gt: 0 }, renewAt: { $lt: rolledRenewAt } },
                },
              },
              {
                $set: {
                  'activityCredits.$.credits': rolledCredits,
                  'activityCredits.$.renewAt': rolledRenewAt,
                },
              }
            )
          }

          // 2) Débit ATOMIQUE et conditionnel : ne débite QUE si le solde courant
          //    couvre le besoin. MongoDB sérialise les écritures d'un même
          //    document → deux réservations simultanées ne peuvent pas dépenser
          //    plus que le solde disponible (anti double-dépense).
          const res = await User.updateOne(
            {
              _id: member.id,
              activityCredits: { $elemMatch: { activity: activitySlug, credits: { $gte: creditsNeeded } } },
            },
            { $inc: { 'activityCredits.$.credits': -creditsNeeded } }
          )
          return (res.modifiedCount ?? 0) === 1
        },
      }
    }
  }

  // Pas (assez) de crédits pour cette activité : plein tarif, mais fenêtre
  // de réservation membre conservée.
  return {
    amountDue: baseAmount,
    creditsUsed: 0,
    advanceBookingDays: MEMBER_ADVANCE_DAYS,
    commitCredits: async () => false,
  }
}
