# SEO — Shi Shi Samui

➡️ **La documentation SEO à jour est dans [`SEO-SHI-SHI.md`](./SEO-SHI-SHI.md)** : stratégie de l'audit experte (juin 2026) transcrite en Markdown + mapping d'implémentation complet (URLs, balises, données structurées, maillage, SEO local, lancement).

Architecture technique (Next.js App Router) :

- **Métadonnées** : `generateMetadata` / `export const metadata` par page + template `%s | Shi Shi Samui` (`src/app/layout.tsx`). Source de vérité on-page des pages service : `src/lib/activities.ts`.
- **Données structurées** : helpers JSON-LD dans `src/components/seo/json-ld.tsx` (Organization, LocalBusiness+SportsActivityLocation, Service, HealthClub, Restaurant, OfferCatalog, FAQPage, BreadcrumbList, WebPage/WebSite).
- **Config site** : `src/lib/seo.ts` (NAP, geo, réseaux, Google Maps).
- **Sitemap / robots** : `src/app/sitemap.ts` (drapeau `LAUNCHED`) et `src/app/robots.ts`.
- **Redirections 301** : `next.config.ts`.

> Le starter d'origine (Vite + react-helmet) n'est plus d'actualité : le site tourne sous **Next.js 15 (App Router) + next-intl**.
