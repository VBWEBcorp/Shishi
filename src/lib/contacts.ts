import { randomBytes } from 'node:crypto'

import { connectDB } from '@/lib/db'
import { Contact, type ContactSource } from '@/models/Contact'

export interface UpsertContactInput {
  email: string
  name?: string
  /** Numéro complet avec indicatif (ex. « +33 6 12 34 56 78 »). */
  phone?: string
  /** Code pays ISO2 (FR, TH…). */
  country?: string
  source: ContactSource
  /** Consentement newsletter explicite (case cochée). */
  optIn?: boolean
  optInSource?: string
  /** Incrémente le compteur de réservations + met à jour lastBookingAt. */
  bumpBooking?: boolean
}

/**
 * Crée ou met à jour un contact CRM par email (clé unique). Idempotent :
 * accumule les sources, n'écrase pas un nom/téléphone déjà renseigné par du vide,
 * et ne ré-active jamais un contact désinscrit. Point d'entrée unique appelé par
 * la réservation, le formulaire de contact et les inscriptions newsletter.
 */
export async function upsertContact(input: UpsertContactInput) {
  const email = input.email.trim().toLowerCase()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null

  await connectDB()

  const set: Record<string, unknown> = {}
  if (input.name) set.name = input.name.trim()
  if (input.phone) set.phone = input.phone.trim()
  if (input.country) set.country = input.country.trim().toUpperCase()

  // Opt-in : on ne (ré)active que si le contact n'a pas été désinscrit.
  const existing = await Contact.findOne({ email }).select('unsubscribedAt newsletterOptIn').lean()
  if (input.optIn && !(existing && (existing as { unsubscribedAt?: Date }).unsubscribedAt)) {
    set.newsletterOptIn = true
    set.optInAt = new Date()
    if (input.optInSource) set.optInSource = input.optInSource
  }

  if (input.bumpBooking) set.lastBookingAt = new Date()

  const update: Record<string, unknown> = {
    $set: set,
    $addToSet: { source: input.source },
    $setOnInsert: { unsubscribeToken: randomBytes(16).toString('hex') },
  }
  if (input.bumpBooking) update.$inc = { bookingsCount: 1 }

  return Contact.findOneAndUpdate({ email }, update, {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true,
  })
}
