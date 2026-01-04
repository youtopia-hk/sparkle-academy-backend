import { Request, Response } from 'express';
import MediaAsset from '../models/MediaAsset';
import fs from 'fs';
import path from 'path';

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: { message: 'No file uploaded', code: 'NO_FILE' }
      });
      return;
    }

    const { altText, tags } = req.body;

    // Determine file type based on mimetype
    let fileType: 'image' | 'video' | 'document' = 'image';
    if (req.file.mimetype.startsWith('video/')) {
      fileType = 'video';
    } else if (req.file.mimetype.startsWith('application/')) {
      fileType = 'document';
    }

    // Create MediaAsset record
    const mediaAsset = new MediaAsset({
      filename: req.file.originalname,
      storedFilename: req.file.filename,
      filePath: req.file.path,
      fileType,
      mimeType: req.file.mimetype,
      size: req.file.size,
      altText: altText || '',
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      uploadedBy: req.user?.userId
    });

    await mediaAsset.save();

    res.status(201).json({
      success: true,
      data: mediaAsset
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);

    // Clean up uploaded file if database save failed
    if (req.file?.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to upload image', code: 'UPLOAD_ERROR' }
    });
  }
};

export const getAllMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 20, fileType, tags } = req.query;

    const filter: any = {};
    if (fileType) filter.fileType = fileType;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const media = await MediaAsset.find(filter)
      .populate('uploadedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await MediaAsset.countDocuments(filter);

    res.json({
      success: true,
      data: media,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch media', code: 'FETCH_ERROR' }
    });
  }
};

export const getMediaById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const media = await MediaAsset.findById(id)
      .populate('uploadedBy', 'firstName lastName email');

    if (!media) {
      res.status(404).json({
        success: false,
        error: { message: 'Media not found', code: 'NOT_FOUND' }
      });
      return;
    }

    res.json({
      success: true,
      data: media
    });
  } catch (error) {
    console.error('Error fetching media:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch media', code: 'FETCH_ERROR' }
    });
  }
};

export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { altText, tags } = req.body;

    const media = await MediaAsset.findById(id);

    if (!media) {
      res.status(404).json({
        success: false,
        error: { message: 'Media not found', code: 'NOT_FOUND' }
      });
      return;
    }

    // Only allow updating altText and tags
    if (altText !== undefined) media.altText = altText;
    if (tags !== undefined) media.tags = Array.isArray(tags) ? tags : [];

    await media.save();

    await media.populate('uploadedBy', 'firstName lastName email');

    res.json({
      success: true,
      data: media
    });
  } catch (error: any) {
    console.error('Error updating media:', error);

    if (error.name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: { message: error.message, code: 'VALIDATION_ERROR' }
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: { message: 'Failed to update media', code: 'UPDATE_ERROR' }
    });
  }
};

export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const media = await MediaAsset.findById(id);

    if (!media) {
      res.status(404).json({
        success: false,
        error: { message: 'Media not found', code: 'NOT_FOUND' }
      });
      return;
    }

    // Delete the file from filesystem
    try {
      if (fs.existsSync(media.filePath)) {
        fs.unlinkSync(media.filePath);
      }
    } catch (fsError) {
      console.error('Error deleting file from filesystem:', fsError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await media.deleteOne();

    res.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting media:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete media', code: 'DELETE_ERROR' }
    });
  }
};
