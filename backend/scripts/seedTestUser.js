// scripts/seedTestUser.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createTestUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if user exists
    const existingUser = await User.findOne({ email: 'user@helpmate.com' });
    
    if (existingUser) {
      console.log('ℹ️  Test user already exists');
      process.exit(0);
    }

    // Create test user
    const user = await User.create({
      firstName: 'John',
      lastName: 'Doe',
      email: 'user@helpmate.com',
      password: 'user123',
      role: 'user',
      plan: 'Free',
      university: 'MIT',
      major: 'Computer Science',
      isEmailVerified: true,
    });

    console.log('✅ Test user created successfully');
    console.log('📧 Email: user@helpmate.com');
    console.log('🔑 Password: user123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  }
};

createTestUser();