import 'server-only'
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

type PutArgs = { key: string; body: Uint8Array | Buffer | string | ReadableStream<any>; contentType?: string }
type PutResult = { etag?: string; key: string }

function cfg() {
  const region = process.env.AWS_REGION || process.env.S3_REGION || ''
  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET || ''
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || ''
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || ''
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_S3_ENDPOINT
  const forcePathStyle = (process.env.S3_FORCE_PATH_STYLE || '').toLowerCase() === 'true'
  const exp = Number(process.env.S3_SIGNED_URL_EXPIRES || process.env.S3_PRESIGN_EXP_SECONDS || '900')
  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('S3 configuration missing')
  }
  const client = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
    endpoint,
    forcePathStyle,
  })
  return { client, bucket, exp }
}

export async function putObject({ key, body, contentType }: PutArgs): Promise<PutResult> {
  const { client, bucket } = cfg()
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body as any, ContentType: contentType })
  const res = await client.send(cmd)
  return { etag: res.ETag, key }
}

export async function getSignedUrlRead({ key, expiresSec }: { key: string; expiresSec?: number }): Promise<string> {
  const { client, bucket, exp } = cfg()
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key })
  return await getSignedUrl(client, cmd, { expiresIn: Number(expiresSec ?? exp) })
}

// Aliases to match route-level helpers used by smoke endpoints
export async function getDownloadUrl(opts: { Key: string; expiresIn?: number }): Promise<string> {
  const { client, bucket, exp } = cfg()
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: opts.Key })
  return await getSignedUrl(client, cmd, { expiresIn: Number(opts.expiresIn ?? exp) })
}

export async function getUploadUrl(opts: { Key: string; ContentType?: string; expiresIn?: number }): Promise<string> {
  const { client, bucket, exp } = cfg()
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: opts.Key, ContentType: opts.ContentType })
  return await getSignedUrl(client, cmd, { expiresIn: Number(opts.expiresIn ?? exp) })
}
