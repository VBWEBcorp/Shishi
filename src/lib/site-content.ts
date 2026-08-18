/**
 * site-content.ts — Contenu adaptable de la template
 *
 * Toute la copie + tous les visuels par défaut sont centralisés ici.
 * Pour adapter la template à un nouveau métier (restaurant, artisan, avocat,
 * conseil, e-commerce, etc.) il suffit d'éditer ce fichier — aucun composant
 * React à toucher.
 *
 * Le CMS (via /api/content/[pageId]) peut surcharger n'importe quelle valeur
 * en runtime ; ce qui est ici sert de fallback / d'état initial.
 *
 * Pour les icônes : passe une chaîne ("Globe", "Phone", "Heart"...) — elle est
 * résolue par `getIcon()` côté composant. Liste complète des icônes :
 * https://lucide.dev/icons/
 */

// ============================================================================
//                          IMAGES — pool de visuels
// ============================================================================
// Remplace ces URLs Unsplash par les vraies photos du client (locaux, équipe,
// produits, ateliers, plats, chantiers, etc.). Garde le format auto+fit pour
// la performance.

export const images = {
  // Hero homepage — 3 images qui défilent en carousel (photos du complexe)
  heroCarousel: [
    '/photos/tennis-court-portrait.webp',
    '/photos/pool-panorama-portrait.webp',
    '/photos/restaurant.jpg',
  ],

  // Section "Notre histoire" sur la home
  story: '/photos/pool-grand-angle-portrait.webp',

  // Page À propos — image principale du hero
  aboutHero: '/photos/tennis-court-portrait.webp',

  // Page Services — image de fond du hero
  servicesHero: '/photos/fitness-portrait.webp',

  // Page Contact — image de fond du hero
  contactHero: '/photos/pool-sala-portrait.webp',

  // Page À propos — galerie 4 images
  aboutGallery: [
    '/photos/pool-panorama-portrait.webp',
    '/photos/restaurant.jpg',
    '/photos/fitness-portrait.webp',
    '/photos/pool-courts-portrait.webp',
  ],

  // Page Services — 8 images illustrant chaque prestation
  services: [
    '/photos/pool-panorama-portrait.webp',
    '/photos/restaurant.jpg',
    '/photos/fitness-portrait.webp',
    '/photos/kids-aire-jeu-portrait.webp',
    '/photos/tennis-court-portrait.webp',
    '/photos/pool-grand-angle-portrait.webp',
    '/photos/equipe-kids-bulles-portrait.webp',
    '/photos/pool-transats-portrait.webp',
  ],

  // Section CTA — 2 colonnes d'images animées en marquee vertical
  ctaScrollColumns: {
    col1: [
      '/photos/pool-panorama-portrait.webp',
      '/photos/restaurant.jpg',
      '/photos/fitness-portrait.webp',
      '/photos/equipe-kids-bulles-portrait.webp',
    ],
    col2: [
      '/photos/tennis-court-portrait.webp',
      '/photos/pool-grand-angle-portrait.webp',
      '/photos/pool-transats-portrait.webp',
      '/photos/pool-parasols-portrait.webp',
    ],
  },

  // GalleryCarousel sur la home
  homeGallery: [
    '/photos/pool-panorama-portrait.webp',
    '/photos/restaurant.jpg',
    '/photos/fitness-portrait.webp',
    '/photos/kids-aire-jeu-portrait.webp',
    '/photos/tennis-court-portrait.webp',
    '/photos/pool-grand-angle-portrait.webp',
  ],
}

// ============================================================================
//                          HOME — Hero + sections
// ============================================================================

export const heroContent = {
  eyebrow: 'Bienvenue',
  title: 'Votre partenaire pour réussir en ligne',
  description:
    'Nous accompagnons les entreprises avec des solutions sur mesure, pensées pour durer. Présence digitale, performance et clarté.',
  button1: 'Prendre contact',
  button2: 'Découvrir nos services',
  images: images.heroCarousel,
}

