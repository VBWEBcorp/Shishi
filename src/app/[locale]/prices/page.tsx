import { ArrowRight, Tag } from 'lucide-react'
import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ActivityIcon } from '@/components/activity-icon'
import {
  breadcrumbJsonLd,
  offerCatalogJsonLd,
  webPageJsonLd,
} from '@/components/seo/json-ld'
import { Link } from '@/i18n/navigation'
import { activities, BOOK_NOW_PATH } from '@/lib/activities'
import type { Locale, Localized } from '@/lib/activities'
import { getActivityPrice, PRICE_TIERS } from '@/lib/booking-pricing'
import { siteConfig } from '@/lib/seo'

const PRICE_KEYWORDS = [
  'shi shi samui prices',
  'shi shi samui membership',
  'sports club lamai prices',
  'gym membership koh samui',
  'tennis court lamai price',
  'pickleball koh samui price',
  'fitness membership koh samui',
  'day pass sports club koh samui',
  'pool access lamai price',
  'kids club price koh samui',
  'family membership koh samui',
]

/** Une ligne tarifaire affichée (label localisé + montant en ฿). */
type Row = { label: Localized; amount: number }

/** Groupe tarifaire par activité (uniquement des prix réellement affichés). */
function priceGroups(): { slug: string; rows: Row[] }[] {
  return activities.map((a) => {
    const tiers = PRICE_TIERS[a.slug]
    if (tiers && tiers.length > 0) {
      return { slug: a.slug, rows: tiers.map((t) => ({ label: t.label, amount: t.amount })) }
    }
    const drop = getActivityPrice(a.slug)
    if (drop > 0) {
      return {
        slug: a.slug,
        rows: [{ label: { en: 'Drop-in', fr: 'À l’unité' }, amount: drop }],
      }
    }
    // Restaurant : à la carte, pas de prix fixe → aucune offre structurée.
    return { slug: a.slug, rows: [] }
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Prices' })
  return {
    title: { absolute: t('metaTitle') },
    description: t('metaDescription'),
    keywords: PRICE_KEYWORDS,
    alternates: { canonical: '/prices' },
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDescription'),
      url: `${siteConfig.url}/prices`,
      siteName: siteConfig.name,
      type: 'website',
      images: [{ url: '/photos/lounge.jpg', alt: 'Shi Shi Samui membership options' }],
    },
  }
}

export default async function PricesPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const l = locale as Locale
  const t = await getTranslations('Prices')

  const groups = priceGroups()
  const bySlug = (slug: string) => activities.find((a) => a.slug === slug)!

  // OfferCatalog — uniquement les offres avec un prix affiché (règle audit).
  const offers = groups.flatMap((g) =>
    g.rows.map((r) => ({
      name: `${bySlug(g.slug).name.en} — ${r.label.en}`,
      price: r.amount,
      unit: r.label.en,
    }))
  )

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      webPageJsonLd(t('h1'), t('metaDescription'), '/prices'),
      breadcrumbJsonLd([
        { name: l === 'fr' ? 'Accueil' : 'Home', path: '/' },
        { name: t('breadcrumb'), path: '/prices' },
      ]),
      offerCatalogJsonLd('Shi Shi Samui — Pricing & Membership', offers),
    ],
  }

  const fmt = (n: number) => `฿${n.toLocaleString(l === 'fr' ? 'fr-FR' : 'en-US')}`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO simple — bandeau crème (pas de hero vidéo : page de conversion) */}
      <section className="border-b border-border bg-sand pt-28">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <nav className="mb-4 flex items-center gap-2 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">
              {l === 'fr' ? 'Accueil' : 'Home'}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground/80">{t('breadcrumb')}</span>
          </nav>
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t('eyebrow')}</span>
          <h1 className="mt-3 font-editorial text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-foreground sm:text-5xl">
            {t('h1')}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{t('intro')}</p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href={BOOK_NOW_PATH}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.55)] transition-all hover:brightness-105"
            >
              {t('bookNow')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        </div>
      </section>

      {/* GRILLE TARIFAIRE — une carte par activité, prix réels (฿) */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => {
            const a = bySlug(g.slug)
            return (
              <div key={g.slug} className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-[0_24px_50px_-34px_oklch(0.16_0.02_55/0.3)]">
                <div className="flex items-center gap-3">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-foreground text-white">
                    <ActivityIcon name={a.icon} className="size-5" />
                  </span>
                  <h2 className="font-editorial text-xl font-medium text-foreground">{a.name[l]}</h2>
                </div>

                <ul className="mt-5 flex-1 space-y-3">
                  {g.rows.length > 0 ? (
                    g.rows.map((r) => (
                      <li key={r.label[l]} className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
                        <span className="text-sm font-medium text-foreground">{r.label[l]}</span>
                        <span className="shrink-0 font-editorial text-base font-medium text-foreground">{fmt(r.amount)}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-muted-foreground">{t('aLaCarte')}</li>
                  )}
                </ul>

                <div className="mt-6 flex items-center gap-3">
                  <Link
                    href={a.path}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors hover:text-accent"
                  >
                    {t('discover')} <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                  <span aria-hidden className="text-border">·</span>
                  <Link
                    href={a.bookable ? `${BOOK_NOW_PATH}?activity=${a.slug}#reserver` : a.path}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
                  >
                    {t('bookNow')}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
          <Tag className="size-4 text-accent" aria-hidden /> {t('disclaimer')}
        </p>
      </section>
    </>
  )
}
