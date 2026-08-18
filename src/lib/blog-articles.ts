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

// ─────────────────────────────────────────────────────────────────────────────
//  Article 2 — EN, mot-clé : « where to play pickleball in koh samui »
// ─────────────────────────────────────────────────────────────────────────────
const EN_CONTENT_PICKLEBALL = `
<p>Wondering <strong>where to play pickleball in Koh Samui</strong>? The short answer is Lamai, on the island's south-east coast. Pickleball is the fastest-growing sport in the world, and Koh Samui has caught the bug — this local guide explains exactly where to play, what to expect on court, how much it costs and how to book your first game, whether you are a curious beginner or a paddle-carrying regular.</p>

<nav class="toc" aria-label="Table of contents">
  <strong>In this guide</strong>
  <ul>
    <li><a href="#why-samui">Why Koh Samui is a rising pickleball destination</a></li>
    <li><a href="#where">Where to play pickleball in Koh Samui</a></li>
    <li><a href="#courts">The courts, open play and rentals</a></li>
    <li><a href="#beginners">New to the game? Start here</a></li>
    <li><a href="#book">How to book a court</a></li>
    <li><a href="#day">Make a day of it</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
</nav>

<h2 id="why-samui">Why Koh Samui is a rising pickleball destination</h2>
<p>Pickleball blends tennis, badminton and table tennis into a game that takes five minutes to learn and years to master. It is low-impact, intensely social and perfectly suited to the tropical climate, because rallies are short and shaded courts keep play comfortable through the heat of the day. With a large community of expats, digital nomads and returning holidaymakers, Koh Samui has become fertile ground for the sport — and demand for proper, dedicated courts has grown fast. If you are brand new to the rules, <a href="https://usapickleball.org/what-is-pickleball/" target="_blank" rel="noopener">USA Pickleball</a> has a clear beginner overview to get you started.</p>

<h2 id="where">Where to play pickleball in Koh Samui</h2>
<p>If you are deciding where to play pickleball in Koh Samui, head to Lamai. At <a href="/en/pickleball-club-lamai">Shi Shi Samui's pickleball club</a> you'll find courts built specifically for the sport — not lined-over tennis courts — inside a sports and social club just a few minutes from Lamai Beach. It sits alongside <a href="/en/tennis-court-lamai">tennis courts</a>, a pool, a gym and a healthy restaurant, so a pickleball session slots neatly into a full day out rather than being a trip on its own.</p>
<p><img src="/photos/pickleball.jpg" alt="Dedicated pickleball courts in Lamai — where to play pickleball in Koh Samui" loading="lazy" /></p>

<h2 id="courts">The courts, open play and rentals</h2>
<p>Dedicated courts make a real difference. Correct dimensions, the right net height and a good playing surface mean better, safer and more enjoyable rallies. Open play sessions are the heart of any pickleball club: you turn up, rotate through games and meet players of every level, from first-timers to competitive paddlers. Paddles and balls are available to rent, so you can try the sport before spending anything on gear, and social tournaments and friendly mixers keep the calendar lively for regulars.</p>

<h2 id="beginners">New to the game? Start here</h2>
<p>Pickleball is famously beginner-friendly. The court is small, the underarm serve is easy to learn, and the "kitchen" (the no-volley zone near the net) keeps points fun rather than ferocious. Join a beginner-friendly open play or a short introduction session and you will be rallying within minutes. If you already play tennis or badminton you will feel at home immediately — many players try it once and never look back.</p>

<h2 id="book">How to book a pickleball court in Koh Samui</h2>
<p>Reserving a spot is simple. Check the latest <a href="/en/prices">prices</a>, then <a href="/en/book-now">book your session online</a> or message the club directly on WhatsApp for the quickest confirmation. If you have questions about levels, equipment or group bookings, the <a href="/en/contact-location">contact page</a> has everything you need, including the location map and opening hours.</p>

<h2 id="day">Make a day of it</h2>
<p>One of the best things about playing here is everything that surrounds the court. Cool off in the <a href="/en/swimming-pool-lamai">swimming pool</a>, refuel at the <a href="/en/healthy-restaurant-lamai">healthy restaurant</a>, or bring the whole family — there is a <a href="/en/kids-club-lamai">kids club</a> so the little ones are looked after while you play. It turns a quick game into a proper half-day on the island.</p>

<h2 id="faq">FAQ — where to play pickleball in Koh Samui</h2>
<p><strong>Where can I play pickleball in Koh Samui?</strong> On dedicated courts at Shi Shi Samui in Lamai, south-east Koh Samui, suitable for beginners and experienced players alike.</p>
<p><strong>Do I need my own paddle?</strong> No. Paddle and ball rental is available, so you can simply turn up and play.</p>
<p><strong>Is pickleball good for beginners?</strong> Yes — it is one of the easiest racket sports to pick up. An open play or intro session gets you rallying in minutes.</p>
`

