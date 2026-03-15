import { describe, expect, it, vi } from 'vitest';
import { DeleteFileUseCase } from '../../../../../src/application/use-cases/files/DeleteFileUseCase';
import type { FileEntity } from '../../../../../src/domain/entities/File';

function makeFile(overrides: Partial<FileEntity> = {}): FileEntity {
  return {
    id: 'f1',
    ownerUserId: 'u1',
    name: 'x',
    storageKey: 'sk',
    size: 0,
    mimeType: 'application/octet-stream',
    expiresAt: null,
    passwordHash: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('DeleteFileUseCase', () => {
  it('lance notFound si fichier inexistant', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(null), deleteById: vi.fn() };
    const storage = { delete: vi.fn() };
    const useCase = new DeleteFileUseCase(fileRepo as any, storage as any);

    await expect(useCase.execute('f99', 'u1')).rejects.toThrow(/Fichier introuvable/);
    expect(storage.delete).not.toHaveBeenCalled();
  });

  it('lance forbidden si pas propriétaire', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile({ ownerUserId: 'u1' })), deleteById: vi.fn() };
    const storage = { delete: vi.fn() };
    const useCase = new DeleteFileUseCase(fileRepo as any, storage as any);

    await expect(useCase.execute('f1', 'u2')).rejects.toThrow(/propriétaire/);
  });

  it('supprime le fichier et retourne message', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile()), deleteById: vi.fn().mockResolvedValue(undefined) };
    const storage = { delete: vi.fn().mockResolvedValue(undefined) };
    const useCase = new DeleteFileUseCase(fileRepo as any, storage as any);

    const result = await useCase.execute('f1', 'u1');
    expect(result.message).toBe('Fichier supprimé.');
    expect(storage.delete).toHaveBeenCalledWith('sk');
    expect(fileRepo.deleteById).toHaveBeenCalledWith('f1');
  });
});
