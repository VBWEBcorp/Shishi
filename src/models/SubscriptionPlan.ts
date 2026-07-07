import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

/**
 * Abonnement (catalogue réutilisable géré par l'admin).
 *
 * Un abonnement = un nom, un prix indicatif et un lot de crédits MENSUELS par
 * activité. L'admin le crée une fois ici puis l'applique à un membre en 1 clic :
 * cela met en place la recharge automatique mensuelle correspondante sur sa
 * fiche. Aucune souscription en ligne — tout passe par l'admin (paiement sur
 * place, jour J).
 */
export interface IPlanActivityCredit {
  /** Slug d'activité (tennis, fitness…). */
  activity: string
  /** Crédits offerts chaque mois pour cette activité. */
  monthly: number
}

export interface ISubscriptionPlan extends Document {
  name: string
  /** Prix mensuel indicatif (THB) — encaissé sur place. */
  priceTHB: number
  /**
   * Total de crédits mensuels inclus (le « budget » de l'abonnement). La somme
   * des crédits répartis par activité ne peut pas le dépasser.
   */
  monthlyTotal: number
  /** Crédits mensuels par activité octroyés par l'abonnement. */
  credits: IPlanActivityCredit[]
  /** Abonnement proposable (décoché = archivé, sans suppression). */
  active: boolean
  createdAt: Date
  updatedAt: Date
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
  {
    name: { type: String, required: true, trim: true },
    priceTHB: { type: Number, default: 0 },
    monthlyTotal: { type: Number, default: 0 },
    credits: {
      type: [
        {
          _id: false,
          activity: { type: String, required: true },
          monthly: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
)

export default registerModel<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema)
