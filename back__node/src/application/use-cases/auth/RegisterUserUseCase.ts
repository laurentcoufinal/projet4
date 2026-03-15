import type { PasswordHasher } from '../../../domain/ports/PasswordHasher';
import type { TokenService } from '../../../domain/ports/TokenService';
import type { UserRepository } from '../../../domain/ports/UserRepository';
import { assertUserPassword } from '../../../domain/services/fileRules';
import { Errors } from '../../../shared/errors/errors';
import type { AuthResponseDto } from '../../dto/AuthDtos';
import { toPublicUser } from '../../dto/AuthDtos';

export interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: RegisterUserInput): Promise<AuthResponseDto> {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw Errors.validation('Cet email est déjà utilisé.', { email: ['The email has already been taken.'] });
    }

    assertUserPassword(input.password);
    const passwordHash = await this.passwordHasher.hash(input.password);
    const user = await this.userRepository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
    });

    const token = this.tokenService.sign({ sub: user.id, email: user.email, name: user.name });
    return { user: toPublicUser(user), token, token_type: 'Bearer' };
  }
}
