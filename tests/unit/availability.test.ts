import { describe, it, expect } from 'vitest'
import {
  isBookable,
  isDayPass,
  getBookingConfig,
  generateSlots,
  computeAvailability,
  bookingInterval,
  bookingWindow,
  isPublicSlotTime,
  maxOverlap,
  formatDuration,
  toMinutes,
  toHHMM,
  ADMIN_STEP_MINUTES,
  MAX_BOOKING_MINUTES,
  BOOKING_CONFIG,
  PENDING_HOLD_MS,
  type TimeRange,
} from '@/lib/availability'

/** Raccourci : plage réservée à partir d'une heure "HH:mm" et d'une durée. */
function range(time: string, minutes: number): TimeRange {
  const start = toMinutes(time)
  return { start, end: start + minutes }
}

describe('isBookable', () => {
  it('reconnaît les activités réservables par créneau', () => {
    expect(isBookable('tennis')).toBe(true)
    expect(isBookable('fitness')).toBe(true)
    expect(isBookable('kids-club')).toBe(true)
    expect(isBookable('pool')).toBe(true)
  })

  it('pickleball et restaurant ne sont pas réservables en ligne', () => {
    expect(isBookable('pickleball')).toBe(false)
    expect(isBookable('restaurant')).toBe(false)
    expect(isBookable('inconnu')).toBe(false)
  })
})

describe('isDayPass', () => {
  it('fitness et pool sont des accès à la journée', () => {
    expect(isDayPass('fitness')).toBe(true)
    expect(isDayPass('pool')).toBe(true)
  })

  it('tennis et kids-club sont des créneaux horaires', () => {
    expect(isDayPass('tennis')).toBe(false)
    expect(isDayPass('kids-club')).toBe(false)
  })

  it('renvoie false pour une activité inconnue', () => {
    expect(isDayPass('inconnu')).toBe(false)
  })
})

describe('getBookingConfig', () => {
  it('renvoie la config pour une activité réservable', () => {
    expect(getBookingConfig('tennis')).toEqual({
      open: '07:00',
      close: '22:00',
      slotMinutes: 60,
      capacity: 1,
      unit: 'hour',
    })
  })

  it('renvoie null pour une activité inconnue', () => {
    expect(getBookingConfig('inconnu')).toBeNull()
  })
})

describe('formatDuration', () => {
  it('rend une durée lisible dans l’emploi du temps', () => {
    expect(formatDuration(30)).toBe('30 min')
    expect(formatDuration(60)).toBe('1 h')
    expect(formatDuration(90)).toBe('1 h 30')
    expect(formatDuration(150)).toBe('2 h 30')
  })
})

describe('generateSlots — grille PUBLIQUE (demi-heures, horaires d’ouverture)', () => {
  it('tennis : demi-heures de 07:00 à 21:30 (la dernière finit à 22:00)', () => {
    const slots = generateSlots('tennis')
    expect(slots).toHaveLength(30)
    expect(slots[0]).toBe('07:00')
    expect(slots[slots.length - 1]).toBe('21:30')
    expect(slots).not.toContain('22:00')
  })

  it('la fenêtre interne de 06:00 n’est JAMAIS proposée aux clients', () => {
    expect(generateSlots('tennis')).not.toContain('06:00')
    expect(generateSlots('tennis')).not.toContain('06:30')
    expect(generateSlots('tennis', { scope: 'admin' })).toContain('06:00')
  })

  it('propose la demi-heure aux clients, comme l’admin (demande du club du 18/09/2026)', () => {
    expect(generateSlots('tennis')).toContain('07:30')
    expect(generateSlots('kids-club')).toContain('08:30')
    expect(generateSlots('tennis')).toEqual(generateSlots('tennis', { scope: 'admin' }).slice(2, -2))
  })

  it('kids-club : de 08:00 à 15:30 (fermeture 16:00)', () => {
    const slots = generateSlots('kids-club')
    expect(slots).toHaveLength(16)
    expect(slots[0]).toBe('08:00')
    expect(slots[slots.length - 1]).toBe('15:30')
  })

  it('accès journée : un unique créneau à l’ouverture', () => {
    expect(generateSlots('fitness')).toEqual(['08:00'])
    expect(generateSlots('pool')).toEqual(['08:00'])
  })

  it('renvoie une liste vide pour une activité inconnue', () => {
    expect(generateSlots('inconnu')).toEqual([])
  })
})

describe('generateSlots — grille ADMIN (demi-heures)', () => {
  it('descend à la demi-heure et couvre l’amplitude interne', () => {
    const slots = generateSlots('tennis', { scope: 'admin' })
    expect(slots).toContain('07:30')
    expect(slots).toContain('08:30')
    expect(slots[0]).toBe('06:00')
    expect(slots[slots.length - 1]).toBe('22:30')
  })

  it('un pass journée reste un créneau unique, même côté admin', () => {
    expect(generateSlots('pool', { scope: 'admin' })).toEqual(['08:00'])
  })

  it('l’amplitude admin englobe les horaires publics', () => {
    const pub = bookingWindow('tennis')!
    const admin = bookingWindow('tennis', 'admin')!
    expect(admin.start).toBeLessThanOrEqual(pub.start)
    expect(admin.end).toBeGreaterThanOrEqual(pub.end)
  })
})

