import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID!
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY!
const BUCKET_NAME = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.R2_PUBLIC_URL!

export const r2Enabled = !!(ACCOUNT_ID && ACCESS_KEY_ID && SECRET_ACCESS_KEY && BUCKET_NAME)

const r2Client = r2Enabled
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
      },
    })
  : null

export async function uploadToR2(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  if (!r2Client) {
    throw new Error('R2 is not configured')
  }

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: buffer,
      ContentType: contentType,
    })
  )

  // Si une URL publique R2 est fournie, on la sert directement (CDN Cloudflare).
  // Sinon, on passe par le proxy interne `/api/media/…` : aucune config d'accès
  // public nécessaire, l'image est servie par le site lui-même.
  return PUBLIC_URL ? `${PUBLIC_URL}/${filename}` : `/api/media/${filename}`
}

/** Récupère un objet R2 (pour le proxy interne /api/media/[filename]). */
export async function getFromR2(filename: string) {
  if (!r2Client) return null
  try {
    return await r2Client.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key: filename }))
  } catch {
    return null
  }
}

export async function deleteFromR2(filename: string): Promise<void> {
  if (!r2Client) return

  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    })
  )
}
