import type { MetadataRoute } from 'next'

import { routing } from '@/i18n/routing'
import { connectDB } from '@/lib/db'
import { visiblePostFilter } from '@/lib/blog-filters'
import { builtinArticleSlugPairs } from '@/lib/blog-articles'
import { LAUNCHED } from '@/lib/launch'
import { BlogPost, BlogSettings } from '@/models/Blog'
import { GallerySettings } from '@/models/Gallery'
import { routes, siteConfig } from '@/lib/seo'

// Rendu a la demande : revalidatePath("/sitemap.xml") ne purge pas le cache des
// routes de metadonnees, un article depose ou retire par PHARE n y apparaitrait
// qu au prochain build.
export const dynamic = "force-dynamic"

const baseUrl = siteConfig.url

// LAUNCHED (cf. src/lib/launch.ts) :
//  · false → phase « Coming Soon » : on ne pousse QUE la home (indexation marque).
//  · true  → site lancé : toutes les pages SEO de l'audit, par locale, hreflang.

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

    // Blog : page index + articles intégrés (toujours en ligne), par locale, hreflang.
    for (const locale of routing.locales) {
      pages.push({
        url: localizedUrl(locale, '/blog'),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
        alternates: { languages: languageAlternates('/blog') },
      })
    }
    for (const pair of builtinArticleSlugPairs()) {
      const languages = {
        en: `${baseUrl}/en/blog/${pair.en}`,
        fr: `${baseUrl}/fr/blog/${pair.fr}`,
      }
      for (const locale of routing.locales) {
        pages.push({
          url: `${baseUrl}/${locale}/blog/${pair[locale as 'en' | 'fr']}`,
          lastModified: new Date(),
          changeFrequency: 'monthly',
          priority: 0.6,
          alternates: { languages },
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

    // Articles de blog réels (admin/MongoDB) si le blog est activé.
    // La page index /blog et les articles intégrés sont déjà ajoutés plus haut.
    const blogSettings = await BlogSettings.findOne()
    if (blogSettings?.enabled) {
      const posts = await BlogPost.find(visiblePostFilter()).select('slug locale updatedAt publishedAt')
      for (const post of posts) {
        // localePrefix: 'always' -> l'URL porte toujours la langue. Un article
        // PHARE n'existe que dans la sienne, un article historique dans les deux.
        const locales = (post as unknown as { locale?: string }).locale
          ? [(post as unknown as { locale: string }).locale]
          : ['en', 'fr']
        for (const lg of locales)
        pages.push({
          url: `${baseUrl}/${lg}/blog/${post.slug}`,
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
