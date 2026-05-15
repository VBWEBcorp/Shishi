'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Star } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

import { ValuesMarquee } from '@/components/sections/values-marquee'
import { AmbientShapes } from '@/components/ui/ambient-shapes'
import { Button } from '@/components/ui/button'
import { useContent } from '@/hooks/use-content'

const ease = [0.22, 1, 0.36, 1] as const
const INTERVAL = 5000

const defaults = {
  eyebrow: 'Nouveau · Disponible',
  title: 'Votre partenaire pour réussir en ligne',
  description:
    'Nous accompagnons les entreprises avec des solutions sur mesure, pensées pour durer. Présence digitale, performance et clarté.',
  button1: 'Prendre contact',
  button2: 'Découvrir nos services',
  images: [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1920&q=80',
  ],
}

function splitTitle(title: string): { lead: string; accent: string } {
  const words = title.trim().split(/\s+/)
  if (words.length <= 2) return { lead: '', accent: title }
  const accentCount = Math.min(2, Math.max(1, Math.floor(words.length / 3)))
  return {
    lead: words.slice(0, words.length - accentCount).join(' '),
    accent: words.slice(words.length - accentCount).join(' '),
  }
}

export function HeroSection() {
  const { data } = useContent('home', { hero: defaults })
  const hero = data.hero ?? defaults
  const images: string[] = hero.images ?? defaults.images
  const [current, setCurrent] = useState(0)
  const { lead, accent } = splitTitle(hero.title)

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, INTERVAL)
    return () => clearInterval(id)
  }, [images.length])

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-background">
      {/* Base gradient */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-background via-background to-muted/40" aria-hidden />
      <AmbientShapes variant="hero" />
      {/* Fade vers le bas pour transition avec section suivante */}
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-background to-transparent" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6 sm:pt-36 sm:pb-20 lg:px-8 lg:pt-44 lg:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          {/* Eyebrow en mono */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
            className="font-mono text-[11px] font-medium tracking-[0.2em] uppercase text-primary"
          >
            {hero.eyebrow}
          </motion.p>

          {/* Titre avec mots accentués en gradient */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08, ease }}
            className="mt-6 font-display text-balance text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[64px]"
          >
            {lead ? (
              <>
                {lead}{' '}
                <span className="relative inline-block font-serif italic font-normal tracking-[-0.01em] bg-gradient-to-br from-primary via-[oklch(0.55_0.22_285)] to-[oklch(0.5_0.22_260)] bg-clip-text text-transparent dark:from-primary dark:via-[oklch(0.75_0.16_285)] dark:to-[oklch(0.68_0.18_260)]">
                  {accent}
                  <span
                    className="absolute -inset-x-2 -bottom-1 -z-10 h-[40%] rounded-full bg-primary/15 blur-2xl"
                    aria-hidden
                  />
                </span>
              </>
            ) : (
              accent
            )}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16, ease }}
            className="mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            {hero.description}
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.24, ease }}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            {/* CTA primary premium */}
            <Link
              href="/contact"
              className="group/cta relative inline-flex h-11 items-center gap-2 overflow-hidden rounded-xl px-5 text-sm font-medium text-primary-foreground shadow-[0_8px_24px_-8px_oklch(0.48_0.22_285/0.5)] transition-all hover:shadow-[0_12px_32px_-8px_oklch(0.48_0.22_285/0.6)] active:translate-y-px"
            >
              <span
                className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[oklch(0.42_0.22_280)] dark:from-primary dark:via-primary dark:to-[oklch(0.65_0.18_280)]"
                aria-hidden
              />
              <span
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover/cta:translate-x-full"
                aria-hidden
              />
              <span
                className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"
                aria-hidden
              />
              <span className="relative">{hero.button1}</span>
              <ArrowRight
                className="relative size-4 transition-transform duration-300 group-hover/cta:translate-x-0.5"
                aria-hidden
              />
            </Link>

            {/* CTA secondary glassy */}
            <Button
              size="lg"
              variant="outline"
              className="h-11 rounded-xl border-border/80 bg-background/60 px-5 backdrop-blur-sm hover:bg-background/90"
              asChild
            >
              <Link href="/services">{hero.button2}</Link>
            </Button>
          </motion.div>

          {/* Social proof : rating + avatars */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.32, ease }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-5"
          >
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="size-7 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 ring-2 ring-background"
                  style={{
                    background: `linear-gradient(135deg, oklch(${0.55 + i * 0.05} 0.18 ${260 + i * 15} / 0.7), oklch(${0.65 + i * 0.04} 0.15 ${285 + i * 10} / 0.5))`,
                  }}
                  aria-hidden
                />
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex items-center gap-0.5 text-primary">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-3.5 fill-current" aria-hidden />
                ))}
              </div>
              <span className="font-mono font-medium text-foreground">4.9/5</span>
              <span className="text-muted-foreground">· 200+ clients satisfaits</span>
            </div>
          </motion.div>
        </div>

        {/* Preview card glassy avec carousel d'images */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4, ease }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          {/* Glow violet derrière la card */}
          <div
            className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] opacity-70 blur-3xl"
            aria-hidden
            style={{
              background:
                'radial-gradient(ellipse at center, oklch(0.55 0.2 285 / 0.25) 0%, transparent 70%)',
            }}
          />

          <div className="relative overflow-hidden rounded-2xl bg-background/40 p-1.5 shadow-[0_30px_60px_-20px_oklch(0.2_0.02_264/0.3)] backdrop-blur-xl ring-1 ring-border/60">
            {/* Bordure dégradée */}
            <div
              className="pointer-events-none absolute inset-0 rounded-2xl p-px"
              aria-hidden
              style={{
                background:
                  'linear-gradient(135deg, oklch(0.55 0.2 285 / 0.4) 0%, oklch(0.91 0.012 264 / 0.5) 50%, oklch(0.55 0.2 285 / 0.4) 100%)',
                WebkitMask:
                  'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              }}
            />

            <div className="relative aspect-[16/9] overflow-hidden rounded-xl">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={current}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 1, ease }}
                  className="absolute inset-0"
                >
                  <Image
                    src={images[current]}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 1024px, 100vw"
                    priority={current === 0}
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Overlay gradient subtil pour donner de la profondeur */}
              <div
                className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-transparent"
                aria-hidden
              />

              {/* Indicateurs */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Image ${i + 1}`}
                      onClick={() => setCurrent(i)}
                      className={`h-1 rounded-full backdrop-blur-sm transition-all duration-500 ${
                        i === current
                          ? 'w-7 bg-white shadow-[0_0_10px_oklch(1_0_0/0.5)]'
                          : 'w-3 bg-white/40 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative">
        <ValuesMarquee />
      </div>
    </section>
  )
}
