import { Schema, model, Document, Types } from 'mongoose';

/**
 * Generic category registry. `kind` distinguishes business vs service
 * categories so the same collection can drive both listings.
 */
export const CATEGORY_KINDS = {
  BUSINESS: 'business',
  SERVICE: 'service',
} as const;

export type CategoryKind =
  (typeof CATEGORY_KINDS)[keyof typeof CATEGORY_KINDS];

export interface ICategory extends Document {
  _id: Types.ObjectId;
  key: string;
  name: string;
  nameMl?: string;
  kind: CategoryKind;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    key: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    nameMl: { type: String, trim: true },
    kind: {
      type: String,
      enum: Object.values(CATEGORY_KINDS),
      required: true,
      index: true,
    },
    icon: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ kind: 1, key: 1 }, { unique: true });

export const Category = model<ICategory>('Category', categorySchema);
