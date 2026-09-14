import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(() => {
    service = new PasswordService();
  });

  it('should hash a password and verify it correctly', async () => {
    const raw = 'SuperSecret123!';
    const hash = await service.hash(raw);

    expect(hash).toBeDefined();
    expect(hash.startsWith('pbkdf2$100000$')).toBe(true);

    const isValid = await service.compare(raw, hash);
    expect(isValid).toBe(true);

    const isInvalid = await service.compare('WrongPassword!', hash);
    expect(isInvalid).toBe(false);
  });

  it('should reject malformed hashes safely without throwing', async () => {
    expect(await service.compare('password', '')).toBe(false);
    expect(await service.compare('password', 'invalid-hash-string')).toBe(false);
    expect(await service.compare('password', 'pbkdf2$100$bad$format')).toBe(false);
  });

  it('should generate secure random tokens and sha256 hashes', () => {
    const token1 = service.generateRandomToken(32);
    const token2 = service.generateRandomToken(32);

    expect(token1).toHaveLength(64); // 32 bytes in hex = 64 chars
    expect(token1).not.toEqual(token2);

    const hash = service.hashToken(token1);
    expect(hash).toHaveLength(64);
    expect(service.hashToken(token1)).toEqual(hash);
  });
});
