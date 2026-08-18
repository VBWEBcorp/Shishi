/**
 * Scénarios métier de l'espace admin, tennis — un seul terrain, ouverture
 * publique 07:00–22:00, fenêtre interne 06:00–23:00 (validés client 18/08/2026).
 *
 * Ces tests rejouent la CHAÎNE DE DÉCISION de POST /api/bookings :
 *   1. normalisation de la durée saisie (arrondi au pas de 30 min, bornée) ;
 *   2. `bookingInterval(..., 'admin')` — la plage tient-elle dans la grille ?
 *   3. `maxOverlap(...) < capacity` — reste-t-il un terrain libre sur TOUTE la
 *      plage ? (c'est exactement ce que fait `isRangeAvailable`, la base en plus)
 *
 * On teste la logique, pas Mongo : les réservations déjà en base sont fournies
 * à la main. Ce qui est vérifié ici est ce qui décide réellement d'accepter ou
 * de refuser une saisie du club.
 */
import { describe, it, expect } from 'vitest'

import {
  ADMIN_STEP_MINUTES,
  MAX_BOOKING_MINUTES,
  bookingInterval,
  computeAvailability,
  generateSlots,
  getBookingConfig,
  maxOverlap,
  toMinutes,
  type BookingScope,
  type TimeRange,
} from '@/lib/availability'

const TENNIS = 'tennis'
const capacity = getBookingConfig(TENNIS)!.capacity

/** Réservation déjà en base, exprimée en plage [début, fin). */
function booked(time: string, minutes: number): TimeRange {
  const start = toMinutes(time)
  return { start, end: start + minutes }
}

/** Normalisation de durée de la route (pas de 30 min, bornes admin). */
function normalizeDuration(requestedMinutes: number): number {
  return Math.min(
    MAX_BOOKING_MINUTES,
    Math.max(
      ADMIN_STEP_MINUTES,
      Math.round(requestedMinutes / ADMIN_STEP_MINUTES) * ADMIN_STEP_MINUTES
    )
  )
}

/**
 * Rejoue la décision de la route pour une saisie donnée.
 * Renvoie 'invalid-slot' (hors grille), 'slot-unavailable' (terrain pris) ou
 * 'ok' — les trois issues réelles de l'API.
 */
function trySave(
  time: string,
  requestedMinutes: number,
  existing: TimeRange[] = [],
  scope: BookingScope = 'admin'
): 'ok' | 'invalid-slot' | 'slot-unavailable' {
  const duration = normalizeDuration(requestedMinutes)
  const range = bookingInterval(TENNIS, time, duration, scope)
  if (!range) return 'invalid-slot'
  if (maxOverlap(existing, range.start, range.end) >= capacity) return 'slot-unavailable'
  return 'ok'
}

describe('Le club n’a qu’UN terrain', () => {
  it('la capacité configurée est bien 1', () => {
    expect(capacity).toBe(1)
  })

  it('une seconde réservation sur le même créneau est refusée', () => {
    const existing = [booked('09:00', 60)]
    expect(trySave('09:00', 60)).toBe('ok') // sans rien en base
    expect(trySave('09:00', 60, existing)).toBe('slot-unavailable')
  })

  it('un chevauchement PARTIEL est refusé, pas seulement un doublon exact', () => {
    const existing = [booked('09:00', 60)]
    // 09:30 → 10:30 mord sur la seconde demi-heure de la réservation existante.
    expect(trySave('09:30', 60, existing)).toBe('slot-unavailable')
    // 10:00 → 11:00 ne fait que toucher la fin : le terrain est libre.
    expect(trySave('10:00', 60, existing)).toBe('ok')
  })

  it('deux séances qui se suivent à la demi-heure passent toutes les deux', () => {
    expect(trySave('08:00', 30)).toBe('ok')
    expect(trySave('08:30', 30, [booked('08:00', 30)])).toBe('ok')
  })

  it('un créneau BLOQUÉ par le club occupe le terrain comme une réservation', () => {
    // Le mode « block » crée une réservation ordinaire : même effet d'occupation.
    const blocage = [booked('14:00', 120)]
    expect(trySave('14:00', 60, blocage)).toBe('slot-unavailable')
    expect(trySave('15:00', 60, blocage)).toBe('slot-unavailable')
    expect(trySave('16:00', 60, blocage)).toBe('ok')
  })
})

