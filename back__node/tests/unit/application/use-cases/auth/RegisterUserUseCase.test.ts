import { describe, expect, it, vi } from 'vitest';
import { RegisterUserUseCase } from '../../../../../src/application/use-cases/auth/RegisterUserUseCase';
import type { User } from '../../../../../src/domain/entities/User';

describe('RegisterUserUseCase', () => {
  it('lance une erreur si email déjà utilisé', async () => {
    const user: User = {
      id: 'u1',
      name: 'A',
      email: 'a@b.com',
      passwordHash: 'h',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userRepo = {
      findByEmail: vi.fn().mockResolvedValue(user),
      findById: vi.fn(),
      create: vi.fn(),
    };
    const hasher = { hash: vi.fn(), compare: vi.fn() };
    const tokenService = { sign: vi.fn(), verify: vi.fn() };
    const useCase = new RegisterUserUseCase(userRepo as any, hasher as any, tokenService as any);

    await expect(
      useCase.execute({ name: 'B', email: 'a@b.com', password: 'password123' })
    ).rejects.toThrow(/déjà utilisé/);
    expect(userRepo.create).not.toHaveBeenCalled();
  });

  it('lance une erreur si mot de passe trop court', async () => {
    const userRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn(),
    };
    const useCase = new RegisterUserUseCase(userRepo as any, {} as any, {} as any);

    await expect(
      useCase.execute({ name: 'A', email: 'a@b.com', password: 'short' })
    ).rejects.toThrow(/8 caractères/);
  });

  it('crée un utilisateur et retourne token + user', async () => {
    const createdUser: User = {
      id: 'u2',
      name: 'Alice',
      email: 'alice@example.com',
      passwordHash: 'hashed',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const userRepo = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findById: vi.fn(),
      create: vi.fn().mockResolvedValue(createdUser),
    };
    const hasher = { hash: vi.fn().mockResolvedValue('hashed'), compare: vi.fn() };
    const tokenService = { sign: vi.fn().mockReturnValue('jwt-token'), verify: vi.fn() };
    const useCase = new RegisterUserUseCase(userRepo as any, hasher as any, tokenService as any);

    const result = await useCase.execute({
      name: 'Alice',
      email: 'Alice@Example.com',
      password: 'password123',
    });

    expect(result.token).toBe('jwt-token');
    expect(result.user.email).toBe('alice@example.com');
    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Alice', email: 'alice@example.com', passwordHash: 'hashed' })
    );
  });
});
