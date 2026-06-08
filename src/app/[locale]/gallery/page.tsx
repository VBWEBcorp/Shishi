import type { Metadata } from 'next'

import { connectDB } from '@/lib/db'
import { GallerySettings, GalleryImage } from '@/models/Gallery'
import { siteConfig } from '@/lib/seo'
import GalleryContent from './gallery-content'

export const revalidate = 3600

const defaultSettings = {
  enabled: true,
  title: 'Nos réalisations',
  description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.',
  eyebrow: 'Galerie',
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB()
    const settings = (await GallerySettings.findOne().lean()) as any

    const title = settings?.title || defaultSettings.title
    const description = settings?.description || defaultSettings.description

    return {
      title,
      description,
      openGraph: {
        type: 'website',
        title,
        description,
        url: `${siteConfig.url}/gallery`,
        siteName: siteConfig.name,
        locale: siteConfig.locale,
        images: settings?.heroImage ? [{ url: settings.heroImage }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: settings?.heroImage ? [settings.heroImage] : [],
      },
      alternates: {
        canonical: '/gallery',
      },
    }
  } catch {
    return { title: defaultSettings.title }
  }
}

export default async function GalleryPage() {
  let settings: any = defaultSettings
  let images: any[] = []

  try {
    await connectDB()
    const [settingsDoc, imagesDocs] = await Promise.all([
      GallerySettings.findOne().lean(),
      GalleryImage.find({ active: true })
        .sort({ order: 1 })
        .select('title description imageUrl category')
        .limit(60)
        .lean(),
    ])

    if (settingsDoc) settings = settingsDoc
    images = (imagesDocs as any[]).map((img) => ({
      ...img,
      _id: String(img._id),
    }))
  } catch {
    // Fallback gracieux
  }

  return <GalleryContent initialSettings={settings as any} initialImages={images as any} />
}
