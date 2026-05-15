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
  /** Image affichée à droite (mode 2-col, quand `compact` est false) */
  image?: string
  /** Image de fond plein écran derrière le hero (mode compact + photo) */
  backgroundImage?: string
  breadcrumb: string
  /** Affichage compact (centré, sans image à droite) */
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
  backgroundImage,
  breadcrumb,
  compact = false,
  children,
}: PremiumHeroProps) {
  const { lead, accent } = splitTitle(title)
  const hasImage = !compact && Boolean(image)
  const hasBgImage = Boolean(backgroundImage)
  const darkOver = hasBgImage // texte blanc sur photo sombre

  return (
    <section
      className={`relative isolate overflow-hidden border-b border-border/60 ${
        hasBgImage ? 'bg-background' : 'bg-[oklch(0.975_0.012_285)] dark:bg-[oklch(0.16_0.02_285)]'
      }`}
    >
      {/* Image de fond plein largeur + overlay sombre + fade vers le bas (style Blog) */}
      {hasBgImage && backgroundImage && (
        <>
          <div className="absolute inset-0 -z-20" aria-hidden>
            <Image
              src={backgroundImage}
              alt=""
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          </div>
          {/* Overlay sombre uniforme en haut + s'estompe sur le dernier quart (sinon ça crée du gris quand le fade blanc arrive) */}
          <div
            className="absolute inset-0 -z-10"
            aria-hidden
            style={{
              background:
                'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.60) 70%, rgba(0,0,0,0) 100%)',
            }}
          />
          {/* Fade vers le bg uniquement sur les ~96px du bas */}
          <div
            className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-background to-transparent"
            aria-hidden
          />
        </>
      )}

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="pt-24 sm:pt-28">
          <ol className={`flex flex-wrap items-center gap-1.5 text-xs ${darkOver ? 'text-white/60' : 'text-muted-foreground'}`}>
            <li className="flex items-center gap-1.5">
              <Link
                href="/"
                className={`flex items-center gap-1 transition-colors ${darkOver ? 'hover:text-white' : 'hover:text-foreground'}`}
              >
                <Home className="size-3" aria-hidden />
                <span>Accueil</span>
              </Link>
            </li>
            <li className="flex items-center gap-1.5">
              <ChevronRight className={`size-3 ${darkOver ? 'text-white/40' : 'text-muted-foreground/50'}`} aria-hidden />
              <span aria-current="page" className={darkOver ? 'font-medium text-white/90' : 'font-medium text-foreground'}>
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
            {/* Eyebrow */}
            <p
              className={`font-display text-xs font-semibold tracking-[0.22em] uppercase ${
                darkOver ? 'text-white/70' : 'text-primary'
              }`}
            >
              {eyebrow}
            </p>

            <h1
              className={`mt-6 font-display text-balance pb-1 text-4xl leading-[1.15] font-semibold tracking-[-0.035em] sm:text-5xl ${
                hasImage ? 'lg:text-[56px]' : 'lg:text-[60px]'
              } ${darkOver ? 'text-white' : 'text-foreground'}`}
            >
              {lead ? (
                <>
                  {lead}{' '}
                  <span
                    className={`relative inline-block pb-1 font-serif italic font-normal tracking-[-0.01em] ${
                      darkOver ? 'text-[oklch(0.78_0.15_285)]' : 'text-primary'
                    }`}
                  >
                    {accent}
                  </span>
                </>
              ) : (
                accent
              )}
            </h1>

            {description && (
              <p
                className={`mt-6 max-w-2xl text-pretty text-base leading-relaxed sm:text-lg ${
                  hasImage ? 'max-w-xl' : 'mx-auto'
                } ${darkOver ? 'text-white/75' : 'text-muted-foreground'}`}
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
