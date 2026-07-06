import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

export interface IBlogPost extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  category: string
  tags: string[]
  author: string
  published: boolean
  publishedAt?: Date
  metaTitle?: string
  metaDescription?: string
  createdAt: Date
  updatedAt: Date
}

export interface IBlogSettings extends Document {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
  categories: string[]
  updatedAt: Date
}

const BlogPostSchema = new Schema<IBlogPost>(
  {
    title: { type: String, required: [true, 'Title is required'] },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, default: '' },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    category: { type: String, default: 'Général' },
    tags: [{ type: String }],
    author: { type: String, default: '' },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    metaTitle: String,
    metaDescription: String,
  },
  { timestamps: true }
)

const BlogSettingsSchema = new Schema<IBlogSettings>(
  {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'Nos dernières actualités' },
    description: { type: String, default: 'Retrouvez nos conseils, nos projets récents et les tendances du secteur.' },
    eyebrow: { type: String, default: 'Blog' },
    heroImage: String,
    categories: [{ type: String }],
  },
  { timestamps: true }
)

export const BlogPost = registerModel<IBlogPost>('BlogPost', BlogPostSchema)

export const BlogSettings = registerModel<IBlogSettings>('BlogSettings', BlogSettingsSchema)
