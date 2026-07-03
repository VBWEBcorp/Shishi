import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { Booking } from '@/models/Booking'
import { getMemberFromRequest } from '@/lib/member-auth'
import { memberSummary } from '@/lib/member-summary'

/** Profil de l'adhérent connecté + historique de ses réservations. */
export async function GET(request: NextRequest) {
  try {
    const session = await getMemberFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    await connectDB()
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    // Historique : réservations liées à l'adhérent (par id ou par email).
    const bookings = await Booking.find({
      $or: [{ memberId: session.id }, { email: user.email }],
    })
      .sort({ date: -1, time: -1 })
      .limit(50)
      .select('activitySlug activityName date time duration amount currency status creditsUsed partySize')
      .lean()

    return NextResponse.json({
      member: memberSummary(user),
      bookings: bookings.map((b) => ({
        id: String(b._id),
        activitySlug: b.activitySlug,
        activityName: b.activityName,
        date: b.date,
        time: b.time,
        duration: b.duration,
        amount: b.amount,
        currency: b.currency,
        status: b.status,
        creditsUsed: b.creditsUsed || 0,
        partySize: b.partySize || 1,
      })),
    })
  } catch (error) {
    console.error('[member/me] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
