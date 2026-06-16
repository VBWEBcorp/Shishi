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
export const LAUNCHED = false
