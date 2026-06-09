import Stripe from 'stripe'

const SECRET_KEY = process.env.STRIPE_SECRET_KEY

/** Stripe est "câblé" dès que la clé secrète est présente. */
export const stripeEnabled = !!SECRET_KEY

/** Devise par défaut des paiements (THB pour la Thaïlande). */
export const stripeCurrency = (process.env.STRIPE_CURRENCY || 'thb').toLowerCase()

export const stripe: Stripe | null = stripeEnabled
  ? new Stripe(SECRET_KEY as string, { apiVersion: '2026-05-27.dahlia' })
  : null

/**
 * Devises "zéro décimale" chez Stripe : le montant est en unité entière,
 * pas en centimes. Les autres (THB, EUR, USD…) sont en centimes.
 */
const ZERO_DECIMAL = new Set(['jpy', 'krw', 'vnd', 'clp', 'pyg'])

/** Convertit un montant lisible (ex: 500 THB) vers l'unité attendue par Stripe. */
export function toStripeAmount(amount: number, currency = stripeCurrency) {
  return ZERO_DECIMAL.has(currency) ? Math.round(amount) : Math.round(amount * 100)
}
