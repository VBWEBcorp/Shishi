'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Check, Eye, Loader2, Monitor, Save, Smartphone, X } from 'lucide-react'

import { FieldEditor, ImageField, ResponsiveImageField } from '@/components/admin/field-editor'
import { VideoField } from '@/components/admin/video-field'
import { Button } from '@/components/ui/button'
import {
  editablePages,
  priceSummary,
  type EditableField,
  type EditablePage,
} from '@/lib/editable-pages'
import type { Locale } from '@/lib/activities'
import type { ResponsiveImageValue } from '@/lib/responsive-image'
import { cn } from '@/lib/utils'

type Bilingual = Record<Locale, Record<string, any>>

/** Lit une valeur imbriquée à partir d'un chemin "hero.title" ou "gallery.0". */
function readPath(source: Record<string, any>, path: string): any {
  return path.split('.').reduce<any>((acc, key) => (acc == null ? undefined : acc[key]), source)
}

/**
 * Écrit une valeur imbriquée, en créant les niveaux manquants.
 * Un segment numérique crée un tableau, pas un objet : `gallery.0` doit donner
 * `{ gallery: [...] }`, sinon la page publique recevrait `{ "0": ... }` et
 * n'afficherait rien.
 */
function writePath(source: Record<string, any>, path: string, value: any): Record<string, any> {
  const next = structuredClone(source)
  const keys = path.split('.')
  let cursor: any = next
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const childIsIndex = /^\d+$/.test(keys[i + 1])
    if (cursor[key] == null || typeof cursor[key] !== 'object') {
      cursor[key] = childIsIndex ? [] : {}
    }
    cursor = cursor[key]
  }
  cursor[keys[keys.length - 1]] = value
  return next
}

