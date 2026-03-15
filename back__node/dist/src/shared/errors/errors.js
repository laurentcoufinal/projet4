"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errors = void 0;
const AppError_1 = require("./AppError");
exports.Errors = {
    unauthorized: (message = 'Non authentifié.') => new AppError_1.AppError('UNAUTHORIZED', message, 401),
    forbidden: (message = 'Accès non autorisé.') => new AppError_1.AppError('FORBIDDEN', message, 403),
    notFound: (message = 'Ressource introuvable.') => new AppError_1.AppError('NOT_FOUND', message, 404),
    conflict: (message = 'Conflit métier.') => new AppError_1.AppError('CONFLICT', message, 409),
    badRequest: (message = 'Requête invalide.') => new AppError_1.AppError('BAD_REQUEST', message, 400),
    validation: (message = 'Erreur de validation.', details) => new AppError_1.AppError('VALIDATION_ERROR', message, 422, details),
};
