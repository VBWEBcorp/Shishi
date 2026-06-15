// Fonction planifiée Netlify : appelle l'endpoint de rappels toutes les 15 min.
// L'envoi des emails est fait côté Next (/api/cron/reminders), protégé par
// CRON_SECRET. Cette fonction se contente de "pinger" l'endpoint.
//
// Variables requises côté Netlify : CRON_SECRET (et URL fournie automatiquement
// par Netlify, ou NEXT_PUBLIC_SITE_URL en repli).

export default async () => {
  const base = process.env.URL || process.env.NEXT_PUBLIC_SITE_URL
  const secret = process.env.CRON_SECRET

  if (!base || !secret) {
    console.warn('[reminders] URL ou CRON_SECRET manquant — ignoré')
    return new Response('not-configured')
  }

  try {
    const res = await fetch(`${base}/api/cron/reminders`, {
      headers: { Authorization: `Bearer ${secret}` },
    })
    const text = await res.text()
    console.log('[reminders]', res.status, text)
    // On remonte l'échec à Netlify (pour le monitoring / retry) si l'endpoint
    // ne répond pas 2xx.
    if (!res.ok) return new Response('error', { status: 500 })
  } catch (err) {
    console.error('[reminders] échec:', err)
    return new Response('error', { status: 500 })
  }

  return new Response('ok')
}

// Toutes les 15 minutes.
export const config = { schedule: '*/15 * * * *' }
