import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { getActivityBySlug, getBookingAmountForMinutes } from '@/lib/booking-pricing'
import {
  ADMIN_STEP_MINUTES,
  bookingInterval,
  getBookingConfig,
  isBookable,
  isDayPass,
  MAX_BOOKING_MINUTES,
} from '@/lib/availability'
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
 * Création MANUELLE d'une réservation par l'admin (résa reçue par téléphone /
 * bouche-à-oreille) ou BLOCAGE d'un créneau (indispo interne). Admin uniquement.
 *
 * · mode « booking » : parité avec le tunnel public (activité, date, créneau,
 *   durée, personnes + participants, coordonnées, notes, opt-in newsletter),
 *   avec en plus la SAISIE À LA DEMI-HEURE (début et durée libres, ex. 07:30 →
 *   09:00) que le site, lui, ne propose pas aux clients.
 *   TOLÉRANT aux infos manquantes : seuls activité + date + créneau sont requis ;
 *   nom/email/téléphone facultatifs (nom → « Client » par défaut). Dates passées
 *   acceptées (enregistrement a posteriori). Tarif recalculé serveur, statut
 *   « confirmée » (paid), fiche CRM alimentée, email de confirmation optionnel.
 * · mode « block »   : occupe le créneau sans client (exclu des stats/CRM).
 *
 * La disponibilité est validée serveur (anti double-réservation) pour les
 * créneaux À VENIR ; le prix n'est jamais fourni par le client.
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
    const newsletterOptIn = body.newsletterOptIn === true
    // Langue du client (confirmation + rappel dans cette langue). Défaut : français.
    const locale: 'fr' | 'en' = body.locale === 'en' ? 'en' : 'fr'

    const activity = getActivityBySlug(activitySlug)
    if (!activity) {
      return NextResponse.json({ error: 'unknown-activity' }, { status: 400 })
    }
    if (!isBookable(activitySlug)) {
      return NextResponse.json({ error: 'not-bookable' }, { status: 400 })
    }
    if (!date || !time || !/^\d{2}:\d{2}$/.test(time)) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }
    if (!isValidBookingDate(date)) {
      return NextResponse.json({ error: 'invalid-date' }, { status: 400 })
    }
    // L'admin peut enregistrer une réservation PASSÉE (résa déjà reçue par
    // téléphone / bouche-à-oreille). On ne vérifiera donc la disponibilité que
    // pour les créneaux À VENIR (anti double-réservation), pas pour le passé.
    const isFuture = !isBookingDateTimeInPast(date, time)

    // Tolérance aux infos manquantes : nom et email sont FACULTATIFS (l'admin
    // saisit ce qu'il a). Si un email est tout de même fourni, il doit être valide.
    if (mode === 'booking' && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }

    // Participants additionnels (parité avec le tunnel public) — tous les champs
    // sont facultatifs ; on garde ceux qui portent au moins un nom ou un email.
    const participants = (Array.isArray(body.participants) ? body.participants : [])
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

    // Nombre de personnes : au moins le compteur saisi, et au moins 1 + le nombre
    // de participants réellement listés. Borné [1..20].
    const partyCount = Math.min(20, Math.max(1, Math.floor(Number(body.partySize) || 1)))
    const partySize = Math.min(20, Math.max(partyCount, 1 + participants.length))

    // Durée saisie par l'admin, en MINUTES, au pas de la demi-heure. C'est ce
    // qui permet d'enregistrer une séance de 07:30 à 09:00 (90 min) impossible
    // à réserver depuis le site. `hours` reste accepté (compat ascendante).
    const slotMin = getBookingConfig(activitySlug)?.slotMinutes ?? 60
    const rawMinutes = Number(body.durationMinutes)
    const rawHours = Number(body.hours)
    const requested =
      Number.isFinite(rawMinutes) && rawMinutes > 0
        ? rawMinutes
        : Number.isFinite(rawHours) && rawHours > 0
          ? rawHours * 60
          : slotMin
    // Pass journée : durée imposée (l'accès couvre la journée entière).
    const duration = isDayPass(activitySlug)
      ? slotMin
      : Math.min(
          MAX_BOOKING_MINUTES,
          Math.max(
            ADMIN_STEP_MINUTES,
            Math.round(requested / ADMIN_STEP_MINUTES) * ADMIN_STEP_MINUTES
          )
        )

    // La plage doit tomber sur la grille interne (demi-heures) et tenir dans
    // l'amplitude de saisie — y compris pour un enregistrement a posteriori.
    if (!bookingInterval(activitySlug, time, duration, 'admin')) {
      return NextResponse.json({ error: 'invalid-slot' }, { status: 400 })
    }

    // Disponibilité validée serveur (anti double-réservation) — uniquement pour
    // les créneaux à venir. Une saisie a posteriori (date passée) n'est pas bornée.
    if (isFuture) {
      const available = await isRangeAvailable(activitySlug, date, time, duration, 'admin')
      if (!available) {
        return NextResponse.json({ error: 'slot-unavailable' }, { status: 409 })
      }
    }

    const activityName = activity.name.fr

    await connectDB()

    const isBlock = mode === 'block'
    const amount = isBlock ? 0 : getBookingAmountForMinutes(activitySlug, partySize, duration)

    const booking = await Booking.create({
      activitySlug,
      activityName,
      date,
      time,
      duration,
      // Nom facultatif : « Client » par défaut si l'admin ne l'a pas (trou assumé).
      name: isBlock ? 'Créneau bloqué' : name || 'Client',
      email: isBlock ? '' : email,
      phone: isBlock ? '' : phone,
      notes,
      amount,
      currency: 'thb',
      partySize: isBlock ? 1 : partySize,
      participants: isBlock ? [] : participants,
      status: 'paid', // saisie admin = créneau confirmé/occupé
      locale,
      seen: true, // créé par l'admin → déjà « vu »
      seenAt: new Date(),
      blocked: isBlock,
      createdByAdmin: true,
    })

    // Réservation client : CRM (client + participants) + email de confirmation
    // optionnel (best-effort — ne fait jamais échouer la réservation).
    if (!isBlock) {
      try {
        if (email) {
          await upsertContact({
            email,
            name: name || undefined,
            phone,
            source: 'manual',
            optIn: newsletterOptIn,
            optInSource: 'admin-booking',
            bumpBooking: true,
          })
        }
        for (const pp of participants) {
          if (pp.email) {
            await upsertContact({
              email: pp.email,
              name: pp.name || undefined,
              phone: pp.phone,
              source: 'manual',
              bumpBooking: true,
            })
          }
        }
      } catch (e) {
        console.error('[bookings] contact upsert failed:', e)
      }
      if (sendEmail && email) {
        try {
          await sendBookingConfirmation({
            name: name || 'Client',
            email,
            activityName,
            date,
            time,
            duration,
            phone,
            notes,
            locale,
            dayPass: isDayPass(activitySlug),
            partySize,
            participants,
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
