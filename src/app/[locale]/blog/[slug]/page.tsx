import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { connectDB } from '@/lib/db'
import { BlogPost } from '@/models/Blog'
import { visiblePostFilter } from '@/lib/blog-filters'
import { getBuiltinArticle, builtinStaticParams, type BlogLocale } from '@/lib/blog-articles'
import { siteConfig } from '@/lib/seo'
import BlogPostContent from './blog-post-content'

type Params = Promise<{ locale: string; slug: string }>

export const revalidate = 3600

function asLocale(l: string): BlogLocale {
  return l === 'en' ? 'en' : 'fr'
}

export async function generateStaticParams() {
  const params: { locale: string; slug: string }[] = builtinStaticParams()
  try {
    await connectDB()
    const posts = await BlogPost.find(visiblePostFilter()).select('slug').lean()
    for (const p of posts as any[]) {
      params.push({ locale: 'fr', slug: p.slug }, { locale: 'en', slug: p.slug })
    }
  } catch {
    // articles intégrés uniquement
  }
  return params
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { locale, slug } = await params
  const l = asLocale(locale)

  // 1) Article intégré (bilingue) en priorité.
  const builtin = getBuiltinArticle(l, slug)
  if (builtin) {
    const url = `${siteConfig.url}/${l}/blog/${builtin.slug}`
    return {
      title: builtin.metaTitle,
      description: builtin.metaDescription,
      authors: [{ name: builtin.author }],
      keywords: builtin.tags,
      openGraph: {
        type: 'article',
        title: builtin.metaTitle,
        description: builtin.metaDescription,
        url,
        siteName: siteConfig.name,
        locale: l === 'en' ? 'en_US' : 'fr_FR',
        images: [{ url: `${siteConfig.url}${builtin.coverImage}`, width: 1200, height: 630, alt: builtin.coverAlt }],
        publishedTime: builtin.publishedAt,
        modifiedTime: builtin.updatedAt,
        tags: builtin.tags,
      },
      twitter: {
        card: 'summary_large_image',
        title: builtin.metaTitle,
        description: builtin.metaDescription,
        images: [`${siteConfig.url}${builtin.coverImage}`],
      },
      alternates: {
        canonical: `/${l}/blog/${builtin.slug}`,
        languages: {
          en: `/en/blog/${builtin.altSlugs.en}`,
          fr: `/fr/blog/${builtin.altSlugs.fr}`,
        },
      },
    }
  }

  // 2) Article en base.
  try {
    await connectDB()
    const post = (await BlogPost.findOne({ slug, ...visiblePostFilter() }).lean()) as any
    if (!post) return {}
    const title = post.metaTitle || post.title
    const description = (post.metaDescription || post.excerpt || '').substring(0, 160)
    return {
      title,
      description,
      authors: post.author ? [{ name: post.author }] : [],
      openGraph: {
        type: 'article',
        title,
        description,
        url: `${siteConfig.url}/${l}/blog/${post.slug}`,
        siteName: siteConfig.name,
        locale: l === 'en' ? 'en_US' : 'fr_FR',
        images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630, alt: title }] : [],
        publishedTime: post.publishedAt?.toISOString?.(),
        modifiedTime: post.updatedAt?.toISOString?.(),
        tags: post.tags || [],
      },
      twitter: { card: 'summary_large_image', title, description, images: post.coverImage ? [post.coverImage] : [] },
      alternates: { canonical: `/${l}/blog/${post.slug}` },
    }
  } catch {
    return {}
  }
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const { locale, slug } = await params
  const l = asLocale(locale)

  // ── 1) Article intégré (bilingue, SEO) ──
  const builtin = getBuiltinArticle(l, slug)
  if (builtin) {
    const url = `${siteConfig.url}/${l}/blog/${builtin.slug}`
    const initialPost = {
      _id: builtin.id,
      title: builtin.title,
      slug: builtin.slug,
      excerpt: builtin.excerpt,
      content: builtin.content,
      coverImage: builtin.coverImage,
      category: builtin.category,
      tags: builtin.tags,
      author: builtin.author,
      published: true,
      publishedAt: builtin.publishedAt,
      metaTitle: builtin.metaTitle,
      metaDescription: builtin.metaDescription,
    }

    const jsonLd = [
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: builtin.metaTitle,
        description: builtin.metaDescription,
        image: `${siteConfig.url}${builtin.coverImage}`,
        datePublished: builtin.publishedAt,
        dateModified: builtin.updatedAt,
        inLanguage: l === 'en' ? 'en' : 'fr',
        author: { '@type': 'Organization', name: builtin.author, url: siteConfig.url },
        publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        keywords: builtin.tags.join(', '),
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: siteConfig.name, item: `${siteConfig.url}/${l}` },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteConfig.url}/${l}/blog` },
          { '@type': 'ListItem', position: 3, name: builtin.title, item: url },
        ],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: builtin.faq.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      },
    ]

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <BlogPostContent slug={slug} initialPost={initialPost} locale={l} />
      </>
    )
  }

  // ── 2) Article en base ──
  try {
    await connectDB()
    const post = (await BlogPost.findOne({ slug, ...visiblePostFilter() }).lean()) as any
    if (!post) notFound()

    const initialPost = {
      _id: String(post._id),
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      coverImage: post.coverImage || '',
      category: post.category || '',
      tags: post.tags || [],
      author: post.author || '',
      published: post.published,
      publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : '',
      metaTitle: post.metaTitle,
      metaDescription: post.metaDescription,
    }

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      headline: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      image: post.coverImage || undefined,
      datePublished: post.publishedAt?.toISOString?.(),
      dateModified: post.updatedAt?.toISOString?.(),
      author: post.author ? { '@type': 'Person', name: post.author } : undefined,
      publisher: { '@type': 'Organization', name: siteConfig.name, url: siteConfig.url },
      mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteConfig.url}/${l}/blog/${post.slug}` },
      keywords: post.tags?.join(', '),
    }

    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <BlogPostContent slug={slug} initialPost={initialPost} locale={l} />
      </>
    )
  } catch {
    notFound()
  }
}
