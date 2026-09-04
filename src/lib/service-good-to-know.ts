import type { Locale } from '@/lib/activities'

/**
 * « Bon à savoir » : les quelques lignes qui répondent aux questions que le club
 * reçoit tous les jours.
 *
 * Demande de septembre 2026, et c'est la plus insistante de toute la réunion.
 * Le club veut pouvoir répondre à un message Facebook, Instagram ou WhatsApp
 * par UN lien, qui contienne à la fois l'information et la réservation, au lieu
 * de retaper les mêmes phrases. Mot pour mot : « les informations, c'est juste
 * les serviettes, raquettes et balles sont incluses dans le tarif, et les
 * lumières sont parfaites pour le soir. Il y a juste ces informations là, et
 * c'est tout. »
 *
 * D'où le format : quatre lignes maximum par activité, la plus décisive en
 * premier. Ce n'est pas une plaquette, c'est une réponse.
 *
 * Le tennis est le seul dont le contenu vient mot pour mot du client. Les autres
 * sont écrits à partir de ce que le site affirme déjà ailleurs (descriptions,
 * tarifs, FAQ) : rien n'y est inventé, mais le club doit les relire et les
 * compléter, en particulier le kids club (nombre d'encadrantes, horaires) et
 * la piscine.
 */

export type BonASavoir = { en: string; fr: string }

const CONTENU: Record<string, BonASavoir[]> = {
  tennis: [
    {
      fr: 'Raquettes, balles et serviettes incluses dans le tarif.',
      en: 'Rackets, balls and towels included in the price.',
    },
    {
      fr: 'Aucune location à payer en plus : le prix affiché est le prix payé.',
      en: 'No rental to pay on top: the price you see is the price you pay.',
    },
    {
      fr: 'Terrain éclairé : on joue aussi en soirée.',
      en: 'Floodlit court: you can play in the evening too.',
    },
    {
      fr: 'Un seul terrain, donc pensez à réserver votre créneau.',
      en: 'One court only, so it is worth booking your slot ahead.',
    },
  ],

  pickleball: [
    {
      fr: 'Raquettes et balles fournies sur place.',
      en: 'Paddles and balls provided on site.',
    },
    {
      fr: 'Débutants bienvenus : venez les mains dans les poches.',
      en: 'Beginners welcome: just turn up and play.',
    },
    {
      fr: 'Les terrains ouvrent prochainement. Écrivez-nous sur WhatsApp pour être prévenu.',
      en: 'The courts open soon. Message us on WhatsApp and we will let you know.',
    },
  ],

  fitness: [
    {
      fr: 'Salle climatisée, ouverte sur le jardin.',
      en: 'Air-conditioned gym, opening onto the garden.',
    },
    {
      fr: 'Cardio, musculation et espace libre pour vos séances.',
      en: 'Cardio, weights and open floor space for your session.',
    },
    {
      fr: 'Accès à la journée, à la semaine ou au mois.',
      en: 'Day, weekly and monthly access.',
    },
  ],

  'kids-club': [
    {
      fr: 'De 0 à 5 ans, encadrés sur place.',
      en: 'From 0 to 5 years old, supervised on site.',
    },
    {
      fr: 'À l’heure ou à la journée, comme vous préférez.',
      en: 'By the hour or the full day, whichever suits you.',
    },
    {
      fr: 'Repas compris pour la formule à la journée.',
      en: 'Meals included with the full-day option.',
    },
    {
      fr: 'Aire de jeu extérieure et espace couvert climatisé.',
      en: 'Outdoor play area and an air-conditioned indoor space.',
    },
  ],

  pool: [
    {
      fr: 'Accès à la journée, transats et parasols compris.',
      en: 'Day access, sun loungers and parasols included.',
    },
    {
      fr: 'Cours de natation pour les enfants et les adultes.',
      en: 'Swimming lessons for children and adults.',
    },
    {
      fr: 'Le pool bar et le restaurant sont juste à côté.',
      en: 'The pool bar and restaurant are right there.',
    },
  ],

  restaurant: [
    {
      fr: 'Ouvert à tous, adhérents comme visiteurs.',
      en: 'Open to everyone, members and visitors alike.',
    },
    {
      fr: 'Aucune réservation nécessaire pour venir manger.',
      en: 'No booking needed to come and eat.',
    },
    {
      fr: 'Cuisine healthy servie toute la journée, au bord de la piscine.',
      en: 'Healthy food served all day long, by the pool.',
    },
    {
      fr: 'Boissons et repas sur place : rien à apporter.',
      en: 'Food and drinks on site: nothing to bring along.',
    },
  ],

  babysitting: [
    {
      fr: 'Sur demande, en complément du club enfants.',
      en: 'On request, alongside the kids club.',
    },
    {
      fr: 'Vos enfants restent encadrés sur place pendant que vous jouez.',
      en: 'Your children stay supervised on site while you play.',
    },
    {
      fr: 'À convenir avec le club : écrivez-nous sur WhatsApp.',
      en: 'To arrange with the club: message us on WhatsApp.',
    },
  ],
}

/** Les lignes « Bon à savoir » d'une activité, dans la langue affichée. */
export function bonASavoir(slug: string, locale: Locale): string[] {
  return (CONTENU[slug] ?? []).map((x) => x[locale])
}

/** Toutes les activités qui ont un « Bon à savoir » (pour la page Infos pratiques). */
export function toutesLesInfos(locale: Locale): Record<string, string[]> {
  const sortie: Record<string, string[]> = {}
  for (const [slug, lignes] of Object.entries(CONTENU)) {
    sortie[slug] = lignes.map((x) => x[locale])
  }
  return sortie
}

/**
 * Lien complémentaire proposé sous le « Bon à savoir » d'une activité.
 *
 * Le club le demande pour le tennis : « si vous voulez du coaching, vous pouvez
 * contacter notre coach, ça emmène à la page du coach ». Louer le terrain et
 * prendre un cours sont deux demandes différentes, et celui qui lit la page
 * tennis doit pouvoir passer de l'une à l'autre.
 */
export type LienComplementaire = { href: string; label: string; texte: string }

const LIENS: Record<string, { href: string; label: BonASavoir; texte: BonASavoir }> = {
  tennis: {
    href: '/tennis-coaching-lamai',
    label: {
      fr: 'Voir les cours de tennis',
      en: 'See tennis lessons',
    },
    texte: {
      fr: 'Vous cherchez à progresser plutôt qu’à louer le terrain ?',
      en: 'Looking to improve rather than just book the court?',
    },
  },
}

export function lienComplementaire(slug: string, locale: Locale): LienComplementaire | null {
  const l = LIENS[slug]
  if (!l) return null
  return { href: l.href, label: l.label[locale], texte: l.texte[locale] }
}
