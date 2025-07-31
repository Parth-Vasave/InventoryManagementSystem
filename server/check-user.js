const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: 'admin@supplyflow.com' });
    
    if (user) {
      console.log('✅ User found:');
      console.log('Email:', user.email);
      console.log('Name:', user.name);
      console.log('Role:', user.role);
      console.log('Active:', user.isActive);
      
      // Test password
      const isMatch = await user.comparePassword('admin123');
      console.log('Password test:', isMatch ? '✅ Correct' : '❌ Incorrect');
    } else {
      console.log('❌ User not found');
      console.log('Creating user...');
      
      const newUser = new User({
        name: 'Admin User',
        email: 'admin@supplyflow.com',
        password: 'admin123',
        role: 'Admin'
      });
      
      await newUser.save();
      console.log('✅ User created successfully');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUser();