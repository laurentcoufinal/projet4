import type { FileListItem } from '../../domain/ports/FileRepository';

export interface FileItemDto {
  id: string;
  name: string;
  size: number;
  mime_type: string;
  created_at: string;
  expires_at?: string;
  role: 'owner' | 'reader';
  tags: string[];
  requires_password: boolean;
  shared_with?: { user_id: string; email?: string; permission: 'read' }[];
  share_links?: { expires_at: string }[];
}

export function toFileListItemDto(item: FileListItem): FileItemDto {
  const dto: FileItemDto = {
    id: item.file.id,
    name: item.file.name,
    size: item.file.size,
    mime_type: item.file.mimeType,
    created_at: item.file.createdAt.toISOString(),
    role: item.role,
    tags: item.file.tags.map((t) => t.label),
    requires_password: item.file.passwordHash !== null,
  };

  if (item.file.expiresAt) {
    dto.expires_at = item.file.expiresAt.toISOString();
  }

  if (item.role === 'owner') {
    dto.shared_with = item.sharedWith.map((s) => ({
      user_id: s.userId,
      email: s.email,
      permission: s.permission,
    }));
    dto.share_links = item.shareLinks.map((l) => ({
      expires_at: l.expiresAt.toISOString(),
    }));
  }

  return dto;
}
