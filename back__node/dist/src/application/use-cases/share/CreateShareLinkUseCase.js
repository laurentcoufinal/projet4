"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateShareLinkUseCase = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const domainPolicies_1 = require("../../../shared/constants/domainPolicies");
const errors_1 = require("../../../shared/errors/errors");
const fileRules_1 = require("../../../domain/services/fileRules");
class CreateShareLinkUseCase {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }
    async execute(fileId, ownerUserId, baseUrl, expiresInDays) {
        const file = await this.fileRepository.findById(fileId);
        if (!file)
            throw errors_1.Errors.notFound('Fichier introuvable.');
        if (file.ownerUserId !== ownerUserId) {
            throw errors_1.Errors.forbidden('Seul le propriétaire peut créer un lien de partage.');
        }
        const days = expiresInDays ?? domainPolicies_1.SHARE_LINK_DEFAULT_EXPIRES_IN_DAYS;
        (0, fileRules_1.assertShareLinkDays)(days);
        const token = node_crypto_1.default.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + days);
        await this.fileRepository.createShareLink(file.id, token, expiresAt);
        await this.fileRepository.setFileExpiresAtIfMissing(file.id, expiresAt);
        return {
            message: 'Lien de partage créé.',
            url: `${baseUrl.replace(/\/$/, '')}/api/v1/s/${token}`,
            token,
            expires_at: expiresAt.toISOString(),
        };
    }
}
exports.CreateShareLinkUseCase = CreateShareLinkUseCase;
