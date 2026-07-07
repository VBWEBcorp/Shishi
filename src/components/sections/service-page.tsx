import { ArrowRight, Check, Clock, Lock, MapPin, MessageCircle, ShoppingBag, Sparkles, Tag } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { FaqAccordion } from '@/components/faq-accordion'
import { ServicesShowcase } from '@/components/sections/services-showcase'
import { Link } from '@/i18n/navigation'
import type { Activity, Locale } from '@/lib/activities'
import { BOOK_NOW_PATH, CONTACT_PATH, PRICES_PATH } from '@/lib/activities'
import { LAUNCH_OFFER, OPENING_HOURS, PRICE_TIERS } from '@/lib/booking-pricing'
import { siteConfig } from '@/lib/seo'

/**
 * Gabarit partagé des pages service (tennis, pickleball, fitness, kids club,
 * babysitting, restaurant healthy, piscine). Respecte l'audit SEO :
 * H1 unique, hiérarchie Hn, breadcrumb visible, images + ALT descriptifs,
 * maillage interne (service complémentaire + Prices + Book Now + Contact),
 * CTA au-dessus de la ligne de flottaison + CTA de fin, FAQ visible, WhatsApp.
 */
export async function ServicePage({
  service,
  locale,
}: {
  service: Activity
  locale: Locale
}) {
  const l = locale
  const t = await getTranslations('Service')

  const tiers = PRICE_TIERS[service.slug] ?? []
  const hours = OPENING_HOURS[service.slug]?.[l]
  const highlights = service.highlights[l]
  const fmtPrice = (amount: number) =>
    `฿${amount.toLocaleString(l === 'fr' ? 'fr-FR' : 'en-US')}`

  // Activité « bientôt disponible » (ex. pickleball) : aucune réservation, on
  // affiche une section Coming Soon élégante à la place des CTA de réservation.
  const comingSoon = !!service.comingSoon
  const isRestaurant = service.slug === 'restaurant'
  const launchOffer = LAUNCH_OFFER[service.slug]?.[l]
  // Libellé demandé par le client : littéralement « Coming Soon ».
  const comingSoonLabel = 'Coming Soon'

  // CTA de réservation : en ligne (Book Now) ou contact (restaurant, babysitting).
  const bookHref = service.bookable
    ? `${BOOK_NOW_PATH}?activity=${service.slug}`
    : CONTACT_PATH
  const bookLabel = service.bookable
    ? t('bookName', { name: service.name[l] })
    : t('contactUs')

  const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(
    t('whatsappPrefill', { name: service.name[l] })
  )}`

  return (
    <>
      {/* 1 · HERO figé — le contenu remonte par-dessus au scroll (effet Traavellio) */}
      <section className="sticky top-0 z-0 isolate min-h-[60vh] overflow-hidden pt-14">
        <Image
          src={service.image}
          alt={service.altImages[0]}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={service.image}
          aria-hidden
          className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        >
          <source src={service.video} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.55)] via-[oklch(0.16_0_0/0.5)] to-[oklch(0.14_0_0/0.88)]" aria-hidden />

        <div className="relative mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-end px-4 pb-24 pt-24 sm:px-6 sm:pb-28 lg:px-8">
          {/* Fil d'Ariane visible — Home > <service> (BreadcrumbList en JSON-LD) */}
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-white">{t('breadcrumbHome')}</Link>
            <span aria-hidden>/</span>
            <span className="text-white">{service.name[l]}</span>
          </nav>

          <span className="flex size-14 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
            <ActivityIcon name={service.icon} className="size-7" />
          </span>
          <h1 className="mt-5 font-editorial text-4xl font-medium tracking-[-0.01em] text-white sm:text-6xl">
            {service.h1[l]}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/85">{service.tagline[l]}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> Lamai, Koh Samui
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {hours ?? t('openDaily')}
            </span>
          </div>

          {/* CTA au-dessus de la ligne de flottaison (audit) — masqués si « bientôt » */}
          {comingSoon ? (
            <div className="mt-7">
              <span className="inline-flex items-center gap-2.5 rounded-full bg-accent/15 px-5 py-2.5 text-sm font-semibold uppercase tracking-[0.18em] text-accent ring-1 ring-accent/30 backdrop-blur">
                <Lock className="size-4" aria-hidden />
                {comingSoonLabel}
              </span>
            </div>
          ) : (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href={bookHref}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.55)] transition-all hover:brightness-105"
              >
                {bookLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
              <Link
                href={PRICES_PATH}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-white/12 px-6 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-all hover:bg-white/20"
              >
                <Tag className="size-4" aria-hidden /> {t('viewPrices')}
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Contenu : panneau opaque à coins arrondis qui glisse par-dessus le hero figé */}
      <div className="relative z-10 rounded-t-[2rem] bg-background sm:rounded-t-[2.5rem]">

      {/* 2 · À PROPOS + TARIFS — crème */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">
              {t('eyebrow')}
            </span>
            <h2 className="mt-4 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.5rem]">
              {t('about', { name: service.name[l] })}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{service.description[l]}</p>

            {/* Mise en avant du service Take Away (restaurant) */}
            {isRestaurant && (
              <div className="mt-8 overflow-hidden rounded-3xl border border-accent/20 bg-gradient-to-br from-accent/[0.08] to-accent/[0.02] p-6 sm:p-7">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground shadow-[0_12px_28px_-10px_oklch(0.63_0.187_47/0.6)]">
                    <ShoppingBag className="size-7" aria-hidden />
                  </span>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                      Take Away
                    </span>
                    <h3 className="mt-1 font-editorial text-xl font-medium text-foreground sm:text-2xl">
                      {l === 'fr' ? 'Vos plats healthy à emporter' : 'Your healthy meals to go'}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {l === 'fr'
                        ? 'Commandez smoothies, bowls et assiettes feel-good à emporter. Passez commande et récupérez sur place — rapide et sans attente.'
                        : 'Order smoothies, bowls and feel-good plates to take away. Place your order and pick it up — quick, no waiting.'}
                    </p>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-accent px-5 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105"
                    >
                      <ShoppingBag className="size-4" aria-hidden />
                      {l === 'fr' ? 'Commander à emporter' : 'Order take away'}
                    </a>
                  </div>
                </div>
              </div>
            )}

            {highlights.length > 0 && (
              <div className="mt-9 grid gap-3 sm:grid-cols-2">
                {highlights.map((h) => (
                  <div key={h} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ocean/10 text-ocean ring-1 ring-ocean/20">
                      <Check className="size-4" aria-hidden />
                    </span>
                    <span className="text-sm font-medium text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            {comingSoon ? (
              /* Carte verrouillée « Coming Soon » — aucune réservation ni contact */
              <div className="rounded-3xl border border-border bg-card p-7 text-center shadow-[0_24px_50px_-30px_oklch(0.16_0.02_55/0.35)]">
                <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-1 ring-border">
                  <Lock className="size-7" aria-hidden />
                </span>
                <p className="mt-5 font-editorial text-2xl font-normal text-foreground">{comingSoonLabel}</p>
                <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
                  {l === 'fr'
                    ? 'Cette activité n’est pas encore ouverte à la réservation. Elle arrive très bientôt.'
                    : 'This activity isn’t open for booking yet. Coming very soon.'}
                </p>
                <span className="mt-6 flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full bg-muted text-sm font-semibold text-muted-foreground ring-1 ring-border">
                  <Lock className="size-4" aria-hidden /> {l === 'fr' ? 'Réservation verrouillée' : 'Booking locked'}
                </span>
              </div>
            ) : (
              <div className="rounded-3xl border border-border bg-card p-6 shadow-[0_24px_50px_-30px_oklch(0.16_0.02_55/0.35)]">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {t('pricing')}
                </span>
                {hours && <p className="mt-2 text-sm font-medium text-foreground">{hours}</p>}
                <ul className="mt-5 space-y-3">
                  {tiers.length > 0 ? (
                    tiers.map((tier) => (
                      <PriceRow key={tier.label[l]} label={tier.label[l]} value={fmtPrice(tier.amount)} />
                    ))
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">{t('pricingNote')}</p>
                      <PriceRow label={t('onRequest')} hint={t('onRequestHint')} value="฿—" />
                    </>
                  )}
                </ul>

                {/* Offre de lancement (tennis) */}
                {launchOffer && (
                  <p className="mt-4 rounded-xl bg-secondary/60 px-3.5 py-3 text-xs leading-relaxed text-foreground ring-1 ring-border">
                    {launchOffer}
                  </p>
                )}

                <Link
                  href={bookHref}
                  className="group mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)] transition-all hover:brightness-105"
                >
                  {isRestaurant ? (l === 'fr' ? 'Commander à emporter' : 'Order take away') : bookLabel}
                  {isRestaurant ? (
                    <ShoppingBag className="size-4" aria-hidden />
                  ) : (
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  )}
                </Link>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#25D366]/10 text-sm font-semibold text-[#1d9e4f] ring-1 ring-[#25D366]/25 transition-colors hover:bg-[#25D366]/15"
                >
                  <MessageCircle className="size-4" aria-hidden /> {t('whatsapp')}
                </a>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  {service.bookable ? t('securePayment') : t('replyFast')}
                </p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* 3 · GALERIE — bande sable (ALT descriptifs) */}
      {service.gallery.length > 0 && (
        <section className="border-y border-border bg-sand">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <h2 className="font-editorial text-2xl font-normal text-foreground sm:text-3xl">
              {l === 'fr' ? 'En images' : 'In pictures'}
            </h2>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {service.gallery.map((src, i) => (
                <div
                  key={src}
                  className="group relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-border"
                >
                  <Image
                    src={src}
                    alt={`${service.altImages[i % service.altImages.length]} — ${i + 1}`}
                    fill
                    sizes="(min-width:1024px) 18rem, 50vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4 · FAQ visible (+ JSON-LD FAQPage côté page) */}
      {service.faq.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="font-editorial text-2xl font-normal text-foreground sm:text-3xl">
            {t('faqTitle')}
          </h2>
          <div className="mt-8">
            <FaqAccordion items={service.faq.map((item) => ({ q: item.q[l], a: item.a[l] }))} />
          </div>
        </section>
      )}

      {/* 5 · MAILLAGE INTERNE — showcase « nos pôles » (image + liste cliquable) */}
      <ServicesShowcase locale={l} title={t('keepExploring')} excludeSlug={service.slug} />

      {/* 6 · CTA de fin de page (audit) */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex flex-wrap items-center gap-3">
            {!comingSoon && (
              <Link
                href={bookHref}
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.5)] transition-all hover:brightness-105"
              >
                {isRestaurant ? (l === 'fr' ? 'Commander à emporter' : 'Order take away') : bookLabel}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            )}
            <Link
              href={PRICES_PATH}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:border-accent/40"
            >
              <Tag className="size-4" aria-hidden /> {t('viewPrices')}
            </Link>
            <Link
              href={CONTACT_PATH}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-border px-6 text-sm font-semibold text-foreground transition-colors hover:border-accent/40"
            >
              {t('contactUs')}
            </Link>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

function PriceRow({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0 last:pb-0">
      <span>
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <span className="shrink-0 font-editorial text-base font-medium text-foreground">{value}</span>
    </li>
  )
}
