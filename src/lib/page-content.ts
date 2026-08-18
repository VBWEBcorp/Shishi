import 'server-only'

import { connectDB } from '@/lib/db'
import SiteContent from '@/models/SiteContent'

/**
 * Lecture SERVEUR du contenu saisi dans l'espace admin.
 *
 * Le hook `useContent` fait la même chose côté navigateur, pour les sections
 * rendues en client. Ici on vise l'inverse : les pages rendues sur le serveur
 * (pages activités, tarifs) doivent recevoir le contenu du client AVANT le
 * rendu HTML — sinon le texte modifié n'existerait pas dans la page envoyée
 * aux moteurs de recherche, et le visiteur verrait le texte d'origine remplacé
 * après coup. Ces pages étant les pages SEO principales du club, c'est le
 * point le plus important de tout le dispositif.
 */

/** Tranche de contenu pour une langue, ou objet vide. */
export async function getPageContent(
  pageId: string,
  locale: string
): Promise<Record<string, any>> {
  try {
    await connectDB()
    const doc = await SiteContent.findOne({ pageId }).lean<{ content?: any }>()
    const raw = doc?.content
    if (!raw || typeof raw !== 'object') return {}

    // Même contrat que `resolveSlice` côté client : format bilingue { fr, en },
    // ou ancien format à plat (mono-langue) servi aux deux langues.
    if ('fr' in raw || 'en' in raw) {
      const slice = raw[locale]
      return slice && typeof slice === 'object' ? slice : {}
    }
    return raw
  } catch (error) {
    // Une base indisponible ne doit jamais faire tomber une page publique :
    // on retombe silencieusement sur les valeurs par défaut du code.
    console.error(`[page-content] lecture de "${pageId}" impossible:`, error)
    return {}
  }
}

/** Identifiant de page CMS d'une activité (tennis → "service-tennis"). */
export function serviceContentId(slug: string): string {
  return `service-${slug}`
}

/** Reprend `fallback` dès que la valeur saisie est vide ou absente. */
export function orDefault<T>(value: T | undefined | null, fallback: T): T {
  if (value === undefined || value === null) return fallback
  if (typeof value === 'string' && value.trim() === '') return fallback
  if (Array.isArray(value) && value.length === 0) return fallback
  return value
}
