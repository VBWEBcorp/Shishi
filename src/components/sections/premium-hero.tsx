'use client'

import { motion } from 'framer-motion'
import { ChevronRight, Home } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { ReactNode } from 'react'

const ease = [0.22, 1, 0.36, 1] as const

interface PremiumHeroProps {
  eyebrow: string
  title: string
  description?: string
  image?: string
  breadcrumb: string
  /** Affichage compact (sans image, plus centré) */
  compact?: boolean
  /** Contenu additionnel sous la description (stats, badges, etc.) */
  children?: ReactNode
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

export function PremiumHero({
  eyebrow,
  title,
  description,
  image,
  breadcrumb,
  compact = false,
  children,
}: PremiumHeroProps) {
  const { lead, accent } = splitTitle(title)
  const hasImage = !compact && Boolean(image)

  return (
    <section className="relative isolate overflow-hidden border-b border-border/60 bg-[oklch(0.975_0.012_285)] dark:bg-[oklch(0.16_0.02_285)]">

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="pt-24 sm:pt-28">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <Link
                href="/"
                className="flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <Home className="size-3" aria-hidden />
                <span>Accueil</span>
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className="size-3 text-muted-foreground/50" aria-hidden />
              <span aria-current="page" className="font-medium text-foreground">
                {breadcrumb}
              </span>
            </li>
          </ol>
        </nav>

        <div
          className={
            hasImage
              ? 'grid items-center gap-12 pt-10 pb-16 sm:pt-14 sm:pb-20 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:pt-20 lg:pb-28'
              : 'pt-10 pb-20 text-center sm:pt-16 sm:pb-24 lg:pt-24 lg:pb-32'
          }
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className={hasImage ? '' : 'mx-auto max-w-3xl'}
          >
            {/* Eyebrow en mono — style Linear/Vercel */}
            <p className="font-display text-xs font-semibold tracking-[0.22em] uppercase text-primary">
              {eyebrow}
            </p>

            <h1
              className={
                hasImage
                  ? 'mt-6 font-display text-balance text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[56px]'
                  : 'mt-6 font-display text-balance text-4xl leading-[1.05] font-semibold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-[60px]'
              }
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
            </h1>

            {description && (
              <p
                className={
                  hasImage
                    ? 'mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg'
                    : 'mx-auto mt-6 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg'
                }
              >
                {description}
              </p>
            )}

            {children && <div className="mt-10">{children}</div>}
          </motion.div>

          {hasImage && image && (
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.15, ease }}
              className="relative"
            >
              {/* Glow violet derrière */}
              <div
                className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] opacity-70 blur-3xl"
                aria-hidden
                style={{
                  background:
                    'radial-gradient(ellipse at center, oklch(0.55 0.2 285 / 0.3) 0%, transparent 70%)',
                }}
              />

              <div className="relative overflow-hidden rounded-2xl bg-background/40 p-1.5 shadow-[0_30px_60px_-20px_oklch(0.2_0.02_264/0.3)] backdrop-blur-xl ring-1 ring-border/60">
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

                <div className="relative aspect-[4/5] overflow-hidden rounded-xl lg:aspect-[3/4]">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 500px, 100vw"
                    priority
                    className="object-cover"
                  />
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/15 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
