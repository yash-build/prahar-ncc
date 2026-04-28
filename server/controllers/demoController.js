/**
 * Demo Seed Controller
 * ANO-only endpoint that populates the database with realistic demo data
 * POST /api/demo/seed
 */
const User        = require('../models/User');
const Unit        = require('../models/Unit');
const Cadet       = require('../models/Cadet');
const Notice      = require('../models/Notice');
const Achievement = require('../models/Achievement');

const CADET_NAMES = [
  'Aditya Sharma',   'Priya Singh',    'Rahul Verma',    'Kavita Patel',   'Suresh Yadav',
  'Meena Gupta',     'Vikash Tiwari',  'Anjali Dubey',   'Arjun Sahu',     'Rekha Chouhan',
  'Deepak Mishra',   'Sunita Raj',     'Karan Kumar',    'Pooja Bose',     'Rohit Thakur',
  'Seema Nair',      'Amit Pandey',    'Divya Joshi',    'Vijay Das',      'Tanya Mehta',
  'Manish Roy',      'Lalita Rao',     'Nikhil Shukla',  'Shreya Dixit',   'Govind Patel',
  'Nisha Yadav',     'Abhishek Singh', 'Riya Sharma',    'Anoop Verma',    'Sangeeta Kumar',
];

const RANKS  = ['CADET','LCPL','CPL','SGT','CADET','CADET','LCPL','CPL','SGT','CADET'];
const WINGS  = ['SD','SD','SW','SD','SW','SD','SW','SD','SW','SD'];
const YEARS  = [1,1,2,2,3,1,2,3,1,2];

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

const NOTICE_TEMPLATES = [
  { title: 'B-Certificate Exam Schedule', body: 'B-Cert exams will be held in December 2024. All second-year cadets must prepare and report to ANO by 1 December.', priority: 'URGENT' },
  { title: 'Republic Day Camp Selection', body: 'RDC selection trials on 20 October. Interested cadets must report in full uniform with documents.', priority: 'URGENT' },
  { title: 'Annual NCC Day Celebration', body: 'NCC Day on 27 November. Compulsory attendance in ceremonial uniform for all active cadets.', priority: 'IMPORTANT' },
  { title: 'Annual Training Camp – Date Finalized', body: 'ATC will commence 15 January. All cadets report to parade ground by 06:00 hrs. Full kit required.', priority: 'IMPORTANT' },
  { title: 'Thal Sena Camp Notification', body: 'TSC nominations open. Interested SD wing cadets apply by 10 November through their wing commander.', priority: 'INFORMATION' },
];

const seedDemo = async (req, res, next) => {
  try {
    if (req.user.role !== 'ANO') {
      return res.status(403).json({ success: false, message: 'ANO access only.' });
    }

    const ano = req.user;

    // Find or create unit
    let unit = await Unit.findOne({});
    if (!unit) {
      unit = await Unit.create({
        name: '17 CG BN NCC', collegeName: 'LCIT College', city: 'Bilaspur',
        state: 'Chhattisgarh', nccGroup: 'CG Group HQ', slug: 'lcit-ncc',
        motto: 'Unity and Discipline', isPublic: true
      });
    }

    // Clear existing cadets/notices/achievements (keep users)
    await Promise.all([
      Cadet.deleteMany({ unitId: unit._id }),
      Notice.deleteMany({ unitId: unit._id }),
      Achievement.deleteMany({ unitId: unit._id }),
    ]);

    // Create 30 cadets
    const cadetDocs = CADET_NAMES.map((name, i) => ({
      unitId:          unit._id,
      serviceNumber:   `CG/${WINGS[i % 10]}/${2024 - Math.floor(i / 10)}/${String(i + 1).padStart(3, '0')}`,
      name,
      wing:            WINGS[i % 10],
      rank:            i === 0 ? 'SUO' : i === 1 ? 'JUO' : RANKS[i % 10],
      yearOfStudy:     YEARS[i % 10],
      batchYear:       '2024-25',
      status:          i < 27 ? 'ACTIVE' : 'PASSED_OUT',
      showOnPublic:    i < 25,
      isSUOPosition:   i === 0,
      isJUOPosition:   i === 1,
      yearbookMessage: MESSAGES[i % MESSAGES.length],
      addedBy:         ano._id,
    }));

    const cadets = await Cadet.insertMany(cadetDocs);

    // Create 5 notices
    await Notice.insertMany(
      NOTICE_TEMPLATES.map(n => ({
        unitId:         unit._id,
        title:          n.title,
        body:           n.body,
        priority:       n.priority,
        status:         'PUBLISHED',
        targetAudience: 'ALL',
        expiresAt:      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        publishedAt:    new Date(),
        createdBy:      ano._id,
      }))
    );

    // Create achievements for first 5 cadets
    const achievementData = [
      { i: 0, type: 'AWARD',       name: 'Best Cadet — RDC New Delhi 2024',      level: 'NATIONAL', result: 'Best Cadet Award',         date: '2024-01-26' },
      { i: 1, type: 'COMPETITION', name: 'State Shooting Championship',           level: 'STATE',    result: 'Gold Medal — First Place', date: '2024-03-12' },
      { i: 2, type: 'CAMP',        name: 'CATC — Central Air Training Camp',      level: 'STATE',    result: 'Participated',             date: '2024-07-20' },
      { i: 3, type: 'AWARD',       name: 'Best SW Cadet — Annual Parade 2024',    level: 'UNIT',     result: 'Best Wing Cadet',          date: '2024-11-27' },
      { i: 4, type: 'COMPETITION', name: 'NCC Athletic Meet — 200m Sprint',       level: 'STATE',    result: 'Silver Medal',             date: '2024-09-05' },
    ];

    if (cadets.length >= 5) {
      await Achievement.insertMany(
        achievementData.map(a => ({
          cadetId:    cadets[a.i]._id,
          unitId:     unit._id,
          type:       a.type,
          name:       a.name,
          level:      a.level,
          result:     a.result,
          date:       new Date(a.date),
          showOnPublic: true,
          status:     'APPROVED',
          addedBy:    ano._id,
        }))
      );
    }

    res.json({
      success: true,
      message: 'Demo data seeded successfully!',
      summary: {
        cadets:       cadets.length,
        notices:      NOTICE_TEMPLATES.length,
        achievements: achievementData.length,
        unit:         unit.name,
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = { seedDemo };
