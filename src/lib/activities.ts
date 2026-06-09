/**
 * Configuration centrale des pôles d'activité de Shi Shi Samui.
 *
 * Source de vérité partagée par : le header (menu activités), la page d'accueil
 * (tuiles cliquables type AnyBuddy), les pages activité dédiées et le SEO.
 *
 * Chaque libellé est bilingue { en, fr } pour préparer la couche next-intl.
 */

export type Locale = 'en' | 'fr'
export type Localized = Record<Locale, string>

export interface Activity {
  /** Identifiant d'URL : /activities/<slug> */
  slug: string
  /** Nom court affiché (tuiles, menu, header) */
  name: Localized
  /** Accroche d'une ligne (tuiles, hero de page) */
  tagline: Localized
  /** Paragraphe d'introduction (page dédiée, meta description SEO) */
  description: Localized
  /** Identifiant d'icône résolu par <ActivityIcon /> */
  icon: string
  /** Image de couverture (placeholder Unsplash en attendant les photos client) */
  image: string
  /** Classes Tailwind pour le dégradé d'accent de la tuile */
  gradient: string
  /** Activité phare mise en avant (badge "Signature") */
  featured?: boolean
  /** Mots-clés SEO indicatifs (la stratégie finale viendra de VBWEB) */
  keywords: string[]
}

export const activities: Activity[] = [
  {
    slug: 'pickleball',
    name: { en: 'Pickleball', fr: 'Pickleball' },
    tagline: {
      en: "Koh Samui's home of pickleball",
      fr: 'Le repaire du pickleball à Koh Samui',
    },
    description: {
      en: 'Discover the fastest-growing racket sport on dedicated courts in Lamai. Beginner-friendly, social and seriously addictive. Book a court, join a clinic or play a friendly match.',
      fr: 'Découvrez le sport de raquette qui monte sur des terrains dédiés à Lamai. Accessible, convivial et terriblement addictif. Réservez un terrain, rejoignez une initiation ou jouez un match.',
    },
    icon: 'pickleball',
    image: '/photos/pickleball.jpg',
    gradient: 'from-emerald-500/15 to-teal-500/5',
    featured: true,
    keywords: ['pickleball koh samui', 'pickleball lamai', 'pickleball court samui'],
  },
  {
    slug: 'tennis',
    name: { en: 'Tennis', fr: 'Tennis' },
    tagline: {
      en: 'Premium courts under the sun',
      fr: 'Des courts premium sous le soleil',
    },
    description: {
      en: 'Play on quality tennis courts in the south of Koh Samui. Singles, doubles, coaching and racket rental: everything you need to get on court in under a minute.',
      fr: 'Jouez sur des courts de tennis de qualité au sud de Koh Samui. Simple, double, coaching et location de raquette : tout pour entrer sur le court en moins d’une minute.',
    },
    icon: 'tennis',
    image: '/photos/tennis-aerial.jpg',
    gradient: 'from-lime-500/15 to-emerald-500/5',
    keywords: ['tennis koh samui', 'tennis court lamai', 'tennis lessons samui'],
  },
  {
    slug: 'fitness',
    name: { en: 'Fitness', fr: 'Fitness' },
    tagline: {
      en: 'A premium gym, island-style',
      fr: 'Une salle premium, esprit île',
    },
    description: {
      en: 'Train in a fully equipped fitness space (strength, cardio and functional training) with the energy of a social club. Day passes and memberships available.',
      fr: 'Entraînez-vous dans un espace fitness entièrement équipé (force, cardio et functional training) avec l’énergie d’un social club. Pass journée et abonnements disponibles.',
    },
    icon: 'fitness',
    image: '/photos/fitness.jpg',
    gradient: 'from-orange-500/15 to-amber-500/5',
    keywords: ['gym koh samui', 'fitness lamai', 'gym samui day pass'],
  },
  {
    slug: 'restaurant',
    name: { en: 'Restaurant', fr: 'Restaurant' },
    tagline: {
      en: 'Healthy food, all-day vibes',
      fr: 'Cuisine healthy, ambiance toute la journée',
    },
    description: {
      en: 'Fuel up with a fresh, healthy menu by the pool: smoothies, bowls and feel-good plates designed for an active lifestyle in the heart of Lamai.',
      fr: 'Rechargez les batteries avec une carte fraîche et healthy au bord de la piscine : smoothies, bowls et assiettes feel-good pensées pour un mode de vie actif, au cœur de Lamai.',
    },
    icon: 'restaurant',
    image: '/photos/restaurant.jpg',
    gradient: 'from-rose-500/15 to-orange-500/5',
    keywords: ['healthy restaurant lamai', 'restaurant koh samui', 'healthy food samui'],
  },
  {
    slug: 'kids-club',
    name: { en: 'Kids Club', fr: 'Kids Club' },
    tagline: {
      en: 'Kids club & babysitting',
      fr: 'Kids club & babysitting',
    },
    description: {
      en: 'A safe, fun space for children with supervised activities and babysitting, so the whole family can enjoy the club. Perfect for expats and visiting families.',
      fr: 'Un espace sûr et ludique pour les enfants, avec activités encadrées et babysitting, pour que toute la famille profite du club. Idéal pour les expatriés et familles de passage.',
    },
    icon: 'kids',
    image: '/photos/kids-welcome.jpg',
    gradient: 'from-sky-500/15 to-cyan-500/5',
    keywords: ['kids club koh samui', 'babysitting samui', 'family koh samui'],
  },
  {
    slug: 'pool',
    name: { en: 'Pool', fr: 'Piscine' },
    tagline: {
      en: 'Cool off, soak up the sun',
      fr: 'Rafraîchissez-vous au soleil',
    },
    description: {
      en: 'Relax by the pool between sessions or spend the whole day lounging. The social heart of the resort, with the restaurant just steps away.',
      fr: 'Détendez-vous au bord de la piscine entre deux sessions ou passez la journée à lézarder. Le cœur social du resort, avec le restaurant à deux pas.',
    },
    icon: 'pool',
    image: '/photos/pool.jpg',
    gradient: 'from-cyan-500/15 to-sky-500/5',
    keywords: ['pool lamai', 'swimming pool koh samui', 'pool day pass samui'],
  },
]

export function getActivity(slug: string): Activity | undefined {
  return activities.find((a) => a.slug === slug)
}

export const activitySlugs = activities.map((a) => a.slug)
