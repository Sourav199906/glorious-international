import crypto from 'crypto';
import { env } from '../config/env.js';
const key = Buffer.from(env.travelerKey.padEnd(32, '0').slice(0, 32));
export function encrypt(text) {
  if (text == null || text === '') return text;
  const iv = crypto.randomBytes(12);
  const c = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([c.update(String(text), 'utf8'), c.final()]);
  return `${iv.toString('base64')}.${c.getAuthTag().toString('base64')}.${enc.toString('base64')}`;
}
export function decrypt(value) {
  if (!value || !value.includes('.')) return value;
  const [ivB, tagB, dataB] = value.split('.');
  try {
    const d = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivB, 'base64'));
    d.setAuthTag(Buffer.from(tagB, 'base64'));
    return Buffer.concat([d.update(Buffer.from(dataB, 'base64')), d.final()]).toString('utf8');
  } catch {
    return '[protected]';
  }
}
