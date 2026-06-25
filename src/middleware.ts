import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'
import { LAUNCHED, PREVIEW_CODE, PREVIEW_COOKIE, PREVIEW_MAX_AGE } from './lib/launch'

const intlMiddleware = createMiddleware(routing)

// La façade « Coming Soon » est active EN PRODUCTION tant que le site n'est pas
// lancé. En local (dev), tout le site reste navigable.
const GATE_ENABLED = !LAUNCHED && process.env.NODE_ENV === 'production'

// Préfixe de locale en tête d'URL (/en, /fr).
const LOCALE_PREFIX = /^\/(en|fr)(?=\/|$)/

/**
 * Chemins publics pendant la phase Coming Soon (préfixe de locale retiré) :
 *  · « / » → l'accueil = la façade Coming Soon (indexation marque)
 */
function isPublicDuringComingSoon(pathname: string): boolean {
  const path = pathname.replace(LOCALE_PREFIX, '') || '/'
  return path === '/'
}

export default function middleware(req: NextRequest) {
  // Déverrouillage par lien : « …/?code=XXXX » → on pose le cookie d'aperçu puis
  // on redirige vers l'URL propre (sans le paramètre). Pratique pour partager
  // un seul lien au client.
  const codeParam = req.nextUrl.searchParams.get('code')
  if (codeParam && codeParam === PREVIEW_CODE) {
    const clean = req.nextUrl.clone()
    clean.searchParams.delete('code')
    const res = NextResponse.redirect(clean)
    res.cookies.set(PREVIEW_COOKIE, PREVIEW_CODE, {
      path: '/',
      maxAge: PREVIEW_MAX_AGE,
      sameSite: 'lax',
    })
    return res
  }

  const hasPreview = req.cookies.get(PREVIEW_COOKIE)?.value === PREVIEW_CODE

  // Façade active seulement si le visiteur n'a PAS le cookie d'aperçu valide.
  if (GATE_ENABLED && !hasPreview) {
    const { pathname } = req.nextUrl
    if (!isPublicDuringComingSoon(pathname)) {
      // Redirige vers l'accueil (façade Coming Soon) en conservant la locale.
      const locale = pathname.match(LOCALE_PREFIX)?.[1] ?? routing.defaultLocale
      const url = req.nextUrl.clone()
      url.pathname = `/${locale}`
      url.search = ''
      return NextResponse.redirect(url)
    }
  }

  return intlMiddleware(req)
}

export const config = {
  // Exclut l'admin, l'API, les internes Next et tous les fichiers (avec extension)
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
