import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import {
  AQUAGYM_DUREE,
  AQUAGYM_HEURE,
  AQUAGYM_MAX_PERSONNES,
  seanceOuverte,
} from '@/lib/aquagym-sessions'
import { getBookingAmountForMinutes } from '@/lib/booking-pricing'
import { notifyNewBooking } from '@/lib/booking-emails'
import { dateFermee } from '@/lib/booking-settings'
import { lireReglages } from '@/lib/booking-settings-server'
import { upsertContact } from '@/lib/contacts'
import { connectDB } from '@/lib/db'
import { notifierNouvelleReservation } from '@/lib/push'
import { Booking } from '@/models/Booking'

/**
 * Inscriptions aux séances d'aquagym (lundi et vendredi 9 h, 20/11/2026).
 *
 * POST (public) : le formulaire de /aquagym-lamai. Une inscription = une
 * réservation `aquagym` confirmée, comme le reste du module : e-mail au
 * client, alerte e-mail et notification au club, fiche CRM. Pas de limite
 * de places tant que le club n'en a pas donné.
 *
 * GET (admin) : les inscriptions regroupées par séance, pour /admin/aquagym.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const date = String(body.date || '').trim()
    const name = String(body.name || '').trim().slice(0, 120)
    const email = String(body.email || '').trim().slice(0, 200)
    const phone = String(body.phone || '').trim().slice(0, 40)
    const notes = String(body.notes || '').trim().slice(0, 1000)
    const locale: 'fr' | 'en' = body.locale === 'fr' ? 'fr' : 'en'
    const partySize = Math.min(
      AQUAGYM_MAX_PERSONNES,
      Math.max(1, Math.floor(Number(body.partySize)) || 1)
    )

    if (!date || !name || !email || !phone) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }
    if (!seanceOuverte(date)) {
      return NextResponse.json({ error: 'invalid-session' }, { status: 400 })
    }
    // Congés ou journée fermée posés dans l'admin (club entier ou aquagym).
    const reglages = await lireReglages()
    if (dateFermee(reglages, date, 'aquagym')) {
      return NextResponse.json({ error: 'session-closed' }, { status: 403 })
    }

    await connectDB()

    // Même e-mail déjà inscrit à cette séance : on ne crée pas de doublon.
    const deja = await Booking.findOne({
      activitySlug: 'aquagym',
      date,
      time: AQUAGYM_HEURE,
      email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      status: 'paid',
    })
      .select('_id')
      .lean()
    if (deja) {
      return NextResponse.json({ ok: true, already: true })
    }

    const activityName = locale === 'fr' ? 'Aquagym' : 'Aqua aerobics'
    const booking = await Booking.create({
      activitySlug: 'aquagym',
      activityName,
      date,
      time: AQUAGYM_HEURE,
      duration: AQUAGYM_DUREE,
      name,
      email,
      phone,
      notes,
      amount: getBookingAmountForMinutes('aquagym', partySize, AQUAGYM_DUREE),
      currency: 'thb',
      partySize,
      participants: [],
      status: 'paid',
      locale,
      seen: false,
    })

    try {
      await upsertContact({
        email,
        name,
        phone,
        source: 'booking',
        bumpBooking: true,
      })
    } catch (e) {
      console.error('[aquagym] contact upsert failed:', e)
    }

    try {
      await notifyNewBooking({
        name,
        email,
        activityName,
        activitySlug: 'aquagym',
        date,
        time: AQUAGYM_HEURE,
        duration: AQUAGYM_DUREE,
        phone,
        notes,
        locale,
        dayPass: false,
        partySize,
        participants: [],
      })
    } catch (e) {
      console.error('[aquagym] email notify failed:', e)
    }

    try {
      await notifierNouvelleReservation({
        name,
        activityName: 'Aquagym',
        date,
        time: AQUAGYM_HEURE,
      })
    } catch (e) {
      console.error('[aquagym] push notify failed:', e)
    }

    return NextResponse.json({ ok: true, bookingId: String(booking._id) })
  } catch (error) {
    console.error('[aquagym] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    // Séances des 14 derniers jours et à venir.
    const depuis = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    const bookings = await Booking.find({
      activitySlug: 'aquagym',
      date: { $gte: depuis },
      status: 'paid',
      blocked: { $ne: true },
    })
      .sort({ date: 1, time: 1, createdAt: 1 })
      .select('date time name email phone partySize notes createdAt createdByAdmin')
      .lean()

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('[aquagym] list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
