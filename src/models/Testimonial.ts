import mongoose, { Schema, Document } from 'mongoose';
import { TESTIMONIAL_ROLES, PROGRAM_TYPES } from '../config/constants';

export interface ITestimonial extends Document {
  name: string;
  role: 'student' | 'parent';
  content: string;
  photo?: string;
  rating?: number;
  programId?: mongoose.Types.ObjectId;
  programType?: 'paid' | 'trial';
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const TestimonialSchema = new Schema<ITestimonial>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: Object.values(TESTIMONIAL_ROLES),
      required: [true, 'Role is required'],
    },
    content: {
      type: String,
      required: [true, 'Testimonial content is required'],
    },
    photo: {
      type: String,
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5'],
    },
    programId: {
      type: Schema.Types.ObjectId,
      refPath: 'programType',
    },
    programType: {
      type: String,
      enum: Object.values(PROGRAM_TYPES),
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
TestimonialSchema.index({ isActive: 1, isFeatured: 1 });
TestimonialSchema.index({ programId: 1 });

export default mongoose.model<ITestimonial>('Testimonial', TestimonialSchema);
