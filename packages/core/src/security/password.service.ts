import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class PasswordService {
  private readonly defaultIterations = 100000;
  private readonly keyLength = 64;
  private readonly digest = 'sha512';

  /**
   * Hashes a password with cryptographically secure random salt using PBKDF2
   */
  async hash(password: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const salt = crypto.randomBytes(16).toString('hex');
      crypto.pbkdf2(
        password,
        salt,
        this.defaultIterations,
        this.keyLength,
        this.digest,
        (err, derivedKey) => {
          if (err) return reject(err);
          resolve(`pbkdf2$${this.defaultIterations}$${salt}$${derivedKey.toString('hex')}`);
        },
      );
    });
  }

  /**
   * Timing-safe password verification
   */
  async compare(password: string, storedHash: string): Promise<boolean> {
    if (!storedHash || !password) return false;

    const parts = storedHash.split('$');
    if (parts.length !== 4 || parts[0] !== 'pbkdf2') {
      // If legacy or unknown format, fallback or fail securely
      return false;
    }

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const key = parts[3];

    return new Promise((resolve) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        this.keyLength,
        this.digest,
        (err, derivedKey) => {
          if (err) return resolve(false);

          const keyBuffer = Buffer.from(key, 'hex');
          if (keyBuffer.length !== derivedKey.length) {
            return resolve(false);
          }

          try {
            const isMatch = crypto.timingSafeEqual(keyBuffer, derivedKey);
            resolve(isMatch);
          } catch {
            resolve(false);
          }
        },
      );
    });
  }

  /**
   * Generates a secure random token (e.g. for email verification, password reset, refresh tokens)
   */
  generateRandomToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString('hex');
  }

  /**
   * Hashes a token using SHA-256 for secure database storage
   */
  hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }
}
