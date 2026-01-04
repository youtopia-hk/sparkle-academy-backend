import { Request, Response } from 'express';
import { sendContactEmail } from '../utils/email.utils';

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Name, email, and message are required',
          code: 'MISSING_FIELDS',
        },
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        error: {
          message: 'Invalid email format',
          code: 'INVALID_EMAIL',
        },
      });
      return;
    }

    // Send email
    await sendContactEmail(name, email, message, phone);

    res.json({
      success: true,
      message: 'Contact form submitted successfully. We will get back to you soon.',
    });
  } catch (error) {
    console.error('Error submitting contact form:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send message. Please try again later.',
        code: 'EMAIL_ERROR',
      },
    });
  }
};
