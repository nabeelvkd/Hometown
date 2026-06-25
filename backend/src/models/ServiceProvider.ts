import { Schema, model, Document, Types } from 'mongoose';

export interface IServiceProvider extends Document {
  _id: Types.ObjectId;
  name: string;
  nameMl?: string;
  /** Free-text category (suggested values exist, but custom is allowed). */
  category: string;
  phone: string;
  whatsapp?: string;
  /** Photo of the person / service. */
  photo?: string;
  experienceYears: number;
  description?: string;
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  user?: Types.ObjectId;
  isVerified: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceProviderSchema = new Schema<IServiceProvider>(
  {
    name: { type: String, required: true, trim: true },
    nameMl: { type: String, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    photo: { type: String, trim: true },
    experienceYears: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
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
    village: {
      type: Schema.Types.ObjectId,
      ref: 'Village',
      required: true,
      index: true,
    },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceProviderSchema.index({ village: 1, category: 1, isActive: 1 });

export const ServiceProvider = model<IServiceProvider>(
  'ServiceProvider',
  serviceProviderSchema
);
