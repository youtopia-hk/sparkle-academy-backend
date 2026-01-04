import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  entityId: mongoose.Types.ObjectId;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
    },
    entityId: {
      type: Schema.Types.ObjectId,
      ref: 'Entity',
      required: [true, 'Entity is required'],
    },
    icon: {
      type: String,
    },
    displayOrder: {
      type: Number,
      default: 0,
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

// Compound index: slug must be unique within an entity
CategorySchema.index({ slug: 1, entityId: 1 }, { unique: true });
CategorySchema.index({ entityId: 1, displayOrder: 1 });

export default mongoose.model<ICategory>('Category', CategorySchema);
