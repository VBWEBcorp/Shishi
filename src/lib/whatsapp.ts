import 'server-only'

/**
 * Notifications WhatsApp via Meta Cloud API (WhatsApp Business).
 *
 * Deux modes :
 *  - TEMPLATE : obligatoire pour un message "business-initiated" (ex: confirmation
 *    de réservation envoyée au client). Le template doit être approuvé dans Meta.
 *  - TEXT : message libre, autorisé UNIQUEMENT dans la fenêtre de 24h après un
 *    message du destinataire. Utilisé pour l'alerte interne à l'équipe.
 *
 * Comme Stripe/Resend, tout est gardé par `whatsappEnabled` : sans token, on
 * log et on ne casse jamais le flux de réservation.
 */

const TOKEN = process.env.WHATSAPP_TOKEN
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const API_VERSION = process.env.WHATSAPP_API_VERSION || 'v21.0'
const BOOKING_TEMPLATE = process.env.WHATSAPP_BOOKING_TEMPLATE || 'booking_confirmation'
const TEMPLATE_LANG = process.env.WHATSAPP_TEMPLATE_LANG || 'en'
const TEAM_NUMBER = process.env.WHATSAPP_TEAM_NUMBER

export const whatsappEnabled = !!(TOKEN && PHONE_NUMBER_ID)
export const whatsappTeamNumber = TEAM_NUMBER

/** Garde le seul format accepté par Meta : chiffres uniquement (indicatif inclus). */
export function normalizeNumber(raw?: string): string {
  return (raw || '').replace(/\D/g, '')
}

async function postMessage(payload: Record<string, unknown>) {
  if (!whatsappEnabled) {
    console.warn('[whatsapp] non configuré — message ignoré')
    return { ok: false as const, skipped: true as const }
  }
  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messaging_product: 'whatsapp', ...payload }),
      }
    )
    if (!res.ok) {
      const detail = await res.text()
      console.error('[whatsapp] API error', res.status, detail)
      return { ok: false as const, error: `http-${res.status}` }
    }
    return { ok: true as const }
  } catch (err) {
    console.error('[whatsapp] request failed:', err)
    return { ok: false as const, error: 'request-failed' }
  }
}

/** Message texte libre (fenêtre 24h uniquement) — utilisé pour l'équipe. */
export async function sendWhatsAppText(to: string, body: string) {
  const number = normalizeNumber(to)
  if (!number) return { ok: false as const, error: 'no-recipient' }
  return postMessage({ to: number, type: 'text', text: { preview_url: false, body } })
}

/**
 * Message template (confirmation client). Les `bodyParams` remplissent les
 * variables {{1}}, {{2}}… du corps du template approuvé, dans l'ordre.
 */
export async function sendWhatsAppTemplate(
  to: string,
  bodyParams: string[],
  templateName: string = BOOKING_TEMPLATE,
  languageCode: string = TEMPLATE_LANG
) {
  const number = normalizeNumber(to)
  if (!number) return { ok: false as const, error: 'no-recipient' }
  return postMessage({
    to: number,
    type: 'template',
    template: {
      name: templateName,
      language: { code: languageCode },
      components: bodyParams.length
        ? [
            {
              type: 'body',
              parameters: bodyParams.map((text) => ({ type: 'text', text })),
            },
          ]
        : [],
    },
  })
}

/** Confirmation de réservation au client (template) — best-effort. */
export async function notifyClientBooking(booking: {
  name: string
  phone?: string
  activityName: string
  date: string
  time: string
}) {
  if (!booking.phone) return { ok: false as const, error: 'no-phone' }
  // Ordre des params attendu par le template : {{1}} nom, {{2}} activité, {{3}} date, {{4}} heure
  return sendWhatsAppTemplate(booking.phone, [
    booking.name,
    booking.activityName,
    booking.date,
    booking.time,
  ])
}

/** Alerte interne à l'équipe (texte libre) — best-effort. */
export async function notifyTeamBooking(booking: {
  name: string
  email: string
  phone?: string
  activityName: string
  date: string
  time: string
}) {
  if (!whatsappTeamNumber) return { ok: false as const, error: 'no-team-number' }
  const lines = [
    '🎾 New paid booking — Shi Shi Samui',
    `Activity: ${booking.activityName}`,
    `When: ${booking.date} at ${booking.time}`,
    `Client: ${booking.name} (${booking.email}${booking.phone ? `, ${booking.phone}` : ''})`,
  ]
  return sendWhatsAppText(whatsappTeamNumber, lines.join('\n'))
}
