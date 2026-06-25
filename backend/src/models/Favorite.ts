import { Schema, model, Document, Types } from 'mongoose';

export const FAVORITE_TARGETS = {
  BUSINESS: 'Business',
  SERVICE_PROVIDER: 'ServiceProvider',
} as const;

export type FavoriteTarget =
  (typeof FAVORITE_TARGETS)[keyof typeof FAVORITE_TARGETS];

export interface IFavorite extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  targetType: FavoriteTarget;
  target: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
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
  },
  { timestamps: true }
);

// A user can favorite a given target only once.
favoriteSchema.index({ user: 1, targetType: 1, target: 1 }, { unique: true });

export const Favorite = model<IFavorite>('Favorite', favoriteSchema);
