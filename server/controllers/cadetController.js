const Cadet = require('../models/Cadet');
const AuditLog = require('../models/AuditLog');
const cloudinary = require('../config/cloudinary');

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
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'prahar/cadets', transformation: [{ width: 400, crop: 'limit' }] },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      photoUrl = result.secure_url;
      photoThumbUrl = result.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/');
    }

    const cadet = await Cadet.create({
      ...req.body,
      unitId: req.user.unit,
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

    res.status(201).json({ success: true, cadet });
  } catch (err) { next(err); }
};

// PUT /api/cadets/:id
const updateCadet = async (req, res, next) => {
  try {
    let updateData = { ...req.body };

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'prahar/cadets', transformation: [{ width: 400, crop: 'limit' }] },
          (err, result) => err ? reject(err) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      updateData.photoUrl = result.secure_url;
      updateData.photoThumbUrl = result.secure_url.replace('/upload/', '/upload/w_100,h_100,c_fill/');
    }

    const cadet = await Cadet.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!cadet) return res.status(404).json({ success: false, message: 'Cadet not found.' });

    await AuditLog.create({
      action: 'CADET_UPDATED',
      entityType: 'Cadet',
      entityId: cadet._id,
      performedBy: req.user._id
    });

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
    if (!cadets || !Array.isArray(cadets) || cadets.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid cadets data provided.' });
    }

    const cadetsToInsert = cadets.map(c => ({
      ...c,
      unitId: req.user.unit,
      addedBy: req.user._id,
      status: c.status || 'ACTIVE',
      role: 'cadet'
    }));

    const result = await Cadet.insertMany(cadetsToInsert, { ordered: false });

    await AuditLog.create({
      action: 'BATCH_ENROLL',
      entityType: 'Cadet',
      entityId: null,
      performedBy: req.user._id,
      details: { count: result.length }
    });

    res.status(201).json({ success: true, count: result.length, message: `Successfully enrolled ${result.length} cadets.` });
  } catch (err) { 
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Some cadets could not be added due to duplicate emails or service numbers. Try updating them individually.' });
    }
    next(err); 
  }
};

// GET /api/cadets/public — no auth required, returns showOnPublic cadets
const getPublicCadets = async (req, res, next) => {
  try {
    const cadets = await Cadet.find({ showOnPublic: true, status: 'ACTIVE' })
      .select('name rank wing yearOfStudy batchYear photoUrl yearbookMessage isSUOPosition isJUOPosition')
      .sort({ rank: 1, name: 1 });
    res.json({ success: true, cadets });
  } catch (err) { next(err); }
};

module.exports = { getCadets, getCadet, createCadet, createCadetsBatch, updateCadet, deleteCadet, getPublicCadets };