export const storyContent = {
  eyebrow: 'Notre histoire',
  title: 'Une approche humaine, des résultats concrets',
  paragraph1:
    "Depuis nos débuts, nous croyons qu'un bon site commence par une bonne écoute. Nous prenons le temps de comprendre votre métier, vos clients et vos objectifs avant de concevoir quoi que ce soit.",
  paragraph2:
    "Le résultat : des projets qui vous ressemblent, qui parlent à votre audience, et qui travaillent pour vous 24h/24.",
  image: images.story,
}

// Aperçu des services sur la home (4 cards)
// `iconName` correspond à une icône lucide (voir https://lucide.dev/icons/)
export const servicesPreviewContent = {
  eyebrow: 'Nos services',
  title: 'Des solutions adaptées à votre activité',
  description:
    'Quel que soit votre secteur, nous vous aidons à développer votre présence et à atteindre vos objectifs.',
  items: [
    {
      iconName: 'Globe',
      title: 'Création de site web',
      desc: 'Sites vitrines modernes, responsive et optimisés pour convertir vos visiteurs en clients.',
    },
    {
      iconName: 'Search',
      title: 'Référencement SEO',
      desc: 'Stratégie de contenu et optimisation technique pour apparaître en première page Google.',
    },
    {
      iconName: 'Palette',
      title: 'Identité visuelle',
      desc: 'Logo, charte graphique et supports cohérents qui reflètent votre image de marque.',
    },
    {
      iconName: 'ShieldCheck',
      title: 'Maintenance & support',
      desc: 'Mises à jour, sécurité et accompagnement continu pour garder votre site performant.',
    },
  ],
}

export const testimonialsContent = {
  eyebrow: 'Avis Google',
  title: 'Ils adorent Shi Shi Samui',
  description:
    'Ce que nos adhérents et visiteurs pensent du club — sport, détente et bonne humeur à Lamai.',
  items: [
    { name: 'James W.', company: 'Tennis · Koh Samui', text: 'Best tennis courts on the island — well maintained, easy online booking and a great vibe. My go-to spot in Lamai.', stars: 5 },
    { name: 'Sophie L.', company: 'Family visit · France', text: 'The kids club is fantastic. Our children loved it while we enjoyed the pool and a healthy lunch. Perfect for families!', stars: 5 },
    { name: 'Mark T.', company: 'Fitness · Expat', text: 'Clean, modern gym with everything you need. Flexible sessions and a friendly team. Highly recommend for anyone in Lamai.', stars: 5 },
    { name: 'Lena K.', company: 'Restaurant · Germany', text: 'Fresh smoothies and delicious healthy bowls by the pool. The take away is super handy too. We came back three times!', stars: 5 },
    { name: 'David R.', company: 'Pickleball · Australia', text: 'Great courts and even better community. Staff are welcoming and the whole club has a premium but relaxed feel.', stars: 5 },
    { name: 'Marie D.', company: 'Séjour · Belgique', text: 'Un club magnifique, moderne et convivial. Réservation en ligne simple, personnel adorable. On reviendra sans hésiter.', stars: 5 },
    { name: 'Tom H.', company: 'Digital nomad · UK', text: 'My daily routine: gym, pool, healthy lunch. Fast wifi, calm atmosphere and top facilities. The best club in Samui.', stars: 5 },
    { name: 'Anna S.', company: 'Pool day · Sweden', text: 'Beautiful pool, comfy loungers and attentive service. A little paradise to spend the whole day. Loved every minute.', stars: 5 },
    { name: 'Julien P.', company: 'Tennis · France', text: 'Courts impeccables et ambiance au top. Le tarif de lancement est très correct. Hâte de voir les abonnements arriver !', stars: 5 },
    { name: 'Emma C.', company: 'Family · Netherlands', text: 'Everything in one place: sport, food, pool and a safe kids area. Exactly what we needed on holiday. Thank you Shi Shi!', stars: 5 },
  ],
}

export const galleryContent = {
  eyebrow: 'Galerie',
  title: 'En coulisses',
  images: images.homeGallery,
}

export const ctaContent = {
  eyebrow: 'Prêt à démarrer ?',
  title: 'Parlons de votre projet',
  description:
    "Un échange simple et sans engagement pour comprendre vos besoins et vous proposer la meilleure approche.",
  button: 'Demander un devis gratuit',
  scrollImages: images.ctaScrollColumns,
}

