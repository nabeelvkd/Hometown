import { Schema, model, Document } from 'mongoose';

/**
 * Singleton config that drives the mobile app's "update available" popup.
 * The super admin sets the latest version + download link and whether the
 * update is mandatory (forced) or optional (dismissible).
 */
export interface IAppUpdate extends Document {
  /** Latest published version, e.g. "1.1.0". Clients below this are prompted. */
  latestVersion: string;
  androidUrl?: string;
  iosUrl?: string;
  title: string;
  message: string;
  /** true = blocking popup (must update); false = dismissible "Later". */
  mandatory: boolean;
  /** Master switch — when false, no popup is shown to anyone. */
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const appUpdateSchema = new Schema<IAppUpdate>(
  {
    latestVersion: { type: String, trim: true, default: '' },
    androidUrl: { type: String, trim: true },
    iosUrl: { type: String, trim: true },
    title: { type: String, trim: true, default: 'Update available' },
    message: {
      type: String,
      trim: true,
      default: 'A new version of the app is available. Please update for the best experience.',
    },
    mandatory: { type: Boolean, default: false },
    active: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const AppUpdate = model<IAppUpdate>('AppUpdate', appUpdateSchema);
