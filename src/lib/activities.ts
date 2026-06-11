/**
 * Configuration centrale des pôles d'activité de Shi Shi Samui.
 *
 * Source de vérité partagée par : le header (menu activités), la page d'accueil
 * (tuiles cliquables type AnyBuddy), les pages service dédiées, le moteur de
 * réservation et tout le SEO on-page (balises méta, H1, mots-clés, ALT,
 * données structurées, maillage interne).
 *
 * IMPORTANT — deux identifiants distincts par service :
 *  · `slug`    = clé INTERNE stable (tennis, pickleball, fitness, restaurant,
 *                kids-club, pool, babysitting). Utilisée par le moteur de
 *                réservation, la grille tarifaire et les horaires. NE PAS changer.
 *  · `urlSlug` = segment d'URL SEO recommandé par l'audit (ex. tennis-court-lamai).
 *                Sert à construire `path` (/tennis-court-lamai) et la route
 *                dynamique [locale]/[service].
 *
 * Les libellés sont bilingues { en, fr } (couche next-intl). Les balises méta,
 * H1 et descriptions reprennent À LA LETTRE l'audit SEO VBWEB / experte.
 */

export type Locale = 'en' | 'fr'
export type Localized = Record<Locale, string>

/** Données structurées principales d'une page service (JSON-LD). */
export type ServiceSchema =
  | 'sportsActivity' // Service + SportsActivityLocation (tennis, pickleball)
  | 'healthClub' // HealthClub (fitness)
  | 'restaurant' // Restaurant (healthy restaurant)
  | 'service' // Service (kids club, babysitting, swimming pool)

/** Une question/réponse de FAQ (rendu visible + JSON-LD FAQPage). */
export interface ServiceFaq {
  q: Localized
  a: Localized
}

export interface Activity {
  /** Clé interne stable (réservation, tarifs, horaires). */
  slug: string
  /** Segment d'URL SEO (ex. tennis-court-lamai). */
  urlSlug: string
  /** Chemin complet de la page service (ex. /tennis-court-lamai). */
  path: string
  /** Nom court affiché (tuiles, menu, header). */
  name: Localized
  /** Accroche d'une ligne (tuiles, hero de page). */
  tagline: Localized
  /** Paragraphe d'introduction (page dédiée). */
  description: Localized
  /** Identifiant d'icône résolu par <ActivityIcon />. */
  icon: string
  /** Image de couverture. */
  image: string
  /** Classes Tailwind pour le dégradé d'accent de la tuile. */
  gradient: string
  /** Activité phare mise en avant (badge "Signature"). */
  featured?: boolean
  /** Apparaît dans le menu, le footer et les tuiles d'accueil (les 6 pôles). */
  inMenu: boolean
  /** Réservable en ligne (grille + sélecteur de réservation). */
  bookable: boolean

  // ── SEO on-page (audit « à la lettre ») ────────────────────────────────
  /** H1 unique de la page service. */
  h1: Localized
  /** Balise <title> complète (≈ 50-60 caractères, marque incluse). */
  metaTitle: Localized
  /** Meta description (≈ 140-160 caractères, orientée conversion). */
  metaDescription: Localized
  /** Mots-clés principaux. */
  keywordsPrimary: string[]
  /** Mots-clés complémentaires. */
  keywordsSecondary: string[]
  /** Données structurées recommandées. */
  schema: ServiceSchema
  /** Attributs ALT à prévoir (audit). */
  altImages: string[]
  /** Avantages / points clés affichés sur la page. */
  highlights: { en: string[]; fr: string[] }
  /** Galerie photo de la page service. */
  gallery: string[]
  /** Vidéo de fond du hero. */
  video: string
  /** FAQ visible (+ JSON-LD FAQPage). */
  faq: ServiceFaq[]
  /** Maillage interne (tokens résolus par resolveLink). */
  related: string[]
  /** Mots-clés legacy (compat). */
  keywords: string[]
}