export default function AdminContentPage() {
  const [pageId, setPageId] = useState(editablePages[0].id)
  const [locale, setLocale] = useState<Locale>('fr')
  const [content, setContent] = useState<Bilingual>({ fr: {}, en: {} })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop')
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const page = useMemo(
    () => editablePages.find((p) => p.id === pageId) as EditablePage,
    [pageId]
  )
  const active = content[locale] ?? {}

  // Chargement du contenu enregistré, fusionné avec les valeurs du site livré.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setDirty(false)
    fetch(`/api/content/${pageId}`)
      .then((r) => r.json())
      .then((result) => {
        if (cancelled) return
        const raw = result?.content ?? {}
        const hasLangs = raw && typeof raw === 'object' && ('fr' in raw || 'en' in raw)
        setContent({
          fr: { ...page.defaults.fr, ...(hasLangs ? raw.fr : raw) },
          en: { ...page.defaults.en, ...(hasLangs ? raw.en : {}) },
        })
      })
      .catch(() => {
        if (!cancelled) setContent({ fr: { ...page.defaults.fr }, en: { ...page.defaults.en } })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [pageId, page])

  const update = useCallback(
    (path: string, value: any) => {
      setSaved(false)
      setDirty(true)
      setContent((prev) => ({ ...prev, [locale]: writePath(prev[locale] ?? {}, path, value) }))
    },
    [locale]
  )

  // Aperçu : l'iframe charge la vraie page et reçoit le contenu en cours d'édition.
  const previewSrc = `/${locale}${page.previewPath === '/' ? '' : page.previewPath}?preview=${encodeURIComponent(pageId)}`

  useEffect(() => {
    if (!previewOpen) return
    const handler = (event: MessageEvent) => {
      const msg = event.data
      if (msg?.type === 'preview-ready' && msg.pageId === pageId) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'preview-content', pageId, content: active },
          '*'
        )
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [previewOpen, pageId, active])

  useEffect(() => {
    if (!previewOpen) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'preview-content', pageId, content: active },
      '*'
    )
  }, [active, previewOpen, pageId])

  // Garde-fou : prévenir avant de quitter avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return
    const onLeave = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onLeave)
    return () => window.removeEventListener('beforeunload', onLeave)
  }, [dirty])

  const handleSave = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`/api/content/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) throw new Error('save-failed')
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      alert('L’enregistrement a échoué. Vérifiez votre connexion et réessayez.')
    } finally {
      setSaving(false)
    }
  }

  const selectPage = (id: string) => {
    if (dirty && !confirm('Vous avez des modifications non enregistrées. Changer de page les perdra.')) return
    setPageId(id)
  }

  const renderField = (field: EditableField) => {
    const value = readPath(active, field.key)
    switch (field.type) {
      case 'image':
        return (
          <ResponsiveImageField
            key={field.key}
            label={field.label}
            value={value as ResponsiveImageValue}
            onChange={(v) => update(field.key, v)}
          />
        )
      case 'video':
        return (
          <VideoField
            key={field.key}
            label={field.label}
            value={(value as string) ?? ''}
            onChange={(v) => update(field.key, v)}
          />
        )
      default:
        return (
          <div key={field.key} className="space-y-1">
            <FieldEditor
              label={field.label}
              value={(value as string) ?? ''}
              onChange={(v) => update(field.key, v)}
              type={field.type === 'textarea' ? 'textarea' : 'text'}
            />
            {field.hint && <p className="text-xs text-muted-foreground/70">{field.hint}</p>}
          </div>
        )
    }
  }

  const groups = ['Site', 'Activités'] as const
  const tarif = page.id.startsWith('service-') ? priceSummary(page.id.replace('service-', '')) : null

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Colonne des pages */}
      <aside className="shrink-0 border-b border-border/40 bg-muted/20 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r">
        <div className="p-4 lg:p-5">
          <h1 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/70">
            Contenu du site
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Choisissez une page, modifiez, enregistrez.
          </p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-4 lg:overflow-visible lg:px-3">
          {groups.map((group) => (
            <div key={group} className="lg:space-y-0.5">
              <p className="hidden px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50 lg:block">
                {group}
              </p>
              <div className="flex gap-1 lg:block lg:space-y-0.5">
                {editablePages
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <button
                      key={p.id}
                      onClick={() => selectPage(p.id)}
                      className={cn(
                        'w-full whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors',
                        p.id === pageId
                          ? 'bg-accent text-accent-foreground font-medium'
                          : 'text-muted-foreground hover:bg-card hover:text-foreground'
                      )}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Zone d'édition */}
      <main className="min-w-0 flex-1">
        <div className="sticky top-0 z-10 border-b border-border/40 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-foreground">{page.label}</h2>
              <p className="truncate text-xs text-muted-foreground">{page.previewPath}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
                {(['fr', 'en'] as const).map((lng) => (
                  <button
                    key={lng}
                    onClick={() => setLocale(lng)}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-semibold uppercase transition-colors',
                      locale === lng
                        ? 'bg-accent text-accent-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {lng === 'fr' ? '🇫🇷 FR' : '🇬🇧 EN'}
                  </button>
                ))}
              </div>
              <Button onClick={() => setPreviewOpen(true)} variant="outline" size="sm">
                <Eye className="size-3.5" />
                <span className="hidden sm:inline">Voir la page</span>
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !dirty}
                size="sm"
                className={saved ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
              >
                {saving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : saved ? (
                  <Check className="size-3.5" />
                ) : (
                  <Save className="size-3.5" />
                )}
                {saved ? 'Enregistré' : dirty ? 'Enregistrer' : 'À jour'}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 p-8 text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Chargement…
          </div>
        ) : (
          <div className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
            {tarif && (
              <p className="rounded-xl bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                Tarifs et horaires de cette activité : <strong>{tarif}</strong>. Ils se modifient
                avec votre développeur, pas ici.
              </p>
            )}
            {page.sections.map((section) => (
              <section
                key={section.title}
                className="overflow-hidden rounded-xl border border-border/40 bg-card"
              >
                <header className="border-b border-border/40 bg-muted/30 px-5 py-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/70">
                    {section.title}
                  </h3>
                  {section.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{section.description}</p>
                  )}
                </header>
                <div className="space-y-4 p-5">{section.fields.map(renderField)}</div>
              </section>
            ))}
            <p className="pb-8 text-center text-xs text-muted-foreground">
              Un champ laissé vide reprend le texte d’origine du site.
            </p>
          </div>
        )}
      </main>

      {/* Aperçu du vrai site */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">Aperçu — {page.label}</span>
              <span className="rounded bg-muted px-2 py-0.5 text-xs uppercase text-muted-foreground">
                {locale}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-border bg-card p-0.5">
                <button
                  onClick={() => setPreviewDevice('desktop')}
                  className={cn(
                    'rounded-md p-1.5',
                    previewDevice === 'desktop' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                  aria-label="Ordinateur"
                >
                  <Monitor className="size-4" />
                </button>
                <button
                  onClick={() => setPreviewDevice('mobile')}
                  className={cn(
                    'rounded-md p-1.5',
                    previewDevice === 'mobile' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                  )}
                  aria-label="Téléphone"
                >
                  <Smartphone className="size-4" />
                </button>
              </div>
              <Button onClick={() => setPreviewOpen(false)} variant="outline" size="sm">
                <X className="size-3.5" /> Fermer
              </Button>
            </div>
          </div>
          <div className="flex flex-1 items-start justify-center overflow-auto bg-muted/30 p-4">
            <iframe
              ref={iframeRef}
              src={previewSrc}
              title={`Aperçu ${page.label}`}
              className={cn(
                'h-full rounded-xl border border-border bg-background shadow-lg transition-all',
                previewDevice === 'mobile' ? 'w-[390px]' : 'w-full'
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
