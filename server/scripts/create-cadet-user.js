require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Cadet = require('../models/Cadet');
const Unit = require('../models/Unit');

const createCadet = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const unit = await Unit.findOne();
    if (!unit) {
      console.error('❌ No unit found. Run seed first.');
      process.exit(1);
    }

    const email = 'cadet@lcit.edu.in';
    const password = 'prahar@2026';

    let user = await User.findOne({ email });
    if (user) {
      user.password = password;
      await user.save();
      console.log('✅ Updated existing cadet user');
    } else {
      user = await User.create({
        name: 'Test Cadet',
        email,
        password,
        role: 'cadet',
        unit: unit._id
      });
      console.log('✅ Created new cadet user');
    }

    // Link to a cadet record if exists
    let cadet = await Cadet.findOne({ contactEmail: email });
    if (!cadet) {
      cadet = await Cadet.findOne({ unitId: unit._id }); // Link to first available
      if (cadet) {
        cadet.authId = user._id;
        cadet.contactEmail = email;
        await cadet.save();
        console.log(`✅ Linked user to cadet: ${cadet.name}`);
      } else {
        console.log('⚠️ No cadet records found to link');
      }
    }

    console.log('─────────────────────────────────');
    console.log('Cadet Login: cadet@lcit.edu.in / prahar@2026');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed:', err.message);
    process.exit(1);
  }
};

createCadet();
