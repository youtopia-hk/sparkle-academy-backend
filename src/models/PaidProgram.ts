import mongoose, { Schema, Document } from 'mongoose';
import { DELIVERY_FORMATS, DEFAULT_CURRENCY } from '../config/constants';

export interface IPaidProgram extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  entityId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  thumbnailImage?: string;
  images: string[];
  youtubeLinks: string[];
  deliveryFormat: 'online' | 'in-person' | 'hybrid';
  venueAddress?: string;
  minAge?: number;
  maxAge?: number;
  duration?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  registrationLink?: string;
  price?: number;
  currency: string;
  instructorIds: mongoose.Types.ObjectId[];
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
}

const PaidProgramSchema = new Schema<IPaidProgram>(
  {
    name: {
      type: String,
      required: [true, 'Program name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      maxlength: [200, 'Short description must be less than 200 characters'],
    },
    entityId: {
      type: Schema.Types.ObjectId,
      ref: 'Entity',
      required: [true, 'Entity is required'],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    thumbnailImage: {
      type: String,
    },
    images: {
      type: [String],
      default: [],
    },
    youtubeLinks: {
      type: [String],
      default: [],
    },
    deliveryFormat: {
      type: String,
      enum: Object.values(DELIVERY_FORMATS),
      required: [true, 'Delivery format is required'],
    },
    venueAddress: {
      type: String,
    },
    minAge: {
      type: Number,
      min: [0, 'Minimum age must be positive'],
    },
    maxAge: {
      type: Number,
      min: [0, 'Maximum age must be positive'],
    },
    duration: {
      type: String,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
    },
    registrationLink: {
      type: String,
    },
    price: {
      type: Number,
      min: [0, 'Price must be positive'],
    },
    currency: {
      type: String,
      default: DEFAULT_CURRENCY,
    },
    instructorIds: {
      type: [Schema.Types.ObjectId],
      ref: 'Instructor',
      default: [],
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
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
PaidProgramSchema.index({ slug: 1 });
PaidProgramSchema.index({ entityId: 1, categoryId: 1 });
PaidProgramSchema.index({ isActive: 1, isFeatured: 1 });

// Validation: if deliveryFormat is in-person or hybrid, venueAddress is required
PaidProgramSchema.pre('validate', function () {
  if (
    (this.deliveryFormat === DELIVERY_FORMATS.IN_PERSON ||
      this.deliveryFormat === DELIVERY_FORMATS.HYBRID) &&
    !this.venueAddress
  ) {
    this.invalidate('venueAddress', 'Venue address is required for in-person or hybrid programs');
  }
});

export default mongoose.model<IPaidProgram>('PaidProgram', PaidProgramSchema);
