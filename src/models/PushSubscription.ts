import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

/**
 * Appareils du club abonnés aux notifications de réservation.
 *
 * Une ligne = un navigateur sur un appareil. Le téléphone de chacun des deux
 * gérants et la tablette de l'accueil font donc trois lignes, et une nouvelle
 * réservation les fait sonner tous les trois.
 *
 * `endpoint` est l'adresse que le navigateur donne au service de notification
 * (Apple, Google, Mozilla). C'est elle qui identifie l'appareil : elle est
 * unique, et elle change si l'utilisateur réinstalle ou révoque l'autorisation.
 * D'où l'index unique : réactiver les notifications sur un appareil déjà connu
 * met la ligne à jour au lieu d'en créer une deuxième, ce qui ferait deux
 * notifications pour une seule réservation.
 */
export interface IPushSubscription extends Document {
  endpoint: string
  keys: { p256dh: string; auth: string }
  /** Étiquette lisible, pour reconnaître l'appareil dans l'espace admin. */
  label?: string
  /** Dernière fois qu'une notification y a été envoyée sans erreur. */
  lastSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const PushSubscriptionSchema = new Schema<IPushSubscription>(
  {
    endpoint: { type: String, required: true, unique: true, index: true },
    keys: {
      p256dh: { type: String, required: true },
      auth: { type: String, required: true },
    },
    label: { type: String, default: '' },
    lastSentAt: Date,
  },
  { timestamps: true }
)

export const PushSubscription = registerModel<IPushSubscription>(
  'PushSubscription',
  PushSubscriptionSchema
)

export default PushSubscription
