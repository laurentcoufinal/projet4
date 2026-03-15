import { describe, expect, it, vi } from 'vitest';
import { ShareFileUseCase } from '../../../../../src/application/use-cases/share/ShareFileUseCase';
import type { User } from '../../../../../src/domain/entities/User';
import type { FileEntity } from '../../../../../src/domain/entities/File';

function makeUser(id: string, email: string): User {
  return {
    id,
    name: 'U',
    email,
    passwordHash: 'h',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeFile(ownerId: string): FileEntity {
  return {
    id: 'f1',
    ownerUserId: ownerId,
    name: 'x',
    storageKey: 'sk',
    size: 0,
    mimeType: 'application/octet-stream',
    expiresAt: null,
    passwordHash: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('ShareFileUseCase', () => {
  it('lance notFound si fichier inexistant', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(null), hasShare: vi.fn(), createShare: vi.fn() };
    const userRepo = { findById: vi.fn(), findByEmail: vi.fn(), create: vi.fn() };
    const useCase = new ShareFileUseCase(fileRepo as any, userRepo as any);

    await expect(useCase.execute('f99', 'u1', { userId: 'u2' })).rejects.toThrow(/Fichier introuvable/);
  });

  it('lance forbidden si pas propriétaire', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), hasShare: vi.fn(), createShare: vi.fn() };
    const useCase = new ShareFileUseCase(fileRepo as any, {} as any);

    await expect(useCase.execute('f1', 'u2', { userId: 'u3' })).rejects.toThrow(/propriétaire/);
  });

  it('lance validation si partage avec soi-même', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), hasShare: vi.fn(), createShare: vi.fn() };
    const userRepo = { findById: vi.fn().mockResolvedValue(makeUser('u1', 'a@b.com')), findByEmail: vi.fn(), create: vi.fn() };
    const useCase = new ShareFileUseCase(fileRepo as any, userRepo as any);

    await expect(useCase.execute('f1', 'u1', { userId: 'u1' })).rejects.toThrow(/vous-même/);
  });

  it('retourne 200 si déjà partagé', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), hasShare: vi.fn().mockResolvedValue(true), createShare: vi.fn() };
    const target = makeUser('u2', 'u2@x.com');
    const userRepo = { findById: vi.fn().mockResolvedValue(target), findByEmail: vi.fn(), create: vi.fn() };
    const useCase = new ShareFileUseCase(fileRepo as any, userRepo as any);

    const result = await useCase.execute('f1', 'u1', { userId: 'u2' });
    expect(result.statusCode).toBe(200);
    expect(result.body.message).toContain('déjà partagé');
    expect(fileRepo.createShare).not.toHaveBeenCalled();
  });

  it('crée le partage et retourne 201', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), hasShare: vi.fn().mockResolvedValue(false), createShare: vi.fn().mockResolvedValue(undefined) };
    const target = makeUser('u2', 'u2@x.com');
    const userRepo = { findById: vi.fn().mockResolvedValue(target), findByEmail: vi.fn().mockResolvedValue(target), create: vi.fn() };
    const useCase = new ShareFileUseCase(fileRepo as any, userRepo as any);

    const result = await useCase.execute('f1', 'u1', { email: 'u2@x.com' });
    expect(result.statusCode).toBe(201);
    expect(result.body.message).toContain('partagé en lecture');
    expect(fileRepo.createShare).toHaveBeenCalledWith('f1', 'u2');
  });
});
