"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginUseCase = void 0;
const errors_1 = require("../../../shared/errors/errors");
const AuthDtos_1 = require("../../dto/AuthDtos");
class LoginUseCase {
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(input) {
        const user = await this.userRepository.findByEmail(input.email.toLowerCase());
        if (!user) {
            throw errors_1.Errors.validation('Identifiants invalides.', { email: ['auth.failed'] });
        }
        const ok = await this.passwordHasher.compare(input.password, user.passwordHash);
        if (!ok) {
            throw errors_1.Errors.validation('Identifiants invalides.', { email: ['auth.failed'] });
        }
        const token = this.tokenService.sign({ sub: user.id, email: user.email, name: user.name });
        return { user: (0, AuthDtos_1.toPublicUser)(user), token, token_type: 'Bearer' };
    }
}
exports.LoginUseCase = LoginUseCase;
