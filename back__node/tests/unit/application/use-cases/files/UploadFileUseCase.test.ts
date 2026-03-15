import { describe, expect, it, vi } from 'vitest';
import { UploadFileUseCase } from '../../../../../src/application/use-cases/files/UploadFileUseCase';
import type { FileEntity } from '../../../../../src/domain/entities/File';
import type { Tag } from '../../../../../src/domain/entities/Tag';

function makeFile(overrides: Partial<FileEntity> = {}): FileEntity {
  return {
    id: 'f1',
    ownerUserId: 'u1',
    name: 'doc.pdf',
    storageKey: 'sk',
    size: 5,
    mimeType: 'application/pdf',
    expiresAt: null,
    passwordHash: null,
    tags: [],
    createdAt: new Date('2025-01-01T12:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z'),
    ...overrides,
  };
}

function makeTag(label: string): Tag {
  return {
    id: 't1',
    fileId: 'f1',
    label,
    normalizedLabel: label.toLowerCase(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

describe('UploadFileUseCase', () => {
  it('lance une erreur si taille > 1 Go', async () => {
    const fileRepo = { create: vi.fn(), upsertTags: vi.fn() };
    const storage = { put: vi.fn() };
    const useCase = new UploadFileUseCase(fileRepo as any, storage as any, {} as any);
    const huge = Buffer.alloc(1024 * 1024 * 1024 + 1);

    await expect(
      useCase.execute({
        ownerUserId: 'u1',
        originalName: 'x.pdf',
        mimeType: 'application/pdf',
        data: huge,
      })
    ).rejects.toThrow(/1 Go/);
    expect(storage.put).not.toHaveBeenCalled();
  });

  it('lance une erreur si extension interdite', async () => {
    const fileRepo = { create: vi.fn(), upsertTags: vi.fn() };
    const storage = { put: vi.fn() };
    const useCase = new UploadFileUseCase(fileRepo as any, storage as any, {} as any);

    await expect(
      useCase.execute({
        ownerUserId: 'u1',
        originalName: 'run.exe',
        mimeType: 'application/octet-stream',
        data: Buffer.from('x'),
      })
    ).rejects.toThrow(/Extension interdite/);
  });

  it('crée un fichier et retourne id, name, size, tags, created_at', async () => {
    const file = makeFile({ name: 'Mon doc' });
    const fileRepo = {
      create: vi.fn().mockResolvedValue(file),
      upsertTags: vi.fn().mockResolvedValue([makeTag('work')]),
    };
    const storage = { put: vi.fn().mockResolvedValue(undefined) };
    const hasher = { hash: vi.fn().mockResolvedValue('hash'), compare: vi.fn() };
    const useCase = new UploadFileUseCase(fileRepo as any, storage as any, hasher as any);

    const result = await useCase.execute({
      ownerUserId: 'u1',
      originalName: 'doc.pdf',
      customName: '  Mon doc  ',
      mimeType: 'application/pdf',
      data: Buffer.from('hello'),
      tags: ['work', '  WORK  '],
    });

    expect(result.id).toBe('f1');
    expect(result.name).toBe('Mon doc');
    expect(result.size).toBe(5);
    expect(result.tags).toEqual(['work']);
    expect(storage.put).toHaveBeenCalled();
    expect(fileRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerUserId: 'u1',
        name: 'Mon doc',
        size: 5,
        passwordHash: null,
      })
    );
  });

  it('hash le mot de passe fichier si fourni', async () => {
    const file = makeFile();
    const fileRepo = { create: vi.fn().mockResolvedValue(file), upsertTags: vi.fn().mockResolvedValue([]) };
    const storage = { put: vi.fn().mockResolvedValue(undefined) };
    const hasher = { hash: vi.fn().mockResolvedValue('fileHash'), compare: vi.fn() };
    const useCase = new UploadFileUseCase(fileRepo as any, storage as any, hasher as any);

    await useCase.execute({
      ownerUserId: 'u1',
      originalName: 'x.pdf',
      mimeType: 'application/pdf',
      data: Buffer.from('x'),
      password: 'secret12',
    });

    expect(hasher.hash).toHaveBeenCalledWith('secret12');
    expect(fileRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ passwordHash: 'fileHash' })
    );
  });
});
