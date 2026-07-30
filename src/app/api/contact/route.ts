import { NextRequest, NextResponse } from 'next/server'
import { sendEmail, emailConfig } from '@/lib/email'
import { upsertContact } from '@/lib/contacts'

/** Échappe le HTML pour l'insertion sûre dans le corps de l'email. */
function esc(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Formulaire de contact public → email via Resend (comme les notifications de
 * réservation). L'expéditeur est l'adresse de notifications (domaine vérifié) et
 * `replyTo` est l'email du visiteur, pour répondre en un clic. Le message
 * alimente aussi le CRM (source « contact-form »), best-effort.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const name = String(body.name || '').trim().slice(0, 200)
    const email = String(body.email || '').trim().slice(0, 200)
    const message = String(body.message || '').trim().slice(0, 5000)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'missing-fields' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid-email' }, { status: 400 })
    }

    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;color:#111;line-height:1.6">
        <h2 style="margin:0 0 16px">Nouveau message de contact</h2>
        <p style="margin:0 0 4px"><strong>Nom :</strong> ${esc(name)}</p>
        <p style="margin:0 0 4px"><strong>Email :</strong> ${esc(email)}</p>
        <p style="margin:16px 0 4px"><strong>Message :</strong></p>
        <p style="margin:0;white-space:pre-wrap">${esc(message)}</p>
      </div>
    `.trim()

    const result = await sendEmail({
      to: emailConfig.contactTo,
      from: emailConfig.notificationsFrom,
      replyTo: email,
      subject: `Nouveau message de contact — ${name}`,
      html,
    })

    if (!result.ok) {
      // Email non configuré ou échec d'envoi → on le signale au front.
      return NextResponse.json({ error: 'send-failed' }, { status: 502 })
    }

    // CRM : ne doit jamais faire échouer l'envoi si l'upsert plante.
    try {
      await upsertContact({ email, name, source: 'contact-form' })
    } catch (e) {
      console.error('[contact] contact upsert failed:', e)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[contact] error:', error)
    return NextResponse.json({ error: 'server-error' }, { status: 500 })
  }
}
