import { NextRequest, NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'
import { stripe, stripeEnabled } from '@/lib/stripe'
import { emailConfig, sendEmail } from '@/lib/email'
import { notifyClientBooking, notifyTeamBooking } from '@/lib/whatsapp'

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

// Stripe a besoin du corps brut (non parsé) pour vérifier la signature.
export const runtime = 'nodejs'

function confirmationHtml(b: {
  name: string
  activityName: string
  date: string
  time: string
  duration: number
  amount: number
  currency: string
}) {
  return `
    <h2>Booking confirmed ✅</h2>
    <p>Hi ${b.name}, your booking at <strong>Shi Shi Samui</strong> is confirmed.</p>
    <table cellpadding="6" style="border-collapse:collapse">
      <tr><td><strong>Activity</strong></td><td>${b.activityName}</td></tr>
      <tr><td><strong>Date</strong></td><td>${b.date} · ${b.time}</td></tr>
      <tr><td><strong>Duration</strong></td><td>${b.duration} min</td></tr>
      <tr><td><strong>Paid</strong></td><td>${b.amount} ${b.currency.toUpperCase()}</td></tr>
    </table>
    <p>See you on court! · Lamai, Koh Samui</p>
  `
}

export async function POST(request: NextRequest) {
  if (!stripeEnabled || !stripe) {
    return NextResponse.json({ error: 'stripe-not-configured' }, { status: 503 })
  }
  if (!WEBHOOK_SECRET) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET manquant')
    return NextResponse.json({ error: 'webhook-secret-missing' }, { status: 500 })
  }

  const sig = request.headers.get('stripe-signature')
  const rawBody = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig as string, WEBHOOK_SECRET)
  } catch (err) {
    console.error('[webhook] signature verification failed:', err)
    return NextResponse.json({ error: 'invalid-signature' }, { status: 400 })
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (bookingId) {
        await connectDB()
        const booking = await Booking.findById(bookingId)
        if (booking && booking.status !== 'paid') {
          booking.status = 'paid'
          await booking.save()

          // Email de confirmation au client
          await sendEmail({
            to: booking.email,
            subject: `Booking confirmed — ${booking.activityName} ${booking.date}`,
            html: confirmationHtml(booking),
          })
          // Notification interne par email
          await sendEmail({
            to: emailConfig.contactTo,
            subject: `New paid booking — ${booking.activityName} ${booking.date} ${booking.time}`,
            html: `<p>${booking.name} (${booking.email}) booked ${booking.activityName} on ${booking.date} at ${booking.time}.</p>`,
          })

          // Notifications WhatsApp (best-effort, ne bloquent jamais le webhook)
          await Promise.allSettled([
            notifyClientBooking({
              name: booking.name,
              phone: booking.phone,
              activityName: booking.activityName,
              date: booking.date,
              time: booking.time,
            }),
            notifyTeamBooking({
              name: booking.name,
              email: booking.email,
              phone: booking.phone,
              activityName: booking.activityName,
              date: booking.date,
              time: booking.time,
            }),
          ])
        }
      }
    }

    if (
      event.type === 'checkout.session.expired' ||
      event.type === 'checkout.session.async_payment_failed'
    ) {
      const session = event.data.object as Stripe.Checkout.Session
      const bookingId = session.metadata?.bookingId
      if (bookingId) {
        await connectDB()
        await Booking.findByIdAndUpdate(bookingId, { status: 'failed' })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[webhook] handler error:', error)
    return NextResponse.json({ error: 'handler-error' }, { status: 500 })
  }
}
