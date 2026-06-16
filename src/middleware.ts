import createMiddleware from 'next-intl/middleware'
import { NextResponse, type NextRequest } from 'next/server'

import { routing } from './i18n/routing'
import { LAUNCHED } from './lib/launch'

const intlMiddleware = createMiddleware(routing)

// Gate « Coming Soon » : actif uniquement EN PRODUCTION tant que le site n'est
// pas lancé. En local, tout le site reste navigable.
const GATE_ACTIVE = !LAUNCHED && process.env.NODE_ENV === 'production'

// Préfixe de locale en tête d'URL (/en, /fr).
const LOCALE_PREFIX = /^\/(en|fr)(?=\/|$)/

/**
 * Chemins publics pendant la phase Coming Soon (préfixe de locale retiré) :
 *  · « / »        → l'accueil = la landing Coming Soon
 *  · « /preview » → aperçu privé du site complet (noindex, non lié publiquement)
 */
function isPublicDuringComingSoon(pathname: string): boolean {
  const path = pathname.replace(LOCALE_PREFIX, '') || '/'
  return path === '/' || path === '/preview' || path.startsWith('/preview/')
}

export default function middleware(req: NextRequest) {
  if (GATE_ACTIVE) {
    const { pathname } = req.nextUrl
    if (!isPublicDuringComingSoon(pathname)) {
      // Redirige vers l'accueil (Coming Soon) en conservant la locale.
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
