/**
 * AES-256-GCM credential encryption for client API keys.
 * Server-side only — never import this in 'use client' files.
 *
 * Key source: ENCRYPTION_SECRET env var (64-char hex = 32 bytes).
 * Each encrypt() call produces a unique IV so ciphertexts differ
 * even for identical inputs.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;   // 96-bit IV recommended for GCM
const TAG_BYTES = 16;  // 128-bit authentication tag

function getKey(): Buffer {
    const secret = process.env.ENCRYPTION_SECRET;
    if (!secret) {
        throw new Error('ENCRYPTION_SECRET environment variable is not set');
    }
    if (secret.length !== 64) {
        throw new Error('ENCRYPTION_SECRET must be a 64-character hex string (32 bytes)');
    }
    return Buffer.from(secret, 'hex');
}

/**
 * Encrypt a credentials object to a base64 string.
 * Format: base64(iv[12] + tag[16] + ciphertext)
 */
export function encryptCredentials(data: Record<string, string>): string {
    const key = getKey();
    const iv = crypto.randomBytes(IV_BYTES);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    const plaintext = JSON.stringify(data);
    const encrypted = Buffer.concat([
        cipher.update(plaintext, 'utf8'),
        cipher.final(),
    ]);
    const tag = cipher.getAuthTag();

    // Pack: iv + tag + ciphertext
    const packed = Buffer.concat([iv, tag, encrypted]);
    return packed.toString('base64');
}

/**
 * Decrypt a base64 string back to a credentials object.
 * Returns empty object on any decryption failure (safe fallback).
 */
export function decryptCredentials(encoded: string): Record<string, string> {
    try {
        const key = getKey();
        const packed = Buffer.from(encoded, 'base64');

        const iv = packed.subarray(0, IV_BYTES);
        const tag = packed.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
        const ciphertext = packed.subarray(IV_BYTES + TAG_BYTES);

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        const decrypted = Buffer.concat([
            decipher.update(ciphertext),
            decipher.final(),
        ]);

        return JSON.parse(decrypted.toString('utf8'));
    } catch {
        return {};
    }
}

/**
 * Generate a cryptographically random 64-char hex key suitable
 * for use as ENCRYPTION_SECRET.
 */
export function generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
}
