'use client'

import { CalendarCheck, MessageCircle } from 'lucide-react'
import { Suspense } from 'react'

import { BookingForm } from '@/app/[locale]/book-now/booking-form'
import type { Locale } from '@/lib/activities'
import { siteConfig } from '@/lib/seo'

/**
 * Le module de réservation, au bas de la page de l'activité.
 *
 * Demande du club : « tu envoies la page tennis, et en bas de la page tennis il
 * y a le module de réservation, donc le mec réserve directement à partir de
 * là ». Un lien, une page : l'information puis le bouton, sans renvoyer le
 * visiteur ailleurs et sans lui faire rechoisir l'activité qu'il vient de lire.
 *
 * L'activité est donc pré-remplie. Pour ce qui ne se réserve pas par créneau
 * (le restaurant, le baby-sitting), on affiche WhatsApp plutôt qu'un formulaire
 * qui n'aurait rien à proposer.
 */
export function ServiceBooking({
  slug,
  locale,
  bookable,
  activityName,
}: {
  slug: string
  locale: Locale
  /** L'activité a-t-elle un moteur de créneaux ? */
  bookable: boolean
  activityName: string
}) {
  const fr = locale === 'fr'

  const message = fr
    ? `Bonjour Shi Shi Samui ! Je souhaite des informations sur : ${activityName}.`
    : `Hi Shi Shi Samui! I'd like some information about: ${activityName}.`
  const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(message)}`

  return (
    <section id="reserver" className="scroll-mt-24 border-t border-border bg-sand">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="flex flex-col items-center text-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <CalendarCheck className="size-4" aria-hidden />
            {fr ? 'Réserver' : 'Book'}
          </span>
          <h2 className="mt-4 max-w-2xl font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.5rem]">
            {fr ? `Réservez votre ${activityName.toLowerCase()}` : `Book your ${activityName.toLowerCase()}`}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {bookable
              ? fr
                ? 'Choisissez votre date et votre créneau. Le club vous confirme par e-mail.'
                : 'Pick your date and time slot. The club confirms by email.'
              : fr
                ? 'Cette activité se réserve directement avec le club.'
                : 'This one is arranged directly with the club.'}
          </p>
        </div>

        <div className="mt-10">
          {bookable ? (
            <div className="overflow-hidden rounded-3xl bg-card shadow-[0_40px_90px_-30px_oklch(0.16_0_0/0.35)] ring-1 ring-border">
              <Suspense fallback={<div className="h-96 animate-pulse bg-secondary/40" />}>
                <BookingForm bare initialActivity={slug} />
              </Suspense>
            </div>
          ) : (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-3xl bg-card px-6 py-10 text-center ring-1 ring-border">
              <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/15">
                <MessageCircle className="size-7" aria-hidden />
              </span>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {fr
                  ? 'Écrivez-nous sur WhatsApp, nous vous répondons directement.'
                  : 'Message us on WhatsApp and we will get straight back to you.'}
              </p>
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
              >
                <MessageCircle className="size-4" aria-hidden />
                WhatsApp
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
