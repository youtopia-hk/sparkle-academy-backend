import { Request, Response } from 'express';
import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings';

export const getSiteSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // SiteSettings is a singleton - only one record exists
    let settings = await SiteSettings.findOne();

    // If no settings exist, create default settings
    if (!settings) {
      settings = new SiteSettings({
        contactEmail: 'info@sparkle.com',
        homepageTitle: 'Welcome to Sparkle Education',
        homepageDescription: 'Empowering learners of all ages',
        aboutUsTitle: 'About Sparkle',
        aboutUsContent: '',
        primaryFont: 'Inter'
      });
      await settings.save();
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch site settings', code: 'FETCH_ERROR' }
    });
  }
};

export const updateSiteSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const updateData = req.body;

    // SiteSettings is a singleton - only one record exists
    let settings = await SiteSettings.findOne();

    if (!settings) {
      // Create new settings if none exist
      settings = new SiteSettings({
        ...updateData,
        updatedBy: req.user?.userId ? new mongoose.Types.ObjectId(req.user.userId) : undefined
      });
    } else {
      // Update existing settings
      Object.assign(settings, updateData);
      if (req.user?.userId) {
        settings.updatedBy = new mongoose.Types.ObjectId(req.user.userId);
      }
    }

    await settings.save();

    res.json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    console.error('Error updating site settings:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update site settings', code: 'UPDATE_ERROR' }
    });
  }
};
