import { Schema } from 'mongoose'

import { registerModel } from '@/lib/register-model'

/**
 * Une question posée à l'assistant du site, avec sa réponse.
 *
 * Sert à relire ce que les visiteurs demandent vraiment : une question qui
 * revient sans réponse devient une ligne « Bon à savoir » ou une entrée de FAQ.
 * Aucune donnée personnelle : ni adresse IP, ni e-mail, juste le texte échangé.
 */
export interface IChatLog {
  question: string
  answer: string
  locale: string
  page?: string
  /** Position de la question dans la conversation (1 = première). */
  turn: number
  /** L'assistant a renvoyé vers WhatsApp (il n'avait pas l'information). */
  whatsapp: boolean
  model: string
  inputTokens?: number
  cacheReadTokens?: number
  outputTokens?: number
  createdAt: Date
}

const ChatLogSchema = new Schema<IChatLog>(
  {
    question: { type: String, required: true },
    answer: { type: String, default: '' },
    locale: { type: String, default: 'en' },
    page: String,
    turn: { type: Number, default: 1 },
    whatsapp: { type: Boolean, default: false },
    model: String,
    inputTokens: Number,
    cacheReadTokens: Number,
    outputTokens: Number,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

ChatLogSchema.index({ createdAt: -1 })

export const ChatLog = registerModel<IChatLog>('ChatLog', ChatLogSchema)
