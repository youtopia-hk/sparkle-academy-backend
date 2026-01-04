import mongoose, { Schema, Document } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { USER_ROLES } from '../config/constants';

export interface IAdminUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  createdBy?: mongoose.Types.ObjectId;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.ADMIN,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster email lookups
AdminUserSchema.index({ email: 1 });
AdminUserSchema.index({ role: 1 });

// Hash password before saving
AdminUserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare passwords
AdminUserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
