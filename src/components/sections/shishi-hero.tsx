import { ArrowRight, MapPin, Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { WeatherWidget } from '@/components/weather-widget'
import { Link } from '@/i18n/navigation'

export function ShishiHero() {
  const t = useTranslations('Home.hero')

  const stats = [
    { value: '6', label: t('statActivities') },
    { value: '24/7', label: t('statBooking') },
    { value: '1 min', label: t('statToBook') },
  ]

  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden">
      <Image
        src="https://images.unsplash.com/photo-1540206395-68808572332f?auto=format&fit=crop&w=2000&q=80"
        alt="Tropical sport resort in Koh Samui"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0.03_168/0.55)] via-[oklch(0.2_0.03_168/0.45)] to-[oklch(0.16_0.02_168/0.85)]" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.16_0.02_168/0.6)] to-transparent" aria-hidden />

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-32 sm:px-6 lg:px-8 lg:pb-24">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur">
              <MapPin className="size-3.5" aria-hidden />
              {t('badge')}
            </span>
            <WeatherWidget />
          </div>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {t.rich('title', {
              accent: (chunks) => <span className="text-accent">{chunks}</span>,
            })}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85">{t('subtitle')}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/booking"
              className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.7_0.16_38/0.6)] transition-all hover:brightness-105 active:translate-y-px"
            >
              {t('bookCourt')}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <Link
              href="/#activities"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/15"
            >
              {t('explore')}
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs uppercase tracking-wide text-white/60">{s.label}</div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-white/80">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-accent text-accent" aria-hidden />
                ))}
              </div>
              <span className="text-xs">{t('loved')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
