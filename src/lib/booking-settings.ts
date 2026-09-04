import type { IBookingClosure } from '@/models/BookingSettings'

/**
 * Lecture et interprétation des réglages de réservation.
 *
 * Ce fichier ne parle pas à la base : il ne contient que la forme des réglages
 * et les règles de décision, pour être utilisable des deux côtés : le serveur
 * qui refuse une réservation fermée, et le navigateur qui affiche le message
 * WhatsApp à la place du formulaire. La lecture en base vit dans
 * `src/lib/booking-settings-server.ts`, réservée au serveur.
 */

export type ClosureRule = IBookingClosure

export interface BookingSettingsData {
  online: boolean
  activities: Record<string, boolean>
  closedNotice: { fr: string; en: string }
  closures: ClosureRule[]
}

/**
 * Réglages par défaut : réservation FERMÉE.
 *
 * Le défaut prudent est important. Si la base est injoignable ou le document
 * absent, mieux vaut renvoyer les visiteurs vers WhatsApp que d'accepter des
 * réservations dans un planning que personne ne surveille.
 */
export const DEFAUT: BookingSettingsData = {
  online: false,
  activities: {},
  closedNotice: { fr: '', en: '' },
  closures: [],
}

/** Message par défaut quand le club n'en a pas saisi un. */
export const NOTICE_DEFAUT = {
  fr: 'La réservation en ligne est momentanément fermée. Écrivez-nous sur WhatsApp, nous vous répondons directement.',
  en: 'Online booking is closed for the moment. Message us on WhatsApp and we will get straight back to you.',
} as const

/** Normalise n'importe quel document venu de la base vers la forme attendue. */
export function normaliser(brut: unknown): BookingSettingsData {
  const d = (brut ?? {}) as Partial<BookingSettingsData>
  return {
    online: d.online === true,
    activities:
      d.activities && typeof d.activities === 'object'
        ? (d.activities as Record<string, boolean>)
        : {},
    closedNotice: {
      fr: typeof d.closedNotice?.fr === 'string' ? d.closedNotice.fr : '',
      en: typeof d.closedNotice?.en === 'string' ? d.closedNotice.en : '',
    },
    closures: Array.isArray(d.closures)
      ? d.closures.filter(
          (c): c is ClosureRule =>
            !!c && typeof c.from === 'string' && typeof c.to === 'string'
        )
      : [],
  }
}

/** Une fermeture couvre-t-elle cette date, pour cette activité ? */
function couvre(c: ClosureRule, date: string, activitySlug?: string): boolean {
  if (c.activitySlug && activitySlug && c.activitySlug !== activitySlug) return false
  // Les bornes sont incluses, et le format "YYYY-MM-DD" se compare
  // alphabétiquement sans passer par un objet Date (donc sans fuseau horaire).
  const debut = c.from <= c.to ? c.from : c.to
  const fin = c.from <= c.to ? c.to : c.from
  return date >= debut && date <= fin
}

/** La réservation en ligne est-elle ouverte pour cette activité ? */
export function activiteOuverte(
  reglages: BookingSettingsData,
  activitySlug: string
): boolean {
  if (!reglages.online) return false
  // Absent de la table = ouvert : ajouter une activité au site ne doit pas la
  // rendre irréservable sans que personne ne l'ait décidé.
  return reglages.activities[activitySlug] !== false
}

/** La réservation est-elle ouverte pour cette activité À CETTE DATE ? */
export function creneauOuvert(
  reglages: BookingSettingsData,
  activitySlug: string,
  date: string
): boolean {
  if (!activiteOuverte(reglages, activitySlug)) return false
  return !reglages.closures.some((c) => couvre(c, date, activitySlug))
}

/** Une date est-elle fermée (club entier ou activité donnée) ? */
export function dateFermee(
  reglages: BookingSettingsData,
  date: string,
  activitySlug?: string
): boolean {
  return reglages.closures.some((c) => couvre(c, date, activitySlug))
}

/** Le message à afficher quand c'est fermé, dans la langue demandée. */
export function messageFermeture(
  reglages: BookingSettingsData,
  locale: string
): string {
  const l = locale === 'fr' ? 'fr' : 'en'
  return reglages.closedNotice[l]?.trim() || NOTICE_DEFAUT[l]
}

/** "YYYY-MM-DD" du jour décalé de `n` jours. */
export function decalerJour(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
