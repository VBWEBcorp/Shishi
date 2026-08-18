import { serviceConfigs, type Activity, type Locale } from '@/lib/activities'
import { OPENING_HOURS, PRICE_TIERS } from '@/lib/booking-pricing'

/**
 * Catalogue des pages modifiables par le client, décrit une fois pour toutes.
 *
 * Chaque page déclare ses sections et ses champs ; l'espace « Contenu » se
 * construit tout seul à partir d'ici. Ajouter un champ à une page ne demande
 * donc aucune ligne d'interface : on l'ajoute à la déclaration, et il apparaît
 * dans l'admin, dans les deux langues, avec son aperçu.
 *
 * Le `key` d'un champ est le chemin dans le contenu enregistré (`hero.title`),
 * exactement celui que lit la page publique côté site.
 */

export type FieldType = 'text' | 'textarea' | 'image' | 'video' | 'text-list' | 'faq-list'

export interface EditableField {
  /** Chemin dans le contenu, ex. "hero.title". */
  key: string
  label: string
  type: FieldType
  /** Aide affichée sous le champ. */
  hint?: string
}

export interface EditableSection {
  title: string
  /** Repère affiché en tête de section pour situer la zone sur la page. */
  description?: string
  fields: EditableField[]
}

export interface EditablePage {
  /** pageId du CMS — celui que lit la page publique. */
  id: string
  /** Nom affiché dans la liste. */
  label: string
  /** Regroupement dans la barre latérale. */
  group: 'Site' | 'Activités'
  /** Chemin public, pour l'aperçu (sans préfixe de langue). */
  previewPath: string
  sections: EditableSection[]
  /** Valeurs de départ par langue, reprises du site tel qu'il est livré. */
  defaults: Record<Locale, Record<string, any>>
}

const HINT_IMAGE_PAIR = 'Photo d’ordinateur (paysage) et, si besoin, photo de téléphone (portrait).'

// ── Pages principales ──────────────────────────────────────────────────────

const homePage: EditablePage = {
  id: 'home',
  label: 'Accueil',
  group: 'Site',
  previewPath: '/',
  sections: [
    {
      title: 'Bandeau d’accueil',
      description: 'Le grand visuel en haut de la page, avec le moteur de réservation.',
      fields: [
        { key: 'hero.eyebrow', label: 'Petite accroche', type: 'text' },
        { key: 'hero.title', label: 'Titre principal', type: 'text' },
        { key: 'hero.description', label: 'Description', type: 'textarea' },
        { key: 'hero.video', label: 'Vidéo de fond', type: 'video', hint: 'Laissez vide pour n’afficher que la photo.' },
        { key: 'hero.image', label: 'Photo de fond', type: 'image', hint: HINT_IMAGE_PAIR },
      ],
    },
    {
      title: 'Nos valeurs',
      description: 'Le bandeau à trois colonnes.',
      fields: [
        { key: 'values.0.title', label: 'Valeur 1 — titre', type: 'text' },
        { key: 'values.0.text', label: 'Valeur 1 — texte', type: 'textarea' },
        { key: 'values.1.title', label: 'Valeur 2 — titre', type: 'text' },
        { key: 'values.1.text', label: 'Valeur 2 — texte', type: 'textarea' },
        { key: 'values.2.title', label: 'Valeur 3 — titre', type: 'text' },
        { key: 'values.2.text', label: 'Valeur 3 — texte', type: 'textarea' },
      ],
    },
    {
      title: 'Notre histoire',
      fields: [
        { key: 'story.eyebrow', label: 'Petite accroche', type: 'text' },
        { key: 'story.title', label: 'Titre', type: 'text' },
        { key: 'story.paragraph1', label: 'Paragraphe 1', type: 'textarea' },
        { key: 'story.paragraph2', label: 'Paragraphe 2', type: 'textarea' },
        { key: 'story.image', label: 'Photo', type: 'image', hint: HINT_IMAGE_PAIR },
      ],
    },
    {
      title: 'Appel à l’action',
      description: 'Le bloc « Réservez votre prochaine session », en bas de page.',
      fields: [
        { key: 'cta.title', label: 'Titre', type: 'text' },
        { key: 'cta.description', label: 'Description', type: 'textarea' },
        { key: 'cta.button', label: 'Bouton', type: 'text' },
      ],
    },
  ],
  defaults: {
    fr: {
      hero: {
        eyebrow: 'Lamai · Koh Samui · Thaïlande',
        title: 'Le social club resort premium du sud de Samui',
        description:
          'Sport, bien-être et convivialité au même endroit. Tennis, le repaire du pickleball sur l’île, une salle premium, un restaurant healthy, un kids club et une piscine.',
        video: '/videos/hero-pool.mp4',
        image: '/photos/pool-panorama-portrait.webp',
      },
      story: {
        eyebrow: 'Notre histoire',
        title: 'Un lieu de vie, pas seulement un club',
        paragraph1:
          'Shi Shi Samui est né d’une envie simple : créer, au sud de Koh Samui, un endroit où l’on vient bouger, se détendre et se retrouver.',
        paragraph2:
          'Plus qu’une salle ou un terrain, c’est un véritable social club tropical : on s’entraîne le matin et on déjeune au bord de l’eau.',
        image: '/photos/pool-grand-angle-portrait.webp',
      },
      cta: {
        title: 'Réservez votre prochaine session',
        description:
          'Tennis, pickleball, fitness, piscine ou kids club : réservez en ligne en moins d’une minute.',
        button: 'Réserver un terrain',
      },
      values: [
        { title: 'Sport', text: 'Tennis, pickleball et salle premium pour bouger toute l’année.' },
        { title: 'Bien-être', text: 'Piscine, cuisine healthy et cadre tropical pour se ressourcer.' },
        { title: 'Convivialité', text: 'Un social club pour la famille, les amis et la communauté de Lamai.' },
      ],
    },
    en: {
      hero: {
        eyebrow: 'Lamai · Koh Samui · Thailand',
        title: 'The premium social club resort of South Samui',
        description:
          'Sport, wellness and good company in one place. Tennis, the island’s home of pickleball, a premium gym, a healthy restaurant, a kids club and a pool.',
        video: '/videos/hero-pool.mp4',
        image: '/photos/pool-panorama-portrait.webp',
      },
      story: {
        eyebrow: 'Our story',
        title: 'A place to live, not just a club',
        paragraph1:
          'Shi Shi Samui was born from a simple idea: to create, in the south of Koh Samui, a place to move, unwind and connect.',
        paragraph2:
          'More than a gym or a court, it’s a true tropical social club: train in the morning and have lunch by the water.',
        image: '/photos/pool-grand-angle-portrait.webp',
      },
      cta: {
        title: 'Book your next session',
        description: 'Tennis, pickleball, fitness, pool or kids club: book online in under a minute.',
        button: 'Book a court',
      },
      values: [
        { title: 'Sport', text: 'Tennis, pickleball and a premium gym to move all year round.' },
        { title: 'Wellness', text: 'Pool, healthy food and a tropical setting to recharge.' },
        { title: 'Social', text: 'A social club for family, friends and the Lamai community.' },
      ],
    },
  },
}

