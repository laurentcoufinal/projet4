"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterUserUseCase = void 0;
const fileRules_1 = require("../../../domain/services/fileRules");
const errors_1 = require("../../../shared/errors/errors");
const AuthDtos_1 = require("../../dto/AuthDtos");
class RegisterUserUseCase {
    constructor(userRepository, passwordHasher, tokenService) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
    }
    async execute(input) {
        const existing = await this.userRepository.findByEmail(input.email);
        if (existing) {
            throw errors_1.Errors.validation('Cet email est déjà utilisé.', { email: ['The email has already been taken.'] });
        }
        (0, fileRules_1.assertUserPassword)(input.password);
        const passwordHash = await this.passwordHasher.hash(input.password);
        const user = await this.userRepository.create({
            name: input.name,
            email: input.email.toLowerCase(),
            passwordHash,
        });
        const token = this.tokenService.sign({ sub: user.id, email: user.email, name: user.name });
        return { user: (0, AuthDtos_1.toPublicUser)(user), token, token_type: 'Bearer' };
    }
}
exports.RegisterUserUseCase = RegisterUserUseCase;
