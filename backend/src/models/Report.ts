import { Schema, model, Document, Types } from 'mongoose';
import { FAVORITE_TARGETS, FavoriteTarget } from './Favorite';
import { REPORT_STATUS, REPORT_STATUS_VALUES, ReportStatus } from '../constants';

/**
 * User-submitted reports about a listing (wrong number, closed shop, etc.).
 */
export interface IReport extends Document {
  _id: Types.ObjectId;
  reportedBy?: Types.ObjectId;
  targetType: FavoriteTarget;
  target: Types.ObjectId;
  reason: string;
  details?: string;
  status: ReportStatus;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reportedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    targetType: {
      type: String,
      enum: Object.values(FAVORITE_TARGETS),
      required: true,
    },
    target: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType',
    },
    reason: { type: String, required: true, trim: true },
    details: { type: String, trim: true },
    status: {
      type: String,
      enum: REPORT_STATUS_VALUES,
      default: REPORT_STATUS.PENDING,
      index: true,
    },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export const Report = model<IReport>('Report', reportSchema);
