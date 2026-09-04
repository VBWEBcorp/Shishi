'use client'

import { useEffect, useState, use } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, User, Tag, Clock } from 'lucide-react'

import { servicesLies } from '@/lib/service-links'

interface BlogPost {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  coverImageAlt?: string
  category: string
  tags: string[]
  author: string
  published: boolean
  publishedAt: string
  metaTitle?: string
  metaDescription?: string
}

const ease = [0.22, 1, 0.36, 1] as const

function estimateReadTime(html: string) {
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).length
  return Math.max(1, Math.ceil(words / 200))
}

export default function BlogPostContent({
  slug,
  initialPost,
  locale = 'fr',
}: {
  slug: string
  initialPost?: BlogPost
  locale?: 'fr' | 'en'
}) {
  const [post, setPost] = useState<BlogPost | null>(initialPost ?? null)
  const [loading, setLoading] = useState(!initialPost)
  const [notFound, setNotFound] = useState(false)

  const en = locale === 'en'
  const tx = {
    back: en ? 'Back to blog' : 'Retour au blog',
    loading: en ? 'Loading…' : 'Chargement...',
    notFound: en ? 'Article not found.' : 'Article introuvable.',
    readTime: (n: number) => (en ? `${n} min read` : `${n} min de lecture`),
    liked: en ? 'Enjoyed this article?' : 'Cet article vous a plu ?',
    likedSub: en
      ? 'Browse our other guides or get in touch to plan your stay.'
      : 'Découvrez nos autres articles ou contactez-nous pour préparer votre séjour.',
    all: en ? 'All articles' : 'Tous les articles',
    contact: en ? 'Contact us' : 'Nous contacter',
    services: en ? 'At the club' : 'Au club',
    servicesSub: en
      ? 'The activities mentioned in this article, at Shi Shi Samui in Lamai.'
      : 'Les activités dont parle cet article, à Shi Shi Samui, à Lamai.',
    home: en ? 'Home' : 'Accueil',
    blog: 'Blog',
  }
  const blogHref = `/${locale}/blog`
  const contactHref = `/${locale}/contact-location`

  useEffect(() => {
    // When the server already provided the post, render it directly — the
    // content is in the initial HTML and no client fetch is needed.
    if (initialPost) return

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/posts/${slug}`)
        if (!response.ok) {
          setNotFound(true)
          return
        }
        const data = await response.json()
        if (!data.published) {
          setNotFound(true)
          return
        }
        setPost(data)
      } catch {
        setNotFound(true)
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [slug, initialPost])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">{tx.loading}</div>
      </div>
    )
  }

  if (notFound || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-lg">{tx.notFound}</p>
        <Link href={blogHref} className="text-primary underline underline-offset-4 hover:text-primary/80 text-sm">
          {tx.back}
        </Link>
      </div>
    )
  }

  const readTime = estimateReadTime(post.content)
  const formattedDate = new Date(post.publishedAt).toLocaleDateString(en ? 'en-US' : 'fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <article className="min-h-screen">
      {/*
        HERO FIGÉ, puis le contenu qui remonte par-dessus dans un panneau à coins arrondis.
        C'est le motif de TOUT le site — pages service, accueil, index du blog. L'article était
        la seule page à ne pas le suivre : une simple bande d'image, un titre en font-display et
        un contenu qui démarrait sans transition. Il détonnait au milieu du reste.
      */}
      <section className="sticky top-0 z-0 isolate min-h-[58vh] overflow-hidden pt-14">
        {post.coverImage ? (
          <Image
            src={post.coverImage}
            alt={post.coverImageAlt || post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-muted" aria-hidden />
        )}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[oklch(0.16_0_0/0.55)] via-[oklch(0.16_0_0/0.5)] to-[oklch(0.14_0_0/0.88)]"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[58vh] max-w-3xl flex-col justify-end px-4 pb-20 pt-24 sm:px-6 sm:pb-24 lg:px-8">
          {/* Fil d'Ariane visible, comme sur les pages service. */}
          <nav className="mb-5 flex items-center gap-2 text-xs text-white/70" aria-label="Breadcrumb">
            <Link href={`/${locale}`} className="transition-colors hover:text-white">
              {tx.home}
            </Link>
            <span aria-hidden>/</span>
            <Link href={blogHref} className="transition-colors hover:text-white">
              {tx.blog}
            </Link>
          </nav>

          {post.category && (
            <span className="mb-4 inline-flex w-fit items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white ring-1 ring-white/25 backdrop-blur">
              {post.category}
            </span>
          )}

          <h1 className="font-editorial text-3xl font-medium leading-[1.12] tracking-[-0.01em] text-white sm:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-white/85">{post.excerpt}</p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/75">
            <span className="inline-flex items-center gap-1.5">
              <Calendar className="size-4" aria-hidden />
              {formattedDate}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden />
              {tx.readTime(readTime)}
            </span>
            {post.author && (
              <span className="inline-flex items-center gap-1.5">
                <User className="size-4" aria-hidden />
                {post.author}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Panneau opaque qui glisse par-dessus le hero figé. */}
      <div className="relative z-10 rounded-t-[2rem] bg-background sm:rounded-t-[2.5rem]">
      <div className="mx-auto max-w-3xl px-4 pt-14 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease }}
        >
          {/* Back link */}
          <Link
            href={blogHref}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="size-3.5" />
            {tx.back}
          </Link>

          {/* Article body, rendered HTML from TipTap */}
          <div
            className="blog-content pb-16"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Maillage interne vers les pages service.
              Un article parlait de tennis ou de pickleball sans jamais mener à la page
              du club : ni le lecteur ni Google n'avaient de chemin. Les liens sont
              choisis d'après le contenu de l'article (cf. servicesLies). */}
          {(() => {
            const liens = servicesLies(
              [post.title, post.excerpt, (post.tags || []).join(' '), post.content].join(' '),
              locale
            )
            if (liens.length === 0) return null
            return (
              <nav
                className="border-t border-border/60 py-10"
                aria-label={tx.services}
              >
                <p className="text-lg font-semibold text-foreground">{tx.services}</p>
                <p className="mt-1 text-sm text-muted-foreground">{tx.servicesSub}</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {liens.map((lien) => (
                    <li key={lien.slug}>
                      <Link
                        href={lien.href}
                        className="group flex h-full flex-col rounded-xl border border-border/70 bg-card/60 px-4 py-3 transition-colors hover:border-accent/60 hover:bg-muted"
                      >
                        <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          {lien.label}
                          <ArrowRight className="size-3.5 text-accent transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="mt-1 text-xs leading-relaxed text-muted-foreground">
                          {lien.description}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )
          })()}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="border-t border-border/60 py-8 flex flex-wrap items-center gap-2">
              <Tag className="size-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA bottom */}
          <div className="border-t border-border/60 py-12 text-center space-y-4">
            <p className="text-lg font-semibold text-foreground">{tx.liked}</p>
            <p className="text-sm text-muted-foreground">{tx.likedSub}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link
                href={blogHref}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {tx.all}
              </Link>
              <Link
                href={contactHref}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:brightness-105 transition-all"
              >
                {tx.contact}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Blog content styles */}
      <style jsx global>{`
        .blog-content {
          font-size: 0.9375rem;
          line-height: 1.8;
          color: var(--muted-foreground);
        }
        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 2.5rem;
          margin-bottom: 0.75rem;
          color: var(--foreground);
          font-family: var(--font-display);
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 0.5rem;
          color: var(--foreground);
          font-family: var(--font-display);
          line-height: 1.4;
        }
        .blog-content p {
          margin-bottom: 1.25rem;
        }
        .blog-content strong {
          font-weight: 600;
          color: var(--foreground);
        }
        .blog-content em {
          font-style: italic;
        }
        .blog-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .blog-content a:hover {
          opacity: 0.8;
        }
        .blog-content ul,
        .blog-content ol {
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .blog-content ul { list-style: disc; }
        .blog-content ol { list-style: decimal; }
        .blog-content li {
          margin-bottom: 0.4rem;
        }
        .blog-content blockquote {
          border-left: 3px solid hsl(var(--primary));
          padding: 0.75rem 1.25rem;
          margin: 1.5rem 0;
          font-style: italic;
          background: var(--muted);
          border-radius: 0 0.5rem 0.5rem 0;
        }
        .blog-content hr {
          border: none;
          border-top: 1px solid var(--border);
          margin: 2rem 0;
        }
        .blog-content img {
          border-radius: 0.75rem;
          max-width: 100%;
          height: auto;
          margin: 1.5rem 0;
        }
        /* Sommaire cliquable en tete d'article. Le balisage existait deja dans les articles
           (<nav class="toc">), mais aucune regle ne le visait : il s'affichait comme une liste
           a puces perdue au milieu du texte, impossible a reconnaitre comme un sommaire. */
        .blog-content .toc {
          margin: 1.75rem 0 2.25rem;
          padding: 1.1rem 1.35rem;
          border: 1px solid var(--border);
          border-left: 3px solid hsl(var(--primary));
          border-radius: 0 0.75rem 0.75rem 0;
          background: var(--muted);
        }
        .blog-content .toc strong {
          display: block;
          margin-bottom: 0.5rem;
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }
        .blog-content .toc ul {
          margin: 0;
          padding-left: 1.1rem;
          list-style: disc;
        }
        .blog-content .toc li {
          margin-bottom: 0.25rem;
        }
        .blog-content .toc a {
          text-decoration: none;
        }
        .blog-content .toc a:hover {
          text-decoration: underline;
        }
        /* Tableaux : aucune regle ne les visait non plus, donc ils tombaient sur les valeurs
           par defaut du navigateur — sans bordure, colonnes collees, illisible sur mobile.
           Le conteneur defile horizontalement pour qu'un tableau large ne pousse jamais la
           page entiere de travers. */
        .blog-content .tableau {
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        .blog-content table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        .blog-content thead th {
          text-align: left;
          padding: 0.6rem 0.75rem;
          border-bottom: 2px solid var(--border);
          color: var(--foreground);
          font-weight: 700;
          white-space: nowrap;
        }
        .blog-content tbody td {
          padding: 0.6rem 0.75rem;
          border-bottom: 1px solid var(--border);
          vertical-align: top;
        }
        .blog-content tbody tr:last-child td {
          border-bottom: none;
        }
        .blog-content pre {
          background: var(--muted);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-size: 0.8125rem;
        }
        .blog-content code {
          background: var(--muted);
          padding: 0.15rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
        }
        .blog-content pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </article>
  )
}
