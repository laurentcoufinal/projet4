import { describe, expect, it, vi } from 'vitest';
import { errorHandler, notFoundHandler } from '../../../../../src/interfaces/http/middleware/errorHandler';
import { AppError } from '../../../../../src/shared/errors/AppError';

describe('errorHandler', () => {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
  };
  const next = vi.fn();

  it('envoie statusCode et message pour AppError', () => {
    errorHandler(new AppError('TEST', 'Message', 400), {} as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Message' });
  });

  it('envoie errors en plus si AppError a details', () => {
    errorHandler(
      new AppError('V', 'Validation', 422, { email: ['taken'] }),
      {} as any,
      res as any,
      next
    );
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ message: 'Validation', errors: { email: ['taken'] } });
  });

  it('gère un objet erreur avec statusCode et message', () => {
    errorHandler(
      { statusCode: 410, message: 'Lien expiré' },
      {} as any,
      res as any,
      next
    );
    expect(res.status).toHaveBeenCalledWith(410);
    expect(res.json).toHaveBeenCalledWith({ message: 'Lien expiré' });
  });

  it('retourne 500 pour erreur inconnue', () => {
    errorHandler(new Error('Unexpected'), {} as any, res as any, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: 'Erreur interne du serveur.' });
  });
});

describe('notFoundHandler', () => {
  it('retourne 404 avec message', () => {
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    notFoundHandler({} as any, res as any);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Route introuvable.' });
  });
});
