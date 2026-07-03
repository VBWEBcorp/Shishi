import { NextResponse } from 'next/server'
import { clearMemberCookie } from '@/lib/member-auth'

/** Déconnexion adhérent : supprime le cookie de session. */
export async function POST() {
  const res = NextResponse.json({ ok: true })
  clearMemberCookie(res)
  return res
}
