/**
 * Garde-fou de confidentialité (18/08/2026).
 *
 * Les gérants attendent leurs work permits et la police contrôle Samui. Le
 * client a demandé qu'aucun nom ni décompte de gérants n'apparaisse sur le
 * site public le temps que la situation soit régularisée.
 *
 * Ces tests échouent si une de ces mentions revient — par une reprise de
 * texte, un copier-coller depuis une ancienne version, ou une traduction
 * oubliée. À supprimer une fois les permis obtenus et la page « À propos »
 * remise en ligne.
 */
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const read = (p: string) => readFileSync(join(root, p), 'utf8')

const fr = read('messages/fr.json')
const en = read('messages/en.json')
const mentionsLegales = read('src/app/[locale]/mentions-legales/page.tsx')
const confidentialite = read('src/app/[locale]/politique-de-confidentialite/page.tsx')
const footer = read('src/components/layout/footer.tsx')

describe('Aucun gérant nommé sur le site public', () => {
  const pagesPubliques = [
    ['traductions FR', fr],
    ['traductions EN', en],
    ['mentions légales', mentionsLegales],
    ['politique de confidentialité', confidentialite],
  ] as const

  it('le nom du gérant n’apparaît nulle part', () => {
    for (const [nom, contenu] of pagesPubliques) {
      expect(contenu, `${nom} nomme un gérant`).not.toMatch(/Poulain/i)
    }
  })

  it('les pages légales désignent l’entreprise, pas une personne', () => {
    // Une mention légale doit tout de même identifier un responsable :
    // l'entité juridique joue ce rôle en attendant.
    expect(mentionsLegales).toMatch(/Responsable de la publication/)
    expect(mentionsLegales).toMatch(/la direction de/)
    expect(confidentialite).toMatch(/la direction de/)
  })
})

describe('Aucun décompte de gérants', () => {
  it('le site ne parle plus de « deux » fondateurs', () => {
    expect(fr, 'texte FR').not.toMatch(/[Dd]eux jeunes (fondateurs|entrepreneurs)/)
    expect(en, 'texte EN').not.toMatch(/[Tt]wo young French (founders|entrepreneurs)/)
  })

  it('le récit reste au singulier dans les deux langues', () => {
    expect(fr).toMatch(/[Uu]n jeune entrepreneur français/)
    expect(en).toMatch(/A young French entrepreneur/)
  })
})

describe('Aucune signature du prestataire sur le site public', () => {
  it('le pied de page ne renvoie plus vers le concepteur', () => {
    // La prestation n'est pas exercée depuis le territoire thaïlandais : la
    // mention publique n'a pas lieu d'y figurer.
    expect(footer).not.toMatch(/vbweb\.fr/i)
    expect(mentionsLegales).not.toMatch(/vbweb\.fr/i)
  })
})

describe('La page À propos est masquée sans être supprimée', () => {
  const aboutPage = read('src/app/[locale]/a-propos/page.tsx')
  const seo = read('src/lib/seo.ts')
  const navbar = read('src/components/layout/navbar.tsx')

  it('elle demande à ne pas être indexée', () => {
    expect(aboutPage).toMatch(/robots:\s*\{\s*index:\s*false/)
  })

  it('elle ne figure plus dans le sitemap ni dans le menu', () => {
    // Seule la ligne active compte : les commentaires d'explication en
    // contiennent le chemin, d'où la recherche sur une entrée de liste.
    expect(seo).not.toMatch(/^\s*'\/a-propos',\s*$/m)
    expect(navbar).not.toMatch(/^\s*\{ to: '\/a-propos'/m)
  })

  it('elle reste accessible : le fichier de page existe toujours', () => {
    expect(aboutPage).toMatch(/export default function AboutPage/)
  })
})
