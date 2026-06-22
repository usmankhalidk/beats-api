import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '@config/index';

let s3Instance: S3Client | null = null;

function getS3(): S3Client {
  if (!s3Instance) {
    s3Instance = new S3Client({
      endpoint: config.storage.endpoint,
      region: 'eu',
      credentials: {
        accessKeyId: config.storage.accessId,
        secretAccessKey: config.storage.accessKey,
      },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
    });
  }
  return s3Instance;
}

export async function uploadAvatar(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  userId: string,
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const key = `avatars/${userId}/${randomUUID()}${ext}`;

    await getS3().send(
      new PutObjectCommand({
        Bucket: config.storage.avatarBucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      }),
    );


  return `${config.storage.avatarBaseUrl}/${key}`;
}

export async function deleteAvatar(url: string): Promise<void> {
  const prefix = `${config.storage.avatarBaseUrl}/`;
  if (!url.startsWith(prefix)) return;
  const key = url.slice(prefix.length);

  await getS3().send(
    new DeleteObjectCommand({
      Bucket: config.storage.avatarBucket,
      Key: key,
    }),
  );
}

export async function uploadCoverImage(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  itemId: string,
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || '.jpg';
  const key = `beats/covers/${itemId}/${randomUUID()}${ext}`;
  await getS3().send(
    new PutObjectCommand({
      Bucket: config.storage.avatarBucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );
  return `${config.storage.avatarBaseUrl}/${key}`;
}

export async function deleteCoverImage(url: string): Promise<void> {
  const prefix = `${config.storage.avatarBaseUrl}/`;
  if (!url.startsWith(prefix)) return;
  const key = url.slice(prefix.length);
  await getS3().send(
    new DeleteObjectCommand({ Bucket: config.storage.avatarBucket, Key: key }),
  );
}

export async function uploadBeatFile(
  buffer: Buffer,
  originalName: string,
  mimetype: string,
  itemId: string,
): Promise<string> {
  const ext = path.extname(originalName).toLowerCase() || '.mp3';
  const key = `items/${itemId}/beat${ext}`;
  await getS3().send(
    new PutObjectCommand({
      Bucket: config.storage.beatBucket,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    }),
  );
  return key;
}

export async function getSignedBeatUrl(key: string, expiresInSeconds = 3600): Promise<string> {
  return getSignedUrl(
    getS3(),
    new GetObjectCommand({ Bucket: config.storage.beatBucket, Key: key }),
    { expiresIn: expiresInSeconds },
  );
}

export async function deleteBeatFile(key: string): Promise<void> {
  if (!key || key === 'pending') return;
  await getS3().send(
    new DeleteObjectCommand({ Bucket: config.storage.beatBucket, Key: key }),
  );
}
