import { describe, it, expect } from 'vitest'
import {
  buildResponsiveImage,
  hasImage,
  primaryImageUrl,
  resolveResponsiveImage,
} from '@/lib/responsive-image'

describe('resolveResponsiveImage — rétro-compatibilité', () => {
  it('une simple URL reste une image unique (tout le contenu existant)', () => {
    expect(resolveResponsiveImage('/photos/pool.jpg')).toEqual({
      desktop: '/photos/pool.jpg',
      mobile: null,
      hasBothFormats: false,
    })
  })

  it('une valeur absente ou vide ne casse rien', () => {
    for (const v of [undefined, null, '', {} as never]) {
      expect(resolveResponsiveImage(v).desktop).toBe('')
      expect(hasImage(v)).toBe(false)
    }
  })
})

describe('resolveResponsiveImage — paire de formats', () => {
  it('deux fichiers distincts activent le second <source>', () => {
    expect(resolveResponsiveImage({ desktop: '/a.webp', mobile: '/b.webp' })).toEqual({
      desktop: '/a.webp',
      mobile: '/b.webp',
      hasBothFormats: true,
    })
  })

  it('une version téléphone vide retombe sur la photo d’ordinateur', () => {
    const r = resolveResponsiveImage({ desktop: '/a.webp', mobile: '' })
    expect(r).toMatchObject({ desktop: '/a.webp', mobile: null, hasBothFormats: false })
  })

  it('deux fois le MÊME fichier ne justifie pas un second <source>', () => {
    const r = resolveResponsiveImage({ desktop: '/a.webp', mobile: '/a.webp' })
    expect(r.hasBothFormats).toBe(false)
  })

  it('seule la version téléphone remplie : on l’affiche partout plutôt que rien', () => {
    const r = resolveResponsiveImage({ desktop: '', mobile: '/portrait.webp' })
    expect(r).toMatchObject({ desktop: '/portrait.webp', mobile: null, hasBothFormats: false })
  })

  it('ignore les espaces autour des URLs collées à la main', () => {
    expect(resolveResponsiveImage({ desktop: '  /a.webp  ', mobile: ' /b.webp ' })).toEqual({
      desktop: '/a.webp',
      mobile: '/b.webp',
      hasBothFormats: true,
    })
  })
})

describe('primaryImageUrl', () => {
  it('donne toujours UNE url — pour og:image, JSON-LD, miniatures', () => {
    expect(primaryImageUrl('/a.webp')).toBe('/a.webp')
    expect(primaryImageUrl({ desktop: '/a.webp', mobile: '/b.webp' })).toBe('/a.webp')
    expect(primaryImageUrl(undefined)).toBe('')
  })
})

describe('buildResponsiveImage — ce que l’admin enregistre', () => {
  it('sans version téléphone, on stocke une simple chaîne', () => {
    expect(buildResponsiveImage('/a.webp', '')).toBe('/a.webp')
    expect(buildResponsiveImage('/a.webp', '   ')).toBe('/a.webp')
  })

  it('avec les deux, on stocke la paire', () => {
    expect(buildResponsiveImage('/a.webp', '/b.webp')).toEqual({
      desktop: '/a.webp',
      mobile: '/b.webp',
    })
  })

  it('deux fichiers identiques retombent sur une simple chaîne', () => {
    expect(buildResponsiveImage('/a.webp', '/a.webp')).toBe('/a.webp')
  })

  it('aller-retour admin → rendu : ce qui est saisi est ce qui est servi', () => {
    const stored = buildResponsiveImage('/desktop.webp', '/mobile.webp')
    expect(resolveResponsiveImage(stored)).toEqual({
      desktop: '/desktop.webp',
      mobile: '/mobile.webp',
      hasBothFormats: true,
    })
  })
})
