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

/* ─────────────── Briques de design (DA accueil : noir #111 + orange #D95A00) ─────────────── */

const ACCENT = '#D95A00'
const INK = '#1c1917'
const MUTED = '#9b9794'
const LINE = '#f0efee'
const PANEL = '#fafaf9'

/** Coquille HTML de marque : logo en en-tête noir, filet orange, carte blanche, pied discret. */
function shell(lang: Lang, inner: string, preheader = ''): string {
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="x-apple-disable-message-reformatting"/></head>
  <body style="margin:0;padding:0;background:#f5f5f4;-webkit-font-smoothing:antialiased;font-family:'Poppins',-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:${INK}">
    ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#f5f5f4">${esc(preheader)}</div>` : ''}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f4">
      <tr><td align="center" style="padding:32px 16px">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;box-shadow:0 16px 48px -24px rgba(0,0,0,.22)">
          <tr><td style="background:#111111;padding:22px 32px">
            <img src="${siteConfig.url}/logo-light.png" alt="${esc(siteConfig.name)}" height="40" style="display:block;height:40px;width:auto;border:0;outline:none;text-decoration:none"/>
          </td></tr>
          <tr><td style="height:4px;line-height:4px;font-size:0;background:${ACCENT}">&nbsp;</td></tr>
          <tr><td style="padding:32px;font-size:15px;line-height:1.65;color:${INK}">${inner}</td></tr>
          <tr><td style="padding:22px 32px;border-top:1px solid ${LINE};background:${PANEL}">
            <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:${INK}">${esc(siteConfig.name)}</p>
            <p style="margin:0;font-size:12px;line-height:1.6;color:${MUTED}">${esc(`${siteConfig.address.street}, ${siteConfig.address.city}, Thailand`)}<br/>${esc(siteConfig.phone)} · ${esc(siteConfig.email)}</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`
}

function eyebrow(text: string): string {
  return `<p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:${ACCENT}">${esc(text)}</p>`
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;font-weight:700;letter-spacing:-.01em;color:#111111">${esc(text)}</h1>`
}

function p(text: string): string {
  return `<p style="margin:0 0 14px;line-height:1.65;color:${INK}">${text}</p>`
}

/** Tableau « libellé / valeur » dans un panneau gris doux, séparateurs fins. */
function detailRows(rows: [string, string][]): string {
  const body = rows
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([k, v], i) => {
      const top = i > 0 ? `;border-top:1px solid ${LINE}` : ''
      return `<tr><td style="padding:10px 0;color:${MUTED};font-size:13px;width:118px;vertical-align:top${top}">${esc(k)}</td><td style="padding:10px 0;color:${INK};font-size:14px;font-weight:600;vertical-align:top;word-break:break-word${top}">${esc(v)}</td></tr>`
    })
    .join('')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${PANEL};border:1px solid ${LINE};border-radius:14px;margin:18px 0"><tr><td style="padding:2px 18px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">${body}</table></td></tr></table>`
}

/** Bloc « adresse du lieu » (mêmes lignes que la page Contact). */
function venueBlock(label: string): string {
  const a = siteConfig.address
  const lines = [siteConfig.name, `${a.street}, ${a.city}`, `${a.region} ${a.postalCode}, Thailand`]
    .map(esc)
    .join('<br/>')
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:${PANEL};border:1px solid ${LINE};border-radius:14px;margin:18px 0"><tr><td style="padding:14px 18px"><p style="margin:0 0 5px;color:${MUTED};font-size:13px">${esc(label)}</p><p style="margin:0;color:${INK};font-size:14px;font-weight:600;line-height:1.55">${lines}</p></td></tr></table>`
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0 2px"><tr><td style="border-radius:12px;background:${ACCENT};box-shadow:0 10px 24px -10px rgba(217,90,0,.6)"><a href="${esc(href)}" style="display:inline-block;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:13px 28px;border-radius:12px">${esc(label)}</a></td></tr></table>`
}

