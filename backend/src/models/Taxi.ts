import { Schema, model, Document, Types } from 'mongoose';

/**
 * A taxi/auto driver listing. Belongs to a village like all other content.
 */
export interface ITaxi extends Document {
  _id: Types.ObjectId;
  driverName: string;
  photo?: string;
  phone: string;
  whatsapp?: string;
  /** auto | car | jeep | van | bike | tempo | custom */
  vehicleType: string;
  vehicleNumber: string;
  seats?: number;
  available: boolean;
  description?: string;
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  isVerified: boolean;
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const taxiSchema = new Schema<ITaxi>(
  {
    driverName: { type: String, required: true, trim: true },
    photo: { type: String, trim: true },
    phone: { type: String, required: true, trim: true },
    whatsapp: { type: String, trim: true },
    vehicleType: { type: String, required: true, trim: true, lowercase: true, index: true },
    vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
    seats: { type: Number, min: 1, max: 60 },
    available: { type: Boolean, default: true },
    description: { type: String, trim: true },
    district: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
    block: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    village: { type: Schema.Types.ObjectId, ref: 'Village', required: true, index: true },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taxiSchema.index({ village: 1, vehicleType: 1, isActive: 1 });

export const Taxi = model<ITaxi>('Taxi', taxiSchema);
