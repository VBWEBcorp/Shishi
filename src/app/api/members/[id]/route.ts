import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import { CREDIT_PERIOD_MS, effectiveWallet } from '@/lib/membership'
import { activityCreditsSummary } from '@/lib/member-summary'
import { isBookable } from '@/lib/availability'

type Params = Promise<{ id: string }>

/**
 * Met à jour les CRÉDITS PAR ACTIVITÉ d'un adhérent (admin uniquement).
 * C'est le geste « jour J » : le client paie sur place, l'admin crédite.
 *
 * Corps accepté — activityCredits: { activity, add?, credits?, monthly? } :
 *  · add     = ajout ponctuel, valable 1 mois (période prolongée si besoin).
 *  · credits = solde exact (correction manuelle).
 *  · monthly = recharge AUTOMATIQUE mensuelle (0 = désactivée).
 */
export async function PATCH(request: NextRequest, { params }: { params: Params }) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    await connectDB()

    const target = await User.findById(id)
    if (!target) {
      return NextResponse.json({ error: 'Membre introuvable' }, { status: 404 })
    }

    if (!body.activityCredits || typeof body.activityCredits !== 'object') {
      return NextResponse.json({ error: 'Aucune modification demandée' }, { status: 400 })
    }

    const op = body.activityCredits as Record<string, unknown>
    const activity = String(op.activity || '').trim()
    if (!isBookable(activity)) {
      return NextResponse.json({ error: 'Activité inconnue' }, { status: 400 })
    }

    let wallet = target.activityCredits.find((w) => w.activity === activity)
    if (!wallet) {
      target.activityCredits.push({ activity, credits: 0, monthly: 0 })
      wallet = target.activityCredits[target.activityCredits.length - 1]
    }

    // Part de l'état courant (rollover appliqué) avant toute modification.
    const eff = effectiveWallet(wallet)
    wallet.credits = eff.credits
    wallet.renewAt = eff.renewAt ?? undefined
    const periodValid = !!wallet.renewAt && new Date(wallet.renewAt).getTime() > Date.now()

    // Recharge automatique mensuelle (0 = désactivée).
    if (op.monthly !== undefined && op.monthly !== null && op.monthly !== '') {
      const monthly = Math.max(0, Math.floor(Number(op.monthly) || 0))
      wallet.monthly = monthly
      // Activation sur un portefeuille sans période en cours : le premier
      // mois démarre immédiatement.
      if (monthly > 0 && !periodValid) {
        wallet.credits = Math.max(wallet.credits, monthly)
        wallet.renewAt = new Date(Date.now() + CREDIT_PERIOD_MS)
      }
    }

    // Ajout ponctuel : +N crédits valables 1 mois.
    if (op.add !== undefined && op.add !== null && op.add !== '') {
      const add = Math.floor(Number(op.add) || 0)
      wallet.credits = Math.max(0, wallet.credits + add)
      if (!periodValid) wallet.renewAt = new Date(Date.now() + CREDIT_PERIOD_MS)
    }

    // Solde exact (correction manuelle).
    if (op.credits !== undefined && op.credits !== null && op.credits !== '') {
      wallet.credits = Math.max(0, Math.floor(Number(op.credits) || 0))
      if (wallet.credits > 0 && !periodValid) wallet.renewAt = new Date(Date.now() + CREDIT_PERIOD_MS)
    }

    // Portefeuille redevenu vide et sans automatique → on le retire.
    if (wallet.credits === 0 && wallet.monthly === 0) {
      target.activityCredits = target.activityCredits.filter((w) => w.activity !== activity)
    }
    if ((wallet.credits > 0 || wallet.monthly > 0) && !target.memberSince) {
      target.memberSince = new Date()
    }
    target.markModified('activityCredits')

    await target.save()

    return NextResponse.json({
      ok: true,
      member: {
        id: String(target._id),
        activityCredits: activityCreditsSummary(target),
        memberSince: target.memberSince || null,
      },
    })
  } catch (error) {
    console.error('[members] update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
