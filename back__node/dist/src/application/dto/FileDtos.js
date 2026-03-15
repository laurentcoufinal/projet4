"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toFileListItemDto = toFileListItemDto;
function toFileListItemDto(item) {
    const dto = {
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
