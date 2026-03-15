import { describe, expect, it, vi } from 'vitest';
import { LoginUseCase } from '../../../../../src/application/use-cases/auth/LoginUseCase';
import type { User } from '../../../../../src/domain/entities/User';

describe('LoginUseCase', () => {
  it('lance une erreur si utilisateur inconnu', async () => {
    const userRepo = { findByEmail: vi.fn().mockResolvedValue(null), findById: vi.fn(), create: vi.fn() };
    const useCase = new LoginUseCase(userRepo as any, {} as any, {} as any);

    await expect(
      useCase.execute({ email: 'unknown@x.com', password: 'any' })
    ).rejects.toThrow(/Identifiants invalides/);
  });

  it('lance une erreur si mot de passe incorrect', async () => {
    const user: User = {
      id: 'u1',
      name: 'A',
      email: 'a@b.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userRepo = { findByEmail: vi.fn().mockResolvedValue(user), findById: vi.fn(), create: vi.fn() };
    const hasher = { hash: vi.fn(), compare: vi.fn().mockResolvedValue(false) };
    const useCase = new LoginUseCase(userRepo as any, hasher as any, {} as any);

    await expect(
      useCase.execute({ email: 'a@b.com', password: 'wrong' })
    ).rejects.toThrow(/Identifiants invalides/);
  });

  it('retourne token et user si credentials valides', async () => {
    const user: User = {
      id: 'u1',
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userRepo = { findByEmail: vi.fn().mockResolvedValue(user), findById: vi.fn(), create: vi.fn() };
    const hasher = { hash: vi.fn(), compare: vi.fn().mockResolvedValue(true) };
    const tokenService = { sign: vi.fn().mockReturnValue('jwt'), verify: vi.fn() };
    const useCase = new LoginUseCase(userRepo as any, hasher as any, tokenService as any);

    const result = await useCase.execute({ email: 'alice@example.com', password: 'secret' });

    expect(result.token).toBe('jwt');
    expect(result.user.id).toBe('u1');
    expect(userRepo.findByEmail).toHaveBeenCalledWith('alice@example.com');
  });
});
