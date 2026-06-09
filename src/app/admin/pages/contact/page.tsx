'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'

const defaults = {
  hero: {
    eyebrow: 'Contact',
    title: 'Une question ? Écrivez-nous',
    description: 'Remplissez le formulaire ou contactez-nous directement par WhatsApp. Pour réserver une activité, passez par la page Réservation.',
    image: '/photos/pool-bar.jpg',
  },
  info: {
    phone: '+33 6 51 69 27 02',
    email: 'contact.shishisamui@gmail.com',
    street: 'Lamai',
    postalCode: '84310',
    city: 'Koh Samui',
  },
}

export default function AdminContactPage() {
  return (
    <PageEditor pageId="contact" title="Page Contact" defaultContent={defaults}>
      {(content, update) => (
        <>
          <SectionEditor title="Hero">
            <FieldEditor label="Accroche" value={content.hero?.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.hero?.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" value={content.hero?.description} onChange={(v) => update('hero.description', v)} type="textarea" />
            <ImageField label="Image" value={content.hero?.image} onChange={(v) => update('hero.image', v)} />
          </SectionEditor>

          <SectionEditor title="Informations de contact">
            <FieldEditor label="Téléphone" value={content.info?.phone} onChange={(v) => update('info.phone', v)} placeholder="01 23 45 67 89" />
            <FieldEditor label="Email" value={content.info?.email} onChange={(v) => update('info.email', v)} placeholder="contact@example.com" />
            <FieldEditor label="Adresse" value={content.info?.street} onChange={(v) => update('info.street', v)} placeholder="123 rue Exemple" />
            <FieldEditor label="Code postal" value={content.info?.postalCode} onChange={(v) => update('info.postalCode', v)} placeholder="75001" />
            <FieldEditor label="Ville" value={content.info?.city} onChange={(v) => update('info.city', v)} placeholder="Paris" />
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