export const faqContent = {
  eyebrow: 'FAQ',
  title: 'Questions fréquentes',
  description:
    "Les réponses aux questions que vous vous posez avant de nous confier votre projet.",
  items: [
    {
      question: 'Combien coûte un site internet ?',
      answer:
        "Le tarif dépend de votre besoin : un site vitrine simple démarre autour de 1 500 €, une application web sur mesure peut aller bien au-delà. Nous établissons toujours un devis clair et détaillé après un premier échange gratuit.",
    },
    {
      question: 'Combien de temps faut-il pour livrer un site ?',
      answer:
        "Comptez 3 à 6 semaines pour un site vitrine standard, 2 à 4 mois pour un projet plus complexe. Nous vous fournissons un planning détaillé dès le début du projet, avec des jalons clairs.",
    },
    {
      question: 'Êtes-vous disponibles après la livraison ?',
      answer:
        "Oui, nous proposons des contrats de maintenance qui incluent les mises à jour, la sécurité, les sauvegardes et un support réactif. Vous restez accompagnés dans la durée.",
    },
    {
      question: "Le site m'appartient-il une fois livré ?",
      answer:
        "Totalement. Vous êtes propriétaire de votre site, de son code source, de son nom de domaine et de tous les contenus. Nous vous fournissons les accès et la documentation nécessaire.",
    },
    {
      question: 'Comment se passe le référencement (SEO) ?',
      answer:
        "Le SEO technique est intégré dès la conception : performance, structure sémantique, données structurées, accessibilité. Nous proposons aussi un accompagnement éditorial pour renforcer votre positionnement sur le long terme.",
    },
    {
      question: 'Acceptez-vous les paiements échelonnés ?',
      answer:
        "Oui. Le règlement se fait habituellement en 3 fois : 30 % à la signature, 40 % à mi-projet, 30 % à la livraison. Nous adaptons cette répartition selon vos contraintes.",
    },
  ],
}

// ============================================================================
//                          ABOUT — page À propos
// ============================================================================

export const aboutContent = {
  hero: {
    eyebrow: 'À propos',
    title: 'Une équipe engagée à vos côtés',
    description:
      "Nous croyons que chaque entreprise mérite une présence en ligne à la hauteur de ses ambitions. Depuis notre création, nous accompagnons artisans, PME et indépendants avec des solutions simples, efficaces et soignées.",
    image: images.aboutHero,
  },
  stats: [
    { value: '200+', label: 'Projets livrés' },
    { value: '98%', label: 'Clients satisfaits' },
    { value: '5 ans', label: "D'expertise" },
    { value: '24/7', label: 'Support continu' },
  ],
  values: [
    {
      iconName: 'Heart',
      title: 'Proximité',
      description:
        'Un interlocuteur unique, disponible, qui connaît votre projet sur le bout des doigts.',
    },
    {
      iconName: 'Lightbulb',
      title: 'Clarté',
      description: "Pas de jargon inutile. Des explications simples, des livrables concrets.",
    },
    {
      iconName: 'Users',
      title: 'Sur mesure',
      description:
        "Chaque projet est différent. Nous adaptons nos solutions à votre réalité, pas l'inverse.",
    },
  ],
  gallery: images.aboutGallery,
}

// ============================================================================
//                          SERVICES — page Services
// ============================================================================

