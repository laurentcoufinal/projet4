import type { Tag } from './Tag';

export interface FileEntity {
  id: string;
  ownerUserId: string;
  name: string;
  storageKey: string;
  size: number;
  mimeType: string;
  expiresAt: Date | null;
  passwordHash: string | null;
  tags: Tag[];
  createdAt: Date;
  updatedAt: Date;
}
