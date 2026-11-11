import { NextRequest, NextResponse } from 'next/server'
import { generatePresignedUploadUrl, UploadFolder } from '@/lib/r2'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { folder = 'products', contentType = 'image/jpeg', fileSize = 1024 * 500 } = body

    const allowedFolders: UploadFolder[] = [
      'products',
      'sellers/logos',
      'sellers/banners',
      'users/avatars',
      'reports/evidence',
    ]

    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ error: 'Dossier de stockage non autorisé' }, { status: 400 })
    }

    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Seules les images sont autorisées' }, { status: 400 })
    }

    // Direct pre-signed URL upload to Cloudflare R2
    const presigned = await generatePresignedUploadUrl(folder, contentType, fileSize)

    return NextResponse.json({
      success: true,
      uploadUrl: presigned.uploadUrl,
      objectKey: presigned.objectKey,
      publicUrl: presigned.publicUrl,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur génération URL R2'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
