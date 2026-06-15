'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Trash2, Plus, Check, X, ArrowLeft, ImageIcon, Video } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ImageField } from '@/components/admin/field-editor'
import { VideoField } from '@/components/admin/video-field'
import { cn } from '@/lib/utils'

interface GalleryImage {
  _id: string
  title: string
  description?: string
  type?: 'image' | 'video'
  imageUrl?: string
  videoUrl?: string
  category?: string
  active: boolean
}

interface GallerySettings {
  enabled: boolean
  title: string
  description?: string
  eyebrow?: string
  heroImage?: string
}

export default function AdminGalleryPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<GallerySettings>({ enabled: false, title: 'Nos réalisations', eyebrow: 'Galerie', description: 'Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire.', heroImage: '' })
  const [images, setImages] = useState<GalleryImage[]>([])
  const [newImage, setNewImage] = useState<{
    title: string
    description: string
    type: 'image' | 'video'
    imageUrl: string
    videoUrl: string
    category: string
  }>({ title: '', description: '', type: 'image', imageUrl: '', videoUrl: '', category: '' })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Vérifier auth
  useEffect(() => {
    if (!localStorage.getItem('authToken')) {
      router.push('/admin/login')
    }
  }, [router])

  // Charger les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, imagesRes] = await Promise.all([
          fetch('/api/gallery/settings'),
          fetch('/api/gallery/images'),
        ])

        const settingsData = await settingsRes.json()
        const imagesData = await imagesRes.json()

        setSettings(settingsData)
        setImages(imagesData)
      } catch (error) {
        console.error('Failed to load gallery:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSaveSettings = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/gallery/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        alert('✅ Paramètres sauvegardés')
      }
    } catch (error) {
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const handleAddImage = async () => {
    const hasMedia = newImage.type === 'video' ? !!newImage.videoUrl : !!newImage.imageUrl
    if (!newImage.title || !hasMedia) {
      alert(newImage.type === 'video' ? 'Titre + vidéo (lien ou upload) requis' : 'Titre + image requis')
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch('/api/gallery/images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newImage),
      })

      if (response.ok) {
        const image = await response.json()
        setImages([...images, image])
        setNewImage({ title: '', description: '', type: 'image', imageUrl: '', videoUrl: '', category: '' })
        alert('✅ Média ajouté')
      }
    } catch (error) {
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteImage = async (id: string) => {
    if (!confirm('Êtes-vous sûr?')) return

    try {
      const token = localStorage.getItem('authToken')
      const response = await fetch(`/api/gallery/images/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      })

      if (response.ok) {
        setImages(images.filter(img => img._id !== id))
        alert('✅ Image supprimée')
      }
    } catch (error) {
      alert('❌ Erreur: ' + (error instanceof Error ? error.message : 'Erreur inconnue'))
    }
  }

  const handleToggleImage = async (id: string, active: boolean) => {
    try {
      const token = localStorage.getItem('authToken')
      const image = images.find(img => img._id === id)
      if (!image) return

      const response = await fetch(`/api/gallery/images/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ ...image, active: !active }),
      })

      if (response.ok) {
        setImages(images.map(img =>
          img._id === id ? { ...img, active: !active } : img
        ))
      }
    } catch (error) {
      alert('❌ Erreur')
    }
  }

  if (loading) {
    return <div className="p-6">Chargement...</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 pt-12 md:pt-0">
        <Link
          href="/admin/dashboard"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="font-display text-2xl text-foreground">Galerie</h1>
      </div>
      {/* Settings - Hero */}
      <div className="rounded-xl bg-card border border-border/40 overflow-hidden max-w-2xl">
        <div className="px-5 py-3 border-b border-border/40 bg-muted/30 flex items-center justify-between">
          <h3 className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
            Section d&apos;en-tête (Hero)
          </h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <div
              className={`relative w-9 h-5 rounded-full transition-colors ${settings.enabled ? 'bg-primary' : 'bg-muted-foreground/30'}`}
              onClick={() => {
                const newSettings = { ...settings, enabled: !settings.enabled }
                setSettings(newSettings)
                const token = localStorage.getItem('authToken')
                fetch('/api/gallery/settings', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify(newSettings),
                })
              }}
            >
              <div className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-white shadow transition-transform ${settings.enabled ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-xs text-muted-foreground">{settings.enabled ? 'Visible' : 'Masquée'}</span>
          </label>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Petit texte au-dessus du titre
            </Label>
            <Input
              value={settings.eyebrow || ''}
              onChange={(e) => setSettings({ ...settings, eyebrow: e.target.value })}
              placeholder="Galerie"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Titre principal
            </Label>
            <Input
              value={settings.title}
              onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              placeholder="Nos réalisations"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Description
            </Label>
            <textarea
              value={settings.description || ''}
              onChange={(e) => setSettings({ ...settings, description: e.target.value })}
              placeholder="Découvrez nos projets récents et laissez-vous inspirer par notre savoir-faire."
              rows={2}
              className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 resize-y"
            />
          </div>

          <ImageField
            label="Image de fond du Hero"
            value={settings.heroImage || ''}
            onChange={(v) => setSettings({ ...settings, heroImage: v })}
          />
          <p className="text-[11px] text-muted-foreground/60 -mt-2">
            Image affichée en arrière-plan de la section d&apos;en-tête. Laissez vide pour un fond uni.
          </p>

          <Button
            onClick={handleSaveSettings}
            disabled={saving}
            className="w-full gap-2"
          >
            <Check className="size-4" />
            {saving ? 'Sauvegarde...' : 'Sauvegarder les paramètres'}
          </Button>
        </div>
      </div>

      {/* Add media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="size-4" />
            Ajouter un média
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Type : photo ou vidéo */}
          <div className="inline-flex w-full gap-1 rounded-xl border border-border bg-muted/40 p-1 sm:w-auto">
            {([
              { k: 'image', label: 'Photo', Icon: ImageIcon },
              { k: 'video', label: 'Vidéo', Icon: Video },
            ] as const).map(({ k, label, Icon }) => (
              <button
                key={k}
                type="button"
                onClick={() => setNewImage({ ...newImage, type: k })}
                className={cn(
                  'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none',
                  newImage.type === k ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              value={newImage.title}
              onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              placeholder={newImage.type === 'video' ? 'Titre de la vidéo' : "Titre de la photo"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newImage.description}
              onChange={(e) => setNewImage({ ...newImage, description: e.target.value })}
              placeholder="Description optionnelle"
            />
          </div>

          {newImage.type === 'image' ? (
            <ImageField label="Photo (lien ou upload)" value={newImage.imageUrl} onChange={(v) => setNewImage({ ...newImage, imageUrl: v })} />
          ) : (
            <>
              <VideoField label="Vidéo (lien ou upload)" value={newImage.videoUrl} onChange={(v) => setNewImage({ ...newImage, videoUrl: v })} />
              <ImageField label="Vignette (optionnelle)" value={newImage.imageUrl} onChange={(v) => setNewImage({ ...newImage, imageUrl: v })} />
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="category">Catégorie</Label>
            <Input
              id="category"
              value={newImage.category}
              onChange={(e) => setNewImage({ ...newImage, category: e.target.value })}
              placeholder="Ex: tennis, piscine, événement…"
            />
          </div>

          <Button onClick={handleAddImage} disabled={saving} className="w-full gap-2 bg-accent text-accent-foreground hover:brightness-105">
            <Plus className="size-4" />
            {saving ? 'Ajout…' : 'Ajouter'}
          </Button>
        </CardContent>
      </Card>

      {/* Images List */}
      <Card>
        <CardHeader>
          <CardTitle>Médias ({images.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="space-y-3">
              {images.map((image) => (
                <motion.div
                  key={image._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <span className={cn(
                      'inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                      image.type === 'video' ? 'bg-accent/15 text-accent' : 'bg-muted text-muted-foreground'
                    )}>
                      {image.type === 'video' ? <Video className="size-3" /> : <ImageIcon className="size-3" />}
                      {image.type === 'video' ? 'Vidéo' : 'Photo'}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{image.title}</p>
                      <p className="truncate text-sm text-muted-foreground">{image.videoUrl || image.imageUrl}</p>
                      {image.category && <p className="mt-1 text-xs text-accent">{image.category}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleToggleImage(image._id, image.active)}
                      title={image.active ? 'Désactiver' : 'Activer'}
                    >
                      {image.active ? (
                        <Check className="size-4 text-primary" />
                      ) : (
                        <X className="size-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => handleDeleteImage(image._id)}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">Aucun média</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
