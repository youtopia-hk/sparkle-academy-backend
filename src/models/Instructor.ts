import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructor extends Document {
  firstName: string;
  lastName: string;
  bio: string;
  qualifications: string[];
  photo?: string;
  email?: string;
  linkedinUrl?: string;
  specialties: string[];
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const InstructorSchema = new Schema<IInstructor>(
  {
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
    bio: {
      type: String,
      required: [true, 'Bio is required'],
    },
    qualifications: {
      type: [String],
      default: [],
    },
    photo: {
      type: String,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    linkedinUrl: {
      type: String,
    },
    specialties: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InstructorSchema.index({ isActive: 1, displayOrder: 1 });

export default mongoose.model<IInstructor>('Instructor', InstructorSchema);
