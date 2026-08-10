import { NextRequest, NextResponse } from 'next/server'
import { verifyAuth } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import { r2Enabled, uploadToR2 } from '@/lib/r2'
import { optimizeImage } from '@/lib/optimize-image'

/**
 * Diagnostic public (booléen non sensible) : indique si le stockage d'images
 * cloud (Cloudflare R2) est bien configuré sur CE serveur. Permet de vérifier
 * depuis l'extérieur que les variables R2 sont prises en compte en production
 * (ex: `curl https://…/api/upload`). Sur Netlify, `r2Enabled=false` signifie que
 * les 4 variables R2 ne sont pas encore lues par le serveur.
 */
export async function GET() {
  return NextResponse.json({ storage: r2Enabled ? 'cloudflare-r2' : 'none', r2Enabled })
}

export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Types autorisés : images (optimisées) + vidéos (galerie).
    const imageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
    const videoTypes = ['video/mp4', 'video/webm', 'video/quicktime']
    const isVideo = videoTypes.includes(file.type)
    if (!imageTypes.includes(file.type) && !isVideo) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    // Taille max : 10 Mo pour une image, 200 Mo pour une vidéo.
    const maxSize = isVideo ? 200 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large (max ${isVideo ? '200' : '10'}MB)` },
        { status: 400 }
      )
    }

    const rawBuffer = Buffer.from(await file.arrayBuffer())
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

    const isSvg = file.type === 'image/svg+xml'

    let finalBuffer: Buffer
    let contentType: string
    let filename: string

    if (isVideo) {
      // Vidéo : pas d'optimisation, on stocke le fichier tel quel.
      finalBuffer = rawBuffer
      contentType = file.type
      const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4'
      filename = `${uniqueId}.${ext}`
    } else if (isSvg) {
      finalBuffer = rawBuffer
      contentType = 'image/svg+xml'
      filename = `${uniqueId}.svg`
    } else {
      // Optimiser avec Sharp → WebP
      const optimized = await optimizeImage(rawBuffer)
      finalBuffer = optimized.buffer
      contentType = optimized.contentType
      filename = `${uniqueId}.${optimized.ext}`
    }

    let url: string

    if (r2Enabled) {
      // Upload vers Cloudflare R2
      url = await uploadToR2(finalBuffer, filename, contentType)
    } else {
      // Fallback: stockage local (développement uniquement). Sur un hébergeur
      // serverless (Netlify) le système de fichiers est en lecture seule : l'écriture
      // échoue. On renvoie alors un message clair plutôt qu'un 500 opaque, pour
      // signaler que les variables Cloudflare R2 ne sont pas configurées côté serveur.
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
          await mkdir(uploadsDir, { recursive: true })
        }
        await writeFile(path.join(uploadsDir, filename), finalBuffer)
        url = `/uploads/${filename}`
      } catch (fsErr) {
        console.error('Upload local fallback failed (R2 non configuré ?):', fsErr)
        return NextResponse.json({ error: 'storage-not-configured' }, { status: 503 })
      }
    }

    // Taille avant/après
    const originalSize = (rawBuffer.length / 1024).toFixed(1)
    const optimizedSize = (finalBuffer.length / 1024).toFixed(1)

    return NextResponse.json({
      url,
      filename,
      originalSize: `${originalSize} Ko`,
      optimizedSize: `${optimizedSize} Ko`,
      storage: r2Enabled ? 'cloudflare-r2' : 'local',
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
