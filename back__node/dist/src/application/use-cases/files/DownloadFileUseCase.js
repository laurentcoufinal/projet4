"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadFileUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const errors_1 = require("../../../shared/errors/errors");
class DownloadFileUseCase {
    constructor(fileRepository, fileStorage, passwordHasher) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
        this.passwordHasher = passwordHasher;
    }
    async canAccess(fileId, userId) {
        const list = await this.fileRepository.listVisibleByUser(userId);
        return list.some((item) => item.file.id === fileId);
    }
    async execute(fileId, requesterUserId) {
        const file = await this.fileRepository.findById(fileId);
        if (!file)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        if (!(await this.canAccess(file.id, requesterUserId))) {
            throw errors_1.Errors.forbidden('Accès non autorisé.');
        }
        if (file.passwordHash) {
            throw new AppError_1.AppError('FILE_PASSWORD_REQUIRED', 'Ce fichier est protégé par mot de passe.', 403);
        }
        const data = await this.fileStorage.read(file.storageKey);
        if (!data)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        return { name: file.name, mimeType: file.mimeType, data };
    }
    async executeWithPassword(fileId, requesterUserId, password) {
        const file = await this.fileRepository.findById(fileId);
        if (!file)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        if (!(await this.canAccess(file.id, requesterUserId))) {
            throw errors_1.Errors.forbidden('Accès non autorisé.');
        }
        if (!file.passwordHash) {
            throw errors_1.Errors.badRequest("Ce fichier n'est pas protégé par mot de passe.");
        }
        const ok = await this.passwordHasher.compare(password, file.passwordHash);
        if (!ok) {
            throw errors_1.Errors.unauthorized('Mot de passe incorrect.');
        }
        const data = await this.fileStorage.read(file.storageKey);
        if (!data)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        return { name: file.name, mimeType: file.mimeType, data };
    }
}
exports.DownloadFileUseCase = DownloadFileUseCase;
