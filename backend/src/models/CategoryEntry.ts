import { Schema, model, Document, Types } from 'mongoose';

/**
 * An item shown under a custom (templated) home category — e.g. a contact in a
 * "directory" category, or a place in a "places" category. Belongs to a village.
 */
export interface ICategoryEntry extends Document {
  _id: Types.ObjectId;
  category: Types.ObjectId;
  title: string;
  subtitle?: string;
  photo?: string;
  phone?: string;
  whatsapp?: string;
  description?: string;
  link?: string;
  order: number;
  isActive: boolean;
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const categoryEntrySchema = new Schema<ICategoryEntry>(
  {
    category: { type: Schema.Types.ObjectId, ref: 'HomeCategory', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    photo: { type: String, trim: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    description: { type: String, trim: true },
    link: { type: String, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    district: { type: Schema.Types.ObjectId, ref: 'District', required: true },
    block: { type: Schema.Types.ObjectId, ref: 'Block', required: true },
    village: { type: Schema.Types.ObjectId, ref: 'Village', required: true, index: true },
  },
  { timestamps: true }
);

categoryEntrySchema.index({ category: 1, order: 1 });

export const CategoryEntry = model<ICategoryEntry>('CategoryEntry', categoryEntrySchema);
