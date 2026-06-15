'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlignLeft, ArrowRight, Check, Eye, Megaphone, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ImageField } from '@/components/admin/field-editor'
import { ColorField } from '@/components/admin/color-field'
import { BannerMarquee } from '@/components/marketing-banner'
import { cn } from '@/lib/utils'

interface BannerSettings {
  enabled: boolean
  text: string
  link: string
  bgColor: string
  textColor: string
}

interface PopupSettings {
  enabled: boolean
  title: string
  description: string
  buttonText: string
  buttonLink: string
  imageUrl: string
  bgColor: string
  textColor: string
  buttonColor: string
  delay: number
  banner: BannerSettings
}

const defaultSettings: PopupSettings = {
  enabled: false,
  title: 'Offre spéciale',
  description: 'Profitez de nos offres exclusives dès maintenant !',
  buttonText: 'En savoir plus',
  buttonLink: '#',
  imageUrl: '',
  bgColor: '#ffffff',
  textColor: '#111111',
  buttonColor: '#D95A00',
  delay: 5,
  banner: {
    enabled: false,
    text: '',
    link: '',
    bgColor: '#111111',
    textColor: '#ffffff',
  },
}

type Tab = 'popup' | 'banner'

/** Interrupteur on/off — accent de la charte. */
function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      role="switch"
      aria-checked={on}
      className={cn(
        'relative h-6 w-11 shrink-0 rounded-full transition-colors',
        on ? 'bg-accent' : 'bg-muted-foreground/30'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
          on && 'translate-x-5'
        )}
      />
    </button>
  )
}

