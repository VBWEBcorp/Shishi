'use client'

import { BookOpen, CalendarCheck, Dumbbell, Gem, HeartHandshake, Martini, Palmtree, Sparkles, Sun } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import type { ReactNode } from 'react'

import { ActivityIcon } from '@/components/activity-icon'
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
    <section className="border-y border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* En-tête éditorial */}
        <div className="max-w-2xl">
          <SectionEyebrow icon={Gem}>{t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-5 font-editorial text-[2.1rem] font-normal leading-[1.08] tracking-[-0.01em] text-foreground sm:text-[2.9rem]">
            {t('title')}
          </h2>
        </div>

        {/* Timeline « 3 piliers » — verticale sur mobile, horizontale sur desktop */}
        <ol className="relative mt-12 grid gap-y-12 md:mt-16 md:grid-cols-3 md:gap-x-8">
          {/* Rail vertical (mobile) */}
          <span
            className="pointer-events-none absolute left-8 top-8 bottom-4 w-px bg-gradient-to-b from-accent/40 via-border to-transparent md:hidden"
            aria-hidden
          />
          {/* Rail horizontal (desktop) */}
          <span
            className="pointer-events-none absolute inset-x-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent md:block"
            aria-hidden
          />

          {values.map((v) => (
            <li
              key={v.title}
              className="group relative flex items-start gap-5 md:flex-col md:items-center md:gap-0 md:text-center"
            >
              {/* Nœud sur le rail */}
              <span className="relative z-10 flex size-16 shrink-0 items-center justify-center rounded-full bg-background">
                <span className="flex size-14 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20 transition-all duration-500 group-hover:scale-110 group-hover:bg-accent group-hover:text-accent-foreground group-hover:ring-accent">
                  <v.icon className="size-7" aria-hidden />
                </span>
              </span>

              {/* Contenu */}
              <div className="pt-2 md:mt-6 md:pt-0">
                <h3 className="font-editorial text-xl font-medium text-foreground sm:text-2xl">
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:mx-auto md:max-w-xs">
                  {v.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
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

/**
 * Bandeau d'activités qui défile tout seul, en boucle continue.
 * Deux copies côte à côte + `animate-marquee-band` (translateX -50%) = boucle
 * sans couture. Purement décoratif (les mêmes liens existent dans le footer),
 * d'où aria-hidden sur le conteneur. Icônes en orange (accent), identiques à
 * celles du haut de page (ActivityIcon) — plus d'emoji.
 */
function ActivityMarquee() {
  const locale = useLocale() as Locale

  const items: { icon: ReactNode; label: string }[] = [
    ...activities.map((a) => ({
      icon: <ActivityIcon name={a.icon} className="size-[1.05em]" />,
      label: a.name[locale],
    })),
    { icon: <Palmtree className="size-[1.05em]" aria-hidden />, label: 'Koh Samui' },
    { icon: <Martini className="size-[1.05em]" aria-hidden />, label: 'Pool Bar' },
    { icon: <Sparkles className="size-[1.05em]" aria-hidden />, label: locale === 'fr' ? 'Bien-être' : 'Wellness' },
    { icon: <Sun className="size-[1.05em]" aria-hidden />, label: 'Lamai' },
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
            className="inline-flex shrink-0 items-center gap-2.5 text-nowrap pe-7 font-editorial text-base font-normal tracking-wide text-white/55 sm:pe-10 sm:text-xl"
          >
            <span className="inline-flex text-accent">{it.icon}</span>
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
        src="/photos/cta-pret-a-jouer.png"
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
        <div className="mt-9 flex flex-row items-center justify-center gap-2.5 sm:gap-3">
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
      <div className="relative mt-24 pb-8 sm:mt-36 sm:pb-10">
        <ActivityMarquee />
      </div>
    </section>
  )
}
