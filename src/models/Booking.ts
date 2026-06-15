import mongoose, { Schema, Document } from 'mongoose'

export type BookingStatus = 'pending' | 'paid' | 'cancelled' | 'failed'

export interface IBooking extends Document {
  activitySlug: string
  activityName: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  duration: number // minutes
  name: string
  email: string
  phone?: string
  notes?: string
  amount: number // montant lisible (ex: 500 = 500 THB)
  currency: string
  /** Nombre total de participants (titulaire inclus). */
  partySize?: number
  /** Participants additionnels (hors titulaire) — chacun aussi enregistré en CRM. */
  participants?: { name: string; email: string; phone?: string }[]
  status: BookingStatus
  stripeSessionId?: string
  /** Langue dans laquelle la réservation a été faite (emails dans cette langue). */
  locale?: 'en' | 'fr'
  /** Vue par l'admin (pour la cloche de notifications). */
  seen?: boolean
  seenAt?: Date
  /** Rappel « 1 h avant » envoyé (anti-doublon du cron). */
  reminderSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const BookingSchema = new Schema<IBooking>(
  {
    activitySlug: { type: String, required: true },
    activityName: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    duration: { type: Number, default: 60 },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    notes: String,
    amount: { type: Number, required: true },
    currency: { type: String, default: 'thb' },
    partySize: { type: Number, default: 1 },
    participants: [
      {
        _id: false,
        name: String,
        email: String,
        phone: String,
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'failed'],
      default: 'pending',
    },
    stripeSessionId: String,
    locale: { type: String, enum: ['en', 'fr'], default: 'en' },
    seen: { type: Boolean, default: false },
    seenAt: Date,
    reminderSentAt: Date,
  },
  { timestamps: true }
)

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
