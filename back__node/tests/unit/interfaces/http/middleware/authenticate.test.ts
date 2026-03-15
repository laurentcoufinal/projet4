import { describe, expect, it, vi } from 'vitest';
import { authenticate } from '../../../../../src/interfaces/http/middleware/authenticate';

describe('authenticate', () => {
  it('appelle next avec erreur si pas de header Authorization', () => {
    const tokenService = { verify: vi.fn(), sign: vi.fn() };
    const middleware = authenticate(tokenService as any);
    const req = { headers: {} };
    const res = {};
    const next = vi.fn();

    middleware(req as any, res as any, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 401 });
    expect(tokenService.verify).not.toHaveBeenCalled();
  });

  it('appelle next avec erreur si token invalide', () => {
    const tokenService = { verify: vi.fn().mockImplementation(() => { throw new Error('invalid'); }), sign: vi.fn() };
    const middleware = authenticate(tokenService as any);
    const req = { headers: { authorization: 'Bearer bad-token' } };
    const next = vi.fn();

    middleware(req as any, {} as any, next);

    expect(next).toHaveBeenCalledWith(expect.any(Error));
  });

  it('attache auth à req et appelle next() si token valide', () => {
    const tokenService = {
      verify: vi.fn().mockReturnValue({ sub: 'u1', email: 'a@b.com', name: 'Alice' }),
      sign: vi.fn(),
    };
    const middleware = authenticate(tokenService as any);
    const req = { headers: { authorization: 'Bearer valid-token' } };
    const next = vi.fn();

    middleware(req as any, {} as any, next);

    expect(req).toHaveProperty('auth', { userId: 'u1', email: 'a@b.com', name: 'Alice' });
    expect(next).toHaveBeenCalledWith();
  });
});
