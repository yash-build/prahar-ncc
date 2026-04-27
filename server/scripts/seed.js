/**
 * Database Seed Script
 * Run: node scripts/seed.js
 *
 * Creates:
 * - 1 ANO account
 * - 1 SUO account
 * - 10 sample cadets (mix of SD and SW)
 * - 3 sample notices
 *
 * CAUTION: Run only on a fresh database.
 * Will fail if records already exist (unique constraints).
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const User             = require('../models/User');
const Cadet            = require('../models/Cadet');
const Notice           = require('../models/Notice');
const Achievement      = require('../models/Achievement');
const AttendanceSession = require('../models/AttendanceSession');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Cadet.deleteMany({}),
      Notice.deleteMany({}),
      Achievement.deleteMany({}),
      AttendanceSession.deleteMany({}),
    ]);
    console.log('🗑️  Cleared existing data');

    // ── Create Users ────────────────────────────────────────────────────────
    const anoUser = await User.create({
      name:     'Lt. Ramesh Kumar',
      email:    'ano@shastra.ncc',
      password: 'ANOpassword@123',
      role:     'ANO',
    });

    const suoUser = await User.create({
      name:     'SUO Priya Sharma',
      email:    'suo@shastra.ncc',
      password: 'SUOpassword@123',
      role:     'SUO',
    });

    console.log('👤 Created ANO and SUO accounts');

    // ── Create Cadets ───────────────────────────────────────────────────────
    const cadets = await Cadet.insertMany([
      { name: 'Arjun Mehta',      regNo: 'NCC/2024/SD/001', wing: 'SD', rank: 'SUO',   year: 3 },
      { name: 'Priya Sharma',     regNo: 'NCC/2024/SW/001', wing: 'SW', rank: 'JUO',   year: 3 },
      { name: 'Rohan Singh',      regNo: 'NCC/2024/SD/002', wing: 'SD', rank: 'Sgt',   year: 2, isHonored: true, honorNote: 'Selected for Republic Day Camp 2024' },
      { name: 'Ananya Patel',     regNo: 'NCC/2024/SW/002', wing: 'SW', rank: 'Sgt',   year: 2 },
      { name: 'Vikram Nair',      regNo: 'NCC/2024/SD/003', wing: 'SD', rank: 'Cpl',   year: 2 },
      { name: 'Sneha Reddy',      regNo: 'NCC/2024/SW/003', wing: 'SW', rank: 'Cpl',   year: 1, isHonored: true, honorNote: 'Best Cadet — District Level 2024' },
      { name: 'Karan Verma',      regNo: 'NCC/2024/SD/004', wing: 'SD', rank: 'L/Cpl', year: 1 },
      { name: 'Divya Iyer',       regNo: 'NCC/2024/SW/004', wing: 'SW', rank: 'L/Cpl', year: 1 },
      { name: 'Aditya Bose',      regNo: 'NCC/2024/SD/005', wing: 'SD', rank: 'Cadet', year: 1 },
      { name: 'Meera Krishnan',   regNo: 'NCC/2024/SW/005', wing: 'SW', rank: 'Cadet', year: 1 },
    ]);

    console.log(`🪖 Created ${cadets.length} cadets`);

    // ── Create Achievements ─────────────────────────────────────────────────
    await Achievement.insertMany([
      {
        cadet:       cadets[2]._id, // Rohan Singh
        title:       'Republic Day Camp 2024',
        type:        'Camp',
        level:       'National',
        description: 'Selected and participated in RDC at Rajpath, New Delhi',
        date:        new Date('2024-01-26'),
        addedBy:     anoUser._id,
      },
      {
        cadet:       cadets[5]._id, // Sneha Reddy
        title:       'Best Cadet — District Level',
        type:        'Award',
        level:       'District',
        description: 'Awarded Best NCC Cadet at district-level selection camp',
        date:        new Date('2024-03-15'),
        addedBy:     anoUser._id,
      },
      {
        cadet:       cadets[0]._id, // Arjun Mehta
        title:       'Combined Annual Training Camp (CATC)',
        type:        'Camp',
        level:       'State',
        description: 'Completed CATC with A Grade',
        date:        new Date('2024-05-10'),
        addedBy:     anoUser._id,
      },
    ]);

    console.log('🏆 Created sample achievements');

    // ── Create Notices ──────────────────────────────────────────────────────
    await Notice.insertMany([
      {
        title:      '⚠️ Mandatory Parade This Sunday',
        content:    'All cadets of SD and SW wings are required to report in full uniform at 0600 hrs this Sunday. Attendance will be marked. No leave will be granted without prior written permission from ANO.',
        priority:   'urgent',
        targetWing: 'ALL',
        expiresAt:  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        isPinned:   true,
        createdBy:  anoUser._id,
      },
      {
        title:      'CATC Selection — Forms Available',
        content:    'Applications for Combined Annual Training Camp are now open. Interested cadets in Year 1 and Year 2 must submit forms to SUO by Friday. Physical fitness test will be held next week.',
        priority:   'normal',
        targetWing: 'ALL',
        expiresAt:  new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        createdBy:  suoUser._id,
      },
      {
        title:      'NCC Day Celebration — Nov 20',
        content:    'NCC Day celebration will be held at the college auditorium. All cadets are encouraged to participate in the march-past and cultural program. Rehearsals start from Nov 15.',
        priority:   'info',
        targetWing: 'ALL',
        expiresAt:  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy:  anoUser._id,
      },
    ]);

    console.log('📢 Created sample notices');

    // ── Create a sample attendance session ──────────────────────────────────
    const records = cadets.map(c => ({
      cadet:  c._id,
      status: Math.random() > 0.3 ? 'present' : 'absent',
    }));

    await AttendanceSession.create({
      date:         new Date(),
      sessionLabel: 'Morning Parade',
      wing:         'ALL',
      records,
      markedBy:     suoUser._id,
    });

    console.log('📊 Created sample attendance session');

    console.log('\n✅ DATABASE SEEDED SUCCESSFULLY!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('ANO Login → ano@shastra.ncc / ANOpassword@123');
    console.log('SUO Login → suo@shastra.ncc / SUOpassword@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
