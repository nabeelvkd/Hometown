import { Schema, model, Document, Types } from 'mongoose';

export interface IBusiness extends Document {
  _id: Types.ObjectId;
  name: string;
  nameMl?: string;
  /** Free-text category (suggested values exist, but custom is allowed). */
  category: string;
  phone: string;
  whatsapp?: string;
  /** Whether the business takes orders over WhatsApp. */
  acceptsOrders: boolean;
  address: string;
  /** Gallery image URLs. */
  photos: string[];
  /** Human-readable opening hours, e.g. "Mon–Sat 9 AM – 8 PM". */
  workingHours?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  owner?: Types.ObjectId;
  description?: string;
  isVerified: boolean;
  isFeatured: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const businessSchema = new Schema<IBusiness>(
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
    acceptsOrders: { type: Boolean, default: false },
    address: { type: String, required: true, trim: true },
    photos: { type: [String], default: [] },
    workingHours: { type: String, trim: true },
    // GeoJSON point. No defaults here on purpose: with no nested default,
    // Mongoose leaves `location` entirely unset when no coordinates are
    // supplied, so the sparse 2dsphere index skips it. (An empty
    // { type: 'Point' } with no coordinates would fail geo-key extraction.)
    location: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
      },
    },
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
    owner: { type: Schema.Types.ObjectId, ref: 'User' },
    description: { type: String, trim: true },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Geo index for "near me" queries; sparse so docs without coords are allowed.
businessSchema.index({ location: '2dsphere' }, { sparse: true });
// Common listing query: by locality + category.
businessSchema.index({ village: 1, category: 1, isActive: 1 });

export const Business = model<IBusiness>('Business', businessSchema);
