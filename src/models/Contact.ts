import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

/** Origine d'un contact (un contact peut cumuler plusieurs sources). */
export type ContactSource = 'booking' | 'contact-form' | 'newsletter' | 'manual' | 'import' | 'member'

/**
 * Contact CRM — fiche unique par email, alimentée automatiquement par chaque
 * réservation (et plus tard par le formulaire de contact / inscriptions
 * newsletter). Source de vérité côté base : indépendante de Resend.
 */
export interface IContact extends Document {
  email: string
  name?: string
  /** Numéro complet avec indicatif international (ex. « +33 6 12 34 56 78 »). */
  phone?: string
  /** Pays (code ISO2, ex. FR, TH) déduit de l'indicatif choisi. */
  country?: string
  source: ContactSource[]
  tags: string[]
  /** Consentement newsletter (RGPD). */
  newsletterOptIn: boolean
  optInAt?: Date
  optInSource?: string
  unsubscribedAt?: Date
  /** Jeton stable pour le lien de désinscription en 1 clic. */
  unsubscribeToken: string
  lastBookingAt?: Date
  bookingsCount: number
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const ContactSchema = new Schema<IContact>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    name: String,
    phone: String,
    country: String,
    source: {
      type: [String],
      enum: ['booking', 'contact-form', 'newsletter', 'manual', 'import', 'member'],
      default: [],
    },
    tags: { type: [String], default: [] },
    newsletterOptIn: { type: Boolean, default: false },
    optInAt: Date,
    optInSource: String,
    unsubscribedAt: Date,
    unsubscribeToken: { type: String, index: true },
    lastBookingAt: Date,
    bookingsCount: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
)

// Liste CRM triée par activité récente (tri par défaut du panel) → index dédié.
ContactSchema.index({ updatedAt: -1 })

export const Contact = registerModel<IContact>('Contact', ContactSchema)
