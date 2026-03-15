"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnshareFileUseCase = void 0;
const errors_1 = require("../../../shared/errors/errors");
class UnshareFileUseCase {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }
    async execute(fileId, ownerUserId, targetUserId) {
        const file = await this.fileRepository.findById(fileId);
        if (!file)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        if (file.ownerUserId !== ownerUserId) {
            throw errors_1.Errors.forbidden('Seul le propriétaire peut révoquer un partage.');
        }
        const deleted = await this.fileRepository.deleteShare(file.id, targetUserId);
        if (!deleted) {
            throw errors_1.Errors.notFound('Aucun partage trouvé pour cet utilisateur.');
        }
        return { message: 'Partage révoqué.' };
    }
}
exports.UnshareFileUseCase = UnshareFileUseCase;
