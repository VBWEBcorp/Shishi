import type { Locale } from '@/lib/activities'
import { serviceConfigs } from '@/lib/activities'

/**
 * Liens vers les pages service à proposer au bas d'un article de blog.
 *
 * Rapport SEO d'août 2026 (§7) : « Continuer les contenus locaux en français et en
 * anglais autour des activités, du tennis, du pickleball, du fitness et de Lamai,
 * AVEC DES LIENS VERS LES PAGES DE SERVICES. »
 *
 * Les articles n'en avaient aucun : ils se terminaient sur « tous les articles » et
 * « nous contacter ». Un article « où jouer au pickleball à Koh Samui » ne menait donc
 * pas à la page pickleball du club : ni le lecteur, ni Google. C'est précisément le
 * maillage qui manque aux pages de service pour être visitées et indexées.
 *
 * Les liens sont choisis d'après le contenu de l'article plutôt que posés en bloc :
 * quatre liens qui parlent du sujet valent mieux que sept qui l'ignorent.
 */

/** Termes qui rattachent un article à une page service, dans les deux langues. */
const INDICES: Record<string, string[]> = {
  tennis: ['tennis', 'court', 'raquette', 'racket'],
  pickleball: ['pickleball', 'paddle'],
  fitness: ['fitness', 'gym', 'salle de sport', 'musculation', 'workout', 'training', 'cardio'],
  restaurant: ['restaurant', 'healthy', 'manger', 'déjeuner', 'lunch', 'food', 'brunch', 'cuisine', 'menu'],
  'kids-club': ['kids', 'enfant', 'children', 'child', 'famille', 'family', 'bébé', 'baby', 'toddler'],
  pool: ['piscine', 'pool', 'natation', 'swim', 'baignade', 'transat'],
  babysitting: ['babysitting', 'baby-sitting', 'garde', 'nounou', 'childcare', 'nanny'],
}

/** Ordre de repli quand l'article ne cite aucune activité en particulier. */
const REPLI = ['tennis', 'pickleball', 'fitness', 'kids-club']

export type LienService = {
  slug: string
  href: string
  label: string
  description: string
}

/**
 * @param texte  Titre, extrait, tags et corps de l'article, concaténés.
 * @param locale Langue de la page (le lien porte toujours son préfixe).
 * @param max    Nombre maximum de liens rendus.
 */
export function servicesLies(texte: string, locale: Locale, max = 4): LienService[] {
  const contenu = texte.toLowerCase()

  // Classement par nombre d'occurrences : un article qui parle surtout de tennis met la
  // page tennis en premier, même si le pickleball est cité une fois en passant.
  const compte = (slug: string) =>
    (INDICES[slug] ?? []).reduce((n, mot) => n + contenu.split(mot).length - 1, 0)

  const cites = serviceConfigs
    .map((s) => ({ s, poids: compte(s.slug) }))
    .filter((x) => x.poids > 0)
    .sort((x, y) => y.poids - x.poids)
    .map((x) => x.s)

  const choisis = cites.length > 0 ? cites : REPLI
    .map((slug) => serviceConfigs.find((s) => s.slug === slug))
    .filter((s): s is (typeof serviceConfigs)[number] => Boolean(s))

  return choisis.slice(0, max).map((s) => ({
    slug: s.slug,
    href: `/${locale}${s.path}`,
    label: s.name[locale],
    description: s.tagline[locale],
  }))
}
