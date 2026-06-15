'use client'

import { useRef, useState } from 'react'
import { Link2, Upload, X } from 'lucide-react'

import { cn } from '@/lib/utils'

/**
 * Champ vidéo : lien (YouTube / Vimeo / .mp4) OU upload direct (mp4/webm/mov
 * vers Cloudflare R2). Aperçu lecteur si le lien est un fichier vidéo.
 */
export function VideoField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [mode, setMode] = useState<'link' | 'upload'>('link')
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      })
      const data = await res.json()
      if (res.ok && data.url) onChange(data.url)
      else alert(data.error || 'Erreur upload')
    } catch {
      alert('Erreur lors de l’upload')
    } finally {
      setUploading(false)
    }
  }

  const isFile = /\.(mp4|webm|mov)(\?|$)/i.test(value)

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>

      <div className="inline-flex rounded-lg border border-input bg-background/60 p-1">
        <button
          type="button"
          onClick={() => setMode('link')}
          className={cn('flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors', mode === 'link' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}
        >
          <Link2 className="size-3.5" /> Lien
        </button>
        <button
          type="button"
          onClick={() => setMode('upload')}
          className={cn('flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-colors', mode === 'upload' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground')}
        >
          <Upload className="size-3.5" /> Upload
        </button>
      </div>

      {mode === 'link' ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://youtube.com/…  ·  https://vimeo.com/…  ·  …/video.mp4"
          className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
        />
      ) : (
        <>
          <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleFile} className="hidden" />
          <button
            type="button"
            onClick={() => !uploading && inputRef.current?.click()}
            className={cn(
              'flex h-20 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-input text-sm text-muted-foreground transition-colors hover:bg-muted',
              uploading && 'pointer-events-none opacity-60'
            )}
          >
            <Upload className="size-4" />
            {uploading ? 'Upload en cours…' : 'Choisir une vidéo (mp4/webm/mov, ≤ 200 Mo)'}
          </button>
        </>
      )}

      {value && (
        <div className="relative overflow-hidden rounded-xl border border-border">
          {isFile ? (
            <video src={value} controls className="max-h-48 w-full bg-black" />
          ) : (
            <p className="truncate px-3 py-2 text-xs text-muted-foreground">{value}</p>
          )}
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Retirer"
            className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}
