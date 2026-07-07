import { describe, it, expect } from 'vitest'
import {
  isBookable,
  isDayPass,
  getBookingConfig,
  generateSlots,
  slotsCovered,
  computeAvailability,
  BOOKING_CONFIG,
  PENDING_HOLD_MS,
} from '@/lib/availability'

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
      open: '08:00',
      close: '20:00',
      slotMinutes: 60,
      capacity: 2,
      unit: 'hour',
    })
  })

  it('renvoie null pour une activité inconnue', () => {
    expect(getBookingConfig('inconnu')).toBeNull()
  })
})

describe('generateSlots', () => {
  it('tennis : créneaux horaires de 08:00 à 19:00 (dernier créneau finit à 20:00)', () => {
    const slots = generateSlots('tennis')
    expect(slots).toHaveLength(12)
    expect(slots[0]).toBe('08:00')
    expect(slots[slots.length - 1]).toBe('19:00')
    expect(slots).not.toContain('20:00')
  })

  it('kids-club : de 08:00 à 15:00 (fermeture 16:00)', () => {
    const slots = generateSlots('kids-club')
    expect(slots).toHaveLength(8)
    expect(slots[0]).toBe('08:00')
    expect(slots[slots.length - 1]).toBe('15:00')
  })

  it('accès journée : un unique créneau à l’ouverture', () => {
    expect(generateSlots('fitness')).toEqual(['08:00'])
    expect(generateSlots('pool')).toEqual(['08:00'])
  })

  it('renvoie une liste vide pour une activité inconnue', () => {
    expect(generateSlots('inconnu')).toEqual([])
  })
})

describe('slotsCovered', () => {
  it('couvre les heures consécutives à partir du départ (Kids Club, durée variable)', () => {
    expect(slotsCovered('kids-club', '10:00', 3)).toEqual(['10:00', '11:00', '12:00'])
  })

  it('tronque les créneaux qui dépasseraient la fermeture', () => {
    // 15:00 + 3 h dépasse 16:00 → seul 15:00 tient
    expect(slotsCovered('kids-club', '15:00', 3)).toEqual(['15:00'])
  })

  it('garantit au moins le créneau de départ pour une durée invalide', () => {
    expect(slotsCovered('kids-club', '10:00', 0)).toEqual(['10:00'])
  })

  it('renvoie le créneau de départ pour une activité inconnue', () => {
    expect(slotsCovered('inconnu', '10:00', 2)).toEqual(['10:00'])
  })
})

describe('computeAvailability', () => {
  it('calcule la disponibilité restante par créneau', () => {
    const avail = computeAvailability('tennis', { '08:00': 2, '09:00': 1 })
    expect(avail).toHaveLength(12)

    const eight = avail.find((s) => s.time === '08:00')!
    expect(eight).toMatchObject({ capacity: 2, booked: 2, available: 0 })

    const nine = avail.find((s) => s.time === '09:00')!
    expect(nine).toMatchObject({ capacity: 2, booked: 1, available: 1 })

    const ten = avail.find((s) => s.time === '10:00')!
    expect(ten).toMatchObject({ capacity: 2, booked: 0, available: 2 })
  })

  it('ne renvoie jamais de disponibilité négative (survente)', () => {
    const avail = computeAvailability('tennis', { '08:00': 5 })
    expect(avail.find((s) => s.time === '08:00')!.available).toBe(0)
  })

  it('renvoie une liste vide pour une activité inconnue', () => {
    expect(computeAvailability('inconnu', {})).toEqual([])
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
})
