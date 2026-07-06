/**
 * Constantes PURES de l'espace adhérent (utilisables côté client ET serveur).
 * La logique serveur (crédits par activité) vit dans `membership.ts`.
 *
 * Il n'y a PAS de formules d'abonnement : le club fonctionne uniquement par
 * CRÉDITS PAR ACTIVITÉ (ex. crédits tennis), attribués par l'admin lors du
 * passage au club — en ponctuel (valables 1 mois) ou en recharge automatique
 * mensuelle.
 */

/** Fenêtre de réservation à l'avance pour un client SANS compte (jours). */
export const PUBLIC_ADVANCE_DAYS = 3
/** Fenêtre de réservation à l'avance pour un adhérent connecté (jours). */
export const MEMBER_ADVANCE_DAYS = 10
