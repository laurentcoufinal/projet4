"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareFileUseCase = void 0;
const errors_1 = require("../../../shared/errors/errors");
class ShareFileUseCase {
    constructor(fileRepository, userRepository) {
        this.fileRepository = fileRepository;
        this.userRepository = userRepository;
    }
    async execute(fileId, ownerUserId, target) {
        const file = await this.fileRepository.findById(fileId);
        if (!file)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        if (file.ownerUserId !== ownerUserId) {
            throw errors_1.Errors.forbidden('Seul le propriétaire peut partager ce fichier.');
        }
        const targetUser = target.userId
            ? await this.userRepository.findById(target.userId)
            : target.email
                ? await this.userRepository.findByEmail(target.email.toLowerCase())
                : null;
        if (!targetUser) {
            throw errors_1.Errors.validation('Utilisateur cible introuvable.');
        }
        if (targetUser.id === ownerUserId) {
            throw errors_1.Errors.validation('Vous ne pouvez pas vous partager un fichier à vous-même.');
        }
        const alreadyShared = await this.fileRepository.hasShare(file.id, targetUser.id);
        if (alreadyShared) {
            return {
                statusCode: 200,
                body: {
                    message: 'Le fichier est déjà partagé avec cet utilisateur.',
                    user_id: targetUser.id,
                    email: targetUser.email,
                },
            };
        }
        await this.fileRepository.createShare(file.id, targetUser.id);
        return {
            statusCode: 201,
            body: {
                message: 'Fichier partagé en lecture.',
                user_id: targetUser.id,
                email: targetUser.email,
            },
        };
    }
}
exports.ShareFileUseCase = ShareFileUseCase;
