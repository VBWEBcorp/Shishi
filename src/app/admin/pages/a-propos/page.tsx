'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ResponsiveImageField } from '@/components/admin/field-editor'
import type { ResponsiveImageValue } from '@/lib/responsive-image'

const defaults = {
  hero: {
    eyebrow: 'À propos',
    title: 'Le social club resort du sud de Koh Samui',
    description:
      'À Lamai, Shi Shi Samui réunit le sport, le bien-être et la convivialité dans un même lieu de vie. Un club premium pensé pour les résidents, expatriés et voyageurs en quête d\'un quotidien actif sous les tropiques.',
    image: '/photos/pool.jpg',
  },
  story: {
    title: 'Un lieu de vie, pas seulement un club',
    paragraph1: 'Shi Shi Samui est né d\'une envie simple : créer, au sud de Koh Samui, un endroit où l\'on vient bouger, se détendre et se retrouver. Tout est réuni pour profiter, seul, entre amis ou en famille.',
    paragraph2: 'Plus qu\'une salle ou un terrain, c\'est un véritable social club tropical : on s\'entraîne le matin et on déjeune au bord de l\'eau, les enfants jouent pendant que les parents soufflent.',
  },
  complex: {
    title: 'Tout ce qu\'il faut pour une journée parfaite',
    description: 'Six pôles à deux pas les uns des autres, à réserver en ligne en moins d\'une minute.',
  },
  values: [
    { title: 'Sport', description: 'Des installations de qualité pour jouer et s\'entraîner toute l\'année, du débutant au passionné.' },
    { title: 'Bien-être', description: 'Piscine, cuisine healthy et cadre tropical : prendre soin de soi en profitant de l\'instant.' },
    { title: 'Convivialité', description: 'Un lieu pensé pour les rencontres, la famille et la communauté locale de Lamai.' },
  ],
  gallery: ['/photos/pool.jpg', '/photos/restaurant.jpg', '/photos/fitness.jpg', '/photos/kids-club.jpg'],
}

const defaultsEn = {
  hero: {
    eyebrow: 'About',
    title: 'The social club resort of South Koh Samui',
    description:
      'In Lamai, Shi Shi Samui brings sport, wellness and good company together in one place to live. A premium club designed for residents, expats and travellers after an active tropical lifestyle.',
    image: '/photos/pool.jpg',
  },
  story: {
    title: 'A place to live, not just a club',
    paragraph1:
      'Shi Shi Samui was born from a simple idea: to create, in the south of Koh Samui, a place to move, unwind and connect. Everything in one spot to enjoy, solo, with friends or as a family.',
    paragraph2:
      "More than a gym or a court, it's a true tropical social club: train in the morning and have lunch by the water, let the kids play while the parents relax.",
  },
  complex: {
    title: 'Everything you need for a perfect day',
    description: 'Six hubs steps away from each other, bookable online in under a minute.',
  },
  values: [
    { title: 'Sport', description: 'Quality facilities to play and train all year round, from beginner to enthusiast.' },
    { title: 'Wellness', description: 'Pool, healthy food and a tropical setting: taking care of yourself while enjoying the moment.' },
    { title: 'Good company', description: 'A place made for meeting people, family time and the local Lamai community.' },
  ],
  gallery: ['/photos/pool.jpg', '/photos/restaurant.jpg', '/photos/fitness.jpg', '/photos/kids-club.jpg'],
}

export default function AdminAboutPage() {
  return (
    <PageEditor pageId="about" title="Page À propos" defaultContent={defaults} defaultContentEn={defaultsEn}>
      {(content, update) => (
        <>
          <SectionEditor title="Hero">
            <FieldEditor label="Accroche" value={content.hero?.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.hero?.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" value={content.hero?.description} onChange={(v) => update('hero.description', v)} type="textarea" />
            <ResponsiveImageField label="Image" value={content.hero?.image} onChange={(v) => update('hero.image', v)} />
          </SectionEditor>

          <SectionEditor title="Notre histoire">
            <FieldEditor label="Titre" value={content.story?.title} onChange={(v) => update('story.title', v)} />
            <FieldEditor label="Paragraphe 1" value={content.story?.paragraph1} onChange={(v) => update('story.paragraph1', v)} type="textarea" />
            <FieldEditor label="Paragraphe 2" value={content.story?.paragraph2} onChange={(v) => update('story.paragraph2', v)} type="textarea" />
          </SectionEditor>

          <SectionEditor title="Le complexe">
            <FieldEditor label="Titre" value={content.complex?.title} onChange={(v) => update('complex.title', v)} />
            <FieldEditor label="Description" value={content.complex?.description} onChange={(v) => update('complex.description', v)} type="textarea" />
          </SectionEditor>

          <SectionEditor title="Valeurs (3 piliers)">
            {content.values?.map((val: any, i: number) => (
              <div key={i} className="p-4 border border-border/30 rounded-lg space-y-3">
                <FieldEditor label={`Valeur ${i + 1} - Titre`} value={val.title} onChange={(v) => {
                  const newValues = [...content.values]
                  newValues[i] = { ...newValues[i], title: v }
                  update('values', newValues)
                }} />
                <FieldEditor label="Description" value={val.description} onChange={(v) => {
                  const newValues = [...content.values]
                  newValues[i] = { ...newValues[i], description: v }
                  update('values', newValues)
                }} type="textarea" />
              </div>
            ))}
          </SectionEditor>

          <SectionEditor title="Galerie photos">
            {content.gallery?.map((img: ResponsiveImageValue, i: number) => (
              <ResponsiveImageField
                key={i}
                label={`Image ${i + 1}`}
                value={img}
                onChange={(v) => {
                  const newGallery = [...content.gallery]
                  newGallery[i] = v
                  update('gallery', newGallery)
                }}
              />
            ))}
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
