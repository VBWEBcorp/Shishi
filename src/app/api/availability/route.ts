import { NextRequest, NextResponse } from 'next/server'
import { getBookingConfig, isBookable } from '@/lib/availability'
import { getAvailability } from '@/lib/availability-query'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activity = (searchParams.get('activity') || '').trim()
    const date = (searchParams.get('date') || '').trim()

    if (!activity || !date) {
      return NextResponse.json({ error: 'missing-params' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'invalid-date' }, { status: 400 })
    }
    if (!isBookable(activity)) {
      return NextResponse.json({ error: 'not-bookable', bookable: false }, { status: 200 })
    }

    const slots = await getAvailability(activity, date)
    const cfg = getBookingConfig(activity)

    return NextResponse.json({
      bookable: true,
      activity,
      date,
      slotMinutes: cfg?.slotMinutes ?? 60,
      slots,
    })
  } catch (error) {
    console.error('[availability] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
