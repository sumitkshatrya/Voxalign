import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  role: 'user' | 'admin' | 'reviewer';
  avatar?: string;
  organization?: string;
  quotaMinutes: number;
  usedMinutes: number;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin', 'reviewer'], default: 'user' },
  avatar: { type: String, default: '' },
  organization: { type: String, default: 'Independent' },
  quotaMinutes: { type: Number, default: 120 }, // 120 minutes free default
  usedMinutes: { type: Number, default: 0 },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date }
}, {
  timestamps: true
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const UserModel = mongoose.model<IUser>('User', UserSchema);
