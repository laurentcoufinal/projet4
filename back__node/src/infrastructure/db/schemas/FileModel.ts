import { Schema, model, Types } from 'mongoose';

const fileSchema = new Schema(
  {
    ownerUserId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 255 },
    storageKey: { type: String, required: true, unique: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    expiresAt: { type: Date, default: null },
    passwordHash: { type: String, default: null },
  },
  { timestamps: true }
);

export const FileModel = model('File', fileSchema);
