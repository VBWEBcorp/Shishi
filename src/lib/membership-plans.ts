/**
 * Constantes PURES de l'espace adhérent (utilisables côté client ET serveur).
 * La logique serveur (crédits par activité) vit dans `membership.ts`.
 *
 * Il n'y a PAS de formules d'abonnement : le club fonctionne uniquement par
 * CRÉDITS PAR ACTIVITÉ (ex. crédits tennis), attribués par l'admin lors du
 * passage au club — en ponctuel (valables 1 mois) ou en recharge automatique
 * mensuelle.
 */

/**
 * Fenêtre de réservation à l'avance pour un client SANS compte (jours).
 *
 * Portée de 3 à 7 jours le 18/08/2026 à la demande du club : une semaine de
 * visibilité suffit aux clients, et au-delà le club garde la main pour placer
 * les cours privés — qui rapportent davantage qu'une simple location de
 * terrain. L'espace admin, lui, n'est jamais borné.
 */
export const PUBLIC_ADVANCE_DAYS = 7
/** Fenêtre de réservation à l'avance pour un adhérent connecté (jours). */
export const MEMBER_ADVANCE_DAYS = 10
