import { describe, it, expect } from 'vitest'
import {
  getActivityPrice,
  getUnitLabel,
  hasVariableDuration,
  isPricePerPerson,
  getBookingAmountForMinutes,
  getActivityBySlug,
  PRICE_TIERS,
} from '@/lib/booking-pricing'
import { MAX_BOOKING_MINUTES } from '@/lib/availability'

describe('getActivityPrice', () => {
  it('renvoie le tarif drop-in de la charte client', () => {
    expect(getActivityPrice('tennis')).toBe(600)
    expect(getActivityPrice('pickleball')).toBe(500)
    expect(getActivityPrice('fitness')).toBe(250)
    expect(getActivityPrice('kids-club')).toBe(200)
    expect(getActivityPrice('pool')).toBe(100)
  })

  it('conserve un prix de 0 pour le restaurant (0 n’est pas nullish)', () => {
    expect(getActivityPrice('restaurant')).toBe(0)
  })

  it('retombe sur le tarif par défaut (500) pour un slug inconnu', () => {
    expect(getActivityPrice('inconnu')).toBe(500)
  })
})

describe('getUnitLabel', () => {
  it('renvoie le libellé bilingue de l’unité de facturation', () => {
    expect(getUnitLabel('tennis', 'fr')).toBe('heure')
    expect(getUnitLabel('tennis', 'en')).toBe('hour')
    expect(getUnitLabel('fitness', 'fr')).toBe('séance')
    expect(getUnitLabel('fitness', 'en')).toBe('session')
    expect(getUnitLabel('pool', 'fr')).toBe('jour')
  })

  it('renvoie null pour une activité sans unité définie', () => {
    expect(getUnitLabel('restaurant', 'fr')).toBeNull()
    expect(getUnitLabel('inconnu', 'en')).toBeNull()
  })
})

describe('hasVariableDuration', () => {
  it('tout ce qui se vend à l’heure se réserve pour une durée au choix', () => {
    expect(hasVariableDuration('kids-club')).toBe(true)
    // Le tennis aussi, depuis la demande du club du 18/09/2026 (30 min sur le site).
    expect(hasVariableDuration('tennis')).toBe(true)
  })

  it('un pass journée ou une activité inconnue n’a pas de durée à choisir', () => {
    expect(hasVariableDuration('fitness')).toBe(false)
    expect(hasVariableDuration('pool')).toBe(false)
    expect(hasVariableDuration('inconnu')).toBe(false)
  })
})

describe('isPricePerPerson', () => {
  it('facture par personne fitness, kids-club et pool', () => {
    expect(isPricePerPerson('fitness')).toBe(true)
    expect(isPricePerPerson('kids-club')).toBe(true)
    expect(isPricePerPerson('pool')).toBe(true)
  })

  it('le tennis est une réservation de terrain (prix fixe)', () => {
    expect(isPricePerPerson('tennis')).toBe(false)
    expect(isPricePerPerson('pickleball')).toBe(false)
  })
})

describe('getBookingAmountForMinutes — site et espace admin', () => {
  it('facture le tennis au prorata de la demi-heure', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 60)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 1, 90)).toBe(900)
    // La réservation de 30 minutes demandée par le club : la moitié du tarif horaire.
    expect(getBookingAmountForMinutes('tennis', 1, 30)).toBe(300)
  })

  it('reste un prix de terrain : le nombre de joueurs ne change rien', () => {
    expect(getBookingAmountForMinutes('tennis', 4, 60)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 4, 90)).toBe(900)
  })

  it('kids-club : prorata de durée ET multiplication par participant', () => {
    expect(getBookingAmountForMinutes('kids-club', 1, 60)).toBe(200)
    expect(getBookingAmountForMinutes('kids-club', 1, 30)).toBe(100)
    expect(getBookingAmountForMinutes('kids-club', 2, 90)).toBe(600)
    expect(getBookingAmountForMinutes('kids-club', 2, 180)).toBe(1200)
  })

  it('pass journée : forfait par personne, la durée n’entre pas en compte', () => {
    expect(getBookingAmountForMinutes('pool', 5, 720)).toBe(500)
    expect(getBookingAmountForMinutes('fitness', 1, 720)).toBe(250)
    expect(getBookingAmountForMinutes('fitness', 3, 60)).toBe(750)
  })

  it('normalise un nombre de participants invalide (0, négatif, décimal) à au moins 1', () => {
    expect(getBookingAmountForMinutes('fitness', 0, 720)).toBe(250)
    expect(getBookingAmountForMinutes('fitness', -2, 720)).toBe(250)
    expect(getBookingAmountForMinutes('fitness', 2.9, 720)).toBe(500)
  })

  it('borne les durées aberrantes', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 0)).toBe(600) // repli sur un créneau
    expect(getBookingAmountForMinutes('tennis', 1, -90)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 1, 10_000)).toBe(600 * (MAX_BOOKING_MINUTES / 60))
  })

  it('slug inconnu : tarif par défaut forfaitaire', () => {
    expect(getBookingAmountForMinutes('inconnu', 3, 90)).toBe(500)
  })
})

describe('getActivityBySlug', () => {
  it('résout une activité connue', () => {
    expect(getActivityBySlug('tennis')?.slug).toBe('tennis')
  })

  it('renvoie undefined pour un slug inconnu', () => {
    expect(getActivityBySlug('inconnu')).toBeUndefined()
  })
})

describe('constantes de tarification', () => {
  it('une réservation ne dépasse jamais 8 heures', () => {
    expect(MAX_BOOKING_MINUTES).toBe(8 * 60)
  })

  it('la grille fitness comporte séance / semaine / mois', () => {
    const tiers = PRICE_TIERS.fitness
    expect(tiers).toHaveLength(3)
    expect(tiers.map((t) => t.amount)).toEqual([250, 1000, 1500])
  })

  it('le premier palier tennis correspond au tarif drop-in', () => {
    expect(PRICE_TIERS.tennis[0].amount).toBe(getActivityPrice('tennis'))
  })
})
