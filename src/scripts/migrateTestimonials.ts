import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Testimonial from '../models/Testimonial';
import connectDB from '../config/database';

async function migrateTestimonials() {
  try {
    // Connect to database
    await connectDB();

    console.log('Starting testimonial migration...');

    // Update all testimonials that have programType but no programModel
    const result = await Testimonial.updateMany(
      {
        programType: { $exists: true },
        $or: [
          { programModel: { $exists: false } },
          { programModel: null }
        ]
      },
      [
        {
          $set: {
            programModel: {
              $cond: {
                if: { $eq: ['$programType', 'paid'] },
                then: 'PaidProgram',
                else: 'TrialProgram'
              }
            }
          }
        }
      ]
    );

    console.log(`Migration complete! Updated ${result.modifiedCount} testimonials.`);

    // Disconnect from database
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateTestimonials();
