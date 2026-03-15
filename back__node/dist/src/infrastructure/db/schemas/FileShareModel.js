"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileShareModel = void 0;
const mongoose_1 = require("mongoose");
const fileShareSchema = new mongoose_1.Schema({
    fileId: { type: mongoose_1.Types.ObjectId, ref: 'File', required: true, index: true },
    userId: { type: mongoose_1.Types.ObjectId, ref: 'User', required: true, index: true },
    permission: { type: String, enum: ['read'], default: 'read', required: true },
}, { timestamps: true });
fileShareSchema.index({ fileId: 1, userId: 1 }, { unique: true });
exports.FileShareModel = (0, mongoose_1.model)('FileShare', fileShareSchema);
