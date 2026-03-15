import { describe, expect, it } from 'vitest';
import { AppError } from '../../../src/shared/errors/AppError';

describe('AppError', () => {
  it('crée une erreur avec code, message, statusCode', () => {
    const err = new AppError('TEST', 'Message', 400);
    expect(err.message).toBe('Message');
    expect(err.code).toBe('TEST');
    expect(err.statusCode).toBe(400);
    expect(err.name).toBe('AppError');
  });

  it('accepte details optionnel', () => {
    const err = new AppError('V', 'Msg', 422, { field: ['error'] });
    expect(err.details).toEqual({ field: ['error'] });
  });
});
