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
  fixedMinutes,
  generateSlots,
  isBookable,
  minPublicMinutes,
  resourceSlugs,
  toMinutes,
} from '@/lib/availability'
import {
  getActivityBySlug,
  getBookingAmountForMinutes,
  getCourtPlusPerPerson,
  hasVariableDuration,
  MAX_PARTY_SIZE,
  priceDependsOnPartySize,
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

describe('Prix du cours : 600 ฿ de court + 600 ฿ par participant (club, 05/10/2026)', () => {
  it('seul : 1 h = 1 200 ฿, 1 h 30 = 1 800 ฿, 2 h = 2 400 ฿', () => {
    expect(getBookingAmountForMinutes('tennis-coaching', 1, 60)).toBe(1200)
    expect(getBookingAmountForMinutes('tennis-coaching', 1, 90)).toBe(1800)
    expect(getBookingAmountForMinutes('tennis-coaching', 1, 120)).toBe(2400)
  })

  it('chaque participant ajoute 600 ฿ l’heure : 1 800 ฿ à deux, 2 400 ฿ à trois', () => {
    expect(getBookingAmountForMinutes('tennis-coaching', 2, 60)).toBe(1800)
    expect(getBookingAmountForMinutes('tennis-coaching', 3, 60)).toBe(2400)
    expect(getBookingAmountForMinutes('tennis-coaching', 4, 60)).toBe(3000)
  })

  it('le prix de groupe suit la durée : 3 personnes 1 h 30 = 3 600 ฿', () => {
    expect(getBookingAmountForMinutes('tennis-coaching', 3, 90)).toBe(3600)
  })

  it('le nombre de participants est borné et jamais sous 1', () => {
    expect(getBookingAmountForMinutes('tennis-coaching', 0, 60)).toBe(1200)
    expect(getBookingAmountForMinutes('tennis-coaching', 999, 60)).toBe(600 + 600 * MAX_PARTY_SIZE)
  })

  it('le sélecteur de participants concerne le cours, pas la location du court', () => {
    expect(priceDependsOnPartySize('tennis-coaching')).toBe(true)
    expect(priceDependsOnPartySize('tennis')).toBe(false)
    expect(getCourtPlusPerPerson('tennis-coaching')).toEqual({ court: 600, perPerson: 600 })
  })

  it('la location seule reste à 600 ฿ l’heure et 300 ฿ la demi-heure, quel que soit le nombre de joueurs', () => {
    expect(getBookingAmountForMinutes('tennis', 1, 60)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 4, 60)).toBe(600)
    expect(getBookingAmountForMinutes('tennis', 1, 30)).toBe(300)
  })

  it('la grille affiche l’heure seul, le participant en plus et le forfait dès 6 cours', () => {
    expect(PRICE_TIERS['tennis-coaching'].map((t) => t.amount)).toEqual([1200, 600, 1000])
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

  it('la page aquagym suit l’interrupteur admin : calendrier si ouvert, WhatsApp de Paul sinon', () => {
    const src = page('aquagym-lamai/page.tsx')
    expect(src).toMatch(/activiteOuverte\(await lireReglages\(\), aquagym\.slug\)/)
    expect(src).toMatch(/\{enLigne && \(/)
    expect(src).toContain('export const revalidate = 60')
    expect(src).toMatch(/<BookingWidget initialActivity=\{aquagym\.slug\} \/>/)
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

describe('Cours avec un prof : rangés sous leur activité, les six pôles restent six', () => {
  it('liste le coach de tennis et l’aquagym, avec leurs pages', async () => {
    const { lessons } = await import('@/lib/activities')
    expect(lessons.map((x) => x.path)).toEqual(['/tennis-coaching-lamai', '/aquagym-lamai'])
    expect(lessons.find((x) => x.slug === 'aquagym')?.bookableOnline).toBe(false)
    expect(activities).toHaveLength(6)
  })

  it('le menu, le footer, l’accueil et la page Activités le reprennent', () => {
    const src = (p: string) => readFileSync(resolve(__dirname, '../../src', p), 'utf8')
    expect(src('components/layout/navbar.tsx')).toMatch(/lessonsOf\(a\.slug\)/)
    expect(src('components/layout/footer.tsx')).toMatch(/lessonsOf\(a\.slug\)/)
    expect(src('app/[locale]/page.tsx')).toContain('<LessonsSection />')
    expect(src('app/[locale]/services/page.tsx')).toContain('<LessonsSection />')
  })
})

describe('Aquagym dans le module de réservation', () => {
  it('est réservable, hors menu, rangé sous Piscine', async () => {
    const { aquagym, lessonsOf } = await import('@/lib/activities')
    expect(isBookable('aquagym')).toBe(true)
    expect(bookableActivities.map((a) => a.slug)).toContain('aquagym')
    expect(activities.map((a) => a.slug)).not.toContain('aquagym')
    expect(aquagym.path).toBe('/aquagym-lamai')
    expect(lessonsOf('pool').map((l) => l.slug)).toEqual(['aquagym'])
    expect(lessonsOf('tennis').map((l) => l.slug)).toEqual(['tennis-coaching'])
  })

  it('séance fixe de 45 min, sans sélecteur de durée', () => {
    expect(fixedMinutes('aquagym')).toBe(45)
    expect(fixedMinutes('tennis')).toBeNull()
    expect(hasVariableDuration('aquagym')).toBe(false)
    expect(bookingInterval('aquagym', '10:00', 45, 'public')).toEqual(r('10:00', '10:45'))
    expect(bookingInterval('aquagym', '10:30', 45, 'public')).toEqual(r('10:30', '11:15'))
    expect(bookingInterval('aquagym', '10:00', 30, 'public')).toBeNull()
    expect(bookingInterval('aquagym', '10:00', 60, 'public')).toBeNull()
    expect(bookingInterval('aquagym', '10:00', 45, 'admin')).toEqual(r('10:00', '10:45'))
  })

  it('400 ฿ par personne', () => {
    expect(getBookingAmountForMinutes('aquagym', 1, 45)).toBe(400)
    expect(getBookingAmountForMinutes('aquagym', 3, 45)).toBe(1200)
  })

  it('dernier départ public 19:00 (fin 19:45 avant la fermeture de 20:00)', () => {
    const slots = generateSlots('aquagym')
    expect(slots[0]).toBe('08:00')
    expect(slots.at(-1)).toBe('19:00')
  })

  it('une séance à 10:00 bloque 09:30 et 10:30, pas 09:00 ni 11:00', () => {
    const grid = computeAvailability('aquagym', [r('10:00', '10:45')])
    const at = (t: string) => grid.find((s) => s.time === t)!.available
    expect(at('09:00')).toBe(1)
    expect(at('09:30')).toBe(0)
    expect(at('10:00')).toBe(0)
    expect(at('10:30')).toBe(0)
    expect(at('11:00')).toBe(1)
  })

  it('n’occupe pas le court ni la piscine à la journée', () => {
    expect(resourceSlugs('aquagym')).toEqual(['aquagym'])
  })
})

describe('Aquagym fermée en ligne tant que le club ne l’ouvre pas', () => {
  it('absente des réglages = fermée ; les autres activités restent ouvertes par défaut', async () => {
    const { activiteOuverte, activiteActivee, normaliser } = await import('@/lib/booking-settings')
    const vide = normaliser({ online: true, activities: {} })
    expect(activiteOuverte(vide, 'aquagym')).toBe(false)
    expect(activiteActivee(vide, 'aquagym')).toBe(false)
    expect(activiteOuverte(vide, 'tennis')).toBe(true)
    expect(activiteOuverte(vide, 'tennis-coaching')).toBe(true)
  })

  it('l’interrupteur admin l’ouvre', async () => {
    const { activiteOuverte, normaliser } = await import('@/lib/booking-settings')
    expect(activiteOuverte(normaliser({ online: true, activities: { aquagym: true } }), 'aquagym')).toBe(true)
    expect(activiteOuverte(normaliser({ online: false, activities: { aquagym: true } }), 'aquagym')).toBe(false)
  })
})
