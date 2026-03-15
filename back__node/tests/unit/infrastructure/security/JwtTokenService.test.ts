import { describe, expect, it } from 'vitest';
import { JwtTokenService } from '../../../../src/infrastructure/security/JwtTokenService';

describe('JwtTokenService', () => {
  const secret = 'test-secret-key';
  const service = new JwtTokenService(secret, '1h');

  it('sign produit un token et verify le décode', () => {
    const payload = { sub: 'u1', email: 'a@b.com', name: 'Alice' };
    const token = service.sign(payload);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);

    const decoded = service.verify(token);
    expect(decoded.sub).toBe('u1');
    expect(decoded.email).toBe('a@b.com');
    expect(decoded.name).toBe('Alice');
  });

  it('verify lance si token invalide', () => {
    expect(() => service.verify('invalid.token.here')).toThrow();
    expect(() => service.verify('')).toThrow();
  });
});