const aboutPage: EditablePage = {
  id: 'about',
  label: 'À propos',
  group: 'Site',
  previewPath: '/a-propos',
  sections: [
    {
      title: 'Bandeau d’accueil',
      fields: [
        { key: 'hero.eyebrow', label: 'Petite accroche', type: 'text' },
        { key: 'hero.title', label: 'Titre', type: 'text' },
        { key: 'hero.description', label: 'Description', type: 'textarea' },
        { key: 'hero.image', label: 'Photo de fond', type: 'image', hint: HINT_IMAGE_PAIR },
      ],
    },
    {
      title: 'Notre histoire',
      fields: [
        { key: 'story.title', label: 'Titre', type: 'text' },
        { key: 'story.paragraph1', label: 'Paragraphe 1', type: 'textarea' },
        { key: 'story.paragraph2', label: 'Paragraphe 2', type: 'textarea' },
      ],
    },
    {
      title: 'Le complexe',
      fields: [
        { key: 'complex.title', label: 'Titre', type: 'text' },
        { key: 'complex.description', label: 'Description', type: 'textarea' },
      ],
    },
    {
      title: 'Nos trois piliers',
      fields: [
        { key: 'values.0.title', label: 'Pilier 1 — titre', type: 'text' },
        { key: 'values.0.description', label: 'Pilier 1 — texte', type: 'textarea' },
        { key: 'values.1.title', label: 'Pilier 2 — titre', type: 'text' },
        { key: 'values.1.description', label: 'Pilier 2 — texte', type: 'textarea' },
        { key: 'values.2.title', label: 'Pilier 3 — titre', type: 'text' },
        { key: 'values.2.description', label: 'Pilier 3 — texte', type: 'textarea' },
      ],
    },
    {
      title: 'Galerie photos',
      description: 'Quatre photos en bas de page. Laissez un emplacement vide pour le masquer.',
      fields: [
        { key: 'gallery.0', label: 'Photo 1', type: 'image' },
        { key: 'gallery.1', label: 'Photo 2', type: 'image' },
        { key: 'gallery.2', label: 'Photo 3', type: 'image' },
        { key: 'gallery.3', label: 'Photo 4', type: 'image' },
      ],
    },
  ],
  defaults: {
    fr: {
      hero: {
        eyebrow: 'À propos',
        title: 'Un social club au cœur de Lamai',
        description: 'Sport, bien-être et convivialité réunis au sud de Koh Samui.',
        image: '/photos/pool-panorama-portrait.webp',
      },
      gallery: [
        '/photos/pool-transats-portrait.webp',
        '/photos/equipe-kids-portrait.webp',
        '/photos/fitness-portrait.webp',
        '/photos/kids-aire-jeu-portrait.webp',
      ],
    },
    en: {
      hero: {
        eyebrow: 'About',
        title: 'A social club in the heart of Lamai',
        description: 'Sport, wellness and good company in the south of Koh Samui.',
        image: '/photos/pool-panorama-portrait.webp',
      },
      gallery: [
        '/photos/pool-transats-portrait.webp',
        '/photos/equipe-kids-portrait.webp',
        '/photos/fitness-portrait.webp',
        '/photos/kids-aire-jeu-portrait.webp',
      ],
    },
  },
}

