import mongoose from 'mongoose';
import User from './src/models/User.js';
import { MONGO_URI } from './config.js';

async function makeAdmin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');
    
    // Find any user and make them Admin, or create a specific admin user
    const email = 'admin@smartfit.com';
    let user = await User.findOne({ email });
    
    if (user) {
      user.role = 'Admin';
      await user.save();
      console.log('Updated existing user to Admin:', email);
    } else {
      user = await User.create({
        name: 'Administrador',
        email: email,
        password: 'adminpassword',
        role: 'Admin'
      });
      console.log('Created new Admin user:', email, ' / adminpassword');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

makeAdmin();
