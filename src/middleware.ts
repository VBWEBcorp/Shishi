import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Exclut l'admin, l'API, les internes Next et tous les fichiers (avec extension)
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
}
