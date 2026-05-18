const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });
const User = require('../models/User');
const Unit = require('../models/Unit');
const Cadet = require('../models/Cadet');

async function seedTestAccounts() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');

  let unit = await Unit.findOne();
  if (!unit) {
    unit = await Unit.create({
      name: '17 CG BN NCC',
      location: 'LCIT College, Bilaspur',
      anoName: 'Yash Tiwari'
    });
  }

  const password = await bcrypt.hash('prahar@2026', 10);

  // 1. ANO
  await User.findOneAndUpdate(
    { email: 'ano@lcit.edu.in' },
    { name: 'Yash Tiwari', password, role: 'ANO', unit: unit._id, isActive: true },
    { upsert: true }
  );

  // 2. SUO
  const suoUser = await User.findOneAndUpdate(
    { email: 'suo@lcit.edu.in' },
    { name: 'Senior Cadet', password, role: 'SUO', unit: unit._id, isActive: true },
    { upsert: true, new: true }
  );
  await Cadet.findOneAndUpdate(
    { authId: suoUser._id },
    {
      unitId: unit._id, serviceNumber: 'CG21SDA10001', name: 'Senior Cadet',
      wing: 'SD', rank: 'SUO', yearOfStudy: 3, batchYear: '2024-25', isSUOPosition: true, status: 'ACTIVE'
    },
    { upsert: true }
  );

  // 3. Cadet
  const cadetUser = await User.findOneAndUpdate(
    { email: 'cadet@lcit.edu.in' },
    { name: 'Junior Cadet', password, role: 'cadet', unit: unit._id, isActive: true },
    { upsert: true, new: true }
  );
  await Cadet.findOneAndUpdate(
    { authId: cadetUser._id },
    {
      unitId: unit._id, serviceNumber: 'CG23SDA10002', name: 'Junior Cadet',
      wing: 'SD', rank: 'CADET', yearOfStudy: 1, batchYear: '2024-25', status: 'ACTIVE'
    },
    { upsert: true }
  );

  console.log('Test accounts created successfully!');
  console.log('ANO: ano@lcit.edu.in / prahar@2026');
  console.log('SUO: suo@lcit.edu.in / prahar@2026');
  console.log('Cadet: cadet@lcit.edu.in / prahar@2026');
  process.exit(0);
}

seedTestAccounts();
