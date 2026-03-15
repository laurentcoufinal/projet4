import { describe, expect, it, vi } from 'vitest';
import { DownloadByTokenUseCase } from '../../../../../src/application/use-cases/share/DownloadByTokenUseCase';
import { AppError } from '../../../../../src/shared/errors/AppError';
import type { FileEntity } from '../../../../../src/domain/entities/File';
import type { ShareLink } from '../../../../../src/domain/entities/ShareLink';

function makeFile(): FileEntity {
  return {
    id: 'f1',
    ownerUserId: 'u1',
    name: 'doc.pdf',
    storageKey: 'sk',
    size: 3,
    mimeType: 'application/pdf',
    expiresAt: null,
    passwordHash: null,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function makeLink(expiresAt: Date): ShareLink {
  return {
    id: 'l1',
    fileId: 'f1',
    token: 'tok',
    expiresAt,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('DownloadByTokenUseCase', () => {
  it('lance notFound si token invalide', async () => {
    const fileRepo = { findShareLinkByToken: vi.fn().mockResolvedValue(null), findById: vi.fn() };
    const storage = { read: vi.fn() };
    const useCase = new DownloadByTokenUseCase(fileRepo as any, storage as any);

    await expect(useCase.execute('invalid')).rejects.toThrow(/Lien invalide/);
  });

  it('lance AppError 410 si lien expiré', async () => {
    const past = new Date(Date.now() - 86400000);
    const fileRepo = { findShareLinkByToken: vi.fn().mockResolvedValue(makeLink(past)), findById: vi.fn() };
    const storage = { read: vi.fn() };
    const useCase = new DownloadByTokenUseCase(fileRepo as any, storage as any);

    await expect(useCase.execute('tok')).rejects.toThrow(AppError);
    await expect(useCase.execute('tok')).rejects.toMatchObject({ statusCode: 410 });
  });

  it('retourne name, mimeType, data si lien valide', async () => {
    const future = new Date(Date.now() + 86400000);
    const fileRepo = {
      findShareLinkByToken: vi.fn().mockResolvedValue(makeLink(future)),
      findById: vi.fn().mockResolvedValue(makeFile()),
    };
    const buffer = Buffer.from('abc');
    const storage = { read: vi.fn().mockResolvedValue(buffer) };
    const useCase = new DownloadByTokenUseCase(fileRepo as any, storage as any);

    const result = await useCase.execute('tok');
    expect(result.name).toBe('doc.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.data).toEqual(buffer);
  });

  it('lance notFound si fichier ou storage absent', async () => {
    const future = new Date(Date.now() + 86400000);
    const fileRepo = {
      findShareLinkByToken: vi.fn().mockResolvedValue(makeLink(future)),
      findById: vi.fn().mockResolvedValue(null),
    };
    const storage = { read: vi.fn() };
    const useCase = new DownloadByTokenUseCase(fileRepo as any, storage as any);

    await expect(useCase.execute('tok')).rejects.toThrow(/Fichier introuvable/);
  });
});
