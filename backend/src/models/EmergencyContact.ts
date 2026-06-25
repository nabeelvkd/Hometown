import { Schema, model, Document, Types } from 'mongoose';
import { EMERGENCY_TYPE_VALUES, EmergencyType } from '../constants';

export interface IEmergencyContact extends Document {
  _id: Types.ObjectId;
  name: string;
  nameMl?: string;
  type: EmergencyType;
  phone: string;
  alternatePhone?: string;
  address?: string;
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  isActive: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true, trim: true },
    nameMl: { type: String, trim: true },
    type: {
      type: String,
      enum: EMERGENCY_TYPE_VALUES,
      required: true,
      index: true,
    },
    phone: { type: String, required: true, trim: true },
    alternatePhone: { type: String, trim: true },
    address: { type: String, trim: true },
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
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

emergencyContactSchema.index({ village: 1, type: 1 });

export const EmergencyContact = model<IEmergencyContact>(
  'EmergencyContact',
  emergencyContactSchema
);
