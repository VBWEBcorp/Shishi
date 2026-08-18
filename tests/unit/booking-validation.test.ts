import { describe, it, expect } from 'vitest'
import { MEMBER_ADVANCE_DAYS, PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'
import { isValidBookingDate, isBookingDateTimeInPast } from '@/lib/booking-validation'

describe('isValidBookingDate', () => {
  it('accepte une date bien formée', () => {
    expect(isValidBookingDate('2026-07-24')).toBe(true)
    expect(isValidBookingDate('2026-12-31')).toBe(true)
  })

  it('refuse un format invalide', () => {
    expect(isValidBookingDate('')).toBe(false)
    expect(isValidBookingDate('24-07-2026')).toBe(false)
    expect(isValidBookingDate('2026/07/24')).toBe(false)
    expect(isValidBookingDate('2026-7-4')).toBe(false)
    expect(isValidBookingDate('not-a-date')).toBe(false)
  })

  it('refuse une date impossible', () => {
    expect(isValidBookingDate('2026-02-31')).toBe(false)
    expect(isValidBookingDate('2026-13-01')).toBe(false)
    expect(isValidBookingDate('2026-00-10')).toBe(false)
  })
})

describe('isBookingDateTimeInPast', () => {
  // Référence : 2026-07-23 12:00 Bangkok = 2026-07-23T05:00:00Z
  const now = Date.parse('2026-07-23T05:00:00Z')

  it('considère hier comme passé', () => {
    expect(isBookingDateTimeInPast('2026-07-22', '10:00', now)).toBe(true)
  })

  it('considère demain comme futur', () => {
    expect(isBookingDateTimeInPast('2026-07-24', '10:00', now)).toBe(false)
  })

  it('gère le même jour selon l’heure', () => {
    // 09:00 Bangkok est déjà passé à 12:00 Bangkok
    expect(isBookingDateTimeInPast('2026-07-23', '09:00', now)).toBe(true)
    // 15:00 Bangkok est encore à venir
    expect(isBookingDateTimeInPast('2026-07-23', '15:00', now)).toBe(false)
  })

  it('refuse une date invalide (traitée comme passée)', () => {
    expect(isBookingDateTimeInPast('2020-99-99', '10:00', now)).toBe(true)
    expect(isBookingDateTimeInPast('', '10:00', now)).toBe(true)
  })

  it('traite une heure absente/malformée comme début de journée', () => {
    // 00:00 du 2026-07-23 est passé à 12:00 le même jour
    expect(isBookingDateTimeInPast('2026-07-23', '', now)).toBe(true)
    // mais début du 2026-07-24 reste futur
    expect(isBookingDateTimeInPast('2026-07-24', 'xx:xx', now)).toBe(false)
  })
})

describe('Fenêtre de réservation en ligne (demande client du 18/08/2026)', () => {
  it('le site ouvre les réservations sur 7 jours', () => {
    expect(PUBLIC_ADVANCE_DAYS).toBe(7)
  })

  it('les adhérents gardent une longueur d’avance', () => {
    // L'accès anticipé est un argument de vente de l'abonnement : il doit
    // rester strictement supérieur à la fenêtre ouverte à tous.
    expect(MEMBER_ADVANCE_DAYS).toBeGreaterThan(PUBLIC_ADVANCE_DAYS)
  })

  it('la fenêtre laisse au club de quoi placer ses cours privés', () => {
    // Trop court, le client ne peut plus s'organiser ; trop long, le club perd
    // la main sur ses créneaux les plus rentables.
    expect(PUBLIC_ADVANCE_DAYS).toBeGreaterThanOrEqual(3)
    expect(PUBLIC_ADVANCE_DAYS).toBeLessThanOrEqual(14)
  })
})
