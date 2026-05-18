const Certificate = require('../models/Certificate');
const AuditLog = require('../models/AuditLog');
const { uploadBuffer } = require('../services/cloudinaryUpload');

// GET /api/certificates
const getCertificates = async (req, res, next) => {
  try {
    const { type, cadetId } = req.query;
    const query = { unitId: req.user.unit };

    if (type) query.type = type;
    if (cadetId) query.cadetId = cadetId;

    const certificates = await Certificate.find(query)
      .populate('cadetId', 'name rank serviceNumber')
      .populate('verifiedBy', 'name')
      .sort({ issueDate: -1 });

    res.json({ success: true, certificates });
  } catch (err) { next(err); }
};

// POST /api/certificates
const createCertificate = async (req, res, next) => {
  try {
    let fileUrl;

    if (req.file) {
      const isPdf = req.file.mimetype === 'application/pdf';
      const result = await uploadBuffer(req.file.buffer, 'prahar/certificates', isPdf ? 'raw' : 'auto');
      fileUrl = result.secure_url;
    }

    const isAno = req.user.role === 'ANO';

    const certificate = await Certificate.create({
      ...req.body,
      unitId: req.user.unit,
      addedBy: req.user._id,
      fileUrl,
      isVerified: isAno,
      verifiedBy: isAno ? req.user._id : undefined
    });

    await AuditLog.create({
      action: 'CERTIFICATE_ADDED',
      entityType: 'Certificate',
      entityId: certificate._id,
      performedBy: req.user._id,
      details: { title: certificate.title }
    });

    res.status(201).json({ success: true, certificate });
  } catch (err) { next(err); }
};

// PUT /api/certificates/:id/verify
const verifyCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { isVerified: true, verifiedBy: req.user._id },
      { new: true }
    );
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' });
    
    res.json({ success: true, certificate });
  } catch (err) { next(err); }
};

// DELETE /api/certificates/:id
const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);
    if (!certificate) return res.status(404).json({ success: false, message: 'Certificate not found.' });

    await AuditLog.create({
      action: 'CERTIFICATE_DELETED',
      entityType: 'Certificate',
      entityId: req.params.id,
      performedBy: req.user._id,
      details: { title: certificate.title }
    });

    res.json({ success: true, message: 'Certificate deleted.' });
  } catch (err) { next(err); }
};

// GET /api/certificates/my
const getMyCertificates = async (req, res, next) => {
  try {
    const Cadet = require('../models/Cadet');
    const cadet = await Cadet.findOne({ authId: req.user._id });
    if (!cadet) return res.json({ success: true, certificates: [] });

    const certificates = await Certificate.find({ cadetId: cadet._id, isVerified: true })
      .sort({ issueDate: -1 });

    res.json({ success: true, certificates });
  } catch (err) { next(err); }
};

module.exports = { getCertificates, createCertificate, verifyCertificate, deleteCertificate, getMyCertificates };
