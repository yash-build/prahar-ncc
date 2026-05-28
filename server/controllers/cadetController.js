const Cadet = require('../models/Cadet');
const AuditLog = require('../models/AuditLog');
const CadetEditLog = require('../models/CadetEditLog');
const cloudinary = require('../config/cloudinary');
const { uploadBuffer } = require('../services/cloudinaryUpload');

// GET /api/cadets
const getCadets = async (req, res, next) => {
  try {
    const { wing, rank, status, search, yearOfStudy, page = 1, limit = 50 } = req.query;
    const query = { unitId: req.user.unit };

    if (wing) query.wing = wing;
    if (rank) query.rank = rank;
    if (status) query.status = status;
    if (yearOfStudy) query.yearOfStudy = Number(yearOfStudy);
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { serviceNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Cadet.countDocuments(query);
    const cadets = await Cadet.find(query)
      .sort({ rank: 1, name: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, cadets, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) { next(err); }
};

// GET /api/cadets/:id
const getCadet = async (req, res, next) => {
  try {
    const cadet = await Cadet.findById(req.params.id).populate('addedBy', 'name');
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found.' });
    res.json({ success: true, cadet });
  } catch (err) { next(err); }
};

// POST /api/cadets
const createCadet = async (req, res, next) => {
  try {
    let photoUrl, photoThumbUrl;

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'prahar/cadets');
      photoUrl = result.secure_url;
      photoThumbUrl = result.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/');
    }

    const firstName = (req.body.name || '').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
    const last4     = (req.body.serviceNumber || '').slice(-4);
    const loginId   = `${firstName}@${last4}`;
    const password  = `${firstName}@${last4}`;
    const email     = req.body.email || `${loginId}@lcit.edu.in`;

    let authId = null;
    const User = require('../models/User');
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      const hashed = await require('bcryptjs').hash(password, 10);
      const user   = await User.create({ 
        name: req.body.name, 
        email, 
        password: hashed, 
        role: 'cadet', 
        unit: req.user.unit,
        accountStatus: 'PENDING_APPROVAL'
      });
      authId = user._id;
    } else {
      authId = existingUser._id;
    }

    const cadet = await Cadet.create({
      ...req.body,
      unitId: req.user.unit,
      authId,
      addedBy: req.user._id,
      photoUrl,
      photoThumbUrl
    });

    await AuditLog.create({
      action: 'CADET_CREATED',
      entityType: 'Cadet',
      entityId: cadet._id,
      performedBy: req.user._id,
      details: { name: cadet.name, serviceNumber: cadet.serviceNumber }
    });

    res.status(201).json({ 
      success: true, 
      cadet,
      credentials: {
        email,
        password,
        note: 'Account pending ANO approval. Share credentials with cadet after approving.'
      }
    });
  } catch (err) { next(err); }
};

// PUT /api/cadets/:id
const updateCadet = async (req, res, next) => {
  try {
    const { id } = req.params;
    const oldCadet = await Cadet.findById(id).lean();
    if (!oldCadet) return res.status(404).json({ success: false, message: 'Cadet not found.' });

    let updateData = { ...req.body };

    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'prahar/cadets');
      updateData.photoUrl = result.secure_url;
      updateData.photoThumbUrl = result.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/');
    }

    const cadet = await Cadet.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).lean();

    // Log changes to cadet_edit_log
    for (const key of Object.keys(updateData)) {
      if (String(oldCadet[key]) !== String(updateData[key])) {
        await CadetEditLog.create({
          cadetId: id,
          fieldName: key,
          oldValue: String(oldCadet[key]),
          newValue: String(updateData[key]),
          editedBy: req.user._id,
        });
      }
    }

    res.json({ success: true, cadet });
  } catch (err) { next(err); }
};

// DELETE /api/cadets/:id
const deleteCadet = async (req, res, next) => {
  try {
    const cadet = await Cadet.findByIdAndDelete(req.params.id);
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found.' });

    await AuditLog.create({
      action: 'CADET_DELETED',
      entityType: 'Cadet',
      entityId: req.params.id,
      performedBy: req.user._id,
      details: { name: cadet.name }
    });

    res.json({ success: true, message: 'Cadet deleted.' });
  } catch (err) { next(err); }
};

