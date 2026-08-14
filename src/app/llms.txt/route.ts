import { routing } from '@/i18n/routing'

// /llms.txt à la racine — le site n'existe qu'en /en et /fr, chacun avec son
// propre fichier. On renvoie vers celui de la langue par défaut plutôt que de
// mélanger les deux, ce qui rendrait le fichier inexploitable par un modèle.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET(req: Request) {
  const cible = new URL(`/${routing.defaultLocale}/llms.txt`, req.url)
  return Response.redirect(cible, 308)
}
