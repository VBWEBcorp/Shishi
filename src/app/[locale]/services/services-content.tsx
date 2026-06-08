'use client'

import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

import { CtaSection } from '@/components/sections/cta-section'
import { PremiumHero } from '@/components/sections/premium-hero'
import { useContent } from '@/hooks/use-content'
import { getIcon } from '@/lib/icons'
import { images as siteImages, servicesContent } from '@/lib/site-content'

const ease = [0.22, 1, 0.36, 1] as const
const defaultImages = siteImages.services

const defaults = {
  hero: { ...servicesContent.hero, image: '' as string },
  services: servicesContent.list,
}

function ServiceRow({
  service,
  index,
}: {
  service: any
  index: number
}) {
  const Icon = getIcon(service.iconName ?? servicesContent.list[index]?.iconName)
  const isReversed = index % 2 === 1
  const img = service.image || defaultImages[index] || defaultImages[0]
  const ref = useRef<HTMLElement>(null)
  const reduceMotion = useReducedMotion()

  // Parallax sur l'image : translateY de -40px → +40px pendant qu'on traverse l'écran
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], reduceMotion ? [0, 0] : [-40, 40])

  // Si l'utilisateur préfère réduire les animations → on désactive tous les slides/parallax
  const slideX = reduceMotion ? 0 : isReversed ? 60 : -60
  const textSlideX = reduceMotion ? 0 : isReversed ? -40 : 40

  return (
    <motion.article
      ref={ref}
      id={`service-${index}`}
      className={`scroll-mt-24 grid items-center gap-10 lg:grid-cols-2 lg:gap-12 ${
        isReversed ? 'lg:[&>*:first-child]:order-2' : ''
      }`}
    >
      {/* Image — slide latéral selon le sens de la rangée + parallax léger au scroll */}
      <motion.div
        initial={{ opacity: 0, x: slideX, scale: 0.96 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.75, ease }}
        whileHover={{ y: -4 }}
        className="group relative aspect-[4/3] overflow-hidden rounded-3xl shadow-[0_20px_50px_-20px_oklch(0.2_0.02_264/0.25)] ring-1 ring-border/60"
      >
        {/* Wrapper interne avec parallax Y au scroll */}
        <motion.div className="absolute inset-0 -inset-y-10" style={{ y: imageY }}>
          <Image
            src={img}
            alt={service.title}
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            loading={index < 2 ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        </motion.div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-black/10 via-transparent to-transparent"
          aria-hidden
        />

        {/* Numéro 0X flottant + fade scroll */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.5, delay: 0.25, ease }}
          className="absolute left-5 top-5 flex items-center gap-2"
        >
          <span className="rounded-full bg-background/90 px-3 py-1 font-display text-[11px] font-bold tracking-[0.18em] text-foreground backdrop-blur-sm">
            0{index + 1}
          </span>
        </motion.div>
      </motion.div>

      {/* Texte — slide opposé + stagger interne sur les enfants */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        }}
        className="max-w-xl"
      >
        {/* Wrapper qui slide depuis le côté */}
        <motion.span
          variants={{
            hidden: { opacity: 0, x: textSlideX, y: 8 },
            visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease } },
          }}
          className="inline-flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20"
        >
          <Icon className="size-5" aria-hidden />
        </motion.span>

        <motion.h3
          variants={{
            hidden: { opacity: 0, x: textSlideX, y: 8 },
            visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.6, ease } },
          }}
          className="mt-5 font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-3xl lg:text-4xl"
        >
          {service.title}
        </motion.h3>

        <motion.p
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
          }}
          className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          {service.description || service.desc}
        </motion.p>

        {/* Points clés avec stagger individuel */}
        {service.points && service.points.length > 0 && (
          <motion.ul
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
            }}
            className="mt-6 space-y-2.5"
          >
            {service.points.map((p: string, i: number) => (
              <motion.li
                key={i}
                variants={{
                  hidden: { opacity: 0, x: -8 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease } },
                }}
                className="flex items-center gap-3 text-sm text-foreground/80"
              >
                <span
                  className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
                  aria-hidden
                >
                  <svg viewBox="0 0 12 12" fill="none" className="size-3">
                    <path
                      d="M2.5 6L5 8.5L9.5 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {p}
              </motion.li>
            ))}
          </motion.ul>
        )}

      </motion.div>
    </motion.article>
  )
}

export function ServicesContent() {
  const { data } = useContent('services', defaults)
  const hero = data.hero ?? defaults.hero
  const services = data.services ?? defaults.services

  return (
    <>
      <PremiumHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        breadcrumb="Services"
        compact
        backgroundImage={siteImages.servicesHero}
      >
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
          {servicesContent.kpis.map((kpi, i, arr) => (
            <div key={kpi.label} className="flex items-center gap-x-8">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-2xl font-semibold tracking-tight text-white">
                  {kpi.value}
                </span>
                <span className="text-white/70">{kpi.label}</span>
              </div>
              {i < arr.length - 1 && (
                <span className="hidden h-1 w-1 rounded-full bg-white/40 sm:inline" aria-hidden />
              )}
            </div>
          ))}
        </div>
      </PremiumHero>

      {/* Rangées alternées image + texte */}
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="space-y-16 lg:space-y-20">
            {services.map((s: any, i: number) => (
              <ServiceRow key={s.title || i} service={s} index={i} />
            ))}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
