// Adds sample charities ONLY if the collection is empty. Safe to run on live data
// (unlike `npm run seed`, it never deletes users or charities).
import 'dotenv/config';
import mongoose from 'mongoose';
import Charity from '../modules/charity/charity.model.js';
import { connectDB } from '../config/db.js';

const sampleCharities = [
  {
    name: 'The Fairway Foundation',
    description: 'Providing access to sports and mentorship for underprivileged youth across the nation.',
    isFeatured: true,
  },
  {
    name: 'Green Earth Initiative',
    description: 'Protecting natural habitats and promoting sustainable ecosystem conservation.',
    isFeatured: true,
  },
  {
    name: 'Global Health Action',
    description: 'Delivering critical medical supplies and healthcare infrastructure to developing regions.',
    isFeatured: true,
  },
];

const run = async () => {
  try {
    await connectDB();
    const count = await Charity.countDocuments();
    if (count > 0) {
      console.log(`Charities already exist (${count}). Nothing to do.`);
    } else {
      await Charity.insertMany(sampleCharities);
      console.log(`Added ${sampleCharities.length} sample charities.`);
    }
  } catch (error) {
    console.error(`Seeding error: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
