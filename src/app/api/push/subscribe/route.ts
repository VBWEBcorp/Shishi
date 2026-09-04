import { NextRequest, NextResponse } from 'next/server'

import { verifyAuth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import { PushSubscription } from '@/models/PushSubscription'
import { pushConfigure, envoyerNotification } from '@/lib/push'

/**
 * Enregistrement d'un appareil du club pour les notifications de réservation.
 *
 * ADMIN UNIQUEMENT : ces notifications annoncent des réservations clients avec
 * un nom et un horaire. Elles n'ont rien à faire sur le téléphone d'un visiteur
 * qui aurait trouvé l'adresse de l'API.
 */

/** État : les notifications sont-elles possibles sur ce serveur, et combien d'appareils ? */
export async function GET(request: NextRequest) {
  const { authenticated, user } = await verifyAuth(request)
  if (!authenticated || user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!pushConfigure()) {
    return NextResponse.json({ configure: false, appareils: 0 })
  }

  await connectDB()
  const appareils = await PushSubscription.countDocuments()
  return NextResponse.json({ configure: true, appareils })
}

/** Abonne cet appareil (ou met à jour ses clés s'il était déjà connu). */
export async function POST(request: NextRequest) {
  const { authenticated, user } = await verifyAuth(request)
  if (!authenticated || user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const endpoint = String(body?.subscription?.endpoint || '').trim()
  const p256dh = String(body?.subscription?.keys?.p256dh || '').trim()
  const auth = String(body?.subscription?.keys?.auth || '').trim()
  const label = String(body?.label || '').trim().slice(0, 80)

  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'invalid-subscription' }, { status: 400 })
  }

  await connectDB()
  await PushSubscription.findOneAndUpdate(
    { endpoint },
    { endpoint, keys: { p256dh, auth }, label },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )

  // Notification de contrôle : sans elle, on ne sait pas si ça marche avant la
  // première vraie réservation, et c'est trop tard pour s'en apercevoir.
  if (body?.test === true) {
    await envoyerNotification({
      title: 'Notifications activées',
      body: 'Cet appareil recevra les nouvelles réservations.',
      url: '/admin/bookings',
      tag: 'shishi-test',
    })
  }

  const appareils = await PushSubscription.countDocuments()
  return NextResponse.json({ ok: true, appareils })
}

/** Désabonne cet appareil. */
export async function DELETE(request: NextRequest) {
  const { authenticated, user } = await verifyAuth(request)
  if (!authenticated || user?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const endpoint = String(body?.endpoint || '').trim()
  if (!endpoint) return NextResponse.json({ error: 'missing-endpoint' }, { status: 400 })

  await connectDB()
  await PushSubscription.deleteOne({ endpoint })
  const appareils = await PushSubscription.countDocuments()
  return NextResponse.json({ ok: true, appareils })
}
