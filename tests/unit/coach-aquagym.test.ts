import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import {
  activities,
  bookableActivities,
  resolveLink,
  tennisCoaching,
} from '@/lib/activities'
import {
  bookingInterval,
  computeAvailability,
  generateSlots,
  isBookable,
  minPublicMinutes,
  resourceSlugs,
  toMinutes,
} from '@/lib/availability'
import {
  getActivityBySlug,
  getBookingAmountForMinutes,
  hasVariableDuration,
  PRICE_TIERS,
} from '@/lib/booking-pricing'
import { routes } from '@/lib/seo'

const r = (from: string, to: string) => ({ start: toMinutes(from), end: toMinutes(to) })

describe('Cours de tennis : une activité du calendrier, pas un pôle', () => {
  it('est réservable et connue du moteur', () => {
    expect(isBookable('tennis-coaching')).toBe(true)
    expect(getActivityBySlug('tennis-coaching')?.name.fr).toBe('Cours de tennis')
    expect(bookableActivities.map((a) => a.slug)).toContain('tennis-coaching')
  })

  it('ne rejoint ni le menu ni les tuiles (les six pôles restent six)', () => {
    expect(activities.map((a) => a.slug)).not.toContain('tennis-coaching')
    expect(tennisCoaching.inMenu).toBe(false)
  })

  it('pointe vers la page coach', () => {
    expect(tennisCoaching.path).toBe('/tennis-coaching-lamai')
    expect(resolveLink('coaching', 'fr')?.href).toBe('/tennis-coaching-lamai')
  })
})

describe('Prix du cours (flyer : 600 de coaching + 600 de court)', () => {
  it('1 h = 1 200 ฿, 1 h 30 = 1 800 ฿, 2 h = 2 400 ฿', () => {
    expect(getBookingAmountForMinutes('tennis-coaching', 1, 60)).toBe(1200)
    expect(getBookingAmountForMinutes('tennis-coaching', 1, 90)).toBe(1800)
    expect(getBookingAmountForMinutes('tennis-coaching', 1, 120)).toBe(2400)
  })

  it('le prix ne double pas avec un deuxième joueur (prix du cours, pas par tête)', () => {
    expect(getBookingAmountForMinutes('tennis-coaching', 2, 60)).toBe(1200)
  })

  it('la location seule reste à 600 ฿ l’heure et 300 ฿ la demi-heure', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 60)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 1, 30)).toBe(300)
  })

  it('la grille affiche l’heure et le forfait dès 6 cours', () => {
    expect(PRICE_TIERS['tennis-coaching'].map((t) => t.amount)).toEqual([1200, 1000])
    expect(PRICE_TIERS.aquagym.map((t) => t.amount)).toEqual([400])
  })
})

describe('Le cours se vend à l’heure minimum, côté site seulement', () => {
  it('durée variable, minimum 1 h sur le site, 30 min dans l’admin', () => {
    expect(hasVariableDuration('tennis-coaching')).toBe(true)
    expect(minPublicMinutes('tennis-coaching')).toBe(60)
    expect(minPublicMinutes('tennis-coaching', 'admin')).toBe(30)
    expect(minPublicMinutes('tennis')).toBe(30)
  })

  it('refuse 30 min de cours depuis le site, accepte 1 h et 1 h 30', () => {
    expect(bookingInterval('tennis-coaching', '10:00', 30, 'public')).toBeNull()
    expect(bookingInterval('tennis-coaching', '10:00', 60, 'public')).toEqual(r('10:00', '11:00'))
    expect(bookingInterval('tennis-coaching', '10:30', 90, 'public')).toEqual(r('10:30', '12:00'))
  })

  it('l’admin garde la demi-heure pour le cours', () => {
    expect(bookingInterval('tennis-coaching', '10:00', 30, 'admin')).toEqual(r('10:00', '10:30'))
  })

  it('dernier départ public à 21:00 (une heure avant la fermeture), 21:30 pour la location', () => {
    const coaching = generateSlots('tennis-coaching')
    expect(coaching[0]).toBe('07:00')
    expect(coaching.at(-1)).toBe('21:00')
    expect(generateSlots('tennis').at(-1)).toBe('21:30')
  })

  it('un départ qui ne laisse pas l’heure entière avant un créneau pris est grisé', () => {
    // Le court est pris à 18:00 : 17:30 n'offre que 30 min, donc pas de cours.
    const grid = computeAvailability('tennis-coaching', [r('18:00', '19:00')])
    const at = (t: string) => grid.find((s) => s.time === t)!
    expect(at('17:00').available).toBe(1)
    expect(at('17:30').available).toBe(0)
    expect(at('18:00').available).toBe(0)
    expect(at('19:00').available).toBe(1)
  })

  it('la location, elle, garde 17:30 réservable pour 30 min', () => {
    const grid = computeAvailability('tennis', [r('18:00', '19:00')])
    expect(grid.find((s) => s.time === '17:30')!.available).toBe(1)
  })
})

describe('Un seul court : location et cours se bloquent mutuellement', () => {
  it('les deux activités comptent sur la même ressource', () => {
    expect(resourceSlugs('tennis').sort()).toEqual(['tennis', 'tennis-coaching'])
    expect(resourceSlugs('tennis-coaching').sort()).toEqual(['tennis', 'tennis-coaching'])
  })

  it('les autres activités restent seules', () => {
    expect(resourceSlugs('kids-club')).toEqual(['kids-club'])
    expect(resourceSlugs('pool')).toEqual(['pool'])
  })

  it('la requête de disponibilité filtre sur toute la ressource', () => {
    const src = readFileSync(resolve(__dirname, '../../src/lib/availability-query.ts'), 'utf8')
    expect(src).toMatch(/activitySlug:\s*\{\s*\$in:\s*resourceSlugs\(activitySlug\)\s*\}/)
  })
})

describe('Pages coach et aquagym', () => {
  const page = (p: string) => readFileSync(resolve(__dirname, '../../src/app/[locale]', p), 'utf8')

  it('sont dans le sitemap', () => {
    expect(routes).toContain('/tennis-coaching-lamai')
    expect(routes).toContain('/aquagym-lamai')
  })

  it('la page coach intègre le calendrier sur le cours, le flyer et « qui je suis »', () => {
    const src = page('tennis-coaching-lamai/page.tsx')
    expect(src).toMatch(/<BookingWidget initialActivity=\{tennisCoaching\.slug\} \/>/)
    expect(src).toContain('coach-paul-flyer.webp')
    expect(src).toContain('Qui je suis ?')
    expect(src).toContain('Paiement directement au Shi Shi Samui')
  })

  it('la page aquagym n’a pas de calendrier et renvoie vers le WhatsApp de Paul', () => {
    const src = page('aquagym-lamai/page.tsx')
    expect(src).not.toContain('BookingWidget')
    expect(src).toContain('https://wa.me/qr/5XV6VKX2BOCCF1')
    expect(src).toContain('aquagym-whatsapp-qr.png')
    expect(src).toContain('400 THB')
    expect(src).toContain('45 minutes')
  })

  it('aucun tiret long dans les textes des deux pages', () => {
    for (const p of ['tennis-coaching-lamai/page.tsx', 'aquagym-lamai/page.tsx']) {
      expect(page(p)).not.toMatch(/[‒–—―−]/)
    }
  })
})
