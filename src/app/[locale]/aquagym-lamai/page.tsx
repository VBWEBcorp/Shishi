import { Clock, Droplets, MessageCircle, Sun, UserRound, Waves } from 'lucide-react'
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
import { AQUAGYM_PATH, type Locale } from '@/lib/activities'
import { photoAlt } from '@/lib/photo-alt'
import { alternatesFor, siteConfig } from '@/lib/seo'

/*
 * AQUAGYM.
 *
 * Demandée le 25/09/2026 par Paul Poulain : une page aquagym SANS réservation
 * en ligne (« je gère ça sur un groupe WhatsApp de mon côté en perso »), avec
 * son QR code WhatsApp pour le contacter et réserver un créneau.
 *
 * Tarif donné par le club : 400 ฿ la séance de 45 minutes, matériel,
 * professeur et serviette compris, avec accès à la piscine toute la journée.
 * Les jours et heures des séances ne sont pas publiés : ils se calent sur le
 * groupe WhatsApp.
 *
 * Le QR code (public/photos/aquagym-whatsapp-qr.png) est régénéré à partir du
 * lien que contient celui de Paul : wa.me/qr/5XV6VKX2BOCCF1. S'il réinitialise
 * son QR dans WhatsApp, ce lien meurt : il faudra refaire l'image ET la constante.
 *
 * La photo de la prof de piscine est attendue : en attendant, la piscine du club.
 */

/** Lien WhatsApp de Paul Poulain (contenu de son QR code). */
const WHATSAPP_AQUAGYM = 'https://wa.me/qr/5XV6VKX2BOCCF1'
const QR_IMAGE = '/photos/aquagym-whatsapp-qr.png'
/** À remplacer par la photo de la prof de piscine dès qu'elle arrive. */
const PHOTO = '/photos/pool-panorama-portrait.webp'
const PHOTO_2 = '/photos/pool-transats-portrait.webp'

const TITLE = {
  en: 'Aqua Aerobics in Lamai, Koh Samui',
  fr: 'Aquagym à Lamai, Koh Samui',
} as const

const DESCRIPTION = {
  en: 'Aqua aerobics at Shi Shi Samui in Lamai: 45-minute class for 400 THB, equipment, instructor and towel included, with pool access all day. Book on WhatsApp.',
  fr: 'Aquagym chez Shi Shi Samui à Lamai : séance de 45 minutes à 400 THB, matériel, professeur et serviette compris, piscine en accès libre la journée. Réservation sur WhatsApp.',
} as const

const KEYWORDS = [
  'aqua aerobics koh samui',
  'aqua aerobics lamai',
  'aquagym koh samui',
  'aqua fitness koh samui',
  'water aerobics koh samui',
  'aquagym lamai',
  'aquagym koh samui prix',
]

const T = {
  en: {
    eyebrow: 'Aqua aerobics',
    intro:
      'A 45-minute aqua aerobics class in the club pool, led by our instructor. Then stay: your pass gives you the pool for the rest of the day.',
    cta: 'Book on WhatsApp',
    prixTitre: 'One class',
    prix: '400 THB',
    duree: '45 minutes',
    inclusTitre: 'Included',
    inclus: [
      { Icon: Droplets, texte: 'All the equipment' },
      { Icon: UserRound, texte: 'The instructor' },
      { Icon: Waves, texte: 'A towel' },
      { Icon: Sun, texte: 'Pool access all day long' },
    ],
    reserverTitre: 'Book a class',
    reserverTexte:
      'Classes are not booked online: they are arranged on WhatsApp. Scan the QR code with your phone, or tap the button, and message us to book your slot.',
    qrAlt: 'WhatsApp QR code to book an aqua aerobics class at Shi Shi Samui',
    qrLegende: 'Scan to chat on WhatsApp',
    piscineTitre: 'Just want to swim?',
    piscineTexte: 'The pool is also open by day pass, without a class.',
    piscineCta: 'See the swimming pool',
    faqTitre: 'Frequently asked',
  },
  fr: {
    eyebrow: 'Aquagym',
    intro:
      'Une séance d’aquagym de 45 minutes dans la piscine du club, encadrée par notre professeure. Et après, restez : votre séance vous donne la piscine pour le reste de la journée.',
    cta: 'Réserver sur WhatsApp',
    prixTitre: 'La séance',
    prix: '400 THB',
    duree: '45 minutes',
    inclusTitre: 'Compris',
    inclus: [
      { Icon: Droplets, texte: 'Tout le matériel' },
      { Icon: UserRound, texte: 'La professeure' },
      { Icon: Waves, texte: 'Une serviette' },
      { Icon: Sun, texte: 'L’accès à la piscine toute la journée' },
    ],
    reserverTitre: 'Réserver une séance',
    reserverTexte:
      'Les séances ne se réservent pas en ligne : elles se calent sur WhatsApp. Scannez le QR code avec votre téléphone, ou touchez le bouton, et écrivez-nous pour réserver votre créneau.',
    qrAlt: 'QR code WhatsApp pour réserver une séance d’aquagym chez Shi Shi Samui',
    qrLegende: 'Scannez pour écrire sur WhatsApp',
    piscineTitre: 'Vous voulez juste nager ?',
    piscineTexte: 'La piscine est aussi ouverte à la journée, sans séance.',
    piscineCta: 'Voir la piscine',
    faqTitre: 'Questions fréquentes',
  },
} as const

