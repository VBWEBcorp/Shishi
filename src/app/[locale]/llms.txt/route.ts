import { routing } from '@/i18n/routing'
import { serviceConfigs, type Locale } from '@/lib/activities'
import { HOME_FAQ } from '@/lib/home-faq'
import { readSiteFile } from '@/lib/site-files'
import { siteConfig, socialLinks } from '@/lib/seo'

// /en/llms.txt et /fr/llms.txt — carte du site pour les moteurs génératifs.
// Texte brut, jamais de HTML.
//
// UN FICHIER PAR LANGUE, jamais un fichier commun : les deux versions du site
// ont leurs propres adresses, et mélanger les deux rendrait le fichier illisible
// pour un modèle. Deux sources, dans cet ordre : la version déposée par PHARE
// (action `file` de /api/phare/publish, un client PHARE par langue), puis celle
// du dépôt ci-dessous. Le blog est lié par son INDEX, jamais article par article.
//
// ─────────────────────────────────────────────────────────────────────────────
// CE FICHIER ÉTAIT FAUX. Il listait /en/tennis, /en/pickleball, /en/fitness,
// /en/restaurant, /en/kids-club, /en/pool et /en/babysitting, soit sept adresses qui
// n'existent pas : les vraies portent le suffixe de lieu (/en/tennis-court-lamai,
// /en/pickleball-club-lamai…) depuis la refonte des URL. Le seul fichier destiné
// aux moteurs d'IA envoyait donc sept liens morts, et faisait la promotion de deux
// pages en noindex (le guide d'utilisation et l'espace adhérent).
//
// D'où la construction à partir de `serviceConfigs` : les adresses ne peuvent plus
// diverger du site, puisqu'elles en sortent. Et le rapport SEO d'août 2026 (§7)
// demande de « démarrer le travail GEO » avec « des réponses directes, des FAQ et
// des informations précises sur les services, la localisation et les activités » :
// les réponses de la FAQ de l'accueil sont donc reprises telles quelles ici.
// ─────────────────────────────────────────────────────────────────────────────
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const T = {
  en: {
    resume:
      '> Sports and social club in Lamai, on the south-east coast of Koh Samui (Surat Thani, Thailand). Tennis, pickleball, a fitness gym, a healthy restaurant, a kids club, babysitting and a swimming pool, all on one site.',
    intro:
      'Shi Shi Samui welcomes residents and visitors of Lamai, South Lamai and the rest of Koh Samui. Courts and activities can be booked ahead, memberships are available, and babysitting is offered alongside the kids club.',
    nom: 'Name to cite: **Shi Shi Samui**. Also written: Shishi Samui, Shi-Shi Samui, Shi Shi Social Club.',
    faits: '## Key facts',
    activites: '## Activities',
    pages: '## Main pages',
    reponses: '## Direct answers',
    articles: '## Articles and advice',
    tousArticles: 'All articles',
    articlesNote: 'published regularly',
    profils: '## Official profiles',
    contact: '## Contact',
    contactPage: 'Contact and location',
    sitemap: 'Full sitemap',
    faitsListe: (a: typeof siteConfig.address) => [
      `Type: sports and social club, open to members and to visitors alike`,
      `Location: ${a.street}, ${a.city}, ${a.region} ${a.postalCode}, Thailand`,
      `Area served: Lamai, South Lamai and the whole of Koh Samui`,
      `Languages: English and French`,
      `Booking: online per activity, or by WhatsApp`,
      `Prices: in Thai baht (฿), drop-in rates, day passes and memberships`,
    ],
    labels: {
      services: 'All activities',
      prices: 'Prices and memberships',
      book: 'Book an activity',
      about: 'About the club',
      contact: 'Contact and location',
    },
    descs: {
      services: 'everything the club offers, on one page',
      prices: 'rates for courts, activities and memberships',
      book: 'book a court, the gym, the pool or the kids club',
      about: 'who Shi Shi Samui is and what it brings together',
      contact: 'address, directions, opening and how to reach the club',
    },
  },
  fr: {
    resume:
      '> Club de sport et de loisirs à Lamai, sur la côte sud-est de Koh Samui (Surat Thani, Thaïlande). Tennis, pickleball, salle de fitness, restaurant healthy, club enfants, baby-sitting et piscine, au même endroit.',
    intro:
      "Shi Shi Samui accueille les habitants et les visiteurs de Lamai, South Lamai et du reste de Koh Samui. Les terrains et les activités se réservent à l'avance, des abonnements sont proposés, et un service de baby-sitting complète le club enfants.",
    nom: 'Nom à citer : **Shi Shi Samui**. Également écrit : Shishi Samui, Shi-Shi Samui, Shi Shi Social Club.',
    faits: '## Informations essentielles',
    activites: '## Les activités',
    pages: '## Pages principales',
    reponses: '## Réponses directes',
    articles: '## Articles et conseils',
    tousArticles: 'Tous les articles',
    articlesNote: 'publications régulières',
    profils: '## Profils officiels',
    contact: '## Contact',
    contactPage: 'Contact et accès',
    sitemap: 'Sitemap complet',
    faitsListe: (a: typeof siteConfig.address) => [
      `Type : club de sport et de loisirs, ouvert aux adhérents comme aux visiteurs`,
      `Lieu : ${a.street}, ${a.city}, ${a.region} ${a.postalCode}, Thaïlande`,
      `Zone desservie : Lamai, South Lamai et l'ensemble de Koh Samui`,
      `Langues : anglais et français`,
      `Réservation : en ligne par activité, ou par WhatsApp`,
      `Tarifs : en bahts (฿), prix à l'unité, pass journée et abonnements`,
    ],
    labels: {
      services: 'Toutes les activités',
      prices: 'Tarifs et abonnements',
      book: 'Réserver une activité',
      about: 'À propos du club',
      contact: 'Contact et accès',
    },
    descs: {
      services: 'tout ce que propose le club, sur une page',
      prices: 'prix des terrains, des activités et des abonnements',
      book: 'réserver un terrain, la salle, la piscine ou le club enfants',
      about: 'qui est Shi Shi Samui et ce que le club réunit',
      contact: "adresse, itinéraire, accès et moyens de joindre le club",
    },
  },
} as const