export default function AdminMarketingPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<PopupSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [tab, setTab] = useState<Tab>('popup')

  useEffect(() => {
    if (!localStorage.getItem('authToken')) router.push('/admin/login')
  }, [router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/marketing')
        const data = await res.json()
        setSettings({
          ...defaultSettings,
          ...data,
          banner: { ...defaultSettings.banner, ...(data?.banner ?? {}) },
        })
      } catch (error) {
        console.error('Failed to load marketing settings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const updateBanner = (patch: Partial<BannerSettings>) =>
    setSettings((s) => ({ ...s, banner: { ...s.banner, ...patch } }))

  const handleSave = async () => {
    setSaving(true)
    setSaved(false)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch('/api/marketing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="p-8 text-sm text-muted-foreground">Chargement…</div>
  }

  const saveBtn = (
    <Button
      onClick={handleSave}
      disabled={saving}
      className="w-full gap-2 bg-accent text-accent-foreground hover:brightness-105"
    >
      <Check className="size-4" />
      {saving ? 'Sauvegarde…' : saved ? 'Enregistré ✓' : 'Sauvegarder'}
    </Button>
  )

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* En-tête */}
      <div className="flex flex-wrap items-end justify-between gap-3 pt-12 md:pt-0">
        <div>
          <h1 className="font-display text-2xl text-foreground">Marketing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === 'popup'
              ? 'Popup promotionnelle affichée aux visiteurs du site.'
              : 'Bannière défilante affichée tout en haut du site.'}
          </p>
        </div>
        {tab === 'popup' && (
          <button
            onClick={() => setShowPreview(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
          >
            <Eye className="size-4" /> Aperçu
          </button>
        )}
      </div>

      {/* Onglets */}
      <div className="inline-flex w-full gap-1 rounded-xl border border-border bg-card p-1 sm:w-auto">
        <button
          onClick={() => setTab('popup')}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none',
            tab === 'popup' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Megaphone className="size-4" /> Popup
        </button>
        <button
          onClick={() => setTab('banner')}
          className={cn(
            'inline-flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors sm:flex-none',
            tab === 'banner' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <AlignLeft className="size-4" /> Bannière
        </button>
      </div>

      {/* ───────── POPUP ───────── */}
      {tab === 'popup' && (
        <div className="max-w-2xl space-y-4">
          {/* Activation */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg text-foreground">Popup promotionnelle</h2>
              <p className="text-sm text-muted-foreground">
                {settings.enabled ? 'Activée — visible sur le site.' : 'Désactivée.'}
              </p>
            </div>
            <Toggle on={settings.enabled} onToggle={() => setSettings({ ...settings, enabled: !settings.enabled })} />
          </div>

          {/* Contenu */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Contenu</p>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Titre</Label>
              <Input value={settings.title} onChange={(e) => setSettings({ ...settings, title: e.target.value })} placeholder="Offre spéciale" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Description</Label>
              <textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                placeholder="Profitez de nos offres exclusives…"
                rows={3}
                className="w-full resize-y rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Texte du bouton</Label>
                <Input value={settings.buttonText} onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })} placeholder="En savoir plus" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lien du bouton</Label>
                <Input value={settings.buttonLink} onChange={(e) => setSettings({ ...settings, buttonLink: e.target.value })} placeholder="https://…" />
              </div>
            </div>

            <ImageField label="Image (optionnelle)" value={settings.imageUrl} onChange={(v) => setSettings({ ...settings, imageUrl: v })} />
          </div>

          {/* Design */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Design</p>
            <ColorField label="Fond" value={settings.bgColor} onChange={(v) => setSettings({ ...settings, bgColor: v })} />
            <ColorField label="Texte" value={settings.textColor} onChange={(v) => setSettings({ ...settings, textColor: v })} />
            <ColorField label="Bouton" value={settings.buttonColor} onChange={(v) => setSettings({ ...settings, buttonColor: v })} />

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Délai d&apos;apparition (secondes)</Label>
              <Input
                type="number"
                min={1}
                max={60}
                value={settings.delay}
                onChange={(e) => setSettings({ ...settings, delay: parseInt(e.target.value) || 5 })}
                className="max-w-[140px]"
              />
              <p className="text-[11px] text-muted-foreground/60">La popup apparaît après ce délai à l&apos;ouverture du site.</p>
            </div>
          </div>

          {saveBtn}
        </div>
      )}

      {/* ───────── BANNIÈRE ───────── */}
      {tab === 'banner' && (
        <div className="max-w-2xl space-y-4">
          {/* Activation */}
          <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div>
              <h2 className="font-display text-lg text-foreground">Bannière défilante</h2>
              <p className="text-sm text-muted-foreground">
                {settings.banner.enabled ? 'Activée — visible tout en haut du site.' : 'Désactivée.'}
              </p>
            </div>
            <Toggle on={settings.banner.enabled} onToggle={() => updateBanner({ enabled: !settings.banner.enabled })} />
          </div>

          {/* Aperçu réel */}
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="border-b border-border px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Aperçu — défile en haut du site
            </div>
            <BannerMarquee
              text={settings.banner.text || 'Votre texte de bannière…'}
              bgColor={settings.banner.bgColor}
              textColor={settings.banner.textColor}
            />
          </div>

          {/* Contenu */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Contenu</p>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Texte</Label>
              <Input value={settings.banner.text} onChange={(e) => updateBanner({ text: e.target.value })} placeholder="Ouverture le 1er juillet — réservez vos cours !" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lien (optionnel)</Label>
              <Input value={settings.banner.link} onChange={(e) => updateBanner({ link: e.target.value })} placeholder="/book-now ou https://…" />
              <p className="text-[11px] text-muted-foreground/60">Laissez vide pour une bannière non cliquable.</p>
            </div>
          </div>

          {/* Design */}
          <div className="space-y-5 rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Design</p>
            <ColorField label="Fond" value={settings.banner.bgColor} onChange={(v) => updateBanner({ bgColor: v })} />
            <ColorField label="Texte" value={settings.banner.textColor} onChange={(v) => updateBanner({ textColor: v })} />
          </div>

          {saveBtn}
        </div>
      )}

      {/* Aperçu popup (modal) */}
      {showPreview && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md" onClick={() => setShowPreview(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[420px] overflow-hidden rounded-3xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.4)]"
            style={{ backgroundColor: settings.bgColor, color: settings.textColor }}
          >
            <div className="pointer-events-none absolute -top-20 -right-20 size-40 rounded-full opacity-20 blur-3xl" style={{ backgroundColor: settings.buttonColor }} />
            <button
              onClick={() => setShowPreview(false)}
              className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full border border-black/5 bg-black/5 backdrop-blur-sm transition-all hover:scale-110 hover:bg-black/10"
              style={{ color: settings.textColor }}
            >
              <X className="size-4" strokeWidth={2.5} />
            </button>

            {settings.imageUrl && (
              <div className="relative h-52 w-full overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={settings.imageUrl} alt={settings.title} className="h-full w-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 h-20" style={{ background: `linear-gradient(to top, ${settings.bgColor}, transparent)` }} />
              </div>
            )}

            <div className={cn('relative px-7', settings.imageUrl ? 'pt-1 pb-7' : 'py-8')}>
              {!settings.imageUrl && <div className="mb-5 h-1 w-12 rounded-full" style={{ backgroundColor: settings.buttonColor }} />}
              <h2 className="pr-10 text-2xl font-extrabold leading-tight tracking-tight">{settings.title || 'Titre'}</h2>
              <p className="mt-3 text-sm leading-relaxed opacity-70">{settings.description || 'Description…'}</p>
              <div className="mt-6">
                <span
                  className="inline-flex items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: settings.buttonColor, boxShadow: `0 4px 14px -3px ${settings.buttonColor}80` }}
                >
                  {settings.buttonText || 'En savoir plus'}
                  <ArrowRight className="size-4" />
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
