import { Schema, model, Document, Types } from 'mongoose';
import { BLOCK_TYPE_VALUES, BlockType, BLOCK_TYPES } from '../constants';

export interface IBlock extends Document {
  _id: Types.ObjectId;
  name: string;
  nameMl?: string;
  district: Types.ObjectId;
  type: BlockType;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const blockSchema = new Schema<IBlock>(
  {
    name: { type: String, required: true, trim: true },
    nameMl: { type: String, trim: true },
    district: {
      type: Schema.Types.ObjectId,
      ref: 'District',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: BLOCK_TYPE_VALUES,
      default: BLOCK_TYPES.MUNICIPALITY,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

blockSchema.index({ district: 1, name: 1 }, { unique: true });

export const Block = model<IBlock>('Block', blockSchema);
