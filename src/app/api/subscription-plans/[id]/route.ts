import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import { isBookable } from '@/lib/availability'

type Params = Promise<{ id: string }>

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
    monthlyTotal: p.monthlyTotal || sum,
    credits,
    active: p.active !== false,
  }
}

/** Met à jour un abonnement — admin uniquement. */
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    const body = await request.json()
    await connectDB()
    const plan = await SubscriptionPlan.findById(id)
    if (!plan) {
      return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
    }

    if (typeof body.name === 'string') {
      const name = body.name.trim()
      if (!name) return NextResponse.json({ error: 'Le nom est obligatoire' }, { status: 400 })
      plan.name = name
    }
    if (body.priceTHB !== undefined) {
      plan.priceTHB = Math.max(0, Math.floor(Number(body.priceTHB) || 0))
    }
    if (body.credits !== undefined) {
      const credits = cleanCredits(body.credits)
      if (credits.length === 0) {
        return NextResponse.json({ error: 'Ajoutez au moins une activité avec des crédits' }, { status: 400 })
      }
      plan.credits = credits
    }

    // Total de crédits (plafond de répartition). Si fourni, il doit couvrir la
    // répartition ; sinon on garde l'existant en le remontant au besoin.
    const sum = (plan.credits || []).reduce((s, c) => s + (c.monthly || 0), 0)
    if (body.monthlyTotal !== undefined) {
      const asked = Math.max(0, Math.floor(Number(body.monthlyTotal) || 0))
      const total = asked > 0 ? asked : sum
      if (sum > total) {
        return NextResponse.json(
          { error: `La répartition (${sum}) dépasse le total de crédits (${total}).` },
          { status: 400 }
        )
      }
      plan.monthlyTotal = total
    } else if (!plan.monthlyTotal || plan.monthlyTotal < sum) {
      plan.monthlyTotal = sum
    }

    if (body.active !== undefined) {
      plan.active = !!body.active
    }

    await plan.save()
    return NextResponse.json({ ok: true, plan: serialize(plan) })
  } catch (error) {
    console.error('[subscription-plans] update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/** Supprime un abonnement du catalogue — admin uniquement. */
export async function DELETE(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const { id } = await params
    await connectDB()
    const res = await SubscriptionPlan.findByIdAndDelete(id)
    if (!res) {
      return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[subscription-plans] delete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
