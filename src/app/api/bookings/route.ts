import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { Booking } from '@/models/Booking'

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
