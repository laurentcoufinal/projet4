"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListFilesUseCase = void 0;
const FileDtos_1 = require("../../dto/FileDtos");
class ListFilesUseCase {
    constructor(fileRepository) {
        this.fileRepository = fileRepository;
    }
    async execute(userId) {
        const items = await this.fileRepository.listVisibleByUser(userId);
        return { data: items.map(FileDtos_1.toFileListItemDto) };
    }
}
exports.ListFilesUseCase = ListFilesUseCase;
