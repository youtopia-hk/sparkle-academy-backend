import mongoose, { Schema, Document } from 'mongoose';

export interface IEntity extends Document {
  name: string;
  slug: string;
  description: string;
  targetAudience: string;
  logo?: string;
  bannerImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EntitySchema = new Schema<IEntity>(
  {
    name: {
      type: String,
      required: [true, 'Entity name is required'],
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
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
    },
    logo: {
      type: String,
    },
    bannerImage: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for slug lookup
EntitySchema.index({ slug: 1 });

export default mongoose.model<IEntity>('Entity', EntitySchema);