const FAQ = [
  {
    q: {
      en: 'How much is an aqua aerobics class?',
      fr: 'Combien coûte une séance d’aquagym ?',
    },
    a: {
      en: '400 THB for a 45-minute class, with the equipment, the instructor and a towel included.',
      fr: '400 THB la séance de 45 minutes, matériel, professeure et serviette compris.',
    },
  },
  {
    q: {
      en: 'Can I stay at the pool after the class?',
      fr: 'Peut-on rester à la piscine après la séance ?',
    },
    a: {
      en: 'Yes. The class includes access to the pool for the whole day.',
      fr: 'Oui. La séance comprend l’accès à la piscine pour toute la journée.',
    },
  },
  {
    q: {
      en: 'How do I book?',
      fr: 'Comment réserver ?',
    },
    a: {
      en: 'On WhatsApp: scan the QR code on this page or tap the button, and message us to book your slot.',
      fr: 'Sur WhatsApp : scannez le QR code de cette page ou touchez le bouton, et écrivez-nous pour réserver votre créneau.',
    },
  },
  {
    q: {
      en: 'Do I need to bring anything?',
      fr: 'Faut-il apporter quelque chose ?',
    },
    a: {
      en: 'Just your swimsuit: the equipment and a towel are provided.',
      fr: 'Votre maillot de bain : le matériel et la serviette sont fournis.',
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
    alternates: alternatesFor(AQUAGYM_PATH, locale),
    openGraph: {
      title: TITLE[l],
      description: DESCRIPTION[l],
      url: `${siteConfig.url}/${l}${AQUAGYM_PATH}`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: PHOTO, alt: TITLE[l] }],
    },
  }
}

export default async function AquagymPage({
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
      webPageJsonLd(TITLE[l], DESCRIPTION[l], AQUAGYM_PATH, l),
      serviceJsonLd(TITLE[l], DESCRIPTION[l], AQUAGYM_PATH, PHOTO, l),
      breadcrumbJsonLd(
        [
          { name: fr ? 'Accueil' : 'Home', path: '/' },
          { name: fr ? 'Piscine' : 'Swimming pool', path: '/swimming-pool-lamai' },
          { name: t.eyebrow, path: AQUAGYM_PATH },
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
          src={PHOTO}
          alt={photoAlt(PHOTO, l)}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.62)] via-[oklch(0.16_0_0/0.5)] to-[oklch(0.14_0_0/0.9)]"
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
            <Link href="/swimming-pool-lamai" className="transition-colors hover:text-white">
              {fr ? 'Piscine' : 'Swimming pool'}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-white">{t.eyebrow}</span>
          </nav>

          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <Waves className="size-4" aria-hidden />
            {t.eyebrow}
          </span>
          <h1 className="mt-4 max-w-3xl font-editorial text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-5xl lg:text-6xl">
            {TITLE[l]}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
            {t.intro}
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white">
            <span className="inline-flex items-center gap-2">
              <Clock className="size-4 text-accent" aria-hidden />
              {t.duree}
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="font-display text-lg font-bold text-accent">{t.prix}</span>
            </span>
          </div>
          <a
            href="#reserver"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
          >
            <MessageCircle className="size-4" aria-hidden />
            {t.cta}
          </a>
        </div>
      </section>

      {/* Prix + compris */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-10 md:grid-cols-[1fr_1.2fr]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl ring-1 ring-border">
            <Image
              src={PHOTO_2}
              alt={photoAlt(PHOTO_2, l)}
              fill
              sizes="(min-width:768px) 28rem, 100vw"
              className="object-cover"
            />
          </div>

          <div>
            <div className="inline-flex flex-col rounded-2xl border border-border bg-card px-7 py-5">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {t.prixTitre}
              </span>
              <span className="mt-1 font-display text-4xl font-bold text-foreground">{t.prix}</span>
              <span className="mt-1 text-sm text-muted-foreground">{t.duree}</span>
            </div>

            <h2 className="mt-10 font-editorial text-[1.7rem] font-normal leading-[1.1] text-foreground sm:text-[2.1rem]">
              {t.inclusTitre}
            </h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {t.inclus.map(({ Icon, texte }) => (
                <li key={texte} className="flex items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ocean/10 text-ocean ring-1 ring-ocean/20">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-[0.95rem] text-foreground">{texte}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Réserver sur WhatsApp : QR + bouton (sur téléphone, on ne scanne pas son propre écran) */}
      <section id="reserver" className="scroll-mt-20 border-y border-border bg-muted/40">
        <div className="mx-auto grid max-w-5xl items-center gap-10 px-4 py-16 sm:px-6 md:grid-cols-[1fr_auto] lg:px-8 lg:py-20">
          <div>
            <h2 className="font-editorial text-[1.8rem] font-normal leading-[1.1] text-foreground sm:text-[2.2rem]">
              {t.reserverTitre}
            </h2>
            <p className="mt-4 max-w-xl text-[0.97rem] leading-relaxed text-muted-foreground">
              {t.reserverTexte}
            </p>
            <a
              href={WHATSAPP_AQUAGYM}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-semibold text-white transition-all hover:brightness-105"
            >
              <MessageCircle className="size-4" aria-hidden />
              {t.cta}
            </a>
          </div>

          <figure className="mx-auto flex flex-col items-center rounded-3xl border border-border bg-card p-6 text-center">
            <Image
              src={QR_IMAGE}
              alt={t.qrAlt}
              width={220}
              height={220}
              className="rounded-xl"
            />
            <figcaption className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {t.qrLegende}
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Piscine seule */}
      <section className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-7">
          <h2 className="font-display text-lg font-semibold text-foreground">{t.piscineTitre}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.piscineTexte}</p>
          <Link
            href="/swimming-pool-lamai"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {t.piscineCta}
          </Link>
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
