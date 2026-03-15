import { describe, expect, it, vi } from 'vitest';
import { GetCurrentUserUseCase } from '../../../../../src/application/use-cases/auth/GetCurrentUserUseCase';
import type { User } from '../../../../../src/domain/entities/User';

describe('GetCurrentUserUseCase', () => {
  it('lance une erreur si utilisateur introuvable', async () => {
    const userRepo = { findByEmail: vi.fn(), findById: vi.fn().mockResolvedValue(null), create: vi.fn() };
    const useCase = new GetCurrentUserUseCase(userRepo as any);

    await expect(useCase.execute('unknown-id')).rejects.toThrow(/Non authentifié/);
  });

  it('retourne user public si trouvé', async () => {
    const user: User = {
      id: 'u1',
      name: 'Alice',
      email: 'a@b.com',
      passwordHash: 'h',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userRepo = { findByEmail: vi.fn(), findById: vi.fn().mockResolvedValue(user), create: vi.fn() };
    const useCase = new GetCurrentUserUseCase(userRepo as any);

    const result = await useCase.execute('u1');
    expect(result.user).toEqual({ id: 'u1', name: 'Alice', email: 'a@b.com' });
  });
});
