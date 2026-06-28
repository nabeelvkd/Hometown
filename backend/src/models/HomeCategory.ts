import { Schema, model, Document, Types } from 'mongoose';

/**
 * A home-screen category tile for a village. Predefined tiles (businesses,
 * services, …) are lazily provisioned per village so a local admin can reorder
 * them; admins can also add custom tiles (with an optional link).
 */
export interface IHomeCategory extends Document {
  _id: Types.ObjectId;
  key: string;
  label: string;
  sub?: string;
  icon: string;
  color: string;
  order: number;
  isCustom: boolean;
  /** How a custom category behaves: 'link' opens a URL; 'directory'/'places' show managed items. */
  template: 'link' | 'directory' | 'places';
  link?: string;
  isActive: boolean;
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const homeCategorySchema = new Schema<IHomeCategory>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
    sub: { type: String, trim: true },
    icon: { type: String, required: true, trim: true, default: 'layout-grid' },
    color: { type: String, required: true, trim: true, default: '#16A34A' },
    order: { type: Number, default: 0 },
    isCustom: { type: Boolean, default: false },
    template: { type: String, enum: ['link', 'directory', 'places'], default: 'link' },
    link: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    district: { type: Schema.Types.ObjectId, ref: 'District', required: true },
    block: { type: Schema.Types.ObjectId, ref: 'Block', required: true },
    village: { type: Schema.Types.ObjectId, ref: 'Village', required: true, index: true },
  },
  { timestamps: true }
);

homeCategorySchema.index({ village: 1, key: 1 }, { unique: true });
homeCategorySchema.index({ village: 1, order: 1 });

export const HomeCategory = model<IHomeCategory>('HomeCategory', homeCategorySchema);

/** The built-in tiles every village starts with (in default order). */
export const DEFAULT_HOME_CATEGORIES = [
  { key: 'businesses', label: 'Businesses', sub: 'Shops & more', icon: 'store', color: '#16A34A' },
  { key: 'services', label: 'Services', sub: 'Local services', icon: 'wrench', color: '#3B82F6' },
  { key: 'emergency', label: 'Emergency', sub: 'Quick contacts', icon: 'siren', color: '#EF4444' },
  { key: 'announcements', label: 'Notices', sub: 'Updates & alerts', icon: 'megaphone', color: '#8B5CF6' },
  { key: 'transport', label: 'Taxi', sub: 'Autos & cabs', icon: 'car', color: '#F59E0B' },
  { key: 'bus', label: 'Bus', sub: 'Bus timings', icon: 'bus', color: '#0891B2' },
  { key: 'health', label: 'Health', sub: 'Hospitals & more', icon: 'heart-pulse', color: '#EC4899' },
  { key: 'education', label: 'Education', sub: 'Schools & more', icon: 'graduation-cap', color: '#0EA5E9' },
];
