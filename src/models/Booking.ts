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
  status: BookingStatus
  stripeSessionId?: string
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
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled', 'failed'],
      default: 'pending',
    },
    stripeSessionId: String,
  },
  { timestamps: true }
)

export const Booking =
  mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema)
