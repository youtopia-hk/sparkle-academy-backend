import mongoose, { Schema, Document } from 'mongoose';
import { FILE_TYPES } from '../config/constants';

interface IUsage {
  model: string;
  documentId: mongoose.Types.ObjectId;
  field: string;
}

export interface IMediaAsset extends Document {
  filename: string;
  storedFilename: string;
  filePath: string;
  r2Key: string; // R2 object key (e.g., 'images/file-123456.jpg')
  fileType: 'image' | 'video' | 'document';
  mimeType: string;
  size: number;
  altText?: string;
  tags: string[];
  uploadedBy: mongoose.Types.ObjectId;
  usedIn?: IUsage[];
  createdAt: Date;
}

const MediaAssetSchema = new Schema<IMediaAsset>(
  {
    filename: {
      type: String,
      required: [true, 'Filename is required'],
    },
    storedFilename: {
      type: String,
      required: [true, 'Stored filename is required'],
      unique: true,
    },
    filePath: {
      type: String,
      required: [true, 'File path is required'],
    },
    r2Key: {
      type: String,
      required: [true, 'R2 key is required'],
    },
    fileType: {
      type: String,
      enum: Object.values(FILE_TYPES),
      required: [true, 'File type is required'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
    },
    size: {
      type: Number,
      required: [true, 'File size is required'],
    },
    altText: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: [true, 'Uploader is required'],
    },
    usedIn: [
      {
        model: { type: String },
        documentId: { type: Schema.Types.ObjectId },
        field: { type: String },
      },
    ],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
MediaAssetSchema.index({ fileType: 1 });
MediaAssetSchema.index({ uploadedBy: 1 });
MediaAssetSchema.index({ createdAt: -1 });

export default mongoose.model<IMediaAsset>('MediaAsset', MediaAssetSchema);
