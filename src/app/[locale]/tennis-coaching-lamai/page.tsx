import {
  BarChart3,
  CalendarCheck,
  Check,
  Languages,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'
import Image from 'next/image'

import { BookingWidget } from '@/app/[locale]/book-now/booking-widget'
import { ActivityIcon } from '@/components/activity-icon'
import {
  breadcrumbJsonLd,
  faqJsonLd,
  serviceJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { Link } from '@/i18n/navigation'
import { tennisCoaching, type Locale } from '@/lib/activities'
import { PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'
import { alternatesFor, siteConfig } from '@/lib/seo'

/*
 * COACH DE TENNIS.
 *
 * Le squelette de septembre 2026 ne donnait ni nom, ni prix, ni moyen de
 * réserver : le club ne les avait pas encore. Le 25/09/2026, Paul Poulain a
 * envoyé le flyer du coach et demandé la page complète : « intégrer le
 * calendrier de réservation à cette page aussi », mettre le flyer en avant,
 * une bulle « qui je suis ? » sur Paul, et le paiement « directement au ShiShi ».
 *
 * TOUT CE QUI EST ÉCRIT ICI VIENT DU FLYER : ancien joueur de compétition,
 * coaching axé performance, progression sur mesure, adultes et enfants, tous
 * niveaux, français et anglais, raquettes, balles, serviette et eau comprises,
 * 1 200 ฿ l'heure (600 de coaching + 600 de court), 1 000 ฿ la séance dès six
 * cours, cours collectifs à venir. Rien d'autre sur le parcours du coach tant
 * que le club ne l'a pas donné.
 *
 * Le calendrier réserve l'activité `tennis-coaching`, qui partage le court avec
 * la location (un cours et une location ne tombent jamais sur le même créneau).
 */

const PATH = '/tennis-coaching-lamai'
const PORTRAIT = '/photos/coach-paul-portrait.webp'
const FLYER = '/photos/coach-paul-flyer.webp'

const TITLE = {
  en: 'Tennis Coach in Lamai, Koh Samui',
  fr: 'Coach de Tennis à Lamai, Koh Samui',
} as const

const DESCRIPTION = {
  en: 'Private tennis lessons with Coach Paul at Shi Shi Samui, Lamai. 1,200 THB per hour, court and equipment included. Book online, pay at the club.',
  fr: 'Cours de tennis avec Coach Paul chez Shi Shi Samui, à Lamai. 1 200 THB l’heure, court et matériel compris. Réservez en ligne, payez au club.',
} as const

const KEYWORDS = [
  'tennis coach koh samui',
  'tennis lessons koh samui',
  'tennis lessons lamai',
  'private tennis lesson koh samui',
  'tennis coaching samui',
  'coach tennis koh samui',
  'cours de tennis koh samui',
  'cours de tennis lamai',
]

const T = {
  en: {
    eyebrow: 'Coach Paul',
    intro:
      'Former competitive player, performance-focused coaching and tailored player development. One-to-one lessons on the club court in Lamai, for adults and kids, whatever your level.',
    ctaBook: 'Book a lesson',
    atouts: ['Adults & kids', 'All levels welcome', 'French & English', 'Rackets, balls, towel & water included'],
    portraitAlt: 'Coach Paul, tennis coach at Shi Shi Samui in Lamai',
    quiTitre: 'Who am I?',
    quiNom: 'Coach Paul',
    quiTexte: [
      'Hi, I’m Paul. I played tennis competitively, and that is what I bring on court: coaching focused on performance, whatever your level.',
      'Every player is different, so every lesson is built around you: where you are today, what you want to work on, how far you want to go. Complete beginner or regular player, adult or child, we set the goals together.',
      'I coach in French and in English. Rackets, balls, a towel and water are waiting for you at the court.',
    ],
    tarifsTitre: 'Prices',
    tarif1Titre: '1 hour lesson',
    tarif1Prix: '1,200 THB',
    tarif1Detail: '600 THB coaching + 600 THB court',
    tarif2Titre: 'Special package',
    tarif2Prix: '1,000 THB',
    tarif2Unite: '/ session',
    tarif2Detail: 'From 6 lessons',
    paiement: 'Paid directly at Shi Shi Samui, on the day. Nothing to pay online.',
    groupes: 'Group classes coming soon, by age and level.',
    flyerTitre: 'The flyer',
    flyerAlt: 'Coach Paul tennis flyer at Shi Shi Samui, Koh Samui: prices and contact',
    flyerOuvrir: 'Open full size',
    reserverTitre: 'Book your lesson',
    reserverTexte: `Pick a day and a time: lessons last one hour or more, up to ${PUBLIC_ADVANCE_DAYS} days ahead. Taking the 6-lesson package? Say so in the Notes field, the club applies the package price when you pay.`,
    courtTitre: 'Just want to play?',
    courtTexte: 'The court can also be booked on its own, without a coach, rackets and balls included.',
    courtCta: 'Book the tennis court',
    faqTitre: 'Frequently asked',
  },
  fr: {
    eyebrow: 'Coach Paul',
    intro:
      'Ancien joueur de compétition, coaching axé sur la performance et progression sur mesure. Des cours en tête à tête sur le court du club, à Lamai, pour les adultes comme pour les enfants, quel que soit votre niveau.',
    ctaBook: 'Réserver un cours',
    atouts: ['Adultes & enfants', 'Tous niveaux', 'Français & anglais', 'Raquettes, balles, serviette & eau comprises'],
    portraitAlt: 'Coach Paul, coach de tennis chez Shi Shi Samui à Lamai',
    quiTitre: 'Qui je suis ?',
    quiNom: 'Coach Paul',
    quiTexte: [
      'Bonjour, moi c’est Paul. J’ai joué au tennis en compétition, et c’est ce que j’apporte sur le court : un coaching tourné vers la performance, quel que soit votre niveau.',
      'Chaque joueur est différent, alors chaque cours se construit autour de vous : où vous en êtes, ce que vous voulez travailler, jusqu’où vous voulez aller. Grand débutant ou joueur régulier, adulte ou enfant, on fixe les objectifs ensemble.',
      'Je donne mes cours en français et en anglais. Raquettes, balles, serviette et eau vous attendent sur le court.',
    ],
    tarifsTitre: 'Tarifs',
    tarif1Titre: 'Cours d’1 heure',
    tarif1Prix: '1 200 THB',
    tarif1Detail: '600 THB de coaching + 600 THB de court',
    tarif2Titre: 'Forfait',
    tarif2Prix: '1 000 THB',
    tarif2Unite: '/ séance',
    tarif2Detail: 'Dès 6 cours',
    paiement: 'Paiement directement au Shi Shi Samui, le jour du cours. Rien à régler en ligne.',
    groupes: 'Cours collectifs bientôt, par âge et par niveau.',
    flyerTitre: 'Le flyer',
    flyerAlt: 'Flyer de Coach Paul, coach de tennis chez Shi Shi Samui à Koh Samui : tarifs et contact',
    flyerOuvrir: 'Voir en grand',
    reserverTitre: 'Réservez votre cours',
    reserverTexte: `Choisissez un jour et une heure : un cours dure une heure ou plus, jusqu’à ${PUBLIC_ADVANCE_DAYS} jours à l’avance. Vous prenez le forfait de 6 cours ? Dites-le dans le champ Remarques, le club applique le tarif forfait au paiement.`,
    courtTitre: 'Vous voulez juste jouer ?',
    courtTexte: 'Le court se réserve aussi seul, sans coach, raquettes et balles comprises.',
    courtCta: 'Réserver le court de tennis',
    faqTitre: 'Questions fréquentes',
  },
} as const

const ATOUT_ICONS = [Users, BarChart3, Languages, Check]

const FAQ = [
  {
    q: {
      en: 'How much is a tennis lesson?',
      fr: 'Combien coûte un cours de tennis ?',
    },
    a: {
      en: '1,200 THB for one hour: 600 THB for the coaching and 600 THB for the court. From 6 lessons, the package brings it down to 1,000 THB per session.',
      fr: '1 200 THB l’heure : 600 THB pour le coaching et 600 THB pour le court. Dès 6 cours, le forfait le ramène à 1 000 THB la séance.',
    },
  },
  {
    q: {
      en: 'How do I pay?',
      fr: 'Comment se passe le paiement ?',
    },
    a: {
      en: 'Directly at Shi Shi Samui, on the day of the lesson. Booking online reserves the court and the coach, nothing is charged online.',
      fr: 'Directement au Shi Shi Samui, le jour du cours. La réservation en ligne bloque le court et le coach, rien n’est débité en ligne.',
    },
  },
  {
    q: {
      en: 'Do I need my own racket?',
      fr: 'Faut-il apporter sa raquette ?',
    },
    a: {
      en: 'No. Rackets, balls, a towel and water are included in the lesson.',
      fr: 'Non. Raquettes, balles, serviette et eau sont comprises dans le cours.',
    },
  },
  {
    q: {
      en: 'Can children take lessons?',
      fr: 'Les enfants peuvent-ils prendre des cours ?',
    },
    a: {
      en: 'Yes, lessons are for adults and kids, all levels welcome. Mention the child’s age in the Notes field when you book.',
      fr: 'Oui, les cours s’adressent aux adultes comme aux enfants, tous niveaux. Indiquez l’âge de l’enfant dans le champ Remarques en réservant.',
    },
  },
  {
    q: {
      en: 'In which language are the lessons?',
      fr: 'En quelle langue se passent les cours ?',
    },
    a: {
      en: 'In French or in English, as you prefer.',
      fr: 'En français ou en anglais, comme vous préférez.',
    },
  },
  {
    q: {
      en: 'Are there group classes?',
      fr: 'Y a-t-il des cours collectifs ?',
    },
    a: {
      en: 'Not yet: group classes by age and level are coming soon. For now, lessons are one-to-one.',
      fr: 'Pas encore : des cours collectifs par âge et par niveau arrivent bientôt. Pour l’instant, les cours sont particuliers.',
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
    alternates: alternatesFor(PATH, locale),
    openGraph: {
      title: TITLE[l],
      description: DESCRIPTION[l],
      url: `${siteConfig.url}/${l}${PATH}`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: PORTRAIT, alt: T[l].portraitAlt }],
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

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webPageJsonLd(TITLE[l], DESCRIPTION[l], PATH, l),
      serviceJsonLd(TITLE[l], DESCRIPTION[l], PATH, PORTRAIT, l),
      breadcrumbJsonLd(
        [
          { name: fr ? 'Accueil' : 'Home', path: '/' },
          { name: 'Tennis', path: '/tennis-court-lamai' },
          { name: fr ? 'Coach de tennis' : 'Tennis coach', path: PATH },
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
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.62)] via-[oklch(0.16_0_0/0.55)] to-[oklch(0.14_0_0/0.9)]"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.35fr_1fr] lg:px-8 lg:py-24">
          <div>
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
              <span className="text-white">{fr ? 'Coach de tennis' : 'Tennis coach'}</span>
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
              href="#reserver"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
            >
              <CalendarCheck className="size-4" aria-hidden />
              {t.ctaBook}
            </a>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div className="relative aspect-square overflow-hidden rounded-3xl ring-4 ring-accent/80">
              <Image
                src={PORTRAIT}
                alt={t.portraitAlt}
                fill
                priority
                sizes="(min-width:768px) 24rem, 90vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Les quatre points du flyer */}
      <section className="border-b border-border">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
          {t.atouts.map((atout, i) => {
            const Icon = ATOUT_ICONS[i]
            return (
              <li key={atout} className="flex flex-col items-center gap-3 text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-foreground text-background">
                  {i === 3 ? (
                    <ActivityIcon name="tennis" className="size-5" />
                  ) : (
                    <Icon className="size-5" aria-hidden />
                  )}
                </span>
                <span className="text-sm font-medium text-foreground">{atout}</span>
              </li>
            )
          })}
        </ul>
      </section>

      {/* Qui je suis ? */}
      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-start gap-8 md:grid-cols-[auto_1fr]">
          <div className="flex items-center gap-4 md:flex-col md:items-center">
            <div className="relative size-24 shrink-0 overflow-hidden rounded-full ring-2 ring-accent sm:size-32">
              <Image
                src={PORTRAIT}
                alt={t.portraitAlt}
                fill
                sizes="8rem"
                className="object-cover"
              />
            </div>
            <span className="font-editorial text-xl text-foreground">{t.quiNom}</span>
          </div>

          <div className="relative rounded-3xl border border-border bg-card p-7 shadow-[0_24px_60px_-34px_oklch(0.16_0.02_55/0.35)] sm:p-9">
            {/* Pointe de la bulle, vers la photo */}
            <span
              className="absolute -top-2 left-10 size-4 rotate-45 border-l border-t border-border bg-card md:-left-2 md:top-12 md:border-b md:border-t-0"
              aria-hidden
            />
            <h2 className="font-editorial text-[1.7rem] font-normal leading-[1.1] text-foreground sm:text-[2.1rem]">
              {t.quiTitre}
            </h2>
            <div className="mt-5 space-y-4">
              {t.quiTexte.map((p) => (
                <p key={p} className="text-[0.97rem] leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tarifs + flyer */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1.2fr_1fr] lg:px-8 lg:py-20">
          <div>
            <h2 className="font-editorial text-[1.8rem] font-normal leading-[1.1] text-foreground sm:text-[2.2rem]">
              {t.tarifsTitre}
            </h2>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">
                  {t.tarif1Titre}
                </p>
                <p className="mt-3 rounded-xl bg-accent px-3 py-2 font-display text-2xl font-bold text-accent-foreground">
                  {t.tarif1Prix}
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{t.tarif1Detail}</p>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-foreground">
                  {t.tarif2Titre}
                </p>
                <p className="mt-3 rounded-xl bg-accent px-3 py-2 font-display text-2xl font-bold text-accent-foreground">
                  {t.tarif2Prix} <span className="text-base font-medium">{t.tarif2Unite}</span>
                </p>
                <p className="mt-3 text-sm text-muted-foreground">{t.tarif2Detail}</p>
              </div>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-3 text-sm leading-relaxed text-foreground">
                <Wallet className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                {t.paiement}
              </li>
              <li className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground">
                <Users className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                {t.groupes}
              </li>
            </ul>
          </div>

          <figure className="mx-auto w-full max-w-sm">
            <a href={FLYER} target="_blank" rel="noopener noreferrer" className="group block">
              <Image
                src={FLYER}
                alt={t.flyerAlt}
                width={1200}
                height={1697}
                sizes="(min-width:768px) 24rem, 90vw"
                className="h-auto w-full rounded-2xl shadow-[0_30px_70px_-30px_oklch(0.16_0_0/0.45)] ring-1 ring-border transition-transform duration-500 group-hover:-translate-y-1"
              />
            </a>
            <figcaption className="mt-3 text-center text-xs text-muted-foreground">
              {t.flyerTitre} ·{' '}
              <a href={FLYER} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">
                {t.flyerOuvrir}
              </a>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Calendrier de réservation du cours */}
      <section id="reserver" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-editorial text-[1.8rem] font-normal leading-[1.1] text-foreground sm:text-[2.2rem]">
          {t.reserverTitre}
        </h2>
        <p className="mb-8 mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {t.reserverTexte}
        </p>
        <BookingWidget initialActivity={tennisCoaching.slug} />

        <div className="mt-10 rounded-3xl border border-border bg-card p-7">
          <h3 className="font-display text-lg font-semibold text-foreground">{t.courtTitre}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.courtTexte}</p>
          <Link
            href="/tennis-court-lamai"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t.courtCta}
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
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
