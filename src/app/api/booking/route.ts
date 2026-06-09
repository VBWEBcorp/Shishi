import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { getActivityBySlug, getActivityPrice } from '@/lib/booking-pricing'
import { getBookingConfig, isBookable } from '@/lib/availability'
import { isSlotAvailable } from '@/lib/availability-query'
import { stripe, stripeCurrency, stripeEnabled, toStripeAmount } from '@/lib/stripe'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const activitySlug = String(body.activitySlug || '').trim()
    const date = String(body.date || '').trim()
    const time = String(body.time || '').trim()
    const name = String(body.name || '').trim()
    const email = String(body.email || '').trim()
    const phone = String(body.phone || '').trim()
    const notes = String(body.notes || '').trim()
    const locale = body.locale === 'fr' ? 'fr' : 'en'

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
    const amount = getActivityPrice(activitySlug)
    const activityName = activity.name[locale]

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
      currency: stripeCurrency,
      status: 'pending',
    })

    // Si Stripe n'est pas encore configuré : on garde la réservation en "pending"
    // et on renvoie un flag pour que le front bascule sur une confirmation manuelle / WhatsApp.
    if (!stripeEnabled || !stripe) {
      return NextResponse.json({
        ok: true,
        paymentConfigured: false,
        bookingId: String(booking._id),
      })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: stripeCurrency,
            unit_amount: toStripeAmount(amount),
            product_data: {
              name: `${activityName} — ${date} ${time}`,
              description: `Shi Shi Samui · ${duration} min`,
            },
          },
        },
      ],
      metadata: { bookingId: String(booking._id) },
      success_url: `${SITE_URL}/${locale}/booking?status=success&id=${booking._id}`,
      cancel_url: `${SITE_URL}/${locale}/booking?status=cancelled&id=${booking._id}`,
    })

    booking.stripeSessionId = session.id
    await booking.save()

    return NextResponse.json({
      ok: true,
      paymentConfigured: true,
      bookingId: String(booking._id),
      checkoutUrl: session.url,
    })
  } catch (error) {
    console.error('[booking] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
