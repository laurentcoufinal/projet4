"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadFileUseCase = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const fileRules_1 = require("../../../domain/services/fileRules");
class UploadFileUseCase {
    constructor(fileRepository, fileStorage, passwordHasher) {
        this.fileRepository = fileRepository;
        this.fileStorage = fileStorage;
        this.passwordHasher = passwordHasher;
    }
    async execute(input) {
        (0, fileRules_1.assertFileSize)(input.data.length);
        (0, fileRules_1.assertAllowedExtension)(input.originalName);
        let passwordHash = null;
        if (input.password) {
            (0, fileRules_1.assertFilePassword)(input.password);
            passwordHash = await this.passwordHasher.hash(input.password);
        }
        const storageKey = node_crypto_1.default.randomUUID();
        await this.fileStorage.put(storageKey, input.data);
        const file = await this.fileRepository.create({
            ownerUserId: input.ownerUserId,
            name: input.customName?.trim() || input.originalName,
            storageKey,
            size: input.data.length,
            mimeType: input.mimeType || 'application/octet-stream',
            passwordHash,
            expiresAt: null,
        });
        const uniqueTags = Array.from(new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean).map(fileRules_1.normalizeTagLabel)));
        const savedTags = await this.fileRepository.upsertTags(file.id, uniqueTags);
        return {
            id: file.id,
            name: file.name,
            size: file.size,
            mime_type: file.mimeType,
            tags: savedTags.map((t) => t.label),
            created_at: file.createdAt.toISOString(),
        };
    }
}
exports.UploadFileUseCase = UploadFileUseCase;