const contactPage: EditablePage = {
  id: 'contact',
  label: 'Contact',
  group: 'Site',
  previewPath: '/contact-location',
  sections: [
    {
      title: 'Bandeau d’accueil',
      fields: [
        { key: 'hero.eyebrow', label: 'Petite accroche', type: 'text' },
        { key: 'hero.title', label: 'Titre', type: 'text' },
        { key: 'hero.description', label: 'Description', type: 'textarea' },
        { key: 'hero.image', label: 'Photo de fond', type: 'image', hint: HINT_IMAGE_PAIR },
      ],
    },
    {
      title: 'Coordonnées',
      description: 'Affichées sur la page et utilisées par les boutons Appeler et E-mail.',
      fields: [
        { key: 'info.phone', label: 'Téléphone', type: 'text' },
        { key: 'info.email', label: 'E-mail', type: 'text' },
        { key: 'info.street', label: 'Adresse', type: 'text' },
        { key: 'info.postalCode', label: 'Code postal', type: 'text' },
        { key: 'info.city', label: 'Ville', type: 'text' },
      ],
    },
  ],
  defaults: {
    fr: {
      hero: {
        eyebrow: 'Contact',
        title: 'Une question ? Écrivez-nous',
        description:
          'Remplissez le formulaire ou contactez-nous par WhatsApp. Pour réserver, passez par la page Réservation.',
        image: '/photos/pool-sala-portrait.webp',
      },
      info: {
        phone: '+33 6 51 69 27 02',
        email: 'contact@shi-shi-samui.com',
        street: 'Lamai',
        postalCode: '84310',
        city: 'Koh Samui',
      },
    },
    en: {
      hero: {
        eyebrow: 'Contact',
        title: 'A question? Get in touch',
        description: 'Fill in the form or reach us on WhatsApp. To book an activity, use the Booking page.',
        image: '/photos/pool-sala-portrait.webp',
      },
      info: {
        phone: '+33 6 51 69 27 02',
        email: 'contact@shi-shi-samui.com',
        street: 'Lamai',
        postalCode: '84310',
        city: 'Koh Samui',
      },
    },
  },
}

const servicesPage: EditablePage = {
  id: 'services',
  label: 'Nos activités (page liste)',
  group: 'Site',
  previewPath: '/services',
  sections: [
    {
      title: 'Bandeau d’accueil',
      fields: [
        { key: 'hero.eyebrow', label: 'Petite accroche', type: 'text' },
        { key: 'hero.title', label: 'Titre', type: 'text' },
        { key: 'hero.description', label: 'Description', type: 'textarea' },
        { key: 'hero.image', label: 'Photo de fond', type: 'image', hint: HINT_IMAGE_PAIR },
      ],
    },
  ],
  defaults: {
    fr: {
      hero: {
        eyebrow: 'Nos activités',
        title: 'Tout pour une journée active à Lamai',
        description: 'Sport, bien-être et convivialité au même endroit, à deux pas les uns des autres.',
        image: '/photos/fitness-portrait.webp',
      },
    },
    en: {
      hero: {
        eyebrow: 'Our activities',
        title: 'Everything for an active day in Lamai',
        description: 'Sport, wellness and good company in one place, steps from each other.',
        image: '/photos/fitness-portrait.webp',
      },
    },
  },
}

