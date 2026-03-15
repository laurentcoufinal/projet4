import type { FileEntity } from '../entities/File';
import type { ShareLink } from '../entities/ShareLink';
import type { Tag } from '../entities/Tag';

export interface CreateFileInput {
  ownerUserId: string;
  name: string;
  storageKey: string;
  size: number;
  mimeType: string;
  passwordHash: string | null;
  expiresAt?: Date | null;
}

export interface FileListItem {
  file: FileEntity;
  role: 'owner' | 'reader';
  sharedWith: { userId: string; email?: string; permission: 'read' }[];
  shareLinks: ShareLink[];
}

export interface FileRepository {
  create(input: CreateFileInput): Promise<FileEntity>;
  findById(id: string): Promise<FileEntity | null>;
  listVisibleByUser(userId: string): Promise<FileListItem[]>;
  deleteById(id: string): Promise<void>;
  upsertTags(fileId: string, labels: string[]): Promise<Tag[]>;
  listTags(fileId: string): Promise<Tag[]>;
  createShare(fileId: string, userId: string): Promise<void>;
  hasShare(fileId: string, userId: string): Promise<boolean>;
  deleteShare(fileId: string, userId: string): Promise<boolean>;
  listShares(fileId: string): Promise<{ userId: string; permission: 'read'; email?: string }[]>;
  createShareLink(fileId: string, token: string, expiresAt: Date): Promise<ShareLink>;
  listActiveShareLinks(fileId: string, now: Date): Promise<ShareLink[]>;
  findShareLinkByToken(token: string): Promise<ShareLink | null>;
  setFileExpiresAtIfMissing(fileId: string, expiresAt: Date): Promise<void>;
}
