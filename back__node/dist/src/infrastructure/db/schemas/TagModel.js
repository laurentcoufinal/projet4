"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagModel = void 0;
const mongoose_1 = require("mongoose");
const tagSchema = new mongoose_1.Schema({
    fileId: { type: mongoose_1.Types.ObjectId, ref: 'File', required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 30 },
    normalizedLabel: { type: String, required: true, trim: true, maxlength: 30 },
}, { timestamps: true });
tagSchema.index({ fileId: 1, normalizedLabel: 1 }, { unique: true });
exports.TagModel = (0, mongoose_1.model)('Tag', tagSchema);
