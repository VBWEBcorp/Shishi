// scripts/publish-scheduled.js
//
// Insère / met à jour des articles de blog planifiés directement en MongoDB.
// Chaque article a `published: true` mais un `publishedAt` futur : il reste donc
// invisible (site, admin, sitemap) jusqu'à sa date, puis apparaît automatiquement.
//
// Lancer :  node scripts/publish-scheduled.js
//
// Idempotent : relancer le script met à jour les articles existants (clé = slug),
// il n'y a donc jamais de doublon ni d'erreur de clé unique.

const mongoose = require('mongoose')
require('dotenv').config({ path: '.env.local' })

const BlogPostSchema = new mongoose.Schema(
  {
    title: String,
    slug: { type: String, unique: true },
    excerpt: String,
    content: String,
    coverImage: String,
    category: String,
    tags: [String],
    author: String,
    published: Boolean,
    publishedAt: Date,
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
)

const BlogPost =
  mongoose.models.BlogPost || mongoose.model('BlogPost', BlogPostSchema)

// ──────────────────────────────────────────────────────────────────────────
//  ARTICLES PLANIFIÉS
//
//  Maillage interne : chaque content pointe en HTML (<a href="/blog/slug">)
//  vers d'autres articles du blog, dont les 2 déjà publiés :
//    - /blog/5-tendances-web-design-2026
//    - /blog/ameliorer-referencement-site
//
//  Dates : 1 article par semaine, le mardi 08h00, à partir du 02/06/2026.
// ──────────────────────────────────────────────────────────────────────────
const articles = [
  {
    title: 'Référencement local : attirer des clients près de chez vous',
    slug: 'referencement-local-attirer-clients-proximite',
    excerpt:
      "Le référencement local permet d'apparaître dans les recherches géolocalisées et sur Google Maps. Voici comment travailler votre visibilité de proximité, étape par étape.",
    content:
      '<h2>Pourquoi le référencement local change tout</h2>' +
      '<p>Quand un internaute cherche un service « près de chez lui », Google met en avant des résultats géolocalisés avant les liens classiques. Apparaître dans ce bloc local, c\'est capter une clientèle prête à passer à l\'action, souvent à quelques kilomètres de votre adresse.</p>' +
      '<p>Le référencement local répond à une logique différente du SEO classique. Il combine votre fiche établissement, vos avis clients et la cohérence de vos informations sur le web.</p>' +
      '<h2>Optimiser sa fiche Google Business Profile</h2>' +
      '<p>Votre fiche Google est la pierre angulaire de votre visibilité locale. Renseignez une catégorie précise, des horaires à jour, une description claire et des photos récentes. Plus votre fiche est complète, plus Google la juge fiable.</p>' +
      '<h3>Les informations à ne jamais négliger</h3>' +
      '<ul><li>Le nom exact de votre entreprise, sans mot-clé artificiel ;</li><li>Une adresse et un numéro de téléphone identiques partout sur le web ;</li><li>Un lien vers la bonne page de votre site (accueil ou page de service).</li></ul>' +
      '<h2>Collecter des avis clients</h2>' +
      '<p>Les avis sont un signal de confiance majeur pour le référencement local. Sollicitez vos clients satisfaits, répondez à chaque commentaire et traitez les retours négatifs avec professionnalisme. La régularité compte plus que le volume.</p>' +
      '<h2>Créer du contenu ancré dans votre territoire</h2>' +
      '<p>Publier des articles liés à votre zone d\'activité renforce votre ancrage géographique. C\'est aussi l\'occasion de soigner vos bases : retrouvez nos conseils dans <a href="/blog/ameliorer-referencement-site">comment améliorer le référencement de votre site</a> et apprenez à <a href="/blog/rediger-article-blog-optimise-seo">rédiger un article de blog optimisé pour le SEO</a>.</p>' +
      '<h2>Structurer ses liens internes</h2>' +
      '<p>Un bon référencement local s\'appuie aussi sur une architecture de site claire. Reliez vos pages de services à vos contenus de blog grâce à une <a href="/blog/maillage-interne-booster-seo">stratégie de maillage interne efficace</a> : Google comprend mieux votre activité et vos pages locales gagnent en autorité.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80',
    category: 'SEO',
    tags: ['seo local', 'google business', 'visibilité', 'référencement'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-06-02T08:00:00'),
    metaTitle: 'Référencement local : guide pour attirer des clients de proximité',
    metaDescription:
      "Apparaissez dans les recherches locales et sur Google Maps : fiche Google Business, avis clients, contenu géolocalisé et maillage interne.",
  },

  {
    title: 'Core Web Vitals : optimiser la vitesse de votre site',
    slug: 'core-web-vitals-optimiser-vitesse-site',
    excerpt:
      "Les Core Web Vitals mesurent l'expérience réelle de vos visiteurs. Comprendre et améliorer ces indicateurs, c'est gagner en confort de navigation et en référencement.",
    content:
      '<h2>Que sont les Core Web Vitals ?</h2>' +
      '<p>Les Core Web Vitals sont trois indicateurs définis par Google pour mesurer la qualité d\'expérience d\'une page : la vitesse d\'affichage du contenu principal, la réactivité aux interactions et la stabilité visuelle pendant le chargement.</p>' +
      '<p>Ces signaux font partie des critères de classement. Un site rapide et stable est mieux noté, mais surtout il retient davantage ses visiteurs.</p>' +
      '<h2>Comprendre les trois indicateurs clés</h2>' +
      '<h3>LCP — vitesse d\'affichage</h3>' +
      '<p>Le Largest Contentful Paint mesure le temps nécessaire pour afficher le plus gros élément visible. Visez moins de 2,5 secondes en optimisant images et polices.</p>' +
      '<h3>INP — réactivité</h3>' +
      '<p>L\'Interaction to Next Paint évalue le délai entre une action de l\'utilisateur et la réponse de la page. Allégez vos scripts pour rester sous 200 millisecondes.</p>' +
      '<h3>CLS — stabilité visuelle</h3>' +
      '<p>Le Cumulative Layout Shift sanctionne les éléments qui se déplacent pendant le chargement. Réservez toujours l\'espace de vos images et bannières pour l\'éviter.</p>' +
      '<h2>Des optimisations concrètes</h2>' +
      '<ul><li>Compressez vos images et adoptez les formats modernes comme le WebP ;</li><li>Limitez les scripts tiers et différez ceux qui ne sont pas critiques ;</li><li>Activez la mise en cache et un hébergement performant ;</li><li>Préchargez les polices et les ressources essentielles.</li></ul>' +
      '<h2>La vitesse au service du référencement</h2>' +
      '<p>La performance technique soutient toute votre stratégie SEO. Pour aller plus loin, lisez nos conseils dans <a href="/blog/ameliorer-referencement-site">améliorer le référencement de votre site</a>, et profitez d\'un projet de site neuf pour intégrer ces bonnes pratiques dès le départ : découvrez comment <a href="/blog/reussir-refonte-site-internet">réussir la refonte de votre site internet</a>.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    category: 'Conseils',
    tags: ['performance', 'core web vitals', 'vitesse', 'seo technique'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-06-09T08:00:00'),
    metaTitle: 'Core Web Vitals : optimiser la vitesse et le SEO de votre site',
    metaDescription:
      'LCP, INP, CLS : comprenez les Core Web Vitals et appliquez des optimisations concrètes pour un site plus rapide et mieux référencé.',
  },

  {
    title: 'Réussir la refonte de votre site internet',
    slug: 'reussir-refonte-site-internet',
    excerpt:
      "Une refonte réussie ne se limite pas au design : elle préserve votre référencement, clarifie votre message et améliore l'expérience utilisateur. Voici la méthode.",
    content:
      '<h2>Pourquoi refondre son site</h2>' +
      '<p>Un site vieillissant finit par desservir votre image : design daté, navigation confuse, lenteur, incompatibilité mobile. La refonte est l\'occasion de remettre votre vitrine au niveau de vos ambitions, tout en repensant vos objectifs.</p>' +
      '<h2>Préparer le projet en amont</h2>' +
      '<p>Avant de toucher au design, listez vos objectifs : générer des contacts, vendre en ligne, valoriser votre expertise. Analysez ensuite vos pages actuelles pour identifier celles qui performent et celles à fusionner ou supprimer.</p>' +
      '<h3>Cartographier l\'existant</h3>' +
      '<ul><li>Recensez toutes vos URL et leur trafic ;</li><li>Repérez les pages qui génèrent des contacts ;</li><li>Notez les contenus qui se positionnent déjà sur Google.</li></ul>' +
      '<h2>Préserver son référencement</h2>' +
      '<p>C\'est l\'étape la plus sous-estimée. Si vos URL changent, mettez en place des redirections permanentes pour ne pas perdre le référencement acquis. Conservez vos contenus performants et surveillez l\'indexation après la mise en ligne.</p>' +
      '<p>Profitez-en pour soigner la performance : nos recommandations sur les <a href="/blog/core-web-vitals-optimiser-vitesse-site">Core Web Vitals</a> s\'intègrent idéalement dès la phase de conception.</p>' +
      '<h2>Soigner le design et l\'identité</h2>' +
      '<p>Une refonte est le moment idéal pour moderniser votre univers visuel. Inspirez-vous des <a href="/blog/5-tendances-web-design-2026">5 tendances web design à suivre en 2026</a> et veillez à la cohérence de votre <a href="/blog/identite-de-marque-guide-debutant">identité de marque</a> sur l\'ensemble du site.</p>' +
      '<h2>Tester avant de publier</h2>' +
      '<p>Vérifiez l\'affichage sur mobile, la rapidité, les formulaires et les liens internes. Une recette rigoureuse évite les mauvaises surprises et garantit un lancement serein.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    category: 'Web Design',
    tags: ['refonte', 'web design', 'ux', 'projet web'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-06-16T08:00:00'),
    metaTitle: 'Réussir la refonte de son site internet : méthode complète',
    metaDescription:
      'Objectifs, audit, redirections SEO, design et recette : la méthode pour réussir la refonte de votre site sans perdre votre référencement.',
  },

  {
    title: 'Créer une identité de marque forte : le guide pour débuter',
    slug: 'identite-de-marque-guide-debutant',
    excerpt:
      "Logo, couleurs, ton de voix : votre identité de marque façonne la perception de votre entreprise. Voici les fondations pour construire une image cohérente et mémorable.",
    content:
      '<h2>L\'identité de marque, bien plus qu\'un logo</h2>' +
      '<p>Beaucoup réduisent l\'identité de marque à un logo. En réalité, elle englobe tout ce qui rend votre entreprise reconnaissable : couleurs, typographies, ton de voix, valeurs et expérience proposée à vos clients.</p>' +
      '<p>Une identité forte crée la confiance et la mémorisation. Elle vous distingue de la concurrence et donne de la cohérence à toutes vos communications.</p>' +
      '<h2>Définir sa plateforme de marque</h2>' +
      '<p>Avant le visuel, posez les fondations. Qui êtes-vous, à qui vous adressez-vous, quelle promesse tenez-vous ? Ces réponses guideront chaque choix créatif.</p>' +
      '<h3>Les questions à se poser</h3>' +
      '<ul><li>Quelles sont vos trois valeurs essentielles ?</li><li>Quelle personnalité voulez-vous incarner ?</li><li>Quel sentiment souhaitez-vous laisser à vos clients ?</li></ul>' +
      '<h2>Construire les éléments visuels</h2>' +
      '<p>Choisissez une palette de couleurs limitée et porteuse de sens, une à deux typographies lisibles, et un style d\'imagerie cohérent. La simplicité est votre alliée : une identité épurée vieillit mieux et s\'adapte à tous les supports.</p>' +
      '<h2>Rédiger une charte graphique</h2>' +
      '<p>La charte graphique documente vos règles d\'usage : tailles du logo, codes couleurs, espaces, interdits. C\'est le garant de la cohérence dans le temps, surtout lorsque plusieurs personnes communiquent en votre nom.</p>' +
      '<h2>Décliner son identité sur le web</h2>' +
      '<p>Votre site est la principale vitrine de votre marque. Lors d\'une <a href="/blog/reussir-refonte-site-internet">refonte de site internet</a>, veillez à traduire fidèlement votre univers, en vous appuyant sur les <a href="/blog/5-tendances-web-design-2026">tendances web design actuelles</a> sans trahir votre personnalité.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
    category: 'Conseils',
    tags: ['branding', 'identité de marque', 'logo', 'charte graphique'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-06-23T08:00:00'),
    metaTitle: 'Identité de marque : le guide pour créer une image forte',
    metaDescription:
      "Plateforme de marque, couleurs, typographies, charte graphique : les fondations pour bâtir une identité de marque cohérente et mémorable.",
  },

  {
    title: 'Rédiger un article de blog optimisé pour le SEO',
    slug: 'rediger-article-blog-optimise-seo',
    excerpt:
      "Un bon article SEO répond à une intention de recherche, se lit facilement et donne envie d'aller plus loin. Voici la méthode pour écrire des contenus qui se positionnent.",
    content:
      '<h2>Partir de l\'intention de recherche</h2>' +
      '<p>Avant d\'écrire une ligne, identifiez ce que cherche réellement votre lecteur. Veut-il comprendre, comparer ou acheter ? Un article performant répond précisément à cette intention plutôt que de traiter un sujet en surface.</p>' +
      '<h2>Choisir et placer ses mots-clés</h2>' +
      '<p>Sélectionnez un mot-clé principal et quelques variantes naturelles. Intégrez-les dans le titre, le premier paragraphe et les sous-titres, sans jamais forcer. Google valorise un texte fluide, pas une accumulation de mots-clés.</p>' +
      '<h2>Structurer pour la lecture</h2>' +
      '<p>Une bonne structure aide autant le lecteur que Googlebot. Hiérarchisez vos titres, gardez des paragraphes courts et aérez avec des listes quand c\'est pertinent.</p>' +
      '<h3>Les bonnes pratiques de mise en forme</h3>' +
      '<ul><li>Un seul sujet par paragraphe ;</li><li>Des sous-titres explicites et porteurs de mots-clés ;</li><li>Des phrases simples, à la voix active.</li></ul>' +
      '<h2>Soigner titre et méta description</h2>' +
      '<p>Le titre et la méta description sont votre vitrine dans les résultats de recherche. Rédigez un titre accrocheur et une description claire de moins de 160 caractères qui donne envie de cliquer. Ces bases sont détaillées dans <a href="/blog/ameliorer-referencement-site">améliorer le référencement de votre site</a>.</p>' +
      '<h2>Relier ses contenus entre eux</h2>' +
      '<p>Un article ne vit jamais seul. Reliez-le à vos autres contenus grâce à une <a href="/blog/maillage-interne-booster-seo">stratégie de maillage interne</a>, et pensez aux requêtes de proximité avec notre guide du <a href="/blog/referencement-local-attirer-clients-proximite">référencement local</a>.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&q=80',
    category: 'SEO',
    tags: ['rédaction web', 'seo', 'content marketing', 'mots-clés'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-06-30T08:00:00'),
    metaTitle: 'Rédiger un article de blog optimisé SEO : méthode et conseils',
    metaDescription:
      "Intention de recherche, mots-clés, structure, titres et maillage interne : la méthode pour écrire des articles de blog qui se positionnent sur Google.",
  },

  {
    title: 'Accessibilité web : le guide pour un site inclusif',
    slug: 'accessibilite-web-guide-rgaa',
    excerpt:
      "Un site accessible profite à tous vos visiteurs et renforce votre référencement. Découvrez les principes essentiels pour rendre votre site plus inclusif.",
    content:
      '<h2>Pourquoi l\'accessibilité est incontournable</h2>' +
      '<p>L\'accessibilité web vise à permettre à chacun, y compris les personnes en situation de handicap, d\'utiliser votre site. Au-delà de l\'obligation légale pour de nombreuses organisations, c\'est une question d\'éthique et de qualité.</p>' +
      '<p>Bonne nouvelle : un site accessible est aussi plus clair, plus rapide et mieux compris par les moteurs de recherche.</p>' +
      '<h2>Les quatre grands principes</h2>' +
      '<p>Les standards d\'accessibilité reposent sur quatre piliers : un contenu perceptible, une interface utilisable, une information compréhensible et un code robuste compatible avec les technologies d\'assistance.</p>' +
      '<h2>Des actions concrètes à mettre en place</h2>' +
      '<ul><li>Assurez un contraste suffisant entre le texte et l\'arrière-plan ;</li><li>Ajoutez des alternatives textuelles à toutes vos images ;</li><li>Rendez la navigation possible entièrement au clavier ;</li><li>Utilisez des titres hiérarchisés et des libellés explicites sur les formulaires.</li></ul>' +
      '<h3>Ne pas oublier les contenus multimédias</h3>' +
      '<p>Sous-titrez vos vidéos et proposez des transcriptions. Ces alternatives bénéficient aussi au référencement, car elles fournissent du texte indexable.</p>' +
      '<h2>Tester son accessibilité</h2>' +
      '<p>Plusieurs outils gratuits évaluent automatiquement vos pages. Complétez-les par des tests manuels : navigation au clavier, lecture d\'écran, zoom. L\'accessibilité se vérifie en continu, pas une seule fois.</p>' +
      '<h2>Penser inclusif dès la conception</h2>' +
      '<p>L\'accessibilité se construit dès le départ, pas après coup. Intégrez-la lors de la <a href="/blog/reussir-refonte-site-internet">refonte de votre site</a> et faites-en un réflexe, au même titre que les <a href="/blog/5-tendances-web-design-2026">tendances de design</a> que vous adoptez.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
    category: 'Web Design',
    tags: ['accessibilité', 'rgaa', 'wcag', 'inclusion'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-07-07T08:00:00'),
    metaTitle: 'Accessibilité web : guide pratique pour un site inclusif',
    metaDescription:
      'Contraste, alternatives textuelles, navigation clavier, tests : les principes essentiels pour rendre votre site accessible à tous et mieux référencé.',
  },

  {
    title: 'Augmenter le taux de conversion de votre site',
    slug: 'augmenter-taux-de-conversion-site',
    excerpt:
      "Attirer du trafic ne suffit pas : encore faut-il transformer vos visiteurs en clients. Voici les leviers concrets pour améliorer votre taux de conversion.",
    content:
      '<h2>Comprendre le taux de conversion</h2>' +
      '<p>Le taux de conversion mesure la part de visiteurs qui réalisent l\'action souhaitée : achat, demande de devis, inscription. L\'améliorer, c\'est tirer davantage de valeur de votre trafic existant, sans dépenser plus en acquisition.</p>' +
      '<h2>Clarifier votre proposition de valeur</h2>' +
      '<p>En quelques secondes, le visiteur doit comprendre ce que vous proposez et pourquoi vous choisir. Soignez vos titres, allez à l\'essentiel et mettez en avant un bénéfice concret plutôt qu\'une liste de fonctionnalités.</p>' +
      '<h2>Soigner les appels à l\'action</h2>' +
      '<p>Un bon appel à l\'action est visible, explicite et rassurant. Préférez un verbe d\'action clair, un contraste fort et un placement stratégique. Limitez le nombre de choix pour ne pas disperser l\'attention.</p>' +
      '<h3>Réduire les freins</h3>' +
      '<ul><li>Simplifiez vos formulaires au strict nécessaire ;</li><li>Affichez des preuves de confiance : avis, garanties, références ;</li><li>Rendez vos coordonnées et tarifs faciles à trouver.</li></ul>' +
      '<h2>Ne pas négliger l\'expérience technique</h2>' +
      '<p>Un site lent ou instable fait fuir avant même de convaincre. Travaillez vos <a href="/blog/core-web-vitals-optimiser-vitesse-site">Core Web Vitals</a> et veillez à une <a href="/blog/accessibilite-web-guide-rgaa">accessibilité irréprochable</a> : ces fondations soutiennent directement la conversion.</p>' +
      '<h2>Tester, mesurer, ajuster</h2>' +
      '<p>La conversion s\'optimise par itérations. Analysez le comportement de vos visiteurs, testez différentes versions de vos pages et conservez ce qui fonctionne. Une <a href="/blog/reussir-refonte-site-internet">refonte bien menée</a> est souvent l\'occasion idéale de repenser ces parcours.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80',
    category: 'Conseils',
    tags: ['conversion', 'ux', 'taux de conversion', 'cro'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-07-14T08:00:00'),
    metaTitle: 'Augmenter le taux de conversion de son site : leviers concrets',
    metaDescription:
      "Proposition de valeur, appels à l'action, réduction des freins et performance : les leviers pour transformer vos visiteurs en clients.",
  },

  {
    title: 'Maillage interne : booster votre SEO grâce aux liens',
    slug: 'maillage-interne-booster-seo',
    excerpt:
      "Le maillage interne guide Google et vos visiteurs à travers votre site. Bien pensé, il renforce l'autorité de vos pages et améliore votre référencement.",
    content:
      '<h2>Qu\'est-ce que le maillage interne</h2>' +
      '<p>Le maillage interne désigne l\'ensemble des liens qui relient les pages d\'un même site. Il aide les moteurs de recherche à découvrir vos contenus, à comprendre leur hiérarchie et à répartir l\'autorité entre vos pages.</p>' +
      '<p>Pour le visiteur, c\'est un fil conducteur : il prolonge sa visite et trouve facilement des contenus complémentaires.</p>' +
      '<h2>Pourquoi c\'est essentiel pour le SEO</h2>' +
      '<p>Une page sans lien entrant est difficile à découvrir et à valoriser. À l\'inverse, plus une page reçoit de liens internes pertinents, plus Google la considère comme importante. Le maillage oriente ainsi la puissance de votre site vers vos pages stratégiques.</p>' +
      '<h2>Construire un maillage efficace</h2>' +
      '<h3>Soigner les ancres</h3>' +
      '<p>Le texte cliquable, ou ancre, doit décrire la page de destination. Préférez une ancre explicite à un vague « cliquez ici » : elle informe à la fois l\'internaute et le moteur de recherche.</p>' +
      '<h3>Créer des regroupements thématiques</h3>' +
      '<ul><li>Reliez les articles d\'un même thème entre eux ;</li><li>Pointez vos contenus vers vos pages de service ;</li><li>Mettez à jour les anciens articles avec des liens vers les nouveaux.</li></ul>' +
      '<h2>Les erreurs à éviter</h2>' +
      '<p>Ne multipliez pas les liens à l\'excès : un maillage trop dense perd en clarté. Évitez aussi les liens cassés et les ancres identiques pointant vers des pages différentes.</p>' +
      '<h2>Mettre le maillage en pratique</h2>' +
      '<p>Le maillage va de pair avec une bonne rédaction. Appliquez ces principes en suivant notre guide pour <a href="/blog/rediger-article-blog-optimise-seo">rédiger un article optimisé SEO</a>, complétez avec les fondamentaux d\'<a href="/blog/ameliorer-referencement-site">amélioration du référencement</a>, et pensez aux requêtes locales détaillées dans le <a href="/blog/referencement-local-attirer-clients-proximite">guide du référencement local</a>.</p>',
    coverImage:
      'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
    category: 'SEO',
    tags: ['maillage interne', 'seo', 'liens', 'architecture'],
    author: "L'équipe",
    published: true,
    publishedAt: new Date('2026-07-21T08:00:00'),
    metaTitle: 'Maillage interne : booster son SEO grâce aux liens internes',
    metaDescription:
      "Liens internes, ancres, cocons thématiques et erreurs à éviter : comment le maillage interne renforce l'autorité de vos pages et votre référencement.",
  },
]

;(async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI manquant (vérifie .env.local)')
    process.exit(1)
  }

  await mongoose.connect(process.env.MONGODB_URI)

  // Upsert par slug : idempotent, aucun doublon même en relançant le script.
  const ops = articles.map((a) => ({
    updateOne: {
      filter: { slug: a.slug },
      update: { $set: a },
      upsert: true,
    },
  }))

  const res = await BlogPost.bulkWrite(ops)
  const inserted = res.upsertedCount || 0
  const updated = res.modifiedCount || 0
  console.log(
    `${articles.length} articles planifiés (${inserted} créés, ${updated} mis à jour).`
  )
  console.log('Tous invisibles jusqu\'à leur date publishedAt, puis publiés automatiquement.')

  await mongoose.disconnect()
})().catch((err) => {
  console.error('Erreur :', err.message)
  process.exit(1)
})
