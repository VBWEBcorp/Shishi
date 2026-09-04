import { CalendarCheck, Check, Clock, MapPin, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import { setRequestLocale } from 'next-intl/server'

import {
  breadcrumbJsonLd,
  faqJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { ActivityIcon } from '@/components/activity-icon'
import { Link } from '@/i18n/navigation'
import { serviceConfigs, type Locale } from '@/lib/activities'
import { HOME_FAQ } from '@/lib/home-faq'
import { PUBLIC_ADVANCE_DAYS } from '@/lib/membership-plans'
import { alternatesFor, mapsDirectionsUrl, siteConfig } from '@/lib/seo'
import { bonASavoir } from '@/lib/service-good-to-know'

/*
 * LA PAGE QU'ON ENVOIE.
 *
 * Demande de septembre 2026, celle qui revient le plus dans la réunion : « tu
 * mets une page d'information, et du coup même les gens tu leur dis : ici vous
 * avez la page info, et si vous voulez réserver c'est sur notre site. Bim,
 * t'envoies le lien avec les deux trucs, le mec il arrive sur la page avec
 * toutes les infos. »
 *
 * D'où sa forme : elle ne raconte rien, elle répond. Ce qui est compris dans le
 * prix, activité par activité, les questions posées tous les jours, comment on
 * réserve et jusqu'à quand, où c'est, et comment joindre le club. Chaque bloc
 * mène à la page de l'activité, qui porte son propre module de réservation.
 *
 * Le contenu n'est pas dupliqué : il vient de `service-good-to-know.ts` (les
 * mêmes lignes que sur chaque page activité) et de `home-faq.ts` (les mêmes
 * réponses que sur l'accueil et dans llms.txt). Une seule source, corrigée à un
 * seul endroit.
 */

const TITLE = {
  en: 'Good to Know: Prices, What Is Included & Booking',
  fr: 'Infos Pratiques : Tarifs, Ce Qui Est Inclus & Réservation',
} as const

const DESCRIPTION = {
  en: 'Everything before you come to Shi Shi Samui in Lamai: what the price includes, how each activity works, how to book and how to reach us.',
  fr: 'Tout avant de venir à Shi Shi Samui, à Lamai : ce que le tarif comprend, comment fonctionne chaque activité, comment réserver et comment nous joindre.',
} as const

const T = {
  en: {
    eyebrow: 'Good to know',
    intro:
      'The answers we give every day, gathered on one page. Each activity has its own page, with its prices and its booking form at the bottom.',
    activites: 'Activity by activity',
    voir: 'See the page',
    reserver: 'Booking',
    reserverTexte: (jours: number) =>
      `Booking opens ${jours} days ahead on the site. Pick your slot, we confirm by email. To book further out, or for a run of sessions over several weeks, message us on WhatsApp and we will place them for you.`,
    reserverCta: 'Book an activity',
    venir: 'Coming to the club',
    adresse: 'Address',
    itineraire: 'Get directions',
    horaires: 'Opening',
    horairesTexte: 'Opening hours are shown on each activity page.',
    questions: 'Questions we get asked',
    contact: 'Still not sure?',
    contactTexte: 'Message us on WhatsApp, we answer directly.',
    whatsapp: 'Message us on WhatsApp',
    email: 'Write to us',
  },
  fr: {
    eyebrow: 'Infos pratiques',
    intro:
      'Les réponses que nous donnons tous les jours, réunies sur une page. Chaque activité a sa propre page, avec ses tarifs et son module de réservation en bas.',
    activites: 'Activité par activité',
    voir: 'Voir la page',
    reserver: 'Réserver',
    reserverTexte: (jours: number) =>
      `La réservation en ligne est ouverte ${jours} jours à l'avance. Choisissez votre créneau, nous confirmons par e-mail. Pour réserver plus loin, ou poser une série de séances sur plusieurs semaines, écrivez-nous sur WhatsApp et nous les plaçons pour vous.`,
    reserverCta: 'Réserver une activité',
    venir: 'Venir au club',
    adresse: 'Adresse',
    itineraire: 'Itinéraire',
    horaires: 'Horaires',
    horairesTexte: 'Les horaires d’ouverture sont indiqués sur chaque page activité.',
    questions: 'Les questions qu’on nous pose',
    contact: 'Un doute ?',
    contactTexte: 'Écrivez-nous sur WhatsApp, nous répondons directement.',
    whatsapp: 'Nous écrire sur WhatsApp',
    email: 'Nous envoyer un e-mail',
  },
} as const

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
    alternates: alternatesFor('/good-to-know', locale),
    openGraph: {
      title: TITLE[l],
      description: DESCRIPTION[l],
      url: `${siteConfig.url}/${l}/good-to-know`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/pool-panorama-portrait.webp', alt: TITLE[l] }],
    },
  }
}

