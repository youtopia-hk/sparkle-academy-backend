import dotenv from 'dotenv';
import mongoose from 'mongoose';
import AdminUser from '../models/AdminUser';
import Entity from '../models/Entity';
import Category from '../models/Category';
import SiteSettings from '../models/SiteSettings';
import { USER_ROLES } from '../config/constants';

// Load environment variables
dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB - Use environment-based database selection
    const isProduction = process.env.NODE_ENV === 'production';
    const mongoURI = isProduction
      ? process.env.MONGODB_URI_PROD
      : process.env.MONGODB_URI_DEV || process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI);
    const dbName = mongoURI.split('/').pop()?.split('?')[0];
    console.log(`Connected to MongoDB: ${dbName}`);

    // 1. Create Super Admin User
    const existingSuperAdmin = await AdminUser.findOne({ role: USER_ROLES.SUPER_ADMIN });

    if (!existingSuperAdmin) {
      const superAdmin = new AdminUser({
        email: 'admin@sparkle.com',
        password: 'admin123', // Change this in production!
        firstName: 'Super',
        lastName: 'Admin',
        role: USER_ROLES.SUPER_ADMIN,
        isActive: true,
      });

      await superAdmin.save();
      console.log('✓ Super admin created');
      console.log('  Email: admin@sparkle.com');
      console.log('  Password: admin123');
      console.log('  IMPORTANT: Change this password in production!');
    } else {
      console.log('✓ Super admin already exists');
    }

    // 2. Create Entities
    let academy = await Entity.findOne({ slug: 'academy' });
    if (!academy) {
      academy = new Entity({
        name: 'Sparkle Academy',
        slug: 'academy',
        description: 'Empowering young minds through innovative education programs',
        targetAudience: 'Children aged 5-15',
        isActive: true,
      });
      await academy.save();
      console.log('✓ Sparkle Academy entity created');
    } else {
      console.log('✓ Sparkle Academy already exists');
    }

    let innovate = await Entity.findOne({ slug: 'innovate' });
    if (!innovate) {
      innovate = new Entity({
        name: 'Sparkle INNOVATE',
        slug: 'innovate',
        description: 'Advanced programs for young adults and professionals',
        targetAudience: 'Young adults and adults',
        isActive: true,
      });
      await innovate.save();
      console.log('✓ Sparkle INNOVATE entity created');
    } else {
      console.log('✓ Sparkle INNOVATE already exists');
    }

    // 3. Create Categories
    const academyCategories = [
      { name: 'STEM', slug: 'stem', description: 'Science, Technology, Engineering, and Mathematics programs', icon: '🔬' },
      { name: 'Arts & Crafts', slug: 'arts-crafts', description: 'Creative arts and handicraft programs', icon: '🎨' },
      { name: 'Language', slug: 'language', description: 'Language learning and literacy programs', icon: '📚' },
      { name: 'Sports', slug: 'sports', description: 'Physical education and sports programs', icon: '⚽' },
    ];

    for (const cat of academyCategories) {
      const exists = await Category.findOne({ slug: cat.slug, entityId: academy._id });
      if (!exists) {
        const category = new Category({
          ...cat,
          entityId: academy._id,
          isActive: true,
        });
        await category.save();
        console.log(`✓ Category "${cat.name}" created for Sparkle Academy`);
      }
    }

    const innovateCategories = [
      { name: 'Professional Development', slug: 'professional-development', description: 'Career advancement and skill development', icon: '💼' },
      { name: 'Technology', slug: 'technology', description: 'Advanced technology and coding programs', icon: '💻' },
      { name: 'Business', slug: 'business', description: 'Business management and entrepreneurship', icon: '📊' },
      { name: 'Design', slug: 'design', description: 'Graphic design and UI/UX programs', icon: '🎯' },
    ];

    for (const cat of innovateCategories) {
      const exists = await Category.findOne({ slug: cat.slug, entityId: innovate._id });
      if (!exists) {
        const category = new Category({
          ...cat,
          entityId: innovate._id,
          isActive: true,
        });
        await category.save();
        console.log(`✓ Category "${cat.name}" created for Sparkle INNOVATE`);
      }
    }

    // 4. Create Default Site Settings
    const settingsExist = await SiteSettings.findOne();
    if (!settingsExist) {
      const settings = new SiteSettings({
        primaryFont: 'Inter',
        homepageTitle: 'Welcome to Sparkle Education',
        homepageDescription: 'Empowering learners of all ages through innovative education programs',
        aboutUsTitle: 'About Sparkle',
        aboutUsContent: '<p>Sparkle is dedicated to providing high-quality education programs for learners of all ages.</p>',
        contactEmail: 'contact@sparkle.com',
        homepageImages: [],
        aboutUsImages: [],
      });
      await settings.save();
      console.log('✓ Default site settings created');
    } else {
      console.log('✓ Site settings already exist');
    }

    console.log('\n✓ Database seeded successfully!');
    console.log('\nYou can now:');
    console.log('1. Start the backend: npm run dev');
    console.log('2. Login to admin portal with admin@sparkle.com / admin123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
};

seedDatabase();
