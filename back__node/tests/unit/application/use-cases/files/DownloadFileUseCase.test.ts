import { describe, expect, it, vi } from 'vitest';
import { DownloadFileUseCase } from '../../../../../src/application/use-cases/files/DownloadFileUseCase';
import { AppError } from '../../../../../src/shared/errors/AppError';
import type { FileEntity } from '../../../../../src/domain/entities/File';

function makeFile(overrides: Partial<FileEntity> = {}): FileEntity {
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
    ...overrides,
  };
}

describe('DownloadFileUseCase', () => {
  it('execute: lance notFound si fichier inexistant', async () => {
    const fileRepo = { findById: vi.fn().mockResolvedValue(null), listVisibleByUser: vi.fn() };
    const useCase = new DownloadFileUseCase(fileRepo as any, {} as any, {} as any);

    await expect(useCase.execute('f99', 'u1')).rejects.toThrow(/Fichier introuvable/);
  });

  it('execute: lance forbidden si pas d’accès', async () => {
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(makeFile()),
      listVisibleByUser: vi.fn().mockResolvedValue([]),
    };
    const useCase = new DownloadFileUseCase(fileRepo as any, {} as any, {} as any);

    await expect(useCase.execute('f1', 'u2')).rejects.toThrow(/Accès non autorisé/);
  });

  it('execute: lance AppError 403 si fichier protégé par mot de passe', async () => {
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(makeFile({ passwordHash: 'hash' })),
      listVisibleByUser: vi.fn().mockResolvedValue([{ file: makeFile({ passwordHash: 'hash' }) }]),
    };
    const storage = { read: vi.fn() };
    const useCase = new DownloadFileUseCase(fileRepo as any, storage as any, {} as any);

    await expect(useCase.execute('f1', 'u1')).rejects.toThrow(AppError);
    await expect(useCase.execute('f1', 'u1')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('execute: retourne name, mimeType, data si accès ok', async () => {
    const file = makeFile();
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(file),
      listVisibleByUser: vi.fn().mockResolvedValue([{ file }]),
    };
    const buffer = Buffer.from('abc');
    const storage = { read: vi.fn().mockResolvedValue(buffer) };
    const useCase = new DownloadFileUseCase(fileRepo as any, storage as any, {} as any);

    const result = await useCase.execute('f1', 'u1');
    expect(result.name).toBe('doc.pdf');
    expect(result.mimeType).toBe('application/pdf');
    expect(result.data).toEqual(buffer);
  });

  it('executeWithPassword: lance badRequest si fichier sans mot de passe', async () => {
    const file = makeFile();
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(file),
      listVisibleByUser: vi.fn().mockResolvedValue([{ file }]),
    };
    const useCase = new DownloadFileUseCase(fileRepo as any, {} as any, {} as any);

    await expect(useCase.executeWithPassword('f1', 'u1', 'any')).rejects.toThrow(/n'est pas protégé/);
  });

  it('executeWithPassword: lance unauthorized si mauvais mot de passe', async () => {
    const file = makeFile({ passwordHash: 'hash' });
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(file),
      listVisibleByUser: vi.fn().mockResolvedValue([{ file }]),
    };
    const hasher = { compare: vi.fn().mockResolvedValue(false) };
    const useCase = new DownloadFileUseCase(fileRepo as any, {} as any, hasher as any);

    await expect(useCase.executeWithPassword('f1', 'u1', 'wrong')).rejects.toThrow(/Mot de passe incorrect/);
  });

  it('executeWithPassword: retourne les données si bon mot de passe', async () => {
    const file = makeFile({ passwordHash: 'hash' });
    const fileRepo = {
      findById: vi.fn().mockResolvedValue(file),
      listVisibleByUser: vi.fn().mockResolvedValue([{ file }]),
    };
    const storage = { read: vi.fn().mockResolvedValue(Buffer.from('data')) };
    const hasher = { compare: vi.fn().mockResolvedValue(true) };
    const useCase = new DownloadFileUseCase(fileRepo as any, storage as any, hasher as any);

    const result = await useCase.executeWithPassword('f1', 'u1', 'correct');
    expect(result.data).toEqual(Buffer.from('data'));
  });
});
