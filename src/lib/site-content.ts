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
  // Hero homepage — 3 images qui défilent en carousel
  heroCarousel: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1920&q=80',
  ],

  // Section "Notre histoire" sur la home
  story:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',

  // Page À propos — image principale du hero
  aboutHero:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1920&q=80',

  // Page Services — image de fond du hero (workspace/bureau sombre)
  servicesHero:
    'https://images.unsplash.com/photo-1497032628192-86f99bcd76bc?auto=format&fit=crop&w=1920&q=80',

  // Page Contact — image de fond du hero
  contactHero:
    'https://images.unsplash.com/photo-1423666639041-f56000c27a9a?auto=format&fit=crop&w=1920&q=80',

  // Page À propos — galerie 4 images
  aboutGallery: [
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=600&q=80',
  ],

  // Page Services — 8 images illustrant chaque prestation
  services: [
    'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1543286386-713bdd548da4?auto=format&fit=crop&w=1200&q=80',
  ],

  // Section CTA — 2 colonnes d'images animées en marquee vertical
  ctaScrollColumns: {
    col1: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=500&fit=crop&q=75',
      'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=500&fit=crop&q=75',
      'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=500&fit=crop&q=75',
      'https://images.unsplash.com/photo-1531973576160-7125cd663d86?w=400&h=500&fit=crop&q=75',
    ],
    col2: [
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&h=500&fit=crop&q=75',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=500&fit=crop&q=75',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=500&fit=crop&q=75',
      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=500&fit=crop&q=75',
    ],
  },

  // GalleryCarousel sur la home
  homeGallery: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=720&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=720&q=80',
    'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=720&q=80',
    'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=720&q=80',
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=720&q=80',
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=720&q=80',
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
  eyebrow: 'Témoignages',
  title: 'Ils nous font confiance',
  description:
    'Des entreprises de tous horizons qui ont gagné en visibilité et en crédibilité.',
  items: [
    { name: 'Marie D.', company: 'Boulangerie Le Fournil', text: "Depuis le nouveau site, je reçois 3 fois plus d'appels. Les clients nous trouvent enfin sur Google.", stars: 5 },
    { name: 'Thomas L.', company: 'Cabinet Conseil TLR', text: 'Un travail soigné, un site clair et professionnel. Mes prospects comprennent immédiatement ce que je propose.', stars: 5 },
    { name: 'Camille B.', company: 'Atelier Camille', text: "Le site reflète parfaitement l'univers de ma marque. J'ai gagné en crédibilité auprès de mes clients.", stars: 5 },
    { name: 'Laurent M.', company: 'LM Rénovation', text: 'En trois mois, mon chiffre a augmenté de 40 %. Le site et le SEO font vraiment la différence.', stars: 5 },
    { name: 'Nadia K.', company: 'Agence NovaTour', text: 'Un accompagnement au top, des délais respectés et un résultat qui dépasse mes attentes.', stars: 5 },
    { name: 'Sophie R.', company: 'Studio Pilates Zen', text: "L'équipe a su capter l'ambiance de mon studio. Les réservations ont décollé.", stars: 5 },
    { name: 'Pierre V.', company: 'Transports Vallée', text: 'Un investissement rentabilisé en quelques semaines. Des contacts qualifiés chaque jour.', stars: 5 },
    { name: 'Julie A.', company: "Les Jardins d'Alice", text: 'Ils ont transformé notre présence en ligne. Le site est magnifique et nos ventes ont triplé.', stars: 5 },
    { name: 'Franck G.', company: 'Studio FG', text: 'Design épuré, navigation fluide, exactement ce que je voulais pour présenter mes projets.', stars: 4 },
    { name: 'Émilie T.', company: 'Clinique Vétérinaire du Parc', text: 'Nos clients trouvent toutes les infos facilement. La prise de rendez-vous a changé notre quotidien.', stars: 5 },
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
    eyebrow: 'Nos services',
    title: "Tout ce qu'il faut pour réussir en ligne",
    description:
      "Des prestations complètes, de la conception à l'accompagnement continu, adaptées à toutes les tailles d'entreprise.",
  },
  kpis: [
    { value: '8', label: 'prestations' },
    { value: '200+', label: 'projets livrés' },
    { value: '100%', label: 'sur mesure' },
  ],
  // Chaque service : icône, titre, description, 3 points clés, image
  list: [
    {
      iconName: 'Globe',
      title: 'Création de site vitrine',
      description: 'Un site moderne, rapide et responsive qui présente clairement votre activité et inspire confiance à vos visiteurs.',
      points: ['Design sur mesure', 'Mobile-first', 'Optimisé Google'],
      image: images.services[0],
    },
    {
      iconName: 'Smartphone',
      title: 'Application web',
      description: 'Outils métier, plateformes de réservation, espaces clients : des applications pensées pour simplifier votre quotidien.',
      points: ['Architecture évolutive', 'Sécurité renforcée', 'Hébergement haute dispo'],
      image: images.services[1],
    },
    {
      iconName: 'Search',
      title: 'Référencement naturel (SEO)',
      description: 'Optimisation technique, contenu stratégique et suivi de positionnement pour gagner en visibilité sur Google.',
      points: ['Audit technique', 'Stratégie de contenu', 'Suivi mensuel'],
      image: images.services[2],
    },
    {
      iconName: 'Palette',
      title: 'Identité visuelle',
      description: 'Logo, charte graphique, supports de communication : une image cohérente qui vous ressemble.',
      points: ['Logo & déclinaisons', 'Charte graphique', 'Supports print & web'],
      image: images.services[3],
    },
    {
      iconName: 'Megaphone',
      title: 'Communication digitale',
      description: 'Stratégie de contenu, réseaux sociaux et campagnes pour développer votre audience en ligne.',
      points: ['Stratégie éditoriale', 'Réseaux sociaux', 'Campagnes Ads'],
      image: images.services[4],
    },
    {
      iconName: 'Code',
      title: 'Développement sur mesure',
      description: 'Intégrations, automatisations, API : des solutions techniques taillées pour vos besoins spécifiques.',
      points: ['Intégrations sur mesure', 'API & automatisation', 'Code propre & testé'],
      image: images.services[5],
    },
    {
      iconName: 'ShieldCheck',
      title: 'Maintenance & sécurité',
      description: 'Mises à jour, sauvegardes, monitoring et corrections pour un site toujours performant et sécurisé.',
      points: ['Sauvegardes quotidiennes', 'Mises à jour sécu', 'Monitoring 24/7'],
      image: images.services[6],
    },
    {
      iconName: 'BarChart3',
      title: 'Analyse & reporting',
      description: 'Tableaux de bord clairs pour suivre vos performances, comprendre vos visiteurs et ajuster votre stratégie.',
      points: ['Dashboards clairs', 'Recommandations', 'Suivi mensuel'],
      image: images.services[7],
    },
  ],
}

// ============================================================================
//                          CONTACT — page Contact
// ============================================================================

export const contactContent = {
  hero: {
    eyebrow: 'Contact',
    title: 'Parlons de votre projet',
    description:
      'Remplissez le formulaire ci-dessous ou contactez-nous directement. Nous répondons sous 24h.',
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
