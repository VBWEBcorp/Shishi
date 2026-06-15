import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'

export const dynamic = 'force-dynamic'

/**
 * Cloche de notifications de l'admin.
 *  GET  → nombre de réservations non vues + les 8 dernières.
 *  POST → marque toutes les réservations comme vues (clic sur la cloche).
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const [count, recent] = await Promise.all([
      Booking.countDocuments({ seen: { $ne: true } }),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .select('name activityName date time status seen createdAt')
        .lean(),
    ])

    const items = (recent as Array<Record<string, unknown>>).map((b) => ({
      _id: String(b._id),
      name: b.name ?? '',
      activityName: b.activityName ?? '',
      date: b.date ?? '',
      time: b.time ?? '',
      status: b.status ?? 'pending',
      seen: b.seen === true,
      createdAt: b.createdAt instanceof Date ? b.createdAt.toISOString() : String(b.createdAt ?? ''),
    }))

    return NextResponse.json({ count, items })
  } catch (error) {
    console.error('[bookings/notifications] GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    await Booking.updateMany(
      { seen: { $ne: true } },
      { $set: { seen: true, seenAt: new Date() } }
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[bookings/notifications] POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