/** Lignes « horaire » : heure + durée, ou « Accès à la journée » pour un pass journée. */
function scheduleRows(b: BookingEmailData, lang: Lang): [string, string][] {
  if (b.dayPass) {
    return [[lang === 'fr' ? 'Formule' : 'Plan', lang === 'fr' ? 'Accès à la journée' : 'Day access']]
  }
  const rows: [string, string][] = [[lang === 'fr' ? 'Heure' : 'Time', b.time]]
  if (b.duration) rows.push([lang === 'fr' ? 'Durée' : 'Duration', `${b.duration} min`])
  return rows
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
  return `<p style="margin:16px 0 6px;font-weight:600;color:${INK}">Participants additionnels</p><ul style="margin:0 0 4px;padding-left:18px;color:${INK};font-size:14px;line-height:1.5">${items}</ul>`
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
          eyebrow: 'Réservation',
          title: 'Votre demande est bien reçue',
          hi: `Bonjour ${first},`,
          intro: 'Nous avons bien reçu votre demande de réservation. Voici le récapitulatif :',
          outro: 'Nous revenons vers vous très vite pour confirmer. À très bientôt chez Shi Shi Samui ! 🌴',
          contact: 'Nous contacter',
          rActivity: 'Activité',
          rDate: 'Date',
          rTime: 'Heure',
          rDuration: 'Durée',
        }
      : {
          subject: `Your ${b.activityName} booking on ${dateStr}`,
          preheader: "We've received your request. Here is your booking summary.",
          eyebrow: 'Booking',
          title: "We've received your request",
          hi: `Hi ${first},`,
          intro: "We've received your booking request. Here are the details:",
          outro: "We'll get back to you shortly to confirm. See you soon at Shi Shi Samui! 🌴",
          contact: 'Contact us',
          rActivity: 'Activity',
          rDate: 'Date',
          rTime: 'Time',
          rDuration: 'Duration',
        }

  const rows: [string, string][] = [
    [t.rActivity, b.activityName],
    [t.rDate, dateStr],
    ...scheduleRows(b, lang),
    [lang === 'fr' ? 'Personnes' : 'People', b.partySize && b.partySize > 1 ? String(b.partySize) : ''],
  ]

  const inner =
    eyebrow(t.eyebrow) +
    heading(t.title) +
    p(t.hi) +
    p(t.intro) +
    detailRows(rows) +
    p(t.outro) +
    button(`${siteConfig.url}/${lang}/contact-location`, t.contact)

  return sendEmail({ to: b.email, subject: subjectSafe(t.subject), html: shell(lang, inner, t.preheader) })
}

/* ─────────────── Alerte interne (entreprise) — toujours en français ─────────────── */
async function sendAdminBookingAlert(b: BookingEmailData) {
  const dateStr = fmtDate(b.date, 'fr')
  const langLabel = asLang(b.locale) === 'fr' ? 'Français' : 'Anglais'

  const rows: [string, string][] = [
    ['Activité', b.activityName],
    ['Date', dateStr],
    ...scheduleRows(b, 'fr'),
    ['Personnes', b.partySize && b.partySize > 1 ? String(b.partySize) : ''],
    ['Client', b.name],
    ['Email', b.email],
    ['Téléphone', b.phone || ''],
    ['Remarques', b.notes || ''],
    ['Langue', langLabel],
  ]

  const inner =
    eyebrow('Nouvelle demande') +
    heading('Nouvelle réservation') +
    p('Un client vient de réserver un créneau :') +
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
          eyebrow: 'Rappel',
          title: 'Votre session est dans 1h',
          hi: `Bonjour ${first},`,
          intro: 'Petit rappel : votre session est prévue dans 1h. Voici les détails :',
          outro: 'On vous attend, à tout à l’heure ! 🌴',
          addr: 'Adresse du lieu',
          directions: 'Voir l’itinéraire',
          rActivity: 'Activité',
          rDate: 'Date',
          rTime: 'Heure',
          rDuration: 'Durée',
        }
      : {
          subject: `Reminder: your ${b.activityName} session is in 1 hour`,
          preheader: 'Your session starts in 1 hour. Address and details inside.',
          eyebrow: 'Reminder',
          title: 'Your session is in 1 hour',
          hi: `Hi ${first},`,
          intro: 'A quick reminder: your session is in 1 hour. Here are the details:',
          outro: 'See you very soon! 🌴',
          addr: 'Venue address',
          directions: 'Get directions',
          rActivity: 'Activity',
          rDate: 'Date',
          rTime: 'Time',
          rDuration: 'Duration',
        }

  const rows: [string, string][] = [
    [t.rActivity, b.activityName],
    [t.rDate, dateStr],
    ...scheduleRows(b, lang),
  ]

  const inner =
    eyebrow(t.eyebrow) +
    heading(t.title) +
    p(t.hi) +
    p(t.intro) +
    detailRows(rows) +
    venueBlock(t.addr) +
    p(t.outro) +
    button(mapsDirectionsUrl, t.directions)

  return sendEmail({ to: b.email, subject: subjectSafe(t.subject), html: shell(lang, inner, t.preheader) })
}
