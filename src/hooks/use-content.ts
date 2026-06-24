'use client'

import { useLocale } from 'next-intl'
import { useEffect, useState } from 'react'

type CacheEntry = {
  data: any
  fetchedAt: number
}

/**
 * Résout la tranche de contenu pour la langue affichée.
 *  · Nouveau format { fr, en } → renvoie la tranche de la langue (ou null si
 *    vide → la page retombe alors sur ses défauts/traductions natives).
 *  · Ancien format « à plat » (mono-langue) → renvoyé tel quel pour les 2 langues.
 */
function resolveSlice(rawContent: any, locale: string): Record<string, any> | null {
  if (!rawContent || typeof rawContent !== 'object') return null
  if ('fr' in rawContent || 'en' in rawContent) {
    const slice = rawContent[locale]
    return slice && typeof slice === 'object' ? slice : null
  }
  return rawContent
}

const CACHE_TTL = 30_000 // 30s: cross-section dedupe + quick nav caching
const cache = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<any>>()

async function fetchContent(pageId: string): Promise<any> {
  const now = Date.now()
  const cached = cache.get(pageId)
  if (cached && now - cached.fetchedAt < CACHE_TTL) {
    return cached.data
  }

  const existing = inflight.get(pageId)
  if (existing) return existing

  const promise = fetch(`/api/content/${pageId}`)
    .then((r) => r.json())
    .then((result) => {
      cache.set(pageId, { data: result, fetchedAt: Date.now() })
      inflight.delete(pageId)
      return result
    })
    .catch((err) => {
      inflight.delete(pageId)
      throw err
    })

  inflight.set(pageId, promise)
  return promise
}

export function useContent<T extends Record<string, any>>(
  pageId: string,
  defaults: T
): { data: T; loading: boolean } {
  const locale = useLocale()
  const [data, setData] = useState<T>(() => {
    const slice = resolveSlice(cache.get(pageId)?.data?.content, locale)
    if (slice && Object.keys(slice).length > 0) return { ...defaults, ...slice }
    return defaults
  })
  const [loading, setLoading] = useState(!cache.has(pageId))

  useEffect(() => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null
    const previewId = params?.get('preview')
    const isPreview = previewId === pageId

    if (isPreview) {
      setLoading(false)
      const handler = (event: MessageEvent) => {
        const msg = event.data
        if (msg && msg.type === 'preview-content' && msg.pageId === pageId && msg.content) {
          setData({ ...defaults, ...msg.content })
        }
      }
      window.addEventListener('message', handler)
      window.parent?.postMessage({ type: 'preview-ready', pageId }, '*')
      return () => window.removeEventListener('message', handler)
    }

    let cancelled = false
    fetchContent(pageId)
      .then((result) => {
        if (cancelled) return
        const slice = resolveSlice(result?.content, locale)
        if (slice && Object.keys(slice).length > 0) {
          setData({ ...defaults, ...slice })
        }
      })
      .catch((error) => {
        console.error(`Failed to load content for ${pageId}:`, error)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId, locale])

  return { data, loading }
}
