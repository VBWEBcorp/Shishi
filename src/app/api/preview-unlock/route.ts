import { NextRequest, NextResponse } from 'next/server'

import { PREVIEW_CODE, PREVIEW_COOKIE, PREVIEW_MAX_AGE } from '@/lib/launch'

/**
 * Déverrouillage de l'aperçu privé : le client saisit le code sur la façade
 * « Coming Soon ». Si le code est bon, on pose un cookie (30 j) qui débloque
 * l'intégralité du site pour ce navigateur. Cookie non-httpOnly à dessein :
 * l'habillage (navbar/footer) en a besoin côté client.
 */
export async function POST(request: NextRequest) {
  let code = ''
  try {
    const body = await request.json()
    code = String(body?.code || '').trim()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-request' }, { status: 400 })
  }

  if (code !== PREVIEW_CODE) {
    return NextResponse.json({ ok: false, error: 'invalid-code' }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(PREVIEW_COOKIE, PREVIEW_CODE, {
    path: '/',
    maxAge: PREVIEW_MAX_AGE,
    sameSite: 'lax',
    httpOnly: false,
  })
  return res
}
