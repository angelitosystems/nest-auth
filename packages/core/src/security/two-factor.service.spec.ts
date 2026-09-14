import { TwoFactorService } from './two-factor.service';

describe('TwoFactorService', () => {
  let service: TwoFactorService;

  beforeEach(() => {
    service = new TwoFactorService();
  });

  it('should generate a valid Base32 secret', () => {
    const secret = service.generateSecret();
    expect(secret).toBeDefined();
    expect(secret.length).toBeGreaterThanOrEqual(16);
    expect(/^[A-Z2-7]+$/.test(secret)).toBe(true);
  });

  it('should generate valid otpauth URI for QR codes', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const uri = service.generateOtpAuthUrl({
      accountName: 'admin@example.com',
      issuer: 'NestAuthApp',
      secret,
    });

    expect(uri).toContain('otpauth://totp/NestAuthApp:admin%40example.com');
    expect(uri).toContain(`secret=${secret}`);
  });

  it('should generate and verify recovery codes safely', () => {
    const { rawCodes, hashedCodes } = service.generateRecoveryCodes(5);

    expect(rawCodes).toHaveLength(5);
    expect(hashedCodes).toHaveLength(5);

    const firstCode = rawCodes[0];
    const verification = service.verifyRecoveryCode(firstCode, hashedCodes);

    expect(verification.isValid).toBe(true);
    expect(verification.remainingHashedCodes).toHaveLength(4);

    // Reusing the same code against remaining codes must fail
    const reuseVerification = service.verifyRecoveryCode(firstCode, verification.remainingHashedCodes);
    expect(reuseVerification.isValid).toBe(false);
  });
});