const FALLBACK_VIDEO = '/videos/hero-pool.mp4'

// Pages transverses ciblées par le maillage interne (tokens « prices », etc.).
export const PRICES_PATH = '/prices'
export const BOOK_NOW_PATH = '/book-now'
export const CONTACT_PATH = '/contact-location'
export const ABOUT_PATH = '/a-propos'

export const SPECIAL_LINKS: Record<
  string,
  { path: string; label: Localized }
> = {
  home: { path: '/', label: { en: 'Home', fr: 'Accueil' } },
  prices: { path: PRICES_PATH, label: { en: 'View prices', fr: 'Voir les tarifs' } },
  'book-now': { path: BOOK_NOW_PATH, label: { en: 'Book now', fr: 'Réserver' } },
  contact: { path: CONTACT_PATH, label: { en: 'Contact', fr: 'Contact' } },
}

export const activities: Activity[] = [
  {
    slug: 'pickleball',
    urlSlug: 'pickleball-club-lamai',
    path: '/pickleball-club-lamai',
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
    inMenu: true,
    bookable: true,
    h1: {
      en: 'Pickleball Club in Lamai, Koh Samui',
      fr: 'Club de Pickleball à Lamai, Koh Samui',
    },
    metaTitle: {
      en: 'Pickleball Club in Lamai, Koh Samui | Shi Shi Samui',
      fr: 'Club de Pickleball à Lamai, Koh Samui | Shi Shi Samui',
    },
    metaDescription: {
      en: 'Play pickleball in Lamai at Shi Shi Samui. Book a court, join the community and discover pickleball in Koh Samui.',
      fr: 'Jouez au pickleball à Lamai chez Shi Shi Samui. Réservez un terrain, rejoignez la communauté et découvrez le pickleball à Koh Samui.',
    },
    keywordsPrimary: [
      'pickleball lamai',
      'pickleball koh samui',
      'pickleball in samui',
      'pickleball club lamai',
      'pickleball court koh samui',
      'book pickleball court koh samui',
    ],
    keywordsSecondary: [
      'play pickleball koh samui',
      'pickleball for beginners koh samui',
      'pickleball lessons koh samui',
      'pickleball community koh samui',
      'pickleball koh samui price',
    ],
    schema: 'sportsActivity',
    altImages: [
      'Pickleball court at Shi Shi Samui',
      'pickleball club in Lamai Koh Samui',
    ],
    highlights: {
      en: ['Dedicated pickleball courts', 'Beginner clinics & open play', 'Paddle & ball rental', 'Social tournaments'],
      fr: ['Terrains de pickleball dédiés', 'Initiations & jeu libre', 'Location de raquette & balles', 'Tournois conviviaux'],
    },
    gallery: ['/photos/pickleball.jpg', '/photos/tennis-aerial.jpg', '/photos/pool.jpg', '/photos/lounge.jpg'],
    video: '/videos/pickleball.mp4',
    faq: [
      {
        q: { en: 'Where can I play pickleball in Koh Samui?', fr: 'Où jouer au pickleball à Koh Samui ?' },
        a: {
          en: 'On dedicated pickleball courts at Shi Shi Samui in Lamai, south Koh Samui. Beginners and regular players are all welcome.',
          fr: 'Sur des terrains de pickleball dédiés chez Shi Shi Samui à Lamai, au sud de Koh Samui. Débutants comme joueurs réguliers sont les bienvenus.',
        },
      },
      {
        q: { en: 'Is pickleball good for beginners?', fr: 'Le pickleball est-il accessible aux débutants ?' },
        a: {
          en: 'Absolutely. Pickleball is easy to pick up — join an introduction session or a friendly match and play within minutes.',
          fr: 'Tout à fait. Le pickleball s’apprend très vite — rejoignez une initiation ou un match convivial et jouez en quelques minutes.',
        },
      },
      {
        q: { en: 'How do I book a pickleball court?', fr: 'Comment réserver un terrain de pickleball ?' },
        a: {
          en: 'Book online on our Book Now page or message us on WhatsApp — we confirm your slot right away.',
          fr: 'Réservez en ligne via notre page Réservation ou écrivez-nous sur WhatsApp — nous confirmons votre créneau aussitôt.',
        },
      },
    ],
    related: ['tennis-court-lamai', 'prices', 'book-now', 'contact'],
    keywords: ['pickleball koh samui', 'pickleball lamai', 'pickleball court samui'],
  },
  {
    slug: 'tennis',
    urlSlug: 'tennis-court-lamai',
    path: '/tennis-court-lamai',
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
    inMenu: true,
    bookable: true,
    h1: {
      en: 'Tennis Court in Lamai, Koh Samui',
      fr: 'Court de Tennis à Lamai, Koh Samui',
    },
    metaTitle: {
      en: 'Tennis Court in Lamai, Koh Samui | Shi Shi Samui',
      fr: 'Court de Tennis à Lamai, Koh Samui | Shi Shi Samui',
    },
    metaDescription: {
      en: 'Book a tennis court in Lamai at Shi Shi Samui. Play tennis in Koh Samui with easy booking, prices and club facilities.',
      fr: 'Réservez un court de tennis à Lamai chez Shi Shi Samui. Jouez au tennis à Koh Samui : réservation simple, tarifs et installations du club.',
    },
    keywordsPrimary: [
      'tennis court lamai',
      'tennis court koh samui',
      'tennis lamai',
      'tennis koh samui',
      'book tennis court lamai',
      'book tennis court koh samui',
    ],
    keywordsSecondary: [
      'tennis court rental lamai',
      'play tennis in lamai',
      'tennis lessons koh samui',
      'tennis coach koh samui',
      'tennis court koh samui price',
      'tennis court lamai photos',
    ],
    schema: 'sportsActivity',
    altImages: [
      'Tennis court at Shi Shi Samui in Lamai',
      'tennis court rental in Koh Samui',
    ],
    highlights: {
      en: ['Quality tennis courts', 'Private & group coaching', 'Racket rental', 'Singles & doubles booking'],
      fr: ['Courts de tennis de qualité', 'Coaching privé & collectif', 'Location de raquette', 'Réservation simple & double'],
    },
    gallery: ['/photos/tennis-aerial.jpg', '/photos/pickleball.jpg', '/photos/pool.jpg', '/photos/lounge.jpg'],
    video: '/videos/tennis.mp4',
    faq: [
      {
        q: { en: 'Where can I play tennis in Lamai, Koh Samui?', fr: 'Où jouer au tennis à Lamai, Koh Samui ?' },
        a: {
          en: 'At Shi Shi Samui, a sports and social club in Lamai, south Koh Samui. Quality courts, open daily and easy to reach.',
          fr: 'Chez Shi Shi Samui, club sportif et social à Lamai, au sud de Koh Samui. Des courts de qualité, ouverts tous les jours et faciles d’accès.',
        },
      },
      {
        q: { en: 'How do I book a tennis court?', fr: 'Comment réserver un court de tennis ?' },
        a: {
          en: 'Reserve online on our Book Now page or message us on WhatsApp — we confirm your slot instantly.',
          fr: 'Réservez en ligne via notre page Réservation ou écrivez-nous sur WhatsApp — confirmation immédiate de votre créneau.',
        },
      },
      {
        q: { en: 'Can I rent a racket or take a lesson?', fr: 'Puis-je louer une raquette ou prendre un cours ?' },
        a: {
          en: 'Yes. Racket rental is available and coaching can be arranged with the club for singles or doubles.',
          fr: 'Oui. La location de raquette est disponible et un coaching peut être organisé avec le club, en simple ou en double.',
        },
      },
    ],
    related: ['pickleball-club-lamai', 'prices', 'book-now', 'contact'],
    keywords: ['tennis koh samui', 'tennis court lamai', 'tennis lessons samui'],
  },
  {
    slug: 'fitness',
    urlSlug: 'fitness-gym-lamai',
    path: '/fitness-gym-lamai',
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
    inMenu: true,
    bookable: true,
    h1: {
      en: 'Fitness Gym in Lamai, Koh Samui',
      fr: 'Salle de Sport à Lamai, Koh Samui',
    },
    metaTitle: {
      en: 'Fitness Gym in Lamai, Koh Samui | Shi Shi Samui',
      fr: 'Salle de Sport à Lamai, Koh Samui | Shi Shi Samui',
    },
    metaDescription: {
      en: 'Train at Shi Shi Samui, a fitness gym in Lamai with memberships, day passes and access to a premium sports club.',
      fr: 'Entraînez-vous chez Shi Shi Samui, salle de sport à Lamai avec abonnements, pass journée et accès à un club sportif premium.',
    },
    keywordsPrimary: [
      'gym lamai',
      'gym koh samui',
      'fitness gym lamai',
      'fitness gym koh samui',
      'gym membership lamai',
      'gym day pass samui',
    ],
    keywordsSecondary: [
      'fitness membership koh samui',
      'personal training koh samui',
      'gym for expats koh samui',
      'gym for digital nomads koh samui',
      'gym lamai price',
      'gym lamai photos',
    ],
    schema: 'healthClub',
    altImages: [
      'Fitness gym at Shi Shi Samui in Lamai',
      'gym equipment at Shi Shi Samui',
    ],
    highlights: {
      en: ['Strength & cardio zones', 'Functional training area', 'Day passes & memberships', 'Towel service'],
      fr: ['Zones force & cardio', 'Espace functional training', 'Pass journée & abonnements', 'Service de serviettes'],
    },
    gallery: ['/photos/fitness.jpg', '/photos/fitness-2.jpg', '/photos/lounge.jpg', '/photos/pool.jpg'],
    video: '/videos/fitness.mp4',
    faq: [
      {
        q: { en: 'Where is the gym in Lamai?', fr: 'Où se trouve la salle de sport à Lamai ?' },
        a: {
          en: 'Inside Shi Shi Samui sports club in Lamai, with strength, cardio and functional training zones.',
          fr: 'Au sein du club sportif Shi Shi Samui à Lamai, avec des zones force, cardio et functional training.',
        },
      },
      {
        q: { en: 'Do you offer day passes and memberships?', fr: 'Proposez-vous des pass journée et des abonnements ?' },
        a: {
          en: 'Yes — day passes, weekly and monthly memberships are available. See our Prices page for details.',
          fr: 'Oui — pass journée, abonnements à la semaine et au mois sont disponibles. Détails sur notre page Tarifs.',
        },
      },
      {
        q: { en: 'Is the gym suitable for expats and digital nomads?', fr: 'La salle convient-elle aux expatriés et digital nomads ?' },
        a: {
          en: 'Yes. Flexible passes make it ideal for residents, expats and long-stay visitors in Koh Samui.',
          fr: 'Oui. Des formules flexibles en font un choix idéal pour résidents, expatriés et visiteurs longue durée à Koh Samui.',
        },
      },
    ],
    related: ['prices', 'book-now', 'healthy-restaurant-lamai', 'swimming-pool-lamai'],
    keywords: ['gym koh samui', 'fitness lamai', 'gym samui day pass'],
  },
  {
    slug: 'restaurant',
    urlSlug: 'healthy-restaurant-lamai',
    path: '/healthy-restaurant-lamai',
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
    inMenu: true,
    bookable: false,
    h1: {
      en: 'Healthy Restaurant in Lamai, Koh Samui',
      fr: 'Restaurant Healthy à Lamai, Koh Samui',
    },
    metaTitle: {
      en: 'Healthy Restaurant in Lamai, Koh Samui | Shi Shi Samui',
      fr: 'Restaurant Healthy à Lamai, Koh Samui | Shi Shi Samui',
    },
    metaDescription: {
      en: 'Enjoy healthy food in Lamai at Shi Shi Samui. A relaxed restaurant for sport lovers, families, expats and visitors.',
      fr: 'Savourez une cuisine healthy à Lamai chez Shi Shi Samui. Un restaurant détendu pour sportifs, familles, expatriés et visiteurs.',
    },
    keywordsPrimary: [
      'healthy restaurant lamai',
      'healthy restaurant koh samui',
      'healthy food lamai',
      'healthy cafe lamai',
    ],
    keywordsSecondary: [
      'healthy restaurant lamai menu',
      'healthy brunch lamai',
      'restaurant with pool lamai',
      'restaurant for expats koh samui',
      'sports club restaurant koh samui',
    ],
    schema: 'restaurant',
    altImages: [
      'Healthy restaurant at Shi Shi Samui in Lamai',
      'healthy food in Koh Samui',
    ],
    highlights: {
      en: ['Fresh healthy menu', 'Smoothies & bowls', 'Poolside dining', 'Vegetarian & vegan options'],
      fr: ['Carte fraîche & healthy', 'Smoothies & bowls', 'Repas au bord de la piscine', 'Options végétariennes & vegan'],
    },
    gallery: ['/photos/restaurant.jpg', '/photos/restaurant-2.jpg', '/photos/pool-bar.jpg', '/photos/lounge.jpg'],
    video: '/videos/restaurant.mp4',
    faq: [
      {
        q: { en: 'Is there a healthy restaurant in Lamai?', fr: 'Y a-t-il un restaurant healthy à Lamai ?' },
        a: {
          en: 'Yes. Shi Shi Samui has a healthy restaurant by the pool serving smoothies, bowls and feel-good plates all day.',
          fr: 'Oui. Shi Shi Samui dispose d’un restaurant healthy au bord de la piscine : smoothies, bowls et assiettes feel-good toute la journée.',
        },
      },
      {
        q: { en: 'Can I eat without doing sport?', fr: 'Puis-je manger sans faire de sport ?' },
        a: {
          en: 'Of course — the restaurant is open to everyone, whether you train, swim or simply come to eat.',
          fr: 'Bien sûr — le restaurant est ouvert à tous, que vous veniez vous entraîner, nager ou simplement déjeuner.',
        },
      },
      {
        q: { en: 'Do you have vegetarian and vegan options?', fr: 'Proposez-vous des options végétariennes et vegan ?' },
        a: {
          en: 'Yes, the menu includes fresh vegetarian and vegan choices.',
          fr: 'Oui, la carte comprend des choix végétariens et vegan frais.',
        },
      },
    ],
    related: ['fitness-gym-lamai', 'swimming-pool-lamai', 'kids-club-lamai', 'book-now'],
    keywords: ['healthy restaurant lamai', 'restaurant koh samui', 'healthy food samui'],
  },
  {
    slug: 'kids-club',
    urlSlug: 'kids-club-lamai',
    path: '/kids-club-lamai',
    name: { en: 'Kids Club', fr: 'Kids Club' },
    tagline: {
      en: 'Kids club & family fun',
      fr: 'Kids club & moments en famille',
    },
    description: {
      en: 'A safe, fun space for children with supervised activities, so the whole family can enjoy the club. Perfect for expats and visiting families in Koh Samui.',
      fr: 'Un espace sûr et ludique pour les enfants, avec activités encadrées, pour que toute la famille profite du club. Idéal pour les expatriés et familles de passage à Koh Samui.',
    },
    icon: 'kids',
    image: '/photos/kids-welcome.jpg',
    gradient: 'from-sky-500/15 to-cyan-500/5',
    inMenu: true,
    bookable: true,
    h1: {
      en: 'Kids Club in Lamai, Koh Samui',
      fr: 'Kids Club à Lamai, Koh Samui',
    },
    metaTitle: {
      en: 'Kids Club in Lamai, Koh Samui | Shi Shi Samui',
      fr: 'Kids Club à Lamai, Koh Samui | Shi Shi Samui',
    },
    metaDescription: {
      en: 'Discover Shi Shi Kids Club in Lamai. Fun activities for children while parents enjoy sport, fitness, food or pool time.',
      fr: 'Découvrez le Kids Club Shi Shi à Lamai. Des activités ludiques pour les enfants pendant que les parents profitent du sport, du fitness, du restaurant ou de la piscine.',
    },
    keywordsPrimary: [
      'kids club lamai',
      'kids club koh samui',
      'kids activities lamai',
      'children activities koh samui',
    ],
    keywordsSecondary: [
      'kids club for tourists koh samui',
      'kids club for expats koh samui',
      'kids play area koh samui',
      'kids club lamai price',
      'kids club koh samui menu',
    ],
    schema: 'service',
    altImages: [
      'Kids club activities at Shi Shi Samui',
      'children activities in Lamai Koh Samui',
    ],
    highlights: {
      en: ['Supervised activities', 'Babysitting on request', 'Safe & shaded play area', 'Family-friendly all day'],
      fr: ['Activités encadrées', 'Babysitting sur demande', 'Aire de jeu sûre & ombragée', 'Convivial pour les familles'],
    },
    gallery: ['/photos/kids-welcome.jpg', '/photos/kids-play.jpg', '/photos/kids-outdoor.jpg', '/photos/kids-trampoline.jpg'],
    video: '/videos/kids.mp4',
    faq: [
      {
        q: { en: 'What is the Shi Shi Kids Club?', fr: 'Qu’est-ce que le Kids Club Shi Shi ?' },
        a: {
          en: 'A safe, supervised space in Lamai with fun activities for children while parents enjoy sport, the pool or the restaurant.',
          fr: 'Un espace sûr et encadré à Lamai avec des activités ludiques pour les enfants pendant que les parents profitent du sport, de la piscine ou du restaurant.',
        },
      },
      {
        q: { en: 'Who is the Kids Club for?', fr: 'À qui s’adresse le Kids Club ?' },
        a: {
          en: 'It welcomes families visiting or living in Koh Samui. Reach out for age details and current activities.',
          fr: 'Il accueille les familles de passage ou résidentes à Koh Samui. Contactez-nous pour les tranches d’âge et les activités du moment.',
        },
      },
      {
        q: { en: 'Do you also offer babysitting?', fr: 'Proposez-vous aussi du babysitting ?' },
        a: {
          en: 'Yes, a babysitting service is available on request — see our Babysitting page.',
          fr: 'Oui, un service de babysitting est disponible sur demande — voir notre page Babysitting.',
        },
      },
    ],
    related: ['babysitting-lamai', 'swimming-pool-lamai', 'healthy-restaurant-lamai', 'book-now'],
    keywords: ['kids club koh samui', 'family koh samui', 'kids activities lamai'],
  },
  {
    slug: 'pool',
    urlSlug: 'swimming-pool-lamai',
    path: '/swimming-pool-lamai',
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
    inMenu: true,
    bookable: true,
    h1: {
      en: 'Swimming Pool in Lamai, Koh Samui',
      fr: 'Piscine à Lamai, Koh Samui',
    },
    metaTitle: {
      en: 'Swimming Pool in Lamai, Koh Samui | Shi Shi Samui',
      fr: 'Piscine à Lamai, Koh Samui | Shi Shi Samui',
    },
    metaDescription: {
      en: 'Relax at Shi Shi Samui swimming pool in Lamai. Enjoy pool access with sports, healthy food and a family-friendly club atmosphere.',
      fr: 'Détendez-vous à la piscine Shi Shi Samui à Lamai. Profitez d’un accès piscine avec sport, cuisine healthy et une ambiance club familiale.',
    },
    keywordsPrimary: [
      'swimming pool lamai',
      'swimming pool koh samui',
      'pool access lamai',
      'pool club lamai',
    ],
    keywordsSecondary: [
      'swimming pool lamai opening hours',
      'family pool koh samui',
      'kids pool lamai',
      'pool and restaurant lamai',
      'private swimming pool lamai',
    ],
    schema: 'service',
    altImages: [
      'Swimming pool at Shi Shi Samui sports club',
      'pool access in Lamai Koh Samui',
    ],
    highlights: {
      en: ['Sun loungers & shade', 'Poolside service', 'Day pass access', 'Steps from the restaurant'],
      fr: ['Transats & coins ombragés', 'Service au bord de l’eau', 'Accès pass journée', 'À deux pas du restaurant'],
    },
    gallery: ['/photos/pool.jpg', '/photos/pool-2.jpg', '/photos/pool-bar.jpg', '/photos/lounge.jpg'],
    video: '/videos/hero-pool.mp4',
    faq: [
      {
        q: { en: 'Can I get pool access in Lamai?', fr: 'Puis-je accéder à la piscine à Lamai ?' },
        a: {
          en: 'Yes. Shi Shi Samui offers swimming pool access in Lamai with sun loungers, shade and poolside service.',
          fr: 'Oui. Shi Shi Samui propose un accès piscine à Lamai avec transats, ombre et service au bord de l’eau.',
        },
      },
      {
        q: { en: 'Is the pool family-friendly?', fr: 'La piscine est-elle adaptée aux familles ?' },
        a: {
          en: "Yes, it's a relaxed, family-friendly pool with the restaurant and kids club close by.",
          fr: 'Oui, c’est une piscine conviviale et familiale, avec le restaurant et le kids club à proximité.',
        },
      },
      {
        q: { en: 'How much is pool access?', fr: 'Combien coûte l’accès à la piscine ?' },
        a: {
          en: 'See our Prices page for day-access rates, or message us on WhatsApp.',
          fr: 'Consultez notre page Tarifs pour les tarifs d’accès à la journée, ou écrivez-nous sur WhatsApp.',
        },
      },
    ],
    related: ['healthy-restaurant-lamai', 'kids-club-lamai', 'prices', 'book-now'],
    keywords: ['pool lamai', 'swimming pool koh samui', 'pool day pass samui'],
  },
]

