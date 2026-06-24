'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, Check, ArrowLeft, Eye, X, ExternalLink, Monitor, Smartphone } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type EditLocale = 'fr' | 'en'
type BilingualContent = { fr: Record<string, any>; en: Record<string, any> }

interface PageEditorProps {
  pageId: string
  title: string
  /** Contenu par défaut français (affiché tant que rien n'est enregistré). */
  defaultContent: Record<string, any>
  /** Contenu par défaut anglais (onglet EN). À défaut, reprend le français. */
  defaultContentEn?: Record<string, any>
  children: (
    content: Record<string, any>,
    updateField: (path: string, value: any) => void
  ) => React.ReactNode
}

const previewPaths: Record<string, string> = {
  home: '/',
  about: '/a-propos',
  services: '/services',
  contact: '/contact-location',
  testimonials: '/#temoignages',
}

/**
 * Normalise le contenu reçu de l'API en { fr, en }.
 *  · Nouveau format { fr, en } → repris tel quel (fr fusionné avec les défauts).
 *  · Ancien format « à plat » (mono-langue) → considéré comme le contenu FR.
 * L'anglais démarre vide : les pages publiques retombent alors sur les
 * traductions anglaises natives (next-intl) tant qu'il n'est pas traduit.
 */
function normalizeContent(
  raw: any,
  defaultFr: Record<string, any>,
  defaultEn: Record<string, any>
): BilingualContent {
  const hasLangs = raw && typeof raw === 'object' && ('fr' in raw || 'en' in raw)
  if (hasLangs) {
    return {
      fr: { ...defaultFr, ...(raw.fr || {}) },
      en: { ...defaultEn, ...(raw.en || {}) },
    }
  }
  if (raw && typeof raw === 'object' && Object.keys(raw).length > 0) {
    // Ancien contenu mono-langue → considéré comme le français ; l'anglais
    // démarre sur ses propres défauts anglais.
    return { fr: { ...defaultFr, ...raw }, en: { ...defaultEn } }
  }
  return { fr: { ...defaultFr }, en: { ...defaultEn } }
}