export const servicesContent = {
  hero: {
    eyebrow: 'Nos activités',
    title: 'Tout pour une journée active à Lamai',
    description:
      'Sport, bien-être et convivialité au même endroit, à deux pas les uns des autres. Réservez en ligne en moins d\'une minute.',
  },
  kpis: [
    { value: '6', label: 'activités' },
    { value: '7/7', label: 'ouvert' },
    { value: '1 min', label: 'pour réserver' },
  ],
  // Chaque activité : icône, titre, description, 3 points clés, image
  list: [
    {
      iconName: 'Trophy',
      title: 'Tennis',
      description: 'Jouez sur un court de qualité au sud de Koh Samui : simple, double, coaching et location de raquette.',
      points: ['600 ฿ / heure', 'Ouvert 7h – 22h', 'Réservation en ligne'],
      image: '/photos/tennis-court-portrait.webp',
    },
    {
      iconName: 'Medal',
      title: 'Pickleball',
      description: 'Le repaire du pickleball à Koh Samui : terrains dédiés, initiations et matchs conviviaux pour tous les niveaux.',
      points: ['Terrains dédiés', 'Accessible & social', 'Location de raquette'],
      image: '/photos/pickleball.jpg',
    },
    {
      iconName: 'Dumbbell',
      title: 'Salle de sport',
      description: 'Un espace fitness entièrement équipé (force, cardio, functional training) avec l\'énergie d\'un social club.',
      points: ['250 ฿ / jour', '1000 ฿ / semaine · 1500 ฿ / mois', 'Ouvert 8h – 20h'],
      image: '/photos/fitness-portrait.webp',
    },
    {
      iconName: 'UtensilsCrossed',
      title: 'Restaurant',
      description: 'Une carte fraîche et healthy au bord de la piscine : smoothies, bowls et assiettes feel-good toute la journée.',
      points: ['Cuisine healthy', 'Au bord de la piscine', 'Options végé & vegan'],
      image: '/photos/restaurant.jpg',
    },
    {
      iconName: 'Baby',
      title: 'Kids Club',
      description: 'Un espace sûr et ludique pour les enfants, avec activités encadrées et babysitting, pour que toute la famille profite.',
      points: ['200 ฿ / heure', 'Ouvert 8h – 16h', 'Babysitting sur demande'],
      image: '/photos/kids-aire-jeu-portrait.webp',
    },
    {
      iconName: 'Waves',
      title: 'Piscine',
      description: 'Détendez-vous au bord de la piscine entre deux sessions ou passez la journée à lézarder, le restaurant à deux pas.',
      points: ['100 ฿ / accès journée', 'Transats & ombre', 'Cœur du resort'],
      image: '/photos/pool-panorama-portrait.webp',
    },
  ],
}

// ============================================================================
//                          CONTACT — page Contact
// ============================================================================

export const contactContent = {
  hero: {
    eyebrow: 'Contact',
    title: 'Une question ? Écrivez-nous',
    description:
      'Remplissez le formulaire ou contactez-nous directement par WhatsApp. Pour réserver une activité, passez par la page Réservation.',
  },
  // Les coordonnées (phone, email, address) viennent de siteConfig dans seo.ts
}

// ============================================================================
//                       PRESETS — exemples par métier
// ============================================================================
//
// Pour basculer rapidement la template sur un autre domaine, décommente l'un
// des presets ci-dessous et remplace les exports correspondants.
// (Tu peux aussi créer un fichier par métier et importer celui qui convient.)
//
// ─── PRESET RESTAURANT ────────────────────────────────────────────────────
// export const heroContent = {
//   eyebrow: 'Restaurant',
//   title: 'Une cuisine de saison, généreuse et authentique',
//   description: 'Tous les jours, des produits frais cuisinés à la minute par notre chef.',
//   button1: 'Réserver une table',
//   button2: 'Voir notre carte',
//   images: [...],
// }
// servicesPreviewContent.items = [
//   { iconName: 'Utensils', title: 'Carte du midi', desc: 'Plat + dessert à 18 €' },
//   { iconName: 'Wine', title: 'Carte des vins', desc: 'Sélection de 40 références…' },
//   ...
// ]
//
// ─── PRESET ARTISAN ───────────────────────────────────────────────────────
// servicesPreviewContent.items = [
//   { iconName: 'Hammer', title: 'Rénovation', desc: '...' },
//   { iconName: 'Paintbrush', title: 'Peinture', desc: '...' },
//   ...
// ]
//
// ─── PRESET AVOCAT / CONSEIL ──────────────────────────────────────────────
// servicesPreviewContent.items = [
//   { iconName: 'Scale', title: 'Droit du travail', desc: '...' },
//   { iconName: 'FileText', title: 'Droit des contrats', desc: '...' },
//   ...
// ]
