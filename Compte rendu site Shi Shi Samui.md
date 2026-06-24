# Compte rendu — Site internet Shi Shi Samui

*Document de présentation client — juin 2026 · réalisé par VBWEB*

---

## 1. En résumé

Le site **Shi Shi Samui** (club sport & social à Lamai, sud de Koh Samui) est **construit, en ligne et prêt**. Il regroupe :

- un **site vitrine bilingue** (anglais 🇬🇧 + français 🇫🇷), une page par pôle d'activité, optimisé pour le référencement local (Lamai / Koh Samui) ;
- un **moteur de réservation en ligne** ;
- un **espace d'administration complet** (back-office) pour piloter le site sans toucher au code : réservations, contacts/CRM, newsletter, blog, marketing, contenus des pages.

**Statut actuel : phase « Coming Soon ».** La page d'accueil est volontairement une landing qui concentre l'indexation Google sur la **marque « Shi Shi Samui »**. Tout le reste du site est déjà prêt et bascule en ligne complète via deux interrupteurs, le jour où vous le décidez (voir §7).

> **Adresse du site :** https://shi-shi-samui.com — chaque page existe en deux langues : `/en/…` (anglais) et `/fr/…` (français).

---

## 2. Arborescence du site

### 2.1 Pages publiques (visibles par vos visiteurs)

```
Accueil  (/)
│
├─ Activités (un page par pôle)
│   ├─ Tennis ............ /tennis-court-lamai
│   ├─ Pickleball ........ /pickleball-club-lamai
│   ├─ Fitness / Salle ... /fitness-gym-lamai
│   ├─ Kids Club ......... /kids-club-lamai
│   ├─ Babysitting ....... /babysitting-lamai
│   ├─ Restaurant healthy  /healthy-restaurant-lamai
│   └─ Piscine ........... /swimming-pool-lamai
│
├─ Tarifs ................ /prices
├─ Réserver .............. /book-now
├─ Contact & accès ....... /contact-location
├─ À propos .............. /a-propos
│
├─ Blog .................. /blog  (et chaque article : /blog/{article})
└─ Galerie photo/vidéo ... /gallery   (prête, désactivée par défaut)
```

**Pages légales** (présentes, non indexées par Google, comme il se doit) :
Mentions légales · Politique de confidentialité · Conditions générales · Politique de cookies.

### 2.2 Espace d'administration (back-office, accès privé `/admin`)

```
/admin
├─ Connexion sécurisée (login)
├─ Tableau de bord ........ vue d'ensemble
├─ Réservations .......... suivi et gestion des réservations
├─ Contacts (CRM) ........ demandes reçues, fiches contacts, export
├─ Newsletter ............ envoi d'emails ciblés (avec aperçu avant envoi)
├─ Marketing ............. pop-up & bannière promo du site
├─ Blog .................. création / édition des articles
├─ Galerie ............... gestion des photos et vidéos
└─ Pages ................. édition des textes (Accueil, Services, À propos, Contact, Témoignages)
```

---

## 3. Le détail des pages publiques (titre + méta-description)

