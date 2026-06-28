import { Schema, model, Document, Types } from 'mongoose';

/**
 * Anonymous app install/device, used to count unique users per village even
 * though residents don't log in. The mobile app sends a stable random deviceId
 * with the selected village on launch; we keep the latest village per device.
 */
export interface IAppDevice extends Document {
  deviceId: string;
  village?: Types.ObjectId;
  district?: Types.ObjectId;
  block?: Types.ObjectId;
  lastSeenAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const appDeviceSchema = new Schema<IAppDevice>(
  {
    deviceId: { type: String, required: true, unique: true, index: true },
    village: { type: Schema.Types.ObjectId, ref: 'Village', index: true },
    district: { type: Schema.Types.ObjectId, ref: 'District', index: true },
    block: { type: Schema.Types.ObjectId, ref: 'Block' },
    lastSeenAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const AppDevice = model<IAppDevice>('AppDevice', appDeviceSchema);
