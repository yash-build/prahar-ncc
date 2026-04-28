require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Unit = require('../models/Unit');

const createCadet = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const unit = await Unit.findOne();
    
    const existing = await User.findOne({ email: 'cadet@lcit.edu.in' });
    if (!existing) {
      await User.create({
        name: 'Demo Cadet',
        email: 'cadet@lcit.edu.in',
        password: 'cadetpassword',
        role: 'cadet',
        unit: unit._id,
        isActive: true
      });
      console.log('✅ Cadet user created: cadet@lcit.edu.in / cadetpassword');
    } else {
      console.log('✅ Cadet user already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
createCadet();
