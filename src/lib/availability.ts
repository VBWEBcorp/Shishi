/**
 * Moteur de disponibilités en temps réel (Pilier 2).
 *
 * Chaque activité réservable expose des horaires d'ouverture, une durée de
 * créneau et une capacité (nombre de terrains ou de places par créneau).
 *
 * La disponibilité se calcule par CHEVAUCHEMENT DE PLAGES, et non par comptage
 * sur un créneau figé : une séance interne de 07:30 à 09:00 occupe donc la
 * seconde moitié du créneau public de 07:00 autant que l'intégralité de celui
 * de 08:00. C'est ce qui permet à l'espace admin de saisir des demi-heures sans
 * jamais survendre les créneaux d'une heure proposés aux clients sur le site.
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
  /**
   * Unité de réservation. 'hour' (défaut) = créneaux horaires (tennis, kids).
   * 'day' = accès à la journée (salle de sport, piscine) : un seul « créneau »
   * par jour, sans choix d'horaire.
   */
  unit?: 'hour' | 'day'
}

/**
 * Activités réservables par créneau.
 * `restaurant` n'est pas réservable ici. `pickleball` est mis de côté pour le
 * moment (travaux pas encore lancés) : il bascule donc en « non réservable en
 * ligne » et renvoie vers le contact. À réactiver une fois les terrains prêts.
 */
export const BOOKING_CONFIG: Record<string, ActivityBookingConfig> = {
  // Tennis : réservation du terrain, session d'1 h.
  tennis: { open: '08:00', close: '20:00', slotMinutes: 60, capacity: 2, unit: 'hour' },
  // Salle de sport : accès illimité à la journée.
  fitness: { open: '08:00', close: '20:00', slotMinutes: 720, capacity: 20, unit: 'day' },
  // Kids Club : session d'1 h (repas du midi possible).
  'kids-club': { open: '08:00', close: '16:00', slotMinutes: 60, capacity: 10, unit: 'hour' },
  // Piscine : accès à la journée.
  pool: { open: '08:00', close: '20:00', slotMinutes: 720, capacity: 25, unit: 'day' },
}

/**
 * Contexte de réservation. Les deux grilles sont volontairement différentes :
 *  · 'public' — le site : créneaux d'1 h pleine, dans les horaires d'ouverture.
 *    Un client ne peut donc jamais réserver 1 h 30 ni démarrer à la demi-heure.
 *  · 'admin'  — l'espace admin : grille à la demi-heure, durée libre, sur une
 *    amplitude élargie. Le club note ce qui se passe réellement (ex. une élève
 *    de 07:30 à 09:00) sans que cette souplesse ne fuite côté client.
 */
export type BookingScope = 'public' | 'admin'

/** Pas de saisie de l'espace admin : la demi-heure. */
export const ADMIN_STEP_MINUTES = 30

/**
 * Amplitude de saisie de l'espace admin, indépendante des horaires publics.
 * Volontairement large : l'admin enregistre des séances déjà convenues et ne
 * doit jamais être bloqué par la grille du site. Les horaires d'ouverture de
 * `BOOKING_CONFIG` continuent, eux, de piloter ce que voient les clients.
 */
export const ADMIN_WINDOW = { open: '06:00', close: '22:00' } as const

/** Durée maximale d'une réservation, quelle qu'en soit l'origine. */
export const MAX_BOOKING_MINUTES = 8 * 60

/** Une activité est-elle réservable par créneau ? */
export function isBookable(slug: string): boolean {
  return slug in BOOKING_CONFIG
}

/** Accès « à la journée » (salle de sport, piscine) plutôt que créneau horaire. */
export function isDayPass(slug: string): boolean {
  return getBookingConfig(slug)?.unit === 'day'
}

export function getBookingConfig(slug: string): ActivityBookingConfig | null {
  return BOOKING_CONFIG[slug] ?? null
}

