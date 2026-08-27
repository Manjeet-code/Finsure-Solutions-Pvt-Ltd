import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = crypto
  .createHash('sha256')
  .update(process.env.ENCRYPTION_SECRET || 'finsure-default-encryption-secret-key-2026')
  .digest(); // 32 bytes key

/**
 * Encrypt sensitive text string (Aadhaar, PAN, Bank Acc)
 */
export const encryptSensitiveData = (text) => {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(12); // 96 bits IV for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);
    
    let encrypted = cipher.update(String(text), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');

    return `enc:${iv.toString('hex')}:${tag}:${encrypted}`;
  } catch (err) {
    console.error('Encryption error:', err);
    return text;
  }
};

/**
 * Decrypt encrypted text string
 */
export const decryptSensitiveData = (text) => {
  if (!text || typeof text !== 'string' || !text.startsWith('enc:')) return text;
  try {
    const parts = text.split(':');
    if (parts.length !== 4) return text;

    const iv = Buffer.from(parts[1], 'hex');
    const tag = Buffer.from(parts[2], 'hex');
    const encryptedText = parts[3];

    const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return text;
  }
};
