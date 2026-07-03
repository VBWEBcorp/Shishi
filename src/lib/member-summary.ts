import { getPlan, creditsValid } from '@/lib/membership'
import type { IUser } from '@/models/User'

export interface MemberSummary {
  id: string
  email: string
  name: string
  phone: string
  plan: string
  credits: number
  creditsValid: boolean
  discountRate: number
  advanceDays: number
  renewAt: string | null
  memberSince: string | null
}

/** Résumé public d'un adhérent (renvoyé au client, sans données sensibles). */
export function memberSummary(user: IUser): MemberSummary {
  const plan = getPlan(user.plan)
  const valid = creditsValid(user.renewAt)
  return {
    id: String(user._id),
    email: user.email,
    name: user.name || '',
    phone: user.phone || '',
    plan: user.plan || 'none',
    credits: valid ? user.credits || 0 : 0,
    creditsValid: valid,
    discountRate: plan.discountRate,
    advanceDays: plan.advanceDays,
    renewAt: user.renewAt ? new Date(user.renewAt).toISOString() : null,
    memberSince: user.memberSince ? new Date(user.memberSince).toISOString() : null,
  }
}
