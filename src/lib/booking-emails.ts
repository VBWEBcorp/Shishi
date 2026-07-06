import { emailConfig, sendEmail } from '@/lib/email'
import { mapsDirectionsUrl, siteConfig } from '@/lib/seo'

type Lang = 'en' | 'fr'

export interface BookingEmailData {
  name: string
  email: string
  activityName: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  duration?: number
  phone?: string
  notes?: string
  locale?: Lang
  /** Accès à la journée (salle de sport, piscine) → « Accès à la journée » au lieu de l'heure. */
  dayPass?: boolean
  /** Nombre total de participants (titulaire inclus). */
  partySize?: number
  /** Participants additionnels (hors titulaire). */
  participants?: { name: string; email: string; phone?: string }[]
}

function esc(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function asLang(l?: string): Lang {
  return l === 'fr' ? 'fr' : 'en'
}

/** Sujet d'email : on retire tout retour-ligne (anti-injection d'en-tête). */
function subjectSafe(s: string): string {
  return String(s).replace(/[\r\n]+/g, ' ').trim()
}

function firstName(name: string, lang: Lang): string {
  const full = (name || '').trim()
  return full.split(/\s+/)[0] || (lang === 'en' ? 'there' : 'à vous')
}

/** Majuscule initiale (ex. « dimanche 12 juillet » → « Dimanche 12 juillet »). */
function cap(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s
}

/** Date lisible, sans dérive de fuseau (parse à midi). */
function fmtDate(date: string, lang: Lang): string {
  const d = new Date(`${date}T12:00:00`)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/** Libellé horaire : heure, ou « Accès à la journée » pour un pass journée. */
function timeLabel(b: BookingEmailData, lang: Lang): string {
  if (b.dayPass) return lang === 'fr' ? 'Accès à la journée' : 'Day access'
  return b.time
}

/* ─────────────── Briques de design (DA accueil : noir #111 + orange #D95A00) ─────────────── */

const ACCENT = '#D95A00'
const ACCENT_2 = '#F08A2E' // orange clair (dégradés)
const ACCENT_DARK = '#B24800'
const ACCENT_SOFT = '#FCEEE3' // fond orangé très doux (badges, cartes)
const INK = '#1c1917'
const BODY = '#57534e'
const MUTED = '#9b9794'
const LINE = '#eeecea'
const PANEL = '#fafaf9'
const PAGE_BG = '#f4f2f0'

function footerLink(href: string, label: string): string {
  return `<a href="${esc(href)}" style="display:inline-block;font-size:12px;font-weight:600;color:${ACCENT};text-decoration:none">${esc(label)}</a>`
}

/** Coquille HTML de marque : header noir centré + tagline, filet orange, carte blanche, footer réseaux. */
function shell(lang: Lang, inner: string, preheader = ''): string {
  const year = new Date().getFullYear()
  const a = siteConfig.address
  const sep = ' <span style="color:#d6d3d1">·</span> '
  const rights = lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'
  const disclaimer =
    lang === 'fr'
      ? 'Vous recevez cet email suite à une interaction avec Shi Shi Samui.'
      : 'You are receiving this email following an interaction with Shi Shi Samui.'
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="x-apple-disable-message-reformatting"/><meta name="color-scheme" content="light"/><meta name="supported-color-schemes" content="light"/><!--[if mso]><style>*{font-family:Arial,Helvetica,sans-serif!important}</style><![endif]--></head>
  <body style="margin:0;padding:0;background:${PAGE_BG};-webkit-font-smoothing:antialiased;font-family:'Poppins',-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${PAGE_BG}">${esc(preheader)}&#8199;&#8199;&#8199;&#8199;&#8199;&#8199;&#8199;&#8199;&#8199;&#8199;</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAGE_BG}">
      <tr><td align="center" style="padding:32px 14px 40px">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden;border:1px solid #e7e5e4;box-shadow:0 20px 60px -30px rgba(28,25,23,.35)">
          <tr><td align="center" bgcolor="#111111" style="background:#111111;background-image:linear-gradient(135deg,#211d1b 0%,#111111 55%,#2b2320 100%);padding:30px 32px 26px">
            <img src="${siteConfig.url}/logo-light.png" alt="${esc(siteConfig.name)}" height="44" style="display:block;height:44px;width:auto;border:0;outline:none;text-decoration:none;margin:0 auto"/>
            <p style="margin:14px 0 0;font-size:11px;font-weight:600;letter-spacing:.28em;text-transform:uppercase;color:#c9b9ad">Lamai &middot; Koh Samui</p>
          </td></tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background:${ACCENT};background-image:linear-gradient(90deg,${ACCENT} 0%,${ACCENT_2} 100%)">&nbsp;</td></tr>
          <tr><td style="padding:36px 34px 30px;font-size:15px;line-height:1.65;color:${BODY}">${inner}</td></tr>
          <tr><td style="padding:26px 34px 30px;border-top:1px solid ${LINE};background:${PANEL}">
            <p style="margin:0 0 10px;font-size:14px;font-weight:700;color:${INK}">${esc(siteConfig.name)}</p>
            <p style="margin:0 0 14px;font-size:12.5px;line-height:1.7;color:${MUTED}">${esc(`${a.street}, ${a.city}, ${a.region} ${a.postalCode}, Thailand`)}<br/><a href="tel:${esc(siteConfig.phone.replace(/\s/g, ''))}" style="color:${MUTED};text-decoration:none">${esc(siteConfig.phone)}</a> &middot; <a href="mailto:${esc(siteConfig.email)}" style="color:${MUTED};text-decoration:none">${esc(siteConfig.email)}</a></p>
            <p style="margin:0 0 16px;font-size:12px">${footerLink(siteConfig.instagram, 'Instagram')}${sep}${footerLink(siteConfig.facebook, 'Facebook')}${sep}${footerLink(`https://wa.me/${siteConfig.whatsapp}`, 'WhatsApp')}${sep}${footerLink(siteConfig.url, lang === 'fr' ? 'Site web' : 'Website')}</p>
            <p style="margin:0;font-size:11px;color:${MUTED}">&copy; ${year} ${esc(siteConfig.name)}. ${rights}</p>
          </td></tr>
        </table>
        <p style="margin:18px auto 0;max-width:600px;font-size:11px;line-height:1.6;color:#a8a29e">${disclaimer}</p>
      </td></tr>
    </table>
  </body></html>`
}

/** Badge de statut arrondi (ex. « ✓ Demande reçue »). tone: accent (orange) | success (vert). */
function statusPill(text: string, tone: 'accent' | 'success' = 'accent'): string {
  const bg = tone === 'success' ? '#e7f6ec' : ACCENT_SOFT
  const fg = tone === 'success' ? '#1a7f43' : ACCENT_DARK
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 16px"><tr><td style="background:${bg};border-radius:999px;padding:7px 15px;font-size:12px;font-weight:700;letter-spacing:.02em;color:${fg}">${esc(text)}</td></tr></table>`
}

function eyebrow(text: string): string {
  return `<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${ACCENT}">${esc(text)}</p>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:24px;line-height:1.28;font-weight:700;letter-spacing:-.015em;color:#111111">${esc(text)}</h1>`
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;line-height:1.68;color:${BODY}">${text}</p>`
}

/** Carte « hero » : met en avant l'activité + la date + l'heure (barre orange à gauche). */
function heroCard(activityName: string, dateStr: string, time: string, lang: Lang): string {
  const kicker = lang === 'fr' ? 'Votre réservation' : 'Your booking'
  const dLabel = lang === 'fr' ? 'Date' : 'Date'
  const tLabel = lang === 'fr' ? 'Heure' : 'Time'
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;margin:6px 0 20px">
    <tr>
      <td width="5" style="width:5px;background:${ACCENT};background-image:linear-gradient(180deg,${ACCENT},${ACCENT_2});font-size:0;line-height:0">&nbsp;</td>
      <td style="background:${PANEL};border:1px solid ${LINE};border-left:0;border-radius:0 16px 16px 0;padding:20px 22px">
        <p style="margin:0 0 5px;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:${ACCENT}">${esc(kicker)}</p>
        <p style="margin:0 0 16px;font-size:19px;font-weight:700;line-height:1.25;color:${INK}">${esc(activityName)}</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
          <td style="vertical-align:top;padding-right:14px">
            <p style="margin:0 0 3px;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:${MUTED}">${esc(dLabel)}</p>
            <p style="margin:0;font-size:15px;font-weight:700;line-height:1.35;color:${INK}">${esc(cap(dateStr))}</p>
          </td>
          <td width="42%" style="width:42%;vertical-align:top;border-left:1px solid ${LINE};padding-left:16px">
            <p style="margin:0 0 3px;font-size:11px;font-weight:600;letter-spacing:.05em;text-transform:uppercase;color:${MUTED}">${esc(tLabel)}</p>
            <p style="margin:0;font-size:15px;font-weight:700;line-height:1.35;color:${INK}">${esc(time)}</p>
          </td>
        </tr></table>
      </td>
    </tr>
  </table>`
}

/** Tableau « libellé / valeur » dans un panneau gris doux, séparateurs fins. Vide si aucune ligne. */
function detailRows(rows: [string, string][]): string {
  const kept = rows.filter(([, v]) => v != null && String(v).trim() !== '')
  if (kept.length === 0) return ''
  const body = kept
    .map(([k, v], i) => {
      const top = i > 0 ? `border-top:1px solid ${LINE};` : ''
      return `<tr><td style="${top}padding:11px 0;color:${MUTED};font-size:12px;font-weight:600;letter-spacing:.03em;text-transform:uppercase;width:130px;vertical-align:top">${esc(k)}</td><td style="${top}padding:11px 0;color:${INK};font-size:14.5px;font-weight:600;vertical-align:top;word-break:break-word">${esc(v)}</td></tr>`
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${PANEL};border:1px solid ${LINE};border-radius:16px;margin:16px 0"><tr><td style="padding:4px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${body}</table></td></tr></table>`
}

/** Bloc « adresse du lieu » (mêmes lignes que la page Contact). */
function venueBlock(label: string): string {
  const a = siteConfig.address
  const lines = [siteConfig.name, `${a.street}, ${a.city}`, `${a.region} ${a.postalCode}, Thailand`]
    .map(esc)
    .join('<br/>')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${PANEL};border:1px solid ${LINE};border-radius:16px;margin:16px 0"><tr><td style="padding:16px 20px"><p style="margin:0 0 6px;color:${ACCENT};font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase">${esc(label)}</p><p style="margin:0;color:${INK};font-size:14px;font-weight:600;line-height:1.6">${lines}</p></td></tr></table>`
}

/** Bouton principal « bulletproof » (dégradé orange, repli solide sur Outlook). */
function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 4px"><tr><td align="center" bgcolor="${ACCENT}" style="border-radius:12px;background:${ACCENT};background-image:linear-gradient(180deg,#EA6A12,${ACCENT});box-shadow:0 12px 26px -12px rgba(217,90,0,.6)"><a href="${esc(href)}" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1;padding:15px 30px;border-radius:12px;mso-padding-alt:15px 30px">${esc(label)}</a></td></tr></table>`
}

/** Bloc « participants additionnels » (alerte interne). */
function participantsBlock(participants?: { name: string; email: string; phone?: string }[]): string {
  if (!participants?.length) return ''
  const items = participants
    .map(
      (pp) =>
        `<li style="margin:0 0 5px">${esc(pp.name)} — <a href="mailto:${esc(pp.email)}" style="color:${ACCENT};text-decoration:none">${esc(pp.email)}</a>${pp.phone ? ` · ${esc(pp.phone)}` : ''}</li>`
    )
    .join('')
  return `<p style="margin:18px 0 6px;font-weight:700;font-size:13px;letter-spacing:.03em;text-transform:uppercase;color:${MUTED}">Participants additionnels</p><ul style="margin:0 0 4px;padding-left:18px;color:${INK};font-size:14px;line-height:1.6">${items}</ul>`
}

/* ─────────────── Confirmation client (langue du client) ─────────────── */
async function sendBookingConfirmation(b: BookingEmailData) {
  const lang = asLang(b.locale)
  const dateStr = fmtDate(b.date, lang)
  const first = esc(firstName(b.name, lang))

  const t =
    lang === 'fr'
      ? {
          subject: `Votre réservation ${b.activityName} du ${dateStr}`,
          preheader: 'Nous avons bien reçu votre demande. Voici le récapitulatif.',
          pill: '✓ Demande reçue',
          title: 'Votre demande est bien reçue',
          hi: `Bonjour ${first},`,
          intro: 'Nous avons bien reçu votre demande de réservation. Voici le récapitulatif :',
          outro:
            'Nous revenons vers vous très vite pour confirmer. À très bientôt chez Shi Shi Samui ! 🌴',
          contact: 'Nous contacter',
          rDuration: 'Durée',
          rPeople: 'Personnes',
        }
      : {
          subject: `Your ${b.activityName} booking on ${dateStr}`,
          preheader: "We've received your request. Here is your booking summary.",
          pill: '✓ Request received',
          title: "We've received your request",
          hi: `Hi ${first},`,
          intro: "We've received your booking request. Here are the details:",
          outro: "We'll get back to you shortly to confirm. See you soon at Shi Shi Samui! 🌴",
          contact: 'Contact us',
          rDuration: 'Duration',
          rPeople: 'People',
        }

  const secondary: [string, string][] = [
    [t.rDuration, !b.dayPass && b.duration ? `${b.duration} min` : ''],
    [t.rPeople, b.partySize && b.partySize > 1 ? String(b.partySize) : ''],
  ]

  const inner =
    statusPill(t.pill) +
    heading(t.title) +
    p(t.hi) +
    p(t.intro) +
    heroCard(b.activityName, dateStr, timeLabel(b, lang), lang) +
    detailRows(secondary) +
    p(t.outro) +
    button(`${siteConfig.url}/${lang}/contact-location`, t.contact)

  return sendEmail({ to: b.email, subject: subjectSafe(t.subject), html: shell(lang, inner, t.preheader) })
}

/* ─────────────── Alerte interne (entreprise) — toujours en français ─────────────── */
async function sendAdminBookingAlert(b: BookingEmailData) {
  const dateStr = fmtDate(b.date, 'fr')
  const langLabel = asLang(b.locale) === 'fr' ? 'Français' : 'Anglais'

  const rows: [string, string][] = [
    ['Personnes', b.partySize && b.partySize > 1 ? String(b.partySize) : '1'],
    ['Client', b.name],
    ['Email', b.email],
    ['Téléphone', b.phone || ''],
    ['Remarques', b.notes || ''],
    ['Langue', langLabel],
  ]

  const inner =
    statusPill('🔔 Nouvelle réservation') +
    heading('Nouvelle réservation') +
    p('Un client vient de réserver un créneau :') +
    heroCard(b.activityName, dateStr, timeLabel(b, 'fr'), 'fr') +
    detailRows(rows) +
    participantsBlock(b.participants) +
    button(`${siteConfig.url}/admin/bookings`, 'Voir la réservation')

  return sendEmail({
    to: emailConfig.contactTo,
    // Expéditeur ≠ destinataire (notifications@ et non contact@) pour éviter le
    // filtrage « envoi à soi-même ». On répond directement au client (reply-to).
    from: emailConfig.notificationsFrom,
    subject: subjectSafe(`Nouvelle réservation : ${b.activityName}, ${dateStr} à ${b.time}`),
    html: shell('fr', inner, `${b.name} · ${b.activityName} · ${dateStr} à ${b.time}`),
    replyTo: b.email,
  })
}

/**
 * Envoyé à la création d'une réservation : confirmation au client (sa langue)
 * + alerte à l'entreprise. Envois SÉQUENTIELS (pas en parallèle) car Resend
 * limite à ~2 requêtes/seconde : deux envois simultanés peuvent faire échouer
 * le second. Best-effort : ne jette jamais, et journalise chaque échec.
 */
export async function notifyNewBooking(b: BookingEmailData) {
  const client = await sendBookingConfirmation(b).catch((e) => {
    console.error('[booking-emails] confirmation client — exception:', e)
    return { ok: false as const, error: 'exception' }
  })
  if (!client?.ok) console.warn('[booking-emails] confirmation client non envoyée:', client)

  const admin = await sendAdminBookingAlert(b).catch((e) => {
    console.error('[booking-emails] alerte interne — exception:', e)
    return { ok: false as const, error: 'exception' }
  })
  if (!admin?.ok) console.warn('[booking-emails] alerte interne non envoyée:', admin)

  return { client, admin }
}

/* ─────────────── Rappel « 1 h avant » (langue du client) ─────────────── */
export async function sendBookingReminder(b: BookingEmailData) {
  const lang = asLang(b.locale)
  const dateStr = fmtDate(b.date, lang)
  const first = esc(firstName(b.name, lang))

  const t =
    lang === 'fr'
      ? {
          subject: `Rappel : votre session ${b.activityName} est dans 1h`,
          preheader: 'Votre session commence dans 1h. Adresse et détails à l’intérieur.',
          pill: '⏰ Dans 1 heure',
          title: 'Votre session est dans 1h',
          hi: `Bonjour ${first},`,
          intro: 'Petit rappel : votre session est prévue dans 1h. Voici les détails :',
          outro: 'On vous attend, à tout à l’heure ! 🌴',
          addr: 'Adresse du lieu',
          directions: 'Voir l’itinéraire',
        }
      : {
          subject: `Reminder: your ${b.activityName} session is in 1 hour`,
          preheader: 'Your session starts in 1 hour. Address and details inside.',
          pill: '⏰ In 1 hour',
          title: 'Your session is in 1 hour',
          hi: `Hi ${first},`,
          intro: 'A quick reminder: your session is in 1 hour. Here are the details:',
          outro: 'See you very soon! 🌴',
          addr: 'Venue address',
          directions: 'Get directions',
        }

  const inner =
    statusPill(t.pill) +
    heading(t.title) +
    p(t.hi) +
    p(t.intro) +
    heroCard(b.activityName, dateStr, timeLabel(b, lang), lang) +
    venueBlock(t.addr) +
    p(t.outro) +
    button(mapsDirectionsUrl, t.directions)

  return sendEmail({ to: b.email, subject: subjectSafe(t.subject), html: shell(lang, inner, t.preheader) })
}
