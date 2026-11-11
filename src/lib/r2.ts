import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

const accountId = process.env.R2_ACCOUNT_ID || 'demo'
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'demo'
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'demo'

const r2 = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME || 'whatsymart'
const PUBLIC_URL = process.env.R2_PUBLIC_URL || 'https://pub-demo.r2.dev'

// ─── Upload Folders ───────────────────────────────────────────

export type UploadFolder =
  | 'products'
  | 'sellers/logos'
  | 'sellers/banners'
  | 'users/avatars'
  | 'reports/evidence'

// ─── Generate Pre-signed Upload URL ──────────────────────────
// Direct client-to-R2 upload bypasses serverless 4.5MB payload limit

export async function generatePresignedUploadUrl(
  folder: UploadFolder,
  contentType: string,
  fileSizeBytes: number
): Promise<{ uploadUrl: string; objectKey: string; publicUrl: string }> {
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB
  if (fileSizeBytes > MAX_SIZE) {
    throw new Error('File too large. Maximum size is 10MB.')
  }

  const ext = contentType.split('/')[1] || 'jpg'
  const objectKey = `${folder}/${uuidv4()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: BUCKET,
    Key: objectKey,
    ContentType: contentType,
    ContentLength: fileSizeBytes,
    Metadata: { 'uploaded-by': 'whatsymart' },
  })

  const uploadUrl = await getSignedUrl(r2, command, { expiresIn: 300 }) // 5 min

  return {
    uploadUrl,
    objectKey,
    publicUrl: `${PUBLIC_URL}/${objectKey}`,
  }
}

// ─── Delete Object ────────────────────────────────────────────

export async function deleteR2Object(objectKey: string): Promise<void> {
  await r2.send(
    new DeleteObjectCommand({ Bucket: BUCKET, Key: objectKey })
  )
}

// ─── Extract Object Key from Public URL ──────────────────────

export function extractObjectKey(publicUrl: string): string {
  return publicUrl.replace(`${PUBLIC_URL}/`, '')
}
