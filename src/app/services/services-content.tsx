'use client'

import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BarChart3,
  Code,
  Globe,
  Megaphone,
  Palette,
  Search,
  ShieldCheck,
  Smartphone,
} from 'lucide-react'

import { CtaSection } from '@/components/sections/cta-section'
import { PremiumHero } from '@/components/sections/premium-hero'
import { AmbientShapes } from '@/components/ui/ambient-shapes'
import { useContent } from '@/hooks/use-content'

const ease = [0.22, 1, 0.36, 1] as const
const defaultIcons = [Globe, Smartphone, Search, Palette, Megaphone, Code, ShieldCheck, BarChart3]

const defaults = {
  hero: {
    eyebrow: 'Nos services',
    title: "Tout ce qu'il faut pour réussir en ligne",
    description:
      "Des prestations complètes, de la conception à l'accompagnement continu, adaptées à toutes les tailles d'entreprise.",
    image: '',
  },
  services: [
    { title: 'Création de site vitrine', description: 'Un site moderne, rapide et responsive qui présente clairement votre activité et inspire confiance à vos visiteurs.' },
    { title: 'Application web', description: 'Outils métier, plateformes de réservation, espaces clients : des applications pensées pour simplifier votre quotidien.' },
    { title: 'Référencement naturel (SEO)', description: 'Optimisation technique, contenu stratégique et suivi de positionnement pour gagner en visibilité sur Google.' },
    { title: 'Identité visuelle', description: 'Logo, charte graphique, supports de communication : une image cohérente qui vous ressemble.' },
    { title: 'Communication digitale', description: 'Stratégie de contenu, réseaux sociaux et campagnes pour développer votre audience en ligne.' },
    { title: 'Développement sur mesure', description: 'Intégrations, automatisations, API : des solutions techniques taillées pour vos besoins spécifiques.' },
    { title: 'Maintenance & sécurité', description: 'Mises à jour, sauvegardes, monitoring et corrections pour un site toujours performant et sécurisé.' },
    { title: 'Analyse & reporting', description: 'Tableaux de bord clairs pour suivre vos performances, comprendre vos visiteurs et ajuster votre stratégie.' },
  ],
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
      >
        {/* KPIs centrés */}
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-medium tracking-tight text-foreground">8</span>
            <span className="text-muted-foreground">prestations</span>
          </div>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline" aria-hidden />
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-medium tracking-tight text-foreground">200+</span>
            <span className="text-muted-foreground">projets livrés</span>
          </div>
          <span className="hidden h-1 w-1 rounded-full bg-muted-foreground/40 sm:inline" aria-hidden />
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-medium tracking-tight text-foreground">100%</span>
            <span className="text-muted-foreground">sur mesure</span>
          </div>
        </div>
      </PremiumHero>

      <section className="relative isolate overflow-hidden border-b border-border/60 bg-muted/40">
        <AmbientShapes variant="tinted-violet" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          {/* En-tête de section */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-mono text-[11px] font-medium tracking-[0.2em] text-primary uppercase">
              En détail
            </p>
            <h2 className="mt-4 font-display text-balance text-3xl font-semibold leading-tight tracking-[-0.02em] text-foreground sm:text-4xl">
              Chaque prestation, expliquée
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s: any, i: number) => {
              const Icon = defaultIcons[i] ?? Globe
              return (
                <motion.div
                  key={s.title || i}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ duration: 0.45, ease, delay: i * 0.03 }}
                  className="h-full"
                >
                  <div className="group relative h-full overflow-hidden rounded-2xl bg-card/80 p-6 shadow-[0_8px_24px_-12px_oklch(0.2_0.02_264/0.15)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_oklch(0.2_0.02_264/0.25)]">
                    {/* Bordure dégradée premium */}
                    <div
                      className="pointer-events-none absolute inset-0 rounded-2xl p-px"
                      aria-hidden
                      style={{
                        background:
                          'linear-gradient(135deg, oklch(0.55 0.2 285 / 0.35) 0%, oklch(0.91 0.012 264 / 0.55) 50%, oklch(0.55 0.2 285 / 0.35) 100%)',
                        WebkitMask:
                          'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                        WebkitMaskComposite: 'xor',
                        maskComposite: 'exclude',
                      }}
                    />
                    {/* Soft glow violet on hover */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -top-16 -right-16 size-40 rounded-full bg-primary/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
                    />

                    <div className="relative flex h-full flex-col">
                      <div className="flex items-start justify-between">
                        <span className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/20">
                          <Icon className="size-5" aria-hidden />
                        </span>
                        <span className="font-mono text-[11px] font-medium tracking-[0.2em] text-muted-foreground/60">
                          0{i + 1}
                        </span>
                      </div>
                      <h3 className="mt-5 font-display text-base font-semibold tracking-tight text-foreground">
                        {s.title}
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {s.description}
                      </p>
                      <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        En savoir plus
                        <ArrowUpRight className="size-3 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <CtaSection />
    </>
  )
}