/** Combien de temps (ms) une réservation "pending" bloque un créneau avant expiration. */
export const PENDING_HOLD_MS = 30 * 60 * 1000 // 30 min

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** Durée lisible : 90 → « 1 h 30 », 30 → « 30 min ». */
export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${String(m).padStart(2, '0')}` : `${h} h`
}

/** Plage en minutes depuis minuit, bornes [start, end). */
export interface TimeRange {
  start: number
  end: number
}

/** Amplitude de saisie autorisée pour une activité selon le contexte. */
export function bookingWindow(slug: string, scope: BookingScope = 'public'): TimeRange | null {
  const cfg = getBookingConfig(slug)
  if (!cfg) return null
  const open = toMinutes(cfg.open)
  const close = toMinutes(cfg.close)
  // Un pass journée reste calé sur la journée d'ouverture, même côté admin.
  if (scope === 'public' || cfg.unit === 'day') return { start: open, end: close }
  return {
    start: Math.min(open, toMinutes(ADMIN_WINDOW.open)),
    end: Math.max(close, toMinutes(ADMIN_WINDOW.close)),
  }
}

/** Pas de la grille de créneaux (minutes) selon le contexte. */
export function slotStep(slug: string, scope: BookingScope = 'public'): number {
  const cfg = getBookingConfig(slug)
  if (!cfg) return 60
  if (cfg.unit === 'day') return cfg.slotMinutes
  return scope === 'admin' ? ADMIN_STEP_MINUTES : cfg.slotMinutes
}

/** Durée minimale réservable (minutes) — aussi l'« atome » de calcul d'occupation. */
export function minBookingMinutes(slug: string, scope: BookingScope = 'public'): number {
  return slotStep(slug, scope)
}

export interface SlotGridOptions {
  /** 'admin' élargit la grille et la descend à la demi-heure. Défaut : 'public'. */
  scope?: BookingScope
}

/** Génère la liste des heures de créneaux "HH:mm" pour une activité. */
export function generateSlots(slug: string, options: SlotGridOptions = {}): string[] {
  const cfg = getBookingConfig(slug)
  if (!cfg) return []
  // Accès à la journée : un seul « créneau » par jour (à l'heure d'ouverture).
  if (cfg.unit === 'day') return [cfg.open]

  const scope = options.scope ?? 'public'
  const win = bookingWindow(slug, scope)
  if (!win) return []
  const step = slotStep(slug, scope)
  const min = minBookingMinutes(slug, scope)

  const slots: string[] = []
  for (let t = win.start; t + min <= win.end; t += step) slots.push(toHHMM(t))
  return slots
}

/** L'heure demandée fait-elle partie de la grille publique (créneaux d'1 h) ? */
export function isPublicSlotTime(slug: string, time: string): boolean {
  return generateSlots(slug).includes(time)
}

/**
 * Convertit une demande (heure de début + durée) en plage [début, fin), après
 * validation stricte selon le contexte : grille, durée, amplitude d'ouverture.
 * Renvoie `null` si la demande n'est pas recevable — c'est LE garde-fou qui
 * empêche un client de réserver 07:30 ou 1 h 30 depuis le site.
 */
export function bookingInterval(
  slug: string,
  time: string,
  durationMinutes: number,
  scope: BookingScope = 'public'
): TimeRange | null {
  const cfg = getBookingConfig(slug)
  if (!cfg) return null
  if (!/^([01]\d|2[0-3]):([0-5]\d)$/.test(time)) return null
  const start = toMinutes(time)

  // Accès à la journée : un unique créneau, à l'ouverture, de durée fixe.
  if (cfg.unit === 'day') {
    return start === toMinutes(cfg.open) ? { start, end: start + cfg.slotMinutes } : null
  }

  const win = bookingWindow(slug, scope)
  if (!win) return null
  const step = slotStep(slug, scope)
  const min = minBookingMinutes(slug, scope)

  const duration = Math.round(Number(durationMinutes))
  if (!Number.isFinite(duration) || duration < min || duration % min !== 0) return null
  if (duration > MAX_BOOKING_MINUTES) return null
  // Le départ doit tomber sur la grille du contexte (heure pleine côté public,
  // demi-heure côté admin) et toute la plage doit tenir dans l'amplitude.
  if (start < win.start || (start - win.start) % step !== 0) return null
  const end = start + duration
  if (end > win.end) return null
  return { start, end }
}

/**
 * Nombre maximum de réservations SIMULTANÉES sur la plage [start, end).
 * Balayage d'événements : une fin qui tombe pile sur un début ne compte pas
 * comme un chevauchement (08:00–08:30 puis 08:30–09:00 = 1 seul terrain).
 */
export function maxOverlap(booked: TimeRange[], start: number, end: number): number {
  if (end <= start) return 0
  const events: Array<[number, number]> = []
  for (const b of booked) {
    const s = Math.max(b.start, start)
    const e = Math.min(b.end, end)
    if (e > s) events.push([s, 1], [e, -1])
  }
  if (!events.length) return 0
  // À instant égal, on traite les fins (-1) avant les débuts (+1).
  events.sort((a, b) => a[0] - b[0] || a[1] - b[1])
  let current = 0
  let peak = 0
  for (const [, delta] of events) {
    current += delta
    if (current > peak) peak = current
  }
  return peak
}

export interface SlotAvailability {
  time: string
  /** Fin du créneau élémentaire ("HH:mm") — 1 h côté public, 30 min côté admin. */
  endTime: string
  capacity: number
  booked: number
  available: number
}

/**
 * Disponibilité de chaque créneau de la grille, à partir des plages déjà
 * réservées. Chaque créneau est mesuré sur sa propre durée : un créneau public
 * d'1 h est libre seulement si une place reste libre pendant TOUTE l'heure.
 */
export function computeAvailability(
  slug: string,
  booked: TimeRange[],
  options: SlotGridOptions = {}
): SlotAvailability[] {
  const cfg = getBookingConfig(slug)
  if (!cfg) return []
  const scope = options.scope ?? 'public'
  const unit = cfg.unit === 'day' ? cfg.slotMinutes : minBookingMinutes(slug, scope)

  return generateSlots(slug, options).map((time) => {
    const start = toMinutes(time)
    const end = start + unit
    const taken = maxOverlap(booked, start, end)
    return {
      time,
      endTime: toHHMM(end),
      capacity: cfg.capacity,
      booked: taken,
      available: Math.max(0, cfg.capacity - taken),
    }
  })
}
