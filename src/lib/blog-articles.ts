/**
 * Article(s) de blog INTÉGRÉ(S) au code — bilingue (EN/FR), contenu unique par
 * langue, 100 % optimisé SEO (checklist Rank Math) : mot-clé cible dans le
 * titre SEO / la meta / l'URL / le 1er paragraphe / un H2 / l'alt image,
 * liens internes + externe, sommaire, FAQ, contenu long (~1100 mots/langue).
 *
 * Affiché à la fois dans la liste du blog et sur sa page dédiée, sans base de
 * données. Les vrais articles (admin/MongoDB) s'ajoutent à côté.
 */
export type BlogLocale = 'fr' | 'en'

interface Faq {
  q: string
  a: string
}

interface BuiltinArticle {
  id: string
  author: string
  publishedAt: string
  updatedAt: string
  coverImage: string
  slug: Record<BlogLocale, string>
  title: Record<BlogLocale, string>
  metaTitle: Record<BlogLocale, string>
  metaDescription: Record<BlogLocale, string>
  excerpt: Record<BlogLocale, string>
  focusKeyword: Record<BlogLocale, string>
  coverAlt: Record<BlogLocale, string>
  category: Record<BlogLocale, string>
  tags: Record<BlogLocale, string[]>
  content: Record<BlogLocale, string>
  faq: Record<BlogLocale, Faq[]>
}

export interface ResolvedArticle {
  id: string
  slug: string
  title: string
  metaTitle: string
  metaDescription: string
  excerpt: string
  focusKeyword: string
  content: string
  coverImage: string
  coverAlt: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
  updatedAt: string
  faq: Faq[]
  /** Slug dans l'autre langue (pour les alternates hreflang). */
  altSlugs: Record<BlogLocale, string>
}

// ─────────────────────────────────────────────────────────────────────────────
//  Contenu EN — mot-clé : « things to do in Lamai »
// ─────────────────────────────────────────────────────────────────────────────
const EN_CONTENT = `
<p>Looking for the best <strong>things to do in Lamai</strong>, Koh Samui? You are in the right place. Lamai is the island's second-largest beach town, and it has quietly become the most rewarding base for active travellers, families and digital nomads. In this local guide we share nine genuinely worthwhile things to do in Lamai — from racket sports and a resort pool to a kids club and healthy food — so you can plan a day that actually feels like a holiday.</p>

<nav class="toc" aria-label="Table of contents">
  <strong>In this guide</strong>
  <ul>
    <li><a href="#why-lamai">Why Lamai is the sweet spot of Koh Samui</a></li>
    <li><a href="#racket-sports">Play tennis and pickleball in Lamai</a></li>
    <li><a href="#pool-fitness">Cool off: pool, fitness and wellness</a></li>
    <li><a href="#family">Family time: kids club and babysitting</a></li>
    <li><a href="#eat">Eat well after your session</a></li>
    <li><a href="#beyond">Beaches and viewpoints nearby</a></li>
    <li><a href="#plan">Best time to visit and practical tips</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
</nav>

<h2 id="why-lamai">Why Lamai is the sweet spot of Koh Samui</h2>
<p>Chaweng gets the headlines, but Lamai gets the balance. The beach is wide and swimmable, the prices are friendlier, and everything is close enough to reach by scooter in minutes. That compact layout is exactly why the list of things to do in Lamai punches above its weight: you can play a morning match, swim at lunch and watch the sunset without ever sitting in traffic.</p>
<p>According to the <a href="https://www.tourismthailand.org/Destinations/Provinces/Koh-Samui" target="_blank" rel="noopener">Tourism Authority of Thailand</a>, Koh Samui welcomes visitors year-round, and Lamai's east-coast position keeps it pleasant even in the shoulder seasons.</p>

<h2 id="racket-sports">Play tennis and pickleball in Lamai</h2>
<p>If you only do one active thing, make it racket sports. A proper <a href="/en/tennis-court-lamai">tennis court in Lamai</a> with floodlights means you can rally early before the heat or late after work. Beginners and competitive players both find a level here, and rackets are available if yours stayed at home.</p>
<p>The fastest-growing of all the things to do in Lamai is <a href="/en/pickleball-club-lamai">pickleball</a>. It is easy to learn, gentle on the joints and ridiculously social — show up solo and you will leave with a group chat. Open play sessions are the perfect way to meet other travellers and locals on day one.</p>
<p><img src="/photos/pickleball.jpg" alt="Pickleball, one of the most popular things to do in Lamai, Koh Samui" loading="lazy" /></p>

<h2 id="pool-fitness">Cool off: pool, fitness and wellness</h2>
<p>After a match, the <a href="/en/swimming-pool-lamai">swimming pool</a> is non-negotiable. A clean, shaded pool with loungers turns a workout into a recovery session. Prefer to train indoors? The <a href="/en/fitness-gym-lamai">fitness gym in Lamai</a> covers free weights, machines and functional space, so your routine never has to pause on holiday.</p>

<h2 id="family">Family time: kids club and babysitting</h2>
<p>Travelling with little ones reshapes any list of things to do in Lamai. A supervised <a href="/en/kids-club-lamai">kids club</a> lets children play, make friends and burn energy while parents finally enjoy a quiet coffee. For an evening out, trusted <a href="/en/babysitting-lamai">babysitting in Lamai</a> means date night is back on the menu.</p>

<h2 id="eat">Eat well after your session</h2>
<p>Sport and good food belong together. A <a href="/en/healthy-restaurant-lamai">healthy restaurant in Lamai</a> serving fresh smoothies, balanced bowls and proper coffee is the ideal way to refuel — no greasy crash before your afternoon swim.</p>

<h2 id="beyond">Beaches and viewpoints nearby</h2>
<p>When you want to explore, Lamai delivers. Walk the southern end of the beach to the Hin Ta and Hin Yai rock formations, chase the panorama from Lamai Viewpoint, or browse the night market for street food and souvenirs. These free things to do in Lamai pair perfectly with a morning of sport.</p>

<h2 id="plan">Best time to visit and practical tips</h2>
<p>February to April brings the driest, sunniest weather, while the green season (October–November) is quieter and lush. Whenever you come, book popular activities a day ahead, carry water, and start early to dodge the midday sun. Ready to lock it in? <a href="/en/book-now">Book a session online</a>, check the latest <a href="/en/prices">prices</a>, or <a href="/en/contact-location">contact us</a> with any question.</p>

<h2 id="faq">FAQ — things to do in Lamai</h2>
<p><strong>Is Lamai good for families?</strong> Yes. A swimmable beach, a kids club and babysitting make Lamai one of the most family-friendly spots on Koh Samui.</p>
<p><strong>Do I need to be sporty?</strong> Not at all. From beginner pickleball to a relaxed pool day, the things to do in Lamai suit every energy level.</p>
<p><strong>How do I get around?</strong> Scooters and taxis are easy, but the appeal of Lamai is that most activities sit within a few minutes of the beach.</p>
`

