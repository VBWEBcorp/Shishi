'use client'

import { PageEditor } from '@/components/admin/page-editor'
import { FieldEditor, SectionEditor, ImageField } from '@/components/admin/field-editor'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

const defaults = {
  hero: {
    eyebrow: 'Nos activités',
    title: 'Tout pour une journée active à Lamai',
    description: 'Sport, bien-être et convivialité au même endroit, à deux pas les uns des autres. Réservez en ligne en moins d\'une minute.',
    image: '/photos/fitness.jpg',
  },
  services: [
    { title: 'Tennis', description: 'Courts de qualité au sud de Koh Samui : simple, double, coaching et location de raquette. 600 ฿/heure, ouvert 8h–20h.' },
    { title: 'Pickleball', description: 'Le repaire du pickleball à Koh Samui : terrains dédiés, initiations et matchs conviviaux pour tous les niveaux.' },
    { title: 'Salle de sport', description: 'Espace fitness entièrement équipé (force, cardio, functional). 250 ฿/jour, 1000 ฿/semaine, 1500 ฿/mois. Ouvert 8h–20h.' },
    { title: 'Restaurant', description: 'Carte fraîche et healthy au bord de la piscine : smoothies, bowls et assiettes feel-good toute la journée.' },
    { title: 'Kids Club', description: 'Espace sûr et ludique pour les enfants, activités encadrées et babysitting. 200 ฿/heure, ouvert 8h–16h.' },
    { title: 'Piscine', description: 'Détente au bord de la piscine ou journée entière à lézarder, le restaurant à deux pas. 100 ฿/accès journée.' },
  ],
}

export default function AdminServicesPage() {
  return (
    <PageEditor pageId="services" title="Page Services" defaultContent={defaults}>
      {(content, update) => (
        <>
          <SectionEditor title="Hero">
            <FieldEditor label="Accroche" value={content.hero?.eyebrow} onChange={(v) => update('hero.eyebrow', v)} />
            <FieldEditor label="Titre" value={content.hero?.title} onChange={(v) => update('hero.title', v)} />
            <FieldEditor label="Description" value={content.hero?.description} onChange={(v) => update('hero.description', v)} type="textarea" />
            <ImageField label="Image" value={content.hero?.image} onChange={(v) => update('hero.image', v)} />
          </SectionEditor>

          <SectionEditor title="Liste des services">
            {content.services?.map((svc: any, i: number) => (
              <div key={i} className="p-4 border border-border/30 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-medium">Service {i + 1}</span>
                  <button
                    onClick={() => {
                      const newServices = content.services.filter((_: any, j: number) => j !== i)
                      update('services', newServices)
                    }}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <FieldEditor label="Titre" value={svc.title} onChange={(v) => {
                  const newServices = [...content.services]
                  newServices[i] = { ...newServices[i], title: v }
                  update('services', newServices)
                }} />
                <FieldEditor label="Description" value={svc.description} onChange={(v) => {
                  const newServices = [...content.services]
                  newServices[i] = { ...newServices[i], description: v }
                  update('services', newServices)
                }} type="textarea" />
              </div>
            ))}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                update('services', [...(content.services || []), { title: '', description: '' }])
              }}
            >
              <Plus className="size-4" />
              Ajouter un service
            </Button>
          </SectionEditor>
        </>
      )}
    </PageEditor>
  )
}
