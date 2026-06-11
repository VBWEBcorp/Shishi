# SEO — Shi Shi Samui

> Stratégie SEO (audit experte VBWEB, juin 2026) **transcrite en Markdown** et **implémentée à la lettre** dans le site Next.js.
> Ce document = la stratégie + le mapping d'implémentation (fichiers, URLs, statut, points ouverts).
>
> Mots-clés & volumes : <https://docs.google.com/spreadsheets/d/1cY0qyD7tnY_DFAqDBMdLF6pxHEkfz2iQWI36dr9JATU/>

## 1. Contexte

Shi Shi Samui est un complexe sportif à **Lamai, au sud de Koh Samui** : tennis, pickleball, salle de fitness, kids club, babysitting, restaurant healthy, piscine, formules d'accès et réservation. Positionnement sur trois axes : **sport, bien-être, vie sociale**. Cible : expatriés, digital nomads, touristes et familles. La stratégie privilégie les recherches **locales et commerciales** (réserver, prix, inscrire un enfant, contacter).

> ⚠️ **État du site** : phase **« Coming Soon »**. La home (`/`) est une landing qui concentre l'indexation sur la requête de marque « Shi Shi Samui ». Tout le SEO ci-dessous est **construit et prêt** ; le passage en ligne complet est piloté par deux interrupteurs (voir [§9 Lancement](#9-checklist-de-lancement)).

---

## 2. Pages, URLs & balises — implémentées à la lettre

Toutes les pages de **Priorité 1** existent. Le `slug` interne de réservation est conservé (moteur de résa intact) ; les **URLs publiques** suivent l'audit. Redirections **301** des anciennes URLs en place (`next.config.ts`).

| Page (audit) | URL recommandée = URL en ligne | Implémentation | Statut |
|---|---|---|---|
| Accueil | `/` | `src/app/[locale]/page.tsx` (+ `coming-soon.tsx`) | ✅ |
| Tennis Court | `/tennis-court-lamai/` | route `[locale]/[service]` + `service-page.tsx` | ✅ |
| Pickleball Club | `/pickleball-club-lamai/` | idem | ✅ |
| Fitness Gym | `/fitness-gym-lamai/` | idem | ✅ |
| Kids Club | `/kids-club-lamai/` | idem | ✅ |
| Babysitting | `/babysitting-lamai/` | idem (nouvelle page) | ✅ |
| Healthy Restaurant | `/healthy-restaurant-lamai/` | idem | ✅ |
| Swimming Pool | `/swimming-pool-lamai/` | idem | ✅ |
| Prices | `/prices/` | `src/app/[locale]/prices/page.tsx` (nouvelle) | ✅ |
| Book Now / Reservation | `/book-now/` | `src/app/[locale]/book-now/` (ex-`/booking`) | ✅ |
| Contact / Location | `/contact-location/` | `src/app/[locale]/contact-location/` (ex-`/contact`) | ✅ |
| About Shi Shi | `/a-propos/` | `src/app/[locale]/a-propos/` | ✅ |

**Redirections 301** (`next.config.ts`) : `/activities/<slug>` → URL service, `/booking` → `/book-now`, `/contact` → `/contact-location` (versions préfixées locale **et** nues).

### Balises méta & H1 (source de vérité : `src/lib/activities.ts`, messages `Prices`/`Booking`/`Contact`)

Chaque page a un **meta title unique** (marque incluse), une **meta description unique orientée conversion**, le **mot-clé principal dans le title**, la **localisation** (Lamai / Koh Samui), un **H1 unique**, des **mots-clés** (`keywords`), et un **canonical** propre. Reprise **verbatim** de l'audit (EN) + équivalents FR.

<details><summary>Détail meta title / H1 par page (EN)</summary>

| Page | Meta title | H1 |
|---|---|---|
| Accueil | Sports & Social Club in Lamai, Koh Samui \| Shi Shi Samui | Sports & Social Club in Lamai, Koh Samui |
| Tennis | Tennis Court in Lamai, Koh Samui \| Shi Shi Samui | Tennis Court in Lamai, Koh Samui |
| Pickleball | Pickleball Club in Lamai, Koh Samui \| Shi Shi Samui | Pickleball Club in Lamai, Koh Samui |
| Fitness | Fitness Gym in Lamai, Koh Samui \| Shi Shi Samui | Fitness Gym in Lamai, Koh Samui |
| Kids Club | Kids Club in Lamai, Koh Samui \| Shi Shi Samui | Kids Club in Lamai, Koh Samui |
| Babysitting | Babysitting in Lamai, Koh Samui \| Shi Shi Samui | Babysitting Service in Lamai, Koh Samui |
| Restaurant | Healthy Restaurant in Lamai, Koh Samui \| Shi Shi Samui | Healthy Restaurant in Lamai, Koh Samui |
| Pool | Swimming Pool in Lamai, Koh Samui \| Shi Shi Samui | Swimming Pool in Lamai, Koh Samui |
| Prices | Pricing & Membership \| Shi Shi Samui Sports Club | Pricing & Membership at Shi Shi Samui |
| Book Now | Book Tennis, Pickleball & Fitness in Lamai \| Shi Shi Samui | Book Your Activity at Shi Shi Samui |
| Contact | Contact Shi Shi Samui in Lamai, Koh Samui | Contact Shi Shi Samui in Lamai |

