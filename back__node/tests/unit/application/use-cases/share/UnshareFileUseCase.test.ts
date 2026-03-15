import { describe, expect, it, vi } from 'vitest';
import { UnshareFileUseCase } from '../../../../../src/application/use-cases/share/UnshareFileUseCase';
import type { FileEntity } from '../../../../../src/domain/entities/File';

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

describe('UnshareFileUseCase', () => {
  it('lance notFound si fichier inexistant', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(null), deleteShare: vi.fn() };
    const useCase = new UnshareFileUseCase(fileRepo as any);

    await expect(useCase.execute('f99', 'u1', 'u2')).rejects.toThrow(/Fichier introuvable/);
  });

  it('lance forbidden si pas propriétaire', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), deleteShare: vi.fn() };
    const useCase = new UnshareFileUseCase(fileRepo as any);

    await expect(useCase.execute('f1', 'u2', 'u3')).rejects.toThrow(/propriétaire/);
  });

  it('lance notFound si aucun partage pour cet utilisateur', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), deleteShare: vi.fn().mockResolvedValue(false) };
    const useCase = new UnshareFileUseCase(fileRepo as any);

    await expect(useCase.execute('f1', 'u1', 'u2')).rejects.toThrow(/Aucun partage trouvé/);
  });

  it('révoque le partage et retourne message', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile('u1')), deleteShare: vi.fn().mockResolvedValue(true) };
    const useCase = new UnshareFileUseCase(fileRepo as any);

    const result = await useCase.execute('f1', 'u1', 'u2');
    expect(result.message).toBe('Partage révoqué.');
    expect(fileRepo.deleteShare).toHaveBeenCalledWith('f1', 'u2');
  });
});
