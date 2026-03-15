import { Schema, model, Types } from 'mongoose';

const shareLinkSchema = new Schema(
  {
    fileId: { type: Types.ObjectId, ref: 'File', required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const ShareLinkModel = model('ShareLink', shareLinkSchema);
