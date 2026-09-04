/**
 * Manifeste de l'ESPACE ADMIN.
 *
 * Séparé de celui du site public parce qu'il ne sert pas la même chose : celui-ci
 * ouvre le planning des réservations, en plein écran, sous le nom « Shi Shi Admin ».
 * C'est ce que le club installe sur son téléphone et sur la tablette de l'accueil.
 *
 * Servi par une route plutôt que par `app/admin/manifest.ts` : Next ne génère
 * qu'un seul manifeste de métadonnées par application, à la racine. Le fichier
 * est minuscule et ne change jamais, donc il est mis en cache longtemps.
 */
export const dynamic = 'force-static'

const MANIFESTE = {
  name: 'Shi Shi Samui, espace admin',
  short_name: 'Shi Shi Admin',
  description:
    'Planning des réservations, contacts et réglages du club Shi Shi Samui.',
  // Ouvre directement le planning : c'est l'écran qu'ils regardent en premier.
  start_url: '/admin/bookings',
  scope: '/admin',
  display: 'standalone',
  background_color: '#111111',
  theme_color: '#111111',
  orientation: 'portrait',
  icons: [
    { src: '/icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}

export function GET() {
  return new Response(JSON.stringify(MANIFESTE, null, 2), {
    headers: {
      'content-type': 'application/manifest+json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  })
}
