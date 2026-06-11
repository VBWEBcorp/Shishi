'use client'

import { BookOpen, CalendarCheck, Dumbbell, HeartHandshake, Sparkles } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { CtaButton } from '@/components/cta-button'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'
import { activities, type Locale } from '@/lib/activities'

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
    <section className="border-y border-border bg-background text-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 md:grid-cols-3 lg:px-8">
        {values.map((v) => (
          <div key={v.title} className="flex gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-foreground/5 text-foreground ring-1 ring-foreground/10">
              <v.icon className="size-6" aria-hidden />
            </span>
            <div>
              <h3 className="font-editorial text-xl font-medium text-foreground">{v.title}</h3>
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
          <SectionEyebrow icon={BookOpen}>{s.eyebrow || t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-5 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.6rem]">
            {s.title || t('title')}
          </h2>
          <div className="mt-5 space-y-4 text-muted-foreground">
            <p>{s.paragraph1 || t('p1')}</p>
            <p>{s.paragraph2 || t('p2')}</p>
          </div>
          <CtaButton href="/a-propos" tone="dark" size="sm" className="mt-7">
            {t('cta')}
          </CtaButton>
        </div>
      </div>
    </section>
  )
}

/** Emoji par activité pour le bandeau défilant pré-footer. */
const MARQUEE_EMOJI: Record<string, string> = {
  pickleball: '🏓',
  tennis: '🎾',
  fitness: '💪',
  restaurant: '🍽️',
  'kids-club': '🧒',
  pool: '🏊',
}

/**
 * Bandeau de noms d'activités qui défile tout seul, en boucle continue.
 * Deux copies côte à côte + `animate-marquee-band` (translateX -50%) = boucle
 * sans couture. Purement décoratif (les mêmes liens existent dans le footer),
 * d'où aria-hidden sur le conteneur.
 */
function ActivityMarquee() {
  const locale = useLocale() as Locale

  const items: { emoji: string; label: string }[] = [
    ...activities.map((a) => ({ emoji: MARQUEE_EMOJI[a.slug] ?? '✨', label: a.name[locale] })),
    { emoji: '🌴', label: 'Koh Samui' },
    { emoji: '🍹', label: 'Pool Bar' },
    { emoji: '🧘', label: locale === 'fr' ? 'Bien-être' : 'Wellness' },
    { emoji: '☀️', label: 'Lamai' },
  ]

  const loop = [...items, ...items]

  return (
    <div
      aria-hidden
      className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
    >
      <ul className="animate-marquee-band flex shrink-0 items-center">
        {loop.map((it, i) => (
          <li
            key={i}
            className="inline-flex shrink-0 items-center gap-3 text-nowrap pe-8 font-editorial text-lg font-normal tracking-wide text-white/55 sm:pe-12 sm:text-2xl"
          >
            <span className="text-[1.1em]">{it.emoji}</span>
            <span>{it.label}</span>
            <span className="text-white/25">•</span>
          </li>
        ))}
      </ul>
    </div>
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
      {/* Voile neutre pour la lisibilité + fondu noir exact du footer en bas */}
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.3)] via-[oklch(0.15_0_0/0.74)] to-[oklch(0.18_0_0)]" aria-hidden />
      {/* Fondu blanc en haut : blanc pur au sommet (zéro ligne), puis estompe doux */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,#ffffff_0%,rgba(255,255,255,0.5)_25%,rgba(255,255,255,0)_100%)] sm:h-40" aria-hidden />

      <div className="relative mx-auto max-w-3xl px-4 pt-36 text-center sm:px-6 sm:pt-44 lg:pt-52">
        <SectionEyebrow icon={CalendarCheck} tone="light" className="justify-center">
          {t('eyebrow')}
        </SectionEyebrow>
        <h2 className="mt-5 font-editorial text-[2.2rem] font-normal leading-[1.08] tracking-[-0.01em] text-white sm:text-[3rem]">
          {c.title || t('title')}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/80">
          {c.description || t('subtitle')}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaButton href="/book-now" tone="glass" size="sm">
            {c.button || t('bookCourt')}
          </CtaButton>
          <Link
            href="/contact-location"
            className="inline-flex h-12 items-center justify-center rounded-full bg-white/10 px-6 text-sm font-semibold text-white ring-1 ring-white/30 backdrop-blur transition-colors hover:bg-white/15"
          >
            {t('getInTouch')}
          </Link>
        </div>
      </div>

      {/* Bandeau défilant, puis fondu dans le footer */}
      <div className="relative mt-16 pb-14 sm:mt-24 sm:pb-20">
        <ActivityMarquee />
      </div>
    </section>
  )
}
