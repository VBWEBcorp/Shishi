import { Resend } from 'resend'

const API_KEY = process.env.RESEND_API_KEY
const FROM = process.env.RESEND_FROM || 'Shi Shi Samui <onboarding@resend.dev>'
const CONTACT_TO = process.env.CONTACT_TO_EMAIL || 'contact@shi-shi-samui.com'
/**
 * Expéditeur des AUTO-notifications internes (alerte « nouvelle réservation »).
 * Doit être DIFFÉRENT de CONTACT_TO : un email envoyé de contact@ vers contact@
 * (même adresse) est très souvent filtré/spammé par la messagerie. On envoie
 * donc depuis notifications@ (même domaine vérifié), avec reply-to = le client.
 */
const NOTIFICATIONS_FROM =
  process.env.RESEND_NOTIFICATIONS_FROM || 'Shi Shi Samui <notifications@shi-shi-samui.com>'

/** Resend est "câblé" dès qu'une clé API est présente. */
export const emailEnabled = !!API_KEY

const resend = emailEnabled ? new Resend(API_KEY) : null

export const emailConfig = { from: FROM, contactTo: CONTACT_TO, notificationsFrom: NOTIFICATIONS_FROM }

type SendArgs = {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
  /** Expéditeur spécifique (par défaut RESEND_FROM). */
  from?: string
}

/**
 * Envoie un email via Resend. Ne jette jamais : renvoie { ok, id?, error? }
 * pour que l'appelant décide quoi faire si Resend n'est pas configuré.
 */
export async function sendEmail({ to, subject, html, replyTo, from }: SendArgs) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY manquante — email non envoyé:', subject)
    return { ok: false as const, skipped: true as const, error: 'email-not-configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: from || FROM,
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

/**
 * Envoi groupé (newsletter) via l'API batch de Resend — chaque message peut
 * avoir son propre destinataire/contenu (donc une personnalisation par
 * personne). Resend accepte jusqu'à 100 emails par appel batch.
 */
export async function sendBatch(messages: SendArgs[]) {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY manquante — envoi groupé ignoré')
    return { ok: false as const, skipped: true as const, error: 'email-not-configured', sent: 0 }
  }
  if (messages.length === 0) return { ok: true as const, sent: 0 }

  try {
    const { error } = await resend.batch.send(
      messages.map((m) => ({
        from: FROM,
        to: m.to,
        subject: m.subject,
        html: m.html,
        ...(m.replyTo ? { replyTo: m.replyTo } : {}),
      }))
    )
    if (error) {
      console.error('[email] Resend batch error:', error)
      return { ok: false as const, error: error.message, sent: 0 }
    }
    return { ok: true as const, sent: messages.length }
  } catch (err) {
    console.error('[email] batch send failed:', err)
    return { ok: false as const, error: 'send-failed', sent: 0 }
  }
}
