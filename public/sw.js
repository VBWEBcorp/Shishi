/*
 * Service worker de Shi Shi Samui.
 *
 * Il ne fait QU'UNE chose : recevoir les notifications de réservation et les
 * afficher. Aucun cache, aucune interception de requête. C'est volontaire : un
 * service worker qui met des pages en cache est la première cause de « j'ai
 * modifié le site et je vois encore l'ancienne version », et le club met son
 * contenu à jour depuis l'espace admin plusieurs fois par semaine.
 *
 * Il n'y a donc pas de gestionnaire `fetch` ici, et il ne peut rien casser du
 * chargement des pages.
 */

// Prendre la main tout de suite, sans attendre la fermeture des onglets :
// quelqu'un qui vient d'activer les notifications doit les recevoir maintenant.
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()))

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = {}
  }

  const titre = data.title || 'Shi Shi Samui'
  const options = {
    body: data.body || '',
    icon: '/icon.png',
    badge: '/icon.png',
    // Deux notifications de même tag se remplacent : une réservation modifiée
    // ne laisse pas deux bulles contradictoires sur l'écran.
    tag: data.tag || 'shishi',
    renotify: true,
    data: { url: data.url || '/admin/bookings' },
  }

  event.waitUntil(self.registration.showNotification(titre, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const cible = (event.notification.data && event.notification.data.url) || '/admin/bookings'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((fenetres) => {
      // Une fenêtre de l'admin est déjà ouverte : on y va, au lieu d'en empiler
      // une deuxième par-dessus.
      for (const f of fenetres) {
        if (f.url.includes('/admin') && 'focus' in f) {
          f.navigate(cible)
          return f.focus()
        }
      }
      return self.clients.openWindow(cible)
    })
  )
})
