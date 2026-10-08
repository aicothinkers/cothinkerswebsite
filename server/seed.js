const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB. Creating admin...');
    await User.deleteMany({}); // Warning: Clears existing users
    
    await User.create({
      name: 'Admin User',
      email: 'admin@aicothinker.com',
      password: 'password123', // Will be hashed automatically
      role: 'admin'
    });
    
    console.log('Admin created! Email: admin@backtobase.com | Pass: password123');
    process.exit();
  });