import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLE_VALUES, USER_ROLES, UserRole } from '../constants';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  phone: string;
  email?: string;
  passwordHash?: string;
  role: UserRole;
  district?: Types.ObjectId;
  block?: Types.ObjectId;
  village?: Types.ObjectId;
  preferredLanguage: 'en' | 'ml';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  setPassword(plain: string): Promise<void>;
  comparePassword(plain: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, unique: true },
    email: { type: String, trim: true, lowercase: true },
    passwordHash: { type: String, select: false },
    role: {
      type: String,
      enum: USER_ROLE_VALUES,
      default: USER_ROLES.USER,
      index: true,
    },
    district: { type: Schema.Types.ObjectId, ref: 'District' },
    block: { type: Schema.Types.ObjectId, ref: 'Block' },
    // For local_admin: the single village/town this admin manages.
    village: { type: Schema.Types.ObjectId, ref: 'Village' },
    preferredLanguage: { type: String, enum: ['en', 'ml'], default: 'ml' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plain: string): Promise<void> {
  this.passwordHash = await bcrypt.hash(plain, 10);
};

userSchema.methods.comparePassword = async function (
  plain: string
): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(plain, this.passwordHash);
};

export const User = model<IUser>('User', userSchema);
