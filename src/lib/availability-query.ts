import 'server-only'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { creneauOuvert } from '@/lib/booking-settings'
import { lireReglages } from '@/lib/booking-settings-server'
import {
  bookingInterval,
  computeAvailability,
  getBookingConfig,
  maxOverlap,
  PENDING_HOLD_MS,
  toMinutes,
  type BookingScope,
  type SlotAvailability,
  type SlotGridOptions,
  type TimeRange,
} from '@/lib/availability'

/**
 * Plages ACTIVES déjà réservées pour une activité/date données.
 * Actif = payé, OU en attente (pending) créé il y a moins de PENDING_HOLD_MS
 * (les "pending" abandonnés libèrent donc le créneau au bout de 30 min).
 *
 * Chaque réservation est convertie en plage [début, début + durée) : c'est ce
 * qui permet de compter correctement une saisie admin à la demi-heure face à
 * la grille horaire du site.
 */
async function loadActiveRanges(activitySlug: string, date: string): Promise<TimeRange[]> {
  await connectDB()
  const cutoff = new Date(Date.now() - PENDING_HOLD_MS)

  const bookings = await Booking.find({
    activitySlug,
    date,
    $or: [{ status: 'paid' }, { status: 'pending', createdAt: { $gte: cutoff } }],
  })
    .select('time duration')
    .lean()

  const fallback = getBookingConfig(activitySlug)?.slotMinutes ?? 60
  const ranges: TimeRange[] = []
  for (const b of bookings as Array<{ time?: string; duration?: number }>) {
    if (!b.time || !/^\d{2}:\d{2}$/.test(b.time)) continue
    const start = toMinutes(b.time)
    const duration = Math.max(1, Math.round(Number(b.duration) || fallback))
    ranges.push({ start, end: start + duration })
  }
  return ranges
}

/**
 * Disponibilité complète d'une activité à une date.
 * `scope: 'admin'` renvoie la grille à la demi-heure sur l'amplitude interne ;
 * sans option, on renvoie la grille publique d'1 h (comportement du site).
 */
export async function getAvailability(
  activitySlug: string,
  date: string,
  options: SlotGridOptions = {}
): Promise<SlotAvailability[]> {
  if (!getBookingConfig(activitySlug)) return []

  // Journée fermée par le club (congés, absence, semaine bloquée) : aucun
  // créneau proposé côté SITE. L'espace admin, lui, continue de tout voir,
  // c'est justement là qu'ils enregistrent ce qui se passe malgré tout.
  if (options.scope !== 'admin') {
    const reglages = await lireReglages()
    if (!creneauOuvert(reglages, activitySlug, date)) return []
  }

  const booked = await loadActiveRanges(activitySlug, date)
  return computeAvailability(activitySlug, booked, options)
}

/**
 * Une plage (heure de début + durée en minutes) est-elle réservable ?
 * Double contrôle : la demande doit être recevable dans son contexte (grille,
 * durée, horaires — cf. `bookingInterval`) ET laisser une place libre pendant
 * TOUTE la plage demandée.
 */
export async function isRangeAvailable(
  activitySlug: string,
  date: string,
  time: string,
  durationMinutes: number,
  scope: BookingScope = 'public'
): Promise<boolean> {
  const cfg = getBookingConfig(activitySlug)
  if (!cfg) return false
  const range = bookingInterval(activitySlug, time, durationMinutes, scope)
  if (!range) return false
  const booked = await loadActiveRanges(activitySlug, date)
  return maxOverlap(booked, range.start, range.end) < cfg.capacity
}

/** Vérifie qu'un créneau standard (1 créneau plein) est encore disponible. */
export async function isSlotAvailable(
  activitySlug: string,
  date: string,
  time: string
): Promise<boolean> {
  const slotMinutes = getBookingConfig(activitySlug)?.slotMinutes ?? 60
  return isRangeAvailable(activitySlug, date, time, slotMinutes)
}
