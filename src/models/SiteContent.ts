import { Schema, Document } from 'mongoose'

import { registerModel } from '@/lib/register-model'

export interface ISiteContent extends Document {
  pageId: string
  content: Record<string, any>
  updatedAt: Date
}

const SiteContentSchema = new Schema<ISiteContent>(
  {
    pageId: {
      type: String,
      required: true,
      unique: true,
    },
    content: {
      type: Schema.Types.Mixed,
      required: true,
      default: {},
    },
  },
  {
    timestamps: true,
  }
)

export default registerModel<ISiteContent>('SiteContent', SiteContentSchema)
