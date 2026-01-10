import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Testimonial from '../models/Testimonial';
import connectDB from '../config/database';

async function deleteTestimonials() {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting testimonial deletion...');

    // Delete all testimonials
    const result = await Testimonial.deleteMany({});

    console.log(`Deletion complete! Removed ${result.deletedCount} testimonials.`);

    // Disconnect from database
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Deletion failed:', error);
    process.exit(1);
  }
}

deleteTestimonials();
