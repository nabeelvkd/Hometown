import { Schema, model, Document, Types } from 'mongoose';

export interface IDistrict extends Document {
  _id: Types.ObjectId;
  name: string;
  nameMl?: string;
  state: string;
  code?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const districtSchema = new Schema<IDistrict>(
  {
    name: { type: String, required: true, trim: true },
    nameMl: { type: String, trim: true },
    state: { type: String, required: true, trim: true, default: 'Kerala' },
    code: { type: String, trim: true, uppercase: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

districtSchema.index({ state: 1, name: 1 }, { unique: true });

export const District = model<IDistrict>('District', districtSchema);
