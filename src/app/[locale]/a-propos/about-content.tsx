'use client'

import { motion } from 'framer-motion'
import { BookOpen, ChevronRight, Dumbbell, Home, LayoutGrid, Leaf, Sparkles, Users } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'

import { ResponsivePhoto } from '@/components/responsive-photo'
import { SectionEyebrow } from '@/components/section-eyebrow'
import { ServicesShowcase } from '@/components/sections/services-showcase'
import { useContent } from '@/hooks/use-content'
import { Link } from '@/i18n/navigation'
import type { Locale } from '@/i18n/routing'
import { hasImage, type ResponsiveImageValue } from '@/lib/responsive-image'
import { photoAlt } from '@/lib/photo-alt'
import { images as siteImages } from '@/lib/site-content'

const ease = [0.22, 1, 0.36, 1] as const

/** Champs du hero « À propos » pilotés par l'espace admin. */
type AboutHeroContent = {
  eyebrow?: string
  title?: string
  description?: string
  image?: ResponsiveImageValue
}

/** Séparateur losange repris du logo (── ◆ ──), version claire pour fonds sombres. */
function DiamondRule({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-white/50" />
      <span className="size-1.5 rotate-45 bg-accent" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-white/50" />
    </div>
  )
}

function AboutHero({ cms }: { cms?: AboutHeroContent }) {
  const t = useTranslations('About')
  const l = useLocale() as Locale
  const tNav = useTranslations('Nav')
  const stats = t.raw('stats') as { value: string; label: string }[]
  // `image` peut être une URL ou la paire { desktop, mobile } saisie en admin.
  const heroImage = hasImage(cms?.image) ? cms!.image! : '/photos/pool-panorama-portrait.webp'
  const eyebrow = cms?.eyebrow || t('hero.eyebrow')
  const description = cms?.description || t('hero.description')

  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden">
      <ResponsivePhoto
        value={heroImage}
        alt={photoAlt(typeof heroImage === 'string' ? heroImage : undefined, l, t('hero.eyebrow'))}
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.2_0_0/0.4)] via-[oklch(0.2_0_0/0.32)] to-[oklch(0.16_0_0/0.86)]" aria-hidden />

      <div className="relative mx-auto flex min-h-[88vh] max-w-4xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center sm:px-6">
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
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.24em] text-white/90 ring-1 ring-white/20 backdrop-blur">
            <span className="size-1.5 rotate-45 bg-accent" aria-hidden />
            {eyebrow}
          </span>

          {/* Titre éditorial — dernier mot en italique orange (DA home) */}
          <h1 className="mt-7 font-editorial text-balance text-[2.6rem] font-normal leading-[1.05] tracking-[-0.01em] text-white sm:text-6xl lg:text-[4.2rem]">
            {cms?.title ? (
              (() => {
                const w = cms.title.trim().split(/\s+/)
                const accent = w.pop() as string
                return (
                  <>
                    {w.join(' ')} <span className="italic text-accent/95">{accent}</span>
                  </>
                )
              })()
            ) : (
              <>
                {t('hero.titleLead')} <span className="italic text-accent/95">{t('hero.titleAccent')}</span>
              </>
            )}
          </h1>

          <DiamondRule className="mt-7 justify-center" />

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
                <div className="font-editorial text-2xl font-normal tracking-tight text-white sm:text-3xl">{s.value}</div>
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
  const l = useLocale() as Locale
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
          <Image src="/photos/pool-grand-angle-portrait.webp" alt={photoAlt('/photos/pool-grand-angle-portrait.webp', l)} fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-foreground/20 via-transparent to-transparent" aria-hidden />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease }}
        >
          <SectionEyebrow icon={BookOpen}>{t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-5 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.6rem]">{title}</h2>
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
          <SectionEyebrow icon={Sparkles}>{t('eyebrow')}</SectionEyebrow>
          <h2 className="mt-5 font-editorial text-[2rem] font-normal leading-[1.1] tracking-[-0.01em] text-foreground sm:text-[2.6rem]">{t('title')}</h2>
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
              <h3 className="mt-5 font-editorial text-xl font-medium text-foreground">{p.title}</h3>
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
    <ServicesShowcase
      locale={l}
      icon={LayoutGrid}
      eyebrow={t('eyebrow')}
      title={cms?.title || t('title')}
      description={cms?.description || t('description')}
    />
  )
}

/**
 * Galerie photo de la page À propos, pilotée depuis l'espace admin.
 * Les emplacements vides sont ignorés : le client peut n'en remplir que deux
 * sans laisser de case grise sur la page.
 */
function AboutGallery({ images }: { images?: ResponsiveImageValue[] }) {
  const t = useTranslations('About')
  const l = useLocale() as Locale
  const shown = (images ?? []).filter((img) => hasImage(img))
  if (shown.length === 0) return null

  return (
    <section className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionEyebrow icon={LayoutGrid}>{t('hero.eyebrow')}</SectionEyebrow>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, ease, delay: i * 0.06 }}
              className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-border"
            >
              <ResponsivePhoto
                value={img}
                alt={photoAlt(typeof img === 'string' ? img : undefined, l)}
                fill
                sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function AboutContent() {
  // Les défauts de la galerie reprennent ceux de l'éditeur admin : la section
  // est donc visible avant même que le client n'ait enregistré quoi que ce soit.
  const { data } = useContent('about', {
    gallery: siteImages.aboutGallery,
  } as {
    hero?: AboutHeroContent
    story?: Record<string, string>
    complex?: Record<string, string>
    values?: { title?: string; description?: string }[]
    gallery?: ResponsiveImageValue[]
  })

  return (
    <>
      <AboutHero cms={data.hero} />
      <StorySection cms={data.story} />
      <PillarsSection values={data.values} />
      <ComplexSection cms={data.complex} />
      <AboutGallery images={data.gallery} />
    </>
  )
}
