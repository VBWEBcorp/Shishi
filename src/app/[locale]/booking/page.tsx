import { Suspense } from 'react'
import { CalendarCheck, CreditCard, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import { useLocale, useTranslations } from 'next-intl'
import { getTranslations, setRequestLocale } from 'next-intl/server'

import { ActivityIcon } from '@/components/activity-icon'
import { BookingForm } from './booking-form'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { siteConfig } from '@/lib/seo'
import { cn } from '@/lib/utils'

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
    <div className="pt-14">
      <section className="border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <span className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {t('eyebrow')}
          </span>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t('title')}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">{t('subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl font-bold text-foreground">{t('whatToBook')}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={`/activities/${a.slug}`}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-foreground ring-1 ring-border', a.gradient)}>
                <ActivityIcon name={a.icon} className="size-6" />
              </span>
              <span>
                <span className="block font-display font-semibold text-foreground">{a.name[locale]}</span>
                <span className="block text-sm text-muted-foreground">{a.tagline[locale]}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-bold text-foreground">{t('howItWorks')}</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between">
                  <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <s.Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-display text-3xl font-bold text-muted/60">{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <Suspense fallback={null}>
            <BookingForm />
          </Suspense>

          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              {t('scanToChat')}
            </p>
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
        </div>
      </section>
    </div>
  )
}
