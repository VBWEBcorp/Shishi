/**
 * Drapeau de lancement global du site (source unique de vérité).
 *
 *  · false → phase « Coming Soon » : EN PRODUCTION, seul l'accueil (la landing
 *            de marque) est public. Toutes les autres pages publiques
 *            redirigent vers l'accueil, et le sitemap ne référence que la home.
 *  · true  → site lancé : toutes les pages deviennent publiques et indexables.
 *
 * En développement local, le site complet reste TOUJOURS navigable, quelle que
 * soit la valeur de ce drapeau (pour pouvoir travailler sur toutes les pages).
 *
 * → Au lancement réel : passer LAUNCHED à true (un seul endroit suffit :
 *   accueil, middleware et sitemap s'appuient tous sur ce drapeau).
 */
export const LAUNCHED = true

/**
 * Aperçu privé par CODE : tant que le site n'est pas lancé (façade Coming Soon),
 * un visiteur qui possède le bon code voit l'INTÉGRALITÉ du site. Le code est
 * stocké dans un cookie (lisible aussi côté client pour l'habillage), posé soit
 * via le formulaire de la page Coming Soon, soit via un lien `?code=...`.
 */
export const PREVIEW_COOKIE = 'shishi_preview'
export const PREVIEW_CODE = process.env.PREVIEW_CODE || 'Shishi2230'
/** Durée de validité du cookie d'aperçu (30 jours). */
export const PREVIEW_MAX_AGE = 60 * 60 * 24 * 30

/**
 * Mise en avant PUBLIQUE de l'espace adhérent (bouton « Se connecter / Espace
 * adhérent » dans la navigation). Désactivé tant qu'on ne promeut pas les
 * abonnements sur le site : les routes /member restent fonctionnelles (accès
 * par lien direct), mais ne sont plus affichées dans le menu. Repasser à `true`
 * le jour du lancement des abonnements.
 */
export const SHOW_MEMBER_AREA = false
