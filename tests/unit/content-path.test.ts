/**
 * Ce que fait réellement l'espace « Contenu du site » quand le client tape un
 * texte ou dépose une photo. Le risque couvert ici n'est pas une erreur à
 * l'écran — l'admin se remplit toujours normalement — mais une structure
 * enregistrée que la page publique ne sait pas relire : la modification semble
 * prise en compte et n'apparaît jamais en ligne.
 */
import { describe, it, expect } from 'vitest'

import { readPath, writePath } from '@/lib/content-path'
import { editablePages, getEditablePage } from '@/lib/editable-pages'

describe('Le client modifie un TEXTE', () => {
  it('un titre saisi se retrouve là où la page publique le lit', () => {
    const next = writePath({}, 'hero.title', 'Bienvenue au club')
    expect(next).toEqual({ hero: { title: 'Bienvenue au club' } })
    expect(readPath(next, 'hero.title')).toBe('Bienvenue au club')
  })

  it('modifier un champ ne touche pas les autres', () => {
    const before = { hero: { title: 'Titre', description: 'Texte' }, cta: { button: 'Réserver' } }
    const after = writePath(before, 'hero.title', 'Nouveau titre')
    expect(after.hero.description).toBe('Texte')
    expect(after.cta.button).toBe('Réserver')
    // L'objet d'origine n'est jamais muté (sinon React ne rafraîchirait pas).
    expect(before.hero.title).toBe('Titre')
  })

  it('vider un champ enregistre bien une chaîne vide, pas une suppression', () => {
    const after = writePath({ hero: { title: 'Titre' } }, 'hero.title', '')
    expect(after.hero.title).toBe('')
  })

  it('un texte à trois niveaux (valeurs du bandeau) arrive au bon endroit', () => {
    const after = writePath({}, 'values.0.text', 'Tennis toute l’année')
    expect(Array.isArray(after.values)).toBe(true)
    expect(after.values[0]).toEqual({ text: 'Tennis toute l’année' })
  })
})

describe('Le client change une PHOTO', () => {
  it('une photo de galerie crée un TABLEAU, pas un objet indexé', () => {
    const after = writePath({}, 'gallery.0', '/photos/tennis.webp')
    // Le point critique : la page publique fait `gallery.map(...)`.
    expect(Array.isArray(after.gallery)).toBe(true)
    expect(after.gallery).toEqual(['/photos/tennis.webp'])
  })

  it('remplacer la 3e photo garde les deux premières', () => {
    const before = { gallery: ['/a.webp', '/b.webp', '/c.webp'] }
    const after = writePath(before, 'gallery.2', '/nouveau.webp')
    expect(after.gallery).toEqual(['/a.webp', '/b.webp', '/nouveau.webp'])
  })

  it('accepte une photo à deux formats (ordinateur + téléphone)', () => {
    const paire = { desktop: '/paysage.webp', mobile: '/portrait.webp' }
    const after = writePath({}, 'hero.image', paire)
    expect(readPath(after, 'hero.image')).toEqual(paire)
  })

  it('répare une structure incohérente au lieu de la propager', () => {
    // Un contenu ancien où `gallery` serait un objet : on doit repartir sur un
    // tableau, sinon la galerie resterait invisible en ligne.
    const after = writePath({ gallery: { '0': '/vieux.webp' } }, 'gallery.0', '/neuf.webp')
    expect(Array.isArray(after.gallery)).toBe(true)
    expect(after.gallery[0]).toBe('/neuf.webp')
  })
})

describe('readPath', () => {
  it('ne casse pas sur un chemin qui n’existe pas encore', () => {
    expect(readPath({}, 'hero.title')).toBeUndefined()
    expect(readPath({ hero: null }, 'hero.title')).toBeUndefined()
    expect(readPath({}, '')).toBeUndefined()
  })

  it('relit ce qui vient d’être écrit, quel que soit le chemin', () => {
    for (const path of ['h1', 'hero.title', 'values.2.text', 'gallery.3', 'faq.1.q']) {
      const written = writePath({}, path, 'valeur')
      expect(readPath(written, path), path).toBe('valeur')
    }
  })
})

describe('Catalogue des pages modifiables', () => {
  it('couvre les pages que le client doit pouvoir changer', () => {
    const ids = editablePages.map((p) => p.id)
    for (const id of ['home', 'about', 'services', 'prices', 'contact']) {
      expect(ids, `page ${id} absente`).toContain(id)
    }
    // Les pages activités, qui n'étaient pas modifiables du tout auparavant.
    for (const slug of ['tennis', 'fitness', 'pool', 'kids-club', 'pickleball', 'restaurant']) {
      expect(ids, `activité ${slug} absente`).toContain(`service-${slug}`)
    }
  })

  it('chaque page a un aperçu, des sections et des champs', () => {
    for (const page of editablePages) {
      expect(page.previewPath, `${page.id} : chemin d'aperçu`).toMatch(/^\//)
      expect(page.sections.length, `${page.id} : sections`).toBeGreaterThan(0)
      const fields = page.sections.flatMap((s) => s.fields)
      expect(fields.length, `${page.id} : champs`).toBeGreaterThan(0)
    }
  })

  it('chaque page propose du TEXTE et des PHOTOS dans les deux langues', () => {
    for (const page of editablePages) {
      const types = page.sections.flatMap((s) => s.fields.map((f) => f.type))
      expect(types.some((t) => t === 'text' || t === 'textarea'), `${page.id} : texte`).toBe(true)
      // Seule la page liste des activités n'a pas de photo propre à elle.
      if (page.id !== 'services') {
        expect(types.some((t) => t === 'image' || t === 'video'), `${page.id} : photo`).toBe(true)
      }
      expect(page.defaults.fr, `${page.id} : défauts FR`).toBeTruthy()
      expect(page.defaults.en, `${page.id} : défauts EN`).toBeTruthy()
    }
  })

  it('aucun chemin de champ n’est déclaré deux fois sur une même page', () => {
    for (const page of editablePages) {
      const keys = page.sections.flatMap((s) => s.fields.map((f) => f.key))
      expect(new Set(keys).size, `${page.id} : doublon de champ`).toBe(keys.length)
    }
  })

  it('les valeurs de départ sont réellement atteignables par leur chemin', () => {
    // Un champ dont le chemin ne correspond à aucun défaut afficherait une case
    // vide au client alors que la page, elle, montre bien un texte.
    const page = getEditablePage('home')!
    for (const key of ['hero.title', 'story.image', 'cta.button', 'values.0.title']) {
      expect(readPath(page.defaults.fr, key), key).toBeDefined()
      expect(readPath(page.defaults.en, key), key).toBeDefined()
    }
  })

  it('une activité expose bien ses textes, sa galerie et son référencement', () => {
    const tennis = getEditablePage('service-tennis')!
    const keys = tennis.sections.flatMap((s) => s.fields.map((f) => f.key))
    expect(keys).toContain('h1')
    expect(keys).toContain('description')
    expect(keys).toContain('gallery.0')
    expect(keys).toContain('metaTitle')
    expect(tennis.previewPath).toBe('/tennis-court-lamai')
    expect(tennis.defaults.fr.h1).not.toBe(tennis.defaults.en.h1)
  })
})