export function PageEditor({ pageId, title, defaultContent, defaultContentEn, children }: PageEditorProps) {
  const defaultEn = defaultContentEn ?? defaultContent
  const [editLocale, setEditLocale] = useState<EditLocale>('fr')
  const [content, setContent] = useState<BilingualContent>(() => ({ fr: defaultContent, en: defaultEn }))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const [previewReady, setPreviewReady] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const activeContent = content[editLocale] ?? {}

  const previewPath = previewPaths[pageId]
  // Aperçu chargé dans la langue en cours d'édition (/fr/... ou /en/...).
  const previewSrc = previewPath
    ? (() => {
        const [path, hash] = previewPath.split('#')
        const localized = `/${editLocale}${path === '/' ? '' : path}`
        const sep = localized.includes('?') ? '&' : '?'
        return `${localized}${sep}preview=${encodeURIComponent(pageId)}${hash ? `#${hash}` : ''}`
      })()
    : ''

  // Re-déclenche le handshake quand on change de langue (l'iframe se recharge).
  useEffect(() => {
    setPreviewReady(false)
  }, [editLocale])

  useEffect(() => {
    if (!previewOpen) {
      setPreviewReady(false)
      return
    }
    const handler = (event: MessageEvent) => {
      const msg = event.data
      if (msg && msg.type === 'preview-ready' && msg.pageId === pageId) {
        setPreviewReady(true)
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'preview-content', pageId, content: activeContent },
          '*'
        )
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [previewOpen, pageId, activeContent])

  useEffect(() => {
    if (previewOpen && previewReady) {
      iframeRef.current?.contentWindow?.postMessage(
        { type: 'preview-content', pageId, content: activeContent },
        '*'
      )
    }
  }, [activeContent, previewOpen, previewReady, pageId])

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`/api/content/${pageId}`)
        const result = await response.json()
        setContent(normalizeContent(result?.content, defaultContent, defaultEn))
      } catch (error) {
        console.error('Failed to load content:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageId])

  const updateField = useCallback(
    (path: string, value: any) => {
      setSaved(false)
      setContent((prev) => {
        const next: BilingualContent = JSON.parse(JSON.stringify(prev))
        const slice = next[editLocale] ?? (next[editLocale] = {})
        const keys = path.split('.')
        let obj: any = slice
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in obj)) obj[keys[i]] = {}
          obj = obj[keys[i]]
        }
        obj[keys[keys.length - 1]] = value
        return next
      })
    },
    [editLocale]
  )

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/content/${pageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      alert('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 lg:-mx-8 lg:-mt-8 px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-4 bg-muted/30 backdrop-blur-sm border-b border-border/30 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-4xl pt-12 md:pt-0 md:pr-20 xl:pr-0">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
            </Link>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Sélecteur de langue d'édition FR / EN */}
            <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
              {(['fr', 'en'] as const).map((lng) => (
                <button
                  key={lng}
                  onClick={() => setEditLocale(lng)}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors',
                    editLocale === lng
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {lng === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
                </button>
              ))}
            </div>

            {previewPaths[pageId] && (
              <Button
                onClick={() => setPreviewOpen(true)}
                variant="outline"
                size="sm"
              >
                <Eye className="size-3.5" />
                <span className="hidden sm:inline">Aperçu</span>
              </Button>
            )}
          <Button
            onClick={handleSave}
            disabled={saving}
            size="sm"
            className={saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
          >
            {saved ? (
              <>
                <Check className="size-3.5" />
                Sauvegardé
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </>
            )}
          </Button>
          </div>
        </div>
        {/* Rappel de la langue éditée */}
        <p className="mt-2 max-w-4xl text-xs text-muted-foreground">
          {editLocale === 'fr'
            ? 'Vous modifiez la version française de la page.'
            : 'Vous modifiez la version anglaise de la page — traduisez chaque champ en anglais.'}
        </p>
      </div>

      <motion.div
        key={editLocale}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5 max-w-4xl"
      >
        {children(activeContent, updateField)}
      </motion.div>

      {previewOpen && previewPath && (
        <div
          className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex flex-col p-3 sm:p-4"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="relative w-full h-full bg-zinc-100 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-border/40 bg-white">
              <div className="flex items-center gap-2 text-xs text-muted-foreground truncate min-w-0">
                <Eye className="size-3.5 shrink-0" />
                <span className="font-medium">Aperçu</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold uppercase">{editLocale}</span>
                <span className="truncate hidden sm:inline">{previewSrc}</span>
              </div>

              <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-0.5">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  title="Ordinateur"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    previewDevice === 'desktop'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Monitor className="size-3.5" />
                  <span className="hidden sm:inline">Ordinateur</span>
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  title="Mobile"
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                    previewDevice === 'mobile'
                      ? 'bg-white text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Smartphone className="size-3.5" />
                  <span className="hidden sm:inline">Mobile</span>
                </button>
              </div>

              <div className="flex items-center gap-1">
                <a
                  href={previewSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Ouvrir dans un onglet"
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ExternalLink className="size-4" />
                </a>
                <button
                  onClick={() => setPreviewOpen(false)}
                  title="Fermer"
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-6">
              <div
                className={cn(
                  'bg-white shadow-lg transition-all duration-300 overflow-hidden',
                  previewDevice === 'mobile'
                    ? 'w-[390px] h-[780px] max-w-full max-h-full rounded-[28px] border-[10px] border-zinc-900'
                    : 'w-full h-full rounded-md'
                )}
              >
                <iframe
                  key={editLocale}
                  ref={iframeRef}
                  src={previewSrc}
                  className="w-full h-full bg-white"
                  title="Aperçu de la page"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
