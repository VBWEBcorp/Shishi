'use client'

import { useRef, useState } from 'react'
import { Upload, Link as LinkIcon, X, Loader2, Monitor, Smartphone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  buildResponsiveImage,
  resolveResponsiveImage,
  type ResponsiveImageValue,
} from '@/lib/responsive-image'
import { cn } from '@/lib/utils'

interface FieldEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
  type?: 'text' | 'textarea' | 'url'
  placeholder?: string
}

export function FieldEditor({ label, value, onChange, type = 'text', placeholder }: FieldEditorProps) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {label}
      </Label>
      {type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
        />
      ) : (
        <Input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          type={type === 'url' ? 'url' : 'text'}
        />
      )}
    </div>
  )
}

interface SectionEditorProps {
  title: string
  children: React.ReactNode
}

export function SectionEditor({ title, children }: SectionEditorProps) {
  return (
    <div className="rounded-xl bg-card border border-border/40 overflow-hidden">
      <div className="px-5 py-3 border-b border-border/40 bg-muted/30">
        <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{title}</h3>
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

interface ImageFieldProps {
  label: string
  value: string
  onChange: (value: string) => void
  /**
   * Silhouette de l'aperçu. `video` (défaut) montre le cadrage paysage réel
   * d'un visuel d'ordinateur ; `portrait` celui d'un téléphone — l'aperçu doit
   * refléter ce que verra le visiteur, sinon on valide un cadrage qui coupe.
   */
  previewAspect?: 'video' | 'portrait'
  /** Icône affichée devant le libellé (distingue ordinateur / téléphone). */
  icon?: React.ReactNode
  /** Précision affichée sous le champ (format conseillé, comportement si vide). */
  hint?: string
}

export function ImageField({
  label,
  value,
  onChange,
  previewAspect = 'video',
  icon,
  hint,
}: ImageFieldProps) {
  const [mode, setMode] = useState<'link' | 'upload'>(
    value && !value.startsWith('/uploads') && !value.includes('r2') ? 'link' : 'upload'
  )
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadInfo, setUploadInfo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Bascule vers l'onglet « Lien » avec un message clair quand l'upload échoue
  // (typiquement : stockage d'images non configuré → écriture impossible en prod).
  const failToLink = () => {
    setMode('link')
    setError('Upload d’image indisponible pour le moment. Collez plutôt l’URL d’une image ci-dessous (onglet « Lien »).')
  }

  const handleUpload = async (file: File) => {
    setUploading(true)
    setError(null)
    try {
      const token = localStorage.getItem('authToken')
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) {
        // Le serveur explique certains refus (photo HEIC d'iPhone, fichier
        // illisible) : on montre SON message, bien plus utile que « réessayez ».
        const detail = await response.json().catch(() => null)
        if (detail?.message) {
          setError(detail.message)
          return
        }
        failToLink()
        return
      }

      const data = await response.json()
      onChange(data.url)
      setUploadInfo(`${data.originalSize} → ${data.optimizedSize} (${data.storage})`)
    } catch {
      failToLink()
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleUpload(file)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {icon}
          {label}
        </Label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
              mode === 'upload'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Upload className="size-3" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('link')}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors',
              mode === 'link'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <LinkIcon className="size-3" />
            Lien
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:text-amber-400">
          {error}
        </p>
      )}

      {mode === 'link' ? (
        <Input
          value={value}
          onChange={(e) => { setError(null); onChange(e.target.value) }}
          placeholder="https://..."
          type="url"
        />
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
              dragOver
                ? 'border-primary bg-primary/5'
                : 'border-border/50 hover:border-primary/30 hover:bg-muted/30',
              uploading && 'pointer-events-none opacity-60'
            )}
          >
            {uploading ? (
              <>
                <Loader2 className="size-6 text-primary animate-spin" />
                <span className="text-sm text-muted-foreground">Upload en cours...</span>
              </>
            ) : (
              <>
                <Upload className="size-6 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Cliquez ou glissez une image ici
                </span>
                <span className="text-xs text-muted-foreground/60">
                  JPG, PNG, WebP, GIF - max 10 Mo
                </span>
              </>
            )}
          </div>
        </>
      )}

      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}

      {/* Preview — au format réellement servi au visiteur */}
      {value && (
        <div className={cn('relative group w-full', previewAspect === 'portrait' ? 'max-w-[10rem]' : 'max-w-xs')}>
          <div
            className={cn(
              'rounded-lg overflow-hidden bg-muted border border-border/50',
              previewAspect === 'portrait' ? 'aspect-[3/4]' : 'aspect-video'
            )}
          >
            <img src={value} alt="" className="object-cover w-full h-full" />
          </div>
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 rounded-md bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
          >
            <X className="size-3" />
          </button>
          <p className="text-xs text-muted-foreground mt-1 truncate">{value}</p>
          {uploadInfo && (
            <p className="text-xs text-primary mt-0.5">{uploadInfo}</p>
          )}
        </div>
      )}
    </div>
  )
}

interface ResponsiveImageFieldProps {
  label: string
  value: ResponsiveImageValue | null | undefined
  onChange: (value: ResponsiveImageValue) => void
}

/**
 * Emplacement photo à deux formats : une version ordinateur (paysage) et, si
 * on le souhaite, une version téléphone (portrait).
 *
 * La version téléphone est facultative à dessein — laissée vide, la photo
 * d'ordinateur est servie partout et recadrée, ce qui reste le comportement
 * historique. On ne force donc jamais le client à fournir deux fichiers ; on
 * lui donne le moyen d'éviter un recadrage malheureux quand la photo s'y prête
 * mal (typiquement une photo prise au téléphone, en portrait).
 */
export function ResponsiveImageField({ label, value, onChange }: ResponsiveImageFieldProps) {
  const resolved = resolveResponsiveImage(value)
  // Ce qui est réellement stocké : sans version téléphone, `desktop` porte
  // l'unique photo, et le champ « téléphone » doit donc rester vide.
  const desktopUrl = resolved.desktop
  const mobileUrl = resolved.hasBothFormats ? (resolved.mobile ?? '') : ''

  return (
    <div className="space-y-3 rounded-xl border border-border/40 bg-muted/20 p-4">
      <Label className="text-xs font-semibold uppercase tracking-wide">{label}</Label>

      <div className="grid gap-4 sm:grid-cols-2">
        <ImageField
          label="Ordinateur"
          icon={<Monitor className="size-3.5" />}
          value={desktopUrl}
          onChange={(url) => onChange(buildResponsiveImage(url, mobileUrl))}
          previewAspect="video"
          hint="Photo principale. Format paysage conseillé."
        />
        <ImageField
          label="Téléphone"
          icon={<Smartphone className="size-3.5" />}
          value={mobileUrl}
          onChange={(url) => onChange(buildResponsiveImage(desktopUrl, url))}
          previewAspect="portrait"
          hint={
            mobileUrl
              ? 'Format portrait, affiché sous 768 px de large.'
              : 'Facultatif. Sans cette photo, celle de l’ordinateur est recadrée sur téléphone.'
          }
        />
      </div>

      {resolved.hasBothFormats && (
        <p className="text-xs text-primary">
          Deux formats actifs : le téléphone reçoit la version portrait, l’ordinateur la version paysage.
        </p>
      )}
    </div>
  )
}
