import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { lireReglages, ecrireReglages } from '@/lib/booking-settings-server'
import { normaliser, type ClosureRule } from '@/lib/booking-settings'

/**
 * Réglages de la réservation en ligne.
 *
 * GET est PUBLIC : le formulaire du site doit savoir s'il s'affiche ou s'il
 * renvoie vers WhatsApp, et une page mise en cache doit pouvoir le rafraîchir
 * sans être reconstruite. Rien de confidentiel n'en sort : un état ouvert /
 * fermé et un message d'attente.
 *
 * Cache très court (15 s) : le club coupe les réservations « à la minute »,
 * et une minute de décalage suffirait à laisser passer une réservation qu'ils
 * pensent avoir bloquée.
 */
export const dynamic = 'force-dynamic'

const CACHE = {
  'Cache-Control': 'public, max-age=15, s-maxage=15, stale-while-revalidate=60',
}

export async function GET() {
  const reglages = await lireReglages()
  return NextResponse.json(reglages, { headers: CACHE })
}

const DATE = /^\d{4}-\d{2}-\d{2}$/

/** Ne garde que des fermetures exploitables, bornes remises dans l'ordre. */
function nettoyerFermetures(brut: unknown): ClosureRule[] {
  if (!Array.isArray(brut)) return []
  const propres: ClosureRule[] = []
  for (const c of brut) {
    if (!c || typeof c !== 'object') continue
    const from = String((c as ClosureRule).from ?? '')
    const to = String((c as ClosureRule).to ?? from)
    if (!DATE.test(from) || !DATE.test(to)) continue
    propres.push({
      from: from <= to ? from : to,
      to: from <= to ? to : from,
      activitySlug: String((c as ClosureRule).activitySlug ?? '').trim(),
      reason: String((c as ClosureRule).reason ?? '').trim().slice(0, 200),
    })
    // Garde-fou : une liste de fermetures n'a aucune raison d'être longue,
    // et elle est relue à chaque appel du formulaire.
    if (propres.length >= 100) break
  }
  return propres
}

export async function PUT(request: NextRequest) {
  const { authenticated, user } = await verifyAuth(request)
  if (!authenticated || user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const actuel = await lireReglages()

  // Mise à jour partielle : l'admin envoie le seul champ qu'il change (le
  // grand interrupteur, une activité, une fermeture) sans avoir à renvoyer
  // tout le reste et risquer d'écraser une modification faite entre-temps.
  const suivant = normaliser({
    online: 'online' in body ? body.online === true : actuel.online,
    activities:
      body.activities && typeof body.activities === 'object'
        ? { ...actuel.activities, ...body.activities }
        : actuel.activities,
    closedNotice: body.closedNotice
      ? {
          fr: String(body.closedNotice.fr ?? actuel.closedNotice.fr).slice(0, 400),
          en: String(body.closedNotice.en ?? actuel.closedNotice.en).slice(0, 400),
        }
      : actuel.closedNotice,
    closures: 'closures' in body ? nettoyerFermetures(body.closures) : actuel.closures,
  })

  const enregistre = await ecrireReglages(suivant)
  return NextResponse.json(enregistre)
}
