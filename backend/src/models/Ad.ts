import { Schema, model, Document, Types } from 'mongoose';

export const AD_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type AdStatus = (typeof AD_STATUS)[keyof typeof AD_STATUS];
export const AD_STATUS_VALUES = Object.values(AD_STATUS);

/**
 * A sponsored banner shown on the mobile home screen. Local admins submit ads
 * for their village (status = pending) which a super_admin approves; super_admin
 * ads are auto-approved.
 */
export interface IAd extends Document {
  _id: Types.ObjectId;
  title: string;
  subtitle?: string;
  cta?: string;
  ctaUrl?: string;
  image?: string;
  /** Village this ad targets. Optional => shows everywhere (super_admin only). */
  village?: Types.ObjectId;
  district?: Types.ObjectId;
  block?: Types.ObjectId;
  status: AdStatus;
  isActive: boolean;
  createdBy?: Types.ObjectId;
  createdByRole?: string;
  reviewedBy?: Types.ObjectId;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const adSchema = new Schema<IAd>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    cta: { type: String, trim: true, default: 'Learn More' },
    ctaUrl: { type: String, trim: true },
    image: { type: String, trim: true },
    village: { type: Schema.Types.ObjectId, ref: 'Village', index: true },
    district: { type: Schema.Types.ObjectId, ref: 'District' },
    block: { type: Schema.Types.ObjectId, ref: 'Block' },
    status: { type: String, enum: AD_STATUS_VALUES, default: AD_STATUS.PENDING, index: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    createdByRole: { type: String },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    startsAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

adSchema.index({ village: 1, status: 1, isActive: 1 });

export const Ad = model<IAd>('Ad', adSchema);
