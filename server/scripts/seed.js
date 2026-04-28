// ERROR FIX #6: Always use __dirname for path resolution
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const mongoose = require('mongoose');
const User     = require('../models/User');
const Unit     = require('../models/Unit');
const Cadet    = require('../models/Cadet');
const Notice   = require('../models/Notice');
const Achievement = require('../models/Achievement');

const RANKS  = ['CADET', 'LCPL', 'CPL', 'SGT', 'SGT', 'CADET', 'CADET', 'LCPL', 'CPL', 'JUO'];
const WINGS  = ['SD', 'SD', 'SD', 'SW', 'SW', 'SD', 'SW', 'SD', 'SW', 'SD'];
const YEARS  = [1, 1, 1, 2, 2, 2, 3, 3, 3, 2];

const CADET_NAMES = [
  'Yash Tiwari',    'Rahul Sahu',    'Priya Sharma',   'Aman Verma',    'Vikash Singh',
  'Riya Gupta',     'Sunil Yadav',   'Neha Patel',     'Deepak Raj',    'Anita Dubey',
  'Karan Kumar',    'Pooja Mishra',  'Rohit Thakur',   'Seema Dixit',   'Amit Shukla',
  'Kavita Nair',    'Raj Pandey',    'Shreya Joshi',   'Vijay Chouhan', 'Meenu Bai',
  'Arjun Singh',    'Divya Rao',     'Nikhil Das',     'Tanya Mehta',   'Manish Patel',
  'Sunita Yadav',   'Govind Sahu',   'Nisha Verma',    'Abhishek Roy',  'Lalita Bose',
];

const MESSAGES = [
  'Unity and Discipline — my guiding principles.',
  'Jai Hind! Proud to serve the nation.',
  'NCC has shaped who I am today.',
  'Marching towards a better tomorrow.',
  'Service before self — always.',
  'Every parade builds character.',
  'Three years of sweat and glory.',
  'From cadet to leader — the NCC way.',
  'The uniform teaches you everything.',
  'Discipline is freedom in disguise.',
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // Clear existing
    await Promise.all([
      User.deleteMany({}), Unit.deleteMany({}),
      Cadet.deleteMany({}), Notice.deleteMany({}),
      Achievement.deleteMany({})
    ]);

    // Create unit
    const unit = await Unit.create({
      name: '17 CG BN NCC', collegeName: 'LCIT College', city: 'Bilaspur',
      state: 'Chhattisgarh', nccGroup: 'CG Group HQ', slug: 'lcit-ncc',
      motto: 'Unity and Discipline', isPublic: true
    });

    // ANO — plain password; User pre-save hook hashes it
    const ano = await User.create({
      name: 'Lt Col R.K. Sharma', email: 'ano@lcit.edu.in',
      password: 'ano@lcit2024',
      role: 'ANO', unit: unit._id, isActive: true
    });

    // SUO 1
    await User.create({
      name: 'Yash Tiwari', email: 'suo@lcit.edu.in',
      password: 'suo@lcit2024',
      role: 'SUO', unit: unit._id, isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    // SUO 2
    await User.create({
      name: 'Priya Sharma', email: 'suo2@lcit.edu.in',
      password: 'suo2@lcit2024',
      role: 'SUO', unit: unit._id, isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });

    // 30 Cadets
    const cadets = CADET_NAMES.map((name, i) => ({
      unitId:          unit._id,
      serviceNumber:   `CG/${WINGS[i % 10]}/${2024 - Math.floor(i / 10)}/0${String(i + 1).padStart(2, '0')}`,
      name,
      wing:            WINGS[i % 10],
      rank:            i === 0 ? 'SUO' : i === 1 ? 'JUO' : RANKS[i % 10],
      yearOfStudy:     YEARS[i % 10],
      batchYear:       '2024-25',
      status:          'ACTIVE',
      showOnPublic:    true,
      isSUOPosition:   i === 0,
      isJUOPosition:   i === 1,
      yearbookMessage: MESSAGES[i % MESSAGES.length],
      addedBy:         ano._id,
    }));

    await Cadet.insertMany(cadets);

    // Sample Notices
    await Notice.insertMany([
      { unitId: unit._id, title: 'B-Certificate Exam Schedule', body: 'B-Cert exams will be held in December 2024. All second-year cadets must prepare and report to ANO.', priority: 'URGENT', status: 'PUBLISHED', targetAudience: 'ALL', expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), publishedAt: new Date(), createdBy: ano._id },
      { unitId: unit._id, title: 'Republic Day Camp Selection', body: 'RDC selection trials on 20 October. Interested cadets must report in full uniform with documents.', priority: 'URGENT', status: 'PUBLISHED', targetAudience: 'ALL', expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), publishedAt: new Date(), createdBy: ano._id },
      { unitId: unit._id, title: 'Annual NCC Day Celebration', body: 'NCC Day on 27 November. Compulsory attendance in ceremonial uniform for all active cadets.', priority: 'IMPORTANT', status: 'PUBLISHED', targetAudience: 'ALL', expiresAt: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), publishedAt: new Date(), createdBy: ano._id },
    ]);

    // Get first 2 cadets for achievements
    const seededCadets = await Cadet.find({ unitId: unit._id }).limit(2);
    if (seededCadets.length >= 2) {
      await Achievement.insertMany([
        { cadetId: seededCadets[0]._id, unitId: unit._id, type: 'AWARD', name: 'Best Cadet — RDC New Delhi 2024', level: 'NATIONAL', result: 'Best Cadet Award', date: new Date('2024-01-26'), showOnPublic: true, status: 'APPROVED', addedBy: ano._id },
        { cadetId: seededCadets[1]._id, unitId: unit._id, type: 'COMPETITION', name: 'State Shooting Championship', level: 'STATE', result: 'Gold Medal — First Place', date: new Date('2024-03-12'), showOnPublic: true, status: 'APPROVED', addedBy: ano._id },
      ]);
    }

    console.log('✅ FULL SEED COMPLETE!');
    console.log('─────────────────────────────────');
    console.log('ANO  Login: ano@lcit.edu.in / ano@lcit2024');
    console.log('SUO  Login: suo@lcit.edu.in / suo@lcit2024');
    console.log('SUO2 Login: suo2@lcit.edu.in / suo2@lcit2024');
    console.log(`God Mode:   ${process.env.YT_GOD_SECRET}`);
    console.log(`Cadets seeded: ${cadets.length}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