> Note longueurs : l'audit recommande title 50-60 / description 140-160 caractères. Les **textes exacts fournis par l'audit** ont été repris **à la lettre** (certains sont volontairement plus courts).

</details>

---

## 3. Données structurées (JSON-LD) — `src/components/seo/json-ld.tsx`

Intégrées en JSON-LD, par type recommandé. **Aucune note/avis, aucun prix ou horaire inventé** (OfferCatalog uniquement sur les tarifs réellement affichés).

| Page | Donnée structurée | Statut |
|---|---|---|
| Accueil | `LocalBusiness` + `SportsActivityLocation` (type combiné) + Organization + WebSite + WebPage | ✅ |
| Tennis / Pickleball | `Service` + `SportsActivityLocation` + BreadcrumbList + FAQPage | ✅ |
| Fitness Gym | `HealthClub` (+ Service) + BreadcrumbList + FAQPage | ✅ |
| Kids Club / Babysitting / Pool | `Service` + BreadcrumbList + FAQPage | ✅ |
| Healthy Restaurant | `Restaurant` + BreadcrumbList + FAQPage | ✅ |
| Prices | `OfferCatalog` (tarifs confirmés) + WebPage + BreadcrumbList | ✅ |
| Book Now | `WebPage` + `Service` + BreadcrumbList | ✅ |
| Contact / Location | `LocalBusiness` + WebPage + BreadcrumbList | ✅ |
| Pages internes | `BreadcrumbList` | ✅ |
| Pages avec FAQ visible | `FAQPage` (FAQ réelles, factuelles) | ✅ |

LocalBusiness enrichi : NAP, `geo`, `areaServed` (Lamai / South Lamai / Koh Samui), `sameAs` (Instagram + Facebook), `image`, `logo`.

---

## 4. Structure Hn, images & ALT

- **1 seul H1 / page**, H2 pour les sections, H3 pour détails / FAQ. Vérifié au build.
- Images via **`next/image`** → conversion auto **WebP/AVIF** + lazy-loading natif hors écran (`next.config.ts` `formats: ['image/avif','image/webp']`).
- **ALT descriptifs** repris de l'audit, centralisés dans `activities.ts` (`altImages`) — ex. *« Tennis court at Shi Shi Samui in Lamai »*, *« Pickleball court at Shi Shi Samui »*.
- 👉 **À faire (optionnel)** : renommer les fichiers physiques en noms optimisés (`tennis-court-lamai-shi-shi-samui.webp`, …) et fournir les **vraies photos client** par pôle. `next/image` sert déjà du WebP optimisé quel que soit le nom de fichier.

---

## 5. Fil d'Ariane, maillage interne & CTA

- **Fil d'Ariane** visible + `BreadcrumbList` JSON-LD sur toutes les pages internes (`Home > Service`).
- **Maillage interne** (audit) centralisé dans `activities.ts` (`related`) et rendu par `service-page.tsx` :

| Page source | Liens internes |
|---|---|
| Accueil | Tennis, Pickleball, Fitness, Kids Club, Pricing, Book Now |
| Tennis | Pickleball · Pricing · Book Now · Contact |
| Pickleball | Tennis · Pricing · Book Now · Contact |
| Fitness | Pricing · Book Now · Healthy Restaurant · Swimming Pool |
| Kids Club | Babysitting · Swimming Pool · Healthy Restaurant · Book Now |
| Babysitting | Kids Club · Contact · Pricing · Healthy Restaurant |
| Healthy Restaurant | Fitness · Swimming Pool · Kids Club · Book Now |
| Swimming Pool | Healthy Restaurant · Kids Club · Pricing · Book Now |
| Prices | Tennis, Pickleball, Fitness, Kids Club, Swimming Pool, Book Now |
| Book Now | Tennis, Pickleball, Fitness, Kids Club, Pricing, Contact |
| Contact | Accueil, Pricing, Book Now |

- **CTA** : un CTA au-dessus de la ligne de flottaison + un CTA en fin de page, **bouton WhatsApp flottant global** (`FloatingWhatsApp` monté dans `root-wrapper.tsx`, visible mobile), liens Book Now / View Prices / Contact selon l'intention.

---

## 6. SEO local — `/contact-location` + `seo.ts`

