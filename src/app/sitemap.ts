import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { connectDB } from '@/lib/db'
import { visiblePostFilter } from '@/lib/blog-filters'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { GallerySettings } from '@/models/Gallery'
import { routes, siteConfig } from '@/lib/seo'

const baseUrl = siteConfig.url

/**
 * Drapeau de lancement.
 *  · false  → phase « Coming Soon » : on ne pousse QUE la home pour concentrer
 *             l'indexation sur la requête de marque « Shi Shi Samui ».
 *  · true   → site lancé : on pousse TOUTES les pages SEO de l'audit
 *             (pages service, prices, book-now, contact-location, about),
 *             par locale, avec alternances hreflang en/fr.
 *
 * Au lancement réel : passer LAUNCHED à true (cf. SEO-SHI-SHI.md).
 */
const LAUNCHED = false

/** Construit l'URL localisée d'un chemin (/ → /en, /tennis-court-lamai → /en/tennis-court-lamai). */
function localizedUrl(locale: string, path: string) {
  return `${baseUrl}/${locale}${path === '/' ? '' : path}`
}

/** Alternances hreflang en/fr pour un chemin donné. */
function languageAlternates(path: string) {
  return Object.fromEntries(
    routing.locales.map((l) => [l, localizedUrl(l, path)])
  )
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages: MetadataRoute.Sitemap = []

  if (LAUNCHED) {
    // Toutes les pages SEO de l'audit, par locale, avec hreflang.
    for (const path of routes) {
      for (const locale of routing.locales) {
        pages.push({
          url: localizedUrl(locale, path),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: path === '/' ? 1 : 0.8,
          alternates: { languages: languageAlternates(path) },
        })
      }
    }
  } else {
    // Phase « Coming Soon » : home uniquement.
    pages.push({
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    })
  }

  try {
    await connectDB()

    // Gallery page if enabled
    const gallerySettings = await GallerySettings.findOne()
    if (gallerySettings?.enabled) {
      pages.push({
        url: `${baseUrl}/gallery`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }

    // Blog pages if enabled
    const blogSettings = await BlogSettings.findOne()
    if (blogSettings?.enabled) {
      pages.push({
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      })

      // Individual blog posts
      const posts = await BlogPost.find(visiblePostFilter()).select('slug updatedAt publishedAt')
      for (const post of posts) {
        pages.push({
          url: `${baseUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updatedAt || post.publishedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch (error) {
    console.error('Sitemap generation error:', error)
  }

  return pages
}
