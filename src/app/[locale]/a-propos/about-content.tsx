'use client'

import { motion } from 'framer-motion'
import { ArrowUpRight, ChevronRight, Dumbbell, Home, Leaf, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ActivityIcon } from '@/components/activity-icon'
import { CtaSection } from '@/components/sections/cta-section'
import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { activities } from '@/lib/activities'
import { images } from '@/lib/site-content'

const ease = [0.22, 1, 0.36, 1] as const

/** Séparateur losange repris du logo (── ◆ ──). */
function DiamondRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-accent/70" />
      <span className="size-2 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-accent/70" />
    </div>
  )
}

function EyebrowPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-foreground px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
      <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
      {children}
    </span>
  )
}

function AboutHero({ cms }: { cms?: Record<string, string> }) {
  const t = useTranslations('About')
  const tNav = useTranslations('Nav')
  const stats = t.raw('stats') as { value: string; label: string }[]
  const heroImage = cms?.image || '/photos/pool.jpg'
  const eyebrow = cms?.eyebrow || t('hero.eyebrow')
  const description = cms?.description || t('hero.description')

  return (
    <section className="relative isolate min-h-[80vh] overflow-hidden">
      <Image src={heroImage} alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.18_0_0/0.65)] via-[oklch(0.18_0_0/0.5)] to-[oklch(0.18_0_0/0.92)]" aria-hidden />
      <div className="absolute inset-0 bg-[oklch(0.45_0.13_47/0.12)] mix-blend-overlay" aria-hidden />

      <div className="relative mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6">
        <nav aria-label="Fil d'Ariane" className="mb-7">
          <ol className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-white/70">
            <li className="flex items-center gap-1.5">
              <Link href="/" className="flex items-center gap-1 transition-colors hover:text-white">
                <Home className="size-3" aria-hidden />
                <span>{tNav('home')}</span>
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="size-3 text-white/40" aria-hidden />
              <span aria-current="page" className="font-medium text-white">{t('breadcrumb')}</span>
            </li>
          </ol>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease }}
          className="flex flex-col items-center"
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/20 backdrop-blur">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            {eyebrow}
          </span>

          <h1 className="mt-6 font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {cms?.title ? (
              (() => {
                const w = cms.title.trim().split(/\s+/)
                const accent = w.pop() as string
                return (
                  <>
                    {w.join(' ')} <span className="text-accent">{accent}</span>
                  </>
                )
              })()
            ) : (
              <>
                {t('hero.titleLead')} <span className="text-accent">{t('hero.titleAccent')}</span>
              </>
            )}
          </h1>

          <DiamondRule className="mt-6 justify-center" />

          <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg">
            {description}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-10 gap-y-5">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.06, ease }}
              >
                <div className="font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs text-white/60 sm:text-sm">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function StorySection({ cms }: { cms?: Record<string, string> }) {
  const t = useTranslations('About.story')
  const title = cms?.title || t('title')
  const p1 = cms?.paragraph1 || t('p1')
  const p2 = cms?.paragraph2 || t('p2')
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
          className="relative aspect-[4/3] overflow-hidden rounded-3xl ring-1 ring-border lg:aspect-[4/5]"
        >
          <Image src="/photos/lounge.jpg" alt="" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-foreground/20 via-transparent to-transparent" aria-hidden />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
        >
          <EyebrowPill>{t('eyebrow')}</EyebrowPill>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
          <DiamondRule className="mt-5" />
          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg">{p1}</p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{p2}</p>
        </motion.div>
      </div>
    </section>
  )
}

function PillarsSection({ values }: { values?: { title?: string; description?: string }[] }) {
  const t = useTranslations('About.pillars')
  const icons = [Dumbbell, Leaf, Users]
  const fallback = [
    { title: t('sportTitle'), text: t('sportText') },
    { title: t('wellnessTitle'), text: t('wellnessText') },
    { title: t('socialTitle'), text: t('socialText') },
  ]
  const pillars = fallback.map((f, i) => ({
    icon: icons[i],
    title: values?.[i]?.title || f.title,
    text: values?.[i]?.description || f.text,
  }))
  return (
    <section className="border-b border-border/60 bg-[oklch(0.967_0_0)] dark:bg-[oklch(0.18_0_0)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowPill>{t('eyebrow')}</EyebrowPill>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('title')}</h2>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-3">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08, ease }}
              className="group rounded-3xl border border-border bg-card p-7 shadow-[0_10px_30px_-18px_oklch(0.18_0_0/0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_oklch(0.18_0_0/0.35)]"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent ring-1 ring-accent/20">
                <p.icon className="size-6" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ComplexSection({ cms }: { cms?: Record<string, string> }) {
  const t = useTranslations('About.complex')
  const l = useLocale() as Locale
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowPill>{t('eyebrow')}</EyebrowPill>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{cms?.title || t('title')}</h2>
          <p className="mt-4 text-muted-foreground">{cms?.description || t('description')}</p>
        </div>
        <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Link
              key={a.slug}
              href={a.path}
              className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/15">
                <ActivityIcon name={a.icon} className="size-5" />
              </span>
              <span className="flex-1">
                <span className="block font-display text-base font-semibold text-foreground">{a.name[l]}</span>
                <span className="block text-xs text-muted-foreground">{a.tagline[l]}</span>
              </span>
              <ArrowUpRight className="size-4 shrink-0 text-muted-foreground transition-all group-hover:text-accent" aria-hidden />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

function GallerySection({ gallery }: { gallery?: string[] }) {
  const t = useTranslations('About.gallery')
  const photos = gallery && gallery.length > 0 ? gallery : images.aboutGallery
  return (
    <section className="border-b border-border/60 bg-[oklch(0.967_0_0)] dark:bg-[oklch(0.18_0_0)]">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <EyebrowPill>{t('eyebrow')}</EyebrowPill>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{t('title')}</h2>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {photos.map((src, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, ease, delay: i * 0.06 }}
              className={`group relative overflow-hidden rounded-2xl shadow-[0_10px_30px_-12px_oklch(0.18_0_0/0.18)] ring-1 ring-border/60 ${
                i % 4 === 0 || i % 4 === 3 ? 'aspect-[4/5]' : 'aspect-[4/3]'
              }`}
            >
              <Image src={src} alt="" fill sizes="(min-width:768px) 25vw, 50vw" loading="lazy" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" aria-hidden />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutContent() {
  const { data } = useContent('about', {} as {
    hero?: Record<string, string>
    story?: Record<string, string>
    complex?: Record<string, string>
    values?: { title?: string; description?: string }[]
    gallery?: string[]
  })

  return (
    <>
      <AboutHero cms={data.hero} />
      <StorySection cms={data.story} />
      <PillarsSection values={data.values} />
      <ComplexSection cms={data.complex} />
      <GallerySection gallery={data.gallery} />
      <CtaSection />
    </>
  )
}
