import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

const key = Buffer.from(env.passportFileKey);
const s3Ready = Boolean(
  env.s3.bucket && env.s3.region && env.s3.accessKeyId && env.s3.secretAccessKey,
);
const s3 = s3Ready
  ? new S3Client({
      region: env.s3.region,
      endpoint: env.s3.endpoint || undefined,
      forcePathStyle: env.s3.forcePathStyle,
      credentials: { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey },
    })
  : null;
const localRoot = path.resolve(env.privateFileDir);

function encryptBuffer(buffer) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([Buffer.from('GIPDF1'), iv, cipher.getAuthTag(), data]);
}
function decryptBuffer(buffer) {
  if (buffer.subarray(0, 6).toString() !== 'GIPDF1')
    throw Object.assign(new Error('Invalid private document format'), { status: 500 });
  const iv = buffer.subarray(6, 18),
    tag = buffer.subarray(18, 34),
    data = buffer.subarray(34);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]);
}

export function privateStorageReady() {
  return s3Ready || env.nodeEnv !== 'production';
}

export async function savePassportPdf(buffer, storageKey) {
  const encrypted = encryptBuffer(buffer);
  if (s3Ready) {
    await s3.send(
      new PutObjectCommand({
        Bucket: env.s3.bucket,
        Key: storageKey,
        Body: encrypted,
        ContentType: 'application/octet-stream',
        ServerSideEncryption: 'AES256',
      }),
    );
    return { storageKey };
  }
  await fs.mkdir(path.dirname(path.join(localRoot, storageKey)), { recursive: true });
  await fs.writeFile(path.join(localRoot, storageKey), encrypted);
  return { storageKey };
}

export async function readPassportPdf(storageKey) {
  if (s3Ready) {
    const r = await s3.send(new GetObjectCommand({ Bucket: env.s3.bucket, Key: storageKey }));
    const chunks = [];
    for await (const c of r.Body) chunks.push(c);
    return decryptBuffer(Buffer.concat(chunks));
  }
  return decryptBuffer(await fs.readFile(path.join(localRoot, storageKey)));
}

export async function deletePassportPdf(storageKey) {
  if (!storageKey) return;
  if (s3Ready) {
    await s3.send(new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: storageKey }));
    return;
  }
  await fs.rm(path.join(localRoot, storageKey), { force: true });
}
