import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class TwoFactorService {
  private readonly base32Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

  /**
   * Generates a random Base32 encoded TOTP secret (20 bytes = 160 bits)
   */
  generateSecret(length = 20): string {
    const buffer = crypto.randomBytes(length);
    let secret = '';
    let bits = 0;
    let value = 0;

    for (let i = 0; i < buffer.length; i++) {
      value = (value << 8) | buffer[i];
      bits += 8;
      while (bits >= 5) {
        secret += this.base32Chars[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) {
      secret += this.base32Chars[(value << (5 - bits)) & 31];
    }
    return secret;
  }

  /**
   * Generates the otpauth URL for authenticator apps (Google Authenticator, Authy, etc.)
   */
  generateOtpAuthUrl(options: {
    accountName: string;
    issuer: string;
    secret: string;
  }): string {
    const account = encodeURIComponent(options.accountName);
    const issuer = encodeURIComponent(options.issuer);
    return `otpauth://totp/${issuer}:${account}?secret=${options.secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
  }

  /**
   * Generates an array of secure recovery codes
   */
  generateRecoveryCodes(count = 8): { rawCodes: string[]; hashedCodes: string[] } {
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const part1 = crypto.randomBytes(3).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(3).toString('hex').toUpperCase();
      const code = `${part1}-${part2}`;
      rawCodes.push(code);

      const hashed = crypto.createHash('sha256').update(code).digest('hex');
      hashedCodes.push(hashed);
    }

    return { rawCodes, hashedCodes };
  }

  /**
   * Verifies if a recovery code is valid against an array of hashed codes
   */
  verifyRecoveryCode(
    code: string,
    hashedCodes: string[],
  ): { isValid: boolean; remainingHashedCodes: string[] } {
    const formatted = code.trim().toUpperCase();
    const hash = crypto.createHash('sha256').update(formatted).digest('hex');

    const index = hashedCodes.indexOf(hash);
    if (index === -1) {
      return { isValid: false, remainingHashedCodes: hashedCodes };
    }

    const remaining = [...hashedCodes];
    remaining.splice(index, 1);
    return { isValid: true, remainingHashedCodes: remaining };
  }

  /**
   * Verifies a TOTP token against a secret with window tolerance
   */
  verifyToken(secret: string, token: string, window = 1): boolean {
    if (!token || !secret) return false;
    const cleanToken = token.trim();
    if (cleanToken.length !== 6 || !/^\d+$/.test(cleanToken)) return false;

    const timeStep = 30; // seconds
    const currentTime = Math.floor(Date.now() / 1000);
    const currentCounter = Math.floor(currentTime / timeStep);

    for (let i = -window; i <= window; i++) {
      const generatedToken = this.generateTotp(secret, currentCounter + i);
      if (generatedToken === cleanToken) {
        return true;
      }
    }
    return false;
  }

  /**
   * Generates a 6-digit TOTP for a given counter
   */
  private generateTotp(secret: string, counter: number): string {
    const key = this.base32Decode(secret);
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(counter), 0);

    const hmac = crypto.createHmac('sha1', key).update(counterBuffer).digest();
    const offset = hmac[hmac.length - 1] & 0x0f;

    const code =
      ((hmac[offset] & 0x7f) << 24) |
      ((hmac[offset + 1] & 0xff) << 16) |
      ((hmac[offset + 2] & 0xff) << 8) |
      (hmac[offset + 3] & 0xff);

    const strCode = (code % 1000000).toString();
    return strCode.padStart(6, '0');
  }

  /**
   * Decodes Base32 secret string into Buffer
   */
  private base32Decode(base32: string): Buffer {
    const cleaned = base32.toUpperCase().replace(/=+$/, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
      const index = this.base32Chars.indexOf(cleaned[i]);
      if (index === -1) {
        continue;
      }
      value = (value << 5) | index;
      bits += 5;

      if (bits >= 8) {
        bytes.push((value >>> (bits - 8)) & 255);
        bits -= 8;
      }
    }

    return Buffer.from(bytes);
  }
}
