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
    <section className="border-y border-border bg-secondary/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {values.map((v) => (
          <div key={v.title} className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/15">
              <v.icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-display text-lg font-semibold text-foreground">{v.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.text}</p>
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
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
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
        src="/photos/pool.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[oklch(0.18_0_0/0.82)]" aria-hidden />
      <div className="relative mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:py-28">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {c.title || t('title')}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/80">{c.description || t('subtitle')}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/booking"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-accent px-7 text-sm font-semibold text-accent-foreground shadow-[0_10px_30px_-8px_oklch(0.63_0.187_47/0.6)] transition-all hover:brightness-105"
          >
            {c.button || t('bookCourt')}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 px-7 text-sm font-semibold text-white ring-1 ring-white/25 backdrop-blur transition-colors hover:bg-white/15"
          >
            {t('getInTouch')}
          </Link>
        </div>
      </div>
    </section>
  )
}
