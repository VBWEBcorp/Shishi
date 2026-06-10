'use client'

import { Dumbbell, HeartHandshake, Sparkles, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'

export function ValuesBand() {
  const t = useTranslations('Home.values')
  const { data } = useContent('home', {} as { values?: { title?: string; text?: string }[] })
  const cms = data.values
  const icons = [Dumbbell, Sparkles, HeartHandshake]
  const fallback = [
    { title: t('sportTitle'), text: t('sportText') },
    { title: t('wellnessTitle'), text: t('wellnessText') },
    { title: t('socialTitle'), text: t('socialText') },
  ]
  const values = fallback.map((f, i) => ({
    icon: icons[i],
    title: cms?.[i]?.title || f.title,
    text: cms?.[i]?.text || f.text,
  }))

  return (
    <section className="bg-[oklch(0.3_0.055_228)] text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {values.map((v) => (
          <div key={v.title} className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/20">
              <v.icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-editorial text-xl font-medium text-white">{v.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-white/75">{v.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export function StorySection() {
  const t = useTranslations('Home.story')
  const { data } = useContent('home', {} as { story?: Record<string, string> })
  const s = data.story ?? {}

  return (
    <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-border">
          <Image
            src={s.image || '/photos/lounge.jpg'}
            alt="Shi Shi Samui social club"
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            {s.eyebrow || t('eyebrow')}
          </span>
          <h2 className="mt-5 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.6rem]">
            {s.title || t('title')}
          </h2>
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>{s.paragraph1 || t('p1')}</p>
            <p>{s.paragraph2 || t('p2')}</p>
          </div>
          <Link
            href="/a-propos"
            className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-foreground"
          >
            {t('cta')}
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}

export function BookingCta() {
  const t = useTranslations('Home.cta')
  const { data } = useContent('home', {} as { cta?: Record<string, string> })
  const c = data.cta ?? {}

  return (
    <section className="relative isolate overflow-hidden">
      <Image
        src="/photos/pool-2.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      {/* Voile chaud et doux (Lifetime) + tinte orange discrète */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0.02_55/0.55)] via-[oklch(0.16_0.02_55/0.6)] to-[oklch(0.14_0.02_55/0.82)]" aria-hidden />
      <div className="absolute inset-0 bg-[oklch(0.55_0.12_55/0.1)] mix-blend-soft-light" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:py-36">
        <span className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
          {t('eyebrow')}
        </span>
        <h2 className="mt-5 font-editorial text-[2.2rem] font-normal leading-[1.08] tracking-[-0.01em] text-white sm:text-[3rem]">
          {c.title || t('title')}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80">
          {c.description || t('subtitle')}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/booking"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-semibold text-accent-foreground shadow-[0_14px_34px_-10px_oklch(0.63_0.187_47/0.65)] transition-all hover:-translate-y-0.5 hover:brightness-105"
          >
            {c.button || t('bookCourt')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white/10 px-7 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/15"
          >
            {t('getInTouch')}
          </Link>
        </div>
      </div>
    </section>
  )
}
