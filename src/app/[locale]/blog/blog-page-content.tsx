'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Search } from 'lucide-react'

import { photoAlt } from '@/lib/photo-alt'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  publishedAt: string
}

interface BlogSettings {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
  categories?: string[]
}

const ease = [0.22, 1, 0.36, 1] as const

interface Props {
  initialSettings: BlogSettings
  initialPosts: BlogPost[]
  locale?: 'fr' | 'en'
}

export default function BlogPageContent({ initialSettings, initialPosts, locale = 'fr' }: Props) {
  const [settings] = useState<BlogSettings>(initialSettings)
  const [posts] = useState<BlogPost[]>(initialPosts)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const en = locale === 'en'
  const tx = {
    all: en ? 'All' : 'Tous',
    emptyCat: (c: string) => (en ? `No article in “${c}”` : `Aucun article dans la catégorie « ${c} »`),
    empty: en ? 'No article yet.' : 'Aucun article pour le moment.',
    soon: en ? 'Check back soon!' : 'Revenez bientôt !',
    unavailable: en ? 'The blog is not available right now.' : 'Le blog n’est pas disponible pour le moment.',
    ctaTitle: en ? 'Make the most of your stay in Lamai' : 'Profitez à fond de votre séjour à Lamai',
    ctaSub: en
      ? 'Sport, family time and great food — all in one place by the beach. Come visit Shi Shi Samui.'
      : 'Sport, moments en famille et bonne cuisine — tout au même endroit, au bord de la plage. Venez découvrir Shi Shi Samui.',
    ctaBtn: en ? 'Plan your visit' : 'Préparer votre visite',
  }
  const href = (slug: string) => `/${locale}/blog/${slug}`
  const bookHref = `/${locale}/book-now`

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString(en ? 'en-GB' : 'fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

  const filteredPosts = activeCategory === 'all'
    ? posts
    : posts.filter((p) => p.category === activeCategory)

  if (!settings?.enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">{tx.unavailable}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero figé — le contenu blanc remonte par-dessus au scroll (effet Traavellio) */}
      <section className="sticky top-0 z-0 overflow-hidden min-h-[360px] sm:min-h-[440px] lg:min-h-[520px] flex items-center">
        <div className="absolute inset-0">
          {settings.heroImage ? (
            <Image
              src={settings.heroImage}
              alt={photoAlt(settings.heroImage, locale, settings.title)}
              fill
              sizes="100vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/35 to-black/55" />

        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32 w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease }}
            className="text-center max-w-3xl mx-auto"
          >
            <p className="font-display text-xs font-semibold tracking-[0.28em] text-white/70 uppercase mb-5">
              {settings.eyebrow || 'Blog'}
            </p>
            <h1 className="font-display text-4xl tracking-tight text-white sm:text-6xl lg:text-7xl">
              {settings.title || 'Travel Stories & Guides'}
            </h1>
            <p className="mt-6 text-base text-white/75 leading-relaxed sm:text-lg max-w-xl mx-auto">
              {settings.description || 'Stories, tips and insights to inspire your journey.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Panneau de contenu : opaque + coins arrondis, glisse par-dessus le hero */}
      <div className="relative z-10 rounded-t-[2rem] bg-background sm:rounded-t-[2.5rem]">

        {/* Category filters */}
        {(settings.categories?.length ?? 0) > 0 && (
          <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 lg:px-8 lg:pt-14">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === 'all'
                    ? 'bg-foreground text-background'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tx.all}
              </button>
              {settings.categories?.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    activeCategory === cat
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Posts grid — cartes minimalistes (image + date + titre) */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {filteredPosts.length > 0 ? (
            <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2">
              {filteredPosts.map((post, i) => (
                <motion.article
                  key={post._id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease, delay: Math.min(i, 6) * 0.07 }}
                >
                  <Link href={href(post.slug)} className="group block">
                    {/* Image */}
                    <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] bg-muted">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          sizes="(min-width:640px) 50vw, 100vw"
                          priority={i === 0}
                          loading={i === 0 ? undefined : 'lazy'}
                          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/10" />
                      )}

                      {/* Arrow badge */}
                      <span className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/90 text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 group-hover:bg-accent group-hover:text-white">
                        <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:rotate-45" />
                      </span>

                      {post.category && (
                        <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                          {post.category}
                        </span>
                      )}
                    </div>

                    {/* Meta + title */}
                    <div className="mt-5 px-1">
                      {post.publishedAt && (
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {formatDate(post.publishedAt)}
                        </p>
                      )}
                      <h2 className="mt-2 font-display text-xl leading-snug text-foreground transition-colors group-hover:text-accent sm:text-2xl">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Search className="size-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                {activeCategory !== 'all' ? tx.emptyCat(activeCategory) : tx.empty}
              </p>
              <p className="text-sm text-muted-foreground/60 mt-2">{tx.soon}</p>
            </motion.div>
          )}
        </section>

        {/* CTA "rêve" en bas de page — bannière image plein cadre */}
        <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
          <div className="relative overflow-hidden rounded-[2rem]">
            <Image
              src="/photos/pool-panorama-portrait.webp"
              alt={photoAlt('/photos/pool-panorama-portrait.webp', locale)}
              fill
              sizes="(min-width:1152px) 1152px, 100vw"
              loading="lazy"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/40" />
            <div className="relative px-6 py-20 text-center sm:py-28">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease }}
              >
                <h2 className="mx-auto max-w-2xl font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl">
                  {tx.ctaTitle}
                </h2>
                <p className="mx-auto mt-5 max-w-xl text-sm text-white/80 leading-relaxed sm:text-base">
                  {tx.ctaSub}
                </p>
                <Link
                  href={bookHref}
                  className="group mt-9 inline-flex items-center gap-3 rounded-full bg-white py-2 pl-6 pr-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent hover:text-white"
                >
                  {tx.ctaBtn}
                  <span className="grid size-9 place-items-center rounded-full bg-accent text-white transition-colors group-hover:bg-white group-hover:text-accent">
                    <ArrowUpRight className="size-4" />
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
