import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { upsertContact } from '@/lib/contacts'
import { getActivityBySlug, getBookingAmount } from '@/lib/booking-pricing'
import { getBookingConfig, isBookable, isDayPass } from '@/lib/availability'
import { isSlotAvailable } from '@/lib/availability-query'
import { notifyNewBooking } from '@/lib/booking-emails'
import { langFromPhoneCountry } from '@/lib/country-codes'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const activitySlug = String(body.activitySlug || '').trim()
    const date = String(body.date || '').trim()
    const time = String(body.time || '').trim()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const phoneCountry = String(body.phoneCountry || '').trim()
    const notes = String(body.notes || '').trim()
    const newsletterOptIn = body.newsletterOptIn === true

    // Participants additionnels (réservation pour plusieurs personnes). Chacun
    // doit avoir un nom + un email valide ; on borne à 20 par sécurité.
    const participants = (Array.isArray(body.participants) ? body.participants : [])
      .map((pp: unknown) => {
        const o = (pp ?? {}) as Record<string, unknown>
        return {
          name: String(o.name || '').trim(),
          email: String(o.email || '').trim(),
          phone: String(o.phone || '').trim(),
        }
      })
      .filter((pp: { name: string; email: string }) => pp.name && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pp.email))
      .slice(0, 20)
    const partySize = 1 + participants.length
    // Langue des emails CLIENT : français si le téléphone est d'un pays
    // francophone (ex: +33), sinon anglais par défaut. L'alerte interne envoyée
    // à Shi Shi Samui reste, elle, toujours en français.
    const locale = langFromPhoneCountry(phoneCountry)

    const activity = getActivityBySlug(activitySlug)
    if (!activity) {
      return NextResponse.json({ error: 'unknown-activity' }, { status: 400 })
    }
    if (!date || !time || !name || !email) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }
    if (!isBookable(activitySlug)) {
      return NextResponse.json({ error: 'not-bookable' }, { status: 400 })
    }

    // Validation serveur : le créneau doit être réellement disponible
    // (anti double-réservation, ne fait jamais confiance au client).
    const available = await isSlotAvailable(activitySlug, date, time)
    if (!available) {
      return NextResponse.json({ error: 'slot-unavailable' }, { status: 409 })
    }

    // Durée = durée du créneau de l'activité (jamais envoyée par le client).
    const duration = getBookingConfig(activitySlug)?.slotMinutes ?? 60

    // Le prix est TOUJOURS calculé côté serveur (jamais envoyé par le client).
    // Selon l'activité, il se multiplie par le nombre de participants.
    const amount = getBookingAmount(activitySlug, partySize)
    const activityName = activity.name[locale]

    // Plus de paiement en ligne : la réservation est enregistrée comme une demande
    // ("pending") visible dans l'admin. La confirmation se fait par email.
    await connectDB()
    const booking = await Booking.create({
      activitySlug,
      activityName,
      date,
      time,
      duration,
      name,
      email,
      phone,
      notes,
      amount,
      currency: 'thb',
      partySize,
      participants,
      status: 'pending',
      locale,
      seen: false,
    })

    // CRM : chaque réservation alimente la fiche contact (best-effort — ne doit
    // jamais faire échouer la réservation si l'upsert plante).
    try {
      await upsertContact({
        email,
        name,
        phone,
        country: phoneCountry,
        source: 'booking',
        optIn: newsletterOptIn,
        optInSource: 'booking-form',
        bumpBooking: true,
      })
      // Chaque participant additionnel devient aussi un contact CRM.
      for (const pp of participants) {
        await upsertContact({
          email: pp.email,
          name: pp.name,
          phone: pp.phone,
          source: 'booking',
          bumpBooking: true,
        })
      }
    } catch (e) {
      console.error('[booking] contact upsert failed:', e)
    }

    // Emails (best-effort) : confirmation au client (dans sa langue) + alerte à
    // l'entreprise. On attend l'envoi (serverless) mais on ne casse jamais la
    // réservation en cas d'échec d'email.
    try {
      await notifyNewBooking({
        name,
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
      console.error('[booking] email notify failed:', e)
    }

    return NextResponse.json({
      ok: true,
      bookingId: String(booking._id),
    })
  } catch (error) {
    console.error('[booking] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
