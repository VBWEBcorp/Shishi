import type { Metadata } from 'next'

import { connectDB } from '@/lib/db'
import { BlogSettings, BlogPost } from '@/models/Blog'
import { visiblePostFilter } from '@/lib/blog-filters'
import { getBuiltinArticles, type BlogLocale } from '@/lib/blog-articles'
import { siteConfig } from '@/lib/seo'
import BlogPageContent from './blog-page-content'

type Params = Promise<{ locale: string }>

export const revalidate = 3600

const DEFAULTS: Record<BlogLocale, { title: string; description: string; eyebrow: string }> = {
  en: {
    title: 'Travel Stories & Guides',
    description: 'Stories, tips and insights to inspire your journey on Koh Samui.',
    eyebrow: 'Blog',
  },
  fr: {
    title: 'Récits & guides de voyage',
    description: 'Conseils, idées et inspirations pour profiter de votre séjour à Koh Samui.',
    eyebrow: 'Blog',
  },
}

function asLocale(l: string): BlogLocale {
  return l === 'en' ? 'en' : 'fr'
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale } = await params
  const l = asLocale(locale)
  const d = DEFAULTS[l]

  let title = d.title
  let description = d.description
  let heroImage: string | undefined
  try {
    await connectDB()
    const settings = (await BlogSettings.findOne().lean()) as any
    if (settings?.title) title = settings.title
    if (settings?.description) description = settings.description
    heroImage = settings?.heroImage
  } catch {
    // défauts
  }

  return {
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      url: `${siteConfig.url}/${l}/blog`,
      siteName: siteConfig.name,
      locale: l === 'en' ? 'en_US' : 'fr_FR',
      images: heroImage ? [{ url: heroImage }] : [],
    },
    twitter: { card: 'summary_large_image', title, description, images: heroImage ? [heroImage] : [] },
    alternates: {
      canonical: `/${l}/blog`,
      languages: { en: '/en/blog', fr: '/fr/blog' },
    },
  }
}

export default async function BlogPage({ params }: { params: Params }) {
  const { locale } = await params
  const l = asLocale(locale)

  let settings: any = { enabled: true, ...DEFAULTS[l] }
  let dbPosts: any[] = []

  try {
    await connectDB()
    const [settingsDoc, postsDocs] = await Promise.all([
      BlogSettings.findOne().lean(),
      BlogPost.find(visiblePostFilter())
        .sort({ publishedAt: -1, createdAt: -1 })
        .select('title slug excerpt coverImage category tags author publishedAt')
        .limit(50)
        .lean(),
    ])

    if (settingsDoc) settings = { ...settings, ...settingsDoc }
    dbPosts = (postsDocs as any[]).map((p) => ({
      ...p,
      _id: String(p._id),
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
    }))
  } catch {
    // Fallback gracieux : settings par défaut + article intégré uniquement
  }

  // Article(s) intégré(s) en tête de liste (article vedette).
  const builtin = getBuiltinArticles(l).map((a) => ({
    _id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    coverImage: a.coverImage,
    category: a.category,
    tags: a.tags,
    author: a.author,
    publishedAt: a.publishedAt,
  }))

  const posts = [...builtin, ...dbPosts]

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: settings?.title || DEFAULTS[l].title,
    description: settings?.description || DEFAULTS[l].description,
    url: `${siteConfig.url}/${l}/blog`,
    publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.slice(0, 20).map((post, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${siteConfig.url}/${l}/blog/${post.slug}`,
        name: post.title,
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <BlogPageContent initialSettings={settings as any} initialPosts={posts as any} locale={l} />
    </>
  )
}
