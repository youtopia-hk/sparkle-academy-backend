import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
  try {
    // Select database based on NODE_ENV
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoURI = isProduction
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);

    const dbName = mongoURI.split('/').pop()?.split('?')[0];
    console.log(`MongoDB connected successfully to: ${dbName}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

export default connectDB;
