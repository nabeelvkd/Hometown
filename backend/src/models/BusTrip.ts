import { Schema, model, Document, Types } from 'mongoose';

/**
 * A single bus departure on a route from the user's village to a destination.
 * Belongs to a village like all other content.
 */
export interface IBusTrip extends Document {
  _id: Types.ObjectId;
  destination: string;
  time: string; // "HH:MM" 24-hour
  operator: string;
  number: string;
  tags: string[]; // e.g. ['ksrtc','fast']
  district: Types.ObjectId;
  block: Types.ObjectId;
  village: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const busTripSchema = new Schema<IBusTrip>(
  {
    destination: { type: String, required: true, trim: true, index: true },
    time: { type: String, required: true, trim: true },
    operator: { type: String, required: true, trim: true },
    number: { type: String, required: true, trim: true, uppercase: true },
    tags: { type: [String], default: [] },
    district: { type: Schema.Types.ObjectId, ref: 'District', required: true, index: true },
    block: { type: Schema.Types.ObjectId, ref: 'Block', required: true, index: true },
    village: { type: Schema.Types.ObjectId, ref: 'Village', required: true, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

busTripSchema.index({ village: 1, destination: 1, isActive: 1 });

export const BusTrip = model<IBusTrip>('BusTrip', busTripSchema);
