/**
 * PRAHAR — Master Data Management Script
 * Usage:
 *   node scripts/data-manager.js clear       → wipe all data
 *   node scripts/data-manager.js seed        → seed full demo data
 *   node scripts/data-manager.js reset       → clear + seed
 *   node scripts/data-manager.js accounts    → seed only accounts (no wipe)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env' });

const User         = require('../models/User');
const Unit         = require('../models/Unit');
const Cadet        = require('../models/Cadet');
const Notice       = require('../models/Notice');
const Leave        = require('../models/Leave');
const Achievement  = require('../models/Achievement');
const AuditLog     = require('../models/AuditLog');

let Event, Certificate, AttendanceSession, AttendanceEntry;
try { Event = require('../models/Event'); } catch {}
try { Certificate = require('../models/Certificate'); } catch {}
try { AttendanceSession = require('../models/AttendanceSession'); } catch {}
try { AttendanceEntry = require('../models/AttendanceEntry'); } catch {}

const cmd = process.argv[2] || 'seed';

// ── Helpers ─────────────────────────────────────────────────────
const hash = (p) => bcrypt.hash(p, 10);
const log  = (msg) => console.log(`  ✓ ${msg}`);

// ── CLEAR ────────────────────────────────────────────────────────
async function clearAll() {
  console.log('\n🗑  Clearing all data...');
  const models = [User, Unit, Cadet, Notice, Leave, Achievement, AuditLog,
    Event, Certificate, AttendanceSession, AttendanceEntry].filter(Boolean);
  for (const m of models) { await m.deleteMany({}); log(`Cleared ${m.modelName}`); }
  console.log('✅ All data cleared.\n');
}

// ── SEED ─────────────────────────────────────────────────────────
async function seedAll() {
  console.log('\n🌱 Seeding demo data...');

  // ── Unit ──
  const unit = await Unit.create({
    name: '17 CG BN NCC',
    collegeName: 'LCIT College',
    city: 'Bilaspur',
    state: 'Chhattisgarh',
    nccGroup: 'CG Directorate',
    slug: 'lcit-17-cg-bn-ncc',
    motto: 'Unity and Discipline',
    currentBatchYear: '2024-25',
    isPublic: true
  });
  log(`Unit: ${unit.name}`);

  // ── Users ──
  const P = 'prahar@2026';
  const [anoUser, suoUser, juo1User, c1User, c2User, c3User, c4User, c5User] = await Promise.all([
    User.create({ name: 'Lt Yash Tiwari',   email: 'ano@lcit.edu.in',        password: await hash(P), role: 'ANO',   unit: unit._id, isActive: true }),
    User.create({ name: 'Rahul Sharma',      email: 'suo.rahul@lcit.edu.in',  password: await hash(P), role: 'SUO',   unit: unit._id, isActive: true }),
    User.create({ name: 'Priya Singh',       email: 'juo.priya@lcit.edu.in',  password: await hash(P), role: 'SUO',   unit: unit._id, isActive: true }),
    User.create({ name: 'Arjun Patel',       email: 'arjun@lcit.edu.in',      password: await hash(P), role: 'cadet', unit: unit._id, isActive: true }),
    User.create({ name: 'Sneha Verma',       email: 'sneha@lcit.edu.in',      password: await hash(P), role: 'cadet', unit: unit._id, isActive: true }),
    User.create({ name: 'Karan Mishra',      email: 'karan@lcit.edu.in',      password: await hash(P), role: 'cadet', unit: unit._id, isActive: true }),
    User.create({ name: 'Divya Nair',        email: 'divya@lcit.edu.in',      password: await hash(P), role: 'cadet', unit: unit._id, isActive: true }),
    User.create({ name: 'Rohan Gupta',       email: 'rohan@lcit.edu.in',      password: await hash(P), role: 'cadet', unit: unit._id, isActive: true }),
  ]);
  log('Created 8 user accounts');

  // ── Cadets ──
  const [suoCadet, juoCadet, c1, c2, c3, c4, c5] = await Promise.all([
    Cadet.create({ unitId: unit._id, authId: suoUser._id, serviceNumber: 'CG21SDA10001', name: 'Rahul Sharma',  wing: 'SD', rank: 'SUO',   yearOfStudy: 3, batchYear: '2024-25', gender: 'M', status: 'ACTIVE', isSUOPosition: true,  isHonorRoll: true, honorRollReason: 'Best All-Round Cadet', honorRollQuote: 'Discipline is the bridge between goals and accomplishment.', showOnPublic: true, addedBy: anoUser._id }),
    Cadet.create({ unitId: unit._id, authId: juo1User._id, serviceNumber: 'CG21SWA10002', name: 'Priya Singh',  wing: 'SW', rank: 'JUO',   yearOfStudy: 3, batchYear: '2024-25', gender: 'F', status: 'ACTIVE', isJUOPosition: true, isHonorRoll: true, honorRollReason: 'Best SW Wing Cadet', honorRollQuote: 'Strength does not come from physical capacity.', showOnPublic: true, addedBy: anoUser._id }),
    Cadet.create({ unitId: unit._id, authId: c1User._id,   serviceNumber: 'CG22SDA10003', name: 'Arjun Patel',  wing: 'SD', rank: 'SGT',   yearOfStudy: 2, batchYear: '2024-25', gender: 'M', status: 'ACTIVE', showOnPublic: true, addedBy: anoUser._id }),
    Cadet.create({ unitId: unit._id, authId: c2User._id,   serviceNumber: 'CG22SWA10004', name: 'Sneha Verma',  wing: 'SW', rank: 'CPL',   yearOfStudy: 2, batchYear: '2024-25', gender: 'F', status: 'ACTIVE', showOnPublic: true, addedBy: anoUser._id }),
    Cadet.create({ unitId: unit._id, authId: c3User._id,   serviceNumber: 'CG23SDA10005', name: 'Karan Mishra', wing: 'SD', rank: 'CADET', yearOfStudy: 1, batchYear: '2024-25', gender: 'M', status: 'ACTIVE', showOnPublic: true, addedBy: anoUser._id }),
    Cadet.create({ unitId: unit._id, authId: c4User._id,   serviceNumber: 'CG23SWA10006', name: 'Divya Nair',   wing: 'SW', rank: 'LCPL',  yearOfStudy: 1, batchYear: '2024-25', gender: 'F', status: 'ACTIVE', showOnPublic: false, addedBy: anoUser._id }),
    Cadet.create({ unitId: unit._id, authId: c5User._id,   serviceNumber: 'CG23SDA10007', name: 'Rohan Gupta',  wing: 'SD', rank: 'CADET', yearOfStudy: 1, batchYear: '2024-25', gender: 'M', status: 'ACTIVE', showOnPublic: true,  addedBy: anoUser._id }),
  ]);
  log('Created 7 cadet records');

  const allCadets = [suoCadet, juoCadet, c1, c2, c3, c4, c5];

  // ── Notices ──
  const now = new Date();
  await Notice.insertMany([
    { unitId: unit._id, title: 'Annual Training Camp 2025 — Mandatory Attendance', body: 'All cadets are required to report at the parade ground by 0600 hrs on 15 June 2025. Uniform: No. 2A. Carry ration card and NCC ID.', priority: 'URGENT',    targetAudience: 'ALL', status: 'PUBLISHED', publishedAt: now, expiresAt: new Date(now.getTime() + 30*86400000), createdBy: anoUser._id },
    { unitId: unit._id, title: 'C-Certificate Exam Schedule Released',             body: 'Cadets appearing for C-Cert exam must submit their forms by 10th June. Contact the SUO for assistance.', priority: 'IMPORTANT', targetAudience: 'SD',  status: 'PUBLISHED', publishedAt: now, expiresAt: new Date(now.getTime() + 20*86400000), createdBy: anoUser._id },
    { unitId: unit._id, title: 'PT Schedule Update — SW Wing',                      body: 'Physical training timings for SW Wing have been revised. New schedule: Mon/Wed/Fri 0530-0700 hrs.', priority: 'INFORMATION', targetAudience: 'SW', status: 'PUBLISHED', publishedAt: now, expiresAt: new Date(now.getTime() + 15*86400000), createdBy: suoUser._id, approvedBy: anoUser._id },
    { unitId: unit._id, title: 'Independence Day Parade Practice',                  body: 'Parade rehearsals begin from 1st August. All cadets must be present without fail.', priority: 'IMPORTANT',   targetAudience: 'ALL', status: 'PENDING_APPROVAL', expiresAt: new Date(now.getTime() + 60*86400000), createdBy: suoUser._id },
  ]);
  log('Created 4 notices (1 pending approval)');

  // ── Achievements ──
  await Achievement.insertMany([
    { unitId: unit._id, cadetId: suoCadet._id, name: 'Republic Day Camp, Delhi',       type: 'CAMP',        level: 'NATIONAL', result: 'Participated — Represented CG Directorate', date: new Date('2025-01-26'), status: 'APPROVED', showOnPublic: true, suggestedBy: anoUser._id, approvedBy: anoUser._id, addedBy: anoUser._id },
    { unitId: unit._id, cadetId: juoCadet._id, name: 'Best Cadet — State Level',       type: 'AWARD',       level: 'STATE',    result: 'Winner',                                   date: new Date('2024-11-15'), status: 'APPROVED', showOnPublic: true, suggestedBy: anoUser._id, approvedBy: anoUser._id, addedBy: anoUser._id },
    { unitId: unit._id, cadetId: c1._id,        name: 'Shooting Competition .22 Rifle', type: 'COMPETITION', level: 'STATE',    result: 'Gold Medal',                               date: new Date('2024-12-10'), status: 'APPROVED', showOnPublic: true, suggestedBy: anoUser._id, approvedBy: anoUser._id, addedBy: anoUser._id },
    { unitId: unit._id, cadetId: c2._id,        name: 'Blood Donation Camp Organizer',  type: 'SOCIAL_SERVICE', level: 'UNIT',  result: 'Organized — 47 units collected',          date: new Date('2025-02-01'), status: 'APPROVED', showOnPublic: false, suggestedBy: suoUser._id, approvedBy: anoUser._id, addedBy: anoUser._id },
  ]);
  log('Created 4 achievements');

  // ── Leaves ──
  await Leave.insertMany([
    { unitId: unit._id, cadetId: c1._id, reason: 'Medical appointment — dental surgery', startDate: new Date('2025-06-10'), endDate: new Date('2025-06-12'), status: 'PENDING' },
    { unitId: unit._id, cadetId: c2._id, reason: "Family function — sister's wedding",   startDate: new Date('2025-06-20'), endDate: new Date('2025-06-22'), status: 'APPROVED', reviewedBy: anoUser._id, reviewedAt: new Date() },
    { unitId: unit._id, cadetId: c3._id, reason: 'Home sick, fever',                     startDate: new Date('2025-05-01'), endDate: new Date('2025-05-03'), status: 'REJECTED', reviewedBy: anoUser._id, reviewedAt: new Date(), remarks: 'Insufficient notice provided.' },
  ]);
  log('Created 3 leave applications (Pending/Approved/Rejected)');

  // ── Events ──
  if (Event) {
    await Event.insertMany([
      { unitId: unit._id, title: 'Annual Training Camp 2025', type: 'CAMP', startDate: new Date('2025-06-15'), endDate: new Date('2025-06-22'), venue: 'Raipur NCC Camp, Chhattisgarh', description: 'Annual 8-day training camp with drill, weapon training, and adventure activities.', isCompulsory: true, status: 'UPCOMING', gallery: [], createdBy: anoUser._id },
      { unitId: unit._id, title: 'Republic Day Parade Practice', type: 'PARADE', startDate: new Date('2025-01-20'), endDate: new Date('2025-01-26'), venue: 'College Parade Ground', description: 'Practice sessions for Republic Day parade contingent.', isCompulsory: true, status: 'COMPLETED', gallery: [], createdBy: anoUser._id },
      { unitId: unit._id, title: 'B-Certificate Written Exam', type: 'TRAINING', startDate: new Date('2025-07-05'), venue: 'Examination Hall, Block C', description: 'B-Certificate theory examination for Year 2 cadets.', isCompulsory: true, status: 'UPCOMING', gallery: [], createdBy: anoUser._id },
      { unitId: unit._id, title: 'Blood Donation Camp', type: 'OTHER', startDate: new Date('2025-02-01'), venue: 'College Campus', description: 'NCC organized blood donation camp in collaboration with district hospital.', isCompulsory: false, status: 'COMPLETED', gallery: [], createdBy: anoUser._id },
    ]);
    log('Created 4 events');
  }

  // ── Certificates ──
  if (Certificate) {
    await Certificate.insertMany([
      { unitId: unit._id, cadetId: suoCadet._id, type: 'C_CERTIFICATE', title: 'C Certificate — NCC', issueDate: new Date('2024-03-15'), isVerified: true, verifiedBy: anoUser._id, addedBy: anoUser._id },
      { unitId: unit._id, cadetId: juoCadet._id, type: 'C_CERTIFICATE', title: 'C Certificate — NCC', issueDate: new Date('2024-03-15'), isVerified: true, verifiedBy: anoUser._id, addedBy: anoUser._id },
      { unitId: unit._id, cadetId: c1._id,        type: 'B_CERTIFICATE', title: 'B Certificate — NCC', issueDate: new Date('2024-04-10'), isVerified: true, verifiedBy: anoUser._id, addedBy: anoUser._id },
    ]);
    log('Created 3 certificates');
  }

  console.log('\n✅ Demo data seeded successfully!\n');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ACCOUNT CREDENTIALS (all passwords: prahar@2026)');
  console.log('═══════════════════════════════════════════════════════');
  console.log('  ANO  →  ano@lcit.edu.in         (Full control)');
  console.log('  SUO  →  suo.rahul@lcit.edu.in   (Rahul Sharma, SD Wing)');
  console.log('  JUO  →  juo.priya@lcit.edu.in   (Priya Singh, SW Wing)');
  console.log('  Cadet→  arjun@lcit.edu.in        (Arjun Patel, SGT)');
  console.log('  Cadet→  sneha@lcit.edu.in         (Sneha Verma, CPL)');
  console.log('  Cadet→  karan@lcit.edu.in         (Karan Mishra, Yr1)');
  console.log('  Cadet→  divya@lcit.edu.in          (Divya Nair, Yr1)');
  console.log('  Cadet→  rohan@lcit.edu.in          (Rohan Gupta, Yr1)');
  console.log('═══════════════════════════════════════════════════════\n');
}

// ── Run ──────────────────────────────────────────────────────────
async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('🔗 Connected to MongoDB');

  if (cmd === 'clear')    { await clearAll(); }
  else if (cmd === 'seed') { await seedAll(); }
  else if (cmd === 'reset') { await clearAll(); await seedAll(); }
  else if (cmd === 'accounts') {
    // Just seed the basic accounts without clearing
    const unit = await Unit.findOne() || await Unit.create({ name: '17 CG BN NCC', location: 'LCIT Campus, Bilaspur', anoName: 'Lt Yash Tiwari' });
    const P = 'prahar@2026';
    const upsert = (email, data) => User.findOneAndUpdate({ email }, { ...data, password: bcrypt.hashSync(P, 10) }, { upsert: true, new: true });
    await upsert('ano@lcit.edu.in',        { name: 'Lt Yash Tiwari',  role: 'ANO',   unit: unit._id, isActive: true });
    await upsert('suo.rahul@lcit.edu.in',  { name: 'Rahul Sharma',    role: 'SUO',   unit: unit._id, isActive: true });
    await upsert('juo.priya@lcit.edu.in',  { name: 'Priya Singh',     role: 'SUO',   unit: unit._id, isActive: true });
    await upsert('arjun@lcit.edu.in',      { name: 'Arjun Patel',     role: 'cadet', unit: unit._id, isActive: true });
    console.log('✅ Accounts updated (no data wiped)');
  } else {
    console.log('Unknown command. Use: clear | seed | reset | accounts');
  }

  process.exit(0);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });
