import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { Booking } from '@/models/Booking'
import { activityCreditsSummary } from '@/lib/member-summary'

/**
 * Liste des adhérents (comptes membres) — admin uniquement.
 *
 * Un adhérent = un compte. Ses avantages se résument à ses CRÉDITS PAR
 * ACTIVITÉ (attribués par l'admin sur place). Les clients « de passage » qui
 * réservent SANS compte ne sont pas des membres : ils vivent dans le CRM
 * (contacts), pas ici.
 *
 * Filtres : ?filter=all|credits|auto|nocredits · Recherche : ?q=
 *  · credits   → au moins un solde de crédits actif
 *  · auto      → au moins une recharge automatique mensuelle
 *  · nocredits → aucun crédit actif
 */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const { searchParams } = new URL(request.url)
    const q = (searchParams.get('q') || '').trim()
    const filter = searchParams.get('filter') || 'all'

    // On liste les comptes NON-admin (les adhérents ont le rôle « user »).
    const query: Record<string, unknown> = { role: { $ne: 'admin' } }
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      query.$or = [{ name: rx }, { email: rx }, { phone: rx }]
    }

    const users = await User.find(query)
      .select('email name phone activityCredits memberSince createdAt')
      .sort({ updatedAt: -1 })
      .limit(1000)
      .lean()

    // Nombre de réservations par membre (en une requête) — via memberId.
    const grouped = await Booking.aggregate([
      { $match: { memberId: { $ne: null } } },
      { $group: { _id: '$memberId', count: { $sum: 1 } } },
    ])
    const countMap = new Map(grouped.map((g: { _id: unknown; count: number }) => [String(g._id), g.count]))

    const members = users.map((u) => ({
      id: String(u._id),
      email: u.email,
      name: u.name || '',
      phone: u.phone || '',
      activityCredits: activityCreditsSummary({ activityCredits: u.activityCredits || [] }),
      memberSince: u.memberSince || null,
      createdAt: u.createdAt,
      bookingsCount: countMap.get(String(u._id)) || 0,
    }))

    // Filtres + compteurs calculés sur les soldes COURANTS (rollover appliqué).
    const hasCredits = (m: (typeof members)[number]) => m.activityCredits.some((w) => w.credits > 0)
    const hasAuto = (m: (typeof members)[number]) => m.activityCredits.some((w) => w.monthly > 0)

    const counts = {
      all: members.length,
      credits: members.filter(hasCredits).length,
      auto: members.filter(hasAuto).length,
      nocredits: members.filter((m) => !hasCredits(m)).length,
    }

    const filtered =
      filter === 'credits'
        ? members.filter(hasCredits)
        : filter === 'auto'
          ? members.filter(hasAuto)
          : filter === 'nocredits'
            ? members.filter((m) => !hasCredits(m))
            : members

    return NextResponse.json({ members: filtered, counts })
  } catch (error) {
    console.error('[members] list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
