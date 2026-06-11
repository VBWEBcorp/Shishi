import { CalendarCheck, CreditCard, MapPin, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { useLocale, useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import Image from 'next/image'
import { Suspense } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { siteConfig } from '@/lib/seo'
import { BookingForm } from './booking-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Booking' })
  return {
    title: t('metaTitle'),
    description: t('subtitle'),
    alternates: { canonical: '/booking' },
  }
}

const waMessage = encodeURIComponent("Hi Shi Shi Samui! I'd like to book a session.")
const waLink = `https://wa.me/${siteConfig.whatsapp}?text=${waMessage}`

export default async function BookingPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  return <BookingContent />
}

function BookingContent() {
  const t = useTranslations('Booking')
  const locale = useLocale() as Locale

  const steps = [
    { Icon: CalendarCheck, title: t('step1Title'), text: t('step1Text') },
    { Icon: CreditCard, title: t('step2Title'), text: t('step2Text') },
    { Icon: ShieldCheck, title: t('step3Title'), text: t('step3Text') },
  ]

  return (
    <div>
      {/* 1 · HERO — vidéo de fond (photo = poster/repli instantané), sombre */}
      <section className="relative isolate overflow-hidden pt-14">
        <Image src="/photos/tennis-aerial.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        {/* Vidéo cinématique. Remplacer /videos/hero-pool.mp4 par la vidéo définitive du client. */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/photos/tennis-aerial.jpg"
          aria-hidden
          className="absolute inset-0 size-full object-cover motion-reduce:hidden"
        >
          <source src="/videos/hero-pool.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.62)] via-[oklch(0.16_0_0/0.55)] to-[oklch(0.14_0_0/0.9)]" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <span className="text-xs font-semibold uppercase tracking-[0.28em] text-accent">{t('eyebrow')}</span>
          <h1 className="mt-4 max-w-2xl font-editorial text-4xl font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/85">{t('subtitle')}</p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-4" aria-hidden /> Lamai, Koh Samui
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-4" aria-hidden /> {t('step3Title')}
            </span>
          </div>
        </div>
      </section>

      {/* 2 · CHOIX DE L'ACTIVITÉ — crème, avec photos */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <h2 className="font-editorial text-2xl font-normal text-foreground sm:text-3xl">{t('whatToBook')}</h2>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={`/booking?activity=${a.slug}#reserver`}
              className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-26px_oklch(0.16_0.02_55/0.45)]"
            >
              <Image
                src={a.image}
                alt={a.name[locale]}
                fill
                sizes="(min-width:1024px) 22rem, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0_0/0.9)] via-[oklch(0.14_0_0/0.2)] to-transparent" aria-hidden />
              <div className="relative flex items-center gap-3 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur">
                  <ActivityIcon name={a.icon} className="size-5" />
                </span>
                <span>
                  <span className="block font-editorial text-lg font-medium text-white">{a.name[locale]}</span>
                  <span className="block text-xs text-white/75">{a.tagline[locale]}</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3 · COMMENT ÇA MARCHE — bande sable */}
      <section className="border-y border-border bg-sand">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <h2 className="font-editorial text-2xl font-normal text-foreground sm:text-3xl">{t('howItWorks')}</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-background p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-ocean/10 text-ocean ring-1 ring-ocean/20">
                    <s.Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-editorial text-3xl font-normal text-foreground/15">{i + 1}</span>
                </div>
                <h3 className="mt-4 font-editorial text-lg font-medium text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 · FORMULAIRE + panneau visuel — crème */}
      <section id="reserver" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>

          <aside className="flex flex-col gap-6">
            {/* Photo d'ambiance */}
            <div className="relative hidden min-h-44 overflow-hidden rounded-2xl ring-1 ring-border lg:block">
              <Image src="/photos/lounge.jpg" alt="" fill sizes="24rem" className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.14_0_0/0.85)] to-transparent" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-editorial text-xl font-medium text-white">Shi Shi Samui</p>
                <p className="mt-0.5 text-sm text-white/80">Lamai · Koh Samui</p>
              </div>
            </div>

            {/* WhatsApp QR */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-7 text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{t('scanToChat')}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&margin=0&data=${encodeURIComponent(waLink)}`}
                alt="WhatsApp QR code for Shi Shi Samui"
                width={180}
                height={180}
                className="mt-4 rounded-xl"
              />
              <p className="mt-4 text-sm text-muted-foreground">{t('scanText')}</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  )
}
