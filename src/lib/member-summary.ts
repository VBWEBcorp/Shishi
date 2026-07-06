import { effectiveWallet, MEMBER_ADVANCE_DAYS } from '@/lib/membership'
import type { IUser } from '@/models/User'

/** Solde courant d'un portefeuille d'activité (rollover appliqué). */
export interface ActivityCreditSummary {
  activity: string
  credits: number
  /** Rechargement automatique mensuel (0 = crédits ponctuels). */
  monthly: number
  renewAt: string | null
}

export interface MemberSummary {
  id: string
  email: string
  name: string
  phone: string
  /** Crédits par activité (tennis, fitness…), soldes courants. */
  activityCredits: ActivityCreditSummary[]
  advanceDays: number
  memberSince: string | null
}

/** Soldes courants des portefeuilles d'activité (rollover appliqué, sans écriture). */
export function activityCreditsSummary(user: Pick<IUser, 'activityCredits'>): ActivityCreditSummary[] {
  return (user.activityCredits || [])
    .map((w) => {
      const eff = effectiveWallet(w)
      return {
        activity: w.activity,
        credits: eff.credits,
        monthly: w.monthly || 0,
        renewAt: eff.renewAt ? eff.renewAt.toISOString() : null,
      }
    })
    // Les portefeuilles morts (0 crédit, pas d'automatique) ne sont pas affichés.
    .filter((w) => w.credits > 0 || w.monthly > 0)
}

/** Résumé public d'un adhérent (renvoyé au client, sans données sensibles). */
export function memberSummary(user: IUser): MemberSummary {
  return {
    id: String(user._id),
    email: user.email,
    name: user.name || '',
    phone: user.phone || '',
    activityCredits: activityCreditsSummary(user),
    advanceDays: MEMBER_ADVANCE_DAYS,
    memberSince: user.memberSince ? new Date(user.memberSince).toISOString() : null,
  }
}
