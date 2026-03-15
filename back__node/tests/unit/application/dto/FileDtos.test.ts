import { describe, expect, it } from 'vitest';
import { toFileListItemDto } from '../../../../src/application/dto/FileDtos';
import type { FileEntity } from '../../../../src/domain/entities/File';
import type { Tag } from '../../../../src/domain/entities/Tag';
import type { FileListItem } from '../../../../src/domain/ports/FileRepository';

function makeFile(overrides: Partial<FileEntity> = {}): FileEntity {
  return {
    id: 'f1',
    ownerUserId: 'u1',
    name: 'doc.pdf',
    storageKey: 'key',
    size: 100,
    mimeType: 'application/pdf',
    expiresAt: null,
    passwordHash: null,
    tags: [],
    createdAt: new Date('2025-01-01T12:00:00Z'),
    updatedAt: new Date('2025-01-01T12:00:00Z'),
    ...overrides,
  };
}

function makeTag(overrides: Partial<Tag> = {}): Tag {
  return {
    id: 't1',
    fileId: 'f1',
    label: 'work',
    normalizedLabel: 'work',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('FileDtos', () => {
  describe('toFileListItemDto', () => {
    it('mappe un item reader sans expires_at ni shared_with', () => {
      const item: FileListItem = {
        file: makeFile(),
        role: 'reader',
        sharedWith: [],
        shareLinks: [],
      };
      const dto = toFileListItemDto(item);
      expect(dto.id).toBe('f1');
      expect(dto.name).toBe('doc.pdf');
      expect(dto.role).toBe('reader');
      expect(dto.requires_password).toBe(false);
      expect(dto.expires_at).toBeUndefined();
      expect(dto.shared_with).toBeUndefined();
      expect(dto.share_links).toBeUndefined();
    });

    it('mappe un item owner avec expires_at, shared_with, share_links', () => {
      const item: FileListItem = {
        file: makeFile({
          expiresAt: new Date('2025-01-08T12:00:00Z'),
          tags: [makeTag()],
          passwordHash: 'hash',
        }),
        role: 'owner',
        sharedWith: [{ userId: 'u2', email: 'u2@x.com', permission: 'read' }],
        shareLinks: [
          {
            id: 'l1',
            fileId: 'f1',
            token: 'tok',
            expiresAt: new Date('2025-01-08T12:00:00Z'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };
      const dto = toFileListItemDto(item);
      expect(dto.role).toBe('owner');
      expect(dto.requires_password).toBe(true);
      expect(dto.expires_at).toBe('2025-01-08T12:00:00.000Z');
      expect(dto.shared_with).toHaveLength(1);
      expect(dto.shared_with![0].user_id).toBe('u2');
      expect(dto.share_links).toHaveLength(1);
      expect(dto.tags).toEqual(['work']);
    });
  });
});