describe('La fenêtre perso de 6h demandée par le club', () => {
  it('le club peut enregistrer une séance à 06:00 depuis l’admin', () => {
    expect(trySave('06:00', 60)).toBe('ok')
  })

  it('un client ne peut JAMAIS réserver 06:00 depuis le site', () => {
    expect(trySave('06:00', 60, [], 'public')).toBe('invalid-slot')
    expect(generateSlots(TENNIS)).not.toContain('06:00')
  })

  it('rien n’est saisissable avant 06:00, même en admin', () => {
    expect(trySave('05:30', 60)).toBe('invalid-slot')
    expect(trySave('05:00', 60)).toBe('invalid-slot')
  })

  it('une séance de 06:00 rend indisponible le premier créneau public de 07:00 si elle déborde', () => {
    // 06:00 → 07:30 déborde d'une demi-heure sur le créneau public de 07:00.
    const existing = [booked('06:00', 90)]
    expect(trySave('07:00', 60, existing, 'public')).toBe('slot-unavailable')
    // Une séance qui s'arrête pile à 07:00 ne bloque rien.
    expect(trySave('07:00', 60, [booked('06:00', 60)], 'public')).toBe('ok')
  })
})

describe('Amplitude publique 07:00 – 22:00', () => {
  it('07:00 est le premier créneau vendable, 21:00 le dernier', () => {
    const slots = generateSlots(TENNIS)
    expect(slots[0]).toBe('07:00')
    expect(slots[slots.length - 1]).toBe('21:00')
    expect(trySave('07:00', 60, [], 'public')).toBe('ok')
    expect(trySave('21:00', 60, [], 'public')).toBe('ok')
  })

  it('un client ne peut pas réserver au-delà de la fermeture', () => {
    expect(trySave('22:00', 60, [], 'public')).toBe('invalid-slot')
    // 21:30 n'est pas une heure pleine ET déborderait : doublement refusé.
    expect(trySave('21:30', 60, [], 'public')).toBe('invalid-slot')
  })

  it('le club garde une heure de marge après 22:00 pour une séance qui déborde', () => {
    expect(trySave('22:00', 60)).toBe('ok')
    expect(trySave('22:30', 30)).toBe('ok')
    expect(trySave('22:30', 60)).toBe('invalid-slot') // dépasserait 23:00
    expect(trySave('23:00', 30)).toBe('invalid-slot')
  })
})

describe('Saisie à la demi-heure et durées libres (le cas du club)', () => {
  it('la séance 07:30 → 09:00 est acceptée en admin, refusée côté site', () => {
    expect(trySave('07:30', 90)).toBe('ok')
    expect(trySave('07:30', 90, [], 'public')).toBe('invalid-slot')
  })

  it('une durée farfelue est ramenée au pas de 30 min, jamais rejetée bêtement', () => {
    expect(normalizeDuration(47)).toBe(60)
    expect(normalizeDuration(20)).toBe(30)
    expect(normalizeDuration(0)).toBe(30)
    expect(normalizeDuration(99999)).toBe(MAX_BOOKING_MINUTES)
    expect(trySave('09:00', 47)).toBe('ok')
  })

  it('une longue séance reste bornée à la journée du club', () => {
    // 8 h à partir de 06:00 → 14:00 : tient dans l'amplitude.
    expect(trySave('06:00', MAX_BOOKING_MINUTES)).toBe('ok')
    // 8 h à partir de 17:00 dépasserait 23:00.
    expect(trySave('17:00', MAX_BOOKING_MINUTES)).toBe('invalid-slot')
  })

  it('les minutes qui ne tombent pas sur la demi-heure sont refusées', () => {
    expect(trySave('07:45', 60)).toBe('invalid-slot')
    expect(trySave('09:15', 30)).toBe('invalid-slot')
  })
})

describe('Ce que le client voit sur le site après une saisie admin', () => {
  it('une séance interne de 06:30 à 08:00 ferme le créneau public de 07:00', () => {
    const avail = computeAvailability(TENNIS, [booked('06:30', 90)])
    expect(avail.find((s) => s.time === '07:00')!.available).toBe(0)
    expect(avail.find((s) => s.time === '08:00')!.available).toBe(1)
  })

  it('la grille publique compte 15 créneaux d’une heure', () => {
    const avail = computeAvailability(TENNIS, [])
    expect(avail).toHaveLength(15)
    expect(avail.every((s) => s.capacity === 1 && s.available === 1)).toBe(true)
  })

  it('journée complète réservée : plus aucun créneau disponible', () => {
    const journee = generateSlots(TENNIS).map((t) => booked(t, 60))
    const avail = computeAvailability(TENNIS, journee)
    expect(avail.every((s) => s.available === 0)).toBe(true)
  })
})