const pricesPage: EditablePage = {
  id: 'prices',
  label: 'Tarifs',
  group: 'Site',
  previewPath: '/prices',
  sections: [
    {
      title: 'Bandeau d’accueil',
      fields: [
        { key: 'hero.eyebrow', label: 'Petite accroche', type: 'text' },
        { key: 'hero.title', label: 'Titre', type: 'text' },
        { key: 'hero.description', label: 'Description', type: 'textarea' },
        { key: 'hero.image', label: 'Photo de fond', type: 'image', hint: HINT_IMAGE_PAIR },
      ],
    },
    {
      title: 'Note affichée sous les tarifs',
      fields: [{ key: 'note', label: 'Mention', type: 'textarea' }],
    },
  ],
  defaults: {
    fr: {
      hero: {
        eyebrow: 'Tarifs',
        title: 'Nos tarifs',
        description: 'Des formules simples, à l’heure, à la journée ou au mois.',
        image: '/photos/tennis-court-portrait.webp',
      },
      note: 'Tarifs en bahts thaïlandais (฿), susceptibles d’évoluer. Contactez-nous pour les groupes.',
    },
    en: {
      hero: {
        eyebrow: 'Prices',
        title: 'Our prices',
        description: 'Simple rates, by the hour, the day or the month.',
        image: '/photos/tennis-court-portrait.webp',
      },
      note: 'Prices in Thai baht (฿) and subject to change. Contact us for group rates.',
    },
  },
}

// ── Pages activités, générées depuis la configuration existante ────────────

/** Construit la page modifiable d'une activité à partir de sa fiche du code. */
function activityPage(svc: Activity): EditablePage {
  const faqFields: EditableField[] = svc.faq.flatMap((_, i) => [
    { key: `faq.${i}.q`, label: `Question ${i + 1}`, type: 'text' as const },
    { key: `faq.${i}.a`, label: `Réponse ${i + 1}`, type: 'textarea' as const },
  ])

  const galleryFields: EditableField[] = svc.gallery.map((_, i) => ({
    key: `gallery.${i}`,
    label: `Photo ${i + 1}`,
    type: 'image' as const,
  }))

  const highlightFields: EditableField[] = svc.highlights.fr.map((_, i) => ({
    key: `highlights.${i}`,
    label: `Point fort ${i + 1}`,
    type: 'text' as const,
  }))

  const buildDefaults = (l: Locale) => ({
    h1: svc.h1[l],
    tagline: svc.tagline[l],
    description: svc.description[l],
    metaTitle: svc.metaTitle[l],
    metaDescription: svc.metaDescription[l],
    image: svc.image,
    gallery: [...svc.gallery],
    highlights: [...svc.highlights[l]],
    faq: svc.faq.map((f) => ({ q: f.q[l], a: f.a[l] })),
  })

  return {
    id: `service-${svc.slug}`,
    label: svc.name.fr,
    group: 'Activités',
    previewPath: svc.path,
    sections: [
      {
        title: 'Présentation',
        description: 'Le titre et le texte en haut de la page.',
        fields: [
          { key: 'h1', label: 'Titre de la page', type: 'text' },
          { key: 'tagline', label: 'Accroche', type: 'text' },
          { key: 'description', label: 'Texte de présentation', type: 'textarea' },
          { key: 'image', label: 'Photo principale', type: 'image' },
        ],
      },
      { title: 'Points forts', fields: highlightFields },
      { title: 'Galerie photos', fields: galleryFields },
      { title: 'Questions fréquentes', fields: faqFields },
      {
        title: 'Référencement Google',
        description: 'Le titre et le texte affichés dans les résultats de recherche.',
        fields: [
          { key: 'metaTitle', label: 'Titre Google', type: 'text', hint: '50 à 60 caractères.' },
          { key: 'metaDescription', label: 'Description Google', type: 'textarea', hint: '140 à 160 caractères.' },
        ],
      },
    ],
    defaults: { fr: buildDefaults('fr'), en: buildDefaults('en') },
  }
}

/** Toutes les pages modifiables, dans l'ordre d'affichage de la barre latérale. */
export const editablePages: EditablePage[] = [
  homePage,
  aboutPage,
  servicesPage,
  pricesPage,
  contactPage,
  ...serviceConfigs.map(activityPage),
]

export function getEditablePage(id: string): EditablePage | undefined {
  return editablePages.find((p) => p.id === id)
}

/** Tarifs et horaires affichés en lecture seule, à titre de repère. */
export function priceSummary(slug: string): string | null {
  const tiers = PRICE_TIERS[slug]
  if (!tiers?.length) return null
  const prices = tiers.map((t) => `${t.label.fr} : ${t.amount} ฿`).join(' · ')
  const hours = OPENING_HOURS[slug]?.fr
  return hours ? `${prices} — ouvert ${hours}` : prices
}
