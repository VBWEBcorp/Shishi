import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

/**
 * Secret de signature des jetons ADMIN. Il DOIT être fourni via la variable
 * d'environnement `JWT_SECRET`. En production, l'absence de secret est une
 * erreur bloquante (fail-closed) — on ne retombe JAMAIS sur une valeur codée en
 * dur, qui permettrait à quiconque de forger un jeton admin. En dev/test, un
 * secret de repli est toléré pour ne pas bloquer le travail local.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET manquant : la variable d\'environnement est obligatoire en production.')
  }
  return 'dev-secret-key'
}

export interface JWTPayload {
  userId: string
  email: string
  role: string
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d', algorithm: 'HS256' })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, getJwtSecret(), { algorithms: ['HS256'] }) as JWTPayload
  } catch {
    return null
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return null

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0] !== 'Bearer') return null

  return parts[1]
}

export async function verifyAuth(request: NextRequest) {
  const token = getTokenFromRequest(request)
  if (!token) {
    return { authenticated: false, user: null }
  }

  const payload = verifyToken(token)
  if (!payload) {
    return { authenticated: false, user: null }
  }

  return { authenticated: true, user: payload }
}
