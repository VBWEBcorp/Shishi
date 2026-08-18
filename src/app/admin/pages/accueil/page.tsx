'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ResponsiveImageField } from '@/components/admin/field-editor'
import { VideoField } from '@/components/admin/video-field'

const defaults = {
  hero: {
    eyebrow: 'Lamai · Koh Samui · Thaïlande',
    title: 'Le social club resort premium du sud de Samui',
    description:
      'Sport, bien-être et convivialité au même endroit. Tennis, le repaire du pickleball sur l\'île, une salle premium, un restaurant healthy, un kids club et une piscine. Réservez en ligne en moins d\'une minute.',
    video: '/videos/hero-pool.mp4',
    image: '/photos/pool-panorama-portrait.webp',
  },
  story: {
    eyebrow: 'Notre histoire',
    title: 'Un lieu de vie, pas seulement un club',
    paragraph1:
      'Shi Shi Samui est né d\'une envie simple : créer, au sud de Koh Samui, un endroit où l\'on vient bouger, se détendre et se retrouver. Tout est réuni pour profiter, seul, entre amis ou en famille.',
    paragraph2:
      'Plus qu\'une salle ou un terrain, c\'est un véritable social club tropical : on s\'entraîne le matin et on déjeune au bord de l\'eau, les enfants jouent pendant que les parents soufflent.',
    image: '/photos/pool-grand-angle-portrait.webp',
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

const defaultsEn = {
  hero: {
    eyebrow: 'Lamai · Koh Samui · Thailand',
    title: 'The premium social club resort of South Samui',
    description:
      "Sport, wellness and good company in one place. Tennis, the island's home of pickleball, a premium gym, a healthy restaurant, a kids club and a pool. Book your session online in under a minute.",
    video: '/videos/hero-pool.mp4',
    image: '/photos/pool-panorama-portrait.webp',
  },
  story: {
    eyebrow: 'Our story',
    title: 'A place to live, not just a club',
    paragraph1:
      'Shi Shi Samui was born from a simple idea: to create, in the south of Koh Samui, a place to move, unwind and connect. Everything in one spot to enjoy, solo, with friends or as a family.',
    paragraph2:
      "More than a gym or a court, it's a true tropical social club: train in the morning and have lunch by the water, let the kids play while the parents relax.",
    image: '/photos/pool-grand-angle-portrait.webp',
  },
  cta: {
    eyebrow: 'Ready to play?',
    title: 'Book your next session',
    description:
      'Tennis, pickleball, fitness, pool or kids club: book online in under a minute, instant confirmation.',
    button: 'Book a court',
  },
  values: [
    { title: 'Sport', text: 'Tennis, pickleball and a premium gym to move all year round.' },
    { title: 'Wellness', text: 'Pool, healthy food and a tropical setting to recharge.' },
    { title: 'Social', text: 'A social club for family, friends and the Lamai community.' },
  ],
}

export default function AdminHomePage() {
  return (
    <PageEditor pageId="home" title="Page d'accueil" defaultContent={defaults} defaultContentEn={defaultsEn}>
      {(content, update) => (
        <>
          <SectionEditor title="Hero">
            <FieldEditor label="Accroche" value={content.hero?.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre principal" value={content.hero?.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" value={content.hero?.description} onChange={(v) => update('hero.description', v)} type="textarea" />
            <VideoField
              label="Vidéo de fond"
              value={content.hero?.video ?? ''}
              onChange={(v) => update('hero.video', v)}
            />
            <ResponsiveImageField
              label="Photo de fond (si pas de vidéo)"
              value={content.hero?.image}
              onChange={(v) => update('hero.image', v)}
            />
          </SectionEditor>

          <SectionEditor title="Notre histoire">
            <FieldEditor label="Accroche" value={content.story?.eyebrow} onChange={(v) => update('story.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.story?.title} onChange={(v) => update('story.title', v)} />
            <FieldEditor label="Paragraphe 1" value={content.story?.paragraph1} onChange={(v) => update('story.paragraph1', v)} type="textarea" />
            <FieldEditor label="Paragraphe 2" value={content.story?.paragraph2} onChange={(v) => update('story.paragraph2', v)} type="textarea" />
            <ResponsiveImageField label="Image" value={content.story?.image} onChange={(v) => update('story.image', v)} />
          </SectionEditor>

          <SectionEditor title="Appel à l'action (CTA)">
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
