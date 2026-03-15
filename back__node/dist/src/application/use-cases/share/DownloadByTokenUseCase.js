"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DownloadByTokenUseCase = void 0;
const AppError_1 = require("../../../shared/errors/AppError");
const errors_1 = require("../../../shared/errors/errors");
class DownloadByTokenUseCase {
    constructor(fileRepository, fileStorage) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
    }
    async execute(token) {
        const link = await this.fileRepository.findShareLinkByToken(token);
        if (!link)
            throw errors_1.Errors.notFound('Lien invalide.');
        if (link.expiresAt.getTime() < Date.now()) {
            throw new AppError_1.AppError('LINK_EXPIRED', 'Ce lien a expiré.', 410);
        }
        const file = await this.fileRepository.findById(link.fileId);
        if (!file)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        const data = await this.fileStorage.read(file.storageKey);
        if (!data)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        return { name: file.name, mimeType: file.mimeType, data };
    }
}
exports.DownloadByTokenUseCase = DownloadByTokenUseCase;
