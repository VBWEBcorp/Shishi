import { NextRequest, NextResponse } from 'next/server'

import { generateToken } from '@/lib/auth'

/**
 * Connexion admin par identifiants uniques stockés dans `.env.local`
 * (ADMIN_EMAIL + ADMIN_PASSWORD). Pas de base de données : un seul compte
 * administrateur pour gérer le site.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD

    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('[auth] ADMIN_EMAIL / ADMIN_PASSWORD non configurés dans .env.local')
      return NextResponse.json(
        { error: 'Authentification non configurée' },
        { status: 500 }
      )
    }

    const emailOk = String(email).trim().toLowerCase() === ADMIN_EMAIL.toLowerCase()
    const passwordOk = String(password) === ADMIN_PASSWORD

    if (!emailOk || !passwordOk) {
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    const token = generateToken({
      userId: 'admin',
      email: ADMIN_EMAIL,
      role: 'admin',
    })

    return NextResponse.json({
      token,
      user: { id: 'admin', email: ADMIN_EMAIL, name: 'Admin', role: 'admin' },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 })
  }
}