export default async function GoodToKnowPage({
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
    ? 'Bonjour Shi Shi Samui ! J’aurais une question avant de venir.'
    : 'Hi Shi Shi Samui! I have a question before coming over.'
  const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(waMessage)}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webPageJsonLd(TITLE[l], DESCRIPTION[l], '/good-to-know', l),
      breadcrumbJsonLd(
        [
          { name: fr ? 'Accueil' : 'Home', path: '/' },
          { name: t.eyebrow, path: '/good-to-know' },
        ],
        l
      ),
      faqJsonLd(HOME_FAQ.map((item) => ({ question: item.q[l], answer: item.a[l] }))),
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* En-tête */}
      <section className="border-b border-border/60 bg-sand">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8 lg:py-24">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            {t.eyebrow}
          </span>
          <h1 className="mt-4 font-editorial text-[2.2rem] font-normal leading-[1.08] tracking-[-0.01em] text-foreground sm:text-[3rem]">
            {TITLE[l]}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            {t.intro}
          </p>
        </div>
      </section>

      {/* Activité par activité */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-editorial text-[1.8rem] font-normal leading-[1.1] text-foreground sm:text-[2.2rem]">
          {t.activites}
        </h2>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {serviceConfigs.map((a) => {
            const lignes = bonASavoir(a.slug, l)
            if (lignes.length === 0) return null
            return (
              <article
                key={a.slug}
                className="flex flex-col rounded-3xl border border-border bg-card p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/15">
                    <ActivityIcon name={a.icon} className="size-5" />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {a.name[l]}
                  </h3>
                </div>

                <ul className="mt-4 flex-1 space-y-2.5">
                  {lignes.map((ligne) => (
                    <li key={ligne} className="flex items-start gap-3">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
                        <Check className="size-3" aria-hidden />
                      </span>
                      <span className="text-sm leading-relaxed text-muted-foreground">
                        {ligne}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={a.path}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent underline underline-offset-4 hover:brightness-110"
                >
                  {t.voir}
                </Link>
              </article>
            )
          })}
        </div>
      </section>

      {/* Réserver + venir au club */}
      <section className="border-y border-border bg-sand">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2 lg:px-8 lg:py-20">
          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <CalendarCheck className="size-5 text-accent" aria-hidden />
              {t.reserver}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              {t.reserverTexte(PUBLIC_ADVANCE_DAYS)}
            </p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <Link
                href="/book-now"
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
              >
                <CalendarCheck className="size-4" aria-hidden />
                {t.reserverCta}
              </Link>
              <Link
                href="/prices"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {fr ? 'Voir les tarifs' : 'See prices'}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-7">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
              <MapPin className="size-5 text-accent" aria-hidden />
              {t.venir}
            </h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-foreground">{t.adresse}</dt>
                <dd className="text-muted-foreground">
                  {siteConfig.address.street}, {siteConfig.address.city},{' '}
                  {siteConfig.address.region} {siteConfig.address.postalCode},{' '}
                  {fr ? 'Thaïlande' : 'Thailand'}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 font-medium text-foreground">
                  <Clock className="size-3.5 text-accent" aria-hidden />
                  {t.horaires}
                </dt>
                <dd className="text-muted-foreground">{t.horairesTexte}</dd>
              </div>
            </dl>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <a
                href={mapsDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                <MapPin className="size-4 text-accent" aria-hidden />
                {t.itineraire}
              </a>
              <Link
                href="/contact-location"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {fr ? 'Contact' : 'Contact'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Les questions qu'on nous pose */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-editorial text-[1.8rem] font-normal leading-[1.1] text-foreground sm:text-[2.2rem]">
          {t.questions}
        </h2>
        <dl className="mt-8 space-y-6">
          {HOME_FAQ.map((item) => (
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

      {/* Contact */}
      <section className="border-t border-border bg-sand">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 lg:px-8">
          <h2 className="font-editorial text-[1.6rem] font-normal text-foreground sm:text-[2rem]">
            {t.contact}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground">{t.contactTexte}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
            >
              <MessageCircle className="size-4" aria-hidden />
              {t.whatsapp}
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {t.email}
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
