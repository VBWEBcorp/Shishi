import 'server-only'
import webpush from 'web-push'

import { connectDB } from '@/lib/db'
import { PushSubscription } from '@/models/PushSubscription'
import { siteConfig } from '@/lib/seo'

/**
 * Notifications push vers les appareils du club.
 *
 * Demande de septembre 2026 : « je vais essayer de vous le mettre en notification
 * push, que vous l'ayez comme une bulle de notification sur votre téléphone :
 * quelqu'un a réservé un nouveau créneau. » Aujourd'hui ils reçoivent un e-mail,
 * qu'ils voient quand ils pensent à regarder leurs mails, c'est-à-dire trop tard
 * quand quelqu'un se présente au club.
 *
 * Ça marche sur téléphone À CONDITION que l'espace admin ait été ajouté à l'écran
 * d'accueil : sur iOS, un site ouvert dans Safari n'a pas le droit d'envoyer de
 * notification, une application installée oui. C'est justement l'usage prévu
 * (« ajouter à l'écran d'accueil, ce sera comme une app »), et c'est pour ça que
 * l'admin a son propre manifeste.
 *
 * Sans clés VAPID configurées, tout ici ne fait rien, sans lever d'erreur : le
 * reste du site continue exactement comme avant.
 */

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''

let configure = false

/** Les notifications push sont-elles configurées sur ce serveur ? */
export function pushConfigure(): boolean {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY)
}

function preparer(): boolean {
  if (!pushConfigure()) return false
  if (!configure) {
    webpush.setVapidDetails(`mailto:${siteConfig.email}`, PUBLIC_KEY, PRIVATE_KEY)
    configure = true
  }
  return true
}

export interface Notification {
  title: string
  body: string
  /** Chemin ouvert au clic sur la notification. */
  url?: string
  /**
   * Regroupement : deux notifications de même `tag` se remplacent au lieu de
   * s'empiler. Une réservation par créneau, pas un mur de bulles.
   */
  tag?: string
}

/**
 * Envoie une notification à TOUS les appareils enregistrés.
 *
 * Ne lève jamais : une notification qui échoue ne doit pas faire échouer la
 * réservation qui l'a déclenchée. Le client a réservé, c'est ça qui compte.
 *
 * Un appareil qui répond 404 ou 410 a désinstallé l'application ou révoqué
 * l'autorisation : sa ligne est supprimée, sinon la base se remplit d'adresses
 * mortes qu'on retente à chaque réservation.
 */
export async function envoyerNotification(n: Notification): Promise<number> {
  if (!preparer()) return 0

  try {
    await connectDB()
    const abonnes = await PushSubscription.find().lean()
    if (abonnes.length === 0) return 0

    const charge = JSON.stringify({
      title: n.title,
      body: n.body,
      url: n.url || '/admin/bookings',
      tag: n.tag || 'shishi',
    })

    const perimes: string[] = []
    let envoyees = 0

    await Promise.all(
      abonnes.map(async (a) => {
        const sub = a as unknown as {
          endpoint: string
          keys: { p256dh: string; auth: string }
        }
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            charge
          )
          envoyees++
        } catch (e) {
          const code = (e as { statusCode?: number }).statusCode
          if (code === 404 || code === 410) perimes.push(sub.endpoint)
          else console.error('[push] envoi impossible', code)
        }
      })
    )

    if (perimes.length > 0) {
      await PushSubscription.deleteMany({ endpoint: { $in: perimes } })
    }
    if (envoyees > 0) {
      await PushSubscription.updateMany(
        { endpoint: { $nin: perimes } },
        { $set: { lastSentAt: new Date() } }
      )
    }

    return envoyees
  } catch (e) {
    console.error('[push] erreur', e)
    return 0
  }
}

/** Notification « nouvelle réservation », telle qu'elle apparaît sur le téléphone. */
export async function notifierNouvelleReservation(b: {
  name: string
  activityName: string
  date: string
  time: string
}): Promise<void> {
  const jour = (() => {
    const d = new Date(`${b.date}T12:00:00Z`)
    if (isNaN(d.getTime())) return b.date
    return d.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'UTC',
    })
  })()

  await envoyerNotification({
    title: `Nouvelle réservation : ${b.activityName}`,
    body: `${b.name} · ${jour} à ${b.time}`,
    url: '/admin/bookings',
    // Un tag par créneau : si la même réservation déclenche deux envois,
    // le téléphone n'affiche qu'une bulle.
    tag: `resa-${b.date}-${b.time}`,
  })
}
