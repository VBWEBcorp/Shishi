'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'

const defaults = {
  hero: {
    eyebrow: 'Lamai · Koh Samui · Thaïlande',
    title: 'Le social club resort premium du sud de Samui',
    description:
      'Sport, bien-être et convivialité au même endroit. Tennis, le repaire du pickleball sur l\'île, une salle premium, un restaurant healthy, un kids club et une piscine. Réservez en ligne en moins d\'une minute.',
    button1: 'Réserver',
    button2: 'Découvrir les activités',
    images: ['/photos/tennis-aerial.jpg', '/photos/pool.jpg', '/photos/restaurant.jpg'],
  },
  story: {
    eyebrow: 'Notre histoire',
    title: 'Un lieu de vie, pas seulement un club',
    paragraph1:
      'Shi Shi Samui est né d\'une envie simple : créer, au sud de Koh Samui, un endroit où l\'on vient bouger, se détendre et se retrouver. Tout est réuni pour profiter, seul, entre amis ou en famille.',
    paragraph2:
      'Plus qu\'une salle ou un terrain, c\'est un véritable social club tropical : on s\'entraîne le matin et on déjeune au bord de l\'eau, les enfants jouent pendant que les parents soufflent.',
    image: '/photos/lounge.jpg',
  },
  cta: {
    eyebrow: 'Prêt à jouer ?',
    title: 'Réservez votre prochaine session',
    description:
      'Tennis, pickleball, fitness, piscine ou kids club : réservez en ligne en moins d\'une minute, confirmation immédiate.',
    button: 'Réserver un terrain',
  },
  values: [
    { title: 'Sport', text: 'Tennis, pickleball et salle premium pour bouger toute l\'année.' },
    { title: 'Bien-être', text: 'Piscine, cuisine healthy et cadre tropical pour se ressourcer.' },
    { title: 'Convivialité', text: 'Un social club pour la famille, les amis et la communauté de Lamai.' },
  ],
}

export default function AdminHomePage() {
  return (
    <PageEditor pageId="home" title="Page d'accueil" defaultContent={defaults}>
      {(content, update) => (
        <>
          <SectionEditor title="Hero">
            <FieldEditor label="Accroche" value={content.hero?.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre principal" value={content.hero?.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" value={content.hero?.description} onChange={(v) => update('hero.description', v)} type="textarea" />
            <FieldEditor label="Bouton 1" value={content.hero?.button1} onChange={(v) => update('hero.button1', v)} />
            <FieldEditor label="Bouton 2" value={content.hero?.button2} onChange={(v) => update('hero.button2', v)} />
            <div className="space-y-3 pt-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Images du slider</p>
              {content.hero?.images?.map((img: string, i: number) => (
                <ImageField
                  key={i}
                  label={`Image ${i + 1}`}
                  value={img}
                  onChange={(v) => {
                    const newImages = [...content.hero.images]
                    newImages[i] = v
                    update('hero.images', newImages)
                  }}
                />
              ))}
            </div>
          </SectionEditor>

          <SectionEditor title="Notre histoire">
            <FieldEditor label="Accroche" value={content.story?.eyebrow} onChange={(v) => update('story.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.story?.title} onChange={(v) => update('story.title', v)} />
            <FieldEditor label="Paragraphe 1" value={content.story?.paragraph1} onChange={(v) => update('story.paragraph1', v)} type="textarea" />
            <FieldEditor label="Paragraphe 2" value={content.story?.paragraph2} onChange={(v) => update('story.paragraph2', v)} type="textarea" />
            <ImageField label="Image" value={content.story?.image} onChange={(v) => update('story.image', v)} />
          </SectionEditor>

          <SectionEditor title="Appel à l'action (CTA)">
            <FieldEditor label="Accroche" value={content.cta?.eyebrow} onChange={(v) => update('cta.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.cta?.title} onChange={(v) => update('cta.title', v)} />
            <FieldEditor label="Description" value={content.cta?.description} onChange={(v) => update('cta.description', v)} type="textarea" />
            <FieldEditor label="Bouton" value={content.cta?.button} onChange={(v) => update('cta.button', v)} />
          </SectionEditor>

          <SectionEditor title="Valeurs (bandeau 3 colonnes)">
            {content.values?.map((val: any, i: number) => (
              <div key={i} className="space-y-3 rounded-lg border border-border/30 p-4">
                <FieldEditor label={`Valeur ${i + 1} - Titre`} value={val.title} onChange={(v) => {
                  const next = [...content.values]; next[i] = { ...next[i], title: v }; update('values', next)
                }} />
                <FieldEditor label="Texte" value={val.text} onChange={(v) => {
                  const next = [...content.values]; next[i] = { ...next[i], text: v }; update('values', next)
                }} type="textarea" />
              </div>
            ))}
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
