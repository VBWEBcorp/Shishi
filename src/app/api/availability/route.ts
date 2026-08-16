import { NextRequest, NextResponse } from 'next/server'
import {
  bookingWindow,
  getBookingConfig,
  isBookable,
  MAX_BOOKING_MINUTES,
  minBookingMinutes,
  slotStep,
  toHHMM,
  type BookingScope,
} from '@/lib/availability'
import { getAvailability } from '@/lib/availability-query'

/**
 * Disponibilités d'une activité à une date.
 *
 * `?scope=admin` renvoie la grille interne (demi-heures, amplitude élargie)
 * utilisée par la modale de saisie de l'espace admin. Sans ce paramètre, on
 * renvoie la grille publique d'1 h : le site ne voit donc jamais les
 * demi-heures. La lecture reste ouverte (c'est un calendrier de dispo) ; ce qui
 * protège la grille publique, c'est la validation à la CRÉATION (`bookingInterval`).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activity = (searchParams.get('activity') || '').trim()
    const date = (searchParams.get('date') || '').trim()
    const scope: BookingScope = searchParams.get('scope') === 'admin' ? 'admin' : 'public'

    if (!activity || !date) {
      return NextResponse.json({ error: 'missing-params' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'invalid-date' }, { status: 400 })
    }
    if (!isBookable(activity)) {
      return NextResponse.json({ error: 'not-bookable', bookable: false }, { status: 200 })
    }

    const slots = await getAvailability(activity, date, { scope })
    const cfg = getBookingConfig(activity)
    const win = bookingWindow(activity, scope)

    return NextResponse.json({
      bookable: true,
      activity,
      date,
      scope,
      /** Durée d'un créneau standard (inchangé pour le site). */
      slotMinutes: cfg?.slotMinutes ?? 60,
      /** Pas de la grille renvoyée : 60 côté public, 30 côté admin. */
      stepMinutes: slotStep(activity, scope),
      /** Plus petite durée réservable dans ce contexte. */
      minMinutes: minBookingMinutes(activity, scope),
      maxMinutes: MAX_BOOKING_MINUTES,
      /** Amplitude de saisie ("HH:mm") — borne les heures de fin proposées. */
      window: win ? { open: toHHMM(win.start), close: toHHMM(win.end) } : null,
      slots,
    })
  } catch (error) {
    console.error('[availability] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
