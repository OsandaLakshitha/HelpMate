// scripts/seedAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@helpmate.com' });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists');
      process.exit(0);
    }

    // Create admin
    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@helpmate.com',
      password: 'admin123', // Change this!
      role: 'admin',
      isEmailVerified: true,
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@helpmate.com');
    console.log('🔑 Password: admin123');
    console.log('⚠️  Please change the password immediately!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();