"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShareLinkModel = void 0;
const mongoose_1 = require("mongoose");
const shareLinkSchema = new mongoose_1.Schema({
    fileId: { type: mongoose_1.Types.ObjectId, ref: 'File', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
}, { timestamps: true });
exports.ShareLinkModel = (0, mongoose_1.model)('ShareLink', shareLinkSchema);
