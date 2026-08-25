/**
 * Contenu long des pages service — le texte que Google lit pour comprendre de quoi la page parle.
 *
 * POURQUOI CE FICHIER EXISTE
 * Les pages service tenaient en 162 à 252 mots (relevé sur le site en ligne). Ce sont pourtant
 * elles qui doivent capter « tennis koh samui », « salle de sport lamai », « cours de natation
 * koh samui ». Un balisage impeccable ne compense pas une page vide : il n'y a rien à indexer.
 * Et comme tous les futurs articles du blog pointeront ici, ces pages sont le socle — les
 * remplir d'abord, écrire ensuite.
 *
 * DEUX PUBLICS, JAMAIS CONFONDUS
 * Le club vit de deux clientèles opposées : le voyageur de passage (une heure de court, un accès
 * à la journée, aucune adhésion) et le résident ou l'expatrié installé sur l'île (créneau
 * hebdomadaire, abonnement au mois, habitude). Leurs questions n'ont rien de commun. Chaque page
 * leur consacre donc une section distincte, au lieu d'un texte tiède qui ne répond ni à l'un ni
 * à l'autre. Avant cette version, le mot « resident » n'apparaissait nulle part sur le site.
 *
 * DEUX LANGUES, DEUX TEXTES
 * Le français n'est pas la traduction de l'anglais : plan différent, angles différents, exemples
 * différents. Deux traductions littérales sur un même domaine se concurrencent au lieu de
 * s'additionner, et n'apportent rien à qui lit l'une des deux.
 *
 * RIEN N'EST INVENTÉ
 * Horaires, tarifs, âges, prestations : tout vient de `booking-pricing.ts` et des FAQ déjà
 * publiées. Aucun chiffre, aucun équipement, aucune promesse qui ne soit déjà sur le site.
 * Le pickleball n'est pas encore ouvert (`comingSoon`) : son texte ne promet aucune réservation.
 */

export interface ServiceBlock {
  /** Sous-titre de section (rendu en <h3>). */
  h3: string
  /** Paragraphe, 60 à 110 mots. */
  p: string
}

export interface ServiceBody {
  en: ServiceBlock[]
  fr: ServiceBlock[]
}

/**
 * Indexé par la clé INTERNE du service (`slug`), pas par l'URL : l'URL peut changer pour des
 * raisons de référencement, la clé interne non.
 */
