import crypto from 'crypto';
import { env } from '../config/env.js';

const key = Buffer.from(env.tokenEncryptionKey, 'hex');

if (key.length !== 32) {
  throw new Error('TOKEN_ENCRYPTION_KEY must be 32-byte hex string (64 hex chars)');
}

export function encrypt(plainText: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

export function decrypt(cipherText: string): string {
  const buffer = Buffer.from(cipherText, 'base64');
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const payload = buffer.subarray(28);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(payload), decipher.final()]).toString('utf8');
}
