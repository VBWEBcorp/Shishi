'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Play, X } from 'lucide-react'

interface GalleryItem {
  _id: string
  title: string
  description?: string
  type?: 'image' | 'video'
  imageUrl?: string
  videoUrl?: string
  category?: string
}

interface GallerySettings {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
}

const ease = [0.22, 1, 0.36, 1] as const

interface Props {
  initialSettings: GallerySettings
  initialImages: GalleryItem[]
}

/** Extrait l'ID YouTube / Vimeo et construit l'embed + la vignette. */
function videoMeta(url?: string): { kind: 'embed' | 'file'; src: string; thumb: string | null } | null {
  if (!url) return null
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/)
  if (yt) return { kind: 'embed', src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1`, thumb: `https://img.youtube.com/vi/${yt[1]}/hqdefault.jpg` }
  const vi = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vi) return { kind: 'embed', src: `https://player.vimeo.com/video/${vi[1]}?autoplay=1`, thumb: null }
  return { kind: 'file', src: url, thumb: null }
}

function thumbFor(item: GalleryItem): string | null {
  if (item.type === 'video') return item.imageUrl || videoMeta(item.videoUrl)?.thumb || null
  return item.imageUrl || null
}

export default function GalleryContent({ initialSettings, initialImages }: Props) {
  const [settings] = useState<GallerySettings>(initialSettings)
  const [items] = useState<GalleryItem[]>(initialImages)
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null)

  if (!settings?.enabled) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">La galerie n&apos;est pas disponible pour le moment.</p>
      </div>
    )
  }

  const lbVideo = lightbox?.type === 'video' ? videoMeta(lightbox.videoUrl) : null

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative flex min-h-[340px] items-center overflow-hidden sm:min-h-[400px] lg:min-h-[440px]">
        <div className="absolute inset-0">
          {settings.heroImage ? (
            <Image src={settings.heroImage} alt="" fill sizes="100vw" priority className="object-cover" />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-accent/25 via-foreground/10 to-background" />
          )}
        </div>
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
              {settings.eyebrow || 'Galerie'}
            </p>
            <h1 className="font-display text-4xl tracking-tight text-white sm:text-5xl lg:text-6xl">
              {settings.title || 'Galerie'}
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-white/75 sm:text-xl">
              {settings.description || 'Photos et vidéos de la vie au club.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Grille */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => {
              const isVideo = item.type === 'video'
              const thumb = thumbFor(item)
              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease, delay: Math.min(i * 0.05, 0.4) }}
                  className="group cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card transition-all hover:-translate-y-1 hover:border-accent/30 hover:shadow-xl"
                  onClick={() => setLightbox(item)}
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={thumb}
                        alt={item.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-foreground/80 to-foreground/40" />
                    )}
                    {isVideo && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                        <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg transition-transform group-hover:scale-110">
                          <Play className="ml-0.5 size-6 fill-current" />
                        </span>
                      </div>
                    )}
                    {item.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 p-5">
                    <h3 className="font-display text-lg text-foreground transition-colors group-hover:text-accent">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-lg font-medium text-muted-foreground">La galerie arrive bientôt.</p>
          </div>
        )}
      </section>

      {/* Lightbox */}
      {lightbox && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease }}
            className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {lbVideo ? (
              lbVideo.kind === 'embed' ? (
                <div className="relative aspect-video w-full bg-black">
                  <iframe
                    src={lbVideo.src}
                    title={lightbox.title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                </div>
              ) : (
                <video src={lbVideo.src} controls autoPlay playsInline className="max-h-[75vh] w-full bg-black" />
              )
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={lightbox.imageUrl} alt={lightbox.title} className="max-h-[75vh] w-full bg-black object-contain" />
            )}
            <div className="p-5">
              <h3 className="font-display text-lg text-foreground">{lightbox.title}</h3>
              {lightbox.description && <p className="mt-1 text-sm text-muted-foreground">{lightbox.description}</p>}
            </div>
            <button
              onClick={() => setLightbox(null)}
              aria-label="Fermer"
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <X className="size-4" />
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
