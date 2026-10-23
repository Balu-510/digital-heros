import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../modules/user/user.model.js';
import Charity from '../modules/charity/charity.model.js';
import { connectDB } from '../config/db.js';

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data (Optional: Be careful running this in production!)
    await User.deleteMany();
    await Charity.deleteMany();

    console.log('Previous data cleared.');

    // Inject the Admin User
    const adminUser = await User.create({
      email: process.env.ADMIN_EMAIL || 'admin@digitalheroes.co.in',
      password: process.env.ADMIN_PASSWORD || 'AdminPassword123!',
      role: 'admin',
      subscription: { status: 'active', plan: 'none' } 
    });

    console.log(`Admin user created: ${adminUser.email}`);

    const sampleCharities = [
      {
        name: 'The Fairway Foundation',
        description: 'Providing access to sports and mentorship for underprivileged youth across the nation.',
        isFeatured: true
      },
      {
        name: 'Green Earth Initiative',
        description: 'Protecting natural habitats and promoting sustainable ecosystem conservation.',
        isFeatured: true
      },
      {
        name: 'Global Health Action',
        description: 'Delivering critical medical supplies and healthcare infrastructure to developing regions.',
        isFeatured: false
      }
    ];

    await Charity.insertMany(sampleCharities);
    console.log('Sample charities injected successfully.');

    console.log('Database Seeding Complete!');
    process.exit();
  } catch (error) {
    console.error(`Seeding Error: ${error.message}`);
    process.exit(1);
  }
};

seedData();