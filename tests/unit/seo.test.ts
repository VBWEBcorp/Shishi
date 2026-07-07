import { describe, it, expect } from 'vitest'
import {
  buildTitle,
  routes,
  mapsDirectionsUrl,
  mapsEmbedUrl,
  siteConfig,
} from '@/lib/seo'

describe('buildTitle', () => {
  it('renvoie le nom du site sans page', () => {
    expect(buildTitle()).toBe('Shi Shi Samui')
  })

  it('préfixe le titre de la page au nom du site', () => {
    expect(buildTitle('Tennis')).toBe('Tennis - Shi Shi Samui')
  })
})

describe('routes', () => {
  it('inclut la home et les pages transverses', () => {
    expect(routes).toContain('/')
    expect(routes).toContain('/prices')
    expect(routes).toContain('/book-now')
    expect(routes).toContain('/contact-location')
  })

  it('ne contient pas de doublon', () => {
    expect(new Set(routes).size).toBe(routes.length)
  })
})

describe('URLs Google Maps', () => {
  it('l’URL d’itinéraire encode la requête maps', () => {
    expect(mapsDirectionsUrl).toContain(encodeURIComponent(siteConfig.mapsQuery))
    expect(mapsDirectionsUrl).toContain('https://www.google.com/maps/search/')
  })

  it('l’URL d’embed utilise les coordonnées de Lamai', () => {
    expect(mapsEmbedUrl).toContain(`${siteConfig.geo.lat},${siteConfig.geo.lon}`)
    expect(mapsEmbedUrl).toContain('output=embed')
  })
})
