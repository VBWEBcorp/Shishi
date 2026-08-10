import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { emailConfig, emailEnabled, sendBatch, sendEmail } from '@/lib/email'
import { personalize, renderNewsletter, type NewsletterLang } from '@/lib/newsletter-template'
import { Contact, type IContact } from '@/models/Contact'
import { siteConfig } from '@/lib/seo'

/** Limite par envoi (plan Resend gratuit ≈ 100/jour, batch ≤ 100). */
const MAX_PER_SEND = 100

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!emailEnabled) {
      return NextResponse.json({ error: 'email-not-configured' }, { status: 503 })
    }

    const data = await request.json()
    const subject = String(data.subject || '').trim()
    const message = String(data.body || '').trim()
    const lang: NewsletterLang = data.lang === 'en' ? 'en' : 'fr'
    const imageUrl = data.imageUrl ? String(data.imageUrl) : undefined
    const buttonText = data.buttonText ? String(data.buttonText) : undefined
    const buttonLink = data.buttonLink ? String(data.buttonLink) : undefined

    if (!subject || !message) {
      return NextResponse.json({ error: 'missing-content' }, { status: 400 })
    }

    const base = siteConfig.url.replace(/\/$/, '')

    // Une image uploadée peut avoir une URL relative (/api/media/…) : on la rend
    // absolue pour qu'elle s'affiche dans les emails.
    const absImageUrl = imageUrl && imageUrl.startsWith('/') ? `${base}${imageUrl}` : imageUrl

    // ── Envoi de test : un seul email vers l'adresse choisie (ou, à défaut,
    // l'adresse de l'entreprise). Permet de tester la délivrabilité sur une
    // boîte qui reçoit (ex. contact@vbweb.fr). ──
    if (data.test === true) {
      const rawTest = typeof data.testEmail === 'string' ? data.testEmail.trim() : ''
      const validTest = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawTest)
      const testTo = validTest ? rawTest : emailConfig.contactTo
      const html = renderNewsletter({
        body: message,
        lang,
        imageUrl: absImageUrl,
        buttonText,
        buttonLink,
        name: 'Test',
        unsubUrl: `${base}/api/newsletter/unsubscribe?token=preview`,
      })
      const res = await sendEmail({
        to: testTo,
        subject: `[TEST] ${personalize(subject, 'Test', lang)}`,
        html,
      })
      return NextResponse.json({ ok: res.ok, test: true, to: testTo, error: res.ok ? undefined : res.error })
    }

    // ── Envoi réel ──
    const emails: string[] = Array.isArray(data.emails) ? data.emails.map(String) : []
    if (emails.length === 0) {
      return NextResponse.json({ error: 'no-recipients' }, { status: 400 })
    }

    await connectDB()
    const contacts = (await Contact.find({ email: { $in: emails } }).lean()) as unknown as IContact[]

    // Sécurité : on n'écrit JAMAIS à un contact désinscrit.
    const eligible = contacts.filter((c) => !c.unsubscribedAt && c.email)
    const skippedUnsub = contacts.length - eligible.length
    const capped = eligible.slice(0, MAX_PER_SEND)

    const messages = capped.map((c) => ({
      to: c.email,
      subject: personalize(subject, c.name, lang),
      html: renderNewsletter({
        body: message,
        lang,
        imageUrl: absImageUrl,
        buttonText,
        buttonLink,
        name: c.name,
        unsubUrl: `${base}/api/newsletter/unsubscribe?token=${c.unsubscribeToken || ''}`,
      }),
    }))

    const result = await sendBatch(messages)

    return NextResponse.json({
      ok: result.ok,
      sent: result.ok ? messages.length : 0,
      requested: emails.length,
      eligible: eligible.length,
      skippedUnsub,
      capped: eligible.length > MAX_PER_SEND ? eligible.length - MAX_PER_SEND : 0,
      error: result.ok ? undefined : result.error,
    })
  } catch (error) {
    console.error('Newsletter send error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
