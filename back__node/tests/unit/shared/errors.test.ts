import { describe, expect, it } from 'vitest';
import { AppError } from '../../../src/shared/errors/AppError';
import { Errors } from '../../../src/shared/errors/errors';

describe('Errors', () => {
  it('unauthorized retourne AppError 401', () => {
    const err = Errors.unauthorized();
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
  });

  it('forbidden retourne 403', () => {
    const err = Errors.forbidden('Accès refusé');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Accès refusé');
  });

  it('notFound retourne 404', () => {
    const err = Errors.notFound('Pas trouvé');
    expect(err.statusCode).toBe(404);
  });

  it('badRequest retourne 400', () => {
    const err = Errors.badRequest();
    expect(err.statusCode).toBe(400);
  });

  it('validation retourne 422 avec details optionnels', () => {
    const err = Errors.validation('Invalid', { email: ['taken'] });
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ email: ['taken'] });
  });

  it('conflict retourne 409', () => {
    const err = Errors.conflict();
    expect(err.statusCode).toBe(409);
  });
});
