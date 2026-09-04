import 'server-only'

import { connectDB } from '@/lib/db'
import { BookingSettings } from '@/models/BookingSettings'
import { DEFAUT, normaliser, type BookingSettingsData } from '@/lib/booking-settings'

/**
 * Réglages de réservation lus en base, côté serveur.
 *
 * Base injoignable = on renvoie le défaut, c'est-à-dire FERMÉ. Une panne de
 * base ne doit jamais ouvrir les réservations dans le dos du club : une
 * réservation acceptée qu'ils ne voient pas est pire qu'un visiteur renvoyé
 * vers WhatsApp.
 */
export async function lireReglages(): Promise<BookingSettingsData> {
  try {
    await connectDB()
    const doc = await BookingSettings.findOne().lean()
    if (!doc) return DEFAUT
    return normaliser(doc)
  } catch (e) {
    console.error('[booking-settings] lecture impossible', e)
    return DEFAUT
  }
}

/** Écrit (ou crée) le document unique de réglages. */
export async function ecrireReglages(
  valeurs: Partial<BookingSettingsData>
): Promise<BookingSettingsData> {
  await connectDB()
  const doc = await BookingSettings.findOneAndUpdate(
    {},
    { $set: valeurs },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  ).lean()
  return normaliser(doc)
}
