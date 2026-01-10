import mongoose, { Schema, Document } from 'mongoose';

export interface IInstructor extends Document {
  firstName: string;
  lastName: string;
  bio: string;
  qualifications: string[];
  photo?: string;
  images: string[];
  link?: string;
  linkedinUrl?: string;
  specialties: string[];
  isActive: boolean;
  displayOrder: number;
  slug: string;
  title?: string;
  phone?: string;
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
    images: {
      type: [String],
      default: [],
    },
    link: {
      type: String,
      trim: true,
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
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
InstructorSchema.index({ isActive: 1, displayOrder: 1 });
InstructorSchema.index({ slug: 1 });

// Generate slug before saving if not provided
InstructorSchema.pre('save', function () {
  // Generate slug if it's empty, undefined, or null
  if ((!this.slug || this.slug.trim() === '') && this.firstName && this.lastName) {
    this.slug = `${this.firstName}-${this.lastName}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  // Validate that slug exists after generation
  if (!this.slug || this.slug.trim() === '') {
    throw new Error('Slug could not be generated. Please provide firstName and lastName.');
  }
});

export default mongoose.model<IInstructor>('Instructor', InstructorSchema);
