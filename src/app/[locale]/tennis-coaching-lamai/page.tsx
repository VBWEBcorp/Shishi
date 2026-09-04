import { Check, Clock, MessageCircle, Trophy, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'

import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/lib/activities'
import { PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'
import { photoAlt } from '@/lib/photo-alt'
import { alternatesFor, siteConfig } from '@/lib/seo'

/*
 * COURS DE TENNIS.
 *
 * Demandé en septembre 2026 : « la partie coaching, tu peux commencer déjà à
 * créer une page annexe », et depuis la page tennis « si vous voulez du
 * coaching, vous pouvez contacter notre coach, ça emmène à la page du coach ».
 *
 * CE QUE CETTE PAGE NE DIT PAS, VOLONTAIREMENT : le nom du coach, ses tarifs,
 * ses disponibilités. Le club ne me les a pas donnés, et une page qui invente
 * un prix se retourne contre lui au premier client. Elle dit donc ce qui est
 * vrai et vérifiable : des cours particuliers sur le court du club, à Lamai,
 * matériel compris, et une prise de contact par WhatsApp.
 *
 * À COMPLÉTER quand le club aura tranché : nom et parcours du coach, formules
 * (à l'unité, forfait), tarifs, langues parlées, cours enfants. Le squelette
 * est là, il n'y aura qu'à remplir.
 */

const TITLE = {
  en: 'Tennis Lessons & Coaching in Lamai, Koh Samui',
  fr: 'Cours de Tennis et Coaching à Lamai, Koh Samui',
} as const

const DESCRIPTION = {
  en: 'Private tennis lessons on the floodlit court at Shi Shi Samui in Lamai, Koh Samui. All levels, rackets and balls included, arranged directly with the club.',
  fr: 'Cours de tennis particuliers sur le court éclairé de Shi Shi Samui, à Lamai, Koh Samui. Tous niveaux, raquettes et balles comprises, à convenir avec le club.',
} as const

const KEYWORDS = [
  'tennis lessons koh samui',
  'tennis coach koh samui',
  'tennis lessons lamai',
  'private tennis lesson koh samui',
  'cours de tennis koh samui',
  'cours de tennis lamai',
  'coach tennis koh samui',
  'tennis coaching samui',
]

const T = {
  en: {
    eyebrow: 'Coaching',
    intro:
      'Whether you have never held a racket or you play every week, lessons at Shi Shi Samui happen on our own court in Lamai, one on one, at the pace that suits you.',
    pourQui: 'Who it is for',
    pourQuiListe: [
      'Complete beginners, adults and children alike, starting from scratch.',
      'Players who want to work on one thing: a serve, a backhand, footwork.',
      'Regulars looking for a hitting partner who pushes them.',
      'Visitors who want a session or two while they are on the island.',
    ],
    commentTitre: 'How it works',
    commentListe: [
      'On our floodlit court, so a lesson can happen in the cool of the evening.',
      'Rackets, balls and towels are included, exactly as for a court booking.',
      'One on one, or two players sharing a lesson.',
      'Sessions are arranged directly with the club, by WhatsApp.',
    ],
    reserverTitre: 'Book a lesson',
    reserverTexte: `Lessons are not on the online booking calendar: the club places them itself, around your schedule and the coach's. Message us on WhatsApp with the days and times that suit you, and we come back to you.`,
    whatsapp: 'Ask about a lesson',
    courtTitre: 'Just want to play?',
    courtTexte: `The court can be booked online, up to ${PUBLIC_ADVANCE_DAYS} days ahead, rackets and balls included.`,
    courtCta: 'Book the tennis court',
    faqTitre: 'Frequently asked',
  },
  fr: {
    eyebrow: 'Coaching',
    intro:
      'Que vous n’ayez jamais tenu une raquette ou que vous jouiez toutes les semaines, les cours de Shi Shi Samui se donnent sur notre propre court, à Lamai, en tête à tête, au rythme qui vous va.',
    pourQui: 'Pour qui',
    pourQuiListe: [
      'Les vrais débutants, adultes comme enfants, qui partent de zéro.',
      'Ceux qui veulent travailler une seule chose : un service, un revers, les appuis.',
      'Les habitués qui cherchent un partenaire d’entraînement qui les pousse.',
      'Les visiteurs de passage, pour une ou deux séances pendant leur séjour.',
    ],
    commentTitre: 'Comment ça se passe',
    commentListe: [
      'Sur notre court éclairé : une séance peut se faire à la fraîche, en soirée.',
      'Raquettes, balles et serviettes comprises, comme pour une location de terrain.',
      'En tête à tête, ou à deux joueurs qui partagent le cours.',
      'Les séances se calent directement avec le club, sur WhatsApp.',
    ],
    reserverTitre: 'Réserver un cours',
    reserverTexte:
      'Les cours ne passent pas par le calendrier de réservation en ligne : le club les place lui-même, entre vos disponibilités et celles du coach. Écrivez-nous sur WhatsApp avec les jours et les heures qui vous arrangent, nous revenons vers vous.',
    whatsapp: 'Demander un cours',
    courtTitre: 'Vous voulez juste jouer ?',
    courtTexte: `Le court se réserve en ligne, jusqu’à ${PUBLIC_ADVANCE_DAYS} jours à l’avance, raquettes et balles comprises.`,
    courtCta: 'Réserver le court de tennis',
    faqTitre: 'Questions fréquentes',
  },
} as const

const FAQ = [
  {
    q: {
      en: 'Do I need my own racket?',
      fr: 'Faut-il apporter sa raquette ?',
    },
    a: {
      en: 'No. Rackets, balls and towels are included, for a lesson as for a court booking. Come as you are.',
      fr: 'Non. Raquettes, balles et serviettes sont comprises, pour un cours comme pour une location de terrain. Venez les mains dans les poches.',
    },
  },
  {
    q: {
      en: 'Can children take lessons?',
      fr: 'Les enfants peuvent-ils prendre des cours ?',
    },
    a: {
      en: 'Yes. Tell us the age when you get in touch and we will set the session up accordingly.',
      fr: 'Oui. Indiquez l’âge quand vous nous écrivez et nous adaptons la séance en conséquence.',
    },
  },
  {
    q: {
      en: 'Can we take a lesson together, two of us?',
      fr: 'Peut-on prendre un cours à deux ?',
    },
    a: {
      en: 'Yes, two players can share a lesson. Mention it when you message us so we plan the right amount of court time.',
      fr: 'Oui, deux joueurs peuvent partager un cours. Signalez-le dans votre message pour que nous prévoyions le bon créneau.',
    },
  },
  {
    q: {
      en: 'Can I play in the evening?',
      fr: 'Peut-on jouer le soir ?',
    },
    a: {
      en: 'Yes. The court is floodlit, which is often the most pleasant moment of the day to play in Koh Samui.',
      fr: 'Oui. Le court est éclairé, et c’est souvent le moment le plus agréable de la journée pour jouer à Koh Samui.',
    },
  },
] as const

function langue(locale: string): Locale {
  return locale === 'fr' ? 'fr' : 'en'
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const l = langue(locale)
  return {
    title: { absolute: `${TITLE[l]} | ${siteConfig.name}` },
    description: DESCRIPTION[l],
    keywords: KEYWORDS,
    alternates: alternatesFor('/tennis-coaching-lamai', locale),
    openGraph: {
      title: TITLE[l],
      description: DESCRIPTION[l],
      url: `${siteConfig.url}/${l}/tennis-coaching-lamai`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/tennis-court-portrait.webp', alt: TITLE[l] }],
    },
  }
}

export default async function TennisCoachingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = langue(locale)
  const t = T[l]
  const fr = l === 'fr'

  const waMessage = fr
    ? 'Bonjour Shi Shi Samui ! Je souhaite prendre un cours de tennis. Voici mes disponibilités :'
    : 'Hi Shi Shi Samui! I would like a tennis lesson. Here are the times that suit me:'
  const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(waMessage)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webPageJsonLd(TITLE[l], DESCRIPTION[l], '/tennis-coaching-lamai', l),
      serviceJsonLd(
        TITLE[l],
        DESCRIPTION[l],
        '/tennis-coaching-lamai',
        '/photos/tennis-court-portrait.webp',
        l
      ),
      breadcrumbJsonLd(
        [
          { name: fr ? 'Accueil' : 'Home', path: '/' },
          { name: fr ? 'Tennis' : 'Tennis', path: '/tennis-court-lamai' },
          { name: t.eyebrow, path: '/tennis-coaching-lamai' },
        ],
        l
      ),
      faqJsonLd(FAQ.map((item) => ({ question: item.q[l], answer: item.a[l] }))),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="relative isolate overflow-hidden pt-14">
        <Image
          src="/photos/tennis-court-portrait.webp"
          alt={photoAlt('/photos/tennis-court-portrait.webp', l)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.62)] via-[oklch(0.16_0_0/0.55)] to-[oklch(0.14_0_0/0.9)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <nav
            className="mb-5 flex items-center gap-2 text-xs text-white/70"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-white">
              {fr ? 'Accueil' : 'Home'}
            </Link>
            <span aria-hidden>/</span>
            <Link href="/tennis-court-lamai" className="transition-colors hover:text-white">
              Tennis
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{t.eyebrow}</span>
          </nav>

          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <Trophy className="size-4" aria-hidden />
            {t.eyebrow}
          </span>
          <h1 className="mt-4 max-w-3xl font-editorial text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
            {TITLE[l]}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {t.intro}
          </p>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
          >
            <MessageCircle className="size-4" aria-hidden />
            {t.whatsapp}
          </a>
        </div>
      </section>

      {/* Pour qui / comment */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="flex items-center gap-2 font-editorial text-[1.7rem] font-normal leading-[1.1] text-foreground sm:text-[2.1rem]">
              <Users className="size-6 text-accent" aria-hidden />
              {t.pourQui}
            </h2>
            <ul className="mt-6 space-y-3">
              {t.pourQuiListe.map((ligne) => (
                <li key={ligne} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="size-3" aria-hidden />
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-muted-foreground">
                    {ligne}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="flex items-center gap-2 font-editorial text-[1.7rem] font-normal leading-[1.1] text-foreground sm:text-[2.1rem]">
              <Clock className="size-6 text-accent" aria-hidden />
              {t.commentTitre}
            </h2>
            <ul className="mt-6 space-y-3">
              {t.commentListe.map((ligne) => (
                <li key={ligne} className="flex items-start gap-3">
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Check className="size-3" aria-hidden />
                  </span>
                  <span className="text-[0.95rem] leading-relaxed text-muted-foreground">
                    {ligne}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Réserver un cours / réserver le court */}
      <section className="border-y border-border bg-sand">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t.reserverTitre}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t.reserverTexte}
            </p>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
            >
              <MessageCircle className="size-4" aria-hidden />
              {t.whatsapp}
            </a>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="font-display text-lg font-semibold text-foreground">
              {t.courtTitre}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t.courtTexte}
            </p>
            <Link
              href="/tennis-court-lamai"
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t.courtCta}
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-editorial text-[1.8rem] font-normal leading-[1.1] text-foreground sm:text-[2.2rem]">
          {t.faqTitre}
        </h2>
        <dl className="mt-8 space-y-6">
          {FAQ.map((item) => (
            <div key={item.q[l]} className="border-b border-border/60 pb-6 last:border-0">
              <dt className="font-display text-base font-semibold text-foreground">
                {item.q[l]}
              </dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.a[l]}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  )
}
