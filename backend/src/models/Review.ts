import { Schema, model, Document, Types } from 'mongoose';
import { FAVORITE_TARGETS, FavoriteTarget } from './Favorite';

export interface IReview extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  targetType: FavoriteTarget;
  target: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

// One review per user per target.
reviewSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });
reviewSchema.index({ targetType: 1, target: 1 });

export const Review = model<IReview>('Review', reviewSchema);