describe('isPublicSlotTime', () => {
  it('accepte les demi-heures d’ouverture, refuse ce qui est hors horaires', () => {
    expect(isPublicSlotTime('tennis', '09:00')).toBe(true)
    expect(isPublicSlotTime('tennis', '09:30')).toBe(true)
    // 06:00 est la fenêtre réservée au club, 22:00 est l'heure de fermeture.
    expect(isPublicSlotTime('tennis', '06:00')).toBe(false)
    expect(isPublicSlotTime('tennis', '06:30')).toBe(false)
    expect(isPublicSlotTime('tennis', '22:00')).toBe(false)
  })
})

describe('bookingInterval — garde-fou de la grille', () => {
  it('côté public : une heure pleine d’1 h est acceptée', () => {
    expect(bookingInterval('tennis', '09:00', 60)).toEqual({ start: 540, end: 600 })
  })

  it('côté public : 30 minutes, un départ à la demi-heure et 1 h 30 sont acceptés', () => {
    expect(bookingInterval('tennis', '09:00', 30)).toEqual({ start: 540, end: 570 })
    expect(bookingInterval('tennis', '09:30', 60)).toEqual({ start: 570, end: 630 })
    expect(bookingInterval('tennis', '09:00', 90)).toEqual({ start: 540, end: 630 })
    // La dernière demi-heure vendable finit pile à la fermeture.
    expect(bookingInterval('tennis', '21:30', 30)).toEqual({ start: 1290, end: 1320 })
  })

  it('côté public : la demi-heure reste le pas, rien en dessous ni entre deux', () => {
    expect(bookingInterval('tennis', '09:15', 30)).toBeNull()
    expect(bookingInterval('tennis', '09:00', 20)).toBeNull()
    expect(bookingInterval('tennis', '09:00', 45)).toBeNull()
  })

  it('côté public : la fenêtre élargie de l’admin reste fermée aux clients', () => {
    expect(bookingInterval('tennis', '06:00', 60)).toBeNull()
    expect(bookingInterval('tennis', '06:30', 30)).toBeNull()
    expect(bookingInterval('tennis', '21:30', 60)).toBeNull()
    expect(bookingInterval('tennis', '22:00', 30)).toBeNull()
  })

  it('côté public : une plage qui dépasse la fermeture est refusée', () => {
    // Kids Club ferme à 16:00 → 3 h à partir de 15:00 ne tient pas.
    expect(bookingInterval('kids-club', '15:00', 180)).toBeNull()
    expect(bookingInterval('kids-club', '13:00', 180)).toEqual({ start: 780, end: 960 })
  })

  it('côté admin : 07:30 → 09:00 (le cas du club) est accepté', () => {
    expect(bookingInterval('tennis', '07:30', 90, 'admin')).toEqual({ start: 450, end: 540 })
  })

  it('côté admin : la demi-heure est le pas, pas moins', () => {
    expect(bookingInterval('tennis', '07:30', 30, 'admin')).toEqual({ start: 450, end: 480 })
    expect(bookingInterval('tennis', '07:45', 30, 'admin')).toBeNull()
    expect(bookingInterval('tennis', '07:30', 20, 'admin')).toBeNull()
  })

  it('borne la durée maximale et l’amplitude de saisie', () => {
    expect(bookingInterval('tennis', '08:00', MAX_BOOKING_MINUTES + ADMIN_STEP_MINUTES, 'admin')).toBeNull()
    // L'admin garde une heure de marge après la fermeture publique de 22:00…
    expect(bookingInterval('tennis', '22:00', 60, 'admin')).toEqual({ start: 1320, end: 1380 })
    // …mais pas au-delà de 23:00, ni avant la fenêtre interne de 06:00.
    expect(bookingInterval('tennis', '22:30', 60, 'admin')).toBeNull()
    expect(bookingInterval('tennis', '05:30', 60, 'admin')).toBeNull()
  })

  it('pass journée : uniquement l’ouverture, sur la durée de la journée', () => {
    expect(bookingInterval('pool', '08:00', 720)).toEqual({ start: 480, end: 1200 })
    expect(bookingInterval('pool', '09:00', 720)).toBeNull()
  })

  it('refuse une heure malformée ou une activité inconnue', () => {
    expect(bookingInterval('tennis', '9:00', 60)).toBeNull()
    expect(bookingInterval('inconnu', '09:00', 60)).toBeNull()
  })
})

