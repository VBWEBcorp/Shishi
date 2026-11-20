/**
 * Séances d'aquagym à heure fixe (demande de Paul Poulain, 20/11/2026) :
 * le lundi et le vendredi à 9 h, heure de Koh Samui. Tous les clients
 * s'inscrivent par le formulaire de la page /aquagym-lamai ; chaque
 * inscription est une réservation `aquagym` de 45 min, que l'espace admin
 * regroupe séance par séance (/admin/aquagym).
 *
 * Logique pure, sans base ni réseau : testable et utilisable côté client.
 */

/** Jours des séances (0 = dimanche, 1 = lundi … 5 = vendredi). */
export const AQUAGYM_JOURS = [1, 5] as const
/** Heure de début, heure de Bangkok. */
export const AQUAGYM_HEURE = '09:00'
/** Durée d'une séance, en minutes. */
export const AQUAGYM_DUREE = 45
/** Nombre de semaines ouvertes à l'inscription. */
export const AQUAGYM_SEMAINES = 4
/** Personnes au plus par inscription. */
export const AQUAGYM_MAX_PERSONNES = 10

const BANGKOK_OFFSET_MS = 7 * 60 * 60 * 1000

/** "YYYY-MM-DD" du jour à Bangkok pour l'instant donné. */
function jourBangkok(now: number): string {
  return new Date(now + BANGKOK_OFFSET_MS).toISOString().slice(0, 10)
}

/** Jour de la semaine d'une date "YYYY-MM-DD" (0 = dimanche). */
export function jourSemaine(date: string): number {
  return new Date(`${date}T12:00:00Z`).getUTCDay()
}

/** Instant de début d'une séance (ms), heure de Bangkok. */
export function debutSeance(date: string): number {
  return new Date(`${date}T${AQUAGYM_HEURE}:00+07:00`).getTime()
}

/** La date tombe-t-elle sur un jour de séance ? */
export function estJourAquagym(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  return (AQUAGYM_JOURS as readonly number[]).includes(jourSemaine(date))
}

/**
 * Les prochaines séances encore ouvertes (début pas encore passé), sur
 * `AQUAGYM_SEMAINES` semaines, dans l'ordre.
 */
export function prochainesSeances(now: number = Date.now()): string[] {
  const depart = new Date(`${jourBangkok(now)}T12:00:00Z`)
  const dates: string[] = []
  for (let i = 0; i < AQUAGYM_SEMAINES * 7; i++) {
    const d = new Date(depart)
    d.setUTCDate(d.getUTCDate() + i)
    const date = d.toISOString().slice(0, 10)
    if (estJourAquagym(date) && debutSeance(date) > now) dates.push(date)
  }
  return dates
}

/** Inscription recevable : bon jour, à venir, dans la fenêtre ouverte. */
export function seanceOuverte(date: string, now: number = Date.now()): boolean {
  return prochainesSeances(now).includes(date)
}
