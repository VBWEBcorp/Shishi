'use client'

import { HelpCircle, Minus, Plus } from 'lucide-react'
import { useLocale } from 'next-intl'
import { useState } from 'react'

import type { Locale } from '@/i18n/routing'

type Bilingual = { en: string; fr: string }
type Item = { q: Bilingual; a: Bilingual }

const EYEBROW: Bilingual = { en: 'Frequently asked questions', fr: 'Questions fréquentes' }
const TITLE: Bilingual = {
  en: 'Everything you need to know before you visit',
  fr: 'Tout ce qu’il faut savoir avant de venir',
}

const ITEMS: Item[] = [
  {
    q: { en: 'How do I book an activity?', fr: 'Comment réserver une activité ?' },
    a: {
      en: 'Pick an activity, choose your date and time slot, and confirm online in a few taps. You receive an instant confirmation by email.',
      fr: 'Choisissez une activité, votre date et votre créneau, et confirmez en ligne en quelques clics. Vous recevez une confirmation immédiate par e-mail.',
    },
  },
  {
    q: { en: 'Do I need to be a member?', fr: 'Faut-il être membre ?' },
    a: {
      en: 'No. Shi Shi is open to everyone: book a single session or a day pass without any membership. Memberships simply offer better rates for regulars.',
      fr: 'Non. Shi Shi est ouvert à tous : réservez une session ou un pass journée sans abonnement. Les abonnements offrent simplement de meilleurs tarifs aux habitués.',
    },
  },
  {
    q: { en: 'Are there day passes?', fr: 'Proposez-vous des pass journée ?' },
    a: {
      en: 'Yes. A pool day pass and fitness day passes are available, as well as weekly and monthly options for the gym.',
      fr: 'Oui. Un pass journée piscine et des pass journée fitness sont disponibles, ainsi que des formules à la semaine et au mois pour la salle.',
    },
  },
  {
    q: { en: 'How does the kids club work?', fr: 'Comment fonctionne le kids club ?' },
    a: {
      en: 'A safe, supervised space with activities for children, plus babysitting on request — so the whole family can enjoy the club.',
      fr: 'Un espace sûr et encadré avec des activités pour les enfants, et du babysitting sur demande — pour que toute la famille profite du club.',
    },
  },
  {
    q: { en: 'What is pickleball?', fr: 'Qu’est-ce que le pickleball ?' },
    a: {
      en: 'A fast, fun racket sport that mixes tennis, badminton and ping-pong. Beginner-friendly and very social — our signature, on dedicated courts in Lamai.',
      fr: 'Un sport de raquette rapide et fun mêlant tennis, badminton et ping-pong. Accessible et très convivial — notre signature, sur des terrains dédiés à Lamai.',
    },
  },
  {
    q: { en: 'Is the restaurant open to everyone?', fr: 'Le restaurant est-il ouvert à tous ?' },
    a: {
      en: 'Yes. The healthy restaurant and pool bar welcome members and visitors alike, all day long — no booking needed to come and eat.',
      fr: 'Oui. Le restaurant healthy et le pool bar accueillent membres et visiteurs, toute la journée — aucune réservation nécessaire pour venir manger.',
    },
  },
  {
    q: { en: 'Where are you located?', fr: 'Où êtes-vous situés ?' },
    a: {
      en: 'In Lamai, in the south of Koh Samui, Thailand — a short drive from the main beaches and easy to reach for expats and visitors.',
      fr: 'À Lamai, au sud de Koh Samui, en Thaïlande — à quelques minutes des plages principales et facile d’accès pour les expatriés et les visiteurs.',
    },
  },
  {
    q: { en: 'Can I rent equipment?', fr: 'Peut-on louer du matériel ?' },
    a: {
      en: 'Yes. Rackets and essential gear are available to rent on site for tennis and pickleball, so you can simply turn up and play.',
      fr: 'Oui. Raquettes et équipement essentiel sont disponibles à la location sur place pour le tennis et le pickleball : venez les mains dans les poches.',
    },
  },
]

/** FAQ deux colonnes (accordéons +/−), style éditorial Shi Shi. */
export function FaqSection() {
  const locale = useLocale() as Locale
  const [open, setOpen] = useState<Set<number>>(new Set([0]))

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })

  const half = Math.ceil(ITEMS.length / 2)
  const columns = [ITEMS.slice(0, half), ITEMS.slice(half)]

  return (
    <section className="border-y border-border bg-sand">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* En-tête centré. */}
      <div className="flex flex-col items-center text-center">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
          <HelpCircle className="size-4" aria-hidden />
          {EYEBROW[locale]}
        </span>
        <h2 className="mt-4 max-w-2xl font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.7rem]">
          {TITLE[locale]}
        </h2>
      </div>

      {/* Deux colonnes d'accordéons. */}
      <div className="mx-auto mt-12 grid max-w-5xl gap-4 md:grid-cols-2 md:gap-5">
        {columns.map((col, c) => (
          <div key={c} className="flex flex-col gap-4 md:gap-5">
            {col.map((item, j) => {
              const i = c * half + j
              const isOpen = open.has(i)
              return (
                <div
                  key={item.q.en}
                  className="overflow-hidden rounded-2xl border border-border bg-background transition-colors hover:border-accent/40"
                >
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-expanded={isOpen}
                    className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-6"
                  >
                    <span className="font-medium text-foreground">{item.q[locale]}</span>
                    <span
                      className={`flex size-7 shrink-0 items-center justify-center rounded-full ring-1 transition-colors ${
                        isOpen
                          ? 'bg-accent text-accent-foreground ring-accent'
                          : 'text-muted-foreground ring-border'
                      }`}
                    >
                      {isOpen ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
                        {item.a[locale]}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      </div>
    </section>
  )
}
