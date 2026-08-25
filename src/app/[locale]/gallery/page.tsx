import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { connectDB } from '@/lib/db'
import { GallerySettings, GalleryImage } from '@/models/Gallery'
import { alternatesFor, siteConfig } from '@/lib/seo'
import GalleryContent from './gallery-content'

export const revalidate = 60

const defaultSettings = {
  enabled: false,
  title: 'Nos réalisations',
  description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.',
  eyebrow: 'Galerie',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
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
      alternates: alternatesFor('/gallery', locale),
    }
  } catch {
    // Base indisponible : on garde quand meme le canonical. Sans lui, un incident de base
    // suffirait a republier la page sans son adresse de reference.
    return { title: defaultSettings.title, alternates: alternatesFor('/gallery', locale) }
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
        .select('title description type imageUrl videoUrl category')
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

  // Galerie désactivée → page introuvable (le lien du footer est masqué aussi).
  if (!settings?.enabled) notFound()

  return <GalleryContent initialSettings={settings as any} initialImages={images as any} />
}
