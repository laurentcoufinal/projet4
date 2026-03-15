import type { User } from '../../../domain/entities/User';
import type { UserRepository } from '../../../domain/ports/UserRepository';
import { Errors } from '../../../shared/errors/errors';
import { toPublicUser } from '../../dto/AuthDtos';

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(userId: string): Promise<{ user: Pick<User, 'id' | 'name' | 'email'> }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw Errors.unauthorized();
    }

    return { user: toPublicUser(user) };
  }
}
