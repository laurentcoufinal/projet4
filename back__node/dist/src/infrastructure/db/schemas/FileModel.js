"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileModel = void 0;
const mongoose_1 = require("mongoose");
const fileSchema = new mongoose_1.Schema({
    ownerUserId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    storageKey: { type: String, required: true, unique: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    expiresAt: { type: Date, default: null },
    passwordHash: { type: String, default: null },
}, { timestamps: true });
exports.FileModel = (0, mongoose_1.model)('File', fileSchema);