Chaque page possède un **titre unique** et une **méta-description unique** (le petit texte qui s'affiche sous le lien dans les résultats Google), rédigés pour le référencement local **et** pour donner envie de cliquer. Le mot-clé principal et la localisation (Lamai / Koh Samui) sont toujours présents.

> Les pages d'activité existent à l'identique en anglais et en français. Ci-dessous, les versions françaises (les versions anglaises ciblent les touristes et expatriés anglophones).

| Page | URL | Méta-description |
|---|---|---|
| **Accueil** | `/` | Découvrez Shi Shi Samui, club sport & social à Lamai : tennis, pickleball, fitness, kids club, cuisine healthy et piscine. |
| **Tennis** | `/tennis-court-lamai` | Réservez un court de tennis à Lamai chez Shi Shi Samui. Jouez au tennis à Koh Samui : réservation simple, tarifs et installations du club. |
| **Pickleball** | `/pickleball-club-lamai` | Jouez au pickleball à Lamai chez Shi Shi Samui. Réservez un terrain, rejoignez la communauté et découvrez le pickleball à Koh Samui. |
| **Fitness / Salle** | `/fitness-gym-lamai` | Entraînez-vous chez Shi Shi Samui, salle de sport à Lamai avec abonnements, pass journée et accès à un club sportif premium. |
| **Kids Club** | `/kids-club-lamai` | Découvrez le Kids Club Shi Shi à Lamai. Des activités ludiques pour les enfants pendant que les parents profitent du sport, du fitness, du restaurant ou de la piscine. |
| **Babysitting** | `/babysitting-lamai` | Réservez un service de babysitting à Lamai avec Shi Shi Samui. Une solution de garde pratique pour les familles, expatriés et touristes. |
| **Restaurant healthy** | `/healthy-restaurant-lamai` | Savourez une cuisine healthy à Lamai chez Shi Shi Samui. Un restaurant détendu pour sportifs, familles, expatriés et visiteurs. |
| **Piscine** | `/swimming-pool-lamai` | Détendez-vous à la piscine Shi Shi Samui à Lamai. Profitez d'un accès piscine avec sport, cuisine healthy et une ambiance club familiale. |
| **Tarifs** | `/prices` | Consultez les tarifs Shi Shi Samui : tennis, pickleball, fitness, kids club, accès piscine et activités du club. |
| **Réserver** | `/book-now` | Réservez votre activité chez Shi Shi Samui. Tennis, pickleball, fitness, kids club ou accès piscine à Lamai, Koh Samui. |
| **Contact & accès** | `/contact-location` | Contactez Shi Shi Samui à Lamai. Localisation, horaires, contact WhatsApp et itinéraire vers le club sportif. |
| **À propos** | `/a-propos` | L'histoire de Shi Shi Samui, club premium sport & social à Lamai, portée par deux jeunes fondateurs français au sud de Koh Samui. |
| **Blog** | `/blog` | Conseils, idées et inspirations pour profiter de votre séjour à Koh Samui. |

**Contenu de chaque page d'activité :** un titre principal (H1) unique, une vidéo d'ambiance, une galerie photo, les points forts du pôle, une **FAQ** (questions/réponses réelles) et des liens vers les autres pôles et la réservation.

---

## 4. Le référencement (SEO) — ce qui a été mis en place

Le site applique **à la lettre** la stratégie SEO issue de l'audit (juin 2026) :

- ✅ **Une page dédiée par activité**, avec son propre titre, sa description et ses mots-clés (tennis, pickleball, fitness, kids club, babysitting, restaurant, piscine).
- ✅ **Mots-clés locaux et commerciaux** ciblés : « tennis court koh samui », « gym lamai », « pickleball koh samui », « babysitting koh samui », etc.
- ✅ **Données structurées Google** (rich snippets) sur chaque page : type de lieu/activité, fil d'Ariane, FAQ — sans aucune note, prix ou horaire inventés.
- ✅ **Fiche établissement local** intégrée (nom, adresse Lamai/Koh Samui, téléphone, WhatsApp, Instagram, Facebook, **Google Maps + itinéraire**).
- ✅ **Bilingue EN/FR** avec balises `hreflang` (Google sert la bonne langue selon le visiteur).
- ✅ **Fil d'Ariane** et **maillage interne** (les pages se renvoient les unes vers les autres) + boutons d'appel à l'action (Réserver / Voir les tarifs / WhatsApp).
- ✅ **Performance & images** : conversion automatique en WebP/AVIF, chargement différé, site compressé.
- ✅ **Technique** : adresses propres, redirections 301 des anciennes URL, `sitemap` et `robots.txt` prêts, balise de vérification Google Search Console en place.

**Blog (référencement long terme) :** la plateforme est en place ; une liste de **15 articles** ciblés a été définie par l'audit (ex. « Where to Play Pickleball in Koh Samui », « Best Gym in Koh Samui »…), à rédiger progressivement.

---

## 5. Le moteur de réservation

- Réservation en ligne en moins d'une minute : choix de l'activité → créneau selon disponibilités → confirmation.
- Activités réservables aujourd'hui : **tennis, fitness, kids club, accès piscine**.
- Le **pickleball** est présenté avec la mention « bientôt » (les terrains sont en cours d'aménagement) et renvoie vers le contact.
- Paiement préparé (Stripe) et emails de confirmation/relance (système prêt, en veille tant que le compte WhatsApp Business / l'activation paiement ne sont pas branchés).
- **Bouton WhatsApp flottant** présent sur tout le site (surtout pratique sur mobile).

---

## 6. L'espace d'administration (vous pilotez le site vous-même)

Depuis `/admin`, en accès sécurisé, vous gérez tout sans technicien :

| Module | Ce que vous pouvez faire |
|---|---|
| **Tableau de bord** | Vue d'ensemble de l'activité. |
| **Réservations** | Voir et gérer les réservations reçues. |
| **Contacts (CRM)** | Toutes les demandes du formulaire, fiches contacts, **export** de la liste. |
| **Newsletter** | Composer et envoyer des emails, **cibler** les destinataires, **prévisualiser** avant l'envoi (via Resend). |
| **Marketing** | Activer une **pop-up** ou une **bannière** promotionnelle sur le site. |
| **Blog** | Rédiger et publier des articles (éditeur de texte complet). |
| **Galerie** | Ajouter photos et vidéos (module prêt, désactivé par défaut). |
| **Pages** | Modifier vous-même les textes des pages : Accueil, Services, À propos, Contact, Témoignages. |

---

## 7. Mise en ligne complète — ce qu'il reste à décider

Le passage de « Coming Soon » au site complet se fait en **2 interrupteurs** + 4 vérifications rapides, le jour où vous le souhaitez :

1. Basculer la page d'accueil en version complète.
2. Activer le `sitemap` (toutes les pages sont alors envoyées à Google).
3. Re-soumettre le sitemap dans Google Search Console + demander l'indexation.
4. Vérifier données structurées et vitesse sur les pages clés.

### Points à confirmer de votre côté

- 🔲 **URL Facebook exacte** du club.
- 🔲 **Numéro de téléphone** à afficher (actuellement le numéro français WhatsApp des fondateurs — faut-il un numéro local thaï ?).
- 🔲 **Vos vraies photos** par pôle (tennis, fitness, restaurant, etc.).
- 🔲 **Cohérence nom/adresse/téléphone** identique partout (site, Google Business Profile, Facebook, Instagram).
- 🔲 **Suivi des conversions** (statistiques clics WhatsApp / Réserver / Tarifs) à brancher.
- 🔲 **Articles de blog** à produire au fil de l'eau.

---

## 8. La technique en une ligne

Site moderne **Next.js 15 / React 19**, bilingue, hébergé sur Netlify, base de données MongoDB, emails via Resend, paiement Stripe, médias optimisés — un socle rapide, sécurisé et évolutif.

---

*Pour toute question ou pour planifier la mise en ligne complète, je reste à votre disposition. — VBWEB*
