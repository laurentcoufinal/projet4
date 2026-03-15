"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteFileUseCase = void 0;
const errors_1 = require("../../../shared/errors/errors");
class DeleteFileUseCase {
    constructor(fileRepository, fileStorage) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
    }
    async execute(fileId, requesterUserId) {
        const file = await this.fileRepository.findById(fileId);
        if (!file) {
            throw errors_1.Errors.notFound('Fichier introuvable.');
        }
        if (file.ownerUserId !== requesterUserId) {
            throw errors_1.Errors.forbidden('Seul le propriétaire peut supprimer ce fichier.');
        }
        await this.fileStorage.delete(file.storageKey);
        await this.fileRepository.deleteById(file.id);
        return { message: 'Fichier supprimé.' };
    }
}
exports.DeleteFileUseCase = DeleteFileUseCase;
