import type { NextFunction, Response } from 'express';
import type { TokenService } from '../../../domain/ports/TokenService';
import { Errors } from '../../../shared/errors/errors';
import type { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export function authenticate(tokenService: TokenService) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return next(Errors.unauthorized('Token manquant.'));
    }

    const token = header.slice('Bearer '.length);
    try {
      const payload = tokenService.verify(token);
      req.auth = {
        userId: payload.sub,
        email: payload.email,
        name: payload.name,
      };
      next();
    } catch {
      next(Errors.unauthorized('Token invalide.'));
    }
  };
}
