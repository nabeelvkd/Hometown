import { Schema, model, Document, Types } from 'mongoose';
import {
  ANNOUNCEMENT_TYPE_VALUES,
  ANNOUNCEMENT_TYPES,
  AnnouncementType,
} from '../constants';

export interface IAnnouncement extends Document {
  _id: Types.ObjectId;
  title: string;
  titleMl?: string;
  body: string;
  bodyMl?: string;
  type: AnnouncementType;
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  publishedBy?: Types.ObjectId;
  isPinned: boolean;
  isActive: boolean;
  startsAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const announcementSchema = new Schema<IAnnouncement>(
  {
    title: { type: String, required: true, trim: true },
    titleMl: { type: String, trim: true },
    body: { type: String, required: true, trim: true },
    bodyMl: { type: String, trim: true },
    type: {
      type: String,
      enum: ANNOUNCEMENT_TYPE_VALUES,
      default: ANNOUNCEMENT_TYPES.GENERAL,
      index: true,
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
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    isPinned: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    startsAt: { type: Date },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

announcementSchema.index({ village: 1, isActive: 1, createdAt: -1 });

export const Announcement = model<IAnnouncement>(
  'Announcement',
  announcementSchema
);
