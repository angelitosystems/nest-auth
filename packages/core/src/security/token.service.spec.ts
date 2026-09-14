import { UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;
  const secret = 'super-secret-key-that-is-at-least-32-chars-long';

  beforeEach(() => {
    service = new TokenService({
      jwt: {
        secret,
        accessTokenExpiresIn: '15m',
        refreshTokenExpiresIn: '7d',
        issuer: 'test-issuer',
      },
      adapter: null as any,
    });
  });

  it('should sign and verify valid JWT tokens', () => {
    const token = service.sign({ sub: 'user-123', email: 'test@example.com' }, 900);
    expect(token).toBeDefined();

    const payload = service.verify(token);
    expect(payload.sub).toBe('user-123');
    expect(payload.email).toBe('test@example.com');
    expect(payload.iss).toBe('test-issuer');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('should throw UnauthorizedException on tampered token signature', () => {
    const token = service.sign({ sub: 'user-123', email: 'test@example.com' }, 900);
    const parts = token.split('.');
    const tampered = `${parts[0]}.${parts[1]}.invalidSignature`;

    expect(() => service.verify(tampered)).toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException on expired tokens', () => {
    // Generate token that expired 10 seconds ago
    const expiredToken = service.sign({ sub: 'user-123', email: 'test@example.com' }, -10);
    expect(() => service.verify(expiredToken)).toThrow(UnauthorizedException);
  });

  it('should parse human duration strings correctly', () => {
    expect(service.parseDuration('30s', '15m')).toBe(30);
    expect(service.parseDuration('15m', '15m')).toBe(900);
    expect(service.parseDuration('2h', '15m')).toBe(7200);
    expect(service.parseDuration('7d', '15m')).toBe(604800);
    expect(service.parseDuration(300, '15m')).toBe(300);
  });

  it('should create complete token pair with refresh token', () => {
    const pair = service.createTokenPair({ sub: 'user-123', email: 'test@example.com' });
    expect(pair.accessToken).toBeDefined();
    expect(pair.refreshToken).toBeDefined();
    expect(pair.expiresIn).toBe(900);
  });
});
