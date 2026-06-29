import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { env } from '../config/env';

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.bcryptRounds);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/** Opaque random token (for refresh tokens / invites), returned with its hash. */
export function generateToken(bytes = 48) {
  const raw = crypto.randomBytes(bytes).toString('hex');
  const hash = crypto.createHash('sha256').update(raw).digest('hex');
  return { raw, hash };
}

export function hashToken(raw: string) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}
