import type { Locale } from '@/i18n/routing'

/**
 * FAQ de l'accueil : données brutes, partagées par l'affichage et par les données
 * structurées.
 *
 * Elle vivait dans <FaqSection>, un composant client : la page ne pouvait donc pas la
 * déclarer en JSON-LD. Résultat, les huit réponses étaient visibles à l'écran mais
 * invisibles pour Google et pour les moteurs d'IA. Le rapport SEO d'août 2026 (§7)
 * ouvre justement le chantier GEO par « des réponses directes, des FAQ et des
 * informations précises sur les services, la localisation et les activités ».
 *
 * Une seule source, donc : ce que le visiteur lit est exactement ce qui est déclaré.
 * Aucune réponse n'avance un fait que le site n'affiche pas déjà ailleurs.
 */

export type Bilingue = { en: string; fr: string }
export type FaqItem = { q: Bilingue; a: Bilingue }

export const HOME_FAQ: FaqItem[] = [
  {
    q: { en: 'How do I book an activity?', fr: 'Comment réserver une activité ?' },
    a: {
      // Réponse alignée sur ce que le site fait AUJOURD'HUI : la réservation en ligne est
      // désactivée (cf. ONLINE_BOOKING_ENABLED et BOOKING_COMING_SOON dans src/lib/launch.ts),
      // les demandes passent par WhatsApp et par le formulaire. Cette réponse part maintenant
      // aussi en données structurées : promettre une confirmation instantanée que le club ne
      // peut pas encore tenir se retournerait contre lui, dans Google comme au comptoir.
      // À REVOIR le jour où la réservation en ligne rouvre.
      en: 'Pick an activity, a date and a time slot, then send your request. The club confirms by email or WhatsApp. You can also book straight away on WhatsApp.',
      fr: 'Choisissez une activité, une date et un créneau, puis envoyez votre demande. Le club confirme par e-mail ou par WhatsApp. Vous pouvez aussi réserver directement sur WhatsApp.',
    },
  },
  {
    q: { en: 'Do I need to be a member?', fr: 'Faut-il être adhérent ?' },
    a: {
      en: 'No. Shi Shi is open to everyone: book a single session or a day pass without any membership. Memberships simply offer better rates for regulars.',
      fr: 'Non. Shi Shi est ouvert à tous : réservez une session ou un pass journée sans abonnement. Les abonnements offrent simplement de meilleurs tarifs aux habitués.',
    },
  },
  {
    q: {
      en: 'What can you do at Shi Shi Samui?',
      fr: 'Que peut-on faire à Shi Shi Samui ?',
    },
    a: {
      en: 'Seven things, on one site in Lamai: tennis, pickleball, a fitness gym, a swimming pool, a kids club, babysitting and a healthy restaurant. Each has its own page with details and prices.',
      fr: 'Sept choses, au même endroit à Lamai : tennis, pickleball, salle de fitness, piscine, club enfants, baby-sitting et restaurant healthy. Chacune a sa page, avec le détail et les tarifs.',
    },
  },
  {
    q: { en: 'Are there day passes?', fr: 'Proposez-vous des pass journée ?' },
    a: {
      en: 'Yes. A pool day pass and fitness day passes are available, as well as weekly and monthly options for the gym.',
      fr: 'Oui. Un pass journée piscine et des pass journée fitness sont disponibles, ainsi que des formules à la semaine et au mois pour la salle.',
    },
  },
  {
    q: { en: 'How does the kids club work?', fr: 'Comment fonctionne le kids club ?' },
    a: {
      en: 'A safe, supervised space with activities for children, plus babysitting on request, so the whole family can enjoy the club.',
      fr: 'Un espace sûr et encadré avec des activités pour les enfants, et du babysitting sur demande, pour que toute la famille profite du club.',
    },
  },
  {
    q: { en: 'What is pickleball?', fr: 'Qu’est-ce que le pickleball ?' },
    a: {
      en: 'A fast, fun racket sport that mixes tennis, badminton and ping-pong. Beginner-friendly and very social, on dedicated courts in Lamai.',
      fr: 'Un sport de raquette rapide et fun mêlant tennis, badminton et ping-pong. Accessible et très convivial, sur des terrains dédiés à Lamai.',
    },
  },
  {
    q: {
      en: 'Is the restaurant open to everyone?',
      fr: 'Le restaurant est-il ouvert à tous ?',
    },
    a: {
      en: 'Yes. The healthy restaurant and pool bar welcome members and visitors alike, all day long. No booking needed to come and eat.',
      fr: 'Oui. Le restaurant healthy et le pool bar accueillent adhérents et visiteurs, toute la journée. Aucune réservation nécessaire pour venir manger.',
    },
  },
  {
    q: { en: 'Where are you located?', fr: 'Où êtes-vous situés ?' },
    a: {
      en: 'In Lamai, in the south of Koh Samui, Surat Thani, Thailand. A short drive from the main beaches, and easy to reach for expats and visitors.',
      fr: 'À Lamai, au sud de Koh Samui, dans la province de Surat Thani, en Thaïlande. À quelques minutes des plages principales, et facile d’accès pour les expatriés et les visiteurs.',
    },
  },
  {
    q: { en: 'Can I rent equipment?', fr: 'Peut-on louer du matériel ?' },
    a: {
      en: 'Yes. Rackets and essential gear are available to rent on site for tennis and pickleball, so you can simply turn up and play.',
      fr: 'Oui. Raquettes et équipement essentiel sont disponibles à la location sur place pour le tennis et le pickleball : venez les mains dans les poches.',
    },
  },
  {
    q: {
      en: 'Do you offer babysitting?',
      fr: 'Proposez-vous du baby-sitting ?',
    },
    a: {
      en: 'Yes, on request and alongside the kids club, so parents can play, train or eat while the children stay supervised on site.',
      fr: 'Oui, sur demande et en complément du club enfants : les parents jouent, s’entraînent ou déjeunent pendant que les enfants restent encadrés sur place.',
    },
  },
  {
    q: {
      en: 'How can I contact the club?',
      fr: 'Comment contacter le club ?',
    },
    a: {
      en: 'By WhatsApp for the fastest answer, by email at contact@shi-shi-samui.com, or through the contact form on the Contact & location page.',
      fr: 'Par WhatsApp pour la réponse la plus rapide, par e-mail à contact@shi-shi-samui.com, ou via le formulaire de la page Contact et accès.',
    },
  },
]

/** Les questions/réponses de l'accueil, dans la langue affichée (pour le JSON-LD FAQPage). */
export function homeFaqEntries(locale: Locale | string) {
  const l: 'en' | 'fr' = locale === 'fr' ? 'fr' : 'en'
  return HOME_FAQ.map((item) => ({ question: item.q[l], answer: item.a[l] }))
}