/**
 * Babysitting — page service dédiée demandée par l'audit (Priorité 1).
 * Non réservable en ligne, hors menu/tuiles (le design « 6 pôles » est
 * conservé) ; reliée depuis Kids Club, le footer et la page Contact.
 */
export const babysitting: Activity = {
  slug: 'babysitting',
  urlSlug: 'babysitting-lamai',
  path: '/babysitting-lamai',
  name: { en: 'Babysitting', fr: 'Babysitting' },
  tagline: {
    en: 'Childcare you can rely on',
    fr: 'Une garde d’enfants de confiance',
  },
  description: {
    en: 'A practical babysitting and childcare service in Lamai for families, expats and tourists — so parents can play, train or relax with complete peace of mind.',
    fr: 'Un service de babysitting et de garde d’enfants à Lamai pour les familles, expatriés et touristes — pour que les parents jouent, s’entraînent ou se détendent l’esprit tranquille.',
  },
  icon: 'kids',
  image: '/photos/kids-play.jpg',
  gradient: 'from-sky-500/15 to-cyan-500/5',
  inMenu: false,
  bookable: false,
  h1: {
    en: 'Babysitting Service in Lamai, Koh Samui',
    fr: 'Service de Babysitting à Lamai, Koh Samui',
  },
  metaTitle: {
    en: 'Babysitting in Lamai, Koh Samui | Shi Shi Samui',
    fr: 'Babysitting à Lamai, Koh Samui | Shi Shi Samui',
  },
  metaDescription: {
    en: 'Book a babysitting service in Lamai with Shi Shi Samui. A practical childcare solution for families, expats and tourists.',
    fr: 'Réservez un service de babysitting à Lamai avec Shi Shi Samui. Une solution de garde pratique pour les familles, expatriés et touristes.',
  },
  keywordsPrimary: [
    'babysitting koh samui',
    'babysitting lamai',
    'babysitter koh samui',
    'babysitter lamai',
    'childcare koh samui',
  ],
  keywordsSecondary: [
    'babysitting service koh samui',
    'babysitting for tourists koh samui',
    'babysitting for expats koh samui',
    'babysitting koh samui rates',
    'babysitting service lamai price',
  ],
  schema: 'service',
  altImages: [
    'Babysitting service at Shi Shi Samui',
    'childcare service in Lamai Koh Samui',
  ],
  highlights: {
    en: ['Trusted childcare', 'On request booking', 'At the club in Lamai', 'For families & visitors'],
    fr: ['Garde de confiance', 'Réservation sur demande', 'Au club à Lamai', 'Pour familles & visiteurs'],
  },
  gallery: ['/photos/kids-welcome.jpg', '/photos/kids-play.jpg', '/photos/kids-outdoor.jpg', '/photos/kids-trampoline.jpg'],
  video: '/videos/kids.mp4',
  faq: [
    {
      q: { en: 'Do you offer babysitting in Lamai?', fr: 'Proposez-vous du babysitting à Lamai ?' },
      a: {
        en: 'Yes. Shi Shi Samui offers a practical babysitting and childcare service for families, expats and tourists in Lamai.',
        fr: 'Oui. Shi Shi Samui propose un service de babysitting et de garde d’enfants pratique pour les familles, expatriés et touristes à Lamai.',
      },
    },
    {
      q: { en: 'How do I book a babysitter?', fr: 'Comment réserver une baby-sitter ?' },
      a: {
        en: 'Contact us on WhatsApp or via our Contact page to arrange a babysitting session.',
        fr: 'Contactez-nous sur WhatsApp ou via notre page Contact pour organiser une session de babysitting.',
      },
    },
    {
      q: { en: 'Where does babysitting take place?', fr: 'Où se déroule le babysitting ?' },
      a: {
        en: 'At the club in Lamai, alongside our Kids Club, so children are cared for in a safe, supervised setting.',
        fr: 'Au club à Lamai, aux côtés de notre Kids Club, pour une garde dans un cadre sûr et encadré.',
      },
    },
  ],
  related: ['kids-club-lamai', 'contact', 'prices', 'healthy-restaurant-lamai'],
  keywords: ['babysitting koh samui', 'babysitter lamai', 'childcare koh samui'],
}

/** Tous les pôles disposant d'une page service dédiée (route + sitemap). */
export const serviceConfigs: Activity[] = [...activities, babysitting]

/** Résout un service par son segment d'URL SEO (route dynamique). */
export function getService(urlSlug: string): Activity | undefined {
  return serviceConfigs.find((a) => a.urlSlug === urlSlug)
}

/** Résout un service par sa clé interne (réservation, tarifs). */
export function getActivity(slug: string): Activity | undefined {
  return serviceConfigs.find((a) => a.slug === slug)
}

/** Résout un token de maillage interne en { href, label }. */
export function resolveLink(
  token: string,
  locale: Locale
): { href: string; label: string } | null {
  const special = SPECIAL_LINKS[token]
  if (special) return { href: special.path, label: special.label[locale] }
  const svc = getService(token)
  if (svc) return { href: svc.path, label: svc.name[locale] }
  return null
}

export const activitySlugs = activities.map((a) => a.slug)
export const serviceUrlSlugs = serviceConfigs.map((a) => a.urlSlug)
