import type { FileEntity } from '../../domain/entities/File';
import type { ShareLink } from '../../domain/entities/ShareLink';
import type { Tag } from '../../domain/entities/Tag';
import type { CreateFileInput, FileListItem, FileRepository } from '../../domain/ports/FileRepository';
import { FileModel } from '../db/schemas/FileModel';
import { FileShareModel } from '../db/schemas/FileShareModel';
import { ShareLinkModel } from '../db/schemas/ShareLinkModel';
import { TagModel } from '../db/schemas/TagModel';
import { UserModel } from '../db/schemas/UserModel';

function toTag(doc: any): Tag {
  return {
    id: doc._id.toString(),
    fileId: doc.fileId.toString(),
    label: doc.label,
    normalizedLabel: doc.normalizedLabel,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toFile(doc: any, tags: Tag[]): FileEntity {
  return {
    id: doc._id.toString(),
    ownerUserId: doc.ownerUserId.toString(),
    name: doc.name,
    storageKey: doc.storageKey,
    size: doc.size,
    mimeType: doc.mimeType,
    expiresAt: doc.expiresAt ?? null,
    passwordHash: doc.passwordHash ?? null,
    tags,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

function toShareLink(doc: any): ShareLink {
  return {
    id: doc._id.toString(),
    fileId: doc.fileId.toString(),
    token: doc.token,
    expiresAt: doc.expiresAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export class MongoFileRepository implements FileRepository {
  async create(input: CreateFileInput): Promise<FileEntity> {
    const doc = await FileModel.create(input);
    return toFile(doc, []);
  }

  async findById(id: string): Promise<FileEntity | null> {
    const file = await FileModel.findById(id).exec();
    if (!file) return null;
    const tags = await this.listTags(id);
    return toFile(file, tags);
  }

  async listVisibleByUser(userId: string): Promise<FileListItem[]> {
    const ownedDocs = await FileModel.find({ ownerUserId: userId }).sort({ createdAt: -1 }).exec();
    const sharedRefs = await FileShareModel.find({ userId }).exec();
    const sharedFileIds = sharedRefs.map((s) => s.fileId);
    const sharedDocs = await FileModel.find({ _id: { $in: sharedFileIds } }).sort({ createdAt: -1 }).exec();

    const owned = await Promise.all(
      ownedDocs.map(async (doc): Promise<FileListItem> => {
        const fileId = doc._id.toString();
        const [tags, shares, links] = await Promise.all([
          this.listTags(fileId),
          this.listShares(fileId),
          this.listActiveShareLinks(fileId, new Date()),
        ]);
        return {
          file: toFile(doc, tags),
          role: 'owner',
          sharedWith: shares,
          shareLinks: links,
        };
      })
    );

    const shared = await Promise.all(
      sharedDocs.map(async (doc): Promise<FileListItem> => {
        const tags = await this.listTags(doc._id.toString());
        return {
          file: toFile(doc, tags),
          role: 'reader',
          sharedWith: [],
          shareLinks: [],
        };
      })
    );

    return [...owned, ...shared].sort(
      (a, b) => b.file.createdAt.getTime() - a.file.createdAt.getTime()
    );
  }

  async deleteById(id: string): Promise<void> {
    await Promise.all([
      FileModel.findByIdAndDelete(id).exec(),
      TagModel.deleteMany({ fileId: id }).exec(),
      ShareLinkModel.deleteMany({ fileId: id }).exec(),
      FileShareModel.deleteMany({ fileId: id }).exec(),
    ]);
  }

  async upsertTags(fileId: string, labels: string[]): Promise<Tag[]> {
    await TagModel.deleteMany({ fileId }).exec();
    if (labels.length > 0) {
      await TagModel.insertMany(
        labels.map((label) => ({
          fileId,
          label,
          normalizedLabel: label.toLowerCase(),
        }))
      );
    }
    return this.listTags(fileId);
  }

  async listTags(fileId: string): Promise<Tag[]> {
    const tags = await TagModel.find({ fileId }).sort({ createdAt: 1 }).exec();
    return tags.map(toTag);
  }

  async createShare(fileId: string, userId: string): Promise<void> {
    await FileShareModel.create({ fileId, userId, permission: 'read' });
  }

  async hasShare(fileId: string, userId: string): Promise<boolean> {
    const share = await FileShareModel.findOne({ fileId, userId }).exec();
    return Boolean(share);
  }

  async deleteShare(fileId: string, userId: string): Promise<boolean> {
    const deleted = await FileShareModel.deleteOne({ fileId, userId }).exec();
    return deleted.deletedCount > 0;
  }

  async listShares(fileId: string): Promise<{ userId: string; permission: 'read'; email?: string }[]> {
    const shares = await FileShareModel.find({ fileId }).exec();
    const users = await UserModel.find({ _id: { $in: shares.map((s) => s.userId) } }).exec();
    const emailMap = new Map(users.map((u) => [u._id.toString(), u.email]));
    return shares.map((share) => ({
      userId: share.userId.toString(),
      permission: 'read',
      email: emailMap.get(share.userId.toString()),
    }));
  }

  async createShareLink(fileId: string, token: string, expiresAt: Date): Promise<ShareLink> {
    const link = await ShareLinkModel.create({ fileId, token, expiresAt });
    return toShareLink(link);
  }

  async listActiveShareLinks(fileId: string, now: Date): Promise<ShareLink[]> {
    const links = await ShareLinkModel.find({ fileId, expiresAt: { $gt: now } }).exec();
    return links.map(toShareLink);
  }

  async findShareLinkByToken(token: string): Promise<ShareLink | null> {
    const link = await ShareLinkModel.findOne({ token }).exec();
    return link ? toShareLink(link) : null;
  }

  async setFileExpiresAtIfMissing(fileId: string, expiresAt: Date): Promise<void> {
    await FileModel.updateOne(
      { _id: fileId, $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }] },
      { $set: { expiresAt } }
    ).exec();
  }
}
