import { NextRequest, NextResponse } from 'next/server'

import { connectDB } from '@/lib/db'
import { Contact } from '@/models/Contact'
import { siteConfig } from '@/lib/seo'

/** Page HTML minimale de confirmation (publique, sans dépendance). */
function page(title: string, message: string): NextResponse {
  const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="robots" content="noindex"/>
  <title>${title} — ${siteConfig.name}</title></head>
  <body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f4f4f5;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#111">
    <div style="max-width:440px;margin:24px;padding:32px;background:#fff;border:1px solid #ececec;border-radius:16px;text-align:center">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px">${siteConfig.name}</div>
      <h1 style="font-size:20px;margin:0 0 8px">${title}</h1>
      <p style="color:#666;line-height:1.6;margin:0">${message}</p>
    </div>
  </body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

/** Désinscription en 1 clic via le jeton du contact (lien dans les emails). */
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get('token') || ''

  if (token === 'preview') {
    return page('Aperçu', 'Ceci est un lien de désinscription de démonstration.')
  }
  if (!token) {
    return page('Lien invalide', 'Ce lien de désinscription est incomplet.')
  }

  try {
    await connectDB()
    const contact = await Contact.findOne({ unsubscribeToken: token })
    if (!contact) {
      return page('Lien invalide', 'Ce lien de désinscription n’est plus valide.')
    }
    if (!contact.unsubscribedAt) {
      contact.unsubscribedAt = new Date()
      contact.newsletterOptIn = false
      await contact.save()
    }
    return page(
      'Désinscription confirmée',
      'Vous ne recevrez plus nos emails. Vous pouvez fermer cette page.'
    )
  } catch (error) {
    console.error('Unsubscribe error:', error)
    return page('Erreur', 'Une erreur est survenue. Merci de réessayer plus tard.')
  }
}
