/**
 * Validations de date/heure d'une demande de réservation — logique pure et
 * testable (aucun accès base ou réseau).
 *
 * Le club est à Koh Samui : les créneaux sont exprimés en heure locale de
 * Bangkok (UTC+7), cohérent avec le cron de rappels (`+07:00`). On interprète
 * donc la date/heure demandée dans ce fuseau pour décider si elle est passée.
 */

const BANGKOK_OFFSET = '+07:00'

/** Format de date attendu : AAAA-MM-JJ (strict). */
export function isValidBookingDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  // Rejette les dates syntaxiquement valides mais impossibles (ex. 2026-02-31).
  const parsed = new Date(`${date}T12:00:00${BANGKOK_OFFSET}`)
  if (isNaN(parsed.getTime())) return false
  const [y, m, d] = date.split('-').map(Number)
  return (
    parsed.getUTCFullYear() === y &&
    // 12:00 Bangkok = 05:00 UTC le même jour civil → getUTC* reste sur le bon jour.
    parsed.getUTCMonth() + 1 === m &&
    parsed.getUTCDate() === d
  )
}

/**
 * La date/heure demandée est-elle déjà passée ? Une `time` absente ou malformée
 * est traitée comme le début de journée (00:00) — prudent : une réservation
 * « aujourd'hui » sans heure exploitable est refusée si le jour est déjà écoulé,
 * jamais dans le passé. `now` est injectable pour les tests.
 */
export function isBookingDateTimeInPast(date: string, time: string, now: number = Date.now()): boolean {
  if (!isValidBookingDate(date)) return true // date invalide → refuser
  const t = /^\d{2}:\d{2}$/.test(time) ? time : '00:00'
  const target = new Date(`${date}T${t}:00${BANGKOK_OFFSET}`)
  if (isNaN(target.getTime())) return true
  return target.getTime() < now
}