const EN_FAQ_PICKLEBALL: Faq[] = [
  {
    q: 'Where can I play pickleball in Koh Samui?',
    a: 'On dedicated pickleball courts at Shi Shi Samui in Lamai, south-east Koh Samui. The club welcomes beginners and experienced players alike.',
  },
  {
    q: 'Do I need my own paddle to play?',
    a: 'No. Paddle and ball rental is available at the club, so you can simply turn up and play before deciding whether to buy your own gear.',
  },
  {
    q: 'Is pickleball suitable for beginners?',
    a: 'Yes. Pickleball is one of the easiest racket sports to pick up — a beginner-friendly open play or introduction session gets you rallying within minutes.',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  Article 2 — FR, mot-clé : « où jouer au pickleball à Koh Samui »
// ─────────────────────────────────────────────────────────────────────────────
const FR_CONTENT_PICKLEBALL = `
<p>Vous vous demandez <strong>où jouer au pickleball à Koh Samui</strong> ? Réponse courte : à Lamai, sur la côte sud-est de l'île. Le pickleball est le sport qui connaît la plus forte croissance au monde, et Koh Samui n'y échappe pas — ce guide local vous explique précisément où jouer, à quoi vous attendre sur le terrain, combien ça coûte et comment réserver votre première partie, que vous soyez débutant curieux ou joueur régulier raquette à la main.</p>

<nav class="toc" aria-label="Sommaire">
  <strong>Dans ce guide</strong>
  <ul>
    <li><a href="#why-samui">Pourquoi Koh Samui devient une destination pickleball</a></li>
    <li><a href="#where">Où jouer au pickleball à Koh Samui</a></li>
    <li><a href="#courts">Les terrains, le jeu libre et la location</a></li>
    <li><a href="#beginners">Débutant ? Commencez ici</a></li>
    <li><a href="#book">Comment réserver un terrain</a></li>
    <li><a href="#day">Faites-en une vraie sortie</a></li>
    <li><a href="#faq">FAQ</a></li>
  </ul>
</nav>

<h2 id="why-samui">Pourquoi Koh Samui devient une destination pickleball</h2>
<p>Le pickleball mélange tennis, badminton et tennis de table dans un jeu qui s'apprend en cinq minutes et se perfectionne pendant des années. Peu traumatisant pour les articulations, très convivial et parfaitement adapté au climat tropical : les échanges sont courts et les terrains ombragés gardent le jeu agréable même aux heures chaudes. Avec sa large communauté d'expatriés, de nomades digitaux et de vacanciers fidèles, Koh Samui est devenue un terreau idéal pour ce sport, et la demande de vrais terrains dédiés a explosé. Si vous débutez, <a href="https://usapickleball.org/what-is-pickleball/" target="_blank" rel="noopener">USA Pickleball</a> propose une présentation claire des règles pour bien commencer.</p>

<h2 id="where">Où jouer au pickleball à Koh Samui</h2>
<p>Si vous hésitez sur où jouer au pickleball à Koh Samui, direction Lamai. Au <a href="/fr/pickleball-club-lamai">club de pickleball de Shi Shi Samui</a>, vous trouverez des terrains conçus spécifiquement pour ce sport — et non de simples courts de tennis retracés — au sein d'un club sportif et social à quelques minutes de la plage de Lamai. Il jouxte des <a href="/fr/tennis-court-lamai">courts de tennis</a>, une piscine, une salle de sport et un restaurant healthy : une session de pickleball s'intègre parfaitement à une journée complète plutôt que d'être une sortie à part.</p>
<p><img src="/photos/pickleball.jpg" alt="Terrains de pickleball dédiés à Lamai — où jouer au pickleball à Koh Samui" loading="lazy" /></p>

<h2 id="courts">Les terrains, le jeu libre et la location</h2>
<p>Des terrains dédiés changent tout : bonnes dimensions, hauteur de filet correcte et surface de qualité, pour des échanges meilleurs, plus sûrs et plus agréables. Les sessions de jeu libre sont le cœur d'un club de pickleball — vous arrivez, vous enchaînez les parties et vous rencontrez des joueurs de tous niveaux, du tout débutant au compétiteur. Raquettes et balles sont disponibles à la location : testez le sport avant d'investir dans le matériel. Tournois conviviaux et rencontres amicales animent le calendrier des habitués.</p>

<h2 id="beginners">Débutant ? Commencez ici</h2>
<p>Le pickleball est réputé accessible. Le terrain est petit, le service à la cuillère s'apprend vite, et la « cuisine » (la zone de non-volée près du filet) rend les points ludiques plutôt que féroces. Rejoignez un jeu libre ouvert aux débutants ou une courte initiation, et vous échangerez en quelques minutes. Si vous pratiquez déjà le tennis ou le badminton, vous serez tout de suite à l'aise — beaucoup essaient une fois et ne s'arrêtent plus.</p>

<h2 id="book">Comment réserver un terrain de pickleball à Koh Samui</h2>
<p>Réserver est simple. Consultez les <a href="/fr/prices">tarifs</a>, puis <a href="/fr/book-now">réservez votre session en ligne</a> ou écrivez directement au club sur WhatsApp pour une confirmation immédiate. Pour toute question sur les niveaux, le matériel ou les réservations de groupe, la <a href="/fr/contact-location">page contact</a> regroupe tout : carte de localisation et horaires inclus.</p>

<h2 id="day">Faites-en une vraie sortie</h2>
<p>L'un des grands atouts ici, c'est tout ce qui entoure le terrain. Rafraîchissez-vous dans la <a href="/fr/swimming-pool-lamai">piscine</a>, rechargez les batteries au <a href="/fr/healthy-restaurant-lamai">restaurant healthy</a>, ou venez en famille : un <a href="/fr/kids-club-lamai">kids club</a> s'occupe des enfants pendant que vous jouez. De quoi transformer une simple partie en une vraie demi-journée sur l'île.</p>

<h2 id="faq">FAQ — où jouer au pickleball à Koh Samui</h2>
<p><strong>Où peut-on jouer au pickleball à Koh Samui ?</strong> Sur des terrains dédiés chez Shi Shi Samui à Lamai, au sud-est de Koh Samui, adaptés aux débutants comme aux joueurs confirmés.</p>
<p><strong>Faut-il sa propre raquette ?</strong> Non. La location de raquette et de balles est disponible : vous pouvez simplement venir jouer.</p>
<p><strong>Le pickleball est-il adapté aux débutants ?</strong> Oui — c'est l'un des sports de raquette les plus faciles à prendre en main. Un jeu libre ou une initiation suffit pour échanger en quelques minutes.</p>
`

const FR_FAQ_PICKLEBALL: Faq[] = [
  {
    q: 'Où peut-on jouer au pickleball à Koh Samui ?',
    a: 'Sur des terrains de pickleball dédiés chez Shi Shi Samui à Lamai, au sud-est de Koh Samui. Le club accueille aussi bien les débutants que les joueurs confirmés.',
  },
  {
    q: 'Faut-il avoir sa propre raquette pour jouer ?',
    a: 'Non. La location de raquette et de balles est disponible au club : vous pouvez simplement venir jouer avant de décider d’acheter votre propre matériel.',
  },
  {
    q: 'Le pickleball est-il adapté aux débutants ?',
    a: 'Oui. C’est l’un des sports de raquette les plus faciles à prendre en main — un jeu libre ouvert aux débutants ou une initiation suffit pour échanger en quelques minutes.',
  },
]

const ARTICLES: BuiltinArticle[] = [
  {
    id: 'where-to-play-pickleball-koh-samui',
    author: 'Shi Shi Samui',
    publishedAt: '2026-06-23T08:00:00.000Z',
    updatedAt: '2026-06-23T08:00:00.000Z',
    coverImage: '/photos/pickleball.jpg',
    slug: {
      en: 'where-to-play-pickleball-koh-samui',
      fr: 'ou-jouer-pickleball-koh-samui',
    },
    title: {
      en: 'Where to Play Pickleball in Koh Samui: The 2026 Guide',
      fr: 'Où jouer au pickleball à Koh Samui : le guide 2026',
    },
    metaTitle: {
      en: 'Where to Play Pickleball in Koh Samui (2026 Guide)',
      fr: 'Où jouer au pickleball à Koh Samui : guide 2026',
    },
    metaDescription: {
      en: 'Wondering where to play pickleball in Koh Samui? Dedicated courts in Lamai, open play, paddle rental and easy booking — your 2026 guide to the island.',
      fr: 'Où jouer au pickleball à Koh Samui ? Terrains dédiés à Lamai, jeu libre, location de raquette et réservation simple : votre guide 2026 sur l’île.',
    },
    excerpt: {
      en: 'Where to play pickleball in Koh Samui — dedicated courts in Lamai, open play sessions, beginner tips, paddle rental and how to book your first game.',
      fr: 'Où jouer au pickleball à Koh Samui : terrains dédiés à Lamai, jeu libre, conseils débutants, location de raquette et comment réserver votre première partie.',
    },
    focusKeyword: {
      en: 'where to play pickleball in koh samui',
      fr: 'où jouer au pickleball à Koh Samui',
    },
    coverAlt: {
      en: 'Dedicated pickleball courts in Lamai — where to play pickleball in Koh Samui',
      fr: 'Terrains de pickleball dédiés à Lamai — où jouer au pickleball à Koh Samui',
    },
    category: {
      en: 'Sports guide',
      fr: 'Guide sport',
    },
    tags: {
      en: ['Pickleball', 'Koh Samui', 'Lamai', 'where to play pickleball in koh samui'],
      fr: ['Pickleball', 'Koh Samui', 'Lamai', 'où jouer au pickleball à Koh Samui'],
    },
    content: { en: EN_CONTENT_PICKLEBALL, fr: FR_CONTENT_PICKLEBALL },
    faq: { en: EN_FAQ_PICKLEBALL, fr: FR_FAQ_PICKLEBALL },
  },
  {
    id: 'things-to-do-lamai',
    author: 'Shi Shi Samui',
    publishedAt: '2026-06-01T08:00:00.000Z',
    updatedAt: '2026-06-10T08:00:00.000Z',
    coverImage: '/photos/pool-panorama-portrait.webp',
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

/** Paires de slugs (en/fr) des articles intégrés — pour le sitemap (hreflang). */
export function builtinArticleSlugPairs(): Record<BlogLocale, string>[] {
  return ARTICLES.map((a) => ({ en: a.slug.en, fr: a.slug.fr }))
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
