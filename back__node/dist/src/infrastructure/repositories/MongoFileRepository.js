"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoFileRepository = void 0;
const FileModel_1 = require("../db/schemas/FileModel");
const FileShareModel_1 = require("../db/schemas/FileShareModel");
const ShareLinkModel_1 = require("../db/schemas/ShareLinkModel");
const TagModel_1 = require("../db/schemas/TagModel");
const UserModel_1 = require("../db/schemas/UserModel");
function toTag(doc) {
    return {
        id: doc._id.toString(),
        fileId: doc.fileId.toString(),
        label: doc.label,
        normalizedLabel: doc.normalizedLabel,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
function toFile(doc, tags) {
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
function toShareLink(doc) {
    return {
        id: doc._id.toString(),
        fileId: doc.fileId.toString(),
        token: doc.token,
        expiresAt: doc.expiresAt,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}
class MongoFileRepository {
    async create(input) {
        const doc = await FileModel_1.FileModel.create(input);
        return toFile(doc, []);
    }
    async findById(id) {
        const file = await FileModel_1.FileModel.findById(id).exec();
        if (!file)
            return null;
        const tags = await this.listTags(id);
        return toFile(file, tags);
    }
    async listVisibleByUser(userId) {
        const ownedDocs = await FileModel_1.FileModel.find({ ownerUserId: userId }).sort({ createdAt: -1 }).exec();
        const sharedRefs = await FileShareModel_1.FileShareModel.find({ userId }).exec();
        const sharedFileIds = sharedRefs.map((s) => s.fileId);
        const sharedDocs = await FileModel_1.FileModel.find({ _id: { $in: sharedFileIds } }).sort({ createdAt: -1 }).exec();
        const owned = await Promise.all(ownedDocs.map(async (doc) => {
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
        }));
        const shared = await Promise.all(sharedDocs.map(async (doc) => {
            const tags = await this.listTags(doc._id.toString());
            return {
                file: toFile(doc, tags),
                role: 'reader',
                sharedWith: [],
                shareLinks: [],
            };
        }));
        return [...owned, ...shared].sort((a, b) => b.file.createdAt.getTime() - a.file.createdAt.getTime());
    }
    async deleteById(id) {
        await Promise.all([
            FileModel_1.FileModel.findByIdAndDelete(id).exec(),
            TagModel_1.TagModel.deleteMany({ fileId: id }).exec(),
            ShareLinkModel_1.ShareLinkModel.deleteMany({ fileId: id }).exec(),
            FileShareModel_1.FileShareModel.deleteMany({ fileId: id }).exec(),
        ]);
    }
    async upsertTags(fileId, labels) {
        await TagModel_1.TagModel.deleteMany({ fileId }).exec();
        if (labels.length > 0) {
            await TagModel_1.TagModel.insertMany(labels.map((label) => ({
                fileId,
                label,
                normalizedLabel: label.toLowerCase(),
            })));
        }
        return this.listTags(fileId);
    }
    async listTags(fileId) {
        const tags = await TagModel_1.TagModel.find({ fileId }).sort({ createdAt: 1 }).exec();
        return tags.map(toTag);
    }
    async createShare(fileId, userId) {
        await FileShareModel_1.FileShareModel.create({ fileId, userId, permission: 'read' });
    }
    async hasShare(fileId, userId) {
        const share = await FileShareModel_1.FileShareModel.findOne({ fileId, userId }).exec();
        return Boolean(share);
    }
    async deleteShare(fileId, userId) {
        const deleted = await FileShareModel_1.FileShareModel.deleteOne({ fileId, userId }).exec();
        return deleted.deletedCount > 0;
    }
    async listShares(fileId) {
        const shares = await FileShareModel_1.FileShareModel.find({ fileId }).exec();
        const users = await UserModel_1.UserModel.find({ _id: { $in: shares.map((s) => s.userId) } }).exec();
        const emailMap = new Map(users.map((u) => [u._id.toString(), u.email]));
        return shares.map((share) => ({
            userId: share.userId.toString(),
            permission: 'read',
            email: emailMap.get(share.userId.toString()),
        }));
    }
    async createShareLink(fileId, token, expiresAt) {
        const link = await ShareLinkModel_1.ShareLinkModel.create({ fileId, token, expiresAt });
        return toShareLink(link);
    }
    async listActiveShareLinks(fileId, now) {
        const links = await ShareLinkModel_1.ShareLinkModel.find({ fileId, expiresAt: { $gt: now } }).exec();
        return links.map(toShareLink);
    }
    async findShareLinkByToken(token) {
        const link = await ShareLinkModel_1.ShareLinkModel.findOne({ token }).exec();
        return link ? toShareLink(link) : null;
    }
    async setFileExpiresAtIfMissing(fileId, expiresAt) {
        await FileModel_1.FileModel.updateOne({ _id: fileId, $or: [{ expiresAt: null }, { expiresAt: { $exists: false } }] }, { $set: { expiresAt } }).exec();
    }
}
exports.MongoFileRepository = MongoFileRepository;
