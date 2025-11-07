import crypto from 'crypto';
import { env } from '../config/env';

const algorithm = 'aes-256-gcm';
const secret = env.ENCRYPTION_SECRET.padEnd(32, '0').slice(0, 32); // 32 bytes
const iv = Buffer.from(env.ENCRYPTION_IV.padEnd(16, '0').slice(0, 16));

export function encrypt(text: string): string {
    const cipher = crypto.createCipheriv(algorithm, secret, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return Buffer.concat([authTag, encrypted]).toString('base64');
}

export function decrypt(encryptedText: string): string {
    const buffer = Buffer.from(encryptedText, 'base64');
    const authTag = buffer.subarray(0, 16);
    const encrypted = buffer.subarray(16);
    const decipher = crypto.createDecipheriv(algorithm, secret, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
}
