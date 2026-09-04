'use client'

/**
 * Réglages marketing (bannière + popup), récupérés UNE SEULE FOIS par chargement.
 *
 * La bannière et le popup appelaient chacun /api/marketing au montage : deux requêtes
 * identiques sur chaque page, à l'instant précis où le navigateur a le plus à faire.
 * Le rapport SEO d'août 2026 (§6) demande justement d'alléger ce moment-là : 800 ms de
 * temps de blocage sur mobile. Une promesse partagée suffit : le second appelant récupère
 * le résultat du premier.
 *
 * Cache court (30 s) : un réglage changé dans l'espace admin reste visible rapidement.
 */

const TTL = 30_000

let enCours: Promise<unknown> | null = null
let cache: { valeur: unknown; a: number } | null = null

export function fetchMarketing(): Promise<unknown> {
  const maintenant = Date.now()
  if (cache && maintenant - cache.a < TTL) return Promise.resolve(cache.valeur)
  if (enCours) return enCours

  enCours = fetch('/api/marketing')
    .then((r) => r.json())
    .then((data) => {
      cache = { valeur: data, a: Date.now() }
      enCours = null
      return data
    })
    .catch((e) => {
      enCours = null
      throw e
    })

  return enCours
}
