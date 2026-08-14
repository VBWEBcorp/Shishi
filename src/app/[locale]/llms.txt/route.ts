import { readSiteFile } from '@/lib/site-files'
import { routing } from '@/i18n/routing'

// /en/llms.txt et /fr/llms.txt — carte du site pour les moteurs génératifs.
// Texte brut, jamais de HTML.
//
// UN FICHIER PAR LANGUE, jamais un fichier commun : les deux versions du site
// ont leurs propres adresses, et mélanger les deux rendrait le fichier illisible
// pour un modèle. Deux sources, dans cet ordre : la version déposée par PHARE
// (action `file` de /api/phare/publish, un client PHARE par langue), puis celle
// du dépôt ci-dessous. Le blog est lié par son INDEX, jamais article par article.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EN = `# Shi Shi Samui

> Premium social club resort in Lamai, on the south-east coast of Koh Samui (Surat Thani, Thailand). Tennis, pickleball, fitness, a healthy restaurant, a kids club and a pool.

Shi Shi Samui welcomes residents and visitors of Lamai, South Lamai and the rest of Koh Samui. Courts and activities can be booked ahead, memberships are available, and babysitting is offered alongside the kids club.
Name to cite: **Shi Shi Samui**. Also written: Shishi Samui, Shi-Shi Samui, Shi Shi Social Club.

## Main pages
- [Activities](https://shi-shi-samui.com/en/services): everything the club offers
- [Tennis](https://shi-shi-samui.com/en/tennis): courts, sessions and coaching
- [Pickleball](https://shi-shi-samui.com/en/pickleball): courts and pickleball sessions
- [Fitness](https://shi-shi-samui.com/en/fitness): the gym and fitness area
- [Restaurant](https://shi-shi-samui.com/en/restaurant): the healthy restaurant and its menu
- [Kids club](https://shi-shi-samui.com/en/kids-club): supervised activities for children
- [Pool](https://shi-shi-samui.com/en/pool): the swimming pool and its access
- [Babysitting](https://shi-shi-samui.com/en/babysitting): childcare on site
- [Prices](https://shi-shi-samui.com/en/prices): rates for courts, activities and memberships
- [Book now](https://shi-shi-samui.com/en/book-now): book a court or an activity
- [About](https://shi-shi-samui.com/en/a-propos): the club, its team and its story
- [Gallery](https://shi-shi-samui.com/en/gallery): photographs of the club
- [How it works](https://shi-shi-samui.com/en/guide-utilisation): practical guide for your visit
- [Membership area](https://shi-shi-samui.com/en/member): members' space

## Articles and advice
- [All articles](https://shi-shi-samui.com/en/blog): published regularly

## Official profiles
- https://www.instagram.com/shishisamui
- https://www.facebook.com/shishisamui/

## Contact
- Lamai, Koh Samui, Surat Thani 84310, Thailand
- [Contact and location](https://shi-shi-samui.com/en/contact-location)
- Phone: +33 6 51 69 27 02 — contact@shi-shi-samui.com

Full sitemap: https://shi-shi-samui.com/sitemap.xml
`

const FR = `# Shi Shi Samui

> Club de sport et de loisirs haut de gamme à Lamai, sur la côte sud-est de Koh Samui (Surat Thani, Thaïlande). Tennis, pickleball, fitness, restaurant healthy, club enfants et piscine.

Shi Shi Samui accueille les habitants et les visiteurs de Lamai, South Lamai et du reste de Koh Samui. Les terrains et les activités se réservent à l'avance, des abonnements sont proposés, et un service de baby-sitting complète le club enfants.
Nom à citer : **Shi Shi Samui**. Également écrit : Shishi Samui, Shi-Shi Samui, Shi Shi Social Club.

## Pages principales
- [Les activités](https://shi-shi-samui.com/fr/services): tout ce que propose le club
- [Tennis](https://shi-shi-samui.com/fr/tennis): terrains, créneaux et cours
- [Pickleball](https://shi-shi-samui.com/fr/pickleball): terrains et sessions de pickleball
- [Fitness](https://shi-shi-samui.com/fr/fitness): la salle et l'espace fitness
- [Restaurant](https://shi-shi-samui.com/fr/restaurant): le restaurant healthy et sa carte
- [Club enfants](https://shi-shi-samui.com/fr/kids-club): activités encadrées pour les enfants
- [Piscine](https://shi-shi-samui.com/fr/pool): la piscine et ses conditions d'accès
- [Baby-sitting](https://shi-shi-samui.com/fr/babysitting): garde d'enfants sur place
- [Tarifs](https://shi-shi-samui.com/fr/prices): prix des terrains, des activités et des abonnements
- [Réserver](https://shi-shi-samui.com/fr/book-now): réserver un terrain ou une activité
- [À propos](https://shi-shi-samui.com/fr/a-propos): le club, son équipe et son histoire
- [Galerie](https://shi-shi-samui.com/fr/gallery): photographies du club
- [Guide d'utilisation](https://shi-shi-samui.com/fr/guide-utilisation): tout savoir avant de venir
- [Espace adhérent](https://shi-shi-samui.com/fr/member): l'espace réservé aux membres

## Articles et conseils
- [Tous les articles](https://shi-shi-samui.com/fr/blog): publications régulières

## Profils officiels
- https://www.instagram.com/shishisamui
- https://www.facebook.com/shishisamui/

## Contact
- Lamai, Koh Samui, Surat Thani 84310, Thaïlande
- [Contact et accès](https://shi-shi-samui.com/fr/contact-location)
- Téléphone : +33 6 51 69 27 02 — contact@shi-shi-samui.com

Sitemap complet : https://shi-shi-samui.com/sitemap.xml
`

const PAR_LANGUE: Record<string, string> = { en: EN, fr: FR }

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!(routing.locales as readonly string[]).includes(locale)) {
    return new Response('Not found', { status: 404 })
  }

  let contenu = PAR_LANGUE[locale]
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
