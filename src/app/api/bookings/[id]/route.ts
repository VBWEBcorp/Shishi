import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Booking, type BookingStatus } from '@/models/Booking'
import { getActivityBySlug, getBookingAmountForMinutes } from '@/lib/booking-pricing'
import {
  ADMIN_STEP_MINUTES,
  bookingInterval,
  fixedMinutes,
  getBookingConfig,
  isBookable,
  isDayPass,
  MAX_BOOKING_MINUTES,
} from '@/lib/availability'
import { isRangeAvailable } from '@/lib/availability-query'
import { isValidBookingDate, isBookingDateTimeInPast } from '@/lib/booking-validation'

const VALID: BookingStatus[] = ['pending', 'paid', 'cancelled', 'failed']

type Params = Promise<{ id: string }>

/**
 * Met à jour une réservation (admin uniquement).
 *
 * · `{ status }` seul : changement de statut (confirmer / annuler).
 * · `{ activitySlug, date, time, ... }` : MODIFICATION complète depuis la modale
 *   admin (même saisie que la création : activité, date, début, durée, personnes,
 *   coordonnées, notes). Même validation serveur que la création, la réservation
 *   elle-même étant exclue du contrôle de disponibilité. Le statut et l'origine
 *   (site / admin) ne changent pas ; le tarif n'est recalculé que si l'activité,
 *   la durée ou le nombre de personnes ont changé (un paiement en ligne reste
 *   donc intact quand on ne déplace que l'horaire). Aucun e-mail n'est envoyé.
 */
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))

    if (body.activitySlug === undefined) {
      const { status } = body
      if (!VALID.includes(status)) {
        return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
      }

      await connectDB()
      const booking = await Booking.findByIdAndUpdate(id, { status }, { new: true })
      if (!booking) {
        return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
      }

      return NextResponse.json(booking)
    }

    await connectDB()
    const booking = await Booking.findById(id)
    if (!booking) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    const activitySlug = String(body.activitySlug || '').trim()
    const date = String(body.date || '').trim()
    const time = String(body.time || '').trim()
    const isBlock = booking.blocked === true

    const activity = getActivityBySlug(activitySlug)
    if (!activity) return NextResponse.json({ error: 'unknown-activity' }, { status: 400 })
    if (!isBookable(activitySlug)) return NextResponse.json({ error: 'not-bookable' }, { status: 400 })
    if (!date || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }
    if (!isValidBookingDate(date)) return NextResponse.json({ error: 'invalid-date' }, { status: 400 })

    const email = isBlock ? '' : String(body.email || '').trim()
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }

    const participants = isBlock
      ? []
      : (Array.isArray(body.participants) ? body.participants : [])
          .map((pp: unknown) => {
            const o = (pp ?? {}) as Record<string, unknown>
            return {
              name: String(o.name || '').trim(),
              email: String(o.email || '').trim(),
              phone: String(o.phone || '').trim(),
            }
          })
          .filter((pp: { name: string; email: string }) => pp.name || pp.email)
          .slice(0, 19)
    const partyCount = Math.min(20, Math.max(1, Math.floor(Number(body.partySize) || 1)))
    const partySize = isBlock ? 1 : Math.min(20, Math.max(partyCount, 1 + participants.length))

    const slotMin = getBookingConfig(activitySlug)?.slotMinutes ?? 60
    const rawMinutes = Number(body.durationMinutes)
    const requested = Number.isFinite(rawMinutes) && rawMinutes > 0 ? rawMinutes : slotMin
    const duration = isDayPass(activitySlug)
      ? slotMin
      : fixedMinutes(activitySlug) ??
        Math.min(
          MAX_BOOKING_MINUTES,
          Math.max(ADMIN_STEP_MINUTES, Math.round(requested / ADMIN_STEP_MINUTES) * ADMIN_STEP_MINUTES)
        )

    if (!bookingInterval(activitySlug, time, duration, 'admin')) {
      return NextResponse.json({ error: 'invalid-slot' }, { status: 400 })
    }
    // Anti double-réservation sur les créneaux à venir, hors la réservation elle-même.
    if (!isBookingDateTimeInPast(date, time)) {
      const available = await isRangeAvailable(activitySlug, date, time, duration, 'admin', id)
      if (!available) return NextResponse.json({ error: 'slot-unavailable' }, { status: 409 })
    }

    const moved = booking.date !== date || booking.time !== time
    const repriced =
      booking.activitySlug !== activitySlug ||
      booking.duration !== duration ||
      (booking.partySize ?? 1) !== partySize

    booking.activitySlug = activitySlug
    booking.activityName = activity.name.fr
    booking.date = date
    booking.time = time
    booking.duration = duration
    booking.notes = String(body.notes || '').trim()
    booking.partySize = partySize
    if (!isBlock) {
      booking.name = String(body.name || '').trim() || 'Client'
      booking.email = email
      booking.phone = String(body.phone || '').trim()
      booking.participants = participants
      if (body.locale === 'en' || body.locale === 'fr') booking.locale = body.locale
      if (repriced) booking.amount = getBookingAmountForMinutes(activitySlug, partySize, duration)
    }
    // Rappel « 30 min avant » : à renvoyer si l'horaire a bougé.
    if (moved) booking.reminderSentAt = undefined

    await booking.save()
    return NextResponse.json(booking)
  } catch (error) {
    console.error('Booking update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Supprime une réservation (admin uniquement). */
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await connectDB()
    const deleted = await Booking.findByIdAndDelete(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Booking delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