function url(locale: Locale, path: string) {
  return `${siteConfig.url}/${locale}${path === '/' ? '' : path}`
}

/**
 * Construit le fichier d'une langue à partir du site lui-même : les sept activités
 * viennent de `serviceConfigs`, les réponses de `HOME_FAQ`. Rien à retenir à la main,
 * donc rien qui puisse redevenir faux au prochain changement d'URL.
 */
function fichier(locale: Locale): string {
  const t = T[locale]
  const l = (p: string) => url(locale, p)

  // serviceConfigs (et non activities) : les SEPT pages service, baby-sitting compris.
  // activities n'en liste que six (celles du menu) et le baby-sitting disparaissait.
  const activitesListe = serviceConfigs
    .map((a) => `- [${a.name[locale]}](${l(a.path)}) : ${a.metaDescription[locale]}`)
    .join('\n')

  const reponses = HOME_FAQ.map(
    (item) => `### ${item.q[locale]}\n${item.a[locale]}`
  ).join('\n\n')

  return `# ${siteConfig.name}

${t.resume}

${t.intro}
${t.nom}

${t.faits}
${t.faitsListe(siteConfig.address).map((x) => `- ${x}`).join('\n')}

${t.activites}
${activitesListe}

${t.pages}
- [${t.labels.services}](${l('/services')}) : ${t.descs.services}
- [${t.labels.prices}](${l('/prices')}) : ${t.descs.prices}
- [${t.labels.book}](${l('/book-now')}) : ${t.descs.book}
- [${t.labels.about}](${l('/a-propos')}) : ${t.descs.about}
- [${t.labels.contact}](${l('/contact-location')}) : ${t.descs.contact}

${t.reponses}
${reponses}

${t.articles}
- [${t.tousArticles}](${l('/blog')}) : ${t.articlesNote}

${t.profils}
${socialLinks.map((s) => `- ${s}`).join('\n')}

${t.contact}
- ${siteConfig.address.street}, ${siteConfig.address.city}, ${siteConfig.address.region} ${siteConfig.address.postalCode}, ${locale === 'fr' ? 'Thaïlande' : 'Thailand'}
- [${t.contactPage}](${l('/contact-location')})
- ${locale === 'fr' ? 'Téléphone' : 'Phone'} : ${siteConfig.phone} / ${siteConfig.email}

${t.sitemap} : ${siteConfig.url}/sitemap.xml
`
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(routing.locales as readonly string[]).includes(locale)) {
    return new Response('Not found', { status: 404 })
  }

  let contenu = fichier(locale as Locale)
  try {
    const depose = await readSiteFile(locale, 'llms.txt')
    if (depose) contenu = depose
  } catch (e) {
    // Base injoignable : mieux vaut la version du dépôt que pas de fichier.
    console.error('[llms.txt]', e)
  }

  return new Response(contenu, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=60',
    },
  })
}