describe('maxOverlap', () => {
  it('compte les réservations SIMULTANÉES, pas les réservations touchées', () => {
    // Deux demi-heures qui se suivent n’occupent qu’un seul terrain à la fois.
    const booked = [range('08:00', 30), range('08:30', 30)]
    expect(maxOverlap(booked, toMinutes('08:00'), toMinutes('09:00'))).toBe(1)
  })

  it('détecte le pic de chevauchement', () => {
    const booked = [range('08:00', 90), range('08:30', 60)]
    expect(maxOverlap(booked, toMinutes('08:00'), toMinutes('10:00'))).toBe(2)
  })

  it('ignore les plages qui ne font que se toucher', () => {
    expect(maxOverlap([range('07:00', 60)], toMinutes('08:00'), toMinutes('09:00'))).toBe(0)
  })

  it('renvoie 0 sur une plage vide ou inversée', () => {
    expect(maxOverlap([range('08:00', 60)], 600, 600)).toBe(0)
    expect(maxOverlap([], 480, 540)).toBe(0)
  })
})

describe('computeAvailability — grille publique', () => {
  it('calcule la disponibilité restante par demi-heure', () => {
    // Un seul terrain : la moindre réservation ferme les demi-heures qu'elle couvre.
    const avail = computeAvailability('tennis', [range('09:00', 60)])
    expect(avail).toHaveLength(30)
    expect(avail.find((s) => s.time === '09:00')).toMatchObject({ capacity: 1, booked: 1, available: 0 })
    expect(avail.find((s) => s.time === '09:30')).toMatchObject({ capacity: 1, booked: 1, available: 0 })
    expect(avail.find((s) => s.time === '10:00')).toMatchObject({ capacity: 1, booked: 0, available: 1 })
  })

  it('ne renvoie jamais de disponibilité négative (survente)', () => {
    const avail = computeAvailability('tennis', Array.from({ length: 5 }, () => range('08:00', 60)))
    expect(avail.find((s) => s.time === '08:00')!.available).toBe(0)
  })

  it('une séance de 07:30 à 09:00 laisse 07:00 vendable pour 30 minutes', () => {
    const avail = computeAvailability('tennis', [range('07:30', 90)])
    // La demi-heure de 07:00 reste libre : un client peut la prendre pour 30 min.
    expect(avail.find((s) => s.time === '07:00')!.available).toBe(1)
    expect(avail.find((s) => s.time === '07:30')!.available).toBe(0)
    expect(avail.find((s) => s.time === '08:30')!.available).toBe(0)
    // Le créneau suivant, lui, doit rester intact.
    expect(avail.find((s) => s.time === '09:00')!.available).toBe(1)
  })

  it('deux demi-heures qui se suivent n’occupent qu’un terrain, pas deux', () => {
    // L'occupation doit rester comptée à 1 : pas de survente fantôme.
    const avail = computeAvailability('tennis', [range('08:00', 30), range('08:30', 30)])
    expect(avail.find((s) => s.time === '08:00')).toMatchObject({ booked: 1, available: 0 })
    expect(avail.find((s) => s.time === '08:30')).toMatchObject({ booked: 1, available: 0 })
  })

  it('renvoie une liste vide pour une activité inconnue', () => {
    expect(computeAvailability('inconnu', [])).toEqual([])
  })
})

describe('computeAvailability — grille admin', () => {
  it('mesure chaque demi-heure indépendamment', () => {
    const avail = computeAvailability('tennis', [range('08:00', 30)], { scope: 'admin' })
    expect(avail.find((s) => s.time === '08:00')).toMatchObject({ endTime: '08:30', available: 0 })
    expect(avail.find((s) => s.time === '08:30')).toMatchObject({ endTime: '09:00', available: 1 })
  })

  it('expose la fin de chaque créneau élémentaire', () => {
    const avail = computeAvailability('tennis', [], { scope: 'admin' })
    expect(avail[0]).toMatchObject({ time: '06:00', endTime: '06:30' })
  })
})

describe('invariants de configuration', () => {
  it('la rétention d’un créneau "pending" est de 30 minutes', () => {
    expect(PENDING_HOLD_MS).toBe(30 * 60 * 1000)
  })

  it('chaque config a une plage horaire cohérente et une capacité positive', () => {
    for (const [slug, cfg] of Object.entries(BOOKING_CONFIG)) {
      expect(cfg.open < cfg.close, `${slug} : ouverture avant fermeture`).toBe(true)
      expect(cfg.capacity, `${slug} : capacité > 0`).toBeGreaterThan(0)
      expect(cfg.slotMinutes, `${slug} : durée de créneau > 0`).toBeGreaterThan(0)
    }
  })

  it('conversion heure ↔ minutes stable', () => {
    expect(toHHMM(toMinutes('07:30'))).toBe('07:30')
    expect(toMinutes('00:00')).toBe(0)
  })
})
