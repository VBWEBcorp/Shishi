'use client'

import { Suspense, useState } from 'react'

import { BookingVisualPanel, activityBackground } from '@/components/booking-visual-panel'

import { BookingForm } from './booking-form'

/**
 * Widget de réservation à deux panneaux (intégré dans la page /book-now).
 * Le fond du panneau visuel change selon l'activité choisie dans le formulaire.
 */
export function BookingWidget({ initialActivity }: { initialActivity?: string }) {
  // Initialisé avec l'activité de l'URL (rendue côté serveur) → bon fond dès le
  // premier rendu, sans flash ; puis mis à jour au fil des choix de l'utilisateur.
  const [slug, setSlug] = useState(initialActivity || '')
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-[0_40px_90px_-30px_oklch(0.16_0_0/0.35)] ring-1 ring-border">
      <div className="grid lg:grid-cols-[0.82fr_1fr]">
        <BookingVisualPanel image={activityBackground(slug)} />
        <div>
          <Suspense fallback={null}>
            <BookingForm bare initialActivity={initialActivity} onActivityChange={setSlug} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
