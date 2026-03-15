"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = notFoundHandler;
exports.errorHandler = errorHandler;
const AppError_1 = require("../../../shared/errors/AppError");
function notFoundHandler(_req, res) {
    res.status(404).json({ message: 'Route introuvable.' });
}
function errorHandler(error, _req, res, _next) {
    if (error instanceof AppError_1.AppError) {
        if (error.details) {
            res.status(error.statusCode).json({ message: error.message, errors: error.details });
            return;
        }
        res.status(error.statusCode).json({ message: error.message });
        return;
    }
    if (typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        'message' in error &&
        typeof error.statusCode === 'number') {
        const e = error;
        res.status(e.statusCode).json({ message: e.message });
        return;
    }
    res.status(500).json({ message: 'Erreur interne du serveur.' });
}
