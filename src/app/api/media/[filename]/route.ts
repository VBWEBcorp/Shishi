import { NextRequest, NextResponse } from 'next/server'

import { getFromR2 } from '@/lib/r2'

/**
 * Proxy d'images : sert un fichier stocké sur Cloudflare R2 via le site lui-même
 * (`/api/media/<fichier>`). Évite de devoir rendre le bucket public. La réponse
 * est mise en cache longuement (noms de fichiers uniques → contenu immuable).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params
  const obj = await getFromR2(filename)
  if (!obj?.Body) {
    return new NextResponse('Not found', { status: 404 })
  }

  const bytes = await (obj.Body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray()

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      'Content-Type': obj.ContentType || 'application/octet-stream',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
