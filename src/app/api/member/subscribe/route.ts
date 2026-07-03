import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User, { type MembershipPlan } from '@/models/User'
import { getMemberFromRequest } from '@/lib/member-auth'
import { MEMBER_PLANS, getPlan } from '@/lib/membership'
import { memberSummary } from '@/lib/member-summary'

const VALID_PLANS: MembershipPlan[] = ['none', 'bronze', 'silver', 'gold']

/**
 * Souscription / changement d'abonnement.
 *
 * ⚠️ PROVISOIRE — active directement l'abonnement (attribution des crédits +
 * date de renouvellement à 1 mois). Le branchement du PAIEMENT récurrent de
 * l'abonnement (Stripe Billing) est une étape ultérieure : ici on pose la
 * structure crédits/renouvellement demandée.
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getMemberFromRequest(request)
    if (!session) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    const body = await request.json()
    const plan = String(body.plan || '') as MembershipPlan
    if (!VALID_PLANS.includes(plan)) {
      return NextResponse.json({ error: 'invalid-plan' }, { status: 400 })
    }

    await connectDB()
    const user = await User.findById(session.id)
    if (!user) {
      return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    }

    const config = getPlan(plan)
    user.plan = plan
    if (plan === 'none') {
      user.credits = 0
      user.renewAt = undefined
    } else {
      // Crédits du mois + renouvellement dans 30 jours (les crédits non
      // utilisés seront perdus à cette date).
      user.credits = config.credits
      user.renewAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      if (!user.memberSince) user.memberSince = new Date()
    }
    await user.save()

    return NextResponse.json({ ok: true, member: memberSummary(user), plans: MEMBER_PLANS })
  } catch (error) {
    console.error('[member/subscribe] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
