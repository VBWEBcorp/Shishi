import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

import { CHAT_SYSTEM } from '@/lib/chat-knowledge'
import { connectDB } from '@/lib/db'
import { ChatLog } from '@/models/ChatLog'

/*
 * Assistant du site : répond aux questions des visiteurs à partir de ce que le
 * site sait déjà (src/lib/chat-knowledge.ts), et renvoie vers WhatsApp sinon.
 * Le texte part au fil de l'eau (flux texte brut) pour que la réponse
 * s'affiche pendant qu'elle s'écrit.
 *
 * Coupé tant que ANTHROPIC_API_KEY n'est pas posée : la route répond 503 et
 * la bulle ne s'affiche pas (NEXT_PUBLIC_CHAT_ENABLED).
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MODEL = process.env.CHAT_MODEL || 'claude-opus-5-5'
const MAX_TOURS = 12
const MAX_CARACTERES = 800

// Garde-fou contre l'abus : 20 questions par tranche de 10 minutes et par
// adresse. En mémoire, donc par instance : ça freine un script, ça n'empêche
// pas tout, et ça suffit pour un site de club.
const FENETRE_MS = 10 * 60 * 1000
const MAX_PAR_FENETRE = 20
const compteurs = new Map<string, { debut: number; n: number }>()

function tropDeQuestions(ip: string): boolean {
  const maintenant = Date.now()
  const c = compteurs.get(ip)
  if (!c || maintenant - c.debut > FENETRE_MS) {
    compteurs.set(ip, { debut: maintenant, n: 1 })
    if (compteurs.size > 5000) compteurs.clear()
    return false
  }
  c.n += 1
  return c.n > MAX_PAR_FENETRE
}

type Entree = { role: 'user' | 'assistant'; content: string }

function messagesValides(brut: unknown): Entree[] | null {
  if (!Array.isArray(brut) || brut.length === 0 || brut.length > MAX_TOURS * 2) return null
  const sortie: Entree[] = []
  for (const m of brut) {
    if (!m || typeof m !== 'object') return null
    const { role, content } = m as Record<string, unknown>
    if ((role !== 'user' && role !== 'assistant') || typeof content !== 'string') return null
    const texte = content.trim().slice(0, role === 'user' ? MAX_CARACTERES : 4000)
    if (!texte) return null
    sortie.push({ role, content: texte })
  }
  // L'API attend une conversation qui commence et finit par le visiteur.
  if (sortie[0].role !== 'user' || sortie[sortie.length - 1].role !== 'user') return null
  return sortie
}

const REPLI = {
  fr: 'Je n’arrive pas à répondre pour le moment. Écrivez-nous sur WhatsApp, on vous répond vite.',
  en: 'I can’t answer right now. Message us on WhatsApp and we’ll get back to you quickly.',
}

export async function POST(request: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('Assistant indisponible', { status: 503 })
  }

  const ip =
    request.headers.get('x-nf-client-connection-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'inconnu'
  if (tropDeQuestions(ip)) {
    return new Response('Trop de questions, réessayez dans quelques minutes.', { status: 429 })
  }

  let corps: Record<string, unknown>
  try {
    corps = await request.json()
  } catch {
    return new Response('Requête invalide', { status: 400 })
  }
  const messages = messagesValides(corps.messages)
  if (!messages) return new Response('Requête invalide', { status: 400 })
  const locale = corps.locale === 'fr' ? 'fr' : 'en'
  const page = typeof corps.page === 'string' ? corps.page.slice(0, 200) : undefined

  const client = new Anthropic()
  const encodeur = new TextEncoder()

  const flux = new ReadableStream<Uint8Array>({
    async start(controller) {
      let reponse = ''
      let usage: { input?: number; cache?: number; output?: number } = {}
      try {
        const stream = client.beta.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          output_config: { effort: 'low' },
          // Si un filtre de sécurité refuse par erreur, l'API repasse la
          // question à un autre modèle au lieu de laisser le visiteur sans
          // réponse. Haiku n'a pas cette reprise : le repli WhatsApp suffit.
          ...(MODEL.includes('haiku')
            ? {}
            : { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const }),
          system: [{ type: 'text', text: CHAT_SYSTEM, cache_control: { type: 'ephemeral', ttl: '1h' } }],
          messages,
        })
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            reponse += event.delta.text
            controller.enqueue(encodeur.encode(event.delta.text))
          }
        }
        const final = await stream.finalMessage()
        if (final.stop_reason === 'refusal' && !reponse) {
          reponse = REPLI[locale]
          controller.enqueue(encodeur.encode(reponse))
        }
        usage = {
          input: final.usage.input_tokens,
          cache: final.usage.cache_read_input_tokens ?? undefined,
          output: final.usage.output_tokens,
        }
      } catch (e) {
        if (e instanceof Anthropic.RateLimitError) console.warn('[chat] limite API atteinte')
        else if (e instanceof Anthropic.APIError) console.error('[chat] erreur API', e.status, e.message)
        else console.error('[chat] erreur', e)
        if (!reponse) {
          reponse = REPLI[locale]
          controller.enqueue(encodeur.encode(reponse))
        }
      } finally {
        controller.close()
      }

      // Journal, sans bloquer la réponse ni la casser s'il échoue.
      try {
        await connectDB()
        await ChatLog.create({
          question: messages[messages.length - 1].content,
          answer: reponse,
          locale,
          page,
          turn: Math.ceil(messages.length / 2),
          whatsapp: /wa\.me|whatsapp/i.test(reponse),
          model: MODEL,
          inputTokens: usage.input,
          cacheReadTokens: usage.cache,
          outputTokens: usage.output,
        })
      } catch (e) {
        console.error('[chat] journal non enregistré', e)
      }
    },
  })

  return new Response(flux, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
