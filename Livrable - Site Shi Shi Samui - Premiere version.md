# Shi Shi Samui — Site internet · Première version

*Livrable de présentation — VBWEB · juin 2026*

Bienvenue sur la première version de votre site. Ce document récapitule **tout ce qui a été réalisé** : le référencement (SEO) travaillé en profondeur, et l'**espace d'administration** complet qui vous permet de tout piloter — avec, en bonus, des modules **offerts** (newsletter + CRM avec analyses).

> **Accès au site** : la page d'accueil affiche pour l'instant une **façade « Coming Soon »** (pour ne pas donner l'impression d'un site déjà officiellement en ligne). Pour voir **l'intégralité du site**, saisissez le code d'accès **`Shishi2230`** sur cette page (ou ouvrez le lien fourni se terminant par `?code=Shishi2230`).

---

## 1. Le référencement (SEO) — ce qui a été mis en place

Le site applique **à la lettre** une stratégie SEO issue d'un audit dédié. Tout est construit pour être trouvé sur Google, en local (Lamai / Koh Samui) comme sur les recherches commerciales (réserver, prix, etc.).

### Architecture & pages
- **Une page dédiée par pôle d'activité** (meilleur ciblage Google) : Tennis, Pickleball, Fitness, Kids Club, Babysitting, Restaurant healthy, Piscine.
- **URLs optimisées** pour le SEO : `tennis-court-lamai`, `pickleball-club-lamai`, `fitness-gym-lamai`, `healthy-restaurant-lamai`, `swimming-pool-lamai`, `kids-club-lamai`, `babysitting-lamai`, plus `prices`, `book-now`, `contact-location`, `a-propos`.
- **Redirections 301** des anciennes adresses vers les nouvelles (aucun lien ni référencement perdu).

### Balises & contenu (sur chaque page)
- **Titre (meta title) unique** par page, avec le mot-clé principal + la localisation + la marque.
- **Méta-description unique** orientée conversion (donne envie de cliquer).
- **Un seul H1 par page** + hiérarchie de titres H2/H3 propre.
- **Mots-clés ciblés** par page (ex. « tennis court koh samui », « gym lamai », « babysitting koh samui »…).
- **URL canonique** propre sur chaque page (évite le contenu dupliqué).

### Site bilingue (anglais 🇬🇧 + français 🇫🇷)
- Chaque page existe en **deux langues** (`/en/…` et `/fr/…`), avec balises **hreflang** dans le sitemap (Google sert la bonne langue selon le visiteur).
- Le contenu anglais et français se gère **séparément** depuis l'admin.

### Données structurées (rich snippets Google)
Balisage **JSON-LD** adapté au type de chaque page (vérifié) :
- **Accueil** : `LocalBusiness` + `SportsActivityLocation` + Organization + WebSite + WebPage.
- **Tennis / Pickleball** : `Service` + `SportsActivityLocation` + fil d'Ariane + **FAQ**.
- **Fitness** : `HealthClub` + Service + fil d'Ariane + FAQ.
- **Restaurant** : `Restaurant` + fil d'Ariane + FAQ.
- **Tarifs** : `OfferCatalog` (les tarifs réellement affichés) + fil d'Ariane.
- Aucune note, prix ou horaire inventé : uniquement des données réelles.

### SEO local
- **Nom / adresse / téléphone (NAP)** cohérents, coordonnées géo, zones desservies (Lamai · South Lamai · Koh Samui).
- **Google Maps intégré** + lien « Itinéraire », **WhatsApp**, horaires, **Instagram + Facebook** (liens `sameAs`).

### Technique & performance
- **Images** servies en **WebP / AVIF** (format nouvelle génération), chargement différé, **textes ALT descriptifs**.
- **Fil d'Ariane** visible + maillage interne entre les pages + boutons d'action (Réserver / Voir les tarifs / Contact).
- **robots.txt** propre (admin & API exclus), **sitemap** généré automatiquement, **vérification Google Search Console** en place.
- Site **compressé**, polices et librairies optimisées, pas de vidéo lourde bloquante.

### Blog (SEO sur le long terme)
- **Plateforme de blog** intégrée, bilingue, 100 % optimisée (mot-clé dans titre/URL/intro/H2/ALT, sommaire, FAQ, liens internes).
- **1er article publié** : *« Where to Play Pickleball in Koh Samui »*.
- **14 autres articles** déjà planifiés (tennis, gym, restaurants, kids club, babysitting…) à produire au fil de l'eau.

---

## 2. L'espace d'administration — vous pilotez tout vous-même

Accès privé et sécurisé sur `/admin`. Aucun technicien nécessaire au quotidien.

### Gestion de contenu
- **Modification des pages** : vous éditez vous-même les textes et images de l'Accueil, Services, À propos, Contact et Témoignages — **en français ET en anglais** (sélecteur de langue), avec **aperçu** avant publication.
- **Blog** : rédaction et publication d'articles (éditeur de texte complet).
- **Galerie** : ajout de photos et vidéos (activable/désactivable).

### Activité commerciale
- **Réservations** : suivi et gestion des demandes reçues sur le site (vue calendrier, tableau, cartes, recherche, filtres par statut).
- **Notifications email automatiques** (testées) : confirmation au client à chaque réservation, alerte interne à chaque nouvelle demande, et **rappel automatique** avant la session.
- **Tableau de bord** : vue d'ensemble de l'activité.

### Marketing
- **Pop-up & bannière** promotionnelles activables sur le site en un clic.

---

## 3. En bonus — offert (hors périmètre initial) 🎁

Deux modules ajoutés en cadeau, qui dépassent le cadre prévu :

### Newsletter intégrée
- Composez et envoyez des **campagnes email** à vos contacts, depuis l'admin.
- **Email mis en forme** aux couleurs de la marque (logo, liseré orange, bouton d'action, pied de page avec désinscription).
- **Ciblage** des destinataires + **aperçu** + **envoi de test** avant la diffusion réelle.
- Désinscription automatique gérée (conformité).

### CRM avec analyses
- **Fiches contacts** alimentées automatiquement (chaque réservation et inscription crée/enrichit un contact).
- **Statistiques & analyses** : suivi des contacts, sources, et **carte** de répartition.
- **Export** de la base de contacts en un clic.

> Ces deux modules transforment le site en véritable **outil de gestion**, et pas seulement une vitrine : vous gardez le contact avec vos clients et vous pilotez votre croissance.

---

## 4. Et la suite ?

La première version est **complète et prête**. Pour la mise en ligne officielle, il restera simplement à :
1. Lever la façade « Coming Soon » le jour J (un seul réglage).
2. Soumettre le sitemap dans Google Search Console.
3. Brancher le stockage des images (pour l'upload depuis l'admin en production).
4. Finaliser quelques infos (téléphone local, vraies photos par pôle, lien Facebook exact).

---

*Réalisé par VBWEB. Nous restons à votre disposition pour la présentation, les retours et la mise en ligne.*
