import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { getActivityBySlug, getBookingAmount, supportsHours, MAX_BOOKING_HOURS } from '@/lib/booking-pricing'
import { getBookingConfig, isBookable, isDayPass } from '@/lib/availability'
import { isRangeAvailable } from '@/lib/availability-query'
import { isValidBookingDate, isBookingDateTimeInPast } from '@/lib/booking-validation'
import { sendBookingConfirmation } from '@/lib/booking-emails'
import { upsertContact } from '@/lib/contacts'

/**
 * Liste des réservations (admin uniquement). Filtre optionnel ?status=.
 * Renvoie aussi les compteurs par statut pour les onglets du panel.
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const query = status && status !== 'all' ? { status } : {}

    const [bookings, counts] = await Promise.all([
      Booking.find(query).sort({ createdAt: -1 }).limit(500).lean(),
      Booking.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    ])

    const byStatus: Record<string, number> = { all: 0, pending: 0, paid: 0, cancelled: 0, failed: 0 }
    for (const c of counts as { _id: string; n: number }[]) {
      byStatus[c._id] = c.n
      byStatus.all += c.n
    }

    return NextResponse.json({ bookings, counts: byStatus })
  } catch (error) {
    console.error('Bookings list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Création MANUELLE d'une réservation par l'admin (client de passage / résa par
 * téléphone) ou BLOCAGE d'un créneau (indispo interne). Admin uniquement.
 *
 * · mode « booking » : nom + email requis, tarif recalculé côté serveur, statut
 *   « confirmée » (paid), fiche CRM alimentée, email de confirmation optionnel.
 * · mode « block »   : occupe le créneau sans client (exclu des stats/CRM).
 *
 * Comme le tunnel public, la disponibilité est validée côté serveur (anti
 * double-réservation) et le prix n'est jamais fourni par le client.
 */
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const mode = body.mode === 'block' ? 'block' : 'booking'
    const activitySlug = String(body.activitySlug || '').trim()
    const date = String(body.date || '').trim()
    const time = String(body.time || '').trim()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const notes = String(body.notes || '').trim()
    const sendEmail = body.sendEmail === true

    const activity = getActivityBySlug(activitySlug)
    if (!activity) {
      return NextResponse.json({ error: 'unknown-activity' }, { status: 400 })
    }
    if (!isBookable(activitySlug)) {
      return NextResponse.json({ error: 'not-bookable' }, { status: 400 })
    }
    if (!date || !time) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }
    if (!isValidBookingDate(date)) {
      return NextResponse.json({ error: 'invalid-date' }, { status: 400 })
    }
    if (isBookingDateTimeInPast(date, time)) {
      return NextResponse.json({ error: 'date-in-past' }, { status: 400 })
    }

    // Champs spécifiques au mode « réservation client ».
    if (mode === 'booking') {
      if (!name) {
        return NextResponse.json({ error: 'missing-name' }, { status: 400 })
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
      }
    }

    // Personnes (activités facturées par personne). Borné [1..20].
    const partySize = Math.min(20, Math.max(1, Math.floor(Number(body.partySize) || 1)))

    // Nombre d'heures (activités à durée variable). Borné [1..MAX].
    const rawHours = Number(body.hours) || 1
    const hours = supportsHours(activitySlug)
      ? Math.min(MAX_BOOKING_HOURS, Math.max(1, Math.floor(rawHours)))
      : 1

    // Disponibilité validée serveur (anti double-réservation), comme le public.
    const available = await isRangeAvailable(activitySlug, date, time, hours)
    if (!available) {
      return NextResponse.json({ error: 'slot-unavailable' }, { status: 409 })
    }

    const slotMin = getBookingConfig(activitySlug)?.slotMinutes ?? 60
    const duration = supportsHours(activitySlug) ? hours * slotMin : slotMin
    const activityName = activity.name.fr

    await connectDB()

    const isBlock = mode === 'block'
    const amount = isBlock ? 0 : getBookingAmount(activitySlug, partySize, hours)

    const booking = await Booking.create({
      activitySlug,
      activityName,
      date,
      time,
      duration,
      name: isBlock ? 'Créneau bloqué' : name,
      email: isBlock ? '' : email,
      phone: isBlock ? '' : phone,
      notes,
      amount,
      currency: 'thb',
      partySize: isBlock ? 1 : partySize,
      status: 'paid', // saisie admin = créneau confirmé/occupé
      locale: 'fr',
      seen: true, // créé par l'admin → déjà « vu »
      seenAt: new Date(),
      blocked: isBlock,
      createdByAdmin: true,
    })

    // Réservation client : CRM + email de confirmation optionnel (best-effort).
    if (!isBlock) {
      try {
        await upsertContact({ email, name, phone, source: 'manual' })
      } catch (e) {
        console.error('[bookings] contact upsert failed:', e)
      }
      if (sendEmail) {
        try {
          await sendBookingConfirmation({
            name,
            email,
            activityName,
            date,
            time,
            duration,
            phone,
            notes,
            locale: 'fr',
            dayPass: isDayPass(activitySlug),
            partySize,
          })
        } catch (e) {
          console.error('[bookings] confirmation email failed:', e)
        }
      }
    }

    return NextResponse.json({ ok: true, bookingId: String(booking._id) })
  } catch (error) {
    console.error('Booking create (admin) error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
