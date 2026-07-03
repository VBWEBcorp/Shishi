import 'server-only'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import {
  computeAvailability,
  getBookingConfig,
  PENDING_HOLD_MS,
  slotsCovered,
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
    .select('time duration')
    .lean()

  const cfg = getBookingConfig(activitySlug)
  const slotMin = cfg?.slotMinutes ?? 60
  const map: Record<string, number> = {}
  for (const b of bookings as Array<{ time: string; duration?: number }>) {
    // Une réservation multi-heures (ex. Kids Club) occupe tous les créneaux
    // qu'elle couvre, pas seulement son heure de départ.
    const hours = Math.max(1, Math.round((b.duration ?? slotMin) / slotMin))
    for (const time of slotsCovered(activitySlug, b.time, hours)) {
      map[time] = (map[time] || 0) + 1
    }
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
  return isRangeAvailable(activitySlug, date, time, 1)
}

/**
 * Vérifie qu'une plage de `hours` heures à partir de `time` est disponible
 * (tous les créneaux couverts ont au moins une place). Pour les réservations
 * d'une heure, équivaut à `isSlotAvailable`.
 */
export async function isRangeAvailable(
  activitySlug: string,
  date: string,
  time: string,
  hours: number
): Promise<boolean> {
  const slots = await getAvailability(activitySlug, date)
  const covered = slotsCovered(activitySlug, time, hours)
  // Chaque créneau couvert doit exister dans la grille ET rester disponible.
  return covered.every((slotTime) => {
    const slot = slots.find((s) => s.time === slotTime)
    return !!slot && slot.available > 0
  })
}
