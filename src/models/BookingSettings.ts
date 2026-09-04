import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

/**
 * Réglages de la réservation en ligne, pilotés depuis l'espace admin.
 *
 * Jusqu'ici, ouvrir ou fermer les réservations demandait de changer deux
 * constantes dans le code et de redéployer le site. Le club le demande à la
 * minute : « vous mettez juste bloqué et c'est merci de nous contacter sur
 * WhatsApp », le jour où ils sont complets ou absents. Ça ne peut pas passer
 * par un déploiement.
 *
 * Trois niveaux, du plus large au plus fin :
 *  1. `online`     : l'interrupteur général. Coupé, le site n'accepte plus une
 *                    seule réservation, quelle que soit l'activité.
 *  2. `activities` : activité par activité. Le tennis peut rester ouvert
 *                    pendant que le kids club est fermé pour la semaine.
 *  3. `closures`   : des dates ou des périodes fermées (un jour, une semaine
 *                    de congés), pour tout le club ou pour une seule activité.
 *
 * Une activité absente de `activities` est considérée OUVERTE : ajouter une
 * activité au site ne doit pas la rendre silencieusement irréservable.
 */

/** Fermeture datée. Bornes incluses, format "YYYY-MM-DD". */
export interface IBookingClosure {
  from: string
  to: string
  /** Vide = tout le club. Sinon, la seule activité concernée. */
  activitySlug?: string
  /** Note interne, jamais affichée au public. */
  reason?: string
}

export interface IBookingSettings extends Document {
  /** Interrupteur général de la réservation en ligne. */
  online: boolean
  /** Ouverture par activité (slug interne). Absent = ouvert. */
  activities: Record<string, boolean>
  /** Message affiché quand c'est fermé. Vide = texte par défaut du site. */
  closedNotice: { fr: string; en: string }
  /** Périodes fermées. */
  closures: IBookingClosure[]
  updatedAt: Date
}

const ClosureSchema = new Schema<IBookingClosure>(
  {
    from: { type: String, required: true },
    to: { type: String, required: true },
    activitySlug: { type: String, default: '' },
    reason: { type: String, default: '' },
  },
  { _id: false }
)

const BookingSettingsSchema = new Schema<IBookingSettings>(
  {
    online: { type: Boolean, default: false },
    // Mixed plutôt qu'une Map : les slugs d'activité changent avec le site, et
    // on veut pouvoir en ajouter un sans migration de schéma.
    activities: { type: Schema.Types.Mixed, default: {} },
    closedNotice: {
      fr: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    closures: { type: [ClosureSchema], default: [] },
  },
  { timestamps: true }
)

export const BookingSettings = registerModel<IBookingSettings>(
  'BookingSettings',
  BookingSettingsSchema
)

export default BookingSettings