export const SERVICE_BODY: Record<string, ServiceBody> = {
  // ─────────────────────────────────────────────────────────────────────────
  tennis: {
    fr: [
      {
        h3: 'Réserver un court à l’heure, sans adhésion',
        p: 'Le court se loue 600 THB l’heure, et c’est le terrain qui est facturé, pas les joueurs : un simple coûte le même prix qu’un double. Les créneaux vont de 7h à 22h tous les jours, ce qui laisse le choix entre une heure au frais le matin et une partie en soirée. La réservation se fait en ligne ou par WhatsApp, avec confirmation immédiate. Si vous voyagez sans matériel, une raquette se loue sur place.',
      },
      {
        h3: 'Cours de tennis : débuter, reprendre, progresser',
        p: 'Le club organise du coaching privé ou en petit groupe. Trois profils reviennent le plus souvent : celui qui n’a jamais tenu une raquette, celui qui reprend après des années d’arrêt, et le joueur régulier qui veut corriger un point précis — un service, un revers, un placement. La séance s’adapte à chacun. Beaucoup de joueurs de l’île combinent un cours dans la semaine et un match libre le week-end, ce qui reste le meilleur moyen de progresser vite.',
      },
      {
        h3: 'Vous vivez à Koh Samui',
        p: 'Pour un résident ou un expatrié de Lamai, Chaweng, Maenam ou Bophut, l’intérêt n’est pas la partie unique : c’est le créneau régulier. Le même horaire chaque semaine, les mêmes partenaires, un niveau qui monte parce qu’on joue vraiment. Le club prépare des formules d’inscription ; en attendant, le tarif unique de 600 THB l’heure s’applique à tout le monde, sans engagement ni carte à souscrire.',
      },
      {
        h3: 'Vous êtes de passage sur l’île',
        p: 'Aucune adhésion n’est demandée pour venir jouer. Une semaine à Lamai suffit largement : vous réservez la veille, vous venez avec vos chaussures, le reste est sur place. Le club est à quelques minutes de la plage de Lamai, et le restaurant au bord de la piscine permet d’enchaîner directement après le match, sans reprendre le scooter.',
      },
    ],
    en: [
      {
        h3: 'Court hire by the hour',
        p: 'A court costs 600 THB an hour. You are hiring the court itself, not paying per player, so singles and doubles come to exactly the same thing. Slots run from 7 AM to 10 PM every day — early enough to play before the heat, late enough for a game after work. Book through the site or send a WhatsApp message and we confirm the slot straight away. Rackets are available on site if you are travelling light.',
      },
      {
        h3: 'Coaching, whatever your starting point',
        p: 'Private and small-group coaching is arranged through the club. Complete beginners, players returning after a long break, and regulars working on one specific thing — a serve, a backhand, court positioning — are all catered for, because the session is built around the person rather than a fixed programme. A common pattern among islanders is one coached hour midweek and a friendly match at the weekend.',
      },
      {
        h3: 'If you live on Koh Samui',
        p: 'For residents and expats around Lamai, Chaweng, Maenam or Bophut, the point is not the one-off game. It is the standing slot: the same hour each week, the same group of partners, and a level that actually climbs because you play often enough for it to. Membership plans are being prepared. Until they open, the flat 600 THB hourly rate applies to everyone, with nothing to sign up for.',
      },
      {
        h3: 'If you are visiting Lamai',
        p: 'No membership is required to play. A week on the island is plenty: book the day before, bring your shoes, and everything else is here. The club sits a few minutes from Lamai beach, and the poolside restaurant means you can come straight off court and sit down to eat without getting back on the scooter.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  pickleball: {
    fr: [
      {
        h3: 'Le sport de raquette qui manque encore à l’île',
        p: 'Le pickleball se joue sur un terrain plus petit qu’un court de tennis, avec une raquette pleine et une balle ajourée. Les échanges démarrent tout de suite, la marche remplace la course, et un débutant tient un vrai point dès la première partie — c’est ce qui explique sa progression fulgurante partout dans le monde. À Koh Samui, l’offre reste rare : la plupart des joueurs cherchent encore un endroit où taper régulièrement.',
      },
      {
        h3: 'Des terrains dédiés, bientôt ouverts',
        p: 'Shi Shi Samui prépare des terrains de pickleball dédiés à Lamai — dédiés, c’est-à-dire tracés et équipés pour ce sport, pas un court de tennis qu’on adapte le temps d’une partie. L’activité n’est pas encore ouverte à la réservation. Le plus simple est de nous écrire sur WhatsApp pour être prévenu de l’ouverture et des premiers créneaux.',
      },
      {
        h3: 'Débuter sans jamais y avoir joué',
        p: 'Aucune expérience de la raquette n’est nécessaire. Des initiations sont prévues pour apprendre les règles en quelques minutes — le service, la zone de non-volée, le décompte des points — puis enchaîner directement sur un match. Raquettes et balles se louent sur place, ce qui évite d’acheter du matériel avant de savoir si le sport vous plaît.',
      },
      {
        h3: 'Une communauté à faire naître à Koh Samui',
        p: 'Le pickleball est d’abord un sport social : on tourne, on change de partenaire, on joue avec des niveaux différents sans que la partie perde son intérêt. C’est précisément ce que cherchent les résidents et les expatriés installés sur l’île, qui veulent une activité régulière et l’occasion de rencontrer du monde. Des tournois conviviaux sont prévus une fois les terrains ouverts.',
      },
    ],
    en: [
      {
        h3: 'The racket sport Koh Samui is still missing',
        p: 'Pickleball is played on a court smaller than a tennis court, with a solid paddle and a perforated ball. Rallies start immediately, walking replaces sprinting, and a first-timer wins real points in their opening game — which is why it has spread so fast worldwide. On Koh Samui the supply has not caught up: most players on the island are still looking for somewhere to play regularly.',
      },
      {
        h3: 'Dedicated courts, opening soon',
        p: 'Shi Shi Samui is preparing dedicated pickleball courts in Lamai. Dedicated means lined and equipped for the sport, not a tennis court borrowed for an hour. The activity is not open for booking yet. The simplest thing is to message us on WhatsApp so we can let you know when the courts open and when the first slots go live.',
      },
      {
        h3: 'Starting from zero',
        p: 'No racket background is needed. Introduction sessions are planned to cover the rules in a few minutes — the serve, the non-volley zone, how scoring works — and then move straight into a game, because that is how the sport is actually learned. Paddles and balls can be rented here, so there is no equipment to buy before you know whether you enjoy it.',
      },
      {
        h3: 'Building a community on the island',
        p: 'Pickleball is a social game before it is a competitive one: players rotate, partners change, and mixed levels still make for a good match. That is exactly what residents and expats on Koh Samui tend to be after — something regular in the diary and a way to meet people. Friendly tournaments are planned once the courts are open.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  fitness: {
    fr: [
      {
        h3: 'Une salle complète à Lamai, ouverte de 8h à 20h',
        p: 'L’espace fitness réunit une zone force, une zone cardio et un espace de functional training, dans un même lieu et sans attente aux machines. Les serviettes sont fournies. La salle est ouverte tous les jours de 8h à 20h, ce qui couvre aussi bien la séance avant la chaleur que celle de fin de journée. L’accès se prend à la séance, à la semaine ou au mois, selon la durée de votre présence sur l’île.',
      },
      {
        h3: 'Vous vivez sur l’île : l’abonnement au mois',
        p: 'Pour un résident ou un expatrié, la formule qui a du sens est le mois à 1 500 THB. À raison de trois séances par semaine, cela revient à environ 125 THB la séance, contre 250 THB à l’unité. C’est aussi ce qui change la nature de l’entraînement : on ne vient plus quand on y pense, on vient parce que c’est prévu. Aucun engagement de longue durée n’est demandé.',
      },
      {
        h3: 'Vous êtes de passage : la séance ou la semaine',
        p: 'Pour un court séjour, la séance à 250 THB permet de ne pas couper l’entraînement pendant les vacances. Pour une à trois semaines à Lamai, la formule semaine à 1 000 THB devient plus intéressante dès la cinquième séance. Rien à souscrire à l’avance : vous passez, vous prenez l’accès qui correspond à vos dates.',
      },
      {
        h3: 'S’entraîner pendant que les enfants sont gardés',
        p: 'C’est la différence la plus concrète avec une salle classique de Koh Samui : le kids club est sur place, ouvert de 8h à 16h, et accueille les enfants jusqu’à 5 ans. Un parent peut donc déposer son enfant, faire sa séance et le récupérer sans avoir traversé l’île entre les deux. La piscine et le restaurant sont dans le même lieu, de quoi prolonger la matinée plutôt que de repartir aussitôt.',
      },
    ],
    en: [
      {
        h3: 'A full gym in Lamai, open 8 AM to 8 PM',
        p: 'The fitness space brings together a strength zone, a cardio zone and a functional training area, in one room and without queueing for machines. Towels are provided. It is open daily from 8 AM to 8 PM, which covers both the session before the heat sets in and the one after work. Access is sold by the session, the week or the month depending on how long you are on the island.',
      },
      {
        h3: 'Living here: the monthly membership',
        p: 'For residents and expats, the month at 1,500 THB is the option that makes sense. At three sessions a week that works out around 125 THB a visit, against 250 THB paid one by one. It also changes the nature of the training: you stop coming when you happen to think of it and start coming because it is in the week. There is no long commitment attached.',
      },
      {
        h3: 'Visiting: a session or a week',
        p: 'On a short trip, the 250 THB session keeps your training going through the holiday instead of dropping it. For one to three weeks in Lamai, the 1,000 THB week pass overtakes it from the fifth visit onwards. Nothing needs arranging in advance — come by and take whichever access matches your dates.',
      },
      {
        h3: 'Training while the children are looked after',
        p: 'This is the practical difference with a standalone gym on Koh Samui: the kids club is on the same site, open 8 AM to 4 PM, and takes children up to five years old. A parent can drop their child off, train, and collect them without crossing the island in between. The pool and the restaurant are here too, so the morning can carry on rather than ending at the changing room door.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  pool: {
    fr: [
      {
        h3: 'Un accès à la journée, à 100 THB',
        p: 'La piscine est assez grande pour enchaîner de vraies longueurs, et assez calme pour y passer l’après-midi sans nager du tout. L’accès se prend à la journée pour 100 THB, transats et zones d’ombre compris, avec un service au bord de l’eau. Le restaurant est à quelques mètres : on sort de l’eau, on déjeune, on y retourne. C’est le point de rendez-vous du club, plus que son bassin sportif.',
      },
      {
        h3: 'Cours de natation pour les enfants',
        p: 'Une professeure de natation donne des cours dans le bassin, à Lamai. Pour un enfant, l’objectif est d’abord l’aisance : entrer dans l’eau sans appréhension, flotter, se déplacer seul sur quelques mètres, puis construire une nage. Sur une île où la mer est partout et où les piscines sont dans presque chaque location, savoir nager tôt n’est pas un loisir mais une sécurité. Les séances se conviennent directement avec nous.',
      },
      {
        h3: 'Cours de natation pour les adultes',
        p: 'Les cours ne sont pas réservés aux enfants. Deux demandes reviennent chez les adultes : celle de la personne qui n’a jamais appris et qui évite l’eau depuis toujours, et celle du nageur autonome qui veut corriger sa technique — respiration, position du corps, endurance. Les deux se travaillent dans le même bassin, à un rythme choisi, sans public et sans comparaison avec le couloir d’à côté.',
      },
      {
        h3: 'Une piscine où l’on vient en famille',
        p: 'L’ambiance est familiale plutôt que sportive : le kids club et le restaurant sont sur place, ce qui permet à des parents de rester plusieurs heures sans que la journée devienne compliquée. Les résidents de Lamai en font une habitude du week-end, les voyageurs une alternative à la plage les jours de vent — l’eau est calme, ombragée par endroits, et il n’y a ni sel ni méduses.',
      },
    ],
    en: [
      {
        h3: 'Day access for 100 THB',
        p: 'The pool is big enough to swim proper lengths and quiet enough to spend an afternoon beside without swimming at all. Day access is 100 THB, sun loungers and shaded areas included, with service at the water’s edge. The restaurant is a few steps away, so lunch does not mean leaving. In practice this is the club’s meeting point more than its lap pool.',
      },
      {
        h3: 'Swimming lessons for children',
        p: 'A swimming instructor teaches at the pool here in Lamai. With a child the first goal is confidence rather than technique: getting in without hesitating, floating, covering a few metres alone, and only then building a stroke. On an island ringed by sea, where most rentals have a pool of their own, learning early is a safety matter as much as a hobby. Sessions are arranged directly with us.',
      },
      {
        h3: 'Swimming lessons for adults',
        p: 'Lessons are not only for children. Two requests come up again and again from adults: the person who never learned and has quietly avoided water for decades, and the competent swimmer who wants to fix their technique — breathing, body position, staying comfortable over distance. Both are worked on in the same pool, at a chosen pace, without an audience and without the lane next door for comparison.',
      },
      {
        h3: 'A pool families actually stay at',
        p: 'The atmosphere is family-first rather than athletic: the kids club and the restaurant are on site, which is what lets parents stay several hours without the day turning into logistics. Lamai residents tend to make it a weekend habit; visitors use it as the alternative to the beach on windy days — calm water, shade where you want it, no salt and no jellyfish.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  restaurant: {
    fr: [
      {
        h3: 'Une carte healthy au bord de la piscine',
        p: 'La carte tourne autour de produits frais : smoothies, bowls et assiettes pensées pour un mode de vie actif, servies au bord du bassin plutôt qu’en salle. C’est le genre d’endroit où l’on déjeune après une séance sans annuler l’effort de la matinée, mais où l’on vient aussi simplement pour manger correctement à Lamai. Des options végétariennes et vegan figurent à la carte, préparées comme des plats à part entière.',
      },
      {
        h3: 'À emporter, préparé pendant que vous venez',
        p: 'La vente à emporter est faite pour ceux qui n’ont pas le temps de s’installer. Vous passez commande — le plus simple est WhatsApp — et vous récupérez smoothies, bowls ou assiettes sur place, sans file d’attente ni service à table. C’est la formule que choisissent le plus souvent les habitants du coin le midi en semaine, et les familles qui repartent vers la plage avec le déjeuner.',
      },
      {
        h3: 'Ouvert à tous, pas seulement aux membres',
        p: 'Il n’est pas nécessaire de jouer, de nager ou de s’entraîner pour venir manger : le restaurant est ouvert à tout le monde, y compris à qui pousse la porte uniquement pour déjeuner. C’est une précision qui a son importance, parce qu’un restaurant situé dans un club sportif est souvent supposé réservé à ses adhérents. Ici, la table est indépendante de l’activité.',
      },
      {
        h3: 'Le rendez-vous du midi des habitués',
        p: 'Pour les résidents et les expatriés de Lamai, l’intérêt tient à la régularité : une carte stable, des produits frais, et un endroit où l’on peut s’asseoir avec son ordinateur ou retrouver quelqu’un sans réserver. Pour les voyageurs, c’est une adresse à deux pas de la plage qui change des restaurants de front de mer, avec la piscine et l’ombre en plus.',
      },
    ],
    en: [
      {
        h3: 'A healthy menu, served poolside',
        p: 'The menu is built on fresh produce: smoothies, bowls and plates designed around an active day, served at the water’s edge rather than in a dining room. It suits eating after a session without undoing the morning, but it works just as well as somewhere to eat properly in Lamai on any ordinary day. Vegetarian and vegan choices are on the menu as dishes in their own right, not afterthoughts.',
      },
      {
        h3: 'Take away, ready when you arrive',
        p: 'The take away service exists for the days you have no time to sit down. Place the order — WhatsApp is the quickest way — and collect your smoothies, bowls or plates at the counter with no queue and no table service. It is what people living nearby tend to use on weekday lunchtimes, and what families pick up on their way back down to the beach.',
      },
      {
        h3: 'Open to everyone, not just members',
        p: 'You do not need to play, swim or train to eat here. The restaurant is open to anyone, including people who come through the door for lunch and nothing else. Worth spelling out, because a restaurant inside a sports club is usually assumed to be members-only. Here the table is entirely separate from the activity.',
      },
      {
        h3: 'A regular lunch spot',
        p: 'For residents and expats in Lamai the appeal is consistency: a menu that stays good, fresh ingredients, and somewhere you can sit with a laptop or meet someone without booking ahead. For visitors it is an address a short walk from the beach that breaks from the seafront restaurants, with a pool and shade thrown in.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  'kids-club': {
    fr: [
      {
        h3: 'Les bébés et les tout-petits acceptés, jusqu’à 5 ans',
        p: 'C’est l’un des rares endroits de Koh Samui à accueillir les enfants dès quelques mois, et non à partir de trois ou quatre ans. C’est précisément pour cette raison que beaucoup de familles viennent : elles ont cherché ailleurs et se sont heurtées à une limite d’âge. L’accueil va jusqu’à 5 ans, dans un espace sûr et ombragé, avec des activités encadrées adaptées à l’âge de chacun.',
      },
      {
        h3: 'Repas compris, à l’heure ou à la journée',
        p: 'Le tarif est de 200 THB l’heure, et le kids club est ouvert de 8h à 16h. Le petit-déjeuner, le déjeuner et le goûter de 15h sont compris — vous n’avez donc rien à préparer ni à emporter. Vous pouvez déposer votre enfant pour une heure, le temps d’une séance de sport, comme pour la journée entière, sans avoir à choisir un forfait à l’avance.',
      },
      {
        h3: 'Une excursion où votre enfant ne peut pas venir',
        p: 'Certaines sorties de Koh Samui ne se font pas avec un tout-petit : une journée bateau vers Ang Thong, une plongée, une longue route. Plutôt que d’y renoncer, de nombreux parents nous confient leur enfant à la journée. Ils partent le matin, l’enfant est nourri, encadré et occupé du début à la fin, et la journée sur l’île se passe l’esprit tranquille.',
      },
      {
        h3: 'Pour les familles installées sur l’île',
        p: 'Pour les résidents et les expatriés de Lamai, l’usage est différent : ce n’est pas l’exception d’un jour de vacances mais un rythme. Deux matinées par semaine pendant que l’un des parents s’entraîne ou travaille, un vendredi complet, une solution de repli quand la nounou est absente. Comme la facturation se fait à l’heure, le rythme se règle semaine après semaine sans engagement.',
      },
    ],
    en: [
      {
        h3: 'Babies and toddlers welcome, up to five',
        p: 'This is one of very few places on Koh Samui that takes children from a few months old rather than from three or four. It is usually why families end up here: they looked elsewhere first and ran into an age limit. Children are welcome up to five years old, in a safe, shaded space, with supervised activities matched to how young they actually are.',
      },
      {
        h3: 'Meals included, by the hour or the full day',
        p: 'The rate is 200 THB an hour and the club runs from 8 AM to 4 PM. Breakfast, lunch and a 3 PM snack are included, so there is nothing to pack or prepare beforehand. You can leave your child for a single hour while you train, or for the whole day, without committing to a package in advance or explaining your plans.',
      },
      {
        h3: 'For the excursion your little one cannot join',
        p: 'Some days out on Koh Samui simply do not work with a toddler: a boat trip to Ang Thong, a dive, a long drive across the island. Rather than give them up, plenty of parents leave their child with us for the day. They set off in the morning, the child is fed, supervised and occupied from start to finish, and the excursion happens without the guilt.',
      },
      {
        h3: 'For families who live here',
        p: 'Residents and expats in Lamai use it differently — not as a holiday exception but as a rhythm. Two mornings a week while one parent trains or works, a full Friday, a fallback when the usual help is away. Because it is billed by the hour, that rhythm can be adjusted week by week instead of being locked into a term.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────────────────
  babysitting: {
    fr: [
      {
        h3: 'Une garde d’enfants au club, à Lamai',
        p: 'Le babysitting se déroule au club, à côté du kids club : votre enfant reste dans un cadre encadré, avec des personnes dont c’est le métier, dans un lieu que vous avez vu de vos yeux avant de le laisser. C’est la différence avec une baby-sitter trouvée en ligne et rencontrée sur le pas de la porte, qui reste l’option la plus courante à Koh Samui pour les familles de passage.',
      },
      {
        h3: 'Sur demande, selon vos horaires',
        p: 'Le service se réserve sur demande plutôt qu’en ligne, parce que chaque garde est différente : la durée, l’âge de l’enfant, l’heure de la journée. Écrivez-nous sur WhatsApp ou via la page contact en indiquant la date, le créneau et l’âge, et nous confirmons ce qui est possible. Mieux vaut demander un peu à l’avance en haute saison.',
      },
      {
        h3: 'Pour les voyageurs, une soirée libre',
        p: 'Sur un séjour à Lamai, la demande la plus fréquente est la soirée : un dîner à deux, un anniversaire, une sortie qui finit tard. Les parents dînent tranquillement en sachant où est leur enfant et qui s’en occupe, ce qu’un service improvisé depuis l’hôtel ne garantit pas toujours.',
      },
      {
        h3: 'Pour les familles installées, un renfort régulier',
        p: 'Pour les résidents et les expatriés de l’île, l’usage est plus quotidien : quelques heures pour un rendez-vous médical à Chaweng, un dossier à finir, une nounou habituelle absente. Le service s’organise ponctuellement, sans contrat et sans volume minimum, ce qui en fait une solution de dépannage fiable plutôt qu’un engagement de plus.',
      },
    ],
    en: [
      {
        h3: 'Childcare at the club in Lamai',
        p: 'Babysitting takes place at the club, alongside the kids club. Your child stays in a supervised setting, with people who do this professionally, somewhere you have seen with your own eyes before leaving them there. That is the difference from a sitter found online and met on the doorstep, which remains the usual option on Koh Samui for families passing through.',
      },
      {
        h3: 'On request, around your hours',
        p: 'The service is arranged on request rather than booked online, because every session differs: the length, the age of the child, the time of day. Message us on WhatsApp or through the contact page with the date, the slot and your child’s age, and we will confirm what is possible. In high season it is worth asking a little ahead.',
      },
      {
        h3: 'For visitors: an evening off',
        p: 'On a trip to Lamai the most common request is the evening — dinner for two, a birthday, something that runs late. Parents get to eat properly knowing exactly where their child is and who is with them, which an arrangement improvised through the hotel does not always guarantee.',
      },
      {
        h3: 'For families based here: regular backup',
        p: 'For residents and expats the use is more everyday: a few hours for an appointment over in Chaweng, a piece of work to finish, the usual help away for a week. It is arranged session by session, with no contract and no minimum, which makes it dependable cover rather than one more commitment.',
      },
    ],
  },
}

/** Contenu long d'un service, ou `null` s'il n'en a pas encore. */
export function getServiceBody(slug: string, locale: 'en' | 'fr'): ServiceBlock[] | null {
  const body = SERVICE_BODY[slug]
  if (!body) return null
  const blocks = body[locale]
  return blocks && blocks.length > 0 ? blocks : null
}
