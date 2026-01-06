import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteSettings extends Document {
  // General
  siteName: string;
  siteTagline?: string;
  logoUrl?: string;

  // Sparkle Academy Contact
  academyContactEmail?: string;
  academyContactPhone?: string;
  academySocialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    patreon?: string;
  };

  // Sparkle INNOVATE Contact
  innovateContactEmail?: string;
  innovateContactPhone?: string;
  innovateSocialMedia?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    linkedin?: string;
    twitter?: string;
    patreon?: string;
  };

  // Footer
  footerText?: string;

  // About Page Content
  academyAboutContent?: string;   // HTML content for Academy About page
  innovateAboutContent?: string;  // HTML content for INNOVATE About page

  // Legacy fields (kept for backward compatibility)
  primaryFont?: string;
  homepageTitle?: string;
  homepageDescription?: string;
  homepageImages?: string[];
  aboutUsTitle?: string;
  aboutUsContent?: string;
  aboutUsImages?: string[];

  updatedAt: Date;
  updatedBy?: mongoose.Types.ObjectId;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    // General
    siteName: {
      type: String,
      required: [true, 'Site name is required'],
      default: 'Sparkle Education',
    },
    siteTagline: { type: String },
    logoUrl: { type: String },

    // Sparkle Academy Contact
    academyContactEmail: { type: String },
    academyContactPhone: { type: String },
    academySocialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      patreon: { type: String },
    },

    // Sparkle INNOVATE Contact
    innovateContactEmail: { type: String },
    innovateContactPhone: { type: String },
    innovateSocialMedia: {
      facebook: { type: String },
      instagram: { type: String },
      youtube: { type: String },
      linkedin: { type: String },
      twitter: { type: String },
      patreon: { type: String },
    },

    // Footer
    footerText: { type: String },

    // About Page Content
    academyAboutContent: { type: String },
    innovateAboutContent: { type: String },

    // Legacy fields (kept for backward compatibility)
    primaryFont: { type: String, default: 'Inter' },
    homepageTitle: { type: String },
    homepageDescription: { type: String },
    homepageImages: { type: [String], default: [] },
    aboutUsTitle: { type: String },
    aboutUsContent: { type: String },
    aboutUsImages: { type: [String], default: [] },

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
