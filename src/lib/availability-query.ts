import 'server-only'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import {
  computeAvailability,
  getBookingConfig,
  PENDING_HOLD_MS,
  type SlotAvailability,
} from '@/lib/availability'

/**
 * Compte les réservations ACTIVES par créneau pour une activité/date données.
 * Actif = payé, OU en attente (pending) créé il y a moins de PENDING_HOLD_MS
 * (les "pending" abandonnés libèrent donc le créneau au bout de 30 min).
 */
async function countActiveByTime(
  activitySlug: string,
  date: string
): Promise<Record<string, number>> {
  await connectDB()
  const cutoff = new Date(Date.now() - PENDING_HOLD_MS)

  const bookings = await Booking.find({
    activitySlug,
    date,
    $or: [{ status: 'paid' }, { status: 'pending', createdAt: { $gte: cutoff } }],
  })
    .select('time')
    .lean()

  const map: Record<string, number> = {}
  for (const b of bookings as Array<{ time: string }>) {
    map[b.time] = (map[b.time] || 0) + 1
  }
  return map
}

/** Disponibilité complète (tous les créneaux) d'une activité à une date. */
export async function getAvailability(
  activitySlug: string,
  date: string
): Promise<SlotAvailability[]> {
  if (!getBookingConfig(activitySlug)) return []
  const booked = await countActiveByTime(activitySlug, date)
  return computeAvailability(activitySlug, booked)
}

/** Vérifie qu'un créneau précis est encore disponible (validation serveur). */
export async function isSlotAvailable(
  activitySlug: string,
  date: string,
  time: string
): Promise<boolean> {
  const slots = await getAvailability(activitySlug, date)
  const slot = slots.find((s) => s.time === time)
  return !!slot && slot.available > 0
}
