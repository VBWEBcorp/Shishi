'use client'

import { useEffect, useState } from 'react'

import { DEFAUT, normaliser, type BookingSettingsData } from '@/lib/booking-settings'

/**
 * Réglages de réservation vus par le navigateur.
 *
 * Le formulaire du site doit savoir, à l'instant où il s'affiche, si les
 * réservations sont ouvertes. Le club coupe et rouvre à la minute depuis son
 * espace admin : la réponse ne peut donc pas être figée dans la page au moment
 * du build, elle se demande au serveur.
 *
 * Une seule requête par chargement de page, partagée entre tous les endroits
 * qui posent la question (le formulaire de /book-now, le popup de l'accueil,
 * le bloc de réservation en bas des pages activité).
 *
 * Cache très court : 15 secondes. Assez pour ne pas répéter l'appel d'un
 * composant à l'autre, trop court pour qu'une fermeture passe inaperçue.
 */

const TTL = 15_000

let enCours: Promise<BookingSettingsData> | null = null
let cache: { valeur: BookingSettingsData; a: number } | null = null

export function fetchBookingSettings(): Promise<BookingSettingsData> {
  const maintenant = Date.now()
  if (cache && maintenant - cache.a < TTL) return Promise.resolve(cache.valeur)
  if (enCours) return enCours

  enCours = fetch('/api/booking-settings')
    .then((r) => r.json())
    .then((data) => {
      const valeur = normaliser(data)
      cache = { valeur, a: Date.now() }
      enCours = null
      return valeur
    })
    .catch(() => {
      enCours = null
      // Serveur injoignable : on garde le défaut, c'est-à-dire fermé, et on
      // renvoie le visiteur vers WhatsApp. Mieux vaut une réservation de moins
      // qu'une réservation que le club ne verra jamais.
      return DEFAUT
    })

  return enCours
}

export function useBookingSettings(): {
  reglages: BookingSettingsData
  chargement: boolean
} {
  const [reglages, setReglages] = useState<BookingSettingsData>(
    () => cache?.valeur ?? DEFAUT
  )
  const [chargement, setChargement] = useState(!cache)

  useEffect(() => {
    let annule = false
    fetchBookingSettings()
      .then((r) => {
        if (annule) return
        setReglages(r)
      })
      .finally(() => {
        if (!annule) setChargement(false)
      })
    return () => {
      annule = true
    }
  }, [])

  return { reglages, chargement }
}