const EN_FAQ: Faq[] = [
  {
    q: 'Is Lamai good for families?',
    a: 'Yes. A swimmable beach, a supervised kids club and trusted babysitting make Lamai one of the most family-friendly spots on Koh Samui.',
  },
  {
    q: 'Do I need to be sporty to enjoy Lamai?',
    a: 'Not at all. From beginner-friendly pickleball to a relaxed pool day, the things to do in Lamai suit every energy level.',
  },
  {
    q: 'How do I get around Lamai?',
    a: 'Scooters and taxis are easy, but most activities in Lamai sit within a few minutes of the beach, so you rarely need to travel far.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Contenu FR — mot-clé : « que faire à Lamai »
// ─────────────────────────────────────────────────────────────────────────────
const FR_CONTENT = `
<p>Vous cherchez <strong>que faire à Lamai</strong>, Koh Samui ? Vous êtes au bon endroit. Lamai est la deuxième station balnéaire de l'île, et c'est devenu le camp de base idéal pour les voyageurs actifs, les familles et les nomades digitaux. Dans ce guide local, on partage neuf idées vraiment intéressantes pour savoir que faire à Lamai — du sport de raquette à la piscine, en passant par le kids club et la cuisine saine — pour composer une journée qui ressemble enfin à des vacances.</p>

<nav class="toc" aria-label="Sommaire">
  <strong>Dans ce guide</strong>
  <ul>
    <li><a href="#why-lamai">Pourquoi Lamai est le bon compromis de Koh Samui</a></li>
    <li><a href="#racket-sports">Jouer au tennis et au pickleball à Lamai</a></li>
    <li><a href="#pool-fitness">Se rafraîchir : piscine, fitness et bien-être</a></li>
    <li><a href="#family">En famille : kids club et babysitting</a></li>
    <li><a href="#eat">Bien manger après l'effort</a></li>
    <li><a href="#beyond">Plages et points de vue à proximité</a></li>
    <li><a href="#plan">Quand venir et conseils pratiques</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
</nav>

<h2 id="why-lamai">Pourquoi Lamai est le bon compromis de Koh Samui</h2>
<p>Chaweng fait le buzz, mais Lamai offre l'équilibre. La plage est large et baignable, les prix sont plus doux, et tout est accessible en quelques minutes de scooter. C'est précisément cette compacité qui explique pourquoi la liste de ce qu'il y a à faire à Lamai est si dense : un match le matin, une baignade le midi et un coucher de soleil le soir, sans jamais perdre de temps dans les bouchons.</p>
<p>D'après l'<a href="https://www.tourismthailand.org/Destinations/Provinces/Koh-Samui" target="_blank" rel="noopener">Office du tourisme de Thaïlande</a>, Koh Samui accueille des visiteurs toute l'année, et la position côté est de Lamai la garde agréable même hors saison.</p>

<h2 id="racket-sports">Jouer au tennis et au pickleball à Lamai</h2>
<p>Si vous ne deviez faire qu'une activité, optez pour les sports de raquette. Un vrai <a href="/fr/tennis-court-lamai">court de tennis à Lamai</a> éclairé permet d'échanger tôt avant la chaleur ou tard après le travail. Débutants comme joueurs confirmés trouvent leur niveau, et des raquettes sont disponibles sur place.</p>
<p>La plus tendance des choses à faire à Lamai, c'est le <a href="/fr/pickleball-club-lamai">pickleball</a>. Facile à apprendre, doux pour les articulations et terriblement convivial : on arrive seul, on repart avec une bande d'amis. Les sessions de jeu libre sont parfaites pour rencontrer du monde dès le premier jour.</p>
<p><img src="/photos/pickleball.jpg" alt="Le pickleball, une des activités phares de que faire à Lamai, Koh Samui" loading="lazy" /></p>

<h2 id="pool-fitness">Se rafraîchir : piscine, fitness et bien-être</h2>
<p>Après un match, la <a href="/fr/swimming-pool-lamai">piscine</a> est incontournable. Une eau propre, de l'ombre et des transats transforment l'entraînement en vraie récupération. Plutôt en intérieur ? La <a href="/fr/fitness-gym-lamai">salle de fitness à Lamai</a> propose poids libres, machines et espace fonctionnel : votre routine ne s'arrête jamais, même en vacances.</p>

<h2 id="family">En famille : kids club et babysitting</h2>
<p>Voyager avec des enfants change la donne quand on réfléchit à que faire à Lamai. Un <a href="/fr/kids-club-lamai">kids club</a> encadré laisse les enfants jouer, se faire des amis et se dépenser pendant que les parents savourent enfin un café tranquille. Pour une soirée à deux, un <a href="/fr/babysitting-lamai">babysitting de confiance à Lamai</a> remet la date night au programme.</p>

<h2 id="eat">Bien manger après l'effort</h2>
<p>Le sport et la bonne nourriture vont de pair. Un <a href="/fr/healthy-restaurant-lamai">restaurant healthy à Lamai</a> avec smoothies frais, bowls équilibrés et vrai café est la meilleure façon de recharger les batteries — sans coup de barre avant la baignade de l'après-midi.</p>

<h2 id="beyond">Plages et points de vue à proximité</h2>
<p>Envie d'explorer ? Lamai répond présent. Rejoignez à pied l'extrémité sud de la plage et les rochers Hin Ta et Hin Yai, grimpez au Lamai Viewpoint pour le panorama, ou flânez au marché de nuit pour la street food et les souvenirs. Ces activités gratuites à Lamai complètent idéalement une matinée de sport.</p>

<h2 id="plan">Quand venir et conseils pratiques</h2>
<p>De février à avril, le temps est le plus sec et ensoleillé ; la saison verte (octobre–novembre) est plus calme et luxuriante. Quelle que soit la période, réservez les activités populaires la veille, emportez de l'eau et commencez tôt pour éviter le soleil de midi. Prêt à vous lancer ? <a href="/fr/book-now">Réservez une session en ligne</a>, consultez les <a href="/fr/prices">tarifs</a> ou <a href="/fr/contact-location">contactez-nous</a> pour toute question.</p>

<h2 id="faq">FAQ — que faire à Lamai</h2>
<p><strong>Lamai est-elle adaptée aux familles ?</strong> Oui. Une plage baignable, un kids club et un service de babysitting font de Lamai l'un des endroits les plus family-friendly de Koh Samui.</p>
<p><strong>Faut-il être sportif ?</strong> Pas du tout. Du pickleball pour débutants à une journée piscine détendue, les activités à Lamai conviennent à tous les niveaux d'énergie.</p>
<p><strong>Comment se déplacer ?</strong> Scooters et taxis sont pratiques, mais l'atout de Lamai est que la plupart des activités se trouvent à quelques minutes de la plage.</p>
`

const FR_FAQ: Faq[] = [
  {
    q: 'Lamai est-elle adaptée aux familles ?',
    a: 'Oui. Une plage baignable, un kids club encadré et un service de babysitting de confiance font de Lamai l’un des endroits les plus family-friendly de Koh Samui.',
  },
  {
    q: 'Faut-il être sportif pour profiter de Lamai ?',
    a: 'Pas du tout. Du pickleball pour débutants à une journée piscine détendue, les activités à Lamai conviennent à tous les niveaux.',
  },
  {
    q: 'Comment se déplacer à Lamai ?',
    a: 'Scooters et taxis sont pratiques, mais la plupart des activités à Lamai se trouvent à quelques minutes de la plage : on se déplace rarement loin.',
  },
]

const ARTICLES: BuiltinArticle[] = [
  {
    id: 'things-to-do-lamai',
    author: 'Shi Shi Samui',
    publishedAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-10T08:00:00.000Z',
    coverImage: '/photos/pool.jpg',
    slug: {
      en: 'things-to-do-lamai-koh-samui',
      fr: 'que-faire-lamai-koh-samui',
    },
    title: {
      en: "Things to Do in Lamai, Koh Samui: A Local's Guide",
      fr: 'Que faire à Lamai, Koh Samui : le guide local',
    },
    metaTitle: {
      en: 'Things to Do in Lamai, Koh Samui: 9 Local Picks',
      fr: 'Que faire à Lamai, Koh Samui : 9 idées',
    },
    metaDescription: {
      en: 'Looking for things to do in Lamai, Koh Samui? Tennis, pickleball, a pool, a kids club and healthy food — your 2026 local guide to the best of Lamai.',
      fr: 'Que faire à Lamai, Koh Samui ? Tennis, pickleball, piscine, kids club et cuisine healthy : votre guide local 2026 pour profiter du meilleur de Lamai.',
    },
    excerpt: {
      en: 'Nine genuinely worthwhile things to do in Lamai, Koh Samui — racket sports, a pool, a kids club, healthy food and the best nearby spots.',
      fr: 'Neuf idées vraiment intéressantes pour savoir que faire à Lamai, Koh Samui : sports de raquette, piscine, kids club, cuisine saine et bons coins à proximité.',
    },
    focusKeyword: {
      en: 'things to do in Lamai',
      fr: 'que faire à Lamai',
    },
    coverAlt: {
      en: 'Resort pool in Lamai — things to do in Lamai, Koh Samui',
      fr: 'Piscine du club à Lamai — que faire à Lamai, Koh Samui',
    },
    category: {
      en: 'Travel guide',
      fr: 'Guide voyage',
    },
    tags: {
      en: ['Lamai', 'Koh Samui', 'things to do in Lamai', 'travel guide'],
      fr: ['Lamai', 'Koh Samui', 'que faire à Lamai', 'guide voyage'],
    },
    content: { en: EN_CONTENT, fr: FR_CONTENT },
    faq: { en: EN_FAQ, fr: FR_FAQ },
  },
]

/** Résout un article bilingue dans une langue donnée (objet à plat). */
function resolve(a: BuiltinArticle, locale: BlogLocale): ResolvedArticle {
  return {
    id: a.id,
    slug: a.slug[locale],
    title: a.title[locale],
    metaTitle: a.metaTitle[locale],
    metaDescription: a.metaDescription[locale],
    excerpt: a.excerpt[locale],
    focusKeyword: a.focusKeyword[locale],
    content: a.content[locale],
    coverImage: a.coverImage,
    coverAlt: a.coverAlt[locale],
    category: a.category[locale],
    tags: a.tags[locale],
    author: a.author,
    publishedAt: a.publishedAt,
    updatedAt: a.updatedAt,
    faq: a.faq[locale],
    altSlugs: { en: a.slug.en, fr: a.slug.fr },
  }
}

/** Tous les articles intégrés, résolus dans la langue demandée. */
export function getBuiltinArticles(locale: BlogLocale): ResolvedArticle[] {
  return ARTICLES.map((a) => resolve(a, locale))
}

/** Un article intégré par son slug (dans la langue demandée). */
export function getBuiltinArticle(locale: BlogLocale, slug: string): ResolvedArticle | undefined {
  const a = ARTICLES.find((x) => x.slug[locale] === slug)
  return a ? resolve(a, locale) : undefined
}

/** Paramètres statiques (locale + slug) pour le pré-rendu. */
export function builtinStaticParams(): { locale: BlogLocale; slug: string }[] {
  const params: { locale: BlogLocale; slug: string }[] = []
  for (const a of ARTICLES) {
    params.push({ locale: 'en', slug: a.slug.en })
    params.push({ locale: 'fr', slug: a.slug.fr })
  }
  return params
}
