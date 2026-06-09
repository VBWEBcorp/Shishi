import { Resend } from 'resend'

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM || 'Shi Shi Samui <onboarding@resend.dev>'
const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'contact.shishisamui@gmail.com'

/** Resend est "câblé" dès qu'une clé API est présente. */
export const emailEnabled = !!API_KEY

const resend = emailEnabled ? new Resend(API_KEY) : null

export const emailConfig = { from: FROM, contactTo: CONTACT_TO }

type SendArgs = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

/**
 * Envoie un email via Resend. Ne jette jamais : renvoie { ok, id?, error? }
 * pour que l'appelant décide quoi faire si Resend n'est pas configuré.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendArgs) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY manquante — email non envoyé:', subject)
    return { ok: false as const, skipped: true as const, error: 'email-not-configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    })
    if (error) {
      console.error('[email] Resend error:', error)
      return { ok: false as const, error: error.message }
    }
    return { ok: true as const, id: data?.id }
  } catch (err) {
    console.error('[email] send failed:', err)
    return { ok: false as const, error: 'send-failed' }
  }
}
