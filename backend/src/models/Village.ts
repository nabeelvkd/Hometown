import { Schema, model, Document, Types } from 'mongoose';

/**
 * A village or town — the lowest level of the location hierarchy and the unit
 * every piece of content belongs to. Each village belongs to a block (which
 * belongs to a district).
 */
export interface IVillage extends Document {
  _id: Types.ObjectId;
  name: string;
  nameMl?: string;
  /** Hero/cover image shown on the mobile home screen for this village. */
  heroImage?: string;
  district: Types.ObjectId;
  block: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const villageSchema = new Schema<IVillage>(
  {
    name: { type: String, required: true, trim: true },
    nameMl: { type: String, trim: true },
    heroImage: { type: String, trim: true },
    district: {
      type: Schema.Types.ObjectId,
      ref: 'District',
      required: true,
      index: true,
    },
    block: {
      type: Schema.Types.ObjectId,
      ref: 'Block',
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

villageSchema.index({ block: 1, name: 1 }, { unique: true });

export const Village = model<IVillage>('Village', villageSchema);
