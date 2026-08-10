import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { upsertContact } from '@/lib/contacts'
import {
  getActivityBySlug,
  getBookingAmount,
  supportsHours,
  MAX_BOOKING_HOURS,
} from '@/lib/booking-pricing'
import { getBookingConfig, isBookable, isDayPass } from '@/lib/availability'
import { isRangeAvailable } from '@/lib/availability-query'
import { isValidBookingDate, isBookingDateTimeInPast } from '@/lib/booking-validation'
import { notifyNewBooking } from '@/lib/booking-emails'
import { langFromPhoneCountry } from '@/lib/country-codes'
import { resolveMemberBenefits, refundCredits } from '@/lib/membership'
import { getMemberFromRequest } from '@/lib/member-auth'
import { ONLINE_BOOKING_ENABLED } from '@/lib/launch'

export async function POST(request: NextRequest) {
  try {
    // Réservation en ligne désactivée : on refuse toute création (protège même
    // contre une page laissée en cache qui tenterait encore de réserver).
    if (!ONLINE_BOOKING_ENABLED) {
      return NextResponse.json({ error: 'booking-disabled' }, { status: 403 })
    }

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
    // Date au format strict AAAA-MM-JJ et non déjà écoulée (heure de Bangkok).
    // Empêche les réservations dans le passé et les dates malformées.
    if (!isValidBookingDate(date)) {
      return NextResponse.json({ error: 'invalid-date' }, { status: 400 })
    }
    if (isBookingDateTimeInPast(date, time)) {
      return NextResponse.json({ error: 'date-in-past' }, { status: 400 })
    }

    // Nombre d'heures (activités à durée variable, ex. Kids Club). Borné [1..MAX].
    const rawHours = Number(body.hours) || 1
    const hours = supportsHours(activitySlug)
      ? Math.min(MAX_BOOKING_HOURS, Math.max(1, Math.floor(rawHours)))
      : 1

    // Validation serveur : toute la plage demandée doit être disponible
    // (anti double-réservation, ne fait jamais confiance au client).
    const available = await isRangeAvailable(activitySlug, date, time, hours)
    if (!available) {
      return NextResponse.json({ error: 'slot-unavailable' }, { status: 409 })
    }

    // Durée = nb d'heures × granularité pour les activités à durée variable,
    // sinon la durée standard du créneau (jamais envoyée par le client).
    const slotMin = getBookingConfig(activitySlug)?.slotMinutes ?? 60
    const duration = supportsHours(activitySlug) ? hours * slotMin : slotMin

    // Le prix est TOUJOURS calculé côté serveur (jamais envoyé par le client).
    const baseAmount = getBookingAmount(activitySlug, partySize, hours)
    const activityName = activity.name[locale]

    // ── Crédits adhérent ─────────────────────────────────────────────────
    // Si un membre connecté réserve et que ses crédits pour CETTE activité
    // couvrent la durée, la réservation est gratuite (crédits débités).
    // Sinon : plein tarif, paiement sur place.
    const member = await getMemberFromRequest(request)
    const benefits = await resolveMemberBenefits({
      member,
      activitySlug,
      hours,
      partySize,
      baseAmount,
    })
    const advanceDays = benefits.advanceBookingDays

    // Fenêtre de réservation à l'avance : 10 jours pour les membres, sinon le
    // défaut public. On refuse une date trop lointaine.
    if (isDateTooFar(date, advanceDays)) {
      return NextResponse.json({ error: 'date-too-far', advanceDays }, { status: 400 })
    }

    await connectDB()

    // ── Débit ATOMIQUE des crédits AVANT de figer la réservation ──────────
    // C'est le débit conditionnel qui décide si la réservation est gratuite.
    // Si les crédits ont été consommés entre-temps (réservations simultanées),
    // le débit échoue et on bascule en plein tarif (paiement sur place) : jamais
    // de réservation gratuite sans crédit réellement débité (anti double-dépense).
    let amount = baseAmount
    let creditsUsed = 0
    if (member && benefits.creditsUsed > 0) {
      let debited = false
      try {
        debited = await benefits.commitCredits()
      } catch (e) {
        console.error('[booking] credit debit failed:', e)
      }
      if (debited) {
        amount = 0
        creditsUsed = benefits.creditsUsed
      }
    }

    // Paiement 100 % couvert par les crédits → réservation confirmée directement.
    const fullyCoveredByCredits = creditsUsed > 0 && amount === 0
    let booking
    try {
      booking = await Booking.create({
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
        status: fullyCoveredByCredits ? 'paid' : 'pending',
        locale,
        seen: false,
        memberId: member?.id,
        creditsUsed,
      })
    } catch (createErr) {
      // La création a échoué APRÈS un éventuel débit de crédits : on recrédite
      // pour ne jamais débiter un adhérent sans réservation en contrepartie.
      if (creditsUsed > 0 && member) {
        try {
          await refundCredits(member.id, activitySlug, creditsUsed)
        } catch (refundErr) {
          console.error('[booking] credit refund failed:', refundErr)
        }
      }
      throw createErr
    }

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

    // Paiement SUR PLACE (le jour J) : aucune transaction en ligne. La
    // réservation est enregistrée comme demande et confirmée par email.
    // Best-effort — ne casse jamais la réservation si l'email échoue.
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
      creditsUsed,
      paid: fullyCoveredByCredits,
    })
  } catch (error) {
    console.error('[booking] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}

/** Refuse une date au-delà de la fenêtre de réservation autorisée (jours). */
function isDateTooFar(date: string, advanceDays: number): boolean {
  const target = new Date(`${date}T12:00:00`)
  if (isNaN(target.getTime())) return false
  const now = new Date()
  const max = new Date(now.getTime() + advanceDays * 24 * 60 * 60 * 1000)
  return target.getTime() > max.getTime()
}
