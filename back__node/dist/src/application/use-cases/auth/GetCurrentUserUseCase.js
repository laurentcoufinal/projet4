"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCurrentUserUseCase = void 0;
const errors_1 = require("../../../shared/errors/errors");
const AuthDtos_1 = require("../../dto/AuthDtos");
class GetCurrentUserUseCase {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async execute(userId) {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw errors_1.Errors.unauthorized();
        }
        return { user: (0, AuthDtos_1.toPublicUser)(user) };
    }
}
exports.GetCurrentUserUseCase = GetCurrentUserUseCase;
