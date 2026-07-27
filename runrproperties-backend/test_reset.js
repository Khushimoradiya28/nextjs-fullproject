const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Create or get user
    let user = await User.findOne({ email: 'testreset@test.com' });
    if (!user) {
      user = await User.create({ name: 'Test Reset', email: 'testreset@test.com', password: 'password123', role: 'buyer' });
    }

    // 1. Forgot password
    console.log('--- Requesting Forgot Password ---');
    const forgotRes = await fetch('http://localhost:5000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'testreset@test.com' })
    });
    console.log(await forgotRes.json());
    
    // Wait briefly for DB to save token
    await new Promise(r => setTimeout(r, 1000));
    
    // Read from DB to get the hashed token for verification 
    // (Wait, we can't extract the unhashed token from DB! We have to capture it from console or write a temporary hook)
    
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
};

test();