// POST /api/cadets/batch
const createCadetsBatch = async (req, res, next) => {
  try {
    const { cadets } = req.body;
    if (!Array.isArray(cadets) || cadets.length === 0) {
      return res.status(400).json({ success: false, message: 'No cadet data provided.' });
    }

    const unitId = req.user.unit;
    let created = 0, skipped = 0, failed = 0;
    const credentials = [];

    for (const data of cadets) {
      try {
        const existing = await Cadet.findOne({ unitId, serviceNumber: data.serviceNumber });
        if (existing) { skipped++; continue; }

        const firstName = (data.name || '').split(' ')[0].toLowerCase().replace(/[^a-z]/g, '');
        const last4     = (data.serviceNumber || '').slice(-4);
        const loginId   = `${firstName}@${last4}`;
        const password  = `${firstName}@${last4}`;
        const email     = data.email || `${loginId}@lcit.edu.in`;

        let authId = null;
        const User = require('../models/User');
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          const hashed = await require('bcryptjs').hash(password, 10);
          const user   = await User.create({ 
            name: data.name, 
            email, 
            password: hashed, 
            role: 'cadet', 
            unit: unitId,
            accountStatus: 'PENDING_APPROVAL'
          });
          authId = user._id;
        } else {
          authId = existingUser._id;
        }

        await Cadet.create({
          unitId, authId,
          serviceNumber: data.serviceNumber,
          name:          data.name,
          wing:          data.wing || 'SD',
          rank:          data.rank || 'CADET',
          yearOfStudy:   data.yearOfStudy || 1,
          batchYear:     data.batchYear || '2024-25',
          enrollmentDate: new Date(),
          addedBy: req.user._id,
          status: 'ACTIVE',
        });

        credentials.push({ name: data.name, email, loginId, password, serviceNumber: data.serviceNumber });
        created++;
      } catch { failed++; }
    }

    res.json({ success: true, created, skipped, failed, credentials });
  } catch (err) { next(err); }
};

// GET /api/cadets/public — no auth required, returns showOnPublic cadets
const getPublicCadets = async (req, res, next) => {
  try {
    const cadets = await Cadet.find({ showOnPublic: true, status: 'ACTIVE' })
      .select('name wing rank yearOfStudy photoUrl yearbookMessage isHonorRoll honorRollYear commandantsNote noteIsPublic')
      .lean();
    res.json({ success: true, cadets });
  } catch (err) { next(err); }
};

// GET /api/cadets/my
const getMyProfile = async (req, res, next) => {
  try {
    const cadet = await Cadet.findOne({ authId: req.user._id }).populate('unitId', 'name location');
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet profile not found.' });

    // Calculate attendance percentage
    const AttendanceEntry = require('../models/AttendanceEntry');
    const AttendanceSession = require('../models/AttendanceSession');
    const entries = await AttendanceEntry.find({ cadetId: cadet._id });
    const present = entries.filter(e => e.status === 'P').length;
    const leave = entries.filter(e => e.status === 'L').length;
    const absent = entries.filter(e => e.status === 'A').length;
    const total = present + leave + absent;
    const attendancePercentage = total === 0 ? 100 : Math.round((present / total) * 100);

    const fullCadet = { ...cadet.toObject(), attendancePercentage, totalPresent: present, totalLeave: leave, totalAbsent: absent };
    res.json({ success: true, cadet: fullCadet });
  } catch (err) { next(err); }
};

// PUT /api/cadets/my — Self-update for cadets (safe fields only)
const updateMyProfile = async (req, res, next) => {
  try {
    const cadet = await Cadet.findOne({ authId: req.user._id });
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet profile not found.' });

    // Only allow safe fields — cadets cannot change rank, name, service number, wing, etc.
    const allowedFields = ['contactPhone', 'contactEmail', 'yearbookMessage'];
    const updateData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) updateData[key] = req.body[key];
    }

    // Handle photo upload
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, 'prahar/cadets');
      updateData.photoUrl = result.secure_url;
      updateData.photoThumbUrl = result.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/');
    }

    const updated = await Cadet.findByIdAndUpdate(cadet._id, updateData, { new: true, runValidators: true });
    res.json({ success: true, cadet: updated });
  } catch (err) { next(err); }
};

module.exports = { getCadets, getCadet, createCadet, createCadetsBatch, updateCadet, deleteCadet, getPublicCadets, getMyProfile, updateMyProfile };
