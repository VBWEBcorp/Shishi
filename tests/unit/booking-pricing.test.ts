import { describe, it, expect } from 'vitest'
import {
  getActivityPrice,
  getUnitLabel,
  supportsHours,
  isPricePerPerson,
  getBookingAmount,
  getBookingAmountForMinutes,
  getActivityBySlug,
  PRICE_TIERS,
  MAX_BOOKING_HOURS,
} from '@/lib/booking-pricing'

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

describe('supportsHours', () => {
  it('seul le Kids Club propose un choix du nombre d’heures', () => {
    expect(supportsHours('kids-club')).toBe(true)
    expect(supportsHours('tennis')).toBe(false)
    expect(supportsHours('fitness')).toBe(false)
    expect(supportsHours('inconnu')).toBe(false)
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

describe('getBookingAmount', () => {
  it('tennis : prix fixe du terrain, indépendant du nombre de joueurs et des heures', () => {
    expect(getBookingAmount('tennis', 1)).toBe(600)
    expect(getBookingAmount('tennis', 4)).toBe(600)
    expect(getBookingAmount('tennis', 4, 3)).toBe(600)
  })

  it('fitness : multiplié par le nombre de participants, pas par les heures', () => {
    expect(getBookingAmount('fitness', 1)).toBe(250)
    expect(getBookingAmount('fitness', 3)).toBe(750)
    expect(getBookingAmount('fitness', 3, 5)).toBe(750)
  })

  it('kids-club : multiplié par les participants ET par les heures', () => {
    expect(getBookingAmount('kids-club', 1, 1)).toBe(200)
    expect(getBookingAmount('kids-club', 2, 3)).toBe(1200)
    expect(getBookingAmount('kids-club', 1, 4)).toBe(800)
  })

  it('pool : par personne, une seule journée', () => {
    expect(getBookingAmount('pool', 5)).toBe(500)
  })

  it('slug inconnu : tarif par défaut 500, prix fixe', () => {
    expect(getBookingAmount('inconnu', 3)).toBe(500)
  })

  it('normalise les entrées invalides (0, négatif, décimal) à au moins 1', () => {
    expect(getBookingAmount('fitness', 0)).toBe(250)
    expect(getBookingAmount('fitness', -2)).toBe(250)
    expect(getBookingAmount('fitness', 2.9)).toBe(500)
    expect(getBookingAmount('kids-club', 1, 0)).toBe(200)
    expect(getBookingAmount('kids-club', 1, -3)).toBe(200)
  })
})

describe('getBookingAmountForMinutes — saisie admin à durée libre', () => {
  it('facture le tennis au prorata de la demi-heure', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 60)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 1, 90)).toBe(900)
    expect(getBookingAmountForMinutes('tennis', 1, 30)).toBe(300)
  })

  it('reste un prix de terrain : le nombre de joueurs ne change rien', () => {
    expect(getBookingAmountForMinutes('tennis', 4, 90)).toBe(900)
  })

  it('kids-club : prorata de durée ET multiplication par participant', () => {
    expect(getBookingAmountForMinutes('kids-club', 2, 90)).toBe(600)
  })

  it('pass journée : forfait, la durée n’entre pas en compte', () => {
    expect(getBookingAmountForMinutes('pool', 5, 720)).toBe(500)
    expect(getBookingAmountForMinutes('fitness', 3, 60)).toBe(750)
  })

  it('donne le même montant que getBookingAmount sur un créneau plein', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 60)).toBe(getBookingAmount('tennis', 1, 1))
    expect(getBookingAmountForMinutes('kids-club', 2, 180)).toBe(getBookingAmount('kids-club', 2, 3))
    expect(getBookingAmountForMinutes('pool', 5, 720)).toBe(getBookingAmount('pool', 5))
  })

  it('borne les durées aberrantes', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 0)).toBe(600) // repli sur un créneau
    expect(getBookingAmountForMinutes('tennis', 1, -90)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 1, 10_000)).toBe(600 * MAX_BOOKING_HOURS)
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
  it('MAX_BOOKING_HOURS vaut 8', () => {
    expect(MAX_BOOKING_HOURS).toBe(8)
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
