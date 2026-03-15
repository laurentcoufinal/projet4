import crypto from 'node:crypto';
import type { FileRepository } from '../../../domain/ports/FileRepository';
import type { FileStorage } from '../../../domain/ports/FileStorage';
import type { PasswordHasher } from '../../../domain/ports/PasswordHasher';
import {
  assertAllowedExtension,
  assertFilePassword,
  assertFileSize,
  normalizeTagLabel,
} from '../../../domain/services/fileRules';

export interface UploadFileInput {
  ownerUserId: string;
  originalName: string;
  customName?: string;
  mimeType: string;
  data: Buffer;
  tags?: string[];
  password?: string;
}

export class UploadFileUseCase {
  constructor(
    private readonly fileRepository: FileRepository,
    private readonly fileStorage: FileStorage,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: UploadFileInput): Promise<{
    id: string;
    name: string;
    size: number;
    mime_type: string;
    tags: string[];
    created_at: string;
  }> {
    assertFileSize(input.data.length);
    assertAllowedExtension(input.originalName);

    let passwordHash: string | null = null;
    if (input.password) {
      assertFilePassword(input.password);
      passwordHash = await this.passwordHasher.hash(input.password);
    }

    const storageKey = crypto.randomUUID();
    await this.fileStorage.put(storageKey, input.data);

    const file = await this.fileRepository.create({
      ownerUserId: input.ownerUserId,
      name: input.customName?.trim() || input.originalName,
      storageKey,
      size: input.data.length,
      mimeType: input.mimeType || 'application/octet-stream',
      passwordHash,
      expiresAt: null,
    });

    const uniqueTags = Array.from(
      new Set((input.tags ?? []).map((tag) => tag.trim()).filter(Boolean).map(normalizeTagLabel))
    );
    const savedTags = await this.fileRepository.upsertTags(file.id, uniqueTags);

    return {
      id: file.id,
      name: file.name,
      size: file.size,
      mime_type: file.mimeType,
      tags: savedTags.map((t) => t.label),
      created_at: file.createdAt.toISOString(),
    };
  }
}
