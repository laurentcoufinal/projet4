import { AppError } from './AppError';

export const Errors = {
  unauthorized: (message = 'Non authentifié.') => new AppError('UNAUTHORIZED', message, 401),
  forbidden: (message = 'Accès non autorisé.') => new AppError('FORBIDDEN', message, 403),
  notFound: (message = 'Ressource introuvable.') => new AppError('NOT_FOUND', message, 404),
  conflict: (message = 'Conflit métier.') => new AppError('CONFLICT', message, 409),
  badRequest: (message = 'Requête invalide.') => new AppError('BAD_REQUEST', message, 400),
  validation: (message = 'Erreur de validation.', details?: unknown) =>
    new AppError('VALIDATION_ERROR', message, 422, details),
};
