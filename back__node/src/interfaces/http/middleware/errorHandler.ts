import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../shared/errors/AppError';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route introuvable.' });
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    if (error.details) {
      res.status(error.statusCode).json({ message: error.message, errors: error.details });
      return;
    }
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error &&
    typeof (error as { statusCode: unknown }).statusCode === 'number'
  ) {
    const e = error as { statusCode: number; message: string };
    res.status(e.statusCode).json({ message: e.message });
    return;
  }

  res.status(500).json({ message: 'Erreur interne du serveur.' });
}
