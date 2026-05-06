import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { config } from '@config/index';

let s3Instance: S3Client | null = null;

function getS3(): S3Client {
  if (!s3Instance) {
    s3Instance = new S3Client({
      endpoint: config.storage.endpoint,
      region: 'eu2',
      credentials: {
        accessKeyId: config.storage.clientId,
        secretAccessKey: config.storage.clientSecret,
      },
      forcePathStyle: true,
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
  try{

    await getS3().send(
      new PutObjectCommand({
        Bucket: config.storage.profilesBucket,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
        ACL: 'public-read',
      }),
    );
  }catch(error){
    console.log('error-->',error)
  }


  return `${config.storage.profilesBucketUrl}/${key}`;
}

export async function deleteAvatar(url: string): Promise<void> {
  const prefix = `${config.storage.profilesBucketUrl}/`;
  if (!url.startsWith(prefix)) return;
  const key = url.slice(prefix.length);

  await getS3().send(
    new DeleteObjectCommand({
      Bucket: config.storage.profilesBucket,
      Key: key,
    }),
  );
}
