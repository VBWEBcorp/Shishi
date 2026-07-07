import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import { isBookable } from '@/lib/availability'

/** Normalise les crédits par activité reçus du client (slugs valides, entiers ≥ 0). */
function cleanCredits(raw: unknown): { activity: string; monthly: number }[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const out: { activity: string; monthly: number }[] = []
  for (const item of raw) {
    const o = (item ?? {}) as Record<string, unknown>
    const activity = String(o.activity || '').trim()
    const monthly = Math.max(0, Math.floor(Number(o.monthly) || 0))
    if (!isBookable(activity) || seen.has(activity) || monthly <= 0) continue
    seen.add(activity)
    out.push({ activity, monthly })
  }
  return out
}

function serialize(p: InstanceType<typeof SubscriptionPlan>) {
  const credits = (p.credits || []).map((c) => ({ activity: c.activity, monthly: c.monthly }))
  const sum = credits.reduce((s, c) => s + c.monthly, 0)
  return {
    id: String(p._id),
    name: p.name,
    priceTHB: p.priceTHB || 0,
    // Anciens abonnements sans total explicite : on retombe sur la somme répartie.
    monthlyTotal: p.monthlyTotal || sum,
    credits,
    active: p.active !== false,
  }
}

/**
 * Résout le total de crédits mensuels : le total fourni fait foi (plafond) ;
 * sinon on prend la somme répartie. Renvoie une erreur si la répartition
 * dépasse le total demandé.
 */
function resolveMonthlyTotal(
  rawTotal: unknown,
  credits: { monthly: number }[]
): { total: number } | { error: string } {
  const sum = credits.reduce((s, c) => s + c.monthly, 0)
  const asked = Math.max(0, Math.floor(Number(rawTotal) || 0))
  const total = asked > 0 ? asked : sum
  if (sum > total) {
    return { error: `La répartition (${sum}) dépasse le total de crédits (${total}).` }
  }
  return { total }
}

/** Liste des abonnements du catalogue — admin uniquement. */
export async function GET(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectDB()
    const plans = await SubscriptionPlan.find().sort({ createdAt: -1 })
    return NextResponse.json({ plans: plans.map(serialize) })
  } catch (error) {
    console.error('[subscription-plans] list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Crée un abonnement — admin uniquement. */
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const body = await request.json()
    const name = String(body.name || '').trim()
    if (!name) {
      return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 })
    }
    const credits = cleanCredits(body.credits)
    if (credits.length === 0) {
      return NextResponse.json({ error: 'Ajoutez au moins une activité avec des crédits' }, { status: 400 })
    }
    const totalRes = resolveMonthlyTotal(body.monthlyTotal, credits)
    if ('error' in totalRes) {
      return NextResponse.json({ error: totalRes.error }, { status: 400 })
    }
    await connectDB()
    const plan = await SubscriptionPlan.create({
      name,
      priceTHB: Math.max(0, Math.floor(Number(body.priceTHB) || 0)),
      monthlyTotal: totalRes.total,
      credits,
      active: body.active !== false,
    })
    return NextResponse.json({ ok: true, plan: serialize(plan) })
  } catch (error) {
    console.error('[subscription-plans] create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
