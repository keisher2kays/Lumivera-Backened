// seedUser.js
const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = require('./config/db');

const createAdmin = async () => {
  await connectDB();

  // Check if admin exists
  const existingAdmin = await User.findOne({ username: 'admin' });
  if (existingAdmin) {
    console.log('⚠️ Admin user already exists! Updating password...');
    existingAdmin.password = 'admin123';
    await existingAdmin.save();
    console.log('✅ Admin password updated to: admin123');
  } else {
    await User.create({
      name: 'System Admin',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
    });
    console.log('✅ Admin user created successfully!');
  }

  mongoose.connection.close();
};

createAdmin();