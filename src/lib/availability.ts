/**
 * Moteur de disponibilités en temps réel (Pilier 2).
 *
 * Chaque activité réservable expose des horaires d'ouverture, une durée de
 * créneau et une capacité (nombre de terrains ou de places par créneau).
 * Un créneau est disponible tant que le nombre de réservations actives
 * (payées + en attente récentes) est < capacité.
 *
 * PLACEHOLDER — horaires/capacités à confirmer avec le client (VBWEB).
 */

export interface ActivityBookingConfig {
  /** Heure d'ouverture "HH:mm" */
  open: string
  /** Heure de fermeture "HH:mm" (dernier créneau commence avant cette heure) */
  close: string
  /** Durée d'un créneau en minutes */
  slotMinutes: number
  /** Nombre de réservations simultanées possibles par créneau (terrains/places) */
  capacity: number
}

/** Activités réservables par créneau. `restaurant` n'est pas réservable ici. */
export const BOOKING_CONFIG: Record<string, ActivityBookingConfig> = {
  pickleball: { open: '08:00', close: '21:00', slotMinutes: 60, capacity: 3 },
  tennis: { open: '07:00', close: '21:00', slotMinutes: 60, capacity: 2 },
  fitness: { open: '06:00', close: '22:00', slotMinutes: 60, capacity: 20 },
  'kids-club': { open: '09:00', close: '18:00', slotMinutes: 60, capacity: 10 },
  pool: { open: '08:00', close: '20:00', slotMinutes: 60, capacity: 25 },
}

/** Une activité est-elle réservable par créneau ? */
export function isBookable(slug: string): boolean {
  return slug in BOOKING_CONFIG
}

export function getBookingConfig(slug: string): ActivityBookingConfig | null {
  return BOOKING_CONFIG[slug] ?? null
}

/** Combien de temps (ms) une réservation "pending" bloque un créneau avant expiration. */
export const PENDING_HOLD_MS = 30 * 60 * 1000 // 30 min

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Génère la liste des heures de créneaux "HH:mm" pour une activité. */
export function generateSlots(slug: string): string[] {
  const cfg = getBookingConfig(slug)
  if (!cfg) return []
  const start = toMinutes(cfg.open)
  const end = toMinutes(cfg.close)
  const slots: string[] = []
  for (let t = start; t + cfg.slotMinutes <= end; t += cfg.slotMinutes) {
    slots.push(toHHMM(t))
  }
  return slots
}

export interface SlotAvailability {
  time: string
  capacity: number
  booked: number
  available: number
}

/**
 * Calcule la disponibilité de chaque créneau à partir des comptes de
 * réservations déjà prises (map "HH:mm" → nombre de réservations actives).
 */
export function computeAvailability(
  slug: string,
  bookedByTime: Record<string, number>
): SlotAvailability[] {
  const cfg = getBookingConfig(slug)
  if (!cfg) return []
  return generateSlots(slug).map((time) => {
    const booked = bookedByTime[time] || 0
    return {
      time,
      capacity: cfg.capacity,
      booked,
      available: Math.max(0, cfg.capacity - booked),
    }
  })
}
