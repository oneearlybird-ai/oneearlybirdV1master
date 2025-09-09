import 'server-only';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

type PutArgs = { key: string; body: Uint8Array | Buffer | string | ReadableStream<any>; contentType?: string };
type PutResult = { etag?: string; key: string };

function cfg() {
  const region = process.env.S3_REGION || process.env.AWS_REGION || '';
  const bucket = process.env.S3_BUCKET || '';
  const accessKeyId = process.env.S3_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || '';
  const exp = Number(process.env.S3_PRESIGN_EXP_SECONDS || '600');
  if (!region || !bucket || !accessKeyId || !secretAccessKey) {
    throw new Error('S3 configuration missing');
  }
  const client = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } });
  return { client, bucket, exp };
}

export async function putObject({ key, body, contentType }: PutArgs): Promise<PutResult> {
  const { client, bucket } = cfg();
  const cmd = new PutObjectCommand({ Bucket: bucket, Key: key, Body: body as any, ContentType: contentType });
  const res = await client.send(cmd);
  return { etag: res.ETag, key };
}

export async function getSignedUrlRead({ key, expiresSec }: { key: string; expiresSec?: number }): Promise<string> {
  const { client, bucket, exp } = cfg();
  const cmd = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await getSignedUrl(client, cmd, { expiresIn: Number(expiresSec ?? exp) });
}

