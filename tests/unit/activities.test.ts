import { describe, it, expect } from 'vitest'
import {
  activities,
  serviceConfigs,
  babysitting,
  getService,
  getActivity,
  resolveLink,
  activitySlugs,
  serviceUrlSlugs,
} from '@/lib/activities'
import { isBookable } from '@/lib/availability'
import { routes } from '@/lib/seo'

describe('getService (résolution par urlSlug SEO)', () => {
  it('résout un service par son segment d’URL', () => {
    expect(getService('tennis-court-lamai')?.slug).toBe('tennis')
    expect(getService('babysitting-lamai')?.slug).toBe('babysitting')
  })

  it('renvoie undefined pour une URL inconnue', () => {
    expect(getService('inconnu')).toBeUndefined()
  })
})

describe('getActivity (résolution par slug interne)', () => {
  it('résout une activité par sa clé interne, babysitting inclus', () => {
    expect(getActivity('tennis')?.urlSlug).toBe('tennis-court-lamai')
    expect(getActivity('babysitting')?.urlSlug).toBe('babysitting-lamai')
  })

  it('renvoie undefined pour un slug inconnu', () => {
    expect(getActivity('inconnu')).toBeUndefined()
  })
})

describe('resolveLink (maillage interne)', () => {
  it('résout les liens spéciaux dans la bonne locale', () => {
    expect(resolveLink('prices', 'fr')).toEqual({ href: '/prices', label: 'Voir les tarifs' })
    expect(resolveLink('prices', 'en')).toEqual({ href: '/prices', label: 'View prices' })
    expect(resolveLink('home', 'en')).toEqual({ href: '/', label: 'Home' })
  })

  it('résout un token de service vers son chemin', () => {
    expect(resolveLink('tennis-court-lamai', 'en')).toEqual({
      href: '/tennis-court-lamai',
      label: 'Tennis',
    })
  })

  it('renvoie null pour un token inconnu', () => {
    expect(resolveLink('inconnu', 'fr')).toBeNull()
  })
})

describe('listes dérivées', () => {
  it('activitySlugs couvre les 6 pôles du menu', () => {
    expect(activitySlugs).toEqual([
      'pickleball',
      'tennis',
      'fitness',
      'restaurant',
      'kids-club',
      'pool',
    ])
  })

  it('serviceUrlSlugs inclut babysitting en plus des 6 pôles', () => {
    expect(serviceUrlSlugs).toHaveLength(7)
    expect(serviceUrlSlugs).toContain('babysitting-lamai')
  })
})

describe('intégrité des données d’activités', () => {
  it('les slugs internes sont uniques', () => {
    const slugs = serviceConfigs.map((a) => a.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('les urlSlug sont uniques', () => {
    const urlSlugs = serviceConfigs.map((a) => a.urlSlug)
    expect(new Set(urlSlugs).size).toBe(urlSlugs.length)
  })

  it('path est toujours dérivé de urlSlug', () => {
    for (const a of serviceConfigs) {
      expect(a.path, a.slug).toBe(`/${a.urlSlug}`)
    }
  })

  it('babysitting est hors menu mais présent dans les services', () => {
    expect(babysitting.inMenu).toBe(false)
    expect(activities).not.toContain(babysitting)
    expect(serviceConfigs).toContain(babysitting)
  })

  it('toute activité réservable en ligne a une config de réservation', () => {
    for (const a of serviceConfigs) {
      if (a.bookable) {
        expect(isBookable(a.slug), `${a.slug} déclarée bookable`).toBe(true)
      }
    }
  })

  it('chaque page service est indexée dans le sitemap (routes)', () => {
    for (const a of serviceConfigs) {
      expect(routes, a.slug).toContain(a.path)
    }
  })
})
