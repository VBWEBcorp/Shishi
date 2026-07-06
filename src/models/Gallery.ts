import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

export interface IGalleryImage extends Document {
  title: string
  description?: string
  /** Type de média : photo ou vidéo. */
  type: 'image' | 'video'
  /** Photo, ou poster/vignette d'une vidéo. */
  imageUrl?: string
  /** Source vidéo : lien YouTube/Vimeo ou .mp4 (lien ou upload). */
  videoUrl?: string
  category?: string
  order: number
  active: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IGallerySettings extends Document {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
  updatedAt: Date
}

const GalleryImageSchema = new Schema<IGalleryImage>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    description: String,
    type: {
      type: String,
      enum: ['image', 'video'],
      default: 'image',
    },
    imageUrl: String,
    videoUrl: String,
    category: {
      type: String,
      default: 'general',
    },
    order: {
      type: Number,
      default: 0,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const GallerySettingsSchema = new Schema<IGallerySettings>(
  {
    // Désactivée par défaut : le client l'active quand il le souhaite.
    enabled: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Nos réalisations',
    },
    description: { type: String, default: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.' },
    eyebrow: { type: String, default: 'Galerie' },
    heroImage: String,
  },
  {
    timestamps: true,
  }
)

export const GalleryImage = registerModel<IGalleryImage>('GalleryImage', GalleryImageSchema)

export const GallerySettings = registerModel<IGallerySettings>('GallerySettings', GallerySettingsSchema)