Présents : nom complet **Shi Shi Samui**, adresse Lamai / Koh Samui (Surat Thani, 84310), téléphone, **lien WhatsApp**, horaires confirmés par activité (charte), **Google Maps intégré** (iframe) + lien « Itinéraire », **Instagram + Facebook**, repères géographiques (Lamai · South Lamai · Koh Samui), info d'accès (parking, entrée, Lamai Beach).

> Cohérence à maintenir **identique** sur le site, Google Business Profile, Facebook et Instagram.

---

## 7. Indexation, performance & suivi

- **Indexation** : pas de `noindex` sur les pages stratégiques (la home Coming Soon est `index`), `canonical` propre par page, `robots.txt` non bloquant (`/admin`, `/api` exclus), sitemap envoyé en GSC, pages Pricing & Book Now à ≤ 2 clics (menu + footer).
- **Performance** : `next/image` (WebP/AVIF, lazy), `compress`, fonts limitées (Poppins), `optimizePackageImports`, pas de vidéo lourde en autoplay bloquant (poster + `motion-reduce`).
- **Suivi** : GSC (balise `google-site-verification` en place), GA4 / Google Business Profile + events clics WhatsApp / téléphone / Book Now / Pricing / Maps → **à brancher** (voir points ouverts).

---

## 8. Articles de blog à créer (Priorité 2 — contenu rédactionnel)

Non rédigés (hors périmètre « pages & SEO technique »). Plateforme blog déjà en place (`/blog`). Ordre de production conseillé par l'audit :

1. Where to Play Pickleball in Koh Samui — *where to play pickleball in koh samui* → Pickleball, Pricing, Book Now
2. Pickleball for Beginners in Koh Samui — *pickleball for beginners koh samui* → Pickleball, Book Now
3. Where to Play Tennis in Koh Samui — *where to play tennis in koh samui* → Tennis, Pricing, Book Now
4. Best Tennis Court in Koh Samui — *best tennis court koh samui* → Tennis, Pricing, Book Now
5. Best Gym in Koh Samui — *best gym koh samui* → Fitness, Pricing, Book Now
6. Gym Near Lamai Beach — *gym near lamai beach* → Fitness, Pricing, Contact
7. Best Restaurants in Lamai — *best restaurants in lamai* → Restaurant, Pool, Fitness
8. Best Restaurants in Koh Samui — *best restaurants koh samui* → Restaurant, Accueil
9. Kids Activities in Lamai — *kids activities lamai* → Kids Club, Pool, Restaurant
10. Best Kids Club in Koh Samui — *best kids club koh samui* → Kids Club, Babysitting, Book Now
11. Babysitting in Koh Samui — *babysitting koh samui* → Babysitting, Kids Club, Contact
12. Pool Access in Lamai — *pool access lamai* → Pool, Pricing, Restaurant
13. What to Do in Lamai — *what to do in lamai* → Accueil, Pricing, Book Now
14. What to Do in Koh Samui — *what to do in koh samui* → Accueil, Fitness, Pickleball, Tennis
15. Sports Activities in Lamai — *sports activities lamai* → Accueil, Fitness, Pickleball

---

## 9. Checklist de lancement

Au passage du Coming Soon au site complet :

1. **Home** : remettre les sections complètes dans `[locale]/page.tsx` (déjà dispo via `[locale]/preview/page.tsx`), retirer le `noindex` de `/preview` ou supprimer la route, retirer le branchement `isHome` dans `RootWrapper`.
2. **Sitemap** : passer `LAUNCHED = true` dans `src/app/sitemap.ts` → toutes les pages SEO (EN+FR, hreflang) sont poussées.
3. **Search Console** : re-soumettre le sitemap, demander l'indexation des nouvelles URLs.
4. Tester les **données structurées** (Rich Results Test) et **PageSpeed** sur Accueil, Tennis, Pickleball, Fitness, Pricing, Book Now.

---

## 10. Points ouverts / à confirmer

- 🔲 **URL Facebook exacte** du club (`siteConfig.facebook`, placeholder `facebook.com/shishisamui`) — utilisée en `sameAs` + page Contact.
- 🔲 **Numéro de téléphone local** : actuellement `+33…` (fondateurs FR, WhatsApp). Confirmer s'il faut un numéro thaï affiché.
- 🔲 **Photos client réelles** par pôle + noms de fichiers optimisés (`*-lamai-shi-shi-samui.webp`).
- 🔲 **Tracking conversions** (GA4 events WhatsApp / Book Now / Pricing / Maps).
- 🔲 **Articles de blog** (§8) à rédiger.
- 🔲 **NAP identique** sur Google Business Profile / Facebook / Instagram.

---

## 11. Concurrents analysés (audit)

- <https://www.padelsamui.com/>
- <https://www.anybuddyapp.com/fr>

---

*Implémentation : VBWEB — juin 2026. Source de vérité on-page : `src/lib/activities.ts` (services) + messages `Prices`/`Booking`/`Contact` + `src/lib/seo.ts`.*
