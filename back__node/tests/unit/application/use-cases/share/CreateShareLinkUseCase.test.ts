import { describe, expect, it, vi } from 'vitest';
import { CreateShareLinkUseCase } from '../../../../../src/application/use-cases/share/CreateShareLinkUseCase';
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

describe('CreateShareLinkUseCase', () => {
  it('lance notFound si fichier inexistant', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(null), createShareLink: vi.fn(), setFileExpiresAtIfMissing: vi.fn() };
    const useCase = new CreateShareLinkUseCase(fileRepo as any);

    await expect(useCase.execute('f99', 'u1', 'http://localhost')).rejects.toThrow(/Fichier introuvable/);
  });

  it('lance forbidden si pas propriétaire', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile({ ownerUserId: 'u1' })), createShareLink: vi.fn(), setFileExpiresAtIfMissing: vi.fn() };
    const useCase = new CreateShareLinkUseCase(fileRepo as any);

    await expect(useCase.execute('f1', 'u2', 'http://localhost')).rejects.toThrow(/propriétaire/);
  });

  it('lance validation si expires_in_days hors 1-7', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(makeFile()), createShareLink: vi.fn(), setFileExpiresAtIfMissing: vi.fn() };
    const useCase = new CreateShareLinkUseCase(fileRepo as any);

    await expect(useCase.execute('f1', 'u1', 'http://localhost', 0)).rejects.toThrow(/1 et 7/);
    await expect(useCase.execute('f1', 'u1', 'http://localhost', 10)).rejects.toThrow(/1 et 7/);
  });

  it('crée un lien et retourne url, token, expires_at', async () => {
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(makeFile()),
      createShareLink: vi.fn().mockResolvedValue(undefined),
      setFileExpiresAtIfMissing: vi.fn().mockResolvedValue(undefined),
    };
    const useCase = new CreateShareLinkUseCase(fileRepo as any);

    const result = await useCase.execute('f1', 'u1', 'http://localhost/', 7);
    expect(result.message).toBe('Lien de partage créé.');
    expect(result.token).toHaveLength(64);
    expect(result.url).toMatch(/^http:\/\/localhost\/api\/v1\/s\/[a-f0-9]+$/);
    expect(result.expires_at).toBeDefined();
    expect(fileRepo.createShareLink).toHaveBeenCalled();
  });
});
