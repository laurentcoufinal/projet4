import type { User } from '../../domain/entities/User';

export interface AuthResponseDto {
  user: Pick<User, 'id' | 'name' | 'email'>;
  token: string;
  token_type: 'Bearer';
}

export function toPublicUser(user: User): Pick<User, 'id' | 'name' | 'email'> {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
