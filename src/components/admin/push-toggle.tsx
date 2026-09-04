'use client'

import { Bell, BellOff, Loader2, Smartphone } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

/**
 * Activer les notifications de réservation sur CET appareil.
 *
 * Un bouton par appareil, pas un réglage global : le téléphone de chacun des
 * deux gérants et la tablette de l'accueil s'activent séparément, et chacun
 * reçoit les nouvelles réservations.
 *
 * Sur iPhone, une page ouverte dans Safari n'a pas le droit d'afficher de
 * notification : il faut d'abord « Ajouter à l'écran d'accueil » puis ouvrir
 * l'icône. Le composant le détecte et le dit, plutôt que d'afficher un bouton
 * qui ne marchera pas.
 */

const CLE_PUBLIQUE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''

function authHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null
  return token
    ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
    : { 'Content-Type': 'application/json' }
}

/** La clé VAPID voyage en base64url ; l'API navigateur veut des octets. */
function versOctets(base64url: string): Uint8Array {
  const bourrage = '='.repeat((4 - (base64url.length % 4)) % 4)
  const base64 = (base64url + bourrage).replace(/-/g, '+').replace(/_/g, '/')
  const brut = atob(base64)
  const octets = new Uint8Array(brut.length)
  for (let i = 0; i < brut.length; i++) octets[i] = brut.charCodeAt(i)
  return octets
}

/** Application installée sur l'écran d'accueil (seul cas où iOS autorise le push) ? */
function estInstallee(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function estIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

type Etat = 'chargement' | 'indisponible' | 'ios-non-installe' | 'inactif' | 'actif' | 'refuse'

export function PushToggle() {
  const [etat, setEtat] = useState<Etat>('chargement')
  const [appareils, setAppareils] = useState(0)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  const rafraichir = useCallback(async () => {
    // Le navigateur sait-il faire ?
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      !('PushManager' in window) ||
      !CLE_PUBLIQUE
    ) {
      setEtat('indisponible')
      return
    }

    // iOS : rien n'est possible tant que l'admin n'est pas sur l'écran d'accueil.
    if (estIOS() && !estInstallee()) {
      setEtat('ios-non-installe')
      return
    }

    if (Notification.permission === 'denied') {
      setEtat('refuse')
      return
    }

    try {
      const enregistrement = await navigator.serviceWorker.getRegistration('/sw.js')
      const abonnement = await enregistrement?.pushManager.getSubscription()
      setEtat(abonnement ? 'actif' : 'inactif')
    } catch {
      setEtat('inactif')
    }

    try {
      const res = await fetch('/api/push/subscribe', { headers: authHeaders() })
      if (res.ok) {
        const d = await res.json()
        setAppareils(d.appareils ?? 0)
        if (d.configure === false) setEtat('indisponible')
      }
    } catch {
      /* le compteur d'appareils n'est qu'un confort */
    }
  }, [])

  useEffect(() => {
    rafraichir()
  }, [rafraichir])

  async function activer() {
    setEnvoi(true)
    setErreur('')
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setEtat(permission === 'denied' ? 'refuse' : 'inactif')
        return
      }

      const enregistrement = await navigator.serviceWorker.register('/sw.js')
      await navigator.serviceWorker.ready

      const abonnement = await enregistrement.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: versOctets(CLE_PUBLIQUE) as BufferSource,
      })

      const res = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          subscription: abonnement.toJSON(),
          label: navigator.userAgent.slice(0, 80),
          // Notification de contrôle immédiate : on saura tout de suite que ça
          // marche, au lieu de le découvrir à la première vraie réservation.
          test: true,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))

      const d = await res.json()
      setAppareils(d.appareils ?? 1)
      setEtat('actif')
    } catch (e) {
      console.error('[push] activation', e)
      setErreur("Activation impossible sur cet appareil.")
    } finally {
      setEnvoi(false)
    }
  }

  async function desactiver() {
    setEnvoi(true)
    setErreur('')
    try {
      const enregistrement = await navigator.serviceWorker.getRegistration('/sw.js')
      const abonnement = await enregistrement?.pushManager.getSubscription()
      if (abonnement) {
        await fetch('/api/push/subscribe', {
          method: 'DELETE',
          headers: authHeaders(),
          body: JSON.stringify({ endpoint: abonnement.endpoint }),
        }).catch(() => {})
        await abonnement.unsubscribe()
      }
      setEtat('inactif')
      await rafraichir()
    } finally {
      setEnvoi(false)
    }
  }

  if (etat === 'chargement') {
    return <div className="h-9 animate-pulse rounded-xl border border-border bg-card" />
  }

  if (etat === 'indisponible') return null

  /*
   * ACTIVÉ : une seule ligne discrète.
   *
   * Une fois les notifications en place, il n'y a plus rien à faire : garder une
   * grande carte en haut du planning reviendrait à occuper l'écran avec un
   * réglage déjà réglé. La ligne confirme l'état et laisse de quoi couper, sans
   * plus. Le planning, lui, remonte.
   */
  if (etat === 'actif') {
    return (
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-muted-foreground">
        <Bell className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
        <span>
          Notifications actives sur cet appareil
          {appareils > 1 ? ` (${appareils} appareils)` : ''}.
        </span>
        <button
          type="button"
          disabled={envoi}
          onClick={desactiver}
          className="font-medium underline underline-offset-4 transition-colors hover:text-foreground disabled:opacity-60"
        >
          Désactiver ici
        </button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
            <BellOff className="size-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold text-foreground">
              Notifications de réservation
            </h3>
            <p className="text-xs text-muted-foreground">
              {etat === 'refuse'
                ? 'Refusées par le navigateur. Autorisez-les dans les réglages du site, puis rechargez.'
                : etat === 'ios-non-installe'
                  ? 'Sur iPhone : Partager, puis « Ajouter à l’écran d’accueil ». Ouvrez ensuite l’icône Shi Shi Admin.'
                  : 'Recevez une bulle sur ce téléphone dès qu’un client réserve.'}
            </p>
          </div>
        </div>

        {etat === 'ios-non-installe' ? (
          <span className="inline-flex items-center gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-medium text-muted-foreground">
            <Smartphone className="size-4" aria-hidden />
            À installer d&apos;abord
          </span>
        ) : etat === 'refuse' ? null : (
          <button
            type="button"
            disabled={envoi}
            onClick={activer}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition-all hover:brightness-105 disabled:opacity-60"
          >
            {envoi ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Bell className="size-4" aria-hidden />
            )}
            Activer sur cet appareil
          </button>
        )}
      </div>

      {erreur && (
        <p className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {erreur}
        </p>
      )}
    </div>
  )
}
