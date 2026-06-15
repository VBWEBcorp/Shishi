import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import { GalleryImage } from '@/models/Gallery'
import { verifyAuth } from '@/lib/auth'

// GET all gallery images (public - only active)
export async function GET() {
  try {
    await connectDB()
    const images = await GalleryImage.find({ active: true })
      .sort({ order: 1 })
      .lean()
    return NextResponse.json(images, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=120, stale-while-revalidate=600',
      },
    })
  } catch (error) {
    console.error('Gallery images error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST create gallery image (admin only)
export async function POST(request: NextRequest) {
  try {
    const { authenticated, user } = await verifyAuth(request)
    if (!authenticated || user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const { title, description, type, imageUrl, videoUrl, category, order } = await request.json()

    const mediaType = type === 'video' ? 'video' : 'image'
    // Une photo a besoin d'une image ; une vidéo d'un lien vidéo (vignette optionnelle).
    if (!title || (mediaType === 'image' ? !imageUrl : !videoUrl)) {
      return NextResponse.json(
        { error: 'Title and media are required' },
        { status: 400 }
      )
    }

    const image = await GalleryImage.create({
      title,
      description,
      type: mediaType,
      imageUrl,
      videoUrl,
      category: category || 'general',
      order: order || 0,
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Gallery image creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
