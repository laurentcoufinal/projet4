import type { PasswordHasher } from '../../../domain/ports/PasswordHasher';
import type { TokenService } from '../../../domain/ports/TokenService';
import type { UserRepository } from '../../../domain/ports/UserRepository';
import { Errors } from '../../../shared/errors/errors';
import type { AuthResponseDto } from '../../dto/AuthDtos';
import { toPublicUser } from '../../dto/AuthDtos';

export interface LoginInput {
  email: string;
  password: string;
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService
  ) {}

  async execute(input: LoginInput): Promise<AuthResponseDto> {
    const user = await this.userRepository.findByEmail(input.email.toLowerCase());
    if (!user) {
      throw Errors.validation('Identifiants invalides.', { email: ['auth.failed'] });
    }

    const ok = await this.passwordHasher.compare(input.password, user.passwordHash);
    if (!ok) {
      throw Errors.validation('Identifiants invalides.', { email: ['auth.failed'] });
    }

    const token = this.tokenService.sign({ sub: user.id, email: user.email, name: user.name });
    return { user: toPublicUser(user), token, token_type: 'Bearer' };
  }
}
