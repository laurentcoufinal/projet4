import { describe, expect, it } from 'vitest';
import { toPublicUser } from '../../../../src/application/dto/AuthDtos';
import type { User } from '../../../../src/domain/entities/User';

describe('AuthDtos', () => {
  describe('toPublicUser', () => {
    it('retourne id, name, email uniquement', () => {
      const user: User = {
        id: 'u1',
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: 'hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const out = toPublicUser(user);
      expect(out).toEqual({ id: 'u1', name: 'Alice', email: 'alice@example.com' });
      expect('passwordHash' in out).toBe(false);
    });
  });
});
