import 'server-only'

import { AQUAGYM_HEURE, AQUAGYM_PLACES } from '@/lib/aquagym-sessions'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'

/**
 * Personnes inscrites par séance d'aquagym : on additionne les PERSONNES
 * (partySize) des inscriptions confirmées, formulaire et admin confondus, hors
 * créneaux bloqués.
 */
export async function personnesInscrites(dates: string[]): Promise<Record<string, number>> {
  const total: Record<string, number> = Object.fromEntries(dates.map((d) => [d, 0]))
  if (!dates.length) return total
  await connectDB()
  const inscrits = await Booking.find({
    activitySlug: 'aquagym',
    date: { $in: dates },
    time: AQUAGYM_HEURE,
    status: 'paid',
    blocked: { $ne: true },
  })
    .select('date partySize')
    .lean()
  for (const b of inscrits as Array<{ date: string; partySize?: number }>) {
    total[b.date] += b.partySize || 1
  }
  return total
}

/** Places encore libres par séance (jamais négatif). */
export async function placesRestantes(dates: string[]): Promise<Record<string, number>> {
  const total = await personnesInscrites(dates)
  return Object.fromEntries(dates.map((d) => [d, Math.max(0, AQUAGYM_PLACES - total[d])]))
}
