import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User, { type IActivityCredit, type IUser } from '@/models/User'
import SubscriptionPlan from '@/models/SubscriptionPlan'
import { CREDIT_PERIOD_MS, effectiveWallet } from '@/lib/membership'
import { activityCreditsSummary } from '@/lib/member-summary'
import { isBookable } from '@/lib/availability'

type Params = Promise<{ id: string }>

/** Trouve (ou crée) le portefeuille d'une activité, rollover courant appliqué. */
function ensureWallet(target: IUser, activity: string): IActivityCredit {
  let wallet = target.activityCredits.find((w) => w.activity === activity)
  if (!wallet) {
    target.activityCredits.push({ activity, credits: 0, monthly: 0 })
    wallet = target.activityCredits[target.activityCredits.length - 1]
  }
  const eff = effectiveWallet(wallet)
  wallet.credits = eff.credits
  wallet.renewAt = eff.renewAt ?? undefined
  return wallet
}

/** Positionne la recharge auto ; démarre le 1er mois s'il n'y a pas de période en cours. */
function setMonthly(wallet: IActivityCredit, monthly: number) {
  const periodValid = !!wallet.renewAt && new Date(wallet.renewAt).getTime() > Date.now()
  wallet.monthly = Math.max(0, Math.floor(monthly || 0))
  if (wallet.monthly > 0 && !periodValid) {
    wallet.credits = Math.max(wallet.credits, wallet.monthly)
    wallet.renewAt = new Date(Date.now() + CREDIT_PERIOD_MS)
  }
}

function memberResponse(target: IUser) {
  return {
    id: String(target._id),
    activityCredits: activityCreditsSummary(target),
    subscription: target.subscription
      ? {
          name: target.subscription.name,
          priceTHB: target.subscription.priceTHB || 0,
          startedAt: target.subscription.startedAt,
        }
      : null,
    memberSince: target.memberSince || null,
  }
}

/**
 * Met à jour un adhérent (admin uniquement). C'est le geste « jour J » : le
 * client paie sur place, l'admin crédite. Trois opérations mutuellement
 * exclusives selon le corps :
 *
 *  · subscriptionPlanId → applique un abonnement du catalogue : met en place la
 *    recharge auto mensuelle de chaque activité de l'abonnement.
 *  · action:'cancel-subscription' → résilie : stoppe les recharges auto (les
 *    crédits du mois en cours restent jusqu'à expiration).
 *  · activityCredits: { activity, add?|credits?|monthly? } → crédits d'une
 *    seule activité (ajout ponctuel 1 mois, solde exact, ou recharge auto).
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

    // 1) Appliquer un abonnement du catalogue (1 clic).
    if (body.subscriptionPlanId) {
      const plan = await SubscriptionPlan.findById(String(body.subscriptionPlanId))
      if (!plan) {
        return NextResponse.json({ error: 'Abonnement introuvable' }, { status: 404 })
      }
      // Appliquer = remplacer : on stoppe d'abord TOUTES les recharges auto
      // héritées (sinon un ancien plan laisserait ses activités se recharger,
      // au-delà du budget du nouveau plan), puis on repose celles du plan.
      // Les crédits du mois en cours restent jusqu'à leur échéance.
      for (const w of [...target.activityCredits]) {
        ensureWallet(target, w.activity).monthly = 0
      }
      for (const c of plan.credits) {
        if (!isBookable(c.activity)) continue
        setMonthly(ensureWallet(target, c.activity), c.monthly)
      }
      // Retire les portefeuilles vides (0 crédit, plus de recharge).
      target.activityCredits = target.activityCredits.filter((w) => w.credits > 0 || w.monthly > 0)
      target.subscription = {
        planId: String(plan._id),
        name: plan.name,
        priceTHB: plan.priceTHB || 0,
        startedAt: new Date(),
      }
      if (!target.memberSince) target.memberSince = new Date()
      target.markModified('activityCredits')
      await target.save()
      return NextResponse.json({ ok: true, member: memberResponse(target) })
    }

    // 2) Résilier l'abonnement en cours : on stoppe les recharges auto.
    if (body.action === 'cancel-subscription') {
      for (const w of [...target.activityCredits]) {
        ensureWallet(target, w.activity).monthly = 0
      }
      // Retire les portefeuilles vides (0 crédit, plus de recharge).
      target.activityCredits = target.activityCredits.filter((w) => w.credits > 0 || w.monthly > 0)
      target.subscription = undefined
      target.markModified('activityCredits')
      target.markModified('subscription')
      await target.save()
      return NextResponse.json({ ok: true, member: memberResponse(target) })
    }

    // 3) Crédits d'une seule activité (ajout ponctuel, solde exact, recharge auto).
    if (!body.activityCredits || typeof body.activityCredits !== 'object') {
      return NextResponse.json({ error: 'Aucune modification demandée' }, { status: 400 })
    }

    const op = body.activityCredits as Record<string, unknown>
    const activity = String(op.activity || '').trim()
    if (!isBookable(activity)) {
      return NextResponse.json({ error: 'Activité inconnue' }, { status: 400 })
    }

    const wallet = ensureWallet(target, activity)
    const periodValid = !!wallet.renewAt && new Date(wallet.renewAt).getTime() > Date.now()

    // Recharge automatique mensuelle (0 = désactivée).
    if (op.monthly !== undefined && op.monthly !== null && op.monthly !== '') {
      setMonthly(wallet, Number(op.monthly))
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
    return NextResponse.json({ ok: true, member: memberResponse(target) })
  } catch (error) {
    console.error('[members] update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
