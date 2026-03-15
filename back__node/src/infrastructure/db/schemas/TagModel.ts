import { Schema, model, Types } from 'mongoose';

const tagSchema = new Schema(
  {
    fileId: { type: Types.ObjectId, ref: 'File', required: true, index: true },
    label: { type: String, required: true, trim: true, maxlength: 30 },
    normalizedLabel: { type: String, required: true, trim: true, maxlength: 30 },
  },
  { timestamps: true }
);

tagSchema.index({ fileId: 1, normalizedLabel: 1 }, { unique: true });

export const TagModel = model('Tag', tagSchema);
