import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // Logos
  mainLogo?: string;
  academyLogo?: string;
  innovateLogo?: string;

  // Branding
  primaryFont: string;
  secondaryFont?: string;
  primaryColor?: string;
  secondaryColor?: string;

  // Homepage Content
  homepageTitle: string;
  homepageSubtitle?: string;
  homepageDescription: string;
  homepageImages: string[];

  // About Us
  aboutUsTitle: string;
  aboutUsContent: string;
  aboutUsImages: string[];

  // Contact
  contactEmail: string;
  contactPhone?: string;

  // Social Media
  facebookUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;

  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    // Logos
    mainLogo: { type: String },
    academyLogo: { type: String },
    innovateLogo: { type: String },

    // Branding
    primaryFont: {
      type: String,
      default: 'Inter',
    },
    secondaryFont: { type: String },
    primaryColor: { type: String },
    secondaryColor: { type: String },

    // Homepage Content
    homepageTitle: {
      type: String,
      required: [true, 'Homepage title is required'],
      default: 'Welcome to Sparkle Education',
    },
    homepageSubtitle: { type: String },
    homepageDescription: {
      type: String,
      required: [true, 'Homepage description is required'],
      default: 'Empowering learners of all ages',
    },
    homepageImages: {
      type: [String],
      default: [],
    },

    // About Us
    aboutUsTitle: {
      type: String,
      default: 'About Sparkle',
    },
    aboutUsContent: {
      type: String,
      default: '',
    },
    aboutUsImages: {
      type: [String],
      default: [],
    },

    // Contact
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    contactPhone: { type: String },

    // Social Media
    facebookUrl: { type: String },
    instagramUrl: { type: String },
    linkedinUrl: { type: String },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
