import 'server-only'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'

/**
 * Session ADHÉRENT (distincte de l'admin). Un JWT signé stocké dans un cookie
 * httpOnly : illisible par le JS client, envoyé automatiquement à chaque requête.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
export const MEMBER_COOKIE = 'shishi_member'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

export interface MemberSession {
  id: string
  email: string
}

export function signMemberToken(session: MemberSession): string {
  return jwt.sign({ ...session, kind: 'member' }, JWT_SECRET, { expiresIn: '30d' })
}

function verify(token: string | undefined | null): MemberSession | null {
  if (!token) return null
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload
    if (payload.kind !== 'member' || !payload.id) return null
    return { id: String(payload.id), email: String(payload.email || '') }
  } catch {
    return null
  }
}

/** Session adhérent depuis une requête (route handlers /api/*). */
export async function getMemberFromRequest(request: NextRequest): Promise<MemberSession | null> {
  return verify(request.cookies.get(MEMBER_COOKIE)?.value)
}

/** Session adhérent depuis les cookies (Server Components / pages). */
export async function getMemberSession(): Promise<MemberSession | null> {
  const store = await cookies()
  return verify(store.get(MEMBER_COOKIE)?.value)
}

/** Pose le cookie de session sur une réponse (connexion / inscription). */
export function setMemberCookie(res: NextResponse, token: string): void {
  res.cookies.set(MEMBER_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE,
  })
}

/** Supprime le cookie de session (déconnexion). */
export function clearMemberCookie(res: NextResponse): void {
  res.cookies.set(MEMBER_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  })
}
