import { siteConfig } from '@/lib/seo'

export type NewsletterLang = 'fr' | 'en'

export interface NewsletterContent {
  body: string
  lang: NewsletterLang
  imageUrl?: string
  buttonText?: string
  buttonLink?: string
  unsubUrl: string
  /** Nom du destinataire (pour {prenom} / {nom}). */
  name?: string
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Remplace {prenom} / {nom} puis échappe le HTML. */
export function personalize(text: string, name: string | undefined, lang: NewsletterLang): string {
  const full = (name || '').trim()
  const first = full.split(/\s+/)[0] || (lang === 'en' ? 'there' : 'client')
  return escapeHtml(text).replace(/\{prenom\}/gi, escapeHtml(first)).replace(/\{nom\}/gi, escapeHtml(full || first))
}

/**
 * Rend le HTML complet d'un email newsletter — SOURCE UNIQUE utilisée à la
 * fois par l'envoi (API) et par l'aperçu (admin), pour un rendu identique.
 */
export function renderNewsletter({ body, lang, imageUrl, buttonText, buttonLink, unsubUrl, name }: NewsletterContent): string {
  const ACCENT = '#D95A00'
  const INK = '#1c1917'
  const MUTED = '#9b9794'
  const LINE = '#f0efee'
  const PANEL = '#fafaf9'

  const paragraphs = personalize(body, name, lang)
    .split(/\n{2,}/)
    .map((par) => `<p style="margin:0 0 16px;line-height:1.7;color:${INK}">${par.replace(/\n/g, '<br/>')}</p>`)
    .join('')

  const image = imageUrl
    ? `<tr><td style="padding:0"><img src="${escapeHtml(imageUrl)}" alt="" width="560" style="display:block;width:100%;height:auto;border:0"/></td></tr>`
    : ''

  const button =
    buttonText && buttonLink
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:10px 0 2px"><tr><td style="border-radius:12px;background:${ACCENT};box-shadow:0 10px 24px -10px rgba(217,90,0,.6)"><a href="${escapeHtml(buttonLink)}" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px">${personalize(buttonText, name, lang)}</a></td></tr></table>`
      : ''

  const footerNote =
    lang === 'en'
      ? `You receive this email as a contact of ${escapeHtml(siteConfig.name)}.`
      : `Vous recevez cet email en tant que contact de ${escapeHtml(siteConfig.name)}.`
  const unsubLabel = lang === 'en' ? 'Unsubscribe' : 'Se désinscrire'

  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="x-apple-disable-message-reformatting"/></head>
  <body style="margin:0;padding:0;background:#f5f5f4;-webkit-font-smoothing:antialiased;font-family:'Poppins',-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;box-shadow:0 16px 48px -24px rgba(0,0,0,.22)">
          <tr><td style="background:#111111;padding:22px 32px">
            <img src="${siteConfig.url}/logo-light.png" alt="${escapeHtml(siteConfig.name)}" height="40" style="display:block;height:40px;width:auto;border:0;outline:none;text-decoration:none"/>
          </td></tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background:${ACCENT}">&nbsp;</td></tr>
          ${image}
          <tr><td style="padding:32px;font-size:15px;color:${INK}">${paragraphs}${button}</td></tr>
          <tr><td style="padding:22px 32px;border-top:1px solid ${LINE};background:${PANEL};font-size:12px;line-height:1.6;color:${MUTED}">
            ${footerNote}<br/>
            <a href="${escapeHtml(unsubUrl)}" style="color:${MUTED};text-decoration:underline">${unsubLabel}</a>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}
