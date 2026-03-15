import { Schema, model, Types } from 'mongoose';

const fileShareSchema = new Schema(
  {
    fileId: { type: Types.ObjectId, ref: 'File', required: true, index: true },
    userId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    permission: { type: String, enum: ['read'], default: 'read', required: true },
  },
  { timestamps: true }
);

fileShareSchema.index({ fileId: 1, userId: 1 }, { unique: true });

export const FileShareModel = model('FileShare', fileShareSchema);
